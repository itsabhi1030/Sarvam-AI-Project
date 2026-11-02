import { OperativeCase, VoiceDictationLog, MongoHealthStatus } from '../types/clinical';

const BASE_URL = '/api';

// Local storage key for runtime user-entered Sarvam API key
const RUNTIME_KEY_STORAGE = 'surgivoice_sarvam_api_key';

export function getStoredApiKey(): string {
  return localStorage.getItem(RUNTIME_KEY_STORAGE) || '';
}

export function setStoredApiKey(key: string): void {
  if (key) {
    localStorage.setItem(RUNTIME_KEY_STORAGE, key);
  } else {
    localStorage.removeItem(RUNTIME_KEY_STORAGE);
  }
}

function getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...customHeaders };
  const key = getStoredApiKey();
  if (key) {
    headers['x-sarvam-api-key'] = key;
  }
  return headers;
}

export async function fetchMongoHealth(): Promise<MongoHealthStatus> {
  const res = await fetch(`${BASE_URL}/health/mongodb`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch MongoDB health');
  return res.json();
}

export async function seedDatabase(): Promise<{ success: boolean; message: string; counts?: any }> {
  const res = await fetch(`${BASE_URL}/seed`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' })
  });
  return res.json();
}

export async function fetchAllCases(): Promise<OperativeCase[]> {
  const res = await fetch(`${BASE_URL}/cases`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch operative cases');
  return res.json();
}

export async function fetchCaseDetails(caseId: string): Promise<{ caseData: OperativeCase; logs: VoiceDictationLog[] }> {
  const res = await fetch(`${BASE_URL}/cases/${caseId}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error(`Failed to fetch case ${caseId}`);
  return res.json();
}

export interface ProcessVoicePayload {
  caseId: string;
  transcript?: string;
  audioBlob?: Blob;
  sttModel?: string;
  sttMode?: string;
  ttsModel?: string;
  speaker?: string;
  pace?: number;
  targetLanguageCode?: string;
}

export async function processVoiceInput(payload: ProcessVoicePayload): Promise<{
  success: boolean;
  updatedCase: OperativeCase;
  newVoiceLog: VoiceDictationLog;
  audioBase64?: string;
  otReadback?: string;
  safetyAlert: boolean;
  latencyMs: number;
}> {
  let body: BodyInit;
  const headers = getHeaders();

  if (payload.audioBlob) {
    const formData = new FormData();
    formData.append('audio', payload.audioBlob, 'surgeon_voice.webm');
    if (payload.sttModel) formData.append('sttModel', payload.sttModel);
    if (payload.sttMode) formData.append('sttMode', payload.sttMode);
    if (payload.ttsModel) formData.append('ttsModel', payload.ttsModel);
    if (payload.speaker) formData.append('speaker', payload.speaker);
    if (payload.pace) formData.append('pace', payload.pace.toString());
    if (payload.targetLanguageCode) formData.append('targetLanguageCode', payload.targetLanguageCode);
    body = formData;
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify({
      transcript: payload.transcript,
      sttModel: payload.sttModel || 'saaras:v4',
      sttMode: payload.sttMode || 'codemix',
      ttsModel: payload.ttsModel || 'bulbul:v3',
      speaker: payload.speaker || 'shubh',
      pace: payload.pace || 1.05,
      targetLanguageCode: payload.targetLanguageCode || 'mr-IN'
    });
  }

  const res = await fetch(`${BASE_URL}/cases/${payload.caseId}/process-voice`, {
    method: 'POST',
    headers,
    body
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Voice processing failed' }));
    throw new Error(err.error || 'Server error during voice processing');
  }

  return res.json();
}

export async function requestFamilyBriefing(
  caseId: string,
  targetLanguageCode: string = 'mr-IN',
  speaker: string = 'ritu',
  model: string = 'bulbul:v3'
): Promise<{
  success: boolean;
  briefing: any;
  audioBase64?: string;
}> {
  const res = await fetch(`${BASE_URL}/cases/${caseId}/family-briefing`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ targetLanguageCode, speaker, model })
  });

  if (!res.ok) throw new Error('Failed to generate family briefing');
  return res.json();
}

export async function updateSurgicalCounts(
  caseId: string,
  counts: any
): Promise<{ success: boolean; who_safety_checklist: any; case_status: string }> {
  const res = await fetch(`${BASE_URL}/cases/${caseId}/counts`, {
    method: 'PATCH',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ counts })
  });
  if (!res.ok) throw new Error('Failed to update counts');
  return res.json();
}

export async function testApiKey(key: string): Promise<{ valid: boolean; message: string }> {
  const res = await fetch(`${BASE_URL}/test-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: key })
  });
  return res.json();
}

// -------------------------------------------------------------
// WEB AUDIO API AUDIO PLAYER WITH REAL-TIME ANALYSER
// -------------------------------------------------------------

class WebAudioService {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private onPlaybackStateChange: ((isPlaying: boolean) => void) | null = null;

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 128;
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setPlaybackListener(callback: (isPlaying: boolean) => void) {
    this.onPlaybackStateChange = callback;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(32);
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  public stopAudio(): void {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    if (this.onPlaybackStateChange) {
      this.onPlaybackStateChange(false);
    }
  }

  public playBase64Audio(base64Wav: string, fallbackText?: string): Promise<void> {
    this.stopAudio();
    this.initContext();

    return new Promise((resolve) => {
      if (base64Wav) {
        const audioSrc = `data:audio/wav;base64,${base64Wav}`;
        const audio = new Audio(audioSrc);
        this.currentAudioElement = audio;

        if (this.audioCtx && this.analyser) {
          try {
            const source = this.audioCtx.createMediaElementSource(audio);
            source.connect(this.analyser);
            this.analyser.connect(this.audioCtx.destination);
          } catch (e) {
            // Already connected or browser security restriction
          }
        }

        if (this.onPlaybackStateChange) this.onPlaybackStateChange(true);

        audio.onended = () => {
          if (this.onPlaybackStateChange) this.onPlaybackStateChange(false);
          this.currentAudioElement = null;
          resolve();
        };

        audio.onerror = () => {
          if (this.onPlaybackStateChange) this.onPlaybackStateChange(false);
          this.currentAudioElement = null;
          // Fallback to speech synthesis if audio playback failed
          if (fallbackText && 'speechSynthesis' in window) {
            this.speakWithBrowserSynth(fallbackText).then(resolve);
          } else {
            resolve();
          }
        };

        audio.play().catch(() => {
          if (fallbackText && 'speechSynthesis' in window) {
            this.speakWithBrowserSynth(fallbackText).then(resolve);
          } else {
            if (this.onPlaybackStateChange) this.onPlaybackStateChange(false);
            resolve();
          }
        });
      } else if (fallbackText && 'speechSynthesis' in window) {
        this.speakWithBrowserSynth(fallbackText).then(resolve);
      } else {
        resolve();
      }
    });
  }

  private speakWithBrowserSynth(text: string): Promise<void> {
    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      if (this.onPlaybackStateChange) this.onPlaybackStateChange(true);

      utterance.onend = () => {
        if (this.onPlaybackStateChange) this.onPlaybackStateChange(false);
        resolve();
      };
      utterance.onerror = () => {
        if (this.onPlaybackStateChange) this.onPlaybackStateChange(false);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }
}

export const audioPlayer = new WebAudioService();

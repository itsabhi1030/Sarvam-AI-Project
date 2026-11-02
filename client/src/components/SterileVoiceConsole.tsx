import React, { useRef, useEffect, useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Send, 
  Play, 
  Volume2, 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  Languages, 
  Cpu, 
  Flame
} from 'lucide-react';
import { VoiceDictationLog } from '../types/clinical';
import { DEMO_SCENARIOS, DemoScenario } from '../constants/demoScenarios';
import { micRecorder } from '../services/audioRecorder';
import { audioPlayer } from '../services/api';

interface SterileVoiceConsoleProps {
  logs: VoiceDictationLog[];
  isProcessing: boolean;
  onSendTranscript: (transcript: string, scenarioKey?: string) => Promise<void>;
  onSendAudioBlob: (blob: Blob) => Promise<void>;
  sttModel: string;
  sttMode: string;
}

export const SterileVoiceConsole: React.FC<SterileVoiceConsoleProps> = ({
  logs,
  isProcessing,
  onSendTranscript,
  onSendAudioBlob,
  sttModel,
  sttMode
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [customText, setCustomText] = useState('');
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // 60FPS Dynamic Audio Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Fetch frequency data from active mic OR active speaker playback
      let freqData = micRecorder.getMicFrequencyData();
      const speakerFreq = audioPlayer.getFrequencyData();
      
      // If audio player is active, blend in playback data
      let maxSpeakerVal = 0;
      for (let i = 0; i < speakerFreq.length; i++) {
        if (speakerFreq[i] > maxSpeakerVal) maxSpeakerVal = speakerFreq[i];
      }
      if (maxSpeakerVal > 10) {
        freqData = speakerFreq;
      }

      const barCount = 36;
      const barWidth = (width / barCount) - 2;

      for (let i = 0; i < barCount; i++) {
        const valIndex = Math.floor((i / barCount) * freqData.length);
        const rawVal = freqData[valIndex] || 0;
        
        // Add subtle idle wave motion when not speaking
        const idleWave = Math.sin(Date.now() / 300 + i * 0.4) * 8 + 10;
        const barHeight = isRecording || maxSpeakerVal > 10 
          ? Math.max(6, (rawVal / 255) * height * 0.9)
          : idleWave;

        const x = i * (barWidth + 2);
        const y = height / 2 - barHeight / 2;

        // Gradient styling
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isRecording) {
          grad.addColorStop(0, '#00F0FF');
          grad.addColorStop(1, '#0284C7');
        } else if (maxSpeakerVal > 10) {
          grad.addColorStop(0, '#A855F7');
          grad.addColorStop(1, '#6366F1');
        } else {
          grad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
          grad.addColorStop(1, 'rgba(30, 41, 59, 0.2)');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, Math.max(3, barHeight), 2);
        ctx.fill();
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isRecording]);

  // Spacebar Push-to-Talk / Toggle Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body && !isProcessing) {
        e.preventDefault();
        if (!isRecording) {
          handleStartRecording();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body && !isProcessing) {
        e.preventDefault();
        if (isRecording) {
          handleStopRecording();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRecording, isProcessing]);

  const handleStartRecording = async () => {
    try {
      audioPlayer.stopAudio();
      await micRecorder.startRecording();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Failed to start recording:', err.message);
    }
  };

  const handleStopRecording = async () => {
    if (!isRecording) return;
    setIsRecording(false);
    try {
      const blob = await micRecorder.stopRecording();
      if (blob && blob.size > 1000) {
        await onSendAudioBlob(blob);
      }
    } catch (err: any) {
      console.error('Failed to stop recording:', err.message);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const handleInjectScenario = async (scenario: DemoScenario) => {
    setActiveScenarioId(scenario.id);
    await onSendTranscript(scenario.spokenDictation, scenario.id);
    setActiveScenarioId(null);
  };

  const handleSendCustomText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim() || isProcessing) return;
    const txt = customText.trim();
    setCustomText('');
    await onSendTranscript(txt);
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* 1. Hands-Free Voice Orb & Waveform Console */}
      <div className="glass-panel rounded-xl p-4 flex flex-col gap-3 border border-cyan-500/20 shadow-lg relative overflow-hidden">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-semibold text-white">STERILE AUDIO CONSOLE</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-300 mono-telemetry">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>STT: {sttModel}</span>
            <span className="text-slate-600">|</span>
            <span className="text-indigo-300">{sttMode}</span>
          </div>
        </div>

        {/* 60FPS Canvas Waveform */}
        <div className="w-full h-14 bg-[#070C16] rounded-lg border border-slate-800/80 p-1 flex items-center justify-center relative overflow-hidden">
          <canvas
            ref={canvasRef}
            width={340}
            height={52}
            className="w-full h-full"
          />
          {isRecording && (
            <div className="absolute top-1.5 right-2 flex items-center gap-1 text-[10px] text-rose-400 font-bold bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/40">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              LIVE MIC
            </div>
          )}
        </div>

        {/* Big Tactile Sterile Mic Button */}
        <button
          onClick={toggleRecording}
          disabled={isProcessing}
          className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 font-bold text-sm tracking-wide transition-all shadow-md active:scale-98 ${
            isRecording
              ? 'bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.5)] border border-rose-400 animate-pulse'
              : isProcessing
                ? 'bg-slate-800 text-slate-400 cursor-wait border border-slate-700'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(0,240,255,0.3)] border border-cyan-400/50'
          }`}
        >
          {isRecording ? (
            <>
              <MicOff className="w-5 h-5 text-white animate-bounce" />
              <span>TAP TO STOP OR RELEASE SPACEBAR</span>
            </>
          ) : isProcessing ? (
            <>
              <Sparkles className="w-5 h-5 text-cyan-300 animate-spin" />
              <span>PARSING WITH SARVAM AI...</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 text-cyan-200" />
              <span>HOLD SPACEBAR OR CLICK TO DICTATE</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-center text-slate-400 tracking-tight">
          Hands-Free Voice Loop • Speaks Hindi, Marathi & Code-Mixed English
        </p>
      </div>

      {/* 2. One-Click Stage Demo Dictation Injectors */}
      <div className="glass-panel rounded-xl p-3.5 flex flex-col gap-2.5 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 tracking-wide">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>ONE-CLICK STAGE DEMO INJECTORS</span>
          </div>
          <span className="text-[10px] text-slate-500">Hackathon Ready</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {DEMO_SCENARIOS.map((scenario) => {
            const isRunning = isProcessing && activeScenarioId === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => handleInjectScenario(scenario)}
                disabled={isProcessing}
                className={`text-left p-2.5 rounded-lg border transition-all flex flex-col gap-1 group relative overflow-hidden ${
                  scenario.isAlert
                    ? 'bg-rose-950/20 hover:bg-rose-950/40 border-rose-500/40 hover:border-rose-400'
                    : 'bg-[#09101D] hover:bg-[#0E172A] border-slate-800 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${scenario.badgeColor}`}>
                    {scenario.badge}
                  </span>
                  <span className="text-[10px] text-slate-400 group-hover:text-cyan-300 transition-colors flex items-center gap-1">
                    <Play className="w-2.5 h-2.5" />
                    Inject
                  </span>
                </div>
                <div className="text-xs font-semibold text-white group-hover:text-cyan-200">
                  {scenario.title}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 leading-relaxed">
                  {scenario.description}
                </p>

                {isRunning && (
                  <div className="absolute inset-0 bg-cyan-950/70 backdrop-blur-[2px] flex items-center justify-center gap-2 text-cyan-300 text-xs font-semibold">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Processing Live Scenario...</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Chronological Diarized Voice Logs Feed */}
      <div className="glass-panel rounded-xl p-3 flex-1 flex flex-col min-h-[220px] max-h-[320px] border border-slate-800 overflow-hidden shadow-inner">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Languages className="w-3.5 h-3.5 text-indigo-400" />
            <span>DIARIZED VOICE LOGS ({logs.length})</span>
          </div>
          <span className="text-[10px] text-slate-500">Immutable Audit Trail</span>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No dictations logged yet. Hold Spacebar or click an Injector above.
            </div>
          ) : (
            logs.map((log, index) => (
              <div 
                key={log._id || index}
                className={`p-2.5 rounded-lg border text-xs flex flex-col gap-1.5 ${
                  log.safety_flag_raised 
                    ? 'bg-rose-950/20 border-rose-500/40 text-rose-200' 
                    : 'bg-[#09111F] border-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-cyan-400 mono-telemetry">#{log.sequence_number}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {log.detected_language}
                    </span>
                  </div>
                  <span className="mono-telemetry text-slate-500">
                    {log.processing_latency_ms ? `${log.processing_latency_ms}ms` : '380ms'}
                  </span>
                </div>

                <div className="text-[12px] text-slate-100 font-medium italic">
                  "{log.raw_transcript}"
                </div>

                {log.ot_readback_sentence && (
                  <div className="flex items-start gap-1.5 text-[11px] bg-black/40 p-1.5 rounded border border-slate-800 text-cyan-300">
                    <Volume2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-cyan-400" />
                    <span>Readback: {log.ot_readback_sentence}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Quick Dictation Text Form */}
        <form onSubmit={handleSendCustomText} className="pt-2 mt-2 border-t border-slate-800/80 flex items-center gap-1.5">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Type code-mixed clinical text or test dictation..."
            disabled={isProcessing}
            className="flex-1 bg-black/50 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
          />
          <button
            type="submit"
            disabled={!customText.trim() || isProcessing}
            className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 transition-colors"
            title="Send dictation text"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

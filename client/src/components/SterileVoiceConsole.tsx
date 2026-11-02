import React, { useRef, useEffect, useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Send, 
  Cpu, 
  Volume2
} from 'lucide-react';
import { VoiceDictationLog } from '../types/clinical';
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // 60FPS Audio Waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      let freqData = micRecorder.getMicFrequencyData();
      const speakerFreq = audioPlayer.getFrequencyData();
      
      let maxSpeakerVal = 0;
      for (let i = 0; i < speakerFreq.length; i++) {
        if (speakerFreq[i] > maxSpeakerVal) maxSpeakerVal = speakerFreq[i];
      }
      if (maxSpeakerVal > 10) {
        freqData = speakerFreq;
      }

      const barCount = 28;
      const barWidth = (width / barCount) - 3;

      for (let i = 0; i < barCount; i++) {
        const valIndex = Math.floor((i / barCount) * freqData.length);
        const rawVal = freqData[valIndex] || 0;
        
        const idleWave = Math.sin(Date.now() / 400 + i * 0.3) * 4 + 6;
        const barHeight = isRecording || maxSpeakerVal > 10 
          ? Math.max(4, (rawVal / 255) * height * 0.85)
          : idleWave;

        const x = i * (barWidth + 3);
        const y = height / 2 - barHeight / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isRecording) {
          grad.addColorStop(0, '#00F0FF');
          grad.addColorStop(1, '#0284C7');
        } else if (maxSpeakerVal > 10) {
          grad.addColorStop(0, '#A855F7');
          grad.addColorStop(1, '#6366F1');
        } else {
          grad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
          grad.addColorStop(1, 'rgba(30, 41, 59, 0.15)');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, Math.max(2, barHeight), 2);
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

  // Spacebar Push-to-Talk
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

  const handleSendCustomText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim() || isProcessing) return;
    const txt = customText.trim();
    setCustomText('');
    await onSendTranscript(txt);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Voice Control Card */}
      <div className="p-4 rounded-2xl bg-[#090F1E] border border-slate-800/80 shadow-md flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Sterile Voice Console</span>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>{sttModel} • {sttMode}</span>
          </div>
        </div>

        {/* Minimalist Waveform Display */}
        <div className="w-full h-11 bg-black/40 rounded-xl border border-slate-800/60 px-3 flex items-center justify-center relative overflow-hidden">
          <canvas
            ref={canvasRef}
            width={320}
            height={44}
            className="w-full h-full"
          />
        </div>

        {/* Tactile Mic Button */}
        <button
          onClick={toggleRecording}
          disabled={isProcessing}
          className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 font-bold text-xs tracking-wide transition-all ${
            isRecording
              ? 'bg-rose-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse'
              : isProcessing
                ? 'bg-slate-800 text-slate-400 cursor-wait'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
          }`}
        >
          {isRecording ? (
            <>
              <MicOff className="w-4 h-4 text-white" />
              <span>Tap to Stop Dictating (or Release Spacebar)</span>
            </>
          ) : isProcessing ? (
            <>
              <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
              <span>Analyzing with Sarvam AI...</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-cyan-200" />
              <span>Hold Spacebar or Click to Dictate</span>
            </>
          )}
        </button>

        {/* Text Input Row */}
        <form onSubmit={handleSendCustomText} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Or type clinical notes in Hinglish / Marathi..."
            disabled={isProcessing}
            className="flex-1 bg-black/40 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600"
          />
          <button
            type="submit"
            disabled={!customText.trim() || isProcessing}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Recent Activity Log (Streamlined) */}
      <div className="p-3.5 rounded-2xl bg-[#090F1E] border border-slate-800/80 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
          <span>Recent Dictations</span>
          <span className="text-[10px] text-slate-500">{logs.length} logged</span>
        </div>

        <div className="max-h-40 overflow-y-auto flex flex-col gap-2 pr-1">
          {logs.length === 0 ? (
            <p className="text-xs text-slate-600 italic py-2">No voice logs recorded yet.</p>
          ) : (
            logs.slice(-3).reverse().map((log, idx) => (
              <div 
                key={log._id || idx}
                className={`p-2.5 rounded-xl border text-xs flex flex-col gap-1 ${
                  log.safety_flag_raised 
                    ? 'bg-rose-950/20 border-rose-500/40 text-rose-200' 
                    : 'bg-black/30 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-mono text-cyan-400 font-bold">#{log.sequence_number}</span>
                  <span>{log.detected_language}</span>
                </div>
                <p className="text-slate-200 font-medium italic text-[11px]">"{log.raw_transcript}"</p>
                {log.ot_readback_sentence && (
                  <div className="flex items-center gap-1 text-[10px] text-cyan-300">
                    <Volume2 className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                    <span className="truncate">{log.ot_readback_sentence}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

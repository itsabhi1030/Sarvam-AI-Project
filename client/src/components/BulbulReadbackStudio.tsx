import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Languages, 
  Sparkles, 
  Radio, 
  Sliders, 
  Database, 
  ExternalLink,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { OperativeCase, VernacularFamilyBriefing } from '../types/clinical';
import { audioPlayer, requestFamilyBriefing } from '../services/api';

interface BulbulReadbackStudioProps {
  currentCase: OperativeCase | null;
  latestReadbackSentence: string;
  latestAudioBase64?: string;
  speaker: string;
  onSpeakerChange: (spk: string) => void;
  pace: number;
  onPaceChange: (pace: number) => void;
  autoPlay: boolean;
  onToggleAutoPlay: () => void;
  onOpenCompassModal: () => void;
}

const INDIC_LANGUAGES = [
  { code: 'mr-IN', label: 'Marathi', script: 'मराठी' },
  { code: 'hi-IN', label: 'Hindi', script: 'हिन्दी' },
  { code: 'ta-IN', label: 'Tamil', script: 'தமிழ்' },
  { code: 'te-IN', label: 'Telugu', script: 'తెలుగు' },
  { code: 'kn-IN', label: 'Kannada', script: 'ಕನ್ನಡ' },
  { code: 'gu-IN', label: 'Gujarati', script: 'ગુજરાતી' }
];

export const BulbulReadbackStudio: React.FC<BulbulReadbackStudioProps> = ({
  currentCase,
  latestReadbackSentence,
  latestAudioBase64,
  speaker,
  onSpeakerChange,
  pace,
  onPaceChange,
  autoPlay,
  onToggleAutoPlay,
  onOpenCompassModal
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLang, setSelectedLang] = useState('mr-IN');
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  const [activeBriefing, setActiveBriefing] = useState<VernacularFamilyBriefing | null>(null);

  // Sync active briefing when case changes
  useEffect(() => {
    if (currentCase?.vernacular_family_briefings?.length) {
      const match = currentCase.vernacular_family_briefings.find(b => b.language_code === selectedLang);
      if (match) {
        setActiveBriefing(match);
      } else {
        setActiveBriefing(currentCase.vernacular_family_briefings[0]);
      }
    }
  }, [currentCase, selectedLang]);

  // Audio Playback Listener
  useEffect(() => {
    audioPlayer.setPlaybackListener((playing) => {
      setIsPlaying(playing);
    });
  }, []);

  // Auto-play readback when new audio arrives if enabled
  useEffect(() => {
    if (autoPlay && latestAudioBase64) {
      audioPlayer.playBase64Audio(latestAudioBase64, latestReadbackSentence);
    }
  }, [latestAudioBase64, autoPlay]);

  const handlePlayReadback = () => {
    if (isPlaying) {
      audioPlayer.stopAudio();
    } else if (latestAudioBase64) {
      audioPlayer.playBase64Audio(latestAudioBase64, latestReadbackSentence);
    } else if (latestReadbackSentence) {
      audioPlayer.playBase64Audio('', latestReadbackSentence);
    }
  };

  const handleGenerateFamilyBriefing = async () => {
    if (!currentCase || isGeneratingBriefing) return;
    setIsGeneratingBriefing(true);
    try {
      const result = await requestFamilyBriefing(currentCase.case_id, selectedLang, 'ritu');
      if (result.success && result.briefing) {
        setActiveBriefing(result.briefing);
        if (result.audioBase64) {
          audioPlayer.playBase64Audio(result.audioBase64, result.briefing.native_script_text);
        }
      }
    } catch (e) {
      console.error('Family briefing error:', e);
    } finally {
      setIsGeneratingBriefing(false);
    }
  };

  const handlePlayFamilyAudio = () => {
    if (isPlaying) {
      audioPlayer.stopAudio();
    } else if (activeBriefing) {
      if (activeBriefing.audio_base64) {
        audioPlayer.playBase64Audio(activeBriefing.audio_base64, activeBriefing.native_script_text);
      } else {
        audioPlayer.playBase64Audio('', activeBriefing.native_script_text);
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* 1. OT Bluetooth Speaker Readback Monitor */}
      <div className="glass-panel rounded-xl p-3.5 flex flex-col gap-2.5 border border-cyan-500/20 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white tracking-wide">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>OT BLUETOOTH READBACK MONITOR</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleAutoPlay}
              className={`text-[10px] px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 font-semibold ${
                autoPlay 
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40' 
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
              title="Toggle automatic verbal verification inside OT"
            >
              <Radio className="w-2.5 h-2.5" />
              <span>Auto-Play: {autoPlay ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Readback Text Box */}
        <div className="p-2.5 rounded-lg bg-[#09111F] border border-slate-800 text-xs flex flex-col gap-1.5">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Closed-Loop Spoken Verification (Bulbul v3 / v4-flash)
          </span>
          <p className="text-slate-100 font-medium italic text-[12px] leading-relaxed">
            "{latestReadbackSentence || 'Awaiting operative voice command...'}"
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-400 mono-telemetry">
              Target: OT Ceiling Speaker
            </span>
            <button
              onClick={handlePlayReadback}
              disabled={!latestReadbackSentence}
              className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                isPlaying 
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse' 
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_10px_rgba(0,240,255,0.3)]'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-3 h-3 fill-current" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>Replay Voice</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Voice Persona & Pace Controls */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 font-semibold">Bulbul Voice Persona:</label>
            <select
              value={speaker}
              onChange={(e) => onSpeakerChange(e.target.value)}
              className="bg-[#09111F] border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="shubh">shubh (Male, Calm & Clinical)</option>
              <option value="ritu">ritu (Female, Empathetic)</option>
              <option value="aditya">aditya (Male, Deep OT Tone)</option>
              <option value="priya">priya (Female, Clear Surgical)</option>
              <option value="simran">simran (Female, Gentle)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
              <span>Pace:</span>
              <span className="text-cyan-400 mono-telemetry font-bold">{pace.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.05"
              value={pace}
              onChange={(e) => onPaceChange(parseFloat(e.target.value))}
              className="accent-cyan-400 h-2 bg-slate-800 rounded cursor-pointer mt-1"
            />
          </div>
        </div>
      </div>

      {/* 2. Vernacular Patient Family Post-Op Briefing Studio */}
      <div className="glass-panel rounded-xl p-3.5 flex-1 flex flex-col gap-2.5 border border-purple-500/20 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white tracking-wide">
            <HeartHandshake className="w-4 h-4 text-purple-400" />
            <span>VERNACULAR PATIENT FAMILY BRIEFING</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
            Native Script TTS
          </span>
        </div>

        {/* Indic Language Selector Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {INDIC_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLang(lang.code)}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1 ${
                selectedLang === lang.code
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-[#09111F] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{lang.label}</span>
              <span className="text-[10px] opacity-75 font-normal">({lang.script})</span>
            </button>
          ))}
        </div>

        {/* Briefing Display Card */}
        <div className="flex-1 p-3 rounded-lg bg-[#09111F] border border-slate-800 flex flex-col justify-between gap-2 overflow-hidden">
          {activeBriefing ? (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[160px] pr-1">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
                  {activeBriefing.language_label} Native Script Output (Sarvam-105B):
                </span>
                <p className="text-slate-100 text-[13px] leading-relaxed font-['Plus_Jakarta_Sans'] font-medium">
                  {activeBriefing.native_script_text}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">
                  English Clinical Cross-Verification:
                </span>
                <p className="text-slate-400 text-xs italic">
                  "{activeBriefing.english_back_translation}"
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-500 italic">
              Click below to translate operative note into native vernacular speech for family waiting outside.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
            <button
              onClick={handleGenerateFamilyBriefing}
              disabled={isGeneratingBriefing}
              className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 transition-all"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingBriefing ? 'animate-spin' : ''}`} />
              <span>{isGeneratingBriefing ? 'Synthesizing Native Script...' : 'Generate & Speak Briefing'}</span>
            </button>

            {activeBriefing && (
              <button
                onClick={handlePlayFamilyAudio}
                className="p-2 rounded-lg bg-[#141C33] hover:bg-slate-700 text-cyan-300 border border-slate-700"
                title="Play native vernacular audio"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. MongoDB Compass Live Document Inspector Quick Card */}
      <div 
        onClick={onOpenCompassModal}
        className="cursor-pointer glass-panel rounded-xl p-3 border border-emerald-500/25 hover:border-emerald-400 transition-all flex items-center justify-between group shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white group-hover:text-emerald-300">
              MongoDB Compass Document Inspector
            </span>
            <span className="text-[11px] text-slate-400 mono-telemetry">
              mongodb://127.0.0.1:27017/surgivoice_indic
            </span>
          </div>
        </div>

        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
      </div>
    </div>
  );
};

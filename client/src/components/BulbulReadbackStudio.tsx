import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  Play, 
  Square, 
  Sparkles, 
  HeartHandshake
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
  autoPlay,
  onToggleAutoPlay,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLang, setSelectedLang] = useState('mr-IN');
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  const [activeBriefing, setActiveBriefing] = useState<VernacularFamilyBriefing | null>(null);

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

  useEffect(() => {
    audioPlayer.setPlaybackListener((playing) => {
      setIsPlaying(playing);
    });
  }, []);

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
    <div className="flex flex-col gap-3">
      {/* 1. OT Verbal Verification */}
      <div className="p-4 rounded-2xl bg-[#090F1E] border border-slate-800/80 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-200">OT Spoken Verification</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleAutoPlay}
              className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                autoPlay 
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30' 
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              Auto: {autoPlay ? 'ON' : 'OFF'}
            </button>
            <select
              value={speaker}
              onChange={(e) => onSpeakerChange(e.target.value)}
              className="bg-black/40 border border-slate-800 rounded px-2 py-0.5 text-[11px] text-slate-300 focus:outline-none"
            >
              <option value="shubh">Voice: shubh</option>
              <option value="ritu">Voice: ritu</option>
              <option value="aditya">Voice: aditya</option>
              <option value="priya">Voice: priya</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-slate-300 italic leading-relaxed bg-black/30 p-3 rounded-xl border border-slate-800/60">
          "{latestReadbackSentence || 'Awaiting operative voice command...'}"
        </p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-500 font-mono">Bulbul v3 • en-IN</span>
          <button
            onClick={handlePlayReadback}
            disabled={!latestReadbackSentence}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isPlaying 
                ? 'bg-rose-600 text-white animate-pulse' 
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Replay Readback</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Vernacular Patient Family Briefing */}
      <div className="p-4 rounded-2xl bg-[#090F1E] border border-slate-800/80 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-slate-200">Patient Family Briefing</span>
          </div>
          <span className="text-[10px] text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-500/20 font-medium">
            Native Indic Script
          </span>
        </div>

        {/* Minimal Language Pills */}
        <div className="flex flex-wrap gap-1.5">
          {INDIC_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLang(lang.code)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedLang === lang.code
                  ? 'bg-purple-600 text-white'
                  : 'bg-black/30 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Native Text Display */}
        {activeBriefing ? (
          <div className="p-3 rounded-xl bg-black/40 border border-slate-800 flex flex-col gap-2">
            <p className="text-slate-100 text-xs leading-relaxed font-medium">
              {activeBriefing.native_script_text}
            </p>
            <p className="text-slate-500 text-[11px] italic pt-1 border-t border-slate-800/60">
              "{activeBriefing.english_back_translation}"
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic py-3 text-center">
            Click below to generate family update in native script.
          </p>
        )}

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateFamilyBriefing}
            disabled={isGeneratingBriefing}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGeneratingBriefing ? 'animate-spin' : ''}`} />
            <span>{isGeneratingBriefing ? 'Translating...' : 'Generate & Speak Briefing'}</span>
          </button>

          {activeBriefing && (
            <button
              onClick={handlePlayFamilyAudio}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
              title="Play briefing audio"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

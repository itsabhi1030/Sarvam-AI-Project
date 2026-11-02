import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Key, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Cpu, 
  Radio, 
  Volume2
} from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, testApiKey } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sttModel: string;
  onSttModelChange: (m: string) => void;
  sttMode: string;
  onSttModeChange: (m: string) => void;
  ttsModel: string;
  onTtsModelChange: (m: string) => void;
  isSimulatedMode: boolean;
  onToggleSimulatedMode: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  sttModel,
  onSttModelChange,
  sttMode,
  onSttModeChange,
  ttsModel,
  onTtsModelChange,
  isSimulatedMode,
  onToggleSimulatedMode
}) => {
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    setStoredApiKey(apiKey.trim());
    setTestResult({ valid: true, message: 'API key saved to local session!' });
  };

  const handleTestKey = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testApiKey(apiKey.trim());
      setTestResult(res);
      if (res.valid) {
        setStoredApiKey(apiKey.trim());
      }
    } catch (e: any) {
      setTestResult({ valid: false, message: e.message || 'Key validation failed.' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#090F1C] border border-cyan-500/30 rounded-2xl w-full max-w-xl flex flex-col shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-[#0B1324]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Settings className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                SARVAM AI STACK & OT COCKPIT SETTINGS
              </h2>
              <p className="text-[11px] text-slate-400">
                Model configurations for Sarvam Campus '26
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 flex flex-col gap-4 text-xs text-slate-300">
          {/* API Key */}
          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#070D18] border border-slate-800">
            <label className="font-bold text-white flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sarvam Subscription API Key</span>
            </label>
            <p className="text-[11px] text-slate-400">
              Read automatically from server <code className="text-cyan-300">.env</code>. You can also paste an override here:
            </p>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste key (e.g. 521bb...)"
                className="flex-1 bg-black/60 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
              <button
                onClick={handleTestKey}
                disabled={isTesting}
                className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all disabled:opacity-50"
              >
                {isTesting ? 'Testing...' : 'Test Key'}
              </button>
            </div>

            {testResult && (
              <div className={`mt-2 p-2 rounded text-[11px] flex items-center gap-1.5 ${
                testResult.valid 
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
              }`}>
                {testResult.valid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Model Selections */}
          <div className="grid grid-cols-2 gap-3">
            {/* STT Model */}
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#070D18] border border-slate-800">
              <label className="font-bold text-slate-200 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Speech-to-Text Model:</span>
              </label>
              <select
                value={sttModel}
                onChange={(e) => onSttModelChange(e.target.value)}
                className="bg-black/60 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400 mt-1"
              >
                <option value="saaras:v4">saaras:v4 (Latest Indian Model)</option>
                <option value="saaras:v3">saaras:v3 (Production Stable)</option>
              </select>
            </div>

            {/* STT Mode */}
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#070D18] border border-slate-800">
              <label className="font-bold text-slate-200 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-indigo-400" />
                <span>STT Processing Mode:</span>
              </label>
              <select
                value={sttMode}
                onChange={(e) => onSttModeChange(e.target.value)}
                className="bg-black/60 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400 mt-1"
              >
                <option value="codemix">codemix (Hinglish/Marathi-Eng Recommended)</option>
                <option value="transcribe">transcribe (Monolingual standard)</option>
              </select>
            </div>

            {/* TTS Model */}
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#070D18] border border-slate-800">
              <label className="font-bold text-slate-200 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Text-to-Speech Model:</span>
              </label>
              <select
                value={ttsModel}
                onChange={(e) => onTtsModelChange(e.target.value)}
                className="bg-black/60 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400 mt-1"
              >
                <option value="bulbul:v3">bulbul:v3 (Stable 30+ Voices)</option>
                <option value="bulbul:v4-flash">bulbul:v4-flash (Fastest Indian Voice)</option>
              </select>
            </div>

            {/* Stage Fallback Simulation Toggle */}
            <div className="flex flex-col justify-between p-3 rounded-xl bg-[#070D18] border border-slate-800">
              <div>
                <label className="font-bold text-slate-200 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Stage Fallback Sim:</span>
                </label>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Deterministic instant output if venue Wi-Fi drops.
                </p>
              </div>
              <button
                onClick={onToggleSimulatedMode}
                className={`w-full py-1.5 px-3 rounded text-xs font-bold transition-all mt-1 ${
                  isSimulatedMode 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {isSimulatedMode ? 'SIMULATION MODE (ACTIVE)' : 'LIVE SARVAM API (ACTIVE)'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-end bg-[#0B1324]">
          <button
            onClick={() => {
              handleSaveKey();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

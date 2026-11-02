import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  Copy, 
  Check, 
  Settings, 
  Clock, 
  Mic, 
  Radio, 
  Sparkles, 
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { OperativeCase, MongoHealthStatus } from '../types/clinical';
import { seedDatabase } from '../services/api';

interface TopTelemetryBarProps {
  currentCase: OperativeCase | null;
  mongoHealth: MongoHealthStatus | null;
  isRecording: boolean;
  onRefreshMongo: () => void;
  onOpenCompassModal: () => void;
  onOpenPastSurgeries: () => void;
  onOpenSettings: () => void;
  isSimulatedMode: boolean;
  onToggleSimulatedMode: () => void;
}

export const TopTelemetryBar: React.FC<TopTelemetryBarProps> = ({
  currentCase,
  mongoHealth,
  isRecording,
  onRefreshMongo,
  onOpenCompassModal,
  onOpenPastSurgeries,
  onOpenSettings,
  isSimulatedMode,
  onToggleSimulatedMode
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(2538); // Starts at ~42m
  const [copiedUri, setCopiedUri] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Live OT Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyCompass = () => {
    navigator.clipboard.writeText('mongodb://127.0.0.1:27017/surgivoice_indic');
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2000);
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedDatabase();
      onRefreshMongo();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  const isHold = currentCase?.case_status === 'SAFETY_HOLD';

  return (
    <header className="w-full bg-[#090E1A]/95 backdrop-blur-md border-b border-cyan-500/20 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-xl">
      {/* LEFT: Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
          <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-wider text-white flex items-center gap-1.5 font-['Plus_Jakarta_Sans']">
              SURGIVOICE <span className="text-cyan-400 font-extrabold">INDIC</span>
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
              NABH & WHO-SSC
            </span>
          </div>
          <p className="text-[11px] text-slate-400 tracking-tight flex items-center gap-1">
            <span>Sterile Hands-Free OT Operative Logger</span>
            <span className="text-slate-600">•</span>
            <span className="text-indigo-400 font-medium">Sarvam AI Stack</span>
          </p>
        </div>
      </div>

      {/* CENTER-LEFT: Active OT Room & Patient Context Pill */}
      {currentCase && (
        <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-[#0D1527] border border-slate-700/60 text-xs">
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>{currentCase.ot_room.split('(')[0].trim()}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-slate-200 font-medium">
            <span className="text-slate-400">Pt:</span> {currentCase.patient_info.name}, {currentCase.patient_info.age}{currentCase.patient_info.gender[0]}
          </div>
          <span className="text-slate-600">|</span>
          <div className="mono-telemetry text-slate-300">
            {currentCase.patient_info.uhid}
          </div>
          <span className="text-slate-600">|</span>
          <div className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 font-bold text-[11px] border border-rose-500/20">
            {currentCase.patient_info.blood_group}
          </div>
          <button 
            onClick={onOpenPastSurgeries}
            className="ml-1 text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-semibold"
            title="Browse past surgical cases in MongoDB"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Cases</span>
          </button>
        </div>
      )}

      {/* CENTER-RIGHT: Live Surgical Timer + Hands-Free Voice Loop */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-slate-800 text-xs">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="mono-telemetry text-amber-300 font-bold tracking-wider text-sm">
            {formatTimer(elapsedSeconds)}
          </span>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">ELAPSED</span>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wide transition-all ${
          isHold 
            ? 'bg-rose-500/20 text-rose-300 border-rose-500 animate-pulse'
            : isRecording 
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)]' 
              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isHold ? 'bg-rose-400 animate-ping' : isRecording ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'
          }`} />
          <Mic className="w-3.5 h-3.5" />
          <span>
            {isHold ? 'LOCKOUT HOLD' : isRecording ? 'STERILE LISTENING' : 'VOICE LOOP READY'}
          </span>
        </div>
      </div>

      {/* RIGHT: MongoDB Compass Telemetry & Settings */}
      <div className="flex items-center gap-2">
        {/* MongoDB Compass Connection Pill */}
        <div 
          onClick={onOpenCompassModal}
          className="cursor-pointer group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B1220] hover:bg-[#101b30] border border-emerald-500/30 hover:border-emerald-400 transition-all text-xs"
          title="Click to inspect raw MongoDB Compass collections"
        >
          <Database className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-emerald-400">Compass</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono">
                :27017
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mono-telemetry">
              Docs: <strong className="text-white">{mongoHealth?.totalDocuments ?? 12}</strong>
            </span>
          </div>
        </div>

        {/* Quick Copy URI Button */}
        <button
          onClick={handleCopyCompass}
          className="p-2 rounded-lg bg-[#0B1220] hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-700/50 transition-colors"
          title="Copy MongoDB Compass URI (mongodb://127.0.0.1:27017/surgivoice_indic)"
        >
          {copiedUri ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>

        {/* Quick Seed Button */}
        <button
          onClick={handleSeed}
          disabled={isSeeding}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all"
          title="Seed demo cases into MongoDB Compass"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
          <span>Seed DB</span>
        </button>

        {/* Mode Switcher Toggle */}
        <button
          onClick={onToggleSimulatedMode}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            isSimulatedMode 
              ? 'bg-amber-950/40 text-amber-300 border-amber-500/40' 
              : 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40'
          }`}
          title="Toggle between Live Sarvam API and Stage Fallback Simulation"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isSimulatedMode ? 'Stage Sim' : 'Live API'}</span>
        </button>

        {/* Settings Modal Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-[#0B1220] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 transition-colors"
          title="API Configuration & Audio Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

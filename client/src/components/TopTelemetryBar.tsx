import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  Copy, 
  Check, 
  Clock, 
  FolderOpen,
  Settings,
  HelpCircle
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
  onOpenWalkthrough: () => void;
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
  onOpenWalkthrough,
}) => {
  // Dynamically calculate elapsed seconds from the case's actual creation/start timestamp
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [copiedUri, setCopiedUri] = useState(false);

  useEffect(() => {
    if (currentCase) {
      const startTime = currentCase.session_start_time || currentCase.createdAt;
      if (startTime) {
        const startMs = new Date(startTime).getTime();
        const initialDiff = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
        setElapsedSeconds(initialDiff);
      } else {
        setElapsedSeconds(0);
      }
    } else {
      setElapsedSeconds(0);
    }

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentCase?.case_id, currentCase?.session_start_time, currentCase?.createdAt]);

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

  const isHold = currentCase?.case_status === 'SAFETY_HOLD';
  const roomName = currentCase?.ot_room ? currentCase.ot_room.split('(')[0].trim() : 'OT';

  return (
    <header className="w-full bg-[#080D1A]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Room Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight text-sm">SurgiVoice</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                {roomName}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Sterile Clinical Logger</p>
          </div>
        </div>

        {/* Dynamic Patient Capsule */}
        {currentCase?.patient_info && (
          <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
            <span className="font-semibold text-slate-200">{currentCase.patient_info.name}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{currentCase.patient_info.age}{currentCase.patient_info.gender ? currentCase.patient_info.gender[0] : ''}</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-slate-400 text-[11px]">{currentCase.patient_info.uhid}</span>
            {currentCase.patient_info.blood_group && (
              <>
                <span className="text-slate-600">•</span>
                <span className="font-bold text-rose-300 bg-rose-950/60 px-1.5 py-0.2 rounded text-[10px]">
                  {currentCase.patient_info.blood_group}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Center: Real Elapsed Timer & Voice Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-slate-800 text-xs">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono font-bold text-amber-300 tracking-wider">
            {formatTimer(elapsedSeconds)}
          </span>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
          isHold 
            ? 'bg-rose-950/60 text-rose-300 border-rose-500/50 animate-pulse'
            : isRecording 
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400' 
              : 'bg-slate-900 text-slate-400 border-slate-800'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            isHold ? 'bg-rose-400 animate-ping' : isRecording ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'
          }`} />
          <span>{isHold ? 'Safety Hold' : isRecording ? 'Listening...' : 'Hands-Free Ready'}</span>
        </div>
      </div>

      {/* Right: Walkthrough Button, MongoDB Status & Quick Actions */}
      <div className="flex items-center gap-2.5">
        {/* Interactive Walkthrough Tour Button */}
        <button
          onClick={onOpenWalkthrough}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all shadow-sm"
          title="Interactive Feature Tour"
        >
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span>Tour</span>
        </button>

        {/* MongoDB Compass Status Pill */}
        <button
          onClick={onOpenCompassModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-xs transition-colors"
          title="Inspect collections in MongoDB Compass"
        >
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-slate-300 text-[11px]">127.0.0.1:27017</span>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded-full">
            {mongoHealth?.totalDocuments ?? 0} docs
          </span>
        </button>

        <button
          onClick={handleCopyCompass}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          title="Copy MongoDB Compass URI"
        >
          {copiedUri ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>

        <button
          onClick={onOpenPastSurgeries}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
        >
          <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>Cases</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          title="Settings & Models"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

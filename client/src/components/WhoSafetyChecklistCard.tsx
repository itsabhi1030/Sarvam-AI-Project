import React from 'react';
import { 
  ShieldCheck, 
  AlertOctagon, 
  CheckCircle, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Plus, 
  Minus 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WhoSafetyChecklist } from '../types/clinical';

interface WhoSafetyChecklistCardProps {
  checklist: WhoSafetyChecklist;
  onUpdateCount: (category: 'abdominal_sponges' | 'raytec_gauze_swabs' | 'suture_needles', type: 'deployed' | 'recovered', delta: number) => void;
  onTogglePhase: (phase: 'sign_in_completed' | 'time_out_completed' | 'sign_out_completed') => void;
}

export const WhoSafetyChecklistCard: React.FC<WhoSafetyChecklistCardProps> = ({
  checklist,
  onUpdateCount,
  onTogglePhase
}) => {
  const isLockout = checklist.count_discrepancy_alert;
  const counts = checklist.counts;

  const handleConfetti = () => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className={`rounded-xl p-4 transition-all duration-300 relative overflow-hidden ${
      isLockout
        ? 'bg-rose-950/40 border-2 border-rose-500 lockout-alert shadow-[0_0_30px_rgba(239,68,68,0.45)]'
        : 'glass-panel border-emerald-500/25 shadow-lg'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isLockout ? (
            <AlertOctagon className="w-5 h-5 text-rose-400 animate-bounce" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          )}
          <div>
            <h2 className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-2">
              WHO SURGICAL SAFETY CHECKLIST & COUNT MATRIX
              {isLockout ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500 text-white font-extrabold animate-pulse">
                  LOCKOUT ACTIVE
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  SAFE TO OPERATE
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* 3 WHO Phase Checkboxes */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTogglePhase('sign_in_completed')}
            className={`px-2 py-1 rounded text-[11px] font-semibold border flex items-center gap-1 transition-all ${
              checklist.sign_in_completed
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            <CheckCircle className="w-3 h-3" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => onTogglePhase('time_out_completed')}
            className={`px-2 py-1 rounded text-[11px] font-semibold border flex items-center gap-1 transition-all ${
              checklist.time_out_completed
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            <CheckCircle className="w-3 h-3" />
            <span>Time Out</span>
          </button>

          <button
            onClick={() => {
              onTogglePhase('sign_out_completed');
              if (!checklist.sign_out_completed && !isLockout) handleConfetti();
            }}
            className={`px-2 py-1 rounded text-[11px] font-semibold border flex items-center gap-1 transition-all ${
              checklist.sign_out_completed
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            <CheckCircle className="w-3 h-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Critical Discrepancy Lockout Banner */}
      {isLockout && (
        <div className="mb-3 p-2.5 rounded-lg bg-rose-600/90 text-white flex items-center gap-2.5 shadow-lg border border-rose-400">
          <Lock className="w-5 h-5 flex-shrink-0 animate-pulse text-amber-200" />
          <div className="flex-1 text-xs font-bold leading-snug">
            {checklist.discrepancy_notes || 'CLOSURE LOCKOUT: 1 SPONGE UNACCOUNTED FOR. CEASE SUTURING & COMMENCE X-RAY PROTOCOL.'}
          </div>
        </div>
      )}

      {/* Live Surgical Count Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {/* Count 1: Abdominal Sponges / Mops */}
        <div className={`p-2.5 rounded-lg border flex flex-col justify-between transition-all ${
          !counts.abdominal_sponges.matched
            ? 'bg-rose-950/50 border-rose-500 text-rose-200 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
            : 'bg-[#09111F] border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-200">Abdominal Mops</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
              counts.abdominal_sponges.matched 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/20' 
                : 'bg-rose-900 text-rose-200 animate-pulse'
            }`}>
              {counts.abdominal_sponges.matched ? 'MATCHED' : 'UNMATCHED'}
            </span>
          </div>

          <div className="flex items-baseline justify-between my-1">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400">Deployed</span>
              <span className="text-xl font-extrabold mono-telemetry text-white">
                {counts.abdominal_sponges.deployed}
              </span>
            </div>
            <span className="text-slate-600 text-sm">vs</span>
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-slate-400">Recovered</span>
              <span className={`text-xl font-extrabold mono-telemetry ${
                counts.abdominal_sponges.matched ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {counts.abdominal_sponges.recovered}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-400">Adjust Recv:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdateCount('abdominal_sponges', 'recovered', -1)}
                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs"
                title="Decrement recovered"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={() => onUpdateCount('abdominal_sponges', 'recovered', 1)}
                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs"
                title="Increment recovered"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Count 2: Raytec Gauze Swabs */}
        <div className={`p-2.5 rounded-lg border flex flex-col justify-between transition-all ${
          !counts.raytec_gauze_swabs.matched
            ? 'bg-rose-950/50 border-rose-500 text-rose-200'
            : 'bg-[#09111F] border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-200">Gauze Swabs</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
              counts.raytec_gauze_swabs.matched 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/20' 
                : 'bg-rose-900 text-rose-200 animate-pulse'
            }`}>
              {counts.raytec_gauze_swabs.matched ? 'MATCHED' : 'UNMATCHED'}
            </span>
          </div>

          <div className="flex items-baseline justify-between my-1">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400">Deployed</span>
              <span className="text-xl font-extrabold mono-telemetry text-white">
                {counts.raytec_gauze_swabs.deployed}
              </span>
            </div>
            <span className="text-slate-600 text-sm">vs</span>
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-slate-400">Recovered</span>
              <span className={`text-xl font-extrabold mono-telemetry ${
                counts.raytec_gauze_swabs.matched ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {counts.raytec_gauze_swabs.recovered}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-400">Adjust Recv:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdateCount('raytec_gauze_swabs', 'recovered', -1)}
                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={() => onUpdateCount('raytec_gauze_swabs', 'recovered', 1)}
                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Count 3: Suture Needles & Sharps */}
        <div className={`p-2.5 rounded-lg border flex flex-col justify-between transition-all ${
          !counts.suture_needles.matched
            ? 'bg-rose-950/50 border-rose-500 text-rose-200'
            : 'bg-[#09111F] border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-200">Needles & Sharps</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
              counts.suture_needles.matched 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/20' 
                : 'bg-rose-900 text-rose-200 animate-pulse'
            }`}>
              {counts.suture_needles.matched ? 'MATCHED' : 'UNMATCHED'}
            </span>
          </div>

          <div className="flex items-baseline justify-between my-1">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400">Deployed</span>
              <span className="text-xl font-extrabold mono-telemetry text-white">
                {counts.suture_needles.deployed}
              </span>
            </div>
            <span className="text-slate-600 text-sm">vs</span>
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-slate-400">Recovered</span>
              <span className={`text-xl font-extrabold mono-telemetry ${
                counts.suture_needles.matched ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {counts.suture_needles.recovered}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-400">Adjust Recv:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdateCount('suture_needles', 'recovered', -1)}
                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={() => onUpdateCount('suture_needles', 'recovered', 1)}
                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Count 4: Surgical Instruments Registry */}
        <div className="p-2.5 rounded-lg border bg-[#09111F] border-slate-800 text-slate-300 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-200">Instruments</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/20">
              INTACT
            </span>
          </div>

          <div className="my-1">
            <div className="text-[10px] text-slate-400">Tray Verification</div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>General Lap Set #2</span>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Forceps / Retractors:</span>
            <span className="text-emerald-400 font-bold">28/28</span>
          </div>
        </div>
      </div>
    </div>
  );
};

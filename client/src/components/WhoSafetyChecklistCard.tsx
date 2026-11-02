import React from 'react';
import { 
  ShieldCheck, 
  AlertOctagon, 
  CheckCircle, 
  Lock, 
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
      particleCount: 35,
      spread: 50,
      origin: { y: 0.5 }
    });
  };

  return (
    <div className={`p-4 rounded-2xl transition-all ${
      isLockout
        ? 'bg-rose-950/40 border-2 border-rose-500 shadow-[0_0_25px_rgba(239,68,68,0.35)]'
        : 'bg-[#090F1E] border border-slate-800/80 shadow-md'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isLockout ? (
            <AlertOctagon className="w-4 h-4 text-rose-400 animate-bounce" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          )}
          <span className="text-xs font-semibold text-slate-200">
            WHO Surgical Safety & Counts
          </span>
          {isLockout ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
              CLOSURE LOCKED
            </span>
          ) : (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/20">
              Verified
            </span>
          )}
        </div>

        {/* 3 Phases */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onTogglePhase('sign_in_completed')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              checklist.sign_in_completed
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                : 'bg-black/30 text-slate-500 border border-slate-800'
            }`}
          >
            <CheckCircle className="w-3 h-3" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => onTogglePhase('time_out_completed')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              checklist.time_out_completed
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                : 'bg-black/30 text-slate-500 border border-slate-800'
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
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              checklist.sign_out_completed
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                : 'bg-black/30 text-slate-500 border border-slate-800'
            }`}
          >
            <CheckCircle className="w-3 h-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Lockout Warning Banner */}
      {isLockout && (
        <div className="mb-3 p-2.5 rounded-xl bg-rose-600/90 text-white flex items-center gap-2 text-xs font-semibold shadow-md">
          <Lock className="w-4 h-4 flex-shrink-0 animate-pulse" />
          <span>{checklist.discrepancy_notes || 'COUNT DISCREPANCY: Hold closure immediately. Intra-op X-ray required.'}</span>
        </div>
      )}

      {/* Modern Compact Counters Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        {/* Sponges */}
        <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
          !counts.abdominal_sponges.matched
            ? 'bg-rose-950/40 border-rose-500 text-rose-200'
            : 'bg-black/30 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Mops</span>
            <span className={`text-[10px] font-bold ${counts.abdominal_sponges.matched ? 'text-emerald-400' : 'text-rose-400'}`}>
              {counts.abdominal_sponges.matched ? 'Match' : 'Miss'}
            </span>
          </div>
          <div className="my-1 text-center">
            <span className="text-lg font-bold font-mono text-white">
              {counts.abdominal_sponges.recovered}
            </span>
            <span className="text-slate-500 text-xs font-mono"> / {counts.abdominal_sponges.deployed}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-slate-800/60">
            <button
              onClick={() => onUpdateCount('abdominal_sponges', 'recovered', -1)}
              className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={() => onUpdateCount('abdominal_sponges', 'recovered', 1)}
              className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs"
            >
              <Plus className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Swabs */}
        <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
          !counts.raytec_gauze_swabs.matched
            ? 'bg-rose-950/40 border-rose-500 text-rose-200'
            : 'bg-black/30 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Swabs</span>
            <span className={`text-[10px] font-bold ${counts.raytec_gauze_swabs.matched ? 'text-emerald-400' : 'text-rose-400'}`}>
              {counts.raytec_gauze_swabs.matched ? 'Match' : 'Miss'}
            </span>
          </div>
          <div className="my-1 text-center">
            <span className="text-lg font-bold font-mono text-white">
              {counts.raytec_gauze_swabs.recovered}
            </span>
            <span className="text-slate-500 text-xs font-mono"> / {counts.raytec_gauze_swabs.deployed}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-slate-800/60">
            <button
              onClick={() => onUpdateCount('raytec_gauze_swabs', 'recovered', -1)}
              className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={() => onUpdateCount('raytec_gauze_swabs', 'recovered', 1)}
              className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs"
            >
              <Plus className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Needles */}
        <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
          !counts.suture_needles.matched
            ? 'bg-rose-950/40 border-rose-500 text-rose-200'
            : 'bg-black/30 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Needles</span>
            <span className={`text-[10px] font-bold ${counts.suture_needles.matched ? 'text-emerald-400' : 'text-rose-400'}`}>
              {counts.suture_needles.matched ? 'Match' : 'Miss'}
            </span>
          </div>
          <div className="my-1 text-center">
            <span className="text-lg font-bold font-mono text-white">
              {counts.suture_needles.recovered}
            </span>
            <span className="text-slate-500 text-xs font-mono"> / {counts.suture_needles.deployed}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-slate-800/60">
            <button
              onClick={() => onUpdateCount('suture_needles', 'recovered', -1)}
              className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={() => onUpdateCount('suture_needles', 'recovered', 1)}
              className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs"
            >
              <Plus className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Instruments */}
        <div className="p-2.5 rounded-xl border bg-black/30 border-slate-800 text-slate-300 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Tray</span>
            <span className="text-[10px] font-bold text-emerald-400">Intact</span>
          </div>
          <div className="my-1 text-center font-bold text-sm text-white">
            28 / 28
          </div>
          <div className="pt-1 border-t border-slate-800/60 text-center text-[10px] text-slate-500">
            Lap Set #2
          </div>
        </div>
      </div>
    </div>
  );
};

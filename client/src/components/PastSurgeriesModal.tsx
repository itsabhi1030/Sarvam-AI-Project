import React from 'react';
import { 
  X, 
  FolderOpen, 
  Calendar, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { OperativeCase } from '../types/clinical';

interface PastSurgeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: OperativeCase[];
  selectedCaseId: string;
  onSelectCase: (caseId: string) => void;
  onNewCase: () => void;
}

export const PastSurgeriesModal: React.FC<PastSurgeriesModalProps> = ({
  isOpen,
  onClose,
  cases,
  selectedCaseId,
  onSelectCase,
  onNewCase
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#090F1C] border border-cyan-500/30 rounded-2xl w-full max-w-2xl h-[75vh] flex flex-col shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-[#0B1324]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                SURGICAL CASES ARCHIVE (MONGODB)
              </h2>
              <p className="text-[11px] text-slate-400 mono-telemetry">
                Collection: operative_cases ({cases.length} records)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onNewCase();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md"
            >
              + New Case Session
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Case List */}
        <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-3 bg-[#050912]">
          {cases.map((c) => {
            const isSelected = c.case_id === selectedCaseId;
            const isHold = c.case_status === 'SAFETY_HOLD';
            const isCompleted = c.case_status === 'COMPLETED_SIGNED_OFF';

            return (
              <div
                key={c.case_id}
                onClick={() => {
                  onSelectCase(c.case_id);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                    : 'bg-[#0A1121] hover:bg-[#0E1830] border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white mono-telemetry">
                      {c.case_id}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {c.ot_room.split('(')[0].trim()}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    isHold 
                      ? 'bg-rose-950 text-rose-300 border-rose-500/40 animate-pulse' 
                      : isCompleted 
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' 
                        : 'bg-amber-950 text-amber-300 border-amber-500/40'
                  }`}>
                    {c.case_status}
                  </span>
                </div>

                <div className="text-xs font-bold text-cyan-200">
                  {c.nabh_operative_note?.procedure_title || 'Unassigned Procedure'}
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>{c.patient_info?.name} ({c.patient_info?.age}{c.patient_info?.gender[0]})</span>
                  </div>
                  <div>
                    Lead: <span className="text-slate-300">{c.surgical_team?.lead_surgeon?.split(' ')[1] || 'Surgeon'}</span>
                  </div>
                  <div className="text-right mono-telemetry text-slate-400">
                    EBL: <strong className="text-white">{c.nabh_operative_note?.estimated_blood_loss_ml || 0}ml</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

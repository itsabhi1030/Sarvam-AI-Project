import React from 'react';
import { 
  FileText, 
  Droplet, 
  Scissors, 
  Layers, 
  Tag, 
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { NabhOperativeNote } from '../types/clinical';

interface NabhOperativeRecordCardProps {
  note: NabhOperativeNote;
  isProcessing: boolean;
}

export const NabhOperativeRecordCard: React.FC<NabhOperativeRecordCardProps> = ({
  note,
  isProcessing
}) => {
  const ebl = note.estimated_blood_loss_ml || 0;
  const eblColor = ebl < 150 ? 'text-emerald-400' : ebl <= 500 ? 'text-amber-400' : 'text-rose-400';
  const eblPercent = Math.min(100, Math.round((ebl / 600) * 100));

  return (
    <div className="p-4 rounded-2xl bg-[#090F1E] border border-slate-800/80 shadow-md flex-1 flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200">
            NABH Operative Record
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isProcessing && (
            <span className="flex items-center gap-1 text-[11px] text-cyan-300 font-medium px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30">
              <Sparkles className="w-3 h-3 animate-spin text-cyan-400" />
              Updating...
            </span>
          )}
          <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 font-medium">
            NABH 5th Edition
          </span>
        </div>
      </div>

      {/* Row 1: Procedure, Diagnosis & EBL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Procedure & Diagnoses */}
        <div className="md:col-span-2 p-3 rounded-xl bg-black/30 border border-slate-800 flex flex-col justify-between gap-2">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                Active Procedure
              </span>
              <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/20">
                {note.surgical_approach || 'Open'} Approach
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mt-0.5">
              {note.procedure_title || 'Unassigned Procedure'}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/60">
            <div>
              <span className="text-[10px] text-slate-500 block">Pre-Op Diagnosis:</span>
              <span className="text-slate-300 font-medium text-[11px]">
                {note.pre_op_diagnosis || 'Pending dictation...'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Post-Op Diagnosis:</span>
              <span className="text-cyan-300 font-medium text-[11px]">
                {note.post_op_diagnosis || 'Pending dictation...'}
              </span>
            </div>
          </div>
        </div>

        {/* EBL Meter */}
        <div className="p-3 rounded-xl bg-black/30 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
              <Droplet className="w-3 h-3 text-rose-400" />
              Blood Loss
            </span>
            <span className={`text-[10px] font-bold ${eblColor}`}>
              {ebl < 150 ? 'Minimal' : ebl <= 500 ? 'Moderate' : 'High'}
            </span>
          </div>

          <div className="my-1">
            <span className={`text-2xl font-bold font-mono ${eblColor}`}>
              {ebl} <span className="text-xs font-normal text-slate-400">mL</span>
            </span>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div 
                className={`h-full transition-all duration-500 ${
                  ebl < 150 ? 'bg-emerald-400' : ebl <= 500 ? 'bg-amber-400' : 'bg-rose-500'
                }`}
                style={{ width: `${eblPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
            <span>Fluids: <strong className="text-white font-mono">{note.intra_op_fluids_ml || 500}ml</strong></span>
            <span>Urine: <strong className="text-white font-mono">{note.urine_output_ml || 150}ml</strong></span>
          </div>
        </div>
      </div>

      {/* Row 2: Anatomical Findings Tags */}
      <div className="p-3 rounded-xl bg-black/30 border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Intraoperative Anatomical Findings</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {note.anatomical_findings?.length || 0} logged
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(!note.anatomical_findings || note.anatomical_findings.length === 0) ? (
            <span className="text-xs text-slate-500 italic py-1">No findings logged yet.</span>
          ) : (
            note.anatomical_findings.map((finding, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/60 text-xs text-slate-200 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>{finding}</span>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Row 3: Sutures & Implants (Streamlined Table) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
        {/* Sutures */}
        <div className="p-3 rounded-xl bg-black/30 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-2 text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              <span>Sutures & Ligatures</span>
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-28 pr-1">
            {(!note.sutures_and_hemostasis || note.sutures_and_hemostasis.length === 0) ? (
              <p className="text-xs text-slate-500 italic py-2">No sutures recorded yet.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] text-slate-500 uppercase border-b border-slate-800/80">
                    <th className="pb-1 font-semibold">Material</th>
                    <th className="pb-1 font-semibold">Target</th>
                    <th className="pb-1 font-semibold text-right">Technique</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {note.sutures_and_hemostasis.map((sut, idx) => (
                    <tr key={idx}>
                      <td className="py-1 text-cyan-300 font-mono font-semibold">{sut.material}</td>
                      <td className="py-1 text-slate-300 text-[11px]">{sut.anatomical_target}</td>
                      <td className="py-1 text-right text-slate-400 text-[11px]">{sut.technique}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Implants & Histology */}
        <div className="p-3 rounded-xl bg-black/30 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 text-xs text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-400" />
                <span>Implants & Specimens</span>
              </span>
            </div>

            {note.implants_registry && note.implants_registry.length > 0 ? (
              note.implants_registry.map((imp, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                  <div className="font-semibold text-indigo-300">{imp.implant_name}</div>
                  <div className="text-[11px] text-slate-400">{imp.specification}</div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic py-1">No prosthetic implants required.</p>
            )}

            {note.specimens_collected && note.specimens_collected.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-800/60 text-xs text-slate-300 flex items-center justify-between">
                <span>{note.specimens_collected[0].specimen_name}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                  {note.specimens_collected[0].destination_lab}
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Complications:</span>
            <span className="text-emerald-400 font-medium">
              {note.complications || 'Nil'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

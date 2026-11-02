import React from 'react';
import { 
  FileText, 
  Droplet, 
  Scissors, 
  Layers, 
  Tag, 
  FlaskConical, 
  AlertCircle, 
  Check, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const eblBg = ebl < 150 ? 'bg-emerald-500/20 border-emerald-500/30' : ebl <= 500 ? 'bg-amber-500/20 border-amber-500/30' : 'bg-rose-500/20 border-rose-500/30';
  const eblPercent = Math.min(100, Math.round((ebl / 800) * 100));

  return (
    <div className="glass-panel rounded-xl p-4 flex-1 flex flex-col gap-3.5 border border-cyan-500/20 shadow-xl overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-white tracking-wider uppercase">
            LIVE NABH STRUCTURED OPERATIVE NOTE
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isProcessing && (
            <span className="flex items-center gap-1 text-[11px] text-cyan-300 font-semibold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 animate-pulse">
              <Sparkles className="w-3 h-3 animate-spin text-cyan-400" />
              Sarvam AI Updating...
            </span>
          )}
          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 font-medium">
            Accredited Electronic Health Record (EHR)
          </span>
        </div>
      </div>

      {/* Main Grid: Clinical Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Pre-Op & Post-Op Diagnoses */}
        <div className="col-span-2 flex flex-col gap-2 p-3 rounded-lg bg-[#09111F] border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Diagnoses & Procedure
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              Approach: {note.surgical_approach || 'Open'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">Pre-Operative:</span>
              <p className="font-semibold text-slate-200">
                {note.pre_op_diagnosis || 'Pending dictation...'}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Post-Operative:</span>
              <p className="font-semibold text-cyan-300">
                {note.post_op_diagnosis || 'Pending dictation...'}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">Procedure Performed:</span>
              <span className="font-bold text-white text-sm">
                {note.procedure_title || 'Unassigned Procedure'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Incision / Port Sites:</span>
              <span className="text-slate-300 font-medium">
                {note.incision_type || 'Not logged'}
              </span>
            </div>
          </div>
        </div>

        {/* EBL (Estimated Blood Loss) & Intra-Op Vitals Gauge */}
        <div className="p-3 rounded-lg bg-[#09111F] border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Droplet className="w-3 h-3 text-rose-400" />
              Estimated Blood Loss
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${eblBg} ${eblColor}`}>
              {ebl < 150 ? 'NORMAL' : ebl <= 500 ? 'MODERATE' : 'HEMORRHAGE'}
            </span>
          </div>

          <div className="my-1.5 flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold mono-telemetry ${eblColor}`}>
              {ebl} <span className="text-sm font-normal text-slate-400">mL</span>
            </span>
            <span className="text-xs text-slate-500 mono-telemetry">
              Target: &lt;150 mL
            </span>
          </div>

          {/* Blood Loss Progress Bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full transition-all duration-500 ${
                ebl < 150 ? 'bg-emerald-400' : ebl <= 500 ? 'bg-amber-400' : 'bg-rose-500'
              }`}
              style={{ width: `${eblPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-1 text-[11px] pt-1.5 border-t border-slate-800/60 text-slate-400">
            <div>
              Fluids: <strong className="text-slate-200 mono-telemetry">{note.intra_op_fluids_ml || 500} mL</strong>
            </div>
            <div className="text-right">
              Urine: <strong className="text-slate-200 mono-telemetry">{note.urine_output_ml || 150} mL</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Anatomical Findings (Bulleted Badges) */}
      <div className="p-3 rounded-lg bg-[#09111F] border border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Intraoperative Anatomical Findings
          </span>
          <span className="text-[10px] text-slate-500 mono-telemetry">
            {note.anatomical_findings?.length || 0} findings logged
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {(!note.anatomical_findings || note.anatomical_findings.length === 0) ? (
            <span className="text-xs text-slate-500 italic">No specific findings logged yet.</span>
          ) : (
            note.anatomical_findings.map((finding, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-2.5 py-1 rounded-md bg-[#0D182E] border border-cyan-500/30 text-xs text-slate-200 flex items-center gap-1.5 shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>{finding}</span>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Sutures, Ligatures & Implants Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
        {/* Sutures & Hemostasis */}
        <div className="p-3 rounded-lg bg-[#09111F] border border-slate-800/80 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              Sutures & Hemostasis Materials
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
              NABH Sec. 4.2
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[140px] pr-1">
            {(!note.sutures_and_hemostasis || note.sutures_and_hemostasis.length === 0) ? (
              <div className="text-xs text-slate-500 py-3 text-center italic">
                Awaiting suture dictation (e.g. 2-0 Vicryl, 1-0 Silk)
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase">
                    <th className="pb-1">Material</th>
                    <th className="pb-1">Target Site</th>
                    <th className="pb-1 text-right">Technique</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {note.sutures_and_hemostasis.map((sut, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20">
                      <td className="py-1.5 font-bold text-cyan-300 mono-telemetry">
                        {sut.material}
                      </td>
                      <td className="py-1.5 text-slate-300">
                        {sut.anatomical_target}
                      </td>
                      <td className="py-1.5 text-right text-slate-400 text-[11px]">
                        {sut.technique}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Implants & Specimens */}
        <div className="p-3 rounded-lg bg-[#09111F] border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-purple-400" />
                Implants & Histopathology
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                Tracked
              </span>
            </div>

            {/* Implants */}
            {note.implants_registry && note.implants_registry.length > 0 ? (
              <div className="mb-2">
                {note.implants_registry.map((imp, idx) => (
                  <div key={idx} className="p-2 rounded bg-indigo-950/40 border border-indigo-500/30 text-xs mb-1">
                    <div className="font-bold text-indigo-300">{imp.implant_name}</div>
                    <div className="text-[11px] text-slate-300">{imp.specification}</div>
                    <div className="text-[10px] mono-telemetry text-slate-400 mt-0.5">
                      Batch: <span className="text-white">{imp.serial_batch_code}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 mb-2 italic">
                No prosthetic implants logged for this procedure.
              </div>
            )}

            {/* Specimens */}
            {note.specimens_collected && note.specimens_collected.length > 0 && (
              <div className="flex flex-col gap-1 pt-1.5 border-t border-slate-800/60">
                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <FlaskConical className="w-3 h-3 text-emerald-400" />
                  Specimens Dispatched:
                </span>
                {note.specimens_collected.map((spec, idx) => (
                  <div key={idx} className="text-xs text-slate-300 flex items-center justify-between">
                    <span>{spec.specimen_name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/20">
                      {spec.destination_lab}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Complications & Closure */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Complications:</span>
            <span className="text-emerald-400 font-semibold">
              {note.complications || 'Nil intraoperative complications'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

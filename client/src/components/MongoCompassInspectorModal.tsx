import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Copy, 
  Check, 
  RefreshCw, 
  FileDown, 
  Layers, 
  Code, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { OperativeCase, VoiceDictationLog, MongoHealthStatus } from '../types/clinical';

interface MongoCompassInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCase: OperativeCase | null;
  logs: VoiceDictationLog[];
  mongoHealth: MongoHealthStatus | null;
  onRefreshMongo: () => void;
}

export const MongoCompassInspectorModal: React.FC<MongoCompassInspectorModalProps> = ({
  isOpen,
  onClose,
  currentCase,
  logs,
  mongoHealth,
  onRefreshMongo
}) => {
  const [activeTab, setActiveTab] = useState<'case' | 'logs' | 'catalog' | 'guide'>('case');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const compassUri = 'mongodb://127.0.0.1:27017/surgivoice_indic';

  const handleCopy = () => {
    navigator.clipboard.writeText(compassUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportSummary = () => {
    setIsExporting(true);
    setTimeout(() => {
      // Generate formatted JSON or printable summary
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentCase, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `NABH_Operative_Summary_${currentCase?.case_id || 'Case'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setIsExporting(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#090F1C] border border-cyan-500/30 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-[#0B1324]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Database className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                MONGODB COMPASS LIVE DOCUMENT INSPECTOR
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 mono-telemetry">
                  {mongoHealth?.status || 'CONNECTED'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 mono-telemetry">
                {compassUri}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-[#142038] hover:bg-[#1A2A4A] text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied URI!' : 'Copy Compass URI'}</span>
            </button>

            <button
              onClick={onRefreshMongo}
              className="p-2 rounded-lg bg-[#142038] hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
              title="Refresh from MongoDB"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collection Switcher Tabs */}
        <div className="px-5 py-2.5 bg-[#070D18] border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('case')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'case'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>operative_cases ({mongoHealth?.counts.operative_cases ?? 3})</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'logs'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>voice_dictation_logs ({mongoHealth?.counts.voice_dictation_logs ?? logs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'catalog'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>ot_equipment_catalog ({mongoHealth?.counts.ot_equipment_and_suture_catalog ?? 6})</span>
            </button>
          </div>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'guide'
                ? 'bg-emerald-600 text-white'
                : 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Compass Stage Demo Guide</span>
          </button>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 p-5 overflow-y-auto bg-[#050912]">
          {activeTab === 'case' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Displaying Document: <strong className="text-white mono-telemetry">{currentCase?.case_id}</strong></span>
                <span className="mono-telemetry text-emerald-400">Collection: operative_cases</span>
              </div>
              <pre className="p-4 rounded-xl bg-black/70 border border-slate-800 text-[12px] text-cyan-300 mono-telemetry overflow-x-auto leading-relaxed shadow-inner">
                {JSON.stringify(currentCase, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Displaying <strong className="text-white mono-telemetry">{logs.length}</strong> Voice Telemetry Logs</span>
                <span className="mono-telemetry text-indigo-400">Collection: voice_dictation_logs</span>
              </div>
              <pre className="p-4 rounded-xl bg-black/70 border border-slate-800 text-[12px] text-indigo-300 mono-telemetry overflow-x-auto leading-relaxed shadow-inner">
                {JSON.stringify(logs, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'catalog' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Standard Indian Hospital OT Reference Catalog</span>
                <span className="mono-telemetry text-purple-400">Collection: ot_equipment_and_suture_catalog</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#09111F] border border-slate-800">
                  <span className="font-bold text-cyan-300 block mb-1">VICRYL-2-0-V397</span>
                  <p className="text-slate-300 text-[11px]">2-0 Coated VICRYL (Polyglactin 910) - Absorbable synthetic braided suture</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">Category: SUTURE</span>
                </div>
                <div className="p-3 rounded-lg bg-[#09111F] border border-slate-800">
                  <span className="font-bold text-cyan-300 block mb-1">SILK-1-0-S120</span>
                  <p className="text-slate-300 text-[11px]">1-0 MERSILK Braided Non-Absorbable - For appendiceal base ligatures</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">Category: SUTURE</span>
                </div>
                <div className="p-3 rounded-lg bg-[#09111F] border border-slate-800">
                  <span className="font-bold text-cyan-300 block mb-1">LCP-DISTAL-RADIUS-6H-TI</span>
                  <p className="text-slate-300 text-[11px]">6-Hole Volar Distal Radius 3.5mm Titanium Locking Compression Plate</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">Category: IMPLANT</span>
                </div>
                <div className="p-3 rounded-lg bg-[#09111F] border border-slate-800">
                  <span className="font-bold text-cyan-300 block mb-1">MOP-ABDOMINAL-RAYTEC</span>
                  <p className="text-slate-300 text-[11px]">X-Ray Detectable Abdominal Cotton Lap Sponge with Barium Sulfate filament</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">Category: SPONGE</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="flex flex-col gap-4 text-xs text-slate-300 leading-relaxed max-w-2xl mx-auto py-2">
              <div className="p-4 rounded-xl bg-[#0C1629] border border-emerald-500/40 shadow-lg">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  MongoDB Compass Stage Demo Setup (Sarvam Campus '26)
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 text-[12px]">
                  <li>
                    Open <strong>MongoDB Compass</strong> on your laptop.
                  </li>
                  <li>
                    In the URI connection bar, paste:
                    <div className="mt-1 p-2 rounded bg-black/60 border border-slate-800 text-cyan-300 mono-telemetry flex items-center justify-between">
                      <span>mongodb://127.0.0.1:27017/surgivoice_indic</span>
                      <button onClick={handleCopy} className="text-xs text-emerald-400 hover:underline">Copy</button>
                    </div>
                  </li>
                  <li>
                    Click <strong>Connect</strong>. You will immediately see the <strong className="text-white">surgivoice_indic</strong> database.
                  </li>
                  <li>
                    Inspect the 3 clean collections:
                    <ul className="list-disc list-inside ml-4 mt-1 text-slate-400">
                      <li><strong className="text-cyan-300">operative_cases:</strong> Primary NABH operative notes & WHO counts</li>
                      <li><strong className="text-indigo-300">voice_dictation_logs:</strong> Audit trail of raw transcripts & Sarvam STT/TTS</li>
                      <li><strong className="text-purple-300">ot_equipment_and_suture_catalog:</strong> Reference suture codes</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Live Stage Pitch Trick:</strong> Position your browser on 75% of your screen and MongoDB Compass on the remaining 25%. Click a Scenario or speak into the mic, then hit the <strong>Refresh</strong> button in Compass to reveal structured records written directly to disk!
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between bg-[#0B1324]">
          <span className="text-xs text-slate-400">
            Audit Standard: <strong className="text-slate-200">ISO 13485 & NABH 5th Edition</strong>
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportSummary}
              disabled={isExporting}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Exporting...' : 'Export NABH Record'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

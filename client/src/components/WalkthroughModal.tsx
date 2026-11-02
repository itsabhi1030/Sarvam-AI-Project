import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Mic, 
  ShieldCheck, 
  FileText, 
  Volume2, 
  HeartHandshake, 
  Database, 
  Sparkles, 
  CheckCircle2,
  Activity
} from 'lucide-react';

interface WalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Step {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  description: string;
  highlightPoints: string[];
  tip?: string;
}

export const WalkthroughModal: React.FC<WalkthroughModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps: Step[] = [
    {
      title: "Welcome to SurgiVoice Indic",
      subtitle: "Sterile Hands-Free OT Operative Logger & Safety Console",
      icon: <Activity className="w-8 h-8 text-cyan-400" />,
      iconBg: "bg-cyan-500/10 border-cyan-500/30",
      description: "Designed for Indian Hospital Operation Theatres. Surgeons work in sterile scrubbed conditions where touching screens or keyboards breaks asepsis. SurgiVoice Indic provides zero-touch intraoperative documentation.",
      highlightPoints: [
        "Hands-Free Sterile Operation: Zero touch required inside sterile field",
        "Code-Mixed Indic Audio: Understands English, Hindi, and Marathi clinical speech",
        "NABH & WHO Safety Compliant: Structured records ready for live accreditation"
      ],
      tip: "Built for the Sarvam Campus '26 Build-Along Showcase."
    },
    {
      title: "Hands-Free Voice Console & Audio Loop",
      subtitle: "Powered by Sarvam Saaras (saaras:v4 in codemix mode)",
      icon: <Mic className="w-8 h-8 text-cyan-400" />,
      iconBg: "bg-cyan-500/10 border-cyan-500/30",
      description: "Dictate surgical actions seamlessly in Indian English mixed with Hindi or Marathi medical terminology (e.g. 'Mesoappendix 2-0 Vicryl se tie kiya').",
      highlightPoints: [
        "Spacebar Push-to-Talk: Simply hold or tap the Spacebar anywhere to dictate",
        "60fps Canvas Visualizer: Real-time frequency response to voice input",
        "Automatic Language Tagging: Detects code-mixed speech with confidence telemetry"
      ],
      tip: "You can also type clinical notes in the input box if no microphone is connected."
    },
    {
      title: "One-Click Stage Demo Scenarios",
      subtitle: "Deterministic Showcase Engine for Hackathon Pitching",
      icon: <Sparkles className="w-8 h-8 text-amber-400" />,
      iconBg: "bg-amber-500/10 border-amber-500/30",
      description: "Located right below the top navigation bar. Four realistic surgical scenarios let you demonstrate capabilities without needing to speak full clinical scripts on stage.",
      highlightPoints: [
        "General Surgery (Hinglish): Acute Appendectomy with McBurney's incision",
        "Orthopedics (Marathi-English): Distal Radius ORIF with 6-hole Titanium plate",
        "WHO Red Alert: Sponge count discrepancy triggering immediate lockout",
        "Obstetrics: Emergency repeat LSCS with live newborn telemetry"
      ],
      tip: "One click injects full transcript, processes via Sarvam AI, and updates all records."
    },
    {
      title: "WHO Surgical Safety & Count Lockout",
      subtitle: "Real-Time Prevention of Retained Surgical Items (RSI)",
      icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
      iconBg: "bg-emerald-500/10 border-emerald-500/30",
      description: "Replaces paper chits with real-time numeric reconciliation for abdominal sponges, swabs, and sharps across Sign In, Time Out, and Sign Out phases.",
      highlightPoints: [
        "Live Deployed vs. Recovered Counters: Sponges, gauze swabs, and needles",
        "Emergency Safety Hold: If Deployed !== Recovered, screen flashes Crimson Red",
        "Audible Closure Lockout: Synthesizes urgent spoken warning over OT speakers"
      ],
      tip: "Try Scenario 3 to witness the automatic WHO Red Lockout in action."
    },
    {
      title: "NABH Accredited Operative Record",
      subtitle: "Clinical Structuring via Sarvam-105B LLM",
      icon: <FileText className="w-8 h-8 text-indigo-400" />,
      iconBg: "bg-indigo-500/10 border-indigo-500/30",
      description: "As you dictate, unstructured speech is parsed into accredited Electronic Health Record (EHR) schemas according to NABH 5th Edition standards.",
      highlightPoints: [
        "Pre-Op & Post-Op Diagnoses & Surgical Approach tags",
        "Estimated Blood Loss (EBL) Meter with color-coded severity thresholds",
        "Structured Sutures & Hemostasis Table: Material, site, and technique",
        "Prosthetic Implants Registry with lot and serial code tracking"
      ],
      tip: "Changes animate with subtle highlighting as newly recognized entities appear."
    },
    {
      title: "OT Readback & Vernacular Briefings",
      subtitle: "Sarvam Bulbul (bulbul:v3 / v4-flash) Text-to-Speech",
      icon: <HeartHandshake className="w-8 h-8 text-purple-400" />,
      iconBg: "bg-purple-500/10 border-purple-500/30",
      description: "Delivers two essential spoken workflows: intraoperative closed-loop confirmation and vernacular post-op family updates.",
      highlightPoints: [
        "OT Bluetooth Speaker Verification: Spoken confirmation so surgeon never looks away",
        "Vernacular Family Studio: Translates technical jargon into Marathi, Hindi, Tamil, Telugu",
        "Native Indic Scripts: Synthesizes speech from Devanagari/Tamil for optimal prosody"
      ],
      tip: "Relatives outside hear clear, comforting updates in their mother tongue."
    },
    {
      title: "Live MongoDB Compass Inspection",
      subtitle: "mongodb://127.0.0.1:27017/surgivoice_indic",
      icon: <Database className="w-8 h-8 text-emerald-400" />,
      iconBg: "bg-emerald-500/10 border-emerald-500/30",
      description: "All clinical sessions, voice dictations, and equipment catalogs are persisted directly in local MongoDB for real-time inspection in MongoDB Compass.",
      highlightPoints: [
        "operative_cases: Full NABH operative records and WHO count states",
        "voice_dictation_logs: Immutable audit trail with raw audio and latency stats",
        "Stage Demo Trick: Open MongoDB Compass on 25% of your screen and hit Refresh"
      ],
      tip: "Click 'Compass' in the top bar to inspect raw JSON or copy the connection URI."
    }
  ];

  const current = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#090F1E] border border-cyan-500/30 rounded-2xl w-full max-w-2xl flex flex-col shadow-[0_0_60px_rgba(0,240,255,0.18)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0B1324]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${current.iconBg}`}>
              {current.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">{current.title}</h2>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">{current.subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Body */}
        <div className="p-6 flex flex-col gap-4 text-xs text-slate-300 bg-[#060A14]">
          <p className="text-slate-200 text-sm leading-relaxed">
            {current.description}
          </p>

          {/* Highlights List */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col gap-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Key Capabilities:
            </span>
            {current.highlightPoints.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>{point}</span>
              </div>
            ))}
          </div>

          {/* Tip Banner */}
          {current.tip && (
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-200 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span><strong>Pro Tip:</strong> {current.tip}</span>
            </div>
          )}

          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep 
                    ? 'w-6 bg-cyan-400' 
                    : 'w-2 bg-slate-800 hover:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-[#0B1324]">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-300 font-medium transition-colors"
          >
            Skip Walkthrough
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={handleBack}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1 shadow-md transition-all"
            >
              <span>{isLast ? "Get Started" : "Next"}</span>
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

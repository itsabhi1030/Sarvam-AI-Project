import React, { useState, useEffect, useCallback } from 'react';
import { 
  TopTelemetryBar 
} from './components/TopTelemetryBar';
import { 
  SterileVoiceConsole 
} from './components/SterileVoiceConsole';
import { 
  WhoSafetyChecklistCard 
} from './components/WhoSafetyChecklistCard';
import { 
  NabhOperativeRecordCard 
} from './components/NabhOperativeRecordCard';
import { 
  BulbulReadbackStudio 
} from './components/BulbulReadbackStudio';
import { 
  MongoCompassInspectorModal 
} from './components/MongoCompassInspectorModal';
import { 
  PastSurgeriesModal 
} from './components/PastSurgeriesModal';
import { 
  SettingsModal 
} from './components/SettingsModal';

import { 
  OperativeCase, 
  VoiceDictationLog, 
  MongoHealthStatus 
} from './types/clinical';
import { 
  fetchMongoHealth, 
  fetchAllCases, 
  fetchCaseDetails, 
  processVoiceInput, 
  updateSurgicalCounts,
  seedDatabase
} from './services/api';

export function App() {
  const [cases, setCases] = useState<OperativeCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('OT-2026-1102-001');
  const [currentCase, setCurrentCase] = useState<OperativeCase | null>(null);
  const [logs, setLogs] = useState<VoiceDictationLog[]>([]);
  const [mongoHealth, setMongoHealth] = useState<MongoHealthStatus | null>(null);

  // Audio & Model Configuration
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSimulatedMode, setIsSimulatedMode] = useState(false);
  const [sttModel, setSttModel] = useState('saaras:v4');
  const [sttMode, setSttMode] = useState('codemix');
  const [ttsModel, setTtsModel] = useState('bulbul:v3');
  const [speaker, setSpeaker] = useState('shubh');
  const [pace, setPace] = useState(1.05);
  const [autoPlay, setAutoPlay] = useState(true);

  // Latest verification readback audio & text
  const [latestReadbackSentence, setLatestReadbackSentence] = useState(
    'Operative findings logged. Retrocecal gangrenous appendix ligated with 2-0 Vicryl and 1-0 Silk. Five sponges and ten swabs verified matched.'
  );
  const [latestAudioBase64, setLatestAudioBase64] = useState<string | undefined>();

  // Modals
  const [isCompassModalOpen, setIsCompassModalOpen] = useState(false);
  const [isPastSurgeriesOpen, setIsPastSurgeriesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load initial health & cases
  const loadInitialData = useCallback(async () => {
    try {
      const health = await fetchMongoHealth();
      setMongoHealth(health);

      const caseList = await fetchAllCases();
      setCases(caseList);

      if (caseList.length > 0) {
        const targetId = caseList.find(c => c.case_id === selectedCaseId) ? selectedCaseId : caseList[0].case_id;
        setSelectedCaseId(targetId);
        const details = await fetchCaseDetails(targetId);
        setCurrentCase(details.caseData);
        setLogs(details.logs || []);
        if (details.logs && details.logs.length > 0) {
          const lastLog = details.logs[details.logs.length - 1];
          if (lastLog.ot_readback_sentence) {
            setLatestReadbackSentence(lastLog.ot_readback_sentence);
          }
          if (lastLog.audio_base64) {
            setLatestAudioBase64(lastLog.audio_base64);
          }
        }
      }
    } catch (err) {
      console.warn('Initial load error:', err);
    }
  }, [selectedCaseId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Case Selection Change
  const handleSelectCase = async (caseId: string) => {
    setSelectedCaseId(caseId);
    try {
      const details = await fetchCaseDetails(caseId);
      setCurrentCase(details.caseData);
      setLogs(details.logs || []);
      if (details.logs && details.logs.length > 0) {
        const lastLog = details.logs[details.logs.length - 1];
        if (lastLog.ot_readback_sentence) {
          setLatestReadbackSentence(lastLog.ot_readback_sentence);
        }
        if (lastLog.audio_base64) {
          setLatestAudioBase64(lastLog.audio_base64);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Process Simulated or Typed Transcript
  const handleSendTranscript = async (transcript: string, scenarioKey?: string) => {
    if (!currentCase || isProcessing) return;
    setIsProcessing(true);

    try {
      const res = await processVoiceInput({
        caseId: currentCase.case_id,
        transcript,
        sttModel,
        sttMode,
        ttsModel,
        speaker,
        pace,
        targetLanguageCode: 'mr-IN'
      });

      if (res.success) {
        setCurrentCase(res.updatedCase);
        setLogs((prev) => [...prev, res.newVoiceLog]);
        if (res.otReadback) {
          setLatestReadbackSentence(res.otReadback);
        }
        if (res.audioBase64) {
          setLatestAudioBase64(res.audioBase64);
        }
      }
    } catch (e) {
      console.error('Process transcript error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process Live Microphone Audio Blob via Saaras STT
  const handleSendAudioBlob = async (blob: Blob) => {
    if (!currentCase || isProcessing) return;
    setIsProcessing(true);

    try {
      const res = await processVoiceInput({
        caseId: currentCase.case_id,
        audioBlob: blob,
        sttModel,
        sttMode,
        ttsModel,
        speaker,
        pace,
        targetLanguageCode: 'mr-IN'
      });

      if (res.success) {
        setCurrentCase(res.updatedCase);
        setLogs((prev) => [...prev, res.newVoiceLog]);
        if (res.otReadback) {
          setLatestReadbackSentence(res.otReadback);
        }
        if (res.audioBase64) {
          setLatestAudioBase64(res.audioBase64);
        }
      }
    } catch (e) {
      console.error('Process audio error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Adjust Counts from WHO Safety Matrix
  const handleUpdateCount = async (
    category: 'abdominal_sponges' | 'raytec_gauze_swabs' | 'suture_needles',
    type: 'deployed' | 'recovered',
    delta: number
  ) => {
    if (!currentCase) return;
    const currentCounts = currentCase.who_safety_checklist.counts;
    const currentVal = currentCounts[category][type];
    const newVal = Math.max(0, currentVal + delta);

    const updatedCategory = {
      ...currentCounts[category],
      [type]: newVal
    };

    const newCountsPayload = {
      ...currentCounts,
      [category]: updatedCategory
    };

    try {
      const res = await updateSurgicalCounts(currentCase.case_id, newCountsPayload);
      if (res.success) {
        setCurrentCase((prev) => prev ? {
          ...prev,
          who_safety_checklist: res.who_safety_checklist,
          case_status: res.case_status as any
        } : null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle WHO Phase Checkbox
  const handleTogglePhase = (phase: 'sign_in_completed' | 'time_out_completed' | 'sign_out_completed') => {
    if (!currentCase) return;
    setCurrentCase((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        who_safety_checklist: {
          ...prev.who_safety_checklist,
          [phase]: !prev.who_safety_checklist[phase]
        }
      };
    });
  };

  // Create New Operative Case Session
  const handleNewCase = async () => {
    const newCaseId = `OT-2026-${Date.now().toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;
    const newPayload: Partial<OperativeCase> = {
      case_id: newCaseId,
      ot_room: "OT-04 (General & Laparoscopic Surgery)",
      hospital_name: "MIT-WPU Clinical Simulation & Research Hospital, Pune",
      patient_info: {
        name: "New Operative Patient",
        uhid: `#IN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        age: 35,
        gender: "Female",
        blood_group: "B+",
        allergies: [],
        asa_grade: "ASA I"
      },
      surgical_team: {
        lead_surgeon: "Dr. Aditi Deshmukh (MS Gen. Surgery)",
        anesthesiologist: "Dr. Vikram Kulkarni (MD Anesthesia)",
        scrub_nurse: "Sr. Sunita Pawar",
        circulating_nurse: "Nrs. Rohan Jadhav"
      },
      nabh_operative_note: {
        pre_op_diagnosis: "Awaiting intraoperative dictation...",
        post_op_diagnosis: "Awaiting intraoperative dictation...",
        procedure_title: "Pending Operative Dictation",
        surgical_approach: "Pending",
        anesthesia_type: "General Endotracheal Anesthesia (GETA)",
        incision_type: "Not logged",
        anatomical_findings: [],
        procedure_steps_logged: [],
        sutures_and_hemostasis: [],
        implants_registry: [],
        estimated_blood_loss_ml: 0,
        intra_op_fluids_ml: 500,
        urine_output_ml: 100,
        specimens_collected: [],
        complications: "Nil intraoperative complications",
        closure_details: "Pending closure",
        post_op_orders: []
      },
      who_safety_checklist: {
        sign_in_completed: true,
        time_out_completed: true,
        sign_out_completed: false,
        counts: {
          abdominal_sponges: { deployed: 5, recovered: 5, matched: true },
          raytec_gauze_swabs: { deployed: 10, recovered: 10, matched: true },
          suture_needles: { deployed: 4, recovered: 4, matched: true },
          instruments_verified: true
        },
        count_discrepancy_alert: false,
        discrepancy_notes: "Initial counts verified prior to skin incision."
      },
      vernacular_family_briefings: [],
      case_status: "IN_PROGRESS"
    };

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPayload)
      });
      const created = await res.json();
      setCases((prev) => [created, ...prev]);
      setSelectedCaseId(created.case_id);
      setCurrentCase(created);
      setLogs([]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#060A12] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-cyan-500 selection:text-black">
      {/* Zone A: Top Sterile Telemetry & MongoDB Compass Status Bar */}
      <TopTelemetryBar
        currentCase={currentCase}
        mongoHealth={mongoHealth}
        isRecording={false}
        onRefreshMongo={loadInitialData}
        onOpenCompassModal={() => setIsCompassModalOpen(true)}
        onOpenPastSurgeries={() => setIsPastSurgeriesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isSimulatedMode={isSimulatedMode}
        onToggleSimulatedMode={() => setIsSimulatedMode((prev) => !prev)}
      />

      {/* Main Single-Screen Zero-Scroll Surgical Bento Grid (Zones B, C, D) */}
      <main className="flex-1 p-3.5 max-w-[1920px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Zone B: Left Column — Ambient Audio Console & Diarized Feed (4 Cols) */}
        <section className="lg:col-span-4 flex flex-col gap-3.5 h-full">
          <SterileVoiceConsole
            logs={logs}
            isProcessing={isProcessing}
            onSendTranscript={handleSendTranscript}
            onSendAudioBlob={handleSendAudioBlob}
            sttModel={sttModel}
            sttMode={sttMode}
          />
        </section>

        {/* Zone C: Center Column — WHO Safety Matrix & NABH Operative Note (5 Cols) */}
        <section className="lg:col-span-5 flex flex-col gap-3.5 h-full">
          {currentCase && (
            <>
              <WhoSafetyChecklistCard
                checklist={currentCase.who_safety_checklist}
                onUpdateCount={handleUpdateCount}
                onTogglePhase={handleTogglePhase}
              />
              <NabhOperativeRecordCard
                note={currentCase.nabh_operative_note}
                isProcessing={isProcessing}
              />
            </>
          )}
        </section>

        {/* Zone D: Right Column — Bulbul Readback & Vernacular Briefing Studio (3 Cols) */}
        <section className="lg:col-span-3 flex flex-col gap-3.5 h-full">
          <BulbulReadbackStudio
            currentCase={currentCase}
            latestReadbackSentence={latestReadbackSentence}
            latestAudioBase64={latestAudioBase64}
            speaker={speaker}
            onSpeakerChange={setSpeaker}
            pace={pace}
            onPaceChange={setPace}
            autoPlay={autoPlay}
            onToggleAutoPlay={() => setAutoPlay((prev) => !prev)}
            onOpenCompassModal={() => setIsCompassModalOpen(true)}
          />
        </section>
      </main>

      {/* Modals & Inspection Drawers */}
      <MongoCompassInspectorModal
        isOpen={isCompassModalOpen}
        onClose={() => setIsCompassModalOpen(false)}
        currentCase={currentCase}
        logs={logs}
        mongoHealth={mongoHealth}
        onRefreshMongo={loadInitialData}
      />

      <PastSurgeriesModal
        isOpen={isPastSurgeriesOpen}
        onClose={() => setIsPastSurgeriesOpen(false)}
        cases={cases}
        selectedCaseId={selectedCaseId}
        onSelectCase={handleSelectCase}
        onNewCase={handleNewCase}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        sttModel={sttModel}
        onSttModelChange={setSttModel}
        sttMode={sttMode}
        onSttModeChange={setSttMode}
        ttsModel={ttsModel}
        onTtsModelChange={setTtsModel}
        isSimulatedMode={isSimulatedMode}
        onToggleSimulatedMode={() => setIsSimulatedMode((prev) => !prev)}
      />
    </div>
  );
}

export default App;

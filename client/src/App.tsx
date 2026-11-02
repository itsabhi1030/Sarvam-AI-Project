import React, { useState, useEffect, useCallback } from 'react';
import { 
  TopTelemetryBar 
} from './components/TopTelemetryBar';
import { 
  StageScenarioBar 
} from './components/StageScenarioBar';
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
  WalkthroughModal 
} from './components/WalkthroughModal';

import { 
  OperativeCase, 
  VoiceDictationLog, 
  MongoHealthStatus 
} from './types/clinical';
import { DemoScenario } from './constants/demoScenarios';
import { 
  fetchMongoHealth, 
  fetchAllCases, 
  fetchCaseDetails, 
  processVoiceInput, 
  updateSurgicalCounts
} from './services/api';

export function App() {
  const [cases, setCases] = useState<OperativeCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
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

  // Dynamic verification readback audio & text (loaded from MongoDB active case)
  const [latestReadbackSentence, setLatestReadbackSentence] = useState<string>('');
  const [latestAudioBase64, setLatestAudioBase64] = useState<string | undefined>();

  // Modals
  const [isCompassModalOpen, setIsCompassModalOpen] = useState(false);
  const [isPastSurgeriesOpen, setIsPastSurgeriesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);

  // Check if first-time user login for walkthrough tour
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('surgivoice_walkthrough_seen');
    if (!hasSeenTour) {
      setIsWalkthroughOpen(true);
    }
  }, []);

  const handleCloseWalkthrough = () => {
    setIsWalkthroughOpen(false);
    localStorage.setItem('surgivoice_walkthrough_seen', 'true');
  };

  // Load initial health & cases dynamically from MongoDB
  const loadInitialData = useCallback(async () => {
    try {
      const health = await fetchMongoHealth();
      setMongoHealth(health);

      const caseList = await fetchAllCases();
      setCases(caseList);

      if (caseList.length > 0) {
        // Pick selected case or first case from MongoDB
        const targetId = selectedCaseId && caseList.find(c => c.case_id === selectedCaseId)
          ? selectedCaseId
          : caseList[0].case_id;

        setSelectedCaseId(targetId);
        const details = await fetchCaseDetails(targetId);
        setCurrentCase(details.caseData);
        setLogs(details.logs || []);

        // Load latest readback dynamically from the last log if available
        if (details.logs && details.logs.length > 0) {
          const lastLog = details.logs[details.logs.length - 1];
          if (lastLog.ot_readback_sentence) {
            setLatestReadbackSentence(lastLog.ot_readback_sentence);
          }
          if (lastLog.audio_base64) {
            setLatestAudioBase64(lastLog.audio_base64);
          }
        } else {
          setLatestReadbackSentence('');
          setLatestAudioBase64(undefined);
        }
      }
    } catch (err) {
      console.warn('Initial load error:', err);
    }
  }, [selectedCaseId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

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
      } else {
        setLatestReadbackSentence('');
        setLatestAudioBase64(undefined);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendTranscript = async (transcript: string, _scenarioKey?: string) => {
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

  const handleNewCase = async () => {
    const timestamp = Date.now();
    const newCaseId = `OT-2026-${timestamp.toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;
    const newPayload: Partial<OperativeCase> = {
      case_id: newCaseId,
      ot_room: "OT-04 (General Surgery)",
      hospital_name: "MIT-WPU Clinical Simulation & Research Hospital, Pune",
      session_start_time: new Date().toISOString(),
      patient_info: {
        name: "New Operative Patient",
        uhid: `#IN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        age: 38,
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
        procedure_title: "Active Sterile Session",
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
        complications: "Nil",
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
          instruments_verified: true,
          instruments_tray_name: "Standard Sterile Lap Set",
          instruments_total: 28,
          instruments_accounted: 28
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
      setLatestReadbackSentence('');
      setLatestAudioBase64(undefined);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#060A14] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Top Telemetry Header */}
      <TopTelemetryBar
        currentCase={currentCase}
        mongoHealth={mongoHealth}
        isRecording={false}
        onRefreshMongo={loadInitialData}
        onOpenCompassModal={() => setIsCompassModalOpen(true)}
        onOpenPastSurgeries={() => setIsPastSurgeriesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
        isSimulatedMode={isSimulatedMode}
        onToggleSimulatedMode={() => setIsSimulatedMode((prev) => !prev)}
      />

      {/* Sleek Stage Scenario Injection Strip */}
      <StageScenarioBar
        isProcessing={isProcessing}
        onSelectScenario={(scenario: DemoScenario) => handleSendTranscript(scenario.spokenDictation, scenario.id)}
      />

      {/* Main Clinical Cockpit: 2 Balanced Columns */}
      <main className="flex-1 p-5 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Operative Record & WHO Safety (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
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
        </div>

        {/* Right: Voice Console, Readback & Family Briefing (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <SterileVoiceConsole
            logs={logs}
            isProcessing={isProcessing}
            onSendTranscript={handleSendTranscript}
            onSendAudioBlob={handleSendAudioBlob}
            sttModel={sttModel}
            sttMode={sttMode}
          />
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
        </div>
      </main>

      {/* Onboarding Interactive Walkthrough Modal */}
      <WalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={handleCloseWalkthrough}
      />

      {/* Modals */}
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

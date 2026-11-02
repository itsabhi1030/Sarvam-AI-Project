export interface PatientInfo {
  name: string;
  uhid: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  blood_group: string;
  allergies: string[];
  asa_grade: string;
}

export interface SurgicalTeam {
  lead_surgeon: string;
  anesthesiologist: string;
  scrub_nurse: string;
  circulating_nurse: string;
}

export interface SutureAndHemostasis {
  material: string;
  anatomical_target: string;
  technique: string;
}

export interface ImplantRegistryItem {
  implant_name: string;
  specification: string;
  serial_batch_code: string;
}

export interface SpecimenCollected {
  specimen_name: string;
  destination_lab: string;
  container_verified: boolean;
}

export interface ProcedureStep {
  step_number: number;
  description: string;
  timestamp: string;
}

export interface NabhOperativeNote {
  pre_op_diagnosis: string;
  post_op_diagnosis: string;
  procedure_title: string;
  surgical_approach: 'Open' | 'Laparoscopic' | 'Robotic' | 'Hybrid' | 'Pending';
  anesthesia_type: string;
  incision_type: string;
  anatomical_findings: string[];
  procedure_steps_logged: ProcedureStep[];
  sutures_and_hemostasis: SutureAndHemostasis[];
  implants_registry: ImplantRegistryItem[];
  estimated_blood_loss_ml: number;
  intra_op_fluids_ml: number;
  urine_output_ml: number;
  specimens_collected: SpecimenCollected[];
  complications: string;
  closure_details: string;
  post_op_orders: string[];
}

export interface CountCategory {
  deployed: number;
  recovered: number;
  matched: boolean;
}

export interface WhoSafetyChecklist {
  sign_in_completed: boolean;
  time_out_completed: boolean;
  sign_out_completed: boolean;
  counts: {
    abdominal_sponges: CountCategory;
    raytec_gauze_swabs: CountCategory;
    suture_needles: CountCategory;
    instruments_verified: boolean;
  };
  count_discrepancy_alert: boolean;
  discrepancy_notes: string;
}

export interface VernacularFamilyBriefing {
  language_code: string;
  language_label: string;
  native_script_text: string;
  english_back_translation: string;
  audio_base64?: string;
  generated_at?: string;
}

export interface OperativeCase {
  _id?: string;
  case_id: string;
  ot_room: string;
  hospital_name: string;
  patient_info: PatientInfo;
  surgical_team: SurgicalTeam;
  nabh_operative_note: NabhOperativeNote;
  who_safety_checklist: WhoSafetyChecklist;
  vernacular_family_briefings: VernacularFamilyBriefing[];
  case_status: 'IN_PROGRESS' | 'SAFETY_HOLD' | 'COMPLETED_SIGNED_OFF';
  createdAt?: string;
  updatedAt?: string;
}

export interface VoiceDictationLog {
  _id?: string;
  case_id: string;
  sequence_number: number;
  raw_transcript: string;
  detected_language: string;
  sarvam_stt_model: string;
  sarvam_llm_model: string;
  sarvam_tts_model: string;
  extracted_fields_delta?: any;
  ot_readback_sentence?: string;
  audio_base64?: string;
  safety_flag_raised: boolean;
  processing_latency_ms?: number;
  logged_at?: string;
}

export interface MongoHealthStatus {
  status: 'CONNECTED' | 'IN_MEMORY_FALLBACK';
  connected: boolean;
  uri: string;
  database: string;
  counts: {
    operative_cases: number;
    voice_dictation_logs: number;
    ot_equipment_and_suture_catalog: number;
  };
  totalDocuments: number;
  sarvamConfigured: boolean;
  timestamp: string;
}

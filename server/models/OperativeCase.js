import mongoose from 'mongoose';

const OperativeCaseSchema = new mongoose.Schema({
  case_id: { type: String, required: true, unique: true, index: true },
  ot_room: { type: String, default: "OT-04 (General & Laparoscopic Surgery)" },
  hospital_name: { type: String, default: "MIT-WPU Clinical Simulation & Research Hospital, Pune" },
  session_start_time: { type: Date, default: Date.now },
  patient_info: {
    name: { type: String, required: true },
    uhid: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    blood_group: { type: String, default: "O+" },
    allergies: [String],
    asa_grade: { type: String, default: "ASA II" }
  },
  surgical_team: {
    lead_surgeon: { type: String, default: "Dr. Aditi Deshmukh (MS Gen. Surgery)" },
    anesthesiologist: { type: String, default: "Dr. Vikram Kulkarni (MD Anesthesia)" },
    scrub_nurse: { type: String, default: "Sr. Sunita Pawar" },
    circulating_nurse: { type: String, default: "Nrs. Rohan Jadhav" }
  },
  nabh_operative_note: {
    pre_op_diagnosis: { type: String, default: "Pending dictation..." },
    post_op_diagnosis: { type: String, default: "Pending dictation..." },
    procedure_title: { type: String, default: "Unassigned Procedure" },
    surgical_approach: { type: String, enum: ["Open", "Laparoscopic", "Robotic", "Hybrid", "Pending"], default: "Pending" },
    anesthesia_type: { type: String, default: "General Endotracheal Anesthesia (GETA)" },
    incision_type: { type: String, default: "Not logged" },
    anatomical_findings: [String],
    procedure_steps_logged: [{
      step_number: Number,
      description: String,
      timestamp: { type: Date, default: Date.now }
    }],
    sutures_and_hemostasis: [{
      material: String,
      anatomical_target: String,
      technique: String
    }],
    implants_registry: [{
      implant_name: String,
      specification: String,
      serial_batch_code: String
    }],
    estimated_blood_loss_ml: { type: Number, default: 0 },
    intra_op_fluids_ml: { type: Number, default: 500 },
    urine_output_ml: { type: Number, default: 150 },
    specimens_collected: [{
      specimen_name: String,
      destination_lab: { type: String, default: "Histopathology" },
      container_verified: { type: Boolean, default: true }
    }],
    complications: { type: String, default: "Nil intraoperative complications" },
    closure_details: { type: String, default: "Pending closure" },
    post_op_orders: [String]
  },
  who_safety_checklist: {
    sign_in_completed: { type: Boolean, default: true },
    time_out_completed: { type: Boolean, default: true },
    sign_out_completed: { type: Boolean, default: false },
    counts: {
      abdominal_sponges: {
        deployed: { type: Number, default: 5 },
        recovered: { type: Number, default: 5 },
        matched: { type: Boolean, default: true }
      },
      raytec_gauze_swabs: {
        deployed: { type: Number, default: 10 },
        recovered: { type: Number, default: 10 },
        matched: { type: Boolean, default: true }
      },
      suture_needles: {
        deployed: { type: Number, default: 4 },
        recovered: { type: Number, default: 4 },
        matched: { type: Boolean, default: true }
      },
      instruments_verified: { type: Boolean, default: true },
      instruments_tray_name: { type: String, default: "Standard Lap Set" },
      instruments_total: { type: Number, default: 28 },
      instruments_accounted: { type: Number, default: 28 }
    },
    count_discrepancy_alert: { type: Boolean, default: false },
    discrepancy_notes: { type: String, default: "" }
  },
  vernacular_family_briefings: [{
    language_code: String,
    language_label: String,
    native_script_text: String,
    english_back_translation: String,
    audio_base64: String,
    generated_at: { type: Date, default: Date.now }
  }],
  case_status: {
    type: String,
    enum: ["IN_PROGRESS", "SAFETY_HOLD", "COMPLETED_SIGNED_OFF"],
    default: "IN_PROGRESS"
  }
}, { timestamps: true, collection: "operative_cases" });

export default mongoose.models.OperativeCase || mongoose.model('OperativeCase', OperativeCaseSchema);

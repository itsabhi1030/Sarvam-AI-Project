import mongoose from 'mongoose';

const OperativeCaseSchema = new mongoose.Schema({
  case_id: { type: String, required: true, unique: true, index: true }, // e.g., "OT-2026-1102-001"
  ot_room: { type: String, default: "OT-04 (General & Laparoscopic Surgery)" },
  hospital_name: { type: String, default: "MIT-WPU Clinical Simulation & Research Hospital, Pune" },
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
      material: String,       // e.g., "2-0 Vicryl", "1-0 Silk", "3-0 Prolene"
      anatomical_target: String, // e.g., "Mesoappendix", "Appendiceal Base", "Rectus Sheath"
      technique: String       // e.g., "Transfixation ligature", "Continuous interlocking"
    }],
    implants_registry: [{
      implant_name: String,   // e.g., "6-Hole Locking Compression Plate (LCP)"
      specification: String,  // e.g., "3.5mm Titanium, 4 Cortical + 2 Locking Screws"
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
      instruments_verified: { type: Boolean, default: true }
    },
    count_discrepancy_alert: { type: Boolean, default: false },
    discrepancy_notes: { type: String, default: "" }
  },
  vernacular_family_briefings: [{
    language_code: String,    // e.g., "mr-IN", "hi-IN"
    language_label: String,   // e.g., "Marathi", "Hindi"
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

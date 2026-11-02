import OperativeCase from '../models/OperativeCase.js';
import VoiceDictationLog from '../models/VoiceDictationLog.js';
import EquipmentCatalog from '../models/EquipmentCatalog.js';

export async function seedInitialDatabase() {
  console.log('[Seed Engine] Populating MongoDB with clinical showcase dataset...');

  // 1. Clear existing collections
  await OperativeCase.deleteMany({});
  await VoiceDictationLog.deleteMany({});
  await EquipmentCatalog.deleteMany({});

  // 2. Seed Equipment Catalog
  const catalogData = [
    {
      category: "SUTURE",
      code_name: "VICRYL-2-0-V397",
      display_label: "2-0 Coated VICRYL (Polyglactin 910)",
      description: "Absorbable synthetic braided suture with 36mm round-bodied needle",
      standard_counts_per_pack: 12,
      manufacturer_codes: ["ETHICON-W9120", "COVIDIEN-GL122"],
      tags: ["general_surgery", "mesoappendix", "soft_tissue"]
    },
    {
      category: "SUTURE",
      code_name: "SILK-1-0-S120",
      display_label: "1-0 MERSILK Braided Non-Absorbable",
      description: "Natural silk suture with heavy taper-cut needle for secure ligatures",
      standard_counts_per_pack: 12,
      manufacturer_codes: ["ETHICON-W587"],
      tags: ["appendiceal_base", "hemostasis"]
    },
    {
      category: "SUTURE",
      code_name: "PROLENE-2-0-P868",
      display_label: "2-0 PROLENE (Polypropylene) Monofilament",
      description: "Non-absorbable monofilament for fascia and subcuticular skin closure",
      standard_counts_per_pack: 12,
      manufacturer_codes: ["ETHICON-W8725"],
      tags: ["skin_closure", "hernia"]
    },
    {
      category: "SUTURE",
      code_name: "MONOCRYL-3-0-M304",
      display_label: "3-0 MONOCRYL (Poliglecaprone 25)",
      description: "Rapidly absorbable cosmetic monofilament for plastic and subcuticular closure",
      standard_counts_per_pack: 12,
      manufacturer_codes: ["ETHICON-W3207"],
      tags: ["plastics", "subcuticular"]
    },
    {
      category: "IMPLANT",
      code_name: "LCP-DISTAL-RADIUS-6H-TI",
      display_label: "6-Hole Volar Distal Radius 3.5mm Titanium LCP",
      description: "Anatomically contoured locking compression plate for intra-articular fractures",
      standard_counts_per_pack: 1,
      manufacturer_codes: ["STRYKER-STRY-TI-2026-884", "SYNTHES-242.492"],
      tags: ["orthopedics", "trauma", "wrist"]
    },
    {
      category: "SPONGE",
      code_name: "MOP-ABDOMINAL-RAYTEC",
      display_label: "X-Ray Detectable Abdominal Cotton Mop (30cm x 30cm)",
      description: "Heavy woven lap sponge with radiopaque barium sulfate blue filament",
      standard_counts_per_pack: 5,
      manufacturer_codes: ["SURGICOT-IN-88"],
      tags: ["laparotomy", "sponge_count", "who_safety"]
    }
  ];
  await EquipmentCatalog.insertMany(catalogData);

  // 3. Seed Case 1: Active General Surgery Appendectomy
  const case1 = await OperativeCase.create({
    case_id: "OT-2026-1102-001",
    ot_room: "OT-04 (General & Laparoscopic Surgery)",
    hospital_name: "MIT-WPU Clinical Simulation & Research Hospital, Pune",
    patient_info: {
      name: "Rajesh Sharma",
      uhid: "#IN-2026-8841",
      age: 46,
      gender: "Male",
      blood_group: "O+",
      allergies: ["Penicillin", "Sulfa drugs"],
      asa_grade: "ASA II"
    },
    surgical_team: {
      lead_surgeon: "Dr. Aditi Deshmukh (MS Gen. Surgery)",
      anesthesiologist: "Dr. Vikram Kulkarni (MD Anesthesia)",
      scrub_nurse: "Sr. Sunita Pawar",
      circulating_nurse: "Nrs. Rohan Jadhav"
    },
    nabh_operative_note: {
      pre_op_diagnosis: "Acute Appendicitis with localized peritonitis",
      post_op_diagnosis: "Acute Retrocecal Gangrenous Appendicitis",
      procedure_title: "Emergency Open Appendectomy",
      surgical_approach: "Open",
      anesthesia_type: "General Endotracheal Anesthesia (GETA)",
      incision_type: "McBurney's Gridiron Incision (Right Iliac Fossa)",
      anatomical_findings: [
        "Retrocecal appendix, 8cm long, tip overtly gangrenous",
        "Healthy caecal base without friability",
        "Clear reactionary peritoneal fluid (approx 20 ml)",
        "No evidence of generalized purulent perforation"
      ],
      procedure_steps_logged: [
        { step_number: 1, description: "McBurney incision deepened through external oblique aponeurosis" },
        { step_number: 2, description: "Retrocecal mesoappendix mobilized; gangrenous appendix identified" },
        { step_number: 3, description: "Mesoappendix serially ligated using 2-0 Vicryl" },
        { step_number: 4, description: "Appendiceal base crushed and transfixed with 1-0 Silk" }
      ],
      sutures_and_hemostasis: [
        { material: "2-0 Vicryl", anatomical_target: "Mesoappendix", technique: "Serial transfixation ligation" },
        { material: "1-0 Silk", anatomical_target: "Appendiceal Base", technique: "Crushed and transfixed" },
        { material: "2-0 Prolene", anatomical_target: "External Oblique & Skin", technique: "Interrupted closure" }
      ],
      implants_registry: [],
      estimated_blood_loss_ml: 60,
      intra_op_fluids_ml: 750,
      urine_output_ml: 180,
      specimens_collected: [
        { specimen_name: "Excised Gangrenous Appendix", destination_lab: "Histopathology", container_verified: true }
      ],
      complications: "Nil intraoperative complications",
      closure_details: "Layered closure with 2-0 Vicryl for peritoneum and internal oblique, 2-0 Prolene for skin",
      post_op_orders: ["IV Ceftriaxone + Metronidazole q12h", "NPO until bowel sounds return", "Vitals monitoring q1h"]
    },
    who_safety_checklist: {
      sign_in_completed: true,
      time_out_completed: true,
      sign_out_completed: true,
      counts: {
        abdominal_sponges: { deployed: 5, recovered: 5, matched: true },
        raytec_gauze_swabs: { deployed: 10, recovered: 10, matched: true },
        suture_needles: { deployed: 4, recovered: 4, matched: true },
        instruments_verified: true
      },
      count_discrepancy_alert: false,
      discrepancy_notes: "All 5 mops, 10 swabs, and 4 needles accounted for. Safe to close."
    },
    vernacular_family_briefings: [
      {
        language_code: "mr-IN",
        language_label: "Marathi",
        native_script_text: "नमस्कार, राजेश शर्मा यांची अपेंडिक्सची शस्त्रक्रिया यशस्वीरीत्या पूर्ण झाली आहे. खराब झालेला अपेंडिक्स सुरक्षितपणे काढण्यात आला असून टाके व्यवस्थित पडले आहेत. रक्तस्राव अतिशय कमी झाला आहे आणि त्यांची प्रकृती पूर्णपणे स्थिर आहे. पुढील एक तासात त्यांना रिकव्हरी रूममधून वॉर्डमध्ये हलवले जाईल.",
        english_back_translation: "Hello, Rajesh Sharma's appendix surgery has been completed successfully. The inflamed appendix was safely removed and stitches were placed properly. Blood loss was minimal and his condition is completely stable. In the next hour, he will be shifted to the recovery ward."
      },
      {
        language_code: "hi-IN",
        language_label: "Hindi",
        native_script_text: "नमस्कार, राजेश शर्मा का अपेंडिक्स का ऑपरेशन सफलतापूर्वक पूरा हो गया है। संक्रमित अपेंडिक्स को सुरक्षित रूप से निकाल दिया गया है और सभी सुरक्षा जांच पूरी हो चुकी हैं। मरीज की स्थिति बिल्कुल स्थिर है और उन्हें जल्द ही रिकवरी वार्ड में शिफ्ट किया जाएगा।",
        english_back_translation: "Hello, Rajesh Sharma's appendix operation has been successfully completed. The infected appendix was safely removed and all safety checks are complete. The patient's condition is completely stable and he will soon be moved to the recovery ward."
      }
    ],
    case_status: "IN_PROGRESS"
  });

  // Voice Audit Logs for Case 1
  await VoiceDictationLog.create([
    {
      case_id: "OT-2026-1102-001",
      sequence_number: 1,
      raw_transcript: "Start operative note. Emergency appendectomy for acute appendicitis. McBurney's gridiron incision taken in right iliac fossa.",
      detected_language: "codemix (hi-IN / en-IN)",
      sarvam_stt_model: "saaras:v4",
      sarvam_llm_model: "sarvam-105b",
      sarvam_tts_model: "bulbul:v3",
      extracted_fields_delta: {
        procedure_title: "Emergency Open Appendectomy",
        incision_type: "McBurney's Gridiron Incision (Right Iliac Fossa)"
      },
      ot_readback_sentence: "Operative note initiated. Emergency appendectomy via McBurney's incision logged.",
      safety_flag_raised: false,
      processing_latency_ms: 480
    },
    {
      case_id: "OT-2026-1102-001",
      sequence_number: 2,
      raw_transcript: "Appendix retrocecal aur gangrenous mila near the tip. Mesoappendix ko 2-0 Vicryl se serially ligate kiya. Base crushed and transfixed with 1-0 Silk. Hemostasis bilkul secure hai.",
      detected_language: "codemix (hi-IN / en-IN)",
      sarvam_stt_model: "saaras:v4",
      sarvam_llm_model: "sarvam-105b",
      sarvam_tts_model: "bulbul:v3",
      extracted_fields_delta: {
        anatomical_findings: ["Retrocecal appendix", "Gangrenous tip"],
        sutures: ["2-0 Vicryl", "1-0 Silk"]
      },
      ot_readback_sentence: "Operative findings logged. Retrocecal gangrenous appendix ligated with 2-0 Vicryl and 1-0 Silk.",
      safety_flag_raised: false,
      processing_latency_ms: 512
    },
    {
      case_id: "OT-2026-1102-001",
      sequence_number: 3,
      raw_transcript: "Scrub nurse ne 5 abdominal sponges aur 10 gauze swabs dono match verify kiye. Estimated blood loss around 60 ml. Specimen sent for histopathology. Abdomen closed in layers with 2-0 Prolene.",
      detected_language: "codemix (hi-IN / en-IN)",
      sarvam_stt_model: "saaras:v4",
      sarvam_llm_model: "sarvam-105b",
      sarvam_tts_model: "bulbul:v3",
      extracted_fields_delta: {
        estimated_blood_loss_ml: 60,
        who_counts_matched: true
      },
      ot_readback_sentence: "Five sponges and ten swabs verified matched. Estimated blood loss 60 milliliters. Counts confirmed.",
      safety_flag_raised: false,
      processing_latency_ms: 460
    }
  ]);

  // 4. Seed Case 2: Completed Orthopedic Trauma ORIF
  await OperativeCase.create({
    case_id: "OT-2026-1102-002",
    ot_room: "OT-02 (Orthopedics & Joint Replacement)",
    hospital_name: "MIT-WPU Clinical Simulation & Research Hospital, Pune",
    patient_info: {
      name: "Suresh Patil",
      uhid: "#IN-2026-7914",
      age: 52,
      gender: "Male",
      blood_group: "B+",
      allergies: [],
      asa_grade: "ASA I"
    },
    surgical_team: {
      lead_surgeon: "Dr. Milind Joshi (MS Ortho)",
      anesthesiologist: "Dr. Neha Shah (DA Anesthesia)",
      scrub_nurse: "Sr. Kavita More",
      circulating_nurse: "Nrs. Vinayak Shinde"
    },
    nabh_operative_note: {
      pre_op_diagnosis: "Displaced Intra-Articular Fracture Right Distal Radius (AO Type C2)",
      post_op_diagnosis: "Anatomically Reduced Right Distal Radius with LCP Osteosynthesis",
      procedure_title: "Open Reduction and Internal Fixation (ORIF) — Right Distal Radius Fracture",
      surgical_approach: "Open",
      anesthesia_type: "Brachial Plexus Block with Propofol Sedation",
      incision_type: "Modified Henry Volar Approach",
      anatomical_findings: [
        "Comminuted volar articular fragment accurately mobilized",
        "Subchondral bone void filled; radial inclination restored to 22 degrees",
        "Volar tilt restored to 11 degrees on C-arm fluoroscopy"
      ],
      procedure_steps_logged: [
        { step_number: 1, description: "Longitudinal incision over FCR tendon; tendon retracted ulnarward" },
        { step_number: 2, description: "Pronator quadratus L-shaped release from radial border" },
        { step_number: 3, description: "Fracture reduced under direct vision and pinned with 1.5mm K-wires" },
        { step_number: 4, description: "6-hole Titanium Volar LCP contoured and fixed with locking screws" }
      ],
      sutures_and_hemostasis: [
        { material: "3-0 Vicryl", anatomical_target: "Pronator Quadratus", technique: "Interrupted" },
        { material: "3-0 Monocryl", anatomical_target: "Subcuticular Skin", technique: "Continuous" }
      ],
      implants_registry: [
        {
          implant_name: "6-Hole Volar Distal Radius Locking Compression Plate (LCP)",
          specification: "3.5mm Titanium — 4 Cortical + 2 Distal Locking Screws",
          serial_batch_code: "STRY-TI-2026-884"
        }
      ],
      estimated_blood_loss_ml: 90,
      intra_op_fluids_ml: 500,
      urine_output_ml: 100,
      specimens_collected: [],
      complications: "Nil intraoperative complications",
      closure_details: "Pronator quadratus repaired over plate; subcuticular closure",
      post_op_orders: ["Below-elbow POP slab for 2 weeks", "Active finger mobilization", "Analgesics SOS"]
    },
    who_safety_checklist: {
      sign_in_completed: true,
      time_out_completed: true,
      sign_out_completed: true,
      counts: {
        abdominal_sponges: { deployed: 0, recovered: 0, matched: true },
        raytec_gauze_swabs: { deployed: 10, recovered: 10, matched: true },
        suture_needles: { deployed: 4, recovered: 4, matched: true },
        instruments_verified: true
      },
      count_discrepancy_alert: false,
      discrepancy_notes: "C-arm fluoroscopy confirmed no retained radio-dense bodies."
    },
    vernacular_family_briefings: [
      {
        language_code: "mr-IN",
        language_label: "Marathi",
        native_script_text: "नमस्कार, सुरेश पाटील यांच्या हाताच्या मनगटाचे हाड बसवण्याचे ऑपरेशन यशस्वी झाले आहे. टायटॅनियम प्लेट आणि स्क्रू बसवून हाड व्यवस्थित जोडले आहे. एक्स-रे मध्ये स्थिती उत्तम दिसत असून रुग्ण सुरक्षित आहे.",
        english_back_translation: "Hello, Suresh Patil's wrist fracture fixation surgery has been successful. The bone was aligned with a titanium plate and screws. Condition on X-ray is excellent and the patient is safe."
      }
    ],
    case_status: "COMPLETED_SIGNED_OFF"
  });

  // 5. Seed Case 3: Emergency Obstetrics LSCS
  await OperativeCase.create({
    case_id: "OT-2026-1102-003",
    ot_room: "OT-01 (Maternity & Emergency Obstetrics)",
    hospital_name: "MIT-WPU Clinical Simulation & Research Hospital, Pune",
    patient_info: {
      name: "Pooja Deshmukh",
      uhid: "#IN-2026-9042",
      age: 28,
      gender: "Female",
      blood_group: "A+",
      allergies: [],
      asa_grade: "ASA IIE"
    },
    surgical_team: {
      lead_surgeon: "Dr. Shalini Rao (MD OBGYN)",
      anesthesiologist: "Dr. Vikram Kulkarni (MD Anesthesia)",
      scrub_nurse: "Sr. Meena Gaikwad",
      circulating_nurse: "Nrs. Deepali Bapat"
    },
    nabh_operative_note: {
      pre_op_diagnosis: "G2P1L1 with Previous LSCS at 38+4 weeks in labor with fetal distress",
      post_op_diagnosis: "Emergency Repeat LSCS delivering live healthy baby girl",
      procedure_title: "Emergency Lower Segment Caesarean Section (LSCS)",
      surgical_approach: "Open",
      anesthesia_type: "Spinal Anesthesia (Subarachnoid Block)",
      incision_type: "Pfannenstiel Transverse Suprapubic Incision",
      anatomical_findings: [
        "Live female baby delivered at 11:42 AM, APGAR 9/10 at 1 and 5 minutes",
        "Baby weight: 3.10 kg, vigorous cry",
        "Placenta fundal posterior, delivered intact with complete membranes",
        "Uterus contracted well following 10 IU Oxytocin IV + 10 IU infusion"
      ],
      procedure_steps_logged: [
        { step_number: 1, description: "Pfannenstiel incision made through previous scar" },
        { step_number: 2, description: "Uterovesical peritoneum reflected; lower uterine segment incised" },
        { step_number: 3, description: "Baby delivered by vertex; cord clamped and cut" },
        { step_number: 4, description: "Uterine incision closed in double layer with 1-0 Vicryl" }
      ],
      sutures_and_hemostasis: [
        { material: "1-0 Vicryl", anatomical_target: "Uterine Musculature", technique: "Double layer continuous locked" },
        { material: "2-0 Vicryl", anatomical_target: "Rectus Sheath", technique: "Continuous" },
        { material: "3-0 Monocryl", anatomical_target: "Skin", technique: "Subcuticular" }
      ],
      implants_registry: [],
      estimated_blood_loss_ml: 320,
      intra_op_fluids_ml: 1200,
      urine_output_ml: 350,
      specimens_collected: [],
      complications: "Nil intraoperative complications",
      closure_details: "Double layer uterine closure; rectus sheath closed with 2-0 Vicryl; subcuticular skin closure",
      post_op_orders: ["Oxytocin infusion 20 IU in 500ml Ringer Lactate", "Initiate breast feeding within 1 hour", "Vitals monitoring"]
    },
    who_safety_checklist: {
      sign_in_completed: true,
      time_out_completed: true,
      sign_out_completed: true,
      counts: {
        abdominal_sponges: { deployed: 5, recovered: 5, matched: true },
        raytec_gauze_swabs: { deployed: 15, recovered: 15, matched: true },
        suture_needles: { deployed: 6, recovered: 6, matched: true },
        instruments_verified: true
      },
      count_discrepancy_alert: false,
      discrepancy_notes: "All 5 lap sponges and 15 swabs accounted for before uterine exteriorization and peritoneal closure."
    },
    vernacular_family_briefings: [
      {
        language_code: "mr-IN",
        language_label: "Marathi",
        native_script_text: "आनंदाची बातमी! पूजा देशमुख यांचे सिझेरियन ऑपरेशन यशस्वी झाले असून त्यांना निरोगी कन्यारत्न प्राप्त झाले आहे. बाळ आणि आई दोघेही सुखरूप आणि उत्तम प्रकृतीत आहेत. लवकरच त्यांना वॉर्डमध्ये हलवण्यात येईल.",
        english_back_translation: "Joyful news! Pooja Deshmukh's caesarean section was successful and she has delivered a healthy baby girl. Both mother and child are safe and in excellent health. They will be shifted to the ward shortly."
      }
    ],
    case_status: "COMPLETED_SIGNED_OFF"
  });

  console.log('[Seed Engine] Successfully created 3 realistic surgical cases, 3 voice audit logs, and 6 catalog items.');
}

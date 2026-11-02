export interface DemoScenario {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  specialty: string;
  language: string;
  spokenDictation: string;
  description: string;
  isAlert?: boolean;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'scenario_appendectomy',
    badge: 'Scenario 1 • Hinglish',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    title: 'Emergency Open Appendectomy',
    specialty: 'General & Laparoscopic Surgery',
    language: 'Code-Mixed Hinglish (hi-IN / en-IN)',
    description: "McBurney's incision, retrocecal gangrenous appendix, 2-0 Vicryl ligation, 1-0 Silk, 5/5 sponges, 60ml blood loss.",
    spokenDictation: "Start operative note. Emergency appendectomy for acute appendicitis. McBurney's gridiron incision taken in right iliac fossa. Appendix retrocecal aur gangrenous mila near the tip. Mesoappendix ko 2-0 Vicryl se serially ligate kiya. Base crushed and transfixed with 1-0 Silk. Hemostasis bilkul secure hai. Scrub nurse ne 5 abdominal sponges aur 10 gauze swabs dono match verify kiye. Estimated blood loss around 60 ml. Specimen sent for histopathology. Abdomen closed in layers with 2-0 Prolene skin sutures."
  },
  {
    id: 'scenario_ortho_orif',
    badge: 'Scenario 2 • Marathi-Eng',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    title: 'Distal Radius Fracture ORIF',
    specialty: 'Orthopedic Trauma Surgery',
    language: 'Code-Mixed Marathi-English (mr-IN / en-IN)',
    description: "Modified Henry approach, 6-hole Titanium LCP, C-arm fluoroscopy verification, 90ml blood loss.",
    spokenDictation: "Orthopedic trauma note. Right distal radius intra-articular fracture ORIF. Modified Henry volar approach ghetla. Pronator quadratus reflect kela. Fracture fragments reduce karun 6-hole Titanium Locking Compression Plate apply keli with four cortical screws and two distal locking screws. C-arm fluoroscopy var articular congruity aani screw length barobar aahe. Swab count 10 out of 10 matched, needles 4 out of 4 matched. Blood loss 90 ml. Below-elbow POP splint dilay."
  },
  {
    id: 'scenario_sponge_mismatch',
    badge: 'Scenario 3 • WHO RED ALERT',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse',
    title: 'Missing Abdominal Sponge Lockout',
    specialty: 'Clinical Safety & WHO Checklist',
    language: 'Emergency Hindi/English (hi-IN / en-IN)',
    description: 'CRITICAL: 10 sponges deployed, 9 recovered. One missing. Peritoneal closure locked. Triggers urgent audible Bulbul readback.',
    isAlert: true,
    spokenDictation: "Sign-out check before peritoneal closure. 10 abdominal sponges deploy kiye the, table par 9 sponges recover hue hain. Ek abdominal mop abhi tak missing hai. Fascia closure hold karo aur C-arm X-ray call karo."
  },
  {
    id: 'scenario_emergency_lscs',
    badge: 'Scenario 4 • Obstetrics',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    title: 'Emergency Repeat LSCS',
    specialty: 'Obstetrics & Gynecology',
    language: 'Clinical English & Vernacular Briefing',
    description: 'Pfannenstiel incision, baby delivered, APGAR 9/10, uterine double-layer closure, post-op family briefing in Marathi/Hindi.',
    spokenDictation: "Emergency repeat LSCS completed. Pfannenstiel scar excised. Live healthy baby delivered, crying vigorously, APGAR 9 out of 10 at 1 and 5 minutes. Uterus closed in two layers with 1-0 Vicryl. All 5 lap sponges and 15 swabs verified matched. Blood loss 350 ml. Safe for recovery."
  }
];

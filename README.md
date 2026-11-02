# SurgiVoice Indic — Sterile Hands-Free OT Operative Logger & Clinical Safety Platform
> **Target Event:** Sarvam Campus '26 Build-Along Showcase  
> **Tech Stack:** React 19 (Vite + TypeScript) + Tailwind CSS + Framer Motion + Lucide Icons | Node.js + Express + Mongoose | Local MongoDB Compass (`mongodb://127.0.0.1:27017/surgivoice_indic`) | Sarvam AI 2026 Stack (`saaras:v4` / `saaras:v3`, `sarvam-105b`, `bulbul:v3` / `bulbul:v4-flash`)

---

## 1. Executive Summary & Clinical Problem

In Indian government and private hospital Operation Theatres (OTs), surgeons work in fully scrubbed, sterile environments. Touching a keyboard, mouse, or touchscreen breaks surgical sterility. Consequently:
1. **Critical intraoperative details** (sponge/swab counts, suture material codes, implant serial numbers, estimated blood loss, anatomical findings) are scribbled on paper chits by circulating nurses or typed hours later from memory by exhausted surgical residents.
2. **Global speech-to-text engines fail** inside Indian OTs because surgeons speak rapid, code-mixed Indian English blended with Hindi/Marathi/regional phrases and dense clinical nomenclature (e.g., *"McBurney's incision taken, appendix retrocecal and gangrenous, mesoappendix 2-0 Vicryl se tie kiya, swab count matched, 80 ml blood loss"*).
3. **Patient families waiting outside the OT** often do not understand dense English surgical discharge summaries and require clear, empathetic post-op briefings in their native language (Hindi, Marathi, Tamil, Telugu, Kannada, Gujarati).

---

## 2. Solution Architecture

**SurgiVoice Indic** is a zero-touch, sterile-grade Operation Theatre Voice Cockpit:
1. **Ambient Sterile Audio Console:** Captures real-time or chunked surgical voice dictations (with spacebar hands-free push-to-talk and 60fps audio waveform visualizer).
2. **Sarvam Saaras STT (`saaras:v4` / `saaras:v3` in `codemix` mode):** High-accuracy transcription of fast, code-mixed Indian clinical speech.
3. **Sarvam-105B Flagship Clinical LLM:** Parses unstructured dictations into structured **NABH (National Accreditation Board for Hospitals)** records & **WHO Surgical Safety Checklist** counts.
4. **Sarvam Bulbul TTS (`bulbul:v3` / `bulbul:v4-flash`):** Delivers audible closed-loop clinical readbacks over OT Bluetooth speakers so the surgeon hears verbal verification without looking away from the surgical field.
5. **Vernacular Patient Family Audio Briefing:** Generates native script summaries (Marathi, Hindi, Tamil, Telugu, Kannada, Gujarati) and synthesizes empathetic native speech for anxious relatives outside the OT.
6. **Local MongoDB Database (`mongodb://127.0.0.1:27017/surgivoice_indic`):** Live audit trails persisted into 3 collections (`operative_cases`, `voice_dictation_logs`, `ot_equipment_and_suture_catalog`) ready for live inspection in **MongoDB Compass**.

---

## 3. MongoDB Compass Quickstart Guide

1. **Connect MongoDB Compass:** Open **MongoDB Compass** on your laptop, paste the connection URI below, and click **Connect**:
   ```
   mongodb://127.0.0.1:27017/surgivoice_indic
   ```
2. **Pre-Seed Before the Pitch:** Click the **"Seed DB"** button in the top telemetry bar of the UI (or hit `POST http://localhost:5000/api/seed`). This instantly populates `surgivoice_indic` with 3 realistic hospital cases (General Surgery Appendectomy, Orthopedic Trauma ORIF, and Obstetrics LSCS) plus audit logs and suture catalog items.
3. **Side-by-Side Stage Demo Trick:**
   - Position your web browser on **75% of your screen** and **MongoDB Compass on the remaining 25%**.
   - Dictate or click any of the 4 One-Click Scenario Injectors.
   - Hit **Refresh** inside MongoDB Compass to show judges the structured NABH JSON and voice telemetry written to disk in real time.

---

## 4. Pre-Built Stage Demo Scenarios

The console includes 4 deterministic showcase scenarios:
- **Scenario 1 (General Surgery - Hinglish):** Acute Retrocecal Appendectomy with 2-0 Vicryl ligation, 1-0 Silk transfixation, 5/5 matched sponges, and 60ml blood loss.
- **Scenario 2 (Orthopedics - Code-Mixed Marathi/English):** Right Distal Radius ORIF with 6-hole Titanium LCP plate and C-arm fluoroscopy confirmation.
- **Scenario 3 (CRITICAL WHO SAFETY ALERT - Sponge Mismatch):** 10 sponges deployed, 9 recovered, 1 missing. Triggers flashing **Red Lockout**, halts closure, and synthesizes urgent audible warning via Bulbul TTS.
- **Scenario 4 (Obstetrics - Emergency LSCS):** Repeat LSCS with live infant delivered (APGAR 9/10) and post-op vernacular family briefings in native Devanagari script.

---

## 5. Local Setup & Execution

### Prerequisites
- Node.js v18+ or v20+
- Local MongoDB running on default port `27017`
- Sarvam AI API Key (from [indus.sarvam.ai](https://indus.sarvam.ai))

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/itsabhi1030/Sarvam-AI-Project.git
cd Sarvam-AI-Project

# 2. Configure environment variables
# Copy .env.example to .env and insert your SARVAM_API_KEY
cp .env.example .env

# 3. Install backend & frontend dependencies
cd server && npm install
cd ../client && npm install
cd ..

# 4. Run full-stack application (Concurrently runs server on :5000 and client on :5173)
npm run dev
```

Open your browser at **http://localhost:5173**.

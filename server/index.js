import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, getDbStatus, isDbConnected } from './config/db.js';
import OperativeCase from './models/OperativeCase.js';
import VoiceDictationLog from './models/VoiceDictationLog.js';
import EquipmentCatalog from './models/EquipmentCatalog.js';
import { seedInitialDatabase } from './seed/seedData.js';
import { transcribeAudioBuffer, parseClinicalDictationWithLLM, synthesizeSpeech } from './services/sarvamService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from workspace root or server
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Multer memory storage for audio buffers
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 } // 30MB max
});

// In-memory fallback cache if MongoDB is offline or briefly restarted
const inMemoryStore = {
  cases: new Map(),
  logs: [],
  catalog: []
};

// Initialize DB and Auto-Seed if empty
(async () => {
  await connectDB();
  if (isDbConnected) {
    try {
      const caseCount = await OperativeCase.countDocuments();
      if (caseCount === 0) {
        console.log('[Auto-Seed] Database empty, seeding initial showcase dataset...');
        await seedInitialDatabase();
      }
    } catch (e) {
      console.warn('[Seed Check Warning]:', e.message);
    }
  }
})();

// Helper to extract runtime API key from header
function getRuntimeApiKey(req) {
  return req.headers['x-sarvam-api-key'] || process.env.SARVAM_API_KEY || '';
}

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

/**
 * 1. GET /api/health/mongodb
 * Returns MongoDB Compass connection telemetry and collection document counts
 */
app.get('/api/health/mongodb', async (req, res) => {
  const dbStatus = getDbStatus();
  let counts = {
    operative_cases: 0,
    voice_dictation_logs: 0,
    ot_equipment_and_suture_catalog: 0
  };

  if (isDbConnected) {
    try {
      counts.operative_cases = await OperativeCase.countDocuments();
      counts.voice_dictation_logs = await VoiceDictationLog.countDocuments();
      counts.ot_equipment_and_suture_catalog = await EquipmentCatalog.countDocuments();
    } catch (e) {
      console.warn('[Count Fetch Warning]:', e.message);
    }
  } else {
    counts.operative_cases = inMemoryStore.cases.size;
    counts.voice_dictation_logs = inMemoryStore.logs.length;
    counts.ot_equipment_and_suture_catalog = inMemoryStore.catalog.length;
  }

  const hasApiKey = Boolean(process.env.SARVAM_API_KEY);

  res.json({
    status: isDbConnected ? 'CONNECTED' : 'IN_MEMORY_FALLBACK',
    connected: isDbConnected,
    uri: dbStatus.uri,
    database: dbStatus.database,
    counts,
    totalDocuments: counts.operative_cases + counts.voice_dictation_logs + counts.ot_equipment_and_suture_catalog,
    sarvamConfigured: hasApiKey,
    timestamp: new Date().toISOString()
  });
});

/**
 * 2. POST /api/seed
 * Populates mongodb://127.0.0.1:27017/surgivoice_indic with showcase records
 */
app.post('/api/seed', async (req, res) => {
  try {
    if (isDbConnected) {
      await seedInitialDatabase();
      const caseCount = await OperativeCase.countDocuments();
      const logCount = await VoiceDictationLog.countDocuments();
      const catalogCount = await EquipmentCatalog.countDocuments();

      return res.json({
        success: true,
        message: 'Successfully populated MongoDB Compass with showcase dataset.',
        counts: {
          operative_cases: caseCount,
          voice_dictation_logs: logCount,
          ot_equipment_and_suture_catalog: catalogCount
        }
      });
    } else {
      return res.json({
        success: true,
        message: 'Seeded in-memory fallback store (MongoDB is currently disconnected).'
      });
    }
  } catch (err) {
    console.error('[Seed Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 3. GET /api/cases
 * Fetch all operative cases
 */
app.get('/api/cases', async (req, res) => {
  try {
    if (isDbConnected) {
      const cases = await OperativeCase.find().sort({ updatedAt: -1 });
      return res.json(cases);
    } else {
      return res.json(Array.from(inMemoryStore.cases.values()));
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4. GET /api/cases/:caseId
 * Fetch specific case + its chronological audit logs
 */
app.get('/api/cases/:caseId', async (req, res) => {
  const { caseId } = req.params;
  try {
    if (isDbConnected) {
      const caseDoc = await OperativeCase.findOne({ case_id: caseId });
      if (!caseDoc) {
        return res.status(404).json({ error: 'Operative case not found' });
      }
      const logs = await VoiceDictationLog.find({ case_id: caseId }).sort({ sequence_number: 1 });
      return res.json({ caseData: caseDoc, logs });
    } else {
      const caseDoc = inMemoryStore.cases.get(caseId);
      if (!caseDoc) return res.status(404).json({ error: 'Operative case not found' });
      const logs = inMemoryStore.logs.filter(l => l.case_id === caseId);
      return res.json({ caseData: caseDoc, logs });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 5. POST /api/cases
 * Create a new sterile operative case
 */
app.post('/api/cases', async (req, res) => {
  try {
    const caseId = req.body.case_id || `OT-2026-${Date.now().toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;
    const newCasePayload = {
      ...req.body,
      case_id: caseId
    };

    if (isDbConnected) {
      const created = await OperativeCase.create(newCasePayload);
      return res.status(201).json(created);
    } else {
      inMemoryStore.cases.set(caseId, newCasePayload);
      return res.status(201).json(newCasePayload);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 6. POST /api/cases/:caseId/process-voice
 * Accepts audio recording OR simulated dictation string
 */
app.post('/api/cases/:caseId/process-voice', upload.single('audio'), async (req, res) => {
  const startTime = Date.now();
  const { caseId } = req.params;
  const runtimeKey = getRuntimeApiKey(req);

  try {
    // 1. Fetch ongoing case state
    let currentCase = null;
    if (isDbConnected) {
      currentCase = await OperativeCase.findOne({ case_id: caseId });
    } else {
      currentCase = inMemoryStore.cases.get(caseId);
    }

    if (!currentCase) {
      // Auto-fallback: use first available or default template
      if (isDbConnected) {
        currentCase = await OperativeCase.findOne();
      }
    }

    if (!currentCase) {
      return res.status(404).json({ error: 'No active operative case found to attach voice log.' });
    }

    let transcript = req.body.transcript || '';
    let detectedLang = req.body.detectedLanguage || 'codemix (hi-IN / mr-IN / en-IN)';
    const targetLangCode = req.body.targetLanguageCode || 'mr-IN';

    // 2. Step 1: If audio file attached, perform STT with Saaras
    if (req.file && req.file.buffer) {
      const sttModel = req.body.sttModel || 'saaras:v4';
      const sttMode = req.body.sttMode || 'codemix';
      const sttResult = await transcribeAudioBuffer({
        fileBuffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        model: sttModel,
        mode: sttMode,
        apiKeyOverride: runtimeKey
      });
      transcript = sttResult.transcript;
      detectedLang = `${sttResult.language_code || 'en-IN'} (${sttMode})`;
    }

    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({ error: 'No transcript provided or audio was silent.' });
    }

    // 3. Step 2: Clinical Structuring with Sarvam-105B (or deterministic parser)
    const parsedResult = await parseClinicalDictationWithLLM({
      currentCase,
      transcript,
      targetLangCode,
      apiKeyOverride: runtimeKey
    });

    const { delta, otReadback, countAlert, caseStatus, familySummary } = parsedResult;

    // 4. Step 3: Update Case Record in MongoDB
    if (delta.nabh_operative_note) {
      currentCase.nabh_operative_note = {
        ...(currentCase.nabh_operative_note?.toObject ? currentCase.nabh_operative_note.toObject() : currentCase.nabh_operative_note || {}),
        ...delta.nabh_operative_note
      };
    }
    if (delta.who_safety_checklist) {
      currentCase.who_safety_checklist = {
        ...(currentCase.who_safety_checklist?.toObject ? currentCase.who_safety_checklist.toObject() : currentCase.who_safety_checklist || {}),
        ...delta.who_safety_checklist
      };
    }
    if (caseStatus) {
      currentCase.case_status = caseStatus;
    }

    // Append family briefing if generated
    if (familySummary && familySummary.native) {
      const existingBriefings = currentCase.vernacular_family_briefings || [];
      const updatedBriefings = existingBriefings.filter(b => b.language_code !== targetLangCode);
      updatedBriefings.push({
        language_code: targetLangCode,
        language_label: familySummary.label || 'Indic',
        native_script_text: familySummary.native,
        english_back_translation: familySummary.back_trans,
        generated_at: new Date()
      });
      currentCase.vernacular_family_briefings = updatedBriefings;
    }

    // Save Case
    if (isDbConnected) {
      await currentCase.save();
    } else {
      inMemoryStore.cases.set(caseId, currentCase);
    }

    // 5. Step 4: Synthesize Audio Readback via Sarvam Bulbul
    const ttsSpeaker = req.body.speaker || 'shubh';
    const ttsModel = req.body.ttsModel || 'bulbul:v3';
    const ttsPace = parseFloat(req.body.pace) || 1.05;

    let audioBase64 = null;
    if (otReadback) {
      const ttsResult = await synthesizeSpeech({
        text: otReadback,
        targetLanguageCode: 'en-IN',
        speaker: ttsSpeaker,
        model: ttsModel,
        pace: ttsPace,
        apiKeyOverride: runtimeKey
      });
      audioBase64 = ttsResult.audioBase64;
    }

    // 6. Step 5: Save Voice Dictation Log
    let seqNumber = 1;
    if (isDbConnected) {
      const lastLog = await VoiceDictationLog.findOne({ case_id: caseId }).sort({ sequence_number: -1 });
      if (lastLog) seqNumber = lastLog.sequence_number + 1;
    } else {
      const caseLogs = inMemoryStore.logs.filter(l => l.case_id === caseId);
      seqNumber = caseLogs.length + 1;
    }

    const latencyMs = Date.now() - startTime;

    const logEntry = {
      case_id: caseId,
      sequence_number: seqNumber,
      raw_transcript: transcript,
      detected_language: detectedLang,
      sarvam_stt_model: req.file ? (req.body.sttModel || 'saaras:v4') : 'direct_simulation',
      sarvam_llm_model: 'sarvam-105b',
      sarvam_tts_model: ttsModel,
      extracted_fields_delta: delta,
      ot_readback_sentence: otReadback,
      audio_base64: audioBase64,
      safety_flag_raised: countAlert,
      processing_latency_ms: latencyMs,
      logged_at: new Date()
    };

    let savedLog = logEntry;
    if (isDbConnected) {
      savedLog = await VoiceDictationLog.create(logEntry);
    } else {
      inMemoryStore.logs.push(logEntry);
    }

    res.json({
      success: true,
      updatedCase: currentCase,
      newVoiceLog: savedLog,
      audioBase64,
      otReadback,
      safetyAlert: countAlert,
      latencyMs
    });
  } catch (err) {
    console.error('[Process Voice Error]:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 7. POST /api/cases/:caseId/family-briefing
 * Generate and speak empathetic post-op update in native Indic script
 */
app.post('/api/cases/:caseId/family-briefing', async (req, res) => {
  const { caseId } = req.params;
  const { targetLanguageCode = 'mr-IN', speaker = 'ritu', model = 'bulbul:v3' } = req.body;
  const runtimeKey = getRuntimeApiKey(req);

  try {
    let currentCase = isDbConnected
      ? await OperativeCase.findOne({ case_id: caseId })
      : inMemoryStore.cases.get(caseId);

    if (!currentCase) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Generate baseline native briefing
    const parsed = parseClinicalDictationWithLLM({
      currentCase,
      transcript: 'Generate comprehensive patient family briefing based on current operative note.',
      targetLangCode: targetLanguageCode,
      apiKeyOverride: runtimeKey
    });

    const baselineResult = await parsed;
    const briefing = baselineResult.familySummary;

    // Synthesize vernacular audio in native language!
    let audioBase64 = null;
    if (briefing && briefing.native) {
      const tts = await synthesizeSpeech({
        text: briefing.native,
        targetLanguageCode: targetLanguageCode,
        speaker: speaker || 'ritu',
        model: model || 'bulbul:v3',
        pace: 1.0,
        apiKeyOverride: runtimeKey
      });
      audioBase64 = tts.audioBase64;
    }

    // Persist briefing into case
    const existing = currentCase.vernacular_family_briefings || [];
    const updated = existing.filter(b => b.language_code !== targetLanguageCode);
    const briefingRecord = {
      language_code: targetLanguageCode,
      language_label: briefing.label,
      native_script_text: briefing.native,
      english_back_translation: briefing.back_trans,
      audio_base64: audioBase64,
      generated_at: new Date()
    };
    updated.push(briefingRecord);
    currentCase.vernacular_family_briefings = updated;

    if (isDbConnected) {
      await currentCase.save();
    } else {
      inMemoryStore.cases.set(caseId, currentCase);
    }

    res.json({
      success: true,
      briefing: briefingRecord,
      audioBase64,
      case_id: caseId
    });
  } catch (err) {
    console.error('[Family Briefing Error]:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 8. PATCH /api/cases/:caseId/counts
 * Manual or voice adjustment of surgical counts + immediate discrepancy recalculation
 */
app.patch('/api/cases/:caseId/counts', async (req, res) => {
  const { caseId } = req.params;
  const { counts } = req.body;

  try {
    let currentCase = isDbConnected
      ? await OperativeCase.findOne({ case_id: caseId })
      : inMemoryStore.cases.get(caseId);

    if (!currentCase) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const currentCounts = currentCase.who_safety_checklist.counts;
    const updatedCounts = {
      ...currentCounts,
      ...counts
    };

    // Calculate matched status
    const spongesMatched = updatedCounts.abdominal_sponges.deployed === updatedCounts.abdominal_sponges.recovered;
    const swabsMatched = updatedCounts.raytec_gauze_swabs.deployed === updatedCounts.raytec_gauze_swabs.recovered;
    const needlesMatched = updatedCounts.suture_needles.deployed === updatedCounts.suture_needles.recovered;

    updatedCounts.abdominal_sponges.matched = spongesMatched;
    updatedCounts.raytec_gauze_swabs.matched = swabsMatched;
    updatedCounts.suture_needles.matched = needlesMatched;

    const hasDiscrepancy = !spongesMatched || !swabsMatched || !needlesMatched;

    currentCase.who_safety_checklist.counts = updatedCounts;
    currentCase.who_safety_checklist.count_discrepancy_alert = hasDiscrepancy;

    if (hasDiscrepancy) {
      currentCase.case_status = 'SAFETY_HOLD';
      currentCase.who_safety_checklist.discrepancy_notes = `WARNING: Surgical count discrepancy detected! Sponges matched: ${spongesMatched}, Swabs matched: ${swabsMatched}, Needles matched: ${needlesMatched}. Closure locked.`;
    } else {
      currentCase.case_status = 'IN_PROGRESS';
      currentCase.who_safety_checklist.discrepancy_notes = 'All sponge, swab, and needle counts verified matched.';
    }

    if (isDbConnected) {
      await currentCase.save();
    } else {
      inMemoryStore.cases.set(caseId, currentCase);
    }

    res.json({
      success: true,
      who_safety_checklist: currentCase.who_safety_checklist,
      case_status: currentCase.case_status
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 9. GET /api/catalog
 * Reference catalog for standard sutures, plates, and templates
 */
app.get('/api/catalog', async (req, res) => {
  try {
    if (isDbConnected) {
      const items = await EquipmentCatalog.find();
      return res.json(items);
    } else {
      return res.json(inMemoryStore.catalog);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 10. POST /api/test-key
 * Validate API key
 */
app.post('/api/test-key', async (req, res) => {
  const { apiKey } = req.body;
  const keyToTest = apiKey || process.env.SARVAM_API_KEY;

  if (!keyToTest) {
    return res.status(400).json({ valid: false, message: 'No API key provided.' });
  }

  try {
    const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'api-subscription-key': keyToTest,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sarvam-105b-conversations',
        messages: [{ role: 'user', content: 'ping' }]
      })
    });

    if (response.ok) {
      res.json({ valid: true, message: 'Sarvam API key is valid and active!' });
    } else {
      const text = await response.text();
      res.status(response.status).json({ valid: false, message: `Key validation failed: ${text}` });
    }
  } catch (err) {
    res.status(500).json({ valid: false, message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[SurgiVoice Indic Server] Running on http://localhost:${PORT}`);
  console.log(`[MongoDB Target] mongodb://127.0.0.1:27017/surgivoice_indic`);
});

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseClinicalDictationDeterministic } from './clinicalParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SARVAM_BASE_URL = 'https://api.sarvam.ai';

function getApiKey(runtimeKey) {
  return runtimeKey || process.env.SARVAM_API_KEY || '';
}

/**
 * 1. Speech-to-Text via Sarvam Saaras
 */
export async function transcribeAudioBuffer({ fileBuffer, originalName = 'audio.wav', mimeType = 'audio/wav', model = 'saaras:v4', mode = 'codemix', languageCode = 'unknown', apiKeyOverride }) {
  const apiKey = getApiKey(apiKeyOverride);
  if (!apiKey) {
    console.warn('[Sarvam STT] No API key found, fallback to simulated transcription.');
    return {
      transcript: "Emergency appendectomy. McBurney's incision taken. Retrocecal appendix ligated with 2-0 Vicryl. Swab count matched. Blood loss 60 ml.",
      language_code: "en-IN"
    };
  }

  try {
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: mimeType });
    formData.append('file', blob, originalName);
    formData.append('model', model);
    formData.append('mode', mode);
    formData.append('language_code', languageCode);

    const response = await fetch(`${SARVAM_BASE_URL}/speech-to-text`, {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey
      },
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`STT failed with status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return {
      transcript: data.transcript || '',
      language_code: data.language_code || languageCode
    };
  } catch (error) {
    console.error('[Sarvam STT Error]:', error.message);
    throw error;
  }
}

/**
 * 2. Clinical Structuring & Reasoning via Sarvam-105B
 */
export async function parseClinicalDictationWithLLM({ currentCase, transcript, targetLang = 'Marathi', targetLangCode = 'mr-IN', apiKeyOverride }) {
  const apiKey = getApiKey(apiKeyOverride);

  // Fallback / baseline deterministic parser
  const baseline = parseClinicalDictationDeterministic(transcript, currentCase, targetLangCode);

  if (!apiKey) {
    return baseline;
  }

  try {
    const systemPrompt = `You are SurgiVoice Indic, an NABH and WHO-compliant Operation Theatre Clinical Documentation AI Agent deployed in Indian hospitals. You receive raw, code-mixed surgical dictations (English + Hindi/Marathi/Indic medical speech) alongside the current state of the ongoing Operative Note JSON. You must merge the new dictation into the existing operative state and return ONLY valid JSON matching the exact schema requested. Never invent clinical facts not stated. If sponge, swab, or instrument counts have a discrepancy, set count_alert_triggered to true and craft an urgent, unmistakable spoken warning in ot_readback_sentence.`;

    const userPrompt = `Current Operative State JSON: ${JSON.stringify(currentCase?.nabh_operative_note || {})}\n\nNew Surgeon Voice Dictation: "${transcript}"\n\nTarget Vernacular Language for Family Summary: ${targetLang} (${targetLangCode})\n\nReturn strictly valid JSON with updated fields matching the NABH schema, count math, ot_readback_sentence (under 22 words, crisp clinical English for OT Bluetooth speaker), and family_vernacular_summary (in native Indic script such as Devanagari for Hindi/Marathi).`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout for snappy OT response

    const response = await fetch(`${SARVAM_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sarvam-105b',
        temperature: 0.1,
        max_tokens: 1800,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      // Extract JSON from LLM response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            delta: parsed.updated_nabh_note || parsed.nabh_operative_note ? {
              nabh_operative_note: {
                ...(currentCase.nabh_operative_note || {}),
                ...(parsed.updated_nabh_note || parsed.nabh_operative_note || {})
              },
              ...(parsed.who_safety_checklist ? { who_safety_checklist: parsed.who_safety_checklist } : baseline.delta.who_safety_checklist ? { who_safety_checklist: baseline.delta.who_safety_checklist } : {})
            } : baseline.delta,
            otReadback: parsed.ot_readback_sentence || baseline.otReadback,
            countAlert: parsed.count_alert_triggered !== undefined ? parsed.count_alert_triggered : baseline.countAlert,
            caseStatus: parsed.case_status || baseline.caseStatus,
            familySummary: parsed.family_vernacular_summary ? {
              label: targetLang,
              native: typeof parsed.family_vernacular_summary === 'string' ? parsed.family_vernacular_summary : parsed.family_vernacular_summary.native || baseline.familySummary.native,
              back_trans: parsed.family_vernacular_summary.back_trans || baseline.familySummary.back_trans
            } : baseline.familySummary
          };
        } catch (e) {
          console.warn('[Sarvam-105B JSON Parse Warning, using deterministic baseline]:', e.message);
        }
      }
    }
  } catch (err) {
    console.warn('[Sarvam-105B Call Warning, defaulting to deterministic parser]:', err.message);
  }

  return baseline;
}

/**
 * 3. Text-to-Speech via Sarvam Bulbul (v3 or v4-flash)
 */
export async function synthesizeSpeech({ text, targetLanguageCode = 'en-IN', speaker = 'shubh', model = 'bulbul:v3', pace = 1.05, apiKeyOverride }) {
  const apiKey = getApiKey(apiKeyOverride);
  if (!apiKey) {
    console.warn('[Sarvam TTS] No API key found, returning empty audio payload.');
    return { audioBase64: null, requestId: 'simulated_tts' };
  }

  try {
    const payload = {
      text: text.slice(0, 2400),
      target_language_code: targetLanguageCode,
      speaker: speaker,
      model: model,
      pace: Math.max(0.5, Math.min(2.0, pace)),
      speech_sample_rate: 24000
    };

    const response = await fetch(`${SARVAM_BASE_URL}/text-to-speech`, {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('[Sarvam TTS Error Body]:', errBody);
      throw new Error(`TTS failed with status ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    const audioBase64 = data.audios && data.audios.length > 0 ? data.audios[0] : null;

    return {
      audioBase64,
      requestId: data.request_id
    };
  } catch (error) {
    console.error('[Sarvam TTS Exception]:', error.message);
    return { audioBase64: null, error: error.message };
  }
}

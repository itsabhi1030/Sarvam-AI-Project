import mongoose from 'mongoose';

const VoiceDictationLogSchema = new mongoose.Schema({
  case_id: { type: String, required: true, index: true },
  sequence_number: { type: Number, required: true },
  raw_transcript: { type: String, required: true },
  detected_language: { type: String, default: "codemix (hi-IN / mr-IN / en-IN)" },
  sarvam_stt_model: { type: String, default: "saaras:v4" },
  sarvam_llm_model: { type: String, default: "sarvam-105b" },
  sarvam_tts_model: { type: String, default: "bulbul:v3" },
  extracted_fields_delta: { type: mongoose.Schema.Types.Mixed }, // Exact JSON fields modified by this utterance
  ot_readback_sentence: { type: String },
  audio_base64: { type: String }, // TTS output for playback
  safety_flag_raised: { type: Boolean, default: false },
  processing_latency_ms: { type: Number },
  logged_at: { type: Date, default: Date.now }
}, { timestamps: true, collection: "voice_dictation_logs" });

export default mongoose.models.VoiceDictationLog || mongoose.model('VoiceDictationLog', VoiceDictationLogSchema);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root or server
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/surgivoice_indic';

export let isDbConnected = false;

export async function connectDB() {
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 5000,
    });
    isDbConnected = true;
    console.log(`====================================================`);
    console.log(`[MongoDB Compass Connected] ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    console.log(`[Compass URI] ${MONGODB_URI}`);
    console.log(`====================================================`);
  } catch (error) {
    isDbConnected = false;
    console.warn(`[MongoDB Warning] Could not connect to ${MONGODB_URI}: ${error.message}`);
    console.warn(`[MongoDB In-Memory Fallback] Server will run with memory mirror so UI never crashes.`);
  }

  mongoose.connection.on('disconnected', () => {
    isDbConnected = false;
    console.warn('[MongoDB] Disconnected from database.');
  });

  mongoose.connection.on('reconnected', () => {
    isDbConnected = true;
    console.log('[MongoDB] Reconnected to database.');
  });
}

export function getDbStatus() {
  return {
    connected: isDbConnected,
    uri: MONGODB_URI,
    database: 'surgivoice_indic',
    readyState: mongoose.connection.readyState
  };
}

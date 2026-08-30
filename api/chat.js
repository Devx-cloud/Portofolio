import { GoogleGenAI } from '@google/genai';
import { profileData } from './profile.js';

// Vercel: kasih ruang buat retry + fallback model tanpa kena timeout 10s default.
export const maxDuration = 30;

/* Model utama + cadangan. Semua sudah diverifikasi tersedia untuk API key ini
   (akun Gemini baru: model 2.x/1.x sudah tidak ada, hanya 3.x + alias "-latest").
   Kalau satu kena overload (503) / limit sesaat (429), otomatis lanjut ke
   berikutnya. Urutan: yang paling cepat & jarang penuh dulu, "flash" penuh
   sebagai cadangan kualitas.
   Cek ulang: GET https://generativelanguage.googleapis.com/v1beta/models?key=... */
const MODELS = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3.5-flash'];

const MAX_ATTEMPTS_PER_MODEL = 2; // 1 percobaan awal + 1 retry
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// @google/genai melempar ApiError dengan .status (number). Regex sebagai cadangan
// kalau status cuma nyangkut di teks pesan.
function getStatus(error) {
  if (typeof error?.status === 'number') return error.status;
  const match = /\[?(\d{3})[\s\]]/.exec(error?.message || '');
  return match ? Number(match[1]) : null;
}

function isRetryable(error) {
  const status = getStatus(error);
  if (status !== null) return RETRYABLE_STATUS.has(status);
  // Tanpa status = kemungkinan error jaringan (fetch gagal / timeout).
  return /fetch failed|network|ETIMEDOUT|ECONNRESET|ENOTFOUND/i.test(error?.message || '');
}

async function generateWithFallback(ai, systemInstruction, userMessage) {
  let lastError;

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
      try {
        const res = await ai.models.generateContent({
          model,
          contents: userMessage,
          config: {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 800,
            // Catatan: JANGAN pakai thinkingConfig.thinkingBudget di sini -> model
            // Gemini 3.x menolaknya (400 INVALID_ARGUMENT). Model "lite" default-nya
            // sudah tanpa thinking, jadi tetap cepat.
          },
        });

        const text = res.text;
        if (!text) throw new Error('Respons kosong dari model (kemungkinan kena filter keamanan)');
        return text;
      } catch (error) {
        lastError = error;
        const status = getStatus(error);

        // Error non-retryable (401/403/404/400) -> percuma diulang, coba model lain.
        if (!isRetryable(error)) {
          console.warn(`[chat] ${model} gagal (status ${status}), coba model lain`);
          break;
        }
        if (attempt === MAX_ATTEMPTS_PER_MODEL) break;

        const delay = 1000 * attempt; // 1s, lalu 2s
        console.warn(`[chat] ${model} sibuk (status ${status}), retry ke-${attempt + 1} dalam ${delay}ms`);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { message } = req.body || {};

  if (!message) {
    return res.status(400).json({ message: 'Pesan tidak boleh kosong.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set');
    return res.status(500).json({ message: 'Konfigurasi server belum lengkap (API key hilang).' });
  }

  const systemInstruction = `
    ${profileData.pesan_sistem}

    Informasi Profil:
    Nama: ${profileData.nama}
    Profesi: ${profileData.profesi}
    Keahlian: ${profileData.keahlian_utama.join(', ')}
    Tentang: ${profileData.tentang}
    Kontak/Resume: ${profileData.kontak.resume}
  `;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const text = await generateWithFallback(ai, systemInstruction, message);
    return res.status(200).json({ reply: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    const status = getStatus(error);

    if (RETRYABLE_STATUS.has(status)) {
      return res.status(503).json({
        message: 'Server AI lagi sibuk banget sekarang. Coba tanya lagi beberapa saat lagi ya.',
      });
    }
    if (/blocked|safety|recitation|respons kosong/i.test(error?.message || '')) {
      return res.status(500).json({
        message: 'Pertanyaan ini kena filter keamanan AI. Coba tanya dengan cara lain.',
      });
    }
    if (status === 400 || status === 401 || status === 403 || status === 404) {
      return res.status(500).json({
        message: 'Ada masalah pada konfigurasi AI (API key / nama model).',
      });
    }
    return res.status(500).json({
      message: 'Maaf, ada kesalahan saat memproses pertanyaanmu. Coba lagi ya.',
    });
  }
}

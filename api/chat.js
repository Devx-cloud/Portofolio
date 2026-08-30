import { GoogleGenerativeAI } from '@google/generative-ai';
import { profileData } from './profile.js';

// Vercel: kasih ruang buat retry + fallback model tanpa kena timeout 10s default.
export const maxDuration = 30;

/* Model utama + cadangan. Kalau yang pertama kena overload (503) atau limit
   sesaat (429), otomatis lanjut ke model berikutnya. Dua terakhir sengaja versi
   GA yang di-pin (bukan alias "-latest") karena lebih stabil & jarang penuh.
   Sesuaikan kalau daftar model Gemini berubah: https://ai.google.dev/gemini-api/docs/models */
const MODELS = ['gemini-flash-latest', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];

const MAX_ATTEMPTS_PER_MODEL = 2; // 1 percobaan awal + 1 retry
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Status HTTP dari error SDK Google bisa ada di .status, atau cuma nyangkut di
// teks pesan ("[503 Service Unavailable] ...").
function getStatus(error) {
  if (typeof error?.status === 'number') return error.status;
  const match = /\[(\d{3})\s/.exec(error?.message || '');
  return match ? Number(match[1]) : null;
}

function isRetryable(error) {
  const status = getStatus(error);
  if (status !== null) return RETRYABLE_STATUS.has(status);
  // Tanpa status = kemungkinan error jaringan (fetch gagal / timeout).
  return /fetch failed|network|ETIMEDOUT|ECONNRESET|ENOTFOUND/i.test(error?.message || '');
}

async function generateWithFallback(genAI, prompt) {
  let lastError;

  for (const modelName of MODELS) {
    const model = genAI.getGenerativeModel({ model: modelName });

    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        return result.response.text();
      } catch (error) {
        lastError = error;
        if (!isRetryable(error)) throw error;

        // Percobaan terakhir buat model ini -> pindah ke model berikutnya.
        if (attempt === MAX_ATTEMPTS_PER_MODEL) break;

        const delay = 1000 * attempt; // 1s sebelum retry
        console.warn(
          `[chat] ${modelName} gagal (attempt ${attempt}, status ${getStatus(error)}), retry dalam ${delay}ms`,
        );
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

  const systemPrompt = `
      ${profileData.pesan_sistem}

      Informasi Profil:
      Nama: ${profileData.nama}
      Profesi: ${profileData.profesi}
      Keahlian: ${profileData.keahlian_utama.join(', ')}
      Tentang: ${profileData.tentang}
      Kontak/Resume: ${profileData.kontak.resume}
    `;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const text = await generateWithFallback(
      genAI,
      `${systemPrompt}\n\nPertanyaan Pengunjung: ${message}`,
    );
    return res.status(200).json({ reply: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    const status = getStatus(error);

    if (RETRYABLE_STATUS.has(status)) {
      return res.status(503).json({
        message: 'Server AI lagi sibuk banget sekarang. Coba tanya lagi beberapa saat lagi ya.',
      });
    }
    if (status === 400 || status === 401 || status === 403) {
      return res.status(500).json({
        message: 'Ada masalah konfigurasi di sisi AI. Coba lagi nanti.',
      });
    }
    return res.status(500).json({
      message: 'Maaf, ada kesalahan saat memproses pertanyaanmu. Coba lagi ya.',
    });
  }
}

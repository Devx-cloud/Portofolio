import { GoogleGenAI } from '@google/genai';
import { SYSTEM_INSTRUCTION } from './_lib/prompt.js';
import { createRateLimiter } from './_lib/rateLimit.js';
import { toPlainText } from './_lib/text.js';

// Vercel: kasih ruang buat retry + fallback model tanpa kena timeout 10s default.
// Diulang di vercel.json (functions) - itu jalur resmi untuk fungsi di luar Next.js.
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

/* Waktu. Satu panggilan yang menggantung tidak boleh menghabiskan seluruh jatah
   fungsi: ia dipotong di ATTEMPT_TIMEOUT_MS, dan seluruh permintaan berhenti
   mencoba di DEADLINE_MS supaya balasan error yang rapi sempat terkirim sebelum
   platform memutus fungsi di maxDuration (30 detik) dengan halaman error mentah. */
const ATTEMPT_TIMEOUT_MS = 12_000;
const DEADLINE_MS = 24_000;
const MIN_ATTEMPT_MS = 1_500;

/* Batas masukan. Klien membatasi kolomnya di angka yang sama (useChatAgent), tapi
   server tidak boleh percaya klien - endpoint ini bisa dipanggil langsung. */
export const MAX_MESSAGE_LENGTH = 500;

/* Dua jendela: semburan cepat, dan pemakaian wajar per jam. Batasnya jujur
   dijelaskan di _lib/rateLimit.js. */
const burstLimiter = createRateLimiter({ windowMs: 60_000, max: 6 });
const hourlyLimiter = createRateLimiter({ windowMs: 3_600_000, max: 40 });

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
  // Tanpa status = kemungkinan error jaringan atau panggilan yang kena timeout.
  if (error?.name === 'TimeoutError' || error?.name === 'AbortError') return true;
  return /fetch failed|network|ETIMEDOUT|ECONNRESET|ENOTFOUND/i.test(error?.message || '');
}

async function generateWithFallback(ai, userMessage) {
  const deadline = Date.now() + DEADLINE_MS;
  let lastError;

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
      const remaining = deadline - Date.now();
      if (remaining < MIN_ATTEMPT_MS) {
        throw lastError ?? Object.assign(new Error('Waktu habis sebelum ada balasan'), { status: 503 });
      }

      try {
        const res = await ai.models.generateContent({
          model,
          contents: userMessage,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            // Rendah: ini tanya-jawab faktual soal satu profil, bukan menulis kreatif.
            temperature: 0.4,
            maxOutputTokens: 800,
            abortSignal: AbortSignal.timeout(Math.min(ATTEMPT_TIMEOUT_MS, remaining)),
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

        const delay = 1000 * attempt; // 1s
        console.warn(`[chat] ${model} sibuk (status ${status ?? error?.name}), retry ke-${attempt + 1} dalam ${delay}ms`);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/* Isi kolom `message` dari badan permintaan, atau alasan penolakannya. Badan bisa
   berupa string kalau Content-Type-nya bukan JSON. */
function readMessage(body) {
  let data = body;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      return { error: 'Format permintaan tidak valid.' };
    }
  }

  const raw = data?.message;
  if (typeof raw !== 'string') return { error: 'Pesan tidak boleh kosong.' };

  const message = raw.trim();
  if (!message) return { error: 'Pesan tidak boleh kosong.' };
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { error: `Pesan terlalu panjang (maksimal ${MAX_MESSAGE_LENGTH} karakter).` };
  }
  return { message };
}

/* Pengenal klien untuk pembatas laju. Header milik platform didahulukan: di
   Vercel ia ditulis ulang di tepi, jadi klien tidak bisa memalsukannya lewat
   X-Forwarded-For buatan sendiri. */
function clientKey(req) {
  const h = req.headers ?? {};
  const forwarded = String(h['x-vercel-forwarded-for'] || h['x-real-ip'] || h['x-forwarded-for'] || '');
  return forwarded.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
}

/* Pabrik supaya klien Gemini dan pembacaan API key bisa diganti saat menguji -
   tanpanya mustahil mencoba jalur balasan tanpa kunci dan jaringan sungguhan. */
export function createHandler({
  getApiKey = () => process.env.GEMINI_API_KEY,
  makeClient = (apiKey) => new GoogleGenAI({ apiKey }),
} = {}) {
  return async function handler(req, res) {
    // Balasan berbeda tiap pertanyaan - jangan pernah di-cache perantara.
    res.setHeader('Cache-Control', 'no-store');

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const key = clientKey(req);
    const verdict = [burstLimiter.check(key), hourlyLimiter.check(key)].find((v) => !v.ok);
    if (verdict) {
      res.setHeader('Retry-After', String(verdict.retryAfter));
      return res.status(429).json({
        message: `Terlalu banyak pertanyaan dalam waktu singkat. Coba lagi sekitar ${verdict.retryAfter} detik lagi ya.`,
      });
    }

    const parsed = readMessage(req.body);
    if (parsed.error) return res.status(400).json({ message: parsed.error });

    const apiKey = getApiKey();
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return res.status(500).json({ message: 'Konfigurasi server belum lengkap (API key hilang).' });
    }

    try {
      const text = await generateWithFallback(makeClient(apiKey), parsed.message);
      return res.status(200).json({ reply: toPlainText(text) });
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const status = getStatus(error);

      if (RETRYABLE_STATUS.has(status) || error?.name === 'TimeoutError' || error?.name === 'AbortError') {
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
  };
}

export default createHandler();

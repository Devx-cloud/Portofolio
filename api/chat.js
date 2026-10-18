import { SYSTEM_INSTRUCTION } from './_lib/prompt.js';
import { createRateLimiter } from './_lib/rateLimit.js';
import { toPlainText } from './_lib/text.js';

// Vercel: kasih ruang buat retry + fallback model tanpa kena timeout 10s default.
// Diulang di vercel.json (functions) - itu jalur resmi untuk fungsi di luar Next.js.
export const maxDuration = 30;

/* Gemini tidak lagi dipanggil langsung dengan satu API key. Panggilannya lewat
   gateway Vulpes (project Gemini-Gateway): satu endpoint kompatibel OpenAI yang
   menggabungkan banyak key, dan pindah ke key berikutnya sendiri kalau satu key
   habis kuota atau ditolak. Dengan satu key, satu kuota harian yang habis berarti
   asisten mati sampai besok.

   Token gateway hanya dibaca di sini (server). Ia tidak boleh sampai ke browser:
   siapa pun yang memegangnya bisa memakai semua key di baliknya. */
const DEFAULT_GATEWAY_URL = 'https://vulpes-core.vercel.app';

/* Model utama + cadangan, semua sudah dicoba lewat gateway (Oktober 2026): dua
   "lite" ~1 detik, 3.8-flash ~4,5 detik sebagai cadangan kualitas. Jangan pakai
   seri 2.5, model Pro, gemini-4-argon, atau Omni - key tier gratis ditolak di
   sana (lihat UNAVAILABLE di Gemini-Gateway/lib/chat.ts).

   Kuota gratis Gemini dihitung PER MODEL, jadi 429 dari gateway (semua key habis
   untuk model itu) tetap layak dicoba di model berikutnya. */
const MODELS = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];

const MAX_ATTEMPTS_PER_MODEL = 2; // 1 percobaan awal + 1 retry
// Hanya gangguan sesaat yang diulang di model yang sama. 429 tidak: gateway sudah
// mencoba semua key-nya sebelum membalas 429, mengulang detik ini pasti sama.
const RETRYABLE_STATUS = new Set([500, 502, 503, 504]);

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

/* Error dari gateway membawa status HTTP-nya. `blocked` = model menjawab tapi
   isinya kosong (filter keamanan) - bukan gangguan, jadi tidak diulang. */
class GatewayError extends Error {
  constructor(message, { status = null, blocked = false } = {}) {
    super(message);
    this.name = 'GatewayError';
    this.status = status;
    this.blocked = blocked;
  }
}

// Gateway membalas {error: "..."}, Gemini (diteruskan gateway) {error: {message}}
// atau [{error: {message}}].
function messageFrom(body) {
  const first = Array.isArray(body) ? body[0] : body;
  const err = first?.error;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) return String(err.message);
  return undefined;
}

function isRetryable(error) {
  if (error?.status != null) return RETRYABLE_STATUS.has(error.status);
  if (error?.blocked) return false;
  // Tanpa status = error jaringan atau panggilan yang kena timeout.
  if (error?.name === 'TimeoutError' || error?.name === 'AbortError') return true;
  return /fetch failed|network|ETIMEDOUT|ECONNRESET|ENOTFOUND/i.test(error?.message || '');
}

async function askGateway({ url, token, fetchImpl }, model, userMessage, signal) {
  const res = await fetchImpl(`${url}/api/v1/chat/completions`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        { role: 'user', content: userMessage },
      ],
      // Rendah: ini tanya-jawab faktual soal satu profil, bukan menulis kreatif.
      temperature: 0.4,
      max_tokens: 800,
    }),
    signal,
  });

  /* Badan bisa bukan JSON (mis. halaman galat Vercel milik gateway itu sendiri).
     Dibaca dan diurai terpisah: timeout yang jatuh saat badan masih dibaca harus
     tetap terlempar sebagai timeout, bukan tertelan jadi "jawaban kosong". */
  const raw = await res.text();
  let body = null;
  try {
    body = JSON.parse(raw);
  } catch {
    // bukan JSON
  }
  if (!res.ok) {
    throw new GatewayError(messageFrom(body) ?? `Gateway membalas HTTP ${res.status}`, { status: res.status });
  }

  const choice = body?.choices?.[0];
  const text = choice?.message?.content;
  if (!text) {
    throw new GatewayError(`Respons kosong dari model (finish_reason: ${choice?.finish_reason ?? '-'})`, {
      blocked: true,
    });
  }
  return text;
}

async function generateWithFallback(gateway, userMessage) {
  const deadline = Date.now() + DEADLINE_MS;
  let lastError;

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
      const remaining = deadline - Date.now();
      if (remaining < MIN_ATTEMPT_MS) {
        throw lastError ?? new GatewayError('Waktu habis sebelum ada balasan', { status: 503 });
      }

      try {
        const signal = AbortSignal.timeout(Math.min(ATTEMPT_TIMEOUT_MS, remaining));
        return await askGateway(gateway, model, userMessage, signal);
      } catch (error) {
        lastError = error;

        // Token gateway salah: model lain juga akan ditolak, berhenti di sini.
        if (error?.status === 401) throw error;

        // 400/403/404/429 atau jawaban kosong -> percuma diulang, coba model lain.
        if (!isRetryable(error)) {
          console.warn(`[chat] ${model} gagal (status ${error?.status ?? '-'}: ${error?.message}), coba model lain`);
          break;
        }
        if (attempt === MAX_ATTEMPTS_PER_MODEL) break;

        const delay = 1000 * attempt; // 1s
        console.warn(`[chat] ${model} sibuk (status ${error?.status ?? error?.name}), retry ke-${attempt + 1} dalam ${delay}ms`);
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

/* Alamat gateway tanpa garis miring di ujung. Yang diisi dengan akhiran /api/v1
   (base URL gaya OpenAI, seperti di panduan API Vulpes) juga diterima. */
const gatewayUrl = (raw) => (raw || DEFAULT_GATEWAY_URL).trim().replace(/\/+$/, '').replace(/\/api\/v1$/, '');

/* Pabrik supaya konfigurasi dan fetch bisa diganti saat menguji - tanpanya
   mustahil mencoba jalur balasan tanpa token dan jaringan sungguhan. */
export function createHandler({
  getConfig = () => ({ url: process.env.GATEWAY_URL, token: process.env.GATEWAY_TOKEN }),
  fetchImpl = fetch,
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

    const { url, token } = getConfig();
    if (!token) {
      console.error('GATEWAY_TOKEN is not set');
      return res.status(500).json({ message: 'Konfigurasi server belum lengkap (token gateway AI hilang).' });
    }

    try {
      const text = await generateWithFallback({ url: gatewayUrl(url), token, fetchImpl }, parsed.message);
      return res.status(200).json({ reply: toPlainText(text) });
    } catch (error) {
      console.error('Error calling AI gateway:', error);
      const status = error?.status ?? null;

      /* 429 dari gateway = semua key habis kuota untuk SEMUA model yang dicoba.
         Dibalas 503, bukan 429: di klien 429 berarti pengunjung ini yang terlalu
         sering bertanya, dan pesan itu salah alamat di sini. */
      if (status === 429) {
        return res.status(503).json({
          message: 'Jatah AI lagi habis untuk sementara. Coba tanya lagi beberapa menit lagi ya.',
        });
      }
      if (RETRYABLE_STATUS.has(status) || error?.name === 'TimeoutError' || error?.name === 'AbortError') {
        return res.status(503).json({
          message: 'Server AI lagi sibuk banget sekarang. Coba tanya lagi beberapa saat lagi ya.',
        });
      }
      if (error?.blocked || /blocked|safety|recitation/i.test(error?.message || '')) {
        return res.status(500).json({
          message: 'Pertanyaan ini kena filter keamanan AI. Coba tanya dengan cara lain.',
        });
      }
      if (status === 400 || status === 401 || status === 403 || status === 404) {
        return res.status(500).json({
          message: 'Ada masalah pada konfigurasi AI (token gateway / nama model).',
        });
      }
      return res.status(500).json({
        message: 'Maaf, ada kesalahan saat memproses pertanyaanmu. Coba lagi ya.',
      });
    }
  };
}

export default createHandler();

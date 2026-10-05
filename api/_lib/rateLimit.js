/*
 * Pembatas laju geser, disimpan di memori proses.
 *
 * JUJUR soal batasnya: fungsi serverless hidup di banyak instance yang saling
 * tidak berbagi memori dan sewaktu-waktu didaur ulang, jadi ini menahan
 * pengulangan cepat dari satu klien pada instance yang sama - bukan perisai
 * penuh. Untuk itu pasang aturan rate limit di Vercel Firewall (dashboard, tanpa
 * kode) atau simpan hitungannya di Redis/KV bersama. Antarmukanya sengaja
 * seragam supaya penggantinya cukup mengganti isi check().
 */
export function createRateLimiter({ windowMs, max, maxKeys = 5000 }) {
  const hits = new Map(); // kunci -> stempel waktu di dalam jendela, terlama dulu

  const prune = (cutoff) => {
    for (const [key, times] of hits) {
      if (times[times.length - 1] <= cutoff) hits.delete(key);
    }
    // Masih kebanyakan (banyak klien aktif sekaligus): buang yang paling lama
    // masuk. Map mengingat urutan sisip, jadi yang pertama = yang tertua.
    for (const key of hits.keys()) {
      if (hits.size <= maxKeys) break;
      hits.delete(key);
    }
  };

  return {
    check(key, now = Date.now()) {
      const cutoff = now - windowMs;
      const recent = (hits.get(key) ?? []).filter((t) => t > cutoff);

      if (recent.length >= max) {
        hits.set(key, recent);
        return { ok: false, retryAfter: Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000)) };
      }

      recent.push(now);
      hits.set(key, recent);
      if (hits.size > maxKeys) prune(cutoff);
      return { ok: true, retryAfter: 0 };
    },
  };
}

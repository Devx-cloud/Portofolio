import { useEffect, useState } from "react";

/*
 * Teks yang muncul huruf demi huruf.
 *
 *   speed   - ms per tik. Untuk teks pendek, satu tik = satu karakter.
 *   maxMs   - batas atas total waktu mengetik. Tanpa ini balasan panjang mengetik
 *             sepanjang panjangnya x speed (400 karakter x 20ms = 8 detik) dan
 *             pengunjung menunggu kalimat yang sudah lama selesai ditulis
 *             server. Kalau lebih lama dari batas, tiap tik menulis beberapa
 *             karakter sekaligus - waktunya dipadatkan, isinya tidak dipotong.
 *   instant - tampilkan seluruh teks langsung (reduced-motion, atau pengunjung
 *             melewatkan animasinya).
 *
 * Yang disimpan adalah teks mana yang sedang diketik beserta jumlah karakternya,
 * bukan potongannya. Diturunkan saat render, jadi pindah ke teks lain tidak
 * pernah sempat menampilkan sisa ketikan teks sebelumnya untuk satu frame.
 */
export const useTypewriter = (text, speed = 20, { maxMs = Infinity, instant = false } = {}) => {
  const [progress, setProgress] = useState({ text: "", count: 0 });

  useEffect(() => {
    if (instant || !text) return;

    const step = Math.max(1, Math.ceil((text.length * speed) / maxMs));
    let count = 0;

    const interval = setInterval(() => {
      count = Math.min(text.length, count + step);
      setProgress({ text, count });
      if (count >= text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, maxMs, instant]);

  if (!text) return "";
  if (instant) return text;
  return progress.text === text ? text.slice(0, progress.count) : "";
};

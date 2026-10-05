import { useEffect, useState } from "react";

/*
 * Overlay transisi antar halaman: sederet kolom pixel yang menyapu layar.
 *
 * Berdiri di luar wrapper route supaya tidak ikut memengaruhi layout.
 */

/* 28 kolom -> tiap kolom ~3.6% lebar layar: cukup tebal untuk terbaca sebagai
   balok pixel, cukup rapat untuk tepinya terbaca mengalir. */
const COLUMNS = 28;

/* Animasi 0,5 detik + keterlambatan kolom terlambat 0,12 detik = 0,62 detik.
   Dibulatkan ke atas: dilepas sebelum kolom terakhir tuntas akan memotongnya. */
const WIPE_MS = 700;

/* Keterlambatan tiap kolom: dua gelombang sinus yang saling tumpang tindih,
   BUKAN acak murni - acak murni menghasilkan tepi seperti derau. Cairan punya
   tetangga yang berkorelasi, dan itu yang gelombang berikan.

   Fasenya diacak tiap transisi supaya dua perpindahan berturut-turut tidak
   membentuk pola yang sama. */
const wipeDelays = () => {
  const phase = Math.random() * Math.PI * 2;
  return Array.from({ length: COLUMNS }, (_, i) => {
    const t = i / (COLUMNS - 1);
    const wave =
      Math.sin(t * Math.PI * 3.1 + phase) * 0.6 + Math.sin(t * Math.PI * 7.3 + phase * 2) * 0.4;
    return `${(((wave + 1) / 2) * 0.12).toFixed(3)}s`;
  });
};

/* onDone melepas overlay setelah animasinya selesai. Dulu 28 elemen dibiarkan
   menempel di DOM sampai perpindahan berikutnya. */
export const PageWipe = ({ onDone }) => {
  /* Penginisialisasi malas: acaknya dihitung SEKALI. Ditulis langsung di render,
     tiap render ulang induknya (misalnya saat hash berubah) mengundi ulang fase
     di tengah animasi yang sedang berjalan. */
  const [delays] = useState(wipeDelays);

  useEffect(() => {
    const timer = setTimeout(onDone, WIPE_MS);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div aria-hidden="true" className="page-wipe pointer-events-none fixed inset-0 z-[60]">
      {delays.map((delay, i) => (
        <span key={i} style={{ "--wipe-delay": delay }} />
      ))}
    </div>
  );
};

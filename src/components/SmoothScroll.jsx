import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useReducedMotion } from "framer-motion";
import { setLenis } from "@/lib/lenis";

/*
 * Smooth scroll (Lenis). Tidak merender apa pun - hanya mengambil alih
 * gulungan halaman.
 *
 * Kenapa perlu sama sekali: seluruh gerak di situs ini diturunkan dari posisi
 * gulungan. Roda mouse di Windows melompat ~100px per klik, jadi tanpa
 * peredam, animasi yang "mengikuti scroll" sebenarnya meloncat 5-6 langkah
 * besar dan tidak pernah terlihat sebagai gerakan. Lenis mengubah lompatan itu
 * jadi interpolasi per frame, dan itulah yang membuat highlight kata,
 * parallax, dan tumpukan kartu terbaca.
 *
 * Ia menulis ke scrollTop asli (bukan mentransformasi container), jadi
 * useScroll milik Framer Motion, position: sticky, dan #anchor bawaan browser
 * semuanya tetap bekerja apa adanya.
 *
 * Dimatikan total untuk prefers-reduced-motion: mengambil alih gulungan
 * adalah hal pertama yang mengganggu pengunjung yang meminta gerak minimal,
 * dan gulungan asli browser sudah benar tanpa kita.
 */
export const SmoothScroll = () => {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      /* 1.05 detik untuk mengejar target. Di bawah ~0.8 peredamannya tidak
         cukup untuk meratakan lompatan roda; di atas ~1.4 halaman terasa
         "berat" dan pengunjung merasa kehilangan kendali. */
      duration: 1.05,
      /* expo-out, kurva yang sama dengan --ease-out-expo di CSS. */
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      /* Sentuhan TIDAK dihaluskan. Layar sentuh sudah punya momentum sendiri
         dari sistem operasi, dan menumpuk peredam di atasnya membuat jari
         terasa lengket - keluhan nomor satu situs ber-smooth-scroll di HP. */
      syncTouch: false,
    });

    /* Didaftarkan supaya tombol "ke atas" di Footer bisa memintanya
       menggulung. Kenapa bukan window.scrollTo({behavior:"smooth"}) di sana:
       selama Lenis hidup ia menulis scrollTop tiap frame, jadi gulungan halus
       bawaan browser dan Lenis saling menimpa dan hasilnya tersendat. */
    setLenis(lenis);

    let frame = 0;
    const raf = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      setLenis(null);
    };
  }, [reduced]);

  return null;
};

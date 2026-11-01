import { useCallback, useEffect, useRef } from "react";
import { useMotionValue, useMotionValueEvent, useScroll } from "framer-motion";
import { ACT_STOPS, actAt } from "../acts";
import { IDLE_DELAY } from "../constants";

/* Selisih progres sebelum arah hadap berganti (~1px guliran di kolom sepanjang
   SCROLL_SPAN): cukup untuk mengabaikan getaran sub-piksel, terlalu kecil untuk
   terasa sebagai jeda. */
const FACING_DEADBAND = 0.0001;

/*
 * Sisi WAKTU panggung: mengubah posisi scroll jadi progres 0..1, plus tiga sinyal
 * turunan (sedang bergerak, arah hadap, babak aktif) dan navigasi antar babak.
 *
 * Progres sengaja TIDAK dihaluskan atau dibatasi kecepatannya: kamera, kota, dan
 * hero harus berada di posisi yang sama dengan scroll pada frame yang sama. Roda
 * mouse sudah dihaluskan oleh peramban. Spring di sini hanya menambah jeda - dulu
 * terukur 1,4-2,7 detik panggung masih bergerak sesudah tangan berhenti.
 *
 * Sisi RUANG - jarak, parallax, posisi hero - ada di useStageCamera.
 */
export const useStageProgress = (reducedMotion) => {
  const isMoving = useMotionValue(false);
  const facingRight = useMotionValue(true);
  const activeIndex = useMotionValue(0);

  const stopTimerRef = useRef(null);
  const facingAnchorRef = useRef(0);

  /* Progres seluruh halaman, bukan offset section: section mulai di bawah bar
     stage (pt-20) sementara panggungnya sudah menempel sejak scroll 0, dan offset
     "start start" membuat 80px pertama tidak menggerakkan apa pun. */
  const { scrollYProgress } = useScroll();

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    isMoving.set(true);
    clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => isMoving.set(false), IDLE_DELAY);

    activeIndex.set(actAt(v));

    const delta = v - facingAnchorRef.current;
    if (Math.abs(delta) > FACING_DEADBAND) {
      facingRight.set(delta > 0);
      facingAnchorRef.current = v;
    }
  });

  // Hitungan mundur di atas hidup di luar React - wajib dibersihkan saat unmount.
  useEffect(() => () => clearTimeout(stopTimerRef.current), []);

  const scrollToProgress = useCallback(
    (target) => {
      const range = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({
        top: target * range,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    },
    [reducedMotion]
  );

  const goToAct = useCallback((index) => scrollToProgress(ACT_STOPS[index]), [scrollToProgress]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

      /* Panah polos saja. Alt+panah adalah Back/Forward peramban, dan Ctrl/Meta/
         Shift+panah dipakai untuk lompat kata, memilih teks, dan pintasan sistem -
         merebutnya membuat halaman ini tidak bisa ditinggalkan dengan tombol
         Back dari keyboard (terukur: Alt+Kiri diblokir). Kolom isian juga
         berhak atas panahnya sendiri. */
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const focused = e.target;
      if (
        focused instanceof HTMLElement &&
        (focused.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(focused.tagName))
      ) {
        return;
      }

      e.preventDefault();

      const current = scrollYProgress.get();
      const target =
        e.key === "ArrowRight"
          ? ACT_STOPS.find((p) => p > current + 0.01) ?? 1
          : [...ACT_STOPS].reverse().find((p) => p < current - 0.01) ?? 0;

      scrollToProgress(target);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollYProgress, scrollToProgress]);

  return { scrollYProgress, isMoving, activeIndex, facingRight, goToAct };
};

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";
import { ACT_THRESHOLDS } from "../acts";
import { IDLE_DELAY, MAX_FRAME_MS, MAX_SCROLL_RATE } from "../constants";

/*
 * Sisi WAKTU panggung: mengubah scroll mentah jadi progres yang sudah dibatasi
 * kecepatannya lalu dihaluskan, plus tiga sinyal turunan (sedang bergerak,
 * arah hadap, babak aktif) dan navigasi antar babak.
 *
 * Sisi RUANG - jarak, parallax, posisi hero - ada di useStageCamera.
 */
export const useStageProgress = (containerRef, reducedMotion, snapPoints) => {
  const [isMoving, setIsMoving] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [facingRight, setFacingRight] = useState(true);

  const stopTimerRef = useRef(null);
  const lastProgressRef = useRef(0);
  const syncedRef = useRef(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  /* Panel babak punya pegasnya sendiri, jauh lebih kaku daripada parallax.
     Sejak panelnya bergulir (lihat REEL di acts.js), scroll mentah tidak lagi
     cukup: satu ketukan roda (~100px) memindahkan panel ~120px dalam satu frame,
     padahal opacity yang melompat dulu nyaris tidak terasa. Teredam kritis dan
     selesai dalam ~200ms - cukup untuk meratakan ketukan roda, terlalu singkat
     untuk membuat panel tertinggal dari babak aktifnya, yang tetap dibaca dari
     scroll mentah. restDelta bawaan (0,001) berarti lompatan ~7px di ujung
     peralihan; 0,0001 menyisakan kurang dari satu piksel. */
  const panelProgress = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 40,
    restDelta: 0.0001,
  });

  const markMoving = useCallback(() => {
    setIsMoving(true);
    clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => setIsMoving(false), IDLE_DELAY);
  }, []);

  /* Pembatas kecepatan, DI DEPAN spring. Urutannya penting: dipasang sesudah
     spring, yang dibatasi cuma keluarannya sementara targetnya sudah terlanjur
     melompat - hasilnya panggung yang tertinggal lalu menyusul dalam satu
     sentakan, bukan panggung yang berjalan pelan. */
  const cappedProgress = useMotionValue(0);

  useAnimationFrame((_, delta) => {
    const target = scrollYProgress.get();

    // Frame pertama disamakan begitu saja: halaman bisa dimuat ulang di tengah
    // babak, dan tanpa ini panggung merangkak dari nol menuju posisi itu.
    if (!syncedRef.current || reducedMotion) {
      // Panel juga: tanpa ini keempatnya bergulir lewat satu per satu saat dimuat.
      if (!syncedRef.current) panelProgress.jump(target);
      syncedRef.current = true;
      cappedProgress.set(target);
      return;
    }

    const current = cappedProgress.get();
    const diff = target - current;
    if (!diff) return;

    const step = (MAX_SCROLL_RATE * Math.min(delta, MAX_FRAME_MS)) / 1000;
    cappedProgress.set(Math.abs(diff) <= step ? target : current + Math.sign(diff) * step);

    // Selama panggung masih menyusul, hero MASIH berjalan - tanahnya memang
    // masih bergerak di bawah kakinya.
    markMoving();
  });

  /* Parallax dilewatkan spring supaya kota MELUNCUR, bukan tersentak tiap
     ketukan roda mouse. Sengaja overdamped - parallax yang memantul terasa
     salah. Panel babak TIDAK memakai ini: pembatas kecepatan di depannya bisa
     menahan panel sampai ~3 detik di belakang babak aktif, dan selama
     itu tombol yang terlihat adalah tombol panel yang sudah di-inert. */
  const smoothProgress = useSpring(cappedProgress, {
    stiffness: 70,
    damping: 20,
    mass: 0.5,
    restDelta: 0.0002,
  });

  /* Flag berjalan diambil dari scroll MENTAH: spring masih meluncur beberapa
     ratus milidetik setelah roda berhenti, dan memakainya membuat karakter
     melanjutkan langkah sesudah tangan berhenti. */
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    markMoving();
    setActiveIndex(ACT_THRESHOLDS.filter((t) => v >= t).length);
  });

  /* Arah hadap - dan hanya arah hadap - dibaca dari nilai yang sudah dihaluskan:
     roda mouse mengirim lompatan kecil bolak-balik, dan karakternya berkedip
     ganti arah kalau mengikuti scroll mentah. */
  useMotionValueEvent(smoothProgress, "change", (v) => {
    const delta = v - lastProgressRef.current;
    if (delta > 0.0004) setFacingRight(true);
    else if (delta < -0.0004) setFacingRight(false);
    lastProgressRef.current = v;
  });

  // Hitungan mundur di atas hidup di luar React - wajib dibersihkan saat unmount.
  useEffect(() => () => clearTimeout(stopTimerRef.current), []);

  const scrollToProgress = useCallback(
    (target) => {
      const container = containerRef.current;
      if (!container) return;
      const containerTop = window.scrollY + container.getBoundingClientRect().top;
      const scrollRange = container.offsetHeight - window.innerHeight;
      window.scrollTo({
        top: containerTop + target * scrollRange,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    },
    [containerRef, reducedMotion]
  );

  const goToAct = useCallback(
    (index) => {
      setFacingRight(index >= activeIndex);
      scrollToProgress(snapPoints[index]);
    },
    [activeIndex, scrollToProgress, snapPoints]
  );

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

      const forward = e.key === "ArrowRight";
      setFacingRight(forward);

      const current = scrollYProgress.get();
      const target = forward
        ? snapPoints.find((p) => p > current + 0.01) ?? 1
        : [...snapPoints].reverse().find((p) => p < current - 0.01) ?? 0;

      scrollToProgress(target);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollYProgress, scrollToProgress, snapPoints]);

  return {
    scrollYProgress,
    smoothProgress,
    // Gerak dikurangi: panel tidak bergeser, jadi tidak ada yang perlu dihaluskan.
    panelProgress: reducedMotion ? scrollYProgress : panelProgress,
    isMoving,
    activeIndex,
    facingRight,
    goToAct,
  };
};

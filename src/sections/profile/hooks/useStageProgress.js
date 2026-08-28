import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";
import { ACT_THRESHOLDS, SNAP_POINTS } from "../acts";
import { IDLE_DELAY, MAX_FRAME_MS, MAX_SCROLL_RATE } from "../constants";

/*
 * Sisi WAKTU panggung: mengubah scroll mentah jadi progres yang sudah dibatasi
 * kecepatannya lalu dihaluskan, plus tiga sinyal turunan (sedang bergerak,
 * arah hadap, babak aktif) dan navigasi antar babak.
 *
 * Sisi RUANG - jarak, parallax, posisi hero - ada di useStageCamera.
 */
export const useStageProgress = (containerRef, reducedMotion) => {
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
     salah. Hanya parallax yang dihaluskan; opacity panel dan pergantian babak
     tetap terikat scroll mentah supaya babaknya berganti tepat di posisinya. */
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
      scrollToProgress(SNAP_POINTS[index]);
    },
    [activeIndex, scrollToProgress]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();

      const forward = e.key === "ArrowRight";
      setFacingRight(forward);

      const current = scrollYProgress.get();
      const target = forward
        ? SNAP_POINTS.find((p) => p > current + 0.01) ?? 1
        : [...SNAP_POINTS].reverse().find((p) => p < current - 0.01) ?? 0;

      scrollToProgress(target);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollYProgress, scrollToProgress]);

  return { scrollYProgress, smoothProgress, isMoving, activeIndex, facingRight, goToAct };
};

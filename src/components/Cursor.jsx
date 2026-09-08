import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/*
 * Kursor kustom: satu cincin yang mengejar pointer, membesar di atas elemen
 * yang bisa diklik.
 *
 * mix-blend-mode: difference adalah seluruh triknya. Cincin bone di atas
 * latar hitam terbaca putih, di atas blok merah ia membalik jadi sian, dan
 * di atas gambar terang ia menggelap - satu elemen, kontras terjamin di
 * mana pun tanpa perlu tahu apa yang ada di bawahnya.
 *
 * Kursor asli TIDAK disembunyikan. Menyembunyikannya berarti bertaruh bahwa
 * cincin ini akan selalu ter-render; kalau JS gagal atau tab dibekukan,
 * pengunjung kehilangan penunjuknya sama sekali. Cincin ini lapisan tambahan,
 * bukan pengganti.
 */
export const Cursor = () => {
  /* Pointer kasar = layar sentuh: tidak ada kursor untuk diikuti, dan
     merender elemen fixed yang tidak pernah bergerak cuma membuang frame. */
  const isFinePointer = useMediaQuery("(pointer: fine)");

  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  /* Spring, bukan posisi langsung. Jeda kecil inilah yang membuat cincin
     terasa punya bobot; damping 28 cukup tinggi supaya ia tidak memantul
     melewati kursor saat berhenti mendadak. */
  const springX = useSpring(x, { damping: 28, stiffness: 420, mass: 0.35 });
  const springY = useSpring(y, { damping: 28, stiffness: 420, mass: 0.35 });

  useEffect(() => {
    if (!isFinePointer) return;

    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);

      /* closest() dievaluasi tiap gerakan, bukan lewat listener per elemen:
         bagian Ask AI menambah dan membuang tombol saat menjawab, dan
         listener yang dipasang sekali akan melewatkan elemen baru itu. */
      const target = e.target;
      setActive(
        Boolean(
          target instanceof Element &&
            target.closest("a, button, input, textarea, [data-cursor]")
        )
      );
    };

    const leave = () => setVisible(false);

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);

    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, [isFinePointer, x, y]);

  if (!isFinePointer) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9998] mix-blend-difference"
      style={{ x: springX, y: springY }}
    >
      <motion.div
        className="rounded-full border border-ink"
        animate={{
          width: active ? 44 : 18,
          height: active ? 44 : 18,
          opacity: visible ? 1 : 0,
          /* Menggeser setengah ukurannya sendiri supaya titik pusat cincin
             yang mengikuti pointer, bukan sudut kiri-atasnya. */
          x: active ? -22 : -9,
          y: active ? -22 : -9,
        }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.div>
  );
};

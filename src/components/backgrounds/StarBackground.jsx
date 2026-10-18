import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { seeded } from "@/lib/random";

/* Satu bintang per 10.000 px persegi, dengan batas atas supaya layar sangat
   lebar tidak menanggung ratusan node tambahan. */
const DENSITY = 10000;
const MAX_STARS = 420;
const METEORS = 5;

/*
 * Langit dibuat SEKALI untuk seluruh sesi, dengan PRNG bersemai - bukan Math.random
 * di dalam komponen.
 *
 * Versi lama mengundi ulang seluruh bintang di setiap event resize. Di HP, bilah
 * alamat yang menyusut saat menggulir memicu resize, jadi langit berkedip dan
 * bertukar susunan selagi dibaca. Sekarang jumlah yang tampil saja yang mengikuti
 * ukuran layar: bintang ke-N selalu ada di tempat yang sama, layar yang membesar
 * cuma menambah bintang di ujung daftar, dan layar yang mengecil melepasnya dari
 * ujung. Langitnya juga sama di setiap halaman, tidak berganti saat pindah stage.
 */
const STARS = (() => {
  const rnd = seeded(2024);
  return Array.from({ length: MAX_STARS }, (_, id) => ({
    id,
    size: rnd() < 0.75 ? 2 : 4, // kotak 2px atau 4px - tidak ada di antaranya
    x: rnd() * 100,
    y: rnd() * 100,
    // Dikuantisasi ke 3 langkah, bukan nilai bebas. Hanya terlihat saat gerak
    // dikurangi: selama berdenyut, animasi pulse menimpa opacity inline ini.
    opacity: [0.4, 0.7, 1][Math.floor(rnd() * 3)],
    duration: Math.round(rnd() * 4 + 2),
  }));
})();

const SHOOTING = (() => {
  const rnd = seeded(91);
  return Array.from({ length: METEORS }, (_, id) => ({
    id,
    size: rnd() < 0.5 ? 1 : 2,
    x: rnd() * 100,
    y: rnd() * 20,
    // Negatif: animasi dimulai di tengah siklus, bukan menunggu dulu
    delay: -Math.round(rnd() * 15),
    duration: Math.round(rnd() * 3 + 3),
  }));
})();

const starCount = () =>
  Math.min(MAX_STARS, Math.floor((window.innerWidth * window.innerHeight) / DENSITY));

export const StarBackground = () => {
  const reducedMotion = useReducedMotion();
  const [count, setCount] = useState(starCount);

  useEffect(() => {
    // Nilai yang sama tidak memicu render ulang, jadi event resize yang
    // membanjir tidak berbiaya selama jumlahnya tidak berubah.
    const onResize = () => setCount(starCount());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {STARS.slice(0, count).map((star) => (
        <div
          key={star.id}
          className={reducedMotion ? "star" : "star animate-pulse-subtle"}
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: `${star.x}%`,
            top: `${star.y}%`,
            opacity: star.opacity,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}

      {/* Meteor bergerak melintasi layar - untuk pengunjung reduced-motion
          dibuang sama sekali, bukan dibekukan di tengah jalan. */}
      {!reducedMotion &&
        SHOOTING.map((meteor) => (
          <div
            key={meteor.id}
            className="meteor animate-meteor"
            style={{
              width: `${meteor.size * 48}px`,
              height: `${meteor.size * 4}px`,
              left: `${meteor.x}%`,
              top: `${meteor.y}%`,
              animationDelay: `${meteor.delay}s`,
              animationDuration: `${meteor.duration}s`,
            }}
          />
        ))}
    </div>
  );
};

import { useMemo } from "react";
import { seeded } from "@/lib/random";

/*
 * Kunang-kunang: partikel dengan lintasan yang menyimpang, bukan satu vektor
 * lurus ke atas - vektor tunggal kerasa kaku. Tiap partikel lewat 4 titik acak
 * (fx/fy 1-4) dan kedipnya animasi terpisah dengan durasi/delay sendiri, jadi
 * gerak dan kedip tidak pernah sinkron satu sama lain.
 */

export const Fireflies = ({ count, size, seed, warmRatio = 0.6 }) => {
  const bits = useMemo(() => {
    const rnd = seeded(seed);
    // Simpangan horizontal tiap titik, makin lama makin bisa menyimpang jauh
    const sway = (spread) => Math.round((rnd() - 0.5) * spread);

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: rnd() * 100,
      bottom: 6 + rnd() * 46,
      dur: 10 + rnd() * 12,
      delay: -rnd() * 22,
      blinkDur: 1.4 + rnd() * 3.2,
      blinkDelay: -rnd() * 5,
      fx1: sway(50),
      fy1: -Math.round(10 + rnd() * 30),
      fx2: sway(90),
      fy2: -Math.round(30 + rnd() * 50),
      fx3: sway(70),
      fy3: -Math.round(20 + rnd() * 60),
      fx4: sway(100),
      fy4: -Math.round(50 + rnd() * 90),
      hot: rnd() < warmRatio,
    }));
  }, [count, seed, warmRatio]);

  return bits.map((b) => (
    <span
      key={b.id}
      className="firefly"
      style={{
        left: `${b.left}%`,
        bottom: `${b.bottom}%`,
        width: size,
        height: size,
        backgroundColor: b.hot ? "hsl(var(--primary-bright))" : "hsl(var(--primary-dim))",
        "--firefly-dur": `${b.dur}s`,
        "--firefly-delay": `${b.delay}s`,
        "--blink-dur": `${b.blinkDur}s`,
        "--blink-delay": `${b.blinkDelay}s`,
        "--fx1": `${b.fx1}px`,
        "--fy1": `${b.fy1}px`,
        "--fx2": `${b.fx2}px`,
        "--fy2": `${b.fy2}px`,
        "--fx3": `${b.fx3}px`,
        "--fy3": `${b.fy3}px`,
        "--fx4": `${b.fx4}px`,
        "--fy4": `${b.fy4}px`,
      }}
    />
  ));
};

import { useMemo } from "react";

/*
 * Partikel bara yang melayang di antara layer kota.
 *
 * Fungsinya memperkuat kedalaman, bukan sekadar hiasan: tiap pita partikel
 * duduk di antara dua layer dan bergerak dengan kecepatan di antara keduanya,
 * jadi ruang di antara layer terisi alih-alih terasa seperti dua bidang datar
 * yang saling geser.
 *
 * Posisinya dibangkitkan sekali lewat PRNG bersemai. Math.random() di badan
 * komponen akan mengocok ulang tiap render - dan komponen ini ikut ter-render
 * setiap babak berganti.
 */

const seeded = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

export const CityParticles = ({ count, size, seed, warmRatio = 0.7 }) => {
  const bits = useMemo(() => {
    const rnd = seeded(seed);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: rnd() * 100,
      bottom: 6 + rnd() * 40,
      dur: 7 + rnd() * 9,
      /* Negatif: partikel sudah di tengah siklusnya saat halaman dibuka.
         Delay positif membuat semuanya diam dulu lalu berangkat serentak. */
      delay: -rnd() * 16,
      driftX: Math.round((rnd() - 0.5) * 40 / 4) * 4,
      driftY: -Math.round((70 + rnd() * 150) / 4) * 4,
      hot: rnd() < warmRatio,
    }));
  }, [count, seed, warmRatio]);

  return bits.map((b) => (
    <span
      key={b.id}
      className="ember"
      style={{
        left: `${b.left}%`,
        bottom: `${b.bottom}%`,
        width: size,
        height: size,
        backgroundColor: b.hot
          ? "hsl(var(--primary-bright))"
          : "hsl(var(--muted-foreground))",
        "--ember-dur": `${b.dur}s`,
        "--ember-delay": `${b.delay}s`,
        "--ember-x": `${b.driftX}px`,
        "--ember-y": `${b.driftY}px`,
      }}
    />
  ));
};

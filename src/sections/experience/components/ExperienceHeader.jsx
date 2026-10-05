import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { categories, pad2, projects, skills } from "../data";

const COUNT_MS = 640;

/* Angka yang menghitung naik saat pertama terlihat - penghitung skor di layar
   hasil. Nilainya dibulatkan tiap frame, jadi geraknya sudah patah-patah dengan
   sendirinya tanpa perlu steps(). Tanpa animasi, angka akhirnya langsung
   ditampilkan: diturunkan saat render, bukan disetel lewat effect. */
const Counter = ({ value }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reducedMotion = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView || reducedMotion) return;
    let raf = 0;
    let start = 0;
    const tick = (now) => {
      start ||= now;
      const t = Math.min((now - start) / COUNT_MS, 1);
      setShown(Math.round(t * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reducedMotion, value]);

  return <span ref={ref}>{pad2(reducedMotion ? value : shown)}</span>;
};

const STATS = [
  { label: "Skill", value: skills.length },
  { label: "Project", value: projects.length },
  { label: "Bidang", value: categories.length },
];

export const ExperienceHeader = () => (
  <motion.header
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between md:gap-10"
  >
    <div className="max-w-xl">
      <h2 className="pixel-font text-pix-lg font-bold md:text-pix-xl">
        My <span className="text-primary">Experience</span>
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Skill yang saya bawa, lalu project tempat semuanya diuji. Tiap skill menunjuk ke project yang
        memakainya, dan tiap project menunjuk balik ke skill di baliknya.
      </p>

      {/* Hanya di panggung scroll. Di sana layar pertama berisi judul dan
          separuh atas panggung, sementara HUD langkahnya masih di bawah lipatan
          - tanpa petunjuk ini tidak ada yang memberi tahu bahwa isinya maju
          mengikuti gulir. Di daftar mengalir, menggulir sudah jelas dengan
          sendirinya. */}
      <p className="pixel-font stage-text-bright mt-5 hidden animate-blink text-pix-sm uppercase motion-reduce:animate-none scrolly:block">
        ▼ Gulir untuk menjelajah
      </p>
    </div>

    <dl className="grid shrink-0 grid-cols-3 gap-2">
      {STATS.map((stat) => (
        <div key={stat.label} className="pix-chip flex flex-col-reverse items-center gap-1 px-4 py-2">
          <dt className="pixel-font text-pix-sm uppercase text-muted-foreground">{stat.label}</dt>
          <dd className="pixel-font stage-text-bright text-pix-md tabular-nums">
            <Counter value={stat.value} />
          </dd>
        </div>
      ))}
    </dl>
  </motion.header>
);

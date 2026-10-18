import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowDown } from "lucide-react";
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

/* Daftar isi halaman. Angka statistiknya dulu tiga kotak terpisah di samping
   judul (Skill / Project / Bidang) - tiga bingkai lagi di layar yang sudah
   penuh bingkai. Di sini angkanya menempel ke bab yang dihitungnya, jadi satu
   baris menjawab dua pertanyaan: apa isi bab ini, dan seberapa banyak. */
const CHAPTERS = [
  {
    id: "skills",
    title: "Skills",
    kicker: "Loadout",
    stats: [
      { label: "skill", value: skills.length },
      { label: "bidang", value: categories.length },
    ],
  },
  {
    id: "projects",
    title: "Projects",
    kicker: "Quest Log",
    stats: [{ label: "project", value: projects.length }],
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/*
 * Bagian pertama halaman: judul saja, setinggi satu layar.
 *
 * Dulu judul, statistik, dan separuh atas panggung Skills berbagi lipatan
 * pertama - panggungnya bahkan ditarik naik ke bawah judul. Semuanya benar
 * sendiri-sendiri, tapi bersama-sama tidak ada yang menang. Sekarang tiap bagian
 * punya layarnya sendiri: judul, lalu Skills, lalu Projects.
 */
export const ExperienceHeader = () => {
  const reducedMotion = useReducedMotion();

  /* Gulir halus ke bab, bukan lompatan hash bawaan browser: dari layar judul,
     melihat halaman bergerak turun memberi tahu bahwa bab itu ada DI BAWAH
     sini, bukan halaman lain. */
  const goTo = (event, id) => {
    const el = document.getElementById(id);
    if (!el) return;
    event.preventDefault();
    el.scrollIntoView({ block: "start", behavior: reducedMotion ? "auto" : "smooth" });
  };

  return (
    <motion.header
      variants={container}
      initial="hidden"
      animate="show"
      className="relative flex min-h-[calc(100svh-5rem)] flex-col justify-center py-16"
    >
      <motion.h2 variants={item} className="pixel-font text-pix-xl font-bold leading-tight md:text-pix-3xl">
        My <span className="text-primary">Experience</span>
      </motion.h2>

      <motion.p
        variants={item}
        className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base"
      >
        Skill yang saya bawa, lalu project tempat semuanya diuji. Tiap skill menunjuk ke project yang
        memakainya, dan tiap project menunjuk balik ke skill di baliknya.
      </motion.p>

      <motion.nav variants={item} aria-label="Isi halaman" className="mt-12 max-w-2xl">
        <ul className="border-t-2 border-border">
          {CHAPTERS.map((chapter, i) => (
            <li key={chapter.id} className="border-b-2 border-border">
              <a
                href={`#${chapter.id}`}
                onClick={(event) => goTo(event, chapter.id)}
                className="group flex items-center gap-4 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="pixel-font border-2 stage-border stage-bg stage-ink px-2 py-1 text-pix-sm tabular-nums">
                  {pad2(i + 1)}
                </span>
                <span className="pixel-font text-pix-md uppercase text-foreground transition-colors duration-100 ease-pix group-hover:stage-text-bright">
                  {chapter.title}
                </span>
                <span className="pixel-font hidden text-pix-sm uppercase text-muted-foreground sm:inline">
                  · {chapter.kicker}
                </span>

                <span className="pixel-font ml-auto flex gap-4 text-pix-sm uppercase tabular-nums text-muted-foreground">
                  {chapter.stats.map((stat) => (
                    <span key={stat.label}>
                      <span className="stage-text-bright">
                        <Counter value={stat.value} />
                      </span>{" "}
                      {stat.label}
                    </span>
                  ))}
                </span>
                <ArrowDown
                  aria-hidden="true"
                  size={14}
                  className="shrink-0 text-muted-foreground transition-transform duration-100 ease-pix group-hover:translate-y-1 group-hover:stage-text"
                />
              </a>
            </li>
          ))}
        </ul>
      </motion.nav>

      {/* Petunjuk gulir di kaki layar judul. Sekarang di SEMUA ukuran layar:
          layar judul setinggi satu layar penuh, jadi di mana pun tidak ada isi
          yang mengintip dari bawah lipatan untuk memberi tahu bahwa halaman ini
          berlanjut. Tanpa variants framer: kedipnya animasi CSS pada opacity,
          dan opacity inline dari framer ikut jadi nilai dasarnya. */}
      <p
        aria-hidden="true"
        className="pixel-font stage-text-bright absolute inset-x-0 bottom-6 animate-blink text-pix-sm uppercase motion-reduce:animate-none"
      >
        ▼ Gulir untuk menjelajah
      </p>
    </motion.header>
  );
};

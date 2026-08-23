import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { MapPin, Download, Github, Instagram, Linkedin, Bot, Crosshair, Signal } from "lucide-react";
import { FaLaravel, FaReact } from "react-icons/fa";
import { SiFlutter } from "react-icons/si";
import { StarBackground } from "./StarBackground";
import { cn } from "@/lib/utils";

const socialLinks = [
  { name: "Github", href: "https://github.com/Devx-cloud", icon: Github },
  { name: "Instagram", href: "https://www.instagram.com/devx.sun/", icon: Instagram },
  { name: "Linkedin", href: "https://www.linkedin.com/in/deva-surya-5a6568380/", icon: Linkedin },
];

const focusStack = [
  { name: "Laravel", icon: <FaLaravel className="h-3.5 w-3.5" /> },
  { name: "Flutter", icon: <SiFlutter className="h-3.5 w-3.5" /> },
  { name: "React", icon: <FaReact className="h-3.5 w-3.5" /> },
];

const projectTeasers = [
  { name: "Loka Pura", desc: "platform AI yang menghidupkan arsitektur pura Bali" },
  { name: "Hand Gesture", desc: "deteksi gestur tangan real-time berbasis computer vision" },
];

// 5 babak: Data Diri -> Skills -> Projects -> Ask AI -> Contact (batas akhir)
const ACTS = [
  { id: "hero", label: "Data Diri" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "ai", label: "Ask AI" },
  { id: "contact", label: "Contact" },
];

// Aksen dideklarasikan ulang di dalam .night-scene, bukan diwarisi dari LevelLayout:
// custom property menyubstitusi var() di elemen tempat ia ditulis, jadi kalau diwarisi
// nilainya terkunci ke --primary tema terang dan merahnya jadi lebih kusam.
const STAGE_VARS = { "--stage-accent": "var(--primary)" };

const RANGES = {
  hero: [0, 0.16, 0.22],
  skills: [0.16, 0.22, 0.36, 0.42],
  projects: [0.36, 0.42, 0.56, 0.62],
  ai: [0.56, 0.62, 0.76, 0.82],
  contact: [0.76, 0.82, 1],
};

// Titik "plateau" tiap babak - dipakai untuk snap saat navigasi keyboard & klik HUD
const SNAP_POINTS = [0, 0.22, 0.42, 0.62, 0.82];

// Tinggi HUD dikunci supaya sprite bisa berdiri tepat di atas garisnya
const HUD_OFFSET = "pb-[68px] md:pb-[76px]";

// Padding kiri hanya menyisakan ruang untuk sprite, sisanya jadi lebar panel
const panelWrap = cn(
  "absolute inset-0 z-20 flex items-center justify-end",
  "pl-[72px] sm:pl-28 md:pl-44 lg:pl-56 pr-4 md:pr-8 lg:pr-12",
  HUD_OFFSET
);

const actionClass =
  "group inline-flex w-fit items-center gap-2 glass-chip stage-border-soft px-4 py-2 pixel-font text-[10px] md:text-xs text-foreground transition-all duration-150 hover:stage-border hover:stage-bg-soft hover:translate-x-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--stage-accent))]";

/* Chrome panel: mengikuti bahasa visual dialogue-box di Title Screen */
const PanelFrame = ({ index, label, hint, children }) => (
  <div className="glass-panel-solid scanlines pixel-corners stage-border relative w-full max-w-lg md:max-w-2xl px-4 pt-8 pb-7 sm:px-5 md:px-7">
    <span className="border-2 stage-border stage-bg stage-ink absolute -top-4 left-4 px-3 py-1 pixel-font text-[9px] md:text-[10px] whitespace-nowrap">
      BABAK {String(index + 1).padStart(2, "0")} · {label.toUpperCase()}
    </span>
    <div className="flex flex-col items-start gap-3">{children}</div>
    <span className="absolute bottom-2 right-3 pixel-font text-[8px] md:text-[9px] stage-text">
      {hint === "end" ? "◆ BATAS AKHIR" : <span className="animate-blink">▼</span>}
    </span>
  </div>
);

const StatRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-2.5">
    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 stage-text" />
    <span className="pixel-font w-14 shrink-0 pt-px text-[9px] uppercase text-foreground/70">
      {label}
    </span>
    <span className="min-w-0 text-xs md:text-sm text-foreground/90">{children}</span>
  </div>
);

export const ProfileSection = () => {
  const containerRef = useRef(null);
  const lastProgressRef = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [facingRight, setFacingRight] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const handleChange = (e) => setReducedMotion(e.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setIsMoving(v > 0.001 && v < 0.999);
    if (v < 0.19) setActiveIndex(0);
    else if (v < 0.39) setActiveIndex(1);
    else if (v < 0.59) setActiveIndex(2);
    else if (v < 0.79) setActiveIndex(3);
    else setActiveIndex(4);

    const delta = v - lastProgressRef.current;
    if (delta > 0.0005) setFacingRight(true);
    else if (delta < -0.0005) setFacingRight(false);
    lastProgressRef.current = v;
  });

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
    [reducedMotion]
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

      setFacingRight(e.key === "ArrowRight");
      const current = scrollYProgress.get();
      const target =
        e.key === "ArrowRight"
          ? SNAP_POINTS.find((p) => p > current + 0.01) ?? 1
          : [...SNAP_POINTS].reverse().find((p) => p < current - 0.01) ?? 0;

      scrollToProgress(target);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollYProgress, scrollToProgress]);

  const mountainX = useTransform(scrollYProgress, [0, 1], ["0%", reducedMotion ? "0%" : "-25%"]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const heroOpacity = useTransform(scrollYProgress, RANGES.hero, [1, 1, 0]);
  const skillsOpacity = useTransform(scrollYProgress, RANGES.skills, [0, 1, 1, 0]);
  const projectsOpacity = useTransform(scrollYProgress, RANGES.projects, [0, 1, 1, 0]);
  const aiOpacity = useTransform(scrollYProgress, RANGES.ai, [0, 1, 1, 0]);
  const contactOpacity = useTransform(scrollYProgress, RANGES.contact, [0, 1, 1]);

  // Panel non-aktif dibuat inert: tidak bisa di-tab, tidak dibaca screen reader
  const actProps = (index) => ({
    inert: activeIndex !== index ? true : undefined,
    "aria-hidden": activeIndex !== index || undefined,
    className: cn(panelWrap, activeIndex !== index && "pointer-events-none"),
  });

  return (
    <motion.section
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative h-[500vh]"
    >
      {/* night-scene: adegan ini selalu malam, lepas dari toggle tema terang/gelap */}
      <div className="night-scene sticky top-20 h-[calc(100vh-5rem)] overflow-hidden bg-background" style={STAGE_VARS}>
        {/* Layer langit: bintang & meteor */}
        <StarBackground />

        {/* Layer tengah: siluet kota */}
        <motion.img
          src="/kota.png"
          alt=""
          style={{ x: mountainX }}
          className="absolute bottom-0 left-0 w-[140%] max-w-none pointer-events-none select-none z-[1]"
        />

        {/* Sprite: berdiri tepat di atas garis HUD, jalan di tempat, hadap sesuai arah navigasi */}
        <motion.img
          src="/idle.png"
          alt=""
          style={{ imageRendering: "pixelated", scaleX: facingRight ? 1 : -1 }}
          animate={!reducedMotion && isMoving ? { y: [0, -6, 0] } : { y: 0 }}
          transition={
            !reducedMotion && isMoving
              ? { duration: 0.5, repeat: Infinity, ease: "linear" }
              : { duration: 0.2 }
          }
          className="absolute bottom-[68px] md:bottom-[76px] left-3 sm:left-6 md:left-12 z-10 w-14 sm:w-20 md:w-28 drop-shadow-[0_0_25px_hsl(var(--stage-accent)/0.45)]"
        />

        {/* Babak 1: Data diri */}
        <motion.div style={{ opacity: heroOpacity }} {...actProps(0)}>
          <PanelFrame index={0} label="Data Diri">
            <div>
              <h1 className="pixel-font text-2xl md:text-4xl font-bold leading-none text-foreground">
                Deva <span className="stage-text">Surya</span>
              </h1>
              <p className="pixel-font-null mt-2 text-[11px] md:text-sm uppercase tracking-[0.18em] stage-text">
                Web &amp; Mobile Developer
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 border-y-2 stage-border-soft py-3">
              <StatRow icon={MapPin} label="Lokasi">
                Tabanan, Bali &mdash; Indonesia
              </StatRow>
              <StatRow icon={Crosshair} label="Fokus">
                Laravel &middot; Flutter &middot; React
              </StatRow>
              <StatRow icon={Signal} label="Status">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 shrink-0 stage-bg stage-glow animate-pulse-subtle" />
                  Terbuka untuk proyek &amp; kolaborasi
                </span>
              </StatRow>
            </div>

            <p className="text-[13px] md:text-sm leading-relaxed text-foreground/80">
              Saya membangun aplikasi web dengan Laravel dan aplikasi mobile dengan Flutter, dengan
              perhatian besar pada struktur data agar setiap fitur tetap rapi, ringan, dan mudah
              dikembangkan. Di luar itu saya mengeksplorasi React dan mengasah kemampuan lewat
              kontribusi ke proyek open&#8209;source.
            </p>
          </PanelFrame>
        </motion.div>

        {/* Babak 2: Skills */}
        <motion.div style={{ opacity: skillsOpacity }} {...actProps(1)}>
          <PanelFrame index={1} label="Skills">
            <h2 className="pixel-font text-xl md:text-3xl font-bold leading-none text-foreground">
              My <span className="stage-text">Skills</span>
            </h2>
            <p className="text-[13px] md:text-sm leading-relaxed text-foreground/80">
              Terbiasa bekerja di dua sisi: Laravel untuk web, Flutter untuk mobile, dan React saat
              antarmuka butuh sentuhan yang lebih modern. Di belakang layar, MySQL dan Git jadi
              bagian dari alur kerja harian.
            </p>
            <div className="flex flex-wrap gap-2">
              {focusStack.map((s) => (
                <span
                  key={s.name}
                  className="flex items-center gap-1.5 glass-chip stage-border-soft px-2.5 py-1 pixel-font text-[9px] md:text-[10px] text-foreground/90"
                >
                  {s.icon} {s.name.toUpperCase()}
                </span>
              ))}
            </div>
            <Link to="/skills" className={actionClass}>
              <span className="stage-text transition-colors group-hover:text-foreground">▶</span>
              BUKA STAGE SKILLS
            </Link>
          </PanelFrame>
        </motion.div>

        {/* Babak 3: Projects */}
        <motion.div style={{ opacity: projectsOpacity }} {...actProps(2)}>
          <PanelFrame index={2} label="Projects">
            <h2 className="pixel-font text-xl md:text-3xl font-bold leading-none text-foreground">
              Featured <span className="stage-text">Projects</span>
            </h2>
            <p className="text-[13px] md:text-sm leading-relaxed text-foreground/80">
              Eksperimen yang berakhir jadi produk nyata &mdash; dari computer vision di browser
              sampai pipeline AI untuk foto, video, dan model 3D.
            </p>
            <ul className="flex w-full flex-col gap-2 border-l-2 stage-border-soft pl-3">
              {projectTeasers.map((p) => (
                <li key={p.name} className="text-xs md:text-sm leading-snug text-muted-foreground">
                  <span className="pixel-font-null uppercase tracking-wide text-foreground">
                    {p.name}
                  </span>{" "}
                  &mdash; {p.desc}
                </li>
              ))}
            </ul>
            <Link to="/projects" className={actionClass}>
              <span className="stage-text transition-colors group-hover:text-foreground">▶</span>
              BUKA STAGE PROJECTS
            </Link>
          </PanelFrame>
        </motion.div>

        {/* Babak 4: Ask AI */}
        <motion.div style={{ opacity: aiOpacity }} {...actProps(3)}>
          <PanelFrame index={3} label="Ask AI">
            <h2 className="pixel-font flex items-center gap-2 text-xl md:text-3xl font-bold leading-none text-foreground">
              <Bot className="h-6 w-6 shrink-0 stage-text" />
              Ask <span className="stage-text">AI</span>
            </h2>
            <p className="text-[13px] md:text-sm leading-relaxed text-foreground/80">
              Ingin tahu lebih dalam soal pengalaman, stack, atau cara saya mengerjakan sebuah
              proyek? Tanyakan langsung ke asisten AI &mdash; ditenagai Gemini dan menjawab
              seketika berdasarkan profil ini.
            </p>
            <Link to="/assistant" className={actionClass}>
              <span className="stage-text transition-colors group-hover:text-foreground">▶</span>
              MULAI PERCAKAPAN
            </Link>
          </PanelFrame>
        </motion.div>

        {/* Babak 5: Contact - penanda batas akhir, tidak fade out */}
        <motion.div style={{ opacity: contactOpacity }} {...actProps(4)}>
          <PanelFrame index={4} label="Contact" hint="end">
            <h2 className="pixel-font text-xl md:text-3xl font-bold leading-none text-foreground">
              Get In <span className="stage-text">Touch</span>
            </h2>
            <p className="text-[13px] md:text-sm leading-relaxed text-foreground/80">
              Punya ide proyek, tawaran kerja, atau sekadar ingin berdiskusi soal teknologi? Saya
              selalu senang menerima pesan baru.
            </p>

            <div className="flex w-full flex-wrap items-center gap-2">
              {socialLinks.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={name}
                  title={name}
                  className="flex h-9 w-9 items-center justify-center glass-chip stage-border-soft text-foreground/80 transition-colors duration-150 hover:stage-border hover:stage-bg-soft hover:stage-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--stage-accent))]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
              <a href="/cv/cv-1.pdf" download className={actionClass}>
                <Download className="h-3.5 w-3.5 stage-text transition-colors group-hover:text-foreground" />
                UNDUH CV
              </a>
            </div>

            <Link to="/contact" className={actionClass}>
              <span className="stage-text transition-colors group-hover:text-foreground">▶</span>
              KIRIM PESAN
            </Link>
          </PanelFrame>
        </motion.div>

        {/* HUD babak: stepper + progress + petunjuk kontrol */}
        <div className="absolute inset-x-0 bottom-0 z-30 h-[68px] md:h-[76px] overflow-hidden glass-panel border-x-0 border-b-0">
          <div className="mx-auto flex h-full max-w-3xl flex-col justify-center gap-1.5 px-3 md:px-6">
            <div className="flex items-stretch gap-1">
              {ACTS.map((act, i) => {
                const isActive = activeIndex === i;
                const isPast = activeIndex > i;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => goToAct(i)}
                    aria-current={isActive ? "step" : undefined}
                    aria-label={`Ke babak ${i + 1}: ${act.label}`}
                    className={cn(
                      "flex flex-1 flex-col items-center justify-center border-2 px-1 py-1 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--stage-accent))]",
                      isActive
                        ? "stage-border stage-bg stage-ink"
                        : isPast
                        ? "stage-border-soft stage-bg-soft hover:stage-border"
                        : "glass-chip hover:stage-border"
                    )}
                  >
                    <span
                      className={cn(
                        "pixel-font text-[8px] md:text-[9px] leading-tight",
                        isActive ? "stage-ink" : "text-foreground/70"
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "hidden truncate pixel-font text-[8px] leading-tight sm:block md:text-[9px]",
                        isActive ? "stage-ink" : "text-foreground/70"
                      )}
                    >
                      {act.label.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 border-2 stage-border-soft glass-chip">
                <motion.div style={{ width: progressWidth }} className="h-full stage-bg" />
              </div>
              <p className="pixel-font shrink-0 text-[8px] md:text-[9px] text-foreground/70">
                ← → PINDAH BABAK
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

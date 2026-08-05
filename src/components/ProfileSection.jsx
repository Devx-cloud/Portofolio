import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { MapPin, Download, Github, Instagram, Linkedin, Bot } from "lucide-react";
import { FaLaravel, FaReact } from "react-icons/fa";
import { SiFlutter } from "react-icons/si";
import { StarBackground } from "./StarBackground";

const socialLinks = [
  { name: "Github", href: "https://github.com/Devx-cloud", icon: Github },
  { name: "Instagram", href: "https://www.instagram.com/devx.sun/", icon: Instagram },
  { name: "Linkedin", href: "https://www.linkedin.com/in/deva-surya-5a6568380/", icon: Linkedin },
];

const focusStack = [
  { name: "Laravel", icon: <FaLaravel className="h-4 w-4" /> },
  { name: "Flutter", icon: <SiFlutter className="h-4 w-4" /> },
  { name: "React", icon: <FaReact className="h-4 w-4" /> },
];

// 5 babak: Personal Data -> Skills -> Projects -> Ask AI -> Contact (batas akhir)
const RANGES = {
  hero: [0, 0.16, 0.22],
  skills: [0.16, 0.22, 0.36, 0.42],
  projects: [0.36, 0.42, 0.56, 0.62],
  ai: [0.56, 0.62, 0.76, 0.82],
  contact: [0.76, 0.82, 1],
};

// Titik "plateau" tiap babak - dipakai untuk snap saat navigasi keyboard
const SNAP_POINTS = [0, 0.22, 0.42, 0.62, 0.82];

const panelClass =
  "absolute inset-y-0 right-0 z-20 w-[70%] sm:w-[60%] md:w-[52%] flex flex-col items-start justify-center gap-3 text-left px-4 md:px-10";

export const ProfileSection = () => {
  const containerRef = useRef(null);
  const lastProgressRef = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [activeBabak, setActiveBabak] = useState("hero");
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
    if (v < 0.19) setActiveBabak("hero");
    else if (v < 0.39) setActiveBabak("skills");
    else if (v < 0.59) setActiveBabak("projects");
    else if (v < 0.79) setActiveBabak("ai");
    else setActiveBabak("contact");

    const delta = v - lastProgressRef.current;
    if (delta > 0.0005) setFacingRight(true);
    else if (delta < -0.0005) setFacingRight(false);
    lastProgressRef.current = v;
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const container = containerRef.current;
      if (!container) return;
      e.preventDefault();

      setFacingRight(e.key === "ArrowRight");

      const containerTop = window.scrollY + container.getBoundingClientRect().top;
      const scrollRange = container.offsetHeight - window.innerHeight;
      const current = scrollYProgress.get();

      const target =
        e.key === "ArrowRight"
          ? SNAP_POINTS.find((p) => p > current + 0.01) ?? 1
          : [...SNAP_POINTS].reverse().find((p) => p < current - 0.01) ?? 0;

      window.scrollTo({
        top: containerTop + target * scrollRange,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollYProgress, reducedMotion]);

  const mountainX = useTransform(scrollYProgress, [0, 1], ["0%", reducedMotion ? "0%" : "-25%"]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const heroOpacity = useTransform(scrollYProgress, RANGES.hero, [1, 1, 0]);
  const skillsOpacity = useTransform(scrollYProgress, RANGES.skills, [0, 1, 1, 0]);
  const projectsOpacity = useTransform(scrollYProgress, RANGES.projects, [0, 1, 1, 0]);
  const aiOpacity = useTransform(scrollYProgress, RANGES.ai, [0, 1, 1, 0]);
  const contactOpacity = useTransform(scrollYProgress, RANGES.contact, [0, 1, 1]);

  return (
    <motion.section
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative h-[500vh]"
    >
      <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-hidden bg-black flex items-center justify-center px-16 md:px-24">
        {/* Layer langit: tema meteor, selalu tampil terlepas dari toggle tema */}
        <StarBackground />

        {/* Layer tengah: siluet kota */}
        <motion.img
          src="/kota.png"
          alt=""
          style={{ x: mountainX }}
          className="absolute bottom-0 left-0 w-[140%] max-w-none pointer-events-none select-none z-[1]"
        />

        {/* Sprite: di kiri, berdiri di atas garis tanah, jalan di tempat, hadap sesuai arah navigasi */}
        <motion.img
          src="/idle.png"
          alt="Deva Surya"
          style={{ imageRendering: "pixelated", scaleX: facingRight ? 1 : -1 }}
          animate={!reducedMotion && isMoving ? { y: [0, -6, 0] } : { y: 0 }}
          transition={
            !reducedMotion && isMoving
              ? { duration: 0.5, repeat: Infinity, ease: "linear" }
              : { duration: 0.2 }
          }
          className="absolute bottom-16 md:bottom-20 left-4 md:left-12 z-10 w-16 sm:w-20 md:w-28 drop-shadow-[0_0_25px_rgba(220,38,38,0.35)]"
        />

        {/* Babak 1: Data diri */}
        <motion.div style={{ opacity: heroOpacity }} className={`${panelClass} pointer-events-none`}>
          <h1 className="pixel-font text-2xl md:text-4xl font-bold">
            Deva <span className="text-primary">Surya</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">Junior Developer</p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" /> Tabanan, Bali, Indonesia
          </p>
          <p className="text-sm md:text-base text-foreground/90 leading-relaxed bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4">
            Developer yang fokus membangun Web dengan Laravel dan Aplikasi Mobile dengan Flutter,
            dengan pengalaman kuat dalam manajemen data untuk aplikasi yang efisien dan terstruktur.
            Selalu antusias menyambut tantangan proyek baru, senang mengeksplorasi teknologi lain
            seperti React, dan terus belajar lewat kontribusi ke proyek open-source.
          </p>
        </motion.div>

        {/* Babak 2: Skills */}
        <motion.div
          style={{ opacity: skillsOpacity }}
          className={`${panelClass} ${activeBabak === "skills" ? "" : "pointer-events-none"}`}
        >
          <h2 className="pixel-font text-xl md:text-3xl font-bold">
            My <span className="text-primary">Skills</span>
          </h2>
          <p className="text-sm md:text-base text-foreground/90 leading-relaxed">
            Terbiasa kerja di dua sisi: Web dengan Laravel, dan Mobile dengan Flutter, ditambah
            React untuk kebutuhan frontend modern.
          </p>
          <div className="flex flex-wrap gap-2">
            {focusStack.map((s) => (
              <span
                key={s.name}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium border rounded-full bg-primary/10 border-primary/30"
              >
                {s.icon} {s.name}
              </span>
            ))}
          </div>
          <Link
            to="/skills"
            className="text-primary hover:text-primary/80 transition-colors text-sm border-b border-primary/40 hover:border-primary"
          >
            Lihat semua skill →
          </Link>
        </motion.div>

        {/* Babak 3: Projects */}
        <motion.div
          style={{ opacity: projectsOpacity }}
          className={`${panelClass} ${activeBabak === "projects" ? "" : "pointer-events-none"}`}
        >
          <h2 className="pixel-font text-xl md:text-3xl font-bold">
            Featured <span className="text-primary">Projects</span>
          </h2>
          <p className="text-sm md:text-base text-foreground/90 leading-relaxed">
            Beberapa proyek pilihan yang menunjukkan keahlian di bidang web dan mobile, dari deteksi
            gestur tangan sampai generator video & model 3D.
          </p>
          <Link
            to="/projects"
            className="text-primary hover:text-primary/80 transition-colors text-sm border-b border-primary/40 hover:border-primary"
          >
            Lihat semua project →
          </Link>
        </motion.div>

        {/* Babak 4: Ask AI */}
        <motion.div
          style={{ opacity: aiOpacity }}
          className={`${panelClass} ${activeBabak === "ai" ? "" : "pointer-events-none"}`}
        >
          <h2 className="pixel-font text-xl md:text-3xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" /> Ask <span className="text-primary">AI</span>
          </h2>
          <p className="text-sm md:text-base text-foreground/90 leading-relaxed">
            Penasaran soal profil, skill, atau proyekku? Tanya langsung ke asisten AI, ditenagai
            Gemini, dan jawab seketika.
          </p>
          <Link
            to="/assistant"
            className="text-primary hover:text-primary/80 transition-colors text-sm border-b border-primary/40 hover:border-primary"
          >
            Tanya AI →
          </Link>
        </motion.div>

        {/* Babak 5: Contact - penanda batas akhir, tidak fade out */}
        <motion.div
          style={{ opacity: contactOpacity }}
          className={`${panelClass} ${activeBabak === "contact" ? "" : "pointer-events-none"}`}
        >
          <h2 className="pixel-font text-xl md:text-3xl font-bold">
            Get In <span className="text-primary">Touch</span>
          </h2>
          <div className="flex items-center gap-4">
            {socialLinks.map(({ name, href, icon: Icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={name}
                className="text-foreground/70 hover:text-primary transition-colors"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
          <a href="/cv/cv-1.pdf" download className="cosmic-button flex items-center gap-2 text-sm">
            <Download className="h-4 w-4" /> Download CV
          </a>
          <Link
            to="/contact"
            className="text-primary hover:text-primary/80 transition-colors text-sm border-b border-primary/40 hover:border-primary"
          >
            Hubungi saya →
          </Link>
        </motion.div>

        {/* Progress bar siku, gaya pixel */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-40 md:w-56 h-3 border-2 border-red-700/70 bg-neutral-900 z-[5]">
          <motion.div style={{ width: progressWidth }} className="h-full bg-red-600" />
        </div>
      </div>
    </motion.section>
  );
};

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Github } from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { FaHtml5, FaCss3Alt, FaLaravel } from "react-icons/fa";
import { SiJavascript, SiAlpinedotjs, SiThreedotjs, SiTailwindcss } from "react-icons/si";

const tagIcons = {
  html: { icon: FaHtml5, color: "text-orange-500" },
  css: { icon: FaCss3Alt, color: "text-blue-500" },
  js: { icon: SiJavascript, color: "text-yellow-400" },
  laravel: { icon: FaLaravel, color: "text-red-600" },
  alpine: { icon: SiAlpinedotjs, color: "text-teal-400" },
  three: { icon: SiThreedotjs, color: "text-foreground" },
  tailwind: { icon: SiTailwindcss, color: "text-cyan-400" },
};

const Projects = [
  {
    id: 1,
    title: "Hand Gesture",
    desc: "Aplikasi deteksi gestur tangan berbasis computer vision yang mengenali pola tangan secara real-time untuk membuka tautan tertentu tanpa sentuhan. Dibangun dengan HTML, CSS, dan JavaScript murni sebagai eksplorasi interaksi berbasis kamera.",
    image: "/projects/hand.png",
    tags: ["html", "css", "js"],
    demoUrl: "#",
    githubUrl: "https://github.com/Devx-cloud/gesture-hand",
  },
  {
    id: 2,
    title: "Loka Pura",
    desc: "Platform AI yang menghidupkan arsitektur pura Bali — mengubah foto menjadi video dinamis dan model 3D, sekaligus merestorasi kenangan lama dengan akurasi tinggi. Dibangun dengan Laravel, Alpine.js, Three.js, dan Tailwind CSS.",
    image: "/projects/lokapura.png",
    tags: ["laravel", "alpine", "three", "tailwind"],
    demoUrl: "#",
    githubUrl: "https://github.com/Devx-cloud/PuraLoka",
  },
  {
    id: 1,
    title: "Hand Gesture",
    desc: "Aplikasi deteksi gestur tangan berbasis computer vision yang mengenali pola tangan secara real-time untuk membuka tautan tertentu tanpa sentuhan. Dibangun dengan HTML, CSS, dan JavaScript murni sebagai eksplorasi interaksi berbasis kamera.",
    image: "/projects/hand.png",
    tags: ["html", "css", "js"],
    demoUrl: "#",
    githubUrl: "https://github.com/Devx-cloud/gesture-hand",
  },
  {
    id: 2,
    title: "Loka Pura",
    desc: "Platform AI yang menghidupkan arsitektur pura Bali — mengubah foto menjadi video dinamis dan model 3D, sekaligus merestorasi kenangan lama dengan akurasi tinggi. Dibangun dengan Laravel, Alpine.js, Three.js, dan Tailwind CSS.",
    image: "/projects/lokapura.png",
    tags: ["laravel", "alpine", "three", "tailwind"],
    demoUrl: "#",
    githubUrl: "https://github.com/Devx-cloud/PuraLoka",
  },
];

const total = Projects.length;
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

export const ProjectSection = () => {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

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
    setActiveIndex(clamp(Math.floor(v * total), 0, total - 1));
  });

  const goToIndex = (i) => {
    setActiveIndex(i);
    const container = containerRef.current;
    if (!container) return;
    const containerTop = window.scrollY + container.getBoundingClientRect().top;
    const scrollRange = container.offsetHeight - window.innerHeight;
    const progress = (i + 0.5) / total;
    window.scrollTo({
      top: containerTop + progress * scrollRange,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  const active = Projects[activeIndex];

  return (
    <>
      <motion.section
        id="projects"
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
        style={{ height: `${total * 100}vh` }}
      >
        <div className="sticky top-20 h-[calc(100vh-5rem)] flex flex-col justify-center px-4">
          <div className="container mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-10 items-center">
            {/* Kolom kiri: headline statis */}
            <div className="text-center md:text-left">
              <h2
                className="pixel-font text-2xl md:text-4xl font-bold mb-3"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9), 0 0 24px rgba(0,0,0,0.6)" }}
              >
                Featured <span className="text-primary">Projects</span>
              </h2>
              <p
                className="text-foreground/80 max-w-md mx-auto md:mx-0"
                style={{ textShadow: "0 1px 8px rgba(0,0,0,0.9)" }}
              >
                Beberapa proyek pilihan yang menunjukkan keahlian saya di bidang web dan mobile.
              </p>
              <motion.a
                href="https://github.com/Devx-cloud"
                className="text-sm cosmic-button w-fit inline-flex items-center gap-2 mt-5"
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)" }}
                transition={{ duration: 0.2 }}
              >
                View My Github <ArrowRight size={16} />
              </motion.a>
            </div>

            {/* Navigasi angka */}
            <div className="flex md:flex-col items-center justify-center gap-4 md:gap-6 md:border-l md:border-border md:pl-6 order-first md:order-none">
              {Projects.map((project, i) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => goToIndex(i)}
                  aria-current={activeIndex === i ? "true" : undefined}
                  aria-label={`Lihat project ${project.title}`}
                  className={`pixel-font-null text-2xl md:text-3xl leading-none transition-colors duration-300 ${
                    activeIndex === i
                      ? "text-primary font-bold"
                      : "text-foreground/30 hover:text-foreground/60"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Kolom kanan: kartu konten cross-fade */}
            <div className="relative min-h-[420px] md:min-h-[480px]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={active.id}
                  initial={{
                    opacity: 0,
                    y: reducedMotion ? 0 : 18,
                    scale: reducedMotion ? 1 : 0.97,
                    filter: reducedMotion ? "blur(0px)" : "blur(6px)",
                  }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{
                    opacity: 0,
                    y: reducedMotion ? 0 : -18,
                    scale: reducedMotion ? 1 : 0.97,
                    filter: reducedMotion ? "blur(0px)" : "blur(6px)",
                  }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.6,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute inset-0 flex flex-col"
                >
                  <div className="project-image-reveal project-gloss relative h-52 md:h-60 overflow-hidden shrink-0 rounded-2xl">
                    <img
                      src={active.image}
                      alt={active.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="pt-4 md:pt-5 flex flex-col flex-1">
                    <div className="flex flex-wrap gap-3 mb-3">
                      {active.tags.map((tag, idx) => {
                        const meta = tagIcons[tag];
                        return (
                          <div
                            key={tag}
                            className="tag-reveal"
                            style={{ animationDelay: `${0.35 + idx * 0.07}s` }}
                          >
                            <div
                              title={tag}
                              aria-label={tag}
                              style={{ animationDelay: `${idx * 0.15}s` }}
                              className="tag-float flex items-center justify-center w-10 h-10 rounded-lg bg-card border border-border/60 shadow-sm"
                            >
                              {meta ? (
                                <meta.icon className={`w-5 h-5 ${meta.color}`} />
                              ) : (
                                <span className="text-[9px] uppercase text-foreground/70">{tag}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <h3
                      className="project-reveal pixel-font-null uppercase tracking-wide text-lg mb-2"
                      style={{ animationDelay: "0.2s" }}
                    >
                      {active.title}
                    </h3>
                    <p
                      className="project-reveal text-foreground/70 text-sm leading-relaxed mb-4 flex-1"
                      style={{ animationDelay: "0.3s" }}
                    >
                      {active.desc}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA persist di semua state: github repo dari project yang sedang aktif */}
      <a
        href={active.githubUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`Github: ${active.title}`}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 cosmic-button flex items-center justify-center"
      >
        <Github size={18} />
      </a>
    </>
  );
};

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Github, ExternalLink } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { FaHtml5, FaCss3Alt, FaLaravel } from "react-icons/fa";
import { SiJavascript, SiAlpinedotjs, SiThreedotjs, SiTailwindcss } from "react-icons/si";
import { cn } from "@/lib/utils";

/* Warna merek, sama seperti logo di stage Skills - lihat catatan --brand-*
   di index.css. Token-nya menyesuaikan tema; hex mentah tidak bisa. */
const tagIcons = {
  html: { icon: FaHtml5, color: "text-brand-html" },
  css: { icon: FaCss3Alt, color: "text-brand-css" },
  js: { icon: SiJavascript, color: "text-brand-js" },
  laravel: { icon: FaLaravel, color: "text-brand-laravel" },
  alpine: { icon: SiAlpinedotjs, color: "text-brand-alpine" },
  three: { icon: SiThreedotjs, color: "text-brand-three" },
  tailwind: { icon: SiTailwindcss, color: "text-brand-tailwind" },
};

/* id harus unik - dipakai sebagai key AnimatePresence, kalau kembar transisinya tidak jalan */
const Projects = [
  {
    id: 1,
    title: "Hand Gesture",
    year: "2025",
    desc: "Aplikasi deteksi gestur tangan berbasis computer vision yang mengenali pola tangan secara real-time untuk membuka tautan tertentu tanpa sentuhan. Dibangun dengan HTML, CSS, dan JavaScript murni sebagai eksplorasi interaksi berbasis kamera.",
    image: "/projects/hand.png",
    tags: ["html", "css", "js"],
    demoUrl: "#",
    githubUrl: "https://github.com/Devx-cloud/gesture-hand",
  },
  {
    id: 2,
    title: "Loka Pura",
    year: "2025",
    desc: "Platform AI yang menghidupkan arsitektur pura Bali — mengubah foto menjadi video dinamis dan model 3D, sekaligus merestorasi kenangan lama dengan akurasi tinggi. Dibangun dengan Laravel, Alpine.js, Three.js, dan Tailwind CSS.",
    image: "/projects/lokapura.png",
    tags: ["laravel", "alpine", "three", "tailwind"],
    demoUrl: "#",
    githubUrl: "https://github.com/Devx-cloud/PuraLoka",
  },
];

const total = Projects.length;
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const hasLink = (url) => Boolean(url) && url !== "#";

const linkClass =
  "pixel-font inline-flex items-center gap-2 border-2 px-3 py-2 text-pix-xs uppercase transition-all duration-100 ease-pix md:text-pix-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

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

  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

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
    <motion.section
      id="projects"
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
      style={{ height: `${total * 100}vh` }}
    >
      <div className="sticky top-20 flex h-[calc(100vh-5rem)] flex-col justify-center px-4">
        <div className="container mx-auto grid max-w-5xl grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-10">
          {/* Kolom kiri: headline statis */}
          <div className="text-center md:text-left">
            <h2 className="pixel-font mt-3 mb-3 text-pix-lg font-bold md:text-pix-xl">
              Featured <span className="text-primary">Projects</span>
            </h2>

            <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground md:mx-0">
              Eksperimen yang berakhir jadi produk nyata — dari computer vision di browser sampai
              pipeline AI untuk foto, video, dan model 3D.
            </p>

            {/* Indikator posisi */}
            <div className="mx-auto mt-5 flex max-w-md items-center gap-3 md:mx-0">
              <span className="pixel-font shrink-0 text-pix-xs tabular-nums text-muted-foreground md:text-pix-xs">
                {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
              <div className="h-4 flex-1 pix-inset">
                <motion.div style={{ width: progressWidth }} className="h-full stage-bg" />
              </div>
            </div>

            <a
              href="https://github.com/Devx-cloud"
              target="_blank"
              rel="noreferrer"
              className={cn(
                linkClass,
                "mt-5 stage-border stage-bg-soft stage-text stage-shadow hover:stage-glow active:translate-y-1"
              )}
            >
              View My Github <ArrowRight size={14} />
            </a>
          </div>

          {/* Navigasi angka */}
          <div className="order-first flex items-center justify-center gap-3 md:order-none md:flex-col md:gap-4 md:border-l-2 md:border-border md:pl-6">
            {Projects.map((project, i) => (
              <button
                key={project.id}
                type="button"
                onClick={() => goToIndex(i)}
                aria-current={activeIndex === i ? "true" : undefined}
                aria-label={`Lihat project ${project.title}`}
                className={cn(
                  "pixel-font flex h-9 w-9 items-center justify-center border-2 text-pix-xs tabular-nums transition-all duration-100 ease-pix",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  activeIndex === i
                    ? "stage-border stage-bg-soft stage-text"
                    : "pix-chip text-muted-foreground hover:stage-border hover:text-foreground"
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </button>
            ))}
          </div>

          {/* Kolom kanan: kartu konten cross-fade */}
          <div className="relative min-h-[432px] md:min-h-[480px]">
            <AnimatePresence initial={false}>
              <motion.div
                key={active.id}
                initial={{
                  opacity: 0,
                  y: reducedMotion ? 0 : 18,
                  scale: 1,
                }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: reducedMotion ? 0 : -18,
                  scale: 1,
                }}
                transition={{ duration: reducedMotion ? 0 : 0.25, ease: "linear" }}
                className="absolute inset-0 flex flex-col"
              >
                <div className="project-image-reveal project-gloss relative h-48 shrink-0 overflow-hidden border-2 stage-border-soft md:h-56">
                  <img src={active.image} alt={active.title} className="h-full w-full object-cover" />
                  <span className="pixel-font absolute right-2 top-2 pix-chip px-2 py-1 text-pix-xs tabular-nums text-foreground/80 md:text-pix-xs">
                    {active.year}
                  </span>
                </div>

                <div className="flex flex-1 flex-col pt-4">
                  <div className="mb-3 flex flex-wrap gap-2">
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
                            className="tag-float flex h-9 w-9 items-center justify-center pix-chip"
                          >
                            {meta ? (
                              <meta.icon className={`h-4 w-4 ${meta.color}`} />
                            ) : (
                              <span className="text-pix-xs uppercase text-muted-foreground">{tag}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <h3
                    className="project-reveal pixel-font-null mb-2 text-lg uppercase tracking-[1px]"
                    style={{ animationDelay: "0.2s" }}
                  >
                    {active.title}
                  </h3>

                  <p
                    className="project-reveal mb-4 flex-1 text-sm leading-relaxed text-muted-foreground"
                    style={{ animationDelay: "0.3s" }}
                  >
                    {active.desc}
                  </p>

                  {/* Aksi per project - menggantikan tombol melayang di pojok layar */}
                  <div
                    className="project-reveal flex flex-wrap gap-2"
                    style={{ animationDelay: "0.4s" }}
                  >
                    <a
                      href={active.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        linkClass,
                        "pix-chip text-foreground/80 hover:stage-border hover:stage-text"
                      )}
                    >
                      <Github size={14} /> Lihat Kode
                    </a>

                    {hasLink(active.demoUrl) && (
                      <a
                        href={active.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          linkClass,
                          "stage-border stage-bg-soft stage-text stage-shadow hover:stage-glow"
                        )}
                      >
                        <ExternalLink size={14} /> Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

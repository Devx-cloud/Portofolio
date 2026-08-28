import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { projects, total } from "../data";
import { ProjectCard } from "./ProjectCard";
import { GithubLink, ProjectCounter, SectionIntro } from "./SectionIntro";

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

/*
 * Desktop: satu project per layar, cross-fade mengikuti scroll (scroll-jack).
 * Aman di sini karena grid 3 kolom menjaga semuanya muat dalam calc(100vh-5rem).
 */
export const DesktopScrollShowcase = () => {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useReducedMotion();

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
    window.scrollTo({
      top: containerTop + ((i + 0.5) / total) * scrollRange,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  const active = projects[activeIndex];

  return (
    <motion.section
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative hidden md:block"
      style={{ height: `${total * 100}vh` }}
    >
      <div className="sticky top-20 flex h-[calc(100vh-5rem)] flex-col justify-center px-4">
        <div className="container mx-auto grid max-w-5xl grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-10">
          {/* Kolom kiri: headline statis + indikator posisi */}
          <div>
            <SectionIntro />

            <div className="mx-auto mt-5 flex max-w-md items-center gap-3 md:mx-0">
              <ProjectCounter index={activeIndex} />
              <div className="h-4 flex-1 pix-inset">
                <motion.div style={{ width: progressWidth }} className="h-full stage-bg" />
              </div>
            </div>

            <GithubLink className="mt-5" />
          </div>

          {/* Navigasi angka */}
          <div className="order-first flex items-center justify-center gap-3 md:order-none md:flex-col md:gap-4 md:border-l-2 md:border-border md:pl-6">
            {projects.map((project, i) => (
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
                initial={{ opacity: 0, y: reducedMotion ? 0 : 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : -18 }}
                transition={{ duration: reducedMotion ? 0 : 0.25, ease: "linear" }}
                className="absolute inset-0 flex flex-col"
              >
                <ProjectCard project={active} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

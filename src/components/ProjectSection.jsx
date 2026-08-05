import { useRef } from "react";
import { ArrowRight, ExternalLink, Github } from "lucide-react";
import { motion, useMotionValue, useTransform, useAnimationFrame, animate } from "framer-motion";

const Projects = [
    {
        id:1,
        title: "Hand Gesture",
        desc:"deteksi tangan untuk masuk link url [index]",
        image: "/projects/hand.png" ,
        tags: ["html", "css", "js"],
        demoUrl: "#",
        githubUrl: "https://github.com/Devx-cloud/gesture-hand"
    },
    {
        id:2,
        title: "Loka Pura",
        desc:"website generate video dan 3D model",
        image: "/projects/lokapura.png" ,
        tags: ["laravel", "alpine", "three", "tailwind"],
        demoUrl: "#",
        githubUrl: "https://github.com/Devx-cloud/PuraLoka"
    },
    {
        id:1,
        title: "Hand Gesture",
        desc:"deteksi tangan untuk masuk link url [index]",
        image: "/projects/hand.png" ,
        tags: ["html", "css", "js"],
        demoUrl: "#",
        githubUrl: "https://github.com/Devx-cloud/gesture-hand"
    },
    {
        id:2,
        title: "Loka Pura",
        desc:"website generate video dan 3D model",
        image: "/projects/lokapura.png" ,
        tags: ["laravel", "alpine", "three", "tailwind"],
        demoUrl: "#",
        githubUrl: "https://github.com/Devx-cloud/PuraLoka"
    },
    // {
    //     id:3,
    //     title: "pro3",
    //     desc:"Lorem ipsum dolor sit amet.wdawad",
    //     image: "/projects/arlechino.jpeg" ,
    //     tags: ["image", "gila"],
    //     demoUrl: "#",
    //     githubUrl: "#"
    // },
]

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

// Jarak antar kartu di carousel 3D
const ANGLE_STEP = 32; // derajat rotateY per langkah
const SPACING = 220; // px pergeseran x per langkah
const DEPTH = 140; // px mundur ke belakang (translateZ) per langkah
const SECONDS_PER_CARD = 4; // makin kecil makin cepat berputar

const mod = (n, m) => ((n % m) + m) % m;

const CarouselCard = ({ project, index, total, t, pausedRef }) => {
  const rel = useTransform(t, (v) => {
    let r = mod(index - v, total);
    if (r > total / 2) r -= total;
    return r;
  });

  const x = useTransform(rel, (r) => r * SPACING);
  const rotateY = useTransform(rel, (r) => r * -ANGLE_STEP);
  const z = useTransform(rel, (r) => -Math.abs(r) * DEPTH);
  const scale = useTransform(rel, (r) => 1 - Math.min(Math.abs(r) * 0.16, 0.5));
  const opacity = useTransform(rel, (r) => 1 - Math.min(Math.abs(r) * 0.28, 0.75));

  const handleLinkClick = (e) => {
    e.stopPropagation();
    pausedRef.current = true;
  };

  return (
    <motion.div
      style={{ x, rotateY, z, scale, opacity }}
      className="absolute top-0 left-1/2 -ml-[130px] w-[260px] rounded-xl overflow-hidden border-2 border-border bg-card shadow-2xl cursor-pointer [transform-style:preserve-3d]"
    >
      <div className="h-56 overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          className="w-full h-full object-cover select-none pointer-events-none"
        />
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-1 mb-2">
          {project.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 text-[10px] font-medium border rounded-full bg-primary/20 text-secondary-foreground">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="font-semibold text-sm mb-1">{project.title}</h3>
        <p className="text-muted-foreground text-xs mb-3 line-clamp-2">{project.desc}</p>
        <div className="flex gap-3">
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noreferrer"
            onClick={handleLinkClick}
            className="text-foreground/80 hover:text-primary transition-colors duration-300"
          >
            <ExternalLink size={16} />
          </a>
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            onClick={handleLinkClick}
            className="text-foreground/80 hover:text-primary transition-colors duration-300"
          >
            <Github size={16} />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export const ProjectSection = () => {
    const t = useMotionValue(0);
    const pausedRef = useRef(false);
    const draggingRef = useRef(false);
    const movedRef = useRef(false);
    const startXRef = useRef(0);
    const startTRef = useRef(0);
    const total = Projects.length;

    useAnimationFrame((_, delta) => {
        if (pausedRef.current) return;
        t.set(t.get() + delta / 1000 / SECONDS_PER_CARD);
    });

    const focusCard = (index) => {
        const current = t.get();
        const candidates = [index - total, index, index + total];
        const target = candidates.reduce((best, c) =>
            Math.abs(c - current) < Math.abs(best - current) ? c : best
        );
        pausedRef.current = true;
        animate(t, target, {
            duration: 0.6,
            ease: "easeInOut",
            onComplete: () => {
                pausedRef.current = false;
            },
        });
    };

    // Kartu yang dirotasi 3D punya bounding box yang tidak pas dengan bentuk
    // visualnya, jadi klik dideteksi lewat posisi kursor relatif ke tengah
    // track, bukan lewat hit-test elemen kartu satu-satu.
    const handleTrackClick = (e) => {
        if (movedRef.current) return; // baru saja digeser, jangan anggap sebagai klik
        const rect = e.currentTarget.getBoundingClientRect();
        const offsetFromCenter = e.clientX - (rect.left + rect.width / 2);
        const approxRel = Math.round(offsetFromCenter / SPACING);
        if (approxRel === 0) return; // klik di kartu depan, tidak ada yang perlu berubah
        const targetIndex = mod(Math.round(t.get() + approxRel), total);
        focusCard(targetIndex);
    };

    const handlePointerDown = (e) => {
        draggingRef.current = true;
        movedRef.current = false;
        pausedRef.current = true;
        startXRef.current = e.clientX;
        startTRef.current = t.get();
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!draggingRef.current) return;
        const deltaX = e.clientX - startXRef.current;
        if (Math.abs(deltaX) > 4) movedRef.current = true;
        t.set(startTRef.current - deltaX / SPACING);
    };

    const endDrag = (e) => {
        if (!draggingRef.current) return;
        draggingRef.current = false;
        pausedRef.current = false;
        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {}
        // reset flag setelah event klik yang menyertai pointerup selesai diproses
        setTimeout(() => (movedRef.current = false), 0);
    };

    return (
        <motion.section
            id="projects"
            className="pt-8 pb-16 px-4 relative overflow-x-hidden md:h-[calc(100vh-5rem)] md:overflow-y-hidden md:flex md:flex-col md:justify-center"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
            <div className="container mx-auto max-w-5xl">
                <motion.h2
                    className="text-2xl md:text-4xl font-bold mb-4 text-center pixel-font"
                    style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9), 0 0 24px rgba(0,0,0,0.6)" }}
                    variants={fadeInUpVariants}
                >
                    Featured <span className="text-primary">Projects</span>
                </motion.h2>
                <motion.p
                    className="text-center text-foreground/80 mb-6 max-w-2xl mx-auto"
                    style={{ textShadow: "0 1px 8px rgba(0,0,0,0.9)" }}
                    variants={fadeInUpVariants}
                >
                    Beberapa proyek pilihan yang menunjukkan keahlian saya di bidang web dan mobile.
                </motion.p>

                <div
                    className="relative h-[380px] md:h-[420px] cursor-grab active:cursor-grabbing touch-pan-y"
                    style={{ perspective: "1400px" }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onClick={handleTrackClick}
                >
                    <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
                        {Projects.map((project, index) => (
                            <CarouselCard
                                key={`${project.id}-${index}`}
                                project={project}
                                index={index}
                                total={total}
                                t={t}
                                pausedRef={pausedRef}
                            />
                        ))}
                    </div>
                </div>

                <div className="text-center mt-5">
                    <motion.a
                        href="https://github.com/Devx-cloud"
                        className="text-sm cosmic-button w-fit flex items-center mx-auto gap-2"
                        target="_blank"
                        whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)" }}
                        transition={{ duration: 0.2 }}
                    >
                        Check My Github <ArrowRight size={16}/>
                    </motion.a>
                </div>
            </div>
        </motion.section>
    )
}

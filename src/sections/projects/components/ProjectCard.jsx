import { ExternalLink, Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { hasLink, linkClass, tagIcons } from "../data";

/* Isi satu kartu project, lepas dari cara ia ditampilkan - dipakai baik oleh
   daftar mengalir di mobile maupun cross-fade sticky di desktop. */
export const ProjectCard = ({ project }) => (
  <div className="flex flex-1 flex-col">
    <div className="project-image-reveal project-gloss relative h-48 shrink-0 overflow-hidden border-2 stage-border-soft md:h-56">
      {/* lazy aman dipasang tanpa syarat: peramban hanya menunda gambar DI LUAR
          viewport, jadi kartu aktif di showcase desktop tetap dimuat seketika,
          sementara kartu di bawah lipatan pada daftar mobile ditunda. */}
      <img
        src={project.image}
        alt={project.title}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
      <span className="pixel-font absolute right-2 top-2 pix-chip px-2 py-1 text-pix-xs tabular-nums text-foreground/80">
        {project.year}
      </span>
    </div>

    <div className="flex flex-1 flex-col pt-4">
      <div className="mb-3 flex flex-wrap gap-2">
        {project.tags.map((tag, idx) => {
          const meta = tagIcons[tag];
          return (
            <div key={tag} className="tag-reveal" style={{ animationDelay: `${0.35 + idx * 0.07}s` }}>
              <div
                title={tag}
                aria-label={tag}
                style={{ animationDelay: `${idx * 0.15}s` }}
                className="tag-float flex h-9 w-9 items-center justify-center pix-chip"
              >
                {meta ? (
                  <meta.icon className={cn("h-4 w-4", meta.color)} />
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
        {project.title}
      </h3>

      <p
        className="project-reveal mb-4 flex-1 text-sm leading-relaxed text-muted-foreground"
        style={{ animationDelay: "0.3s" }}
      >
        {project.desc}
      </p>

      <div className="project-reveal flex flex-wrap gap-2" style={{ animationDelay: "0.4s" }}>
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noreferrer"
          className={cn(linkClass, "pix-chip text-foreground/80 hover:stage-border hover:stage-text")}
        >
          <Github size={14} /> Lihat Kode
        </a>

        {hasLink(project.demoUrl) && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(linkClass, "stage-border stage-bg-soft stage-text stage-shadow hover:stage-glow")}
          >
            <ExternalLink size={14} /> Live Demo
          </a>
        )}
      </div>
    </div>
  </div>
);

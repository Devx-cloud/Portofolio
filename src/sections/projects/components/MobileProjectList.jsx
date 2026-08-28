import { cn } from "@/lib/utils";
import { projects } from "../data";
import { ProjectCard } from "./ProjectCard";
import { GithubLink, ProjectCounter, SectionIntro } from "./SectionIntro";

/*
 * Mobile: daftar mengalir biasa, TANPA sticky/scroll-jack.
 *
 * Panel sticky bertinggi tetap yang dipakai desktop cocok kalau kontennya pasti
 * muat satu layar (grid 3 kolom di md+). Begitu grid jatuh jadi 1 kolom,
 * tumpukan headline + nav + kartu lebih tinggi dari layar dan overflow-hidden
 * memotong sisanya tanpa cara untuk scroll ke situ. Dua scrollbar bersarang
 * bukan jawabannya - scroll-jack-nya yang dilepas sama sekali di sini.
 */
export const MobileProjectList = () => (
  <div className="container mx-auto max-w-xl px-4 py-10 md:hidden">
    <SectionIntro />

    <div className="mt-8 flex flex-col gap-8">
      {projects.map((project, i) => (
        <div key={project.id} className={cn("flex flex-col", i > 0 && "pt-4")}>
          {/* Pembatas antar project; nomornya sekaligus menggantikan navigasi
              angka desktop yang tidak ikut dirender di sini. */}
          <div className="mb-4 flex items-center gap-3">
            <ProjectCounter index={i} />
            <span aria-hidden="true" className="h-0.5 flex-1 bg-border" />
          </div>

          <ProjectCard project={project} />
        </div>
      ))}
    </div>

    <GithubLink className="mt-8 justify-center" />
  </div>
);

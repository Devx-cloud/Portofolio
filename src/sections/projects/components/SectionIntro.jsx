import { ArrowRight } from "lucide-react";
import { GITHUB_URL } from "@/data/profile";
import { cn } from "@/lib/utils";
import { linkClass, total } from "../data";

export const SectionIntro = () => (
  <div className="text-center md:text-left">
    <h2 className="pixel-font mt-3 mb-3 text-pix-lg font-bold md:text-pix-xl">
      Featured <span className="text-primary">Projects</span>
    </h2>
    <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground md:mx-0">
      Eksperimen yang berakhir jadi produk nyata — dari computer vision di browser sampai pipeline
      AI untuk foto, video, dan model 3D.
    </p>
  </div>
);

export const GithubLink = ({ className }) => (
  <a
    href={GITHUB_URL}
    target="_blank"
    rel="noreferrer"
    className={cn(
      linkClass,
      "stage-border stage-bg-soft stage-text stage-shadow hover:stage-glow active:translate-y-1",
      className
    )}
  >
    View My Github <ArrowRight size={14} />
  </a>
);

/* Penanda "project ke berapa dari berapa". */
export const ProjectCounter = ({ index }) => (
  <span className="pixel-font shrink-0 text-pix-xs tabular-nums text-muted-foreground">
    {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
  </span>
);

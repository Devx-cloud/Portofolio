import { Link } from "react-router-dom";
import { actionClass } from "../constants";
import { cn } from "@/lib/utils";

/* Chrome panel babak: mengikuti bahasa visual dialogue-box di Title Screen. */
export const ActPanel = ({ index, label, hint, children }) => (
  <div className="pix-dialog crt pix-corners stage-border relative w-full max-w-lg md:max-w-2xl px-4 pt-8 pb-7 sm:px-5 md:px-7">
    <span className="border-2 stage-border stage-bg stage-ink absolute -top-4 left-4 px-3 py-1 pixel-font text-pix-xs md:text-pix-sm whitespace-nowrap">
      BABAK {String(index + 1).padStart(2, "0")} · {label.toUpperCase()}
    </span>
    <div className="flex flex-col items-start gap-3">{children}</div>
    <span className="absolute bottom-2 right-3 pixel-font text-pix-xs md:text-pix-sm stage-text-bright">
      {hint === "end" ? "◆ BATAS AKHIR" : <span className="animate-blink">▼</span>}
    </span>
  </div>
);

export const ActTitle = ({ children, as: Tag = "h2", size = "lg" }) => (
  <Tag
    className={cn(
      "pixel-font font-bold leading-none text-foreground",
      size === "xl" ? "text-pix-xl md:text-pix-2xl" : "text-pix-lg md:text-pix-xl"
    )}
  >
    {children}
  </Tag>
);

export const ActText = ({ children }) => (
  <p className="text-[13px] md:text-sm leading-relaxed text-foreground/80">{children}</p>
);

/* Tombol "buka stage" - dipakai empat dari lima babak. */
export const ActLink = ({ to, children }) => (
  <Link to={to} className={actionClass}>
    <span className="stage-text transition-colors group-hover:text-foreground">▶</span>
    {children}
  </Link>
);

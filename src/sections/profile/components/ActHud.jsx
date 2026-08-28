import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ACTS } from "../acts";

const stepClass = (isActive, isPast) =>
  cn(
    "flex flex-1 flex-col items-center justify-center border-2 px-1 py-1 transition-colors duration-100 ease-pix",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--stage-accent))]",
    isActive
      ? "stage-border stage-bg stage-ink"
      : isPast
      ? "stage-border-soft stage-bg-soft hover:stage-border"
      : "pix-chip hover:stage-border"
  );

/* HUD babak: stepper + bilah progres + petunjuk kontrol.
   Tinggi 68/76px dipesan lewat HUD_OFFSET di panelWrap - kalau salah satu
   berubah, panel babak akan tertimbun HUD. */
export const ActHud = ({ activeIndex, onSelect, progressWidth }) => (
  <div className="absolute inset-x-0 bottom-0 z-30 h-[68px] md:h-[76px] overflow-hidden pix-veil border-t-4 stage-border">
    <div className="mx-auto flex h-full max-w-3xl flex-col justify-center gap-2 px-3 md:px-6">
      <div className="flex items-stretch gap-1">
        {ACTS.map((act, i) => {
          const isActive = activeIndex === i;
          const ink = isActive ? "stage-ink" : "text-foreground/70";
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => onSelect(i)}
              aria-current={isActive ? "step" : undefined}
              aria-label={`Ke babak ${i + 1}: ${act.label}`}
              className={stepClass(isActive, activeIndex > i)}
            >
              <span className={cn("pixel-font text-pix-xs md:text-pix-sm leading-tight", ink)}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={cn("hidden truncate pixel-font text-pix-xs leading-tight sm:block", ink)}
              >
                {act.label.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="h-3 flex-1 pix-inset">
          <motion.div style={{ width: progressWidth }} className="h-full stage-bg" />
        </div>
        <p className="pixel-font shrink-0 text-pix-xs md:text-pix-sm text-foreground/70">
          ← → PINDAH BABAK
        </p>
      </div>
    </div>
  </div>
);

import { stages } from "@/data/stages";
import { cn } from "@/lib/utils";

/* Daftar stage sebagai menu utama game. */
export const StageList = ({ selected, entering, onSelect, onEnter }) => (
  <nav aria-label="Menu utama" className="flex w-full flex-col gap-2 md:w-80">
    {stages.map((stage, index) => {
      const isSelected = index === selected;
      return (
        <button
          key={stage.id}
          type="button"
          onClick={() => onEnter(index)}
          onMouseEnter={() => onSelect(index)}
          onFocus={() => onSelect(index)}
          aria-current={isSelected ? "true" : undefined}
          /* Tiap stage bawa hue-nya sendiri - ini sumber variasi warna menu. */
          style={{ "--stage-accent": stage.accent }}
          className={cn(
            "pix-chip pixel-font flex items-center gap-3 px-3 py-3 text-left text-pix-sm transition-all duration-100 ease-pix md:text-pix-md",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--stage-accent))]",
            isSelected
              ? "stage-border stage-bg-soft stage-text stage-glow translate-x-1"
              : "text-muted-foreground hover:stage-border hover:text-foreground",
            entering && isSelected && "border-foreground bg-foreground/90 text-background"
          )}
        >
          <span className={cn("w-3 shrink-0", isSelected ? "opacity-100" : "opacity-0")}>▶</span>
          <span
            className={cn("text-pix-xs tabular-nums", isSelected ? "opacity-70" : "opacity-40")}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="flex-1">{stage.label.toUpperCase()}</span>
        </button>
      );
    })}
  </nav>
);

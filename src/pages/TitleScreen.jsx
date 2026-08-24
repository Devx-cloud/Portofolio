import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { stages } from "../data/stages";
import { StarBackground } from "../components/StarBackground";
import { useTypewriter } from "../hooks/useTypewriter";
import { cn } from "@/lib/utils";

export const TitleScreen = () => {
  const [selected, setSelected] = useState(0);
  const [entering, setEntering] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const navigate = useNavigate();

  const activeStage = stages[selected];
  const typed = useTypewriter(activeStage.desc, 18);
  const dialogue = reducedMotion ? activeStage.desc : typed;

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const handleChange = (e) => setReducedMotion(e.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  const enterStage = useCallback(
    (index) => {
      if (entering) return;
      setSelected(index);
      setEntering(true);
    },
    [entering]
  );

  useEffect(() => {
    if (!entering) return;
    const timeout = setTimeout(() => navigate(stages[selected].path), 260);
    return () => clearTimeout(timeout);
  }, [entering, selected, navigate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (entering) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((prev) => (prev + 1) % stages.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((prev) => (prev - 1 + stages.length) % stages.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        enterStage(selected);
      } else if (/^[1-9]$/.test(e.key)) {
        const index = Number(e.key) - 1;
        if (index < stages.length) {
          e.preventDefault();
          setSelected(index);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, entering, enterStage]);

  return (
    <div
      className="night-scene fixed inset-0 z-20 overflow-hidden bg-background"
      style={{ "--stage-accent": activeStage.accent }}
    >
      <StarBackground />

      {/* Sorotan multi-hue tipis supaya latar tidak cuma hitam-merah */}
      <div aria-hidden="true" className="aurora pointer-events-none absolute inset-0 z-[1]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center overflow-y-auto px-5 py-12 md:px-8">
        <div
          className={cn(
            "flex w-full max-w-5xl flex-col items-center gap-10 transition-all duration-100 ease-pix",
            "md:flex-row md:items-center md:justify-between md:gap-12",
            entering ? "scale-95 opacity-0" : "scale-100 opacity-100"
          )}
        >
          {/* Kiri: judul + menu */}
          <div className="flex w-full flex-col items-start md:w-auto">
            <h1 className="pixel-font text-pix-2xl font-bold leading-none md:text-pix-3xl">
              <span className="text-glow text-foreground">Dev</span>
              <span className="text-primary">_X</span>
            </h1>
            <p className="pixel-font mt-2 text-pix-xs uppercase tracking-[4px] text-muted-foreground md:text-pix-xs">
              Portofolio &middot; Deva Surya
            </p>

            <p className="pixel-font stage-text mt-7 mb-4 animate-blink text-pix-xs md:text-xs">
              PRESS ENTER TO SELECT
            </p>

            <nav aria-label="Menu utama" className="flex w-full flex-col gap-2 md:w-80">
              {stages.map((stage, index) => {
                const isSelected = index === selected;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => enterStage(index)}
                    onMouseEnter={() => !entering && setSelected(index)}
                    onFocus={() => !entering && setSelected(index)}
                    aria-current={isSelected ? "true" : undefined}
                    /* Tiap stage bawa hue-nya sendiri - ini sumber variasi warna menu */
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
                    <span className={cn("w-3 shrink-0", isSelected ? "opacity-100" : "opacity-0")}>
                      ▶
                    </span>
                    <span
                      className={cn(
                        "text-pix-xs tabular-nums md:text-pix-xs",
                        isSelected ? "opacity-70" : "opacity-40"
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1">{stage.label.toUpperCase()}</span>
                  </button>
                );
              })}
            </nav>

            <p className="pixel-font mt-7 text-pix-xs leading-relaxed text-faint md:text-pix-xs">
              ↑↓ Pilih &nbsp;·&nbsp; Enter Masuk &nbsp;·&nbsp; 1-5 Lompat
            </p>
          </div>

          {/* Kanan: karakter + kotak dialog yang ikut babak terpilih */}
          <div className="flex w-full max-w-sm shrink-0 flex-col items-center md:w-96">
            <img
              src="/dev_left.png"
              alt="Deva Surya"
              className="sprite z-10 -mb-4 h-44 w-44 object-cover drop-shadow-[4px_4px_0_hsl(var(--pit))] md:h-64 md:w-64"
            />

            <div className="pix-dialog crt pix-corners stage-border relative w-full px-5 pt-7 pb-6">
              <span className="pix-chip stage-border stage-bg-soft stage-text pixel-font absolute -top-4 left-3 px-3 py-1 text-pix-xs md:text-xs">
                DEV_X
              </span>
              <span className="pix-chip pixel-font absolute -top-4 right-3 px-2 py-1 text-pix-xs tabular-nums text-muted-foreground md:text-pix-xs">
                {String(selected + 1).padStart(2, "0")} / {String(stages.length).padStart(2, "0")}
              </span>

              <p className="pixel-font relative z-[2] min-h-[60px] text-pix-sm leading-relaxed text-foreground/90 md:min-h-[72px] md:text-pix-md">
                {dialogue}
              </p>

              <span className="stage-text absolute bottom-2 right-3 z-[2] animate-blink">▼</span>
            </div>
          </div>
        </div>
      </div>

      <p className="pixel-font pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 text-pix-xs uppercase tracking-[2px] text-faint">
        Deva Surya &middot; Portofolio v2
      </p>
    </div>
  );
};

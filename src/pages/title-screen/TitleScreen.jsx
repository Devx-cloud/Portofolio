import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { stages } from "@/data/stages";
import { Fireflies } from "@/components/backgrounds/Fireflies";
import { StarBackground } from "@/components/backgrounds/StarBackground";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { useTypewriter } from "@/hooks/useTypewriter";
import { cn } from "@/lib/utils";
import { DialogueBox } from "./components/DialogueBox";
import { StageList } from "./components/StageList";

// Jeda animasi "masuk stage" sebelum route benar-benar berpindah.
const ENTER_DELAY = 260;

export const TitleScreen = () => {
  const [selected, setSelected] = useState(0);
  const [entering, setEntering] = useState(false);
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const activeStage = stages[selected];
  const typed = useTypewriter(activeStage.desc, 18);
  const dialogue = reducedMotion ? activeStage.desc : typed;

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
    const timeout = setTimeout(() => navigate(stages[selected].path), ENTER_DELAY);
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
      className="fixed inset-0 z-20 overflow-hidden bg-background"
      style={{ "--stage-accent": activeStage.accent }}
    >
      <StarBackground />

      {/* Sorotan multi-hue tipis supaya latar tidak cuma hitam-merah */}
      <div aria-hidden="true" className="aurora pointer-events-none absolute inset-0 z-[1]" />

      {/* Siluet atap kota - langitnya transparan supaya bintang & meteor tembus */}
      <img
        src="/menu-bg.png"
        alt=""
        aria-hidden="true"
        className="sprite pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[170vh] w-full object-cover object-bottom select-none"
      />

      {!reducedMotion && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[3]">
          <Fireflies count={22} size={3} seed={73} warmRatio={0.6} />
        </div>
      )}

      {/* h-dvh (bukan min-h-screen) supaya tingginya PASTI, bukan sekadar minimum -
          overflow-y-auto baru jadi scroll beneran kalau ada batas tinggi yang
          jelas. Tanpa ini kelebihannya kepotong diam-diam oleh overflow-hidden
          milik pembungkus di atas, tanpa cara untuk di-scroll. */}
      <div className="relative z-10 flex h-dvh items-center justify-center overflow-y-auto px-5 py-12 md:px-8">
        <div
          className={cn(
            "flex w-full max-w-5xl flex-col items-center gap-10 transition-all duration-100 ease-pix",
            "md:flex-row md:items-center md:justify-between md:gap-12",
            entering ? "scale-95 opacity-0" : "scale-100 opacity-100"
          )}
        >
          <div className="flex w-full flex-col items-start md:w-auto">
            <h1 className="pixel-font text-pix-2xl font-bold leading-none md:text-pix-3xl">
              <span className="text-glow text-foreground">Dev</span>
              <span className="text-primary">_X</span>
            </h1>
            <p className="pixel-font mt-2 text-pix-xs uppercase tracking-[4px] text-muted-foreground">
              Portofolio &middot; Deva Surya
            </p>

            <p className="pixel-font stage-text mt-7 mb-4 animate-blink text-pix-xs md:text-xs">
              PRESS ENTER TO SELECT
            </p>

            <StageList
              selected={selected}
              entering={entering}
              onSelect={(i) => !entering && setSelected(i)}
              onEnter={enterStage}
            />

            <p className="pixel-font mt-7 text-pix-xs leading-relaxed text-faint">
              ↑↓ Pilih &nbsp;·&nbsp; Enter Masuk &nbsp;·&nbsp; 1-5 Lompat
            </p>
          </div>

          <DialogueBox text={dialogue} index={selected} total={stages.length} />
        </div>
      </div>

      <p className="pixel-font pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 text-pix-xs uppercase tracking-[2px] text-faint">
        Deva Surya &middot; Portofolio v2
      </p>
    </div>
  );
};

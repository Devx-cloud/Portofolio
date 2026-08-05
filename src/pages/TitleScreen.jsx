import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { stages } from "../data/stages";
import { StarBackground } from "../components/StarBackground";
import { cn } from "@/lib/utils";

export const TitleScreen = () => {
  const [selected, setSelected] = useState(0);
  const [entering, setEntering] = useState(false);
  const navigate = useNavigate();

  const enterStage = (index) => {
    if (entering) return;
    setSelected(index);
    setEntering(true);
  };

  useEffect(() => {
    if (!entering) return;
    const timeout = setTimeout(() => navigate(stages[selected].path), 220);
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
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, entering]);

  return (
    <div className="fixed inset-0 z-20 bg-black overflow-hidden">
      <StarBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-16">
        <div
          className={cn(
            "w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-12 transition-all duration-200 ease-in",
            entering ? "opacity-0 scale-95" : "opacity-100 scale-100"
          )}
        >
          {/* Left: menu */}
          <div className="flex flex-col items-start">
            <div className="flex items-center mb-2">
              <h1 className="pixel-font text-3xl md:text-6xl font-bold ml-2">
                <span className="text-glow text-white">Dev</span>
                <span className="text-red-500">_X</span>
              </h1>
            </div>
            <p className="pixel-font text-[10px] md:text-xs text-red-500 mb-10 animate-blink">
              PRESS ENTER TO SELECT
            </p>

            <nav className="flex flex-col items-stretch gap-3 w-64 md:w-80">
              {stages.map((stage, index) => {
                const isSelected = index === selected;
                return (
                  <button
                    key={stage.id}
                    onClick={() => enterStage(index)}
                    onMouseEnter={() => !entering && setSelected(index)}
                    className={cn(
                      "pixel-font text-left px-4 py-3 border-2 transition-all duration-150 flex items-center gap-3",
                      isSelected
                        ? "bg-red-600 text-white border-red-500 scale-105 shadow-lg"
                        : "bg-neutral-900/70 text-neutral-300 border-neutral-700 hover:border-red-500/60"
                    )}
                  >
                    <span className={cn("w-4 shrink-0", isSelected ? "opacity-100" : "opacity-0")}>
                      ▶
                    </span>
                    {stage.label.toUpperCase()}
                  </button>
                );
              })}
            </nav>

            <p className="pixel-font text-[9px] md:text-[10px] text-neutral-500 mt-10">
              ↑↓ Move &nbsp;·&nbsp; Enter Select
            </p>
          </div>

          {/* Right: character + dialogue box (Fire Emblem style) */}
          <div className="w-64 md:w-96 flex flex-col items-center shrink-0">
            <img
              src="/dev_left.png"
              alt="Deva Surya"
              style={{ imageRendering: "pixelated" }}
              className="w-48 h-48 md:w-64 md:h-64 object-cover -mb-4 z-10 drop-shadow-[0_0_25px_rgba(220,38,38,0.35)]"
            />

            <div className="relative w-full bg-neutral-900 border-4 border-red-700 px-5 pt-7 pb-5 shadow-lg">
              <span className="absolute -top-4 left-3 bg-red-600 border-2 border-red-400 px-3 py-1 pixel-font text-[10px] md:text-xs text-white">
                DEV_X
              </span>

              <p className="pixel-font text-[11px] md:text-sm text-neutral-200 leading-relaxed">
                Selamat datang, traveler.
                <br />
                Siap menjelajahi dunia project-ku?
              </p>

              <span className="absolute bottom-2 right-3 text-red-500 animate-blink">▼</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

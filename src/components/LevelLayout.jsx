import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { stages } from "../data/stages";

export const LevelLayout = ({ stage, children }) => {
  const index = stages.findIndex((s) => s.id === stage.id);
  const prevStage = index > 0 ? stages[index - 1] : null;
  const nextStage = index < stages.length - 1 ? stages[index + 1] : null;

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-background/50 backdrop-blur-sm">
        <Link
          to="/"
          className="pixel-font text-xs md:text-sm text-foreground/80 hover:text-primary transition-colors duration-300 border-2 border-border px-3 py-2"
        >
          «« MENU
        </Link>
        <span className="pixel-font text-[10px] md:text-xs text-primary hidden sm:block">
          STAGE {String(index + 1).padStart(2, "0")} · {stage.label.toUpperCase()}
        </span>
        <ThemeToggle />
      </div>

      <main className="pt-20">{children}</main>

      {prevStage && (
        <Link
          to={prevStage.path}
          aria-label={`Previous: ${prevStage.label}`}
          className="fixed left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 hover:opacity-70 transition-opacity"
        >
          <img src="/arrow.png" alt="" className="w-12 md:w-16 h-auto scale-x-[-1]" />
        </Link>
      )}
      <Link
        to={nextStage ? nextStage.path : "/"}
        aria-label={nextStage ? `Next: ${nextStage.label}` : "Back to menu"}
        className="fixed right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 hover:opacity-70 transition-opacity"
      >
        <img src="/arrow.png" alt="" className="w-12 md:w-16 h-auto" />
      </Link>
    </div>
  );
};

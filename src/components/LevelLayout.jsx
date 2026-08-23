import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { stages } from "../data/stages";

export const LevelLayout = ({ stage, children }) => {
  const index = stages.findIndex((s) => s.id === stage.id);

  return (
    <div
      className="relative min-h-screen bg-background text-foreground"
      style={{ "--stage-accent": stage.accent }}
    >
      <header className="glass-panel fixed inset-x-0 top-0 z-30 flex items-center justify-between border-x-0 border-t-0 px-4 py-3">
        <Link
          to="/"
          className="glass-chip pixel-font stage-border-soft px-3 py-2 text-xs text-foreground/80 transition-all duration-200 hover:stage-text hover:stage-border md:text-sm"
        >
          &laquo;&laquo; MENU
        </Link>

        <span className="pixel-font stage-text hidden text-[10px] uppercase sm:block md:text-xs">
          Stage {String(index + 1).padStart(2, "0")} &middot; {stage.label}
        </span>

        <ThemeToggle />

        <span aria-hidden="true" className="stage-bg absolute inset-x-0 bottom-0 h-0.5 opacity-70" />
      </header>

      <div aria-hidden="true" className="ember-wash pointer-events-none fixed inset-0 z-0" />

      <main className="relative z-10 pt-20">{children}</main>
    </div>
  );
};

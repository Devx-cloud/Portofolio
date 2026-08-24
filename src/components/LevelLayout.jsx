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
      {/* h-20 WAJIB sama dengan pt-20 di main dan top-20 / 5rem di panggung.
          Sebelumnya tingginya dibiarkan mengikuti isi (64px di mobile, 68px di
          desktop) sementara tiga tempat lain tetap memesan 80px - selisihnya
          muncul sebagai celah kosong di bawah header. */}
      <header className="pix-veil fixed inset-x-0 top-0 z-30 flex h-20 items-center justify-between border-b-4 stage-border px-4">
        <Link
          to="/"
          className="pix-chip pixel-font stage-border-soft px-3 py-2 text-xs text-foreground/80 transition-all duration-100 ease-pix hover:stage-text hover:stage-border md:text-sm"
        >
          &laquo;&laquo; MENU
        </Link>

        <span className="pixel-font stage-text hidden text-pix-xs uppercase sm:block md:text-xs">
          Stage {String(index + 1).padStart(2, "0")} &middot; {stage.label}
        </span>

        <ThemeToggle />
      </header>

      <div aria-hidden="true" className="aurora pointer-events-none fixed inset-0 z-0" />

      <main className="relative z-10 pt-20">{children}</main>
    </div>
  );
};

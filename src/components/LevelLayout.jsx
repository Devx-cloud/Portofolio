import { Link } from "react-router-dom";

/*
 * Bar stage. Isinya sengaja hanya dua: jalan kembali ke menu, dan nama stage.
 *
 * Yang pernah ada di sini dan dibuang:
 *   - Panah antar stage. Di Profile ia bertabrakan makna dengan HUD babak -
 *     bar menampilkan panah ke "Skills" sebagai STAGE berikutnya, sementara
 *     HUD menampilkan "02 SKILLS" sebagai BABAK. Title Screen tetap
 *     satu-satunya tempat memilih stage.
 *   - Theme toggle dan label "Stage NN".
 *
 * h-20 WAJIB sama dengan pt-20 di main dan top-20 / 5rem di panggung. Kalau
 * tinggi bar dibiarkan mengikuti isinya, selisihnya muncul sebagai celah
 * kosong di bawah bar - itu pernah terjadi waktu tingginya 64-68px sementara
 * tiga tempat lain tetap memesan 80px.
 */

export const LevelLayout = ({ stage, children }) => (
  <div
    className="relative min-h-screen bg-background text-foreground"
    style={{ "--stage-accent": stage.accent }}
  >
    <header className="pix-veil fixed inset-x-0 top-0 z-30 flex h-20 items-center justify-between border-b-4 stage-border px-4">
      <Link
        to="/"
        className="pix-chip pixel-font stage-border-soft px-3 py-2 text-xs text-foreground/80 transition-all duration-100 ease-pix hover:stage-text hover:stage-border md:text-sm"
      >
        &laquo;&laquo; MENU
      </Link>

      {/* Teksnya dari stages.js, bukan ditulis di dalam section masing-masing -
          satu stage satu nama, tidak bisa lepas sinkron. */}
      <span className="pixel-font pix-chip stage-border-soft stage-text px-3 py-2 text-pix-xs uppercase">
        {stage.badge}
      </span>
    </header>

    <div aria-hidden="true" className="aurora pointer-events-none fixed inset-0 z-0" />

    <main className="relative z-10 pt-20">{children}</main>
  </div>
);

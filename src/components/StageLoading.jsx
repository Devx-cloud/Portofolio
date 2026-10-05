/*
 * Layar tunggu stage: muncul hanya saat chunk atau aset stage belum tiba.
 *
 * Empat blok berkedip bergiliran (step-start, bukan pudar) - bar muat ala game,
 * bukan spinner. Warnanya ikut --stage-accent, jadi harus dipasang di dalam
 * LevelLayout yang menyetel variabel itu.
 *
 * role="status" supaya pembaca layar mengumumkan bahwa sesuatu sedang dimuat,
 * bukan mendengar keheningan di tengah perpindahan halaman.
 */
export const StageLoading = ({ label = "Memuat stage", className = "" }) => (
  <div
    role="status"
    className={`flex min-h-[calc(100svh-5rem)] flex-col items-center justify-center gap-4 px-4 ${className}`}
  >
    <p className="pixel-font text-pix-sm uppercase tracking-[2px] text-muted-foreground">{label}</p>
    <div aria-hidden="true" className="flex gap-2">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="stage-bg h-3 w-3 animate-blink"
          style={{ animationDelay: `${i * 0.25}s` }}
        />
      ))}
    </div>
  </div>
);

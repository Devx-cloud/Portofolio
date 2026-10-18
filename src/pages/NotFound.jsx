import { useEffect } from "react";
import { Link } from "react-router-dom";
import { preloadStage, stages } from "@/data/stages";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

/* Halaman tidak ditemukan, dalam bahasa yang sama dengan sisa situs: bingkai
   dialog RPG, label pixel, gerak patah-patah (animate-float dan animate-bob memakai
   steps(); animate-bounce bawaan Tailwind halus dan melanggar aturan itu), dan
   teks berbahasa Indonesia.

   Bukan kebuntuan: selain jalan ke menu, tiap stage ditawarkan langsung. Pengunjung
   yang salah ketik alamat hampir selalu tahu stage mana yang dicarinya. */

const chipBase =
  "pix-chip pixel-font text-pix-sm uppercase transition-all duration-100 ease-pix " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export const NotFound = () => {
  useDocumentTitle("404 · Halaman tidak ditemukan | Deva Surya");

  /* Situs ini SPA yang menjawab SEMUA alamat dengan 200 dan index.html, jadi mesin
     pencari tidak bisa membedakan halaman ini dari yang asli. noindex-lah yang
     memberitahunya. Dilepas saat pindah, supaya tidak menempel ke halaman lain. */
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <main
      id="main"
      className="relative z-10 flex min-h-svh flex-col items-center justify-center px-4 py-16"
    >
      <div className="pix-dialog crt pix-corners stage-border relative w-full max-w-lg px-5 pt-10 pb-7 text-center md:px-8">
        <span className="pix-chip stage-border stage-bg stage-ink pixel-font absolute -top-4 left-4 px-3 py-1 text-pix-sm">
          ERROR 404
        </span>

        <h1 className="pixel-font-null flex justify-center text-[96px] font-bold leading-none tracking-[4px] md:text-[128px]">
          <span className="animate-float text-primary">4</span>
          <span className="animate-bob">0</span>
          <span className="animate-float text-primary">4</span>
        </h1>

        <p className="mt-6 text-base leading-relaxed text-foreground/90 md:text-lg">
          Halaman yang kamu cari tidak ada, atau alamatnya sudah berpindah.
        </p>

        <Link
          to="/"
          className={`${chipBase} stage-border stage-bg-soft stage-text-bright stage-shadow mt-6 inline-flex items-center gap-2 px-5 py-3 hover:stage-glow active:translate-y-1`}
        >
          <span aria-hidden="true">&laquo;&laquo;</span> Kembali ke menu
        </Link>

        <nav aria-label="Langsung ke stage" className="mt-7 border-t-2 stage-border-soft pt-5">
          <p className="pixel-font mb-3 text-pix-sm uppercase text-muted-foreground">Atau langsung ke</p>
          <ul className="flex flex-wrap justify-center gap-2">
            {stages.map((stage) => (
              <li key={stage.id}>
                <Link
                  to={stage.path}
                  onPointerEnter={() => preloadStage(stage.id)}
                  onFocus={() => preloadStage(stage.id)}
                  className={`${chipBase} stage-border-soft block px-3 py-2 text-foreground/80 hover:stage-border hover:stage-text`}
                >
                  {stage.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
};

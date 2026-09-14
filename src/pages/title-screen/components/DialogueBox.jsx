import { Portrait } from "./Portrait";

/* Potret + kotak dialog yang ikut stage terpilih.

   z-10 di panel itu wajib, bukan rapi-rapi: potretnya cutout sebatas dada, dan
   garis potong datarnya disembunyikan dengan cara berakhir DI BALIK panel ini.
   Tanpa z-10 panel kalah tumpuk dari potret dan garis potongnya terlihat.
   Chip "DEV_X" dan penghitung ikut naik bersama panel, jadi keduanya tetap
   terbaca di atas bahu. Sisa alasannya ada di Portrait.jsx. */
export const DialogueBox = ({ text, index, total }) => (
  <div className="flex w-full max-w-sm shrink-0 flex-col items-center md:w-96">
    <Portrait />

    <div className="pix-dialog crt pix-corners stage-border relative z-10 w-full px-5 pt-7 pb-6">
      <span className="pix-chip stage-border stage-bg-soft stage-text-bright pixel-font absolute -top-4 left-3 px-3 py-1 text-pix-xs md:text-xs">
        DEV_X
      </span>
      <span className="pix-chip pixel-font absolute -top-4 right-3 px-2 py-1 text-pix-xs tabular-nums text-muted-foreground">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>

      <p className="pixel-font relative z-[2] min-h-[60px] text-pix-sm leading-relaxed text-foreground/90 md:min-h-[72px] md:text-pix-md">
        {text}
      </p>

      <span className="stage-text absolute bottom-2 right-3 z-[2] animate-blink">▼</span>
    </div>
  </div>
);

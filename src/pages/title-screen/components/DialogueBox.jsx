/* Karakter + kotak dialog yang ikut stage terpilih.

   Karakter disembunyikan di HP: dialogue box-nya sendiri sudah cukup tinggi, dan
   di layar sempit menu+dialog+karakter yang ditumpuk satu kolom gampang lebih
   tinggi dari layar. */
export const DialogueBox = ({ text, index, total }) => (
  <div className="flex w-full max-w-sm shrink-0 flex-col items-center md:w-96">
    <img
      src="/dev_left.png"
      alt="Deva Surya"
      className="sprite z-10 -mb-4 hidden h-44 w-44 object-cover drop-shadow-[4px_4px_0_hsl(var(--pit))] md:block md:h-64 md:w-64"
    />

    <div className="pix-dialog crt pix-corners stage-border relative w-full px-5 pt-7 pb-6">
      <span className="pix-chip stage-border stage-bg-soft stage-text pixel-font absolute -top-4 left-3 px-3 py-1 text-pix-xs md:text-xs">
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

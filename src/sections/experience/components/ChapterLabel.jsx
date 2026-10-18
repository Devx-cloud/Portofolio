import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { GITHUB_URL } from "@/data/profile";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "../constants";
import { linkClass, pad2 } from "../data";

/* Kepala tiap bab. Nomor, nama, dan julukan game-nya ("Loadout", "Quest Log")
   dipakai sama persis di kedua bab - itu yang membuat keduanya terbaca sebagai
   dua bab dari satu halaman, bukan dua halaman yang ditempel.

   Garisnya menyapu dari kiri saat pertama terlihat (dari porto_v3). Lewat
   scaleX, bukan width: hanya transform yang bisa dianimasikan tanpa memaksa
   browser menghitung ulang tata letak tiap frame. */
export const ChapterLabel = ({ index, title, kicker, meta, progress, className }) => (
  <div className={cn("mb-4 flex items-center gap-3", className)}>
    <span className="pixel-font border-2 stage-border stage-bg stage-ink px-2 py-1 text-pix-sm tabular-nums">
      {pad2(index)}
    </span>
    <h3 className="pixel-font text-pix-md uppercase leading-none text-foreground">{title}</h3>
    <span className="pixel-font hidden text-pix-sm uppercase text-muted-foreground sm:inline">
      · {kicker}
    </span>

    {/* Dengan `progress`, garisnya berhenti jadi hiasan dan mulai bekerja: ia
        jadi rel yang terisi mengikuti gulir, sehingga kepala bab yang menempel
        di atas layar sekaligus memberi tahu sudah sampai mana. scaleX, bukan
        width - hanya transform yang bisa dianimasikan tiap frame tanpa memaksa
        browser menghitung ulang tata letak. */}
    {progress ? (
      <span aria-hidden="true" className="relative h-0.5 flex-1 bg-border">
        <motion.span
          style={{ scaleX: progress }}
          className="absolute inset-0 origin-left stage-bg"
        />
      </span>
    ) : (
      <motion.span
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: easeOutExpo }}
        className="h-0.5 flex-1 origin-left bg-border"
      />
    )}

    {meta && (
      <span className="pixel-font shrink-0 text-pix-sm uppercase tabular-nums text-muted-foreground">
        {meta}
      </span>
    )}
  </div>
);

export const GithubLink = ({ className }) => (
  <a
    href={GITHUB_URL}
    target="_blank"
    rel="noreferrer"
    className={cn(
      linkClass,
      "stage-border stage-bg-soft stage-text stage-shadow hover:stage-glow active:translate-y-1",
      className
    )}
  >
    View My Github <ArrowRight size={14} />
  </a>
);

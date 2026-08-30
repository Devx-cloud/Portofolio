import { AnimatePresence, motion } from "framer-motion";
import { TIERS, categoryLabel } from "../data";
import { StatBar } from "./StatBar";

/*
 * Panel detail - sisi kanan layar status.
 *
 * Isinya satu skill: yang sedang disorot di grid. Inilah satu-satunya tempat
 * ikon merek tampil BERWARNA PENUH dan berukuran besar, jadi warna punya satu
 * titik fokus alih-alih tersebar di 13 kartu sekaligus.
 *
 * Dua bentuk, bukan satu bentuk yang mengecil:
 *
 *   lg ke atas - kolom tegak di samping grid, rata tengah, tinggi tetap supaya
 *                berganti skill tidak menggeser apa pun.
 *   di bawah lg - baris mendatar dan pendek, DI ATAS grid. Bukan di bawahnya:
 *                di sana ia berada setelah 13 kartu, dan mengetuk slot berarti
 *                memperbarui panel yang tidak kelihatan.
 */
export const SkillDetail = ({ skill }) => {
  if (!skill) return null;
  const tier = TIERS[skill.tier];

  return (
    /* self-start: tanpa ini panel ikut diregangkan setinggi grid oleh baris grid
       induknya, dan sisa ruang di bawah isinya jadi kotak kosong sepanjang
       beberapa ratus piksel. */
    <div className="pix-panel crt relative order-1 self-start px-5 pt-7 pb-5 lg:order-none lg:sticky lg:top-24">
      <span className="pixel-font absolute -top-3 left-4 pix-chip stage-border stage-bg-soft stage-text-bright px-3 py-1 text-pix-xs uppercase whitespace-nowrap">
        Detail
      </span>

      {/* Diberi key: berganti skill berarti elemen baru, jadi animasi masuknya
          terpicu ulang alih-alih hanya menukar teks diam-diam. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={skill.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="flex items-center gap-4 text-left lg:min-h-[268px] lg:flex-col lg:items-center lg:gap-4 lg:text-center"
        >
          <div className="pix-inset flex h-16 w-16 shrink-0 items-center justify-center lg:h-24 lg:w-24">
            <skill.Icon className={`h-9 w-9 lg:h-14 lg:w-14 ${skill.color}`} />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2 lg:contents">
            <div>
              <h3 className="pixel-font-null text-base uppercase tracking-[1px] text-foreground lg:text-lg">
                {skill.name}
              </h3>
              <p className="pixel-font mt-1 text-pix-xs uppercase tracking-[1px] text-muted-foreground lg:mt-2">
                {categoryLabel(skill.category)}
              </p>
            </div>

            <div className="w-full border-y-2 stage-border-soft py-2 lg:py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="pixel-font text-pix-xs uppercase text-foreground/70">Tingkat</span>
                <span className="pixel-font stage-text-bright text-pix-xs uppercase">{tier.label}</span>
              </div>
              <StatBar blocks={tier.blocks} blockClass="h-2" className="mt-2" />
            </div>

            <p className="text-xs leading-relaxed text-foreground/80">{skill.desc}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

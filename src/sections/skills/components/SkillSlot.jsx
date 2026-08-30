import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TIERS } from "../data";
import { StatBar } from "./StatBar";

const slotVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.18 } },
};

/*
 * Satu slot di grid, seperti petak inventory.
 *
 * Kotaknya tetap kotak - tidak diputar, tidak dimiringkan. Kedalamannya datang
 * dari bayangan keras yang bergeser (pix-lift), bukan dari perspektif 3D: apa
 * pun yang memutar elemen ini akan membuat bingkai 4px-nya di-anti-alias dan
 * tepinya bergerigi, dan tepi keras itu justru ciri seluruh situs ini.
 *
 * Ikonnya abu-abu sampai slotnya jadi yang aktif. Aturan itu dipertahankan dari
 * versi sebelumnya karena alasannya masih berlaku: 13 warna merek sekaligus
 * membuat halaman ini berisik dibanding bagian lain yang disiplin navy+merah.
 * Yang berubah cuma pemicunya - dulu hover/tap per kartu, sekarang mengikuti
 * slot mana yang sedang dibaca di panel detail. Warna jadi penanda fokus, bukan
 * sekadar hadiah sentuhan.
 */
export const SkillSlot = ({ skill, isActive, onFocus }) => {
  const tier = TIERS[skill.tier];

  return (
    <motion.li variants={slotVariants} className="list-none">
      <button
        type="button"
        /* pointerenter, bukan mouseenter: satu penangan untuk kursor maupun
           sentuhan. onClick tetap ada supaya keyboard dan layar sentuh yang
           tidak mengirim pointerenter tetap bisa memilih. */
        onPointerEnter={onFocus}
        onFocus={onFocus}
        onClick={onFocus}
        aria-pressed={isActive}
        aria-label={`${skill.name} - ${tier.label}`}
        className={cn(
          "pix-lift group relative flex h-full w-full flex-col items-center gap-3 pix-panel p-4 text-center",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          isActive ? "stage-border pix-lift-active" : "hover:pix-lift-hover"
        )}
      >
        <div
          className={cn(
            "mt-1 transition-transform duration-100 ease-pix",
            isActive && "scale-110"
          )}
        >
          <skill.Icon
            className={cn(
              "h-10 w-10 transition-all duration-300 ease-pix md:h-12 md:w-12",
              skill.color,
              isActive ? "grayscale-0" : "grayscale"
            )}
          />
        </div>

        <h3
          className={cn(
            "pixel-font-null text-sm uppercase leading-tight tracking-[1px] md:text-base",
            isActive ? "stage-text" : "text-foreground/80"
          )}
        >
          {skill.name}
        </h3>

        <div className="mt-auto w-full pt-1">
          <StatBar blocks={tier.blocks} />
        </div>
      </button>
    </motion.li>
  );
};

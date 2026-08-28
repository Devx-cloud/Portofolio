import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TIERS } from "../data";
import { StatBar } from "./StatBar";

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.18 } },
};

/* 13 warna brand sekaligus bikin halaman ini berisik dibanding bagian lain yang
   disiplin navy+merah. Jadi ikonnya abu-abu dan warna aslinya baru muncul saat
   kartunya disentuh - warna jadi hadiah interaksi, bukan kebisingan.

   Pemicunya HARUS dua jalur: Tailwind membungkus varian hover: di dalam
   @media (hover: hover), jadi di layar sentuh aturan itu tidak pernah aktif.
   Karena itu di HP dipakai state React (tap), bukan CSS hover.

   300ms (bukan 150ms) supaya patahan ease-pix kelihatan: steps(4) di 150ms cuma
   ~37ms per langkah - terbaca mulus, bukan pixel. */
const iconClass = "h-10 w-10 md:h-12 md:w-12 transition-all duration-300 ease-pix";

export const SkillCard = ({ skill, isRevealed, onToggle }) => {
  const tier = TIERS[skill.tier];

  return (
    <motion.li variants={cardVariants} className="list-none">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={isRevealed}
        aria-label={`${skill.name} - ${tier.label}`}
        className={cn(
          "group relative flex h-full w-full flex-col items-center gap-3 pix-panel p-4 text-center transition-all duration-100 ease-pix",
          "hover:-translate-y-1 hover:stage-border hover:stage-glow",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          isRevealed && "stage-border stage-glow"
        )}
      >
        <div className="mt-1 transition-transform duration-100 ease-pix group-hover:scale-110">
          <skill.Icon
            className={cn(
              iconClass,
              skill.color,
              isRevealed ? "grayscale-0" : "grayscale group-hover:grayscale-0"
            )}
          />
        </div>

        <h3 className="pixel-font-null text-sm uppercase leading-tight tracking-[1px] md:text-base">
          {skill.name}
        </h3>

        <div className="mt-auto w-full pt-1">
          <StatBar blocks={tier.blocks} />
        </div>
      </button>
    </motion.li>
  );
};

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { skills } from "./data";
import { CategoryFilter } from "./components/CategoryFilter";
import { SkillCard } from "./components/SkillCard";
import { TierLegend } from "./components/TierLegend";

const gridVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };

// Berapa lama warna kartu bertahan setelah di-tap sebelum padam sendiri.
const REVEAL_MS = 2000;

export const SkillSection = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  /* Kartu mana yang warnanya sedang dibuka lewat tap. Satu saja pada satu waktu -
     state-nya cuma menampung SATU nama, jadi membuka kartu lain otomatis menutup
     yang sebelumnya. Di desktop ini nyaris tidak terpakai karena hover sudah
     menanganinya. */
  const [revealed, setRevealed] = useState(null);

  /* Timer dipasang ulang tiap `revealed` berubah; cleanup membatalkan yang lama -
     tanpa itu kartu baru ikut dipadamkan oleh timer sisa kartu sebelumnya. */
  useEffect(() => {
    if (!revealed) return;
    const timeout = setTimeout(() => setRevealed(null), REVEAL_MS);
    return () => clearTimeout(timeout);
  }, [revealed]);

  const visibleSkills = skills.filter(
    (skill) => activeCategory === "all" || skill.category === activeCategory
  );

  return (
    <section id="skills" className="relative px-4 pt-4 pb-16 md:pt-6 md:pb-20">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-7 flex flex-col items-center gap-3 text-center md:mb-9"
        >
          <h2 className="pixel-font text-pix-lg font-bold md:text-pix-xl">
            My <span className="text-primary">Skills</span>
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Laravel untuk web, Flutter untuk mobile, dan React saat antarmuka butuh sentuhan yang
            lebih modern. Pilih kategori untuk menyaring daftar di bawah.
          </p>
        </motion.div>

        <CategoryFilter active={activeCategory} onChange={setActiveCategory} />

        <AnimatePresence mode="wait">
          <motion.ul
            key={activeCategory}
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4"
          >
            {visibleSkills.map((skill) => (
              <SkillCard
                key={skill.name}
                skill={skill}
                isRevealed={revealed === skill.name}
                onToggle={() => setRevealed(revealed === skill.name ? null : skill.name)}
              />
            ))}
          </motion.ul>
        </AnimatePresence>

        <TierLegend />
      </div>
    </section>
  );
};

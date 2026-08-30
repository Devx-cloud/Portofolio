import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { skills } from "./data";
import { CategoryMenu } from "./components/CategoryMenu";
import { SkillDetail } from "./components/SkillDetail";
import { SkillSlot } from "./components/SkillSlot";
import { TierLegend } from "./components/TierLegend";

const gridVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };

/*
 * Stage Skills sebagai LAYAR STATUS, bukan galeri ikon.
 *
 * Kategori mendatar di atas, lalu dua kolom: grid slot dan panel detail.
 * Panel itu yang membuat daftar ini terbaca sebagai layar status game alih-alih
 * grid logo - sekaligus memecahkan masalah lama, yaitu tidak ada tempat untuk
 * menjelaskan APA yang dikerjakan dengan tiap teknologi.
 *
 * Interaksinya meniru menu Title Screen: menyorot satu butir langsung mengganti
 * isi panel di sebelahnya, tanpa perlu klik. Klik tetap disediakan untuk layar
 * sentuh dan keyboard.
 */
export const SkillSection = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeName, setActiveName] = useState(skills[0].name);

  const visible = skills.filter(
    (skill) => activeCategory === "all" || skill.category === activeCategory
  );

  /* Skill aktif diturunkan, bukan disimpan terpisah. Kalau yang sedang disorot
     tersaring keluar oleh pergantian kategori, panel jatuh ke butir pertama
     daftar baru - tanpa perlu effect yang menyinkronkan dua state. */
  const active = visible.find((s) => s.name === activeName) ?? visible[0];

  return (
    <section id="skills" className="relative px-4 pt-4 pb-16 md:pt-6 md:pb-20">
      {/* Dipersempit di lg. Kolom grid dan panel detail berbagi lebar container,
          jadi turun dari 4 ke 3 kolom membuat kartunya melar dari 195px ke 265px
          - grid-nya tetap mengisi ruang yang sama. 61rem mengembalikan kartu ke
          ~197px, seukuran versi 4 kolom. */}
      <div className="container mx-auto max-w-6xl lg:max-w-[61rem]">
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
            lebih modern. Sorot satu slot untuk melihat rinciannya.
          </p>
        </motion.div>

        <CategoryMenu active={activeCategory} onChange={setActiveCategory} />

        {/* Dua kolom di lg. Di bawah itu panel detail memakan lebar yang
            dibutuhkan grid, jadi keduanya ditumpuk - dengan panel DI ATAS grid,
            lihat catatan urutan di SkillDetail. */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,17rem)] lg:gap-5">
          <AnimatePresence mode="wait">
            <motion.ul
              key={activeCategory}
              variants={gridVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              /* self-start WAJIB. Grid ini dan panel detail berbagi satu baris
                 di grid induk, dan tinggi baris ditentukan yang tertinggi -
                 begitu daftarnya tersaring jadi sedikit, grid ini diregangkan
                 setinggi panel dan kartunya ikut memanjang. Terukur: kategori
                 dengan 4 skill membuat kartu 146px jadi 343px. */
              className="order-2 grid grid-cols-2 gap-3 self-start sm:grid-cols-3 md:gap-4 lg:order-none"
            >
              {visible.map((skill) => (
                <SkillSlot
                  key={skill.name}
                  skill={skill}
                  isActive={active?.name === skill.name}
                  onFocus={() => setActiveName(skill.name)}
                />
              ))}
            </motion.ul>
          </AnimatePresence>

          <SkillDetail skill={active} />
        </div>

        <TierLegend />
      </div>
    </section>
  );
};

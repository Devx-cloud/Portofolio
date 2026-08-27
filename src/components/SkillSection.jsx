import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { FaReact, FaHtml5, FaCss3Alt, FaJava, FaGitAlt, FaPython, FaLaravel } from "react-icons/fa";
import { SiJavascript, SiTailwindcss, SiMysql, SiPhp, SiFlutter, SiAndroidstudio } from "react-icons/si";
import { motion, AnimatePresence } from "framer-motion";

/* Tier dipakai sebagai "stat bar" ala RPG - sesuaikan kalau porsinya berubah */
const TIERS = {
  core: { label: "Utama", blocks: 3 },
  support: { label: "Pendukung", blocks: 2 },
  explore: { label: "Eksplorasi", blocks: 1 },
};

/* Logo memakai warna mereknya sendiri - lihat catatan --brand-* di index.css.
   Warnanya dari token, bukan hex mentah, supaya ikut menyesuaikan tema.

   13 warna brand sekaligus di satu grid bikin halaman ini berisik dibanding
   bagian lain yang disiplin navy+merah. Jadi diam-diam ikonnya abu-abu, dan
   warna aslinya baru muncul saat kartunya disentuh - warna jadi hadiah
   interaksi, bukan kebisingan di pandangan pertama.

   Pemicunya HARUS dua jalur, bukan hover saja. Tailwind membungkus semua
   varian hover: di dalam @media (hover: hover), jadi di HP aturan itu tidak
   pernah aktif dan ikonnya bakal abu-abu selamanya. Karena itu di layar
   sentuh dipakai state React (tap untuk membuka), bukan CSS hover.

   Ikon disimpan sebagai KOMPONEN, bukan elemen jadi, supaya class-nya bisa
   berubah mengikuti state - elemen yang sudah dirender class-nya terkunci.

   Durasi 300ms (bukan 150ms) supaya patahan ease-pix benar-benar KELIHATAN:
   steps(4) di 150ms cuma ~37ms per langkah - terbaca mulus, bukan pixel.
   Di 300ms tiap langkah dapat 75ms, jadi warnanya luntur dalam 4 lompatan
   diskret seperti sprite yang berganti frame. */
const iconClass = "h-10 w-10 md:h-12 md:w-12 transition-all duration-300 ease-pix";

const skills = [
  // Web
  { name: "Laravel", Icon: FaLaravel, color: "text-brand-laravel", category: "web", tier: "core" },
  { name: "PHP", Icon: SiPhp, color: "text-brand-php", category: "web", tier: "core" },
  { name: "JavaScript", Icon: SiJavascript, color: "text-brand-js", category: "web", tier: "core" },
  { name: "HTML", Icon: FaHtml5, color: "text-brand-html", category: "web", tier: "core" },
  { name: "CSS", Icon: FaCss3Alt, color: "text-brand-css", category: "web", tier: "core" },
  { name: "Tailwind CSS", Icon: SiTailwindcss, color: "text-brand-tailwind", category: "web", tier: "core" },
  { name: "MySQL", Icon: SiMysql, color: "text-brand-mysql", category: "web", tier: "support" },
  { name: "ReactJs", Icon: FaReact, color: "text-brand-react", category: "web", tier: "support" },

  // Mobile
  { name: "Flutter", Icon: SiFlutter, color: "text-brand-flutter", category: "app", tier: "core" },
  { name: "Android Studio", Icon: SiAndroidstudio, color: "text-brand-android", category: "app", tier: "support" },
  { name: "Git", Icon: FaGitAlt, color: "text-brand-git", category: "app", tier: "support" },
  { name: "Java", Icon: FaJava, color: "text-brand-java", category: "app", tier: "explore" },

  // AI / Data
  { name: "Python", Icon: FaPython, color: "text-brand-python", category: "ai", tier: "explore" },
];

const categories = [
  { id: "all", label: "Semua" },
  { id: "web", label: "Web" },
  { id: "app", label: "Mobile" },
  { id: "ai", label: "AI / Data" },
];

const countFor = (id) =>
  id === "all" ? skills.length : skills.filter((s) => s.category === id).length;

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.18 } },
};

const StatBar = ({ blocks }) => (
  <div className="flex w-full items-center gap-1">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className={cn(
          "h-1.5 flex-1 border transition-colors duration-100 ease-pix",
          i < blocks ? "stage-border stage-bg" : "border-border bg-transparent"
        )}
      />
    ))}
  </div>
);

export const SkillSection = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  /* Kartu mana yang warnanya sedang dibuka lewat tap. Satu saja pada satu
     waktu - membiarkan banyak kartu menyala sekaligus mengembalikan
     keramaian yang justru mau dihilangkan. Karena state-nya cuma menampung
     SATU nama, membuka kartu lain otomatis menutup yang sebelumnya. Di
     desktop ini nyaris tidak terpakai karena hover sudah menanganinya. */
  const [revealed, setRevealed] = useState(null);

  /* Warna padam sendiri setelah 2 detik, jadi grid tidak ditinggal menyala
     saat pengunjung sudah beralih. Timer-nya dipasang ulang tiap `revealed`
     berubah, dan cleanup membatalkan timer lama - tanpa itu, kartu yang baru
     dibuka akan ikut dipadamkan oleh timer sisa kartu sebelumnya. */
  useEffect(() => {
    if (!revealed) return;
    const timeout = setTimeout(() => setRevealed(null), 2000);
    return () => clearTimeout(timeout);
  }, [revealed]);

  const filteredSkill = skills.filter(
    (skill) => activeCategory === "all" || skill.category === activeCategory
  );

  return (
    <section id="skills" className="relative px-4 pt-4 pb-16 md:pt-6 md:pb-20">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
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

        {/* Filter kategori: gaya menu pixel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="mb-7 flex flex-wrap justify-center gap-2 md:mb-9"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                aria-pressed={isActive}
                className={cn(
                  "group pixel-font flex items-center gap-2 border-2 px-3 py-2 text-pix-xs uppercase transition-all duration-100 ease-pix md:text-pix-xs",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  isActive
                    ? "stage-border stage-bg-soft stage-text stage-shadow"
                    : "pix-chip text-foreground/70 hover:stage-border hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "transition-opacity",
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                  )}
                >
                  &#9654;
                </span>
                {cat.label}
                <span
                  className={cn(
                    "border-l pl-2",
                    isActive ? "stage-border-soft" : "border-border"
                  )}
                >
                  {countFor(cat.id)}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Grid skill */}
        <AnimatePresence mode="wait">
          <motion.ul
            key={activeCategory}
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4"
          >
            {filteredSkill.map((skill) => {
              const tier = TIERS[skill.tier];
              const isRevealed = revealed === skill.name;
              return (
                <motion.li key={skill.name} variants={cardVariants} className="list-none">
                  <button
                    type="button"
                    onClick={() => setRevealed(isRevealed ? null : skill.name)}
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
                          /* Abu-abu itu default di SEMUA perangkat. Yang berbeda
                             hanya pemicunya: hover di desktop, tap di HP. */
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
            })}
          </motion.ul>
        </AnimatePresence>

        {/* Legenda stat bar */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t-2 border-border pt-5 md:mt-9">
          {Object.entries(TIERS).map(([key, tier]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="flex w-12 items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-2 flex-1 border",
                      i < tier.blocks ? "stage-border stage-bg" : "border-border"
                    )}
                  />
                ))}
              </div>
              <span className="pixel-font text-pix-xs uppercase text-muted-foreground md:text-pix-xs">
                {tier.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

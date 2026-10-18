import { motion } from "framer-motion";
import { pixEase } from "../constants";
import { skills } from "../data";
import { SkillDetail } from "./SkillDetail";

/* Tiap blok masuk bergiliran - petunjuk dulu, lalu rincian. Induknya
   (SkillsStage) yang memegang staggerChildren. */
const textItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.24, ease: pixEase } },
};

/* Kolom teks panggung Skills. Dua baris saja: apa yang harus dilakukan, dan
   rincian yang sedang disorot.

   Yang sengaja DIBUANG dari sini, karena kolomnya jadi terlalu ramai:

   1. Legenda tier ("07 UTAMA / 04 PENDUKUNG / 04 EKSPLORASI"). Panel detail
      sudah menyebut tier-nya dengan KATA ("Web · Utama"); legenda yang berdiri
      sendiri memaksa pengunjung menghafal sesuatu sebelum melihat barangnya.
   2. Kalimat "Laravel untuk web, Flutter untuk mobile...". Sudah diucapkan di
      stage Profile; yang tersisa di sini hanya kalimat yang punya tugas.
   3. Penghitung raksasa "01 / 15 skill terbuka". Angkanya pindah ke kepala bab
      (lihat SkillsStage), tempat yang sama dengan penghitung quest di Projects -
      di sini ia blok paling berat di layar untuk keterangan yang paling ringan. */
export const SkillsText = ({ revealed, skill, onOpenProject }) => {
  const done = revealed >= skills.length;

  return (
    <>
      <motion.p variants={textItem} className="text-sm leading-relaxed text-muted-foreground">
        {done ? "Sorot satu slot untuk melihat rinciannya." : "Terus gulir untuk membuka sisanya."}
      </motion.p>

      <motion.div variants={textItem} className="mt-5">
        <SkillDetail skill={skill} onOpenProject={onOpenProject} />
      </motion.div>
    </>
  );
};

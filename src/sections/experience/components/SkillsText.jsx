import { motion } from "framer-motion";
import { pixEase } from "../constants";
import { pad2, skills } from "../data";
import { SkillDetail } from "./SkillDetail";

/* Tiap blok masuk bergiliran - penghitung dulu, lalu petunjuk, lalu rincian.
   Induknya (SkillsStage) yang memegang staggerChildren. */
const textItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.24, ease: pixEase } },
};

/* Kolom teks panggung Skills. Tiga baris saja: berapa yang sudah terbuka, apa
   yang harus dilakukan, dan rincian yang sedang disorot.

   Dua hal sengaja DIBUANG dari sini karena kolomnya jadi terlalu ramai - empat
   blok bertumpuk, tiga di antaranya berisi angka:

   1. Legenda tier ("07 UTAMA / 04 PENDUKUNG / 04 EKSPLORASI" dengan tiga mini
      stat bar). Ia menerangkan arti pip di pojok tiap petak, tapi penjelasan itu
      sudah ada di tempat yang lebih tepat: panel detail menyebut tier-nya dengan
      KATA ("Web · Utama") tepat di sebelah bar yang bentuknya sama. Legenda yang
      berdiri sendiri memaksa pengunjung menghafal sesuatu sebelum melihat
      barangnya.
   2. Kalimat "Laravel untuk web, Flutter untuk mobile...". Kalimat itu sudah
      diucapkan dua kali di layar yang sama - di paragraf kepala halaman dan di
      babak Experience pada stage Profile. Yang tersisa di sini hanya kalimat
      yang benar-benar punya tugas: memberi tahu apa yang harus dilakukan.

   Angka besar di atas adalah penghitung ikon yang sudah terbuka - ia naik
   bersama gulir, jadi pengunjung langsung melihat bahwa menggulir MEMBUKA
   sesuatu. Diberi key per angka supaya tiap kenaikan meletup kecil, bahasa gerak
   yang sama dengan ikon yang baru terbuka di papan. */
export const SkillsText = ({ revealed, skill, onOpenProject }) => {
  const done = revealed >= skills.length;

  return (
    <>
      <motion.div variants={textItem} className="flex items-end gap-3">
        <span
          key={revealed}
          className="slot-pop pixel-font inline-block text-pix-2xl leading-none tabular-nums text-foreground"
        >
          {pad2(revealed)}
        </span>
        <span className="pixel-font pb-1 text-pix-sm uppercase text-muted-foreground">
          / {pad2(skills.length)} skill terbuka
        </span>
      </motion.div>

      <motion.p variants={textItem} className="mt-3 text-sm leading-relaxed text-foreground/80">
        {done ? "Sorot satu slot untuk melihat rinciannya." : "Terus gulir untuk membuka sisanya."}
      </motion.p>

      <motion.div variants={textItem} className="mt-6">
        <SkillDetail skill={skill} onOpenProject={onOpenProject} />
      </motion.div>
    </>
  );
};

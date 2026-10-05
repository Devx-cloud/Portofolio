import { useImperativeHandle, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { skillById, skills } from "./data";
import { ChapterLabel } from "./components/ChapterLabel";
import { SkillBoard } from "./components/SkillBoard";
import { SkillsText } from "./components/SkillsText";

/* vh gulir untuk seluruh bab Skills. 78% di antaranya (lihat REVEAL_END)
   dipakai membuka 15 ikon - ~8vh per ikon, kira-kira satu ketukan roda mouse.
   Pas untuk terasa "setiap gulir membuka satu", tanpa membuat pengunjung
   menggulir lama sebelum sampai ke project. */
const TRACK_VH = 160;

/* Bagian trek tempat ikon dibuka. Sisanya jeda: semua ikon sudah terbuka dan
   layar diam, supaya ada waktu menyorot slot dan membaca panel detail sebelum
   halaman berlanjut ke Projects.

   Dinaikkan dari 0,7: pada angka itu jedanya 54vh - hampir setengah layar penuh
   digulir tanpa satu pun yang berubah, dan itu yang membuat peralihan ke
   Projects terasa kosong, bukan tenang. 0,78 x 160vh menyisakan ~35vh, cukup
   untuk berhenti sejenak tanpa terasa macet. Kecepatan buka per ikon praktis
   tidak berubah (8,3vh, dari 8,4vh). */
const REVEAL_END = 0.78;

/* Titik mendarat untuk lompatan dari kartu project: di tengah jeda, tempat
   semua ikon sudah terbuka - skill yang dituju pasti terlihat. */
const REST_AT = (REVEAL_END + 1) / 2;

const textVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* Minimal satu: sebelum gulir dimulai papan sudah memperlihatkan satu ikon di
   antara petak-petak kosong - itu yang mengundang untuk menggulir. */
const revealedAt = (v) =>
  Math.min(Math.max(Math.floor((v / REVEAL_END) * skills.length) + 1, 1), skills.length);

/*
 * Bab Skills sebagai PANGGUNG SCROLL - layar lebar yang cukup tinggi.
 *
 * Satu layar sticky: teks di kiri, papan semua kategori di kanan. Petaknya
 * kosong, dan menggulir membuka ikonnya satu demi satu - label kategori menyala
 * saat ikon pertamanya terbuka, panel detail mengikuti ikon terbaru, penghitung
 * di kiri naik. Menggulir balik menguncinya lagi.
 *
 * Kenapa ikon dibuka per ambang gulir, bukan digeser mulus mengikuti gulir:
 * transform yang menempel ke posisi gulir bergerak sepersekian piksel tiap frame
 * dan membuat ikon pixel bergetar buram. Gulir hanya MEMUTUSKAN kapan ikon
 * terbuka; letupannya sendiri animasi pendek yang selalu tajam.
 *
 * `pickedId` dipegang ExperienceSection karena kartu project juga bisa
 * mengisinya. `showSkill()` dipanggil lewat ref saat itu terjadi.
 */
export const SkillsStage = ({ ref, pickedId, onPick, onOpenProject }) => {
  const trackRef = useRef(null);
  const revealedRef = useRef(1);
  const reducedMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(1);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  /* State hanya disentuh saat jumlahnya BERUBAH - scrollYProgress berganti tiap
     frame, jumlah ikon cuma 15 kali sepanjang trek. */
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const count = revealedAt(v);
    if (count === revealedRef.current) return;
    // Ikon baru terbuka -> panel detail berpindah ke sana. Pilihan pengunjung
    // dilepas supaya detail ikut maju bersama gulir.
    if (count > revealedRef.current) onPick(null);
    revealedRef.current = count;
    setRevealed(count);
  });

  useImperativeHandle(
    ref,
    () => ({
      showSkill() {
        const track = trackRef.current;
        if (!track) return;
        const top = window.scrollY + track.getBoundingClientRect().top;
        const range = track.offsetHeight - window.innerHeight;
        window.scrollTo({ top: top + REST_AT * range, behavior: reducedMotion ? "auto" : "smooth" });
      },
    }),
    [reducedMotion]
  );

  /* Skill di panel detail: pilihan pengunjung selama ikonnya sudah terbuka,
     selain itu ikon yang paling baru terbuka. Diturunkan saat render - menggulir
     balik sampai pilihan itu terkunci lagi otomatis jatuh ke ikon terbaru. */
  const pickedVisible = pickedId && skills.findIndex((s) => s.id === pickedId) < revealed;
  const activeId = pickedVisible ? pickedId : skills[revealed >= skills.length ? 0 : revealed - 1].id;

  return (
    <section
      ref={trackRef}
      aria-label="Skills"
      className="relative hidden scrolly:block"
      style={{ height: `calc(100vh + ${TRACK_VH}vh)` }}
    >
      <div className="sticky top-20 h-[calc(100svh-5rem)] overflow-hidden">
        {/* Container yang SAMA dengan kepala halaman dan bab Projects (max-w-6xl
            + px-8), supaya tepi kiri "01 SKILLS" jatuh persis di bawah "My
            Experience" dan sejajar dengan "02 PROJECTS" di bawahnya.

            Seluruh komposisi dipusatkan tegak sebagai SATU blok (justify-center
            pada flex-col), bukan tiap kolom sendiri-sendiri.

            Nomor bab raksasa yang dulu ada di sini sudah dibuang: begitu kepala
            bab naik ke atas (dulu ia di dalam kolom kiri), nomor itu tidak punya
            ruang lagi untuk menyembul ke atas tanpa terpotong overflow-hidden -
            dan diturunkan agar muat, ia justru mendarat tepat di atas tulisan
            "SKILLS". Chip "01" di kepala bab sudah membawa nomornya. */}
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col justify-center px-4 md:px-8">
          {/* Tanpa meta "15 slot" - penghitung besar tepat di bawahnya sudah
              menyebut angka yang sama. */}
          <ChapterLabel index={1} title="Skills" kicker="Loadout" />

          {/* Lebar kedua kolom DIPATOK, sisa ruangnya dibuang ke tengah lewat
              justify-between: teks bertambat di margin kiri halaman, papan di
              margin kanan - dua panel yang mengapit panggung. Dengan 5fr/7fr yang
              lama, papan selebar 384px mengambang di tengah kolom selebar 651px,
              jadi ada ~190px udara mati di kirinya DAN ~134px di kanannya, dan ia
              tidak bertambat ke apa pun.

              items-start: kedua kolom berbagi satu tepi atas. Dulu items-center
              memusatkan tiap kolom sendiri-sendiri, dan karena kolom teks lebih
              tinggi daripada papan, tepi atasnya meleset ~70px. */}
          <div className="mt-6 grid grid-cols-[28rem_26rem] items-start justify-between">
            <motion.div variants={textVariants} initial="hidden" animate="visible">
              <SkillsText revealed={revealed} skill={skillById[activeId]} onOpenProject={onOpenProject} />
            </motion.div>

            <SkillBoard revealed={revealed} activeId={activeId} onHover={onPick} />
          </div>
        </div>
      </div>
    </section>
  );
};

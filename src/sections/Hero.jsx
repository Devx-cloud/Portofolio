import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { MaskLines } from "@/components/Reveal";
import { DotField } from "@/components/DotField";
import { Marquee } from "@/components/Marquee";
import { COUNTRY, HERO_LEDE, HERO_LINES, LOCATION, ROLE } from "@/data/profile";
import { EASE_OUT_EXPO, INTRO_LIFT_AT } from "@/lib/motion";

/* Isi pita di kaki Hero. Peran dulu, lalu tiga teknologi yang paling sering
   ditanyakan - cukup untuk menjawab "ini orang bisa apa" sebelum pengunjung
   sampai ke bagian Skills. */
const BAND = [ROLE, "Laravel", "Flutter", "React"];

/*
 * Layar pembuka, disusun seperti poster: metadata kecil di atas, nama
 * setinggi mungkin menempel di kaki halaman, pita berjalan sebagai alasnya.
 *
 * Nama diletakkan di BAWAH, bukan di tengah. Judul yang ditengahkan
 * membagi layar jadi dua ruang kosong yang sama dan hasilnya terbaca netral;
 * ditumpuk di kaki, ia menekan dan meninggalkan satu ruang kosong besar di
 * atasnya - itu yang memberi kesan monumental.
 */
export const Hero = () => {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  /* offset ["start start", "end start"]: 0 saat puncak Hero menyentuh puncak
     layar, 1 saat kakinya sampai di sana - jadi seluruh rentang parallax
     habis tepat ketika Hero selesai keluar. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  /* Nama bergerak NAIK lebih cepat dari halaman dan meredup. Bukan efek
     kedalaman - ia lebih dekat ke "menyerahkan tempat": begitu bagian
     berikutnya masuk, judul ini harus sudah berhenti bersaing. */
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const parallax = reduced ? undefined : { y, opacity };

  return (
    <section
      ref={ref}
      id="hero"
      data-rail="Awal"
      className="relative flex min-h-svh flex-col justify-between pt-20"
    >
      {/* Ladang partikel. pointer-events-none: ia mendengarkan pointer lewat
          window, jadi ia tidak perlu - dan tidak boleh - menangkap klik.
          Opasitasnya ikut parallax yang sama dengan namanya supaya latarnya
          tidak tertinggal menyala saat isinya sudah pergi. */}
      <motion.div
        aria-hidden="true"
        style={reduced ? undefined : { opacity }}
        className="pointer-events-none absolute inset-0"
      >
        <DotField className="dot-mask h-full w-full" />
      </motion.div>

      <motion.div
        style={parallax}
        className="relative shell flex flex-1 flex-col justify-between gap-8"
      >
        {/* --- Metadata atas --- */}
        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: INTRO_LIFT_AT + 0.3 }}
          className="flex items-start justify-between gap-6"
        >
          <span className="eyebrow">Portofolio / 2026</span>
          <span className="eyebrow max-w-[9rem] text-right sm:max-w-none">
            {LOCATION} — {COUNTRY}
          </span>
        </motion.div>

        {/* --- Pengantar ---
            Ditaruh di kolom kanan pada layar lebar supaya blok teks kecil ini
            tidak berbaris tepat di atas nama; dua blok rata kiri yang bertumpuk
            membuat keduanya terbaca sebagai satu paragraf panjang.

            max-w-md, bukan max-w-lg: tiap baris tambahan di sini memakan ~45px
            dari tinggi yang harus dibagi dengan nama di bawahnya, dan di layar
            720px anggaran itu ketat. */}
        <div className="flex justify-end">
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: INTRO_LIFT_AT + 0.45, ease: EASE_OUT_EXPO }}
            className="max-w-md text-lede text-muted"
          >
            {HERO_LEDE}
          </motion.p>
        </div>

        {/* --- Nama + petunjuk gulung ---
            Petunjuknya diletakkan SEBARIS dengan nama, memanfaatkan ruang
            kosong di kanan "SURYA.". Ditaruh sebagai baris sendiri, ia memakan
            ~80px tinggi yang justru harus disisakan untuk namanya. */}
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <h1 className="text-d1">
            <MaskLines
              lines={[HERO_LINES[0]]}
              /* delay = INTRO_LIFT_AT: huruf mulai naik pada detik yang sama
                 tirai pembuka mulai terangkat, jadi keduanya terbaca sebagai
                 satu gerakan. Lihat catatan di Intro.jsx. */
              delay={INTRO_LIFT_AT}
              trigger="mount"
            />
            {/* Titik merah ditulis sebagai KARAKTER, bukan kotak berukuran em.
                Titik buatan harus diposisikan manual terhadap baseline, dan
                baseline Anton bergeser mengikuti clamp() di --text-d1 - jadi
                penyetelannya hanya benar di satu lebar layar. Karakter "."
                milik fontnya sendiri selalu duduk tepat, di lebar berapa pun.

                Outline dipasang di span dalam, bukan di pembungkus mask, supaya
                text-stroke tidak ikut mengenai titik merahnya. */}
            <MaskLines
              lines={[
                <>
                  <span className="display-outline">{HERO_LINES[1]}</span>
                  <span className="text-red">.</span>
                </>,
              ]}
              delay={INTRO_LIFT_AT + 0.09}
              trigger="mount"
            />
          </h1>

          <motion.div
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: INTRO_LIFT_AT + 1 }}
            className="flex items-center gap-3 pb-3"
          >
            <motion.span
              animate={reduced ? undefined : { y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="text-red"
            >
              <ArrowDown size={16} strokeWidth={2.5} />
            </motion.span>
            <span className="eyebrow">Gulung untuk mulai</span>
          </motion.div>
        </div>
      </motion.div>

      {/* --- Kaki: pita berjalan ---
          Di luar pembungkus parallax dengan sengaja: ia menempel di kaki layar
          sebagai alas, dan alas yang ikut memudar saat digulung akan
          meninggalkan tepi bawah yang menggantung. */}
      <div className="relative mt-8 border-y border-line py-4">
        <Marquee
          items={BAND}
          className="font-display text-[clamp(1.75rem,4vw,3rem)] uppercase leading-none"
        />
      </div>
    </section>
  );
};

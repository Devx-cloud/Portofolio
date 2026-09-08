import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";

/*
 * Rel orientasi di tepi kanan: nomor bagian, nama bagian, batang progres.
 *
 * Situs ini sengaja tidak punya menu, dan itu membuang satu hal yang selalu
 * diberikan navigasi: rasa tahu ADA DI MANA dan MASIH BERAPA LAGI. Halaman
 * panjang tanpa penanda apa pun menghasilkan dua keluhan yang berulang di
 * riset gulungan panjang - pengunjung kehilangan orientasi, dan tidak pernah
 * merasa "selesai" karena tidak ada tanda bahwa isinya terbatas.
 *
 * Rel ini menjawab keduanya tanpa jadi menu:
 *   - nomor bagian sekarang lawan totalnya ("03 / 05") = ada batasnya
 *   - nama bagiannya = tahu sedang di mana
 *   - batang progres = tahu masih berapa lagi
 *
 * Yang TIDAK dilakukannya: bisa diklik. Begitu ia bisa diklik, ia berubah jadi
 * menu vertikal dan melanggar premis desainnya. Ini instrumen, bukan kemudi -
 * karena itu seluruhnya pointer-events-none dan aria-hidden (isinya duplikat
 * dari judul bagian yang sudah dibacakan pembaca layar).
 */
export const ScrollRail = () => {
  const { scrollY, scrollYProgress } = useScroll();
  const [active, setActive] = useState(0);
  const [sections, setSections] = useState([]);

  /* Ambang tiap bagian di-CACHE, bukan diukur ulang tiap frame.
     getBoundingClientRect() di dalam handler scroll memaksa browser menghitung
     ulang tata letak sebelum bisa menjawab - dan di halaman ini itu terjadi
     tepat setelah Lenis menulis scrollTop, jadi biayanya dibayar tiap frame.
     offsetTop tidak berubah saat digulung, jadi cukup dibaca sekali. */
  const tops = useRef([]);

  useEffect(() => {
    const nodes = [...document.querySelectorAll("[data-rail]")];
    setSections(nodes.map((el) => el.dataset.rail));

    const measure = () => {
      tops.current = nodes.map((el) => el.offsetTop);
    };

    measure();

    /* Diukur ulang saat ukuran dokumen berubah - gambar yang selesai dimuat
       dan pergantian tema (yang mengubah tinggi baris) sama-sama menggeser
       ambangnya. */
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    /* Titik ukur di 40% tinggi layar, bukan di tepi atas: bagian dianggap
       "aktif" saat isinya sudah mengisi layar, bukan saat baris pertamanya
       baru menyentuh atas. Di tepi atas, labelnya berganti satu layar penuh
       lebih awal daripada yang dirasakan pengunjung. */
    const probe = y + window.innerHeight * 0.4;
    let index = 0;
    while (index + 1 < tops.current.length && tops.current[index + 1] <= probe) index++;
    setActive(index);
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 32,
    restDelta: 0.001,
  });

  if (sections.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-0 top-0 z-40 hidden h-screen w-[clamp(3rem,5vw,4.5rem)] flex-col items-center justify-center gap-5 md:flex"
    >
      <span className="font-mono text-[0.625rem] tracking-[0.16em] text-ink tabular-nums">
        {String(active + 1).padStart(2, "0")}
      </span>

      <div className="relative h-[26vh] w-px bg-line">
        <motion.div
          className="absolute inset-x-0 top-0 h-full origin-top bg-red"
          style={{ scaleY }}
        />
      </div>

      <span className="font-mono text-[0.625rem] tracking-[0.16em] text-muted tabular-nums">
        {String(sections.length).padStart(2, "0")}
      </span>

      {/* Nama bagian ditulis tegak. writing-mode, bukan rotate: teks yang
          diputar 90 derajat sering di-antialias miring dan terlihat buram,
          sementara writing-mode tetap dirender sebagai teks tegak yang tajam.

          Tinggi tetap + justify-center supaya nama sepanjang "Kemampuan" dan
          sependek "Awal" sama-sama terpusat di titik yang sama - kalau tidak,
          seluruh rel bergeser tiap kali labelnya berganti. */}
      <div className="flex h-32 items-center justify-center">
        <span
          key={sections[active]}
          className="animate-rail-in whitespace-nowrap font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink [writing-mode:vertical-rl]"
        >
          {sections[active]}
        </span>
      </div>
    </div>
  );
};

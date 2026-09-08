import { motion, useReducedMotion } from "framer-motion";
import { SectionHead } from "@/components/SectionHead";
import { Marquee } from "@/components/Marquee";
import { skillNames, skills, TIERS } from "@/data/skills";
import { cn } from "@/lib/utils";
import { EASE_OUT_EXPO, VIEWPORT } from "@/lib/motion";

/*
 * Daftar kemampuan sebagai INDEKS, bukan grid kartu.
 *
 * Grid ikon berwarna-warni adalah bentuk baku bagian ini di hampir semua
 * portofolio, dan justru itu masalahnya: tiga belas kotak seukuran memberi
 * bobot yang sama pada Laravel dan Java, padahal keduanya jauh berbeda
 * porsinya. Daftar bernomor memaksa urutan, dan kolom tingkat di kanan
 * menyatakan porsinya dengan kata - bukan dengan persentase karangan.
 *
 * Warna merek hanya muncul saat baris disorot. Diam-diam semuanya bone; kalau
 * tiga belas logo menyala sekaligus, halaman ini kehilangan satu-satunya
 * aksennya.
 */
export const Skills = () => (
  <section id="kemampuan" data-rail="Kemampuan" className="py-24 md:py-36">
    {/* Pita nama teknologi sebagai pembuka bagian. Ia mengulang isi daftar di
        bawahnya dengan sengaja: pengunjung yang cuma memindai sudah mendapat
        jawabannya di sini, yang membaca serius lanjut ke daftarnya. */}
    <div className="mb-20 border-y border-line py-5 md:mb-28">
      <Marquee
        items={skillNames}
        baseVelocity={1.4}
        separator="·"
        className="font-display text-[clamp(1.5rem,3.4vw,2.5rem)] uppercase leading-none text-muted"
      />
    </div>

    <div className="shell">
      <SectionHead index="02" title="Kemampuan" meta={`${skills.length} teknologi`} />

      <ul className="mt-12 md:mt-16">
        {skills.map((skill, i) => (
          <SkillRow key={skill.name} skill={skill} index={i} />
        ))}
      </ul>
    </div>
  </section>
);

const SkillRow = ({ skill, index }) => {
  const reduced = useReducedMotion();
  const { Icon, name, note, group, tier, color } = skill;

  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      /* Jeda dipotong di baris ke-8. Tiga belas baris dikali 0.05 detik
         berarti baris terakhir menunggu 0.65 detik setelah baris pertama -
         cukup lama untuk terasa seperti daftar yang memuat lambat. */
      transition={{ duration: 0.7, delay: Math.min(index, 7) * 0.05, ease: EASE_OUT_EXPO }}
      className="group border-b border-line-soft first:border-t"
    >
      {/* translate-x pada hover, bukan background: baris yang bergeser sedikit
          terbaca sebagai respons fisik, sementara latar yang menyala menambah
          satu kotak lagi ke halaman yang justru dibangun dari garis. */}
      <div className="flex items-center gap-4 py-5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 md:gap-8 md:py-6">
        <span className="eyebrow w-6 shrink-0 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Warna merek dipasang PERMANEN lalu diredam dengan grayscale, bukan
            ditukar kelasnya saat hover. Tailwind memindai kode sumber untuk
            mencari nama kelas; kelas yang dirakit saat runtime
            (`group-hover:${color}`) tidak pernah ikut ter-generate dan hover-nya
            diam-diam mati. Filter menyelesaikannya tanpa nama kelas dinamis. */}
        <Icon
          aria-hidden="true"
          className={cn(
            "size-5 shrink-0 opacity-40 grayscale transition duration-500 group-hover:opacity-100 group-hover:grayscale-0 md:size-6",
            color
          )}
        />

        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-4 gap-y-1">
          {/* Lebar tetap mulai lg supaya semua catatan berbaris di satu kolom.
              Dibiarkan mengikuti isi, kolom catatan bergerigi mengikuti panjang
              nama ("Git" vs "Android Studio") dan daftar ini berhenti terbaca
              sebagai indeks. */}
          <h3 className="text-xl leading-none tracking-tight md:text-2xl lg:w-52 lg:shrink-0">
            {name}
          </h3>
          {/* Catatan disembunyikan di bawah md: pada 360px ia membungkus jadi
              tiga baris dan mengubah daftar rapat ini jadi blok teks. */}
          <p className="hidden max-w-md truncate text-sm text-muted lg:block">{note}</p>
        </div>

        <span className="eyebrow shrink-0 text-right">{group}</span>

        <span
          className={cn(
            "eyebrow w-[5.5rem] shrink-0 text-right",
            tier === "core" ? "text-red" : "text-muted"
          )}
        >
          {TIERS[tier].label}
        </span>
      </div>
    </motion.li>
  );
};

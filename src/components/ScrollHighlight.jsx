import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/*
 * Paragraf yang menyala kata demi kata mengikuti gulungan.
 *
 * Kenapa per kata dan bukan gradien background-clip yang digeser:
 * background-clip hanya bisa menyapu lurus kiri-ke-kanan pada tiap baris,
 * jadi pada paragraf multi-baris sapuannya "melompat" ke awal baris
 * berikutnya. Memberi tiap kata motion value sendiri membuat urutan
 * menyalanya mengikuti urutan BACA, bukan geometri kotaknya.
 *
 * Biayanya satu useTransform per kata. Untuk paragraf seukuran ini (puluhan
 * kata) itu murah - semuanya berlangganan ke satu scrollYProgress yang sama
 * dan tidak ada satu pun yang memicu re-render React.
 *
 * offset ["start 0.85", "end 0.4"]: mulai menyala saat puncak paragraf lewat
 * 85% tinggi layar (jadi sudah terlihat), dan selesai saat ujung bawahnya
 * mencapai 40% - selesai SEBELUM paragraf keluar layar, supaya pengunjung
 * sempat melihatnya dalam keadaan menyala penuh.
 */
export const ScrollHighlight = ({ text, className, dim = 0.16 }) => {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.4"],
  });

  const words = text.split(" ");

  if (reduced) return <p className={className}>{text}</p>;

  return (
    <p ref={ref} className={cn("flex flex-wrap", className)}>
      {words.map((word, i) => (
        <Word
          key={`${word}-${i}`}
          progress={scrollYProgress}
          /* Rentang tiap kata sengaja TUMPANG TINDIH dengan kata sesudahnya
             (panjang 2 slot, maju 1 slot). Tanpa tumpang tindih, kata menyala
             satu per satu seperti lampu saklar; dengan tumpang tindih ada
             beberapa kata yang sedang di tengah transisi sekaligus, dan itu
             yang membuatnya terbaca sebagai gelombang. */
          range={[i / words.length, (i + 2) / words.length]}
          dim={dim}
        >
          {word}
        </Word>
      ))}
    </p>
  );
};

const Word = ({ progress, range, dim, children }) => {
  const opacity = useTransform(progress, range, [dim, 1]);

  /* mr pakai em, bukan rem: ukuran paragraf ini fluid (--text-lede), jadi
     spasi antar-kata harus ikut menyusut di layar kecil. */
  return (
    <motion.span style={{ opacity }} className="mr-[0.28em] inline-block">
      {children}
    </motion.span>
  );
};

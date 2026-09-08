import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE_OUT_EXPO, VIEWPORT } from "@/lib/motion";

/*
 * Kepala bagian: nomor, judul, garis.
 *
 * Nomor urut ("01", "02", ...) menggantikan pekerjaan yang dulu dilakukan
 * menu. Tanpa daftar bagian di mana pun, angka inilah satu-satunya yang
 * memberi tahu pengunjung bahwa halaman ini punya urutan dan panjangnya
 * terbatas - dan itu bekerja tanpa perlu bisa diklik.
 *
 * Garisnya menyapu dari kiri saat masuk. Ia digambar lewat scaleX, bukan
 * width: hanya transform yang bisa dianimasikan tanpa memaksa browser
 * menghitung ulang tata letak tiap frame.
 */
export const SectionHead = ({ index, title, meta, className }) => {
  const reduced = useReducedMotion();

  return (
    <div className={cn("w-full", className)}>
      {reduced ? (
        <div className="h-px w-full bg-line" />
      ) : (
        <motion.div
          className="h-px w-full origin-left bg-line"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 1.1, ease: EASE_OUT_EXPO }}
        />
      )}

      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-4">
        <div className="flex items-baseline gap-4">
          <span className="eyebrow text-red">{index}</span>
          <h2 className="text-d3">{title}</h2>
        </div>

        {meta && <span className="eyebrow">{meta}</span>}
      </div>
    </div>
  );
};

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE_OUT_EXPO, VIEWPORT } from "@/lib/motion";

/*
 * Tiga primitif reveal yang dipakai seluruh halaman. Semuanya dipicu oleh
 * posisi gulungan (whileInView), bukan timer - itu aturan ke-4 sistem desain
 * ini: pengunjung yang berhenti menggulung harus melihat gambar yang diam.
 *
 * Semuanya juga menghormati prefers-reduced-motion dengan cara yang sama:
 * merender keadaan AKHIR secara langsung, bukan menghilangkan elemennya.
 */

/*
 * MaskLines - reveal baris demi baris dari balik "pintu".
 *
 * Ini efek pembuka utama situs. Rahasianya bukan di animasinya (cuma
 * translateY) melainkan di pembungkusnya: .mask-line punya overflow:hidden
 * setinggi satu baris, jadi teks yang berada di y:110% benar-benar berada di
 * luar kotak dan naik masuk seolah dari balik garis.
 *
 * Karena itu tiap baris WAJIB jadi elemen sendiri. Membungkus satu paragraf
 * yang mengalir dengan satu mask tidak menghasilkan efek ini - potongan baris
 * harus ditentukan di data (lihat HERO_LINES), bukan diserahkan ke word-wrap.
 *
 * y dipakai 110%, bukan 100%: descender (huruf g, y, j) menonjol di bawah
 * baseline dan pada 100% ujungnya masih mengintip di bawah garis mask.
 *
 * `lines` boleh berisi node React, bukan cuma string - itu cara memberi warna
 * berbeda pada sebagian baris (misalnya titik merah di akhir nama) tanpa
 * memecahnya jadi dua mask yang naik terpisah.
 *
 * trigger="mount" WAJIB dipakai untuk judul yang sudah terlihat saat halaman
 * dibuka (Hero). Alasannya bukan selera:
 *
 *   - Secara makna, "muncul saat digulung ke dalam layar" tidak berarti apa-apa
 *     untuk elemen yang tidak pernah perlu digulung.
 *   - Secara praktik, whileInView bergantung pada IntersectionObserver yang
 *     dipasang saat commit pertama. Baris kedua judul Hero pernah tersangkut
 *     permanen di posisi awalnya (translateY 110%, jadi tidak terlihat sama
 *     sekali) karena observer-nya tidak pernah melaporkan elemen itu masuk
 *     layar - padahal observer baru yang dibuat belakangan dengan opsi yang
 *     sama melaporkannya dengan rasio 0.94.
 *
 * Kegagalan itu diam: tidak ada error, cuma sebagian nama yang hilang. Elemen
 * di atas lipatan tidak boleh mempertaruhkan keterlihatannya pada observer.
 */
export const MaskLines = ({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.085,
  duration = 1.05,
  trigger = "view",
}) => {
  const reduced = useReducedMotion();

  /* Dipisah jadi objek prop supaya kedua cabang memakai initial dan transition
     yang sama persis - yang berbeda cuma apa yang memicunya. */
  const cue =
    trigger === "mount"
      ? { animate: { y: "0%" } }
      : { whileInView: { y: "0%" }, viewport: VIEWPORT };

  return (
    <span className={cn("block", className)}>
      {/* key = indeks. Aman di sini justru karena daftarnya statis: baris
          judul tidak pernah disisipkan, dihapus, atau diurutkan ulang. Isinya
          juga boleh berupa node React, yang tidak bisa dipakai sebagai key. */}
      {lines.map((line, i) => (
        <span key={i} className={cn("mask-line", lineClassName)}>
          {reduced ? (
            <span className="block">{line}</span>
          ) : (
            <motion.span
              className="block"
              initial={{ y: "110%" }}
              {...cue}
              transition={{ duration, delay: delay + i * stagger, ease: EASE_OUT_EXPO }}
            >
              {line}
            </motion.span>
          )}
        </span>
      ))}
    </span>
  );
};

/*
 * Reveal - naik + memudar. Kuda beban halaman ini.
 *
 * y default sengaja kecil (24px). Reveal yang bergerak jauh terbaca sebagai
 * "elemen terbang masuk"; yang bergerak sedikit terbaca sebagai "elemen
 * mengendap" - dan yang kedua itulah yang cocok dengan tipografi sekaku ini.
 */
export const Reveal = ({
  children,
  className,
  delay = 0,
  y = 24,
  duration = 0.85,
  ...rest
}) => {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration, delay, ease: EASE_OUT_EXPO }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

/*
 * Stagger - induk untuk deretan anak yang masuk berurutan.
 *
 * Dipisah dari Reveal karena delay berjenjang yang dihitung manual
 * (delay={i * 0.06}) pecah begitu daftarnya difilter: indeksnya bergeser dan
 * jeda antar-item jadi tidak rata. Varian induk-anak membiarkan Framer
 * Motion yang menghitung, jadi jumlah anak boleh berubah.
 */
const parentVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } },
};

const childVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
};

export const Stagger = ({ children, className, ...rest }) => {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={parentVariants}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

/* Anak dari Stagger. Tidak punya initial/whileInView sendiri - ia mewarisi
   state dari induknya lewat nama varian yang sama. */
export const StaggerItem = ({ children, className, as: Tag = "div", ...rest }) => {
  const reduced = useReducedMotion();
  const Motion = motion[Tag] ?? motion.div;

  if (reduced) return <Tag className={className}>{children}</Tag>;

  return (
    <Motion className={className} variants={childVariants} {...rest}>
      {children}
    </Motion>
  );
};

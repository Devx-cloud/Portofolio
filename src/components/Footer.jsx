import { ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import { getLenis } from "@/lib/lenis";
import { useMagnetic } from "@/hooks/useMagnetic";
import { CONTACT_EMAIL, COUNTRY, LOCATION, NAME, ROLE } from "@/data/profile";

/*
 * Kaki halaman. Sengaja pendek dan tanpa dekorasi.
 *
 * Di sini pernah ada pita berjalan raksasa bertuliskan "MARI BICARA" - dibuang.
 * Kalimat itu sudah jadi JUDUL bagian Kontak tepat di atasnya, jadi mengulangnya
 * setinggi 96px hanya menunda pengunjung dari satu-satunya hal yang berguna di
 * kaki halaman: alamat, dan jalan kembali ke atas.
 *
 * Aturannya untuk ke depan: kaki halaman ini tidak menampung teks yang tidak
 * menjawab pertanyaan. Kalau sebuah baris tidak bisa dijelaskan dengan "orang
 * membaca ini untuk mengetahui X", ia tidak masuk.
 */
export const Footer = () => {
  const magnet = useMagnetic({ radius: 90 });

  const toTop = () => {
    const lenis = getLenis();

    /* Kalau Lenis mati (reduced motion), pakai gulungan bawaan browser - yang
       juga akan otomatis instan karena scroll-behavior sudah dipaksa auto oleh
       media query di index.css. */
    if (lenis) lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-line">
      <div className="shell py-10 md:py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          {/* Identitas: nama besar sekali lagi sebagai penutup, seukuran
              catatan kaki - bukan pengulangan Hero, melainkan tanda tangan. */}
          <div>
            <p className="font-display text-2xl uppercase leading-none tracking-tight md:text-3xl">
              {NAME.first} {NAME.last}
              <span className="text-red">.</span>
            </p>
            <p className="eyebrow mt-3">
              {ROLE} — {LOCATION}, {COUNTRY}
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 md:items-end">
            <a href={`mailto:${CONTACT_EMAIL}`} className="link-sweep eyebrow text-ink">
              {CONTACT_EMAIL}
            </a>

            <motion.button
              type="button"
              onClick={toTop}
              ref={magnet.ref}
              style={magnet.style}
              className="group flex items-center gap-2 eyebrow text-ink"
            >
              Kembali ke atas
              <span className="flex size-8 items-center justify-center border border-line text-muted transition-colors duration-500 group-hover:border-red group-hover:text-red">
                <ArrowUp size={14} />
              </span>
            </motion.button>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line-soft pt-6">
          <span className="eyebrow">
            © {new Date().getFullYear()} {NAME.first} {NAME.last}
          </span>
          <span className="eyebrow">React · Tailwind · Framer Motion</span>
        </div>
      </div>
    </footer>
  );
};

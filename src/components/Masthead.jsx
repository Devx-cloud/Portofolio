import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AVAILABILITY_SHORT, COUNTRY, LOCATION, NAME } from "@/data/profile";
import { INTRO_LIFT_AT } from "@/lib/motion";

/*
 * Bar identitas yang menempel di atas. BUKAN navigasi - tidak ada satu pun
 * tautan di dalamnya.
 *
 * Fungsinya menjawab "situs siapa ini" di titik mana pun dalam gulungan yang
 * panjang. Itulah satu-satunya hal yang benar-benar hilang saat menu dibuang,
 * dan satu baris teks sudah cukup menggantikannya. Pengalih tema menumpang di
 * sini karena ia butuh tempat yang selalu terjangkau, dan bar ini satu-satunya
 * yang selalu ada di layar.
 *
 * Latarnya baru muncul SETELAH pengunjung menggulung: di puncak halaman ia
 * mengambang di atas judul raksasa tanpa kotak, dan begitu konten mulai lewat
 * di bawahnya ia butuh alas supaya tetap terbaca.
 *
 * Alasnya SOLID, bukan backdrop-blur. Dua alasan. Yang pertama prinsip: sistem
 * desain ini melarang blur di elemen UI. Yang kedua praktis - halaman ini
 * penuh lapisan yang dikomposisi terpisah (kartu sticky ber-transform, trek
 * marquee ber-will-change), dan backdrop-filter di atas tumpukan seperti itu
 * meninggalkan sisa gambar yang belum digambar ulang di sebagian frame.
 */
export const Masthead = () => {
  const { scrollY } = useScroll();
  const [lifted, setLifted] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => setLifted(v > 24));

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: INTRO_LIFT_AT + 0.2 }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={`transition-colors duration-500 ${
          lifted ? "border-b border-line bg-page" : "border-b border-transparent"
        }`}
      >
        <div className="shell flex h-14 items-center justify-between gap-4">
          <span className="font-mono text-eyebrow font-medium uppercase tracking-[0.18em]">
            {NAME.first} {NAME.last}
            <span className="text-red">®</span>
          </span>

          {/* Lokasi baru muncul di lg. Bar setinggi 56px dengan empat blok
              sudah berdesakan di bawah itu, dan lokasi adalah yang paling
              tidak mendesak - ia diulang lengkap di Hero dan di Kontak. */}
          <span className="eyebrow hidden lg:block">
            {LOCATION}, {COUNTRY}
          </span>

          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-2 sm:flex">
              <span
                aria-hidden="true"
                className="block size-1.5 shrink-0 rounded-full bg-red animate-blink"
              />
              <span className="eyebrow">{AVAILABILITY_SHORT}</span>
            </span>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.header>
  );
};

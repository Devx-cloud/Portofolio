import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { NAME, ROLE } from "@/data/profile";
import { EASE_IN_OUT_QUART, EASE_OUT_EXPO, INTRO_LIFT_AT } from "@/lib/motion";

/*
 * Tirai pembuka. Total 1.8 detik dan tidak pernah muncul lagi setelah itu.
 *
 * Ini bukan layar loading - tidak ada yang benar-benar dimuat di baliknya
 * (font sudah inline di bundel CSS). Fungsinya murni komposisi: memberi
 * halaman satu detak diam sebelum judul raksasa masuk, supaya masuknya
 * terbaca sebagai kejadian dan bukan sekadar keadaan awal.
 *
 * Justru karena ia tidak menunggu apa pun, durasinya harus pendek. Segala
 * sesuatu di atas ~2 detik berubah dari "pembuka" jadi "penghalang".
 *
 * Dilewati sepenuhnya untuk prefers-reduced-motion: layar penuh yang bergeser
 * adalah gerak berskala besar, persis yang dihindari pengaturan itu.
 *
 * Juga dilewati kalau sudah pernah tampil di sesi ini. Pembuka adalah kesan
 * pertama, dan kesan pertama cuma terjadi sekali - pengunjung yang menyegarkan
 * halaman atau kembali dari tab lain sudah tahu situs siapa ini, jadi menahan
 * mereka satu detik lagi berubah dari sambutan jadi pungutan.
 *
 * sessionStorage, bukan localStorage: kunjungan berikutnya besok pantas
 * mendapat pembukanya lagi. Yang tidak pantas adalah mendapatkannya tiga kali
 * dalam lima menit.
 */
const SEEN_KEY = "intro-dilihat";

const alreadySeen = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    /* Penyimpanan diblokir (mode penyamaran / pengaturan ketat). Tampilkan
       pembukanya - itu lebih baik daripada melewatkannya karena salah tebak. */
    return false;
  }
};

const markSeen = () => {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* tidak bisa mengingat - pembukanya akan tampil lagi, dan itu tidak fatal */
  }
};

export const Intro = () => {
  const reduced = useReducedMotion();
  const [done, setDone] = useState(() => reduced || alreadySeen());

  useEffect(() => {
    if (reduced || done) return;

    markSeen();

    /* Gulungan dikunci selama tirai menutup. Tanpa ini, roda mouse yang
       diputar lebih awal membuat halaman sudah berada di tengah bagian
       Skills saat tirainya terangkat. */
    const root = document.documentElement;
    root.style.overflow = "hidden";
    window.scrollTo(0, 0);

    /* Dilepas tepat saat garis merah penuh; tirainya lalu naik SELAMA hero
       sudah mulai menaikkan hurufnya (Hero memakai delay INTRO_LIFT_AT yang
       sama). Dua gerakan yang bertumpuk itu yang menyambung keduanya - kalau
       hero baru mulai setelah tirai hilang, ada jeda kosong di tengah. */
    const timer = setTimeout(() => setDone(true), INTRO_LIFT_AT * 1000);

    return () => {
      clearTimeout(timer);
      root.style.overflow = "";
    };
  }, [reduced, done]);

  if (reduced) return null;

  return (
    /* Kunci gulungan baru dilepas setelah tirainya benar-benar keluar layar,
       bukan saat `done` berubah - di antara keduanya ia masih menutupi
       sebagian halaman. */
    <AnimatePresence onExitComplete={() => {
      document.documentElement.style.overflow = "";
    }}>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-page px-6 py-8 md:px-12 md:py-12"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: EASE_IN_OUT_QUART }}
        >
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
          >
            Portofolio — 2026
          </motion.span>

          <div className="flex items-end justify-between gap-6">
            <motion.span
              className="display text-d3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT_EXPO }}
            >
              {NAME.first} {NAME.last}
              <span className="text-red">.</span>
            </motion.span>

            <motion.span
              className="eyebrow hidden pb-2 sm:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              {ROLE}
            </motion.span>
          </div>

          {/* Garis merah yang tumbuh penuh tepat saat tirai mulai naik. Ia
              satu-satunya penanda waktu di layar ini - tanpa sesuatu yang
              jelas SELESAI, jeda satu detik terasa seperti halaman macet. */}
          <motion.div
            className="h-px w-full origin-left bg-red"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: INTRO_LIFT_AT, ease: EASE_IN_OUT_QUART }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

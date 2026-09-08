import { useEffect, useState } from "react";

/* Media query sebagai state React. Dipakai untuk keputusan tata letak yang
   tidak bisa diselesaikan CSS sendirian - misalnya mematikan tumpukan kartu
   sticky di layar sempit (lihat Work.jsx), yang menuntut struktur JSX berbeda
   dan bukan sekadar gaya berbeda.

   Dibaca SEKALI saat inisialisasi state, bukan menunggu efek pertama. Ini
   penting: dengan nilai awal false, Work.jsx merender kartunya tanpa tumpukan
   lalu langsung menukar strukturnya satu frame kemudian - dan useScroll milik
   Framer Motion sudah terlanjur mengukur tinggi tata letak yang lama, jadi
   skala tumpukannya meleset sampai ada resize.

   Situs ini murni SPA tanpa SSR, jadi `window` dijamin ada di sini. */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const sync = () => setMatches(mql.matches);

    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, [query]);

  return matches;
};

/* CATATAN: jangan tambahkan useReducedMotion di sini. Framer Motion sudah
   mengekspornya, dan versi miliknya juga menghormati MotionConfig - dua sumber
   untuk pengaturan yang sama pasti akan lepas sinkron. Impor dari
   "framer-motion". */

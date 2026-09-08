import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/*
 * twMerge bawaan tidak kenal skala font custom proyek (--text-d1, --text-lede,
 * dst - lihat @theme di index.css). Tanpa didaftarkan di sini, "d1" dianggap
 * BUKAN ukuran font sehingga jatuh ke grup yang sama dengan warna teks, lalu
 * ketimpa kalau dipasangkan dengan class warna dalam satu cn() yang sama.
 *
 * Gagalnya diam-diam: elemen jatuh ke ukuran font default browser, bukan error
 * yang kelihatan. Setiap menambah langkah --text-* di index.css, tambahkan
 * namanya di sini juga.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["d1", "d2", "d3", "lede", "eyebrow"],
    },
  },
});

export const cn = (...inputs) => twMerge(clsx(inputs));

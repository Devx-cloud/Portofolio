import { clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/*
 * twMerge bawaan tidak kenal skala font custom proyek (--text-pix-*, lihat
 * @theme di index.css) - "pix-xs" dkk dianggap bukan ukuran font, jadi jatuh
 * ke grup yang sama dengan warna teks dan KETIMPA kalau dipasangkan dengan
 * class warna (text-muted-foreground dst) dalam satu cn() call. Efeknya diam
 * -diam: elemen jatuh ke ukuran font default browser, bukan error yang kelihatan.
 */
const twMerge = extendTailwindMerge({
    extend: {
        theme: {
            text: ["pix-xs", "pix-sm", "pix-md", "pix-lg", "pix-xl", "pix-2xl", "pix-3xl"],
        },
    },
});

export const cn = (...inputs) =>{
    return twMerge(clsx(inputs))
};
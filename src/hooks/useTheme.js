import { useCallback, useEffect, useState } from "react";

/*
 * Tema terang/gelap.
 *
 * Sumber kebenarannya adalah atribut data-theme di <html>, BUKAN state React.
 * Alasannya urutan: skrip kecil di index.html sudah menetapkan atribut itu
 * sebelum frame pertama digambar, jauh sebelum React hidup. Kalau hook ini
 * memulai dengan tebakannya sendiri, halaman akan berkedip dari tema yang salah
 * ke tema yang benar tepat setelah hidrasi - persis kedipan yang dicegah oleh
 * skrip itu.
 *
 * Jadi: baca atributnya, jangan tentukan sendiri.
 */
const STORAGE_KEY = "tema";
const DARK = "dark";
const LIGHT = "light";

const readDom = () => (document.documentElement.dataset.theme === LIGHT ? LIGHT : DARK);

export const useTheme = () => {
  const [theme, setTheme] = useState(readDom);

  const apply = useCallback((next) => {
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* Mode penyamaran / penyimpanan diblokir. Temanya tetap berganti untuk
         kunjungan ini, cuma tidak diingat - dan itu jauh lebih baik daripada
         tombolnya mati total. */
    }
  }, []);

  const toggle = useCallback(() => {
    apply(readDom() === DARK ? LIGHT : DARK);
  }, [apply]);

  /* Ikuti perubahan pengaturan sistem, TAPI hanya selama pengunjung belum
     pernah memilih sendiri. Pilihan eksplisit harus menang atas sistem -
     kalau tidak, tema yang baru saja dipilih akan terbalik sendiri saat
     Windows berpindah ke mode malam terjadwal. */
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: light)");

    const sync = () => {
      try {
        if (localStorage.getItem(STORAGE_KEY)) return;
      } catch {
        /* tidak bisa membaca preferensi tersimpan - anggap belum memilih */
      }
      const next = mql.matches ? LIGHT : DARK;
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };

    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  return { theme, toggle, isLight: theme === LIGHT };
};

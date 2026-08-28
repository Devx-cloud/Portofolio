import { useLayoutEffect, useState } from "react";

/*
 * Lebar terpakai sebuah elemen, ikut berubah saat elemennya berubah ukuran.
 *
 * Dipakai panggung Profile untuk menempatkan pejalan kaki latar. Lebarnya wajib
 * dalam piksel, bukan persen: yang digerakkan adalah transform (supaya tidak
 * memicu layout tiap frame), dan persen pada translateX mengacu ke lebar elemen
 * itu sendiri, bukan ke lebar induknya.
 *
 * ResizeObserver, bukan event resize window: lebar sprite ikut breakpoint dan
 * lebar panggung bisa berubah tanpa window ikut berubah - munculnya scrollbar
 * saja sudah cukup.
 */
export const useElementWidth = (ref) => {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return width;
};

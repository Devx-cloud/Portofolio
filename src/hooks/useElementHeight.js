import { useLayoutEffect, useState } from "react";

/* Tinggi sebuah elemen termasuk padding dan border, ikut berubah saat elemennya
   berubah ukuran. Pasangan useElementWidth, dengan alasan yang sama untuk memakai
   ResizeObserver. Border box, bukan contentRect: pemanggilnya menggeser elemen
   sejauh tingginya, dan contentRect tidak menghitung padding. */
export const useElementHeight = (ref) => {
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) =>
      setHeight(entry.borderBoxSize?.[0]?.blockSize ?? el.offsetHeight)
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return height;
};

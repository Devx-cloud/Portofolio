import { useCallback, useSyncExternalStore } from "react";

/* Media query sebagai state React. Dipakai untuk keputusan yang tidak bisa
   diselesaikan CSS - misalnya menolak mengunduh chunk 3D sama sekali.

   useSyncExternalStore, bukan useState + effect. Versi lama mulai dari `false`
   dan baru membaca query SESUDAH render pertama, jadi satu frame pertama selalu
   salah: pengunjung reduced-motion sempat melihat gerak penuh, dan di desktop
   isWide sempat false sehingga panggung Profile menghitung ulang jangkar hero
   lalu melompat. Situs ini murni client (tanpa SSR), jadi window.matchMedia sudah
   ada saat render pertama dan nilainya bisa dibaca langsung. */
export const useMediaQuery = (query) => {
  const subscribe = useCallback(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query]
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
};

/* Satu implementasi untuk seluruh situs. Sebelumnya sebagian berkas memakai
   hook framer-motion dengan nama yang sama, jadi perilakunya bisa lepas sinkron. */
export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

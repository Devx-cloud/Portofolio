import { useCallback, useState } from "react";

/*
 * Melacak apakah sebuah <img> sudah benar-benar tergambar, supaya ia bisa
 * memudar masuk alih-alih muncul mendadak.
 *
 * Kenapa tidak cukup onLoad saja: gambar yang sudah ada di cache browser bisa
 * selesai dimuat SEBELUM React sempat memasang handler-nya, dan onLoad-nya
 * tidak pernah dipanggil. Gambarnya lalu tersangkut di opacity 0 - terpasang
 * di DOM, tidak terlihat, tanpa error. Karena itu ref callback di bawah
 * memeriksa `complete` saat elemennya baru menempel.
 *
 * naturalWidth ikut diperiksa karena `complete` juga bernilai true untuk
 * gambar yang GAGAL dimuat; tanpa itu, gambar rusak akan dianggap berhasil
 * dan bingkainya tetap kosong tanpa petunjuk apa pun.
 */
export const useImageLoaded = () => {
  const [loaded, setLoaded] = useState(false);

  const ref = useCallback((node) => {
    if (node?.complete && node.naturalWidth > 0) setLoaded(true);
  }, []);

  const onLoad = useCallback(() => setLoaded(true), []);

  return { ref, loaded, onLoad };
};

import { useEffect, useState } from "react";

/*
 * Menunggu sekumpulan gambar selesai diunduh DAN didekode.
 *
 * Panggung Profile menumpuk tiga plat kota berukuran 0,6-0,8 MB ditambah sprite
 * hero. Tanpa ditunggu, mereka muncul satu per satu sesuai urutan tiba: langit
 * kosong dulu, lalu satu plat, lalu hero yang tiba-tiba ada - di sambungan lambat
 * itu terlihat seperti tampilan yang rusak, bukan yang sedang dimuat.
 *
 * decode(), bukan onload: onload hanya berarti byte-nya sudah ada. Dekode gambar
 * selebar 2172px baru terjadi saat pertama digambar, dan itulah yang membuat frame
 * pertama tersendat.
 *
 * Tiga jaring pengaman supaya gerbang ini tidak pernah menahan halaman selamanya:
 *   - gambar yang gagal dimuat dianggap selesai (halaman tampil tanpa gambar itu);
 *   - timeoutMs melepas apa pun keadaannya;
 *   - `showLoader` baru menyala setelah slowAfterMs. Di sambungan cepat atau cache
 *     hangat semuanya siap dalam beberapa milidetik, dan layar tunggu yang berkedip
 *     sekejap lebih buruk daripada tidak ada.
 *
 * `urls` sebaiknya konstanta tingkat modul: array baru tiap render mengulang unduhan.
 */
export const useImagesReady = (urls, { timeoutMs = 8000, slowAfterMs = 250 } = {}) => {
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const finish = () => {
      if (!cancelled) setReady(true);
    };

    const timeout = setTimeout(finish, timeoutMs);
    const slowTimer = setTimeout(() => !cancelled && setSlow(true), slowAfterMs);

    Promise.all(
      urls.map((src) => {
        const img = new Image();
        img.decoding = "async";
        img.src = src;
        // Menolak (gagal muat) diperlakukan sama dengan selesai.
        return img.decode().catch(() => {});
      })
    ).then(finish);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      clearTimeout(slowTimer);
    };
  }, [urls, timeoutMs, slowAfterMs]);

  return { ready, showLoader: slow && !ready };
};

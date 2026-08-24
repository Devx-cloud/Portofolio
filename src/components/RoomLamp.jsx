import { Suspense, lazy, useEffect, useState } from "react";

/*
 * Gerbang untuk lampu 3D.
 *
 * Alasannya ada dua, dan keduanya penting:
 *
 *   1. three.js tidak diimpor di mana pun lagi di proyek ini. Impor statis
 *      akan menyeretnya ke bundle utama dan memperlambat SEMUA halaman demi
 *      satu elemen dekoratif di satu stage. lazy() memecahnya jadi chunk
 *      terpisah yang baru diunduh saat stage Ask AI dibuka - itu pun hanya
 *      kalau syarat di bawah terpenuhi.
 *   2. Syaratnya diperiksa SEBELUM impor dijalankan, bukan di dalam scene.
 *      Pengunjung di ponsel atau yang memasang prefers-reduced-motion tidak
 *      perlu mengunduh apa pun.
 */

const RoomLamp3D = lazy(() => import("./RoomLamp3D"));

/* Ukuran kanvas. Ini batas tempat lampu boleh diseret - apa pun yang melewatinya
   terpotong lurus oleh tepi kanvas. Diperlebar dari 360x520 supaya cahaya tidak
   kena potong saat lampu ditarik ke samping; ruang seret mendatar naik dari
   +-180px jadi +-280px. Tingginya diteruskan ke scene, yang memakainya untuk
   menghitung jarak kamera agar lampu tidak ikut membesar. */
const CANVAS_W = 2500;
const CANVAS_H = 700;

export const RoomLamp = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const queries = [
      window.matchMedia("(pointer: fine)"), // ada kursor untuk menarik
      window.matchMedia("(min-width: 1280px)"), // ada ruang di antara rak & karakter
      window.matchMedia("(prefers-reduced-motion: reduce)"),
    ];
    const sync = () => setEnabled(queries[0].matches && queries[1].matches && !queries[2].matches);

    sync();
    queries.forEach((q) => q.addEventListener("change", sync));
    return () => queries.forEach((q) => q.removeEventListener("change", sync));
  }, []);

  if (!enabled) return null;

  return (
    /* Ditaruh di celah antara rak buku dan karakter. Diukur dari lebar
       viewport, bukan offset tetap dari tengah: rak selalu berakhir di ~22%
       lebar gambar sementara karakter lebarnya tetap 448px, jadi celahnya
       bergeser mengikuti layar. 25% jatuh di sisi kiri celah dari 1280px ke atas.

       Di bawah 1280px celahnya cuma ~63px - tidak muat, dan itu sebabnya
       gerbang di atas menolak memuat scene-nya sama sekali. */
    <div
      style={{ width: CANVAS_W, height: CANVAS_H }}
      className="absolute top-[-50px] left-[20%] z-[2] -translate-x-1/2"
    >
      <Suspense fallback={null}>
        <RoomLamp3D height={CANVAS_H} />
      </Suspense>
    </div>
  );
};

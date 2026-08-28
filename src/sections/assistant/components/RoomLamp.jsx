import { Suspense, lazy } from "react";
import { useMediaQuery, useReducedMotion } from "@/hooks/useMediaQuery";

/*
 * Gerbang untuk lampu 3D. Dua alasan, keduanya penting:
 *
 *   1. three.js tidak diimpor di mana pun lagi. Impor statis akan menyeretnya ke
 *      bundle utama dan memperlambat SEMUA halaman demi satu elemen dekoratif.
 *   2. Syaratnya diperiksa SEBELUM impor dijalankan - pengunjung di ponsel atau
 *      yang memasang prefers-reduced-motion tidak mengunduh apa pun.
 */
const RoomLamp3D = lazy(() => import("./RoomLamp3D"));

/* Batas tempat lampu boleh diseret - apa pun yang melewatinya terpotong lurus
   oleh tepi kanvas. Tingginya diteruskan ke scene, yang memakainya untuk
   menghitung jarak kamera agar lampu tidak ikut membesar. */
const CANVAS_W = 2500;
const CANVAS_H = 700;

export const RoomLamp = () => {
  const hasCursor = useMediaQuery("(pointer: fine)"); // ada kursor untuk menarik
  const hasRoom = useMediaQuery("(min-width: 1280px)"); // ada celah antara rak & karakter
  const reducedMotion = useReducedMotion();

  if (!hasCursor || !hasRoom || reducedMotion) return null;

  return (
    /* Ditaruh di celah antara rak buku dan karakter, diukur dari lebar viewport
       bukan offset tetap dari tengah: rak selalu berakhir di ~22% lebar gambar
       sementara karakter lebarnya tetap 448px, jadi celahnya bergeser mengikuti
       layar. Di bawah 1280px celahnya cuma ~63px - itu sebabnya gerbang di atas
       menolak memuat scene-nya sama sekali. */
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

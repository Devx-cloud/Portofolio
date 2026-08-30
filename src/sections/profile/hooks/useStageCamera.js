import { useTransform } from "framer-motion";
import { useElementWidth } from "@/hooks/useElementWidth";
import {
  CYCLE_DISTANCE,
  HERO_ANCHOR,
  HERO_REACH,
  HERO_REACH_WIDE,
  HERO_START,
  LAYERS,
  PARTICLES,
} from "../constants";

/*
 * Sisi RUANG panggung: mengubah progres yang sudah dihaluskan jadi posisi -
 * geseran tiga plat kota, tiga pita kunang-kunang, pejalan latar, dan hero.
 *
 * Lebar diukur dari elemennya, bukan dihitung: --city-w itu max() dari tiga
 * suku yang salah satunya bergantung tinggi viewport. Piksel, bukan persen -
 * translateX berpersen mengacu ke lebar elemen itu sendiri.
 */
export const useStageCamera = ({ refs, smoothProgress, scrollYProgress, reducedMotion, isWide }) => {
  const stageWidth = useElementWidth(refs.stage);
  const cityWidth = useElementWidth(refs.city);
  const heroWidth = useElementWidth(refs.hero);

  /* Diturunkan dari LAYERS[2], bukan ditulis ulang -32%: kalau kecepatan layer
     terdepan disetel ulang, jatah fase dan pejalan kakinya harus ikut. */
  const nearTravel = parseFloat(LAYERS[2].travel) / 100;

  /* Tiga jarak yang harus ditempuh, dalam piksel layar. Batas kanan diberi
     Math.max terhadap jangkarnya: di layar sangat sempit lebar sprite bisa
     melampaui sisa ruang, dan tanpa itu hero berjalan MUNDUR di fase terakhir. */
  const anchorX = stageWidth * HERO_ANCHOR;
  // Layar lebar menahan hero di sisi kiri - panel babak menempati sisi kanan.
  const reach = isWide ? HERO_REACH_WIDE : HERO_REACH;
  const reachX = Math.max(anchorX, stageWidth * reach - heroWidth);
  const leadDist = Math.max(0, anchorX - stageWidth * HERO_START);
  const cameraDist = Math.abs(cityWidth * nearTravel);
  const tailDist = reachX - anchorX;
  const totalDist = leadDist + cameraDist + tailDist;

  /* Jatah scroll tiap fase SEBANDING JARAKNYA - itu yang membuat ketiganya
     berjalan pada kecepatan yang sama. Kuncinya dijaga tetap menaik: useTransform
     butuh rentang masukan yang naik ketat, dan sebelum panggung terukur
     totalDist masih nol. */
  const leadKey = totalDist ? Math.min(0.2, leadDist / totalDist) : 0.03;
  const tailKey = totalDist ? Math.min(0.9, tailDist / totalDist) : 0.5;
  const cameraKeys = [0, leadKey, Math.max(leadKey + 0.002, 1 - tailKey), 1];

  /* Posisi KAMERA 0..1 - bukan posisi scroll. Menempel di 0 selama fase LEAD
     dan di 1 selama fase TAIL. Semua yang membentuk dunia diturunkan dari sini;
     yang TIDAK cuma hero, opacity panel, dan bilah progres. */
  const cameraProgress = useTransform(smoothProgress, cameraKeys, [0, 0, 1, 1]);

  /* Hero punya rentangnya sendiri: berjalan masuk di fase LEAD, diam di jangkar
     selama kamera bekerja, lalu melanjutkan ke tepi kanan setelah kota mentok. */
  const heroX = useTransform(
    smoothProgress,
    cameraKeys,
    reducedMotion
      ? [anchorX, anchorX, anchorX, anchorX]
      : [stageWidth * HERO_START, anchorX, anchorX, reachX]
  );

  /* Jarak tempuh hero di atas tanah. Dua sumbangan yang dijumlahkan: geseran
     kota selama fase KAMERA, dan langkahnya sendiri di fase LEAD/TAIL - yang
     berbeda cuma siapa yang bergerak, dia atau kotanya. */
  const heroGround = useTransform(
    [cameraProgress, heroX],
    ([camera, screenX]) => camera * cameraDist + screenX
  );

  // Fase siklus jalan: bertambah 1 tiap satu putaran langkah penuh.
  const heroCycle = useTransform(heroGround, (d) =>
    heroWidth ? d / (heroWidth * CYCLE_DISTANCE) : 0
  );

  /* Satu useTransform per layer - hook tidak boleh dipanggil di dalam loop, dan
     jumlah layer memang tetap tiga. Tetap dalam PERSEN: persen di sini berarti
     "dari lebar plat kota", jadi platnya tidak bergantung hasil pengukuran. */
  const travel = (value) => (reducedMotion ? "0%" : value);
  const layerX = [
    useTransform(cameraProgress, [0, 1], ["0%", travel(LAYERS[0].travel)]),
    useTransform(cameraProgress, [0, 1], ["0%", travel(LAYERS[1].travel)]),
    useTransform(cameraProgress, [0, 1], ["0%", travel(LAYERS[2].travel)]),
  ];
  const dustX = [
    useTransform(cameraProgress, [0, 1], ["0%", travel(PARTICLES[0].travel)]),
    useTransform(cameraProgress, [0, 1], ["0%", travel(PARTICLES[1].travel)]),
    useTransform(cameraProgress, [0, 1], ["0%", travel(PARTICLES[2].travel)]),
  ];

  const walkerX = useTransform(
    cameraProgress,
    [0, 1],
    [0, reducedMotion ? 0 : cityWidth * nearTravel]
  );

  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return { stageWidth, heroX, heroCycle, layerX, dustX, walkerX, progressWidth };
};

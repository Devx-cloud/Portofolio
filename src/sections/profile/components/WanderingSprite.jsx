import { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useElementWidth } from "@/hooks/useElementWidth";
import { seeded } from "@/lib/random";
import { CharacterSprite } from "./CharacterSprite";

/* Kecepatan diturunkan DARI lebar sprite, bukan angka px tetap - lebar sprite
   ikut breakpoint, dan px yang dipatok bikin karakter meluncur di atas es di HP.
   1.4 lebar/detik = telapak diam di tanah: pada frame contact jarak kedua
   telapak ~0.7 lebar sel, dua langkah per siklus, satu siklus tepat 1 detik.
   Terikat ke durasi --animate-walk-cycle di index.css. */
const STRIDE_RATE = 1.4;

// Jeda berdiri diam di ujung perjalanan, milidetik.
const REST_MIN = 600;
const REST_SPAN = 2600;

/* Panjang minimum satu perjalanan sebagai fraksi wilayah jelajah. Tanpa ini
   undian bisa memilih titik yang nyaris sama dengan posisi sekarang, dan
   karakternya cuma bergetar di tempat sambil berulang kali ganti arah. */
const MIN_TRIP = 0.25;

/* Jarak aman di luar tepi panggung tempat pemutaran posisi dilakukan. Wajib
   lebih dari nol: diputar tepat di tepi, satu kolom piksel sprite masih tersisa
   di layar saat ia melompat ke sisi seberang. */
const WRAP_PAD = 32;

/*
 * Pejalan kaki latar: berjalan sendiri ke titik acak di wilayahnya, berdiri
 * sebentar, lalu berangkat lagi.
 *
 * Posisinya DITAMBAT KE KOTA, bukan ke layar - mereka berdiri di trotoar
 * layer-3, jadi geserannya harus sama persis dengan plat itu. Karena itu posisi
 * layarnya dua suku yang dijumlahkan:
 *   wanderX   - langkah mereka sendiri, lepas dari scroll
 *   parallaxX - geseran layer-3, dikirim pemanggil
 *
 * Hasilnya lalu DIPUTAR di titik yang berada di luar layar: layer-3 bergeser
 * ratusan piksel sepanjang lima babak, dan tanpa pemutaran keduanya hanyut
 * keluar layar di babak kedua lalu tidak pernah kembali.
 *
 * Perjalanannya dirantai lewat animate() imperatif, bukan prop animate: nilai
 * langkahnya harus bisa dijumlahkan dengan parallax sebelum dipasang.
 *
 * from/to sengaja dua angka, bukan satu array: array melahirkan identitas baru
 * tiap render dan akan me-restart efek di bawah terus-menerus.
 */
export const WanderingSprite = ({
  stageWidth,
  parallaxX,
  reducedMotion,
  seed,
  from,
  to,
  zIndex,
  sprite,
  className,
}) => {
  const boxRef = useRef(null);
  const selfWidth = useElementWidth(boxRef);
  const wanderX = useMotionValue(0);
  const [gait, setGait] = useState({ walking: false, facingRight: true });

  // Fase siklus jalan, tetap per pejalan. 2s menutupi siklus terpanjang (idle).
  const phase = useMemo(() => seeded(seed * 7 + 1)() * 2, [seed]);

  useEffect(() => {
    if (!stageWidth || !selfWidth) return;

    const rnd = seeded(seed);
    const min = from * stageWidth;
    const max = Math.max(min + 1, to * stageWidth - selfWidth);
    wanderX.set(min + rnd() * (max - min));

    if (reducedMotion) return;

    const speed = selfWidth * STRIDE_RATE;
    const minTrip = (max - min) * MIN_TRIP;
    let controls = null;
    let timer = null;

    const depart = (progress = 0) => {
      const x = wanderX.get();

      // Diundi ulang sampai cukup jauh; guard menahannya kalau wilayahnya sempit.
      let target = x;
      for (let i = 0; i < 12 && Math.abs(target - x) < minTrip; i++) {
        target = min + rnd() * (max - min);
      }

      const duration = Math.abs(target - x) / speed;
      setGait({ walking: true, facingRight: target > x });
      controls = animate(wanderX, target, {
        duration,
        ease: "linear",
        onComplete: () => {
          setGait((prev) => ({ ...prev, walking: false }));
          timer = setTimeout(depart, REST_MIN + rnd() * REST_SPAN);
        },
      });

      // Perjalanan pertama dimulai dari titik acak DI TENGAHNYA: kalau semua
      // berangkat dari nol, halaman dibuka dengan dua orang yang serempak
      // menghentak berjalan dari diam.
      if (progress) controls.time = progress * duration;
    };

    depart(rnd());

    return () => {
      clearTimeout(timer);
      controls?.stop();
    };
  }, [stageWidth, selfWidth, reducedMotion, seed, from, to, wanderX]);

  const x = useTransform([wanderX, parallaxX], ([wander, parallax]) => {
    if (!stageWidth || !selfWidth) return wander;

    // Pita pemutaran: selebar panggung ditambah jarak aman di kedua tepinya.
    const lead = selfWidth + WRAP_PAD;
    const band = stageWidth + lead + WRAP_PAD;
    const wrapped = (((wander + parallax + lead) % band) + band) % band;
    return wrapped - lead;
  });

  return (
    <motion.div
      ref={boxRef}
      aria-hidden="true"
      className="absolute bottom-[var(--ground)] left-0"
      /* zIndex lewat style: ia harus duduk di PEMBUNGKUS yang diposisikan,
         sementara className milik pemanggil menempel di sprite-nya. Sebelum
         terukur, sprite disembunyikan supaya tidak terlihat berdiri di x=0. */
      style={{ x, zIndex, opacity: stageWidth && selfWidth ? 1 : 0 }}
    >
      <CharacterSprite
        walking={gait.walking}
        facingRight={gait.facingRight}
        phase={phase}
        reducedMotion={reducedMotion}
        sprite={sprite}
        className={className}
      />
    </motion.div>
  );
};

import { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useAnimationFrame, useMotionValue, useTransform } from "framer-motion";
import { useElementWidth } from "@/hooks/useElementWidth";
import { cn } from "@/lib/utils";

/*
 * Sprite karakter dan pejalan kaki latar untuk panggung Profile.
 *
 * Dua strip dari scripts/build-sprite.py dengan sel identik 256x384: idle 4
 * frame, jalan 8 frame, telapak di baris paling bawah, dan ukuran WAJAH kedua
 * strip sudah disamakan - itu yang membuat keduanya bisa dipertukarkan tanpa
 * karakternya berubah besar.
 */

/* Silang-redam idle <-> jalan, sengaja tidak simetris.

   Memulai langkah boleh lembut - 160ms menghapus kejut pergantian pose tanpa
   sempat terbaca sebagai dua sprite yang tumpang tindih.

   Berhenti harus terasa seketika: begitu input habis, karakternya diam. 60ms
   hanya untuk menghindari potongan keras, dan itu di bawah ambang di mana mata
   masih membacanya sebagai "sempat melangkah lagi sebentar". */
const FADE_START = { duration: 0.16, ease: "easeOut" };
const FADE_STOP = { duration: 0.06, ease: "easeOut" };
const INSTANT = { duration: 0 };

// Jumlah frame strip jalan; menentukan besar satu langkah geseran strip.
const WALK_FRAMES = 8;

/* Langit-langit kecepatan langkah, frame per detik. Harus sama dengan tempo
   --animate-walk-cycle di index.css (8 frame / 1 detik), supaya hero yang
   siklusnya berbasis jarak dan pejalan latar yang berbasis waktu melangkah pada
   irama yang sama.

   8 fps juga batas yang membuat animasinya tetap terbaca: strip sumbernya cuma
   berisi ~4 pose unik yang diulang dua kali, jadi diputar lebih cepat frame-nya
   melebur jadi kaki yang bergetar, bukan langkah. */
const WALK_FPS = 8;
const FRAME_MS = 1000 / WALK_FPS;

/* Jendela selebar satu sel; stripnya (idle 400% = 4 sel, jalan 800% = 8 sel)
   digeser di dalamnya oleh animate-*-cycle.

   KEDUA STRIP SELALU BERANIMASI, yang tidak aktif cuma diredam ke opacity 0 -
   bukan display:none. Sebabnya fase: display:none menghentikan animasi CSS,
   jadi tiap kali berhenti lalu jalan lagi siklusnya lompat balik ke frame 1
   dan langkahnya tersendat. Dengan opacity, siklus jalan terus berputar di
   balik layar dan disambung dari fase mana pun ia sedang berada.

   Tanpa .sprite: strip diperkecil 256 -> 56..88px, dan image-rendering:pixelated
   pada pengecilan non-bulat membuang piksel secara tidak rata sehingga sprite
   bergetar selama animasi.

   scaleX ditulis langsung ke transform, bukan dianimasikan: berbalik arah harus
   terjadi dalam satu frame. Dilewatkan transisi apa pun, badannya terlihat
   memipih dulu sebelum menghadap sebaliknya.

   Posisi TIDAK diatur di sini - pemanggilnya yang menempatkan, karena hero
   ditambat ke garis tanah sementara pejalan latar digeser terus-menerus.

   phase menggeser titik mulai siklus lewat animation-delay negatif. Tanpa itu
   semua sprite di halaman memulai animasi CSS-nya pada detik yang sama, dan
   sekumpulan orang yang melangkah dengan kaki yang persis seragam terbaca
   sebagai barisan, bukan sebagai orang-orang yang kebetulan lewat.

   cycle menggantikan waktu dengan JARAK. Diisi, siklus jalan tidak lagi berputar
   sendiri per detik melainkan mengikuti nilai yang diberikan pemanggil - satu
   putaran penuh tiap kali nilainya bertambah 1. Dipakai hero, yang majunya
   ditentukan scroll: dengan siklus berbasis waktu, menggulir pelan membuat
   kakinya tetap mengayuh penuh di atas tanah yang nyaris diam.

   Pejalan latar TIDAK memakainya - mereka bergerak dalam waktu nyata dan
   kecepatannya sudah diturunkan dari panjang langkah lewat STRIDE_RATE, jadi
   siklus per detik justru yang benar untuk mereka. */
export const CharacterSprite = ({
  walking,
  facingRight,
  phase = 0,
  cycle,
  reducedMotion,
  className,
}) => {
  const fade = reducedMotion ? INSTANT : walking ? FADE_START : FADE_STOP;
  // Negatif: siklusnya dimajukan, bukan ditunda.
  const offset = phase ? { animationDelay: `-${phase}s` } : undefined;

  /* Frame yang benar-benar ditampilkan, dibatasi WALK_FPS.

     Fase mentah dari pemanggil boleh melaju secepat apa pun - digulir kencang,
     jarak tempuh hero bisa setara 50 frame per detik, dan pada tempo itu kakinya
     cuma bergetar. Di sini ia disaring: frame hanya boleh maju SATU tiap
     FRAME_MS, ke arah mana pun fase itu bergerak.

     Nilai cadangan menjaga jumlah hook tetap sama saat cycle tidak diisi -
     useTransform tidak boleh dipanggil bersyarat. */
  const still = useMotionValue(0);
  const frame = useMotionValue(0);
  const frameRef = useRef(0);
  const waitRef = useRef(0);

  useAnimationFrame((_, delta) => {
    if (!cycle) return;

    // Hitungan mundur hanya berjalan selama masih positif; dibiarkan menembus
    // nol supaya langkah pertama sesudah berhenti tidak tertahan.
    if (waitRef.current > 0) {
      waitRef.current -= delta;
      return;
    }

    const target = Math.floor(cycle.get() * WALK_FRAMES);
    let current = frameRef.current;
    const lag = target - current;
    if (!lag) return;

    /* Utang lebih dari satu siklus dibuang. Tanpa ini, satu guliran kencang
       menyisakan ratusan frame tertunggak dan hero akan terus melangkah belasan
       detik setelah halaman berhenti. Yang dibuang selalu kelipatan WALK_FRAMES,
       jadi frame yang tampil tidak pernah terlihat melompat. */
    if (Math.abs(lag) > WALK_FRAMES) {
      current = target - Math.sign(lag) * (Math.abs(lag) % WALK_FRAMES);
    }

    frameRef.current = current + Math.sign(target - current);
    frame.set(frameRef.current);
    waitRef.current = FRAME_MS;
  });

  const walkX = useTransform(cycle ? frame : still, (v) => {
    // Modulo ganda: sisa bagi JS bertanda, dan mundur harus tetap jatuh di 0..7.
    const index = ((v % WALK_FRAMES) + WALK_FRAMES) % WALK_FRAMES;
    return `${(-index * 100) / WALK_FRAMES}%`;
  });

  return (
    <div
      aria-hidden="true"
      style={{ transform: `scaleX(${facingRight ? 1 : -1})` }}
      className={cn("relative aspect-[2/3] overflow-hidden", className)}
    >
      <motion.img
        src="/sprite-idle.png"
        alt=""
        animate={{ opacity: walking ? 0 : 1 }}
        transition={fade}
        style={offset}
        className={cn(
          "absolute top-0 left-0 h-full w-[400%] max-w-none select-none",
          !reducedMotion && "animate-idle-cycle"
        )}
      />
      <motion.img
        src="/sprite-walk.png"
        alt=""
        animate={{ opacity: walking ? 1 : 0 }}
        transition={fade}
        style={cycle ? { ...offset, x: walkX } : offset}
        className={cn(
          "absolute top-0 left-0 h-full w-[800%] max-w-none select-none",
          !cycle && "animate-walk-cycle"
        )}
      />
    </div>
  );
};

/* PRNG bersemai, sama seperti di Fireflies: tiap pejalan butuh lintasan yang
   berbeda dari temannya, tapi Math.random() akan mengocok ulang tiap kali
   panggung ter-render - dan panggung ini ter-render setiap babak berganti. */
const seeded = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

/* Kecepatan jalan diturunkan DARI lebar sprite, bukan disetel sebagai angka px
   tetap, karena lebar sprite ikut breakpoint. Kalau px-nya dipatok, di HP
   karakternya akan terlihat meluncur di atas es.

   1,4 lebar per detik itu angka yang membuat telapaknya diam di tanah: pada
   frame contact jarak kedua telapak ~0,7 lebar sel, dua langkah per siklus, dan
   satu siklus kini tepat 1 detik -> 1,4 lebar / 1s.

   Terikat ke durasi --animate-walk-cycle. Diubah salah satunya saja, telapak
   pejalan latar mulai menyeret. */
const STRIDE_RATE = 1.4;

// Jeda berdiri diam di ujung perjalanan, milidetik.
const REST_MIN = 600;
const REST_SPAN = 2600;

/* Panjang minimum satu perjalanan, sebagai fraksi wilayah jelajahnya. Tanpa ini
   undian bisa memilih titik yang nyaris sama dengan posisi sekarang, dan
   karakternya cuma bergetar di tempat sambil berulang kali ganti arah. */
const MIN_TRIP = 0.25;

/* Jarak aman di luar tepi panggung tempat pemutaran posisi dilakukan. Wajib
   lebih dari nol: kalau diputar tepat di tepi, satu kolom piksel sprite masih
   tersisa di layar saat ia melompat ke sisi seberang. */
const WRAP_PAD = 32;

/* Pejalan kaki latar: berjalan sendiri ke titik acak di wilayahnya, berdiri
   sebentar, lalu berangkat lagi ke arah mana pun.

   Posisinya DITAMBAT KE KOTA, bukan ke layar. Mereka berdiri di trotoar layer-3,
   jadi geserannya harus sama persis dengan plat itu - kalau tidak, begitu
   pengunjung scroll mereka akan terlihat meluncur menempel di kaca sementara
   trotoar di bawahnya berjalan sendiri.

   Karena itu posisi layar mereka dua suku yang dijumlahkan:
     wanderX   - langkah mereka sendiri, lepas dari scroll
     parallaxX - geseran layer-3, dibagi dari pemanggil

   Lalu hasilnya DIPUTAR: layer-3 bergeser ratusan piksel sepanjang lima babak,
   dan tanpa pemutaran keduanya akan hanyut keluar layar di babak kedua lalu
   tidak pernah kembali. Dengan pemutaran, yang keluar di kiri masuk lagi dari
   kanan - persis seperti berjalan menyusuri jalan yang tidak habis-habis. Titik
   putarnya berada di luar layar, jadi lompatannya tidak pernah terlihat.

   Perjalanannya dirantai lewat animate() imperatif, bukan prop animate: nilai
   langkahnya harus bisa dijumlahkan dengan parallax sebelum dipasang, dan itu
   menuntut MotionValue yang bisa dibaca, bukan transform yang sudah terlanjur
   ditulis framer-motion ke elemen.

   from/to sengaja dua angka, bukan satu array: array melahirkan identitas baru
   tiap render dan akan me-restart efek di bawah terus-menerus. */
export const WanderingSprite = ({
  stageWidth,
  parallaxX,
  reducedMotion,
  seed,
  from,
  to,
  zIndex,
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

      // Perjalanan pertama dimulai dari titik acak DI TENGAHNYA, bukan dari
      // ujungnya: kalau semua berangkat dari nol, halaman dibuka dengan dua orang
      // yang serempak menghentak berjalan dari diam.
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
      /* zIndex lewat style, bukan class: ia harus duduk di PEMBUNGKUS yang
         diposisikan, sementara className milik pemanggil menempel di sprite-nya.
         Sebelum terukur, sprite disembunyikan supaya tidak sempat terlihat
         berdiri di x=0. */
      style={{ x, zIndex, opacity: stageWidth && selfWidth ? 1 : 0 }}
    >
      <CharacterSprite
        walking={gait.walking}
        facingRight={gait.facingRight}
        phase={phase}
        reducedMotion={reducedMotion}
        className={className}
      />
    </motion.div>
  );
};

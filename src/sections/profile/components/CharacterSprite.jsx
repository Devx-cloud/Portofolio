import { useMotionValue, useAnimationFrame, useTransform, motion } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { GroundShadow } from "./GroundShadow";

/*
 * Jendela selebar satu sel untuk dua strip dari scripts/build-sprite.py: idle
 * 4 frame, jalan 8 frame, sel identik 256x384, telapak di baris paling bawah.
 * Ukuran wajah kedua strip sudah disamakan - itu yang membuat keduanya bisa
 * dipertukarkan tanpa karakternya berubah besar.
 *
 * Posisi TIDAK diatur di sini: hero ditambat ke garis tanah sementara pejalan
 * latar digeser terus-menerus, jadi pemanggilnya yang menempatkan.
 */

/* Silang-redam idle <-> jalan. Mulai dan berhenti harus sama-sama terasa seketika
   mengikuti scroll - 60ms cuma menghindari potongan keras. */
const FADE = { duration: 0.06, ease: "easeOut" };
const INSTANT = { duration: 0 };

const WALK_FRAMES = 8;

/* Langit-langit kecepatan langkah. Harus sama dengan tempo --animate-walk-cycle
   di index.css (8 frame / 1 detik) supaya hero yang siklusnya berbasis jarak
   dan pejalan latar yang berbasis waktu melangkah pada irama yang sama.
   8 fps juga batas keterbacaan: stripnya cuma ~4 pose unik yang diulang. */
const WALK_FPS = 8;
const FRAME_MS = 1000 / WALK_FPS;

/*
 * walking      - strip mana yang tampil. KEDUANYA selalu beranimasi; yang tidak
 *                aktif diredam ke opacity 0, bukan display:none - display:none
 *                menghentikan animasi CSS, jadi tiap berhenti lalu jalan lagi
 *                siklusnya lompat balik ke frame 1 dan langkahnya tersendat.
 * facingRight  - ditulis langsung ke transform, bukan dianimasikan: berbalik
 *                arah harus terjadi dalam satu frame, kalau tidak badannya
 *                terlihat memipih dulu.
 * phase        - menggeser titik mulai lewat animation-delay negatif. Tanpa itu
 *                semua sprite melangkah dengan kaki yang persis seragam, dan itu
 *                terbaca sebagai barisan, bukan orang yang kebetulan lewat.
 * cycle        - MotionValue opsional yang menggantikan waktu dengan JARAK: satu
 *                putaran tiap nilainya bertambah 1. Dipakai hero, yang majunya
 *                ditentukan scroll. Pejalan latar tidak memakainya - mereka
 *                bergerak dalam waktu nyata (lihat STRIDE_RATE).
 * sprite       - { walk, idle? }. idle boleh kosong: NPC tidak punya lembar
 *                idle, jadi lapisan diamnya memakai strip JALAN yang dibekukan
 *                di frame pertama. Lebar lapisan itu karenanya harus ikut
 *                berubah - 400% untuk strip idle 4 frame, 800% untuk strip
 *                jalan 8 frame. Salah lebar, yang tampil bukan satu frame
 *                melainkan dua frame terjepit dalam satu jendela.
 */
export const CharacterSprite = ({
  walking,
  facingRight,
  phase = 0,
  cycle,
  reducedMotion,
  className,
  sprite,
  /* "low" untuk NPC latar supaya tidak berebut pita dengan hero dan layer
     kota. Default kosong = prioritas normal untuk hero. */
  fetchPriority,
}) => {
  const hasIdleSheet = Boolean(sprite.idle);
  const fade = reducedMotion ? INSTANT : FADE;
  // Negatif: siklusnya dimajukan, bukan ditunda.
  const offset = phase ? { animationDelay: `-${phase}s` } : undefined;

  /* Frame yang benar-benar ditampilkan, dibatasi WALK_FPS. Fase mentah dari
     pemanggil boleh melaju secepat apa pun - digulir kencang, jarak tempuh hero
     bisa setara 50 frame/detik, dan pada tempo itu kakinya cuma bergetar.
     Nilai cadangan `still` menjaga jumlah hook tetap sama saat cycle kosong. */
  const still = useMotionValue(0);
  const frame = useMotionValue(0);
  const lastTargetRef = useRef(null);
  const waitRef = useRef(0);

  useAnimationFrame((_, delta) => {
    if (!cycle) return;

    // Dibiarkan menembus nol supaya langkah pertama sesudah berhenti tidak tertahan.
    if (waitRef.current > 0) {
      waitRef.current -= delta;
      return;
    }

    const target = Math.floor(cycle.get() * WALK_FRAMES);
    if (lastTargetRef.current === null) lastTargetRef.current = target;
    const lag = target - lastTargetRef.current;
    if (!lag) return;

    /* Maju satu pose ke arah gerak, lalu seluruh sisa jarak dianggap lunas. Kaki
       yang mengejar utang frame tetap melangkah sesudah scroll melambat, dan itu
       terbaca sebagai karakter yang tertinggal dari tanahnya. */
    lastTargetRef.current = target;
    frame.set(frame.get() + Math.sign(lag));
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
      /* Tanpa .sprite: strip diperkecil 256 -> 56..88px, dan image-rendering
         pixelated pada pengecilan non-bulat membuang piksel secara tidak rata
         sehingga sprite bergetar selama animasi. */
      className={cn("relative aspect-[2/3] overflow-hidden", className)}
    >
      {/* Dirender paling awal supaya jatuh di belakang kedua strip. */}
      <GroundShadow />

      <motion.img
        src={sprite.idle ?? sprite.walk}
        alt=""
        fetchPriority={fetchPriority}
        animate={{ opacity: walking ? 0 : 1 }}
        transition={fade}
        style={offset}
        className={cn(
          "absolute top-0 left-0 h-full max-w-none select-none",
          hasIdleSheet ? "w-[400%]" : "w-[800%]",
          !reducedMotion && hasIdleSheet && "animate-idle-cycle"
        )}
      />
      <motion.img
        src={sprite.walk}
        alt=""
        fetchPriority={fetchPriority}
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

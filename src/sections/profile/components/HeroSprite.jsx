import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { HERO_SPRITE, SPRITE_SIZE } from "../constants";
import { CharacterSprite } from "./CharacterSprite";

/* Penanda "ini kamu". Wajib ada begitu pejalan latar dibuat seukuran hero:
   tanpa beda ukuran, satu-satunya pembeda tinggal cahaya, dan itu tidak cukup.

   Empat rect bertingkat, bukan polygon atau segitiga border-CSS: keduanya
   menghasilkan sisi miring yang mulus sementara seluruh panggung bertepi keras.

   Bob dipasang di elemen DALAM - pemusatan memakai -translate-x-1/2 dan keyframe
   bob menulis transform juga; di elemen yang sama animasinya menimpa pemusatan. */
const Marker = ({ reducedMotion }) => (
  <div className="absolute bottom-full left-1/2 -translate-x-1/2">
    <svg
      viewBox="0 0 8 5"
      aria-hidden="true"
      fill="hsl(var(--stage-accent))"
      className={cn("w-3.5 sm:w-4 md:w-5", !reducedMotion && "animate-bob")}
    >
      <rect x="0" y="0" width="8" height="1" />
      <rect x="1" y="1" width="6" height="1" />
      <rect x="2" y="2" width="4" height="1" />
      <rect x="3" y="3" width="2" height="1" />
    </svg>
  </div>
);

/*
 * Hero berdiri di aspal, tapi TIDAK di titik layar yang tetap: posisinya digeser
 * lewat heroX, yang punya rentang terpisah dari kamera (lihat useStageCamera).
 *
 * left-0, bukan left-3/6/12: jarak dari tepi sekarang bagian dari heroX, dan
 * menumpuk keduanya akan menggeser seluruh rentangnya ke kanan. Sel strip-nya
 * menempatkan telapak di baris paling bawah, jadi cukup bottom-[var(--ground)].
 */
export const HeroSprite = ({ heroRef, x, cycle, walking, facingRight, reducedMotion }) => (
  <motion.div ref={heroRef} style={{ x }} className="absolute bottom-[var(--ground)] left-0 z-10">
    <Marker reducedMotion={reducedMotion} />
    <CharacterSprite
      walking={walking}
      facingRight={facingRight}
      cycle={cycle}
      reducedMotion={reducedMotion}
      sprite={HERO_SPRITE}
      className={SPRITE_SIZE}
    />
  </motion.div>
);

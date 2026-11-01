import { useRef } from "react";
import { motion } from "framer-motion";
import { StarBackground } from "@/components/backgrounds/StarBackground";
import { StageLoading } from "@/components/StageLoading";
import { useImagesReady } from "@/hooks/useImagesReady";
import { useMediaQuery, useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { ACTS } from "./acts";
import {
  HERO_SPRITE,
  LAYERS,
  SCROLL_SPAN,
  STAGE_VARS,
  WALKERS,
  panelSlot,
  panelWrap,
} from "./constants";
import { useStageProgress } from "./hooks/useStageProgress";
import { useStageCamera } from "./hooks/useStageCamera";
import { ActHud } from "./components/ActHud";
import { ActInterludes } from "./components/ActInterludes";
import { CityParallax } from "./components/CityParallax";
import { HeroSprite } from "./components/HeroSprite";
import { WanderingSprite } from "./components/WanderingSprite";
import { ACT_PANELS } from "./components/acts";

/* Aset yang harus ada sebelum panggung ditampilkan: tiga plat kota dan sprite
   hero. Empat NPC sengaja tidak ikut - mereka hiasan latar berprioritas rendah
   (~1,3 MB) dan boleh muncul menyusul tanpa ada yang merasa kehilangan. */
const CORE_IMAGES = [...LAYERS.map((layer) => layer.src), HERO_SPRITE.walk, HERO_SPRITE.idle];

/*
 * Panggung side-scroller: satu kolom scroll yang panjang menggerakkan kamera,
 * kota, karakter, dan gulungan panel babak sekaligus, semuanya langsung dari
 * posisi scroll pada frame yang sama.
 *
 * Pembagian tugas:
 *   useStageProgress - waktu: scroll -> progres, sinyal gerak, babak aktif
 *   useStageCamera   - ruang: progres -> geseran kota, hero, dan panel
 *   constants.js     - semua angka yang bisa disetel, beserta alasannya
 *
 * Komponen ini sengaja tidak punya state yang berubah saat menggulir (lihat
 * useMotionState): merendernya ulang berarti merender ulang seluruh panggung.
 */
export const ProfileSection = () => {
  const refs = { stage: useRef(null), city: useRef(null), hero: useRef(null) };

  const reducedMotion = useReducedMotion();
  const { ready, showLoader } = useImagesReady(CORE_IMAGES);
  /* 40rem = breakpoint sm, ambang yang sama dengan panelWrap memindahkan panel
     ke kanan. Keduanya WAJIB satu angka: kalau berbeda, akan ada rentang lebar
     di mana panel sudah pindah ke kanan tapi hero masih berjalan ke sana. */
  const isWide = useMediaQuery("(min-width: 40rem)");
  const { scrollYProgress, isMoving, activeIndex, facingRight, goToAct } =
    useStageProgress(reducedMotion);
  const { stageWidth, heroX, heroCycle, layerX, dustX, walkerX, panelY } = useStageCamera({
    refs,
    scrollYProgress,
    reducedMotion,
    isWide,
  });

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn("relative", SCROLL_SPAN)}
    >
      {/* fixed, jadi tidak ikut tergulung bersama kolom scroll. */}
      {showLoader && <StageLoading label="Memuat kota" className="fixed inset-x-0 top-20 z-20" />}

      {/* --city-drop menurunkan pelat kota dari dasar panggung; --ground ikut
          menguranginya, jadi kota dan sprite tetap teregistrasi. 90px itu ukuran
          desktop (panggung ~820px); di HP panggungnya cuma ~593px, dan 90px di
          situ mendorong garis trotoar keluar layar.

          overflow-clip, bukan overflow-hidden: yang kedua masih bisa digulir oleh
          fokus keyboard, dan panggung yang tergulir sendiri merusak semua posisi
          di dalamnya. */}
      <div
        ref={refs.stage}
        className={cn(
          "sticky top-20 h-[calc(100svh-5rem)] overflow-clip bg-background transition-opacity duration-500",
          "[--city-drop:28px] md:[--city-drop:90px]",
          // Panggung tetap dirender dan bekerja, hanya disembunyikan sampai aset intinya siap.
          !ready && "opacity-0"
        )}
        style={STAGE_VARS}
      >
        <StarBackground />

        <CityParallax
          layerX={layerX}
          dustX={dustX}
          cityRef={refs.city}
          reducedMotion={reducedMotion}
        />

        {/* Peneduh di z-8: DI ATAS pelat kota (z-1..7) tapi DI BAWAH hero (z-10).
            Urutannya penting - dinaikkan ke atas hero, penanda "ini kamu" ikut
            teredam, dan justru itu satu-satunya hal yang harus tetap terang. */}
        <div aria-hidden="true" className="act-scrim pointer-events-none absolute inset-0 z-[8]" />

        {/* Pejalan latar sebelum hero supaya urutan DOM mengikuti kedalaman;
            yang menentukan tumpukan tetap zIndex. */}
        {WALKERS.map((walker) => (
          <WanderingSprite
            key={walker.seed}
            stageWidth={stageWidth}
            parallaxX={walkerX}
            reducedMotion={reducedMotion}
            {...walker}
          />
        ))}

        <HeroSprite
          heroRef={refs.hero}
          x={heroX}
          cycle={heroCycle}
          isMoving={isMoving}
          facingRight={facingRight}
          reducedMotion={reducedMotion}
        />

        {/* Masker dipasang di jendela yang diam, gulungannya bergerak di dalamnya.
            onFocus: panel di luar jendela tetap bisa dicapai dengan Tab, dan
            halamannya digulir ke babak itu supaya tombol yang fokus terlihat. Hanya
            fokus keyboard - klik mouse juga memberi fokus, dan tanpa :focus-visible
            halaman bergeser persis saat tombolnya ditekan. */}
        <div className="act-reel absolute inset-0 z-20">
          <motion.div
            style={{ y: panelY }}
            className="relative grid h-[400%] grid-rows-4 will-change-transform"
          >
            {/* Lebih dulu di DOM, dan baris panel dibuat relative: panel selalu
                menutupi ujung jalur titik singgah. */}
            <ActInterludes />
            {ACT_PANELS.map((Act, i) => (
              <div
                key={ACTS[i].id}
                className={cn(panelWrap, "relative")}
                onFocus={(event) => event.target.matches(":focus-visible") && goToAct(i)}
              >
                <div className={panelSlot}>
                  <Act index={i} />
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <ActHud activeIndex={activeIndex} onSelect={goToAct} progress={scrollYProgress} />
      </div>
    </motion.section>
  );
};

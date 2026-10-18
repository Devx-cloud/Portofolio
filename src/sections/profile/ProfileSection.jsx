import { useRef } from "react";
import { motion, useTransform } from "framer-motion";
import { StarBackground } from "@/components/backgrounds/StarBackground";
import { StageLoading } from "@/components/StageLoading";
import { useImagesReady } from "@/hooks/useImagesReady";
import { useMediaQuery, useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { ACTS } from "./acts";
import { HERO_SPRITE, LAYERS, SCROLL_SPAN, STAGE_VARS, WALKERS, panelWrap } from "./constants";
import { useStageProgress } from "./hooks/useStageProgress";
import { useStageCamera } from "./hooks/useStageCamera";
import { ActHud } from "./components/ActHud";
import { CityParallax } from "./components/CityParallax";
import { HeroSprite } from "./components/HeroSprite";
import { WanderingSprite } from "./components/WanderingSprite";
import { ACT_PANELS } from "./components/acts";

/* Aset yang harus ada sebelum panggung ditampilkan: tiga plat kota dan sprite
   hero. Empat NPC sengaja tidak ikut - mereka hiasan latar berprioritas rendah
   (~1,3 MB) dan boleh muncul menyusul tanpa ada yang merasa kehilangan. */
const CORE_IMAGES = [...LAYERS.map((layer) => layer.src), HERO_SPRITE.walk, HERO_SPRITE.idle];

/*
 * Panggung side-scroller: satu kolom scroll menggerakkan kamera, kota, dan
 * karakter sekaligus, dengan empat panel babak yang saling silih berganti.
 *
 * Pembagian tugas:
 *   useStageProgress - waktu: scroll -> progres terbatas & halus, babak aktif
 *   useStageCamera   - ruang: progres -> geseran plat kota dan posisi hero
 *   constants.js     - semua angka yang bisa disetel, beserta alasannya
 */
export const ProfileSection = () => {
  const containerRef = useRef(null);
  const refs = { stage: useRef(null), city: useRef(null), hero: useRef(null) };

  const reducedMotion = useReducedMotion();
  const { ready, showLoader } = useImagesReady(CORE_IMAGES);
  /* 40rem = breakpoint sm, ambang yang sama dengan panelWrap memindahkan panel
     ke kanan. Keduanya WAJIB satu angka: kalau berbeda, akan ada rentang lebar
     di mana panel sudah pindah ke kanan tapi hero masih berjalan ke sana. */
  const isWide = useMediaQuery("(min-width: 40rem)");
  const { scrollYProgress, smoothProgress, isMoving, activeIndex, facingRight, goToAct } =
    useStageProgress(containerRef, reducedMotion);
  const { stageWidth, heroX, heroCycle, layerX, dustX, walkerX, progressWidth } = useStageCamera({
    refs,
    smoothProgress,
    scrollYProgress,
    reducedMotion,
    isWide,
  });

  // Satu useTransform per babak - hook tidak boleh dipanggil di dalam loop.
  const actOpacity = [
    useTransform(scrollYProgress, ACTS[0].range, ACTS[0].fade),
    useTransform(scrollYProgress, ACTS[1].range, ACTS[1].fade),
    useTransform(scrollYProgress, ACTS[2].range, ACTS[2].fade),
    useTransform(scrollYProgress, ACTS[3].range, ACTS[3].fade),
  ];

  // Panel non-aktif dibuat inert: tidak bisa di-tab, tidak dibaca screen reader.
  const actProps = (index) => ({
    inert: activeIndex !== index ? true : undefined,
    "aria-hidden": activeIndex !== index || undefined,
    className: cn(panelWrap, activeIndex !== index && "pointer-events-none"),
  });

  return (
    <motion.section
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn("relative", SCROLL_SPAN)}
    >
      {/* fixed, jadi tidak ikut tergulung bersama kolom scroll setinggi 500-750vh. */}
      {showLoader && <StageLoading label="Memuat kota" className="fixed inset-x-0 top-20 z-20" />}

      {/* --city-drop menurunkan pelat kota dari dasar panggung; --ground ikut
          menguranginya, jadi kota dan sprite tetap teregistrasi. 90px itu ukuran
          desktop (panggung ~820px); di HP panggungnya cuma ~593px, dan 90px di
          situ mendorong garis trotoar keluar layar. */}
      <div
        ref={refs.stage}
        className={cn(
          "sticky top-20 h-[calc(100svh-5rem)] overflow-hidden bg-background transition-opacity duration-500",
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
          // Ada input -> strip jalan. Input berhenti -> strip idle (lihat IDLE_DELAY).
          walking={!reducedMotion && isMoving}
          facingRight={facingRight}
          reducedMotion={reducedMotion}
        />

        {ACT_PANELS.map((Act, i) => (
          <motion.div key={ACTS[i].id} style={{ opacity: actOpacity[i] }} {...actProps(i)}>
            <Act index={i} />
          </motion.div>
        ))}

        <ActHud activeIndex={activeIndex} onSelect={goToAct} progressWidth={progressWidth} />
      </div>
    </motion.section>
  );
};

import { useRef } from "react";
import { motion, useTransform } from "framer-motion";
import { StarBackground } from "@/components/backgrounds/StarBackground";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { ACTS } from "./acts";
import { SCROLL_SPAN, STAGE_VARS, WALKERS, panelWrap } from "./constants";
import { useStageProgress } from "./hooks/useStageProgress";
import { useStageCamera } from "./hooks/useStageCamera";
import { ActHud } from "./components/ActHud";
import { CityParallax } from "./components/CityParallax";
import { HeroSprite } from "./components/HeroSprite";
import { WanderingSprite } from "./components/WanderingSprite";
import { ACT_PANELS } from "./components/acts";

/*
 * Panggung side-scroller: satu kolom scroll menggerakkan kamera, kota, dan
 * karakter sekaligus, dengan lima panel babak yang saling silih berganti.
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
  const { scrollYProgress, smoothProgress, isMoving, activeIndex, facingRight, goToAct } =
    useStageProgress(containerRef, reducedMotion);
  const { stageWidth, heroX, heroCycle, layerX, dustX, walkerX, progressWidth } = useStageCamera({
    refs,
    smoothProgress,
    scrollYProgress,
    reducedMotion,
  });

  // Satu useTransform per babak - hook tidak boleh dipanggil di dalam loop.
  const actOpacity = [
    useTransform(scrollYProgress, ACTS[0].range, ACTS[0].fade),
    useTransform(scrollYProgress, ACTS[1].range, ACTS[1].fade),
    useTransform(scrollYProgress, ACTS[2].range, ACTS[2].fade),
    useTransform(scrollYProgress, ACTS[3].range, ACTS[3].fade),
    useTransform(scrollYProgress, ACTS[4].range, ACTS[4].fade),
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
      {/* --city-drop menurunkan pelat kota dari dasar panggung; --ground ikut
          menguranginya, jadi kota dan sprite tetap teregistrasi. 90px itu ukuran
          desktop (panggung ~820px); di HP panggungnya cuma ~593px, dan 90px di
          situ mendorong garis trotoar keluar layar. */}
      <div
        ref={refs.stage}
        className="sticky top-20 h-[calc(100vh-5rem)] overflow-hidden bg-background [--city-drop:28px] md:[--city-drop:90px]"
        style={STAGE_VARS}
      >
        <StarBackground />

        <CityParallax
          layerX={layerX}
          dustX={dustX}
          cityRef={refs.city}
          reducedMotion={reducedMotion}
        />

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

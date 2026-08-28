import { motion } from "framer-motion";
import { Fireflies } from "@/components/backgrounds/Fireflies";
import { cn } from "@/lib/utils";
import { LAYERS, PARTICLES } from "../constants";

const bandClass = "absolute bottom-[calc(-1*var(--city-drop))] left-0 pointer-events-none";

/*
 * Kota: tiga plat bertumpuk, masing-masing bergeser dengan kecepatan sendiri.
 * Semuanya seukuran dan ditambat ke titik yang sama supaya registrasinya
 * terjaga; langitnya transparan supaya bintang tembus.
 *
 * Kunang-kunang disisipkan DI ANTARA plat lewat z-index, bukan ditumpuk di atas
 * semuanya - itu yang membuatnya terbaca sebagai udara di dalam kota.
 */
export const CityParallax = ({ layerX, dustX, cityRef, reducedMotion }) => (
  <>
    {LAYERS.map((layer, i) => (
      <motion.img
        key={layer.src}
        // Hanya plat terdepan yang diukur - itu yang dipijak pejalan kaki.
        ref={i === LAYERS.length - 1 ? cityRef : undefined}
        src={layer.src}
        alt=""
        aria-hidden="true"
        style={{ x: layerX[i] }}
        className={cn(bandClass, "sprite w-[var(--city-w)] max-w-none select-none", layer.z)}
      />
    ))}

    {!reducedMotion &&
      PARTICLES.map((band, i) => (
        <motion.div
          key={band.z}
          aria-hidden="true"
          style={{ x: dustX[i] }}
          className={cn(bandClass, "h-full w-[var(--city-w)]", band.z)}
        >
          <Fireflies
            count={band.count}
            size={band.size}
            seed={band.seed}
            warmRatio={band.warmRatio}
          />
        </motion.div>
      ))}
  </>
);

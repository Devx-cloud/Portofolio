import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { SectionHead } from "@/components/SectionHead";
import { ScrollHighlight } from "@/components/ScrollHighlight";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import {
  ABOUT_PARAGRAPHS,
  FACTS,
  NAME,
  PORTRAIT,
  PORTRAIT_CAPTION,
  ROLE,
} from "@/data/profile";
import { useImageLoaded } from "@/hooks/useImageLoaded";
import { cn } from "@/lib/utils";
import { EASE_OUT_EXPO, VIEWPORT } from "@/lib/motion";

/*
 * Bagian Tentang, disusun sebagai bentangan majalah: potret di kolom kiri,
 * teks mengalir di kanan, fakta-fakta sebagai kaki kolom teks.
 *
 * Potretnya bergerak parallax pelan terhadap gulungan, bukan diam. Itu yang
 * membuat blok ini berhenti terasa kaku - foto yang benar-benar diam di
 * halaman yang seluruh isinya bergerak justru terbaca seperti gambar yang
 * ditempel belakangan.
 *
 * Sempat dicoba `position: sticky` di kolom potret dan dibuang lagi: kolom
 * potret adalah kolom yang PALING TINGGI di baris ini, jadi ia menentukan
 * tinggi barisnya sendiri dan tidak pernah punya ruang untuk menempel.
 * Sticky-nya diam-diam tidak melakukan apa-apa. Kalau suatu saat teksnya jauh
 * bertambah panjang, barulah ia layak dicoba lagi.
 *
 * Menyalanya paragraf kata demi kata bukan hiasan: teks setinggi ini di layar
 * penuh mudah dilewati begitu saja, dan menyala mengikuti gulungan memaksa
 * kecepatan baca turun ke kecepatan gulung.
 */
export const About = () => {
  const frameRef = useRef(null);
  const reduced = useReducedMotion();
  const portrait = useImageLoaded();

  /* Rentangnya seluruh perjalanan BINGKAI melintasi layar, bukan perjalanan
     bagiannya - kalau diambil dari bagian, geserannya sudah habis separuh saat
     fotonya baru muncul. */
  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <section id="tentang" data-rail="Tentang" className="shell py-24 md:py-36">
      <SectionHead index="01" title="Tentang" meta={ROLE} />

      <div className="mt-14 grid gap-12 md:mt-20 md:grid-cols-12 md:gap-12 lg:gap-16">
        {/* --- Potret --- */}
        <div className="md:col-span-5 lg:col-span-4">
          <div ref={frameRef}>
            <motion.figure
              initial={reduced ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 1, ease: EASE_OUT_EXPO }}
              className="max-w-sm md:max-w-none"
            >
              {/* Garis merah tipis sebagai "kepala" bingkai. Satu-satunya
                  aksen di blok ini - ia menandai foto sebagai sesuatu yang
                  disengaja, bukan gambar yang kebetulan ada di sana. */}
              <div className="mb-3 h-px w-12 bg-red" />

              {/* aspect-[4/5] mengunci tinggi bingkai sebelum gambarnya dimuat.
                  Tanpa itu, teks di sebelahnya melompat saat foto tiba - dan
                  lompatan itu juga membatalkan pengukuran useScroll. */}
              <div className="relative aspect-[4/5] w-full overflow-hidden border border-line bg-panel">
                <motion.img
                  ref={portrait.ref}
                  onLoad={portrait.onLoad}
                  src={PORTRAIT}
                  alt={`Foto ${NAME.first} ${NAME.last}`}
                  loading="lazy"
                  decoding="async"
                  style={reduced ? undefined : { y: imageY }}
                  /* Gambar dibuat 114% lebih tinggi dari bingkainya supaya
                     geseran parallax +-6% tidak pernah memperlihatkan tepi.

                     Sedikit desaturasi saat diam, penuh saat disorot: potret
                     berwarna penuh di halaman satu-aksen akan menarik semua
                     perhatian dari merahnya, sementara hitam-putih total
                     terbaca dingin. 30% adalah kompromi yang menahan keduanya. */
                  className={cn(
                    "absolute inset-0 h-[114%] w-full object-cover grayscale-[0.3] transition-[filter,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:grayscale-0",
                    portrait.loaded ? "opacity-100" : "opacity-0"
                  )}
                />
              </div>

              <figcaption className="mt-3 flex items-baseline justify-between gap-4">
                <span className="eyebrow">
                  {NAME.first} {NAME.last}
                </span>
                <span className="eyebrow">{PORTRAIT_CAPTION}</span>
              </figcaption>
            </motion.figure>
          </div>
        </div>

        {/* --- Teks --- */}
        <div className="md:col-span-7 md:col-start-6 lg:col-span-7 lg:col-start-6">
          {ABOUT_PARAGRAPHS.map((paragraph, i) => (
            <ScrollHighlight
              key={i}
              text={paragraph}
              className="text-lede text-ink [&:not(:first-child)]:mt-8"
            />
          ))}

          {/* Fakta-fakta ditaruh DI BAWAH teks, bukan di kolom ketiga:
              kolom ketiga akan memepet potret dan teks jadi dua pita sempit,
              dan blok data kecil justru paling terbaca sebagai kaki. */}
          <Stagger className="mt-12 border-t border-line pt-8 md:mt-16">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
              {FACTS.map((fact) => (
                <StaggerItem key={fact.label}>
                  <dt className="eyebrow mb-2">{fact.label}</dt>
                  <dd className="font-display text-lg uppercase leading-none tracking-tight">
                    {fact.value}
                  </dd>
                </StaggerItem>
              ))}
            </dl>
          </Stagger>
        </div>
      </div>

      {/* Penutup bagian: kalimat pendek berukuran display sebagai jeda visual
          sebelum daftar Skills yang padat. */}
      <Reveal className="mt-20 md:mt-28">
        <p className="display text-d3 max-w-4xl">
          Rapi di struktur,
          <span className="display-outline"> ringan di pemakaian</span>
          <span className="text-red">.</span>
        </p>
      </Reveal>
    </section>
  );
};

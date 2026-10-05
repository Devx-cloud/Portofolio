import { useCallback, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "../constants";
import { hasLink, linkClass, pad2, skillById } from "../data";

/* Teks kartu mengendap bergiliran: judul, cerita, skill, tautan. Geser kecil
   (16px) dengan kurva expo - yang bergerak sedikit terbaca sebagai "mengendap",
   yang bergerak jauh terbaca sebagai "terbang masuk". Sekali saja; mengulang
   tiap kali digulir naik-turun membuat halaman terasa gelisah. */
const textParent = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } };
const textChild = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOutExpo } },
};
const VIEWPORT = { once: true, margin: "0px 0px -10% 0px" };

/*
 * Satu project - struktur dari porto_v3, kulit dari tema pixel.
 *
 * Yang diambil dari v3 adalah KETENANGANNYA: satu baris meta, gambar di satu
 * sisi, teks di sisi lain, tag berupa ikon + nama tanpa kotak. Versi quest
 * sebelumnya menumpuk chip bernomor, baris loadout 15 petak, dan sapuan gloss
 * sekaligus - semuanya benar sendiri-sendiri, tapi bersama-sama tidak ada yang
 * menang, dan judul project justru yang paling tenggelam.
 *
 * Yang dipertahankan dari tema: bingkai pix-panel bertepi keras, label pixel,
 * palet navy-merah. Gerak besarnya (tumpukan, parallax) memakai kurva halus;
 * gerak kecil chrome (warna label saat disorot) tetap patah-patah.
 *
 * Tag skill bisa diklik: membuka skill itu di papan Loadout. Sengaja tampil
 * sebagai teks biasa, bukan tombol berbingkai - ia jalan pintas, bukan ajakan
 * utama kartu ini.
 */
export const ProjectCard = ({
  project,
  index,
  isLast,
  stacked,
  progress,
  range,
  targetScale,
  isFlashing,
  onPickSkill,
  onRef,
}) => {
  const wrapRef = useRef(null);
  const reduced = useReducedMotion();
  const { title, year, role, desc, image, githubUrl, demoUrl } = project;

  /* Gambar memudar masuk setelah benar-benar tergambar. `complete` diperiksa
     saat elemen menempel karena gambar dari cache bisa selesai dimuat SEBELUM
     onLoad terpasang - tanpa itu ia tersangkut di opacity 0 tanpa error. */
  const [loaded, setLoaded] = useState(false);
  const imgRef = useCallback((node) => {
    if (node?.complete && node.naturalWidth > 0) setLoaded(true);
  }, []);

  /* Kartu yang tertimpa menyusut ke skala targetnya dan meredup. Rentangnya
     mulai di porsi kartu ini dan selalu berakhir di 1, jadi penyusutannya
     berlangsung sepanjang sisa tumpukan - bukan mengunci mendadak begitu kartu
     berikutnya tiba. Redupnya dihitung dari selisih skala: kartu yang makin jauh
     di belakang makin gelap, kartu teratas tidak pernah redup. */
  const scale = useTransform(progress, range, [1, targetScale]);
  const shade = useTransform(progress, range, [0, (1 - targetScale) * 8]);

  /* Parallax dari gulungan kartu itu SENDIRI, bukan tumpukannya - kalau tidak,
     semua gambar bergerak serempak dan kedalamannya hilang. */
  const { scrollYProgress: own } = useScroll({ target: wrapRef, offset: ["start end", "end start"] });
  const imageY = useTransform(own, [0, 1], ["-8%", "8%"]);

  return (
    <div
      ref={(el) => {
        wrapRef.current = el;
        onRef(index, el);
      }}
      /* Di mode tumpukan kartu diletakkan dekat atas slot, bukan di tengahnya.
         Di tengah, kartu pertama berdiri ~150px di bawah judul bab sebelum
         menempel - celah kosong tepat di tempat mata mencari isi bab. Jaraknya
         ke kepala bab pt-6, irama yang sama dengan mt-6 antara kepala bab Skills
         dan papannya.

         Tinggi slot DIBATASI 36rem, tidak lagi setinggi layar. Tinggi slot itu
         jarak gulir yang harus ditempuh sebelum kartu berikutnya naik menutupi
         yang sekarang, sementara kartunya sendiri cuma ~400px - jadi setinggi
         layar, yang terlihat selama perjalanan itu satu kartu dengan 420px
         kekosongan di bawahnya (terukur: 51% slot terbuang di 1440x900, 60% di
         1920x1080). Dibatasi 36rem, sisanya ~120px: cukup untuk kartu berikutnya
         terbaca "sedang datang", tanpa jeda kosong di antaranya.

         Tetap memakai calc(100svh - garis tempel) sebagai batas ATAS supaya di
         layar pendek slot tidak pernah lebih tinggi dari ruang yang tersisa di
         bawah bilah bab - kartu yang menempel harus muat utuh, kalau tidak
         ekornya terpotong.

         --stick diturunkan di ProjectStack: 5rem bar stage + jarak bilah +
         tinggi bilah. Dipakai di sini lewat custom property, bukan dihitung
         ulang, supaya kartu dan bilah tidak bisa lepas sinkron. */
      className={cn(
        "scroll-mt-[calc(1rem+var(--stick))] px-4 md:px-8",
        stacked
          ? "sticky top-[var(--stick)] flex h-[min(36rem,calc(100svh-var(--stick)))] items-start pt-6"
          : !isLast && "mb-8"
      )}
    >
      <motion.article
        aria-labelledby={`project-${project.id}`}
        /* top bergeser 24px per kartu: kepala kartu yang tertimpa tetap
           mengintip di atas kartu berikutnya, jadi tumpukannya terbaca sebagai
           tumpukan - pengunjung melihat berapa yang sudah dilewati tanpa nomor. */
        style={stacked ? { scale, top: `${index * 24}px` } : undefined}
        className={cn(
          "group/card pix-panel relative mx-auto w-full max-w-6xl origin-top",
          isFlashing && "quest-flash"
        )}
      >
        {/* Baris meta. Ditumpuk di layar sempit: berdampingan, "QUEST 01 / 2025"
            patah jadi dua baris DAN perannya terpotong jadi "COMPUTER VISION ·
            BROW…" - dua kerusakan sekaligus demi menghemat satu baris. */}
        <div className="flex flex-col items-start gap-1 border-b-2 border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:px-8">
          <span className="pixel-font whitespace-nowrap text-pix-sm uppercase tabular-nums stage-text-bright">
            Quest {pad2(index + 1)} / {year}
          </span>
          <span className="pixel-font truncate text-pix-sm uppercase text-muted-foreground">{role}</span>
        </div>

        <div className="grid md:grid-cols-12">
          {/* --- Gambar ---
              Setengah lebar kartu, bukan 5/12 seperti porto_v3. Tangkapan layar
              project di sini lebar (~2,2:1); di kolom 5/12 setinggi 28rem yang
              terlihat cuma ~45% lebarnya, dan judul besar di gambar Loka Pura
              terpotong di kedua sisi. Kotak 6/12 x 22rem memperlihatkan ~70%.

              Gambarnya 120% tinggi kotak dan dimulai -10%, jadi geseran
              parallax +-8% (dari tinggi gambar) tidak pernah memperlihatkan
              tepi kosong di atas maupun di bawah. */}
          <div className="relative h-56 overflow-hidden border-b-2 border-border sm:h-72 md:col-span-6 md:h-auto md:min-h-[22rem] md:border-b-0 md:border-r-2">
            <motion.img
              ref={imgRef}
              onLoad={() => setLoaded(true)}
              src={image}
              alt={`Tangkapan layar project ${title}`}
              loading="lazy"
              decoding="async"
              style={reduced ? undefined : { y: imageY }}
              className={cn(
                "absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover transition-opacity duration-700",
                loaded ? "opacity-100" : "opacity-0"
              )}
            />
            {/* Peredam berwarna latar: tangkapan layar punya kontras dan
                saturasinya sendiri, dan tanpa peredam ia menarik perhatian dari
                judulnya. Hilang saat kartu disorot. */}
            <div className="pointer-events-none absolute inset-0 bg-background/30 transition-opacity duration-500 group-hover/card:opacity-0" />
          </div>

          {/* --- Teks --- */}
          <motion.div
            variants={textParent}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            className="flex flex-col justify-between gap-8 p-5 md:col-span-6 md:p-8 lg:p-10"
          >
            <div>
              <motion.h4
                id={`project-${project.id}`}
                variants={textChild}
                className="pixel-font-null text-2xl uppercase leading-tight tracking-[1px] text-foreground md:text-3xl"
              >
                {title}
              </motion.h4>
              <motion.p
                variants={textChild}
                className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base"
              >
                {desc}
              </motion.p>
            </div>

            <div className="flex flex-col gap-6">
              <motion.ul variants={textChild} className="flex flex-wrap gap-x-5 gap-y-3">
                {project.skills.map((id) => {
                  const skill = skillById[id];
                  if (!skill) return null;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => onPickSkill(id)}
                        aria-label={`Buka ${skill.name} di Loadout`}
                        title={`Buka ${skill.name} di Loadout`}
                        className="group/tag flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                      >
                        <skill.Icon aria-hidden="true" className={cn("h-4 w-4 shrink-0", skill.color)} />
                        <span className="pixel-font text-pix-sm uppercase text-foreground/80 transition-colors duration-100 ease-pix group-hover/tag:stage-text-bright">
                          {skill.name}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </motion.ul>

              <motion.div variants={textChild} className="flex flex-wrap gap-3">
                {hasLink(githubUrl) && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(linkClass, "pix-chip text-foreground/80 hover:stage-border hover:stage-text")}
                  >
                    <Github size={14} /> Lihat Kode
                  </a>
                )}
                {/* Data memakai "#" sebagai penanda "belum ada demo" - merendernya
                    sebagai tombol mati lebih buruk daripada tidak ada. */}
                {hasLink(demoUrl) && (
                  <a
                    href={demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(linkClass, "stage-border stage-bg-soft stage-text stage-shadow hover:stage-glow")}
                  >
                    Lihat Demo <ArrowUpRight size={14} />
                  </a>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Redup kartu yang tertimpa. Di atas isi tapi tidak menangkap pointer -
            kartu di belakang yang masih mengintip tetap bisa diklik. */}
        {stacked && (
          <motion.div
            aria-hidden="true"
            style={{ opacity: shade }}
            className="pointer-events-none absolute inset-0 bg-pit"
          />
        )}
      </motion.article>
    </div>
  );
};

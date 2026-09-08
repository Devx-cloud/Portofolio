import { useRef } from "react";
import { ArrowUpRight, Github } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { SectionHead } from "@/components/SectionHead";
import { hasLink, projects, tagIcons } from "@/data/projects";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useImageLoaded } from "@/hooks/useImageLoaded";
import { cn } from "@/lib/utils";

/*
 * Karya sebagai TUMPUKAN kartu yang saling menimpa.
 *
 * Tiap kartu menempel (sticky) di puncak layar dan menyusut sedikit begitu
 * kartu berikutnya naik menutupinya. Efeknya: kartu lama tidak pergi, ia
 * masuk ke belakang - jadi pengunjung selalu melihat berapa banyak yang sudah
 * dilewati tanpa perlu penomoran apa pun.
 *
 * Penyusutannya kecil (5% per kartu) dan itu penting: begitu skalanya turun
 * cukup jauh untuk terlihat jelas, kartu di belakang mulai terbaca sebagai
 * "gambar yang salah ukuran" alih-alih sebagai kedalaman.
 *
 * Ditumpuk HANYA di layar lebar. Di bawah md, slot setinggi satu layar per
 * kartu berarti pengunjung harus menggulung satu layar penuh untuk tiap proyek
 * sebelum bisa membaca yang berikutnya - dan di layar sempit kartu yang
 * menyusut 5% tidak terlihat sama sekali, jadi biayanya dibayar tanpa
 * mendapatkan efeknya. Di sana kartunya dirender sebagai daftar biasa.
 */
export const Work = () => {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const isWide = useMediaQuery("(min-width: 768px)");
  const stacked = isWide && !reduced;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    /* pb-0, tidak seperti bagian lain. Slot sticky tiap kartu setinggi satu
       layar penuh sementara kartunya sendiri sekitar 500px, jadi selalu ada
       ~200px sisa di bawah kartu TERAKHIR yang sudah berfungsi sebagai jarak
       penutup. Menambah padding bawah di atasnya menghasilkan celah hitam
       hampir 600px yang terbaca seperti halaman putus. */
    <section id="karya" data-rail="Karya" className="pt-24 md:pt-36">
      <div className="shell">
        <SectionHead index="03" title="Karya" meta={`${projects.length} proyek terpilih`} />
      </div>

      <div ref={ref} className="relative mt-4 md:mt-6">
        {projects.map((project, i) => (
          <WorkCard
            key={project.id}
            project={project}
            index={i}
            stacked={stacked}
            progress={scrollYProgress}
            /* Rentang mulai di porsi kartu ini dan selalu berakhir di 1:
               penyusutannya berlangsung sepanjang sisa bagian, bukan berhenti
               begitu kartu berikutnya tiba. Tanpa itu kartu terakhir tampak
               "mengunci" mendadak di tengah gulungan. */
            range={[i / projects.length, 1]}
            targetScale={1 - (projects.length - 1 - i) * 0.05}
          />
        ))}
      </div>
    </section>
  );
};

const WorkCard = ({ project, index, stacked, progress, range, targetScale }) => {
  const cardRef = useRef(null);
  const shot = useImageLoaded();
  const { title, year, role, desc, image, tags, demoUrl, githubUrl } = project;

  const scale = useTransform(progress, range, [1, targetScale]);

  /* Parallax gambar dihitung dari gulungan KARTU ITU SENDIRI, bukan dari
     bagiannya - kalau tidak, semua gambar bergerak serempak dan efeknya
     hilang. offset start-end sampai end-start = seluruh perjalanan kartu
     melintasi layar. */
  const { scrollYProgress: own } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(own, [0, 1], ["-8%", "8%"]);

  return (
    <div
      ref={cardRef}
      className={cn(
        "shell",
        stacked && "sticky top-0 flex h-svh items-center justify-center"
      )}
    >
      <motion.article
        style={
          stacked
            ? { scale, top: `calc(-6vh + ${index * 26}px)` }
            : undefined
        }
        className={cn(
          "relative w-full origin-top border border-line bg-panel",
          !stacked && "mb-8 last:mb-0"
        )}
      >
        {/* Baris meta di kepala kartu */}
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 md:px-8">
          <span className="eyebrow text-red">
            {String(index + 1).padStart(2, "0")} / {year}
          </span>
          <span className="eyebrow truncate">{role}</span>
        </div>

        <div className="grid md:grid-cols-12">
          {/* --- Gambar ---
              Pembungkusnya overflow-hidden dan gambarnya dibuat 118% lebih
              tinggi dari kotaknya, jadi geseran parallax +-8% tidak pernah
              memperlihatkan tepi kosong. */}
          <div className="relative overflow-hidden border-b border-line md:col-span-5 md:border-b-0 md:border-r">
            <div className="relative h-56 w-full overflow-hidden sm:h-72 md:h-full md:min-h-[28rem]">
              <motion.img
                ref={shot.ref}
                onLoad={shot.onLoad}
                src={image}
                alt={`Tangkapan layar proyek ${title}`}
                loading="lazy"
                decoding="async"
                style={{ y: imageY }}
                /* Memudar masuk, bukan muncul mendadak. Bingkainya sudah
                   berwarna panel dan tingginya sudah terkunci, jadi yang
                   berubah cuma isinya - tidak ada pergeseran tata letak. */
                className={cn(
                  "absolute inset-0 h-[118%] w-full object-cover transition-opacity duration-700",
                  shot.loaded ? "opacity-100" : "opacity-0"
                )}
              />
              {/* Lapisan tipis berwarna latar halaman: tangkapan layar punya
                  kontras dan saturasinya sendiri, dan tanpa peredam ia menarik
                  seluruh perhatian dari judulnya. Karena warnanya mengikuti
                  tema, ia MENGGELAPKAN gambar di tema gelap dan MENERANGKANNYA
                  di tema terang - dua-duanya menarik gambar mendekati halaman.
                  Hilang saat kartu disorot. */}
              <div className="absolute inset-0 bg-page/30 transition-opacity duration-700 hover:opacity-0" />
            </div>
          </div>

          {/* --- Teks --- */}
          <div className="flex flex-col justify-between gap-8 p-5 md:col-span-7 md:p-10">
            <div>
              <h3 className="text-d3">{title}</h3>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted md:text-base">
                {desc}
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <ul className="flex flex-wrap gap-x-5 gap-y-3">
                {tags.map((tag) => {
                  const meta = tagIcons[tag];
                  if (!meta) return null;
                  const { icon: TagIcon, color, label } = meta;
                  return (
                    <li key={tag} className="flex items-center gap-2">
                      <TagIcon aria-hidden="true" className={cn("size-4 shrink-0", color)} />
                      <span className="eyebrow text-ink">{label}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="flex flex-wrap gap-3">
                {hasLink(githubUrl) && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost"
                  >
                    <Github size={14} />
                    Kode
                  </a>
                )}
                {/* Tombol demo hanya dirender kalau tautannya benar-benar ada.
                    Data memakai "#" sebagai penanda "belum ada" - merendernya
                    sebagai tombol mati lebih buruk daripada tidak ada. */}
                {hasLink(demoUrl) && (
                  <a href={demoUrl} target="_blank" rel="noreferrer" className="btn">
                    Lihat demo
                    <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
};

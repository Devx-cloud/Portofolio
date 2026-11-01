import { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useMotionValue, useMotionValueEvent, useScroll } from "framer-motion";
import { useMediaQuery, useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { SCROLL_SLOWDOWN, STACK_QUERY, STAGE_OFFSET, STAGE_TOP } from "./constants";
import { pad2, projects } from "./data";
import { ChapterLabel, GithubLink } from "./components/ChapterLabel";
import { ProjectCard } from "./components/ProjectCard";

/* Selama itu kartu berkedip setelah dibuka dari panel detail skill. Lebih
   panjang dari gulir halusnya sendiri, supaya kedipannya masih jalan saat
   kartu tiba. */
const FLASH_MS = 1200;

/* Tiap kartu di belakang menyusut 5%. Kecil dan itu penting: begitu skalanya
   turun cukup jauh untuk terlihat jelas, kartu di belakang mulai terbaca sebagai
   "gambar yang salah ukuran" alih-alih sebagai kedalaman. */
const SHRINK_PER_CARD = 0.05;

/* Tinggi bilah bab, dan jaraknya dari bar stage. */
const BAR_H = "3rem";

/* Kepala bab TIDAK duduk mepet di bawah bar stage - itu yang membuatnya terbaca
   sebagai palang kedua, bukan sebagai judul milik isinya.

   Ketinggian kepala bab Skills (~85px di bawah bar stage) sempat dipakai persis,
   tapi angka itu tidak bisa dipinjam begitu saja: di Skills ia hasil pemusatan
   tegak panggung setinggi layar, dengan isi yang mengapit di kiri-kanan. Di
   Projects isinya menumpuk KE BAWAH mulai dari kepala bab, jadi tiap piksel di
   atas judul mendorong seluruh tumpukan turun - dan kartu pertama berakhir
   terlalu rendah di layar. 3,5rem cukup untuk tidak menempel, tanpa membayar
   tinggi yang dibutuhkan kartu. */
const BAR_GAP = "3.5rem";

/* Garis tempel: dari puncak layar ke tepi bawah bilah bab - tempat kartu berhenti. */
const STICK = "calc(5rem + var(--bar-gap) + var(--bar))";

/* Tinggi satu slot kartu di mode tumpukan = jarak antar kartu di panggung.

   Dibatasi 32rem, tidak setinggi layar: setinggi layar, yang terlihat selama
   perjalanan itu satu kartu dengan ratusan piksel kekosongan di bawahnya.
   32rem juga pas untuk slot TERAKHIR, yang memuat kartu (~350px) + geser
   tumpukan (2 x 24px) + tautan GitHub di bawahnya.

   Batas atasnya tetap calc(100svh - garis tempel): di layar pendek slot tidak
   boleh lebih tinggi dari ruang di bawah bilah bab, kalau tidak isi slot
   terakhir terpotong di bawah layar. */
const SLOT = "min(32rem, calc(100svh - var(--stick)))";

/* Panjang trek: panggung setinggi layar, ditambah jarak gulir untuk tiap kartu yang
   harus naik. SCROLL_SLOWDOWN membuat kartu naik lebih pelan daripada jari. Halaman
   habis tepat saat kartu terakhir tiba, jadi tidak ada gulir kosong sesudahnya. */
const TRACK = `calc(100svh - 5rem + ${(projects.length - 1) * SCROLL_SLOWDOWN} * var(--slot))`;

/*
 * Bab Projects sebagai TUMPUKAN kartu yang saling menimpa - diambil dari
 * porto_v3.
 *
 * Satu panggung menempel selama trek digulir, dan kartu-kartunya digeser naik
 * langsung dari posisi scroll (lihat ProjectCard). Kartu yang tertimpa menyusut
 * sedikit dan masuk ke belakang.
 *
 * Bukan kartu sticky satu per satu: sticky selalu bergerak 1:1 dengan jari, jadi
 * trek yang lebih panjang hanya akan membuat kartu diam lama lalu naik secepat
 * biasa. Panggung inilah yang membuat geraknya benar-benar lambat dan tanpa jeda.
 *
 * Ditumpuk HANYA di layar yang cukup lebar dan tinggi, dan tidak untuk
 * prefers-reduced-motion. Di layar sempit slot setinggi satu layar per kartu
 * berarti menggulir satu layar penuh per project, sementara penyusutan 5% di
 * sana tidak terlihat - biayanya dibayar tanpa efeknya. Di sana kartunya daftar
 * biasa. Dipilih lewat JS, bukan CSS: bab ini selalu di bawah lipatan, jadi satu
 * frame sebelum media query terbaca tidak pernah terlihat.
 *
 * `open(id)` dipanggil panel detail skill ("Dipakai di") lewat ref.
 */
export const ProjectStack = ({ ref, onPickSkill }) => {
  const trackRef = useRef(null);
  const containerRef = useRef(null);
  const wrapperRefs = useRef([]);
  const flashTimer = useRef(0);
  const flashFrame = useRef(0);

  const reduced = useReducedMotion();
  const isWide = useMediaQuery(STACK_QUERY);
  const stacked = isWide && !reduced;

  const [flashingId, setFlashingId] = useState(null);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: STAGE_OFFSET });

  /* Isi bilah bab: quest yang sedang di atas tumpukan, dan seberapa jauh bab ini
     sudah dilewati. */
  const [activeIndex, setActiveIndex] = useState(0);
  const railProgress = useMotionValue(0);
  const { scrollY } = useScroll();

  /* Mode tumpukan: keduanya langsung dari progres trek. Rel penuh tepat saat kartu
     terakhir tiba, dan itu juga ujung halaman. */
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!stacked) return;
    setActiveIndex(Math.floor(v * (projects.length - 1) + 0.01));
    railProgress.set(v);
  });

  /* Mode daftar: dibaca dari posisi kartu SUNGGUHAN, karena tinggi tiap kartu
     berbeda-beda. Rel penuh saat kartu terakhir sampai di bawah bar stage. */
  useMotionValueEvent(scrollY, "change", () => {
    if (stacked) return;
    const container = containerRef.current;
    const wraps = wrapperRefs.current.filter(Boolean);
    if (!container || !wraps.length) return;

    let at = 0;
    wraps.forEach((el, i) => {
      if (el.getBoundingClientRect().top <= STAGE_TOP + 2) at = i;
    });
    setActiveIndex(at);

    const first = container.getBoundingClientRect().top + wraps[0].offsetTop;
    const span = wraps[wraps.length - 1].offsetTop - wraps[0].offsetTop;
    railProgress.set(span > 0 ? Math.min(1, Math.max(0, (STAGE_TOP - first) / span)) : 1);
  });

  const registerWrapper = useCallback((index, el) => {
    wrapperRefs.current[index] = el;
  }, []);

  const scrollToCard = useCallback(
    (index) => {
      const behavior = reduced ? "auto" : "smooth";
      if (stacked) {
        const track = trackRef.current;
        const start = window.scrollY + track.getBoundingClientRect().top - STAGE_TOP;
        const range = track.offsetHeight - window.innerHeight + STAGE_TOP;
        window.scrollTo({ top: start + (index / (projects.length - 1)) * range, behavior });
        return;
      }
      const card = wrapperRefs.current[index];
      if (card) {
        const top = window.scrollY + card.getBoundingClientRect().top;
        window.scrollTo({ top: top - STAGE_TOP - 16, behavior });
      }
    },
    [reduced, stacked]
  );

  useImperativeHandle(
    ref,
    () => ({
      open(id) {
        const index = projects.findIndex((p) => p.id === id);
        if (index < 0) return;
        scrollToCard(index);

        /* Dilepas dulu lalu dipasang di frame berikutnya: membuka project yang
           SAMA saat kedipannya masih jalan tidak mengubah state, dan animasinya
           tidak akan mulai ulang. */
        clearTimeout(flashTimer.current);
        cancelAnimationFrame(flashFrame.current);
        setFlashingId(null);
        flashFrame.current = requestAnimationFrame(() => {
          setFlashingId(id);
          flashTimer.current = setTimeout(() => setFlashingId(null), FLASH_MS);
        });
      },
    }),
    [scrollToCard]
  );

  useEffect(
    () => () => {
      clearTimeout(flashTimer.current);
      cancelAnimationFrame(flashFrame.current);
    },
    []
  );

  return (
    <section
      id="projects"
      style={{ "--bar": BAR_H, "--bar-gap": BAR_GAP, "--stick": STICK, "--slot": SLOT }}
      className="relative scroll-mt-20 pt-16 md:pt-24"
    >
      <div ref={trackRef} style={stacked ? { height: TRACK } : undefined}>
        {/* overflow-clip, bukan overflow-hidden: yang kedua masih bisa digulir oleh
            fokus keyboard, dan panggung yang tergulir sendiri merusak posisi kartu. */}
        <div
          className={cn(
            stacked && "sticky top-20 h-[calc(100svh-5rem)] overflow-clip pt-[var(--bar-gap)]"
          )}
        >
          {/* Kepala bab IKUT MENEMPEL sepanjang tumpukan digulir. Kartu menutupi
              kartu sebelumnya, jadi tanpa penanda tetap tidak ada yang memberi tahu
              quest ke berapa yang sedang dibaca dari berapa - pengunjung kehilangan
              tempatnya. Penghitung "01 / 02" dan rel yang terisi menjawab itu tanpa
              menambah elemen baru ke layar.

              TANPA bidang apa pun di belakangnya - persis kepala bab Skills: kartu
              tidak pernah naik melewatinya, tiap kartu berhenti di garis tempel. */}
          <div className="relative mx-auto flex h-[var(--bar)] w-full max-w-6xl items-center px-4 md:px-8">
            <ChapterLabel
              index={2}
              title="Projects"
              kicker="Quest Log"
              meta={`${pad2(activeIndex + 1)} / ${pad2(projects.length)}`}
              progress={railProgress}
              className="mb-0 w-full"
            />
          </div>

          <div ref={containerRef} className={cn("relative", !stacked && "mt-6")}>
            {projects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                count={projects.length}
                isLast={i === projects.length - 1}
                stacked={stacked}
                progress={scrollYProgress}
                /* Rentangnya mulai saat kartu ini tiba dan berakhir di 1, jadi
                   penyusutannya berlangsung sepanjang sisa tumpukan. Dijaga tetap
                   menaik untuk kartu terakhir, yang memang tidak menyusut. */
                range={[Math.min(i / (projects.length - 1), 0.999), 1]}
                targetScale={1 - (projects.length - 1 - i) * SHRINK_PER_CARD}
                isFlashing={flashingId === project.id}
                onPickSkill={onPickSkill}
                onKeyboardFocus={scrollToCard}
                onRef={registerWrapper}
              >
                {stacked && i === projects.length - 1 && <GithubLink />}
              </ProjectCard>
            ))}
          </div>
        </div>
      </div>

      {!stacked && (
        <div className="mx-auto mt-10 flex w-full max-w-6xl px-4 pb-16 md:px-8 md:pb-24">
          <GithubLink />
        </div>
      )}
    </section>
  );
};

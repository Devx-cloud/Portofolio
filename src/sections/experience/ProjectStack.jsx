import { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useMotionValue, useMotionValueEvent, useScroll } from "framer-motion";
import { useMediaQuery, useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { STACK_QUERY } from "./constants";
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

/* Tinggi bilah bab yang menempel, dan jaraknya dari bar stage. */
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

/* Garis tempel: dari puncak layar ke tepi bawah bilah bab. Diturunkan SEKALI di
   sini supaya empat hal yang harus sepakat tidak pernah ditulis terpisah - titik
   tempel kartu, tinggi slot kartu, tinggi ekor bab, dan sasaran gulir saat
   sebuah project dibuka dari panel skill. Kalau ditulis sendiri-sendiri, kepala
   kartu tersembunyi di balik bilah atau ekornya terpotong di bawah layar. */
const STICK = "calc(5rem + var(--bar-gap) + var(--bar))";

/* Garis tempel dalam piksel, dibaca dari kepala babnya sendiri: posisi
   menempelnya (`top`, sudah diresolusi jadi px oleh browser) ditambah tingginya.
   Diukur, bukan ditulis tetap - kalau BAR_H atau BAR_GAP berubah, semua yang
   bersandar pada angka ini ikut tanpa disentuh.

   Di mode daftar kepala bab tidak menempel sama sekali, jadi `top` terbaca
   "auto" (NaN) dan yang menahan kartu cuma bar stage. */
const stickLine = (bar) => {
  const top = bar ? parseFloat(getComputedStyle(bar).top) : NaN;
  return Number.isNaN(top) ? 80 : top + bar.offsetHeight;
};

/*
 * Bab Projects sebagai TUMPUKAN kartu yang saling menimpa - diambil dari
 * porto_v3.
 *
 * Tiap kartu menempel di bawah bar stage dan menyusut sedikit begitu kartu
 * berikutnya naik menutupinya. Kartu lama tidak pergi, ia masuk ke belakang.
 * Satu gerak yang jelas, digerakkan langsung oleh gulir - menggantikan panggung
 * langkah sebelumnya yang mengganti gambar, teks, dan baris loadout sekaligus.
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
  const containerRef = useRef(null);
  const barRef = useRef(null);
  const wrapperRefs = useRef([]);
  const flashTimer = useRef(0);
  const flashFrame = useRef(0);

  const reduced = useReducedMotion();
  const isWide = useMediaQuery(STACK_QUERY);
  const stacked = isWide && !reduced;

  const [flashingId, setFlashingId] = useState(null);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  /* Isi bilah bab: quest yang sedang di atas tumpukan, dan seberapa jauh bab ini
     sudah dilewati.

     Digerakkan oleh scrollY (posisi gulir halaman), BUKAN scrollYProgress milik
     kontainer: yang terakhir berhenti mengirim kabar begitu nilainya menyentuh 1,
     dan itu terjadi saat tepi bawah kontainer mencapai tepi bawah layar - jauh
     sebelum kartu terakhir selesai dibaca. Relnya lalu membeku penuh sementara
     pengunjung masih di tengah bab (terukur).

     Kartu aktif dibaca dari posisi kartu SUNGGUHAN, bukan dihitung dari pecahan
     progres: kartu yang sudah lewat tetap menempel di titik yang sama di belakang
     kartu baru, jadi "yang paling akhir menyentuh garis tempel" persis berarti
     "yang paling atas". Cara ini juga benar di mode daftar biasa (HP), tempat
     tinggi tiap kartu berbeda-beda. */
  const [activeIndex, setActiveIndex] = useState(0);
  const railProgress = useMotionValue(0);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", () => {
    const container = containerRef.current;
    const wraps = wrapperRefs.current.filter(Boolean);
    if (!container || !wraps.length) return;

    const stick = stickLine(barRef.current);
    const box = container.getBoundingClientRect();

    let at = 0;
    wraps.forEach((el, i) => {
      if (el.getBoundingClientRect().top <= stick + 2) at = i;
    });
    setActiveIndex((prev) => (prev === at ? prev : at));

    /* Rel penuh tepat saat quest TERAKHIR sampai di garis tempel - bukan saat
       seluruh kontainer habis digulir. Kartu terakhir menempel di sana sampai
       bab ini berakhir, jadi sisa kontainer di bawahnya tidak pernah bisa
       dilewati: diukur terhadap tinggi kontainer, relnya mentok di 56% dan
       "sudah sampai mana" justru jadi pertanyaan baru (terukur).

       offsetTop, bukan getBoundingClientRect: yang pertama memberi posisi ALAMI
       kartu di dalam kontainer, sementara yang kedua sudah dijepit oleh sticky -
       semua kartu yang menempel melaporkan tepi atas yang sama persis. */
    const first = box.top + wraps[0].offsetTop;
    const last = box.top + wraps[wraps.length - 1].offsetTop;
    const span = last - first;
    railProgress.set(span > 0 ? Math.min(1, Math.max(0, (stick - first) / span)) : 1);
  });

  const registerWrapper = useCallback((index, el) => {
    wrapperRefs.current[index] = el;
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      open(id) {
        const index = projects.findIndex((p) => p.id === id);
        if (index < 0) return;
        const behavior = reduced ? "auto" : "smooth";

        const offset = stickLine(barRef.current);

        if (stacked) {
          /* Kartu ke-i menutup yang lain tepat saat pembungkusnya menempel di
             bawah bilah bab. Pembungkus sticky tidak bisa dipakai untuk
             scrollIntoView - posisinya sudah "menempel" - jadi dihitung dari
             posisi alami di dalam kontainer: i x tinggi satu slot. */
          const top = window.scrollY + containerRef.current.getBoundingClientRect().top;
          const slot = wrapperRefs.current[0]?.offsetHeight ?? window.innerHeight;
          window.scrollTo({ top: top + index * slot - offset, behavior });
        } else {
          const card = wrapperRefs.current[index];
          if (card) {
            const top = window.scrollY + card.getBoundingClientRect().top;
            window.scrollTo({ top: top - offset - 16, behavior });
          }
        }

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
    [reduced, stacked]
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
      style={{ "--bar": BAR_H, "--bar-gap": BAR_GAP, "--stick": STICK }}
      className="relative scroll-mt-20 pt-12 md:pt-16"
    >
      {/* Pembungkus ini yang MEMBATASI sejauh mana kepala bab menempel: ia habis
          bersama tumpukan, jadi kepala bab ikut naik pergi bersama kartu terakhir.
          Dibiarkan menempel sampai ujung section, ia masih berdiri di sana saat
          ekor bab lewat - dan tautan GitHub menembus teksnya. */}
      <div>
        {/* Kepala bab IKUT MENEMPEL sepanjang tumpukan digulir. Kartu menutupi
            kartu sebelumnya, jadi tanpa penanda tetap tidak ada yang memberi tahu
            quest ke berapa yang sedang dibaca dari berapa - pengunjung kehilangan
            tempatnya. Penghitung "01 / 02" dan rel yang terisi menjawab itu tanpa
            menambah elemen baru ke layar.

            Menempel BERJARAK dari bar stage (lihat BAR_GAP) dan TANPA bidang apa
            pun di belakangnya - persis kepala bab Skills: teks yang berdiri
            langsung di atas latar halaman.

            Veil-nya bisa dibuang karena kartu tidak pernah naik melewatinya: tiap
            kartu berhenti di garis tempel, tepat di bawah kepala bab ini. Yang
            dulu butuh veil cuma ujung bab, saat tumpukan terlepas dan kartu
            terakhir naik - dan di situ kartu lewat DI DEPAN kepala bab (tanpa
            z-index; urutan DOM yang menentukan), jadi ia ditutupi panel pekat,
            bukan bertabrakan dengan teksnya.

            Di mode daftar kartu lewat di tempat yang sama tanpa pernah berhenti,
            jadi di sana kepala bab tidak menempel sama sekali - sama seperti bab
            Skills versi daftar. */}
        <div
          ref={barRef}
          className={cn(stacked && "sticky top-[calc(5rem+var(--bar-gap))]")}
        >
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
        </div>

        <div ref={containerRef} className="relative mt-6">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              isLast={i === projects.length - 1}
              stacked={stacked}
              progress={scrollYProgress}
              range={[i / projects.length, 1]}
              targetScale={1 - (projects.length - 1 - i) * SHRINK_PER_CARD}
              isFlashing={flashingId === project.id}
              onPickSkill={onPickSkill}
              onRef={registerWrapper}
            />
          ))}
        </div>
      </div>

      {/* Ekor bab. Di mode tumpukan ia BUKAN sekadar ruang napas: kartu terakhir
          hanya bisa naik ke puncak tumpukan kalau masih ada yang bisa digulir
          setelah kontainernya, dan sejak tinggi slot dibatasi 36rem (lihat
          ProjectCard), sisa halaman tidak lagi cukup - kartu kedua berhenti 22px
          sebelum garis tempel dan tumpukannya tidak pernah selesai (terukur di
          1440x900).

          Tinggi minimumnya diturunkan dari kekurangan itu: layar dikurangi garis
          tempel dan tinggi slot - persis jarak yang masih harus tersedia. Memakai 32rem, bukan 36rem, jadi ada 4rem lebih supaya kartu
          terakhir sempat berdiri tenang sejenak, bukan tiba tepat di ujung
          gulir. max(0px, ...) menjaga angkanya tidak negatif di layar pendek,
          tempat slot sudah setinggi layar dan ekor tambahan tidak diperlukan.

          Jarak atas hanya di mode daftar: di mode tumpukan slot terakhir sudah
          menyisakan ruang di bawah kartunya. */}
      <div
        className={cn(
          "mx-auto flex w-full max-w-6xl items-center px-4 pb-16 md:px-8 md:pb-24",
          // Dipusatkan tegak: di layar tinggi ruang ekor ini bisa 300px lebih, dan
          // tautan yang menempel di atasnya meninggalkan rongga besar di kaki halaman.
          stacked ? "min-h-[max(0px,calc(100svh-var(--stick)-32rem))]" : "mt-10"
        )}
      >
        <GithubLink />
      </div>
    </section>
  );
};

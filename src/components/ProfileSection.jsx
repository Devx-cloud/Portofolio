import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { MapPin, Download, Github, Instagram, Linkedin, Bot, Crosshair, Signal } from "lucide-react";
import { FaLaravel, FaReact } from "react-icons/fa";
import { SiFlutter } from "react-icons/si";
import { CharacterSprite, WanderingSprite } from "./CharacterSprite";
import { StarBackground } from "./StarBackground";
import { Fireflies } from "./Fireflies";
import { useElementWidth } from "@/hooks/useElementWidth";
import { cn } from "@/lib/utils";

const socialLinks = [
  { name: "Github", href: "https://github.com/Devx-cloud", icon: Github },
  { name: "Instagram", href: "https://www.instagram.com/devx.sun/", icon: Instagram },
  { name: "Linkedin", href: "https://www.linkedin.com/in/deva-surya-5a6568380/", icon: Linkedin },
];

const focusStack = [
  { name: "Laravel", icon: <FaLaravel className="h-4 w-4" /> },
  { name: "Flutter", icon: <SiFlutter className="h-4 w-4" /> },
  { name: "React", icon: <FaReact className="h-4 w-4" /> },
];

const projectTeasers = [
  { name: "Loka Pura", desc: "platform AI yang menghidupkan arsitektur pura Bali" },
  { name: "Hand Gesture", desc: "deteksi gestur tangan real-time berbasis computer vision" },
];

// 5 babak: Data Diri -> Skills -> Projects -> Ask AI -> Contact (batas akhir)
const ACTS = [
  { id: "hero", label: "Data Diri" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "ai", label: "Ask AI" },
  { id: "contact", label: "Contact" },
];

// Aksen dideklarasikan ulang di dalam .night-scene, bukan diwarisi dari LevelLayout:
// custom property menyubstitusi var() di elemen tempat ia ditulis, jadi kalau diwarisi
// nilainya terkunci ke --primary tema terang dan merahnya jadi lebih kusam.
const STAGE_VARS = {
  "--stage-accent": "var(--primary)",

  /* Seberapa besar kota diperbesar. 1 = tingginya PAS panggung.
     Ini satu-satunya angka yang perlu disetel; naikkan untuk zoom ke
     level jalan, dengan konsekuensi skyline atas terpotong. */
  "--city-zoom": "1",

  /* Lebar diturunkan DARI tinggi panggung, bukan dari lebar viewport.
     Yang memotong gambar adalah batas vertikal (overflow-hidden + bottom-0),
     jadi mengukurnya dengan vw tidak akan pernah benar di semua layar -
     kebutuhannya bergantung pada rasio viewport, bukan lebarnya.

     Dua batas bawah:
       200vw  - parallax menggeser gambar -32% lebarnya sendiri, jadi butuh
                lebar >= 100vw / 0.68 = 147vw. Dinaikkan ke 200vw dan dibiarkan
                MENANG atas cabang tinggi: itu yang menahan zoom tetap lebar,
                jadi seluruh deret etalase layer-3 terlihat alih-alih satu
                potong pagar yang diperbesar.
       1500px - menahan garis tanah tetap di atas HUD di layar sangat kecil. */
  "--city-w": "max(calc((100vh - 5rem) * 3 * var(--city-zoom)), 200vw, 1500px)",

  /* --city-drop TIDAK ditulis di sini: nilainya harus berbeda antara HP dan
     desktop, sementara inline style tidak bisa dikondisikan media query -
     dan inline SELALU menang atas class. Jadi ia dipasang lewat class di
     elemen panggung; lihat catatannya di sana. var(--city-drop) di --ground
     tetap resolve karena keduanya hidup di elemen yang sama. */

  /* Permukaan trotoar di layer-3 ada di 18.5% tinggi gambar dari bawah -
     diukur dari profil kecerahannya: aspal 0-14.4%, tepi trotoar gelap 15.2%,
     permukaan trotoar terang 16.4-18.5%, gedung mulai 18.8%. Karakter berdiri
     di garis yang sama dengan dasar gedung, seperti semestinya di tampak samping.

     --city-drop ikut dikurangkan di sini: garis tanah diukur dari tepi bawah
     GAMBAR, jadi begitu gambarnya turun, sprite harus turun sebanyak itu juga
     atau telapaknya menggantung di udara. */
  "--ground": "calc(var(--city-w) / 3 * 0.185 - var(--city-drop))",
};

const RANGES = {
  hero: [0, 0.16, 0.22],
  skills: [0.16, 0.22, 0.36, 0.42],
  projects: [0.36, 0.42, 0.56, 0.62],
  ai: [0.56, 0.62, 0.76, 0.82],
  contact: [0.76, 0.82, 1],
};

/* Tiga layer parallax, dari paling jauh ke paling dekat. Kecepatan yang
   berbeda itulah yang menciptakan kedalaman. Yang terdekat memakai 50% -
   jarak yang sudah dipakai sebelumnya - jadi langkah karakter tidak berubah.

   Layer tercepat yang menentukan batas: lebar x (1 - 0.5) >= 100vw, dan itu
   yang dijaga floor 200vw di --city-w. */
const LAYERS = [
  { src: "/layer-1-v2.png", travel: "-10%", z: "z-[1]" },
  { src: "/layer-2-v2.png", travel: "-20%", z: "z-[3]" },
  { src: "/layer-3-v2.png", travel: "-32%", z: "z-[5]" },
];

/* Pita kunang-kunang di antara layer. Kecepatannya berada DI ANTARA dua layer
   yang mengapitnya - itu yang mengisi ruang di antara mereka, alih-alih
   membiarkan dua bidang datar saling geser.

   Makin ke depan makin besar dan makin cepat, mengikuti aturan kedalaman yang
   sama: 2px di belakang, 4px di depan. */
const PARTICLES = [
  { z: "z-[2]", travel: "-15%", count: 28, size: 2, seed: 11, warmRatio: 0.55 },
  { z: "z-[4]", travel: "-26%", count: 22, size: 4, seed: 29, warmRatio: 0.7 },
  { z: "z-[6]", travel: "-40%", count: 15, size: 4, seed: 47, warmRatio: 0.85 },
];

/* Ukuran sprite, dipakai bersama hero dan pejalan latar.

   Ketiganya berdiri di GARIS TANAH YANG SAMA - trotoar layer-3 - dan pada tampak
   samping, orang yang berdiri di trotoar yang sama harus sebesar satu sama lain.
   Ukuran yang berbeda tidak terbaca sebagai kedalaman di sini, melainkan sebagai
   orang yang memang lebih kecil badannya.

   Ditulis satu kali supaya ketiganya tidak bisa hanyut berbeda: kecepatan jalan
   pejalan latar diturunkan dari lebar sprite (lihat STRIDE_RATE), jadi mengubah
   angka ini di satu tempat saja akan membuat langkah mereka tidak lagi sepadan. */
const SPRITE_SIZE = "w-14 sm:w-20 md:w-22";

/* ---------- Rentang gerak: kamera, kota, dan hero dibatasi TERPISAH ----------

   Scroll dibagi tiga fase:

     fase LEAD     kamera diam, hero berjalan masuk dari tepi kiri
     fase KAMERA   hero diam di jangkarnya, kota yang bergerak
     fase TAIL     kota mentok, hero melanjutkan sendiri ke tepi kanan

   Jatah scroll tiap fase TIDAK disetel tangan - ia dihitung dari jaraknya,
   lihat cameraKeys di dalam komponen.

   Sebabnya: kecepatan tampak = jarak / jatah scroll. Waktu jatahnya masih angka
   tetap, jaraknya sangat timpang - fase TAIL menempuh ~1250px dalam 24% scroll
   sementara fase KAMERA menempuh ~920px dalam 70%, jadi hero terlihat berlari
   begitu kota mentok. Dibagi sebanding jaraknya, ketiga fase berjalan pada
   kecepatan yang sama persis dan tidak ada lagi angka yang bisa salah setel. */

/* Posisi hero di layar, sebagai fraksi lebar panggung.
     START  - titik ia masuk di tepi kiri
     ANCHOR - titik ia berdiri selama kamera yang bergerak
     REACH  - titik tepi kanan sprite berhenti

   REACH juga yang menentukan berapa lama latar membeku di akhir: makin jauh
   hero berjalan, makin besar jatah scroll fase TAIL, dan jatah itu diambil dari
   fase KAMERA. 0,98 = benar-benar sampai tepi, dengan konsekuensi kota diam
   di paruh terakhir. Turunkan ke ~0,7 kalau lebih suka kotanya hidup lebih
   lama; kecepatan hero tidak akan berubah, cuma jaraknya. */
const HERO_START = 0.015;
const HERO_ANCHOR = 0.06;
const HERO_REACH = 0.98;

/* Panjang satu siklus jalan, dalam lebar sprite.

   Dipakai untuk mengikat kaki hero ke JARAK, bukan ke waktu. Siklus berbasis
   waktu berputar 0,88 detik sekali lepas dari seberapa cepat halaman digulir -
   jadi waktu pengunjung menggulir pelan, kakinya tetap mengayuh penuh di atas
   tanah yang nyaris diam, dan itu yang terbaca seperti berlari di tempat.

   1,4 angka yang sama dengan yang dipakai STRIDE_RATE untuk pejalan latar: pada
   frame contact jarak kedua telapak ~0,7 lebar sel, dan satu siklus berisi dua
   langkah. Memakai angka itu di sini membuat telapak hero tidak pernah menyeret,
   berapa pun kecepatan gulirannya. */
const CYCLE_DISTANCE = 1.4;

/* Batas kecepatan panggung, dalam fraksi panjang halaman per detik.

   scrollYProgress mengikuti roda dan jari TANPA batas: satu lemparan trackpad
   atau seretan batang scroll bisa memindahkan seluruh halaman dalam sepersekian
   detik. Pada kecepatan itu kotanya berkelebat, dan kaki hero - yang sekarang
   terikat jarak - menyapu seratusan frame dalam sekejap.

   0,35 berarti menyeberangi lima babak tidak akan pernah lebih cepat dari ~2,9
   detik. Guliran roda biasa jauh di bawah itu (~0,09/detik untuk lima ketukan
   per detik), jadi pemakaian normal tidak tersentuh sama sekali - yang dipotong
   cuma lemparan.

   Menurunkannya ke ~0,12 akan menjaga kaki hero tetap terbaca frame demi frame
   bahkan saat digulir kencang, tapi mulai terasa tertinggal pada guliran biasa. */
const MAX_SCROLL_RATE = 0.35;

/* Batas atas delta antar frame. Tab yang baru diaktifkan kembali mengirim delta
   raksasa dalam satu frame, dan tanpa penjaga ini pembatas kecepatan justru
   melompat sejauh yang seharusnya ia cegah. */
const MAX_FRAME_MS = 64;

/* Tinggi kolom scroll yang menggerakkan seluruh panggung.

   Ini SATU-SATUNYA tuas kecepatan global: seluruh jarak - geseran kota, langkah
   hero, pergantian babak - dibagi rata ke dalamnya, jadi menaikkan angka ini
   memperlambat semuanya sekaligus tanpa mengubah satu pun perbandingan.

   Desktop dinaikkan dari 500vh: di situ satu piksel scroll memindahkan ~0,68px
   tanah, dan pada tempo itu telapak hero terlihat menyeret. 750vh menurunkannya
   ke ~0,42 - kira-kira sepadan dengan panjang langkah sprite-nya.

   HP sengaja TIDAK ikut dinaikkan. Jaraknya diukur dalam lebar layar sementara
   kolom scroll diukur dalam tingginya, jadi di layar sempit-dan-jangkung
   angkanya sudah jauh lebih lambat sejak awal (~0,23). Dinaikkan ke 750vh, HP
   jadi 0,14 - enam ribu piksel scroll untuk menggeser delapan ratus piksel
   tanah, yang terasa seperti macet. */
const SCROLL_SPAN = "h-[500vh] md:h-[750vh]";

/* Pejalan kaki latar. from/to adalah wilayah jelajah mereka SENDIRI, diukur
   sebagai fraksi lebar panggung - bukan tempat mereka akan terlihat. Wilayah itu
   ikut hanyut bersama kota dan diputar di tepi layar, jadi keduanya akan muncul
   di mana-mana sepanjang lima babak.

   Wilayahnya sengaja tidak sama dan tumpang tindih di tengah supaya langkah
   mereka sesekali berpapasan, alih-alih dua pola yang selalu terpisah.

   Keduanya duduk DI DEPAN layer-3 (z-5), bukan di belakangnya, karena --ground
   diturunkan dari trotoar layer-3 - berdiri di garis itu tapi di belakang
   platnya akan membuat mereka tertutup pagar dan etalase.

   Yang memisahkan mereka dari hero tinggal CAHAYA - bukan ukuran, dan bukan
   opacity. Opacity membuat kota di belakangnya menembus badan mereka, jadi
   terbaca sebagai hantu; brightness membiarkan mereka tetap pekat, cuma kurang
   tersinari.

   Pembeda yang sebenarnya menjawab "yang mana saya" bukan di sini, melainkan
   segitiga penanda di atas kepala hero. */
const WALKERS = [
  {
    seed: 17,
    from: 0.16,
    to: 0.6,
    zIndex: 7,
    className: cn(SPRITE_SIZE, "brightness-90"),
  },
  {
    seed: 53,
    from: 0.4,
    to: 0.92,
    zIndex: 6,
    className: cn(SPRITE_SIZE, "brightness-75"),
  },
];

// Titik "plateau" tiap babak - dipakai untuk snap saat navigasi keyboard & klik HUD
const SNAP_POINTS = [0, 0.22, 0.42, 0.62, 0.82];

/* Berapa lama tanpa event scroll sebelum karakter dianggap berhenti.

   Dibutuhkan karena "bergerak" tidak punya sinyal akhir sendiri: scroll cuma
   mengirim rentetan event lalu diam, tidak pernah mengabarkan bahwa yang tadi
   adalah event terakhir. Jadi tiap event menyalakan flag dan menyetel ulang
   hitungan mundur ini; kalau tidak ada event susulan, hitungannya habis dan
   karakter kembali diam.

   90ms: sekadar menutup jeda antar event dalam satu gerakan yang sama (browser
   mengirimnya ~16ms sekali selama scroll berlangsung), bukan untuk memberi
   karakter waktu tambahan berjalan. Menaikkannya berarti karakter masih
   melangkah setelah tangan berhenti - persis yang tidak diinginkan di sini. */
const IDLE_DELAY = 90;

/* Ruang bawah yang dipesan untuk HUD. Dipasangkan dengan items-center, jadi
   angka ini bukan cuma jarak aman - ia menggeser titik tengah panel ke ATAS
   sebanyak setengahnya.

   Di HP sengaja jauh lebih besar dari tinggi HUD-nya: sepertiga bawah layar
   sudah terisi kota dan karakter, jadi "tengah layar" yang terasa benar buat
   panel adalah tengah ruang langit di atasnya, bukan tengah panggung.

   150px mengangkatnya 41px dari titik tengah geometris. Batas atasnya
   ditentukan panel babak 1 (~380px, yang paling tinggi): panggung di HP
   pendek (430x673) cuma 593px, jadi sisa ruang setelah dipotong 150px tinggal
   443px - masih memuat panel itu. Menaikkan angka ini lagi akan mulai
   memotongnya, karena panggung overflow-hidden. */
const HUD_OFFSET = "pb-[150px] md:pb-[76px]";

/* Dari sm ke atas: padding kiri menyisakan ruang untuk sprite, panel didorong
   ke kanan, sisanya jadi lebar panel.

   Di bawah sm ruang itu justru merugikan - layarnya cuma ~430px, jadi 72px
   yang dipesan bikin panel terbaca miring ke kanan sekaligus menyempit
   (teksnya jadi membungkus lebih banyak dan panelnya memanjang ke bawah).
   Di HP panel dibiarkan penuh dan center: sprite-nya duduk jauh di bawah
   panel, jadi tidak ada yang perlu dihindari secara horizontal. */
const panelWrap = cn(
  "absolute inset-0 z-20 flex items-center justify-center sm:justify-end",
  "px-4 sm:pl-28 md:pl-44 lg:pl-56 md:pr-8 lg:pr-12",
  HUD_OFFSET
);

const actionClass =
  "group inline-flex w-fit items-center gap-2 pix-chip stage-border-soft px-4 py-2 pixel-font text-pix-xs md:text-pix-sm text-foreground transition-all duration-100 ease-pix hover:stage-border hover:stage-bg-soft hover:translate-x-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--stage-accent))]";

/* Chrome panel: mengikuti bahasa visual dialogue-box di Title Screen */
const PanelFrame = ({ index, label, hint, children }) => (
  <div className="pix-dialog crt pix-corners stage-border relative w-full max-w-lg md:max-w-2xl px-4 pt-8 pb-7 sm:px-5 md:px-7">
    <span className="border-2 stage-border stage-bg stage-ink absolute -top-4 left-4 px-3 py-1 pixel-font text-pix-xs md:text-pix-sm whitespace-nowrap">
      BABAK {String(index + 1).padStart(2, "0")} · {label.toUpperCase()}
    </span>
    <div className="flex flex-col items-start gap-3">{children}</div>
    <span className="absolute bottom-2 right-3 pixel-font text-pix-xs md:text-pix-sm stage-text">
      {hint === "end" ? "◆ BATAS AKHIR" : <span className="animate-blink">▼</span>}
    </span>
  </div>
);

const StatRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3">
    <Icon className="mt-1 h-4 w-4 shrink-0 stage-text" />
    <span className="pixel-font w-14 shrink-0 text-pix-xs uppercase text-foreground/70">
      {label}
    </span>
    <span className="min-w-0 text-xs md:text-sm text-foreground/90">{children}</span>
  </div>
);

export const ProfileSection = () => {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const cityRef = useRef(null);
  const heroRef = useRef(null);
  const lastProgressRef = useRef(0);
  const stopTimerRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [facingRight, setFacingRight] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const handleChange = (e) => setReducedMotion(e.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  /* Pejalan latar digeser dalam piksel, bukan persen - transform berpersen
     mengacu ke lebar elemen itu sendiri, bukan ke lebar panggung. Jadi kedua
     lebar ini harus benar-benar diukur.

     Lebar kota tidak bisa dihitung di JS: --city-w itu max() dari tiga suku
     yang salah satunya bergantung tinggi viewport. Diukur dari elemennya saja. */
  const stageWidth = useElementWidth(stageRef);
  const cityWidth = useElementWidth(cityRef);
  const heroWidth = useElementWidth(heroRef);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  /* Parallax dilewatkan spring supaya kota MELUNCUR, bukan tersentak. Roda
     mouse mengirim scroll dalam ketukan diskret (~100px sekali putar), dan
     memetakannya langsung ke translasi membuat kotanya ikut melompat tiap
     ketukan. Sengaja overdamped (rasio ~1.4) - parallax yang memantul di
     ujung terasa salah.

     HANYA parallax yang dihaluskan. Opacity panel dan pergantian babak tetap
     terikat ke scroll mentah, supaya babaknya berganti tepat di posisinya. */
  /* Dipakai dua tempat: saat scroll berubah, dan selama panggung masih menyusul
     di belakang pembatas kecepatan. */
  const markMoving = useCallback(() => {
    setIsMoving(true);
    clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => setIsMoving(false), IDLE_DELAY);
  }, []);

  /* Pembatas kecepatan, DI DEPAN spring. Nilai ini mengejar scrollYProgress
     tetapi tidak pernah lebih cepat dari MAX_SCROLL_RATE per detik; spring di
     bawahnya lalu menghaluskan hasilnya seperti biasa.

     Urutannya penting. Dipasang SESUDAH spring, yang dibatasi cuma keluarannya
     sementara targetnya sudah terlanjur melompat, jadi hasilnya bukan panggung
     yang berjalan pelan melainkan panggung yang tertinggal lalu menyusul dalam
     satu sentakan. */
  const cappedProgress = useMotionValue(0);
  const syncedRef = useRef(false);

  useAnimationFrame((_, delta) => {
    const target = scrollYProgress.get();

    // Frame pertama disamakan begitu saja: halaman bisa dimuat ulang di tengah
    // babak, dan tanpa ini panggung akan merangkak dari nol menuju posisi itu.
    if (!syncedRef.current || reducedMotion) {
      syncedRef.current = true;
      cappedProgress.set(target);
      return;
    }

    const current = cappedProgress.get();
    const diff = target - current;
    if (!diff) return;

    const step = (MAX_SCROLL_RATE * Math.min(delta, MAX_FRAME_MS)) / 1000;
    cappedProgress.set(
      Math.abs(diff) <= step ? target : current + Math.sign(diff) * step
    );

    /* Selama panggung masih menyusul, hero MASIH berjalan - tanahnya memang
       masih bergerak di bawah kakinya. Tanpa baris ini ia akan berdiri mematung
       di atas kota yang meluncur, karena isMoving dibaca dari scroll mentah yang
       sudah berhenti berubah. */
    markMoving();
  });

  const smoothProgress = useSpring(cappedProgress, {
    stiffness: 70,
    damping: 20,
    mass: 0.5,
    restDelta: 0.0002,
  });

  /* Karakter melangkah HANYA selama ada input, dan berhenti begitu input
     berhenti. Sinyalnya sengaja diambil dari scrollYProgress mentah, bukan dari
     smoothProgress: spring parallax masih meluncur beberapa ratus milidetik
     setelah roda mouse berhenti, dan memakainya membuat karakter melanjutkan
     langkah sesudah tangan berhenti.

     Konsekuensinya kota masih menggeser sesaat setelah kakinya berhenti. Itu
     pertukaran yang disengaja - berhenti tepat waktu lebih penting daripada
     kaki yang teregistrasi sempurna dengan tanah selama sisa luncuran spring. */
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    markMoving();

    if (v < 0.19) setActiveIndex(0);
    else if (v < 0.39) setActiveIndex(1);
    else if (v < 0.59) setActiveIndex(2);
    else if (v < 0.79) setActiveIndex(3);
    else setActiveIndex(4);
  });

  /* Arah hadap - dan HANYA arah hadap - dibaca dari nilai yang sudah dihaluskan:
     roda mouse mengirim lompatan kecil bolak-balik, dan karakternya berkedip ganti
     arah kalau mengikuti scroll mentah. Berbeda dengan flag berjalan di atas, di
     sini luncuran sisa spring tidak merugikan: ia cuma mempertahankan arah yang
     sudah benar. */
  useMotionValueEvent(smoothProgress, "change", (v) => {
    const delta = v - lastProgressRef.current;
    if (delta > 0.0004) setFacingRight(true);
    else if (delta < -0.0004) setFacingRight(false);
    lastProgressRef.current = v;
  });

  // Hitungan mundur di atas hidup di luar React - wajib dibersihkan saat unmount.
  useEffect(() => () => clearTimeout(stopTimerRef.current), []);

  const scrollToProgress = useCallback(
    (target) => {
      const container = containerRef.current;
      if (!container) return;
      const containerTop = window.scrollY + container.getBoundingClientRect().top;
      const scrollRange = container.offsetHeight - window.innerHeight;
      window.scrollTo({
        top: containerTop + target * scrollRange,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    },
    [reducedMotion]
  );

  const goToAct = useCallback(
    (index) => {
      setFacingRight(index >= activeIndex);
      scrollToProgress(SNAP_POINTS[index]);
    },
    [activeIndex, scrollToProgress]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();

      setFacingRight(e.key === "ArrowRight");
      const current = scrollYProgress.get();
      const target =
        e.key === "ArrowRight"
          ? SNAP_POINTS.find((p) => p > current + 0.01) ?? 1
          : [...SNAP_POINTS].reverse().find((p) => p < current - 0.01) ?? 0;

      scrollToProgress(target);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollYProgress, scrollToProgress]);

  /* Geseran layer-3 sebagai pecahan. Diturunkan dari LAYERS[2], bukan ditulis
     ulang -32%: kalau kecepatan layer terdepan disetel ulang suatu saat, jatah
     fase dan pejalan kakinya harus ikut, atau kaki mereka lepas dari tanah. */
  const nearTravel = parseFloat(LAYERS[2].travel) / 100;

  /* Tiga jarak yang harus ditempuh, dalam piksel layar.

     Batas kanan diberi Math.max terhadap jangkarnya: di layar sangat sempit
     lebar sprite bisa melampaui sisa ruang, dan tanpa penjaga ini hero akan
     berjalan MUNDUR di fase terakhir. */
  const anchorX = stageWidth * HERO_ANCHOR;
  const reachX = Math.max(anchorX, stageWidth * HERO_REACH - heroWidth);
  const leadDist = Math.max(0, anchorX - stageWidth * HERO_START);
  const cameraDist = Math.abs(cityWidth * nearTravel);
  const tailDist = reachX - anchorX;
  const totalDist = leadDist + cameraDist + tailDist;

  /* Jatah scroll tiap fase, SEBANDING JARAKNYA - itu yang membuat ketiganya
     berjalan pada kecepatan yang sama.

     Kunci-kuncinya dijaga tetap menaik: useTransform memerlukan rentang masukan
     yang naik ketat, dan sebelum panggung terukur totalDist masih nol. */
  const leadKey = totalDist ? Math.min(0.2, leadDist / totalDist) : 0.03;
  const tailKey = totalDist ? Math.min(0.9, tailDist / totalDist) : 0.5;
  const cameraKeys = [0, leadKey, Math.max(leadKey + 0.002, 1 - tailKey), 1];

  /* Posisi KAMERA, 0..1 - bukan posisi scroll. Ia menempel di 0 selama fase
     LEAD dan di 1 selama fase TAIL; hanya di antaranya ia bergerak.

     Semua yang membentuk dunia diturunkan dari sini: tiga plat kota, tiga pita
     kunang-kunang, dan pejalan kaki latar. Yang TIDAK diturunkan dari sini cuma
     hero, opacity panel, dan bilah progres - mereka memang mengikuti scroll. */
  const cameraProgress = useTransform(smoothProgress, cameraKeys, [0, 0, 1, 1]);

  /* Hero punya rentangnya sendiri: berjalan masuk di fase LEAD, diam di jangkar
     selama kamera bekerja, lalu melanjutkan ke tepi kanan setelah kota mentok. */
  const heroX = useTransform(
    smoothProgress,
    cameraKeys,
    reducedMotion
      ? [anchorX, anchorX, anchorX, anchorX]
      : [stageWidth * HERO_START, anchorX, anchorX, reachX]
  );

  /* Jarak yang sudah ditempuh hero di atas tanah, piksel. Dua sumbangan:
     geseran kota selama fase KAMERA, dan langkahnya sendiri di fase LEAD/TAIL.
     Keduanya dijumlahkan karena keduanya sama-sama memajukan dia terhadap
     trotoar - yang berbeda cuma siapa yang bergerak, dia atau kotanya. */
  const heroGround = useTransform(
    [cameraProgress, heroX],
    ([camera, screenX]) => camera * cameraDist + screenX
  );

  /* Fase siklus jalan: bertambah 1 tiap satu putaran langkah penuh. */
  const heroCycle = useTransform(heroGround, (d) =>
    heroWidth ? d / (heroWidth * CYCLE_DISTANCE) : 0
  );

  /* Satu useTransform per layer. Hook tidak boleh dipanggil di dalam loop,
     jadi ketiganya ditulis lurus - jumlah layer memang tetap tiga.

     Tetap dalam PERSEN, bukan piksel: persen di sini berarti "dari lebar plat
     kota", yang justru yang dimaui, dan itu membuat platnya tidak bergantung
     pada hasil pengukuran apa pun. */
  const layerFar = useTransform(cameraProgress, [0, 1], ["0%", reducedMotion ? "0%" : LAYERS[0].travel]);
  const layerMid = useTransform(cameraProgress, [0, 1], ["0%", reducedMotion ? "0%" : LAYERS[1].travel]);
  const layerNear = useTransform(cameraProgress, [0, 1], ["0%", reducedMotion ? "0%" : LAYERS[2].travel]);
  const layerX = [layerFar, layerMid, layerNear];

  const dustFar = useTransform(cameraProgress, [0, 1], ["0%", reducedMotion ? "0%" : PARTICLES[0].travel]);
  const dustMid = useTransform(cameraProgress, [0, 1], ["0%", reducedMotion ? "0%" : PARTICLES[1].travel]);
  const dustNear = useTransform(cameraProgress, [0, 1], ["0%", reducedMotion ? "0%" : PARTICLES[2].travel]);
  const dustX = [dustFar, dustMid, dustNear];

  const walkerX = useTransform(
    cameraProgress,
    [0, 1],
    [0, reducedMotion ? 0 : cityWidth * nearTravel]
  );
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const heroOpacity = useTransform(scrollYProgress, RANGES.hero, [1, 1, 0]);
  const skillsOpacity = useTransform(scrollYProgress, RANGES.skills, [0, 1, 1, 0]);
  const projectsOpacity = useTransform(scrollYProgress, RANGES.projects, [0, 1, 1, 0]);
  const aiOpacity = useTransform(scrollYProgress, RANGES.ai, [0, 1, 1, 0]);
  const contactOpacity = useTransform(scrollYProgress, RANGES.contact, [0, 1, 1]);

  // Ada input -> strip jalan. Input berhenti -> strip idle. Lihat IDLE_DELAY.
  const walking = !reducedMotion && isMoving;

  // Panel non-aktif dibuat inert: tidak bisa di-tab, tidak dibaca screen reader
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
      {/* night-scene: adegan ini selalu malam, lepas dari toggle tema terang/gelap */}
      {/* --city-drop: seberapa jauh pelat kota diturunkan dari dasar panggung.
          Nilainya menggeser kota DAN sprite berbarengan (--ground ikut
          menguranginya), jadi keduanya tetap teregistrasi.

          90px itu ukuran desktop, di mana panggung ~820px. Di HP panggungnya
          cuma ~593px, jadi 90px memakan 15% tinggi panggung: garis trotoar
          terdorong keluar layar dan karakternya berdiri tertimbun HUD. 28px
          mengangkat keduanya ~62px, cukup untuk memunculkan tanah kembali dan
          menaikkan sprite ke atas garis HUD. */}
      <div
        ref={stageRef}
        className="night-scene sticky top-20 h-[calc(100vh-5rem)] overflow-hidden bg-background [--city-drop:28px] md:[--city-drop:90px]"
        style={STAGE_VARS}
      >
        {/* Layer langit: bintang & meteor */}
        <StarBackground />

        {/* Kota: tiga layer bertumpuk, masing-masing bergeser dengan kecepatan
            sendiri. Semuanya seukuran dan ditambat ke titik yang sama supaya
            registrasinya terjaga; langitnya transparan supaya bintang tembus. */}
        {LAYERS.map((layer, i) => (
          <motion.img
            key={layer.src}
            // Hanya plat terdepan yang diukur - itu yang dipijak pejalan kaki.
            ref={i === LAYERS.length - 1 ? cityRef : undefined}
            src={layer.src}
            alt=""
            aria-hidden="true"
            style={{ x: layerX[i] }}
            className={cn(
              "sprite absolute bottom-[calc(-1*var(--city-drop))] left-0 w-[var(--city-w)]",
              "max-w-none pointer-events-none select-none",
              layer.z
            )}
          />
        ))}

        {/* Kunang-kunang disisipkan DI ANTARA layer lewat z-index, bukan ditumpuk di
            atas semuanya - itu yang membuatnya terbaca sebagai udara di dalam
            kota, bukan lapisan efek di depan kota. */}
        {!reducedMotion &&
          PARTICLES.map((band, i) => (
            <motion.div
              key={band.z}
              aria-hidden="true"
              style={{ x: dustX[i] }}
              className={cn(
                "absolute bottom-[calc(-1*var(--city-drop))] left-0 h-full w-[var(--city-w)]",
                "pointer-events-none",
                band.z
              )}
            >
              <Fireflies
                count={band.count}
                size={band.size}
                seed={band.seed}
                warmRatio={band.warmRatio}
              />
            </motion.div>
          ))}

        {/* Pejalan kaki latar. Ditempatkan sebelum hero supaya urutan DOM-nya
            mengikuti urutan kedalaman; yang menentukan tumpukan tetap zIndex. */}
        {WALKERS.map((walker) => (
          <WanderingSprite
            key={walker.seed}
            stageWidth={stageWidth}
            parallaxX={walkerX}
            reducedMotion={reducedMotion}
            {...walker}
          />
        ))}

        {/* Hero: berdiri di aspal, tapi TIDAK lagi di titik layar yang tetap.
            Posisinya digeser lewat x mengikuti heroX, yang punya rentangnya
            sendiri terpisah dari kamera - lihat cameraKeys.

            left-0, bukan left-3/6/12 seperti dulu: jarak dari tepi sekarang
            bagian dari heroX (HERO_START / HERO_ANCHOR), dan menumpuk keduanya
            akan menggeser seluruh rentangnya ke kanan.

            Sel strip-nya menempatkan telapak DI BARIS PALING BAWAH, jadi di sini
            cukup bottom-[var(--ground)]; offset koreksi -6/-8/-11px yang dulu
            menambal ruang kosong sprite lama tidak diperlukan lagi.

            Penempatan dipisah dari sprite-nya: <CharacterSprite> hanya mengurus
            jendela dan frame, karena pejalan latar memakainya juga sementara
            posisi mereka digeser terus-menerus. */}
        <motion.div
          ref={heroRef}
          style={{ x: heroX }}
          className="absolute bottom-[var(--ground)] left-0 z-10"
        >
          {/* Penanda "ini kamu". Wajib ada begitu pejalan latar dibuat seukuran
              hero: tanpa perbedaan ukuran, satu-satunya pembeda tinggal cahaya,
              dan itu tidak cukup untuk menjawab pertanyaan yang mana dirinya.

              Digambar sebagai empat rect bertingkat, bukan satu polygon atau
              segitiga border-CSS: keduanya menghasilkan sisi miring yang mulus,
              sementara seluruh panggung ini bertepi keras. Bertingkat begini
              tepinya ikut membesar jadi blok saat SVG-nya diperbesar.

              Bob dipasang di elemen DALAM: pemusatan memakai -translate-x-1/2,
              dan keyframe bob menulis transform juga - kalau keduanya di elemen
              yang sama, animasinya menimpa pemusatan dan segitiganya melompat
              setengah lebar ke kanan. */}
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

          <CharacterSprite
            walking={walking}
            facingRight={facingRight}
            cycle={heroCycle}
            reducedMotion={reducedMotion}
            className={SPRITE_SIZE}
          />
        </motion.div>

        {/* Babak 1: Data diri */}
        <motion.div style={{ opacity: heroOpacity }} {...actProps(0)}>
          <PanelFrame index={0} label="Data Diri">
            <div>
              <h1 className="pixel-font text-pix-xl md:text-pix-2xl font-bold leading-none text-foreground">
                Deva <span className="stage-text">Surya</span>
              </h1>
              <p className="pixel-font-null mt-2 text-pix-sm md:text-pix-md uppercase tracking-[2px] stage-text">
                Web &amp; Mobile Developer
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 border-y-2 stage-border-soft py-3">
              <StatRow icon={MapPin} label="Lokasi">
                Tabanan, Bali &mdash; Indonesia
              </StatRow>
              <StatRow icon={Crosshair} label="Fokus">
                Laravel &middot; Flutter &middot; React
              </StatRow>
              <StatRow icon={Signal} label="Status">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-2 w-2 shrink-0 stage-bg animate-pulse-subtle" />
                  Terbuka untuk proyek &amp; kolaborasi
                </span>
              </StatRow>
            </div>

            <p className="text-[13px] md:text-sm leading-relaxed text-foreground/80">
              Saya membangun aplikasi web dengan Laravel dan aplikasi mobile dengan Flutter, dengan
              perhatian besar pada struktur data agar setiap fitur tetap rapi, ringan, dan mudah
              dikembangkan. Di luar itu saya mengeksplorasi React dan mengasah kemampuan lewat
              kontribusi ke proyek open&#8209;source.
            </p>
          </PanelFrame>
        </motion.div>

        {/* Babak 2: Skills */}
        <motion.div style={{ opacity: skillsOpacity }} {...actProps(1)}>
          <PanelFrame index={1} label="Skills">
            <h2 className="pixel-font text-pix-lg md:text-pix-xl font-bold leading-none text-foreground">
              My <span className="stage-text">Skills</span>
            </h2>
            <p className="text-[13px] md:text-sm leading-relaxed text-foreground/80">
              Terbiasa bekerja di dua sisi: Laravel untuk web, Flutter untuk mobile, dan React saat
              antarmuka butuh sentuhan yang lebih modern. Di belakang layar, MySQL dan Git jadi
              bagian dari alur kerja harian.
            </p>
            <div className="flex flex-wrap gap-2">
              {focusStack.map((s) => (
                <span
                  key={s.name}
                  className="flex items-center gap-2 pix-chip stage-border-soft px-3 py-1 pixel-font text-pix-xs md:text-pix-sm text-foreground/90"
                >
                  {s.icon} {s.name.toUpperCase()}
                </span>
              ))}
            </div>
            <Link to="/skills" className={actionClass}>
              <span className="stage-text transition-colors group-hover:text-foreground">▶</span>
              BUKA STAGE SKILLS
            </Link>
          </PanelFrame>
        </motion.div>

        {/* Babak 3: Projects */}
        <motion.div style={{ opacity: projectsOpacity }} {...actProps(2)}>
          <PanelFrame index={2} label="Projects">
            <h2 className="pixel-font text-pix-lg md:text-pix-xl font-bold leading-none text-foreground">
              Featured <span className="stage-text">Projects</span>
            </h2>
            <p className="text-[13px] md:text-sm leading-relaxed text-foreground/80">
              Eksperimen yang berakhir jadi produk nyata &mdash; dari computer vision di browser
              sampai pipeline AI untuk foto, video, dan model 3D.
            </p>
            <ul className="flex w-full flex-col gap-2 border-l-2 stage-border-soft pl-3">
              {projectTeasers.map((p) => (
                <li key={p.name} className="text-xs md:text-sm leading-snug text-muted-foreground">
                  <span className="pixel-font-null uppercase tracking-[1px] text-foreground">
                    {p.name}
                  </span>{" "}
                  &mdash; {p.desc}
                </li>
              ))}
            </ul>
            <Link to="/projects" className={actionClass}>
              <span className="stage-text transition-colors group-hover:text-foreground">▶</span>
              BUKA STAGE PROJECTS
            </Link>
          </PanelFrame>
        </motion.div>

        {/* Babak 4: Ask AI */}
        <motion.div style={{ opacity: aiOpacity }} {...actProps(3)}>
          <PanelFrame index={3} label="Ask AI">
            <h2 className="pixel-font flex items-center gap-2 text-pix-lg md:text-pix-xl font-bold leading-none text-foreground">
              <Bot className="h-6 w-6 shrink-0 stage-text" />
              Ask <span className="stage-text">AI</span>
            </h2>
            <p className="text-[13px] md:text-sm leading-relaxed text-foreground/80">
              Ingin tahu lebih dalam soal pengalaman, stack, atau cara saya mengerjakan sebuah
              proyek? Tanyakan langsung ke asisten AI &mdash; ditenagai Gemini dan menjawab
              seketika berdasarkan profil ini.
            </p>
            <Link to="/assistant" className={actionClass}>
              <span className="stage-text transition-colors group-hover:text-foreground">▶</span>
              MULAI PERCAKAPAN
            </Link>
          </PanelFrame>
        </motion.div>

        {/* Babak 5: Contact - penanda batas akhir, tidak fade out */}
        <motion.div style={{ opacity: contactOpacity }} {...actProps(4)}>
          <PanelFrame index={4} label="Contact" hint="end">
            <h2 className="pixel-font text-pix-lg md:text-pix-xl font-bold leading-none text-foreground">
              Get In <span className="stage-text">Touch</span>
            </h2>
            <p className="text-[13px] md:text-sm leading-relaxed text-foreground/80">
              Punya ide proyek, tawaran kerja, atau sekadar ingin berdiskusi soal teknologi? Saya
              selalu senang menerima pesan baru.
            </p>

            <div className="flex w-full flex-wrap items-center gap-2">
              {socialLinks.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={name}
                  title={name}
                  className="flex h-9 w-9 items-center justify-center pix-chip stage-border-soft text-foreground/80 transition-colors duration-100 ease-pix hover:stage-border hover:stage-bg-soft hover:stage-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--stage-accent))]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
              <a href="/cv/cv-1.pdf" download className={actionClass}>
                <Download className="h-4 w-4 stage-text transition-colors group-hover:text-foreground" />
                UNDUH CV
              </a>
            </div>

            <Link to="/contact" className={actionClass}>
              <span className="stage-text transition-colors group-hover:text-foreground">▶</span>
              KIRIM PESAN
            </Link>
          </PanelFrame>
        </motion.div>

        {/* HUD babak: stepper + progress + petunjuk kontrol */}
        <div className="absolute inset-x-0 bottom-0 z-30 h-[68px] md:h-[76px] overflow-hidden pix-veil border-t-4 stage-border">
          <div className="mx-auto flex h-full max-w-3xl flex-col justify-center gap-2 px-3 md:px-6">
            <div className="flex items-stretch gap-1">
              {ACTS.map((act, i) => {
                const isActive = activeIndex === i;
                const isPast = activeIndex > i;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => goToAct(i)}
                    aria-current={isActive ? "step" : undefined}
                    aria-label={`Ke babak ${i + 1}: ${act.label}`}
                    className={cn(
                      "flex flex-1 flex-col items-center justify-center border-2 px-1 py-1 transition-colors duration-100 ease-pix focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--stage-accent))]",
                      isActive
                        ? "stage-border stage-bg stage-ink"
                        : isPast
                        ? "stage-border-soft stage-bg-soft hover:stage-border"
                        : "pix-chip hover:stage-border"
                    )}
                  >
                    <span
                      className={cn(
                        "pixel-font text-pix-xs md:text-pix-sm leading-tight",
                        isActive ? "stage-ink" : "text-foreground/70"
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "hidden truncate pixel-font text-pix-xs leading-tight sm:block md:text-pix-xs",
                        isActive ? "stage-ink" : "text-foreground/70"
                      )}
                    >
                      {act.label.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <div className="h-3 flex-1 pix-inset">
                <motion.div style={{ width: progressWidth }} className="h-full stage-bg" />
              </div>
              <p className="pixel-font shrink-0 text-pix-xs md:text-pix-sm text-foreground/70">
                ← → PINDAH BABAK
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

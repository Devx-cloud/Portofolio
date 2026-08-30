import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Geometri panggung
   -------------------------------------------------------------------------*/

export const STAGE_VARS = {
  /* 1 = tinggi kota PAS setinggi panggung. Satu-satunya tuas zoom. */
  "--city-zoom": "1",

  /* Lebar kota diturunkan dari TINGGI panggung, bukan lebar viewport - yang
     memotong gambar adalah batas vertikal. Dua batas bawah:
       200vw  - parallax menggeser -32% lebar sendiri, jadi butuh >= 147vw.
                Dilebihkan supaya seluruh deret etalase layer-3 terlihat.
       1500px - menahan garis tanah tetap di atas HUD di layar sangat kecil. */
  "--city-w": "max(calc((100vh - 5rem) * 3 * var(--city-zoom)), 200vw, 1500px)",

  /* Permukaan trotoar layer-3 ada di 18.5% tinggi gambar dari bawah. Karakter
     berdiri di garis yang sama dengan dasar gedung.
     --city-drop ikut dikurangkan: garis tanah diukur dari tepi bawah GAMBAR,
     jadi begitu gambarnya turun, sprite harus turun sebanyak itu juga.
     --city-drop sendiri dipasang lewat class di elemen panggung - inline style
     tidak bisa dikondisikan media query, dan nilainya beda HP vs desktop. */
  "--ground": "calc(var(--city-w) / 3 * 0.185 - var(--city-drop))",
};

/* Tiga layer parallax, jauh -> dekat. Beda kecepatan = kedalaman.
   Layer tercepat yang menentukan batas 200vw di --city-w. */
export const LAYERS = [
  { src: "/layer-1-v2.webp", travel: "-10%", z: "z-[1]" },
  { src: "/layer-2-v2.webp", travel: "-20%", z: "z-[3]" },
  { src: "/layer-3-v2.webp", travel: "-32%", z: "z-[5]" },
];

/* Pita kunang-kunang DI ANTARA layer: kecepatannya di antara dua layer yang
   mengapitnya, jadi ia mengisi ruang alih-alih jadi lapisan efek di depan.
   Makin ke depan makin besar dan cepat. */
export const PARTICLES = [
  { z: "z-[2]", travel: "-15%", count: 28, size: 2, seed: 11, warmRatio: 0.55 },
  { z: "z-[4]", travel: "-26%", count: 22, size: 4, seed: 29, warmRatio: 0.7 },
  { z: "z-[6]", travel: "-40%", count: 15, size: 4, seed: 47, warmRatio: 0.85 },
];

/* Ukuran sprite, dipakai bersama hero dan pejalan latar. Ketiganya berdiri di
   garis tanah yang sama, jadi harus seukuran - beda ukuran di tampak samping
   terbaca sebagai orang yang memang lebih kecil, bukan sebagai kedalaman.
   Kecepatan pejalan latar diturunkan dari angka ini (lihat STRIDE_RATE). */
export const SPRITE_SIZE = "w-14 sm:w-20 md:w-22";

/* Sumber sprite.

   Hero punya lembar idle sendiri; NPC tidak. Waktu berhenti mereka membeku di
   frame pertama strip jalannya - kebetulan pose kedua kaki rapat, jadi terbaca
   sebagai berdiri. Membuatkan lembar idle untuk tiap NPC berarti empat berkas
   lagi (~250 KB masing-masing) demi gerakan napas 1-2 piksel yang pada ukuran
   tampil 56-88px praktis tidak terlihat.

   Semua lembar melewati scripts/build-sprite.py, jadi wajah dan tinggi badannya
   sudah sepadan - NPC tidak perlu disetel ukurannya di sini. */
export const HERO_SPRITE = { walk: "/sprite-walk.webp", idle: "/sprite-idle.webp" };

/* Pejalan kaki latar. from/to = wilayah jelajah mereka sendiri sebagai fraksi
   lebar panggung - bukan tempat mereka terlihat; wilayah itu ikut hanyut bersama
   kota dan diputar di tepi layar. Sengaja tumpang tindih supaya sesekali
   berpapasan.

   Duduk DI DEPAN layer-3 (z-5) karena --ground diturunkan dari trotoarnya, tapi
   HARUS di bawah peneduh (z-8): mereka memang perlu ikut teredam di sisi panel.

   Pembedanya cuma CAHAYA, bukan ukuran - opacity akan membuat kota menembus
   badan mereka. Empat tingkat brightness memberi kedalaman tanpa menyentuh
   palet. */
export const WALKERS = [
  {
    seed: 17,
    from: 0.14,
    to: 0.55,
    zIndex: 7,
    sprite: { walk: "/npc/npc-1.webp" },
    className: cn(SPRITE_SIZE, "brightness-95"),
  },
  {
    seed: 53,
    from: 0.38,
    to: 0.88,
    zIndex: 6,
    sprite: { walk: "/npc/npc-2.webp" },
    className: cn(SPRITE_SIZE, "brightness-80"),
  },
  {
    seed: 89,
    from: 0.05,
    to: 0.44,
    zIndex: 6,
    sprite: { walk: "/npc/npc-3.webp" },
    className: cn(SPRITE_SIZE, "brightness-85"),
  },
  {
    seed: 31,
    from: 0.52,
    to: 0.96,
    zIndex: 7,
    sprite: { walk: "/npc/npc-4.webp" },
    className: cn(SPRITE_SIZE, "brightness-75"),
  },
];

/* ---------------------------------------------------------------------------
   Rentang gerak: kamera, kota, dan hero dibatasi TERPISAH

   Scroll dibagi tiga fase:
     LEAD   - kamera diam, hero berjalan masuk dari tepi kiri
     KAMERA - hero diam di jangkarnya, kota yang bergerak
     TAIL   - kota mentok, hero melanjutkan sendiri ke tepi kanan

   Jatah scroll tiap fase dihitung SEBANDING JARAKNYA (lihat useStageCamera),
   bukan disetel tangan: kecepatan tampak = jarak / jatah scroll, dan jaraknya
   sangat timpang antar fase.
   -------------------------------------------------------------------------*/

/* Posisi hero di layar sebagai fraksi lebar panggung.

   REACH punya DUA nilai, karena panel babak berpindah tempat mengikuti lebar
   layar (lihat panelWrap di bawah):

     di bawah sm - panel memenuhi lebar dan duduk DI ATAS hero, jadi trotoar di
                   bawahnya kosong dan hero bebas menyusurinya sampai tepi.
     dari sm     - panel berdiri di KANAN. Hero yang berjalan sampai tepi kanan
                   berakhir persis di bawahnya, dan dua hal yang sama-sama minta
                   diperhatikan bertumpuk di satu titik. Dibatasi, ia tinggal di
                   sisi kiri yang memang kosong - panggung terbagi jelas:
                   karakter di kiri, keterangan di kanan.

   Membatasinya juga menguntungkan geraknya sendiri: jatah scroll fase TAIL
   mengecil dan yang diambil dikembalikan ke fase KAMERA, jadi kotanya bergeser
   jauh lebih lama alih-alih membeku di paruh akhir. */
export const HERO_START = 0.015;
export const HERO_ANCHOR = 0.06;
export const HERO_REACH = 0.98;
export const HERO_REACH_WIDE = 0.42;

/* Panjang satu siklus jalan dalam lebar sprite - mengikat kaki hero ke JARAK,
   bukan waktu. Siklus berbasis waktu bikin kakinya mengayuh penuh di atas tanah
   yang nyaris diam saat digulir pelan. Angkanya sama dengan STRIDE_RATE. */
export const CYCLE_DISTANCE = 1.4;

/* Batas kecepatan panggung, fraksi halaman per detik. scrollYProgress mengikuti
   roda TANPA batas - satu lemparan trackpad bisa memindahkan seluruh halaman
   dalam sepersekian detik, dan pada tempo itu kaki hero menyapu ratusan frame.
   0.35 = lima babak tidak pernah lebih cepat dari ~2.9 detik; guliran roda
   biasa (~0.09/detik) tidak tersentuh sama sekali. */
export const MAX_SCROLL_RATE = 0.35;

/* Tab yang baru aktif lagi mengirim delta raksasa dalam satu frame; tanpa
   penjaga ini pembatas kecepatan justru melompat sejauh yang ia cegah. */
export const MAX_FRAME_MS = 64;

/* Tinggi kolom scroll = SATU-SATUNYA tuas kecepatan global; semua jarak dibagi
   rata ke dalamnya. Desktop 750vh (dari 500vh) supaya telapak hero tidak
   menyeret. HP sengaja tidak ikut: jaraknya diukur dalam lebar layar sementara
   kolomnya dalam tinggi, jadi di layar sempit-jangkung sudah jauh lebih lambat
   sejak awal. */
export const SCROLL_SPAN = "h-[500vh] md:h-[750vh]";

/* Berapa lama tanpa event scroll sebelum karakter dianggap berhenti. Scroll
   tidak punya sinyal akhir sendiri, jadi tiap event menyetel ulang hitungan ini.
   90ms sekadar menutup jeda antar event dalam satu gerakan yang sama (~16ms),
   bukan memberi karakter waktu tambahan berjalan. */
export const IDLE_DELAY = 90;

/* ---------------------------------------------------------------------------
   Kelas layout panel
   -------------------------------------------------------------------------*/

/* Ruang bawah untuk HUD. Dipasangkan dengan items-center, jadi ia juga
   menggeser titik tengah panel ke ATAS sebanyak setengahnya. Di HP sengaja
   jauh lebih besar dari tinggi HUD-nya: sepertiga bawah layar sudah terisi
   kota, jadi "tengah" yang terasa benar adalah tengah ruang langit di atasnya.
   Batas atasnya panel babak 1 (~380px) di panggung HP terpendek (~593px). */
const HUD_OFFSET = "pb-[150px] md:pb-[76px]";

/* Dari sm ke atas: padding kiri menyisakan ruang untuk sprite. Di bawah sm
   ruang itu merugikan - layar ~430px, panel jadi miring ke kanan sekaligus
   menyempit. Di HP panel dibiarkan penuh dan center; sprite-nya duduk jauh di
   bawah panel, jadi tidak ada yang perlu dihindari secara horizontal. */
export const panelWrap = cn(
  "absolute inset-0 z-20 flex items-center justify-center sm:justify-end",
  "px-4 sm:pl-28 md:pl-44 lg:pl-56 md:pr-8 lg:pr-12",
  HUD_OFFSET
);

export const actionClass =
  "group inline-flex w-fit items-center gap-2 pix-chip stage-border-soft px-4 py-2 pixel-font text-pix-xs md:text-pix-sm text-foreground transition-all duration-100 ease-pix hover:stage-border hover:stage-bg-soft hover:translate-x-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--stage-accent))]";

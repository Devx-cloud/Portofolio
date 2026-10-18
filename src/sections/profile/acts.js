/* Empat babak: Data Diri -> Experience -> Ask AI -> Contact.
   `range` = rentang opacity panelnya terhadap scrollYProgress, `snap` = titik
   plateau untuk navigasi keyboard & klik HUD.

   Babak mengikuti stage: Skills dan Projects dilebur jadi satu stage Experience,
   jadi babaknya ikut dilebur - HUD yang menyebut "02 SKILLS" sementara menu
   stage tidak lagi punya Skills akan membuat dua daftar yang berbeda nama.

   Pembagiannya dari empat dengan aturan yang sama seperti versi lima babak:
   transisi tetap 0,06 (panjang guliran yang sama untuk berganti panel), sisa
   rentangnya dibagi rata jadi plateau ~0,2 per babak. SCROLL_SPAN sengaja tidak
   dipendekkan - ia disetel untuk langkah hero, bukan jumlah babak. */
export const ACTS = [
  { id: "hero", label: "Data Diri", snap: 0, range: [0, 0.2, 0.26], fade: [1, 1, 0] },
  { id: "experience", label: "Experience", snap: 0.26, range: [0.2, 0.26, 0.47, 0.53], fade: [0, 1, 1, 0] },
  { id: "ai", label: "Ask AI", snap: 0.53, range: [0.47, 0.53, 0.74, 0.8], fade: [0, 1, 1, 0] },
  { id: "contact", label: "Contact", snap: 0.8, range: [0.74, 0.8, 1], fade: [0, 1, 1] },
];

export const SNAP_POINTS = ACTS.map((act) => act.snap);

/* Ambang pergantian babak aktif - di tengah tiap transisi, sedikit sebelum
   plateau-nya, supaya HUD berganti tepat saat panelnya mulai terbaca. */
export const ACT_THRESHOLDS = [0.23, 0.5, 0.77];

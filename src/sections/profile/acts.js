/* Lima babak: Data Diri -> Skills -> Projects -> Ask AI -> Contact.
   `range` = rentang opacity panelnya terhadap scrollYProgress, `snap` = titik
   plateau untuk navigasi keyboard & klik HUD. */
export const ACTS = [
  { id: "hero", label: "Data Diri", snap: 0, range: [0, 0.16, 0.22], fade: [1, 1, 0] },
  { id: "skills", label: "Skills", snap: 0.22, range: [0.16, 0.22, 0.36, 0.42], fade: [0, 1, 1, 0] },
  { id: "projects", label: "Projects", snap: 0.42, range: [0.36, 0.42, 0.56, 0.62], fade: [0, 1, 1, 0] },
  { id: "ai", label: "Ask AI", snap: 0.62, range: [0.56, 0.62, 0.76, 0.82], fade: [0, 1, 1, 0] },
  { id: "contact", label: "Contact", snap: 0.82, range: [0.76, 0.82, 1], fade: [0, 1, 1] },
];

export const SNAP_POINTS = ACTS.map((act) => act.snap);

/* Ambang pergantian babak aktif - sedikit lebih awal dari plateau-nya supaya
   HUD berganti tepat saat panelnya mulai terbaca. */
export const ACT_THRESHOLDS = [0.19, 0.39, 0.59, 0.79];

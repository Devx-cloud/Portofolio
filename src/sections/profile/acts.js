/* Empat babak: Data Diri -> Experience -> Ask AI -> Contact.

   Babak mengikuti stage: Skills dan Projects dilebur jadi satu stage Experience,
   jadi babaknya ikut dilebur - HUD yang menyebut "02 SKILLS" sementara menu
   stage tidak lagi punya Skills akan membuat dua daftar yang berbeda nama. */
export const ACTS = [
  { id: "hero", label: "Data Diri" },
  { id: "experience", label: "Experience" },
  { id: "ai", label: "Ask AI" },
  { id: "contact", label: "Contact" },
];

/* Panel babak tersusun setinggi satu panggung per babak dan digeser linear oleh
   scroll (lihat panelY di useStageCamera). Karena jaraknya sama, posisi tiap babak
   cukup dihitung dari urutannya: 0, 1/3, 2/3, 1. Dipakai navigasi keyboard, klik
   HUD, dan fokus keyboard. */
const LAST_ACT = ACTS.length - 1;
export const ACT_STOPS = ACTS.map((_, i) => i / LAST_ACT);

/* Babak aktif = panel yang paling dekat ke posisinya, jadi HUD berganti tepat
   saat dua panel sama-sama setengah jalan. */
export const actAt = (progress) => Math.round(progress * LAST_ACT);

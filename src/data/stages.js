import { lazy } from "react";

/*
 * Setiap stage dimuat saat dibutuhkan, bukan ikut bundel awal.
 *
 * Dulu keempat Section diimpor statis di sini, jadi Title Screen - yang cuma
 * menampilkan menu - mengunduh seluruh Profile, Experience, Assistant, dan
 * Contact sekaligus. Terukur: ~455 KB JS diunduh di setiap rute dan Title
 * Screen hanya menjalankan 30% darinya.
 *
 * Section diekspor sebagai named export, sedangkan lazy() menuntut default -
 * makanya dipetakan ulang di lazySection.
 */
const loaders = {
  profile: () => import("@/sections/profile/ProfileSection"),
  experience: () => import("@/sections/experience/ExperienceSection"),
  assistant: () => import("@/sections/assistant/AssistantSection"),
  contact: () => import("@/sections/contact/ContactSection"),
};

const lazySection = (id, exportName) =>
  lazy(() => loaders[id]().then((module) => ({ default: module[exportName] })));

/* Mulai mengunduh chunk sebuah stage tanpa menampilkannya. Dipanggil saat
   pengunjung menyorot menu (hover, fokus, sentuh) - waktu antara menyorot dan
   mengklik cukup untuk chunk kecil ini tiba, jadi stage terbuka tanpa jeda.
   Aman dipanggil berulang: modul yang sudah dimuat langsung dikembalikan. */
export const preloadStage = (id) => {
  loaders[id]?.().catch(() => {
    /* Gagal di sini tidak fatal: klik sebenarnya akan mencoba lagi dan
       menampilkan kegagalannya di tempat yang semestinya. */
  });
};

/*
 * Daftar stage - satu-satunya sumber untuk route, menu Title Screen, dan
 * pemilih stage di bar atas.
 *
 *   desc   -> teks dialog di Title Screen (jaga panjangnya tetap mirip)
 *   badge  -> label di pojok kanan atas tiap stage. Ditaruh di sini, bukan di
 *             dalam section, supaya satu stage punya satu nama saja.
 *   accent -> hue identitas stage, dipasang sebagai --stage-accent.
 */
export const stages = [
  {
    id: "profile",
    path: "/profile",
    badge: "Titik Awal · Data Diri",
    label: "Profile",
    desc: "Data diri, fokus teknologi, dan cerita singkat di balik layar.",
    accent: "var(--primary)",
    Section: lazySection("profile", "ProfileSection"),
  },
  {
    id: "experience",
    path: "/experience",
    badge: "Loadout · Quest Log",
    label: "Experience",
    desc: "Skill yang saya bawa dan proyek nyata tempat semuanya dipakai.",
    accent: "var(--primary)",
    Section: lazySection("experience", "ExperienceSection"),
  },
  {
    id: "assistant",
    path: "/assistant",
    badge: "Terminal · Ask AI",
    label: "Ask AI",
    desc: "Tanya apa saja soal profil ini. Dijawab asisten bertenaga Gemini.",
    accent: "var(--primary)",
    Section: lazySection("assistant", "AssistantSection"),
  },
  {
    id: "contact",
    path: "/contact",
    badge: "Batas Akhir · Kontak",
    label: "Contact",
    desc: "Jalur langsung untuk kolaborasi, tawaran kerja, atau diskusi santai.",
    accent: "var(--primary)",
    Section: lazySection("contact", "ContactSection"),
  },
];

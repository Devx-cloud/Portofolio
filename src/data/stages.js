import { ProfileSection } from "@/sections/profile/ProfileSection";
import { SkillSection } from "@/sections/skills/SkillSection";
import { ProjectSection } from "@/sections/projects/ProjectSection";
import { AssistantSection } from "@/sections/assistant/AssistantSection";
import { ContactSection } from "@/sections/contact/ContactSection";

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
    Section: ProfileSection,
  },
  {
    id: "skills",
    path: "/skills",
    badge: "Status · Kemampuan",
    label: "Skills",
    desc: "Peta kemampuan: Laravel, Flutter, React, sampai tools harian.",
    accent: "var(--primary)",
    Section: SkillSection,
  },
  {
    id: "projects",
    path: "/projects",
    badge: "Showcase · Karya",
    label: "Projects",
    desc: "Proyek pilihan, dari computer vision di browser sampai pipeline AI.",
    accent: "var(--primary)",
    Section: ProjectSection,
  },
  {
    id: "assistant",
    path: "/assistant",
    badge: "Terminal · Ask AI",
    label: "Ask AI",
    desc: "Tanya apa saja soal profil ini. Dijawab asisten bertenaga Gemini.",
    accent: "var(--primary)",
    Section: AssistantSection,
  },
  {
    id: "contact",
    path: "/contact",
    badge: "Batas Akhir · Kontak",
    label: "Contact",
    desc: "Jalur langsung untuk kolaborasi, tawaran kerja, atau diskusi santai.",
    accent: "var(--primary)",
    Section: ContactSection,
  },
];

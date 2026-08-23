import { ProfileSection } from "../components/ProfileSection";
import { SkillSection } from "../components/SkillSection";
import { ProjectSection } from "../components/ProjectSection";
import { AssistantSection } from "../components/AssistantSection";
import { ContactSection } from "../components/ContactSection";

/*
 * desc   -> teks dialog di Title Screen (jaga panjangnya tetap mirip)
 * accent -> hue identitas tiap stage, dipasang sebagai --stage-accent.
 *           Ini yang bikin palet tidak berat sebelah ke satu warna saja.
 */
export const stages = [
  {
    id: "profile",
    path: "/profile",
    label: "Profile",
    desc: "Data diri, fokus teknologi, dan cerita singkat di balik layar.",
    accent: "var(--primary)",
    Section: ProfileSection,
  },
  {
    id: "skills",
    path: "/skills",
    label: "Skills",
    desc: "Peta kemampuan: Laravel, Flutter, React, sampai tools harian.",
    accent: "var(--primary)",
    Section: SkillSection,
  },
  {
    id: "projects",
    path: "/projects",
    label: "Projects",
    desc: "Proyek pilihan, dari computer vision di browser sampai pipeline AI.",
    accent: "var(--primary)",
    Section: ProjectSection,
  },
  {
    id: "assistant",
    path: "/assistant",
    label: "Ask AI",
    desc: "Tanya apa saja soal profil ini. Dijawab asisten bertenaga Gemini.",
    accent: "var(--primary)",
    Section: AssistantSection,
  },
  {
    id: "contact",
    path: "/contact",
    label: "Contact",
    desc: "Jalur langsung untuk kolaborasi, tawaran kerja, atau diskusi santai.",
    accent: "var(--primary)",
    Section: ContactSection,
  },
];

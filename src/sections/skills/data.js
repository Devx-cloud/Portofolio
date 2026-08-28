import { FaCss3Alt, FaGitAlt, FaHtml5, FaJava, FaLaravel, FaPython, FaReact } from "react-icons/fa";
import {
  SiAndroidstudio,
  SiFlutter,
  SiJavascript,
  SiMysql,
  SiPhp,
  SiTailwindcss,
} from "react-icons/si";

/* Tier dipakai sebagai "stat bar" ala RPG - sesuaikan kalau porsinya berubah. */
export const TIERS = {
  core: { label: "Utama", blocks: 3 },
  support: { label: "Pendukung", blocks: 2 },
  explore: { label: "Eksplorasi", blocks: 1 },
};

/* Warna dari token --brand-* (lihat index.css), bukan hex mentah, supaya ikut
   menyesuaikan tema. Ikon disimpan sebagai KOMPONEN agar class-nya bisa berubah
   mengikuti state - elemen yang sudah dirender class-nya terkunci. */
export const skills = [
  // Web
  { name: "Laravel", Icon: FaLaravel, color: "text-brand-laravel", category: "web", tier: "core" },
  { name: "PHP", Icon: SiPhp, color: "text-brand-php", category: "web", tier: "core" },
  { name: "JavaScript", Icon: SiJavascript, color: "text-brand-js", category: "web", tier: "core" },
  { name: "HTML", Icon: FaHtml5, color: "text-brand-html", category: "web", tier: "core" },
  { name: "CSS", Icon: FaCss3Alt, color: "text-brand-css", category: "web", tier: "core" },
  { name: "Tailwind CSS", Icon: SiTailwindcss, color: "text-brand-tailwind", category: "web", tier: "core" },
  { name: "MySQL", Icon: SiMysql, color: "text-brand-mysql", category: "web", tier: "support" },
  { name: "ReactJs", Icon: FaReact, color: "text-brand-react", category: "web", tier: "support" },

  // Mobile
  { name: "Flutter", Icon: SiFlutter, color: "text-brand-flutter", category: "app", tier: "core" },
  { name: "Android Studio", Icon: SiAndroidstudio, color: "text-brand-android", category: "app", tier: "support" },
  { name: "Git", Icon: FaGitAlt, color: "text-brand-git", category: "app", tier: "support" },
  { name: "Java", Icon: FaJava, color: "text-brand-java", category: "app", tier: "explore" },

  // AI / Data
  { name: "Python", Icon: FaPython, color: "text-brand-python", category: "ai", tier: "explore" },
];

export const categories = [
  { id: "all", label: "Semua" },
  { id: "web", label: "Web" },
  { id: "app", label: "Mobile" },
  { id: "ai", label: "AI / Data" },
];

export const countFor = (id) =>
  id === "all" ? skills.length : skills.filter((s) => s.category === id).length;

import { FaCss3Alt, FaGitAlt, FaHtml5, FaJava, FaLaravel, FaPython, FaReact } from "react-icons/fa";
import {
  SiAndroidstudio,
  SiFlutter,
  SiJavascript,
  SiMysql,
  SiPhp,
  SiTailwindcss,
} from "react-icons/si";

/* Tiga tingkat penguasaan. Ditulis sebagai label, bukan persentase:
   "React 72%" adalah angka yang tidak bisa dipertanggungjawabkan, sementara
   "Pendukung" jujur dan langsung terbaca. */
export const TIERS = {
  core: { label: "Utama", weight: 3 },
  support: { label: "Pendukung", weight: 2 },
  explore: { label: "Eksplorasi", weight: 1 },
};

/* Ikon disimpan sebagai KOMPONEN, bukan elemen jadi: class-nya perlu berubah
   mengikuti state hover, dan elemen yang sudah dirender class-nya terkunci.

   `color` menunjuk token --color-brand-* di index.css, bukan hex mentah. */
export const skills = [
  { name: "Laravel", Icon: FaLaravel, color: "text-brand-laravel", group: "Web", tier: "core", note: "Kerangka utama untuk hampir semua proyek web saya." },
  { name: "PHP", Icon: SiPhp, color: "text-brand-php", group: "Web", tier: "core", note: "Bahasa di balik Laravel, dipakai sejak awal belajar backend." },
  { name: "JavaScript", Icon: SiJavascript, color: "text-brand-js", group: "Web", tier: "core", note: "Perekat segalanya di browser, dari DOM sampai animasi." },
  { name: "HTML", Icon: FaHtml5, color: "text-brand-html", group: "Web", tier: "core", note: "Struktur dokumen - dasar yang tidak pernah ditinggalkan." },
  { name: "CSS", Icon: FaCss3Alt, color: "text-brand-css", group: "Web", tier: "core", note: "Tata letak dan gaya, termasuk seluruh tipografi situs ini." },
  { name: "Tailwind CSS", Icon: SiTailwindcss, color: "text-brand-tailwind", group: "Web", tier: "core", note: "Utility-first. Halaman yang sedang kamu gulung memakainya." },
  { name: "MySQL", Icon: SiMysql, color: "text-brand-mysql", group: "Data", tier: "support", note: "Rancang skema dan tulis query untuk aplikasi Laravel." },
  { name: "React", Icon: FaReact, color: "text-brand-react", group: "Web", tier: "support", note: "Antarmuka berbasis komponen - termasuk halaman ini." },
  { name: "Flutter", Icon: SiFlutter, color: "text-brand-flutter", group: "Mobile", tier: "core", note: "Aplikasi mobile lintas platform dari satu basis kode." },
  { name: "Android Studio", Icon: SiAndroidstudio, color: "text-brand-android", group: "Mobile", tier: "support", note: "Emulator, build, dan debug untuk sisi Android." },
  { name: "Git", Icon: FaGitAlt, color: "text-brand-git", group: "Tooling", tier: "support", note: "Riwayat, cabang, dan kolaborasi - alur kerja harian." },
  { name: "Java", Icon: FaJava, color: "text-brand-java", group: "Mobile", tier: "explore", note: "Dasar OOP dan pemrograman Android native." },
  { name: "Python", Icon: FaPython, color: "text-brand-python", group: "Data", tier: "explore", note: "Skrip pengolah gambar dan eksplorasi model AI." },
];

/* Daftar nama untuk pita marquee di atas bagian Skills. Diturunkan dari
   `skills` supaya menambah satu skill tidak menuntut edit di dua tempat. */
export const skillNames = skills.map((s) => s.name);

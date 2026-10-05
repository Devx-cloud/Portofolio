import { FaCss3Alt, FaGitAlt, FaHtml5, FaJava, FaLaravel, FaPython, FaReact } from "react-icons/fa";
import {
  SiAlpinedotjs,
  SiAndroidstudio,
  SiFlutter,
  SiJavascript,
  SiMysql,
  SiPhp,
  SiTailwindcss,
  SiThreedotjs,
} from "react-icons/si";
import { CATEGORIES, PROJECTS, SKILLS, TIER_LABEL } from "@shared/portfolio";

/* Skill dan project dulu dua stage dengan dua daftar teknologi sendiri-sendiri:
   skill punya nama, project punya tag. Keduanya lepas sinkron diam-diam - Alpine
   dan Three.js tampil di kartu Loka Pura tapi tidak pernah ada di layar status.

   Sekarang satu sumber: project MERUJUK skill lewat id. Itu yang membuat kedua
   bagian halaman ini bisa saling menyorot - tanpa id bersama, "project mana yang
   memakai Laravel" cuma bisa ditebak dari mencocokkan teks.

   Isinya sendiri (nama, tier, deskripsi, project) ada di shared/portfolio.js,
   dibaca juga oleh asisten AI di api/. Berkas ini hanya menambahkan yang khas
   tampilan: ikon dan warna merek. */

/* Tier disebut dengan KATA saja ("Utama", "Pendukung", "Eksplorasi").
   Dulu tiap tier juga punya `blocks`, jumlah balok untuk menggambarnya sebagai
   stat bar ala RPG - di panel detail sebagai bar, di pojok tiap petak sebagai
   tiga pip, dan di kolom teks sebagai legenda. Ketiganya dibuang: mengukur
   kemahiran dalam angka menjanjikan ketepatan yang tidak bisa dipertanggung-
   jawabkan, dan bersama-sama mereka membuat satu keterangan tampil tiga kali. */
export { TIER_LABEL };

/* Warna dari token --brand-* (lihat index.css), bukan hex mentah, supaya ikut
   menyesuaikan tema. Ikon disimpan sebagai KOMPONEN agar class-nya bisa berubah
   mengikuti state - elemen yang sudah dirender class-nya terkunci. */
const BRAND = {
  laravel: { Icon: FaLaravel, color: "text-brand-laravel" },
  php: { Icon: SiPhp, color: "text-brand-php" },
  js: { Icon: SiJavascript, color: "text-brand-js" },
  html: { Icon: FaHtml5, color: "text-brand-html" },
  css: { Icon: FaCss3Alt, color: "text-brand-css" },
  tailwind: { Icon: SiTailwindcss, color: "text-brand-tailwind" },
  mysql: { Icon: SiMysql, color: "text-brand-mysql" },
  react: { Icon: FaReact, color: "text-brand-react" },
  alpine: { Icon: SiAlpinedotjs, color: "text-brand-alpine" },
  three: { Icon: SiThreedotjs, color: "text-brand-three" },
  flutter: { Icon: SiFlutter, color: "text-brand-flutter" },
  android: { Icon: SiAndroidstudio, color: "text-brand-android" },
  git: { Icon: FaGitAlt, color: "text-brand-git" },
  java: { Icon: FaJava, color: "text-brand-java" },
  python: { Icon: FaPython, color: "text-brand-python" },
};

/* Urutannya = urutan ikon terbuka saat digulir (lihat SKILLS). */
export const skills = SKILLS.map((skill) => ({ ...skill, ...BRAND[skill.id] }));

export const categories = CATEGORIES;

/* Papan skill dikelompokkan per kategori, dan urutan bukanya = urutan `skills`.
   `start` = indeks skill pertama kelompok itu di `skills`, supaya papan bisa
   menghitung berapa ikon kelompok ini yang sudah terbuka dari satu angka saja. */
export const skillGroups = categories.map((category) => {
  const members = skills.filter((s) => s.category === category.id);
  return { ...category, skills: members, start: skills.indexOf(members[0]) };
});

export const projects = PROJECTS;

export const skillById = Object.fromEntries(skills.map((s) => [s.id, s]));

/* Salah ketik id di data akan membuat ikon atau chip skill-nya lenyap tanpa
   suara. Diperiksa sekali saat modul dimuat, hanya di mode dev. */
if (import.meta.env.DEV) {
  for (const skill of SKILLS) {
    if (!BRAND[skill.id]) console.error(`[experience] skill "${skill.id}" belum punya ikon di BRAND`);
  }
  for (const project of projects) {
    for (const id of project.skills) {
      if (!skillById[id]) console.error(`[experience] project "${project.id}" merujuk skill tak dikenal: "${id}"`);
    }
  }
}

export const projectsUsing = (skillId) => projects.filter((p) => p.skills.includes(skillId));

export const categoryLabel = (id) => categories.find((c) => c.id === id)?.label ?? id;

export const pad2 = (n) => String(n).padStart(2, "0");

export const hasLink = (url) => Boolean(url) && url !== "#";

export const linkClass =
  "pixel-font inline-flex items-center gap-2 border-2 px-3 py-2 text-pix-sm uppercase transition-all duration-100 ease-pix focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

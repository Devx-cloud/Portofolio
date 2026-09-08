import { FaCss3Alt, FaHtml5, FaLaravel } from "react-icons/fa";
import { SiAlpinedotjs, SiJavascript, SiTailwindcss, SiThreedotjs } from "react-icons/si";

/* Warna merek dari token --color-brand-* (lihat index.css), sama seperti Skills. */
export const tagIcons = {
  html: { icon: FaHtml5, color: "text-brand-html", label: "HTML" },
  css: { icon: FaCss3Alt, color: "text-brand-css", label: "CSS" },
  js: { icon: SiJavascript, color: "text-brand-js", label: "JavaScript" },
  laravel: { icon: FaLaravel, color: "text-brand-laravel", label: "Laravel" },
  alpine: { icon: SiAlpinedotjs, color: "text-brand-alpine", label: "Alpine.js" },
  three: { icon: SiThreedotjs, color: "text-brand-three", label: "Three.js" },
  tailwind: { icon: SiTailwindcss, color: "text-brand-tailwind", label: "Tailwind" },
};

/* id harus unik - dipakai sebagai React key di tumpukan kartu yang saling
   menimpa; key kembar membuat dua kartu berbagi satu posisi sticky. */
export const projects = [
  {
    id: "hand-gesture",
    title: "Hand Gesture",
    year: "2025",
    role: "Computer Vision · Browser",
    desc: "Aplikasi deteksi gestur tangan berbasis computer vision yang mengenali pola tangan secara real-time untuk membuka tautan tertentu tanpa sentuhan. Dibangun dengan HTML, CSS, dan JavaScript murni sebagai eksplorasi interaksi berbasis kamera.",
    image: "/projects/hand.webp",
    tags: ["html", "css", "js"],
    demoUrl: "#",
    githubUrl: "https://github.com/Devx-cloud/gesture-hand",
  },
  {
    id: "loka-pura",
    title: "Loka Pura",
    year: "2025",
    role: "Platform AI · Laravel",
    desc: "Platform AI yang menghidupkan arsitektur pura Bali - mengubah foto menjadi video dinamis dan model 3D, sekaligus merestorasi kenangan lama dengan akurasi tinggi. Dibangun dengan Laravel, Alpine.js, Three.js, dan Tailwind CSS.",
    image: "/projects/lokapura.webp",
    tags: ["laravel", "alpine", "three", "tailwind"],
    demoUrl: "#",
    githubUrl: "https://github.com/Devx-cloud/PuraLoka",
  },
];

/* "#" dipakai sebagai penanda "belum ada demo" di data di atas. Dicek lewat
   satu helper supaya tombolnya tidak pernah tampil sebagai tautan mati. */
export const hasLink = (url) => Boolean(url) && url !== "#";

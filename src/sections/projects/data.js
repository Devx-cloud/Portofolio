import { FaCss3Alt, FaHtml5, FaLaravel } from "react-icons/fa";
import { SiAlpinedotjs, SiJavascript, SiTailwindcss, SiThreedotjs } from "react-icons/si";

/* Warna merek dari token --brand-* (lihat index.css), sama seperti stage Skills. */
export const tagIcons = {
  html: { icon: FaHtml5, color: "text-brand-html" },
  css: { icon: FaCss3Alt, color: "text-brand-css" },
  js: { icon: SiJavascript, color: "text-brand-js" },
  laravel: { icon: FaLaravel, color: "text-brand-laravel" },
  alpine: { icon: SiAlpinedotjs, color: "text-brand-alpine" },
  three: { icon: SiThreedotjs, color: "text-brand-three" },
  tailwind: { icon: SiTailwindcss, color: "text-brand-tailwind" },
};

/* id harus unik - dipakai sebagai key AnimatePresence; kembar = transisi mati. */
export const projects = [
  {
    id: 1,
    title: "Hand Gesture",
    year: "2025",
    desc: "Aplikasi deteksi gestur tangan berbasis computer vision yang mengenali pola tangan secara real-time untuk membuka tautan tertentu tanpa sentuhan. Dibangun dengan HTML, CSS, dan JavaScript murni sebagai eksplorasi interaksi berbasis kamera.",
    image: "/projects/hand.webp",
    tags: ["html", "css", "js"],
    demoUrl: "#",
    githubUrl: "https://github.com/Devx-cloud/gesture-hand",
  },
  {
    id: 2,
    title: "Loka Pura",
    year: "2025",
    desc: "Platform AI yang menghidupkan arsitektur pura Bali — mengubah foto menjadi video dinamis dan model 3D, sekaligus merestorasi kenangan lama dengan akurasi tinggi. Dibangun dengan Laravel, Alpine.js, Three.js, dan Tailwind CSS.",
    image: "/projects/lokapura.webp",
    tags: ["laravel", "alpine", "three", "tailwind"],
    demoUrl: "#",
    githubUrl: "https://github.com/Devx-cloud/PuraLoka",
  },
];

export const total = projects.length;

export const hasLink = (url) => Boolean(url) && url !== "#";

export const linkClass =
  "pixel-font inline-flex items-center gap-2 border-2 px-3 py-2 text-pix-xs uppercase transition-all duration-100 ease-pix focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

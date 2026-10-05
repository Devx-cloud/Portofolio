/*
 * Sumber tunggal data portofolio - dibaca client (src/) DAN server (api/).
 *
 * Dulu ada dua salinan yang lepas sinkron: skill dan project hidup di
 * src/sections/experience/data.js, sementara asisten AI membaca api/profile.js
 * yang isinya masih placeholder template. Akibatnya asisten yang dijanjikan
 * "menjawab berdasarkan profil ini" tidak tahu satu pun project atau skill.
 *
 * Berkas ini SENGAJA murni data: tanpa React, tanpa ikon, tanpa import.meta.env.
 * Fungsi serverless Node tidak bisa memuat komponen ikon, dan ikon/warna merek
 * ditempelkan berdasarkan id di src/sections/experience/data.js.
 *
 * Mengubah isi di sini otomatis mengubah situs DAN jawaban asisten. Yang belum
 * ada (pendidikan, riwayat kerja) sengaja tidak diisi - mengarang data lebih
 * buruk daripada mengaku belum tersedia.
 */

export const PROFILE = {
  name: "Deva Surya",
  role: "Web & Mobile Developer",
  location: "Tabanan, Bali — Indonesia",
  email: "devx.surya@gmail.com",
  cvPath: "/cv/cv-1.pdf",
  github: "https://github.com/Devx-cloud",
  instagram: "https://www.instagram.com/devx.sun/",
  linkedin: "https://www.linkedin.com/in/deva-surya-5a6568380/",
  availability: "Terbuka untuk proyek dan kolaborasi.",
  about:
    "Saya Deva Surya, seorang developer yang ahli dalam pengembangan Web menggunakan Laravel dan Aplikasi Mobile dengan Flutter. Saya memiliki pengalaman kuat dalam manajemen data, siap membangun aplikasi yang efisien dan terstruktur. Di luar pekerjaan, saya selalu bersemangat menyambut tantangan proyek baru. Komitmen saya adalah mengubah ide menjadi solusi digital yang inovatif dan andal, serta terus berkembang di dunia teknologi. Salah satu cara favorit saya untuk tetap kreatif adalah dengan mengeksplorasi teknologi baru dan berkontribusi pada proyek open-source.",
  services: [
    "Pembuatan Website Custom",
    "Pembuatan Aplikasi Mobile (Android & iOS)",
    "API Development & Integrasi",
  ],
};

export const CATEGORIES = [
  { id: "web", label: "Web" },
  { id: "app", label: "Mobile" },
  { id: "ai", label: "AI / Data" },
];

/* Label tier. Jumlah blok stat bar-nya urusan tampilan, ada di data.js. */
export const TIER_LABEL = {
  core: "Utama",
  support: "Pendukung",
  explore: "Eksplorasi",
};

/* Urutannya = urutan ikon terbuka di papan skill, dan WAJIB tetap dikelompokkan
   per kategori - papan membaca kelompoknya sebagai rentang yang bersambung. */
export const SKILLS = [
  // Web
  { id: "laravel", name: "Laravel", category: "web", tier: "core", desc: "Kerangka utama untuk hampir semua proyek web saya." },
  { id: "php", name: "PHP", category: "web", tier: "core", desc: "Bahasa di balik Laravel, dipakai sejak awal belajar backend." },
  { id: "js", name: "JavaScript", category: "web", tier: "core", desc: "Perekat segalanya di browser, dari DOM sampai animasi." },
  { id: "html", name: "HTML", category: "web", tier: "core", desc: "Struktur dokumen - dasar yang tidak pernah ditinggalkan." },
  { id: "css", name: "CSS", category: "web", tier: "core", desc: "Tata letak dan gaya, termasuk seluruh chrome pixel situs ini." },
  { id: "tailwind", name: "Tailwind CSS", category: "web", tier: "core", desc: "Utility-first. Portofolio yang sedang kamu buka memakainya." },
  { id: "mysql", name: "MySQL", category: "web", tier: "support", desc: "Rancang skema dan tulis query untuk aplikasi Laravel." },
  { id: "react", name: "ReactJs", category: "web", tier: "support", desc: "Antarmuka berbasis komponen - termasuk halaman ini." },
  { id: "alpine", name: "Alpine.js", category: "web", tier: "explore", desc: "Interaksi ringan di halaman Laravel tanpa perlu SPA penuh." },
  { id: "three", name: "Three.js", category: "web", tier: "explore", desc: "Menampilkan model 3D langsung di browser." },

  // Mobile
  { id: "flutter", name: "Flutter", category: "app", tier: "core", desc: "Aplikasi mobile lintas platform dari satu basis kode." },
  { id: "android", name: "Android Studio", category: "app", tier: "support", desc: "Emulator, build, dan debug untuk sisi Android." },
  { id: "git", name: "Git", category: "app", tier: "support", desc: "Riwayat, cabang, dan kolaborasi - alur kerja harian." },
  { id: "java", name: "Java", category: "app", tier: "explore", desc: "Dasar OOP dan pemrograman Android native." },

  // AI / Data
  { id: "python", name: "Python", category: "ai", tier: "explore", desc: "Skrip pengolah gambar dan eksplorasi model AI." },
];

/* id harus unik - dipakai sebagai key dan sasaran scroll di halaman Experience.
   `skills` berisi id dari SKILLS di atas, bukan nama bebas.
   demoUrl "#" = belum ada demo publik. */
export const PROJECTS = [
  {
    id: "hand-gesture",
    title: "Hand Gesture",
    year: "2025",
    role: "Computer Vision · Browser",
    desc: "Aplikasi deteksi gestur tangan berbasis computer vision yang mengenali pola tangan secara real-time untuk membuka tautan tertentu tanpa sentuhan. Dibangun dengan HTML, CSS, dan JavaScript murni sebagai eksplorasi interaksi berbasis kamera.",
    image: "/projects/hand.webp",
    skills: ["html", "css", "js"],
    demoUrl: "#",
    githubUrl: "https://github.com/Devx-cloud/gesture-hand",
  },
  {
    id: "loka-pura",
    title: "Loka Pura",
    year: "2025",
    role: "Platform AI · Laravel",
    desc: "Platform AI yang menghidupkan arsitektur pura Bali — mengubah foto menjadi video dinamis dan model 3D, sekaligus merestorasi kenangan lama dengan akurasi tinggi. Dibangun dengan Laravel, Alpine.js, Three.js, dan Tailwind CSS.",
    image: "/projects/lokapura.webp",
    skills: ["laravel", "alpine", "three", "tailwind"],
    demoUrl: "#",
    githubUrl: "https://github.com/Devx-cloud/PuraLoka",
  },
];

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
 * ada (riwayat kerja, tarif) sengaja tidak diisi - mengarang data lebih buruk
 * daripada mengaku belum tersedia. Daftarnya ada di NOT_LISTED di bawah.
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
  /* Field di bawah ini (sampai careerGoals) belum tampil di situs - sejauh ini
     hanya asisten AI yang membacanya. Ditulis sebagai frasa utuh karena dibaca
     apa adanya. */

  // Terbaru dulu.
  education: [
    {
      school: "INSTIKI (Institut Bisnis dan Teknologi Indonesia)",
      major: "Manajemen Data dan Informasi",
      status: "sedang berkuliah",
      period: "masuk 2024, target lulus 2028",
    },
    {
      school: "SMK Negeri 2 Tabanan",
      major: "Rekayasa Perangkat Lunak (RPL)",
      status: "lulus",
      period: "2024",
    },
  ],
  experience: [
    {
      place: "PT. Dimata Soraya Jayate",
      role: "Mobile Frontend Developer",
      type: "praktik kerja lapangan (PKL) saat SMK",
    },
  ],
  activities:
    "Terlibat dalam penelitian dosen di kampus. Sempat ikut beberapa organisasi kampus, tetapi tidak lama karena fokus ke penelitian tersebut.",
  devHistory:
    "Sekitar 2 tahun membangun aplikasi. Framework-nya berganti sesuai kebutuhan proyek: Laravel, Symfony, atau Next.js.",
  tools: ["Docker", "Postman", "Google Antigravity", "Android Studio"],
  languages: "Bahasa Indonesia. Bahasa Inggris masih terus dikembangkan.",
  work: {
    type: "Freelance",
    mode: "Remote",
    schedule: "Cukup padat karena kuliah, tetapi tetap bisa diatur. Hubungi lewat email untuk membicarakannya.",
    rate: "Dibahas sesuai kebutuhan proyek.",
    duration: "Tergantung jenis website atau aplikasi yang dikerjakan.",
  },
  careerGoals: ["AI Engineer", "peneliti", "profesor"],
};

/* Yang belum ada. Asisten AI diminta mengakuinya terus terang, bukan menebak -
   hapus dari sini begitu datanya ditambahkan di atas. */
export const NOT_LISTED = [
  "nomor telepon atau WhatsApp (untuk saat ini kontak lewat email)",
  "demo publik untuk proyek-proyeknya",
  "proyek mobile Flutter yang dipamerkan (belum ada untuk saat ini)",
];

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
  { id: "nextjs", name: "Next.js", category: "web", tier: "support", desc: "Framework React full-stack - dipakai untuk Vulpes AI." },
  { id: "alpine", name: "Alpine.js", category: "web", tier: "explore", desc: "Interaksi ringan di halaman Laravel tanpa perlu SPA penuh." },
  { id: "three", name: "Three.js", category: "web", tier: "explore", desc: "Menampilkan model 3D langsung di browser." },
  { id: "typescript", name: "TypeScript", category: "web", tier: "explore", desc: "JavaScript bertipe, supaya kesalahan ketahuan sebelum dijalankan." },
  { id: "symfony", name: "Symfony", category: "web", tier: "explore", desc: "Framework PHP alternatif saat proyek memintanya." },

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
    desc: "Aplikasi deteksi gestur tangan berbasis computer vision yang mengenali pola tangan secara real-time untuk membuka tautan tertentu tanpa sentuhan. Dibangun dengan HTML, CSS, dan JavaScript murni sebagai eksplorasi interaksi berbasis kamera. Pernah dipakai untuk membuka lomba di kampus dan sebuah acara di luar kampus.",
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
    desc: "Platform AI yang menghidupkan arsitektur pura Bali — mengubah foto menjadi video dinamis dan model 3D, sekaligus merestorasi kenangan lama dengan akurasi tinggi. Masuk Top 50 nasional di lomba Budaya Go. Dibangun dengan Laravel, Alpine.js, Three.js, dan Tailwind CSS.",
    image: "/projects/lokapura.webp",
    skills: ["laravel", "alpine", "three", "tailwind"],
    demoUrl: "#",
    githubUrl: "https://github.com/Devx-cloud/PuraLoka",
  },
  {
    id: "vulpes-ai",
    title: "Vulpes AI",
    year: "2026",
    role: "AI Gateway · Next.js",
    desc: "Gateway AI yang menyatukan banyak API key Gemini menjadi satu endpoint kompatibel OpenAI, lengkap dengan UI chat bernama Vulpes. Kalau satu key habis kuota, gateway otomatis pindah ke key berikutnya. Sekarang menjadi mesin di balik asisten AI portofolio ini. Dibangun dengan Next.js, React, dan TypeScript.",
    image: "/projects/vulpes-ai.webp",
    skills: ["nextjs", "react", "typescript"],
    demoUrl: "#",
    githubUrl: "https://github.com/Devx-cloud/Vulpes-AI",
  },
];

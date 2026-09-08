import { Github, Instagram, Linkedin } from "lucide-react";

/* Identitas dipakai di hampir semua bagian (Hero, About, Contact, Footer).
   Ditulis sekali supaya tidak ada dua versi yang bisa lepas sinkron. */
export const NAME = { first: "Deva", last: "Surya" };
export const ROLE = "Web & Mobile Developer";
export const CONTACT_EMAIL = "devx.surya@gmail.com";
export const LOCATION = "Tabanan, Bali";
export const COUNTRY = "Indonesia";
export const TIMEZONE = "GMT+8";
export const CV_URL = "/cv/cv-1.pdf";
export const GITHUB_URL = "https://github.com/Devx-cloud";
export const AVAILABILITY = "Terbuka untuk proyek & kolaborasi";
/* Versi pendek untuk masthead. Bar setinggi 56px sudah menampung nama dan
   lokasi; kalimat penuh di sana akan membungkus ke baris kedua di layar
   sempit dan merusak tinggi barnya. */
export const AVAILABILITY_SHORT = "Tersedia";

/* ---- Foto diri ----
   GANTI INI dengan fotomu: taruh berkasnya di public/ (mis. public/potret.webp)
   lalu ubah satu baris di bawah. Yang sekarang terpasang cuma pelat framing
   sementara - lihat catatan di dalam public/potret.svg.

   Rasio yang dipakai tata letaknya 4:5 (potret). Foto dengan rasio lain tetap
   aman karena bingkainya object-cover, tapi wajah yang tidak berada di sepertiga
   atas gambar akan terpotong - potong dulu fotonya kalau perlu.

   WebP di sekitar 900x1125 px sudah lebih dari cukup; di layar 4K pun bingkainya
   tidak pernah melebihi ~560px. */
export const PORTRAIT = "/potret.svg";

/* Keterangan foto. Ditulis seperti kredit foto di majalah, bukan sebagai
   kalimat - ia mendampingi gambar, tidak menjelaskannya. */
export const PORTRAIT_CAPTION = "Tabanan, Bali — 2026";

/* Judul Hero, dipecah per baris SECARA MANUAL.
   Bukan hasil word-wrap: tiap baris adalah satu pembungkus mask sendiri
   (lihat MaskLines), jadi titik potongnya harus ditentukan di sini - kalau
   diserahkan ke word-wrap, jumlah barisnya berubah mengikuti lebar layar dan
   animasi berjenjangnya ikut berubah acak. */
export const HERO_LINES = [NAME.first, NAME.last];

/* Kalimat pengantar di Hero. Satu kalimat pendek, dan panjangnya diatur
   ketat karena dua alasan: ia dibaca bersamaan dengan nama setinggi 200px di
   bawahnya (apa pun yang lebih panjang kalah sebelum sempat dibaca), dan tiap
   baris tambahan memakan ~45px dari tinggi layar yang harus dibagi dengan
   nama itu. Di layar 1280x720 anggarannya cuma cukup untuk tiga baris. */
export const HERO_LEDE =
  "Membangun aplikasi web dan mobile - rapi dari struktur datanya sampai antarmukanya.";

/* Paragraf About. Dipecah jadi kalimat supaya tiap kalimat bisa disorot
   terpisah saat digulung - satu blok panjang akan menyala serempak dan
   efeknya hilang. */
export const ABOUT_PARAGRAPHS = [
  "Saya membangun aplikasi web dengan Laravel dan aplikasi mobile dengan Flutter, dengan perhatian besar pada struktur data agar setiap fitur tetap rapi, ringan, dan mudah dikembangkan.",
  "Di luar itu saya mengeksplorasi React dan mengasah kemampuan lewat kontribusi ke proyek open-source.",
];

/* Angka-angka kecil di bawah About. Ditulis sebagai string, bukan number:
   beberapa di antaranya bukan bilangan murni ("5+", "GMT+8") dan
   mencampur tipe di satu daftar cuma mengundang bug format. */
export const FACTS = [
  { label: "Fokus", value: "Laravel · Flutter" },
  { label: "Basis", value: LOCATION },
  { label: "Zona", value: TIMEZONE },
  { label: "Status", value: "Tersedia" },
];

export const socialLinks = [
  { name: "Github", handle: "Devx-cloud", href: GITHUB_URL, icon: Github },
  {
    name: "Instagram",
    handle: "devx.sun",
    href: "https://www.instagram.com/devx.sun/",
    icon: Instagram,
  },
  {
    name: "Linkedin",
    handle: "Deva Surya",
    href: "https://www.linkedin.com/in/deva-surya-5a6568380/",
    icon: Linkedin,
  },
];

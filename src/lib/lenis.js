/*
 * Pemegang instance Lenis yang sedang aktif.
 *
 * Terpisah dari SmoothScroll.jsx bukan karena selera: berkas yang mengekspor
 * komponen DAN nilai biasa mematikan Fast Refresh untuk seluruh berkas itu
 * (aturan react-refresh/only-export-components) - tiap kali komponennya
 * disentuh, Vite memuat ulang halaman penuh alih-alih menukar modulnya, dan
 * animasi yang sedang berjalan hilang di tengah pengembangan.
 *
 * null saat Lenis tidak aktif - yaitu sebelum efeknya jalan, dan selamanya
 * bagi pengunjung dengan prefers-reduced-motion. Pemanggil WAJIB memeriksa
 * hasilnya dan menyiapkan jalur cadangan (lihat tombol "ke atas" di Footer).
 */
let active = null;

export const setLenis = (instance) => {
  active = instance;
};

export const getLenis = () => active;

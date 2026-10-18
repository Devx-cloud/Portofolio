/* Kapan bab Skills memakai panggung scroll (sticky, ikon dibuka mengikuti
   gulir) alih-alih daftar mengalir.

   WAJIB sama dengan @custom-variant scrolly di index.css. CSS yang memutuskan
   mana yang TERLIHAT - supaya tidak ada kedipan satu frame saat halaman dimuat -
   sementara JS memakai angka yang sama untuk hal yang tidak bisa diputuskan CSS:
   ke mana harus menggulir saat sebuah skill dibuka dari kartu project.

   Dua syarat, bukan satu:
     lebar  1024px - teks dan papan berdampingan butuh ruang.
     tinggi  680px - panggung sticky tidak bisa digulir di dalamnya. Kalau isinya
                     lebih tinggi dari layar, sisanya terpotong tanpa jalan ke
                     sana. */
export const SCROLLY_QUERY = "(min-width: 1024px) and (min-height: 680px)";

/* Kapan kartu project ditumpuk. Syaratnya lebih longgar dari panggung skill
   karena kartunya sendiri lebih pendek (~520px), tapi tetap butuh tinggi:
   kartu sticky yang lebih tinggi dari layar terpotong tanpa bisa dibaca. */
export const STACK_QUERY = "(min-width: 768px) and (min-height: 680px)";

/* Gerak patah-patah untuk framer, padanan steps(4, end) di CSS - untuk chrome
   pixel: panel yang berganti isi, ikon, label. */
export const pixEase = (t) => Math.floor(t * 4) / 4;

/* Kurva halus untuk gerak yang besar atau menempel ke gulir: tumpukan kartu,
   parallax gambar, teks yang mengendap. Gerak patah pada skala sebesar itu
   terbaca tersendat, bukan bergaya. Diambil dari porto_v3. */
export const easeOutExpo = [0.16, 1, 0.3, 1];

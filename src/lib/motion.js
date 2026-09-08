/* Kurva gerak dipakai bersama seluruh situs. Ditulis sebagai array bezier
   (bukan string "easeOut") karena Framer Motion hanya menerima array untuk
   kurva kustom, dan angkanya harus SAMA PERSIS dengan --ease-* di index.css -
   sebagian elemen dianimasikan CSS dan sebagian oleh JS, dan dua kurva yang
   berbeda tipis justru lebih terlihat salah daripada dua kurva yang jelas beda. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
export const EASE_IN_OUT_QUART = [0.76, 0, 0.24, 1];

/* Ambang munculnya elemen. Margin bawah negatif menahan pemicu sampai
   elemennya benar-benar masuk sekitar 12% ke dalam layar - tanpa itu animasi
   selesai saat elemennya masih di tepi bawah dan pengunjung tidak pernah
   melihat geraknya. `once` disengaja: mengulang animasi tiap kali digulung
   naik-turun membuat halaman terasa gelisah. */
export const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" };

/* Viewport yang lebih longgar untuk blok besar (kartu proyek) yang tingginya
   hampir satu layar - dengan margin -12% mereka baru mulai saat sudah lewat. */
export const VIEWPORT_WIDE = { once: true, margin: "0px 0px -5% 0px" };

/* Detik ke berapa tirai pembuka mulai terangkat (lihat Intro.jsx).
   Hero memakai angka ini sebagai delay baris pertamanya supaya huruf mulai
   naik tepat saat tirainya lepas - kalau Hero memakai whileInView apa adanya,
   animasinya selesai di balik tirai dan pengunjung tidak pernah melihatnya.
   Mengubah durasi tirai WAJIB diikuti mengubah angka ini. */
export const INTRO_LIFT_AT = 1;

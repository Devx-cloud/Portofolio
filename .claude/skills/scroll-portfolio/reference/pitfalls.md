# Jebakan yang sudah terbukti

Semuanya pernah terjadi di repo ini. Yang menyatukan mereka: **tidak satu pun
menghasilkan error**. Lint hijau, build hijau, konsol bersih — dan halamannya
salah.

---

## 1. Nama kelas Tailwind yang dirakit saat runtime tidak pernah ada

```jsx
// SALAH - hover-nya mati diam-diam
<Icon className={cn("text-dust", `group-hover:${skill.color}`)} />
```

Tailwind memindai **kode sumber sebagai teks** untuk menemukan nama kelas. String
yang baru terbentuk saat runtime tidak pernah ikut ter-generate, jadi CSS-nya
tidak ada dan hover-nya tidak melakukan apa-apa.

Dua jalan keluar yang sah:

```jsx
// A. Tulis kelas utuh sebagai literal di data (Tailwind memindai .js juga)
{ name: "Laravel", hover: "group-hover:text-brand-laravel" }

// B. Ubah taktiknya - tanpa kelas dinamis sama sekali
<Icon className={cn("opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0", color)} />
```

Repo ini memakai B di `src/sections/Skills.jsx`: warna merek dipasang permanen
lalu diredam filter. Bonusnya, tidak ada daftar kelas kembar untuk dijaga.

**Cara mendeteksi:** cari backtick di dalam `className`. Hampir selalu bug.

---

## 2. `whileInView` untuk elemen di atas lipatan

Baris kedua judul Hero (`SURYA.`) pernah tersangkut permanen di `translateY(110%)`
— di balik mask, jadi **tidak terlihat sama sekali**. Setengah nama orangnya
hilang dari halaman pembuka, tanpa error apa pun.

Yang sudah dipastikan BUKAN penyebabnya:

- tata letak — posisinya stabil sejak frame pertama (450-636 dan 618-804 di
  layar 900px, keduanya di dalam zona deteksi 0-792)
- `IntersectionObserver` — observer baru dengan `rootMargin` yang sama persis
  melaporkan elemen itu berpotongan dengan rasio 0.94
- isi barisnya — baris lain yang isinya juga fragment React beranimasi normal

Observer milik Framer Motion, yang dipasang saat commit pertama, tidak pernah
melaporkan elemen itu masuk layar. Akar persisnya tidak dikejar sampai tuntas
karena perbaikannya memang lebih benar secara makna: **"muncul saat digulung ke
dalam layar" tidak berarti apa-apa untuk elemen yang tidak pernah perlu
digulung.**

```jsx
<MaskLines lines={[HERO_LINES[0]]} trigger="mount" />
```

Aturannya: di atas lipatan → `trigger="mount"`. Di bawah lipatan → `whileInView`.

**Cara mendeteksi:** setelah halaman diam, tiap `.mask-line > span` harus
`getComputedStyle(el).transform === "none"`.

---

## 3. Judul raksasa hanya dibatasi lebar

```css
/* SALAH - baris kedua jatuh di bawah lipatan pada layar 1280x720 */
--text-d1: clamp(3.75rem, 17.5vw, 15rem);

/* BENAR */
--text-d1: clamp(2.5rem, min(26vw, 26vh), 12.5rem);
```

Nama di Hero punya dua tuan yang berbeda:

- **Di HP batasnya LEBAR.** "SURYA." selebar ~2.9em; di layar 360px font tidak
  boleh lebih dari ~26vw atau hurufnya terpotong.
- **Di laptop batasnya TINGGI.** 1280x720 punya lebar berlimpah tapi cuma 720px
  vertikal. Dua baris pada 17.5vw memakan 560px — baris kedua tidak muat.

`min()` membiarkan sumbu tersempit yang menentukan, jadi satu nilai melayani
keduanya. Sesudah perbaikan, tinggi Hero == tinggi viewport persis di
1280x720, 1440x900, dan 1920x1080.

**Cara mendeteksi:** uji di **1280x720**, bukan cuma di layar sendiri.

---

## 4. `scroll-behavior: smooth` + Lenis

Lenis menggulung dengan menulis `scrollTop` tiap frame. `scroll-behavior: smooth`
akan mencoba meng-easing tiap tulisan itu, dan hasilnya tersendat. Pilih satu.

Konsekuensinya menyebar: tombol "ke atas" tidak boleh memakai
`window.scrollTo({behavior:"smooth"})` selama Lenis hidup. Simpan instance-nya
(`src/lib/lenis.js`) dan sediakan jalur cadangan untuk saat Lenis mati
(reduced motion).

Simpan instance itu di **berkas terpisah**, bukan di samping komponennya —
berkas yang mengekspor komponen DAN nilai biasa mematikan Fast Refresh untuk
seluruh berkas (`react-refresh/only-export-components`).

---

## 5. Celah hitam raksasa di ujung tumpukan sticky

Slot sticky tiap kartu setinggi satu layar (900px) sementara kartunya sekitar
500px, jadi selalu ada ~200px sisa di bawah kartu **terakhir**. Ditambah
`pb-36` bagian itu dan `pt-36` bagian berikutnya, celahnya jadi ~560px dan
terbaca seperti halaman putus.

Bagian dengan tumpukan sticky memakai `pt-24 md:pt-36` **tanpa** padding bawah.

---

## 6. `backdrop-filter` di atas tumpukan yang dikomposisi

Masthead ber-`backdrop-blur` di atas halaman yang penuh lapisan terpisah (kartu
sticky ber-`transform`, trek marquee ber-`will-change`) meninggalkan sisa gambar
yang belum digambar ulang di sebagian frame — potongan gambar proyek muncul
tersmear di dalam bar.

Latar solid. Selain lebih aman, ia juga sesuai aturan "tidak ada blur di elemen
UI".

---

## 7. Em-dash sebagai pemisah di font display

Em-dash Anton pada ukuran 90px adalah **batang tebal**. Diberi warna aksen, ia
terbaca sebagai balok yang salah render, bukan pemisah. Pakai `·`.

Kerabatnya: `.display-outline` (`-webkit-text-stroke`) yang diterapkan di
pembungkus akan ikut mengenai titik aksen di dalamnya — titik merah jadi
berbingkai abu-abu. Pasang outline di span dalam, bukan di pembungkus mask.

---

## 8. Titik/aksen yang diposisikan manual

```jsx
// SALAH - hanya benar di satu lebar layar
<span className="mb-[0.14em] size-[0.14em] bg-red" />

// BENAR - biarkan font yang menempatkannya
<span className="text-red">.</span>
```

Baseline font display bergeser mengikuti `clamp()`, jadi offset em yang disetel
manual meleset di lebar layar lain. Karakter `.` milik fontnya sendiri selalu
duduk tepat. (Bonus: titik Anton berbentuk kotak, dan itu justru pas.)

---

## 9. ESLint tanpa `react/jsx-uses-vars`

Tanpa aturan itu ESLint tidak tahu bahwa `<motion.div />` dan `<Icon />` ITU
pemakaian, jadi `motion` dan `Icon` dilaporkan sebagai impor tak terpakai di
hampir semua berkas dan `npm run lint` berhenti bisa dipercaya. Aktifkan
aturannya satu-satu; preset `react/recommended` ikut membawa `prop-types` dkk
yang tidak relevan untuk proyek tanpa TypeScript.

---

## 10. `useMediaQuery` yang mulai dari `false`

Kalau nilai awalnya `false` lalu berubah setelah efek pertama, komponen yang
mengganti **struktur JSX**-nya berdasarkan itu (mis. tumpukan sticky yang mati
di layar sempit) merender tata letak lama satu frame — dan `useScroll` Framer
Motion sudah terlanjur mengukur tinggi yang lama, jadi skalanya meleset sampai
ada resize.

Baca `matchMedia` di inisialisasi state. Aman selama tidak ada SSR.

---

## 11. Placeholder yang ikut terucap

`api/profile.js` pernah berisi `"email": "Isi dengan email Anda"`. Itu dikirim
sebagai `systemInstruction` ke model, jadi **itulah yang benar-benar dijawab
asisten** saat ditanya kontak.

Jangan pernah meninggalkan teks placeholder di data yang masuk ke prompt. Kalau
sebuah bagian belum ada datanya, hapus field-nya — field yang hilang membuat
model menjawab "tidak ada informasi", yang benar.

Kerabatnya: prompt yang cuma menyalin lima field pilihan dari objek profil
diam-diam menyembunyikan sisanya. Kirim seluruh objek sebagai JSON (minus
instruksi sistemnya), supaya menambah data baru otomatis ikut terkirim.

---

## 12. `position: sticky` di kolom yang paling tinggi

Kolom potret di bagian Tentang diberi `md:sticky md:top-24` supaya fotonya
bertahan sementara teksnya lewat. Ia tidak pernah menempel sedetik pun.

Sebabnya: elemen sticky terkurung di dalam induknya, dan induknya di sini adalah
grid item yang tingginya ditentukan oleh baris grid — yang tingginya ditentukan
oleh kolom TERTINGGI, yaitu kolom potret itu sendiri. Kolom yang menentukan
tinggi barisnya sendiri tidak pernah punya sisa ruang untuk digeser.

Sticky baru berguna kalau kolom lain lebih tinggi. Periksa dulu, jangan pasang
karena "biasanya bagus".

---

## 13. Zona aman gambar di bingkai parallax

Bingkai potret memakai `object-cover` pada gambar setinggi 114% yang digeser
±6%. Artinya yang **dijamin selalu terlihat** cuma pita tengahnya — kira-kira
6%..82% dari tinggi gambar aslinya.

Versi pertama pelat placeholder menaruh label "FOTO DIRI" di y=905 dari 1000.
Label itu tidak pernah muncul di layar sama sekali, di posisi gulungan mana pun.

Hitung zona amannya sebelum menaruh apa pun yang harus terbaca (label, wajah,
logo) di dalam bingkai berparallax.

---

## 14. Token warna yang namanya menyebut warnanya

`bone`, `ink-2`, `dust` terbaca masuk akal sampai tema kedua masuk — lalu
`bg-ink` ternyata berarti "latar terang" dan setiap nama berbohong.

Beri nama menurut PERAN sejak awal: `page` (latar), `ink` (tulisan), `panel`,
`line`, `muted`. Nama-nama itu tetap benar di tema mana pun. Repo ini harus
melakukan rename massal di 11 berkas karena tidak melakukannya dari awal.

Pasangannya: di `@theme` Tailwind, warnanya harus menunjuk `var(--c-*)`, bukan
ditulis langsung. Tailwind menyalin nilai token ke utility saat build; nilai
harfiah di sana terkunci pada satu tema dan kaskadenya tidak pernah bekerja.

---

## 15. `navigator.clipboard` gagal lebih sering daripada dugaan

Ia butuh secure context (hilang di http biasa — termasuk saat menguji lewat IP
di jaringan lokal), butuh dokumennya sedang fokus, dan izinnya bisa ditolak.
Di pengujian headless pertama, tombol salin selalu jatuh ke keadaan gagal.

Sediakan cadangan `document.execCommand("copy")` lewat textarea sementara. Ia
usang tapi tidak menuntut satu pun dari syarat di atas. Textarea-nya harus
`position: fixed; opacity: 0`, **bukan** `display: none` — elemen yang tidak
dirender tidak bisa diseleksi, dan tanpa seleksi tidak ada yang tersalin.

Dan beri konfirmasi yang bukan cuma warna: menyalin tidak meninggalkan jejak
apa pun di layar, jadi tanpa ikon DAN label yang berganti, pengunjung tidak
punya cara tahu kliknya berhasil.

---

## 16. Canvas tidak ikut kaskade tema

Warna yang dibaca dari token CSS lewat `getComputedStyle` hanya dibaca sekali
saat inisialisasi. Saat pengunjung mengganti tema, elemen DOM biasa berubah
sendiri; canvas tetap menggambar dengan warna tema lama sampai ada yang
memicunya menggambar ulang.

Pasang `MutationObserver` pada `documentElement` yang memantau `data-theme`,
baca ulang warnanya, lalu gambar ulang.

Kerabatnya: pakai `ResizeObserver` pada canvas-nya, bukan `window.resize`.
Tinggi Hero mengikuti `svh` dan berubah saat bilah alamat browser mobile
menyusut — peristiwa yang tidak selalu memicu resize window.

---

## 17. Loop animasi yang tidak pernah berhenti

Lerp eksponensial (`v += (target - v) * ease`) tidak pernah benar-benar
mencapai target. Tanpa ambang diam eksplisit, `requestAnimationFrame` berjalan
selamanya untuk gerakan sepersekian piksel yang tidak bisa dilihat siapa pun —
di latar belakang, dengan baterai laptop pengunjung.

Perlu tiga penghenti sekaligus, dan ketiganya menangkap kasus yang berbeda:
ambang diam (tidak ada yang bergerak), `IntersectionObserver` (elemennya keluar
layar), dan `visibilitychange` (tabnya disembunyikan). Melewatkan salah satunya
menyisakan satu jalan bagi loop untuk terus hidup.

---

## 18. `getBoundingClientRect()` di dalam handler scroll

Ia memaksa browser menghitung ulang tata letak sebelum bisa menjawab. Di
halaman ini itu terjadi tepat setelah Lenis menulis `scrollTop`, jadi biayanya
dibayar setiap frame gulungan.

Untuk mencari bagian mana yang sedang aktif, cache `offsetTop` tiap bagian
sekali (dan ukur ulang lewat `ResizeObserver`), lalu bandingkan terhadap nilai
`scrollY` yang sudah ada di tangan. Tidak ada pembacaan tata letak sama sekali
saat digulung.

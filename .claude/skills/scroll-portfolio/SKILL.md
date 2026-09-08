---
name: scroll-portfolio
description: Membangun atau mengubah situs satu-halaman bertipografi tebal dengan animasi berbasis gulungan, latar partikel interaktif, dan tema terang/gelap - portofolio, landing page, atau company profile tanpa menu navigasi. Pakai skill ini saat diminta membuat/merombak situs "satu scroll", "tanpa menu", "teks tegas/besar", "animasi scroll estetik", saat menambah tema terang/gelap, saat menambah partikel/latar canvas interaktif atau micro-interaction, atau saat mengerjakan bagian mana pun dari portofolio ini (Hero, Tentang, Skills, Karya, Tanya AI, Kontak) supaya aturan desain dan jebakan tekniknya tidak ditemukan ulang dari nol.
---

# Situs Satu Gulungan Bertipografi Tebal

Resep untuk situs yang seluruh antarmukanya adalah tipografi dan gerak
gulungan, tanpa navigasi. Implementasi acuannya adalah repo ini sendiri —
kalau ragu, baca berkas yang disebut, jangan tebak.

## 1. Empat aturan yang menahan desainnya

Melanggar salah satu membuat hasilnya jatuh jadi "template dark mode biasa".
Aturan ini juga ditulis di kepala `src/index.css`; jaga keduanya tetap sama.

1. **TIPOGRAFI adalah antarmukanya.** Font display dipakai besar — sangat
   besar — dan hanya huruf kapital. Kalau sebuah judul masih terasa nyaman
   dibaca sekilas, ia belum cukup besar.
2. **GARIS, bukan kotak.** Struktur dibangun dari rule 1px dan ruang kosong.
   Tidak ada sudut membulat, bayangan lembut, atau gradien dekoratif.
3. **SATU AKSEN.** Warna aksen tidak pernah jadi latar blok besar; ia penanda —
   satu titik, satu garis, satu kata, satu tombol. Begitu ia dipakai di dua
   tempat yang bersaing, keduanya mati.
4. **GERAK MENGIKUTI GULUNGAN.** Animasi dipicu posisi scroll, bukan timer.
   Pengunjung yang berhenti menggulung harus melihat gambar yang diam dan utuh.
   Pengecualian yang disengaja: pita marquee dan tirai pembuka.

## 2. Keputusan yang sudah diambil (jangan diulang dari nol)

**Font.** Anton (display) + Inter Tight Variable (teks) + JetBrains Mono
(label/angka). Di-host sendiri lewat `@fontsource*`, bukan CDN Google — situs
yang seluruhnya bertumpu pada tipografi tidak boleh menunggu request eksternal.
Anton hanya punya berat 400 dan itu memang sudah tebal: **jangan pernah**
menimpanya dengan `font-weight`, browser akan memalsukannya jadi tebal buatan
yang kotor (`font-synthesis-weight: none` di `body` menutup ini).

**Palet.** Tujuh warna netral + tiga langkah aksen, per tema. Yang netral dan
yang terang dibedakan SUHUnya, bukan cuma kecerahannya: netralnya saturasi 0%,
kertasnya hangat (hue ~40). Selisih itu yang membuat yang terang terbaca sebagai
kertas, bukan sebagai abu-abu. Warna merek logo satu-satunya pengecualian.
Token diberi nama menurut peran — lihat bagian 4.

**Tanpa router.** Satu halaman berarti tidak ada `react-router`. Yang hilang
cuma kemampuan melompat; yang didapat adalah urutan baca yang dijamin.

**Smooth scroll (Lenis) wajib.** Bukan kosmetik: roda mouse di Windows melompat
~100px per klik, jadi tanpa peredam, animasi yang "mengikuti scroll" meloncat
5-6 langkah besar dan tidak pernah terlihat sebagai gerakan.

## 3. Susunan halaman

Urutan tetap, tiap bagian bernomor. Nomor itu yang menggantikan pekerjaan menu:
ia memberi tahu pengunjung bahwa halaman punya urutan dan panjangnya terbatas,
tanpa perlu bisa diklik.

| # | Bagian | Gerak utamanya |
|---|--------|----------------|
| — | Hero | mask-reveal per baris (**dipicu mount**), parallax keluar, pita marquee |
| 01 | Tentang | potret parallax + paragraf menyala kata demi kata |
| 02 | Kemampuan | pita marquee + baris daftar yang masuk berjenjang |
| 03 | Karya | kartu sticky yang saling menimpa & menyusut |
| 04 | Tanya AI | panel berbingkai, satu-satunya elemen interaktif dua arah |
| 05 | Kontak | mask-reveal judul, alamat email berukuran display |

Chrome global: `Intro` (tirai 1.8 detik), `Masthead` (identitas + pengalih
tema, **bukan** menu), `ScrollRail` (progres, **tidak bisa diklik**), `Cursor`,
`Grain`, `Footer`.

**Potret** hidup di bagian Tentang, satu-satunya tempatnya. Bingkai 4:5 dengan
parallax pelan dan desaturasi 30% yang hilang saat disorot — potret berwarna
penuh di halaman satu-aksen akan merebut semua perhatian dari merahnya,
sementara hitam-putih total terbaca dingin. Jalurnya diatur lewat `PORTRAIT` di
`src/data/profile.js`; pelat framing sementara ada di `public/potret.svg`.

**Kaki halaman tidak menampung teks dekoratif.** Di sini pernah ada pita
marquee raksasa bertuliskan kalimat yang sudah jadi judul bagian Kontak tepat
di atasnya — pengulangan setinggi 96px yang cuma menunda pengunjung dari
alamat dan jalan kembali ke atas. Kalau sebuah baris di footer tidak bisa
dijelaskan dengan "orang membaca ini untuk mengetahui X", ia tidak masuk.

## 4. Dua tema

Nama token berbasis **peran**, bukan warna: `page` selalu latar halaman dan
`ink` selalu warna tulisan, di tema mana pun. Nama seperti "bone" atau
"dark-gray" akan berbohong begitu temanya dibalik — dan itu memang terjadi di
repo ini, yang harus di-rename massal setelah tema kedua masuk.

Tiga bagian yang harus semuanya ada:

1. **Indirection `var()` di `@theme`.** Tailwind menyalin nilai token ke utility
   saat build; kalau warnanya ditulis langsung di sana, ia terkunci pada satu
   tema. `--color-page: var(--c-page)` membuat utility-nya baru diselesaikan di
   elemen yang memakainya — dan di sanalah kaskade tema bekerja.
2. **Skrip inline yang memblokir di `<head>`.** Ia memasang `data-theme`
   sebelum CSS dimuat. Diberi `defer`/`async` atau dipindah ke berkas
   eksternal, pengunjung bertema terang akan melihat kedipan hitam penuh tiap
   kali membuka halaman.
3. **`useTheme` MEMBACA atribut itu**, tidak pernah menebak sendiri — kalau ia
   punya tebakan awalnya sendiri, kedipannya kembali tepat setelah hidrasi.

Yang tidak boleh dilupakan saat menambah tema kedua:

- **Aksen harus digelapkan untuk kertas.** Merah `hsl(356 88% 54%)` cuma 3.4:1
  di atas latar terang — lolos untuk teks besar, gagal untuk label kecil, dan
  label kecil justru pemakaian merah paling sering.
- **Warna merek logo perlu dua set.** Kuning JavaScript tidak terbaca sama
  sekali di atas kertas.
- **Teks di atas blok aksen butuh tokennya sendiri** (`on-red`), tetap terang di
  kedua tema. Memakai token teks biasa membuatnya hitam-di-atas-merah.
- **Mode blend butiran film berbalik**: `overlay` di gelap, `multiply` di terang.
- **`mix-blend-difference` pada kursor justru aman di keduanya** — cincin
  hampir-putih menghasilkan cincin hampir-hitam di atas kertas. Jangan
  "perbaiki" yang ini.
- **`color-scheme`** per tema, supaya kontrol form dan scrollbar bawaan ikut.

## 5. UX gulungan panjang

Halaman tanpa menu menukar kemampuan melompat dengan urutan baca yang dijamin.
Yang TIDAK boleh ikut tertukar adalah tiga hal yang selalu diberikan navigasi —
kalau ketiganya hilang, hasilnya bukan "minimalis" melainkan membingungkan:

1. **Ada di mana.** `ScrollRail` menampilkan nama bagian yang sedang dibaca.
2. **Masih berapa lagi.** Nomor sekarang lawan totalnya ("03" / "06") plus
   batang progres. Tanpa tanda bahwa isinya TERBATAS, gulungan panjang tidak
   pernah memberi rasa selesai.
3. **Jalan kembali.** Tombol "kembali ke atas" di kaki halaman.

Rel itu **tidak bisa diklik dan `aria-hidden`**. Begitu ia bisa diklik, ia
berubah jadi menu vertikal dan premis desainnya batal. Ia instrumen, bukan
kemudi.

Aturan turunan lain yang sudah dibayar mahal:

- **Jangan patahkan afordans gulungan.** Lenis meredam, tidak membajak: satu
  putaran roda tetap memindahkan halaman ke arah dan kira-kira sejauh yang
  diharapkan.
- **Pembuka tampil sekali per sesi** (`sessionStorage`). Kesan pertama cuma
  terjadi sekali; menahan orang yang menyegarkan halaman satu detik lagi
  berubah dari sambutan jadi pungutan.
- **Kegagalan harus punya jalan keluar.** Bagian Tanya AI bergantung pada API
  yang memang kadang penuh, jadi pesan errornya membawa tombol "coba lagi"
  yang mengirim ulang pertanyaan terakhir — tanpa menuntut pengunjung
  mengetiknya ulang.
- **Status jangan disampaikan lewat warna saja.** Balasan error berganti label
  jadi "Gagal", tombol salin berganti ikon DAN teks.
- **Tautan lewati-ke-konten** sebagai perhentian Tab pertama.

## 6. Partikel & micro-interaction

Latar canvas interaktif ada di `DotField.jsx`; efek magnetik di
`useMagnetic.js`. Rinciannya di `reference/primitives.md`.

**Bentuknya harus mengutip desainnya.** Kisi titik yang tersibak, bukan
starfield yang melayang acak: halaman ini dibangun dari garis dan sudut siku,
dan partikel acak akan terbaca sebagai hiasan yang ditempel dari tema lain.
Titiknya kotak — lebih murah digambar daripada lingkaran, dan mengutip titik
persegi font Anton yang jadi aksen merah di nama Hero.

**Anggaran performa canvas** (semuanya wajib, bukan optimasi opsional):

- **Dua draw call per frame, bukan seribu.** Semua titik diam masuk satu
  `Path2D`, semua titik aktif ke satu lagi; `fillStyle` di-set sekali per
  batch. Mengganti `fillStyle` per partikel adalah cara tercepat membunuh
  canvas.
- **Hentikan loop saat semuanya diam.** Tanpa kursor tidak ada yang bergerak,
  jadi tidak ada alasan membangunkan GPU 60 kali per detik. Butuh ambang diam
  eksplisit — lerp eksponensial tidak pernah benar-benar mencapai nol.
- **Berhenti saat keluar layar** (`IntersectionObserver`) **dan saat tab
  disembunyikan** (`visibilitychange`).
- **Batasi `devicePixelRatio` di 2**, dan skalakan konteksnya (`setTransform`).
- **`Float32Array` datar, bukan array objek.** Seribu objek kecil yang dibaca
  tiap frame memberi kerja tetap ke garbage collector, dan itu muncul sebagai
  tersendat berkala.
- **Gerak terikat WAKTU, bukan frame:** `1 - exp(-k * dt)`, bukan lerp faktor
  tetap — kalau tidak, layar 120Hz bergerak dua kali lebih cepat.

**Micro-interaction** dijaga tiga pagar: hanya di `(pointer: fine)`, mati untuk
`prefers-reduced-motion` (yang dimatikan geraknya, bukan fungsinya), dan
langka. Kalau semua tombol magnetik, tidak ada yang terasa istimewa. Tombol
tidak pernah menjauh dari kursor — itu lelucon yang membuat pengguna dengan
gangguan motorik tidak bisa mengkliknya.

## 7. Primitif gerak

Semua ada di `src/components/`. Baca `reference/primitives.md` untuk kode dan
alasan tiap parameter.

- **`MaskLines`** — reveal baris demi baris dari balik "pintu". Efek pembuka
  utama. Tiap baris WAJIB elemen sendiri; potongan barisnya ditentukan di data,
  bukan diserahkan ke word-wrap.
- **`Reveal` / `Stagger` / `StaggerItem`** — naik + memudar. Kuda beban halaman.
- **`ScrollHighlight`** — paragraf yang menyala kata demi kata.
- **`Marquee`** — pita yang kecepatannya ikut kecepatan gulungan dan berbalik
  arah saat digulung ke atas.
- **`SmoothScroll`** — Lenis. Instance-nya disimpan di `src/lib/lenis.js`.
- **`DotField`** — kisi partikel canvas yang tersibak oleh kursor.
- **`useMagnetic`** — elemen tertarik pelan ke kursor. Untuk ajakan utama saja.

Semuanya menghormati `prefers-reduced-motion` dengan cara yang sama: **merender
keadaan AKHIR secara langsung**, bukan menghilangkan elemennya.

## 8. Alur kerja

1. Baca `src/index.css` dulu — token, kelas komponen, dan keempat aturan ada di
   sana. Jangan karang warna atau ukuran baru di komponen.
2. Konten selalu masuk ke `src/data/*.js`, tidak pernah ditulis langsung di JSX.
   Bagian yang menampilkannya tidak boleh tahu isinya.
3. Bangun bagiannya. Pakai primitif yang sudah ada; kalau butuh gerak baru,
   tambahkan primitifnya, jangan menaruh `motion` mentah di bagian.
4. **Sebelum mengklaim selesai:** `npm run lint && npm run build`, lalu
   verifikasi visual (bagian 9). Build yang hijau tidak membuktikan halamannya
   terlihat benar — bug terburuk di sini semuanya diam.

## 9. Verifikasi visual (jangan dilewati)

Kegagalan paling merugikan di gaya desain ini **tidak menghasilkan error**:
elemen tersangkut di posisi awalnya, judul jatuh di bawah lipatan, kelas
Tailwind yang tidak pernah ter-generate. Semuanya lolos lint dan build.

Rekam layar halamannya di beberapa titik gulungan dan LIHAT hasilnya:

```bash
npx vite preview --port 4173 --strictPort   # di latar belakang
# lalu jalankan puppeteer-core dengan Chrome yang sudah terpasang
```

Skrip yang dipakai saat membangun ini ada di `reference/verify.md`. Ia
memotret 1440x900 dan 390x844 di ~8 titik gulungan, dan mengumpulkan error
konsol serta request gagal. Yang wajib diperiksa tiap kali:

- [ ] Nama/judul Hero **utuh di atas lipatan** pada 1280x720 (bukan cuma 1440x900)
- [ ] Semua `.mask-line > span` berakhir di `transform: none` — kalau ada yang
      tersisa di `matrix(..., 110%)`, elemen itu tidak pernah terlihat
- [ ] Tidak ada celah hitam > ~400px antar bagian
- [ ] `document.documentElement.scrollWidth === window.innerWidth` (tidak ada
      gulungan horizontal)
- [ ] Konsol bersih
- [ ] **Kedua tema** dipotret, bukan cuma yang default
- [ ] Canvas benar-benar bereaksi (bandingkan `getImageData` sebelum/sesudah
      `mouse.move`, bukan cuma "ada elemen canvas")
- [ ] `prefers-reduced-motion` diemulasikan: canvas tidak dirender, tirai tidak
      tampil, dan seluruh isinya tetap terlihat
- [ ] Perhentian Tab pertama adalah tautan lewati-ke-konten

## 10. Jebakan

Ini semua sudah pernah terjadi di repo ini. Rinciannya di
`reference/pitfalls.md` — baca sebelum menyalahkan kode sendiri.

- **Nama kelas Tailwind yang dirakit saat runtime tidak pernah ada.**
  `` `group-hover:${color}` `` gagal diam-diam. Tulis kelas utuh sebagai literal
  di kode sumber, atau ganti taktik (mis. warna permanen + `grayscale`).
- **`whileInView` tidak boleh dipakai untuk elemen di atas lipatan.** Pakai
  `trigger="mount"`. Ini bug nyata yang pernah menyembunyikan separuh nama.
- **Judul raksasa harus dibatasi DUA sumbu:** `min(26vw, 26vh)`. Hanya vw =
  baris kedua jatuh di bawah lipatan pada layar 720px.
- **`scroll-behavior: smooth` dan Lenis bertengkar.** Pilih satu.
- **Slot sticky setinggi layar meninggalkan ~200px sisa di bawah kartu
  terakhir** — jangan tambahkan padding bawah bagian di atasnya.
- **`backdrop-filter` di atas tumpukan lapisan yang dikomposisi** meninggalkan
  sisa gambar. Pakai latar solid.
- **Em-dash di font display** adalah balok tebal, bukan garis. Pakai `·`.
- **ESLint tanpa `react/jsx-uses-vars`** melaporkan `motion` dan `Icon` sebagai
  impor tak terpakai di hampir semua berkas.
- **`position: sticky` di kolom yang paling tinggi tidak melakukan apa-apa** —
  ia menentukan tinggi barisnya sendiri, jadi tidak pernah punya ruang untuk
  menempel. Gagal tanpa suara.
- **Gambar di bingkai parallax punya zona aman.** `object-cover` setinggi 114%
  digeser ±6% berarti hanya pita tengah yang selalu terlihat; isi di luar itu
  terpotong di sebagian posisi gulungan.

## 11. Aksesibilitas — bukan opsional di sini

- Tiap primitif gerak punya cabang `useReducedMotion` yang merender keadaan
  akhir. Lenis dimatikan total.
- Fokus keyboard: outline bone dengan offset — **bukan** aksen, yang akan hilang
  di atas tombol yang warnanya aksen itu sendiri.
- Marquee `aria-hidden` (isinya diulang empat kali).
- Panel yang isinya datang asinkron (Tanya AI) butuh `aria-live="polite"`.
- Kursor kustom adalah lapisan tambahan; **jangan** sembunyikan kursor asli.

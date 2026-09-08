# Primitif gerak

Implementasi lengkapnya ada di `src/components/`. Berkas ini menjelaskan
**kenapa tiap parameter bernilai seperti itu**, yang tidak muat di kode.

Konstanta bersama ada di `src/lib/motion.js`. Kurva bezier di sana harus SAMA
PERSIS dengan `--ease-*` di `src/index.css` — sebagian elemen dianimasikan CSS
dan sebagian oleh JS, dan dua kurva yang berbeda tipis lebih terlihat salah
daripada dua kurva yang jelas berbeda.

```js
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];      // apa pun yang MASUK
export const EASE_IN_OUT_QUART = [0.76, 0, 0.24, 1]; // yang bergeser dua arah
export const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" };
export const INTRO_LIFT_AT = 1; // detik; Hero memakainya sebagai delay
```

`margin` bawah negatif menahan pemicu sampai elemennya masuk ~12% ke dalam
layar — tanpa itu animasi selesai saat elemennya masih di tepi bawah dan
pengunjung tidak pernah melihat geraknya. `once: true` disengaja: mengulang
animasi tiap kali digulung naik-turun membuat halaman terasa gelisah.

---

## MaskLines — reveal baris demi baris

Efek pembuka utama. Rahasianya **bukan** di animasinya (cuma `translateY`)
melainkan di pembungkusnya:

```css
.mask-line {
  display: block;
  overflow: hidden;
  /* descender font display menembus baseline; tanpa padding bawah,
     ekor huruf Q/J terpotong oleh overflow-nya sendiri */
  padding-bottom: 0.09em;
  margin-bottom: -0.09em;
}
```

Karena itu **tiap baris wajib jadi elemen sendiri**. Membungkus satu paragraf
yang mengalir dengan satu mask tidak menghasilkan efek ini — potongan barisnya
harus ditentukan di data:

```js
export const HERO_LINES = [NAME.first, NAME.last]; // bukan hasil word-wrap
```

Diserahkan ke word-wrap, jumlah barisnya berubah mengikuti lebar layar dan
animasi berjenjangnya ikut berubah acak.

| Parameter | Nilai | Alasan |
|---|---|---|
| `y` awal | `110%` | 100% masih menyisakan ujung descender mengintip di bawah garis mask |
| `duration` | `1.05` | di bawah ~0.8 terbaca sebagai "kedip", di atas ~1.3 terasa lamban |
| `stagger` | `0.085` | cukup untuk terbaca berurutan, belum cukup untuk terasa antre |
| `trigger` | `"view"` / `"mount"` | **di atas lipatan wajib `mount`** — lihat pitfalls #2 |

`lines` boleh berisi node React, bukan cuma string — itu cara memberi warna
berbeda pada sebagian baris tanpa memecahnya jadi dua mask yang naik terpisah.
Karena node tidak bisa dipakai sebagai key, key-nya indeks; aman di sini justru
karena daftar judul tidak pernah disisipkan, dihapus, atau diurutkan ulang.

---

## ScrollHighlight — paragraf menyala kata demi kata

```jsx
const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.4"] });
// tiap kata:
const opacity = useTransform(progress, [i / n, (i + 2) / n], [0.16, 1]);
```

**Kenapa per kata, bukan gradien `background-clip`:** `background-clip` hanya
bisa menyapu lurus kiri-ke-kanan pada tiap baris, jadi pada paragraf multi-baris
sapuannya "melompat" ke awal baris berikutnya. Memberi tiap kata motion value
sendiri membuat urutan menyalanya mengikuti urutan **baca**, bukan geometri
kotaknya.

**Rentang tiap kata sengaja tumpang tindih** (panjang 2 slot, maju 1 slot).
Tanpa tumpang tindih, kata menyala satu per satu seperti saklar; dengan tumpang
tindih ada beberapa kata yang sedang di tengah transisi sekaligus — itu yang
membuatnya terbaca sebagai gelombang.

`offset` berakhir di `"end 0.4"`, bukan `"end start"`: paragraf harus selesai
menyala **sebelum** keluar layar, supaya pengunjung sempat melihatnya utuh.

Biayanya satu `useTransform` per kata. Untuk paragraf puluhan kata itu murah —
semuanya berlangganan ke satu `scrollYProgress` dan tidak ada yang memicu
re-render React.

---

## Marquee — pita yang bereaksi pada gulungan

```jsx
const velocityFactor = useTransform(smoothVelocity, [0, 1200], [0, 4], { clamp: false });
const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
useAnimationFrame((_, delta) => {
  let moveBy = direction.current * baseVelocity * (delta / 1000);
  const f = velocityFactor.get();
  if (f < 0) direction.current = -1; else if (f > 0) direction.current = 1;
  baseX.set(baseX.get() + moveBy + moveBy * f);
});
```

- **Empat salinan daftar, wrap `-50%..0%`.** Setengah trek = tepat dua salinan,
  jadi saat geseran mencapai -50% salinan ke-3 berada persis di tempat salinan
  ke-1 dan lompatan baliknya tidak terlihat. Empat (bukan dua) menjamin setengah
  trek selalu lebih lebar dari layar mana pun — kalau tidak, ada celah kosong di
  ujung kanan.
- **`useSpring` di kecepatan gulungan.** Kecepatan mentah melonjak tiap gerakan
  roda; tanpa peredam pitanya tersentak alih-alih "terseret".
- **`clamp: false` disengaja.** Menggulung lebih cepat dari 1200px/detik harus
  terus mempercepat pita, bukan mentok. Itu yang membuatnya terasa punya massa.
- **`delta / 1000`.** Kecepatan terikat waktu, bukan jumlah frame — tampilannya
  sama di layar 60Hz maupun 120Hz.
- **Mask tepi 12%, bukan 6%.** Pada huruf display setinggi 50-90px, sapuan 6%
  habis di tengah satu huruf dan yang terlihat bukan "memudar" melainkan satu
  huruf yang lebih redup dari tetangganya. Fade harus lebih lebar dari satu
  huruf.
- **`aria-hidden`** — isinya diulang empat kali.

---

## SmoothScroll (Lenis)

```js
new Lenis({
  duration: 1.05,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // = expo-out
  smoothWheel: true,
  syncTouch: false,
});
```

- **`duration: 1.05`.** Di bawah ~0.8 peredamannya tidak cukup untuk meratakan
  lompatan roda; di atas ~1.4 halaman terasa berat dan pengunjung merasa
  kehilangan kendali.
- **`syncTouch: false`.** Layar sentuh sudah punya momentum dari sistem operasi;
  menumpuk peredam di atasnya membuat jari terasa lengket — keluhan nomor satu
  situs ber-smooth-scroll di HP.
- **Dimatikan total untuk `prefers-reduced-motion`.** Mengambil alih gulungan
  adalah hal pertama yang mengganggu pengunjung yang meminta gerak minimal.
- Ia menulis ke `scrollTop` asli (bukan mentransformasi container), jadi
  `useScroll`, `position: sticky`, dan `#anchor` bawaan browser tetap bekerja.

---

## Tumpukan kartu sticky

```jsx
// induk
const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
// tiap kartu
range={[i / projects.length, 1]}
targetScale={1 - (projects.length - 1 - i) * 0.05}
// slot
className="sticky top-0 flex h-svh items-center justify-center"
style={{ scale, top: `calc(-6vh + ${index * 26}px)` }}
```

Yang membuat efeknya bekerja: **elemen sticky-nya adalah slot setinggi layar**,
dan containing block-nya adalah pembungkus semua slot. Slot pertama menempel
sepanjang sisa bagian, jadi kartu berikutnya naik menutupinya.

- **Penyusutan 5% per kartu.** Begitu skalanya turun cukup jauh untuk terlihat
  jelas, kartu di belakang mulai terbaca sebagai "gambar yang salah ukuran"
  alih-alih sebagai kedalaman.
- **`range` selalu berakhir di 1**, bukan di porsi kartu berikutnya —
  penyusutannya berlangsung sepanjang sisa bagian. Tanpa itu kartu terakhir
  tampak "mengunci" mendadak di tengah gulungan.
- **`origin-top`** supaya tepi atas kartu tidak bergeser saat menyusut.
- **Parallax gambar dihitung dari gulungan KARTU ITU SENDIRI**, bukan dari
  bagiannya — kalau tidak, semua gambar bergerak serempak dan efeknya hilang.
  Gambar dibuat 118% lebih tinggi dari kotaknya supaya geseran ±8% tidak pernah
  memperlihatkan tepi kosong.
- **Hanya di layar lebar.** Lihat pitfalls #5 dan #10.

---

## DotField — kisi partikel yang tersibak kursor

Latar canvas di Hero. Titik disusun sebagai KISI, bukan taburan acak, dan
berbentuk KOTAK — alasan keduanya ada di `SKILL.md` bagian 6.

```js
const SPACING  = 38;   // jarak antar titik
const RADIUS   = 150;  // radius pengaruh kursor (~4 sel)
const MAX_PUSH = 16;   // < SPACING/2, supaya titik tak menyeberangi tetangganya
const STIFFNESS = 9;   // per detik, dipakai lewat 1 - exp(-k*dt)
```

| Nilai | Kenapa segitu |
|---|---|
| `SPACING` 38 | Di ~24 kisinya jadi bidang abu rata (tekstur hilang); di ~56 sibakannya cuma menggerakkan dua-tiga titik dan tidak terbaca sebagai gelombang |
| `MAX_PUSH` 16 | Harus di bawah setengah `SPACING`. Kisi yang titiknya tumpang tindih terbaca **rusak**, bukan terganggu |
| dua `Path2D` | Satu untuk titik diam, satu untuk titik aktif. Dua `fill()` per frame alih-alih seribu |
| `Float32Array` | Empat array datar (bx, by, ox, oy), bukan seribu objek — lihat pitfalls #17 dan catatan GC di SKILL.md |
| `dist²` | `sqrt` hanya dihitung untuk titik yang benar-benar kena, dan itu segelintir dari seribu |
| ambang 0.05px | Di bawah itu dianggap diam dan loop-nya berhenti. Tanpa ini ia berjalan selamanya |

Warna dibaca dari `--c-muted` dan `--c-red` lewat `getComputedStyle`, dan
**wajib** dibaca ulang saat tema berganti (pitfalls #16).

Untuk `prefers-reduced-motion` komponennya mengembalikan `null` — bukan versi
statisnya. Kisi titik yang diam tidak menyampaikan apa pun yang belum
disampaikan halamannya; ia cuma menambah tekstur yang harus diabaikan mata.

**Penempatan.** Canvas-nya `absolute inset-0 pointer-events-none` di dalam
Hero, dengan `.dot-mask` yang membatasi titik ke pita atas-tengah layar. Tanpa
mask, kisinya melintas persis di belakang nama setinggi 200px — dan tekstur di
belakang huruf outline membuat huruf outline-nya berhenti terbaca sebagai huruf.
Ia mendengarkan pointer lewat `window`, jadi `pointer-events-none` tidak
mematikannya.

---

## useMagnetic — tarikan magnetik ke kursor

```js
const magnet = useMagnetic();
<motion.button ref={magnet.ref} style={magnet.style} />
```

- **Spring, bukan nilai langsung.** Yang mengikuti kursor persis terasa seperti
  elemen yang menempel; yang tertinggal sedikit terasa seperti benda bermassa.
  Seluruh efeknya ada di perbedaan kecil itu.
- **Radius diukur dari TEPI elemen**, bukan pusatnya — kalau tidak, tombol
  lebar baru bereaksi saat kursor hampir menyentuhnya sementara tombol kecil
  bereaksi dari jauh.
- **Reset saat digulung.** Gulungan memindahkan elemen di bawah kursor yang
  diam, jadi tanpa reset tombolnya bisa tertinggal dalam keadaan tergeser.
- **Geseran maksimum ~32% jarak, dan selalu kembali ke nol.** Tombol yang
  berlari menjauh dari kursor membuat pengguna dengan gangguan motorik tidak
  bisa mengkliknya.

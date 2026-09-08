# Verifikasi visual

Kegagalan paling merugikan di gaya desain ini **tidak menghasilkan error**:
elemen tersangkut di posisi awalnya, judul jatuh di bawah lipatan, kelas
Tailwind yang tidak pernah ter-generate, label SVG yang terpotong crop. Lint
hijau, build hijau, konsol bersih — dan halamannya salah.

Satu-satunya cara mengetahuinya adalah **melihat halamannya**.

## Persiapan

`puppeteer-core` (tanpa unduhan browser) + Chrome/Edge yang sudah terpasang di
mesin. Pasang di direktori sementara, bukan di proyek — ini alat, bukan
dependensi produk.

```bash
npm run build
npx vite preview --port 4173 --strictPort   # jalankan di latar belakang
```

Jalur Chrome di Windows biasanya
`C:/Program Files/Google/Chrome/Application/chrome.exe`.

## Skrip

```js
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--no-sandbox", "--force-device-scale-factor=1"],
});

const errors = [];

for (const theme of ["dark", "light"]) {
  const page = await browser.newPage();
  page.on("pageerror", (e) => errors.push(`[${theme}] ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`[${theme}] ${m.text()}`));
  page.on("requestfailed", (r) => errors.push(`[${theme}] ${r.url()} ${r.failure()?.errorText}`));

  await page.setViewport({ width: 1440, height: 900 });
  // Tetapkan preferensi SEBELUM halaman dimuat, seperti pengunjung sungguhan -
  // menyetelnya sesudah itu cuma menguji tombolnya, bukan jalur muat awalnya.
  await page.evaluateOnNewDocument((t) => {
    try { localStorage.setItem("tema", t); } catch (e) {}
  }, theme);

  await page.goto("http://localhost:4173/", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 3200)); // tirai pembuka 1.8s + margin

  const height = await page.evaluate(() => document.body.scrollHeight);
  await page.screenshot({ path: `shots/${theme}-01.png` });

  for (const [i, s] of [0.14, 0.26, 0.4, 0.55, 0.72, 0.9, 0.995].entries()) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(height * s));
    await new Promise((r) => setTimeout(r, 1300)); // biarkan animasinya mengendap
    await page.screenshot({ path: `shots/${theme}-${i + 2}.png` });
  }
  await page.close();
}
```

Ulangi sekali lagi dengan `setViewport({ width: 390, height: 844, isMobile: true })`.

## Pemeriksaan otomatis

Jalankan di halaman, lalu **tetap lihat gambarnya** — pemeriksaan ini menangkap
kegagalan yang sudah dikenal, bukan yang belum.

```js
// 1. Adakah reveal yang tidak pernah mendarat?
[...document.querySelectorAll(".mask-line > span")]
  .filter((el) => getComputedStyle(el).transform !== "none")
  .map((el) => el.textContent);

// 2. Gulungan horizontal?
document.documentElement.scrollWidth > window.innerWidth;

// 3. Tema benar-benar terpasang?
document.documentElement.dataset.theme;
```

**Peringatan soal pemeriksaan 1:** jalankan saat elemennya BERADA di layar.
`window.scrollTo` yang melompat jauh membuat IntersectionObserver tidak pernah
melihat elemen yang dilewati di antara dua perhentian, jadi judul yang sudah
tergulung ke atas akan dilaporkan "tersangkut" padahal normal. Kalau ada yang
dilaporkan, gulung balik ke elemen itu (`el.scrollIntoView({block:"center"})`),
tunggu, lalu periksa lagi. Yang benar-benar rusak akan tetap tersangkut.

## Daftar periksa

- [ ] Nama/judul Hero **utuh di atas lipatan pada 1280x720** — bukan cuma di
      layar sendiri. Rasio inilah yang paling ketat vertikalnya.
- [ ] Tinggi Hero == tinggi viewport di 1280x720, 1440x900, dan 1920x1080
- [ ] Semua reveal mendarat (lihat peringatan di atas)
- [ ] Tidak ada celah kosong > ~400px antar bagian
- [ ] Tidak ada gulungan horizontal
- [ ] **Kedua tema** dipotret, termasuk warna merek logo dan tombol aksen
- [ ] Gambar dalam bingkai parallax: isinya masih di dalam zona aman
- [ ] Konsol bersih

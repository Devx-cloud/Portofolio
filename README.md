# Dev_X — Portofolio Deva Surya

Portofolio bergaya game pixel: menu utama ala Title Screen, empat stage yang bisa dijelajahi
(Profile, Experience, Ask AI, Contact), dan asisten AI yang menjawab pertanyaan soal profil.
Chrome-nya dunia game, kontennya dokumen profesional.

**Stack:** React 19 · Vite 7 · Tailwind CSS 4 · Framer Motion · Three.js (lampu 3D di Ask AI) ·
Gemini (`@google/genai`) lewat fungsi serverless Vercel.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5173  (front-end saja, tanpa /api)
npm run build      # hasil ke dist/
npm run preview    # cek hasil build
npm run lint
```

`npm run dev` **tidak** menyajikan `/api/chat`, jadi stage Ask AI menampilkan pesan galat di sana.
Untuk mencoba asisten secara lokal, jalankan lewat Vercel CLI (`npx vercel dev`) dengan
`GEMINI_API_KEY` terisi.

## Variabel lingkungan

Salin `.env.example` menjadi `.env` (sudah di-ignore git).

| Variabel | Wajib | Fungsi |
| --- | --- | --- |
| `GEMINI_API_KEY` | untuk Ask AI | Kunci Gemini, dibaca hanya oleh `api/chat.js` (tidak pernah sampai ke browser). |
| `SITE_URL` | tidak | Alamat produksi tanpa garis miring di ujung, untuk `canonical` dan gambar kartu pratinjau. Di Vercel dilewati: `VERCEL_PROJECT_PRODUCTION_URL` dipakai otomatis. |

## Struktur

```
shared/portfolio.js   Satu-satunya sumber data: profil, skill, project. Dibaca situs DAN asisten AI.
api/chat.js           Fungsi serverless Ask AI (validasi, pembatas laju, fallback model).
api/_lib/             Prompt, pembatas laju, pembersih markdown. Awalan _ = bukan endpoint.
src/data/stages.js    Daftar stage: route, menu, dan pemuatan malas (lazy) tiap stage.
src/sections/         Isi tiap stage: profile, experience, assistant, contact.
src/index.css         Sistem desain: token palet, utilitas pixel, aturan penulisan di kepala berkas.
scripts/              Pembuat aset (Python + Pillow). Lihat di bawah.
```

## Mengubah konten

Skill dan project ada di `shared/portfolio.js`. Mengubahnya di sana otomatis mengubah halaman
Experience **dan** jawaban asisten AI, karena keduanya membaca berkas yang sama. Ikon dan warna
merek per skill ditempelkan berdasarkan `id` di `src/sections/experience/data.js` — skill baru
butuh satu entri di sana juga (mode dev akan memberi tahu kalau lupa).

Pendidikan dan riwayat kerja **belum ada** di data; asisten diminta mengaku belum tersedia
alih-alih mengarang. Menambahkannya cukup dengan menulisnya di `shared/portfolio.js` dan
menyebutnya di `api/_lib/prompt.js`.

## Aset

Semua aset gambar di `public/` adalah **WebP lossless** dengan sengaja: WebP lossy memakai
subsampling warna yang membuat tepi pixel art berdarah (terukur ±34 dB PSNR pada latar kota,
27 dB pada sprite). Jangan dikonversi ke lossy demi menghemat ukuran.

Skrip pembuat aset (`pip install pillow numpy`, dijalankan dari akar proyek):

| Skrip | Menghasilkan |
| --- | --- |
| `scripts/pixelate.py` | pelat latar kota (stage Profile) dan ruangan (Ask AI) dari gambar mentah AI |
| `scripts/build-sprite.py` | lembar sprite hero dan NPC (`sprite-*.webp`, `npc/`) |
| `scripts/build-portrait.py` | pasangan potret foto + pixel art di Title Screen (`me.webp`, `me-pixel.webp`) |
| `scripts/lamp-texture.py` | tekstur lampu 3D (`lamp-shade.png`, `glow.png`, `beam.png`) |
| `scripts/build-brand.py` | favicon dan gambar kartu pratinjau (`og.jpg`) |

Sumber asli (PNG) ada di `art/`.

## Deploy (Vercel)

`vercel.json` mengatur durasi fungsi (30 detik), cache aset, dan fallback SPA. Isi
`GEMINI_API_KEY` di pengaturan proyek.

Pembatas laju di `api/chat.js` bekerja di memori tiap instance serverless — cukup menahan
pengulangan cepat, **bukan** perisai penuh. Untuk perlindungan sungguhan, tambahkan aturan
*Rate Limiting* di Vercel Firewall (dashboard, tanpa kode) untuk path `/api/chat`.

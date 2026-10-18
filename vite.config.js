import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path";

/* Alamat produksi situs, tanpa garis miring di ujung. Dipakai untuk tag yang WAJIB
   absolut: canonical dan gambar kartu pratinjau (Open Graph) - crawler WhatsApp,
   LinkedIn, dan X tidak menyelesaikan alamat relatif.

   SITE_URL menang kalau diisi (mis. domain sendiri). Kalau tidak, Vercel
   menyediakan VERCEL_PROJECT_PRODUCTION_URL saat build (domain tanpa skema).
   Tidak ada keduanya (build lokal) -> tag itu dilewati, bukan diisi asal. */
const siteUrl = () => {
  const raw =
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  return raw ? raw.replace(/\/+$/, "") : null;
};

/* Dua hal yang hanya bisa diketahui saat build, jadi tidak bisa ditulis tangan
   di index.html:
   1. Alamat absolut (lihat siteUrl).
   2. Nama berkas font yang sudah di-hash. Tanpa preload, font baru diminta
      setelah CSS terurai - teks Title Screen sempat tampil dalam font cadangan
      lalu melompat. */
const siteMeta = () => ({
  name: "site-meta",
  transformIndexHtml: {
    order: "post",
    handler(_html, ctx) {
      const tags = [];
      const base = siteUrl();

      if (base) {
        tags.push(
          { tag: "link", attrs: { rel: "canonical", href: `${base}/` }, injectTo: "head" },
          { tag: "meta", attrs: { property: "og:url", content: `${base}/` }, injectTo: "head" },
          { tag: "meta", attrs: { property: "og:image", content: `${base}/og.jpg` }, injectTo: "head" },
          { tag: "meta", attrs: { name: "twitter:image", content: `${base}/og.jpg` }, injectTo: "head" }
        );
      }

      for (const file of Object.keys(ctx.bundle ?? {})) {
        if (!/^assets\/(big-shot|deltarune)-.+\.ttf$/.test(file)) continue;
        tags.push({
          tag: "link",
          // crossorigin WAJIB untuk font, walau satu origin - tanpanya preload
          // tidak dipakai ulang dan font diunduh dua kali.
          attrs: { rel: "preload", as: "font", type: "font/ttf", href: `/${file}`, crossorigin: "" },
          injectTo: "head-prepend",
        });
      }

      return tags;
    },
  },
});

/* `npm run dev` menyajikan api/chat.js sendiri. Tanpa ini POST /api/chat dibalas
   404 tanpa JSON oleh Vite, dan stage Ask AI hanya bisa bilang "Gagal menghubungi
   server" - asisten cuma bisa dicoba lewat `vercel dev`.

   Handler-nya ditulis untuk runtime Node milik Vercel (req.body sudah terbaca,
   res.status().json()), jadi dua hal itu ditambal di sini. Dimuat lewat
   ssrLoadModule: perubahan di api/ ikut terpakai tanpa restart. Hanya dev -
   di produksi Vercel yang menjalankan berkas yang sama. */
const apiDev = () => ({
  name: "api-dev",
  apply: "serve",
  configureServer(server) {
    // GATEWAY_TOKEN dkk. dari .env. Env shell yang sudah ada tetap menang.
    const fileEnv = loadEnv(server.config.mode, process.cwd(), "");
    for (const [key, value] of Object.entries(fileEnv)) process.env[key] ??= value;

    server.middlewares.use("/api/chat", async (req, res) => {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      req.body = Buffer.concat(chunks).toString("utf8");

      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
      res.json = (data) => {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify(data));
        return res;
      };

      try {
        const { default: handler } = await server.ssrLoadModule("/api/chat.js");
        await handler(req, res);
      } catch (error) {
        server.ssrFixStacktrace(error);
        console.error(error);
        if (!res.headersSent) res.status(500).json({ message: "api/chat.js gagal dimuat (lihat terminal)." });
      }
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), siteMeta(), apiDev()],
  base: "/",
  build: {
    // Satu-satunya chunk di atas 500 KB adalah scene lampu 3D (three.js): ia dimuat
    // malas dan digerbang (RoomLamp.jsx) - hanya desktop bermouse >= 1280px, bukan
    // reduced-motion. Peringatan bawaan setiap build jadi derau yang menutupi
    // peringatan sungguhan; ambangnya dinaikkan tepat di atas chunk itu, jadi
    // chunk lain yang membengkak tetap ketahuan.
    chunkSizeWarningLimit: 950,
  },
  resolve: {
    alias: {
      "@" : path.resolve(__dirname, "./src"),
      // Data yang dibaca client DAN fungsi serverless di api/ (lihat berkas itu).
      "@shared" : path.resolve(__dirname, "./shared"),
    }
  }
})

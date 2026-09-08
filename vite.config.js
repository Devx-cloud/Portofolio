import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
  resolve: {
    alias: {
      /* __dirname tidak ada di modul ESM, dan berkas ini ESM ("type":
         "module" di package.json). fileURLToPath adalah penggantinya yang
         benar - new URL(...).pathname saja menghasilkan "/C:/..." di Windows
         dan alias-nya gagal diselesaikan. */
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    }
  }
})

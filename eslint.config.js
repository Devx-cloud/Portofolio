import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),

  /* Berkas konfigurasi jalan di Node, bukan di browser. Tanpa blok ini,
     `process` dan kawan-kawannya dilaporkan sebagai variabel tak dikenal. */
  {
    files: ['*.config.js', 'api/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },

  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    plugins: { react },
    settings: {
      react: { version: 'detect' },
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      /* WAJIB ada, dan sengaja dinyalakan satu-satu alih-alih memakai preset
         react/recommended (yang ikut membawa prop-types dkk - tidak relevan
         untuk proyek tanpa TypeScript maupun PropTypes).

         Tanpa aturan ini ESLint tidak tahu bahwa <motion.div /> dan <Icon />
         ITU pemakaian, jadi `motion` dan `Icon` dilaporkan sebagai impor yang
         tidak terpakai di hampir semua berkas dan `npm run lint` tidak bisa
         dipercaya. Ini sudah terjadi sejak sebelum halaman ini ditulis ulang. */
      'react/jsx-uses-vars': 'error',
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])

import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    plugins: { react },
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
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      /* Tanpa aturan ini no-unused-vars tidak tahu bahwa <motion.div> memakai
         `motion` dan <Icon /> memakai `Icon` - JSX bukan pemakaian di matanya.
         varsIgnorePattern di atas hanya menolong nama berhuruf besar yang
         dideklarasikan sebagai variabel, bukan parameter (`{ icon: Icon }`) dan
         bukan `motion`. Akibatnya dulu 19 dari 21 error lint palsu, dan dua yang
         asli tenggelam di antaranya. */
      'react/jsx-uses-vars': 'error',
    },
  },
  {
    // Berjalan di Node, bukan browser: fungsi serverless dan berkas konfigurasi.
    files: ['api/**/*.js', 'vite.config.js', 'eslint.config.js'],
    languageOptions: { globals: globals.node },
  },
])

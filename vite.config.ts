import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'

import dataFetchPlugin from './plugins/vite-plugin-data-fetch'

// https://vite.dev/config/
export default defineConfig({
  base: '/house-of-commonsdle/',
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    dataFetchPlugin(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})

import { fileURLToPath, URL } from 'node:url'

import { defineConfig, configDefaults } from 'vitest/config'
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
    dataFetchPlugin() as any,
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  test: {
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'e2e/**'],
    root: fileURLToPath(new URL('./', import.meta.url)),
  },
})

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// CI sets BASE_PATH from the repo name, so renaming the repo can't break the deployed paths.
const base = process.env.BASE_PATH ?? '/gratitude-journal-vibe-coded/'

export default defineConfig({
  base,
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Our own worker (src/sw.ts) so it can show the daily reminder; it keeps the same precache.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'] },
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'The Flower Press',
        short_name: 'Flower Press',
        description: 'Three small prompts a day. Stored only on your device.',
        id: base,
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        categories: ['lifestyle', 'health'],
        background_color: '#f7f1e3',
        theme_color: '#f7f1e3',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        // Screenshots give Android its richer "Install app" sheet instead of a plain shortcut prompt.
        screenshots: [
          { src: 'screenshots/wreath.png', sizes: '800x1720', type: 'image/png', form_factor: 'narrow', label: "This week's wreath" },
          { src: 'screenshots/day.png', sizes: '800x1720', type: 'image/png', form_factor: 'narrow', label: 'Writing today' },
        ],
      },
    }),
  ],
})

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// CI sets BASE_PATH from the repo name, so renaming the repo can't break the deployed paths.
const base = process.env.BASE_PATH ?? '/gratitude-journal-vibe-coded/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Gratitude Journal',
        short_name: 'Gratitude',
        description: 'Three small prompts a day. Stored only on your device.',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#fbf8f3',
        theme_color: '#c2643a',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})

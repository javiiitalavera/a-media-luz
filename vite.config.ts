/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'A media luz',
        short_name: 'A media luz',
        description: 'Un compañero al mes que crece con lo que haces en tu vida real.',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F9EBDD',
        theme_color: '#F9EBDD',
        icons: [
          { src: '/iconos/icono-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/iconos/icono-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/iconos/icono-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,webp,png,svg,woff2}'] },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Zona horaria fija para que las pruebas de fechas sean reproducibles.
    env: { TZ: 'Europe/Madrid' },
  },
})

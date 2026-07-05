import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      // registerType only affects generateSW builds — under injectManifest,
      // src/sw.js's own skipWaiting()/clients.claim() calls are what make
      // updates take effect immediately; main.jsx reloads the tab on top of that.
      includeAssets: ['apple-touch-icon.png'],
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}']
      },
      manifest: {
        name: 'Smart Action Plan',
        short_name: 'SAP',
        description: 'Your whole day, planned smart.',
        theme_color: '#0e1420',
        background_color: '#0e1420',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ]
})

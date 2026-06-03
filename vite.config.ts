import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

/**
 * Vite build config.
 *
 * Two performance levers tuned here:
 *  1. Manual chunk split — separate vendor, router, qr libs from app code so
 *     a landing-page visitor doesn't pull the QR scanner / qrcode renderer.
 *  2. Asset inline threshold lifted slightly so small svgs / icons get base64'd
 *     into the CSS bundle instead of generating extra HTTP requests.
 *
 * Code splitting at the route level is done in src/router.tsx via React.lazy.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Split heavy / rarely-used libs into their own chunks so the landing
    // page doesn't pay their cost on first paint. Rolldown (Vite 8) expects
    // manualChunks as a function returning the target chunk name per module id.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // QR libraries — only the QR pass + admin scan need these.
            if (id.includes('qrcode.react') || id.includes('qr-scanner')) {
              return 'qr'
            }
            // Routing — used by every route but small.
            if (id.includes('react-router')) {
              return 'router'
            }
            // Core React — long-lived cache, changes only on React upgrade.
            if (id.includes('react-dom') || id.includes('/react/')) {
              return 'react-vendor'
            }
            // Everything else from node_modules into a generic vendor chunk.
            return 'vendor'
          }
        },
      },
    },
    // Match the chunk-size warning to our split target. 500kb is too tight
    // for a vendor chunk that includes React + react-dom; 350kb fits cleanly.
    chunkSizeWarningLimit: 350,
    // Inline tiny assets (< 4kb) into CSS as data URIs to avoid extra fetches.
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    // Source maps off in production — saves bytes; we have logs via console.
    sourcemap: false,
  },
})

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' → relative asset URLs. Required because the Android WebView loads
// index.html from https://appassets.androidplatform.net/assets/index.html and
// maps URL paths onto the assets folder — absolute /assets/... paths 404 there
// (blank screen). Stable (unhashed) output names keep the SW precache valid.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { host: true, port: 5173 },
  build: {
    // Older Android WebViews (< Chrome 85) choke on ??= / ?., which React's
    // bundle emits by default — down-level to ES2017.
    target: 'es2017',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
})

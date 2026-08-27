import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Stable (unhashed) output names so the service worker precache list stays valid.
export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173 },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
})

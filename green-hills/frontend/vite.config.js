import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GH_BASE: '/static/' when Django serves the build (default), './' for a standalone static preview.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // dev server: '/', production build served by Django: '/static/'
  base: command === 'serve' ? '/' : process.env.GH_BASE || '/static/',
  server: {
    port: 5173,
    host: true, // also reachable from your phone on the same Wi-Fi
    proxy: { '/api': 'http://127.0.0.1:8000' },
  },
  build: { outDir: 'dist', assetsDir: 'assets', sourcemap: false },
}))

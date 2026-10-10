import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GH_BASE: '/static/' when Django serves the build (default), './' for a standalone static preview.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // dev server: '/', production build served by Django: '/static/'
  base: command === 'serve' ? '/' : process.env.GH_BASE || '/static/',
  server: {
    // Green Hills uses its own ports so it never clashes with other projects (e.g. Cookbook on 5173/8000)
    port: 5180,
    strictPort: true, // fail loudly instead of silently opening another project
    host: true, // also reachable from your phone on the same Wi-Fi
    // Django handles these: the booking API, the admin panel and the admin's own CSS/JS
    proxy: {
      '/api': 'http://127.0.0.1:8010',
      // changeOrigin: false keeps the browser's address, so Django's login security (CSRF) check passes
      '/admin': { target: 'http://127.0.0.1:8010', changeOrigin: false },
      '/static': { target: 'http://127.0.0.1:8010', changeOrigin: false },
    },
  },
  build: { outDir: 'dist', assetsDir: 'assets', sourcemap: false },
}))

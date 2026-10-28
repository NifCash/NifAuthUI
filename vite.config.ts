import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 7145,
    proxy: {
      // Gateway surface: AuthUI talks to same-origin /api and /connect
      '/api': {
        target: 'http://localhost:5238',
        changeOrigin: true,
      },
      '/connect': {
        target: 'http://localhost:5238',
        changeOrigin: true,
      },
      '/.well-known': {
        target: 'http://localhost:5238',
        changeOrigin: true,
      },
    },
  },
})

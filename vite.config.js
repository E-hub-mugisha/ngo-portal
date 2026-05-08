import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react],

  server: {
    proxy: {
      '/api': {
        target:
          'https://script.google.com/macros/s/AKfycbzADqBvrwmS3H0pXBCzpmwG3CWa_IPPrgeNowMEzAl5wicHHtMqU5oXUQc5OSxFIhpz',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
//frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],

  server: process.env.NODE_ENV === 'development'
    ? {
        port: 5173,

        // ✅ ADD THIS (VERY IMPORTANT FOR GOOGLE LOGIN)
        headers: {
          'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        },

        proxy: {
          '/api': {
            target: 'http://localhost:5000',
            changeOrigin: true,
            secure: false,
          }
        }
      }
    : undefined,

  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'react-icons', 'react-hot-toast'],
          utils: ['axios', 'qrcode']
        }
      }
    }
  },

  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@hooks': '/src/hooks',
      '@utils': '/src/utils',
      '@context': '/src/context'
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: '../backend/public',
    emptyOutDir: false, // Don't wipe backend/public (it has index.php, storage, etc.)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    rolldownOptions: {
      output: {
        codeSplitting: true
      }
    }
  },
  server: {
    proxy: {
      // Proxy central (SaaS admin) API calls to avoid CORS issues
      '/central-api': {
        target: 'https://resevitweb.test',
        changeOrigin: true,
        secure: false, // Handle local self-signed certs
        rewrite: (path) => path.replace(/^\/central-api/, '/api'),
      },
      '/api': {
        target: 'https://resevitweb.test',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

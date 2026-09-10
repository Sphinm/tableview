import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    exclude: ['@duckdb/duckdb-wasm']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@sentry')) {
            return 'vendor-sentry';
          }
          if (id.includes('node_modules/@duckdb/duckdb-wasm')) {
            return 'vendor-duckdb';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-lucide';
          }
        }
      }
    }
  }
})

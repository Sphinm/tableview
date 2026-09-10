import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

/**
 * Stamp a content-derived version into dist/sw.js so every deploy gets a fresh
 * service-worker cache name (and the old caches are purged on activate).
 */
function serviceWorkerVersionPlugin() {
  return {
    name: 'tableview-service-worker-version',
    apply: 'build' as const,
    closeBundle() {
      const swPath = path.join(rootDir, 'dist', 'sw.js')
      if (!fs.existsSync(swPath)) return

      // Reuse Vite's own content hash of the entry chunk — identical builds
      // produce identical cache names, so users do not re-download needlessly.
      let version = Date.now().toString(36)
      try {
        const html = fs.readFileSync(path.join(rootDir, 'dist', 'index.html'), 'utf8')
        const match = html.match(/assets\/index-([A-Za-z0-9_-]+)\.js/)
        if (match) version = match[1]
      } catch {
        // Fall back to the timestamp above.
      }

      const source = fs.readFileSync(swPath, 'utf8')
      fs.writeFileSync(swPath, source.replace('__BUILD_VERSION__', version))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    serviceWorkerVersionPlugin(),
  ],
  optimizeDeps: {
    exclude: ['@duckdb/duckdb-wasm']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
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

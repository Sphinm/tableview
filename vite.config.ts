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

function parseRequestBody(req: import('node:http').IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

/**
 * Development middleware to handle /api/auth endpoints when running Vite locally.
 */
function devAuthPlugin() {
  return {
    name: 'tableview-dev-auth',
    configureServer(server: import('vite').ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/auth/')) {
          return next();
        }

        const pathname = req.url.split('?')[0];
        res.setHeader('Content-Type', 'application/json');

        if (pathname === '/api/auth/google' && req.method === 'POST') {
          const body = await parseRequestBody(req);
          const credential = body.credential;
          let email = 'developer@tableview.dev';
          let name = 'Google User';
          let avatarUrl = null;

          if (typeof credential === 'string') {
            try {
              const parts = credential.split('.');
              if (parts.length >= 2) {
                const base64Url = parts[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const payload = JSON.parse(jsonPayload);
                if (payload.email) email = payload.email;
                if (payload.name) name = payload.name;
                if (payload.picture) avatarUrl = payload.picture;
              }
            } catch (e) {
              console.warn('[dev-auth] Could not decode Google token:', e);
            }
          }

          res.statusCode = 200;
          res.end(
            JSON.stringify({
              success: true,
              token: 'dev-token-' + Buffer.from(email).toString('base64'),
              user: {
                id: 'google_' + Buffer.from(email).toString('hex').slice(0, 12),
                email,
                name,
                avatarUrl,
                plan: 'free',
                credits: 30,
              },
            })
          );
          return;
        }

        if (pathname === '/api/auth/send-magic-link' && req.method === 'POST') {
          res.statusCode = 200;
          res.end(
            JSON.stringify({
              success: true,
              message: 'Magic link sent! (Dev mode)',
              devToken: 'dev-token-' + Date.now(),
            })
          );
          return;
        }

        if (pathname === '/api/auth/verify-magic-link' && req.method === 'POST') {
          res.statusCode = 200;
          res.end(
            JSON.stringify({
              success: true,
              token: 'dev-token-' + Date.now(),
              user: {
                id: 'user_dev_magic',
                email: 'user@tableview.dev',
                name: 'Developer',
                avatarUrl: null,
                plan: 'free',
                credits: 30,
              },
            })
          );
          return;
        }

        if (pathname === '/api/auth/me' && req.method === 'GET') {
          res.statusCode = 200;
          res.end(
            JSON.stringify({
              user: {
                id: 'user_dev',
                email: 'developer@tableview.dev',
                name: 'Developer',
                avatarUrl: null,
                plan: 'free',
                credits: 30,
              },
            })
          );
          return;
        }

        if (pathname === '/api/auth/logout' && req.method === 'POST') {
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true }));
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    serviceWorkerVersionPlugin(),
    devAuthPlugin(),
  ],
  optimizeDeps: {
    exclude: ['@duckdb/duckdb-wasm']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // NOTE: @sentry is deliberately NOT pinned to a single chunk.
          //
          // Sentry is split across two very different loading strategies:
          //   - @sentry/react  loads on idle for every visitor (error reporting)
          //   - @sentry/replay loads ONLY after analytics consent
          // Forcing them into one "vendor-sentry" chunk merged the replay bundle
          // into the always-loaded chunk, so every visitor downloaded the
          // recorder even without consent — contradicting the privacy guarantee.
          // Letting the bundler decide keeps replay in its own lazily-fetched chunk.
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

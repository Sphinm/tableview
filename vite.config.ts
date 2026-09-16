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

function readKeyFromDevVars(): string | undefined {
  try {
    const devVarsPath = path.join(rootDir, '.dev.vars');
    if (fs.existsSync(devVarsPath)) {
      const content = fs.readFileSync(devVarsPath, 'utf8');
      const match = content.match(/^GEMINI_API_KEY=(.*)$/m);
      if (match) return match[1].trim().replace(/^["']|["']$/g, '');
    }
  } catch {
    // Ignore
  }
  return undefined;
}

/**
 * Development middleware to handle /api/ endpoints when running Vite locally.
 */
function devAuthPlugin() {
  return {
    name: 'tableview-dev-auth',
    configureServer(server: import('vite').ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        const pathname = req.url.split('?')[0];
        res.setHeader('Content-Type', 'application/json');

        if (pathname === '/api/ai/status' && req.method === 'GET') {
          const envKey = process.env.GEMINI_API_KEY || readKeyFromDevVars();
          const hasKey = Boolean(envKey?.trim());
          res.statusCode = 200;
          res.end(
            JSON.stringify({
              available: hasKey,
              model: 'gemini-3.8-flash',
              hasServerKey: hasKey,
            })
          );
          return;
        }

        if (pathname === '/api/ai/generate' && req.method === 'POST') {
          const body = await parseRequestBody(req);
          const envKey = process.env.GEMINI_API_KEY || readKeyFromDevVars();
          const clientKey = (req.headers['x-gemini-api-key'] as string)?.trim();
          const apiKey = clientKey || envKey?.trim();

          if (!apiKey) {
            res.statusCode = 401;
            res.end(
              JSON.stringify({
                error:
                  'Gemini API key is not configured. Please set GEMINI_API_KEY in .dev.vars or provide the X-Gemini-Api-Key header.',
                code: 'MISSING_API_KEY',
              })
            );
            return;
          }

          const prompt = body.prompt?.trim();
          const contents = body.contents || (prompt ? [{ role: 'user', parts: [{ text: prompt }] }] : null);

          if (!contents || contents.length === 0) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Either prompt or contents array is required' }));
            return;
          }

          const model = body.model?.trim() || 'gemini-3.8-flash';
          const isStream = body.stream !== false;

          const googlePayload: Record<string, any> = { contents };
          if (body.systemInstruction) {
            googlePayload.system_instruction = { parts: [{ text: body.systemInstruction }] };
          }
          if (body.generationConfig) {
            googlePayload.generationConfig = body.generationConfig;
          }

          const endpointAction = isStream ? 'streamGenerateContent?alt=sse' : 'generateContent';
          const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:${endpointAction}&key=${encodeURIComponent(apiKey)}`;

          try {
            const upstreamRes = await fetch(googleUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(googlePayload),
            });

            if (!upstreamRes.ok) {
              const errText = await upstreamRes.text();
              let parsedErr: any = null;
              try {
                parsedErr = JSON.parse(errText);
              } catch {
                parsedErr = { error: errText };
              }
              res.statusCode = upstreamRes.status >= 400 && upstreamRes.status < 600 ? upstreamRes.status : 500;
              res.end(
                JSON.stringify({
                  error: parsedErr.error?.message || parsedErr.message || 'Gemini API call failed',
                  upstreamStatus: upstreamRes.status,
                  details: parsedErr,
                })
              );
              return;
            }

            if (isStream) {
              res.writeHead(200, {
                'Content-Type': 'text/event-stream; charset=utf-8',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
              });

              if (upstreamRes.body) {
                const reader = upstreamRes.body.getReader();
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  res.write(value);
                }
              }
              res.end();
            } else {
              const data = await upstreamRes.json();
              res.statusCode = 200;
              res.end(JSON.stringify(data));
            }
          } catch (err: any) {
            console.error('[dev-ai] Gemini gateway error:', err);
            res.statusCode = 502;
            res.end(JSON.stringify({ error: err?.message || 'Failed to connect to Gemini API' }));
          }
          return;
        }

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

        if (pathname === '/api/tools/is-it-down' && req.method === 'GET') {
          const parsedUrl = new URL(req.url, 'http://localhost');
          const rawTarget = parsedUrl.searchParams.get('url');

          if (!rawTarget) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'URL parameter is required' }));
            return;
          }

          let cleanUrl = rawTarget.trim();
          if (!/^https?:\/\//i.test(cleanUrl)) {
            cleanUrl = `https://${cleanUrl}`;
          }

          let parsed: URL;
          try {
            parsed = new URL(cleanUrl);
          } catch {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Invalid URL format' }));
            return;
          }

          const startTime = performance.now();
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          try {
            const probeRes = await fetch(parsed.toString(), {
              method: 'GET',
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Range': 'bytes=0-2048',
              },
              redirect: 'follow',
              signal: controller.signal,
            });
            clearTimeout(timeoutId);

            const latencyMs = Math.round(performance.now() - startTime);
            let status: 'UP' | 'RESTRICTED' | 'DOWN' = 'UP';
            if (probeRes.status >= 500) {
              status = 'DOWN';
            } else if (probeRes.status === 401 || probeRes.status === 403) {
              status = 'RESTRICTED';
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                domain: parsed.hostname,
                targetUrl: parsed.toString(),
                finalUrl: probeRes.url,
                status,
                httpStatus: probeRes.status,
                httpStatusText: probeRes.statusText || 'OK',
                responseTimeMs: latencyMs,
                server: probeRes.headers.get('server') || 'Hidden',
                checkedFrom: 'Vite Local Dev',
                timestamp: Date.now(),
              })
            );
          } catch (err: any) {
            clearTimeout(timeoutId);
            const latencyMs = Math.round(performance.now() - startTime);
            const isTimeout = err.name === 'AbortError';

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                domain: parsed.hostname,
                targetUrl: parsed.toString(),
                finalUrl: parsed.toString(),
                status: 'DOWN',
                httpStatus: isTimeout ? 504 : 0,
                httpStatusText: isTimeout ? 'Gateway Timeout' : 'Connection Failed',
                errorDetails: isTimeout ? 'Connection timed out after 8s' : err.message,
                responseTimeMs: latencyMs,
                server: 'Unavailable',
                checkedFrom: 'Vite Local Dev',
                timestamp: Date.now(),
              })
            );
          }
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

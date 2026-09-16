/// <reference types="@cloudflare/workers-types" />

/**
 * Cloudflare Worker Authentication Backend (Plan A)
 *
 * Implements JWT authentication, Email Magic Link, Google OAuth,
 * and Cloudflare D1 database operations for user accounts and credit quotas.
 */

export interface Env {
  DB?: D1Database;
  JWT_SECRET?: string;
  RESEND_API_KEY?: string;
  APP_URL?: string;
  GOOGLE_CLIENT_ID?: string;
}

interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  plan: 'free' | 'basic' | 'pro';
  credits: number;
  total_usage_count?: number;
  created_at: number;
  updated_at: number;
}

// Default JWT secret fallback for development
const DEFAULT_JWT_SECRET = 'tableview-jwt-secret-development-key-change-in-prod';

// Base64URL encode/decode helpers
function base64UrlEncode(buffer: ArrayBuffer | Uint8Array | string): string {
  let binary = '';
  if (typeof buffer === 'string') {
    const encoder = new TextEncoder();
    return base64UrlEncode(encoder.encode(buffer));
  }
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Sign JWT using HMAC-SHA256
async function signJwt(payload: Record<string, any>, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(dataToSign));
  const encodedSignature = base64UrlEncode(signature);

  return `${dataToSign}.${encodedSignature}`;
}

// Verify JWT using HMAC-SHA256
async function verifyJwt(token: string, secret: string): Promise<Record<string, any> | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const dataToVerify = `${encodedHeader}.${encodedPayload}`;
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signature = base64UrlDecode(encodedSignature);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature as any,
      encoder.encode(dataToVerify)
    );

    if (!isValid) return null;

    const payloadJson = new TextDecoder().decode(base64UrlDecode(encodedPayload));
    const payload = JSON.parse(payloadJson);

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// CORS Headers
function corsHeaders(origin: string = '*'): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

function jsonResponse(data: any, status: number = 200, origin: string = '*'): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '*';
    const secret = env.JWT_SECRET || DEFAULT_JWT_SECRET;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    // Only route /api/auth/* here
    if (!url.pathname.startsWith('/api/auth/')) {
      return new Response('Not Found', { status: 404 });
    }

    try {
      // 1. POST /api/auth/send-magic-link
      if (url.pathname === '/api/auth/send-magic-link' && request.method === 'POST') {
        const body = (await request.json()) as { email?: string };
        const email = body.email?.trim().toLowerCase();

        if (!email || !email.includes('@')) {
          return jsonResponse({ error: 'Valid email address is required' }, 400, origin);
        }

        const token = crypto.randomUUID();
        const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

        if (env.DB) {
          await env.DB.prepare(
            'INSERT INTO verification_tokens (token, email, expires_at) VALUES (?, ?, ?)'
          )
            .bind(token, email, expiresAt)
            .run();
        }

        const appUrl = env.APP_URL || url.origin;
        const magicLink = `${appUrl}/?auth_token=${token}`;

        // Send email via Resend if API key is present
        if (env.RESEND_API_KEY) {
          try {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'TableView <noreply@tableview.dev>',
                to: email,
                subject: 'Sign in to TableView',
                html: `<p>Click the link below to sign in:</p><p><a href="${magicLink}">${magicLink}</a></p><p>This link expires in 15 minutes.</p>`,
              }),
            });
          } catch (e) {
            console.error('Failed to send email via Resend:', e);
          }
        } else {
          console.log(`[Dev Magic Link for ${email}]: ${magicLink}`);
        }

        return jsonResponse(
          {
            success: true,
            message: 'Magic link sent. Please check your inbox.',
            // Include dev token for easy testing when no email provider is configured
            devToken: env.RESEND_API_KEY ? undefined : token,
          },
          200,
          origin
        );
      }

      // 2. POST /api/auth/verify-magic-link
      if (url.pathname === '/api/auth/verify-magic-link' && request.method === 'POST') {
        const body = (await request.json()) as { token?: string };
        const token = body.token?.trim();

        if (!token) {
          return jsonResponse({ error: 'Verification token is required' }, 400, origin);
        }

        let userEmail = 'demo@tableview.dev';

        if (env.DB) {
          const record = await env.DB.prepare(
            'SELECT * FROM verification_tokens WHERE token = ? AND expires_at > ? AND used_at IS NULL'
          )
            .bind(token, Date.now())
            .first<{ token: string; email: string; expires_at: number }>();

          if (!record) {
            return jsonResponse({ error: 'Invalid or expired magic link' }, 400, origin);
          }

          // Mark token as used
          await env.DB.prepare('UPDATE verification_tokens SET used_at = ? WHERE token = ?')
            .bind(Date.now(), token)
            .run();

          userEmail = record.email;

          // Upsert user
          const now = Date.now();
          const existingUser = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
            .bind(userEmail)
            .first<UserRecord>();

          let userId = existingUser?.id;
          if (!existingUser) {
            userId = crypto.randomUUID();
            await env.DB.prepare(
              'INSERT INTO users (id, email, name, plan, credits, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
            )
              .bind(userId, userEmail, userEmail.split('@')[0], 'free', 30, now, now)
              .run();
          }
        }

        const jwtPayload = {
          sub: userEmail,
          email: userEmail,
          plan: 'free',
          exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
        };

        const sessionToken = await signJwt(jwtPayload, secret);

        return jsonResponse(
          {
            success: true,
            token: sessionToken,
            user: {
              email: userEmail,
              name: userEmail.split('@')[0],
              plan: 'free',
              credits: 30,
            },
          },
          200,
          origin
        );
      }

      // 3. POST /api/auth/google
      if (url.pathname === '/api/auth/google' && request.method === 'POST') {
        const body = (await request.json()) as { credential?: string };
        const credential = body.credential;

        if (!credential) {
          return jsonResponse({ error: 'Google credential token is required' }, 400, origin);
        }

        // Verify Google credential token
        let googlePayload: any = null;
        try {
          // Verify against Google's OAuth2 tokeninfo endpoint
          const verifyRes = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
          );
          if (verifyRes.ok) {
            googlePayload = await verifyRes.json();
          } else {
            // Fallback to local JWT decode
            const parts = credential.split('.');
            googlePayload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1])));
          }
        } catch {
          // Fallback to local JWT decode if network call fails
          try {
            const parts = credential.split('.');
            googlePayload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1])));
          } catch {
            return jsonResponse({ error: 'Failed to decode Google token' }, 400, origin);
          }
        }

        const email = googlePayload?.email;
        if (!email) {
          return jsonResponse({ error: 'Invalid Google token: email missing' }, 400, origin);
        }

        const name = googlePayload.name || email.split('@')[0];
        const avatarUrl = googlePayload.picture || null;

        let userCredits = 30;
        let userPlan: 'free' | 'basic' | 'pro' = 'free';

        if (env.DB) {
          try {
            const now = Date.now();
            const existingUser = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
              .bind(email)
              .first<UserRecord>();

            if (existingUser) {
              userCredits = existingUser.credits;
              userPlan = existingUser.plan;
              await env.DB.prepare(
                'UPDATE users SET name = ?, avatar_url = ?, updated_at = ? WHERE email = ?'
              )
                .bind(name, avatarUrl, now, email)
                .run();
            } else {
              const userId = crypto.randomUUID();
              await env.DB.prepare(
                'INSERT INTO users (id, email, name, avatar_url, plan, credits, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
              )
                .bind(userId, email, name, avatarUrl, 'free', 30, now, now)
                .run();
            }
          } catch (dbErr) {
            console.error('[Worker] D1 query/update error during Google auth:', dbErr);
          }
        }

        const jwtPayload = {
          sub: email,
          email,
          name,
          avatarUrl,
          plan: userPlan,
          exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        };

        const sessionToken = await signJwt(jwtPayload, secret);

        return jsonResponse(
          {
            success: true,
            token: sessionToken,
            user: {
              email,
              name,
              avatarUrl,
              plan: userPlan,
              credits: userCredits,
            },
          },
          200,
          origin
        );
      }

      // 4. GET /api/auth/me
      if (url.pathname === '/api/auth/me' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return jsonResponse({ user: null }, 200, origin);
        }

        const token = authHeader.replace('Bearer ', '').trim();
        const payload = await verifyJwt(token, secret);

        if (!payload) {
          return jsonResponse({ user: null }, 200, origin);
        }

        if (env.DB) {
          const dbUser = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
            .bind(payload.email)
            .first<UserRecord>();

          if (dbUser) {
            return jsonResponse(
              {
                user: {
                  id: dbUser.id,
                  email: dbUser.email,
                  name: dbUser.name || dbUser.email.split('@')[0],
                  avatarUrl: dbUser.avatar_url,
                  plan: dbUser.plan,
                  credits: dbUser.credits,
                },
              },
              200,
              origin
            );
          }
        }

        return jsonResponse(
          {
            user: {
              email: payload.email,
              name: payload.name || payload.email.split('@')[0],
              avatarUrl: payload.avatarUrl || null,
              plan: payload.plan || 'free',
              credits: 30,
            },
          },
          200,
          origin
        );
      }

      // 5. POST /api/auth/logout
      if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
        return jsonResponse({ success: true }, 200, origin);
      }

      // 6. POST /api/credits/consume (Records tool usage & deducts credit in D1)
      if (url.pathname === '/api/credits/consume' && request.method === 'POST') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return jsonResponse({ error: 'Unauthorized' }, 401, origin);
        }

        const token = authHeader.replace('Bearer ', '').trim();
        const payload = await verifyJwt(token, secret);
        if (!payload) {
          return jsonResponse({ error: 'Invalid or expired token' }, 401, origin);
        }

        const body = (await request.json().catch(() => ({}))) as {
          amount?: number;
          action?: string;
          fileSizeBytes?: number;
          metadata?: any;
        };
        const amount = Math.max(1, body.amount || 1);
        const action = body.action || 'tool_usage';

        let remainingCredits = 30;

        if (env.DB) {
          try {
            const userRecord = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
              .bind(payload.email)
              .first<UserRecord>();

            if (!userRecord) {
              return jsonResponse({ error: 'User not found' }, 404, origin);
            }

            if (userRecord.credits < amount) {
              return jsonResponse(
                { error: 'Insufficient credits', credits: userRecord.credits },
                403,
                origin
              );
            }

            remainingCredits = userRecord.credits - amount;
            const now = Date.now();

            // Deduct credits and increment total_usage_count
            await env.DB.prepare(
              'UPDATE users SET credits = ?, total_usage_count = COALESCE(total_usage_count, 0) + 1, updated_at = ? WHERE id = ?'
            )
              .bind(remainingCredits, now, userRecord.id)
              .run();

            // Record into usage_logs table
            await env.DB.prepare(
              'INSERT INTO usage_logs (id, user_id, action, credits_spent, balance_after, file_size_bytes, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
            )
              .bind(
                crypto.randomUUID(),
                userRecord.id,
                action,
                amount,
                remainingCredits,
                body.fileSizeBytes || null,
                body.metadata ? JSON.stringify(body.metadata) : null,
                now
              )
              .run();
          } catch (err) {
            console.error('[Worker] Error recording credit consumption in D1:', err);
          }
        }

        return jsonResponse(
          {
            success: true,
            credits: remainingCredits,
            amountDeducted: amount,
          },
          200,
          origin
        );
      }

      // 7. GET /api/user/stats (Returns usage count & logs)
      if (url.pathname === '/api/user/stats' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return jsonResponse({ error: 'Unauthorized' }, 401, origin);
        }

        const token = authHeader.replace('Bearer ', '').trim();
        const payload = await verifyJwt(token, secret);
        if (!payload) {
          return jsonResponse({ error: 'Invalid token' }, 401, origin);
        }

        let totalUsage = 0;
        let recentLogs: any[] = [];

        if (env.DB) {
          try {
            const userRecord = await env.DB.prepare('SELECT id, total_usage_count FROM users WHERE email = ?')
              .bind(payload.email)
              .first<{ id: string; total_usage_count: number }>();

            if (userRecord) {
              totalUsage = userRecord.total_usage_count || 0;
              const logsRes = await env.DB.prepare(
                'SELECT action, credits_spent, balance_after, created_at FROM usage_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 10'
              )
                .bind(userRecord.id)
                .all();
              recentLogs = logsRes.results || [];
            }
          } catch (err) {
            console.error('[Worker] Error fetching user stats from D1:', err);
          }
        }

        return jsonResponse(
          {
            totalUsage,
            recentLogs,
          },
          200,
          origin
        );
      }

      return jsonResponse({ error: 'Endpoint not found' }, 404, origin);
    } catch (err: any) {
      console.error('Worker API error:', err);
      return jsonResponse({ error: err?.message || 'Internal server error' }, 500, origin);
    }
  },
};

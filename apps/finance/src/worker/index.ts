/// <reference types="@cloudflare/workers-types" />

/**
 * Cloudflare Worker Authentication Backend (Plan A)
 *
 * Implements JWT authentication, Email Magic Link, Google OAuth,
 * and Cloudflare D1 database operations for user accounts and credit quotas.
 *
 * Also the ingestion point for client telemetry (POST /api/track), which is
 * routed here from both tableview.dev and track.tableview.dev.
 */

import { handleTelemetryTrack } from './telemetryTrack';
import { getLegacyCrossDomainRedirect } from '../lib/legacyRedirects';
import { handleWebhookRequest } from './billingWebhookRoute';
import { creemAdapter } from './adapters/creem';
import { stripeAdapter } from './adapters/stripe';
import { dodoAdapter } from './adapters/dodo';
import { resolveEntitlements, type SubscriptionRecord, type PurchaseRecord } from './entitlements';

export interface Env {
  DB?: D1Database;
  /** Dedicated D1 database for behaviour telemetry (tableview_logs). */
  tableview_logs?: D1Database;
  JWT_SECRET?: string;
  RESEND_API_KEY?: string;
  APP_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GEMINI_API_KEY?: string;
  ASSETS?: Fetcher;
  BILLING_WEBHOOK_SECRET?: string;
  CREEM_API_KEY?: string;
  CREEM_CHECKOUT_URL?: string;
  STRIPE_SECRET_KEY?: string;
  DODO_PAYMENTS_API_KEY?: string;
  DODO_PAYMENTS_WEBHOOK_SECRET?: string;
  DODO_MODE?: 'test' | 'live';
  DODO_PRODUCT_DEAL_PASS?: string;
  DODO_PRODUCT_PRO_MONTHLY?: string;
  DODO_PRODUCT_PRO_YEARLY?: string;
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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Gemini-Api-Key',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// SSRF Protection: Block private, local, and metadata IP addresses
function isBlockedHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase().trim();
  if (
    lower === 'localhost' ||
    lower.endsWith('.localhost') ||
    lower.endsWith('.local') ||
    lower.endsWith('.internal') ||
    lower.endsWith('.arpa')
  ) {
    return true;
  }

  // Check IPv4 ranges
  const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number);
    if (a === 0 || a === 127 || a === 10) return true; // 0.0.0.0/8, 127.0.0.0/8, 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 Link-local / Cloud metadata
    if (a >= 224) return true; // Multicast & Reserved
  }

  // Check IPv6 loopback / local
  if (
    lower === '::1' ||
    lower === '::' ||
    lower.startsWith('fe80:') ||
    lower.startsWith('fc00:') ||
    lower.startsWith('fd00:')
  ) {
    return true;
  }

  return false;
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

interface AiGenerateRequestBody {
  prompt?: string;
  systemInstruction?: string;
  contents?: Array<{ role?: string; parts: Array<{ text: string }> }>;
  stream?: boolean;
  model?: string;
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
  };
}

async function handleAiGenerate(request: Request, env: Env, origin: string): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, origin);
  }

  const apiKey = request.headers.get('x-gemini-api-key')?.trim() || env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return jsonResponse(
      {
        error:
          'Gemini API key is not configured. Please set GEMINI_API_KEY in Cloudflare Worker secrets or provide the X-Gemini-Api-Key header.',
        code: 'MISSING_API_KEY',
      },
      401,
      origin
    );
  }

  let body: AiGenerateRequestBody;
  try {
    body = (await request.json()) as AiGenerateRequestBody;
  } catch {
    return jsonResponse({ error: 'Invalid JSON request body' }, 400, origin);
  }

  const prompt = body.prompt?.trim();
  const contents = body.contents || (prompt ? [{ role: 'user', parts: [{ text: prompt }] }] : null);

  if (!contents || contents.length === 0) {
    return jsonResponse({ error: 'Either prompt or contents array is required' }, 400, origin);
  }

  const model = body.model?.trim() || 'gemini-3.8-flash';
  const isStream = body.stream !== false;

  const googlePayload: Record<string, any> = {
    contents,
  };

  if (body.systemInstruction) {
    googlePayload.system_instruction = {
      parts: [{ text: body.systemInstruction }],
    };
  }

  if (body.generationConfig) {
    googlePayload.generationConfig = body.generationConfig;
  }

  const endpointAction = isStream ? 'streamGenerateContent?alt=sse' : 'generateContent';
  const keySep = isStream ? '&' : '?';
  const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:${endpointAction}${keySep}key=${encodeURIComponent(apiKey)}`;

  try {
    const upstreamRes = await fetch(googleUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
      return jsonResponse(
        {
          error: parsedErr.error?.message || parsedErr.message || 'Gemini API call failed',
          upstreamStatus: upstreamRes.status,
          details: parsedErr,
        },
        upstreamRes.status >= 400 && upstreamRes.status < 600 ? upstreamRes.status : 500,
        origin
      );
    }

    if (isStream) {
      return new Response(upstreamRes.body, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
          ...corsHeaders(origin),
        },
      });
    } else {
      const data = await upstreamRes.json();
      return jsonResponse(data, 200, origin);
    }
  } catch (err: any) {
    console.error('[Worker] Gemini API gateway error:', err);
    return jsonResponse(
      {
        error: err?.message || 'Failed to connect to Gemini API',
      },
      502,
      origin
    );
  }
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

    // Route static assets or non-API paths
    if (!url.pathname.startsWith('/api/')) {
      const legacyTarget = getLegacyCrossDomainRedirect(url.pathname);
      if (legacyTarget) {
        const destination = `${legacyTarget}${url.search}`;
        return new Response(null, {
          status: 301,
          headers: {
            Location: destination,
            'Cache-Control': 'public, max-age=86400',
          },
        });
      }

      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }
      return new Response('Not Found', { status: 404 });
    }


    try {
      // 0. POST /api/track — client behaviour telemetry (encrypted gzip batch).
      //    Handled before auth routes because it is unauthenticated by design.
      //    tools.tableview.dev and compress.tableview.dev post here cross-origin,
      //    so the response — not just the preflight — must carry CORS headers or
      //    the browser discards it and the SDK retries forever.
      if (url.pathname === '/api/track' && request.method === 'POST') {
        const telemetry = await handleTelemetryTrack(request, env);
        return new Response(telemetry.body, {
          status: telemetry.status,
          headers: { ...Object.fromEntries(telemetry.headers), ...corsHeaders(origin) },
        });
      }

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

      // 8. POST /api/billing/webhook/:provider (Dodo, Creem, Stripe)
      if (url.pathname.startsWith('/api/billing/webhook/') && request.method === 'POST') {
        const provider = url.pathname.replace('/api/billing/webhook/', '').trim().toLowerCase();
        const adapter =
          provider === 'dodo'
            ? dodoAdapter
            : provider === 'creem'
            ? creemAdapter
            : provider === 'stripe'
            ? stripeAdapter
            : null;
        if (!adapter) {
          return jsonResponse({ error: `Unknown billing provider: ${provider}` }, 404, origin);
        }

        const webhookSecret =
          provider === 'dodo'
            ? env.DODO_PAYMENTS_WEBHOOK_SECRET || env.BILLING_WEBHOOK_SECRET || 'dev_billing_secret'
            : env.BILLING_WEBHOOK_SECRET || 'dev_billing_secret';

        return await handleWebhookRequest(
          request,
          { BILLING_WEBHOOK_SECRET: webhookSecret },
          adapter,
          { db: env.DB }
        );
      }

      // 9. POST /api/billing/create-checkout-session
      if (url.pathname === '/api/billing/create-checkout-session' && request.method === 'POST') {
        const body = (await request.json().catch(() => ({}))) as {
          productKey?: 'deal_pass' | 'pro_membership';
          interval?: 'month' | 'year';
          dealId?: string;
          successUrl?: string;
          cancelUrl?: string;
        };

        let userEmail: string | null = null;
        const authHeader = request.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.replace('Bearer ', '').trim();
          const payload = await verifyJwt(token, secret);
          if (payload?.email) {
            userEmail = payload.email;
          }
        }

        const successUrl = body.successUrl || `${url.origin}/?checkout_success=true`;

        // A. If Dodo Payments integration configured (Prioritized when key provided)
        if (env.DODO_PAYMENTS_API_KEY) {
          try {
            const isTest = env.DODO_MODE === 'test' || env.DODO_PAYMENTS_API_KEY.startsWith('test_');
            const dodoBase = isTest ? 'https://test.dodopayments.com' : 'https://live.dodopayments.com';

            const productId =
              body.productKey === 'deal_pass'
                ? env.DODO_PRODUCT_DEAL_PASS || 'pdt_0NoH8a1OCj6WLZs1X4QEp'
                : body.interval === 'month'
                ? env.DODO_PRODUCT_PRO_MONTHLY || 'pdt_0NoH8xSY84Q9x8j4N0b0V'
                : env.DODO_PRODUCT_PRO_YEARLY || 'pdt_0NoH9OyMm3YOX0ump1AbW';

            const metadata: Record<string, string> = {
              productKey: body.productKey || 'deal_pass',
            };
            if (body.dealId) metadata.dealId = body.dealId;
            if (userEmail) metadata.userEmail = userEmail;
            if (body.interval) metadata.interval = body.interval;

            const dodoPayload: Record<string, any> = {
              product_cart: [{ product_id: productId, quantity: 1 }],
              return_url: successUrl,
              metadata,
            };
            if (userEmail) {
              dodoPayload.customer = { email: userEmail };
            }

            const dodoRes = await fetch(`${dodoBase}/checkouts`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${env.DODO_PAYMENTS_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(dodoPayload),
            });

            if (dodoRes.ok) {
              const dodoData = (await dodoRes.json()) as any;
              const checkoutUrl = dodoData.checkout_url || dodoData.payment_link || dodoData.url;
              if (checkoutUrl) {
                return jsonResponse({ checkoutUrl }, 200, origin);
              }
            } else {
              const errBody = await dodoRes.text();
              console.error('[Worker] Dodo checkout creation returned error:', dodoRes.status, errBody);
              return jsonResponse(
                {
                  error: 'Dodo checkout failed',
                  status: dodoRes.status,
                  details: errBody,
                },
                dodoRes.status >= 400 && dodoRes.status < 600 ? dodoRes.status : 502,
                origin
              );
            }
          } catch (err: any) {
            console.error('[Worker] Dodo checkout error:', err);
            return jsonResponse(
              {
                error: 'Dodo checkout network error',
                details: err?.message || String(err),
              },
              500,
              origin
            );
          }
        }

        // B. If Creem live integration configured
        if (env.CREEM_API_KEY && env.CREEM_CHECKOUT_URL) {
          try {
            const creemRes = await fetch('https://api.creem.io/v1/checkouts', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${env.CREEM_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                product_id: body.productKey === 'deal_pass' ? 'prod_deal_pass' : body.interval === 'month' ? 'prod_pro_monthly' : 'prod_pro_yearly',
                customer_email: userEmail,
                success_url: successUrl,
                cancel_url: body.cancelUrl || `${url.origin}/?checkout_canceled=true`,
                metadata: {
                  productKey: body.productKey,
                  dealId: body.dealId || null,
                  userEmail,
                },
              }),
            });
            if (creemRes.ok) {
              const creemData = (await creemRes.json()) as any;
              return jsonResponse({ checkoutUrl: creemData.checkout_url || creemData.url }, 200, origin);
            }
          } catch (err) {
            console.error('[Worker] Creem checkout creation failed:', err);
          }
        }

        // Standard / Fallback Instant Checkout URL
        const simulatedSessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const target = new URL(successUrl);
        target.searchParams.set('checkout_success', 'true');
        target.searchParams.set('product_key', body.productKey || 'deal_pass');
        if (body.dealId) target.searchParams.set('unlocked_deal_id', body.dealId);
        if (body.interval) target.searchParams.set('interval', body.interval);
        target.searchParams.set('session_id', simulatedSessionId);

        return jsonResponse(
          {
            checkoutUrl: target.toString(),
            isSimulated: true,
          },
          200,
          origin
        );
      }

      // 10. GET /api/billing/entitlements
      if (url.pathname === '/api/billing/entitlements' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return jsonResponse(resolveEntitlements({ now: Date.now() }), 200, origin);
        }
        const token = authHeader.replace('Bearer ', '').trim();
        const payload = await verifyJwt(token, secret);
        if (!payload?.email) {
          return jsonResponse(resolveEntitlements({ now: Date.now() }), 200, origin);
        }

        let subscription: SubscriptionRecord | null = null;
        let purchases: PurchaseRecord[] = [];

        if (env.DB) {
          try {
            const customer = await env.DB.prepare(
              'SELECT id FROM billing_customers WHERE email = ? LIMIT 1'
            ).bind(payload.email).first<{ id: string }>();

            if (customer) {
              const subRow = await env.DB.prepare(
                'SELECT status, current_period_end, cancel_at_period_end, provider_price_id FROM billing_subscriptions WHERE customer_id = ? ORDER BY last_event_at DESC LIMIT 1'
              ).bind(customer.id).first<{
                status: string;
                current_period_end: number;
                cancel_at_period_end: number;
                provider_price_id?: string;
              }>();

              if (subRow) {
                subscription = {
                  status: subRow.status,
                  currentPeriodEnd: subRow.current_period_end,
                  cancelAtPeriodEnd: Boolean(subRow.cancel_at_period_end),
                  priceId: subRow.provider_price_id,
                };
              }

              const purchaseRows = await env.DB.prepare(
                'SELECT product_key, resource_id, refunded_at FROM billing_purchases WHERE customer_id = ?'
              ).bind(customer.id).all<{
                product_key: string;
                resource_id: string | null;
                refunded_at: number | null;
              }>();

              purchases = (purchaseRows.results || []).map((r) => ({
                productKey: r.product_key,
                resourceId: r.resource_id,
                refundedAt: r.refunded_at,
              }));
            }
          } catch (err) {
            console.error('[Worker] Error loading entitlements from D1:', err);
          }
        }

        const state = resolveEntitlements({
          subscription,
          purchases,
          now: Date.now(),
        });

        return jsonResponse(state, 200, origin);
      }

      // 11. GET /api/tools/is-it-down?url=... (Website Status & Edge Latency Probe)
      if (url.pathname === '/api/tools/is-it-down' && request.method === 'GET') {
        const rawTarget = url.searchParams.get('url');
        if (!rawTarget) {
          return jsonResponse({ error: 'URL parameter is required' }, 400, origin);
        }

        let cleanUrl = rawTarget.trim();
        if (!/^https?:\/\//i.test(cleanUrl)) {
          cleanUrl = `https://${cleanUrl}`;
        }

        let parsed: URL;
        try {
          parsed = new URL(cleanUrl);
        } catch {
          return jsonResponse({ error: 'Invalid URL format' }, 400, origin);
        }

        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          return jsonResponse({ error: 'Only HTTP and HTTPS protocols are supported' }, 400, origin);
        }

        if (isBlockedHostname(parsed.hostname)) {
          return jsonResponse(
            { error: 'Probing internal, private, or metadata IP ranges is restricted' },
            403,
            origin
          );
        }

        // Cache in Cloudflare Cache API for 30 seconds
        const cacheKey = new Request(url.toString(), request);
        let cache: any = null;
        try {
          cache = (caches as any).default;
          if (cache) {
            const hit = await cache.match(cacheKey);
            if (hit) return hit;
          }
        } catch {
          // Ignore cache errors in local development or test mocks
        }

        const startTime = performance.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
          const resp = await fetch(parsed.toString(), {
            method: 'GET',
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 (TableView-Status-Probe/1.0)',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Range': 'bytes=0-2048',
            },
            redirect: 'follow',
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          const latencyMs = Math.round(performance.now() - startTime);
          const colo = (request as any).cf?.colo || 'Edge';

          let status: 'UP' | 'RESTRICTED' | 'DOWN' = 'UP';
          if (resp.status >= 500) {
            status = 'DOWN';
          } else if (resp.status === 401 || resp.status === 403) {
            status = 'RESTRICTED';
          }

          const result = {
            domain: parsed.hostname,
            targetUrl: parsed.toString(),
            finalUrl: resp.url,
            status,
            httpStatus: resp.status,
            httpStatusText: resp.statusText || (resp.status === 200 ? 'OK' : 'Response Received'),
            responseTimeMs: latencyMs,
            server: resp.headers.get('server') || 'Hidden / Protected',
            checkedFrom: `Cloudflare ${colo}`,
            timestamp: Date.now(),
          };

          const response = jsonResponse(result, 200, origin);
          response.headers.set('Cache-Control', 'public, max-age=30');
          if (cache) {
            try {
              await cache.put(cacheKey, response.clone());
            } catch {
              // Ignore cache put error
            }
          }
          return response;
        } catch (err: any) {
          clearTimeout(timeoutId);
          const latencyMs = Math.round(performance.now() - startTime);
          const isTimeout = err.name === 'AbortError';

          const result = {
            domain: parsed.hostname,
            targetUrl: parsed.toString(),
            finalUrl: parsed.toString(),
            status: 'DOWN' as const,
            httpStatus: isTimeout ? 504 : 0,
            httpStatusText: isTimeout ? 'Gateway Timeout' : 'DNS / Connection Failed',
            errorDetails: isTimeout ? 'Target server timed out after 8,000ms' : (err.message || 'Host unreachable'),
            responseTimeMs: latencyMs,
            server: 'Unavailable',
            checkedFrom: `Cloudflare ${(request as any).cf?.colo || 'Edge'}`,
            timestamp: Date.now(),
          };

          return jsonResponse(result, 200, origin);
        }
      }

      // 9. GET /api/ai/status (Check Gemini AI availability)
      if (url.pathname === '/api/ai/status' && (request.method === 'GET' || request.method === 'HEAD')) {
        const hasKey = Boolean(env.GEMINI_API_KEY?.trim());
        if (request.method === 'HEAD') {
          return new Response(null, {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders(origin),
            },
          });
        }
        return jsonResponse(
          {
            available: hasKey,
            model: 'gemini-3.8-flash',
            hasServerKey: hasKey,
          },
          200,
          origin
        );
      }

      // 10. POST /api/ai/generate (Gemini Streaming & Standard AI Gateway)
      if (url.pathname === '/api/ai/generate') {
        return handleAiGenerate(request, env, origin);
      }

      return jsonResponse({ error: 'Endpoint not found' }, 404, origin);
    } catch (err: any) {
      console.error('Worker API error:', err);
      return jsonResponse({ error: err?.message || 'Internal server error' }, 500, origin);
    }
  },
};

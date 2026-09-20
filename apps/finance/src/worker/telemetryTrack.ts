/// <reference types="@cloudflare/workers-types" />

/**
 * Telemetry ingestion for POST /api/track.
 *
 * The browser SDK (`@tableview/shared/telemetry`) serialises a session batch as
 * JSON, gzips it, then AES-GCM encrypts it, and POSTs the raw bytes. This module
 * is the server half of that contract.
 *
 * It deliberately re-implements the small amount of crypto it needs rather than
 * importing `@tableview/shared`: the Worker is otherwise dependency-free, and
 * pulling the shared barrel (formatting, chart helpers, React-facing modules)
 * into the edge bundle would cost far more than these thirty lines.
 *
 * Storage contract: one row per event in the `tableview_logs` D1 database. The
 * visitor's country comes from the edge (`request.cf.country`) and **no IP
 * address is read or stored** — the product's promise is that nothing identifies
 * a visitor, and country-level reporting is all the analytics needs.
 */

/** Same obfuscated secret the client holds. Not a security boundary. */
const MASKED_KEY_BYTES: number[] = [
  40, 61, 62, 48, 57, 42, 53, 57, 43, 113, 52, 61, 47, 52, 113, 47, 61, 48, 40, 113, 58, 53, 50, 61, 50, 63, 57,
];
const MASK = 0x5c;

/**
 * A single request is capped well above the SDK's own batch size (15) so normal
 * traffic is never truncated, but far below what it would take to abuse the
 * endpoint as a bulk-write primitive.
 */
const MAX_EVENTS_PER_BATCH = 200;

/**
 * D1 rejects a statement with more than 100 bound parameters, and a batch holds
 * at most 100 statements. Rows are therefore 13 columns and batches are chunked.
 */
const MAX_STATEMENTS_PER_BATCH = 100;

const EVENT_TYPES = new Set(['c', 'r', 'e', 'a']);

export interface TelemetryEnv {
  tableview_logs?: D1Database;
}

interface CompactEvent {
  t?: unknown;
  y?: unknown;
  n?: unknown;
  d?: unknown;
}

interface TelemetryBatch {
  sid?: unknown;
  app?: unknown;
  p?: unknown;
  dur?: unknown;
  act?: unknown;
  actions?: unknown;
  errors?: unknown;
  events?: unknown;
}

const INSERT_SQL = `INSERT INTO telemetry_events (
  session_id, app, path, event_type, name, detail, t_offset_ms,
  country, received_at, session_duration_s, session_active_s,
  session_actions, session_errors
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

function resolveSecret(): string {
  return new TextDecoder().decode(new Uint8Array(MASKED_KEY_BYTES.map((b) => b ^ MASK)));
}

async function deriveKey(): Promise<CryptoKey> {
  const secret = resolveSecret().padEnd(16, '0').slice(0, 16);
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
}

/** Decrypts and inflates a wire batch. Returns null for anything malformed. */
export async function decodeTelemetryBatch(body: ArrayBuffer): Promise<TelemetryBatch | null> {
  try {
    const bytes = new Uint8Array(body);
    if (bytes.byteLength <= 12) return null;

    const iv = bytes.slice(0, 12);
    const ciphertext = bytes.slice(12);

    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      await deriveKey(),
      ciphertext
    );

    const inflated = await new Response(
      new Response(plaintext).body!.pipeThrough(new DecompressionStream('gzip'))
    ).text();

    const parsed = JSON.parse(inflated) as TelemetryBatch;
    if (!parsed || !Array.isArray(parsed.events)) return null;
    return parsed;
  } catch {
    // Wrong key, corrupt ciphertext, truncated gzip, invalid JSON — all the same
    // to us: an unusable body.
    return null;
  }
}

const text = (value: unknown, max: number): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  // Strip control characters that would only ever arrive from a tampered client.
  return trimmed.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, max) || null;
};

const int = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : null;

/**
 * Normalises the declared country. The edge supplies an ISO 3166-1 alpha-2 code,
 * or `XX`/`T1` for unknown and Tor. Those carry no signal, so they are dropped
 * rather than polluting the country breakdown.
 */
export function normaliseCountry(cf: unknown): string | null {
  const raw = (cf as { country?: unknown } | undefined)?.country;
  if (typeof raw !== 'string') return null;
  const code = raw.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return null;
  if (code === 'XX' || code === 'T1') return null;
  return code;
}

export async function handleTelemetryTrack(
  request: Request,
  env: TelemetryEnv
): Promise<Response> {
  const db = env.tableview_logs;
  if (!db) {
    // Misconfigured rather than a client error: say so with a retryable status
    // instead of silently discarding the batch.
    return new Response(JSON.stringify({ error: 'Telemetry storage unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const batch = await decodeTelemetryBatch(await request.arrayBuffer());
  if (!batch) {
    return new Response(JSON.stringify({ error: 'Invalid telemetry payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const events = (batch.events as CompactEvent[]).slice(0, MAX_EVENTS_PER_BATCH);

  const sessionId = text(batch.sid, 64) ?? 'unknown';
  const app = text(batch.app, 32) ?? 'unknown';
  const path = text(batch.p, 512);
  const country = normaliseCountry(request.cf);
  const receivedAt = Date.now();
  const durationS = int(batch.dur);
  const activeS = int(batch.act);
  const actions = int(batch.actions);
  const errors = int(batch.errors);

  const statements = events.map((event) => {
    const detail =
      event.d && typeof event.d === 'object'
        ? JSON.stringify(event.d).slice(0, 2000)
        : null;

    return db
      .prepare(INSERT_SQL)
      .bind(
        sessionId,
        app,
        path,
        EVENT_TYPES.has(String(event.y)) ? String(event.y) : 'a',
        text(event.n, 80) ?? 'unknown',
        detail,
        int(event.t),
        country,
        receivedAt,
        durationS,
        activeS,
        actions,
        errors
      );
  });

  for (let i = 0; i < statements.length; i += MAX_STATEMENTS_PER_BATCH) {
    await db.batch(statements.slice(i, i + MAX_STATEMENTS_PER_BATCH));
  }

  // 204: the SDK only needs to know the batch was taken.
  return new Response(null, { status: 204 });
}

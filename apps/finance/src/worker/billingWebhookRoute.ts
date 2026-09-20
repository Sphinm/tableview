/**
 * HTTP entry point for provider webhooks: POST /api/billing/webhook/:provider
 *
 * The ordering of the steps here is the security property:
 *
 *   1. Read the RAW body. Signature schemes sign the exact bytes, so parsing first and
 *      re-serialising later would invalidate the signature (and is a classic bypass).
 *   2. Verify the signature BEFORE normalising or touching the database. An unsigned or
 *      forged request must have zero side effects, including zero writes.
 *   3. Only then process.
 *
 * Response codes are chosen to steer the provider's retry behaviour:
 *   - 200 for anything permanently settled, including duplicates and payloads we do not
 *     handle, because a non-2xx makes the provider retry forever.
 *   - 5xx only for genuinely transient failures, so the retry is wanted.
 *   - 401 for a bad signature, which must never be retried into a success.
 */

import {
  processWebhookEvent,
  type PaymentProviderAdapter,
} from './billingWebhook';

export interface BillingEnv {
  /** Per-provider signing secret. Set with `wrangler secret put`, never committed. */
  BILLING_WEBHOOK_SECRET?: string;
}

/**
 * Compares two strings without leaking their contents through timing.
 *
 * A naive `a === b` exits at the first differing character, which lets an attacker
 * recover a valid signature one character at a time. This always inspects every
 * character and folds the differences together.
 *
 * Note: callers must still use a MAC (HMAC) rather than comparing a raw secret, so that
 * the comparison cannot be forged offline.
 */
export function constantTimeEqual(a: string, b: string): boolean {
  // Length is not secret (it is fixed by the scheme), but early-returning on it is
  // fine and keeps the loop simple.
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export async function handleWebhookRequest(
  request: Request,
  env: BillingEnv,
  adapter: PaymentProviderAdapter,
  deps: { db?: D1Database } = {}
): Promise<Response> {
  // The D1 binding is passed explicitly so the handler has no hidden globals and can be
  // driven by tests with any storage.
  const db = deps.db;

  if (!env.BILLING_WEBHOOK_SECRET) {
    // Misconfiguration, not a client error. 5xx so it surfaces in monitoring instead of
    // looking like a normal success.
    return json({ error: 'Webhook secret not configured' }, 500);
  }

  if (!db) {
    return json({ error: 'Webhook storage not configured' }, 500);
  }

  // 1. A request with no signature header at all is rejected here, without consulting
  //    the adapter. Defense in depth: an adapter that wrongly returned true for a
  //    missing header must not be able to admit an unsigned request.
  if (!request.headers.get(adapter.signatureHeader)) {
    return json({ error: 'Missing signature header' }, 401);
  }

  // 2. Raw bytes, untouched. Signature schemes sign the exact bytes, so the body must
  //    not be parsed and re-serialised before verification.
  const rawBody = await request.text();

  // 3. Verify next. Nothing is normalised or written until this passes.
  let signatureOk = false;
  try {
    signatureOk = await adapter.verifySignature({
      rawBody,
      headers: request.headers,
      secret: env.BILLING_WEBHOOK_SECRET,
    });
  } catch {
    signatureOk = false;
  }

  if (!signatureOk) {
    return json({ error: 'Invalid signature' }, 401);
  }

  // 3. Normalise.
  let event = null;
  try {
    event = adapter.normalize({ rawBody });
  } catch {
    // A payload we cannot parse is permanently unusable; retrying will not help.
    return json({ ok: true, ignored: 'unparseable' }, 200);
  }

  if (!event) {
    // Signed, but not an event this integration acts on. Acknowledge so the provider
    // stops retrying.
    return json({ ok: true, ignored: 'unhandled' }, 200);
  }

  try {
    const outcome = await processWebhookEvent(db, {
      provider: adapter.id,
      event,
      receivedAt: Date.now(),
    });
    return json({ ok: true, outcome }, 200);
  } catch (error) {
    // Transient by assumption: let the provider retry. The event stays unprocessed, so
    // the retry resumes the work.
    return json(
      { error: 'Processing failed', detail: error instanceof Error ? error.message : String(error) },
      500
    );
  }
}

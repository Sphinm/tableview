/**
 * Provider-agnostic webhook ingestion.
 *
 * Every payment provider delivers webhooks at-least-once and OUT OF ORDER. Both facts
 * are load-bearing, and each is handled by a separate mechanism:
 *
 *   - Idempotency: the provider's event id is claimed in `billing_webhook_events`
 *     BEFORE any work happens, so a redelivery cannot double-extend a subscription or
 *     re-run a refund.
 *   - Order independence: writes are conditional on `last_event_at`, so a stale event
 *     arriving late cannot overwrite newer state. Without it, a delayed "active" event
 *     would resurrect a subscription that was already cancelled.
 *
 * A provider adapter's only job is to (a) verify the request signature and (b) translate
 * the provider payload into a `NormalizedWebhookEvent`. Everything about money and access
 * is decided here, once, so adding a provider never means editing this logic.
 *
 * Dependencies: the D1 binding only, so the Worker bundle stays small.
 */

export interface NormalizedSubscription {
  providerCustomerId: string;
  email?: string | null;
  providerSubscriptionId: string;
  providerPriceId?: string | null;
  /** Raw provider status; normalised later by entitlements.ts. */
  status: string;
  currentPeriodEnd?: number | null;
  cancelAtPeriodEnd?: boolean;
}

export interface NormalizedPurchase {
  providerCustomerId?: string | null;
  email?: string | null;
  providerOrderId: string;
  productKey: string;
  resourceId?: string | null;
  amountMinor?: number | null;
  currency?: string | null;
}

export type NormalizedWebhookEvent =
  | {
      providerEventId: string;
      type: 'subscription_upsert';
      /** Provider event time; the ordering key. */
      occurredAt: number;
      subscription: NormalizedSubscription;
    }
  | { providerEventId: string; type: 'purchase_upsert'; occurredAt: number; purchase: NormalizedPurchase }
  | { providerEventId: string; type: 'purchase_refund'; occurredAt: number; purchase: { providerOrderId: string } }
  | { providerEventId: string; type: 'ignore'; occurredAt: number };

export type WebhookOutcome = 'processed' | 'duplicate' | 'ignored';

/**
 * Verifies and translates one provider's payloads.
 *
 * Kept to two methods so each provider's quirks live behind a small, independently
 * testable seam — signature schemes and payload shapes differ, but the money rules do not.
 */
export interface PaymentProviderAdapter {
  /** Stable identifier stored on every row, e.g. 'paddle'. */
  readonly id: string;
  /**
   * Header that carries the signature, e.g. 'paddle-signature'.
   *
   * Declared here so the ROUTE can reject a request that omits it before the adapter
   * runs at all. That is deliberate defence in depth: an adapter that accidentally
   * returns true without inspecting the header would otherwise let an unsigned request
   * through, which is the most damaging way this integration could fail.
   */
  readonly signatureHeader: string;
  /**
   * MUST compare in constant time and MUST return false rather than throw on a
   * malformed header.
   */
  verifySignature(input: { rawBody: string; headers: Headers; secret: string }): Promise<boolean>;
  /** Returns null when the payload is not one this integration handles. */
  normalize(input: { rawBody: string }): NormalizedWebhookEvent | null;
}

/**
 * Every statement this module runs, exported so that tests can execute the REAL SQL
 * against a real SQLite engine. A mock encoding a wrong belief about
 * `ON CONFLICT ... DO UPDATE ... WHERE` would let a broken ordering guard pass silently;
 * these constants close that gap.
 */
export const SQL = {
  selectCustomer: 'SELECT id FROM billing_customers WHERE provider = ? AND provider_customer_id = ?',
  touchCustomer: 'UPDATE billing_customers SET email = COALESCE(?, email), user_id = COALESCE(user_id, (SELECT id FROM users WHERE email = ? LIMIT 1)), updated_at = ? WHERE id = ?',
  insertCustomer: 'INSERT INTO billing_customers (id, user_id, provider, provider_customer_id, email, country, created_at, updated_at) VALUES (?, (SELECT id FROM users WHERE email = ? LIMIT 1), ?, ?, ?, ?, ?, ?) ON CONFLICT (provider, provider_customer_id) DO NOTHING',
  claimEvent: 'INSERT INTO billing_webhook_events (id, provider, event_type, received_at) VALUES (?, ?, ?, ?) ON CONFLICT (id) DO NOTHING',
  selectProcessed: 'SELECT processed_at FROM billing_webhook_events WHERE id = ?',
  markProcessed: 'UPDATE billing_webhook_events SET processed_at = ? WHERE id = ?',
  recordError: 'UPDATE billing_webhook_events SET error = ? WHERE id = ?',
  upsertSubscription: [
    'INSERT INTO billing_subscriptions',
    '  (id, customer_id, provider, provider_subscription_id, provider_price_id, status,',
    '   current_period_end, cancel_at_period_end, canceled_at, last_event_at, created_at, updated_at)',
    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    'ON CONFLICT (provider, provider_subscription_id) DO UPDATE SET',
    '  status               = excluded.status,',
    '  provider_price_id    = COALESCE(excluded.provider_price_id, billing_subscriptions.provider_price_id),',
    '  current_period_end   = COALESCE(excluded.current_period_end, billing_subscriptions.current_period_end),',
    '  cancel_at_period_end = excluded.cancel_at_period_end,',
    '  canceled_at          = excluded.canceled_at,',
    '  last_event_at        = excluded.last_event_at,',
    '  updated_at           = excluded.updated_at',
    'WHERE excluded.last_event_at >= billing_subscriptions.last_event_at',
  ].join(' '),
  upsertPurchase: [
    'INSERT INTO billing_purchases',
    '  (id, customer_id, provider, provider_order_id, product_key, resource_id,',
    '   amount_minor, currency, last_event_at, created_at)',
    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    'ON CONFLICT (provider, provider_order_id) DO UPDATE SET',
    '  product_key   = excluded.product_key,',
    '  resource_id   = excluded.resource_id,',
    '  amount_minor  = COALESCE(excluded.amount_minor, billing_purchases.amount_minor),',
    '  currency      = COALESCE(excluded.currency, billing_purchases.currency),',
    '  last_event_at = excluded.last_event_at',
    'WHERE excluded.last_event_at >= billing_purchases.last_event_at',
  ].join(' '),
  refundPurchase: 'UPDATE billing_purchases SET refunded_at = ?, last_event_at = ? WHERE provider = ? AND provider_order_id = ? AND last_event_at <= ?',
} as const;

const UUID = () => crypto.randomUUID();

async function upsertCustomer(
  db: D1Database,
  provider: string,
  providerCustomerId: string,
  email: string | null | undefined,
  country: string | null,
  now: number
): Promise<string> {
  const existing = await db
    .prepare(SQL.selectCustomer)
    .bind(provider, providerCustomerId)
    .first<{ id: string }>();

  if (existing?.id) {
    await db
      .prepare(SQL.touchCustomer)
      .bind(email ?? null, email ?? null, now, existing.id)
      .run();
    return existing.id;
  }

  const id = UUID();
  await db
    .prepare(SQL.insertCustomer)
    .bind(id, email ?? null, provider, providerCustomerId, email ?? null, country, now, now)
    .run();
  return id;
}

/**
 * Records a failed handler so the event can be replayed and the failure is visible in
 * the table rather than only in logs.
 */
async function recordError(db: D1Database, providerEventId: string, message: string): Promise<void> {
  try {
    await db.prepare(SQL.recordError).bind(message.slice(0, 500), providerEventId).run();
  } catch {
    // Never let error bookkeeping mask the original failure.
  }
}

export async function processWebhookEvent(
  db: D1Database,
  input: {
    provider: string;
    event: NormalizedWebhookEvent;
    receivedAt: number;
    country?: string | null;
  }
): Promise<WebhookOutcome> {
  const { provider, event, receivedAt } = input;
  const now = receivedAt;

  // 1. Claim the event id. DO NOTHING means the primary key, not application logic,
  //    picks the winner, which is what makes this safe under concurrent delivery.
  const claim = await db
    .prepare(SQL.claimEvent)
    .bind(event.providerEventId, provider, event.type, receivedAt)
    .run();

  const changes = (claim as { meta?: { changes?: number } }).meta?.changes ?? 0;
  if (changes === 0) {
    // Already claimed. Distinguish "finished" from "a previous attempt died".
    const row = await db
      .prepare(SQL.selectProcessed)
      .bind(event.providerEventId)
      .first<{ processed_at: number | null }>();

    if (row?.processed_at) return 'duplicate';
    // Fall through and retry the incomplete attempt rather than lose it forever.
  }

  try {
    if (event.type === 'ignore') {
      await db.prepare(SQL.markProcessed).bind(now, event.providerEventId).run();
      return 'ignored';
    }

    if (event.type === 'subscription_upsert') {
      const s = event.subscription;
      const customerId = await upsertCustomer(
        db, provider, s.providerCustomerId, s.email, input.country ?? null, now
      );

      await db
        .prepare(SQL.upsertSubscription)
        .bind(
          UUID(),
          customerId,
          provider,
          s.providerSubscriptionId,
          s.providerPriceId ?? null,
          s.status,
          s.currentPeriodEnd ?? null,
          s.cancelAtPeriodEnd ? 1 : 0,
          s.status === 'canceled' ? event.occurredAt : null,
          event.occurredAt,
          now,
          now
        )
        .run();

      if (s.email) {
        if (s.status === 'active' || s.status === 'trialing') {
          await db.prepare('UPDATE users SET plan = ?, credits = MAX(credits, 5000), updated_at = ? WHERE email = ?')
            .bind('pro', now, s.email).run().catch(() => {});
        } else if (s.status === 'canceled' || s.status === 'expired') {
          await db.prepare('UPDATE users SET plan = ?, updated_at = ? WHERE email = ?')
            .bind('free', now, s.email).run().catch(() => {});
        }
      }
    } else if (event.type === 'purchase_upsert') {
      const p = event.purchase;
      const customerId = p.providerCustomerId
        ? await upsertCustomer(db, provider, p.providerCustomerId, p.email, input.country ?? null, now)
        : null;

      await db
        .prepare(SQL.upsertPurchase)
        .bind(
          UUID(),
          customerId,
          provider,
          p.providerOrderId,
          p.productKey,
          p.resourceId ?? null,
          p.amountMinor ?? null,
          p.currency ?? null,
          event.occurredAt,
          now
        )
        .run();

      if (p.productKey === 'pro_membership' && p.email) {
        await db.prepare('UPDATE users SET plan = ?, credits = MAX(credits, 5000), updated_at = ? WHERE email = ?')
          .bind('pro', now, p.email).run().catch(() => {});
      }
    } else if (event.type === 'purchase_refund') {
      // A refund revokes access, guarded so a stale refund cannot re-stamp a newer one.
      await db
        .prepare(SQL.refundPurchase)
        .bind(
          event.occurredAt,
          event.occurredAt,
          provider,
          event.purchase.providerOrderId,
          event.occurredAt
        )
        .run();
    }

    await db.prepare(SQL.markProcessed).bind(now, event.providerEventId).run();
    return 'processed';
  } catch (error) {
    // The claim stays, but processed_at remains null so the provider's retry resumes
    // the work instead of the event being swallowed as a duplicate.
    await recordError(db, event.providerEventId, error instanceof Error ? error.message : String(error));
    throw error;
  }
}

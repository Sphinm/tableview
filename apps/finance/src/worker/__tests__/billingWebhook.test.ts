import { describe, it, expect } from 'bun:test';
import { processWebhookEvent, type NormalizedWebhookEvent } from '../billingWebhook';

/**
 * Minimal in-memory stand-in for D1 that actually implements the three semantics the
 * handler depends on: the idempotency claim, the conditional subscription upsert, and
 * the conditional refund. A recording-only mock would let a broken WHERE clause pass.
 */
class FakeD1 {
  claims = new Set<string>();
  processed = new Set<string>();
  subs = new Map<string, any>();
  purchases = new Map<string, any>();
  statements: string[] = [];

  prepare(sql: string) {
    const db = this;
    const norm = sql.replace(/\s+/g, ' ').trim();
    const make = (params: unknown[]) => ({
      sql: norm,
      params,
      async run() {
        db.statements.push(norm);
        // Claim: INSERT OR IGNORE semantics on the event id.
        if (norm.includes('INSERT INTO billing_webhook_events')) {
          const id = String(params[0]);
          if (db.claims.has(id)) return { success: true, meta: { changes: 0 } };
          db.claims.add(id);
          return { success: true, meta: { changes: 1 } };
        }
        if (norm.includes('UPDATE billing_webhook_events SET processed_at')) {
          db.processed.add(String(params[1] ?? params[0]));
          return { success: true, meta: { changes: 1 } };
        }
        // Conditional subscription upsert, honouring the ordering guard.
        if (norm.includes('INSERT INTO billing_subscriptions')) {
          // Binding order: id, customer_id, provider, provider_subscription_id,
          // provider_price_id, status, current_period_end, cancel_at_period_end,
          // canceled_at, last_event_at, created_at, updated_at
          const key = params[2] + '|' + params[3];
          const lastEventAt = Number(params[9]);
          const existing = db.subs.get(key);
          if (existing && lastEventAt < existing.last_event_at) {
            return { success: true, meta: { changes: 0 } };
          }
          db.subs.set(key, {
            status: params[5], current_period_end: params[6],
            cancel_at_period_end: params[7], last_event_at: lastEventAt,
          });
          return { success: true, meta: { changes: 1 } };
        }
        if (norm.includes('INSERT INTO billing_purchases')) {
          // Binding order: id, customer_id, provider, provider_order_id, product_key,
          // resource_id, amount_minor, currency, last_event_at, created_at
          // (refunded_at is not part of the INSERT; it defaults to NULL.)
          const key = params[2] + '|' + params[3];
          const lastEventAt = Number(params[8]);
          const existing = db.purchases.get(key);
          if (existing && lastEventAt < existing.last_event_at) {
            return { success: true, meta: { changes: 0 } };
          }
          db.purchases.set(key, { refunded_at: existing?.refunded_at ?? null, last_event_at: lastEventAt });
          return { success: true, meta: { changes: 1 } };
        }
        if (norm.includes('UPDATE billing_purchases SET refunded_at')) {
          for (const p of db.purchases.values()) p.refunded_at = params[0];
          return { success: true, meta: { changes: 1 } };
        }
        if (norm.includes('INSERT INTO billing_customers')) {
          return { success: true, meta: { changes: 1 } };
        }
        return { success: true, meta: { changes: 1 } };
      },
      async first() {
        if (norm.includes('SELECT processed_at FROM billing_webhook_events')) {
          const id = String(params[0]);
          return { processed_at: db.processed.has(id) ? 1 : null };
        }
        if (norm.includes('SELECT id FROM billing_customers')) return null;
        return null;
      },
    });
    return { bind: (...p: unknown[]) => make(p) };
  }
}

const subEvent = (over: Partial<NormalizedWebhookEvent> = {}): NormalizedWebhookEvent => ({
  providerEventId: 'evt_1',
  type: 'subscription_upsert',
  occurredAt: 1000,
  subscription: {
    providerCustomerId: 'cus_1',
    email: 'buyer@example.com',
    providerSubscriptionId: 'sub_1',
    providerPriceId: 'price_pro_monthly',
    status: 'active',
    currentPeriodEnd: 9_000_000,
    cancelAtPeriodEnd: false,
  },
  ...over,
});

describe('processWebhookEvent — idempotency', () => {
  it('processes a new subscription event', async () => {
    const db = new FakeD1();
    const outcome = await processWebhookEvent(db as any, { provider: 'paddle', event: subEvent(), receivedAt: 1 });
    expect(outcome).toBe('processed');
    expect(db.subs.size).toBe(1);
  });

  it('treats a redelivery of the same event id as a duplicate and does not reapply it', async () => {
    const db = new FakeD1();
    await processWebhookEvent(db as any, { provider: 'paddle', event: subEvent(), receivedAt: 1 });
    const before = JSON.stringify([...db.subs.entries()]);

    const second = await processWebhookEvent(db as any, {
      provider: 'paddle',
      event: subEvent({ subscription: { ...subEvent().subscription!, status: 'canceled' } }),
      receivedAt: 2,
    });

    expect(second).toBe('duplicate');
    expect(JSON.stringify([...db.subs.entries()])).toBe(before);
  });

  it('marks the event processed so a later redelivery is a no-op', async () => {
    const db = new FakeD1();
    await processWebhookEvent(db as any, { provider: 'paddle', event: subEvent(), receivedAt: 1 });
    expect(db.processed.has('evt_1')).toBe(true);
  });
});

describe('processWebhookEvent — out-of-order delivery', () => {
  it('ignores an older event that would resurrect a cancelled subscription', async () => {
    const db = new FakeD1();
    // Newer event first: cancellation.
    await processWebhookEvent(db as any, {
      provider: 'paddle',
      event: subEvent({
        providerEventId: 'evt_new',
        occurredAt: 5000,
        subscription: { ...subEvent().subscription!, status: 'canceled', cancelAtPeriodEnd: false },
      }),
      receivedAt: 1,
    });
    // Then a stale, older "active" arrives late (providers do not order deliveries).
    await processWebhookEvent(db as any, {
      provider: 'paddle',
      event: subEvent({ providerEventId: 'evt_old', occurredAt: 1000, subscription: { ...subEvent().subscription!, status: 'active' } }),
      receivedAt: 2,
    });

    const stored = [...db.subs.values()][0];
    expect(stored.status).toBe('canceled');
  });

  it('applies a newer event over an older one', async () => {
    const db = new FakeD1();
    await processWebhookEvent(db as any, {
      provider: 'paddle',
      event: subEvent({ providerEventId: 'evt_a', occurredAt: 1000 }),
      receivedAt: 1,
    });
    await processWebhookEvent(db as any, {
      provider: 'paddle',
      event: subEvent({
        providerEventId: 'evt_b',
        occurredAt: 2000,
        subscription: { ...subEvent().subscription!, status: 'past_due' },
      }),
      receivedAt: 2,
    });
    expect([...db.subs.values()][0].status).toBe('past_due');
  });
});

describe('processWebhookEvent — purchases and refunds', () => {
  const purchaseEvent = (over: Partial<NormalizedWebhookEvent> = {}): NormalizedWebhookEvent => ({
    providerEventId: 'evt_p1',
    type: 'purchase_upsert',
    occurredAt: 1000,
    purchase: {
      providerCustomerId: 'cus_1',
      email: 'buyer@example.com',
      providerOrderId: 'ord_1',
      productKey: 'deal_pass',
      resourceId: 'deal_42',
      amountMinor: 999,
      currency: 'USD',
    },
    ...over,
  });

  it('records a one-off purchase', async () => {
    const db = new FakeD1();
    const outcome = await processWebhookEvent(db as any, { provider: 'paddle', event: purchaseEvent(), receivedAt: 1 });
    expect(outcome).toBe('processed');
    expect(db.purchases.size).toBe(1);
  });

  it('applies a refund so the purchase stops granting access', async () => {
    const db = new FakeD1();
    await processWebhookEvent(db as any, { provider: 'paddle', event: purchaseEvent(), receivedAt: 1 });
    const outcome = await processWebhookEvent(db as any, {
      provider: 'paddle',
      event: { providerEventId: 'evt_r1', type: 'purchase_refund', occurredAt: 2000, purchase: { providerOrderId: 'ord_1' } as any },
      receivedAt: 2,
    });
    expect(outcome).toBe('processed');
    expect([...db.purchases.values()][0].refunded_at).toBe(2000);
  });
});

describe('processWebhookEvent — unknown events', () => {
  it('ignores an event type it does not handle, but still claims it', async () => {
    const db = new FakeD1();
    const outcome = await processWebhookEvent(db as any, {
      provider: 'paddle',
      event: { providerEventId: 'evt_x', type: 'ignore', occurredAt: 1 },
      receivedAt: 1,
    });
    expect(outcome).toBe('ignored');
    expect(db.claims.has('evt_x')).toBe(true);
  });

  it('records the failure and releases the claim so a retry can succeed', async () => {
    const db = new FakeD1();
    const boom = new Error('db exploded');
    const original = db.prepare.bind(db);
    let call = 0;
    (db as any).prepare = (sql: string) => {
      call++;
      if (call === 3) throw boom;   // fail mid-processing
      return original(sql);
    };

    await expect(
      processWebhookEvent(db as any, { provider: 'paddle', event: subEvent(), receivedAt: 1 })
    ).rejects.toThrow();

    // The claim exists but is NOT marked processed, so the provider's retry can finish
    // the job rather than being swallowed forever as a duplicate.
    expect(db.claims.has('evt_1')).toBe(true);
    expect(db.processed.has('evt_1')).toBe(false);
  });
});

import { describe, it, expect, beforeEach } from 'bun:test';
import { Database } from 'bun:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { processWebhookEvent, type NormalizedWebhookEvent } from '../billingWebhook';

/**
 * Integration test: runs the REAL migration and the REAL production SQL against a real
 * SQLite engine.
 *
 * The unit tests use a hand-written mock, which encodes the author's belief about what
 * `ON CONFLICT ... DO UPDATE ... WHERE` does. If that belief is wrong, they pass while
 * production corrupts subscription state. This test removes that gap: it loads
 * migrations/0003_billing.sql from disk and drives processWebhookEvent through a thin
 * D1-compatible adapter over bun:sqlite.
 */

const MIGRATIONS = ['0001_auth.sql', '0003_billing.sql'];

/** Minimal D1 shim over bun:sqlite, exposing only what the handler uses. */
function d1Over(db: Database) {
  return {
    prepare(sql: string) {
      const binding = (params: unknown[]) => ({
        sql,
        params,
        async run() {
          const info = db.run(sql, params as any[]);
          // D1 reports affected rows as meta.changes; bun:sqlite as .changes.
          return { success: true, meta: { changes: Number(info.changes ?? 0) } };
        },
        async first<T>() {
          const row = db.query(sql).get(...(params as any[]));
          return (row ?? null) as T | null;
        },
      });
      return { bind: (...p: unknown[]) => binding(p) };
    },
  } as any;
}

function freshDb(): Database {
  const db = new Database(':memory:');
  for (const file of MIGRATIONS) {
    const sql = fs.readFileSync(
      path.join(import.meta.dir, '..', '..', '..', 'migrations', file),
      'utf8'
    );
    db.run(sql);
  }
  return db;
}

const subEvent = (over: Partial<Extract<NormalizedWebhookEvent, { type: 'subscription_upsert' }>> = {}) =>
  ({
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
  }) as NormalizedWebhookEvent;

let sqlite: Database;
let db: any;
beforeEach(() => {
  sqlite = freshDb();
  db = d1Over(sqlite);
});

describe('billing schema + webhook SQL against real SQLite', () => {
  it('applies the migration files without error', () => {
    const tables = sqlite
      .query("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'billing%' ORDER BY name")
      .all() as Array<{ name: string }>;
    expect(tables.map((t) => t.name)).toEqual([
      'billing_customers',
      'billing_purchases',
      'billing_subscriptions',
      'billing_webhook_events',
    ]);
  });

  it('persists a subscription end to end', async () => {
    const outcome = await processWebhookEvent(db, { provider: 'paddle', event: subEvent(), receivedAt: 1 });
    expect(outcome).toBe('processed');

    const row = sqlite.query('SELECT status, current_period_end, last_event_at FROM billing_subscriptions').get() as any;
    expect(row.status).toBe('active');
    expect(row.current_period_end).toBe(9_000_000);
    expect(row.last_event_at).toBe(1000);
  });

  it('does not resurrect a cancelled subscription when a stale event arrives late', async () => {
    // Real-world sequence: cancellation is delivered first, then an older 'active'
    // event shows up late. Providers do not guarantee order.
    await processWebhookEvent(db, {
      provider: 'paddle',
      event: subEvent({
        providerEventId: 'evt_new',
        occurredAt: 5000,
        subscription: { ...subEvent().subscription, status: 'canceled' } as any,
      }),
      receivedAt: 1,
    });
    await processWebhookEvent(db, {
      provider: 'paddle',
      event: subEvent({ providerEventId: 'evt_old', occurredAt: 1000 }),
      receivedAt: 2,
    });

    const row = sqlite.query('SELECT status, last_event_at FROM billing_subscriptions').get() as any;
    expect(row.status).toBe('canceled');
    expect(row.last_event_at).toBe(5000);
  });

  it('is idempotent: a redelivered event changes nothing', async () => {
    await processWebhookEvent(db, { provider: 'paddle', event: subEvent(), receivedAt: 1 });
    const before = sqlite.query('SELECT status, last_event_at FROM billing_subscriptions').get();

    const second = await processWebhookEvent(db, {
      provider: 'paddle',
      // Same id, but a different body — must still be ignored.
      event: subEvent({ subscription: { ...subEvent().subscription, status: 'canceled' } as any }),
      receivedAt: 2,
    });

    expect(second).toBe('duplicate');
    expect(sqlite.query('SELECT status, last_event_at FROM billing_subscriptions').get()).toEqual(before);
    expect((sqlite.query('SELECT COUNT(*) AS n FROM billing_webhook_events').get() as any).n).toBe(1);
  });

  it('records a purchase, then revokes it on refund', async () => {
    await processWebhookEvent(db, {
      provider: 'paddle',
      event: {
        providerEventId: 'evt_p',
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
      },
      receivedAt: 1,
    });

    let row = sqlite.query('SELECT product_key, resource_id, amount_minor, refunded_at FROM billing_purchases').get() as any;
    expect(row.product_key).toBe('deal_pass');
    expect(row.amount_minor).toBe(999);
    expect(row.refunded_at).toBeNull();

    await processWebhookEvent(db, {
      provider: 'paddle',
      event: { providerEventId: 'evt_r', type: 'purchase_refund', occurredAt: 2000, purchase: { providerOrderId: 'ord_1' } },
      receivedAt: 2,
    });

    row = sqlite.query('SELECT refunded_at, last_event_at FROM billing_purchases').get() as any;
    expect(row.refunded_at).toBe(2000);
    expect(row.last_event_at).toBe(2000);
  });

  it('keeps amounts exact in integer minor units (never a float)', async () => {
    await processWebhookEvent(db, {
      provider: 'paddle',
      event: {
        providerEventId: 'evt_money',
        type: 'purchase_upsert',
        occurredAt: 1,
        purchase: { providerOrderId: 'ord_9', productKey: 'deal_pass', amountMinor: 1999, currency: 'USD' },
      },
      receivedAt: 1,
    });
    const row = sqlite.query('SELECT amount_minor, typeof(amount_minor) AS t FROM billing_purchases').get() as any;
    expect(row.amount_minor).toBe(1999);
    expect(row.t).toBe('integer');
  });

  it('leaves processed_at NULL when handling fails, so a retry can finish the job', async () => {
    const failing = {
      prepare(sql: string) {
        // Fail the subscription upsert specifically.
        if (sql.includes('INSERT INTO billing_subscriptions')) {
          return {
            bind: () => ({ run: async () => { throw new Error('simulated outage'); } }),
          };
        }
        return (db as any).prepare(sql);
      },
    } as any;

    await expect(
      processWebhookEvent(failing, { provider: 'paddle', event: subEvent(), receivedAt: 1 })
    ).rejects.toThrow('simulated outage');

    const ev = sqlite.query('SELECT processed_at, error FROM billing_webhook_events WHERE id = ?').get('evt_1') as any;
    expect(ev.processed_at).toBeNull();
    expect(ev.error).toContain('simulated outage');
  });
});

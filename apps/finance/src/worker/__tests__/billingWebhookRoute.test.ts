import { describe, it, expect } from 'bun:test';
import { constantTimeEqual, handleWebhookRequest } from '../billingWebhookRoute';
import type { NormalizedWebhookEvent, PaymentProviderAdapter } from '../billingWebhook';

function recordingDb() {
  const claims = new Set<string>();
  const processed = new Set<string>();
  const statements: string[] = [];
  const db = {
    prepare(sql: string) {
      const norm = sql.replace(/\s+/g, ' ').trim();
      return {
        bind: (...params: unknown[]) => ({
          async run() {
            statements.push(norm);
            if (norm.includes('INSERT INTO billing_webhook_events')) {
              const id = String(params[0]);
              if (claims.has(id)) return { success: true, meta: { changes: 0 } };
              claims.add(id);
              return { success: true, meta: { changes: 1 } };
            }
            if (norm.includes('UPDATE billing_webhook_events SET processed_at')) {
              processed.add(String(params[1]));
              return { success: true, meta: { changes: 1 } };
            }
            return { success: true, meta: { changes: 1 } };
          },
          async first() {
            if (norm.includes('SELECT processed_at')) {
              return { processed_at: processed.has(String(params[0])) ? 1 : null };
            }
            return null;
          },
        }),
      };
    },
  } as any;
  return { db, claims, processed, statements };
}

const event = (): NormalizedWebhookEvent => ({
  providerEventId: 'evt_1',
  type: 'ignore',
  occurredAt: 1,
});

function adapter(over: Partial<PaymentProviderAdapter> = {}): PaymentProviderAdapter {
  return {
    id: 'paddle',
    signatureHeader: 'paddle-signature',
    verifySignature: async () => true,
    normalize: () => event(),
    ...over,
  };
}

const req = (body = '{}', headers: Record<string, string> = {}) =>
  new Request('https://tableview.dev/api/billing/webhook/paddle', {
    method: 'POST',
    body,
    headers: { 'content-type': 'application/json', ...headers },
  });

const env = { BILLING_WEBHOOK_SECRET: 'whsec_test' } as any;

describe('constantTimeEqual', () => {
  it('compares equal strings as equal', () => {
    expect(constantTimeEqual('abcdef', 'abcdef')).toBe(true);
  });
  it('rejects different strings', () => {
    expect(constantTimeEqual('abcdef', 'abcdeg')).toBe(false);
  });
  it('rejects different lengths', () => {
    expect(constantTimeEqual('abcdef', 'abcde')).toBe(false);
  });
  it('rejects empty vs non-empty', () => {
    expect(constantTimeEqual('', 'a')).toBe(false);
  });
  it('handles multi-byte characters without throwing', () => {
    expect(constantTimeEqual('签名', '签名')).toBe(true);
    expect(constantTimeEqual('签名', '签 名')).toBe(false);
  });
});

describe('handleWebhookRequest', () => {
  it('rejects a request with no signature header and writes nothing', async () => {
    const { db, claims } = recordingDb();
    const res = await handleWebhookRequest(req(), env, adapter(), { db });
    expect(res.status).toBe(401);
    expect(claims.size).toBe(0);
  });

  it('rejects a missing signature header WITHOUT even calling the adapter', async () => {
    // Guards against a buggy adapter that returns true unconditionally.
    const { db } = recordingDb();
    let called = false;
    const res = await handleWebhookRequest(
      req(),
      env,
      adapter({ verifySignature: async () => { called = true; return true; } }),
      { db }
    );
    expect(res.status).toBe(401);
    expect(called).toBe(false);
  });

  it('rejects a forged signature and writes nothing', async () => {
    const { db, claims } = recordingDb();
    const res = await handleWebhookRequest(
      req('{}', { 'paddle-signature': 'ts=1;h1=deadbeef' }),
      env,
      adapter({ verifySignature: async () => false }),
      { db }
    );
    expect(res.status).toBe(401);
    expect(claims.size).toBe(0);
  });

  it('processes a correctly signed event', async () => {
    const { db, processed } = recordingDb();
    const res = await handleWebhookRequest(
      req('{}', { 'paddle-signature': 'ts=1;h1=good' }),
      env,
      adapter(),
      { db }
    );
    expect(res.status).toBe(200);
    expect(processed.has('evt_1')).toBe(true);
  });

  it('answers 200 for a duplicate so the provider stops retrying', async () => {
    const { db } = recordingDb();
    const first = await handleWebhookRequest(req('{}', { 'paddle-signature': 'ok' }), env, adapter(), { db });
    const second = await handleWebhookRequest(req('{}', { 'paddle-signature': 'ok' }), env, adapter(), { db });
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
  });

  it('answers 200 for an unhandled payload rather than triggering endless retries', async () => {
    const { db } = recordingDb();
    const res = await handleWebhookRequest(
      req('{}', { 'paddle-signature': 'ok' }),
      env,
      adapter({ normalize: () => null }),
      { db }
    );
    expect(res.status).toBe(200);
  });

  it('answers 5xx on a processing failure so the provider retries', async () => {
    const { db } = recordingDb();
    const broken = {
      prepare(sql: string) {
        if (sql.includes('INSERT INTO billing_webhook_events')) {
          return { bind: () => ({ run: async () => { throw new Error('db down'); } }) };
        }
        return (db as any).prepare(sql);
      },
    } as any;
    const res = await handleWebhookRequest(req('{}', { 'paddle-signature': 'ok' }), env, adapter(), { db: broken });
    expect(res.status).toBeGreaterThanOrEqual(500);
  });

  it('answers 500 when the webhook secret is not configured, so it is noticed', async () => {
    const { db } = recordingDb();
    const res = await handleWebhookRequest(req('{}', { 'paddle-signature': 'ok' }), {} as any, adapter(), { db });
    expect(res.status).toBe(500);
  });

  it('never trusts a normalized event when verification fails, even if the body parses', async () => {
    const { db, statements } = recordingDb();
    let normalizeCalled = false;
    await handleWebhookRequest(
      req('{}', { 'paddle-signature': 'bad' }),
      env,
      adapter({
        verifySignature: async () => false,
        normalize: () => { normalizeCalled = true; return event(); },
      }),
      { db }
    );
    expect(normalizeCalled).toBe(false);
    expect(statements.length).toBe(0);
  });
});
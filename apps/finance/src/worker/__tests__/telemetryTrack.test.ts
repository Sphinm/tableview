import { describe, it, expect } from 'bun:test';
import { gzipCompress, encryptLogPayload } from '@tableview/shared';
import worker from '../index';

/**
 * Records every statement the route sends to D1, so a test can assert what
 * would actually be persisted without a live database.
 */
class MockD1 {
  public rows: Array<{ sql: string; params: unknown[] }> = [];

  prepare(sql: string) {
    return {
      bind: (...params: unknown[]) => ({ sql, params }),
      run: async () => ({ success: true }),
    };
  }

  async batch(statements: Array<{ sql: string; params: unknown[] }>) {
    for (const s of statements) this.rows.push({ sql: s.sql, params: s.params });
    return statements.map(() => ({ success: true }));
  }
}

/** Builds the exact wire format the browser SDK sends: gzip, then AES-GCM. */
async function encodeBatch(payload: unknown): Promise<ArrayBuffer> {
  const compressed = await gzipCompress(JSON.stringify(payload));
  const encrypted = await encryptLogPayload(compressed);
  return encrypted.buffer.slice(
    encrypted.byteOffset,
    encrypted.byteOffset + encrypted.byteLength
  ) as ArrayBuffer;
}

function request(body: ArrayBuffer, method = 'POST', country?: string): Request {
  const req = new Request('https://track.tableview.dev/api/track', {
    method,
    body: method === 'POST' ? body : undefined,
    headers: { 'Content-Type': 'application/octet-stream' },
  });
  if (country) {
    Object.defineProperty(req, 'cf', { value: { country }, configurable: true });
  }
  return req;
}

function envWith(telemetry: MockD1) {
  return { tableview_logs: telemetry } as any;
}

const samplePayload = {
  sid: 's_abc12345',
  app: 'finance',
  p: '/mortgage-calculator',
  dur: 90,
  act: 42,
  actions: 7,
  errors: 1,
  events: [
    { t: 1200, y: 'c', n: 'Click: Calculate' },
    { t: 3400, y: 'e', n: 'TypeError: x is null', d: { line: 12 } },
  ],
};

describe('Telemetry endpoint POST /api/track', () => {
  it('accepts an encrypted batch and persists every event', async () => {
    const db = new MockD1();
    const res = await worker.fetch(request(await encodeBatch(samplePayload)), envWith(db));

    expect(res.status).toBe(204);
    expect(db.rows.length).toBe(2);
  });

  it('persists the session context alongside each event', async () => {
    const db = new MockD1();
    await worker.fetch(request(await encodeBatch(samplePayload)), envWith(db));

    const joined = db.rows.map((r) => r.params.join('|')).join('\n');
    expect(joined).toContain('s_abc12345');       // session id
    expect(joined).toContain('finance');           // owning suite
    expect(joined).toContain('/mortgage-calculator');
    expect(joined).toContain('Click: Calculate');
  });

  it('records the visitor country supplied by the edge, not an IP address', async () => {
    const db = new MockD1();
    await worker.fetch(request(await encodeBatch(samplePayload), 'POST', 'CA'), envWith(db));

    expect(db.rows.map((r) => r.params.join('|')).join('\n')).toContain('CA');
    // Privacy: the promise is that no request IP is stored. Assert no column
    // holds anything that looks like an address.
    const ipv4 = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
    const all = db.rows.flatMap((r) => r.params.map((p) => String(p ?? '')));
    expect(all.some((v) => ipv4.test(v))).toBe(false);
  });

  it('rejects a payload that is not a valid encrypted batch', async () => {
    const db = new MockD1();
    const garbage = new TextEncoder().encode('not-encrypted').buffer;
    const res = await worker.fetch(request(garbage as ArrayBuffer), envWith(db));

    expect(res.status).toBe(400);
    expect(db.rows.length).toBe(0);
  });

  it('returns CORS headers so cross-origin suites can read the response', async () => {
    const db = new MockD1();
    // tools./compress. post from a different origin than track., so the browser
    // needs Allow-Origin on the real response, not only on the preflight.
    const req = new Request('https://track.tableview.dev/api/track', {
      method: 'POST',
      body: await encodeBatch(samplePayload),
      headers: {
        'Content-Type': 'application/octet-stream',
        Origin: 'https://tools.tableview.dev',
      },
    });
    const res = await worker.fetch(req, envWith(db));

    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://tools.tableview.dev');
  });

  it('is not reachable by GET', async () => {
    const db = new MockD1();
    const res = await worker.fetch(request(new ArrayBuffer(0), 'GET'), envWith(db));

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(db.rows.length).toBe(0);
  });

  it('caps a single batch so one request cannot flood the table', async () => {
    const db = new MockD1();
    const flood = {
      ...samplePayload,
      events: Array.from({ length: 5000 }, (_, i) => ({ t: i, y: 'c', n: 'Click: ' + i })),
    };
    const res = await worker.fetch(request(await encodeBatch(flood)), envWith(db));

    expect(res.status).toBe(204);
    expect(db.rows.length).toBeLessThanOrEqual(200);
    expect(db.rows.length).toBeGreaterThan(0);
  });
});
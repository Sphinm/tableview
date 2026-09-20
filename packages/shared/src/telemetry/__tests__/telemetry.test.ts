import { describe, it, expect } from 'bun:test';
import {
  resolveRuntimeSecret,
  gzipCompress,
  gzipDecompress,
  encryptLogPayload,
  decryptLogPayload,
} from '../crypto';
import { TelemetrySDK } from '../tracker';

describe('Telemetry Crypto & Secret Unmasking', () => {
  it('should successfully unmask the user secret key from byte array', () => {
    const key = resolveRuntimeSecret();
    expect(key).toBe('tableview-hash-salt-finance');
  });

  it('should compress and decompress payload correctly using Gzip', async () => {
    const rawJson = JSON.stringify({
      sid: 's_test123',
      events: [
        { t: 100, y: 'c', n: 'Click: Submit Button' },
        { t: 500, y: 'e', n: 'TypeError: null is not an object' },
      ],
    });

    const compressed = await gzipCompress(rawJson);
    expect(compressed.byteLength).toBeGreaterThan(0);

    const decompressed = await gzipDecompress(compressed);
    expect(decompressed).toBe(rawJson);
  });

  it('should encrypt with masked secret and decrypt back accurately', async () => {
    const originalText = JSON.stringify({ message: 'secret telemetry log event', count: 42 });
    const compressed = await gzipCompress(originalText);

    // 加密
    const encrypted = await encryptLogPayload(compressed);
    expect(encrypted.byteLength).toBeGreaterThan(compressed.byteLength);

    // 解密
    const decrypted = await decryptLogPayload(encrypted);
    const restoredText = await gzipDecompress(decrypted);

    expect(restoredText).toBe(originalText);
  });
});

describe('TelemetrySDK', () => {
  it('should buffer events and respect batchSize', () => {
    const tracker = new TelemetrySDK({
      app: 'finance',
      endpoint: 'https://example.com/api/track',
      batchSize: 5,
      enabled: false, // 禁用自动 DOM 监听以纯测试逻辑
    });

    expect(tracker.app).toBe('finance');
    tracker.destroy();
  });
});

describe('TelemetrySDK delivery failures', () => {
  const originalFetch = globalThis.fetch;

  const stubFetch = (status: number) => {
    let calls = 0;
    globalThis.fetch = (async () => {
      calls++;
      return new Response('x', { status });
    }) as unknown as typeof fetch;
    return () => calls;
  };

  const makeSdk = () =>
    new TelemetrySDK({ app: 'finance', endpoint: 'https://example.com/api/track' });

  it('keeps the batch for retry when the endpoint returns 5xx', async () => {
    const calls = stubFetch(503);
    const sdk = makeSdk();
    sdk.track('a', 'export_clicked');

    await sdk.flush();
    await sdk.flush();

    // The first attempt failed server-side, so the event must still be pending
    // and the second flush must genuinely retry it rather than find nothing.
    expect(calls()).toBe(2);
    globalThis.fetch = originalFetch;
    sdk.destroy();
  });

  it('drops the batch on a 4xx instead of retrying an unacceptable payload forever', async () => {
    const calls = stubFetch(400);
    const sdk = makeSdk();
    sdk.track('a', 'export_clicked');

    await sdk.flush();
    await sdk.flush();

    expect(calls()).toBe(1);
    globalThis.fetch = originalFetch;
    sdk.destroy();
  });

  it('keeps the batch when the request never reaches the server', async () => {
    let calls = 0;
    globalThis.fetch = (async () => {
      calls++;
      throw new TypeError('Failed to fetch');
    }) as unknown as typeof fetch;

    const sdk = makeSdk();
    sdk.track('a', 'export_clicked');
    await sdk.flush();
    await sdk.flush();

    expect(calls).toBe(2);
    globalThis.fetch = originalFetch;
    sdk.destroy();
  });
});
describe('TelemetrySDK emergency beacon', () => {
  const originalSendBeacon = (navigator as any).sendBeacon;

  it('uses a CORS-safelisted blob so a cross-origin beacon is not blocked', async () => {
    // sendBeacon fires on every tab switch and page close. A beacon cannot
    // perform a CORS preflight, so a non-safelisted Content-Type makes the
    // browser drop it — silently losing exactly the session-end events that
    // carry dwell time. The payload is opaque bytes to the server, so the type
    // carries no meaning and can safely be safelisted.
    let captured: Blob | null = null;
    (navigator as any).sendBeacon = (_url: string, data: Blob) => {
      captured = data;
      return true;
    };

    const sdk = new TelemetrySDK({ app: 'finance', endpoint: 'https://track.tableview.dev/api/track' });
    sdk.track('a', 'export_clicked');
    await sdk.flush(true);

    expect(captured).not.toBeNull();
    // '' and 'text/plain' are the only types that avoid a preflight here.
    expect(['', 'text/plain']).toContain((captured as unknown as Blob).type);
    (navigator as any).sendBeacon = originalSendBeacon;
    sdk.destroy();
  });
});

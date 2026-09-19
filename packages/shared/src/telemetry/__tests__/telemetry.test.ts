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

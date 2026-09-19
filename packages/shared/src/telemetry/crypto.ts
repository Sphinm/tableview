/**
 * Telemetry Crypto & Compression Utility
 *
 * Provides native Gzip compression via CompressionStream and AES-GCM encryption via Web Crypto API.
 * Contains no external npm dependencies to ensure zero bundle bleed.
 */

// 用户配置的混淆密文 Key
const MASKED_KEY_BYTES: number[] = [
  40, 61, 62, 48, 57, 42, 53, 57, 43, 113, 52, 61, 47, 52, 113, 47, 61, 48, 40, 113, 58, 53, 50, 61, 50, 63, 57
];
const MASK = 0x5C;

/**
 * 运行时在内存中反混淆还原真实 Key ("tableview-hash-salt-finance")
 */
export function resolveRuntimeSecret(): string {
  const originalBytes = new Uint8Array(MASKED_KEY_BYTES.map((b) => b ^ MASK));
  return new TextDecoder().decode(originalBytes);
}

/**
 * 原生 Gzip 压缩（减少 75% ~ 85% 传输体积）
 */
export async function gzipCompress(text: string): Promise<Uint8Array> {
  const data = new TextEncoder().encode(text);
  if (typeof CompressionStream === 'undefined') {
    return data;
  }
  const stream = new Response(data).body!.pipeThrough(new CompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/**
 * 原生 Gzip 解压缩（用于测试及服务端对等还原）
 */
export async function gzipDecompress(data: Uint8Array): Promise<string> {
  if (typeof DecompressionStream === 'undefined') {
    return new TextDecoder().decode(data);
  }
  const stream = new Response(data as any).body!.pipeThrough(new DecompressionStream('gzip'));
  return await new Response(stream).text();
}

/**
 * 从密钥文本派生 AES-GCM 128位 CryptoKey
 */
async function getCryptoKey(customSecret?: string): Promise<CryptoKey> {
  const secret = customSecret || resolveRuntimeSecret();
  const keyBytes = new TextEncoder().encode(secret.padEnd(16, '0').slice(0, 16));
  return await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * 动态使用还原出来的 Key 进行 AES-GCM 加密
 * 输出格式: [ 12 字节随机 IV ] + [ 密文及 AuthTag ]
 */
export async function encryptLogPayload(
  data: Uint8Array,
  customSecret?: string
): Promise<Uint8Array> {
  if (!crypto?.subtle) {
    return data; // 极端非安全/旧环境降级
  }

  const key = await getCryptoKey(customSecret);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data as any
  );

  const result = new Uint8Array(iv.length + ciphertext.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(ciphertext), iv.length);
  return result;
}

/**
 * 对应的解密函数（可用于 Worker 端或本地验证）
 */
export async function decryptLogPayload(
  encryptedData: Uint8Array,
  customSecret?: string
): Promise<Uint8Array> {
  if (!crypto?.subtle) {
    return encryptedData;
  }

  const iv = encryptedData.slice(0, 12);
  const ciphertext = encryptedData.slice(12);
  const key = await getCryptoKey(customSecret);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext as any
  );

  return new Uint8Array(decrypted);
}

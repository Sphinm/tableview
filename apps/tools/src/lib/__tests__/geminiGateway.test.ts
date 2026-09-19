import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { streamGatewayText } from '../gemini';

const originalFetch = globalThis.fetch;

/** Builds an SSE Response whose data lines yield the supplied text chunks. */
function sseResponse(chunks: string[], status = 200): Response {
  const encoder = new TextEncoder();
  let i = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (i >= chunks.length) {
        controller.close();
        return;
      }
      const payload = JSON.stringify({ candidates: [{ content: { parts: [{ text: chunks[i++] }] } }] });
      controller.enqueue(encoder.encode('data: ' + payload + '\n\n'));
    },
  });
  return new Response(stream, { status, headers: { 'Content-Type': 'text/event-stream' } });
}

function errorResponse(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const baseOptions = {
  prompt: 'hi',
  systemInstruction: 'sys',
  retryBackoffMs: [0, 0] as number[],
};

let calls: string[] = [];

beforeEach(() => {
  calls = [];
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('streamGatewayText retry behaviour', () => {
  it('returns streamed text on a first-try success', async () => {
    globalThis.fetch = (async () => sseResponse(['Hello', ' world'])) as unknown as typeof fetch;
    const result = await streamGatewayText({ ...baseOptions });
    expect(result).toBe('Hello world');
  });

  it('retries a 503 and succeeds on the next attempt', async () => {
    globalThis.fetch = (async () => {
      calls.push('call');
      return calls.length === 1 ? errorResponse(503, 'high demand') : sseResponse(['Recovered']);
    }) as unknown as typeof fetch;

    const result = await streamGatewayText({ ...baseOptions });
    expect(result).toBe('Recovered');
    expect(calls).toHaveLength(2);
  });

  it('retries a 429 quota error', async () => {
    globalThis.fetch = (async () => {
      calls.push('call');
      return calls.length <= 2 ? errorResponse(429, 'quota exceeded') : sseResponse(['OK']);
    }) as unknown as typeof fetch;

    const result = await streamGatewayText({ ...baseOptions, retries: 3 });
    expect(result).toBe('OK');
    expect(calls).toHaveLength(3);
  });

  it('does not retry a 400 client error', async () => {
    globalThis.fetch = (async () => {
      calls.push('call');
      return errorResponse(400, 'bad request');
    }) as unknown as typeof fetch;

    await expect(streamGatewayText({ ...baseOptions })).rejects.toThrow('bad request');
    expect(calls).toHaveLength(1);
  });

  it('surfaces the upstream message after exhausting retries', async () => {
    globalThis.fetch = (async () => {
      calls.push('call');
      return errorResponse(503, 'still overloaded');
    }) as unknown as typeof fetch;

    await expect(streamGatewayText({ ...baseOptions })).rejects.toThrow('still overloaded');
    // 1 initial attempt + 2 retries
    expect(calls).toHaveLength(3);
  });

  it('honours retries: 0', async () => {
    globalThis.fetch = (async () => {
      calls.push('call');
      return errorResponse(503, 'nope');
    }) as unknown as typeof fetch;

    await expect(streamGatewayText({ ...baseOptions, retries: 0 })).rejects.toThrow('nope');
    expect(calls).toHaveLength(1);
  });

  it('does not retry once output has already been streamed', async () => {
    globalThis.fetch = (async () => {
      calls.push('call');
      // Emits one chunk, then the stream errors.
      const encoder = new TextEncoder();
      let i = 0;
      const stream = new ReadableStream<Uint8Array>({
        pull(controller) {
          if (i === 0) {
            i++;
            const payload = JSON.stringify({ candidates: [{ content: { parts: [{ text: 'partial' }] } }] });
            controller.enqueue(encoder.encode('data: ' + payload + '\n\n'));
            return;
          }
          controller.error(new Error('stream broke'));
        },
      });
      return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
    }) as unknown as typeof fetch;

    await expect(streamGatewayText({ ...baseOptions })).rejects.toThrow('stream broke');
    expect(calls).toHaveLength(1);
  });

  it('forwards accumulated text to onChunk', async () => {
    globalThis.fetch = (async () => sseResponse(['a', 'b', 'c'])) as unknown as typeof fetch;
    const seen: string[] = [];
    await streamGatewayText({ ...baseOptions, onChunk: (acc) => seen.push(acc) });
    expect(seen).toEqual(['a', 'ab', 'abc']);
  });

  it('applies the transform to the returned value', async () => {
    const fenced = String.fromCharCode(96, 96, 96);
    globalThis.fetch = (async () => sseResponse([fenced + 'sql\nSELECT 1\n' + fenced])) as unknown as typeof fetch;
    const result = await streamGatewayText({
      ...baseOptions,
      transform: (raw) => raw.split(fenced + 'sql').join('').split(fenced).join('').trim(),
    });
    expect(result).toBe('SELECT 1');
  });
});

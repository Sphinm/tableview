import { describe, it, expect } from 'bun:test';
import { parseJsonContent, sanitizeRowValues } from '../duckdb';

describe('JSON Parsing & Sanitization Engine', () => {
  it('parses standard hierarchical JSON object correctly', () => {
    const jsonStr = JSON.stringify({
      v: '5.7.4',
      fr: 30,
      assets: [{ id: 'img_0', w: 100, h: 100 }],
      layers: [
        { ind: 1, nm: 'Layer 1', ty: 4 },
        { ind: 2, nm: 'Layer 2', ty: 2 }
      ],
      meta: { author: 'TableView' }
    });

    const parsed = parseJsonContent(jsonStr);
    expect(parsed).toBeDefined();
    expect(parsed.v).toBe('5.7.4');
    expect(parsed.fr).toBe(30);
    expect(Array.isArray(parsed.layers)).toBe(true);
    expect(parsed.layers.length).toBe(2);
    expect(parsed.meta.author).toBe('TableView');
  });

  it('parses array of tabular records correctly', () => {
    const jsonStr = JSON.stringify([
      { id: 1, name: 'Alice', role: 'Engineer' },
      { id: 2, name: 'Bob', role: 'Designer' }
    ]);

    const parsed = parseJsonContent(jsonStr);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(2);
    expect(parsed[0].name).toBe('Alice');
    expect(parsed[1].role).toBe('Designer');
  });

  it('parses JSON Lines (NDJSON) format seamlessly', () => {
    const ndjson = `{"id": 101, "event": "click"}
{"id": 102, "event": "scroll"}
{"id": 103, "event": "submit"}`;

    const parsed = parseJsonContent(ndjson);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(3);
    expect(parsed[0].event).toBe('click');
    expect(parsed[2].event).toBe('submit');
  });

  it('returns null on empty or whitespace text', () => {
    expect(parseJsonContent('')).toBeNull();
    expect(parseJsonContent('   \n  ')).toBeNull();
  });

  it('throws on corrupted JSON', () => {
    expect(() => parseJsonContent('{ corrupted: ')).toThrow();
  });

  it('sanitizes BigInt and nested structures safely for serialization', () => {
    const raw = {
      orderId: BigInt(9007199254740991),
      hugeId: BigInt('9007199254740999999999'),
      details: {
        nestedCount: BigInt(42),
        tags: ['sale', 'electronics']
      }
    };

    const sanitized = sanitizeRowValues(raw);
    expect(typeof sanitized.orderId).toBe('number');
    expect(sanitized.orderId).toBe(9007199254740991);
    expect(typeof sanitized.hugeId).toBe('string');
    expect(sanitized.hugeId).toBe('9007199254740999999999');
    expect(sanitized.details.nestedCount).toBe(42);

    // Ensure it serializes with standard JSON.stringify without throwing TypeError
    const serialized = JSON.stringify(sanitized);
    expect(serialized).toContain('9007199254740991');
  });
});

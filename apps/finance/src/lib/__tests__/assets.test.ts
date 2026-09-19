import { describe, it, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dir, '..', '..');

/**
 * The social card and the Article structured data both depend on this file
 * existing at a crawlable URL. It is easy to forget to regenerate after
 * touching the icon script, and the failure is silent — previews just go blank
 * and Article markup points at a 404.
 */
describe('Social preview asset', () => {
  const ogPath = path.join(root, '..', 'public', 'og-image.png');

  it('exists', () => {
    expect(fs.existsSync(ogPath)).toBe(true);
  });

  it('is a valid PNG', () => {
    const buf = fs.readFileSync(ogPath);
    // PNG magic number.
    expect(buf.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(buf.subarray(12, 16).toString('ascii')).toBe('IHDR');
  });

  it('is 1200x630, the size Open Graph consumers expect', () => {
    const buf = fs.readFileSync(ogPath);
    expect(buf.readUInt32BE(16)).toBe(1200);
    expect(buf.readUInt32BE(20)).toBe(630);
  });
});

describe('App icon assets', () => {
  const required = ['icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];

  it('are all present', () => {
    const missing = required.filter((f) => !fs.existsSync(path.join(root, '..', 'public', f)));
    expect(missing).toEqual([]);
  });

  it('are referenced by the web manifest', () => {
    const manifest = fs.readFileSync(path.join(root, '..', 'public', 'manifest.webmanifest'), 'utf8');
    // Chrome refuses the install prompt without a 192 and a 512 PNG.
    expect(manifest).toContain('/icon-192.png');
    expect(manifest).toContain('/icon-512.png');
  });
});

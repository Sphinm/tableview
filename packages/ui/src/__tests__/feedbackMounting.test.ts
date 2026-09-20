import { describe, it, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.join(import.meta.dir, '..', '..', '..', '..');
const apps = ['finance', 'tools', 'compressor'];

/**
 * Cross-app invariants for the floating feedback entry point.
 *
 * The button is only useful if every suite actually mounts it, and the email
 * address is only maintainable if no app keeps a private copy of the URL
 * builders — the three `lib/feedback.ts` files previously each carried their
 * own `encodeURIComponent` plumbing, so changing the shape meant three edits.
 */
describe('Floating feedback mounting', () => {
  it('mounts the shared button in every app shell', () => {
    const missing = apps.filter((app) => {
      const src = fs.readFileSync(
        path.join(repoRoot, 'apps', app, 'src', 'App.tsx'),
        'utf8',
      );
      return !src.includes('FloatingFeedback');
    });
    expect(missing).toEqual([]);
  });

  it('routes every app through the shared URL builders', () => {
    const offenders = apps.filter((app) => {
      const src = fs.readFileSync(
        path.join(repoRoot, 'apps', app, 'src', 'lib', 'feedback.ts'),
        'utf8',
      );
      return !src.includes('@tableview/shared') || src.includes('encodeURIComponent');
    });
    expect(offenders).toEqual([]);
  });
});

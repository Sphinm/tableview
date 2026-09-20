import { describe, it, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

const srcRoot = path.join(import.meta.dir, '..', '..');

function collect(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === '__tests__') continue;
      collect(full, out);
    } else if (/\.(ts|tsx)$/.test(e.name)) out.push(full);
  }
  return out;
}

/**
 * Read source with comments removed. Explanatory prose legitimately mentions
 * "useAuth()" and "consumeCredit()"; only executable code should be matched,
 * otherwise the guard flags its own documentation.
 */
function readCode(file: string): string {
  return fs
    .readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/**
 * Regression guard for a bug that broke the whole compressor app.
 *
 * VideoCompressor called useAuth(), which throws unless an AuthProvider is
 * above it. This app has no provider — it is a free, account-less tool — so the
 * page render threw and every visitor to the home page landed in the error
 * boundary ("Something went wrong"). Nothing caught it because the failure was
 * runtime-only, not a type error.
 *
 * The guard states the invariant directly: any use of useAuth must be matched
 * by an AuthProvider somewhere in the app.
 */
describe('Auth context availability', () => {
  it('never calls useAuth() without an AuthProvider to satisfy it', () => {
    const files = collect(srcRoot);
    const callers = files.filter((f) => {
      const s = readCode(f);
      // Ignore the hook's own definition.
      return /\buseAuth\s*\(/.test(s) && !/export function useAuth/.test(s);
    });

    if (callers.length === 0) {
      expect(callers).toEqual([]);
      return;
    }

    const appSource = fs.readFileSync(path.join(srcRoot, 'App.tsx'), 'utf8');
    const hasProvider = /AuthProvider/.test(appSource);
    expect({
      callers: callers.map((f) => path.relative(srcRoot, f)),
      hasProvider,
    }).toEqual({ callers: callers.map((f) => path.relative(srcRoot, f)), hasProvider: true });
  });

  it('has no lingering credit-gate calls (the compressor is unmetered)', () => {
    const offenders: string[] = [];
    for (const f of collect(srcRoot)) {
      if (/consumeCredit\s*\(/.test(readCode(f))) {
        offenders.push(path.relative(srcRoot, f));
      }
    }
    expect(offenders).toEqual([]);
  });
});

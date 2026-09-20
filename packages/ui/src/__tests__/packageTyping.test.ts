import { describe, it, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.join(import.meta.dir, '..', '..', '..', '..');

function collectTsx(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
      collectTsx(full, out);
    } else if (entry.name.endsWith('.tsx')) {
      out.push(full);
    }
  }
  return out;
}

/**
 * A workspace package that contains JSX must declare React's TYPES itself.
 *
 * This build failed from a clean clone for months without anyone noticing,
 * because the local tree happened to have a stale hoisted `@types/react` while
 * a fresh checkout did not. Bun installs an app's devDependencies into
 * `apps/<app>/node_modules`, which a package under `packages/` cannot resolve:
 * TypeScript walks up from `packages/ui/src` and never reaches it. The result
 * was TS7026 ("no interface JSX.IntrinsicElements") on every element of
 * packages/ui, failing `tsc -b` and therefore the whole production build.
 *
 * Declaring `@types/react` here makes the package self-contained, which is the
 * correct relationship: `react` stays a peerDependency (the consumer supplies
 * the runtime), while the types needed to compile the package are its own.
 */
describe('Workspace package typing', () => {
  const packagesDir = path.join(repoRoot, 'packages');

  it('finds the workspace packages', () => {
    expect(fs.existsSync(packagesDir)).toBe(true);
  });

  it('requires @types/react in any package that ships JSX', () => {
    const offenders: string[] = [];

    for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const pkgDir = path.join(packagesDir, entry.name);
      const tsx = collectTsx(path.join(pkgDir, 'src'));
      if (tsx.length === 0) continue;

      const pkgJsonPath = path.join(pkgDir, 'package.json');
      if (!fs.existsSync(pkgJsonPath)) {
        offenders.push(`packages/${entry.name}: has .tsx files but no package.json`);
        continue;
      }

      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8')) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const hasTypes =
        Boolean(pkg.devDependencies?.['@types/react']) ||
        Boolean(pkg.dependencies?.['@types/react']);

      if (!hasTypes) {
        offenders.push(`packages/${entry.name}: ${tsx.length} .tsx file(s) but no @types/react`);
      }
    }

    expect(offenders).toEqual([]);
  });
});

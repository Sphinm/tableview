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

function collectSource(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules' || entry.name === 'dist') continue;
      collectSource(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Removes comments before the import scan.
 *
 * Without this the regex matches prose. A doc comment reading
 * `Distinguish "finished" from "a previous attempt died".` looks exactly like
 * `from "a previous attempt died"` and was reported as an undeclared dependency —
 * a false positive that would train everyone to ignore this guard.
 */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')   // block comments
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 '); // line comments (keep "https://")
}

const barePackageName = (spec: string): string => {
  const parts = spec.split('/');
  return spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
};

/**
 * Every bare import must be declared by the workspace that uses it.
 *
 * Two dependencies were declared in the wrong app and only worked because a
 * stale hoisted copy sat in the repo root: `xlsx` was declared by apps/tools
 * but imported by nine files in apps/finance, and `jszip` was declared by
 * apps/tools but imported by apps/compressor. A clean clone could resolve
 * neither, so the production build failed with TS2307 — invisible locally,
 * fatal on Cloudflare.
 *
 * This mirrors what a fresh `bun install` provides, so the failure surfaces in
 * the test suite instead of during a deploy.
 */
describe('Workspace dependency declarations', () => {
  const workspaces = [
    'apps/finance',
    'apps/tools',
    'apps/compressor',
    'packages/ui',
    'packages/shared',
  ];

  it('declares every bare import used by each workspace', () => {
    const offenders: string[] = [];

    for (const ws of workspaces) {
      const pkgPath = path.join(repoRoot, ws, 'package.json');
      if (!fs.existsSync(pkgPath)) continue;

      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as Record<string, Record<string, string>>;
      const declared = new Set([
        ...Object.keys(pkg.dependencies ?? {}),
        ...Object.keys(pkg.peerDependencies ?? {}),
        ...Object.keys(pkg.devDependencies ?? {}),
      ]);

      const used = new Map<string, string>();
      for (const file of collectSource(path.join(repoRoot, ws, 'src'))) {
        const source = stripComments(fs.readFileSync(file, 'utf8'));
        for (const match of source.matchAll(/(?:from\s+|import\s*\(|require\()\s*['"]([^'"]+)['"]/g)) {
          const spec = match[1];
          if (spec.startsWith('.') || spec.startsWith('/')) continue;
          // Runtime builtins: `node:*` for Node and `bun:*` for Bun. Neither is an
          // installable package, so neither belongs in package.json.
          if (spec.startsWith('node:') || spec.startsWith('bun:')) continue;
          const name = barePackageName(spec);
          // Workspace packages are linked by the package manager, not declared
          // as third-party dependencies here.
          if (name.startsWith('@tableview/')) continue;
          // A template placeholder such as `${table}` inside a string literal.
          if (name.includes('$') || name.includes('{')) continue;
          if (!used.has(name)) used.set(name, path.relative(repoRoot, file));
        }
      }

      for (const [name, firstUse] of used) {
        if (!declared.has(name)) offenders.push(`${ws}: imports '${name}' (first at ${firstUse}) but does not declare it`);
      }
    }

    expect(offenders).toEqual([]);
  });
});

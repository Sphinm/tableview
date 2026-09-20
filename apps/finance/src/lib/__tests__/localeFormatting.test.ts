import { describe, it, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

const srcRoot = path.join(import.meta.dir, '..', '..');

/**
 * Guard against locale-dependent number formatting creeping back in.
 *
 * A bare .toLocaleString() formats with the *host* locale, so the same figure
 * renders as "1,234.5" in en-US and "1.234,5" in de-DE. In a lending suite
 * that is a correctness defect: an exported lender PDF or a copied analysis
 * string would show ambiguous, differently-punctuated money on a European
 * machine. Every call site must therefore name its locale explicitly, or go
 * through the pinned formatters in @tableview/shared.
 */
function collectSourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip tests: this guard's own fixture text would otherwise match.
      if (entry.name === '__tests__') continue;
      collectSourceFiles(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

describe('Locale-independent formatting', () => {
  it('has no bare toLocaleString() calls in application source', () => {
    // Built from fragments so this file does not match its own search.
    const pattern = new RegExp('\\.toLocaleString\\(' + '\\)');
    const offenders: string[] = [];

    for (const file of collectSourceFiles(srcRoot)) {
      const contents = fs.readFileSync(file, 'utf8');
      contents.split('\n').forEach((line, index) => {
        if (pattern.test(line)) {
          offenders.push(`${path.relative(srcRoot, file)}:${index + 1}`);
        }
      });
    }

    expect(offenders).toEqual([]);
  });

  it('pins every toLocaleString call that passes a locale to en-US', () => {
    const offenders: string[] = [];
    // A locale argument that is not 'en-US' would re-introduce the variance.
    const nonEnUs = /toLocaleString\(\s*'(?!en-US)[a-zA-Z-]+'/;

    for (const file of collectSourceFiles(srcRoot)) {
      const contents = fs.readFileSync(file, 'utf8');
      contents.split('\n').forEach((line, index) => {
        if (nonEnUs.test(line)) {
          offenders.push(`${path.relative(srcRoot, file)}:${index + 1}`);
        }
      });
    }

    expect(offenders).toEqual([]);
  });

  /**
   * Regression: the first version of this guard only matched a bare
   * toLocaleString() or a named non-en-US locale, so it waved through
   * `toLocaleString(undefined, { ... })`. Passing undefined is not "no
   * locale" — it means "use the host locale", the exact defect being fixed.
   * Four such calls shipped in the loan-comparison and salary calculators.
   */
  it('does not pass undefined as an explicit locale', () => {
    const offenders: string[] = [];
    const undefinedLocale = /toLocale(String|DateString|TimeString)\(\s*undefined\b/;

    for (const file of collectSourceFiles(srcRoot)) {
      const contents = fs.readFileSync(file, 'utf8');
      contents.split('\n').forEach((line, index) => {
        if (undefinedLocale.test(line)) {
          offenders.push(`${path.relative(srcRoot, file)}:${index + 1}`);
        }
      });
    }

    expect(offenders).toEqual([]);
  });

  it('constructs Intl formatters with an explicit locale', () => {
    const offenders: string[] = [];
    // new Intl.NumberFormat() with no locale is host-dependent, same defect.
    const localeHole = /new Intl\.(NumberFormat|DateTimeFormat)\(\s*\)/;

    for (const file of collectSourceFiles(srcRoot)) {
      const contents = fs.readFileSync(file, 'utf8');
      contents.split('\n').forEach((line, index) => {
        if (localeHole.test(line)) {
          offenders.push(`${path.relative(srcRoot, file)}:${index + 1}`);
        }
      });
    }

    expect(offenders).toEqual([]);
  });

  it('catches a toLocaleString(undefined, ...) violation', () => {
    // Prove the pattern is actually detectable, rather than trusting the regex.
    const sample = `value.toLocaleString(undefined, { minimumFractionDigits: 2 })`;
    expect(/toLocale(String|DateString|TimeString)\(\s*undefined\b/.test(sample)).toBe(true);
  });
});

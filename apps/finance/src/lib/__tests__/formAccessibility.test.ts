import { describe, it, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

const srcRoot = path.join(import.meta.dir, '..', '..');

function collectSourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__') continue;
      collectSourceFiles(full, out);
    } else if (/\.tsx$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Every numeric field must carry an accessible name.
 *
 * The suite shipped 103 CurrencyInput/NumericInput instances of which the vast
 * majority had a visible <label> that was NOT programmatically associated: the
 * label was a sibling with no htmlFor and the input had no id, so assistive
 * tech announced bare "edit text". A browser audit measured 0 of 10 named on
 * the DSCR page and 0 of 17 on the cap-rate page.
 *
 * This guard enforces the invariant at the source level: each of these
 * components must be given either an id (paired with a label's htmlFor) or an
 * explicit aria-label. It is deliberately a static check so it runs with the
 * unit suite rather than needing a browser.
 */
describe('Form field accessible names', () => {
  it('gives every CurrencyInput/NumericInput an id or aria-label', () => {
    const components = ['CurrencyInput', 'NumericInput'];
    const offenders: string[] = [];

    for (const file of collectSourceFiles(srcRoot)) {
      const contents = fs.readFileSync(file, 'utf8');
      for (const component of components) {
        const needle = '<' + component;
        let from = 0;
        for (;;) {
          const at = contents.indexOf(needle, from);
          if (at === -1) break;
          // The opening tag runs to its self-closing slash.
          const end = contents.indexOf('/>', at);
          const tag = end === -1 ? contents.slice(at, at + 400) : contents.slice(at, end);
          if (!/\bid=|aria-label=|aria-labelledby=/.test(tag)) {
            const line = contents.slice(0, at).split('\n').length;
            offenders.push(`${path.relative(srcRoot, file)}:${line} <${component}>`);
          }
          from = at + needle.length;
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it('does not nest an interactive tooltip inside a <label>', () => {
    // An implicit label binds to the first labelable descendant; a button
    // inside the label steals the association from the input.
    const offenders: string[] = [];

    for (const file of collectSourceFiles(srcRoot)) {
      // Strip block comments: prose that mentions "<label>" is not markup.
      const contents = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      const lines = contents.split('\n');
      let labelDepth = 0;
      lines.forEach((line, index) => {
        if (/<label\b/.test(line)) labelDepth++;
        if (labelDepth > 0 && /<InfoTooltip/.test(line)) {
          offenders.push(`${path.relative(srcRoot, file)}:${index + 1}`);
        }
        if (/<\/label>/.test(line)) labelDepth = Math.max(0, labelDepth - 1);
      });
    }

    expect(offenders).toEqual([]);
  });
});

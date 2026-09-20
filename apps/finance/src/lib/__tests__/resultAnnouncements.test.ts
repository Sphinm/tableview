import { describe, it, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

const srcRoot = path.join(import.meta.dir, '..', '..');

/**
 * Calculators recompute on every keystroke but nothing announced the new
 * answer, so a screen-reader user adjusting an input had no feedback that the
 * result had moved. Only one live region existed in the whole suite (the global
 * loading bar). These checks keep the result announcer wired into the primary
 * calculators.
 */
const PRIMARY_CALCULATORS = [
  'DscrCalculator.tsx',
  'MortgageCalculator.tsx',
  'CapRateCalculator.tsx',
  'RefinanceCalculator.tsx',
  'HardMoneyCalculator.tsx',
  'BrrrrCalculator.tsx',
  'CommercialLoanCalculator.tsx',
  'LoanComparisonCalculator.tsx',
  'SalaryCalculator.tsx',
];

describe('Result announcements', () => {
  it('keeps the announcer a polite, atomic, screen-reader-only live region', () => {
    const contents = fs.readFileSync(
      path.join(srcRoot, 'components', 'ResultAnnouncer.tsx'),
      'utf8'
    );
    expect(contents).toContain('role="status"');
    expect(contents).toContain('aria-live="polite"');
    expect(contents).toContain('aria-atomic="true"');
    // sr-only keeps it out of sight while staying in the accessibility tree.
    expect(contents).toContain('sr-only');
  });

  it('debounces announcements so typing does not cause chatter', () => {
    const contents = fs.readFileSync(
      path.join(srcRoot, 'components', 'ResultAnnouncer.tsx'),
      'utf8'
    );
    expect(contents).toContain('useDebouncedValue');
  });

  it('renders the announcer in every primary calculator', () => {
    const missing: string[] = [];
    for (const file of PRIMARY_CALCULATORS) {
      const full = path.join(srcRoot, 'pages', file);
      if (!fs.existsSync(full)) continue;
      const contents = fs.readFileSync(full, 'utf8');
      if (!contents.includes('<ResultAnnouncer')) missing.push(file);
    }
    expect(missing).toEqual([]);
  });

  it('builds every announcement through the tested composer', () => {
    const offenders: string[] = [];
    for (const file of PRIMARY_CALCULATORS) {
      const full = path.join(srcRoot, 'pages', file);
      if (!fs.existsSync(full)) continue;
      const contents = fs.readFileSync(full, 'utf8');
      if (!contents.includes('<ResultAnnouncer')) continue;
      // A hand-written string would bypass the phrasing tests.
      if (!contents.includes('composeAnnouncement(')) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });
});

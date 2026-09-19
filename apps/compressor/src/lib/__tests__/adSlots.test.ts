import { describe, it, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { AD_UNITS, ADSENSE_CLIENT, PLACEHOLDER_SLOT, isPlaceholderSlot, configuredUnits } from '../../data/adSlots';

const SRC_DIR = path.join(import.meta.dir, '..', '..');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__') continue;
      walk(full, out);
    } else if (/\.tsx?$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const sourceFiles = walk(SRC_DIR);

/** Every `<AdSlot unit="x" />` in the codebase, with its file. */
function findAdSlotUsages(): { file: string; unit: string }[] {
  const usages: { file: string; unit: string }[] = [];
  for (const file of sourceFiles) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/<AdSlot[^>]*?\bunit="([^"]+)"/g)) {
      usages.push({ file: path.relative(SRC_DIR, file), unit: match[1] });
    }
  }
  return usages;
}

const usages = findAdSlotUsages();

describe('Ad unit registry', () => {
  it('exposes a numeric slot id for every unit', () => {
    for (const value of Object.values(AD_UNITS)) {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
      // A real AdSense slot id is numeric; a typo here silently kills revenue.
      expect(/^\d+$/.test(value)).toBe(true);
    }
  });

  it('treats the placeholder and empty values as unconfigured', () => {
    expect(isPlaceholderSlot(PLACEHOLDER_SLOT)).toBe(true);
    expect(isPlaceholderSlot('')).toBe(true);
    expect(isPlaceholderSlot(undefined)).toBe(true);
    expect(isPlaceholderSlot('1234567890')).toBe(false);
  });

  it('reports configured units consistently with the registry', () => {
    const expected = Object.entries(AD_UNITS)
      .filter(([, v]) => v !== PLACEHOLDER_SLOT)
      .map(([k]) => k);
    expect(configuredUnits()).toEqual(expected);
  });
});

describe('AdSlot placements', () => {
  it('is actually used somewhere', () => {
    expect(usages.length).toBeGreaterThan(0);
  });

  it('references only unit keys that exist in the registry', () => {
    const unknown = usages
      .filter((u) => !(u.unit in AD_UNITS))
      .map((u) => `${u.file}: unit="${u.unit}"`);

    // A typo here compiles fine and renders nothing at runtime, so it would
    // otherwise be invisible until it showed up as missing revenue.
    expect(unknown).toEqual([]);
  });

  it('never hardcodes a raw slot id at a call site', () => {
    const hardcoded: string[] = [];
    for (const file of sourceFiles) {
      const text = fs.readFileSync(file, 'utf8');
      if (/<AdSlot[^>]*\bslot="/.test(text)) hardcoded.push(path.relative(SRC_DIR, file));
    }
    // Slot ids belong in src/data/adSlots.ts so they can be changed in one place.
    expect(hardcoded).toEqual([]);
  });

  it('keeps the publisher id in exactly one module', () => {
    const owners = sourceFiles
      .filter((f) => fs.readFileSync(f, 'utf8').includes(ADSENSE_CLIENT))
      .map((f) => path.relative(SRC_DIR, f));

    expect(owners).toEqual(['data/adSlots.ts']);
  });

  it('places a unit on every calculator page that earns on high-intent queries', () => {
    const calculators = [
      'pages/MortgageCalculator.tsx',
      'pages/RefinanceCalculator.tsx',
      'pages/DscrCalculator.tsx',
      'pages/HardMoneyCalculator.tsx',
      'pages/SnowflakeCalculator.tsx',
      'pages/ParquetSavingsCalculator.tsx',
    ];
    for (const calc of calculators) {
      const placed = usages.filter((u) => u.file === calc);
      expect(`${calc} has ${placed.length} units`).toBe(`${calc} has 2 units`);
    }
  });

  it('does not place ads on thin legal pages', () => {
    const thin = ['pages/PrivacyPolicy.tsx', 'pages/TermsOfService.tsx', 'pages/Disclaimer.tsx'];
    const offenders = usages.filter((u) => thin.includes(u.file));
    // Ad-heavy legal pages are a policy risk for negligible RPM.
    expect(offenders).toEqual([]);
  });
});

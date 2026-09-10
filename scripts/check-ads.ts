/**
 * Reports the ad placement map and which units still need real AdSense slot ids.
 *
 * Run: bun run adslots:check
 *
 * Exits non-zero if any placement references a unit key that does not exist —
 * that would compile fine and silently render nothing at runtime.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { AD_UNITS, PLACEHOLDER_SLOT, isPlaceholderSlot } from '../src/data/adSlots';

const srcDir = fileURLToPath(new URL('../src', import.meta.url));

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '__tests__') walk(full, out);
    } else if (/\.tsx?$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const usages: { file: string; unit: string }[] = [];
for (const file of walk(srcDir)) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(/<AdSlot[^>]*?\bunit="([^"]+)"/g)) {
    usages.push({ file: path.relative(srcDir, file), unit: match[1] });
  }
}

const byUnit = new Map<string, string[]>();
for (const { file, unit } of usages) {
  byUnit.set(unit, [...(byUnit.get(unit) ?? []), file]);
}

console.log('\nAd placements\n' + '='.repeat(70));
for (const [unit, files] of [...byUnit].sort()) {
  const slot = (AD_UNITS as Record<string, string>)[unit];
  const state = slot === undefined
    ? 'UNKNOWN KEY'
    : isPlaceholderSlot(slot)
      ? 'placeholder — will not request ads'
      : `live (slot ${slot})`;
  console.log(`\n  ${unit}`);
  console.log(`    status: ${state}`);
  for (const f of files) console.log(`    used in: ${f}`);
}

const unused = Object.keys(AD_UNITS).filter((key) => !byUnit.has(key));
if (unused.length) {
  console.log(`\nUnits defined but never used: ${unused.join(', ')}`);
}

const unknown = usages.filter((u) => !(u.unit in AD_UNITS));
if (unknown.length) {
  console.error('\nERROR: placements reference unknown unit keys:');
  for (const u of unknown) console.error(`  ${u.file}: unit="${u.unit}"`);
  process.exit(1);
}

const toConfigure = Object.entries(AD_UNITS).filter(([, v]) => v === PLACEHOLDER_SLOT);
console.log('\n' + '='.repeat(70));
if (toConfigure.length) {
  console.log(
    `\n${toConfigure.length}/${Object.keys(AD_UNITS).length} units still use the placeholder (${PLACEHOLDER_SLOT}).\n` +
      'Paste the real data-ad-slot ids from the AdSense dashboard into src/data/adSlots.ts;\n' +
      'until then AdSlot renders nothing and issues no ad requests.\n'
  );
} else {
  console.log('\nAll ad units are configured.\n');
}

import { describe, it, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.join(import.meta.dir, '..', '..', '..', '..');

function collect(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__') continue;
      collect(full, out);
    } else if (/\.tsx?$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Design-surface invariants for the Data Tools and Media Compressor apps.
 *
 * Both apps render TWO surfaces: a dark application shell, and light content
 * pages that paint their own light wrapper (the calculators and long-form
 * pages). Shared components appear on both, so a hard-coded text colour is
 * invisible on one of them. Round 8 measured a light heading at 1.00:1 —
 * literally unreadable — against the light content background for exactly
 * this reason, and 51 of 59 routes had at least one sub-AA element.
 *
 * These checks encode the two fixes that made the surfaces safe, so the
 * regressions cannot creep back in.
 */
describe('Design surfaces', () => {
  const darkApps = ['tools', 'compressor'];

  it('lets heading colour inherit so each surface controls its own text', () => {
    const offenders: string[] = [];
    for (const app of darkApps) {
      const css = fs.readFileSync(
        path.join(repoRoot, 'apps', app, 'src', 'index.css'),
        'utf8'
      );
      const block = css.match(/@layer base \{\s*h1, h2, h3, h4, h5, h6 \{[^}]*\}/);
      // A fixed colour here overrides the surface and the utility classes.
      if (!block || !/color:\s*inherit/.test(block[0])) offenders.push(app);
    }
    expect(offenders).toEqual([]);
  });

  it('keeps the shared FAQ heading free of a hard-coded colour', () => {
    // CalculatorFaqSection renders on the dark shell AND on light calculator
    // pages; a fixed colour measured 1:1 on one of them.
    const file = path.join(
      repoRoot,
      'apps',
      'tools',
      'src',
      'components',
      'CalculatorFaqSection.tsx'
    );
    const source = fs.readFileSync(file, 'utf8');
    const heading = source.match(/<h3[^>]*className="([^"]*)"/);
    expect(heading).not.toBeNull();
    expect(/text-(slate|neutral|gray|zinc|stone)-\d+/.test(heading![1])).toBe(false);
  });

  it('never pairs bg-emerald-600 with white text (measured 3.65:1)', () => {
    const offenders: string[] = [];
    for (const app of darkApps) {
      for (const file of collect(path.join(repoRoot, 'apps', app, 'src'))) {
        fs.readFileSync(file, 'utf8')
          .split('\n')
          .forEach((line, index) => {
            if (/bg-emerald-600\b/.test(line) && /text-white/.test(line)) {
              offenders.push(path.relative(repoRoot, file) + ':' + (index + 1));
            }
          });
      }
    }
    expect(offenders).toEqual([]);
  });

  /**
   * A 600-weight accent used as a *text* colour on a white card measures
   * 3.2-3.7:1 — below AA for the 12-16px sizes these figures use. Finance had
   * 270+ such nodes across its amortisation tables. The AA-safe step on light
   * surfaces is the 700 shade.
   *
   * This is only safe as a blanket rule because the audit confirmed none of
   * these accents render on a dark surface, where 700 would be *worse* than
   * 600. The same 600 shades are correct in the dark hero cards, which use the
   * lighter 300/400 shades instead.
   */
  it('does not use a 600-weight accent as text paired with a white/scrim background', () => {
    const offenders: string[] = [];
    const pattern = /bg-(white|slate-50|slate-100|slate-200\/\d+)[^"'\s]*[\s\S]{0,120}?text-(emerald|amber|rose|cyan)-600/;
    for (const app of ['finance', 'tools', 'compressor']) {
      for (const file of collect(path.join(repoRoot, 'apps', app, 'src'))) {
        const source = fs.readFileSync(file, 'utf8');
        source.split('\n').forEach((line, index) => {
          // Only flag when both classes sit on the same element string.
          if (/text-(emerald|amber|rose|cyan)-600/.test(line) && /bg-(white|slate-50|slate-100)\b/.test(line)) {
            offenders.push(path.relative(repoRoot, file) + ':' + (index + 1));
          }
        });
      }
    }
    expect(offenders).toEqual([]);
  });

  it('keeps the verified light-surface micro labels at slate-500 or darker', () => {
    // These specific 10-11px labels sit on near-white tinted cards where
    // slate-400 measures 2.45-2.56:1. They were each confirmed by browser
    // audit to be light-surface, unlike the dark-surface slate-400 labels.
    const files = [
      ['apps/finance/src/pages/FinanceCalculatorHub.tsx', 'text-[11px] text-slate-400 pt-0.5'],
      ['apps/finance/src/components/PaymentDonutChart.tsx', 'text-[10px] text-slate-500 ml-1.5'],
      ['apps/finance/src/pages/BrrrrCalculator.tsx', 'text-[11px] text-slate-500 mt-1 leading-snug'],
    ];
    const offenders: string[] = [];
    for (const [rel, forbidden] of files) {
      const source = fs.readFileSync(path.join(repoRoot, rel), 'utf8');
      if (source.includes(forbidden)) offenders.push(rel);
    }
    expect(offenders).toEqual([]);
  });

  /**
   * The info tooltip must render through a portal.
   *
   * It used to be an absolutely-positioned child of its trigger, so any
   * ancestor with `overflow-hidden` clipped it. Result cards carry
   * overflow-hidden to contain decorative accents, so the Cap Rate tooltip was
   * cut to a 13px sliver — 139 of its 152px were gone — and tooltips inside
   * `overflow-x-auto` schedule wrappers were clipped the same way. The
   * explanation is the entire point of the control, so losing it silently is a
   * real defect. A portal renders into <body> and escapes every ancestor clip.
   */
  it('renders the info tooltip through a portal so no ancestor can clip it', () => {
    const rel = 'apps/finance/src/components/InfoTooltip.tsx';
    const source = fs.readFileSync(path.join(repoRoot, rel), 'utf8');
    expect(source).toContain("from 'react-dom'");
    expect(source).toContain('createPortal');
    // A portal target of document.body is what escapes the clipping context.
    expect(source).toContain('createPortal(panel, document.body)');
    // The panel must be positioned, not left in normal flow.
    expect(source).toMatch(/position:\s*'(absolute|fixed)'/);
  });
});

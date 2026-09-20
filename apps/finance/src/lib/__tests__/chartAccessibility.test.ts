import { describe, it, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

const componentsRoot = path.join(import.meta.dir, '..', '..', 'components');

function collectChartFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectChartFiles(full, out);
    } else if (/Chart.*\.tsx$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

/**
 * A chart is a complex image: without a role and an accessible name the
 * accessibility tree exposes an unlabelled graphic and a screen reader
 * announces "graphic" with none of the figures. All six suite charts shipped
 * that way. This guard keeps every chart SVG labelled.
 */
describe('Chart accessibility', () => {
  const chartFiles = collectChartFiles(componentsRoot);

  it('finds the chart components', () => {
    expect(chartFiles.length).toBeGreaterThanOrEqual(6);
  });

  it('gives every chart SVG role="img" and an accessible name', () => {
    const offenders: string[] = [];

    for (const file of chartFiles) {
      const contents = fs.readFileSync(file, 'utf8');
      const svgStart = contents.indexOf('<svg');
      if (svgStart === -1) continue;
      const svgTagEnd = contents.indexOf('>', svgStart);
      const svgTag = contents.slice(svgStart, svgTagEnd);

      const relative = path.relative(componentsRoot, file);
      if (!/role="img"/.test(svgTag)) offenders.push(`${relative}: <svg> missing role="img"`);
      if (!/aria-label=/.test(svgTag)) offenders.push(`${relative}: <svg> missing aria-label`);
    }

    expect(offenders).toEqual([]);
  });

  it('builds chart names through the shared helpers rather than ad-hoc strings', () => {
    const offenders: string[] = [];

    for (const file of chartFiles) {
      const contents = fs.readFileSync(file, 'utf8');
      const hasAriaLabel = /aria-label=/.test(contents);
      if (!hasAriaLabel) continue;
      // Either a shared helper, or a literal template that names real figures.
      const usesHelper = /chartAriaLabel|chartTrendAriaLabel/.test(contents);
      const usesTemplate = /aria-label=\{`/.test(contents);
      if (!usesHelper && !usesTemplate) {
        offenders.push(path.relative(componentsRoot, file));
      }
    }

    expect(offenders).toEqual([]);
  });
});

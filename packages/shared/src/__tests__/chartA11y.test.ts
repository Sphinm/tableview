import { describe, it, expect } from 'bun:test';
import { chartAriaLabel, chartTrendAriaLabel } from '../chartA11y';

describe('Chart accessible descriptions', () => {
  it('names the chart and every series with its value and share', () => {
    const label = chartAriaLabel('Monthly Housing Cost Allocation', [
      { label: 'Principal & Interest', value: '$2,302', share: '63.8%' },
      { label: 'Property Tax', value: '$583', share: '16.2%' },
    ]);
    expect(label).toBe(
      'Monthly Housing Cost Allocation. Principal & Interest $2,302 (63.8%); Property Tax $583 (16.2%).'
    );
  });

  it('omits the share when the chart has no part-to-whole meaning', () => {
    const label = chartAriaLabel('Loan Comparison', [
      { label: 'Option A', value: '$2,543' },
      { label: 'Option B', value: '$2,752' },
    ]);
    expect(label).toBe('Loan Comparison. Option A $2,543; Option B $2,752.');
  });

  it('states how many series were left out rather than dropping them silently', () => {
    const many = Array.from({ length: 9 }, (_, i) => ({ label: `Series ${i + 1}`, value: `$${i}` }));
    const label = chartAriaLabel('Big Chart', many, 6);
    // The omitted-count tail follows the last shown series.
    expect(label).toContain('Series 6 $5; 3 further series omitted.');
    expect(label).toMatch(/\.$/);
    expect(label).not.toContain('Series 7');
  });

  it('falls back to the title when there is no data to describe', () => {
    expect(chartAriaLabel('Empty Chart', [])).toBe('Empty Chart');
    expect(chartTrendAriaLabel('Empty Trend', [])).toBe('Empty Trend');
  });

  it('describes a trend by its endpoints', () => {
    const label = chartTrendAriaLabel('30-Year Amortization Schedule', [
      { name: 'Ending balance', from: '$450,000', to: '$0' },
      { name: 'Interest paid to date', from: '$0', to: '$486,221' },
    ]);
    expect(label).toBe(
      '30-Year Amortization Schedule. Ending balance from $450,000 to $0; Interest paid to date from $0 to $486,221.'
    );
  });
});

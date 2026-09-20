import { describe, it, expect } from 'bun:test';
import { composeAnnouncement } from '../resultAnnouncement';

describe('Result announcement composition', () => {
  it('speaks each metric with its label', () => {
    expect(
      composeAnnouncement(
        [
          { label: 'DSCR', value: '1.28x' },
          { label: 'monthly net cash flow', value: '$583' },
        ],
        { context: 'Results updated' }
      )
    ).toBe('Results updated: DSCR 1.28x, monthly net cash flow $583.');
  });

  it('omits the context clause when none is given', () => {
    expect(composeAnnouncement([{ label: 'Cap rate', value: '6.4%' }])).toBe('Cap rate 6.4%.');
  });

  it('drops blank values instead of announcing empty metrics', () => {
    expect(
      composeAnnouncement([
        { label: 'DSCR', value: '1.28x' },
        { label: 'PMI', value: '' },
        { label: 'HOA', value: '' },
      ])
    ).toBe('DSCR 1.28x.');
  });

  it('returns an empty string when nothing is worth saying', () => {
    // An empty announcement must not clobber the live region with noise.
    expect(composeAnnouncement([])).toBe('');
    expect(composeAnnouncement([{ label: 'PMI', value: '' }])).toBe('');
  });

  it('appends a trailing clause when provided', () => {
    expect(
      composeAnnouncement([{ label: 'Monthly payment', value: '$2,018' }], {
        trailing: 'Qualifies for prime terms.',
      })
    ).toBe('Monthly payment $2,018. Qualifies for prime terms.');
  });

  it('ignores a blank trailing clause', () => {
    expect(
      composeAnnouncement([{ label: 'Monthly payment', value: '$2,018' }], { trailing: '   ' })
    ).toBe('Monthly payment $2,018.');
  });
});

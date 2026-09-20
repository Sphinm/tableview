import { describe, it, expect } from 'bun:test';
import { toIsoDate } from '../isoDate';

describe('toIsoDate', () => {
  it('converts the display format used by guides', () => {
    expect(toIsoDate('September 5, 2026')).toBe('2026-09-05');
    expect(toIsoDate('January 1, 2026')).toBe('2026-01-01');
    expect(toIsoDate('December 31, 2026')).toBe('2026-12-31');
  });

  it('handles single-digit days without a leading zero in the source', () => {
    expect(toIsoDate('March 9, 2026')).toBe('2026-03-09');
  });

  it('accepts a comma-less form and an abbreviated month', () => {
    expect(toIsoDate('September 5 2026')).toBe('2026-09-05');
    expect(toIsoDate('Sept. 5, 2026')).toBe('2026-09-05');
  });

  it('passes through an existing ISO date', () => {
    expect(toIsoDate('2026-09-05')).toBe('2026-09-05');
  });

  it('formats a Date object as UTC', () => {
    expect(toIsoDate(new Date(Date.UTC(2026, 8, 5)))).toBe('2026-09-05');
  });

  it('rejects impossible dates rather than rolling them over', () => {
    // Without validation, Date.UTC would silently turn this into March 2.
    expect(toIsoDate('February 30, 2026')).toBeNull();
    expect(toIsoDate('2026-02-30')).toBeNull();
    expect(toIsoDate('2026-13-01')).toBeNull();
  });

  it('returns null for empty and unknown input', () => {
    expect(toIsoDate('')).toBeNull();
    expect(toIsoDate(undefined)).toBeNull();
    expect(toIsoDate(null)).toBeNull();
  });

});

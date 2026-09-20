import { describe, it, expect } from 'bun:test';
import {
  formatUsd,
  formatUsdCents,
  formatUsdSigned,
  formatNumber,
  formatPercent,
  formatRate,
} from '../format';

describe('Financial formatting determinism', () => {
  it('formats whole dollars with grouping and a dollar sign', () => {
    expect(formatUsd(1234567)).toBe('$1,234,567');
    expect(formatUsd(0)).toBe('$0');
  });

  it('rounds whole-dollar amounts rather than truncating', () => {
    expect(formatUsd(1234.5)).toBe('$1,235');
    expect(formatUsd(1234.4)).toBe('$1,234');
  });

  it('formats cents-precision amounts', () => {
    expect(formatUsdCents(1234.5)).toBe('$1,234.50');
    expect(formatUsdCents(0)).toBe('$0.00');
  });

  /**
   * The core regression: output must not depend on the host locale. Node here
   * runs in the process locale but Intl is pinned, so the grouped separator is
   * always a comma and the decimal separator always a period.
   */
  it('uses en-US separators regardless of host locale', () => {
    expect(formatUsd(1234)).toBe('$1,234');
    expect(formatUsd(1234)).not.toContain('.');
    expect(formatUsdCents(1234.5)).toContain('.');
    expect(formatUsdCents(1234.5)).not.toContain(',5');
  });

  it('keeps the sign outside the currency symbol for deltas', () => {
    expect(formatUsdSigned(500)).toBe('+$500');
    expect(formatUsdSigned(-500)).toBe('-$500');
    expect(formatUsdSigned(0)).toBe('$0');
    expect(formatUsdSigned(-1234.56, true)).toBe('-$1,234.56');
  });

  it('degrades non-finite input instead of printing NaN', () => {
    expect(formatUsd(NaN)).toBe('$0');
    expect(formatUsd(Infinity)).toBe('$0');
    expect(formatUsdCents(Number.NaN)).toBe('$0.00');
    expect(formatNumber(Number.NaN)).toBe('0');
    expect(formatPercent(Number.NaN)).toBe('0%');
    expect(formatRate(Number.NaN)).toBe('0%');
  });

  it('formats numbers and ratios', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatNumber(1234.567, { decimals: 2 })).toBe('1,234.57');
    expect(formatPercent(1.2843)).toBe('128.4%');
    expect(formatRate(6.875)).toBe('6.88%');
  });
});

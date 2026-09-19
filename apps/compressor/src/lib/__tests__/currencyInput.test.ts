import { describe, it, expect } from 'bun:test';
import { formatCurrencyValue, parseCurrencyValue, parseNumericValue } from '../formatNumber';

describe('Currency & Numeric Input Engine', () => {
  describe('formatCurrencyValue', () => {
    it('formats integers with thousands commas', () => {
      expect(formatCurrencyValue(400000)).toBe('400,000');
      expect(formatCurrencyValue(1500)).toBe('1,500');
      expect(formatCurrencyValue(12345678)).toBe('12,345,678');
    });

    it('handles zero correctly', () => {
      expect(formatCurrencyValue(0)).toBe('0');
      expect(formatCurrencyValue('0')).toBe('0');
    });

    it('handles empty and nullish values gracefully', () => {
      expect(formatCurrencyValue('')).toBe('');
      expect(formatCurrencyValue(null as any)).toBe('');
      expect(formatCurrencyValue(undefined as any)).toBe('');
    });

    it('strips leading zeros from user typing', () => {
      expect(formatCurrencyValue('05')).toBe('5');
      expect(formatCurrencyValue('0075000')).toBe('75,000');
    });

    it('formats decimals when allowDecimal is true', () => {
      expect(formatCurrencyValue(36.06, true)).toBe('36.06');
      expect(formatCurrencyValue('1500.5', true)).toBe('1,500.5');
      expect(formatCurrencyValue('400000.', true)).toBe('400,000.');
    });

    it('strips decimals when allowDecimal is false', () => {
      expect(formatCurrencyValue('400000.50', false)).toBe('400,000');
    });
  });

  describe('parseCurrencyValue', () => {
    it('parses formatted strings into numeric values', () => {
      expect(parseCurrencyValue('400,000')).toBe(400000);
      expect(parseCurrencyValue('$400,000')).toBe(400000);
      expect(parseCurrencyValue('$1,500.50')).toBe(1500.5);
    });

    it('evaluates empty string and zero to 0', () => {
      expect(parseCurrencyValue('')).toBe(0);
      expect(parseCurrencyValue('0')).toBe(0);
      expect(parseCurrencyValue('-')).toBe(0);
    });
  });

  describe('parseNumericValue', () => {
    it('parses numeric strings with decimal support', () => {
      expect(parseNumericValue('6.75')).toBe(6.75);
      expect(parseNumericValue('15')).toBe(15);
      expect(parseNumericValue('')).toBe(0);
      expect(parseNumericValue('0')).toBe(0);
    });
  });
});

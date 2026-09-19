/**
 * Format a number or numeric string with thousands commas.
 * Strips leading zeros unless the value is literally '0'.
 */
export function formatCurrencyValue(num: number | string, allowDecimal = false): string {
  if (num === '' || num === undefined || num === null) return '';
  const str = String(num).replace(/,/g, '');
  if (str === '') return '';

  if (allowDecimal && str.includes('.')) {
    const [intPart, ...decParts] = str.split('.');
    const cleanInt = intPart.replace(/[^0-9]/g, '');
    const cleanDec = decParts.join('').replace(/[^0-9]/g, '');
    const formattedInt = cleanInt ? Number(cleanInt).toLocaleString('en-US') : '0';
    return `${formattedInt}.${cleanDec}`;
  }

  const intPart = str.split('.')[0];
  const clean = intPart.replace(/[^0-9]/g, '');
  if (!clean) return '';
  return Number(clean).toLocaleString('en-US');
}

/**
 * Parse a formatted currency string into a float number.
 * Empty string evaluates to 0.
 */
export function parseCurrencyValue(str: string): number {
  if (!str) return 0;
  const clean = str.replace(/[^0-9.-]/g, '');
  if (!clean || clean === '-') return 0;
  const parsed = parseFloat(clean);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Parse a standard numeric string into a float number.
 * Empty string evaluates to 0.
 */
export function parseNumericValue(str: string): number {
  if (!str) return 0;
  const clean = str.replace(/[^0-9.-]/g, '');
  if (!clean || clean === '-') return 0;
  const parsed = parseFloat(clean);
  return Number.isFinite(parsed) ? parsed : 0;
}

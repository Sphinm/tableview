/**
 * Canonical number formatting for TableView financial output.
 *
 * Every value a user reads as money goes through this module. The reason is
 * not brevity but determinism: bare Number.prototype.toLocaleString() formats
 * with the *browser's* locale, so 1234.5 renders as "1,234.5" in en-US and
 * "1.234,5" in de-DE. On a German or French machine that turns an exported
 * lender PDF and every share string into ambiguous, differently-punctuated
 * numbers — 1.234 reads as one-and-a-bit in en-US and as one thousand
 * two hundred in de-DE. For a lending suite that is a correctness bug, not a
 * cosmetic one.
 *
 * Everything here therefore pins the locale to en-US and the currency to USD,
 * so the same input produces byte-identical output on every machine. The
 * Intl.NumberFormat instances are module-level because constructing them is
 * comparatively expensive and amortisation tables format hundreds of cells per
 * render.
 */

/** Whole-dollar USD, e.g. $1,234,567. Used for table cells and headline figures. */
const USD_WHOLE = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Cents-precision USD, e.g. $1,234.56. Used for payments and quoted rates. */
const USD_CENTS = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Plain grouped integer/decimal, no currency symbol. */
const DECIMAL = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

/**
 * Format a USD amount with no cents. Non-finite input degrades to $0 rather
 * than rendering "$NaN" into a printed report.
 */
export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return USD_WHOLE.format(0);
  return USD_WHOLE.format(value);
}

/** Format a USD amount with exactly two decimals. */
export function formatUsdCents(value: number): string {
  if (!Number.isFinite(value)) return USD_CENTS.format(0);
  return USD_CENTS.format(value);
}

/**
 * Format a USD amount that represents a change, always carrying an explicit
 * sign so a reader can tell a saving from a cost without reading the label.
 * Zero is rendered unsigned.
 */
export function formatUsdSigned(value: number, withCents = false): string {
  if (!Number.isFinite(value)) return withCents ? USD_CENTS.format(0) : USD_WHOLE.format(0);
  const formatter = withCents ? USD_CENTS : USD_WHOLE;
  const abs = formatter.format(Math.abs(value));
  if (value > 0) return `+${abs}`;
  if (value < 0) return `-${abs}`;
  return abs;
}

/** Grouped number with up to two decimals and no currency symbol. */
export function formatNumber(value: number, options?: { decimals?: number }): string {
  if (!Number.isFinite(value)) return '0';
  const decimals = options?.decimals;
  if (decimals === undefined) return DECIMAL.format(value);
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a ratio as a percentage, e.g. 1.2843 -> "128.4%". The input is the
 * ratio (not the percentage), matching how calculators store DSCR/LTV values.
 */
export function formatPercent(ratio: number, decimals = 1): string {
  if (!Number.isFinite(ratio)) return '0%';
  return `${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(ratio * 100)}%`;
}

/** Format an already-scaled percentage value, e.g. 6.875 -> "6.88%". */
export function formatRate(percent: number, decimals = 2): string {
  if (!Number.isFinite(percent)) return '0%';
  return `${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(percent)}%`;
}

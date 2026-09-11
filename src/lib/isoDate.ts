/**
 * Date normalisation for structured data.
 *
 * Guide metadata stores human-readable dates ("September 5, 2026") because they
 * are rendered on the page. Google requires ISO 8601 for `datePublished`, and a
 * date it cannot parse makes the whole Article ineligible for rich results — so
 * every guide silently failed validation while the markup looked correct to a
 * casual reader.
 *
 * This converts the display format to ISO at the point of structured-data
 * generation, leaving the visible copy untouched.
 */

/** Full month names plus the common abbreviations, so either form parses. */
const MONTHS: Record<string, string> = {
  january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
  jan: '01', feb: '02', mar: '03', apr: '04', jun: '06', jul: '07', aug: '08',
  sep: '09', sept: '09', oct: '10', nov: '11', dec: '12',
};

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * Convert a date to ISO 8601 (YYYY-MM-DD).
 *
 * Accepts:
 *   - 'September 5, 2026'  (the format used in src/data/guides.ts)
 *   - '2026-09-05'         (already ISO, returned unchanged)
 *   - Date objects
 *
 * Returns null when the input cannot be interpreted, so callers can fail loudly
 * rather than emit an invalid date into structured data.
 */
export function toIsoDate(input: string | Date | undefined | null): string | null {
  if (!input) return null;

  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) return null;
    return `${input.getUTCFullYear()}-${pad(input.getUTCMonth() + 1)}-${pad(input.getUTCDate())}`;
  }

  const value = String(input).trim();
  if (!value) return null;

  // Already ISO 8601.
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const [, y, m, d] = iso;
    return isValid(y, m, d) ? value : null;
  }

  // "September 5, 2026" / "Sept 5, 2026" — allow a trailing period on the month.
  const long = value.match(/^([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})$/);
  if (long) {
    const month = MONTHS[long[1].toLowerCase()];
    if (!month) return null;
    const day = pad(Number(long[2]));
    const year = long[3];
    return isValid(year, month, day) ? `${year}-${month}-${day}` : null;
  }

  // Fallback: let the engine try, but only accept a result we can verify.
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getUTCFullYear()}-${pad(parsed.getUTCMonth() + 1)}-${pad(parsed.getUTCDate())}`;
  }

  return null;
}

/** Reject impossible dates such as February 30. */
function isValid(year: string, month: string, day: string): boolean {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
  );
}

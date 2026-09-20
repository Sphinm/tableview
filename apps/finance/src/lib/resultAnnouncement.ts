/**
 * Screen-reader announcements for recalculated results.
 *
 * Every calculator recomputes on each keystroke, but nothing told assistive
 * technology that the answer changed: a blind user adjusting the interest rate
 * had no way to know the monthly payment had moved. A polite live region
 * closes that loop.
 *
 * Two problems make the naive version (announce on every render) worse than
 * nothing:
 *
 *   1. Chatter. Typing "450000" into a field recalcs six times. Reading six
 *      sentences over the user's typing is unusable, so announcements are
 *      debounced.
 *   2. Redundancy. A DEBOUNCED value that has not actually changed must not be
 *      re-announced, or every unrelated re-render repeats the same sentence.
 *
 * The message is built here, as a pure function, so the phrasing is unit
 * tested independently of React and the timer.
 */

export interface AnnouncementPart {
  /** Metric name as a human would say it, e.g. "DSCR". */
  label: string;
  /** Pre-formatted value, e.g. "1.28x" or "$583". */
  value: string;
}

/**
 * Compose a single spoken sentence from labelled metrics.
 *
 * Empty or meaningless values are dropped rather than announced as blank, and
 * a leading context clause can be supplied so the listener knows *what* was
 * recomputed.
 */
export function composeAnnouncement(
  parts: AnnouncementPart[],
  options?: { context?: string; trailing?: string }
): string {
  const spoken = parts
    .filter((p) => p.value !== '' && p.value !== undefined && p.value !== null)
    .map((p) => `${p.label} ${p.value}`);

  if (spoken.length === 0) return '';

  const sentences: string[] = [];
  const context = options?.context?.trim();
  sentences.push(context ? `${context}: ${spoken.join(', ')}.` : `${spoken.join(', ')}.`);
  const trailing = options?.trailing?.trim();
  if (trailing) sentences.push(trailing);
  return sentences.join(' ');
}

import React from 'react';
import { useDebouncedValue } from '../lib/useDebouncedValue';

interface ResultAnnouncerProps {
  /**
   * The sentence to speak when results settle. Build it with
   * composeAnnouncement so phrasing stays tested and consistent.
   */
  message: string;
  /** Debounce window; long enough to skip keystroke chatter. */
  delay?: number;
}

/**
 * Polite, screen-reader-only live region for recalculated results.
 *
 * Rendered once per calculator. Keeping it visually hidden matters: sighted
 * users already see the figures, and duplicating them on screen would add
 * noise. `aria-atomic` makes the whole sentence re-read rather than only the
 * changed word, which is what makes the announcement intelligible.
 */
export const ResultAnnouncer: React.FC<ResultAnnouncerProps> = ({ message, delay = 700 }) => {
  const settled = useDebouncedValue(message, delay);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      data-testid="result-announcer"
    >
      {settled}
    </div>
  );
};

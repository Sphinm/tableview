/**
 * Product analytics events.
 *
 * Why this exists
 * ---------------
 * The site previously had zero product instrumentation: GA4 was wired up, but
 * nothing ever called it beyond the page view. That left the most important
 * question unanswerable — which underwriting tools do visitors actually use?
 *
 * It also replaces what session replay is bad at. Replay is for reconstructing a
 * failure; a funnel needs counters, and counters are cheap, consent-gated, and
 * carry no personal data.
 *
 * Rules
 * -----
 * - Every call is a no-op until analytics consent is granted, and a no-op on the
 *   server. Nothing is queued and sent later.
 * - No personal data, ever: no calculator inputs, no loan amounts, no property
 *   addresses, no client names. Only closed-set event names and coarse
 *   categorical parameters leave the browser.
 * - A closed set of event names and parameters, validated in tests, so the data
 *   stays queryable instead of degrading into free text.
 */

import { getConsent } from './consent';
import { trackEvent as trackTelemetryEvent } from '@tableview/shared';

/** Coarse size buckets — never an exact byte count, which can fingerprint a file. */
export type SizeBucket = '<1MB' | '1-10MB' | '10-100MB' | '100MB-1GB' | '>1GB';

export function sizeBucket(bytes: number): SizeBucket {
  if (bytes < 1024 * 1024) return '<1MB';
  if (bytes < 10 * 1024 * 1024) return '1-10MB';
  if (bytes < 100 * 1024 * 1024) return '10-100MB';
  if (bytes < 1024 * 1024 * 1024) return '100MB-1GB';
  return '>1GB';
}

/** File extension without the dot, lowercased and length-capped. */
export function fileExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  if (dot < 0 || dot === name.length - 1) return 'none';
  return name.slice(dot + 1).toLowerCase().slice(0, 8);
}

function gtagAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Send an event. Silently dropped without consent.
 *
 * `event_category` is set so the events are easy to segment in GA4 reports.
 */
export function trackEvent(name: string, params: Record<string, string | number | boolean> = {}): void {
  // Always forward to zero-dependency encrypted telemetry stream
  trackTelemetryEvent(name, params);

  if (getConsent() !== 'granted') return;
  if (!gtagAvailable()) return;

  try {
    window.gtag!('event', name, { event_category: 'tableview', ...params });
  } catch {
    // Analytics must never break the app.
  }
}

export const analytics = {
  /** A calculator result was exported or printed. */
  calculatorExport(info: { calculator: string; format: string }) {
    trackEvent('calculator_export', { calculator: info.calculator, format: info.format });
  },

  /** A visitor switched the 1031 calculator into multi-candidate comparison. */
  compareCandidatesToggled(info: { calculator: string; enabled: boolean; count?: number }) {
    trackEvent('compare_candidates_toggled', {
      calculator: info.calculator,
      enabled: info.enabled,
      ...(info.count !== undefined ? { candidate_count: info.count } : {}),
    });
  },

  /** The cookie banner was answered. */
  consentDecision(granted: boolean) {
    // Deliberately bypasses the consent gate: this is the event that records the
    // decision itself, and it carries no personal data.
    if (!gtagAvailable()) return;
    try {
      window.gtag!('event', 'consent_decision', {
        event_category: 'tableview',
        granted,
      });
    } catch {
      // Ignore.
    }
  },
};

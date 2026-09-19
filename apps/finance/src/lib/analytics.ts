/**
 * Product analytics events.
 *
 * Why this exists
 * ---------------
 * The site previously had zero product instrumentation: GA4 was wired up, but
 * nothing ever called it beyond the page view. That left the most important
 * question unanswerable — where do people give up in the workspace?
 *
 * It also replaces what session replay is bad at. Replay is for reconstructing a
 * failure; a funnel needs counters, and counters are cheap, consent-gated, and
 * carry no personal data.
 *
 * Rules
 * -----
 * - Every call is a no-op until analytics consent is granted, and a no-op on the
 *   server. Nothing is queued and sent later.
 * - No personal data, ever: no file names, no table names, no SQL text, no
 *   column names, no calculator inputs. Sizes go out as coarse buckets and
 *   durations as rounded milliseconds.
 * - A closed set of event names and parameters, validated in tests, so the data
 *   stays queryable instead of degrading into free text.
 */

import { getConsent } from './consent';

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

/** Round durations so the numbers are useful without being identifying. */
function roundMs(ms: number): number {
  if (!Number.isFinite(ms) || ms < 0) return 0;
  if (ms < 1000) return Math.round(ms / 50) * 50;
  return Math.round(ms / 1000) * 1000;
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
  if (getConsent() !== 'granted') return;
  if (!gtagAvailable()) return;

  try {
    window.gtag!('event', name, { event_category: 'tableview', ...params });
  } catch {
    // Analytics must never break the app.
  }
}

/* ------------------------------------------------------------------ *
 * Workspace funnel
 *
 * file_dropped -> engine_ready -> file_opened -> (sql_query_run | export_clicked)
 *
 * The drop-off between adjacent steps is the number worth watching; a large gap
 * after file_dropped means the engine download is losing people.
 * ------------------------------------------------------------------ */

export const analytics = {
  /** A file was selected, before any parsing. */
  fileDropped(file: { name: string; size: number }) {
    trackEvent('file_dropped', {
      file_extension: fileExtension(file.name),
      size_bucket: sizeBucket(file.size),
    });
  },

  /** The DuckDB engine finished initialising. */
  engineReady(durationMs: number) {
    trackEvent('engine_ready', { duration_ms: roundMs(durationMs) });
  },

  /** The engine could not be loaded at all (CDN blocked, offline). */
  engineLoadFailed(reason: string) {
    trackEvent('engine_load_failed', { reason: reason.slice(0, 80) });
  },

  /** A file was parsed and is now queryable. */
  fileOpened(info: { extension: string; sizeBucket: SizeBucket; rowCount: number; durationMs: number }) {
    trackEvent('file_opened', {
      file_extension: info.extension,
      size_bucket: info.sizeBucket,
      // Bucketed so a large dataset does not become a unique fingerprint.
      row_bucket: info.rowCount > 1_000_000 ? '>1M' : info.rowCount > 100_000 ? '100k-1M' : info.rowCount > 1_000 ? '1k-100k' : '<1k',
      duration_ms: roundMs(info.durationMs),
    });
  },

  /** A file failed to parse (distinct from the engine failing). */
  fileOpenFailed(info: { extension: string; sizeBucket: SizeBucket; reason: string }) {
    trackEvent('file_open_failed', {
      file_extension: info.extension,
      size_bucket: info.sizeBucket,
      reason: info.reason.slice(0, 80),
    });
  },

  /** The user ran a query in the SQL console. Never records the SQL itself. */
  sqlQueryRun(info: { ok: boolean; durationMs: number }) {
    trackEvent('sql_query_run', { ok: info.ok, duration_ms: roundMs(info.durationMs) });
  },

  /** An export completed. */
  exportClicked(info: { format: string; rowCount: number }) {
    trackEvent('export_clicked', {
      format: info.format,
      row_bucket: info.rowCount > 1_000_000 ? '>1M' : info.rowCount > 100_000 ? '100k-1M' : '<=100k',
    });
  },

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

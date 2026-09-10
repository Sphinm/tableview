/**
 * Error reporting — lazily loaded, privacy-scrubbed.
 *
 * Strategy: a happy-path visitor downloads ZERO bytes of Sentry. The SDK is
 * fetched only when something actually goes wrong:
 *   1. a window 'error' / 'unhandledrejection' fires, or
 *   2. the app explicitly calls captureException().
 * Until then, errors are buffered in memory and replayed after the SDK loads.
 */

/*
 * Keys that may carry user file names, table names, or file contents.
 * TableView's core promise is "your data never leaves your device", so nothing
 * derived from a user's file may be shipped to Sentry.
 */
const SENSITIVE_KEY_PATTERN =
  /^(file_?name|filename|table_?name|tablename|sheet_?name|path|filepath|sql|query|content|rows?|data|column_?names?|columns|headers)$/i;

const REDACTED = '[redacted]';

/**
 * Deep-scrub a Sentry payload, replacing any value stored under a sensitive key.
 * Depth is capped so a pathological object cannot hang error reporting.
 */
function scrub(value: any, depth = 0): any {
  if (depth > 6 || value == null) return value;

  if (Array.isArray(value)) {
    return value.map((item) => scrub(item, depth + 1));
  }

  if (typeof value === 'object') {
    // Preserve non-plain objects (Error, Date, etc.) rather than mangling them.
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) return value;

    const out: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : scrub(val, depth + 1);
    }
    return out;
  }

  return value;
}

/**
 * Safe, non-identifying description of a user file for diagnostics.
 * Only the extension and a coarse size bucket are retained — never the name.
 */
export function describeFile(file: { name?: string; size?: number; type?: string }) {
  const name = file?.name ?? '';
  const dot = name.lastIndexOf('.');
  const extension = dot > -1 ? name.slice(dot + 1).toLowerCase().slice(0, 8) : 'unknown';
  const bytes = typeof file?.size === 'number' ? file.size : 0;

  return {
    extension,
    sizeBucket:
      bytes < 1024 * 1024
        ? '<1MB'
        : bytes < 10 * 1024 * 1024
          ? '1-10MB'
          : bytes < 100 * 1024 * 1024
            ? '10-100MB'
            : '>100MB',
    mimeType: file?.type || 'unknown',
  };
}

type SentryCapture = (error: unknown, context?: Record<string, any>) => void;

type BufferedError = { error: unknown; context?: Record<string, any> };

const buffer: BufferedError[] = [];

let capture: SentryCapture | null = null;
let loadPromise: Promise<void> | null = null;

/** Load + initialise the SDK exactly once, then flush anything buffered. */
function loadSentry(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    // Destructuring the dynamic import keeps tree-shaking effective.
    const { init, browserTracingIntegration, captureException: sdkCapture } = await import('@sentry/react');

    init({
      dsn: 'https://330704be8f7a26daeef5c9df226accc5@o4512049296637952.ingest.us.sentry.io/4512049306730496',
      integrations: [browserTracingIntegration()],
      // Tracing: sample 20% in production to conserve free tier quota (10k transactions/mo)
      tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
      tracePropagationTargets: ['localhost', /^https:\/\/tableview\.dev/],
      environment: import.meta.env.MODE,

      // Privacy: never attach IP address, cookies, or request bodies to an event.
      sendDefaultPii: false,

      // Defense in depth — scrub anything that slipped through at a call site.
      beforeSend(event: any) {
        if (event.extra) event.extra = scrub(event.extra);
        if (event.contexts) event.contexts = scrub(event.contexts);
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map((crumb: any) => ({
            ...crumb,
            data: crumb.data ? scrub(crumb.data) : crumb.data,
          }));
        }
        return event;
      },

      // Filter out common browser extension, ad blocker, and benign resize noise
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        'Non-Error promise rejection captured',
        'adsbygoogle',
        /chrome-extension:\/\//,
        /moz-extension:\/\//,
      ],
      denyUrls: [
        /extensions\//i,
        /^chrome:\/\//i,
        /^chrome-extension:\/\//i,
        /^moz-extension:\/\//i,
        /pagead2\.googlesyndication\.com/i,
        /adblock/i,
      ],
    });

    capture = (error, context) => sdkCapture(error, context as any);

    // Replay everything that happened while the SDK was not yet available.
    for (const buffered of buffer.splice(0)) {
      capture(buffered.error, buffered.context);
    }
  })();

  return loadPromise;
}

/**
 * Report an exception. Triggers the lazy SDK load on first use; if the SDK is
 * still loading the error is buffered and sent as soon as it is ready.
 */
export function captureException(error: unknown, context?: Record<string, any>) {
  if (capture) {
    capture(error, context);
    return;
  }
  buffer.push({ error, context });
  void loadSentry();
}

function onWindowError(event: ErrorEvent) {
  if (capture) return;
  buffer.push({ error: event.error ?? event.message, context: { tags: { source: 'window.onerror' } } });
  void loadSentry();
}

function onUnhandledRejection(event: PromiseRejectionEvent) {
  if (capture) return;
  buffer.push({ error: event.reason, context: { tags: { source: 'unhandledrejection' } } });
  void loadSentry();
}

/**
 * Install the early-error hooks. Deliberately does NOT download the SDK —
 * that only happens once an error actually occurs.
 */
export function scheduleSentryInit() {
  if (typeof window === 'undefined') return;
  window.addEventListener('error', onWindowError);
  window.addEventListener('unhandledrejection', onUnhandledRejection);
}

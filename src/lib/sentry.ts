/**
 * Error reporting and session replay — lazily loaded, privacy-scrubbed.
 *
 * Loading model
 * -------------
 * Two paths, chosen by consent:
 *
 *   - Consent granted  -> the SDK is fetched once the browser is idle. Replay
 *     cannot reconstruct a session that was never recorded, so a consenting
 *     visitor needs it running from the start.
 *   - No consent yet   -> nothing is fetched. The SDK loads only if an error
 *     actually occurs, then reports it. A healthy session costs zero bytes.
 *
 * The second path matters more than it looks: @sentry/react re-exports
 * @sentry/replay, so the two share a static import edge and loading the core
 * also downloads the recorder. Measured with a cold browser profile, an
 * unguarded preload fetched the replay chunk for a visitor who had not
 * consented — which is why the preload is gated rather than unconditional.
 *
 * Replay model
 * ------------
 * Replays are buffered in memory and uploaded ONLY when an error fires (see the
 * sample rates in init below). That matches what replay is for here:
 * reconstructing the steps that led to a failure. To record arbitrary sessions
 * instead, raise `replaysSessionSampleRate` above zero — at the cost of far more
 * ingestion and a much broader privacy surface.
 *
 * Privacy
 * -------
 * Replay is gated on analytics consent. Verified by loading the built site in a
 * cold browser profile: without consent the replay chunk is never requested, and
 * with consent both the SDK and replay chunks are. Recording also stops if the
 * visitor withdraws.
 *
 * Masking leans on the library defaults and goes further:
 *   - `maskAllText`   (default true) — every text node is masked
 *   - `maskAllInputs` (default true) — every field value is masked
 *   - `blockAllMedia` (default true) — images/video become placeholders
 * The data workspace and every calculator additionally carry `data-sentry-mask`,
 * because their contents are the user's own financial and dataset values — the
 * exact thing this product promises never leaves the device.
 * `networkDetailAllowUrls` is empty so request/response bodies are never captured.
 */

/*
 * Keys that may carry user file names, table names, or file contents.
 * Nothing derived from a user's file may be shipped to Sentry.
 */
const SENSITIVE_KEY_PATTERN =
  /^(file_?name|filename|table_?name|tablename|sheet_?name|path|filepath|sql|query|content|rows?|data|column_?names?|columns|headers)$/i;

const REDACTED = '[redacted]';

/**
 * Fraction of consenting sessions recorded end-to-end.
 *
 * Kept as a named constant because it is the dial that trades replay coverage
 * against the Sentry replay quota — currently 50 replays/month on the free
 * Developer plan. See the note at the top of the init block.
 */
export const REPLAY_SESSION_SAMPLE_RATE = 0.5;

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
let sdk: any = null;
let loadPromise: Promise<void> | null = null;
let replayStarted = false;

/** Read the persisted consent decision without importing consent.ts (cycle). */
function hasAnalyticsConsent(): boolean {
  try {
    return localStorage.getItem('tableview_cookie_consent') === 'accepted';
  } catch {
    return false;
  }
}

/** Load + initialise the SDK exactly once, then flush anything buffered. */
function loadSentry(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const Sentry = await import('@sentry/react');
    sdk = Sentry;

    const { init, browserTracingIntegration, captureException: sdkCapture } = Sentry;

    init({
      dsn: 'https://330704be8f7a26daeef5c9df226accc5@o4512049296637952.ingest.us.sentry.io/4512049306730496',
      integrations: [browserTracingIntegration()],
      // Tracing: sample 20% in production to conserve free tier quota (10k transactions/mo)
      tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
      tracePropagationTargets: ['localhost', /^https:\/\/tableview\.dev/],
      environment: import.meta.env.MODE,

      // Session replay is still gated on consent (see startReplay); these rates
      // decide how much of a CONSENTING visitor's session is uploaded.
      //
      //   sessionSampleRate  0.5 -> half of all sessions are recorded and sent,
      //                             whether or not anything goes wrong.
      //   onErrorSampleRate  1.0 -> every session that hits an error is sent
      //                             regardless, via the in-memory buffer. So an
      //                             error is never missed just because its
      //                             session lost the 50% coin flip.
      //
      // QUOTA: Sentry's free Developer plan includes 50 replays per MONTH (new
      // accounts get 5,000/mo for the first 3 months). At 50% sampling that is
      // roughly 100 recorded sessions per month before the quota is spent; after
      // that Sentry silently stops accepting replays until the period resets.
      // Lower REPLAY_SESSION_SAMPLE_RATE if sessions grow, or raise the plan.
      replaysSessionSampleRate: REPLAY_SESSION_SAMPLE_RATE,
      replaysOnErrorSampleRate: 1.0,

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

    // Replay only when the visitor had already opted in before the SDK loaded.
    if (hasAnalyticsConsent()) {
      await startReplay();
    }

    // Replay everything that happened while the SDK was not yet available.
    for (const buffered of buffer.splice(0)) {
      capture(buffered.error, buffered.context);
    }
  })();

  return loadPromise;
}

/**
 * Download and enable session replay. Requires the SDK to be initialised.
 *
 * Replays are buffered in memory and only uploaded when an error occurs.
 */
export async function startReplay(): Promise<void> {
  if (replayStarted) return;

  if (!sdk) await loadSentry();
  if (replayStarted || !sdk) return;

  try {
    const { replayIntegration } = await import('@sentry/replay');

    const replay = replayIntegration({
      // Stated explicitly even where these match the defaults, so the privacy
      // posture is reviewable without reading the library's source.
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
      // Never capture request/response bodies — the workspace handles user files.
      networkDetailAllowUrls: [],
      // Keep ad/tracking noise out of the recorded network waterfall.
      networkDetailDenyUrls: [
        /googlesyndication/,
        /doubleclick/,
        /google-analytics/,
        /googletagmanager/,
      ],
    });

    // addIntegration is the supported way to enable replay after init, which is
    // what lets us avoid shipping the bundle to visitors who never consent.
    sdk.addIntegration(replay);
    replayStarted = true;
  } catch (error) {
    // Replay is a nice-to-have; never let it break error reporting.
    console.warn('Session replay could not be started:', error);
  }
}

/**
 * Stop recording. Used when a visitor withdraws analytics consent.
 *
 * A recording already uploaded cannot be recalled, so consent.ts pairs this with
 * a page reload — after which the bundle is not loaded again.
 */
export function stopReplay(): void {
  if (!sdk || !replayStarted) return;
  try {
    const replay = typeof sdk.getReplay === 'function' ? sdk.getReplay() : undefined;
    replay?.stop?.();
  } catch {
    // Best-effort.
  }
  replayStarted = false;
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

/**
 * Install the early-error hooks and schedule the SDK load for when the browser
 * is idle.
 *
 * The SDK loads unconditionally rather than on first error, because session
 * replay cannot reconstruct a session that was never recorded.
 */
export function scheduleSentryInit() {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', onWindowError);
  window.addEventListener('unhandledrejection', onUnhandledRejection);

  // Sentry is preloaded ONLY for visitors who granted analytics consent.
  //
  // Two reasons, and the second is the important one:
  //   1. Replay cannot reconstruct a session that was never recorded, so a
  //      consenting visitor needs the SDK running from the start.
  //   2. @sentry/react re-exports @sentry/replay, which puts a static import
  //      edge between the two in the bundle. Loading the core therefore also
  //      downloads the recorder. Measured: a non-consenting visitor fetched the
  //      replay chunk before this guard existed, contradicting the guarantee
  //      that recording is consent-gated.
  //
  // Everyone else stays on the error-triggered path below: zero Sentry bytes
  // until something actually fails.
  if (!hasAnalyticsConsent()) return;

  const start = () => {
    void loadSentry().then(() => {
      // The SDK installs its own global handlers now, so ours are redundant.
      window.removeEventListener('error', onWindowError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    });
  };

  const idle = (window as any).requestIdleCallback;
  if (typeof idle === 'function') {
    idle(start, { timeout: 2000 });
  } else {
    setTimeout(start, 1200);
  }
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

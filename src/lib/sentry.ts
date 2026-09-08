import * as Sentry from '@sentry/react';

export function initSentry() {
  Sentry.init({
    dsn: 'https://330704be8f7a26daeef5c9df226accc5@o4512049296637952.ingest.us.sentry.io/4512049306730496',
    integrations: [
      Sentry.browserTracingIntegration()
    ],
    // Tracing: sample 20% in production to conserve free tier quota (10k transactions/mo)
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    tracePropagationTargets: ['localhost', /^https:\/\/tableview\.dev/],
    environment: import.meta.env.MODE,

    // Filter out common browser extension, ad blocker, and benign resize noise
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured',
      'adsbygoogle',
      'Failed to fetch dynamically imported module',
      /chrome-extension:\/\//,
      /moz-extension:\/\//
    ],
    denyUrls: [
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      /^moz-extension:\/\//i,
      /pagead2\.googlesyndication\.com/i,
      /adblock/i
    ]
  });
}

export { Sentry };

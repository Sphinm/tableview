/**
 * Consent management (GDPR / ePrivacy / Google Consent Mode v2).
 *
 * Design notes:
 * - The *default* consent state is written inline in index.html <head> so that it
 *   is guaranteed to run before the AdSense tag. This module only ever *upgrades*
 *   that state after an explicit user action.
 * - Microsoft Clarity (session recording) is treated as analytics and is therefore
 *   never loaded until the user grants consent.
 * - No cookies are set by this module; the choice is stored in localStorage.
 */

export type ConsentState = 'granted' | 'denied' | 'unset';

const STORAGE_KEY = 'tableview_cookie_consent';
const CLARITY_PROJECT_ID = 'yeyf0hxgk6';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

let clarityLoaded = false;

/** Read the persisted choice. Returns 'unset' when the user has not decided yet. */
export function getConsent(): ConsentState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'accepted') return 'granted';
    if (stored === 'essential_only') return 'denied';
  } catch {
    // localStorage can be unavailable in private/restricted contexts.
  }
  return 'unset';
}

/**
 * Push a Consent Mode v2 update. Safe to call even if the inline stub is missing
 * (e.g. in unit tests or if the head script was stripped by a proxy).
 */
function pushConsentUpdate(granted: boolean) {
  const gtag = window.gtag;
  if (typeof gtag !== 'function') return;

  gtag('consent', 'update', {
    ad_storage: granted ? 'granted' : 'denied',
    ad_user_data: granted ? 'granted' : 'denied',
    ad_personalization: granted ? 'granted' : 'denied',
    analytics_storage: granted ? 'granted' : 'denied',
  });
}

/** Inject Microsoft Clarity exactly once, and only after consent. */
function loadClarity() {
  if (clarityLoaded || typeof document === 'undefined') return;
  if (document.querySelector('script[data-tableview-clarity]')) {
    clarityLoaded = true;
    return;
  }
  clarityLoaded = true;

  const script = document.createElement('script');
  script.async = true;
  script.dataset.tableviewClarity = 'true';
  script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
  document.head.appendChild(script);
}

/**
 * Record the user's choice and apply it to every consent-gated tag.
 * Called by the cookie banner.
 *
 * Withdrawing consent cannot unload an already-injected third-party script, so
 * when a previously-granted visitor downgrades to essential-only we reload the
 * page to guarantee the tags are actually gone.
 */
export function setConsent(granted: boolean) {
  const previous = getConsent();

  try {
    localStorage.setItem(STORAGE_KEY, granted ? 'accepted' : 'essential_only');
  } catch {
    // Non-fatal: the choice simply will not persist across reloads.
  }

  pushConsentUpdate(granted);

  if (granted) {
    loadClarity();
    return;
  }

  if (previous === 'granted') {
    window.location.reload();
  }
}

/** Re-open the consent banner so visitors can change or withdraw their choice. */
export function openCookieSettings() {
  window.dispatchEvent(new Event('tableview:open-cookie-settings'));
}

/**
 * Bootstrap on app start: re-apply a previously granted choice so returning
 * visitors get analytics without seeing the banner again.
 */
export function initConsent() {
  if (getConsent() === 'granted') {
    pushConsentUpdate(true);
    loadClarity();
  }
}

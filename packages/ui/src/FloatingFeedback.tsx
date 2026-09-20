import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { isCookieBannerPresent } from './cookieBannerPlacement';

/**
 * Floating, corner-anchored feedback entry point.
 *
 * A plain mailto anchor: activating it hands the visitor straight to their mail
 * client with a pre-filled draft. There is deliberately no second step — the
 * anchor is a real link, so the browser's own "copy link address" already covers
 * anyone whose machine has no mail handler registered.
 *
 * Deliberately dependency-free beyond React/lucide: `@tableview/shared` owns the
 * feedback address and the URL builders, and the owning app passes the built URL
 * in. That keeps this package free of domain and telemetry code, which matters
 * because `finance` is required to stay ultralight.
 */
export interface FloatingFeedbackProps {
  /** Builds the mailto URL opened on activation. */
  getEmailUrl: () => string;
  /** Visible label. Defaults to 'Feedback'. */
  label?: string;
}

const RESTING_POSITION = 'bottom-6';

// The cookie banner is `bottom-4` with `p-5`, a header row, several lines of
// `text-xs leading-relaxed` copy and a button row: roughly 200px on desktop and
// more on narrow screens where the copy wraps further. Adding the banner's own
// 16px offset, the button has to clear ~215-235px, so the lifted position is
// deliberately generous — a tight fit here is what leaves the button half-buried.
const LIFTED_POSITION = 'bottom-64 sm:bottom-56';

export function FloatingFeedback({ getEmailUrl, label = 'Feedback' }: FloatingFeedbackProps) {
  const [bannerPresent, setBannerPresent] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Watch the banner's actual presence instead of inferring it from stored
    // consent. Consent only predicts the *first* appearance; the footer link
    // reopens the banner later on, and it then stays up until the visitor
    // chooses again.
    const sync = () => setBannerPresent(isCookieBannerPresent(document));
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <a
      href={getEmailUrl()}
      aria-label="Send feedback"
      className={`fixed right-6 z-40 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-xl transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
        bannerPresent ? LIFTED_POSITION : RESTING_POSITION
      }`}
    >
      <MessageSquare aria-hidden="true" className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}

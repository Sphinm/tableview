import React, { useEffect, useState } from 'react';
import { Check, Copy, MessageSquare } from 'lucide-react';
import { isCookieBannerPresent, shouldLiftForCookieBanner } from './cookieBannerPlacement';

/**
 * Floating, corner-anchored feedback entry point.
 *
 * Deliberately dependency-free beyond React/lucide: `@tableview/shared` owns the
 * feedback address and the URL builders, and the owning app passes them in. That
 * keeps this package free of domain and telemetry code, which matters because
 * `finance` is required to stay ultralight.
 *
 * The surface styling follows `CookieBanner` — the one floating corner element
 * that already ships across finance / tools / compressor — so the button reads
 * the same on the dark app shell and on the light content pages.
 */
export interface FloatingFeedbackProps {
  /** Builds the URL opened when the visitor activates the button. */
  getEmailUrl: () => string;
  /** Web-composer fallback, for visitors with no registered mail handler. */
  getGmailUrl?: () => string;
  /** Plain address offered for copying. Omit to hide the copy affordance. */
  email?: string;
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

export function FloatingFeedback({
  getEmailUrl,
  getGmailUrl,
  email,
  label = 'Feedback',
}: FloatingFeedbackProps) {
  const [showFallback, setShowFallback] = useState(false);
  const [bannerPresent, setBannerPresent] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Watch the banner's actual presence instead of inferring it from stored
    // consent. Consent only predicts the *first* appearance; the footer link
    // reopens the banner later on, and it then stays up until the visitor
    // chooses again. Inferring that state and expiring it on a timer dropped the
    // button back behind a still-visible banner.
    const sync = () => setBannerPresent(isCookieBannerPresent(document));
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const lift = shouldLiftForCookieBanner(bannerPresent);

  return (
    <div
      className={`fixed right-6 z-40 flex flex-col items-end gap-2 ${
        lift ? LIFTED_POSITION : RESTING_POSITION
      }`}
    >
      {showFallback ? (
        <FeedbackFallback
          gmailUrl={getGmailUrl ? getGmailUrl() : undefined}
          email={email}
          onDismiss={() => setShowFallback(false)}
        />
      ) : null}

      <a
        href={getEmailUrl()}
        aria-label="Send feedback"
        onClick={() => setShowFallback(true)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-xl transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
      >
        <MessageSquare aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">{label}</span>
      </a>
    </div>
  );
}

export interface FeedbackFallbackProps {
  gmailUrl?: string;
  email?: string;
  onDismiss?: () => void;
}

/**
 * The 'didn't open?' affordances.
 *
 * `mailto:` is a silent no-op without a registered mail handler, so the button
 * cannot rely on the click being observably successful. Offering a web composer
 * and the raw address keeps a dead click from looking like a broken button.
 */
export function FeedbackFallback({ gmailUrl, email, onDismiss }: FeedbackFallbackProps) {
  return (
    <div className="flex flex-col items-end gap-1 rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-xl">
      <p className="font-medium">Email didn't open?</p>
      {gmailUrl ? (
        <a
          href={gmailUrl}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-slate-900"
        >
          Open in Gmail
        </a>
      ) : null}
      {email ? <CopyAddressButton email={email} /> : null}
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-1 text-slate-500 underline underline-offset-2 hover:text-slate-700"
        >
          Dismiss
        </button>
      ) : null}
    </div>
  );
}

function CopyAddressButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        // Clipboard access is denied in insecure contexts and can reject on
        // permission; surface that rather than leaving an unhandled rejection.
        navigator.clipboard
          .writeText(email)
          .then(() => setCopied(true))
          .catch(() => setFailed(true));
      }}
      className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-slate-900"
    >
      {copied ? (
        <>
          <Check aria-hidden="true" className="h-3 w-3" /> Copied
        </>
      ) : (
        <>
          <Copy aria-hidden="true" className="h-3 w-3" /> {email}
        </>
      )}
      {failed ? <span className="sr-only">Copy failed — select the address manually</span> : null}
    </button>
  );
}

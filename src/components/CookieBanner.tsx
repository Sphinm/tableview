import { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { navigateTo } from '../lib/router';
import { getConsent, setConsent } from '../lib/consent';
import { analytics } from '../lib/analytics';

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const show = () => {
      setIsVisible(true);
    };
    // Re-open the banner when the user asks to change their choice (GDPR withdrawal).
    window.addEventListener('tableview:open-cookie-settings', show);

    // Never show if the visitor has already made an explicit choice.
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (getConsent() === 'unset') {
      // Show after a brief delay so page renders smoothly
      timer = setTimeout(show, 1000);
    }

    return () => {
      window.removeEventListener('tableview:open-cookie-settings', show);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleAccept = () => {
    setConsent(true);
    analytics.consentDecision(true);
    setIsVisible(false);
  };

  const handleDecline = () => {
    setConsent(false);
    analytics.consentDecision(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xl text-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="size-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Privacy & Cookie Choices</h4>
        </div>
        <button
          onClick={handleDecline}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Close banner"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <p className="text-xs text-slate-800 leading-relaxed mb-3.5">
        We use essential cookies and partner with third-party advertising vendors (including Google AdSense) to deliver free tools and analyze site traffic. All file processing remains 100% private in your browser. Learn more in our{' '}
        <a
          href="/privacy#advertising"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('/privacy#advertising');
          }}
          className="text-slate-900 underline font-medium hover:text-slate-700"
        >
          Privacy Policy
        </a>.
      </p>

      <div className="flex items-center justify-end gap-2 text-xs">
        <button
          onClick={handleDecline}
          className="px-3 py-1.5 rounded-lg text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer text-xs font-semibold"
        >
          Essential Only
        </button>
        <button
          onClick={handleAccept}
          className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium cursor-pointer shadow-xs transition-colors"
        >
          Accept All
        </button>
      </div>
    </div>
  );
};

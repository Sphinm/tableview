import { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { navigateTo } from '../lib/router';

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('tableview_cookie_consent');
      if (!consent) {
        // Show after a brief delay so page renders smoothly
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch {
      // LocalStorage might be restricted
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('tableview_cookie_consent', 'accepted');
    } catch {}
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem('tableview_cookie_consent', 'essential_only');
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-4 sm:p-5 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md text-slate-300 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="size-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-100">Privacy & Cookie Choices</h4>
        </div>
        <button
          onClick={handleDecline}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Close banner"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed mb-3.5">
        We use essential cookies and partner with third-party advertising vendors (including Google AdSense) to deliver free tools and analyze site traffic. All file processing remains 100% private in your browser. Learn more in our{' '}
        <a
          href="/privacy#advertising"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('/privacy#advertising');
          }}
          className="text-indigo-400 hover:underline font-medium"
        >
          Privacy Policy
        </a>.
      </p>

      <div className="flex items-center justify-end gap-2 text-xs">
        <button
          onClick={handleDecline}
          className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer text-[11px] font-medium"
        >
          Essential Only
        </button>
        <button
          onClick={handleAccept}
          className="btn-primary px-4 py-1.5 rounded-xl text-[11px] font-semibold cursor-pointer shadow-md"
        >
          Accept All
        </button>
      </div>
    </div>
  );
};

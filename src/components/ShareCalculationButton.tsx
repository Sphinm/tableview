import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareCalculationButtonProps {
  params: Record<string, string | number | boolean | undefined>;
  title?: string;
  className?: string;
}

export const ShareCalculationButton = ({
  params,
  title = 'Share Deal / Calculation',
  className = ''
}: ShareCalculationButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    try {
      const urlParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          urlParams.set(key, String(val));
        }
      });

      const queryString = urlParams.toString();
      const shareUrl = `${window.location.origin}${window.location.pathname}${queryString ? `?${queryString}` : ''}`;

      // Update browser history so user sees current state
      window.history.replaceState({}, '', shareUrl);

      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 hover:border-slate-300 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0 ${className}`}
      title="Copy shareable link with pre-filled parameters to clipboard"
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-emerald-600" />
          <span className="text-emerald-700 font-semibold">Link Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="size-3.5 text-slate-500" />
          <span>{title}</span>
        </>
      )}
    </button>
  );
};

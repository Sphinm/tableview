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
      onClick={handleShare}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-slate-100 text-xs font-medium border border-slate-700 shadow-sm transition-all active:scale-95 cursor-pointer ${className}`}
      title="Copy shareable link with pre-filled parameters to clipboard"
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-semibold">Link Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="size-3.5 text-indigo-400" />
          <span>{title}</span>
        </>
      )}
    </button>
  );
};

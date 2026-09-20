import React from 'react';
import { Loader2 } from 'lucide-react';

interface GlobalLoadingProps {
  message?: string;
  submessage?: string;
}

export const GlobalLoading: React.FC<GlobalLoadingProps> = ({
  message = 'Loading workspace...',
  submessage = 'Preparing high-performance financial data tools'
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex-1 min-h-[55vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in"
    >
      {/* Sleek top indeterminate progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-[2.5px] bg-slate-200/80 overflow-hidden pointer-events-none">
        <div className="h-full bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-600 animate-top-progress shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
      </div>

      {/* Centered clean modern loader */}
      <div className="relative flex items-center justify-center mb-4">
        <div className="absolute -inset-2 rounded-full bg-indigo-500/10 blur-md animate-pulse" />
        <div className="relative size-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-indigo-600">
          <Loader2 className="size-6 animate-spin text-indigo-600" />
        </div>
      </div>

      <p className="text-sm font-semibold text-slate-800 tracking-tight">
        {message}
      </p>
      <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
        {submessage}
      </p>
    </div>
  );
};

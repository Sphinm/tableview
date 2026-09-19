import React, { useState, useEffect, useId } from 'react';
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { updatePageMeta } from '../lib/router';
import { AdSlot } from '../components/AdSlot';

interface ProbeResult {
  domain: string;
  status: 'UP' | 'RESTRICTED' | 'DOWN';
  httpStatus: number;
  httpStatusText: string;
  responseTimeMs: number;
  errorDetails?: string;
}

const statusCheckerSchemas = [
  {
    '@type': 'WebApplication',
    name: 'Is It Down Right Now? Free Website Status & Uptime Checker',
    url: 'https://tableview.dev/is-it-down',
    description:
      'Check if a website is down for everyone or just you. Instant real-time server status and response code tested from global edge nodes.',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  },
];

export const WebsiteStatusChecker: React.FC = () => {
  const inputId = useId();
  const [urlInput, setUrlInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ProbeResult | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  useEffect(() => {
    updatePageMeta(
      'Is It Down Right Now? Free Website Status & Uptime Checker | TableView.dev',
      'Check if a website is down for everyone or just you. Instant real-time server status and response code tested from global edge nodes.',
      '/is-it-down',
      statusCheckerSchemas
    );
  }, []);

  const handleCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const rawTarget = urlInput.trim();
    if (!rawTarget) return;

    // Normalize input
    const cleanTarget = rawTarget.replace(/^https?:\/\//i, '').replace(/\/+$/, '');

    setIsLoading(true);
    setErrorBanner(null);
    setResult(null);

    try {
      const response = await fetch(`/api/tools/is-it-down?url=${encodeURIComponent(cleanTarget)}`);
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Received non-JSON response from server. Please refresh or check server status.');
      }

      const data: ProbeResult = await response.json();
      if (!response.ok) {
        throw new Error((data as any).error || `Server returned status ${response.status}`);
      }

      setResult(data);
    } catch (err: any) {
      console.error('Probe failed:', err);
      setErrorBanner(err.message || 'Failed to probe target website');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 pt-10 pb-12">

        {/* Compact heading */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="size-4 text-indigo-500 shrink-0" />
            <h1 className="text-base font-bold text-slate-900">Is It Down Right Now?</h1>
          </div>
          <p className="text-xs text-slate-500 ml-6">
            Enter a domain to check if it's down for everyone or just you.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
          <form onSubmit={handleCheck} className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Globe className="size-4 text-indigo-400" />
              </div>
              <input
                id={inputId}
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="github.com, google.com, ..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm outline-none font-medium placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !urlInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  <span>Checking…</span>
                </>
              ) : (
                <>
                  <span>Check</span>
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error message */}
        {errorBanner && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
            <AlertCircle className="size-3.5 text-red-500 shrink-0" />
            <span className="text-xs font-medium">{errorBanner}</span>
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className="mt-4 animate-in fade-in duration-150">
            {result.status === 'UP' && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                <div className="size-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    <span className="text-emerald-700">{result.domain}</span> is UP
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Online and responding. HTTP {result.httpStatus} · {result.responseTimeMs}ms
                  </p>
                </div>
              </div>
            )}

            {result.status === 'DOWN' && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3">
                <div className="size-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                  <AlertCircle className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    <span className="text-rose-700">{result.domain}</span> is DOWN
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {result.errorDetails || `HTTP ${result.httpStatus} ${result.httpStatusText}`}
                  </p>
                </div>
              </div>
            )}

            {result.status === 'RESTRICTED' && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                <div className="size-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <ShieldAlert className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    <span className="text-amber-700">{result.domain}</span> is RESTRICTED
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Server is online but access was restricted. HTTP {result.httpStatus}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ad Slot */}
        <div className="mt-6">
          <AdSlot unit="workbenchLeaderboard" format="horizontal" />
        </div>
      </div>
    </div>
  );
};

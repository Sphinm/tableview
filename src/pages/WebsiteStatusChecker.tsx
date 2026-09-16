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
import { PageHeader } from '../components/calculator-kit';

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        <PageHeader
          breadcrumbs={[
            { label: 'Tools', path: '/data-tools' },
            { label: 'Is It Down' },
          ]}
          title="Is It Down Right Now?"
          description="Enter a website domain to check if it is down for everyone or just you."
        />

        {/* Input Form */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200">
          <form onSubmit={handleCheck} className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Globe className="size-5 text-indigo-500" />
              </div>
              <input
                id={inputId}
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter domain (e.g. github.com, google.com)"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm outline-none font-medium placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !urlInput.trim()}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <span>Check</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error message */}
        {errorBanner && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5">
            <AlertCircle className="size-4 text-red-500 shrink-0" />
            <span className="text-xs font-medium">{errorBanner}</span>
          </div>
        )}

        {/* Result Card: Clear & Restrained */}
        {result && (
          <div className="mt-6 animate-in fade-in duration-150">
            {result.status === 'UP' && (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-4">
                <div className="size-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="size-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    <span className="text-emerald-700 font-extrabold">{result.domain}</span> is UP
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    The website is online and responding normally. (HTTP {result.httpStatus} {result.httpStatusText}, {result.responseTimeMs}ms)
                  </p>
                </div>
              </div>
            )}

            {result.status === 'DOWN' && (
              <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-4">
                <div className="size-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="size-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    <span className="text-rose-700 font-extrabold">{result.domain}</span> is DOWN
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    The website is unreachable or returned an outage error. ({result.errorDetails || `HTTP ${result.httpStatus} ${result.httpStatusText}`})
                  </p>
                </div>
              </div>
            )}

            {result.status === 'RESTRICTED' && (
              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-4">
                <div className="size-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldAlert className="size-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    <span className="text-amber-700 font-extrabold">{result.domain}</span> is RESTRICTED
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    The server is online, but access was restricted (HTTP {result.httpStatus} {result.httpStatusText}).
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ad Slot */}
        <div className="mt-8">
          <AdSlot unit="workbenchLeaderboard" format="horizontal" />
        </div>
      </div>
    </div>
  );
};

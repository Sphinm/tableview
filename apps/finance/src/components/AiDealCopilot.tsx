import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Key,
  CheckCircle2,
  Clock,
  Gauge,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import {
  analyzeDealIntent,
  type DealIntentResult,
  getStoredApiKey,
  setStoredApiKey,
  hasLiveApiKey,
} from '../lib/typesafeClient';
import { navigateTo } from '../lib/router';
import { preloadRoute } from '../lib/routePreload';

const SAMPLE_PRESETS = [
  {
    title: 'Dallas 4-Plex (DSCR)',
    text: 'Looking at a 4-plex in Dallas for $850k with $7,200/mo rental income. Borrower has 740 FICO, putting 25% down, evaluating a 30-yr DSCR loan at 7.5% rate.',
  },
  {
    title: '1031 Like-Kind Exchange',
    text: 'Selling industrial warehouse in Oakland for $2.4M. Identifying replacement multifamily within the 45-day statutory window to defer capital gains and debt relief boot.',
  },
  {
    title: 'Phoenix Fix & Flip',
    text: 'Need a short-term hard money bridge loan in Phoenix. Purchase price $280k, rehab budget $65k, projected ARV $460k applying the 70% rule Maximum Allowable Offer.',
  },
  {
    title: 'Refinance Break-Even',
    text: 'Refinancing existing $420k balance at 7.125% down to 5.875%. Estimating closing costs and break-even payoff timeline without resetting to a new 30-year clock.',
  },
];

export const AiDealCopilot: React.FC = () => {
  const [dealText, setDealText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DealIntentResult | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState(getStoredApiKey());
  const [hasKey, setHasKey] = useState(hasLiveApiKey());

  const handleAnalyze = async (overrideText?: string) => {
    const textToAnalyze = overrideText ?? dealText;
    if (!textToAnalyze.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await analyzeDealIntent(textToAnalyze);
      await new Promise((r) => setTimeout(r, 200));
      setResult(res);
    } catch (err) {
      console.error('Failed to analyze deal:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveKey = () => {
    setStoredApiKey(keyInput);
    setHasKey(hasLiveApiKey());
    setShowKeyModal(false);
  };

  const handleSelectPreset = (presetText: string) => {
    setDealText(presetText);
    handleAnalyze(presetText);
  };

  const handleLaunchTarget = () => {
    if (!result) return;
    preloadRoute(result.targetRoute);
    navigateTo(result.targetRoute);
  };

  return (
    <div className="w-full bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-2xl p-5 sm:p-7 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden mb-8">
      {/* Background ambient glow */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                AI Deal Copilot & Intent Router
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                TypeSafe System 1
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Fast, calibrated decision engine (Jev model) · Sub-50ms snap judgments directly routing to calculators
            </p>
          </div>
        </div>

        {/* Engine mode badge & Key button */}
        <div className="flex items-center gap-2">
          {hasKey ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Jev API
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30">
              <Zap className="size-3" />
              Interactive Demo Mode
            </span>
          )}

          <button
            type="button"
            onClick={() => setShowKeyModal(true)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Key className="size-3" />
            <span>{hasKey ? 'API Key Configured' : 'Set API Key'}</span>
          </button>
        </div>
      </div>

      {/* Main Input Box */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-slate-300">
          Paste deal scenario, broker email, or borrower notes:
        </label>
        <div className="relative">
          <textarea
            value={dealText}
            onChange={(e) => setDealText(e.target.value)}
            rows={3}
            placeholder="e.g. Buying a 4-plex in Dallas for $850k with $7,200/mo rental income, 25% down, looking for a 30-year DSCR loan..."
            className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
          />
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Zap className="size-3 text-indigo-400" /> Quick Scenarios:
          </span>
          {SAMPLE_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(p.text)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-950 hover:text-indigo-200 border border-slate-700 hover:border-indigo-600/50 text-slate-300 transition-all cursor-pointer"
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            disabled={!dealText.trim() || isAnalyzing}
            onClick={() => handleAnalyze()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <div className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Running System 1 Evaluation...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                <span>Analyze Deal Intent</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Decision Output Card */}
      {result && (
        <div className="mt-6 pt-5 border-t border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Primary Recommendation Card */}
            <div className="lg:col-span-2 bg-slate-950/90 rounded-xl p-4 sm:p-5 border border-indigo-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    <span>Recommended Calculator</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {Math.round(result.calculatorConfidence * 100)}% Confidence
                    </span>
                    {result.isMock && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        Demo
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                  {result.targetTitle}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {result.rationale}
                </p>

                {/* Probabilities Distribution (Choice Primitive) */}
                <div className="space-y-1.5 mb-4">
                  <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                    <span>Choice Distribution (Probabilities):</span>
                    <span>P(Selected) = {(result.probabilities[result.targetCalculator] || 0.9).toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(result.probabilities)
                      .slice(0, 4)
                      .map(([key, prob]) => (
                        <div
                          key={key}
                          className={`px-2 py-1.5 rounded-lg border text-[11px] ${
                            key === result.targetCalculator
                              ? 'bg-indigo-900/40 border-indigo-500/50 text-indigo-200'
                              : 'bg-slate-900/50 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="truncate font-mono font-medium">{key}</div>
                          <div className="font-bold text-xs">{(prob * 100).toFixed(0)}%</div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Direct Route CTA */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  Route: {result.targetRoute}
                </span>
                <button
                  type="button"
                  onClick={handleLaunchTarget}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <span>Open in Calculator</span>
                  <ExternalLink className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Structured Primitives Insight (Score & Noul) */}
            <div className="space-y-3">
              {/* Score Primitive: Complexity */}
              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    <Gauge className="size-3.5 text-purple-400" />
                    Complexity (Score Primitive)
                  </span>
                  <span className="font-mono font-bold text-purple-300">
                    {result.complexityScore.toFixed(2)} / 2.0
                  </span>
                </div>
                <div className="text-xs font-semibold text-white mb-2">
                  {result.complexityLabel}
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (result.complexityScore / 2) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Noul Primitive: Time-Sensitivity / Distressed */}
              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    <Clock className="size-3.5 text-amber-400" />
                    Time-Sensitivity (Noul Primitive)
                  </span>
                  <span className="font-mono font-bold text-amber-300">
                    {(result.isUrgentProbability * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-xs font-semibold text-white mb-2">
                  {result.isUrgentProbability > 0.5 ? 'Urgent Deadline Detected' : 'Normal Timeline'}
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      result.isUrgentProbability > 0.5 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${result.isUrgentProbability * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-normal flex items-start gap-2">
                <ShieldCheck className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Confidence-Gated:</strong> Decisions with &gt;85% confidence automatically route into corresponding debt models without human triage.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Key className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Configure TypeSafe AI</h3>
                <p className="text-xs text-slate-400">Connect your Jev System 1 model API key</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Get an API key from{' '}
              <a
                href="https://console.typesafe.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline font-semibold"
              >
                console.typesafe.ai/keys
              </a>
              . Your key is stored solely in your local browser and never transmitted to our servers.
            </p>

            <div className="space-y-3 mb-5">
              <label className="block text-xs font-semibold text-slate-300">
                TypeSafe API Key:
              </label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="ts_live_..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500">
                Leave empty to use the built-in Interactive Demo Mode.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveKey}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
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
  Calculator,
  SlidersHorizontal,
  Info,
  X,
  Lock,
} from 'lucide-react';
import {
  analyzeDealIntent,
  type DealIntentResult,
  getStoredApiKey,
  setStoredApiKey,
  hasLiveApiKey,
} from '../lib/typesafeClient';
import {
  extractAndCalculateDeal,
  type InstantCalculationResult,
} from '../lib/dealExtractor';
import { navigateTo } from '../lib/router';
import { preloadRoute } from '../lib/routePreload';

const SAMPLE_PRESETS = [
  {
    title: 'Dallas 4-Plex (DSCR)',
    text: 'Looking at a 4-plex in Dallas for $850k with $7,200/mo rental income. Borrower has 740 FICO, putting 25% down, evaluating a 30-yr DSCR loan at 7.5% rate.',
    badge: 'DSCR Loan',
  },
  {
    title: 'Seattle SFR ($650k, Missing Info)',
    text: 'Looking to buy a $650,000 single family home in Seattle with 10% down. What is my estimated monthly mortgage payment?',
    badge: 'Mortgage',
  },
  {
    title: 'Sunnyvale Townhome ($1.2M)',
    text: 'Contract on a $1,200,000 townhouse in Sunnyvale CA with 20% down payment and 6.625% 30-year fixed rate.',
    badge: 'Conventional',
  },
  {
    title: 'Cleveland Triplex (Cash Flow)',
    text: 'Turnkey 3-unit rental property in Cleveland listed at $360,000, fully leased for $3,600/mo. Planning 25% down at 7.25%.',
    badge: 'DSCR',
  },
];

export const AiDealCopilot: React.FC = () => {
  const [dealText, setDealText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DealIntentResult | null>(null);
  const [instantCalc, setInstantCalc] = useState<InstantCalculationResult | null>(null);
  const [tweakDp, setTweakDp] = useState<number | undefined>(undefined);
  const [tweakTerm, setTweakTerm] = useState<number | undefined>(undefined);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState(getStoredApiKey());
  const [hasKey, setHasKey] = useState(hasLiveApiKey());

  // Real-time local parameter extraction (0ms client-side preview as you type)
  const livePreview = useMemo(() => {
    if (!dealText.trim()) return null;
    return extractAndCalculateDeal(dealText, {
      downPaymentPercent: tweakDp,
      loanTermYears: tweakTerm,
    });
  }, [dealText, tweakDp, tweakTerm]);

  const executeCalculation = (
    textToAnalyze: string,
    overrides?: { downPaymentPercent?: number; loanTermYears?: number }
  ) => {
    const calc = extractAndCalculateDeal(textToAnalyze, overrides);
    setInstantCalc(calc);
    return calc;
  };

  const handleAnalyzeAndNavigate = async (textOverride?: string) => {
    const textToAnalyze = textOverride ?? dealText;
    if (!textToAnalyze.trim()) return;

    setIsAnalyzing(true);
    // 1. Instant local calculation & parameter extraction (0ms, client-side)
    const calc = extractAndCalculateDeal(textToAnalyze, {
      downPaymentPercent: tweakDp,
      loanTermYears: tweakTerm,
    });
    setInstantCalc(calc);

    // 2. Determine target calculator URL with prefilled query parameters
    let targetUrl = calc?.prefilledUrl;
    if (!targetUrl) {
      try {
        const res = await analyzeDealIntent(textToAnalyze);
        setResult(res);
        targetUrl = res.targetRoute;
      } catch {
        targetUrl = '/mortgage-calculator';
      }
    }

    // 3. Preload and transition immediately to target calculator page
    preloadRoute(targetUrl);
    await new Promise((r) => setTimeout(r, 180));
    setIsAnalyzing(false);
    navigateTo(targetUrl);
  };

  const handleTweakDp = (dpPercent: number) => {
    setTweakDp(dpPercent);
    executeCalculation(dealText, {
      downPaymentPercent: dpPercent,
      loanTermYears: tweakTerm,
    });
  };

  const handleTweakTerm = (years: number) => {
    setTweakTerm(years);
    executeCalculation(dealText, {
      downPaymentPercent: tweakDp,
      loanTermYears: years,
    });
  };

  const handleSaveKey = () => {
    setStoredApiKey(keyInput);
    setHasKey(hasLiveApiKey());
    setShowKeyModal(false);
  };

  const handleSelectPreset = (presetText: string) => {
    setDealText(presetText);
    setTweakDp(undefined);
    setTweakTerm(undefined);
    handleAnalyzeAndNavigate(presetText);
  };

  const handleLaunchTarget = (targetUrl?: string) => {
    const route = targetUrl || result?.targetRoute;
    if (!route) return;
    preloadRoute(route.split('?')[0]);
    navigateTo(route);
  };

  return (
    <div className="w-full bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/80 rounded-3xl p-5 sm:p-7 text-white shadow-2xl border border-indigo-500/30 ring-1 ring-indigo-500/20 relative overflow-hidden mb-8">
      {/* Background ambient glow highlights */}
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner">
            <Sparkles className="size-5 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>AI Deal Copilot & Underwriting Workbench</span>
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                0ms Local Math
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Type or paste any scenario — extracts financials, infers missing assumptions, and opens modeled calculators instantly.
            </p>
          </div>
        </div>

        {/* Engine mode badge & Key button */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60">
            <Lock className="size-3 text-emerald-400" />
            <span>100% In-Browser</span>
          </span>

          {hasKey ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Jev API
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30">
              <Zap className="size-3 text-amber-400" />
              Interactive Demo
            </span>
          )}

          <button
            type="button"
            onClick={() => setShowKeyModal(true)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Key className="size-3" />
            <span>{hasKey ? 'Configured' : 'API Key'}</span>
          </button>
        </div>
      </div>

      {/* Main Input Box with Real-time Floating Prompt Card */}
      <div className="space-y-3.5">
        <div className="rounded-2xl bg-slate-950/90 border border-slate-700/80 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/25 transition-all p-4 shadow-inner">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Sparkles className="size-3.5 text-indigo-400" />
              <span>Natural Language Prompt & Scenario Notes:</span>
            </div>
            {dealText.trim() && (
              <button
                type="button"
                onClick={() => setDealText('')}
                className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <X className="size-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <textarea
            value={dealText}
            onChange={(e) => setDealText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAnalyzeAndNavigate();
              }
            }}
            rows={3}
            placeholder="e.g. Buying a $650k house in Seattle with 10% down, or Dallas 4-plex asking $850k with $7,200/mo rent..."
            className="w-full bg-transparent border-0 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden resize-none leading-relaxed"
          />

          {/* Real-Time Live Parameter Recognition Pill Bar (0ms typing feedback) */}
          {livePreview && livePreview.canCalculate && (
            <div className="pt-3 mt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 animate-in fade-in duration-150">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/25 text-indigo-300 font-bold border border-indigo-500/30">
                  Target: {livePreview.targetTitle}
                </span>
                {livePreview.params.map((p) => (
                  <span
                    key={p.key}
                    className={`text-[11px] font-mono px-2 py-0.5 rounded flex items-center gap-1 border ${
                      p.isAssumed
                        ? 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    <span className="opacity-70">{p.label}:</span>
                    <strong>{p.formattedValue}</strong>
                    <span className="text-[9px] opacity-60">
                      ({p.isAssumed ? 'Inferred' : 'Extracted'})
                    </span>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
                <span className="text-[11px] text-slate-400 font-normal">Est. {livePreview.primaryMetricLabel}:</span>
                <span>{livePreview.primaryMetricValue}</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Zap className="size-3.5 text-indigo-400" /> Quick Scenarios:
          </span>
          {SAMPLE_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(p.text)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-indigo-950 hover:text-indigo-200 border border-slate-700/90 hover:border-indigo-500/50 text-slate-200 transition-all cursor-pointer flex items-center gap-2 shadow-xs group"
            >
              <span className="font-medium">{p.title}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-700/60 group-hover:bg-indigo-800/60 text-slate-300">
                {p.badge}
              </span>
              <ArrowRight className="size-3 text-slate-400 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>

        {/* Action Button & Instructions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">Enter ↵</kbd>
            <span>or click button to calculate and open fully modeled calculator directly</span>
          </span>
          <button
            type="button"
            disabled={!dealText.trim() || isAnalyzing}
            onClick={() => handleAnalyzeAndNavigate()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <div className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Opening Calculator...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                <span>Calculate & Open Calculator</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. INSTANT LOCAL CALCULATION RESULTS CARD (0ms Pure Math) */}
      {instantCalc && instantCalc.canCalculate && (
        <div className="mt-6 pt-5 border-t border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 rounded-xl p-5 border border-emerald-500/40 shadow-xl mb-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Calculator className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white tracking-tight">
                      Instant Mathematical Calculation
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      0ms · 100% Deterministic Math
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Engine: {instantCalc.targetTitle}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleLaunchTarget(instantCalc.prefilledUrl)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <span>Open Pre-filled in Calculator</span>
                <ExternalLink className="size-3.5" />
              </button>
            </div>

            {/* Core Calculated Numbers Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/90 border border-slate-800 mb-4">
              {/* Primary Metric */}
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">
                  {instantCalc.primaryMetricLabel}
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-0.5 block tracking-tight">
                  {instantCalc.primaryMetricValue}
                </span>
                <span className="text-[11px] text-slate-400">
                  {instantCalc.secondaryMetricLabel}:{' '}
                  <strong className="text-slate-200">{instantCalc.secondaryMetricValue}</strong>
                </span>
              </div>

              {/* Status / Verdict */}
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">
                  Underwriting Verdict
                </span>
                <span
                  className={`inline-block text-xs font-bold px-2.5 py-1 rounded-md border mt-1 ${
                    instantCalc.verdictTone === 'emerald'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : instantCalc.verdictTone === 'amber'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  }`}
                >
                  {instantCalc.verdictLabel}
                </span>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                  {instantCalc.verdictDescription}
                </p>
              </div>

              {/* In-Card Quick Tweak Chips (Handling Missing Info) */}
              <div className="sm:col-span-2 lg:col-span-1 p-3 rounded-lg bg-slate-900/90 border border-slate-800/80">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 mb-2">
                  <SlidersHorizontal className="size-3 text-indigo-400" />
                  <span>Instant Quick Tweaks (Adjust Smart Defaults)</span>
                </div>

                {/* Down Payment Tweak Chips */}
                <div className="mb-2">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    Down Payment:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[10, 20, 25].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleTweakDp(pct)}
                        className={`px-2 py-0.5 rounded text-xs font-mono font-medium border transition-colors cursor-pointer ${
                          (tweakDp ??
                            instantCalc.params.find((p) => p.key === 'downPayment')?.value) ===
                          pct
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Term Tweak Chips */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Loan Term:</span>
                  <div className="flex items-center gap-1.5">
                    {[15, 30].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => handleTweakTerm(term)}
                        className={`px-2 py-0.5 rounded text-xs font-mono font-medium border transition-colors cursor-pointer ${
                          (tweakTerm ??
                            instantCalc.params.find((p) => p.key === 'loanTerm')?.value) ===
                          term
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {term} Yrs
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Parameter Extraction Audit (Extracted vs Smart Defaults) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Info className="size-3 text-indigo-400" />
                Parameter Provenance & Smart Defaults Audit:
              </span>
              <div className="flex flex-wrap gap-2">
                {instantCalc.params.map((p) => (
                  <div
                    key={p.key}
                    className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 ${
                      p.isAssumed
                        ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                        : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    }`}
                  >
                    <span className="font-semibold">{p.label}:</span>
                    <span className="font-mono font-bold">{p.formattedValue}</span>
                    <span
                      className={`text-[10px] px-1 rounded ${
                        p.isAssumed
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {p.isAssumed ? 'Smart Default' : 'Extracted'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TYPESAFE SYSTEM 1 INTENT & CONFIDENCE CARD */}
      {result && (
        <div className="mt-4 pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Primary Recommendation Card */}
            <div className="lg:col-span-2 bg-slate-950/90 rounded-xl p-4 sm:p-5 border border-indigo-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    <span>System 1 Recommended Calculator (Jev)</span>
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
                    <span>
                      P(Selected) = {(result.probabilities[result.targetCalculator] || 0.9).toFixed(2)}
                    </span>
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
                  onClick={() => handleLaunchTarget(instantCalc?.prefilledUrl || result.targetRoute)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <span>Open Full Calculation Suite</span>
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

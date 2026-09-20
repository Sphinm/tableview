import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2,
  Clock,
  Gauge,
  ExternalLink,
  ShieldCheck,
  Calculator,
  SlidersHorizontal,
  Info,
  X,
} from 'lucide-react';
import {
  analyzeDealIntent,
  type DealIntentResult,
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
    <div className="w-full bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
      {/* Top Header Bar */}
      <div className="flex items-start gap-3 pb-3 mb-4 border-b border-slate-200">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
          <Sparkles className="size-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
            AI Deal Copilot & Underwriting Workbench
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Type or paste any scenario — extracts financials, infers missing assumptions, and opens modeled calculators instantly.
          </p>
        </div>
      </div>

      {/* Main Input Box with Real-time Floating Prompt Card */}
      <div className="space-y-3.5">
        <div className="rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/15 transition-all p-4">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Sparkles className="size-3.5 text-indigo-600" />
              <span>Natural Language Prompt & Scenario Notes:</span>
            </div>
            {dealText.trim() && (
              <button
                type="button"
                onClick={() => setDealText('')}
                className="text-slate-500 hover:text-slate-800 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
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
            className="w-full bg-transparent border-0 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden resize-none leading-relaxed"
          />

          {/* Real-Time Live Parameter Recognition Pill Bar (0ms typing feedback) */}
          {livePreview && livePreview.canCalculate && (
            <div className="pt-3 mt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 animate-in fade-in duration-150">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                  Target: {livePreview.targetTitle}
                </span>
                {livePreview.params.map((p) => (
                  <span
                    key={p.key}
                    className={`text-[11px] font-mono px-2 py-0.5 rounded flex items-center gap-1 border ${
                      p.isAssumed
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
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
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700">
                <span className="text-[11px] text-slate-500 font-normal">Est. {livePreview.primaryMetricLabel}:</span>
                <span>{livePreview.primaryMetricValue}</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Sample Presets & Primary Action */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Zap className="size-3.5 text-indigo-600" /> Quick Scenarios:
            </span>
            {SAMPLE_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p.text)}
                className="text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 transition-all cursor-pointer flex items-center gap-2 shadow-xs group"
              >
                <span className="font-medium">{p.title}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 group-hover:bg-indigo-100 text-slate-600 group-hover:text-indigo-600">
                  {p.badge}
                </span>
                <ArrowRight className="size-3 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={!dealText.trim() || isAnalyzing}
            onClick={() => handleAnalyzeAndNavigate()}
            className="btn-primary w-full sm:w-auto shrink-0 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
        <div className="mt-6 pt-5 border-t border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-200 shadow-sm mb-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <Calculator className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 tracking-tight">
                      Instant Mathematical Calculation
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold">
                      0ms · 100% Deterministic Math
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    Engine: {instantCalc.targetTitle}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleLaunchTarget(instantCalc.prefilledUrl)}
                className="btn-primary px-3.5 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open Pre-filled in Calculator</span>
                <ExternalLink className="size-3.5" />
              </button>
            </div>

            {/* Core Calculated Numbers Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 rounded-xl bg-white border border-slate-200 mb-4">
              {/* Primary Metric */}
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">
                  {instantCalc.primaryMetricLabel}
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-700 mt-0.5 block tracking-tight">
                  {instantCalc.primaryMetricValue}
                </span>
                <span className="text-[11px] text-slate-500">
                  {instantCalc.secondaryMetricLabel}:{' '}
                  <strong className="text-slate-800">{instantCalc.secondaryMetricValue}</strong>
                </span>
              </div>

              {/* Status / Verdict */}
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">
                  Underwriting Verdict
                </span>
                <span
                  className={`inline-block text-xs font-bold px-2.5 py-1 rounded-md border mt-1 ${
                    instantCalc.verdictTone === 'emerald'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : instantCalc.verdictTone === 'amber'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}
                >
                  {instantCalc.verdictLabel}
                </span>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  {instantCalc.verdictDescription}
                </p>
              </div>

              {/* In-Card Quick Tweak Chips (Handling Missing Info) */}
              <div className="sm:col-span-2 lg:col-span-1 p-3 rounded-lg bg-white border border-slate-200">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 mb-2">
                  <SlidersHorizontal className="size-3 text-indigo-600" />
                  <span>Instant Quick Tweaks (Adjust Smart Defaults)</span>
                </div>

                {/* Down Payment Tweak Chips */}
                <div className="mb-2">
                  <span className="text-[10px] text-slate-500 block mb-1">
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
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Term Tweak Chips */}
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Loan Term:</span>
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
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
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
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <Info className="size-3 text-indigo-600" />
                Parameter Provenance & Smart Defaults Audit:
              </span>
              <div className="flex flex-wrap gap-2">
                {instantCalc.params.map((p) => (
                  <div
                    key={p.key}
                    className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 ${
                      p.isAssumed
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}
                  >
                    <span className="font-semibold">{p.label}:</span>
                    <span className="font-mono font-bold">{p.formattedValue}</span>
                    <span
                      className={`text-[10px] px-1 rounded ${
                        p.isAssumed
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
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
        <div className="mt-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Primary Recommendation Card */}
            <div className="lg:col-span-2 bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
                    <CheckCircle2 className="size-4 text-emerald-700" />
                    <span>System 1 Recommended Calculator (Jev)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {Math.round(result.calculatorConfidence * 100)}% Confidence
                    </span>
                    {result.isMock && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                        Demo
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                  {result.targetTitle}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {result.rationale}
                </p>

                {/* Probabilities Distribution (Choice Primitive) */}
                <div className="space-y-1.5 mb-4">
                  <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
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
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                              : 'bg-white border-slate-200 text-slate-500'
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
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">
                  Route: {result.targetRoute}
                </span>
                <button
                  type="button"
                  onClick={() => handleLaunchTarget(instantCalc?.prefilledUrl || result.targetRoute)}
                  className="btn-primary px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open Full Calculation Suite</span>
                  <ExternalLink className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Structured Primitives Insight (Score & Noul) */}
            <div className="space-y-3">
              {/* Score Primitive: Complexity */}
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Gauge className="size-3.5 text-indigo-600" />
                    Complexity (Score Primitive)
                  </span>
                  <span className="font-mono font-bold text-indigo-700">
                    {result.complexityScore.toFixed(2)} / 2.0
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-900 mb-2">
                  {result.complexityLabel}
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (result.complexityScore / 2) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Noul Primitive: Time-Sensitivity / Distressed */}
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Clock className="size-3.5 text-amber-700" />
                    Time-Sensitivity (Noul Primitive)
                  </span>
                  <span className="font-mono font-bold text-amber-700">
                    {(result.isUrgentProbability * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-900 mb-2">
                  {result.isUrgentProbability > 0.5 ? 'Urgent Deadline Detected' : 'Normal Timeline'}
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      result.isUrgentProbability > 0.5 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${result.isUrgentProbability * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-normal flex items-start gap-2">
                <ShieldCheck className="size-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Confidence-Gated:</strong> Decisions with &gt;85% confidence automatically route into corresponding debt models without human triage.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiDealCopilot;

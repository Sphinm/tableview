import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  assessUnderwritingRisk,
  type UnderwritingRiskResult,
  type UnderwritingMetrics,
} from '../lib/typesafeClient';

interface AiUnderwritingCardProps {
  dscr: number;
  ltv: number;
  monthlyRent?: number;
  propertyValue?: number;
  loanAmount?: number;
}

export const AiUnderwritingCard: React.FC<AiUnderwritingCardProps> = ({
  dscr,
  ltv,
  monthlyRent,
  propertyValue,
  loanAmount: _loanAmount,
}) => {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<UnderwritingRiskResult | null>(null);

  const handleRunAssessment = async () => {
    setIsEvaluating(true);
    try {
      const metrics: UnderwritingMetrics = {
        dscr,
        ltv: ltv > 1 ? ltv / 100 : ltv,
        monthlyRent,
        purchasePrice: propertyValue,
      };
      const res = await assessUnderwritingRisk(metrics);
      setResult(res);
    } catch (err) {
      console.error('Underwriting assessment failed:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const getBadgeStyle = (level: UnderwritingRiskResult['riskLevel']) => {
    switch (level) {
      case 'Low':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Moderate':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'High':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Critical':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
  };

  const getMitigationTitle = (code: string) => {
    switch (code) {
      case 'rate_buydown':
        return 'Purchase Rate Buydown Points';
      case 'increase_downpayment':
        return 'Inject Additional Equity / Reduce Principal';
      case 'interest_only':
        return 'Convert to 10-Year Interest-Only (IO) Amortization';
      case 'increase_reserves':
        return 'Pledge Post-Closing Liquidity Reserves';
      default:
        return code;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden shadow-lg mt-6">
      {/* Background ambient decorative highlight */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white">
                Institutional Underwriting Health Check
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                TypeSafe System 1
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Calibrated non-QM credit risk scoring & secondary market qualification guidance
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isEvaluating}
          onClick={handleRunAssessment}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer disabled:opacity-50"
        >
          {isEvaluating ? (
            <>
              <div className="size-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span>Diagnosing Deal...</span>
            </>
          ) : (
            <>
              <Zap className="size-3.5" />
              <span>Run AI Health Check</span>
            </>
          )}
        </button>
      </div>

      {/* Initial state placeholder before running */}
      {!result && !isEvaluating && (
        <div className="py-4 text-center">
          <p className="text-xs text-slate-400 mb-3 max-w-lg mx-auto">
            Evaluate your current DSCR ({dscr.toFixed(2)}x) and LTV ({ltv > 1 ? ltv.toFixed(0) : (ltv * 100).toFixed(0)}%) against institutional secondary market liquidity criteria.
          </p>
          <button
            type="button"
            onClick={handleRunAssessment}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Sparkles className="size-3.5 text-indigo-400" />
            <span>Click to Analyze Current Debt Profile</span>
          </button>
        </div>
      )}

      {/* Assessment Output */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Top Metric Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Risk Tier */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium mb-1">Approval Risk Level</div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBadgeStyle(
                    result.riskLevel
                  )}`}
                >
                  Tier {result.riskLevel}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ({result.riskScore.toFixed(2)}/3.0)
                </span>
              </div>
            </div>

            {/* Model Confidence */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium mb-1">Model Confidence</div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                <span>{Math.round(result.riskConfidence * 100)}% Calibrated</span>
              </div>
            </div>

            {/* Recommended Compensating Factor */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium mb-1">Recommended Mitigation</div>
              <div className="text-xs font-semibold text-indigo-300 truncate">
                {getMitigationTitle(result.recommendedMitigation)}
              </div>
            </div>
          </div>

          {/* Underwriter Guidance */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/20 text-xs leading-relaxed space-y-2">
            <div className="flex items-start gap-2">
              <ShieldCheck className="size-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Secondary Market Qualification: </span>
                <span className="text-slate-300">{result.riskDescription}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-start gap-2">
              <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Underwriting Recommendation: </span>
                <span className="text-slate-300">{result.actionGuidance}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

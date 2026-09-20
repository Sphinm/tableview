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
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Moderate':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'High':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Critical':
        return 'bg-rose-50 text-rose-700 border-rose-200';
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
    <div className="bg-gradient-to-b from-indigo-50/70 to-white border border-indigo-100 rounded-2xl p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-indigo-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-200">
            <Sparkles className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Institutional Underwriting Health Check
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                TypeSafe System 1
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Calibrated non-QM credit risk scoring & secondary market qualification guidance
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isEvaluating}
          onClick={handleRunAssessment}
          className="btn-primary px-3.5 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
        <p className="text-xs text-slate-600 leading-relaxed">
          Evaluate your current DSCR ({dscr.toFixed(2)}x) and LTV ({ltv > 1 ? ltv.toFixed(0) : (ltv * 100).toFixed(0)}%) against institutional secondary market liquidity criteria.
        </p>
      )}

      {/* Assessment Output */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Top Metric Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Risk Tier */}
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium mb-1">Approval Risk Level</div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBadgeStyle(
                    result.riskLevel
                  )}`}
                >
                  Tier {result.riskLevel}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  ({result.riskScore.toFixed(2)}/3.0)
                </span>
              </div>
            </div>

            {/* Model Confidence */}
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium mb-1">Model Confidence</div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="size-3.5" />
                <span>{Math.round(result.riskConfidence * 100)}% Calibrated</span>
              </div>
            </div>

            {/* Recommended Compensating Factor */}
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium mb-1">Recommended Mitigation</div>
              <div className="text-xs font-semibold text-indigo-700 truncate">
                {getMitigationTitle(result.recommendedMitigation)}
              </div>
            </div>
          </div>

          {/* Underwriter Guidance */}
          <div className="p-4 rounded-xl bg-white border border-indigo-100 text-xs leading-relaxed space-y-2">
            <div className="flex items-start gap-2">
              <ShieldCheck className="size-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">Secondary Market Qualification: </span>
                <span className="text-slate-600">{result.riskDescription}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-start gap-2">
              <AlertTriangle className="size-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">Underwriting Recommendation: </span>
                <span className="text-slate-600">{result.actionGuidance}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Landmark, TrendingUp, TrendingDown, ArrowUpRight, Activity } from 'lucide-react';
import { LATEST_PMMS_RATES } from '../data/pmmsRates';

interface PmmsRateTickerProps {
  onSelectRate?: (rate: number, termYears?: number) => void;
  currentRate?: number;
  className?: string;
  compact?: boolean;
}

export const PmmsRateTicker: React.FC<PmmsRateTickerProps> = ({
  onSelectRate,
  currentRate,
  className = '',
  compact = false
}) => {
  const { mndLive30, fixed30, fixed15, asOfDate } = LATEST_PMMS_RATES;

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-slate-50/90 p-2.5 sm:p-3 text-xs shadow-2xs ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Title / Benchmark Source */}
        <div className="flex items-center gap-1.5 text-slate-700 font-semibold shrink-0">
          <span className="p-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
            <Landmark className="size-3.5" />
          </span>
          <span className="whitespace-nowrap text-slate-800 font-bold">US National Benchmarks</span>
          {!compact && (
            <span className="text-[10px] text-slate-400 font-normal whitespace-nowrap">
              ({asOfDate})
            </span>
          )}
        </div>

        {/* Actionable Benchmark Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Live Market (MND) Rate Button */}
          <button
            type="button"
            onClick={() => onSelectRate?.(mndLive30.rate, mndLive30.termYears)}
            className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              currentRate !== undefined && Math.abs(currentRate - mndLive30.rate) < 0.01
                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                : 'bg-white text-slate-800 border-amber-200 hover:bg-amber-50/50 hover:border-amber-300'
            }`}
            title="Mortgage News Daily Live Index: Real-time lender rate sheets (broader credit profiles, unvarnished market price)"
          >
            <Activity className="size-2.5 text-amber-500 shrink-0" />
            <span className="text-[10px] text-slate-500 font-sans">Live:</span>
            <span className="text-amber-700 font-extrabold">{mndLive30.rate}%</span>
            <ArrowUpRight className="size-2.5 opacity-60 ml-0.5" />
          </button>

          {/* 30-Year Freddie Mac Conforming Button */}
          <button
            type="button"
            onClick={() => onSelectRate?.(fixed30.rate, fixed30.termYears)}
            className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              currentRate !== undefined && Math.abs(currentRate - fixed30.rate) < 0.01
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 hover:border-slate-400'
            }`}
            title="Freddie Mac PMMS Survey: Prime conforming 30-Yr benchmark (20% down, 740+ FICO)"
          >
            <span className="text-[10px] text-slate-500 font-sans">PMMS 30Y:</span>
            <span className="text-indigo-600 font-extrabold">{fixed30.rate}%</span>
            {fixed30.weekChange !== undefined && (
              <span className="text-[10px] text-rose-500 font-sans flex items-center">
                {fixed30.weekChange > 0 ? (
                  <TrendingUp className="size-2.5 text-rose-500" />
                ) : (
                  <TrendingDown className="size-2.5 text-emerald-500" />
                )}
                +{fixed30.weekChange}%
              </span>
            )}
            <ArrowUpRight className="size-2.5 opacity-60 ml-0.5" />
          </button>

          {/* 15-Year Button */}
          <button
            type="button"
            onClick={() => onSelectRate?.(fixed15.rate, fixed15.termYears)}
            className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              currentRate !== undefined && Math.abs(currentRate - fixed15.rate) < 0.01
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 hover:border-slate-400'
            }`}
            title="Freddie Mac PMMS Survey: Prime conforming 15-Yr benchmark"
          >
            <span className="text-[10px] text-slate-500 font-sans">15Y:</span>
            <span className="text-indigo-600 font-extrabold">{fixed15.rate}%</span>
            <ArrowUpRight className="size-2.5 opacity-60 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

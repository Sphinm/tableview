import React from 'react';
import { Landmark, TrendingDown, ArrowUpRight } from 'lucide-react';
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
  const { fixed30, fixed15, asOfDate } = LATEST_PMMS_RATES;

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 sm:p-3 text-xs shadow-2xs ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Title / Benchmark Source */}
        <div className="flex items-center gap-1.5 text-slate-700 font-semibold min-w-0">
          <span className="p-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
            <Landmark className="size-3.5" />
          </span>
          <span className="truncate">Freddie Mac PMMS® National Benchmark</span>
          {!compact && (
            <span className="hidden md:inline-block text-[10px] text-slate-400 font-normal">
              ({asOfDate})
            </span>
          )}
        </div>

        {/* Actionable Benchmark Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* 30-Year Button */}
          <button
            type="button"
            onClick={() => onSelectRate?.(fixed30.rate, fixed30.termYears)}
            className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              currentRate !== undefined && Math.abs(currentRate - fixed30.rate) < 0.01
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 hover:border-slate-400'
            }`}
            title={`Apply 30-Yr conforming benchmark rate (${fixed30.rate}%)`}
          >
            <span>30-Yr:</span>
            <span className="text-indigo-600 font-extrabold">{fixed30.rate}%</span>
            {fixed30.weekChange !== undefined && (
              <span className="text-[10px] text-emerald-600 font-sans flex items-center">
                <TrendingDown className="size-2.5" />
                {Math.abs(fixed30.weekChange)}%
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
            title={`Apply 15-Yr conforming benchmark rate (${fixed15.rate}%)`}
          >
            <span>15-Yr:</span>
            <span className="text-indigo-600 font-extrabold">{fixed15.rate}%</span>
            {fixed15.weekChange !== undefined && (
              <span className="text-[10px] text-emerald-600 font-sans flex items-center">
                <TrendingDown className="size-2.5" />
                {Math.abs(fixed15.weekChange)}%
              </span>
            )}
            <ArrowUpRight className="size-2.5 opacity-60 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

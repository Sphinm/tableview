import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';

import { chartAriaLabel } from '@tableview/shared';

export interface ComparisonLoanMetric {
  name: string;
  actualMonthlyPayment: number;
  totalInterestPaid: number;
  totalLoanCost: number;
  upfrontClosingCosts: number;
}

interface ComparisonBarChartProps {
  loanA: ComparisonLoanMetric;
  loanB: ComparisonLoanMetric;
  title?: string;
  subtitle?: string;
}

type MetricKey = 'totalLoanCost' | 'totalInterestPaid' | 'actualMonthlyPayment' | 'upfrontClosingCosts';

interface MetricConfig {
  key: MetricKey;
  label: string;
  format: (v: number) => string;
  description: string;
}

const METRICS: MetricConfig[] = [
  {
    key: 'totalLoanCost',
    label: 'Total Lifetime Cost',
    format: (v) => `$${Math.round(v).toLocaleString('en-US')}`,
    description: 'Principal + Total Interest + Upfront Fees over full term',
  },
  {
    key: 'totalInterestPaid',
    label: 'Total Interest Paid',
    format: (v) => `$${Math.round(v).toLocaleString('en-US')}`,
    description: 'Lifetime finance charge paid to lender',
  },
  {
    key: 'actualMonthlyPayment',
    label: 'Monthly Payment (P&I)',
    format: (v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    description: 'Monthly cash flow obligation',
  },
  {
    key: 'upfrontClosingCosts',
    label: 'Upfront Fees & Points',
    format: (v) => `$${Math.round(v).toLocaleString('en-US')}`,
    description: 'Lender discount points + closing fees paid at signing',
  },
];

export const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({
  loanA,
  loanB,
  title = 'Visual Side-by-Side Comparison',
  subtitle = 'Compare lifetime cost, interest burden, and monthly debt obligation side-by-side.',
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('totalLoanCost');
  const [hoveredBar, setHoveredBar] = useState<'A' | 'B' | null>(null);

  const currentMetric = METRICS.find((m) => m.key === selectedMetric) || METRICS[0];
  const valA = Math.max(0, loanA[selectedMetric]);
  const valB = Math.max(0, loanB[selectedMetric]);
  const maxVal = Math.max(valA, valB, 1);

  const diff = valA - valB;
  const pctDiff = valA > 0 ? ((valB - valA) / valA) * 100 : 0;

  // Chart Dimensions
  const width = 640;
  const height = 180;
  const barHeight = 36;
  const padLeft = 140;
  const padRight = 130;
  const chartWidth = width - padLeft - padRight;

  const barWidthA = Math.max(4, (valA / maxVal) * chartWidth);
  const barWidthB = Math.max(4, (valB / maxVal) * chartWidth);

  const isBBetter = valB < valA;
  const isABetter = valA < valB;

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-xs p-5 space-y-5 print-avoid-break">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
              <BarChart3 className="size-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">{title}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        {/* Metric Switcher Pills */}
        <div className="no-print flex items-center flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          {METRICS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setSelectedMetric(m.key)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                selectedMetric === m.key
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <span className="text-slate-600">{currentMetric.description}</span>
        {diff !== 0 && (
          <span className="font-semibold text-slate-900">
            Difference:{' '}
            <strong className={isBBetter ? 'text-emerald-700' : 'text-amber-700'}>
              {loanB.name} is {Math.abs(pctDiff).toFixed(1)}% {isBBetter ? 'lower' : 'higher'}
            </strong>{' '}
            ({currentMetric.format(Math.abs(diff))})
          </span>
        )}
      </div>

      {/* SVG Clustered Comparison Bar Chart */}
      <div className="w-full overflow-hidden">
        <svg
          /*
           * Complex image: name it and state both compared values so the
           * comparison is available without sight of the bars.
           */
          role="img"
          aria-label={chartAriaLabel(
            `${title} — ${currentMetric.label}`,
            [
              { label: loanA.name, value: currentMetric.format(valA) },
              { label: loanB.name, value: currentMetric.format(valB) },
            ]
          )}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
        >
          <defs>
            <linearGradient id="gradLoanA" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="gradLoanB" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Grid vertical guidelines */}
          {[0.25, 0.5, 0.75, 1.0].map((ratio) => {
            const x = padLeft + ratio * chartWidth;
            return (
              <g key={ratio}>
                <line
                  x1={x}
                  y1={20}
                  x2={x}
                  y2={height - 20}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={x}
                  y={height - 8}
                  fill="#64748b"
                  fontSize="9"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {currentMetric.format(maxVal * ratio)}
                </text>
              </g>
            );
          })}

          {/* Bar A */}
          <g
            onMouseEnter={() => setHoveredBar('A')}
            onMouseLeave={() => setHoveredBar(null)}
            className="cursor-pointer transition-opacity"
            opacity={hoveredBar === 'B' ? 0.6 : 1}
          >
            {/* Label */}
            <text
              x={padLeft - 12}
              y={44}
              fill="#334155"
              fontSize="12"
              fontWeight="600"
              textAnchor="end"
              className="truncate"
            >
              {loanA.name.length > 18 ? `${loanA.name.slice(0, 16)}…` : loanA.name}
            </text>

            {/* Track Background */}
            <rect
              x={padLeft}
              y={24}
              width={chartWidth}
              height={barHeight}
              rx="6"
              fill="#f1f5f9"
            />

            {/* Value Bar */}
            <rect
              x={padLeft}
              y={24}
              width={barWidthA}
              height={barHeight}
              rx="6"
              fill="url(#gradLoanA)"
            />

            {/* Bar Value Label */}
            <text
              x={padLeft + barWidthA + 10}
              y={46}
              fill="#0f172a"
              fontSize="12"
              fontWeight="700"
              fontFamily="monospace"
            >
              {currentMetric.format(valA)}
            </text>

            {isABetter && diff !== 0 && (
              <text
                x={padLeft + barWidthA + 95}
                y={46}
                fill="#059669"
                fontSize="10"
                fontWeight="700"
              >
                ✓ Cheaper
              </text>
            )}
          </g>

          {/* Bar B */}
          <g
            onMouseEnter={() => setHoveredBar('B')}
            onMouseLeave={() => setHoveredBar(null)}
            className="cursor-pointer transition-opacity"
            opacity={hoveredBar === 'A' ? 0.6 : 1}
          >
            {/* Label */}
            <text
              x={padLeft - 12}
              y={106}
              fill="#334155"
              fontSize="12"
              fontWeight="600"
              textAnchor="end"
            >
              {loanB.name.length > 18 ? `${loanB.name.slice(0, 16)}…` : loanB.name}
            </text>

            {/* Track Background */}
            <rect
              x={padLeft}
              y={86}
              width={chartWidth}
              height={barHeight}
              rx="6"
              fill="#f1f5f9"
            />

            {/* Value Bar */}
            <rect
              x={padLeft}
              y={86}
              width={barWidthB}
              height={barHeight}
              rx="6"
              fill="url(#gradLoanB)"
            />

            {/* Bar Value Label */}
            <text
              x={padLeft + barWidthB + 10}
              y={108}
              fill="#0f172a"
              fontSize="12"
              fontWeight="700"
              fontFamily="monospace"
            >
              {currentMetric.format(valB)}
            </text>

            {isBBetter && diff !== 0 && (
              <text
                x={padLeft + barWidthB + 95}
                y={108}
                fill="#059669"
                fontSize="10"
                fontWeight="700"
              >
                ✓ Cheaper
              </text>
            )}
          </g>
        </svg>
      </div>

      {/* High-Level Comparison Summary Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-xs">
        {METRICS.map((m) => {
          const vA = loanA[m.key];
          const vB = loanB[m.key];
          const delta = vA - vB;
          const winner = delta > 0 ? loanB.name : delta < 0 ? loanA.name : 'Tie';
          return (
            <div
              key={m.key}
              onClick={() => setSelectedMetric(m.key)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                selectedMetric === m.key
                  ? 'bg-indigo-50/60 border-indigo-300 text-slate-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="block text-[11px] font-medium text-slate-600 truncate">{m.label}</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {m.format(Math.min(vA, vB))}
                </span>
                <span className={`text-[10px] font-bold ${winner === 'Tie' ? 'text-slate-500' : 'text-emerald-700'}`}>
                  {winner === 'Tie' ? 'Tie' : `✓ ${winner.slice(0, 8)}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';

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
    <div className="p-[1px] rounded-2xl bg-gradient-to-b from-slate-800/80 via-slate-800/40 to-slate-900/90 shadow-sm print-avoid-break">
      <div className="rounded-[calc(1rem-1px)] p-4 sm:p-5 bg-slate-950/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-indigo-500/10 text-indigo-400">
              <BarChart3 className="size-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-100">{title}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Metric Switcher Pills */}
        <div className="no-print flex items-center flex-wrap gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
          {METRICS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setSelectedMetric(m.key)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                selectedMetric === m.key
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-950/50 border border-slate-800/60 text-xs">
        <span className="text-slate-400">{currentMetric.description}</span>
        {diff !== 0 && (
          <span className="font-semibold text-slate-200">
            Difference:{' '}
            <strong className={isBBetter ? 'text-emerald-400' : 'text-amber-400'}>
              {loanB.name} is {Math.abs(pctDiff).toFixed(1)}% {isBBetter ? 'lower' : 'higher'}
            </strong>{' '}
            ({currentMetric.format(Math.abs(diff))})
          </span>
        )}
      </div>

      {/* SVG Clustered Comparison Bar Chart */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
        >
          <defs>
            <linearGradient id="gradLoanA" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="gradLoanB" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="1" />
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
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.4"
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
              fill="#cbd5e1"
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
              fill="#1e293b"
              opacity="0.3"
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
              fill="#f1f5f9"
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
                fill="#34d399"
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
              fill="#cbd5e1"
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
              fill="#1e293b"
              opacity="0.3"
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
              fill="#f1f5f9"
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
                fill="#34d399"
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs">
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
                  ? 'bg-indigo-950/30 border-indigo-500/50 text-slate-200 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="block text-[11px] font-medium text-slate-400 truncate">{m.label}</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono font-bold text-slate-200 text-xs">
                  {m.format(Math.min(vA, vB))}
                </span>
                <span className={`text-[10px] font-bold ${winner === 'Tie' ? 'text-slate-400' : 'text-emerald-400'}`}>
                  {winner === 'Tie' ? 'Tie' : `✓ ${winner.slice(0, 8)}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
};

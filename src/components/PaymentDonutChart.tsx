import React, { useMemo } from 'react';

interface SliceItem {
  id: string;
  label: string;
  amount: number;
  color: string;
  textColor: string;
  bgBadge: string;
}

interface PaymentDonutChartProps {
  principalAndInterest: number;
  propertyTax: number;
  homeInsurance: number;
  hoa: number;
  pmi: number;
  totalMonthly: number;
}

export const PaymentDonutChart: React.FC<PaymentDonutChartProps> = ({
  principalAndInterest,
  propertyTax,
  homeInsurance,
  hoa,
  pmi,
  totalMonthly
}) => {
  const slices: SliceItem[] = useMemo(() => {
    return [
      {
        id: 'pi',
        label: 'Principal & Interest',
        amount: principalAndInterest,
        color: '#6366f1', // indigo-500
        textColor: 'text-indigo-400',
        bgBadge: 'bg-indigo-500/10 border-indigo-500/30'
      },
      {
        id: 'tax',
        label: 'Property Tax',
        amount: propertyTax,
        color: '#10b981', // emerald-500
        textColor: 'text-emerald-400',
        bgBadge: 'bg-emerald-500/10 border-emerald-500/30'
      },
      {
        id: 'insurance',
        label: 'Home Insurance',
        amount: homeInsurance,
        color: '#0ea5e9', // sky-500
        textColor: 'text-sky-400',
        bgBadge: 'bg-sky-500/10 border-sky-500/30'
      },
      {
        id: 'hoa',
        label: 'HOA Fees',
        amount: hoa,
        color: '#f59e0b', // amber-500
        textColor: 'text-amber-400',
        bgBadge: 'bg-amber-500/10 border-amber-500/30'
      },
      {
        id: 'pmi',
        label: 'PMI Insurance',
        amount: pmi,
        color: '#f43f5e', // rose-500
        textColor: 'text-rose-400',
        bgBadge: 'bg-rose-500/10 border-rose-500/30'
      }
    ].filter((s) => s.amount > 0);
  }, [principalAndInterest, propertyTax, homeInsurance, hoa, pmi]);

  const total = totalMonthly > 0 ? totalMonthly : slices.reduce((sum, s) => sum + s.amount, 0);

  // SVG dimensions & radius (balanced 190px size)
  const size = 190;
  const strokeWidth = 22;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  // Compute strokeDasharray and offset for SVG circle sectors
  let accumulatedPercent = 0;
  const renderedSlices = slices.map((slice) => {
    const fraction = total > 0 ? slice.amount / total : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += fraction;

    return {
      ...slice,
      fraction,
      percentage: (fraction * 100).toFixed(1),
      strokeDasharray,
      strokeDashoffset
    };
  });

  const fmt = (num: number) =>
    `$${Math.round(num).toLocaleString('en-US')}`;

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col xl:flex-row items-center gap-6">
      {/* Donut graphic */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
          />
          {renderedSlices.map((s) => (
            <circle
              key={s.id}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={s.color}
              strokeWidth={strokeWidth}
              strokeDasharray={s.strokeDasharray}
              strokeDashoffset={s.strokeDashoffset}
              strokeLinecap="butt"
              className="transition-all duration-500 ease-out"
            />
          ))}
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Monthly</span>
          <span className="text-xl sm:text-2xl font-black text-slate-100 mt-0.5 tracking-tight">{fmt(total)}</span>
          <span className="text-[10px] text-slate-500 font-mono">/month</span>
        </div>
      </div>

      {/* Legend & Breakdown details */}
      <div className="flex-1 w-full space-y-2.5 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Monthly PITI Breakdown
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {fmt(total)}/mo
          </span>
        </div>

        {/* Stacked mini bar preview */}
        <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-slate-800">
          {renderedSlices.map((s) => (
            <div
              key={s.id}
              style={{ width: `${s.percentage}%`, backgroundColor: s.color }}
              title={`${s.label}: ${s.percentage}%`}
              className="h-full transition-all duration-500"
            />
          ))}
        </div>

        {/* Legend list - single column, clean whitespace */}
        <div className="space-y-2 pt-1">
          {renderedSlices.map((s) => (
            <div
              key={s.id}
              className={`px-3 py-2 rounded-xl border flex items-center justify-between text-xs gap-3 ${s.bgBadge}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="font-medium text-slate-200 truncate">{s.label}</span>
              </div>
              <div className="text-right shrink-0 font-mono whitespace-nowrap">
                <span className={`font-bold ${s.textColor}`}>{fmt(s.amount)}</span>
                <span className="text-[10px] text-slate-400 ml-1.5">({s.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

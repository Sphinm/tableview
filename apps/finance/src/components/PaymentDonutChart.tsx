import React, { useMemo } from 'react';
import { chartAriaLabel, formatUsd } from '@tableview/shared';

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
        textColor: 'text-indigo-700',
        bgBadge: 'bg-indigo-50/60 border-indigo-200/80'
      },
      {
        id: 'tax',
        label: 'Property Tax',
        amount: propertyTax,
        color: '#10b981', // emerald-500
        textColor: 'text-emerald-700',
        bgBadge: 'bg-emerald-50/60 border-emerald-200/80'
      },
      {
        id: 'insurance',
        label: 'Home Insurance',
        amount: homeInsurance,
        color: '#0ea5e9', // sky-500
        textColor: 'text-sky-700',
        bgBadge: 'bg-sky-50/60 border-sky-200/80'
      },
      {
        id: 'hoa',
        label: 'HOA Fees',
        amount: hoa,
        color: '#f59e0b', // amber-500
        textColor: 'text-amber-800',
        bgBadge: 'bg-amber-50/60 border-amber-200/80'
      },
      {
        id: 'pmi',
        label: 'PMI Insurance',
        amount: pmi,
        color: '#f43f5e', // rose-500
        textColor: 'text-rose-700',
        bgBadge: 'bg-rose-50/60 border-rose-200/80'
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
    <div className="rounded-2xl bg-white border border-slate-200 shadow-xs p-5 flex flex-col xl:flex-row items-center gap-6">
      {/* Donut graphic */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          /*
           * Complex image: name it and describe its series, otherwise assistive
           * tech announces only "graphic".
           */
          role="img"
          aria-label={chartAriaLabel(
            'Monthly Housing Payment Allocation',
            slices
              .filter((s) => s.amount > 0)
              .map((s) => ({
                label: s.label,
                value: formatUsd(s.amount),
                share: totalMonthly > 0 ? `${((s.amount / totalMonthly) * 100).toFixed(1)}%` : undefined,
              }))
          )}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
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
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Monthly</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 tracking-tight">{fmt(total)}</span>
          <span className="text-[10px] text-slate-500 font-mono">/month</span>
        </div>
      </div>

      {/* Legend & Breakdown details */}
      <div className="flex-1 w-full space-y-2.5 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Monthly PITI Breakdown
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            {fmt(total)}/mo
          </span>
        </div>

        {/* Stacked mini bar preview */}
        <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-slate-100">
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
                <span className="font-semibold text-slate-800 truncate">{s.label}</span>
              </div>
              <div className="text-right shrink-0 font-mono whitespace-nowrap">
                <span className={`font-bold ${s.textColor}`}>{fmt(s.amount)}</span>
                <span className="text-[10px] text-slate-600 ml-1.5">({s.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

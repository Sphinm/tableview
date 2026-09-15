import React, { useState } from 'react';
import { PieChart } from 'lucide-react';

export interface DonutSegment {
  id: string;
  label: string;
  amount: number;
  color: string;
  subtext?: string;
}

interface CashFlowDonutChartProps {
  segments: DonutSegment[];
  centerTitle?: string;
  centerValue?: string;
  title?: string;
  subtitle?: string;
}

export const CashFlowDonutChart: React.FC<CashFlowDonutChartProps> = ({
  segments,
  centerTitle = 'Total Monthly',
  centerValue,
  title = 'Monthly Cash Flow & Expense Allocation',
  subtitle = 'Breakdown of rental revenue, debt service, property operating costs, and net proceeds.',
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const totalAmount = segments.reduce((sum, s) => sum + Math.max(0, s.amount), 0);
  if (totalAmount <= 0) return null;

  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const filteredSegments = segments.filter((s) => s.amount > 0);
  const slices = filteredSegments.reduce<{
    accumulated: number;
    items: Array<(typeof filteredSegments)[number] & {
      percent: number;
      dashLength: number;
      dashOffset: number;
    }>;
  }>(
    (acc, seg) => {
      const percent = seg.amount / totalAmount;
      const dashLength = percent * circumference;
      const dashOffset = -acc.accumulated * circumference;
      return {
        accumulated: acc.accumulated + percent,
        items: [
          ...acc.items,
          {
            ...seg,
            percent,
            dashLength,
            dashOffset
          }
        ]
      };
    },
    { accumulated: 0, items: [] }
  ).items;

  const activeSegment = hoveredId ? slices.find((s) => s.id === hoveredId) : null;

  return (
    <div className="p-[1px] rounded-2xl bg-gradient-to-b from-slate-800/80 via-slate-800/40 to-slate-900/90 shadow-sm print-avoid-break">
      <div className="rounded-[calc(1rem-1px)] p-4 sm:p-5 bg-slate-950/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
              <PieChart className="size-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-100">{title}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
        {/* SVG Donut */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90 select-none"
          >
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#1e293b"
              strokeWidth={strokeWidth}
              opacity="0.5"
            />

            {/* Slices */}
            {slices.map((slice) => {
              const isHovered = hoveredId === slice.id;
              return (
                <circle
                  key={slice.id}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${slice.dashLength} ${circumference}`}
                  strokeDashoffset={slice.dashOffset}
                  className="transition-all duration-150 cursor-pointer"
                  onMouseEnter={() => setHoveredId(slice.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
              );
            })}
          </svg>

          {/* Donut Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-3">
            {activeSegment ? (
              <>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {activeSegment.label}
                </span>
                <span className="text-sm font-bold font-mono text-white mt-0.5">
                  ${Math.round(activeSegment.amount).toLocaleString()}
                </span>
                <span className="text-[10px] font-semibold text-emerald-400">
                  {(activeSegment.percent * 100).toFixed(1)}%
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  {centerTitle}
                </span>
                <span className="text-base font-extrabold font-mono text-slate-100 mt-0.5">
                  {centerValue || `$${Math.round(totalAmount).toLocaleString()}`}
                </span>
                <span className="text-[10px] text-slate-400">100% Outflow</span>
              </>
            )}
          </div>
        </div>

        {/* Legend & Breakdown Table */}
        <div className="w-full max-w-sm space-y-2">
          {slices.map((slice) => {
            const isHovered = hoveredId === slice.id;
            return (
              <div
                key={slice.id}
                onMouseEnter={() => setHoveredId(slice.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                  isHovered ? 'bg-slate-800/80 border border-slate-700' : 'bg-slate-950/40 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <div>
                    <span className="text-xs font-medium text-slate-200 block">{slice.label}</span>
                    {slice.subtext && (
                      <span className="text-[10px] text-slate-400 block">{slice.subtext}</span>
                    )}
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-slate-200 block">
                    ${Math.round(slice.amount).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {(slice.percent * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
};

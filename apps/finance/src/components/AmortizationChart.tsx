import React, { useState } from 'react';
import type { AmortizationChartPoint } from '../lib/mortgageCalculator';
import { chartTrendAriaLabel, formatUsd } from '@tableview/shared';

interface AmortizationChartProps {
  data: AmortizationChartPoint[];
  title?: string;
  subtitle?: string;
}

export const AmortizationChart: React.FC<AmortizationChartProps> = ({
  data,
  title = 'Amortization & Interest Payoff Trajectory',
  subtitle = 'Observe how remaining loan balance diminishes while cumulative principal overtakes compound interest.'
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length < 2) {
    return null;
  }

  // Chart dimensions
  const width = 800;
  const height = 300;
  const padLeft = 70;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  // Max scale calculation
  const maxBalance = Math.max(...data.map((d) => d.endingBalance));
  const maxInterest = Math.max(...data.map((d) => d.totalInterestToDate));
  const maxPrincipal = Math.max(...data.map((d) => d.totalPrincipalToDate));
  const maxY = Math.max(maxBalance, maxInterest, maxPrincipal, 1000);

  // Coordinate scales
  const getX = (i: number) => padLeft + (i / (data.length - 1)) * chartW;
  const getY = (val: number) => padTop + chartH - (val / maxY) * chartH;

  // Generate SVG path strings
  const balancePath = data.reduce((acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.endingBalance)}`, '');
  const interestPath = data.reduce((acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.totalInterestToDate)}`, '');
  const principalPath = data.reduce((acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.totalPrincipalToDate)}`, '');

  // Area under balance curve
  const balanceArea = `${balancePath} L ${getX(data.length - 1)} ${padTop + chartH} L ${getX(0)} ${padTop + chartH} Z`;

  // Find Crossover Point (where cumulative principal >= cumulative interest)
  const crossoverIndex = data.findIndex((d) => d.monthIndex > 0 && d.totalPrincipalToDate >= d.totalInterestToDate);

  const activePoint = hoverIndex !== null ? data[hoverIndex] : data[Math.floor(data.length / 2)];
  const activeX = hoverIndex !== null ? getX(hoverIndex) : getX(Math.floor(data.length / 2));

  const fmtCurrency = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`;

  const handleTouch = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!e.touches || e.touches.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touchX = ((e.touches[0].clientX - rect.left) / rect.width) * width;
    const clampedX = Math.max(padLeft, Math.min(width - padRight, touchX));
    const ratio = (clampedX - padLeft) / chartW;
    const index = Math.round(ratio * (data.length - 1));
    setHoverIndex(Math.max(0, Math.min(data.length - 1, index)));
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-xs p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <span>{title}</span>
            {crossoverIndex > 0 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                Principal Crossover: Yr {Math.round(data[crossoverIndex].monthIndex / 12)}
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-indigo-500 rounded" />
            <span className="text-slate-600 font-medium">Remaining Balance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-500 rounded" />
            <span className="text-slate-600 font-medium">Principal Paid</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-500 rounded" />
            <span className="text-slate-600 font-medium">Interest Paid</span>
          </div>
        </div>
      </div>

      {/* Interactive Visual Amortization Chart Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          /*
           * Complex image. A multi-hundred-point time series cannot be read out
           * in full, so the endpoints summarise the trajectory.
           */
          role="img"
          aria-label={chartTrendAriaLabel(title, [
            {
              name: 'Ending balance',
              from: formatUsd(data[0].endingBalance),
              to: formatUsd(data[data.length - 1].endingBalance),
            },
            {
              name: 'Interest paid to date',
              from: formatUsd(data[0].totalInterestToDate),
              to: formatUsd(data[data.length - 1].totalInterestToDate),
            },
            {
              name: 'Principal paid to date',
              from: formatUsd(data[0].totalPrincipalToDate),
              to: formatUsd(data[data.length - 1].totalPrincipalToDate),
            },
          ])}
          viewBox={`0 0 ${width} ${height}`}
          style={{ touchAction: 'pan-y' }}
          className="w-full h-auto select-none cursor-crosshair"
          onMouseLeave={() => setHoverIndex(null)}
          onTouchStart={handleTouch}
          onTouchMove={handleTouch}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * width;
            const clampedX = Math.max(padLeft, Math.min(width - padRight, mouseX));
            const ratio = (clampedX - padLeft) / chartW;
            const index = Math.round(ratio * (data.length - 1));
            setHoverIndex(Math.max(0, Math.min(data.length - 1, index)));
          }}
        >
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
            const y = padTop + chartH - p * chartH;
            const val = p * maxY;
            return (
              <g key={idx}>
                <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                <text x={padLeft - 8} y={y + 4} fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">
                  ${Math.round(val / 1000)}k
                </text>
              </g>
            );
          })}

          {/* X-axis year labels */}
          {data
            .filter((_, i) => i === 0 || i === data.length - 1 || i % Math.max(1, Math.floor(data.length / 6)) === 0)
            .map((d, idx) => {
              const x = getX(data.indexOf(d));
              return (
                <text key={idx} x={x} y={height - 12} fill="#64748b" fontSize="10" textAnchor="middle">
                  {d.label.split(' ')[0]}
                </text>
              );
            })}

          {/* Area fill */}
          <path d={balanceArea} fill="url(#balanceGradient)" />

          {/* Curves */}
          <path d={balancePath} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" />
          <path d={principalPath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
          <path d={interestPath} fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 2" />

          {/* Crossover dot marker */}
          {crossoverIndex > 0 && (
            <g>
              <circle
                cx={getX(crossoverIndex)}
                cy={getY(data[crossoverIndex].totalPrincipalToDate)}
                r="4.5"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Hover Crosshair line */}
          {hoverIndex !== null && (
            <line
              x1={activeX}
              y1={padTop}
              x2={activeX}
              y2={padTop + chartH}
              stroke="#94a3b8"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          )}

          {/* Active Data Points */}
          {hoverIndex !== null && (
            <g>
              <circle cx={activeX} cy={getY(activePoint.endingBalance)} r="4" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
              <circle cx={activeX} cy={getY(activePoint.totalPrincipalToDate)} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              <circle cx={activeX} cy={getY(activePoint.totalInterestToDate)} r="4" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
            </g>
          )}
        </svg>

        {/* Hover Floating Details Card */}
        {activePoint && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[10px] block font-medium">Timeline Checkpoint</span>
              <span className="font-bold text-slate-900">{activePoint.label}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[10px] block font-medium">Remaining Balance</span>
              <span className="font-bold font-mono text-indigo-700">{fmtCurrency(activePoint.endingBalance)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[10px] block font-medium">Cumulative Principal</span>
              <span className="font-bold font-mono text-emerald-700">{fmtCurrency(activePoint.totalPrincipalToDate)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[10px] block font-medium">Cumulative Interest</span>
              <span className="font-bold font-mono text-rose-700">{fmtCurrency(activePoint.totalInterestToDate)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

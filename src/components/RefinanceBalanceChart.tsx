import React, { useState } from 'react';
import type { RefinanceChartPoint } from '../lib/refinanceCalculator';

interface RefinanceBalanceChartProps {
  data: RefinanceChartPoint[];
  title?: string;
  subtitle?: string;
}

export const RefinanceBalanceChart: React.FC<RefinanceBalanceChartProps> = ({
  data,
  title = 'Remaining Loan Balance Comparison (Old vs Refinanced)',
  subtitle = 'Track remaining principal debt trajectories and cumulative net equity built.'
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length < 2) {
    return null;
  }

  const width = 800;
  const height = 280;
  const padLeft = 70;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 35;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxOld = Math.max(...data.map((d) => d.oldBalance));
  const maxNew = Math.max(...data.map((d) => d.newBalance));
  const maxY = Math.max(maxOld, maxNew, 1000);

  const getX = (i: number) => padLeft + (i / (data.length - 1)) * chartW;
  const getY = (val: number) => padTop + chartH - (val / maxY) * chartH;

  const oldPath = data.reduce((acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.oldBalance)}`, '');
  const newPath = data.reduce((acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.newBalance)}`, '');

  const activePoint = hoverIndex !== null ? data[hoverIndex] : data[Math.floor(data.length / 2)];
  const activeX = hoverIndex !== null ? getX(hoverIndex) : getX(Math.floor(data.length / 2));

  const fmt = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`;

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-100">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-400 rounded" />
            <span className="text-slate-300">Old Loan Balance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400 rounded" />
            <span className="text-slate-300">New Refinanced Balance</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * width;
            const clampedX = Math.max(padLeft, Math.min(width - padRight, mouseX));
            const ratio = (clampedX - padLeft) / chartW;
            const index = Math.round(ratio * (data.length - 1));
            setHoverIndex(Math.max(0, Math.min(data.length - 1, index)));
          }}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
            const y = padTop + chartH - p * chartH;
            const val = p * maxY;
            return (
              <g key={idx}>
                <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                <text x={padLeft - 8} y={y + 4} fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">
                  ${Math.round(val / 1000)}k
                </text>
              </g>
            );
          })}

          {/* X labels */}
          {data
            .filter((_, i) => i === 0 || i === data.length - 1 || i % Math.max(1, Math.floor(data.length / 5)) === 0)
            .map((d, idx) => (
              <text key={idx} x={getX(data.indexOf(d))} y={height - 10} fill="#64748b" fontSize="10" textAnchor="middle">
                {d.label}
              </text>
            ))}

          {/* Lines */}
          <path d={oldPath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3" />
          <path d={newPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

          {/* Hover Crosshair */}
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

          {hoverIndex !== null && (
            <g>
              <circle cx={activeX} cy={getY(activePoint.oldBalance)} r="4" fill="#f59e0b" stroke="#0f172a" strokeWidth="2" />
              <circle cx={activeX} cy={getY(activePoint.newBalance)} r="4" fill="#10b981" stroke="#0f172a" strokeWidth="2" />
            </g>
          )}
        </svg>

        {activePoint && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Timeline</span>
              <span className="font-bold text-slate-200">{activePoint.label}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Old Loan Balance</span>
              <span className="font-bold font-mono text-amber-400">{fmt(activePoint.oldBalance)}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">New Loan Balance</span>
              <span className="font-bold font-mono text-emerald-400">{fmt(activePoint.newBalance)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

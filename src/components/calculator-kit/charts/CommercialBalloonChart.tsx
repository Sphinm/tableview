import { useState } from 'react';
import { CalendarClock } from 'lucide-react';
import type { CommercialAmortizationYear } from '../../../lib/commercialLoanCalculator';

interface CommercialBalloonChartProps {
  schedule: CommercialAmortizationYear[];
  balloonYears: number;
  amortizationYears: number;
  balloonBalance: number;
  originalLoanAmount: number;
  title?: string;
  subtitle?: string;
}

export const CommercialBalloonChart = ({
  schedule,
  balloonYears,
  amortizationYears,
  balloonBalance,
  originalLoanAmount,
  title = 'Commercial Debt Payoff & Balloon Cliff',
  subtitle = 'Visualize remaining debt, accumulated equity, and the balloon refinance obligation at maturity.',
}: CommercialBalloonChartProps) => {
  const [hoverYear, setHoverYear] = useState<number | null>(null);

  if (!schedule || schedule.length === 0) return null;

  // Chart Dimensions
  const width = 760;
  const height = 260;
  const padLeft = 70;
  const padRight = 40;
  const padTop = 30;
  const padBottom = 35;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxY = Math.max(originalLoanAmount, 1000);
  const totalYears = Math.min(schedule.length, amortizationYears);

  const getX = (year: number) => padLeft + (year / totalYears) * chartW;
  const getY = (val: number) => padTop + chartH - (val / maxY) * chartH;

  // Points for path
  // Year 0 is start
  const points: CommercialAmortizationYear[] = [
    {
      year: 0,
      paymentsTotal: 0,
      principalTotal: 0,
      interestTotal: 0,
      endingBalance: originalLoanAmount,
    },
    ...schedule.slice(0, totalYears),
  ];

  const balancePath = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(p.year)} ${getY(p.endingBalance)}`, '');
  const equityPath = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(p.year)} ${getY(originalLoanAmount - p.endingBalance)}`, '');

  const balloonX = getX(balloonYears);
  const balloonY = getY(balloonBalance);

  const activeYearData = hoverYear !== null
    ? points.find((p) => p.year === hoverYear) || points[0]
    : points.find((p) => p.year === balloonYears) || points[Math.min(5, points.length - 1)];

  const fmtCurrency = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`;

  const handleTouch = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!e.touches || e.touches.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touchX = ((e.touches[0].clientX - rect.left) / rect.width) * width;
    const clampedX = Math.max(padLeft, Math.min(width - padRight, touchX));
    const ratio = (clampedX - padLeft) / chartW;
    const year = Math.round(ratio * totalYears);
    setHoverYear(Math.max(0, Math.min(totalYears, year)));
  };

  return (
    <div className="p-[1px] rounded-2xl bg-gradient-to-b from-slate-800/80 via-slate-800/40 to-slate-900/90 shadow-sm print-avoid-break">
      <div className="rounded-[calc(1rem-1px)] p-4 sm:p-5 bg-slate-950/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-500/10 text-amber-400">
              <CalendarClock className="size-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
              <span>{title}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                Balloon Maturity: Year {balloonYears}
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-indigo-400 rounded" />
            <span className="text-slate-300">Remaining Debt</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400 rounded" />
            <span className="text-slate-300">Principal Paid (Equity)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-amber-300 font-medium">Balloon Due</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ touchAction: 'pan-y' }}
          className="w-full h-auto select-none cursor-crosshair"
          onMouseLeave={() => setHoverYear(null)}
          onTouchStart={handleTouch}
          onTouchMove={handleTouch}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * width;
            const clampedX = Math.max(padLeft, Math.min(width - padRight, mouseX));
            const ratio = (clampedX - padLeft) / chartW;
            const year = Math.round(ratio * totalYears);
            setHoverYear(Math.max(0, Math.min(totalYears, year)));
          }}
        >
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((r) => {
            const y = padTop + chartH * (1 - r);
            return (
              <g key={r}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  opacity="0.35"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  fill="#64748b"
                  fontSize="9"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {fmtCurrency(maxY * r)}
                </text>
              </g>
            );
          })}

          {/* Vertical Year Milestones */}
          {points
            .filter((p) => p.year > 0 && p.year % 5 === 0)
            .map((p) => {
              const x = getX(p.year);
              return (
                <g key={p.year}>
                  <line
                    x1={x}
                    y1={padTop}
                    x2={x}
                    y2={padTop + chartH}
                    stroke="#334155"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.25"
                  />
                  <text
                    x={x}
                    y={height - 12}
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    Yr {p.year}
                  </text>
                </g>
              );
            })}

          {/* Area under remaining debt */}
          <path
            d={`${balancePath} L ${getX(totalYears)} ${padTop + chartH} L ${getX(0)} ${padTop + chartH} Z`}
            fill="#6366f1"
            fillOpacity="0.08"
          />

          {/* Remaining Debt Curve */}
          <path
            d={balancePath}
            fill="none"
            stroke="#818cf8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Equity Accrued Curve */}
          <path
            d={equityPath}
            fill="none"
            stroke="#34d399"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4 2"
          />

          {/* Balloon Maturity Vertical Cliff Line */}
          {balloonYears < totalYears && (
            <g>
              <line
                x1={balloonX}
                y1={padTop}
                x2={balloonX}
                y2={padTop + chartH}
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <circle
                cx={balloonX}
                cy={balloonY}
                r="6"
                fill="#f59e0b"
                stroke="#0f172a"
                strokeWidth="2"
              />
              {/* Balloon Label Callout */}
              <rect
                x={balloonX + 8}
                y={Math.max(padTop + 4, balloonY - 24)}
                width={130}
                height={34}
                rx="6"
                fill="#1e1b4b"
                stroke="#f59e0b"
                strokeWidth="1"
              />
              <text
                x={balloonX + 16}
                y={Math.max(padTop + 18, balloonY - 10)}
                fill="#fcd34d"
                fontSize="9"
                fontWeight="700"
              >
                Year {balloonYears} Balloon Due:
              </text>
              <text
                x={balloonX + 16}
                y={Math.max(padTop + 30, balloonY + 2)}
                fill="#ffffff"
                fontSize="11"
                fontWeight="800"
                fontFamily="monospace"
              >
                {fmtCurrency(balloonBalance)}
              </text>
            </g>
          )}

          {/* Hover Crosshair Marker */}
          {activeYearData && (
            <g>
              <line
                x1={getX(activeYearData.year)}
                y1={padTop}
                x2={getX(activeYearData.year)}
                y2={padTop + chartH}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(activeYearData.year)}
                cy={getY(activeYearData.endingBalance)}
                r="4"
                fill="#818cf8"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Dynamic Hover/Year Context Pill */}
      {activeYearData && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">
              {activeYearData.year === balloonYears ? (
                <span className="text-amber-400">★ Maturity Year {activeYearData.year} (Balloon Refi Date)</span>
              ) : (
                `Year ${activeYearData.year} Milestone`
              )}
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono">
            <div>
              <span className="text-slate-400 mr-1.5 text-[11px]">Ending Balance:</span>
              <strong className="text-indigo-300">{fmtCurrency(activeYearData.endingBalance)}</strong>
            </div>
            <div>
              <span className="text-slate-400 mr-1.5 text-[11px]">Cumulative Equity:</span>
              <strong className="text-emerald-400">{fmtCurrency(originalLoanAmount - activeYearData.endingBalance)}</strong>
            </div>
            {activeYearData.interestTotal > 0 && (
              <div className="hidden sm:block">
                <span className="text-slate-400 mr-1.5 text-[11px]">Interest Paid:</span>
                <strong className="text-rose-300">{fmtCurrency(activeYearData.interestTotal)}</strong>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

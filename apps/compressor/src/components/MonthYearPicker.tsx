import React from 'react';
import { Calendar } from 'lucide-react';

export interface MonthYearPickerProps {
  id?: string;
  month: number; // 1-12
  year: number; // e.g. 2026
  onChange: (date: { month: number; year: number }) => void;
  minYear?: number;
  maxYear?: number;
  className?: string;
  showPresets?: boolean;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
  id,
  month,
  year,
  onChange,
  minYear = 2000,
  maxYear = 2060,
  className = '',
  showPresets = true
}) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const isoMonthStr = `${year}-${pad(month)}`;

  const handleIsoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // "YYYY-MM"
    if (!val) return;
    const parts = val.split('-');
    if (parts.length === 2) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(y) && !isNaN(m) && m >= 1 && m <= 12) {
        onChange({ month: m, year: y });
      }
    }
  };

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative flex items-center w-full bg-slate-50 hover:bg-slate-100/60 focus-within:bg-white border border-slate-300 hover:border-slate-400 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-500/20 rounded-xl transition-all shadow-2xs">
        <div className="pl-3.5 pointer-events-none text-indigo-600 flex items-center">
          <Calendar className="size-4" />
        </div>

        <div className="flex items-center gap-1 w-full py-1.5 pl-2.5 pr-2">
          <select
            id={id ? `${id}-month` : undefined}
            value={month}
            onChange={(e) => onChange({ month: Number(e.target.value), year })}
            className="bg-transparent text-sm font-semibold text-slate-900 cursor-pointer outline-none hover:text-indigo-600 transition-colors py-1 pl-1 pr-2 rounded-lg"
            aria-label="Select Month"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx + 1}>
                {name} ({idx + 1})
              </option>
            ))}
          </select>

          <span className="text-slate-400 font-bold">/</span>

          <select
            id={id ? `${id}-year` : undefined}
            value={year}
            onChange={(e) => onChange({ month, year: Number(e.target.value) })}
            className="bg-transparent text-sm font-semibold text-slate-900 cursor-pointer outline-none hover:text-indigo-600 transition-colors py-1 pl-1 pr-2 rounded-lg font-mono"
            aria-label="Select Year"
          >
            {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="relative pr-3 flex items-center">
          <input
            type="month"
            value={isoMonthStr}
            onChange={handleIsoChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            title="Open Month Picker"
            aria-label="Open Calendar Month Picker"
          />
          <span className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md pointer-events-none shadow-2xs">
            Pick
          </span>
        </div>
      </div>

      {showPresets && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onChange({ month: currentMonth, year: currentYear })}
            className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
              month === currentMonth && year === currentYear
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => onChange({ month: nextMonth, year: nextMonthYear })}
            className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
              month === nextMonth && year === nextMonthYear
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Next Month
          </button>
          <button
            type="button"
            onClick={() => onChange({ month: 1, year: currentYear + 1 })}
            className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
              month === 1 && year === currentYear + 1
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Jan {currentYear + 1}
          </button>
        </div>
      )}
    </div>
  );
};

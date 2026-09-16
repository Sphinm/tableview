import { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Clock,
  Download,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Share2,
  Check,
  ArrowRight
} from 'lucide-react';
import {
  calculateSalary,
  type SalaryInputs
} from '../lib/salaryCalculator';
import { updatePageMeta, navigateTo } from '../lib/router';
import { CurrencyInput } from '../components/CurrencyInput';
import { NumericInput } from '../components/NumericInput';
import { MethodologyDisclosure } from '../components/MethodologyDisclosure';
import { RelatedCalculators } from '../components/RelatedCalculators';
import { AdSlot } from '../components/AdSlot';
import { PrintReportButton, PrintableReportHeader, PageHeader } from '../components/calculator-kit';

const salaryCalculatorSchemas = [
  {
    '@type': 'WebApplication',
    name: 'Salary to Hourly & Overtime Calculator',
    url: 'https://tableview.dev/salary-to-hourly-calculator',
    description: 'Free in-browser salary to hourly wage converter. Calculate bi-weekly, semi-monthly, and monthly pay, FLSA overtime rates (1.5x / 2.0x), and PTO monetary value with instant Excel export.',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  },
  {
    '@type': 'FinancialProduct',
    name: 'Gross Wage & Overtime Modeler',
    description: 'FLSA-compliant payroll and wage conversion calculator for employees, contractors, and HR payroll teams.',
    category: 'PayrollCalculator'
  }
];

const SALARY_PRESETS = [
  { label: '$30k', value: 30000, path: '/30000-a-year-is-how-much-an-hour' },
  { label: '$40k', value: 40000, path: '/40000-a-year-is-how-much-an-hour' },
  { label: '$50k', value: 50000, path: '/50000-a-year-is-how-much-an-hour' },
  { label: '$60k', value: 60000, path: '/60000-a-year-is-how-much-an-hour' },
  { label: '$70k', value: 70000, path: '/70000-a-year-is-how-much-an-hour' },
  { label: '$75k', value: 75000, path: '/75000-a-year-is-how-much-an-hour' },
  { label: '$80k', value: 80000, path: '/80000-a-year-is-how-much-an-hour' },
  { label: '$90k', value: 90000, path: '/90000-a-year-is-how-much-an-hour' },
  { label: '$100k', value: 100000, path: '/100000-a-year-is-how-much-an-hour' },
  { label: '$120k', value: 120000, path: '/120000-a-year-is-how-much-an-hour' },
];

export interface SalaryCalculatorProps {
  initialSalary?: number;
  customTitle?: string;
  customDescription?: string;
  canonicalPath?: string;
}

export const SalaryCalculator = ({
  initialSalary,
  customTitle,
  customDescription,
  canonicalPath
}: SalaryCalculatorProps = {}) => {
  useEffect(() => {
    const metaTitle = customTitle
      ? (customTitle.includes('TableView.dev') ? customTitle : `${customTitle} | TableView.dev`)
      : 'Salary to Hourly Calculator: Convert Paycheck, Overtime & Wage Matrix | TableView.dev';
    const description = customDescription || 'Convert annual salary to hourly wage, daily, weekly, bi-weekly (26x), and monthly paycheck. Compute FLSA 1.5x overtime and PTO value. 100% private in-browser calculator.';
    const path = canonicalPath || '/salary-to-hourly-calculator';
    updatePageMeta(metaTitle, description, path, salaryCalculatorSchemas);
  }, [customTitle, customDescription, canonicalPath]);

  const [mode, setMode] = useState<'salary-to-hourly' | 'hourly-to-salary'>('salary-to-hourly');
  const [amount, setAmount] = useState<number>(() => {
    if (initialSalary) return initialSalary;
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.has('salary')) return Number(p.get('salary'));
      if (p.has('hourly')) return Number(p.get('hourly'));
      if (p.has('amount')) return Number(p.get('amount'));
    }
    return 75000;
  });
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(40);
  const [weeksPerYear, setWeeksPerYear] = useState<number>(52);
  const [paidHolidays, setPaidHolidays] = useState<number>(10);
  const [paidVacation, setPaidVacation] = useState<number>(15);
  const [overtimeHours, setOvertimeHours] = useState<number>(5);

  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Clean, human-friendly on-page H1 and badge
  const { displayTitle, displayBadge } = useMemo(() => {
    if (!customTitle) {
      return {
        displayTitle: 'Salary to Hourly & Overtime Calculator',
        displayBadge: undefined
      };
    }
    const clean = customTitle.split('|')[0].split(':')[0].trim();
    if (clean.includes('?')) {
      const parts = clean.split('?');
      const question = `${parts[0].trim()}?`;
      const badge = parts[1]?.replace(/[()]/g, '').trim();
      return {
        displayTitle: question,
        displayBadge: badge || undefined
      };
    }
    return { displayTitle: clean, displayBadge: undefined };
  }, [customTitle]);

  const handleCopyLink = () => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    if (mode === 'salary-to-hourly') {
      params.set('salary', String(amount));
    } else {
      params.set('hourly', String(amount));
    }
    params.set('hours', String(hoursPerWeek));
    params.set('weeks', String(weeksPerYear));
    if (paidHolidays) params.set('holidays', String(paidHolidays));
    if (paidVacation) params.set('vacation', String(paidVacation));
    if (overtimeHours) params.set('ot', String(overtimeHours));

    const basePath = canonicalPath || '/salary-to-hourly-calculator';
    const url = `${window.location.origin}${basePath}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Switch mode defaults gracefully
  const handleModeChange = (newMode: 'salary-to-hourly' | 'hourly-to-salary') => {
    setMode(newMode);
    if (newMode === 'salary-to-hourly') {
      setAmount(initialSalary || 75000);
    } else {
      setAmount(36.06);
    }
  };

  const inputs: SalaryInputs = useMemo(() => ({
    mode,
    amount,
    hoursPerWeek,
    weeksPerYear,
    paidHolidaysDays: paidHolidays,
    paidVacationDays: paidVacation,
    overtimeHoursPerWeek: overtimeHours
  }), [mode, amount, hoursPerWeek, weeksPerYear, paidHolidays, paidVacation, overtimeHours]);

  const summary = useMemo(() => calculateSalary(inputs), [inputs]);

  const subtitle = useMemo(() => {
    if (mode === 'salary-to-hourly') {
      return `At ${summary.hoursPerWeek} hours/week (${summary.totalAnnualHours.toLocaleString()} hours/year), an annual salary of $${summary.annualSalary.toLocaleString()} equals $${summary.hourlyRate.toFixed(2)} per hour.`;
    }
    return `At ${summary.hoursPerWeek} hours/week, an hourly wage of $${summary.hourlyRate.toFixed(2)} equals an annual salary of $${summary.annualSalary.toLocaleString()} across ${summary.weeksPerYear} working weeks.`;
  }, [mode, summary]);

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const summaryData = [
      ['Gross Wage & Overtime Conversion Breakdown', 'Generated by TableView.dev'],
      ['Export Date', new Date().toLocaleDateString()],
      [],
      ['Input Parameters', 'Value'],
      ['Conversion Mode', mode === 'salary-to-hourly' ? 'Salary to Hourly' : 'Hourly to Salary'],
      ['Input Base Pay', mode === 'salary-to-hourly' ? `$${amount.toLocaleString()}/yr` : `$${amount}/hr`],
      ['Work Hours Per Week', hoursPerWeek],
      ['Work Weeks Per Year', weeksPerYear],
      ['Total Annual Work Hours', summary.totalAnnualHours],
      ['Overtime Hours / Week', overtimeHours],
      ['Paid Time Off (Holidays + Vacation)', `${summary.totalPtoDays} Days`],
      [],
      ['Conversion Matrix', 'Gross Pay', 'Pay Frequency / Details'],
      ...summary.breakdownTable.map(item => [item.period, item.formatted, item.notes]),
      [],
      ['Overtime Compensation (FLSA)', 'Rate', 'Annualized Pay'],
      ['Standard Hourly Base', `$${summary.hourlyRate.toFixed(2)}/hr`, 'Base regular rate'],
      ['1.5x Time-and-a-Half', `$${summary.overtimeRate15x.toFixed(2)}/hr`, `$${summary.annualOvertimePay.toLocaleString()}/yr (${overtimeHours} hrs/wk)`],
      ['2.0x Double Time', `$${summary.overtimeRate20x.toFixed(2)}/hr`, 'Holiday / Premium overtime'],
      ['Total Comp (Base + Overtime)', `$${summary.totalAnnualCompensationWithOvertime.toLocaleString()}/yr`, 'Total gross compensation'],
      [],
      ['Paid Time Off (PTO) Valuation', 'Value', 'Details'],
      ['Total PTO Days', summary.totalPtoDays, `${summary.totalPtoHours} total paid hours`],
      ['Monetary Value of PTO', `$${summary.ptoMonetaryValue.toLocaleString()}`, 'Direct gross value of company-sponsored PTO']
    ];

    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws, 'Wage_Breakdown');
    XLSX.writeFile(wb, `salary_wage_breakdown_${mode}.xlsx`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Printable Executive Brief Header */}
      <PrintableReportHeader
        title={`${displayTitle}: Comprehensive Pay Analysis`}
        subtitle="100% Private In-Browser FLSA Gross Wage Conversion & Overtime Breakdown"
        referenceId={`PAY-${Math.round(summary.annualSalary / 1000)}k-${summary.hoursPerWeek}hrs`}
      />

      {/* Canonical Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Calculators', path: '/finance-calculator' },
          { label: 'Salary to Hourly' }
        ]}
        badge={{
          icon: Sparkles,
          label: displayBadge ? `100% In-Browser Wage Engine · ${displayBadge}` : '100% In-Browser Wage Engine',
          tone: 'emerald'
        }}
        title={displayTitle}
        description={subtitle}
        actions={
          <>
            <PrintReportButton />
            <button
              type="button"
              onClick={handleCopyLink}
              className="h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 cursor-pointer transition-all shadow-2xs active:scale-95 shrink-0"
              title="Copy shareable link with current wage inputs"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="size-3.5 text-emerald-600" />
                  <span>Share</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="btn-primary h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-sm cursor-pointer transition-transform active:scale-95 shrink-0"
            >
              <Download className="size-3.5" />
              <span>Export Excel</span>
            </button>
          </>
        }
        presets={
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            <span className="text-xs text-slate-900 font-bold shrink-0 mr-1.5">Quick Presets:</span>
            {SALARY_PRESETS.map((preset) => {
              const isSelected = mode === 'salary-to-hourly' && amount === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    setMode('salary-to-hourly');
                    setAmount(preset.value);
                    navigateTo(preset.path);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer border shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-900 font-semibold border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        }
      />

      {/* Hero Answer Banner - Instantly answers the search intent */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 sm:p-6 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Main calculated result */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              <Clock className="size-3.5 text-emerald-600" />
              <span>{mode === 'salary-to-hourly' ? 'Calculated Hourly Wage' : 'Equivalent Annual Salary'}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-mono">
                {mode === 'salary-to-hourly' ? `$${summary.hourlyRate.toFixed(2)}` : `$${summary.annualSalary.toLocaleString()}`}
              </span>
              <span className="text-base sm:text-lg font-medium text-emerald-700">
                {mode === 'salary-to-hourly' ? '/ hr' : '/ yr'}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Standard {summary.hoursPerWeek} hrs/week × {summary.weeksPerYear} weeks ({summary.totalAnnualHours.toLocaleString()} annual paid hours)
            </p>
          </div>

          {/* 3 Companion KPIs */}
          <div className="grid grid-cols-3 gap-2.5 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs min-w-[110px]">
              <div className="text-[11px] text-slate-500 mb-0.5">Bi-Weekly (26x)</div>
              <div className="text-base font-bold text-sky-700 font-mono">
                ${summary.biWeeklyRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-400">Every 2 weeks</div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs min-w-[110px]">
              <div className="text-[11px] text-slate-500 mb-0.5">Monthly Check</div>
              <div className="text-base font-bold text-emerald-700 font-mono">
                ${summary.monthlyRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-400">12 pay periods</div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs min-w-[110px]">
              <div className="text-[11px] text-slate-500 mb-0.5">1.5x Overtime</div>
              <div className="text-base font-bold text-amber-800 font-mono">
                ${summary.overtimeRate15x.toFixed(2)}/hr
              </div>
              <div className="text-[10px] text-slate-400">FLSA minimum</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Workspace */}
      <main className="pb-16 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
              {/* Calculation Mode Switcher - directly above inputs */}
              <div>
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Calculation Mode
                </div>
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleModeChange('salary-to-hourly')}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      mode === 'salary-to-hourly'
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    Annual Salary → Hourly
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange('hourly-to-salary')}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      mode === 'hourly-to-salary'
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    Hourly Wage → Salary
                  </button>
                </div>
              </div>

              {/* Base Amount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  {mode === 'salary-to-hourly' ? 'Annual Base Salary ($)' : 'Hourly Pay Rate ($/hr)'}
                </label>
                <CurrencyInput
                  value={amount}
                  onChange={(val) => setAmount(val)}
                  allowDecimal={mode === 'hourly-to-salary'}
                  className="font-mono"
                />
              </div>

              {/* Hours Per Week */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-900 mb-1.5">
                  <span>Hours Per Week</span>
                  <span className="text-emerald-700 font-semibold font-mono">{hoursPerWeek} hrs</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={80}
                  step={1}
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>20h (Part-time)</span>
                  <span>40h (Standard)</span>
                  <span>60h (Heavy)</span>
                </div>
              </div>

              {/* Weeks Per Year */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                  <span>Weeks Worked Per Year</span>
                  <span className="text-emerald-700 font-semibold font-mono">{weeksPerYear} wks</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={52}
                  step={1}
                  value={weeksPerYear}
                  onChange={(e) => setWeeksPerYear(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>36w (Seasonal)</span>
                  <span>50w (2w unpaid)</span>
                  <span>52w (Full Year)</span>
                </div>
              </div>

              {/* Overtime Hours Per Week */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                  <span>Expected Overtime Hours / Week</span>
                  <span className="text-amber-800 font-semibold font-mono">{overtimeHours} hrs</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  step={0.5}
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <span className="text-[11px] text-slate-500 block mt-1">
                  Paid at 1.5× regular rate (${summary.overtimeRate15x.toFixed(2)}/hr) under FLSA rules.
                </span>
              </div>

              {/* Paid Time Off (PTO) */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="text-xs font-medium text-slate-700">
                  Paid Time Off (PTO Days)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Paid Holidays</label>
                    <NumericInput
                      min={0}
                      max={30}
                      value={paidHolidays}
                      onChange={(val) => setPaidHolidays(val)}
                      className="px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Paid Vacation / Sick</label>
                    <NumericInput
                      min={0}
                      max={50}
                      value={paidVacation}
                      onChange={(val) => setPaidVacation(val)}
                      className="px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Total Annual Comp Summary Card */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 shadow-2xs">
              <div className="text-xs font-medium text-emerald-800 mb-1">
                Total Annual Comp (Base + Overtime)
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono">
                ${summary.totalAnnualCompensationWithOvertime.toLocaleString()}
              </div>
              <div className="text-xs text-slate-600 mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Base Gross Salary:</span>
                  <span className="text-slate-900 font-medium font-mono">${summary.annualSalary.toLocaleString()}</span>
                </div>
                {summary.annualOvertimePay > 0 && (
                  <div className="flex justify-between">
                    <span>Overtime Pay ({overtimeHours}h/wk):</span>
                    <span className="text-amber-800 font-medium font-mono">+${summary.annualOvertimePay.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-emerald-200/60 pt-1 text-purple-700">
                  <span>Embedded PTO Value:</span>
                  <span className="font-mono">${summary.ptoMonetaryValue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Wage Matrix Table & Detailed FLSA Specs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Conversion Matrix Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Full Wage Conversion Schedule</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gross compensation broken down across every standard US corporate pay frequency
                  </p>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <a
                    href="/excel-viewer"
                    onClick={(e) => { e.preventDefault(); navigateTo('/excel-viewer'); }}
                    className="text-[11px] text-slate-500 hover:text-emerald-600 transition-colors flex items-center gap-1"
                  >
                    <span>Free In-Browser Viewer</span>
                    <ArrowRight className="size-3" />
                  </a>
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Export .xlsx</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="px-5 py-3 font-medium">Frequency / Period</th>
                      <th className="px-5 py-3 font-medium">Gross Amount</th>
                      <th className="px-5 py-3 font-medium">Payroll Basis / Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {summary.breakdownTable.map((row) => (
                      <tr key={row.period} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-3.5 font-medium text-slate-900 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {row.period}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-emerald-600 text-base font-mono">
                          {row.formatted}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500">
                          {row.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FLSA Overtime Tiers Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <h3 className="text-base font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                Fair Labor Standards Act (FLSA) Overtime Breakdown
              </h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Under federal FLSA rules, non-exempt hourly employees working beyond 40 hours in a single workweek receive not less than 1.5× the regular rate.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Regular Rate (1.0x)</div>
                  <div className="text-xl font-bold text-slate-900 font-mono">${summary.hourlyRate.toFixed(2)}/hr</div>
                  <div className="text-[11px] text-slate-500 mt-1">First 40 hours/week</div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
                  <div className="text-xs text-amber-800 font-medium mb-1">Time-and-a-Half (1.5x)</div>
                  <div className="text-xl font-bold text-amber-700 font-mono">${summary.overtimeRate15x.toFixed(2)}/hr</div>
                  <div className="text-[11px] text-amber-900/70 mt-1">FLSA overtime statutory minimum</div>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200/80">
                  <div className="text-xs text-rose-800 font-medium mb-1">Double Time (2.0x)</div>
                  <div className="text-xl font-bold text-rose-700 font-mono">${summary.overtimeRate20x.toFixed(2)}/hr</div>
                  <div className="text-[11px] text-rose-900/70 mt-1">Holidays / Special agreements</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* In-Content Ad */}
        <div className="my-10">
          <AdSlot unit="calculatorResult" format="horizontal" />
        </div>

        {/* Detailed SEO Explanatory Guide */}
        <div className="mt-12 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-8 shadow-2xs">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
              How to Convert Annual Salary to Hourly Wage
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Converting an annual salary into an hourly wage requires calculating the exact number of working hours in a calendar year. The baseline formula adopted by the US Department of Labor and corporate payroll systems is the <strong>2,080 working hours benchmark</strong>:
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs sm:text-sm text-emerald-800 overflow-x-auto">
              Hourly Wage = Annual Salary ÷ (Hours Worked Per Week × Weeks Per Year)
              <br />
              Standard Example: $75,000 ÷ (40 hrs/wk × 52 wks/yr = 2,080 hrs) = $36.06 per hour
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-50/80 border border-slate-200">
              <h3 className="text-base font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Bi-Weekly vs Semi-Monthly Payroll
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Many workers confuse bi-weekly and semi-monthly pay periods:
                <br /><br />
                • <strong>Bi-Weekly (26 Paychecks/Year):</strong> You get paid every other week (e.g. every other Friday). Because 52 weeks ÷ 2 = 26, you experience two &ldquo;3-paycheck magic months&rdquo; each year.
                <br /><br />
                • <strong>Semi-Monthly (24 Paychecks/Year):</strong> You get paid twice a month on fixed calendar days (e.g. the 1st and 15th, or 15th and 30th). Each individual check is slightly larger ($Annual ÷ 24), but you receive only 2 checks every month.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50/80 border border-slate-200">
              <h3 className="text-base font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Exempt vs Non-Exempt Status (FLSA)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Understanding whether you qualify for overtime pay depends on your classification under the Fair Labor Standards Act:
                <br /><br />
                • <strong>Exempt Employees:</strong> Typically executive, administrative, or professional positions paid on a predetermined salary basis above federal thresholds. Exempt employees do not receive overtime regardless of hours worked.
                <br /><br />
                • <strong>Non-Exempt Employees:</strong> Must receive overtime pay at 1.5× the regular rate for any hours worked beyond 40 in a single standard workweek.
              </p>
            </div>
          </div>

          {/* Interactive FAQ Accordion */}
          <div className="pt-4 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-600" />
              Frequently Asked Questions About Wage Conversion
            </h2>
            <div className="space-y-3">
              {[
                {
                  q: 'What is the standard formula to convert salary to hourly?',
                  a: 'Divide your total annual gross salary by the number of hours worked in a year. In a standard full-time role with 40 hours per week and 52 weeks per year (including paid holidays and vacation), there are 2,080 hours. For example, a $60,000 salary equals $60,000 / 2,080 = $28.85/hour.'
                },
                {
                  q: 'Why does this calculator not include federal and state income taxes?',
                  a: 'This calculator computes pure gross mathematical conversions. Net take-home pay depends on personal W-4 withholding allowances, pre-tax 401(k) and HSA contributions, health insurance deductions, and state tax brackets (which range from 0% in Florida/Texas/Washington to over 13% in California). Providing an inaccurate net tax estimate would be misleading for contract negotiation.'
                },
                {
                  q: 'How does paid time off (PTO) affect my effective hourly wage?',
                  a: 'If you receive 25 days of paid time off (10 holidays + 15 vacation days), you actually work 1,880 hours instead of 2,080. If you divide your annual salary by only the actual hours worked, your "effective working wage" is higher. However, for payroll calculations, your base hourly rate remains calculated over the 2,080 total paid hours.'
                },
                {
                  q: 'How is overtime calculated for salaried non-exempt employees?',
                  a: 'For salaried non-exempt employees, the regular hourly rate is determined by dividing the weekly salary by 40 hours. For every hour worked above 40 in that week, the employee receives an extra half-time (0.5x) or time-and-a-half (1.5x) depending on whether the salary was intended to cover all hours worked or standard 40 hours.'
                }
              ].map((faq, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-4 py-3 text-left font-medium text-slate-800 hover:text-slate-900 flex items-center justify-between text-sm transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-emerald-600' : ''}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Related Calculators Cross-Sell */}
          <div className="pt-8">
            <RelatedCalculators currentSlug="salary-to-hourly-calculator" category="payroll" />
          </div>

          <MethodologyDisclosure type="salary" />
        </div>
      </main>
    </div>
  );
};

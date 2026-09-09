import { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Calculator,
  DollarSign,
  Building,
  TrendingUp,
  Download,
  FileSpreadsheet,
  HelpCircle,
  Sparkles,
  Percent
} from 'lucide-react';
import {
  calculateDscr,
  generateDscrAmortization,
  type DscrInputs
} from '../lib/dscrCalculator';
import { updatePageMeta } from '../lib/router';

interface DscrCalculatorProps {
  onTrySample?: () => void;
}

export const DscrCalculator = ({ onTrySample: _onTrySample }: DscrCalculatorProps) => {
  useEffect(() => {
    updatePageMeta(
      'DSCR Loan Calculator — Real Estate Investor Cash Flow & Debt Coverage Tool | TableView.dev',
      'Free, 100% private in-browser DSCR loan calculator for rental property investors. Calculate debt-service coverage ratio, cash flow, maximum loan amount, and cash-on-cash return with Excel export.',
      '/dscr-loan-calculator'
    );
  }, []);

  // Form State
  const [propertyValue, setPropertyValue] = useState<number>(450000);
  const [downPayment, setDownPayment] = useState<number>(20);
  const [downPaymentType, setDownPaymentType] = useState<'percent' | 'money'>('percent');
  const [interestRate, setInterestRate] = useState<number>(7.25);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [isInterestOnly, setIsInterestOnly] = useState<boolean>(false);
  const [monthlyRent, setMonthlyRent] = useState<number>(3800);
  const [annualPropertyTax, setAnnualPropertyTax] = useState<number>(5400);
  const [annualInsurance, setAnnualInsurance] = useState<number>(1600);
  const [monthlyHoa, setMonthlyHoa] = useState<number>(0);
  const [vacancyRate, setVacancyRate] = useState<number>(5);
  const [managementFeeRate, setManagementFeeRate] = useState<number>(8);
  const [annualMaintenanceReserve, setAnnualMaintenanceReserve] = useState<number>(2000);
  const [targetDscr, setTargetDscr] = useState<number>(1.25);

  // Amortization Schedule View
  const [scheduleView, setScheduleView] = useState<'annual' | 'monthly'>('annual');
  const [schedulePage, setSchedulePage] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Sync Down Payment when type changes
  const handleDownPaymentTypeChange = (newType: 'percent' | 'money') => {
    if (newType === downPaymentType) return;
    if (newType === 'percent') {
      const pct = propertyValue > 0 ? Number(((downPayment / propertyValue) * 100).toFixed(1)) : 20;
      setDownPayment(pct);
    } else {
      const amt = Number(((propertyValue * downPayment) / 100).toFixed(0));
      setDownPayment(amt);
    }
    setDownPaymentType(newType);
  };

  // Preset buttons
  const propertyPresets = [300000, 450000, 650000, 900000, 1400000];

  // Inputs model
  const inputs: DscrInputs = useMemo(
    () => ({
      propertyValue,
      downPayment,
      downPaymentType,
      interestRate,
      loanTermYears,
      isInterestOnly,
      monthlyRent,
      annualPropertyTax,
      annualInsurance,
      monthlyHoa,
      vacancyRate,
      managementFeeRate,
      annualMaintenanceReserve,
      targetDscr
    }),
    [
      propertyValue,
      downPayment,
      downPaymentType,
      interestRate,
      loanTermYears,
      isInterestOnly,
      monthlyRent,
      annualPropertyTax,
      annualInsurance,
      monthlyHoa,
      vacancyRate,
      managementFeeRate,
      annualMaintenanceReserve,
      targetDscr
    ]
  );

  const result = useMemo(() => calculateDscr(inputs), [inputs]);
  const fullMonthlySchedule = useMemo(() => generateDscrAmortization(inputs), [inputs]);

  // Aggregate Annual Schedule
  const annualSchedule = useMemo(() => {
    const map = new Map<
      number,
      { year: number; payment: number; principal: number; interest: number; balance: number }
    >();
    for (const row of fullMonthlySchedule) {
      const current = map.get(row.year) || {
        year: row.year,
        payment: 0,
        principal: 0,
        interest: 0,
        balance: row.balance
      };
      current.payment += row.payment;
      current.principal += row.principal;
      current.interest += row.interest;
      current.balance = row.balance;
      map.set(row.year, current);
    }
    return Array.from(map.values());
  }, [fullMonthlySchedule]);

  const currencyFmt = (n: number) =>
    n.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

  const currencyDecFmt = (n: number) =>
    n.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  // Export Amortization Table to Excel (.xlsx)
  const handleExportExcel = () => {
    const rows = fullMonthlySchedule.map((r) => ({
      Year: r.year,
      Month: r.month,
      'Total Payment': r.payment,
      Principal: r.principal,
      Interest: r.interest,
      'Ending Balance': r.balance,
      'Accumulated Interest': r.accumulatedInterest,
      'Accumulated Principal': r.accumulatedPrincipal
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DSCR Amortization');
    XLSX.writeFile(workbook, `dscr_loan_amortization_${propertyValue}.xlsx`);
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = 'Year,Month,Payment,Principal,Interest,Balance,AccumulatedInterest,AccumulatedPrincipal\n';
    const body = fullMonthlySchedule
      .map(
        (r) =>
          `${r.year},${r.month},${r.payment},${r.principal},${r.interest},${r.balance},${r.accumulatedInterest},${r.accumulatedPrincipal}`
      )
      .join('\n');
    const blob = new Blob([headers + body], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `dscr_loan_schedule_${propertyValue}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // FAQ structured schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: 'DSCR Loan Calculator for Real Estate Investors',
    description:
      'Professional Debt-Service Coverage Ratio calculator for investment property purchases and cash-out refinancing.',
    provider: {
      '@type': 'Organization',
      name: 'TableView.dev',
      url: 'https://tableview.dev'
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header */}
      <section className="relative pt-12 pb-8 border-b border-slate-800 bg-gradient-to-b from-indigo-950/20 via-slate-950 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-3">
            <span className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/60 font-semibold">
              REAL ESTATE INVESTOR TOOLS
            </span>
            <span>•</span>
            <span className="text-slate-400">100% Private In-Browser Calculation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-100">
            DSCR Loan <span className="text-indigo-400">Calculator</span>
          </h1>

          <p className="mt-3 max-w-3xl text-sm sm:text-base text-slate-400 leading-relaxed">
            Calculate your <strong>Debt-Service Coverage Ratio (DSCR)</strong>, net cash flow, and maximum eligible loan amount for residential rental properties (1-4 units and commercial). Zero personal income verification required.
          </p>

          {/* Quick Property Value Presets */}
          <div className="flex items-center gap-2 mt-6 flex-wrap">
            <span className="text-xs text-slate-400">Quick Presets:</span>
            {propertyPresets.map((preset) => (
              <button
                key={preset}
                onClick={() => setPropertyValue(preset)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
                  propertyValue === preset
                    ? 'bg-indigo-600 text-white border-indigo-500 font-semibold shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                {currencyFmt(preset)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Calculator Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Building className="size-4.5 text-indigo-400" />
                <span>Property & Loan Parameters</span>
              </h2>

              {/* Purchase Price */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex justify-between">
                  <span>Purchase / Property Value</span>
                  <span className="text-indigo-400 font-mono font-bold">{currencyFmt(propertyValue)}</span>
                </label>
                <div className="relative">
                  <DollarSign className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="number"
                    value={propertyValue || ''}
                    onChange={(e) => setPropertyValue(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Down Payment */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Down Payment</label>
                  <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5 text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => handleDownPaymentTypeChange('percent')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        downPaymentType === 'percent'
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownPaymentTypeChange('money')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        downPaymentType === 'money'
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      $
                    </button>
                  </div>
                </div>

                <div className="relative">
                  {downPaymentType === 'percent' ? (
                    <Percent className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  ) : (
                    <DollarSign className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  )}
                  <input
                    type="number"
                    step={downPaymentType === 'percent' ? '0.5' : '1000'}
                    value={downPayment || ''}
                    onChange={(e) => setDownPayment(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>Down Payment Amount: {currencyFmt(result.downPaymentAmount)}</span>
                  <span>LTV: {result.ltv}%</span>
                </p>
              </div>

              {/* Interest Rate & Term */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Interest Rate (%)
                  </label>
                  <div className="relative">
                    <Percent className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      step="0.125"
                      value={interestRate || ''}
                      onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Loan Term
                  </label>
                  <select
                    value={loanTermYears}
                    onChange={(e) => setLoanTermYears(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value={30}>30-Year Fixed</option>
                    <option value={20}>20-Year Fixed</option>
                    <option value={15}>15-Year Fixed</option>
                    <option value={10}>10-Year Fixed</option>
                    <option value={40}>40-Year Extended</option>
                  </select>
                </div>
              </div>

              {/* Interest-Only Option */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Interest-Only Loan</span>
                  <span className="text-[11px] text-slate-400">Lower monthly payment to boost DSCR ratio</span>
                </div>
                <input
                  type="checkbox"
                  checked={isInterestOnly}
                  onChange={(e) => setIsInterestOnly(e.target.checked)}
                  className="size-4.5 rounded text-indigo-600 bg-slate-900 border-slate-700 cursor-pointer"
                />
              </div>

              {/* Rental Income & Expenses */}
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pt-3 pb-3">
                <TrendingUp className="size-4.5 text-emerald-400" />
                <span>Rental Income & Operating Expenses</span>
              </h2>

              {/* Monthly Gross Rent */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex justify-between">
                  <span>Monthly Gross Rent Expected</span>
                  <span className="text-emerald-400 font-mono font-bold">{currencyFmt(monthlyRent)}/mo</span>
                </label>
                <div className="relative">
                  <DollarSign className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="number"
                    value={monthlyRent || ''}
                    onChange={(e) => setMonthlyRent(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Taxes & Insurance */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Annual Property Tax
                  </label>
                  <div className="relative">
                    <DollarSign className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      value={annualPropertyTax || ''}
                      onChange={(e) => setAnnualPropertyTax(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Annual Insurance
                  </label>
                  <div className="relative">
                    <DollarSign className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      value={annualInsurance || ''}
                      onChange={(e) => setAnnualInsurance(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* HOA & Vacancy */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Monthly HOA Fee
                  </label>
                  <div className="relative">
                    <DollarSign className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      value={monthlyHoa || ''}
                      onChange={(e) => setMonthlyHoa(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Vacancy Rate (%)
                  </label>
                  <div className="relative">
                    <Percent className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      value={vacancyRate || ''}
                      onChange={(e) => setVacancyRate(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Operating Expenses & Target DSCR */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Mgmt Fee (%)
                  </label>
                  <div className="relative">
                    <Percent className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      value={managementFeeRate || ''}
                      onChange={(e) => setManagementFeeRate(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-2 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Maintenance ($/yr)
                  </label>
                  <div className="relative">
                    <DollarSign className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      value={annualMaintenanceReserve || ''}
                      onChange={(e) => setAnnualMaintenanceReserve(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-2 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Target DSCR
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={targetDscr || ''}
                    onChange={(e) => setTargetDscr(Math.max(0.5, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-indigo-300 font-mono font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Key Metrics & Qualification Dashboard (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main DSCR Ratio Hero Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                    Calculated Debt-Service Coverage Ratio
                  </span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-100">
                      {result.grossDscr.toFixed(2)}x
                    </span>
                    <span
                      className={`text-sm font-semibold px-2.5 py-1 rounded-md border ${
                        result.qualificationStatus === 'prime'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          : result.qualificationStatus === 'standard'
                          ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
                          : result.qualificationStatus === 'low'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                          : 'bg-red-950/80 text-red-300 border-red-800'
                      }`}
                    >
                      {result.statusLabel}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Monthly Net Cash Flow</span>
                  <span
                    className={`text-xl sm:text-2xl font-black font-mono mt-0.5 block ${
                      result.monthlyNetCashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {result.monthlyNetCashFlow >= 0 ? '+' : ''}
                    {currencyDecFmt(result.monthlyNetCashFlow)}
                  </span>
                  <span className="text-[11px] text-slate-500">after all operating expenses</span>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-300/90 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                {result.statusDescription}
              </p>

              {/* Progress Visual Bar for DSCR */}
              <div className="mt-5 pt-3 border-t border-slate-800/80">
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                  <span>0.75x (Breakeven Risk)</span>
                  <span>1.0x (PITIA Breakeven)</span>
                  <span>1.25x (Prime Target)</span>
                  <span>1.5x+ (Super Cashflow)</span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      result.grossDscr >= 1.25
                        ? 'bg-emerald-500'
                        : result.grossDscr >= 1.0
                        ? 'bg-indigo-500'
                        : result.grossDscr >= 0.75
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, (result.grossDscr / 1.75) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Financial Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Monthly PITIA</span>
                <span className="text-base font-bold font-mono text-slate-100 mt-0.5 block">
                  {currencyFmt(result.monthlyPitia)}
                </span>
                <span className="text-[10px] text-slate-500">Debt + Escrows</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Cash-on-Cash ROI</span>
                <span className="text-base font-bold font-mono text-emerald-400 mt-0.5 block">
                  {result.cashOnCashReturn}%
                </span>
                <span className="text-[10px] text-slate-500">Annual Return</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Total Loan Amount</span>
                <span className="text-base font-bold font-mono text-slate-100 mt-0.5 block">
                  {currencyFmt(result.loanAmount)}
                </span>
                <span className="text-[10px] text-slate-500">{result.ltv}% LTV</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Max Loan at 1.25x</span>
                <span className="text-base font-bold font-mono text-indigo-400 mt-0.5 block">
                  {currencyFmt(result.maxLoanAmountAtTargetDscr)}
                </span>
                <span className="text-[10px] text-slate-500">at current rent</span>
              </div>
            </div>

            {/* Monthly PITIA Expense Breakdown Table */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
                <span>Monthly PITIA & Expense Breakdown</span>
                <span className="text-xs font-mono text-slate-400">
                  Total Monthly Outflow: {currencyFmt(result.monthlyPitia + result.monthlyManagementFee + result.monthlyMaintenance)}
                </span>
              </h3>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-indigo-500" />
                    Principal & Interest {isInterestOnly ? '(Interest Only)' : ''}
                  </span>
                  <span className="text-slate-100 font-bold">{currencyDecFmt(result.monthlyPrincipalAndInterest)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Property Taxes
                  </span>
                  <span className="text-slate-100">{currencyDecFmt(result.monthlyTaxes)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-cyan-500" />
                    Homeowners Insurance
                  </span>
                  <span className="text-slate-100">{currencyDecFmt(result.monthlyInsurance)}</span>
                </div>
                {result.monthlyHoa > 0 && (
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-amber-500" />
                      HOA Fees
                    </span>
                    <span className="text-slate-100">{currencyDecFmt(result.monthlyHoa)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-slate-500" />
                    Property Management ({vacancyRate}% Vacancy + {managementFeeRate}% Mgmt)
                  </span>
                  <span className="text-slate-300">{currencyDecFmt(result.monthlyManagementFee)}</span>
                </div>
              </div>
            </div>

            {/* Investor Action Card */}
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="size-4 text-amber-400" />
                  Looking for competitive DSCR lending options?
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Qualify using this exact cash flow model without tax returns or personal W-2 forms.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 cursor-pointer transition-colors"
                >
                  {copiedLink ? 'Link Copied!' : 'Share Deal'}
                </button>
                <button
                  onClick={handleExportExcel}
                  className="btn-primary px-4 py-1.5 rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Export PDF/Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Interactive Amortization Table */}
        <div className="mt-12 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Calculator className="size-5 text-indigo-400" />
                <span>DSCR Loan Amortization Schedule</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Full 30-year principal paydown schedule and equity accumulation trajectory.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium">
                <button
                  onClick={() => setScheduleView('annual')}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    scheduleView === 'annual'
                      ? 'bg-slate-800 text-slate-100 font-bold border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Annual Summary
                </button>
                <button
                  onClick={() => setScheduleView('monthly')}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    scheduleView === 'monthly'
                      ? 'bg-slate-800 text-slate-100 font-bold border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Monthly Details
                </button>
              </div>

              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800/80 text-xs font-semibold text-emerald-300 transition-colors cursor-pointer"
                title="Download Excel spreadsheet"
              >
                <FileSpreadsheet className="size-3.5" />
                <span>Excel (.xlsx)</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                title="Download CSV"
              >
                <Download className="size-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[420px]">
              <table className="w-full border-collapse text-left font-mono text-xs">
                <thead className="bg-slate-950/90 sticky top-0 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="p-3">Period</th>
                    <th className="p-3">Total Payment</th>
                    <th className="p-3">Principal</th>
                    <th className="p-3">Interest</th>
                    <th className="p-3">Ending Loan Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                  {scheduleView === 'annual'
                    ? annualSchedule.map((row) => (
                        <tr key={row.year} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-3 font-semibold text-indigo-300">Year {row.year}</td>
                          <td className="p-3 text-slate-200">{currencyDecFmt(row.payment)}</td>
                          <td className="p-3 text-emerald-400 font-semibold">{currencyDecFmt(row.principal)}</td>
                          <td className="p-3 text-amber-400">{currencyDecFmt(row.interest)}</td>
                          <td className="p-3 text-slate-100 font-bold">{currencyFmt(row.balance)}</td>
                        </tr>
                      ))
                    : fullMonthlySchedule
                        .slice((schedulePage - 1) * 24, schedulePage * 24)
                        .map((row) => (
                          <tr key={row.month} className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-3 font-semibold text-indigo-300">Month {row.month} (Yr {row.year})</td>
                            <td className="p-3 text-slate-200">{currencyDecFmt(row.payment)}</td>
                            <td className="p-3 text-emerald-400">{currencyDecFmt(row.principal)}</td>
                            <td className="p-3 text-amber-400">{currencyDecFmt(row.interest)}</td>
                            <td className="p-3 text-slate-100 font-bold">{currencyFmt(row.balance)}</td>
                          </tr>
                        ))}
                </tbody>
              </table>
            </div>

            {scheduleView === 'monthly' && (
              <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Showing months {(schedulePage - 1) * 24 + 1} to {Math.min(fullMonthlySchedule.length, schedulePage * 24)}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSchedulePage((p) => Math.max(1, p - 1))}
                    disabled={schedulePage === 1}
                    className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 cursor-pointer"
                  >
                    Prev
                  </button>
                  <span>Page {schedulePage} of {Math.ceil(fullMonthlySchedule.length / 24)}</span>
                  <button
                    onClick={() => setSchedulePage((p) => Math.min(Math.ceil(fullMonthlySchedule.length / 24), p + 1))}
                    disabled={schedulePage >= Math.ceil(fullMonthlySchedule.length / 24)}
                    className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Educational Guide & In-Depth Investor FAQ */}
        <div className="mt-16 pt-10 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
              <HelpCircle className="size-5 text-indigo-400" />
              What is a DSCR Loan & How Does It Work?
            </h3>
            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>
                A <strong>DSCR (Debt-Service Coverage Ratio) loan</strong> is a specialized type of non-QM (Non-Qualified Mortgage) loan designed for real estate investors. Unlike conventional mortgages that evaluate personal income, W-2 tax returns, and debt-to-income (DTI) ratios, DSCR lenders qualify borrowers based exclusively on the property's rental cash flow.
              </p>
              <p>
                The formula used by secondary market mortgage underwriters is:
              </p>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-indigo-300">
                DSCR = Gross Monthly Rental Income / Monthly PITIA
              </div>
              <p>
                Where <strong>PITIA</strong> represents Principal, Interest, Taxes, Insurance, and HOA dues.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-100 mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <h4 className="font-semibold text-slate-200">What is the minimum DSCR required to qualify?</h4>
                <p className="text-slate-400 mt-1">
                  Most private lenders prefer a DSCR of <strong>1.20x to 1.25x</strong> for standard pricing. However, many lenders offer "no-ratio" or "sub-1.0 DSCR" programs down to 0.75x if you provide a 25% to 30% down payment and 6+ months of cash reserves.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <h4 className="font-semibold text-slate-200">Can I use a DSCR loan for Short-Term Rentals (Airbnb/VRBO)?</h4>
                <p className="text-slate-400 mt-1">
                  Yes! Lenders frequently underwrite AirDNA projections or historical 12-month short-term rental revenue statements to verify qualified debt service.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <h4 className="font-semibold text-slate-200">Can I close in an LLC name?</h4>
                <p className="text-slate-400 mt-1">
                  Yes, virtually all DSCR lenders permit or even require vesting under a business entity (LLC, Corporation, or Partnership) to protect personal liability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

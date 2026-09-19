import { useState, useMemo, useEffect } from 'react';
import {
  Building,
  TrendingUp,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Share2,
  Check,
  DollarSign,
  PieChart,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import {
  calculateRentalProperty,
  RENTAL_PRESETS,
  type RentalPropertyInput,
  type RentalPropertyOutput
} from '../lib/capRateCalculator';
import { updatePageMeta, navigateTo } from '../lib/router';
import { CALCULATOR_META } from '../data/routeMeta';
import { MethodologyDisclosure } from '../components/MethodologyDisclosure';
import { AdSlot } from '../components/AdSlot';
import { CalculatorFaqSection } from '../components/CalculatorFaqSection';
import { RelatedCalculators } from '../components/RelatedCalculators';
import { CurrencyInput } from '../components/CurrencyInput';
import { NumericInput } from '../components/NumericInput';
import {
  CalculatorPresetsBar,
  type CalculatorPreset,
  PageHeader,
} from '../components/calculator-kit';
import { SuiteSubNav } from '../components/SuiteSubNav';
import { InfoTooltip } from '../components/InfoTooltip';

const currencyFmt = (val: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(val);

const percentFmt = (val: number): string => `${val.toFixed(2)}%`;

export default function CapRateCalculator() {
  // Preset scenario items for CalculatorPresetsBar
  const presets: CalculatorPreset<RentalPropertyInput>[] = RENTAL_PRESETS.map((p) => ({
    id: p.id,
    label: p.name,
    badge: p.id === 'midwest-cash-cow' ? '1% Rule' : p.id === 'all-cash-purchase' ? 'All-Cash' : 'Popular',
    description: p.tagline,
    values: p.input
  }));

  const [activePresetId, setActivePresetId] = useState<string>('turnkey-sfh');
  const [form, setForm] = useState<RentalPropertyInput>(RENTAL_PRESETS[0].input);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'cashflow' | 'projections'>('summary');

  useEffect(() => {
    updatePageMeta(
      CALCULATOR_META['/cap-rate-calculator'] || {
        title: 'Rental Property Cash Flow & Cap Rate Calculator | TableView',
        description:
          'Underwrite residential & commercial rental properties with institutional precision. Model NOI, Cap Rate, Cash-on-Cash Return, 10-year wealth building, and 1% rule.',
        canonicalPath: '/cap-rate-calculator'
      }
    );
  }, []);

  const output: RentalPropertyOutput = useMemo(() => {
    return calculateRentalProperty(form);
  }, [form]);

  const updateField = <K extends keyof RentalPropertyInput>(field: K, val: RentalPropertyInput[K]) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    setActivePresetId('');
  };

  const handleSelectPreset = (preset: CalculatorPreset<RentalPropertyInput>) => {
    setActivePresetId(preset.id);
    setForm(preset.values);
  };

  const handleShareDeal = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportExcel = async () => {
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Deal Summary
    const summaryData = [
      ['TableView Institutional Real Estate Underwriting'],
      ['Property Acquisition & Deal Summary'],
      [],
      ['Metric', 'Value'],
      ['Purchase Price', output.purchasePrice],
      ['Closing Costs', output.closingCosts],
      ['Initial Rehab Budget', output.rehabBudget],
      ['Total Initial Cash Required', output.totalInitialCashRequired],
      ['Loan Amount', output.loanAmount],
      ['Monthly Mortgage (P&I)', output.monthlyDebtService],
      ['Annual Debt Service', output.annualDebtService],
      [],
      ['Gross Scheduled Income (Annual)', output.grossScheduledIncomeAnnual],
      ['Vacancy Loss (Annual)', output.vacancyLossAnnual],
      ['Effective Gross Income (EGI)', output.effectiveGrossIncomeAnnual],
      ['Total Operating Expenses (Annual)', output.totalOperatingExpensesAnnual],
      ['Net Operating Income (NOI)', output.noiAnnual],
      ['Net Annual Cash Flow (Post-Debt)', output.netCashFlowAnnual],
      ['Net Monthly Cash Flow', output.netCashFlowMonthly],
      [],
      ['Capitalization Rate (Cap Rate)', `${output.capRate.toFixed(2)}%`],
      ['Cash-on-Cash Return', `${output.cashOnCashReturn.toFixed(2)}%`],
      ['Gross Rent Multiplier (GRM)', output.grossRentMultiplier.toFixed(2)],
      ['Operating Expense Ratio (OER)', `${output.operatingExpenseRatio.toFixed(1)}%`],
      ['Debt Service Coverage Ratio (DSCR)', output.dscr ? output.dscr.toFixed(2) : 'N/A (Cash)']
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Underwriting Summary');

    // Sheet 2: Operating Expenses
    const expenseRows = output.expenses.map((e) => ({
      Category: e.name,
      'Monthly ($)': Math.round(e.monthly),
      'Annual ($)': Math.round(e.annual),
      '% of Revenue': `${e.percentOfEGI.toFixed(1)}%`
    }));
    const expenseSheet = XLSX.utils.json_to_sheet(expenseRows);
    XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Operating Expenses');

    // Sheet 3: 10-Year Projections
    const projectionRows = output.projections.map((p) => ({
      Year: p.year,
      'Property Value': p.propertyValue,
      'Loan Balance': p.loanBalance,
      'Accumulated Equity': p.equity,
      'Gross Rent': p.grossRentAnnual,
      'Operating Expenses': p.operatingExpenses,
      NOI: p.noi,
      'Debt Service': p.debtService,
      'Net Annual Cash Flow': p.netCashFlowAnnual,
      'Cumulative Cash Flow': p.cumulativeCashFlow,
      'Total Wealth / Return': p.totalReturn,
      'Cash-on-Cash Return': `${p.cashOnCash}%`
    }));
    const projectionSheet = XLSX.utils.json_to_sheet(projectionRows);
    XLSX.utils.book_append_sheet(workbook, projectionSheet, '10-Year Projections');

    XLSX.writeFile(workbook, `rental_property_underwriting_${output.purchasePrice}.xlsx`);
  };

  const handleExportCsv = () => {
    const headers = 'Year,PropertyValue,LoanBalance,Equity,GrossRent,OperatingExpenses,NOI,DebtService,NetCashFlow,CumulativeCashFlow,TotalReturn,CashOnCash\n';
    const rows = output.projections
      .map(
        (p) =>
          `${p.year},${p.propertyValue},${p.loanBalance},${p.equity},${p.grossRentAnnual},${p.operatingExpenses},${p.noi},${p.debtService},${p.netCashFlowAnnual},${p.cumulativeCashFlow},${p.totalReturn},${p.cashOnCash}%`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rental_property_projections_${output.purchasePrice}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleBridgeToDscr = () => {
    navigateTo(`/dscr-loan-calculator?propertyValue=${form.purchasePrice}&monthlyRent=${form.monthlyRent}&tax=${form.propertyTaxAnnual}&insurance=${form.insuranceAnnual}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Rental Property Cash Flow & Cap Rate Calculator"
          badge="Institutional Real Estate"
          subtitle="Underwrite residential & commercial rental acquisitions. Calculate pure Net Operating Income (NOI), Cap Rate, Cash-on-Cash Return, and 10-year equity projections."
          actions={
            <>
              <button
                type="button"
                onClick={handleShareDeal}
                className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-2 shadow-2xs cursor-pointer transition-all active:scale-95"
              >
                {copiedLink ? (
                  <>
                    <Check className="size-4 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="size-4 text-indigo-600" />
                    <span>Share Deal</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleExportExcel}
                className="btn-primary h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-xs cursor-pointer transition-transform active:scale-95 shrink-0"
              >
                <Download className="size-4" />
                <span>Export Excel (.xlsx)</span>
              </button>
            </>
          }
          presets={
            <CalculatorPresetsBar
              presets={presets}
              activeId={activePresetId}
              onSelect={handleSelectPreset}
              title="Target Scenarios"
            />
          }
        />

        <SuiteSubNav suite="commercial" />

        {/* Primary KPI Header Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* NOI Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                Net Operating Income
                <InfoTooltip text="Net Operating Income (NOI) equals Effective Gross Income minus all Operating Expenses. Follows institutional CRE standards by strictly excluding mortgage debt service." />
              </span>
              <DollarSign className="size-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {currencyFmt(output.noiAnnual)}
              <span className="text-xs font-normal text-slate-500 ml-1">/yr</span>
            </div>
            <div className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
              <span>{currencyFmt(output.noiMonthly)} / mo</span>
              <span className="text-slate-400 font-normal">pre-debt</span>
            </div>
          </div>

          {/* Cap Rate Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                Capitalization Rate
                <InfoTooltip text="Cap Rate = Annual NOI / Purchase Price. Represents the unleveraged property yield independent of financing structure." />
              </span>
              <TrendingUp className="size-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 tracking-tight">
              {percentFmt(output.capRate)}
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-1.5">
              <span>GRM: {output.grossRentMultiplier.toFixed(1)}x</span>
              <span className="text-slate-300">•</span>
              <span className={output.capRate >= 6.5 ? 'text-emerald-600' : 'text-slate-500'}>
                {output.capRate >= 7.5 ? 'High Yield' : output.capRate >= 5.5 ? 'Market Yield' : 'Core / Low Cap'}
              </span>
            </div>
          </div>

          {/* Cash on Cash Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                Cash-on-Cash Return
                <InfoTooltip text="Cash-on-Cash Return = Annual Net Cash Flow / Total Initial Cash Invested (Down Payment + Closing Costs + Rehab). Measures immediate leveraged dividend yield." />
              </span>
              <Layers className="size-4 text-blue-600" />
            </div>
            <div
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                output.cashOnCashReturn > 8
                  ? 'text-emerald-600'
                  : output.cashOnCashReturn > 0
                  ? 'text-blue-600'
                  : 'text-rose-600'
              }`}
            >
              {percentFmt(output.cashOnCashReturn)}
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-1">
              Initial Cash: {currencyFmt(output.totalInitialCashRequired)}
            </div>
          </div>

          {/* Monthly Net Cash Flow Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                Net Cash Flow
                <InfoTooltip text="Net cash in your pocket every month after paying all operating expenses, reserves, and mortgage debt service." />
              </span>
              <PieChart className="size-4 text-indigo-600" />
            </div>
            <div
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                output.netCashFlowMonthly >= 0 ? 'text-slate-900' : 'text-rose-600'
              }`}
            >
              {currencyFmt(output.netCashFlowMonthly)}
              <span className="text-xs font-normal text-slate-500 ml-1">/mo</span>
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-1">
              {currencyFmt(output.netCashFlowAnnual)} / year net
            </div>
          </div>
        </div>

        {/* Deal Health Verdict Banner */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            output.verdict.status === 'excellent'
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : output.verdict.status === 'good'
              ? 'bg-blue-50/80 border-blue-200 text-blue-950'
              : output.verdict.status === 'fair'
              ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
              : output.verdict.status === 'caution'
              ? 'bg-amber-50/80 border-amber-200 text-amber-950'
              : 'bg-rose-50/80 border-rose-200 text-rose-950'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {output.verdict.status === 'negative' ? (
                <AlertTriangle className="size-5 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              )}
              <h3 className="font-bold text-sm sm:text-base">{output.verdict.title}</h3>
              <span
                className={`text-2xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  output.verdict.status === 'negative'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {output.verdict.status}
              </span>
            </div>
            <p className="text-xs text-slate-700">{output.verdict.summary}</p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-2xs font-medium text-slate-600">
              {output.verdict.pros.map((pro, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                  <Check className="size-3" /> {pro}
                </span>
              ))}
              {output.verdict.risks.map((risk, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded-md">
                  <AlertTriangle className="size-3" /> {risk}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleBridgeToDscr}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm shrink-0 transition-transform active:scale-95"
          >
            <span>Bridge to DSCR Underwriter</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>

        {/* Main Underwriting Grid: Form (5 cols) & Results (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Property Acquisition & Costs */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Building className="size-4 text-indigo-600" />
                <span>Acquisition & Initial Cash</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex justify-between">
                  <span>Purchase Price</span>
                  <span className="text-indigo-600 font-bold">{currencyFmt(form.purchasePrice)}</span>
                </label>
                <CurrencyInput
                  value={form.purchasePrice}
                  onChange={(val) => updateField('purchasePrice', val)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Down Payment (%)
                  </label>
                  <NumericInput
                    value={form.downPaymentPercent}
                    onChange={(val) => updateField('downPaymentPercent', val)}
                    step={5}
                    min={0}
                    max={100}
                    suffix="%"
                  />
                  <div className="flex gap-1 mt-1.5">
                    {[20, 25, 100].map((dp) => (
                      <button
                        key={dp}
                        type="button"
                        onClick={() => updateField('downPaymentPercent', dp)}
                        className={`text-2xs px-2 py-0.5 rounded border ${
                          form.downPaymentPercent === dp
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {dp === 100 ? 'All-Cash' : `${dp}%`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Closing Costs (%)
                  </label>
                  <NumericInput
                    value={form.closingCostPercent}
                    onChange={(val) => updateField('closingCostPercent', val)}
                    step={0.5}
                    min={0}
                    max={10}
                    suffix="%"
                  />
                  <div className="text-2xs text-slate-400 mt-1 font-mono">
                    = {currencyFmt(output.closingCosts)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex justify-between">
                  <span>Upfront Rehab / Repair Budget</span>
                  <span className="text-slate-500 font-mono text-2xs">{currencyFmt(form.rehabBudget)}</span>
                </label>
                <CurrencyInput
                  value={form.rehabBudget}
                  onChange={(val) => updateField('rehabBudget', val)}
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Total Out-of-Pocket Cash:</span>
                <span className="font-bold text-slate-900 font-mono">{currencyFmt(output.totalInitialCashRequired)}</span>
              </div>
            </div>

            {/* 2. Financing Terms */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-indigo-600" />
                  <span>Financing & Debt Terms</span>
                </div>
                {form.downPaymentPercent >= 100 && (
                  <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    All-Cash
                  </span>
                )}
              </h2>

              {form.downPaymentPercent < 100 ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mortgage Rate (%)
                      </label>
                      <NumericInput
                        value={form.interestRate}
                        onChange={(val) => updateField('interestRate', val)}
                        step={0.125}
                        min={0}
                        max={15}
                        suffix="%"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Loan Term (Years)
                      </label>
                      <NumericInput
                        value={form.loanTermYears}
                        onChange={(val) => updateField('loanTermYears', val)}
                        step={5}
                        min={5}
                        max={40}
                        suffix="yrs"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Loan Amount (LTV {100 - form.downPaymentPercent}%):</span>
                      <span className="font-bold text-slate-800">{currencyFmt(output.loanAmount)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Monthly Principal & Interest:</span>
                      <span className="font-bold text-indigo-600">{currencyFmt(output.monthlyDebtService)}/mo</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                  <span>100% Cash Purchase. Zero mortgage payments and zero interest expense.</span>
                </div>
              )}
            </div>

            {/* 3. Rental Income */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <DollarSign className="size-4 text-emerald-600" />
                <span>Gross Rental Revenue</span>
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Rent ($)
                  </label>
                  <CurrencyInput
                    value={form.monthlyRent}
                    onChange={(val) => updateField('monthlyRent', val)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Other Income ($/mo)
                  </label>
                  <CurrencyInput
                    value={form.otherMonthlyIncome}
                    onChange={(val) => updateField('otherMonthlyIncome', val)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex justify-between">
                  <span>Vacancy & Credit Loss</span>
                  <span className="text-slate-500 text-2xs">{currencyFmt(output.vacancyLossAnnual)} / yr</span>
                </label>
                <NumericInput
                  value={form.vacancyRate}
                  onChange={(val) => updateField('vacancyRate', val)}
                  step={1}
                  min={0}
                  max={25}
                  suffix="%"
                />
                <div className="flex gap-1 mt-1.5">
                  {[3, 5, 8, 10].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => updateField('vacancyRate', v)}
                      className={`text-2xs px-2 py-0.5 rounded border ${
                        form.vacancyRate === v
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {v}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Effective Gross Income (EGI):</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {currencyFmt(output.effectiveGrossIncomeAnnual)} / yr
                </span>
              </div>
            </div>

            {/* 4. Operating Expenses (OpEx) */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PieChart className="size-4 text-indigo-600" />
                  <span>Operating Expenses (OpEx)</span>
                </h2>
                <span className="text-2xs font-bold text-slate-500">
                  OER: {output.operatingExpenseRatio.toFixed(1)}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Property Taxes ($/yr)
                  </label>
                  <CurrencyInput
                    value={form.propertyTaxAnnual}
                    onChange={(val) => updateField('propertyTaxAnnual', val)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Insurance ($/yr)
                  </label>
                  <CurrencyInput
                    value={form.insuranceAnnual}
                    onChange={(val) => updateField('insuranceAnnual', val)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    HOA Dues ($/mo)
                  </label>
                  <CurrencyInput
                    value={form.hoaMonthly}
                    onChange={(val) => updateField('hoaMonthly', val)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Property Mgmt (%)
                  </label>
                  <NumericInput
                    value={form.managementFeePercent}
                    onChange={(val) => updateField('managementFeePercent', val)}
                    step={1}
                    min={0}
                    max={20}
                    suffix="%"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Maintenance Reserve (%)
                  </label>
                  <NumericInput
                    value={form.maintenancePercent}
                    onChange={(val) => updateField('maintenancePercent', val)}
                    step={1}
                    min={0}
                    max={20}
                    suffix="%"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CapEx Reserve ($/mo)
                  </label>
                  <CurrencyInput
                    value={form.capexMonthly}
                    onChange={(val) => updateField('capexMonthly', val)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Owner Utilities ($/mo)
                  </label>
                  <CurrencyInput
                    value={form.utilitiesMonthly}
                    onChange={(val) => updateField('utilitiesMonthly', val)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Other OpEx ($/yr)
                  </label>
                  <CurrencyInput
                    value={form.otherExpensesAnnual}
                    onChange={(val) => updateField('otherExpensesAnnual', val)}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Total Annual OpEx:</span>
                <span className="font-bold text-rose-600 font-mono">
                  {currencyFmt(output.totalOperatingExpensesAnnual)} / yr
                </span>
              </div>
            </div>
          </div>

          {/* Right Results: Tabs & Analytics */}
          <div className="lg:col-span-7 space-y-6">
            {/* View Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('summary')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'summary'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Underwriting Breakdown
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('cashflow')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'cashflow'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Expense Audit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('projections')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'projections'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  10-Year Wealth Projection
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="text-2xs font-semibold px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 inline-flex items-center gap-1 cursor-pointer"
                >
                  <FileSpreadsheet className="size-3" />
                  CSV
                </button>
              </div>
            </div>

            {/* TAB 1: Underwriting Breakdown */}
            {activeTab === 'summary' && (
              <div className="space-y-6">
                {/* Annual Cash Flow Waterfall Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 flex justify-between items-center">
                    <span>Year 1 Income & Expense Waterfall</span>
                    <span className="text-2xs font-mono text-slate-500">Institutional Model</span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="p-3.5 flex justify-between items-center">
                      <span className="font-medium text-slate-700">Gross Scheduled Rent</span>
                      <span className="font-mono font-bold text-slate-900">
                        +{currencyFmt(output.grossScheduledIncomeAnnual)}
                      </span>
                    </div>
                    <div className="p-3.5 flex justify-between items-center bg-slate-50/50">
                      <span className="text-slate-600">Less: Vacancy & Credit Loss ({form.vacancyRate}%)</span>
                      <span className="font-mono text-rose-600">
                        -{currencyFmt(output.vacancyLossAnnual)}
                      </span>
                    </div>
                    <div className="p-3.5 flex justify-between items-center bg-indigo-50/40 font-bold">
                      <span className="text-indigo-950">Effective Gross Income (EGI)</span>
                      <span className="font-mono text-indigo-700">
                        {currencyFmt(output.effectiveGrossIncomeAnnual)}
                      </span>
                    </div>
                    <div className="p-3.5 flex justify-between items-center bg-slate-50/50">
                      <span className="text-slate-600">Less: Total Operating Expenses (OpEx)</span>
                      <span className="font-mono text-rose-600">
                        -{currencyFmt(output.totalOperatingExpensesAnnual)}
                      </span>
                    </div>
                    <div className="p-3.5 flex justify-between items-center bg-emerald-50/70 font-bold text-sm">
                      <span className="text-emerald-950 flex items-center gap-1.5">
                        Net Operating Income (NOI)
                        <InfoTooltip text="NOI strictly excludes debt service. This represents the true unleveraged earning power of the property." />
                      </span>
                      <span className="font-mono text-emerald-800">
                        {currencyFmt(output.noiAnnual)}
                      </span>
                    </div>
                    <div className="p-3.5 flex justify-between items-center bg-slate-50/50">
                      <span className="text-slate-600">Less: Annual Debt Service (P&I)</span>
                      <span className="font-mono text-rose-600">
                        -{currencyFmt(output.annualDebtService)}
                      </span>
                    </div>
                    <div className="p-3.5 flex justify-between items-center bg-slate-900 text-white font-black text-sm">
                      <span>Net Cash Flow (After Debt)</span>
                      <span className="font-mono text-emerald-400">
                        {currencyFmt(output.netCashFlowAnnual)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Heuristic Benchmarks & Rules of Thumb */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1% Rule Check */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-indigo-600" />
                        The 1% Rule
                      </h4>
                      <span
                        className={`text-2xs font-bold px-2 py-0.5 rounded-full ${
                          output.meets1PercentRule
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {output.meets1PercentRule ? 'Passes' : 'Fails'}
                      </span>
                    </div>
                    <div className="text-xl font-black text-slate-900 font-mono">
                      {output.rentToPriceRatio.toFixed(2)}%
                    </div>
                    <p className="text-2xs text-slate-500 leading-relaxed">
                      Monthly rent is {output.rentToPriceRatio.toFixed(2)}% of purchase price. Target is $\ge 1.0\%$ for strong cash-flow markets.
                    </p>
                  </div>

                  {/* 50% Rule Benchmark */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <PieChart className="size-3.5 text-blue-600" />
                        The 50% Rule
                      </h4>
                      <span className="text-2xs font-bold text-slate-500">
                        {output.operatingExpenseRatio.toFixed(1)}% Actual
                      </span>
                    </div>
                    <div className="text-xl font-black text-slate-900 font-mono">
                      {currencyFmt(output.ruleOf50EstimatedExpenses)}
                    </div>
                    <p className="text-2xs text-slate-500 leading-relaxed">
                      50% benchmark OpEx is {currencyFmt(output.ruleOf50EstimatedExpenses)}. Your itemized OpEx is{' '}
                      <span className={output.ruleOf50Variance > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                        {output.ruleOf50Variance > 0
                          ? `+$${Math.abs(Math.round(output.ruleOf50Variance)).toLocaleString()} higher`
                          : `-$${Math.abs(Math.round(output.ruleOf50Variance)).toLocaleString()} lower`}
                      </span>.
                    </p>
                  </div>
                </div>

                {/* Additional Deal Metrics */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
                    Lender & Investor Guardrails
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="text-slate-500 text-2xs">DSCR (Coverage)</div>
                      <div className="font-bold text-slate-800 font-mono">
                        {output.dscr ? `${output.dscr.toFixed(2)}x` : 'N/A (All-Cash)'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-2xs">Break-Even Occupancy</div>
                      <div className="font-bold text-slate-800 font-mono">
                        {output.breakEvenOccupancyRate.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-2xs">Gross Rent Multiplier</div>
                      <div className="font-bold text-slate-800 font-mono">
                        {output.grossRentMultiplier.toFixed(2)}x
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Expense Audit Breakdown */}
            {activeTab === 'cashflow' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 flex justify-between items-center">
                    <span>Operating Expense Itemization</span>
                    <span className="text-2xs text-slate-500">
                      Total: {currencyFmt(output.totalOperatingExpensesAnnual)} / yr
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {output.expenses.map((item, idx) => (
                      <div key={idx} className="p-3.5 flex justify-between items-center hover:bg-slate-50/50">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-800">{item.name}</div>
                          <div className="text-2xs text-slate-400">
                            {currencyFmt(item.monthly)} / month
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-slate-900">
                            {currencyFmt(item.annual)}
                          </div>
                          <div className="text-2xs text-slate-500">
                            {item.percentOfEGI.toFixed(1)}% of revenue
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                  <Info className="size-4.5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold">CapEx Reserves vs. Maintenance</div>
                    <p className="text-blue-800 leading-relaxed text-2xs">
                      Maintenance covers routine fixes (clogged drains, paint touchups). Capital Expenditures (CapEx) are long-term reserves for replacing big-ticket assets like the roof, HVAC compressors, water heaters, and structural elements.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: 10-Year Projections */}
            {activeTab === 'projections' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2.5 px-3">Year</th>
                        <th className="py-2.5 px-3">Property Value</th>
                        <th className="py-2.5 px-3">Loan Balance</th>
                        <th className="py-2.5 px-3">Equity</th>
                        <th className="py-2.5 px-3">Net Cash Flow</th>
                        <th className="py-2.5 px-3">Cumulative CF</th>
                        <th className="py-2.5 px-3">Total Wealth</th>
                        <th className="py-2.5 px-3">CoC (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {output.projections.map((p) => (
                        <tr key={p.year} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-bold text-slate-900">{p.year}</td>
                          <td className="py-2.5 px-3 text-slate-700">{currencyFmt(p.propertyValue)}</td>
                          <td className="py-2.5 px-3 text-slate-500">{currencyFmt(p.loanBalance)}</td>
                          <td className="py-2.5 px-3 font-bold text-indigo-600">{currencyFmt(p.equity)}</td>
                          <td className={`py-2.5 px-3 font-bold ${p.netCashFlowAnnual >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {currencyFmt(p.netCashFlowAnnual)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">{currencyFmt(p.cumulativeCashFlow)}</td>
                          <td className="py-2.5 px-3 font-black text-slate-900">{currencyFmt(p.totalReturn)}</td>
                          <td className="py-2.5 px-3 text-blue-600">{p.cashOnCash}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-2xs text-slate-500">
                  * Assumes 3.0% annual rent growth, 2.5% expense inflation, and 3.5% property appreciation.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Real Estate Methodology & Institutional Standards */}
        <MethodologyDisclosure
          title="Institutional Rental Underwriting Methodology"
          points={[
            'Net Operating Income (NOI) Separation: In commercial and institutional real estate underwriting, NOI measures property performance before financing. It strictly excludes mortgage principal, interest, and income taxes so that property yield is isolated from debt leverage.',
            'Capitalization Rate (Cap Rate): Calculated as NOI / Purchase Price * 100%. Represents the unleveraged rate of return an investor would earn if purchasing 100% all-cash.',
            'Cash-on-Cash Return: Measures the pre-tax dividend yield on the actual liquid out-of-pocket cash invested (Down Payment + Closing Costs + Upfront Rehab Budget).',
            'Expense Ratio & Reserve Integrity: Robust underwriting requires separating ongoing routine maintenance from long-term capital replacement reserves (CapEx), ensuring properties remain solvent during roof or HVAC replacements.'
          ]}
        />

        {/* Ad Placement */}
        <div className="pt-4">
          <AdSlot unit="calculatorResult" />
        </div>

        {/* Comprehensive FAQ Section */}
        <CalculatorFaqSection path="/cap-rate-calculator" />

        {/* Related Calculators Cross-Promotion */}
        <RelatedCalculators currentSlug="cap-rate-calculator" category="real-estate" />
      </div>
    </div>
  );
}

export { CapRateCalculator };

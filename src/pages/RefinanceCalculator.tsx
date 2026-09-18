import { useState, useMemo, useEffect } from 'react';
import {
  DollarSign,
  Calendar,
  ShieldCheck,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Info,
  Sparkles,
  Percent,
  Home,
  RefreshCw,
  Printer,
  Bookmark,
  PiggyBank,
  HelpCircle,
  Building2
} from 'lucide-react';
import {
  type RefinanceInputs,
  calculateRefinance,
  generateRefinanceSchedule,
  getAnnualRefinanceSchedule,
  getRefinanceChartData,
  exportRefinanceToCsv
} from '../lib/refinanceCalculator';
import { updatePageMeta, navigateTo } from '../lib/router';
import { CALCULATOR_META } from '../data/routeMeta';
import { ShareCalculationButton } from '../components/ShareCalculationButton';
import { MethodologyDisclosure } from '../components/MethodologyDisclosure';
import { AdSlot } from '../components/AdSlot';
import { CalculatorFaqSection } from '../components/CalculatorFaqSection';
import { getCalculatorFaqs } from '../data/calculatorFaqs';
import { RefinanceBalanceChart } from '../components/RefinanceBalanceChart';
import { PrintableRefinanceReport } from '../components/PrintableRefinanceReport';
import { PmmsRateTicker } from '../components/PmmsRateTicker';
import { SavedScenariosModal } from '../components/SavedScenariosModal';
import { RelatedCalculators } from '../components/RelatedCalculators';
import { CurrencyInput } from '../components/CurrencyInput';
import { NumericInput } from '../components/NumericInput';
import { MonthYearPicker } from '../components/MonthYearPicker';
import { CalculatorPresetsBar, PrintReportButton, PageHeader } from '../components/calculator-kit';
import { SuiteSubNav } from '../components/SuiteSubNav';
import { LenderReadyDossierModal } from '../components/LenderReadyDossierModal';
import { ProBrandingModal } from '../components/ProBrandingModal';
import { InfoTooltip } from '../components/InfoTooltip';

// Sourced from the shared registry: see the note in MortgageCalculator.tsx.
const refinanceFaqs = getCalculatorFaqs('/refinance-calculator');

const refinanceSchemas = [
  {
    '@type': 'WebApplication',
    name: 'Mortgage Refinance Break-Even Calculator',
    url: 'https://tableview.dev/refinance-calculator',
    description: 'Free in-browser mortgage refinance calculator. Compare old vs new monthly payments, calculate break-even months, equity trajectory, and discount points with Excel export. A private, no-lead-form alternative to Bankrate and SmartAsset.',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  },
  {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tableview.dev/' },
      { '@type': 'ListItem', position: 2, name: 'Financial Calculators', item: 'https://tableview.dev/finance-calculator' },
      { '@type': 'ListItem', position: 3, name: 'Mortgage Refinance Calculator', item: 'https://tableview.dev/refinance-calculator' }
    ]
  },
  {
    '@type': 'FAQPage',
    mainEntity: refinanceFaqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  }
];

interface RefinanceCalculatorProps {
  onTrySample?: () => void;
}

export const RefinanceCalculator = ({ onTrySample: _onTrySample }: RefinanceCalculatorProps) => {
  const [showScenariosModal, setShowScenariosModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [showBrandingModal, setShowBrandingModal] = useState(false);

  useEffect(() => {
    updatePageMeta(
      CALCULATOR_META['/refinance-calculator'].title,
      CALCULATOR_META['/refinance-calculator'].description,
      CALCULATOR_META['/refinance-calculator'].canonical,
      refinanceSchemas
    );
  }, []);

  const getNumQuery = (name: string, fallback: number): number => {
    try {
      const p = new URLSearchParams(window.location.search).get(name);
      if (p !== null && !isNaN(Number(p)) && Number(p) >= 0) return Number(p);
    } catch {}
    return fallback;
  };

  // --- Form State initialized with URL query params support ---
  const [homePrice, setHomePrice] = useState<number>(() => getNumQuery('homePrice', 400000));
  const [downPayment, setDownPayment] = useState<number>(() => getNumQuery('downPayment', 80000));
  const [originalLoanAmount, setOriginalLoanAmount] = useState<number>(() => getNumQuery('origLoan', 320000));
  const [originalTermYears, setOriginalTermYears] = useState<number>(() => getNumQuery('origTerm', 30));
  const [currentInterestRate, setCurrentInterestRate] = useState<number>(() => getNumQuery('curRate', 7.0));
  const [monthsAlreadyPaid, setMonthsAlreadyPaid] = useState<number>(() => getNumQuery('monthsPaid', 60));

  // Refinanced Loan Details
  const [newTermYears, setNewTermYears] = useState<number>(() => getNumQuery('newTerm', 15));
  const [newInterestRate, setNewInterestRate] = useState<number>(() => getNumQuery('newRate', 5.75));
  const [yearsBeforeSell, setYearsBeforeSell] = useState<number>(7);
  const [cashOutAmount, setCashOutAmount] = useState<number>(() => getNumQuery('cashOut', 0));

  // Fees & Points
  const [discountPoints, setDiscountPoints] = useState<number>(() => getNumQuery('points', 1.0));
  const [originationPercent, setOriginationPercent] = useState<number>(0.0);
  const [otherClosingCosts, setOtherClosingCosts] = useState<number>(() => getNumQuery('otherCosts', 1200));

  // Taxes
  const [federalTaxRate, setFederalTaxRate] = useState<number>(25.0);
  const [stateTaxRate, setStateTaxRate] = useState<number>(5.0);

  // Refinance Options
  const [rollCostsIntoLoan, setRollCostsIntoLoan] = useState<boolean>(false);

  // View presentation state
  const [viewMode, setViewMode] = useState<'analysis' | 'plainEnglish'>('analysis');
  const [scheduleView, setScheduleView] = useState<'annual' | 'monthly'>('annual');
  const [monthlyPage, setMonthlyPage] = useState<number>(1);
  const [showOriginationDatePicker, setShowOriginationDatePicker] = useState<boolean>(false);
  const [originationDate, setOriginationDate] = useState(() => {
    const d = new Date();
    return { month: d.getMonth() + 1, year: d.getFullYear() - 3 };
  });

  const handleOriginationDateChange = (date: { month: number; year: number }) => {
    setOriginationDate(date);
    const now = new Date();
    const diffMonths = (now.getFullYear() - date.year) * 12 + ((now.getMonth() + 1) - date.month);
    if (diffMonths >= 0) {
      setMonthsAlreadyPaid(Math.min(originalTermYears * 12, diffMonths));
    }
  };

  // Auto-sync originalLoanAmount when homePrice or downPayment change
  const handleHomePriceChange = (val: number) => {
    setHomePrice(val);
    setOriginalLoanAmount(Math.max(0, val - downPayment));
  };

  const handleDownPaymentChange = (val: number) => {
    setDownPayment(val);
    setOriginalLoanAmount(Math.max(0, homePrice - val));
  };

  // Presets
  const applyPreset = (type: 'shorten15' | 'rateDrop' | 'cashOut' | 'zeroCost') => {
    if (type === 'shorten15') {
      setOriginalTermYears(30);
      setCurrentInterestRate(7.0);
      setMonthsAlreadyPaid(60);
      setNewTermYears(15);
      setNewInterestRate(5.75);
      setDiscountPoints(1.0);
      setOtherClosingCosts(1200);
      setCashOutAmount(0);
      setYearsBeforeSell(7);
      setRollCostsIntoLoan(false);
    } else if (type === 'rateDrop') {
      setOriginalTermYears(30);
      setCurrentInterestRate(7.25);
      setMonthsAlreadyPaid(36);
      setNewTermYears(30);
      setNewInterestRate(5.875);
      setDiscountPoints(0.5);
      setOtherClosingCosts(1500);
      setCashOutAmount(0);
      setYearsBeforeSell(7);
      setRollCostsIntoLoan(false);
    } else if (type === 'cashOut') {
      setOriginalTermYears(30);
      setCurrentInterestRate(6.5);
      setMonthsAlreadyPaid(72);
      setNewTermYears(30);
      setNewInterestRate(6.25);
      setDiscountPoints(0.0);
      setOtherClosingCosts(2000);
      setCashOutAmount(40000);
      setYearsBeforeSell(10);
      setRollCostsIntoLoan(false);
    } else if (type === 'zeroCost') {
      setOriginalTermYears(30);
      setCurrentInterestRate(7.125);
      setMonthsAlreadyPaid(24);
      setNewTermYears(30);
      setNewInterestRate(6.375);
      setDiscountPoints(0.0);
      setOriginationPercent(0.0);
      setOtherClosingCosts(2500);
      setCashOutAmount(0);
      setYearsBeforeSell(5);
      setRollCostsIntoLoan(true);
    }
  };

  const [activePreset, setActivePreset] = useState<string | null>(null);

  const REFINANCE_PRESETS = [
    {
      id: 'rateDrop',
      label: 'Lower Rate 30-Yr',
      badge: 'Cash Savings',
      apply: () => applyPreset('rateDrop')
    },
    {
      id: 'shorten15',
      label: 'Shorten 30-Yr to 15-Yr',
      badge: 'Fast Payoff',
      apply: () => applyPreset('shorten15')
    },
    {
      id: 'cashOut',
      label: 'Cash-Out Refi ($40k)',
      badge: 'Equity Access',
      apply: () => applyPreset('cashOut')
    },
    {
      id: 'zeroCost',
      label: 'Zero-Cost Rollover',
      badge: '$0 Out of Pocket',
      apply: () => applyPreset('zeroCost')
    }
  ];

  // Calculations
  const inputs: RefinanceInputs = useMemo(
    () => ({
      homePrice,
      downPayment,
      originalLoanAmount,
      originalTermYears,
      currentInterestRate,
      monthsAlreadyPaid,
      newTermYears,
      newInterestRate,
      yearsBeforeSell,
      discountPoints,
      originationPercent,
      otherClosingCosts,
      cashOutAmount,
      federalTaxRate,
      stateTaxRate,
      rollCostsIntoLoan
    }),
    [
      homePrice,
      downPayment,
      originalLoanAmount,
      originalTermYears,
      currentInterestRate,
      monthsAlreadyPaid,
      newTermYears,
      newInterestRate,
      yearsBeforeSell,
      discountPoints,
      originationPercent,
      otherClosingCosts,
      cashOutAmount,
      federalTaxRate,
      stateTaxRate,
      rollCostsIntoLoan
    ]
  );

  const summary = useMemo(() => calculateRefinance(inputs), [inputs]);
  const monthlySchedule = useMemo(() => generateRefinanceSchedule(inputs, summary), [inputs, summary]);
  const annualSchedule = useMemo(() => getAnnualRefinanceSchedule(monthlySchedule), [monthlySchedule]);
  const chartData = useMemo(() => getRefinanceChartData(monthlySchedule), [monthlySchedule]);

  // Format currency
  const fmt = (val: number, includeSign = false) => {
    const isNeg = val < 0;
    const absVal = Math.abs(val);
    const str = absVal.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    if (includeSign) {
      return isNeg ? `-${str}` : `+${str}`;
    }
    return isNeg ? `-${str}` : str;
  };

  // Schedule Pagination
  const pageSize = 24;
  const totalPages = Math.ceil(monthlySchedule.length / pageSize);
  const pagedMonthly = useMemo(() => {
    const start = (monthlyPage - 1) * pageSize;
    return monthlySchedule.slice(start, start + pageSize);
  }, [monthlySchedule, monthlyPage]);

  // Download Handlers
  const handleDownloadCsv = () => {
    const csvContent = exportRefinanceToCsv(summary, annualSchedule);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tableview-refinance-comparison-${summary.horizonYears}yr.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadExcel = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['TableView.dev Mortgage Refinance Comparison Report'],
      ['Metric', 'Current Loan', 'Refinanced Loan', 'Difference / Savings'],
      ['Monthly Payment', summary.currentMonthlyPayment, summary.newMonthlyPayment, summary.monthlyPaymentSavings],
      ['Remaining Balance Today', summary.currentBalance, summary.newLoanAmount, summary.currentBalance - summary.newLoanAmount],
      ['Total Closing Costs', 0, summary.totalClosingCosts, -summary.totalClosingCosts],
      ['Break-Even Horizon (Months)', '-', summary.breakEvenMonths ?? 'N/A (Higher Payment)', '-'],
      [`Total Payments (${summary.horizonYears} Yrs)`, summary.totalPaymentsOldHorizon, summary.totalPaymentsNewHorizon, summary.paymentSavingsHorizon],
      [`Total Interest (${summary.horizonYears} Yrs)`, summary.totalInterestOldHorizon, summary.totalInterestNewHorizon, summary.interestSavingsHorizon],
      [`Tax Deduction Savings (${summary.horizonYears} Yrs)`, summary.taxSavingsOld, summary.taxSavingsNew, -summary.taxShiftLoss],
      [`Remaining Balance in ${summary.horizonYears} Yrs`, summary.oldHorizonBalance, summary.newHorizonBalance, summary.balanceDifferenceAtHorizon],
      [`Total Net Refinancing Benefit (${summary.horizonYears} Yrs)`, '', '', summary.totalNetBenefit],
      ['Lifetime Interest', summary.lifetimeInterestOldRemaining, summary.lifetimeInterestNew, summary.lifetimeInterestSaved]
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // Annual Schedule Sheet
    const annualRows = annualSchedule.map(r => ({
      Year: r.year,
      'Old Annual Payment': Number(r.oldAnnualPayment.toFixed(2)),
      'Old Principal': Number(r.oldAnnualPrincipal.toFixed(2)),
      'Old Interest': Number(r.oldAnnualInterest.toFixed(2)),
      'Old Ending Balance': Number(r.oldEndingBalance.toFixed(2)),
      'New Annual Payment': Number(r.newAnnualPayment.toFixed(2)),
      'New Principal': Number(r.newAnnualPrincipal.toFixed(2)),
      'New Interest': Number(r.newAnnualInterest.toFixed(2)),
      'New Ending Balance': Number(r.newEndingBalance.toFixed(2)),
      'Annual Savings': Number(r.annualSavings.toFixed(2)),
      'Ending Equity Diff': Number(r.endingEquityDiff.toFixed(2))
    }));
    const wsAnnual = XLSX.utils.json_to_sheet(annualRows);
    XLSX.utils.book_append_sheet(wb, wsAnnual, 'Annual Comparison');

    XLSX.writeFile(wb, `tableview-refinance-analysis-${summary.horizonYears}yr.xlsx`);
  };

  const handleExportPdf = () => {
    const prevTitle = document.title;
    const viewSuffix = scheduleView === 'monthly' ? 'monthly_schedule' : 'annual_summary';
    document.title = `refinance_statement_${Math.round(summary.newLoanAmount)}_${viewSuffix}`;
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 1000);
  };

  return (
    <>
      {/* data-sentry-mask: balances, rates and closing costs are the user's own finances. */}
      <div data-sentry-mask="true" className="print:hidden w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
      {/* Canonical Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Calculators', path: '/finance-calculator' },
          { label: 'Refinance Break-Even' }
        ]}
        badge={{
          icon: ShieldCheck,
          label: '100% In-Browser Private · Zero Cloud Egress',
          tone: 'emerald'
        }}
        title="Home Mortgage Refinance Calculator"
        description="Unsure if you should refinance? Calculate whether refinancing makes financial sense based on interest rate reductions, discount points, upfront closing costs, income tax shift, and multi-year homeowner equity growth."
        actions={
          <>
            <button
              type="button"
              onClick={() => navigateTo('/mortgage-calculator')}
              className="h-9 px-3.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs active:scale-95 shrink-0"
              title="Switch to Purchase Mortgage Calculator"
            >
              <Home className="size-3.5 text-indigo-500" />
              <span>Purchase Mortgage</span>
            </button>
            <ShareCalculationButton
              params={{
                homePrice,
                downPayment,
                origLoan: originalLoanAmount,
                curRate: currentInterestRate,
                monthsPaid: monthsAlreadyPaid,
                newRate: newInterestRate,
                newTerm: newTermYears,
                otherCosts: otherClosingCosts,
                points: discountPoints,
                cashOut: cashOutAmount
              }}
              title="Share Deal"
            />
            <button
              type="button"
              onClick={() => setShowScenariosModal(true)}
              className="h-9 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5 shrink-0"
              title="Save or compare refinance deal scenarios locally in your browser"
            >
              <Bookmark className="size-3.5 text-indigo-500" />
              <span>Saved Scenarios</span>
            </button>
            <button
              type="button"
              onClick={() => setShowDossierModal(true)}
              className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs hover:shadow-amber-500/20 transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5 shrink-0"
              title="Download official refinance evaluation PDF dossier & Excel model"
            >
              <Sparkles className="size-3.5 text-amber-100" />
              <span>Lender Dossier</span>
            </button>
            <button
              type="button"
              onClick={() => setShowBrandingModal(true)}
              className="h-9 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5 shrink-0"
              title="Customize your personal or brokerage white-label branding on reports"
            >
              <Building2 className="size-3.5 text-slate-500" />
              <span className="hidden sm:inline">Branding</span>
            </button>
            <PrintReportButton onPrint={handleExportPdf} label="Print / PDF" />
          </>
        }
        presets={
          <CalculatorPresetsBar
            presets={REFINANCE_PRESETS}
            activePresetId={activePreset}
            onSelectPreset={(preset) => {
              setActivePreset(preset.id);
              preset.apply?.();
            }}
          />
        }
      />

      <SuiteSubNav suite="mortgage" />

      {/* Main Grid: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Box 1: Original Loan Details */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 border-t-4 border-t-indigo-600 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                <Home className="size-4 text-indigo-600" />
                <span>1. Original Loan Details</span>
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">Current Mortgage</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Original Home Price
                </label>
                <CurrencyInput
                  value={homePrice}
                  onChange={handleHomePriceChange}
                  className="py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Original Down Payment
                </label>
                <CurrencyInput
                  value={downPayment}
                  onChange={handleDownPaymentChange}
                  className="py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Original Loan Amount
                </label>
                <CurrencyInput
                  value={originalLoanAmount}
                  onChange={setOriginalLoanAmount}
                  className="py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Original Loan Term
                </label>
                <select
                  value={originalTermYears}
                  onChange={(e) => setOriginalTermYears(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value={10}>10 Years</option>
                  <option value={15}>15 Years</option>
                  <option value={20}>20 Years</option>
                  <option value={30}>30 Years</option>
                </select>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Current Interest Rate
                  </label>
                  <InfoTooltip
                    title="Current Mortgage Rate"
                    content="Your existing loan's note rate. Compare against today's Freddie Mac PMMS benchmark to evaluate rate savings."
                  />
                </div>
                <NumericInput
                  value={currentInterestRate}
                  onChange={setCurrentInterestRate}
                  suffix="%"
                  step={0.05}
                  min={0}
                  className="py-2 text-xs font-mono focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Months Already Paid
                    </label>
                    <InfoTooltip
                      title="Amortization Seasoning"
                      content="The number of monthly payments already completed. Affects your remaining principal balance and determines how much equity you have already built."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOriginationDatePicker(!showOriginationDatePicker)}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Calendar className="size-3" />
                    <span>{showOriginationDatePicker ? 'Enter Months' : 'Pick Date'}</span>
                  </button>
                </div>

                {showOriginationDatePicker ? (
                  <div className="p-3 bg-slate-50 border border-indigo-200 rounded-xl space-y-2 mb-1.5">
                    <span className="text-[11px] text-slate-600 font-medium block">
                      When did your loan begin?
                    </span>
                    <MonthYearPicker
                      month={originationDate.month}
                      year={originationDate.year}
                      onChange={handleOriginationDateChange}
                      showPresets={false}
                    />
                    <span className="text-[11px] text-indigo-700 font-mono font-semibold block">
                      Elapsed: {monthsAlreadyPaid} months ({(monthsAlreadyPaid / 12).toFixed(1)} yrs)
                    </span>
                  </div>
                ) : (
                  <NumericInput
                    value={monthsAlreadyPaid}
                    onChange={setMonthsAlreadyPaid}
                    suffix="Mo"
                    step={1}
                    min={0}
                    max={originalTermYears * 12}
                    className="py-2 text-xs font-mono focus:border-indigo-500"
                  />
                )}

                {/* Quick Presets */}
                <div className="flex items-center gap-1 pt-1 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-medium">Quick:</span>
                  {[
                    { label: '1 Yr', mo: 12 },
                    { label: '2 Yrs', mo: 24 },
                    { label: '3 Yrs', mo: 36 },
                    { label: '5 Yrs', mo: 60 },
                    { label: '7 Yrs', mo: 84 },
                    { label: '10 Yrs', mo: 120 }
                  ].map(p => (
                    <button
                      key={p.mo}
                      type="button"
                      onClick={() => setMonthsAlreadyPaid(p.mo)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                        monthsAlreadyPaid === p.mo
                          ? 'bg-slate-900 text-white font-bold shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Loan Real-time Metrics Pill */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">Current Monthly P&I</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {fmt(summary.currentMonthlyPayment)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Balance at Refinance</span>
                <span className="font-mono font-bold text-indigo-600 text-sm">
                  {fmt(summary.currentBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* Box 2: Refinanced Loan Parameters */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 border-t-4 border-t-emerald-600 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                <RefreshCw className="size-4 text-emerald-600" />
                <span>2. Refinanced Loan</span>
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">New Terms</span>
            </div>

            {/* Freddie Mac PMMS Benchmark Rate Ticker */}
            <PmmsRateTicker
              currentRate={newInterestRate}
              onSelectRate={(rate, term) => {
                setNewInterestRate(rate);
                if (term) setNewTermYears(term);
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Loan Term
                </label>
                <select
                  value={newTermYears}
                  onChange={(e) => setNewTermYears(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value={10}>10 Years</option>
                  <option value={15}>15 Years</option>
                  <option value={20}>20 Years</option>
                  <option value={30}>30 Years</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Interest Rate
                </label>
                <NumericInput
                  value={newInterestRate}
                  onChange={setNewInterestRate}
                  suffix="%"
                  step={0.05}
                  min={0}
                  className="py-2 text-xs font-mono focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Years Before Sell / Horizon
                </label>
                <NumericInput
                  value={yearsBeforeSell}
                  onChange={setYearsBeforeSell}
                  suffix="Yrs"
                  step={1}
                  min={1}
                  max={30}
                  className="py-2 text-xs font-mono focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Cash-Out Amount (Optional)
                  </label>
                  <InfoTooltip
                    title="Cash-Out Refinance Limit (80% LTV)"
                    content="Borrowing extra cash against your home equity. Fannie Mae & Freddie Mac cap conventional cash-out refinances at 80% Loan-to-Value to prevent default risk."
                  />
                </div>
                <CurrencyInput
                  value={cashOutAmount}
                  onChange={setCashOutAmount}
                  className="py-2 text-xs font-mono"
                />
                {cashOutAmount > 0 && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>
                      Resulting LTV:{' '}
                      <strong className={`font-mono ${summary.isExceedingCashOutLtv ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                        {summary.cashOutLtv}%
                      </strong>{' '}
                      (Conventional Max: 80%)
                    </span>
                    {summary.maxAllowedCashOut > 0 && summary.isExceedingCashOutLtv && (
                      <button
                        type="button"
                        onClick={() => setCashOutAmount(summary.maxAllowedCashOut)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer underline text-[10px]"
                      >
                        Cap to {fmt(summary.maxAllowedCashOut)}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 80% LTV Guardrail Alert for Cash-Out Refinance */}
            {summary.isExceedingCashOutLtv && (
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-1.5 shadow-2xs">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <AlertTriangle className="size-4 text-amber-600 shrink-0" />
                  <span>Conventional 80.0% Cash-Out LTV Limit Exceeded ({summary.cashOutLtv}% &gt; 80.0%)</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Fannie Mae and Freddie Mac cap conventional cash-out refinances at an <strong>80.0% Loan-to-Value (LTV)</strong> ceiling. Your new proposed loan balance is ${Math.round(summary.newLoanAmount).toLocaleString()}. To qualify conventionally, limit cash-out to <strong>{fmt(summary.maxAllowedCashOut)}</strong>, or consider an FHA cash-out refinance (up to 85% LTV with upfront + monthly MIP).
                </p>
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => setCashOutAmount(summary.maxAllowedCashOut)}
                    className="px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-[11px] cursor-pointer shadow-2xs transition-colors"
                  >
                    Set to Max 80% Allowed ({fmt(summary.maxAllowedCashOut)})
                  </button>
                </div>
              </div>
            )}

            {/* New Loan Output Pill */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">New Monthly Payment</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">
                  {fmt(summary.newMonthlyPayment)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">New Loan Amount</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {fmt(summary.newLoanAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Box 3: Fees, Points & Income Taxes */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 border-t-4 border-t-amber-500 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                <DollarSign className="size-4 text-amber-500" />
                <span>3. Closing Fees & Tax Rates</span>
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-semibold">Costs & Deductions</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Discount Points
                  </label>
                  <InfoTooltip
                    title="Discount Points"
                    content="1 point = 1% of new loan amount. Points paid on a refinance must be amortized over the life of the loan for tax deductions."
                  />
                </div>
                <NumericInput
                  value={discountPoints}
                  onChange={setDiscountPoints}
                  suffix="%"
                  step={0.125}
                  min={0}
                  className="py-2 text-xs font-mono focus:border-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Origination Fee
                  </label>
                  <InfoTooltip
                    title="Origination Fee"
                    content="Lender underwriting and processing charge, typically 0.5% to 1.0% of the new loan amount."
                  />
                </div>
                <NumericInput
                  value={originationPercent}
                  onChange={setOriginationPercent}
                  suffix="%"
                  step={0.1}
                  min={0}
                  className="py-2 text-xs font-mono focus:border-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Other Closing Costs
                  </label>
                  <InfoTooltip
                    title="Third-Party Settlement Fees"
                    content="Fixed closing expenses including title search, lender's title insurance, appraisal, escrow fee, recording fee, and credit check."
                  />
                </div>
                <CurrencyInput
                  value={otherClosingCosts}
                  onChange={setOtherClosingCosts}
                  className="py-2 text-xs font-mono"
                />
              </div>

              <div className="sm:col-span-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={rollCostsIntoLoan}
                    onChange={(e) => setRollCostsIntoLoan(e.target.checked)}
                    className="size-4 rounded accent-indigo-600 border-slate-300"
                  />
                  <span>Roll closing costs into new loan balance ($0 out-of-pocket cash)</span>
                </label>
              </div>
            </div>

            {/* Income Tax Row */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">Itemized Tax Deduction Rates</span>
                <button
                  type="button"
                  onClick={() => {
                    setFederalTaxRate(0);
                    setStateTaxRate(0);
                  }}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                >
                  Set to 0% (Standard Deduction)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-medium">Federal Income Tax</label>
                  <NumericInput
                    value={federalTaxRate}
                    onChange={setFederalTaxRate}
                    suffix="%"
                    step={1}
                    min={0}
                    className="py-1.5 text-xs font-mono focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-medium">State Income Tax</label>
                  <NumericInput
                    value={stateTaxRate}
                    onChange={setStateTaxRate}
                    suffix="%"
                    step={0.5}
                    min={0}
                    className="py-1.5 text-xs font-mono focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
                <Info className="size-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  Under TCJA standard deductions ($15k single / $30k married), if you take the standard deduction rather than itemizing, set tax rates to 0% to omit the tax shift.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Executive Results & Detailed Breakdowns (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Executive Verdict Card (High-Contrast Hero) */}
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900 text-white p-6 sm:p-8 shadow-lg overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 size-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative space-y-5 z-10">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">
                    Refinancing Verdict
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-indigo-300 border border-slate-700">
                    {summary.horizonYears}-Year Horizon
                  </span>
                </div>

                {/* View Switcher Pills */}
                <div className="flex items-center p-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs">
                  <button
                    onClick={() => setViewMode('analysis')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      viewMode === 'analysis'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Financial Analysis
                  </button>
                  <button
                    onClick={() => setViewMode('plainEnglish')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      viewMode === 'plainEnglish'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Plain English
                  </button>
                </div>
              </div>

              {/* 30-Year Reset Clock Warning Alert */}
              {summary.clockResetWarning && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
                  <AlertTriangle className="size-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-300 text-sm">30-Year Loan Term Extension Risk</h4>
                    <p className="mt-1 leading-relaxed text-amber-200/90">{summary.clockResetWarning}</p>
                  </div>
                </div>
              )}

              {/* Main Net Benefit Number */}
              <div>
                <span className="text-xs sm:text-sm text-slate-400 block mb-1">
                  Total Refinancing Benefit Over Next {summary.horizonYears} Years
                </span>
                <div className="flex items-baseline gap-3">
                  <span
                    className={`text-3xl sm:text-5xl font-black tracking-tight ${
                      summary.totalNetBenefit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {fmt(summary.totalNetBenefit)}
                  </span>
                  <span className="text-xs text-slate-400">
                    (Equity Gain + Cash Savings - Closing Costs)
                  </span>
                </div>
              </div>

              {/* Key Indicators 4-Col Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Monthly Payment</span>
                  <span
                    className={`text-sm sm:text-base font-bold font-mono ${
                      summary.monthlyPaymentSavings >= 0 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {summary.monthlyPaymentSavings >= 0 ? 'Save ' : 'Add '}
                    {fmt(Math.abs(summary.monthlyPaymentSavings))}/mo
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Closing Costs</span>
                  <span className="text-sm sm:text-base font-bold font-mono text-white">
                    {fmt(summary.totalClosingCosts)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Break-Even</span>
                  <span className="text-sm sm:text-base font-bold font-mono text-indigo-300">
                    {summary.breakEvenMonths !== null
                      ? `${summary.breakEvenMonths} Months`
                      : summary.equityBreakEvenMonths !== null
                      ? `${summary.equityBreakEvenMonths} Mo (Equity)`
                      : 'N/A'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Lifetime Savings</span>
                  <span className="text-sm sm:text-base font-bold font-mono text-emerald-400">
                    {fmt(summary.lifetimeInterestSaved)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Conditional View: Plain English Mode vs Financial Analysis Mode */}
          {viewMode === 'plainEnglish' ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="size-5 text-indigo-600" />
                  <span>Your Results in Plain English</span>
                </h3>
                <button
                  onClick={() => setViewMode('analysis')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 underline cursor-pointer font-medium"
                >
                  Switch to Financial Analysis
                </button>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <p>
                  Deciding whether or not you should refinance your home mortgage depends upon several factors. It also depends upon whether you are looking to simply reduce your monthly payment or if you are hoping to save maximum money in the long run.
                </p>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="font-semibold text-slate-900">Here is what happens in your specific scenario:</div>
                  <ul className="space-y-2.5 list-disc pl-5 text-slate-700">
                    <li>
                      <strong>Monthly Payment:</strong> You are currently paying{' '}
                      <span className="font-mono text-slate-900 font-bold">{fmt(summary.currentMonthlyPayment)}</span>/mo.
                      When you refinance, your new monthly payment will be{' '}
                      <span className="font-mono text-slate-900 font-bold">{fmt(summary.newMonthlyPayment)}</span>/mo (
                      {summary.monthlyPaymentSavings >= 0 ? (
                        <span className="text-emerald-700 font-semibold">
                          a monthly savings of {fmt(summary.monthlyPaymentSavings)}
                        </span>
                      ) : (
                        <span className="text-amber-800 font-semibold">
                          an increase of {fmt(Math.abs(summary.monthlyPaymentSavings))} per month to build equity faster
                        </span>
                      )}
                      ).
                    </li>
                    <li>
                      <strong>Upfront Closing Expenses:</strong> Closing your refinancing process will cost{' '}
                      <span className="font-mono text-slate-900 font-bold">{fmt(summary.totalClosingCosts)}</span>{' '}
                      ({fmt(summary.discountPointsCost)} in discount points + {fmt(summary.originationFeeCost)} in origination + {fmt(summary.otherClosingCosts)} in other fees).
                    </li>
                    <li>
                      <strong>Homeowner Equity Growth:</strong> In {summary.horizonYears} years, your remaining loan balance will be{' '}
                      <span className="font-mono text-emerald-700 font-bold">{fmt(summary.balanceDifferenceAtHorizon)} less</span>{' '}
                      because your payments aggressively reduce your mortgage principal. Lesser principal balance means more home equity in your pocket!
                    </li>
                    {summary.taxShiftLoss > 0 && (
                      <li>
                        <strong>Tax Deduction Shift:</strong> Because you will pay less mortgage interest, you will claim{' '}
                        <span className="font-mono text-amber-800 font-bold">{fmt(summary.taxShiftLoss)} less</span> in tax deductions over the next {summary.horizonYears} years (if you itemize).
                      </li>
                    )}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <div className="font-bold text-sm text-emerald-950 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span>The Bottom Line:</span>
                  </div>
                  <p className="text-xs leading-relaxed text-emerald-800">
                    Summing up the additional home equity ({fmt(summary.balanceDifferenceAtHorizon)}), subtracting the tax shift (-{fmt(summary.taxShiftLoss)}), factoring monthly payment differences ({fmt(summary.paymentSavingsHorizon)}), and deducting total upfront closing costs (-{fmt(summary.totalClosingCosts)}), your{' '}
                    <strong>net refinancing benefit over the next {summary.horizonYears} years will be {fmt(summary.totalNetBenefit)}</strong>.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Detailed Financial Analysis Mode (5 Tables matching mortgagecalculator.org) */
            <div className="space-y-6">
              {/* Table 1: Balance & Closing */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="size-3.5 text-indigo-600" />
                    <span>1. Balance & Closing Costs</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2">Item</th>
                        <th className="py-2 text-right">Before Refinancing</th>
                        <th className="py-2 text-right">After Refinancing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      <tr>
                        <td className="py-2 text-slate-700 font-sans">Balance at Refinance:</td>
                        <td className="py-2 text-right text-slate-700">{fmt(summary.currentBalance)}</td>
                        <td className="py-2 text-right text-slate-700">{fmt(summary.newLoanAmount)}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-700 font-sans">Cost of {discountPoints.toFixed(3)} Discount Points:</td>
                        <td className="py-2 text-right text-slate-400">-</td>
                        <td className="py-2 text-right text-slate-700">{fmt(summary.discountPointsCost)}</td>
                      </tr>
                      {summary.originationFeeCost > 0 && (
                        <tr>
                          <td className="py-2 text-slate-700 font-sans">Origination Fee ({originationPercent}%):</td>
                          <td className="py-2 text-right text-slate-400">-</td>
                          <td className="py-2 text-right text-slate-700">{fmt(summary.originationFeeCost)}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-2 text-slate-700 font-sans">Other Closing Costs:</td>
                        <td className="py-2 text-right text-slate-400">-</td>
                        <td className="py-2 text-right text-slate-700">{fmt(summary.otherClosingCosts)}</td>
                      </tr>
                      <tr className="bg-slate-50 font-bold">
                        <td className="py-2 text-slate-900 font-sans">Total Closing Costs:</td>
                        <td className="py-2 text-right text-slate-400">-</td>
                        <td className="py-2 text-right text-amber-700">{fmt(summary.totalClosingCosts)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 2: Monthly Payments */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="size-3.5 text-emerald-600" />
                    <span>2. Monthly Payments</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2">Item</th>
                        <th className="py-2 text-right">Before Refinancing</th>
                        <th className="py-2 text-right">After Refinancing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      <tr>
                        <td className="py-2 text-slate-700 font-sans">Monthly Payment (P&I):</td>
                        <td className="py-2 text-right text-slate-700">{fmt(summary.currentMonthlyPayment)}</td>
                        <td className="py-2 text-right text-slate-700">{fmt(summary.newMonthlyPayment)}</td>
                      </tr>
                      <tr className="bg-slate-50 font-bold">
                        <td className="py-2 text-slate-900 font-sans">Payment Savings Per Month:</td>
                        <td className="py-2 text-right text-slate-400">-</td>
                        <td
                          className={`py-2 text-right ${
                            summary.monthlyPaymentSavings >= 0 ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {fmt(summary.monthlyPaymentSavings, true)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 3: Horizon Totals (e.g. 7-Year Totals) */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <TrendingDown className="size-3.5 text-indigo-600" />
                    <span>3. {summary.horizonYears}-Year Totals</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2">Item</th>
                        <th className="py-2 text-right">Before Refinancing</th>
                        <th className="py-2 text-right">After Refinancing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      <tr>
                        <td className="py-2 text-slate-700 font-sans">
                          Total Payments Over {summary.horizonYears} Years:
                        </td>
                        <td className="py-2 text-right text-slate-700">{fmt(summary.totalPaymentsOldHorizon)}</td>
                        <td className="py-2 text-right text-slate-700">{fmt(summary.totalPaymentsNewHorizon)}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-700 font-sans">Cumulative Payment Savings:</td>
                        <td className="py-2 text-right text-slate-400">-</td>
                        <td
                          className={`py-2 text-right font-bold ${
                            summary.paymentSavingsHorizon >= 0 ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {fmt(summary.paymentSavingsHorizon, true)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-700 font-sans">Total Interest Paid:</td>
                        <td className="py-2 text-right text-slate-700">{fmt(summary.totalInterestOldHorizon)}</td>
                        <td className="py-2 text-right text-slate-700">{fmt(summary.totalInterestNewHorizon)}</td>
                      </tr>
                      <tr className="bg-slate-50 font-bold">
                        <td className="py-2 text-slate-900 font-sans">Interest Savings:</td>
                        <td className="py-2 text-right text-slate-400">-</td>
                        <td className="py-2 text-right text-emerald-700">{fmt(summary.interestSavingsHorizon)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 4: Income Tax Info */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Percent className="size-3.5 text-amber-500" />
                    <span>4. Income Tax Info</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2">Item</th>
                        <th className="py-2 text-right">Before Refinancing</th>
                        <th className="py-2 text-right">After Refinancing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      <tr>
                        <td className="py-2 text-slate-700 font-sans">
                          Tax Savings from Interest ({(federalTaxRate + stateTaxRate).toFixed(1)}%):
                        </td>
                        <td className="py-2 text-right text-slate-700">{fmt(summary.taxSavingsOld)}</td>
                        <td className="py-2 text-right text-slate-700">{fmt(summary.taxSavingsNew)}</td>
                      </tr>
                      <tr className="bg-slate-50 font-bold">
                        <td className="py-2 text-slate-900 font-sans">Tax Saving Shift / Loss:</td>
                        <td className="py-2 text-right text-slate-400">-</td>
                        <td className="py-2 text-right text-amber-700">{fmt(summary.taxShiftLoss)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 5: Final Loan Balance & Homeowner Equity */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <PiggyBank className="size-3.5 text-emerald-600" />
                    <span>5. Final Loan Balance & Equity</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2">Item</th>
                        <th className="py-2 text-right">Before Refinancing</th>
                        <th className="py-2 text-right">After Refinancing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      <tr>
                        <td className="py-2 text-slate-700 font-sans">Refinance Loan Amount:</td>
                        <td className="py-2 text-right text-slate-400">-</td>
                        <td className="py-2 text-right text-slate-700">{fmt(summary.newLoanAmount)}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-700 font-sans">
                          Loan Balance at Horizon in {summary.horizonYears} Years:
                        </td>
                        <td className="py-2 text-right text-slate-700">{fmt(summary.oldHorizonBalance)}</td>
                        <td className="py-2 text-right text-slate-700">{fmt(summary.newHorizonBalance)}</td>
                      </tr>
                      <tr className="bg-slate-50 font-bold">
                        <td className="py-2 text-slate-900 font-sans">Home Equity Difference (Gain):</td>
                        <td className="py-2 text-right text-slate-400">-</td>
                        <td className="py-2 text-right text-emerald-700">
                          {fmt(summary.balanceDifferenceAtHorizon)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Summary Reconciliation Table */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 pb-2 border-b border-slate-100">
                  Total Refinancing Benefit Reconciliation
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-sans">Loan Balance Difference in {summary.horizonYears} Yrs, Less Tax Shift:</span>
                    <span className="font-bold text-slate-900">{fmt(summary.balanceDiffLessTaxShift)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-sans">
                      {summary.paymentSavingsHorizon >= 0
                        ? 'Plus Cumulative Monthly Payment Savings:'
                        : 'Less Additional Monthly Payments:'}
                    </span>
                    <span
                      className={`font-bold ${
                        summary.paymentSavingsHorizon >= 0 ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {fmt(summary.paymentSavingsHorizon, true)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-sans">Less Total Closing Costs:</span>
                    <span className="font-bold text-rose-600">-{fmt(summary.totalClosingCosts)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm sm:text-base">
                    <span className="font-bold text-slate-900 font-sans">
                      Total Refinancing Benefit Over Next {summary.horizonYears} Years:
                    </span>
                    <span
                      className={`font-black ${
                        summary.totalNetBenefit >= 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {fmt(summary.totalNetBenefit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visual Payoff Trajectory Chart */}
      <RefinanceBalanceChart data={chartData} />

      {/* Amortization Schedule Toggle Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
              <Calendar className="size-5 text-indigo-600" />
              <span>Side-by-Side Amortization Comparison</span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Compare principal paydown, interest allocation, and balance trajectory between Current and Refinanced loans.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Selector */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              <button
                onClick={() => setScheduleView('annual')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  scheduleView === 'annual'
                    ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Annual Summary
              </button>
              <button
                onClick={() => setScheduleView('monthly')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  scheduleView === 'monthly'
                    ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Monthly Schedule
              </button>
            </div>

            {/* Export Buttons */}
            <button
              onClick={handleExportPdf}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold text-indigo-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Print or export as vector PDF report"
            >
              <Printer className="size-3.5" />
              <span>PDF Report ({scheduleView === 'monthly' ? 'Monthly' : 'Annual'})</span>
            </button>
            <button
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Export to CSV"
            >
              <Download className="size-3.5 text-indigo-600" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleDownloadExcel}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Export to Excel"
            >
              <FileSpreadsheet className="size-3.5 text-emerald-600" />
              <span>Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Schedule Table */}
        {scheduleView === 'annual' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold">
                  <th className="py-2.5 px-3">Year</th>
                  <th className="py-2.5 px-3 text-right">Old Payment</th>
                  <th className="py-2.5 px-3 text-right">Old Interest</th>
                  <th className="py-2.5 px-3 text-right">Old Ending Bal</th>
                  <th className="py-2.5 px-3 text-right">New Payment</th>
                  <th className="py-2.5 px-3 text-right">New Interest</th>
                  <th className="py-2.5 px-3 text-right">New Ending Bal</th>
                  <th className="py-2.5 px-3 text-right">Annual Savings</th>
                  <th className="py-2.5 px-3 text-right">Equity Gain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {annualSchedule.map((row) => {
                  const isHorizon = row.year === summary.horizonYears;
                  return (
                    <tr
                      key={row.year}
                      className={`transition-colors ${
                        isHorizon ? 'bg-indigo-50/70 font-semibold border-l-2 border-indigo-600' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-2 px-3 text-slate-800 font-sans">
                        Year {row.year}
                        {isHorizon && <span className="ml-1 text-[10px] text-indigo-600 font-bold">(Horizon)</span>}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-800">{fmt(row.oldAnnualPayment)}</td>
                      <td className="py-2 px-3 text-right text-slate-600">{fmt(row.oldAnnualInterest)}</td>
                      <td className="py-2 px-3 text-right text-slate-800">{fmt(row.oldEndingBalance)}</td>
                      <td className="py-2 px-3 text-right text-slate-800">{fmt(row.newAnnualPayment)}</td>
                      <td className="py-2 px-3 text-right text-emerald-600 font-medium">{fmt(row.newAnnualInterest)}</td>
                      <td className="py-2 px-3 text-right text-slate-800">{fmt(row.newEndingBalance)}</td>
                      <td
                        className={`py-2 px-3 text-right font-semibold ${
                          row.annualSavings >= 0 ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {fmt(row.annualSavings, true)}
                      </td>
                      <td className="py-2 px-3 text-right text-emerald-600 font-medium">
                        {fmt(row.endingEquityDiff)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold">
                    <th className="py-2.5 px-3">Mo</th>
                    <th className="py-2.5 px-3 text-right">Old Payment</th>
                    <th className="py-2.5 px-3 text-right">Old Interest</th>
                    <th className="py-2.5 px-3 text-right">Old Balance</th>
                    <th className="py-2.5 px-3 text-right">New Payment</th>
                    <th className="py-2.5 px-3 text-right">New Interest</th>
                    <th className="py-2.5 px-3 text-right">New Balance</th>
                    <th className="py-2.5 px-3 text-right">Mo Savings</th>
                    <th className="py-2.5 px-3 text-right">Cum. Net Benefit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {pagedMonthly.map((row) => (
                    <tr key={row.month} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 text-slate-800 font-sans">
                        Month {row.month}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-800">{fmt(row.oldPayment)}</td>
                      <td className="py-2 px-3 text-right text-slate-600">{fmt(row.oldInterest)}</td>
                      <td className="py-2 px-3 text-right text-slate-800">{fmt(row.oldBalance)}</td>
                      <td className="py-2 px-3 text-right text-slate-800">{fmt(row.newPayment)}</td>
                      <td className="py-2 px-3 text-right text-emerald-600 font-medium">{fmt(row.newInterest)}</td>
                      <td className="py-2 px-3 text-right text-slate-800">{fmt(row.newBalance)}</td>
                      <td
                        className={`py-2 px-3 text-right font-medium ${
                          row.monthlySavings >= 0 ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {fmt(row.monthlySavings, true)}
                      </td>
                      <td
                        className={`py-2 px-3 text-right font-bold ${
                          row.cumulativeNetBenefit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {fmt(row.cumulativeNetBenefit, true)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
                <span className="text-slate-500">
                  Showing page {monthlyPage} of {totalPages} ({monthlySchedule.length} total months)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMonthlyPage((p) => Math.max(1, p - 1))}
                    disabled={monthlyPage === 1}
                    className="px-3 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 disabled:opacity-40 cursor-pointer shadow-xs"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setMonthlyPage((p) => Math.min(totalPages, p + 1))}
                    disabled={monthlyPage === totalPages}
                    className="px-3 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 disabled:opacity-40 cursor-pointer shadow-xs"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Highest-intent placement: the reader has just seen their own numbers. */}
      <AdSlot unit="calculatorResult" className="my-8" />

      <MethodologyDisclosure type="refinance" />

      {/* Competitor Comparison Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 mb-2">
            <Sparkles className="size-3.5" />
            <span>Independent Comparison</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Why TableView vs Bankrate &amp; SmartAsset Refinance Calculator?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            Most commercial refinance calculators oversimplify break-even math to push lender referrals. Here is how TableView compares on financial depth, tax modeling, and borrower privacy:
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Feature / Capability</th>
                <th className="py-3 px-4 text-indigo-700 font-bold">TableView.dev</th>
                <th className="py-3 px-4">Bankrate</th>
                <th className="py-3 px-4">SmartAsset</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-semibold text-slate-900">In-Browser Privacy</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">Yes (Zero Data Egress)</td>
                <td className="py-3 px-4 text-slate-600">No (Server-Tracked)</td>
                <td className="py-3 px-4 text-slate-600">No (Lead Capture)</td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-semibold text-slate-900">No Lead Generation / Spam Calls</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">Yes (No Lead Forms)</td>
                <td className="py-3 px-4 text-rose-600">No (Aggressive Loan Offers)</td>
                <td className="py-3 px-4 text-rose-600">No (Advisor Lead Capture)</td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-semibold text-slate-900">30-Year Reset Clock Warning</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">Automated Risk Alert</td>
                <td className="py-3 px-4 text-rose-600">Not Supported</td>
                <td className="py-3 px-4 text-rose-600">Not Supported</td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-semibold text-slate-900">Net Equity Break-Even (Tax Adjusted)</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">Dual Break-Even Engine</td>
                <td className="py-3 px-4 text-slate-600">Cash Flow Only</td>
                <td className="py-3 px-4 text-slate-600">Cash Flow Only</td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-semibold text-slate-900">Roll Closing Costs into Loan ($0 Out of Pocket)</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">1-Click Toggle</td>
                <td className="py-3 px-4 text-slate-700">Manual adjustments</td>
                <td className="py-3 px-4 text-slate-700">Yes</td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-semibold text-slate-900">Visual Balance Payoff Chart</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">Yes (Zero-Bloat SVG)</td>
                <td className="py-3 px-4 text-slate-700">Yes</td>
                <td className="py-3 px-4 text-slate-600">Basic Bar Only</td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-semibold text-slate-900">Full Amortization Excel Export</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">1-Click Full Schedule</td>
                <td className="py-3 px-4 text-slate-600">CSV Only</td>
                <td className="py-3 px-4 text-rose-600">Not Supported</td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-semibold text-slate-900">Shareable Pre-filled URL</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">Instant 1-Click Link</td>
                <td className="py-3 px-4 text-rose-600">Not Supported</td>
                <td className="py-3 px-4 text-rose-600">Not Supported</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* In-Depth Educational & Refinancing Strategy Guide */}
      <div className="p-6 sm:p-10 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <HelpCircle className="size-6 text-indigo-600" />
            <span>Comprehensive Mortgage Refinancing Guide</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            Understanding the economic tradeoffs, break-even timelines, discount points, and tax law impacts before committing to a home loan refinance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingDown className="size-4 text-emerald-600" />
              <span>1. The Break-Even Horizon Rule</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Refinancing is not free. When paying upfront closing costs (typically 2% to 4% of the loan amount), calculate your exact break-even timeline:
              <br />
              <code className="block my-2 p-2 rounded bg-slate-100 text-[11px] text-indigo-700 font-mono border border-slate-200">
                Break-Even (Months) = Total Upfront Costs ÷ Monthly Payment Savings
              </code>
              If you plan to sell or move within 3 years and your break-even is 42 months, refinancing is economically detrimental.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="size-4 text-indigo-600" />
              <span>2. 30-Year vs 15-Year Tradeoff</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Switching from a 30-year fixed to a 15-year fixed loan often increases your required monthly payment, but dramatically accelerates principal repayment. Even though monthly cash flow decreases, your 7-year net homeowner equity increases by tens of thousands of dollars while slashing lifetime interest by up to 60%.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Percent className="size-4 text-amber-600" />
              <span>3. Discount Points vs Par Rate</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              One discount point equals 1% of the loan balance (e.g. $3,000 on a $300,000 mortgage) and typically lowers your APR by 0.25%. Only purchase discount points if you intend to stay in the home long enough for the incremental monthly savings to exceed the cash paid for points.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="size-4 text-rose-600" />
              <span>4. TCJA Tax Deduction Reality</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Under current tax law (TCJA), with high standard deductions ($15,000 for single filers, $30,000 for married couples filing jointly), fewer than 10% of homeowners itemize mortgage interest. If you take the standard deduction, set tax rates to 0% in this calculator so that reduced interest expense is treated purely as 100% savings.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ rendered from the shared registry so the prerendered markup matches. */}
      <CalculatorFaqSection
        path="/refinance-calculator"
        title="Frequently Asked Questions About Refinancing"
      />

      {/* Closing unit at the end of the editorial content. */}
      <AdSlot unit="calculatorFaq" format="horizontal" />

      {/* Related Calculators Cross-Sell */}
      <div className="mb-8">
        <RelatedCalculators currentSlug="refinance-calculator" category="real-estate" />
      </div>
    </div>

    <SavedScenariosModal
      isOpen={showScenariosModal}
      onClose={() => setShowScenariosModal(false)}
      calculatorId="refinance"
      currentData={{
        homePrice,
        downPayment,
        originalLoanAmount,
        currentInterestRate,
        monthsAlreadyPaid,
        newTermYears,
        newInterestRate,
        yearsBeforeSell,
        discountPoints,
        originationPercent,
        otherClosingCosts,
        cashOutAmount,
        rollCostsIntoLoan
      }}
      currentMetrics={{
        headline: summary.monthlyPaymentSavings >= 0 ? `Save $${Math.round(summary.monthlyPaymentSavings).toLocaleString()}/mo` : `+$${Math.round(Math.abs(summary.monthlyPaymentSavings)).toLocaleString()}/mo`,
        subline: summary.breakEvenMonths !== null ? `Break-even in ${summary.breakEvenMonths} mos · Net Benefit: $${Math.round(summary.totalNetBenefit).toLocaleString()}` : `Clock Reset Warning`
      }}
      onLoadScenario={(data) => {
        if (data.homePrice) setHomePrice(data.homePrice);
        if (data.downPayment) setDownPayment(data.downPayment);
        if (data.originalLoanAmount) setOriginalLoanAmount(data.originalLoanAmount);
        if (data.currentInterestRate) setCurrentInterestRate(data.currentInterestRate);
        if (data.monthsAlreadyPaid !== undefined) setMonthsAlreadyPaid(data.monthsAlreadyPaid);
        if (data.newTermYears) setNewTermYears(data.newTermYears);
        if (data.newInterestRate) setNewInterestRate(data.newInterestRate);
        if (data.yearsBeforeSell) setYearsBeforeSell(data.yearsBeforeSell);
        if (data.discountPoints !== undefined) setDiscountPoints(data.discountPoints);
        if (data.originationPercent !== undefined) setOriginationPercent(data.originationPercent);
        if (data.otherClosingCosts !== undefined) setOtherClosingCosts(data.otherClosingCosts);
        if (data.cashOutAmount !== undefined) setCashOutAmount(data.cashOutAmount);
        if (data.rollCostsIntoLoan !== undefined) setRollCostsIntoLoan(data.rollCostsIntoLoan);
      }}
      onUpgradePro={() => {
        setShowScenariosModal(false);
        setShowDossierModal(true);
      }}
    />

    <LenderReadyDossierModal
      isOpen={showDossierModal}
      onClose={() => setShowDossierModal(false)}
      dealTitle={`Refinance Evaluation · $${Math.round(summary.newLoanAmount).toLocaleString()} (${newTermYears}Y @ ${newInterestRate}%)`}
      dealId={`refi_${Math.round(summary.newLoanAmount)}_${newInterestRate}_${newTermYears}`}
      onExportExcel={handleDownloadExcel}
      onPrintOfficialPdf={handleExportPdf}
      onOpenBrandingSettings={() => setShowBrandingModal(true)}
    />

    <ProBrandingModal
      isOpen={showBrandingModal}
      onClose={() => setShowBrandingModal(false)}
      onUpgradeToPro={() => {
        setShowBrandingModal(false);
        setShowDossierModal(true);
      }}
    />

    <PrintableRefinanceReport
      inputs={inputs}
      summary={summary}
      annualSchedule={annualSchedule}
      monthlySchedule={monthlySchedule}
      scheduleView={scheduleView}
    />
  </>
  );
};

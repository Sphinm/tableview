import { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Calculator,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Download,
  FileSpreadsheet,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  PiggyBank,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Percent,
  RefreshCw,
  Home
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
import { ShareCalculationButton } from '../components/ShareCalculationButton';
import { MethodologyDisclosure } from '../components/MethodologyDisclosure';
import { RefinanceBalanceChart } from '../components/RefinanceBalanceChart';

const refinanceFaqs = [
  {
    q: 'How is the refinance break-even point calculated?',
    a: 'Break-even point (in months) = Total upfront closing costs and discount points divided by monthly payment savings. For example, $6,000 in closing costs with $250/month in savings reaches break-even in 24 months.'
  },
  {
    q: 'How does TableView compare to Bankrate or SmartAsset refinance calculators?',
    a: 'Unlike Bankrate or SmartAsset, TableView operates 100% in your browser with zero lead forms, ads, or broker phone spam. Furthermore, TableView provides exclusive net equity break-even analysis (accounting for lost tax deductions), a 30-year reset clock warning to prevent overpaying lifetime interest, and instant Excel downloads.'
  },
  {
    q: 'What is the "30-Year Reset Clock" trap in mortgage refinancing?',
    a: 'When you refinance an existing mortgage that is already partially paid off into a brand new 30-year mortgage, you reset the amortization clock back to year one. While your monthly payment might decrease, you may end up paying significantly more in total lifetime interest. TableView automatically detects and flags this trap with an amber alert.'
  },
  {
    q: 'Does it make sense to refinance from a 30-year to a 15-year mortgage?',
    a: 'Yes, if your goal is long-term wealth building. While your monthly payment may increase slightly, 15-year fixed loans carry lower interest rates and pay down principal twice as fast, saving tens of thousands of dollars in lifetime interest.'
  },
  {
    q: 'What is a zero-closing-cost refinance?',
    a: 'In a zero-cost refinance, the lender pays your closing fees in exchange for a slightly higher interest rate (e.g. +0.25% to +0.375%), or the closing costs are rolled into the loan balance. Your break-even is immediate, making it ideal if you plan to move within 3-5 years.'
  },
  {
    q: 'How does cash-out refinancing work?',
    a: 'A cash-out refinance replaces your existing mortgage with a larger loan balance, providing the difference in cash. Most conventional lenders permit up to 80% Loan-to-Value (LTV) for cash-out refinancing on primary residences.'
  }
];

const refinanceSchemas = [
  {
    '@type': 'WebApplication',
    name: 'Mortgage Refinance Break-Even Calculator',
    url: 'https://tableview.dev/refinance-calculator',
    description: 'Free in-browser mortgage refinance calculator. Compare old vs new monthly payments, calculate break-even months, equity trajectory, and discount points with Excel export. Best ad-free alternative to Bankrate and SmartAsset.',
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
  useEffect(() => {
    updatePageMeta(
      'Mortgage Refinance Break-Even Calculator - SmartAsset & Bankrate Alternative | TableView.dev',
      'Free, 100% private in-browser mortgage refinance break-even calculator. Compare monthly savings, net equity break-even, roll-in closing costs, and 30-year reset clock warnings without broker ads or lead forms.',
      '/refinance-calculator',
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

  const handleDownloadExcel = () => {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('/');
            }}
            className="hover:text-slate-200 transition-colors"
          >
            Workbench
          </a>
          <span>/</span>
          <a
            href="/finance-calculator"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('/finance-calculator');
            }}
            className="hover:text-slate-200 transition-colors"
          >
            Calculators
          </a>
          <span>/</span>
          <span className="text-slate-200 font-medium">Refinance Break-Even</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('/mortgage-calculator')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Home className="size-3.5" />
            <span>Purchase Mortgage Calc</span>
          </button>
          <button
            onClick={() => navigateTo('/finance-calculator')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Calculator className="size-3.5" />
            <span>All Financial Calcs</span>
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
            title="Share Refinance Deal"
          />
        </div>
      </div>

      {/* Hero Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <ShieldCheck className="size-3.5" />
          <span>100% Private In-Browser Calculation · Modeled after MortgageCalculator.org</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
          <RefreshCw className="size-8 text-indigo-400" />
          <span>Home Mortgage Refinance Calculator</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
          Unsure if you should refinance? Calculate whether refinancing makes financial sense based on interest rate reductions, discount points, upfront closing costs, income tax shift, and multi-year homeowner equity growth.
        </p>

        {/* Quick Scenario Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-medium text-slate-400 mr-1">Quick Scenarios:</span>
          <button
            onClick={() => applyPreset('shorten15')}
            className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-slate-100 transition-all cursor-pointer"
          >
            Shorten 30-Yr to 15-Yr
          </button>
          <button
            onClick={() => applyPreset('rateDrop')}
            className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-slate-100 transition-all cursor-pointer"
          >
            Lower Rate 30-Yr (Cash Savings)
          </button>
          <button
            onClick={() => applyPreset('cashOut')}
            className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-slate-100 transition-all cursor-pointer"
          >
            Cash-Out Refi ($40k)
          </button>
          <button
            onClick={() => applyPreset('zeroCost')}
            className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-slate-100 transition-all cursor-pointer"
          >
            Zero-Closing-Cost Refi
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Box 1: Original Loan Details */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wide">
                <Home className="size-4 text-indigo-400" />
                <span>1. Original Loan Details</span>
              </h2>
              <span className="text-[11px] font-mono text-indigo-400">Current Mortgage</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Original Home Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">$</span>
                  <input
                    type="number"
                    value={homePrice}
                    onChange={(e) => handleHomePriceChange(Number(e.target.value))}
                    step="5000"
                    min="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-xs text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Original Down Payment
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">$</span>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) => handleDownPaymentChange(Number(e.target.value))}
                    step="5000"
                    min="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-xs text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Original Loan Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">$</span>
                  <input
                    type="number"
                    value={originalLoanAmount}
                    onChange={(e) => setOriginalLoanAmount(Number(e.target.value))}
                    step="5000"
                    min="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-xs text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Original Loan Term
                </label>
                <select
                  value={originalTermYears}
                  onChange={(e) => setOriginalTermYears(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                >
                  <option value={10}>10 Years</option>
                  <option value={15}>15 Years</option>
                  <option value={20}>20 Years</option>
                  <option value={30}>30 Years</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Current Interest Rate
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={currentInterestRate}
                    onChange={(e) => setCurrentInterestRate(Number(e.target.value))}
                    step="0.05"
                    min="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-7 py-2 text-xs text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Months Already Paid
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={monthsAlreadyPaid}
                    onChange={(e) => setMonthsAlreadyPaid(Number(e.target.value))}
                    step="1"
                    min="0"
                    max={originalTermYears * 12}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-2.5 text-[11px] text-slate-400">Mo</span>
                </div>
              </div>
            </div>

            {/* Current Loan Real-time Metrics Pill */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">Current Monthly P&I</span>
                <span className="font-mono font-bold text-slate-200 text-sm">
                  {fmt(summary.currentMonthlyPayment)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Balance at Refinance</span>
                <span className="font-mono font-bold text-indigo-400 text-sm">
                  {fmt(summary.currentBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* Box 2: Refinanced Loan Parameters */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wide">
                <RefreshCw className="size-4 text-emerald-400" />
                <span>2. Refinanced Loan</span>
              </h2>
              <span className="text-[11px] font-mono text-emerald-400">New Terms</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  New Loan Term
                </label>
                <select
                  value={newTermYears}
                  onChange={(e) => setNewTermYears(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                >
                  <option value={10}>10 Years</option>
                  <option value={15}>15 Years</option>
                  <option value={20}>20 Years</option>
                  <option value={30}>30 Years</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  New Interest Rate
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={newInterestRate}
                    onChange={(e) => setNewInterestRate(Number(e.target.value))}
                    step="0.05"
                    min="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-7 py-2 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Years Before Sell / Horizon
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={yearsBeforeSell}
                    onChange={(e) => setYearsBeforeSell(Number(e.target.value))}
                    step="1"
                    min="1"
                    max="30"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-2.5 text-[11px] text-slate-400">Yrs</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Cash-Out Amount (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">$</span>
                  <input
                    type="number"
                    value={cashOutAmount}
                    onChange={(e) => setCashOutAmount(Number(e.target.value))}
                    step="1000"
                    min="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* New Loan Output Pill */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">New Monthly Payment</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {fmt(summary.newMonthlyPayment)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">New Loan Amount</span>
                <span className="font-mono font-bold text-slate-200 text-sm">
                  {fmt(summary.newLoanAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Box 3: Fees, Points & Income Taxes */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wide">
                <DollarSign className="size-4 text-amber-400" />
                <span>3. Closing Fees & Tax Rates</span>
              </h2>
              <span className="text-[11px] font-mono text-amber-400">Costs & Deductions</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Discount Points
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={discountPoints}
                    onChange={(e) => setDiscountPoints(Number(e.target.value))}
                    step="0.125"
                    min="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-7 py-2 text-xs text-slate-100 font-mono focus:border-amber-500 focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-2.5 text-xs text-slate-400">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Origination Fee
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={originationPercent}
                    onChange={(e) => setOriginationPercent(Number(e.target.value))}
                    step="0.1"
                    min="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-7 py-2 text-xs text-slate-100 font-mono focus:border-amber-500 focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-2.5 text-xs text-slate-400">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Other Closing Costs
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">$</span>
                  <input
                    type="number"
                    value={otherClosingCosts}
                    onChange={(e) => setOtherClosingCosts(Number(e.target.value))}
                    step="100"
                    min="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-xs text-slate-100 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={rollCostsIntoLoan}
                    onChange={(e) => setRollCostsIntoLoan(e.target.checked)}
                    className="size-4 rounded accent-indigo-500 bg-slate-950 border-slate-800"
                  />
                  <span>Roll closing costs into new loan balance ($0 out-of-pocket cash)</span>
                </label>
              </div>
            </div>

            {/* Income Tax Row */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">Itemized Tax Deduction Rates</span>
                <button
                  type="button"
                  onClick={() => {
                    setFederalTaxRate(0);
                    setStateTaxRate(0);
                  }}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                >
                  Set to 0% (Standard Deduction)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Federal Income Tax</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={federalTaxRate}
                      onChange={(e) => setFederalTaxRate(Number(e.target.value))}
                      step="1"
                      min="0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-7 py-1.5 text-xs text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
                    />
                    <span className="absolute right-2.5 top-2 text-xs text-slate-400">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">State Income Tax</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={stateTaxRate}
                      onChange={(e) => setStateTaxRate(Number(e.target.value))}
                      step="0.5"
                      min="0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-7 py-1.5 text-xs text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
                    />
                    <span className="absolute right-2.5 top-2 text-xs text-slate-400">%</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
                <Info className="size-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  Under TCJA standard deductions ($15k single / $30k married), if you take the standard deduction rather than itemizing, set tax rates to 0% to omit the tax shift.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Executive Results & Detailed Breakdowns (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Executive Verdict Card */}
          <div className="relative rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 p-6 sm:p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 size-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">
                    Refinancing Verdict
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {summary.horizonYears}-Year Horizon
                  </span>
                </div>

                {/* View Switcher Pills */}
                <div className="flex items-center p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                  <button
                    onClick={() => setViewMode('analysis')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      viewMode === 'analysis'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Financial Analysis
                  </button>
                  <button
                    onClick={() => setViewMode('plainEnglish')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      viewMode === 'plainEnglish'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Plain English
                  </button>
                </div>
              </div>

              {/* 30-Year Reset Clock Warning Alert */}
              {summary.clockResetWarning && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
                  <AlertTriangle className="size-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-200 text-sm">30-Year Loan Term Extension Risk</h4>
                    <p className="mt-1 leading-relaxed text-amber-300/90">{summary.clockResetWarning}</p>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
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

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Closing Costs</span>
                  <span className="text-sm sm:text-base font-bold font-mono text-slate-100">
                    {fmt(summary.totalClosingCosts)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Break-Even</span>
                  <span className="text-sm sm:text-base font-bold font-mono text-indigo-300">
                    {summary.breakEvenMonths !== null
                      ? `${summary.breakEvenMonths} Months`
                      : summary.equityBreakEvenMonths !== null
                      ? `${summary.equityBreakEvenMonths} Mo (Equity)`
                      : 'N/A'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
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
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="size-5 text-indigo-400" />
                  <span>Your Results in Plain English</span>
                </h3>
                <button
                  onClick={() => setViewMode('analysis')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                >
                  Switch to Financial Analysis
                </button>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  Deciding whether or not you should refinance your home mortgage depends upon several factors. It also depends upon whether you are looking to simply reduce your monthly payment or if you are hoping to save maximum money in the long run.
                </p>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="font-semibold text-slate-200">Here is what happens in your specific scenario:</div>
                  <ul className="space-y-2.5 list-disc pl-5">
                    <li>
                      <strong>Monthly Payment:</strong> You are currently paying{' '}
                      <span className="font-mono text-slate-100 font-bold">{fmt(summary.currentMonthlyPayment)}</span>/mo.
                      When you refinance, your new monthly payment will be{' '}
                      <span className="font-mono text-slate-100 font-bold">{fmt(summary.newMonthlyPayment)}</span>/mo (
                      {summary.monthlyPaymentSavings >= 0 ? (
                        <span className="text-emerald-400 font-semibold">
                          a monthly savings of {fmt(summary.monthlyPaymentSavings)}
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold">
                          an increase of {fmt(Math.abs(summary.monthlyPaymentSavings))} per month to build equity faster
                        </span>
                      )}
                      ).
                    </li>
                    <li>
                      <strong>Upfront Closing Expenses:</strong> Closing your refinancing process will cost{' '}
                      <span className="font-mono text-slate-100 font-bold">{fmt(summary.totalClosingCosts)}</span>{' '}
                      ({fmt(summary.discountPointsCost)} in discount points + {fmt(summary.originationFeeCost)} in origination + {fmt(summary.otherClosingCosts)} in other fees).
                    </li>
                    <li>
                      <strong>Homeowner Equity Growth:</strong> In {summary.horizonYears} years, your remaining loan balance will be{' '}
                      <span className="font-mono text-emerald-400 font-bold">{fmt(summary.balanceDifferenceAtHorizon)} less</span>{' '}
                      because your payments aggressively reduce your mortgage principal. Lesser principal balance means more home equity in your pocket!
                    </li>
                    {summary.taxShiftLoss > 0 && (
                      <li>
                        <strong>Tax Deduction Shift:</strong> Because you will pay less mortgage interest, you will claim{' '}
                        <span className="font-mono text-amber-400 font-bold">{fmt(summary.taxShiftLoss)} less</span> in tax deductions over the next {summary.horizonYears} years (if you itemize).
                      </li>
                    )}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <div className="font-bold text-sm text-emerald-200 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="size-4" />
                    <span>The Bottom Line:</span>
                  </div>
                  <p className="text-xs leading-relaxed">
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
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="size-3.5 text-indigo-400" />
                    <span>1. Balance & Closing Costs</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-medium">
                        <th className="py-2">Item</th>
                        <th className="py-2 text-right">Before Refinancing</th>
                        <th className="py-2 text-right">After Refinancing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      <tr>
                        <td className="py-2 text-slate-300 font-sans">Balance at Refinance:</td>
                        <td className="py-2 text-right text-slate-300">{fmt(summary.currentBalance)}</td>
                        <td className="py-2 text-right text-slate-300">{fmt(summary.newLoanAmount)}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-300 font-sans">Cost of {discountPoints.toFixed(3)} Discount Points:</td>
                        <td className="py-2 text-right text-slate-500">-</td>
                        <td className="py-2 text-right text-slate-300">{fmt(summary.discountPointsCost)}</td>
                      </tr>
                      {summary.originationFeeCost > 0 && (
                        <tr>
                          <td className="py-2 text-slate-300 font-sans">Origination Fee ({originationPercent}%):</td>
                          <td className="py-2 text-right text-slate-500">-</td>
                          <td className="py-2 text-right text-slate-300">{fmt(summary.originationFeeCost)}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-2 text-slate-300 font-sans">Other Closing Costs:</td>
                        <td className="py-2 text-right text-slate-500">-</td>
                        <td className="py-2 text-right text-slate-300">{fmt(summary.otherClosingCosts)}</td>
                      </tr>
                      <tr className="bg-slate-950/60 font-bold">
                        <td className="py-2 text-slate-100 font-sans">Total Closing Costs:</td>
                        <td className="py-2 text-right text-slate-500">-</td>
                        <td className="py-2 text-right text-amber-400">{fmt(summary.totalClosingCosts)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 2: Monthly Payments */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="size-3.5 text-emerald-400" />
                    <span>2. Monthly Payments</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-medium">
                        <th className="py-2">Item</th>
                        <th className="py-2 text-right">Before Refinancing</th>
                        <th className="py-2 text-right">After Refinancing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      <tr>
                        <td className="py-2 text-slate-300 font-sans">Monthly Payment (P&I):</td>
                        <td className="py-2 text-right text-slate-300">{fmt(summary.currentMonthlyPayment)}</td>
                        <td className="py-2 text-right text-slate-300">{fmt(summary.newMonthlyPayment)}</td>
                      </tr>
                      <tr className="bg-slate-950/60 font-bold">
                        <td className="py-2 text-slate-100 font-sans">Payment Savings Per Month:</td>
                        <td className="py-2 text-right text-slate-500">-</td>
                        <td
                          className={`py-2 text-right ${
                            summary.monthlyPaymentSavings >= 0 ? 'text-emerald-400' : 'text-amber-400'
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
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <TrendingDown className="size-3.5 text-indigo-400" />
                    <span>3. {summary.horizonYears}-Year Totals</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-medium">
                        <th className="py-2">Item</th>
                        <th className="py-2 text-right">Before Refinancing</th>
                        <th className="py-2 text-right">After Refinancing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      <tr>
                        <td className="py-2 text-slate-300 font-sans">
                          Total Payments Over {summary.horizonYears} Years:
                        </td>
                        <td className="py-2 text-right text-slate-300">{fmt(summary.totalPaymentsOldHorizon)}</td>
                        <td className="py-2 text-right text-slate-300">{fmt(summary.totalPaymentsNewHorizon)}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-300 font-sans">Cumulative Payment Savings:</td>
                        <td className="py-2 text-right text-slate-500">-</td>
                        <td
                          className={`py-2 text-right font-bold ${
                            summary.paymentSavingsHorizon >= 0 ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {fmt(summary.paymentSavingsHorizon, true)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-300 font-sans">Total Interest Paid:</td>
                        <td className="py-2 text-right text-slate-300">{fmt(summary.totalInterestOldHorizon)}</td>
                        <td className="py-2 text-right text-slate-300">{fmt(summary.totalInterestNewHorizon)}</td>
                      </tr>
                      <tr className="bg-slate-950/60 font-bold">
                        <td className="py-2 text-slate-100 font-sans">Interest Savings:</td>
                        <td className="py-2 text-right text-slate-500">-</td>
                        <td className="py-2 text-right text-emerald-400">{fmt(summary.interestSavingsHorizon)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 4: Income Tax Info */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Percent className="size-3.5 text-amber-400" />
                    <span>4. Income Tax Info</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-medium">
                        <th className="py-2">Item</th>
                        <th className="py-2 text-right">Before Refinancing</th>
                        <th className="py-2 text-right">After Refinancing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      <tr>
                        <td className="py-2 text-slate-300 font-sans">
                          Tax Savings from Interest ({(federalTaxRate + stateTaxRate).toFixed(1)}%):
                        </td>
                        <td className="py-2 text-right text-slate-300">{fmt(summary.taxSavingsOld)}</td>
                        <td className="py-2 text-right text-slate-300">{fmt(summary.taxSavingsNew)}</td>
                      </tr>
                      <tr className="bg-slate-950/60 font-bold">
                        <td className="py-2 text-slate-100 font-sans">Tax Saving Shift / Loss:</td>
                        <td className="py-2 text-right text-slate-500">-</td>
                        <td className="py-2 text-right text-amber-400">{fmt(summary.taxShiftLoss)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 5: Final Loan Balance & Homeowner Equity */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <PiggyBank className="size-3.5 text-emerald-400" />
                    <span>5. Final Loan Balance & Equity</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-medium">
                        <th className="py-2">Item</th>
                        <th className="py-2 text-right">Before Refinancing</th>
                        <th className="py-2 text-right">After Refinancing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      <tr>
                        <td className="py-2 text-slate-300 font-sans">Refinance Loan Amount:</td>
                        <td className="py-2 text-right text-slate-500">-</td>
                        <td className="py-2 text-right text-slate-300">{fmt(summary.newLoanAmount)}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-300 font-sans">
                          Loan Balance at Horizon in {summary.horizonYears} Years:
                        </td>
                        <td className="py-2 text-right text-slate-300">{fmt(summary.oldHorizonBalance)}</td>
                        <td className="py-2 text-right text-slate-300">{fmt(summary.newHorizonBalance)}</td>
                      </tr>
                      <tr className="bg-slate-950/60 font-bold">
                        <td className="py-2 text-slate-100 font-sans">Home Equity Difference (Gain):</td>
                        <td className="py-2 text-right text-slate-500">-</td>
                        <td className="py-2 text-right text-emerald-400">
                          {fmt(summary.balanceDifferenceAtHorizon)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Summary Reconciliation Table */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/40 shadow-xl space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 pb-2 border-b border-slate-800">
                  Total Refinancing Benefit Reconciliation
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-sans">Loan Balance Difference in {summary.horizonYears} Yrs, Less Tax Shift:</span>
                    <span className="font-bold text-slate-100">{fmt(summary.balanceDiffLessTaxShift)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-sans">
                      {summary.paymentSavingsHorizon >= 0
                        ? 'Plus Cumulative Monthly Payment Savings:'
                        : 'Less Additional Monthly Payments:'}
                    </span>
                    <span
                      className={`font-bold ${
                        summary.paymentSavingsHorizon >= 0 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {fmt(summary.paymentSavingsHorizon, true)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-sans">Less Total Closing Costs:</span>
                    <span className="font-bold text-rose-400">-{fmt(summary.totalClosingCosts)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm sm:text-base">
                    <span className="font-bold text-slate-100 font-sans">
                      Total Refinancing Benefit Over Next {summary.horizonYears} Years:
                    </span>
                    <span
                      className={`font-black ${
                        summary.totalNetBenefit >= 0 ? 'text-emerald-400' : 'text-rose-400'
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
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2.5">
              <Calendar className="size-5 text-indigo-400" />
              <span>Side-by-Side Amortization Comparison</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare principal paydown, interest allocation, and balance trajectory between Current and Refinanced loans.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Selector */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setScheduleView('annual')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  scheduleView === 'annual'
                    ? 'bg-white text-slate-950 font-semibold shadow-sm border border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-transparent'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Annual Summary
              </button>
              <button
                onClick={() => setScheduleView('monthly')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  scheduleView === 'monthly'
                    ? 'bg-white text-slate-950 font-semibold shadow-sm border border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-transparent'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Monthly Schedule
              </button>
            </div>

            {/* Export Buttons */}
            <button
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-slate-100 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Export to CSV"
            >
              <Download className="size-3.5 text-indigo-400" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleDownloadExcel}
              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-slate-100 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Export to Excel"
            >
              <FileSpreadsheet className="size-3.5 text-emerald-400" />
              <span>Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Schedule Table */}
        {scheduleView === 'annual' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
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
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {annualSchedule.map((row) => {
                  const isHorizon = row.year === summary.horizonYears;
                  return (
                    <tr
                      key={row.year}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        isHorizon ? 'bg-indigo-950/40 font-semibold border-l-2 border-indigo-500' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-slate-300 font-sans">
                        Year {row.year}
                        {isHorizon && <span className="ml-1 text-[10px] text-indigo-400">(Horizon)</span>}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300">{fmt(row.oldAnnualPayment)}</td>
                      <td className="py-2 px-3 text-right text-slate-400">{fmt(row.oldAnnualInterest)}</td>
                      <td className="py-2 px-3 text-right text-slate-300">{fmt(row.oldEndingBalance)}</td>
                      <td className="py-2 px-3 text-right text-slate-300">{fmt(row.newAnnualPayment)}</td>
                      <td className="py-2 px-3 text-right text-emerald-400">{fmt(row.newAnnualInterest)}</td>
                      <td className="py-2 px-3 text-right text-slate-300">{fmt(row.newEndingBalance)}</td>
                      <td
                        className={`py-2 px-3 text-right ${
                          row.annualSavings >= 0 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {fmt(row.annualSavings, true)}
                      </td>
                      <td className="py-2 px-3 text-right text-emerald-400">
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
                  <tr className="border-b border-slate-800 text-slate-400 font-medium">
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
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {pagedMonthly.map((row) => (
                    <tr key={row.month} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2 px-3 text-slate-300 font-sans">
                        Month {row.month}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300">{fmt(row.oldPayment)}</td>
                      <td className="py-2 px-3 text-right text-slate-400">{fmt(row.oldInterest)}</td>
                      <td className="py-2 px-3 text-right text-slate-300">{fmt(row.oldBalance)}</td>
                      <td className="py-2 px-3 text-right text-slate-300">{fmt(row.newPayment)}</td>
                      <td className="py-2 px-3 text-right text-emerald-400">{fmt(row.newInterest)}</td>
                      <td className="py-2 px-3 text-right text-slate-300">{fmt(row.newBalance)}</td>
                      <td
                        className={`py-2 px-3 text-right ${
                          row.monthlySavings >= 0 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {fmt(row.monthlySavings, true)}
                      </td>
                      <td
                        className={`py-2 px-3 text-right font-bold ${
                          row.cumulativeNetBenefit >= 0 ? 'text-emerald-400' : 'text-rose-400'
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
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                <span className="text-slate-400">
                  Showing page {monthlyPage} of {totalPages} ({monthlySchedule.length} total months)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMonthlyPage((p) => Math.max(1, p - 1))}
                    disabled={monthlyPage === 1}
                    className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-40 cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setMonthlyPage((p) => Math.min(totalPages, p + 1))}
                    disabled={monthlyPage === totalPages}
                    className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-40 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <MethodologyDisclosure type="refinance" />

      {/* Competitor Comparison Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-2">
            <Sparkles className="size-3.5" />
            <span>Independent Comparison</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
            Why TableView vs Bankrate &amp; SmartAsset Refinance Calculator?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Most commercial refinance calculators oversimplify break-even math to push lender referrals. Here is how TableView compares on financial depth, tax modeling, and borrower privacy:
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Feature / Capability</th>
                <th className="py-3 px-4 text-indigo-400 font-bold">TableView.dev</th>
                <th className="py-3 px-4">Bankrate</th>
                <th className="py-3 px-4">SmartAsset</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-200">100% Client-Side Privacy</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">Yes (Zero Data Egress)</td>
                <td className="py-3 px-4 text-slate-400">No (Server-Tracked)</td>
                <td className="py-3 px-4 text-slate-400">No (Lead Capture)</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-200">Ad-Free (No Broker Spam Calls)</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">Yes (No Lead Generation)</td>
                <td className="py-3 px-4 text-rose-400">No (Aggressive Loan Offers)</td>
                <td className="py-3 px-4 text-rose-400">No (Advisor Lead Capture)</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-200">30-Year Reset Clock Warning</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">Automated Risk Alert</td>
                <td className="py-3 px-4 text-rose-400">Not Supported</td>
                <td className="py-3 px-4 text-rose-400">Not Supported</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-200">Net Equity Break-Even (Tax Adjusted)</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">Dual Break-Even Engine</td>
                <td className="py-3 px-4 text-slate-400">Cash Flow Only</td>
                <td className="py-3 px-4 text-slate-400">Cash Flow Only</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-200">Roll Closing Costs into Loan ($0 Out of Pocket)</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">1-Click Toggle</td>
                <td className="py-3 px-4 text-slate-200">Manual adjustments</td>
                <td className="py-3 px-4 text-slate-200">Yes</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-200">Visual Balance Payoff Chart</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">Yes (Zero-Bloat SVG)</td>
                <td className="py-3 px-4 text-slate-200">Yes</td>
                <td className="py-3 px-4 text-slate-400">Basic Bar Only</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-200">Full Amortization Excel Export</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">1-Click Full Schedule</td>
                <td className="py-3 px-4 text-slate-400">CSV Only</td>
                <td className="py-3 px-4 text-rose-400">Not Supported</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-200">Shareable Pre-filled URL</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">Instant 1-Click Link</td>
                <td className="py-3 px-4 text-rose-400">Not Supported</td>
                <td className="py-3 px-4 text-rose-400">Not Supported</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* In-Depth Educational & Refinancing Strategy Guide */}
      <div className="p-6 sm:p-10 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-xl space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
            <HelpCircle className="size-6 text-indigo-400" />
            <span>Comprehensive Mortgage Refinancing Guide</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
            Understanding the economic tradeoffs, break-even timelines, discount points, and tax law impacts before committing to a home loan refinance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <TrendingDown className="size-4 text-emerald-400" />
              <span>1. The Break-Even Horizon Rule</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Refinancing is not free. When paying upfront closing costs (typically 2% to 4% of the loan amount), calculate your exact break-even timeline:
              <br />
              <code className="block my-2 p-2 rounded bg-slate-900 text-[11px] text-indigo-300 font-mono">
                Break-Even (Months) = Total Upfront Costs ÷ Monthly Payment Savings
              </code>
              If you plan to sell or move within 3 years and your break-even is 42 months, refinancing is economically detrimental.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="size-4 text-indigo-400" />
              <span>2. 30-Year vs 15-Year Tradeoff</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Switching from a 30-year fixed to a 15-year fixed loan often increases your required monthly payment, but dramatically accelerates principal repayment. Even though monthly cash flow decreases, your 7-year net homeowner equity increases by tens of thousands of dollars while slashing lifetime interest by up to 60%.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Percent className="size-4 text-amber-400" />
              <span>3. Discount Points vs Par Rate</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              One discount point equals 1% of the loan balance (e.g. $3,000 on a $300,000 mortgage) and typically lowers your APR by 0.25%. Only purchase discount points if you intend to stay in the home long enough for the incremental monthly savings to exceed the cash paid for points.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="size-4 text-rose-400" />
              <span>4. TCJA Tax Deduction Reality</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Under current tax law (TCJA), with high standard deductions ($15,000 for single filers, $30,000 for married couples filing jointly), fewer than 10% of homeowners itemize mortgage interest. If you take the standard deduction, set tax rates to 0% in this calculator so that reduced interest expense is treated purely as 100% savings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

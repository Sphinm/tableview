import { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Scale,
  Download,
  CheckCircle2,
  ChevronDown,
  Share2,
  Check,
  ArrowRight
} from 'lucide-react';
import {
  compareLoans,
  type LoanParameters
} from '../lib/loanComparisonCalculator';
import { updatePageMeta, navigateTo } from '../lib/router';
import { CurrencyInput } from '../components/CurrencyInput';
import { NumericInput } from '../components/NumericInput';
import { MethodologyDisclosure } from '../components/MethodologyDisclosure';
import { RelatedCalculators } from '../components/RelatedCalculators';
import { AdSlot } from '../components/AdSlot';

const loanComparisonSchemas = [
  {
    '@type': 'WebApplication',
    name: 'Side-by-Side Loan Comparison Calculator',
    url: 'https://tableview.dev/loan-comparison-calculator',
    description: 'Free in-browser loan comparison tool. Compare two loans side-by-side, analyze interest rate differences, upfront points, monthly payment savings, and lifetime payoff costs with 1-click Excel export.',
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
    name: 'Loan Comparison Modeler',
    description: 'Side-by-side financial comparison engine for mortgages, auto loans, personal loans, and commercial debt.',
    category: 'LoanComparison'
  }
];

export const LoanComparisonCalculator = () => {
  useEffect(() => {
    updatePageMeta(
      'Loan Comparison Calculator — Side-by-Side Payment & Interest Analysis',
      'Compare two loans side-by-side. Calculate monthly payment differences, lifetime interest savings, break-even on discount points, and total costs. Free in-browser tool with zero registration.',
      '/loan-comparison-calculator',
      loanComparisonSchemas
    );
  }, []);

  // Loan A State
  const [loanA, setLoanA] = useState<LoanParameters>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return {
        name: p.get('aName') || 'Loan Option A (e.g. 30-Yr Fixed)',
        loanAmount: p.has('aAmt') ? Number(p.get('aAmt')) : 400000,
        interestRate: p.has('aRate') ? Number(p.get('aRate')) : 6.75,
        termYears: p.has('aTerm') ? Number(p.get('aTerm')) : 30,
        originationPoints: p.has('aPoints') ? Number(p.get('aPoints')) : 0,
        upfrontFees: p.has('aFees') ? Number(p.get('aFees')) : 1500,
        extraMonthlyPayment: p.has('aExtra') ? Number(p.get('aExtra')) : 0
      };
    }
    return {
      name: 'Loan Option A (e.g. 30-Yr Fixed)',
      loanAmount: 400000,
      interestRate: 6.75,
      termYears: 30,
      originationPoints: 0,
      upfrontFees: 1500,
      extraMonthlyPayment: 0
    };
  });

  // Loan B State
  const [loanB, setLoanB] = useState<LoanParameters>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return {
        name: p.get('bName') || 'Loan Option B (e.g. 15-Yr or Lower Rate)',
        loanAmount: p.has('bAmt') ? Number(p.get('bAmt')) : 400000,
        interestRate: p.has('bRate') ? Number(p.get('bRate')) : 5.875,
        termYears: p.has('bTerm') ? Number(p.get('bTerm')) : 15,
        originationPoints: p.has('bPoints') ? Number(p.get('bPoints')) : 1.0,
        upfrontFees: p.has('bFees') ? Number(p.get('bFees')) : 2500,
        extraMonthlyPayment: p.has('bExtra') ? Number(p.get('bExtra')) : 0
      };
    }
    return {
      name: 'Loan Option B (e.g. 15-Yr or Lower Rate)',
      loanAmount: 400000,
      interestRate: 5.875,
      termYears: 15,
      originationPoints: 1.0,
      upfrontFees: 2500,
      extraMonthlyPayment: 0
    };
  });

  const [copied, setCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState<'both' | 'a' | 'b' | 'verdict'>('both');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleCopyLink = () => {
    const params = new URLSearchParams();
    params.set('aAmt', String(loanA.loanAmount));
    params.set('aRate', String(loanA.interestRate));
    params.set('aTerm', String(loanA.termYears));
    if (loanA.originationPoints) params.set('aPoints', String(loanA.originationPoints));
    if (loanA.upfrontFees) params.set('aFees', String(loanA.upfrontFees));
    if (loanA.extraMonthlyPayment) params.set('aExtra', String(loanA.extraMonthlyPayment));

    params.set('bAmt', String(loanB.loanAmount));
    params.set('bRate', String(loanB.interestRate));
    params.set('bTerm', String(loanB.termYears));
    if (loanB.originationPoints) params.set('bPoints', String(loanB.originationPoints));
    if (loanB.upfrontFees) params.set('bFees', String(loanB.upfrontFees));
    if (loanB.extraMonthlyPayment) params.set('bExtra', String(loanB.extraMonthlyPayment));

    const url = `${window.location.origin}/loan-comparison-calculator?${params.toString()}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Computed comparison
  const comparison = useMemo(() => {
    return compareLoans(loanA, loanB);
  }, [loanA, loanB]);

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const summaryData = [
      ['Side-by-Side Loan Comparison Report', 'Generated by TableView.dev'],
      ['Date', new Date().toLocaleDateString()],
      [],
      ['Metric', loanA.name, loanB.name, 'Difference (A - B)'],
      ['Loan Amount', `$${loanA.loanAmount.toLocaleString()}`, `$${loanB.loanAmount.toLocaleString()}`, `$${(loanA.loanAmount - loanB.loanAmount).toLocaleString()}`],
      ['Interest Rate (APR)', `${loanA.interestRate}%`, `${loanB.interestRate}%`, `${(loanA.interestRate - loanB.interestRate).toFixed(3)}%`],
      ['Loan Term', `${loanA.termYears} Years`, `${loanB.termYears} Years`, `${loanA.termYears - loanB.termYears} Years`],
      ['Scheduled Monthly Payment', `$${comparison.loanA.scheduledMonthlyPayment.toLocaleString()}`, `$${comparison.loanB.scheduledMonthlyPayment.toLocaleString()}`, `$${comparison.monthlyPaymentDiff.toFixed(2)}`],
      ['Actual Monthly Payment (w/ Extra)', `$${comparison.loanA.actualMonthlyPayment.toLocaleString()}`, `$${comparison.loanB.actualMonthlyPayment.toLocaleString()}`, `$${comparison.monthlyPaymentDiff.toFixed(2)}`],
      ['Payoff Horizon', `${comparison.loanA.actualYearsToPayoff} Years`, `${comparison.loanB.actualYearsToPayoff} Years`, `${(comparison.loanA.actualYearsToPayoff - comparison.loanB.actualYearsToPayoff).toFixed(1)} Years`],
      ['Upfront Closing Costs & Points', `$${comparison.loanA.upfrontClosingCosts.toLocaleString()}`, `$${comparison.loanB.upfrontClosingCosts.toLocaleString()}`, `$${comparison.upfrontCostDiff.toLocaleString()}`],
      ['Total Lifetime Interest Paid', `$${comparison.loanA.totalInterestPaid.toLocaleString()}`, `$${comparison.loanB.totalInterestPaid.toLocaleString()}`, `$${comparison.totalInterestDiff.toLocaleString()}`],
      ['Total Lifetime Loan Cost', `$${comparison.loanA.totalLoanCost.toLocaleString()}`, `$${comparison.loanB.totalLoanCost.toLocaleString()}`, `$${comparison.totalCostDiff.toLocaleString()}`],
      [],
      ['Decision Recommendation', comparison.recommendation.headline],
      ['Analysis Notes', comparison.recommendation.description]
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Comparison Summary');
    XLSX.writeFile(wb, 'Loan_Comparison_Analysis.xlsx');
  };

  const faqs = [
    {
      q: 'How does this loan comparison calculator decide which loan is better?',
      a: 'The calculator compares both monthly cash flow payments and total lifetime interest costs. If Loan B has a lower interest rate or shorter term, it saves substantial lifetime interest; however, if upfront points or fees are higher, the engine calculates the exact break-even timeline to ensure you stay in the loan long enough to recoup upfront fees.'
    },
    {
      q: 'What is a discount point, and should I pay points for a lower rate?',
      a: 'One discount point costs 1% of your total loan amount and typically lowers your mortgage rate by 0.25%. Paying points makes sense if you plan to hold the loan longer than the break-even period (usually 3 to 5 years).'
    },
    {
      q: 'Does this calculator support extra monthly principal payments?',
      a: 'Yes. You can test adding an extra $50, $100, or $500 monthly to either loan to see how accelerated principal payments shorten the debt horizon and eliminate tens of thousands of dollars in interest.'
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-3">
          <button onClick={() => navigateTo('/')} className="hover:text-indigo-400 transition-colors cursor-pointer">Home</button>
          <span>/</span>
          <button onClick={() => navigateTo('/finance-calculator')} className="hover:text-indigo-400 transition-colors cursor-pointer">Calculators</button>
          <span>/</span>
          <span className="text-slate-200">Loan Comparison</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3">
              <Scale className="size-3.5" />
              <span>Side-by-Side Comparison Modeler</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
              Loan Comparison Calculator
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Compare two loans side-by-side in real time. Analyze monthly payment differences, lifetime interest savings, points break-even timelines, and total cost with 100% private in-browser math.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 cursor-pointer transition-all shadow-sm"
              title="Copy shareable link with current loan parameters"
            >
              {copied ? (
                <>
                  <Check className="size-4 text-emerald-400" />
                  <span className="text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="size-4 text-indigo-400" />
                  <span>Share Link</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportExcel}
              className="btn-primary px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95"
            >
              <Download className="size-4" />
              <span>Export Comparison (.xlsx)</span>
            </button>

            <a
              href="/excel-viewer"
              onClick={(e) => { e.preventDefault(); navigateTo('/excel-viewer'); }}
              className="text-[11px] text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1 sm:self-center"
            >
              <span>No Excel? Free In-Browser Viewer</span>
              <ArrowRight className="size-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Verdict Recommendation Banner */}
      <div className={`p-6 rounded-2xl border mb-8 shadow-xl transition-all ${
        comparison.recommendation.betterOverall !== 'TIE'
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-indigo-500/40 shadow-indigo-500/5'
          : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="size-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Objective Decision Verdict
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
              {comparison.recommendation.headline}
            </h2>
            {comparison.recommendation.subHeadline && (
              <p className="text-xs sm:text-sm text-indigo-300/90 font-medium">
                {comparison.recommendation.subHeadline}
              </p>
            )}
            <p className="text-sm text-slate-300 leading-relaxed">
              {comparison.recommendation.description}
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="grid grid-cols-2 gap-3 shrink-0 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Monthly Diff</span>
              <span className={`text-base font-bold font-mono ${
                comparison.monthlyPaymentDiff > 0 ? 'text-emerald-400' : comparison.monthlyPaymentDiff < 0 ? 'text-amber-400' : 'text-slate-200'
              }`}>
                {comparison.monthlyPaymentDiff > 0
                  ? `-$${comparison.monthlyPaymentDiff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : comparison.monthlyPaymentDiff < 0
                  ? `+$${Math.abs(comparison.monthlyPaymentDiff).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : '$0'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Interest Saved</span>
              <span className="text-base font-bold font-mono text-emerald-400">
                ${Math.abs(comparison.totalInterestDiff).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Segmented Switcher */}
      <div className="flex lg:hidden items-center p-1 bg-slate-900/90 border border-slate-800 rounded-xl mb-6 text-xs font-semibold sticky top-16 z-20 backdrop-blur-md">
        <button
          onClick={() => setMobileTab('both')}
          className={`flex-1 py-2 text-center rounded-lg transition-colors cursor-pointer ${mobileTab === 'both' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Both
        </button>
        <button
          onClick={() => setMobileTab('a')}
          className={`flex-1 py-2 text-center rounded-lg transition-colors cursor-pointer ${mobileTab === 'a' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Option A
        </button>
        <button
          onClick={() => setMobileTab('b')}
          className={`flex-1 py-2 text-center rounded-lg transition-colors cursor-pointer ${mobileTab === 'b' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Option B
        </button>
        <button
          onClick={() => setMobileTab('verdict')}
          className={`flex-1 py-2 text-center rounded-lg transition-colors cursor-pointer ${mobileTab === 'verdict' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Breakdown
        </button>
      </div>

      {/* Side-by-Side Input Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Loan A Card */}
        <div className={`p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between ${mobileTab === 'b' || mobileTab === 'verdict' ? 'hidden lg:flex' : 'flex'}`}>
          <div>
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
              <input
                type="text"
                value={loanA.name}
                onChange={(e) => setLoanA({ ...loanA, name: e.target.value })}
                className="bg-transparent text-lg font-bold text-indigo-300 focus:outline-none focus:border-b border-indigo-400 w-full"
              />
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-400 border border-indigo-800/60 shrink-0 ml-2">
                Option A
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Loan Amount ($)</label>
                <CurrencyInput
                  value={loanA.loanAmount}
                  onChange={(val) => setLoanA({ ...loanA, loanAmount: val })}
                  className="focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Interest Rate (APR %)</label>
                  <NumericInput
                    value={loanA.interestRate}
                    onChange={(val) => setLoanA({ ...loanA, interestRate: val })}
                    suffix="%"
                    className="focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Loan Term (Years)</label>
                  <select
                    value={loanA.termYears}
                    onChange={(e) => setLoanA({ ...loanA, termYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-slate-100 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value={10}>10 Years</option>
                    <option value={15}>15 Years</option>
                    <option value={20}>20 Years</option>
                    <option value={25}>25 Years</option>
                    <option value={30}>30 Years</option>
                    <option value={40}>40 Years</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Points (%)</label>
                  <NumericInput
                    value={loanA.originationPoints}
                    onChange={(val) => setLoanA({ ...loanA, originationPoints: val })}
                    suffix="%"
                    className="focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Upfront Fees ($)</label>
                  <CurrencyInput
                    value={loanA.upfrontFees}
                    onChange={(val) => setLoanA({ ...loanA, upfrontFees: val })}
                    className="focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Extra Monthly Principal ($)</label>
                <CurrencyInput
                  value={loanA.extraMonthlyPayment}
                  onChange={(val) => setLoanA({ ...loanA, extraMonthlyPayment: val })}
                  className="focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Loan A Result Summary Footer */}
          <div className="mt-8 pt-5 border-t border-slate-800 bg-slate-950/40 -mx-6 -mb-6 p-6 rounded-b-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Monthly Payment</span>
              <span className="text-xl font-bold font-mono text-slate-100">
                ${comparison.loanA.actualMonthlyPayment.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Interest Paid</span>
              <span className="font-mono text-slate-300">${comparison.loanA.totalInterestPaid.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Upfront Costs</span>
              <span className="font-mono text-slate-300">${comparison.loanA.upfrontClosingCosts.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60 font-semibold">
              <span className="text-slate-300">Total Lifetime Cost</span>
              <span className="font-mono text-indigo-300">${comparison.loanA.totalLoanCost.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Loan B Card */}
        <div className={`p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between ${mobileTab === 'a' || mobileTab === 'verdict' ? 'hidden lg:flex' : 'flex'}`}>
          <div>
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
              <input
                type="text"
                value={loanB.name}
                onChange={(e) => setLoanB({ ...loanB, name: e.target.value })}
                className="bg-transparent text-lg font-bold text-emerald-300 focus:outline-none focus:border-b border-emerald-400 w-full"
              />
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shrink-0 ml-2">
                Option B
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Loan Amount ($)</label>
                <CurrencyInput
                  value={loanB.loanAmount}
                  onChange={(val) => setLoanB({ ...loanB, loanAmount: val })}
                  className="focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Interest Rate (APR %)</label>
                  <NumericInput
                    value={loanB.interestRate}
                    onChange={(val) => setLoanB({ ...loanB, interestRate: val })}
                    suffix="%"
                    className="focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Loan Term (Years)</label>
                  <select
                    value={loanB.termYears}
                    onChange={(e) => setLoanB({ ...loanB, termYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value={10}>10 Years</option>
                    <option value={15}>15 Years</option>
                    <option value={20}>20 Years</option>
                    <option value={25}>25 Years</option>
                    <option value={30}>30 Years</option>
                    <option value={40}>40 Years</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Points (%)</label>
                  <NumericInput
                    value={loanB.originationPoints}
                    onChange={(val) => setLoanB({ ...loanB, originationPoints: val })}
                    suffix="%"
                    className="focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Upfront Fees ($)</label>
                  <CurrencyInput
                    value={loanB.upfrontFees}
                    onChange={(val) => setLoanB({ ...loanB, upfrontFees: val })}
                    className="focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Extra Monthly Principal ($)</label>
                <CurrencyInput
                  value={loanB.extraMonthlyPayment}
                  onChange={(val) => setLoanB({ ...loanB, extraMonthlyPayment: val })}
                  className="focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Loan B Result Summary Footer */}
          <div className="mt-8 pt-5 border-t border-slate-800 bg-slate-950/40 -mx-6 -mb-6 p-6 rounded-b-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Monthly Payment</span>
              <span className="text-xl font-bold font-mono text-slate-100">
                ${comparison.loanB.actualMonthlyPayment.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Interest Paid</span>
              <span className="font-mono text-slate-300">${comparison.loanB.totalInterestPaid.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Upfront Costs</span>
              <span className="font-mono text-slate-300">${comparison.loanB.upfrontClosingCosts.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60 font-semibold">
              <span className="text-slate-300">Total Lifetime Cost</span>
              <span className="font-mono text-emerald-300">${comparison.loanB.totalLoanCost.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Metric Comparison Table */}
      <div className={`mb-14 rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg ${mobileTab === 'a' || mobileTab === 'b' ? 'hidden lg:block' : 'block'}`}>
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100">Side-by-Side Detailed Breakdown</h3>
          <span className="text-xs text-slate-400 font-mono">100% In-Memory Calculation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400 bg-slate-950/40">
                <th className="p-4 font-semibold">Evaluation Criteria</th>
                <th className="p-4 font-semibold text-indigo-300">{loanA.name}</th>
                <th className="p-4 font-semibold text-emerald-300">{loanB.name}</th>
                <th className="p-4 font-semibold text-right">Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              <tr className="hover:bg-slate-900/40">
                <td className="p-4 font-medium text-slate-200">Scheduled Monthly Payment (P&I)</td>
                <td className="p-4 font-mono text-slate-100">${comparison.loanA.scheduledMonthlyPayment.toLocaleString()}</td>
                <td className="p-4 font-mono text-slate-100">${comparison.loanB.scheduledMonthlyPayment.toLocaleString()}</td>
                <td className="p-4 font-mono text-right text-slate-300">
                  {comparison.monthlyPaymentDiff > 0 ? `Option B saves $${comparison.monthlyPaymentDiff.toFixed(2)}/mo` : comparison.monthlyPaymentDiff < 0 ? `Option A saves $${Math.abs(comparison.monthlyPaymentDiff).toFixed(2)}/mo` : 'Equal'}
                </td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="p-4 font-medium text-slate-200">Total Lifetime Interest</td>
                <td className="p-4 font-mono text-slate-100">${comparison.loanA.totalInterestPaid.toLocaleString()}</td>
                <td className="p-4 font-mono text-slate-100">${comparison.loanB.totalInterestPaid.toLocaleString()}</td>
                <td className="p-4 font-mono text-right font-semibold text-emerald-400">
                  ${Math.abs(comparison.totalInterestDiff).toLocaleString()} {comparison.totalInterestDiff > 0 ? 'less with B' : 'less with A'}
                </td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="p-4 font-medium text-slate-200">Upfront Points & Closing Fees</td>
                <td className="p-4 font-mono text-slate-100">${comparison.loanA.upfrontClosingCosts.toLocaleString()}</td>
                <td className="p-4 font-mono text-slate-100">${comparison.loanB.upfrontClosingCosts.toLocaleString()}</td>
                <td className="p-4 font-mono text-right text-slate-300">${Math.abs(comparison.upfrontCostDiff).toLocaleString()} diff</td>
              </tr>
              {comparison.breakEvenMonths && (
                <tr className="bg-indigo-950/20 hover:bg-indigo-950/30">
                  <td className="p-4 font-medium text-indigo-200">Points Break-Even Horizon</td>
                  <td colSpan={2} className="p-4 text-xs text-indigo-300">
                    Lower monthly payment recoups higher upfront closing fees in:
                  </td>
                  <td className="p-4 font-mono font-bold text-right text-emerald-400">
                    ~{comparison.breakEvenMonths} Months ({(comparison.breakEvenMonths / 12).toFixed(1)} Years)
                  </td>
                </tr>
              )}
              <tr className="hover:bg-slate-900/40 font-bold bg-slate-950/60">
                <td className="p-4 text-slate-100">Total Lifetime Out-of-Pocket Cost</td>
                <td className="p-4 font-mono text-indigo-300">${comparison.loanA.totalLoanCost.toLocaleString()}</td>
                <td className="p-4 font-mono text-emerald-300">${comparison.loanB.totalLoanCost.toLocaleString()}</td>
                <td className="p-4 font-mono text-right text-emerald-400 font-extrabold">
                  ${Math.abs(comparison.totalCostDiff).toLocaleString()} {comparison.totalCostDiff > 0 ? 'Savings on B' : 'Savings on A'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Related Calculators Cross-Sell */}
      <div className="mb-12">
        <RelatedCalculators currentSlug="loan-comparison-calculator" category="real-estate" />
      </div>

      {/* FAQs */}
      <div className="max-w-3xl mx-auto mb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 text-center mb-6">
          Loan Comparison FAQs
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm font-semibold text-slate-200">{faq.q}</span>
                  <ChevronDown className={`size-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <MethodologyDisclosure type="loanComparison" />
      <AdSlot className="mt-8" />
    </div>
  );
};

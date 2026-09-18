import { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Scale,
  Download,
  CheckCircle2,
  ChevronDown,
  Share2,
  Check,
  ArrowRight,
  Sparkles,
  Building2
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
import { PmmsRateTicker } from '../components/PmmsRateTicker';
import { LATEST_PMMS_RATES } from '../data/pmmsRates';
import { AdSlot } from '../components/AdSlot';
import {
  CalculatorPresetsBar,
  type CalculatorPreset,
  PrintReportButton,
  PrintableReportHeader,
  ComparisonBarChart,
  PageHeader,
} from '../components/calculator-kit';
import { SuiteSubNav } from '../components/SuiteSubNav';
import { LenderReadyDossierModal } from '../components/LenderReadyDossierModal';
import { ProBrandingModal } from '../components/ProBrandingModal';
import { InfoTooltip } from '../components/InfoTooltip';

const LOAN_PRESETS: CalculatorPreset<{ a: LoanParameters; b: LoanParameters }>[] = [
  {
    id: '30vs15',
    label: '30-Yr Fixed vs 15-Yr Fixed',
    badge: 'Most Popular',
    description: 'Compare standard 30-year payment flexibility against 15-year interest savings',
    values: {
      a: { name: 'Option A (30-Yr Fixed)', loanAmount: 400000, interestRate: 6.75, termYears: 30, originationPoints: 0, upfrontFees: 1500, extraMonthlyPayment: 0 },
      b: { name: 'Option B (15-Yr Fixed)', loanAmount: 400000, interestRate: 5.875, termYears: 15, originationPoints: 0, upfrontFees: 1500, extraMonthlyPayment: 0 },
    },
  },
  {
    id: 'points-buydown',
    label: 'Zero Points vs 2 Points Buy-down',
    badge: 'Break-even',
    description: 'See whether paying upfront points to lower the interest rate pays off',
    values: {
      a: { name: 'Option A (Zero Points)', loanAmount: 450000, interestRate: 7.00, termYears: 30, originationPoints: 0, upfrontFees: 2000, extraMonthlyPayment: 0 },
      b: { name: 'Option B (2 Points @ 6.25%)', loanAmount: 450000, interestRate: 6.25, termYears: 30, originationPoints: 2, upfrontFees: 2000, extraMonthlyPayment: 0 },
    },
  },
  {
    id: 'arm-vs-fixed',
    label: '7/1 ARM vs 30-Yr Fixed',
    badge: 'Rate Spread',
    description: 'Compare introductory ARM savings against 30-year fixed rate stability',
    values: {
      a: { name: 'Option A (30-Yr Fixed)', loanAmount: 500000, interestRate: 6.875, termYears: 30, originationPoints: 0, upfrontFees: 2500, extraMonthlyPayment: 0 },
      b: { name: 'Option B (7/1 ARM @ 5.75%)', loanAmount: 500000, interestRate: 5.75, termYears: 30, originationPoints: 0, upfrontFees: 2500, extraMonthlyPayment: 0 },
    },
  },
  {
    id: 'jumbo-downpayment',
    label: '10% Down vs 20% Down',
    badge: 'Cash Flow',
    description: 'Evaluate preserving cash at closing vs eliminating debt burden',
    values: {
      a: { name: 'Option A (10% Down)', loanAmount: 540000, interestRate: 6.85, termYears: 30, originationPoints: 0, upfrontFees: 3000, extraMonthlyPayment: 0 },
      b: { name: 'Option B (20% Down)', loanAmount: 480000, interestRate: 6.50, termYears: 30, originationPoints: 0, upfrontFees: 3000, extraMonthlyPayment: 0 },
    },
  },
];

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
      'Loan Comparison Calculator: Side-by-Side Payment & Interest Analysis',
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
  const [activePresetId, setActivePresetId] = useState<string | null>('30vs15');
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [showBrandingModal, setShowBrandingModal] = useState(false);

  const handleSelectPreset = (preset: CalculatorPreset<{ a: LoanParameters; b: LoanParameters }>) => {
    setActivePresetId(preset.id);
    if (preset.values?.a) setLoanA(preset.values.a);
    if (preset.values?.b) setLoanB(preset.values.b);
  };

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
      ['CFPB Loan Estimate (LE) Benchmarks', '', '', ''],
      ['In 5 Years: Total Payments', `$${comparison.loanA.in5YearsTotalPaid.toLocaleString()}`, `$${comparison.loanB.in5YearsTotalPaid.toLocaleString()}`, `$${(comparison.loanA.in5YearsTotalPaid - comparison.loanB.in5YearsTotalPaid).toLocaleString()}`],
      ['In 5 Years: Principal Paid Off (Equity)', `$${comparison.loanA.in5YearsPrincipalPaid.toLocaleString()}`, `$${comparison.loanB.in5YearsPrincipalPaid.toLocaleString()}`, `$${(comparison.loanA.in5YearsPrincipalPaid - comparison.loanB.in5YearsPrincipalPaid).toLocaleString()}`],
      ['In 5 Years: Net Borrowing Cost', `$${comparison.loanA.in5YearsNetCost.toLocaleString()}`, `$${comparison.loanB.in5YearsNetCost.toLocaleString()}`, `$${comparison.in5YearsNetCostDiff.toLocaleString()}`],
      ['Total Interest Percentage (TIP)', `${comparison.loanA.totalInterestPercentage}%`, `${comparison.loanB.totalInterestPercentage}%`, `${(comparison.loanA.totalInterestPercentage - comparison.loanB.totalInterestPercentage).toFixed(2)}%`],
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
      {/* Printable Executive Brief Header */}
      <PrintableReportHeader
        title="Side-by-Side Loan Comparison Report"
        subtitle="100% Private In-Browser Payment & Lifetime Cost Analysis"
        referenceId={`LC-${Math.round(loanA.loanAmount / 1000)}k-vs-${Math.round(loanB.loanAmount / 1000)}k`}
      />

      {/* Header & Breadcrumb */}
      <PageHeader
        breadcrumbs={[
          { label: 'Calculators', path: '/finance-calculator' },
          { label: 'Loan Comparison' }
        ]}
        badge={{
          icon: Scale,
          label: 'Side-by-Side Comparison Modeler',
          tone: 'indigo'
        }}
        title="Loan Comparison Calculator"
        description="Compare two loans side-by-side in real time. Analyze monthly payment differences, lifetime interest savings, points break-even timelines, and total cost with 100% private in-browser math."
        actions={
          <>
            <PrintReportButton />
            <button
              type="button"
              onClick={() => setShowDossierModal(true)}
              className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs hover:shadow-amber-500/20 transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5 shrink-0"
              title="Download official CFPB QM pre-approval PDF & live formulas Excel spreadsheet"
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
            <button
              type="button"
              onClick={handleCopyLink}
              className="h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer transition-all shadow-xs active:scale-95 shrink-0"
              title="Copy shareable link with current loan parameters"
            >
              {copied ? (
                <>
                  <Check className="size-4 text-emerald-600" />
                  <span className="text-emerald-600">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="size-4 text-indigo-600" />
                  <span>Share Link</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="btn-primary h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-xs cursor-pointer transition-transform active:scale-95 shrink-0"
            >
              <Download className="size-4" />
              <span>Export Comparison (.xlsx)</span>
            </button>
          </>
        }
      />

      <SuiteSubNav suite="mortgage" />

      {/* Main Verdict Recommendation Banner */}
      <div className={`p-6 rounded-2xl border mb-8 shadow-xs transition-all ${
        comparison.recommendation.betterOverall !== 'TIE'
          ? 'bg-gradient-to-r from-indigo-50/70 via-indigo-50/40 to-slate-50 border-indigo-200 shadow-indigo-100/50'
          : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="size-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Objective Decision Verdict
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {comparison.recommendation.headline}
            </h2>
            {comparison.recommendation.subHeadline && (
              <p className="text-xs sm:text-sm text-indigo-700 font-medium">
                {comparison.recommendation.subHeadline}
              </p>
            )}
            <p className="text-sm text-slate-600 leading-relaxed">
              {comparison.recommendation.description}
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <span className="text-[11px] text-slate-500 block font-medium">Monthly Diff</span>
              <span className={`text-base font-bold font-mono ${
                comparison.monthlyPaymentDiff > 0 ? 'text-emerald-600' : comparison.monthlyPaymentDiff < 0 ? 'text-amber-600' : 'text-slate-800'
              }`}>
                {comparison.monthlyPaymentDiff > 0
                  ? `-$${comparison.monthlyPaymentDiff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : comparison.monthlyPaymentDiff < 0
                  ? `+$${Math.abs(comparison.monthlyPaymentDiff).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : '$0'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block font-medium">5-Yr Net Savings</span>
              <span className={`text-base font-bold font-mono ${
                comparison.in5YearsNetCostDiff !== 0 ? 'text-emerald-600' : 'text-slate-800'
              }`}>
                ${Math.abs(comparison.in5YearsNetCostDiff).toLocaleString()}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-500 block font-medium">Lifetime Cost Saved</span>
              <span className="text-base font-bold font-mono text-emerald-600">
                ${Math.abs(comparison.totalCostDiff).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Interactive Comparison Chart */}
      <div className="mb-8">
        <ComparisonBarChart
          loanA={{
            name: loanA.name,
            actualMonthlyPayment: comparison.loanA.actualMonthlyPayment,
            totalInterestPaid: comparison.loanA.totalInterestPaid,
            totalLoanCost: comparison.loanA.totalLoanCost,
            upfrontClosingCosts: comparison.loanA.upfrontClosingCosts,
          }}
          loanB={{
            name: loanB.name,
            actualMonthlyPayment: comparison.loanB.actualMonthlyPayment,
            totalInterestPaid: comparison.loanB.totalInterestPaid,
            totalLoanCost: comparison.loanB.totalLoanCost,
            upfrontClosingCosts: comparison.loanB.upfrontClosingCosts,
          }}
        />
      </div>

      {/* Scenario Presets Bar */}
      <div className="print:hidden">
        <CalculatorPresetsBar
          presets={LOAN_PRESETS}
          activeId={activePresetId}
          onSelect={handleSelectPreset}
          title="Scenario Presets"
        />
      </div>

      {/* Mobile Segmented Switcher */}
      <div className="flex lg:hidden print:hidden items-center p-1 bg-white border border-slate-300 rounded-xl mb-6 text-xs font-semibold sticky top-16 z-20 backdrop-blur-md shadow-sm">
        <button
          onClick={() => setMobileTab('both')}
          className={`flex-1 py-2 text-center rounded-lg transition-colors cursor-pointer ${mobileTab === 'both' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Both
        </button>
        <button
          onClick={() => setMobileTab('a')}
          className={`flex-1 py-2 text-center rounded-lg transition-colors cursor-pointer ${mobileTab === 'a' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Option A
        </button>
        <button
          onClick={() => setMobileTab('b')}
          className={`flex-1 py-2 text-center rounded-lg transition-colors cursor-pointer ${mobileTab === 'b' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Option B
        </button>
        <button
          onClick={() => setMobileTab('verdict')}
          className={`flex-1 py-2 text-center rounded-lg transition-colors cursor-pointer ${mobileTab === 'verdict' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Breakdown
        </button>
      </div>

      {/* Freddie Mac PMMS Benchmark Rate Bar */}
      <div className="mb-6 print:hidden">
        <PmmsRateTicker
          onSelectRate={(rate, term) => {
            if (term === 15) {
              setLoanB({
                ...loanB,
                name: 'Option B (15-Yr Fixed)',
                interestRate: rate,
                termYears: 15
              });
            } else {
              setLoanA({
                ...loanA,
                name: 'Option A (30-Yr Fixed)',
                interestRate: rate,
                termYears: 30
              });
            }
          }}
        />
      </div>

      {/* Side-by-Side Input Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Loan A Card */}
        <div className={`p-6 rounded-2xl bg-white border border-slate-300 border-t-4 border-t-indigo-600 shadow-sm flex flex-col justify-between ${mobileTab === 'b' || mobileTab === 'verdict' ? 'hidden lg:flex' : 'flex'}`}>
          <div>
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200">
              <input
                type="text"
                value={loanA.name}
                onChange={(e) => setLoanA({ ...loanA, name: e.target.value })}
                className="bg-transparent text-lg font-bold text-indigo-700 focus:outline-none focus:border-b border-indigo-500 w-full"
              />
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white font-bold shrink-0 ml-2 shadow-2xs">
                Option A
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Loan Amount ($)</label>
                <CurrencyInput
                  value={loanA.loanAmount}
                  onChange={(val) => setLoanA({ ...loanA, loanAmount: val })}
                  className="focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-700">Interest Rate (%)</label>
                    <button
                      type="button"
                      onClick={() => setLoanA({ ...loanA, interestRate: LATEST_PMMS_RATES.fixed30.rate })}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline"
                      title="Apply Freddie Mac PMMS 30Y Conforming Benchmark"
                    >
                      PMMS {LATEST_PMMS_RATES.fixed30.rate}%
                    </button>
                  </div>
                  <NumericInput
                    value={loanA.interestRate}
                    onChange={(val) => setLoanA({ ...loanA, interestRate: val })}
                    suffix="%"
                    className="focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Loan Term (Years)</label>
                  <select
                    value={loanA.termYears}
                    onChange={(e) => setLoanA({ ...loanA, termYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
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
                  <div className="flex items-center gap-1 mb-1.5">
                    <label className="block text-xs font-medium text-slate-700">Points (%)</label>
                    <InfoTooltip
                      title="Discount Points"
                      content="1 point = 1% of loan amount paid at closing to lower the rate. Helpful if you stay in the home past the break-even date."
                    />
                  </div>
                  <NumericInput
                    value={loanA.originationPoints}
                    onChange={(val) => setLoanA({ ...loanA, originationPoints: val })}
                    suffix="%"
                    className="focus:border-indigo-500"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <label className="block text-xs font-medium text-slate-700">Upfront Fees ($)</label>
                    <InfoTooltip
                      title="Closing Fees"
                      content="Lender underwriting, appraisal, credit report, and title fees due at closing (excluding points)."
                    />
                  </div>
                  <CurrencyInput
                    value={loanA.upfrontFees}
                    onChange={(val) => setLoanA({ ...loanA, upfrontFees: val })}
                    className="focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Extra Monthly Principal ($)</label>
                <CurrencyInput
                  value={loanA.extraMonthlyPayment}
                  onChange={(val) => setLoanA({ ...loanA, extraMonthlyPayment: val })}
                  className="focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Loan A Result Summary Footer */}
          <div className="mt-8 pt-5 border-t border-indigo-200 bg-indigo-50/50 -mx-6 -mb-6 p-6 rounded-b-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-indigo-900/70 font-medium">Monthly Payment</span>
              <span className="text-xl font-black font-mono text-indigo-950">
                ${comparison.loanA.actualMonthlyPayment.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-indigo-900/70 font-medium">Total Interest Paid</span>
              <span className="font-mono text-slate-800 font-semibold">${comparison.loanA.totalInterestPaid.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-indigo-900/70 font-medium">Upfront Costs</span>
              <span className="font-mono text-slate-800 font-semibold">${comparison.loanA.upfrontClosingCosts.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-indigo-200 font-semibold">
              <span className="text-indigo-950">Total Lifetime Cost</span>
              <span className="font-mono text-indigo-700 font-bold">${comparison.loanA.totalLoanCost.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Loan B Card */}
        <div className={`p-6 rounded-2xl bg-white border border-slate-300 border-t-4 border-t-emerald-600 shadow-sm flex flex-col justify-between ${mobileTab === 'a' || mobileTab === 'verdict' ? 'hidden lg:flex' : 'flex'}`}>
          <div>
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200">
              <input
                type="text"
                value={loanB.name}
                onChange={(e) => setLoanB({ ...loanB, name: e.target.value })}
                className="bg-transparent text-lg font-bold text-emerald-700 focus:outline-none focus:border-b border-emerald-500 w-full"
              />
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-bold shrink-0 ml-2 shadow-2xs">
                Option B
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Loan Amount ($)</label>
                <CurrencyInput
                  value={loanB.loanAmount}
                  onChange={(val) => setLoanB({ ...loanB, loanAmount: val })}
                  className="focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-700">Interest Rate (%)</label>
                    <button
                      type="button"
                      onClick={() => setLoanB({ ...loanB, interestRate: LATEST_PMMS_RATES.fixed15.rate })}
                      className="text-[10px] text-emerald-600 hover:text-emerald-800 font-semibold cursor-pointer underline"
                      title="Apply Freddie Mac PMMS 15Y Conforming Benchmark"
                    >
                      PMMS {LATEST_PMMS_RATES.fixed15.rate}%
                    </button>
                  </div>
                  <NumericInput
                    value={loanB.interestRate}
                    onChange={(val) => setLoanB({ ...loanB, interestRate: val })}
                    suffix="%"
                    className="focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Loan Term (Years)</label>
                  <select
                    value={loanB.termYears}
                    onChange={(e) => setLoanB({ ...loanB, termYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none"
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
                  <div className="flex items-center gap-1 mb-1.5">
                    <label className="block text-xs font-medium text-slate-700">Points (%)</label>
                    <InfoTooltip
                      title="Discount Points"
                      content="1 point = 1% of loan amount paid at closing to lower the rate. Helpful if you stay in the home past the break-even date."
                    />
                  </div>
                  <NumericInput
                    value={loanB.originationPoints}
                    onChange={(val) => setLoanB({ ...loanB, originationPoints: val })}
                    suffix="%"
                    className="focus:border-emerald-500"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <label className="block text-xs font-medium text-slate-700">Upfront Fees ($)</label>
                    <InfoTooltip
                      title="Closing Fees"
                      content="Lender underwriting, appraisal, credit report, and title fees due at closing (excluding points)."
                    />
                  </div>
                  <CurrencyInput
                    value={loanB.upfrontFees}
                    onChange={(val) => setLoanB({ ...loanB, upfrontFees: val })}
                    className="focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Extra Monthly Principal ($)</label>
                <CurrencyInput
                  value={loanB.extraMonthlyPayment}
                  onChange={(val) => setLoanB({ ...loanB, extraMonthlyPayment: val })}
                  className="focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Loan B Result Summary Footer */}
          <div className="mt-8 pt-5 border-t border-emerald-200 bg-emerald-50/50 -mx-6 -mb-6 p-6 rounded-b-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-900/70 font-medium">Monthly Payment</span>
              <span className="text-xl font-black font-mono text-emerald-950">
                ${comparison.loanB.actualMonthlyPayment.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-900/70 font-medium">Total Interest Paid</span>
              <span className="font-mono text-slate-800 font-semibold">${comparison.loanB.totalInterestPaid.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-900/70 font-medium">Upfront Costs</span>
              <span className="font-mono text-slate-800 font-semibold">${comparison.loanB.upfrontClosingCosts.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-emerald-200 font-semibold">
              <span className="text-emerald-950">Total Lifetime Cost</span>
              <span className="font-mono text-emerald-700 font-bold">${comparison.loanB.totalLoanCost.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Metric Comparison Table */}
      <div className={`mb-14 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs print:block ${mobileTab === 'a' || mobileTab === 'b' ? 'hidden lg:block' : 'block'}`}>
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Side-by-Side Detailed Breakdown</h3>
          <span className="text-xs text-slate-500 font-mono">100% In-Memory Calculation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-600 bg-slate-50/50">
                <th className="p-4 font-semibold">Evaluation Criteria</th>
                <th className="p-4 font-semibold text-indigo-700">{loanA.name}</th>
                <th className="p-4 font-semibold text-emerald-700">{loanB.name}</th>
                <th className="p-4 font-semibold text-right">Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-medium text-slate-900">Scheduled Monthly Payment (P&I)</td>
                <td className="p-4 font-mono text-slate-800">${comparison.loanA.scheduledMonthlyPayment.toLocaleString()}</td>
                <td className="p-4 font-mono text-slate-800">${comparison.loanB.scheduledMonthlyPayment.toLocaleString()}</td>
                <td className="p-4 font-mono text-right text-slate-600">
                  {comparison.monthlyPaymentDiff > 0 ? `Option B saves $${comparison.monthlyPaymentDiff.toFixed(2)}/mo` : comparison.monthlyPaymentDiff < 0 ? `Option A saves $${Math.abs(comparison.monthlyPaymentDiff).toFixed(2)}/mo` : 'Equal'}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-medium text-slate-900">Total Lifetime Interest</td>
                <td className="p-4 font-mono text-slate-800">${comparison.loanA.totalInterestPaid.toLocaleString()}</td>
                <td className="p-4 font-mono text-slate-800">${comparison.loanB.totalInterestPaid.toLocaleString()}</td>
                <td className="p-4 font-mono text-right font-semibold text-emerald-600">
                  ${Math.abs(comparison.totalInterestDiff).toLocaleString()} {comparison.totalInterestDiff > 0 ? 'less with B' : 'less with A'}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-medium text-slate-900">Upfront Points & Closing Fees</td>
                <td className="p-4 font-mono text-slate-800">${comparison.loanA.upfrontClosingCosts.toLocaleString()}</td>
                <td className="p-4 font-mono text-slate-800">${comparison.loanB.upfrontClosingCosts.toLocaleString()}</td>
                <td className="p-4 font-mono text-right text-slate-600">${Math.abs(comparison.upfrontCostDiff).toLocaleString()} diff</td>
              </tr>
              {comparison.breakEvenMonths && (
                <tr className="bg-indigo-50/70 hover:bg-indigo-50 transition-colors">
                  <td className="p-4 font-medium text-indigo-900">
                    <div className="flex items-center gap-1">
                      <span>Points Break-Even Horizon</span>
                      <InfoTooltip
                        title="Points Break-Even Horizon"
                        content="The time it takes for monthly savings from a lower interest rate to recoup the extra upfront points paid at closing."
                      />
                    </div>
                  </td>
                  <td colSpan={2} className="p-4 text-xs text-indigo-800">
                    Lower monthly payment recoups higher upfront closing fees in:
                  </td>
                  <td className="p-4 font-mono font-bold text-right text-emerald-600">
                    ~{comparison.breakEvenMonths} Months ({(comparison.breakEvenMonths / 12).toFixed(1)} Years)
                  </td>
                </tr>
              )}
              <tr className="hover:bg-slate-50/80 font-bold bg-slate-50/70 transition-colors">
                <td className="p-4 text-slate-900">Total Lifetime Out-of-Pocket Cost</td>
                <td className="p-4 font-mono text-indigo-700">${comparison.loanA.totalLoanCost.toLocaleString()}</td>
                <td className="p-4 font-mono text-emerald-700">${comparison.loanB.totalLoanCost.toLocaleString()}</td>
                <td className="p-4 font-mono text-right text-emerald-600 font-extrabold">
                  ${Math.abs(comparison.totalCostDiff).toLocaleString()} {comparison.totalCostDiff > 0 ? 'Savings on B' : 'Savings on A'}
                </td>
              </tr>

              {/* CFPB Loan Estimate (LE) Page 3 Benchmarks */}
              <tr className="bg-slate-100/90 border-t-2 border-slate-300">
                <td colSpan={4} className="p-3 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  CFPB Loan Estimate (LE) Page 3 Benchmarks (5-Year Horizon & TIP)
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-medium text-slate-900">
                  <span>In 5 Years: Total Payments Made</span>
                  <span className="text-[10px] text-slate-500 block">Total P&I payments made over the first 60 months</span>
                </td>
                <td className="p-4 font-mono text-slate-800">${comparison.loanA.in5YearsTotalPaid.toLocaleString()}</td>
                <td className="p-4 font-mono text-slate-800">${comparison.loanB.in5YearsTotalPaid.toLocaleString()}</td>
                <td className="p-4 font-mono text-right text-slate-600">
                  {comparison.loanA.in5YearsTotalPaid !== comparison.loanB.in5YearsTotalPaid
                    ? `$${Math.abs(comparison.loanA.in5YearsTotalPaid - comparison.loanB.in5YearsTotalPaid).toLocaleString()} ${comparison.loanA.in5YearsTotalPaid > comparison.loanB.in5YearsTotalPaid ? 'less with B' : 'less with A'}`
                    : 'Equal'}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-medium text-slate-900">
                  <span>In 5 Years: Principal Paid Off (Equity Built)</span>
                  <span className="text-[10px] text-slate-500 block">Debt eliminated and converted to home equity</span>
                </td>
                <td className="p-4 font-mono font-semibold text-indigo-700">${comparison.loanA.in5YearsPrincipalPaid.toLocaleString()}</td>
                <td className="p-4 font-mono font-semibold text-emerald-700">${comparison.loanB.in5YearsPrincipalPaid.toLocaleString()}</td>
                <td className="p-4 font-mono text-right font-semibold text-emerald-600">
                  ${Math.abs(comparison.loanA.in5YearsPrincipalPaid - comparison.loanB.in5YearsPrincipalPaid).toLocaleString()} {comparison.loanB.in5YearsPrincipalPaid > comparison.loanA.in5YearsPrincipalPaid ? 'more equity with B' : 'more equity with A'}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-medium text-slate-900">
                  <span>In 5 Years: Net Cost of Borrowing</span>
                  <span className="text-[10px] text-slate-500 block">Interest + Upfront Fees minus Equity Built</span>
                </td>
                <td className="p-4 font-mono text-slate-800">${comparison.loanA.in5YearsNetCost.toLocaleString()}</td>
                <td className="p-4 font-mono text-slate-800">${comparison.loanB.in5YearsNetCost.toLocaleString()}</td>
                <td className="p-4 font-mono text-right font-bold text-emerald-600">
                  ${Math.abs(comparison.in5YearsNetCostDiff).toLocaleString()} {comparison.in5YearsNetCostDiff > 0 ? 'lower net cost on B' : 'lower net cost on A'}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-medium text-slate-900">5-Year Ending Balance (Month 60)</td>
                <td className="p-4 font-mono text-slate-800">${comparison.loanA.in5YearsEndingBalance.toLocaleString()}</td>
                <td className="p-4 font-mono text-slate-800">${comparison.loanB.in5YearsEndingBalance.toLocaleString()}</td>
                <td className="p-4 font-mono text-right text-slate-600">
                  ${Math.abs(comparison.loanA.in5YearsEndingBalance - comparison.loanB.in5YearsEndingBalance).toLocaleString()} diff
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-medium text-slate-900">
                  <div className="flex items-center gap-1">
                    <span>Total Interest Percentage (TIP)</span>
                    <InfoTooltip
                      title="CFPB Total Interest Percentage (TIP)"
                      content="Mandated on Page 3 of the CFPB Loan Estimate. Shows total interest paid over the life of the loan as a percentage of the amount borrowed."
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block">CFPB federal benchmark: total interest as % of loan amount</span>
                </td>
                <td className="p-4 font-mono text-slate-800 font-semibold">{comparison.loanA.totalInterestPercentage}%</td>
                <td className="p-4 font-mono text-slate-800 font-semibold">{comparison.loanB.totalInterestPercentage}%</td>
                <td className="p-4 font-mono text-right text-slate-600 font-medium">
                  {Math.abs(comparison.loanA.totalInterestPercentage - comparison.loanB.totalInterestPercentage).toFixed(2)}% spread
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* In-Browser Excel Viewer contextual link */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 print:hidden">
          <span>Need to inspect or customize your exported comparison spreadsheet?</span>
          <a
            href="/excel-viewer"
            onClick={(e) => { e.preventDefault(); navigateTo('/excel-viewer'); }}
            className="text-indigo-600 hover:text-indigo-700 transition-colors inline-flex items-center gap-1 font-semibold"
          >
            <span>Open in Free In-Browser Excel Viewer</span>
            <ArrowRight className="size-3" />
          </a>
        </div>
      </div>

      {/* Related Calculators Cross-Sell */}
      <div className="mb-12 print:hidden">
        <RelatedCalculators currentSlug="loan-comparison-calculator" category="real-estate" />
      </div>

      {/* FAQs */}
      <div className="max-w-3xl mx-auto mb-12 print:hidden">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-6">
          Loan Comparison FAQs
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-xs">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-slate-900">{faq.q}</span>
                  <ChevronDown className={`size-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="print:hidden">
        <MethodologyDisclosure type="loanComparison" />
        <AdSlot className="mt-8" />
      </div>

      <LenderReadyDossierModal
        isOpen={showDossierModal}
        onClose={() => setShowDossierModal(false)}
        dealTitle={`Loan Comparison: ${loanA.name} vs ${loanB.name}`}
        dealId={`loancomp_${loanA.loanAmount}_${loanA.interestRate}_vs_${loanB.loanAmount}_${loanB.interestRate}`}
        onExportExcel={handleExportExcel}
        onPrintOfficialPdf={() => window.print()}
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
    </div>
  );
};

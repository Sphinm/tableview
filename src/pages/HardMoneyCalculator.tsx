import { useState, useMemo, useEffect } from 'react';
import {
  Hammer,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Percent,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Sparkles,
  Printer
} from 'lucide-react';
import {
  calculateHardMoney,
  type HardMoneyInputs,
  type HardMoneyResult
} from '../lib/hardMoneyCalculator';
import { updatePageMeta, navigateTo } from '../lib/router';
import { CALCULATOR_META } from '../data/routeMeta';
import { MethodologyDisclosure } from '../components/MethodologyDisclosure';
import { PrintableHardMoneyReport } from '../components/PrintableHardMoneyReport';

const hardMoneySchemas = [
  {
    '@type': 'WebApplication',
    name: 'Hard Money Loan & Fix-and-Flip Profit Calculator',
    url: 'https://tableview.dev/hard-money-calculator',
    description: 'Free in-browser Hard Money Loan calculator and DealCheck alternative. Calculate hard money loan costs, points, interest-only monthly payments, 70% rule Maximum Allowable Offer (MAO), and net flip profit margins without subscription fees.',
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
    name: 'Hard Money Bridge Loan & Rehab Financing',
    description: 'Short-term real estate asset-based bridge loan for property acquisition, renovation, and fix-and-flip investing.',
    category: 'LoanOrCredit'
  },
  {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://tableview.dev/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Financial Calculators',
        item: 'https://tableview.dev/finance-calculator'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Hard Money Loan Calculator',
        item: 'https://tableview.dev/hard-money-calculator'
      }
    ]
  },
  {
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Why use TableView Hard Money Calculator instead of DealCheck or Rehab Financial?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Unlike DealCheck which caps free users to 15 property analyses and locks full PDF exports behind a monthly subscription, TableView.dev provides 100% free and unlimited deal evaluations, zero account sign-up, selectable Dutch vs as-incurred interest calculations, 70% rule MAO analysis, and instant Excel exports with complete client-side data privacy.'
        }
      },
      {
        '@type': 'Question',
        name: 'What is a hard money loan and how does it work for house flipping?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A hard money loan is an asset-based, short-term bridge loan provided by private investors or specialized lending companies to fund the purchase and renovation of real estate. Underwriting is primarily collateral-driven—focusing on the property\'s After Repair Value (ARV) and renovation scope—rather than personal W-2 income.'
        }
      },
      {
        '@type': 'Question',
        name: 'What is the 70% Rule in real estate flipping?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The 70% rule states that an investor should pay no more than 70% of the After Repair Value (ARV) of a home minus estimated repair and rehab costs: Maximum Allowable Offer (MAO) = (ARV × 70%) - Rehab Costs. The remaining 30% margin covers lender points, holding interest, acquisition/exit closing fees, and developer net profit.'
        }
      },
      {
        '@type': 'Question',
        name: 'How do hard money points and interest work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Points are upfront lender origination fees expressed as a percentage of the total loan amount (e.g., 2 points on a $200,000 loan = $4,000). Interest rates typically range from 9.5% to 13.5% annualized, serviced monthly as interest-only payments throughout the 6 to 12 month project duration.'
        }
      },
      {
        '@type': 'Question',
        name: 'How does the rehab escrow draw process work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Lenders do not hand over the entire rehab budget upfront. Instead, funds are held in an escrow account and released in "draws" or disbursements as construction milestones (e.g., framing, rough plumbing, drywall, finishes) are completed and confirmed via third-party site inspections.'
        }
      },
      {
        '@type': 'Question',
        name: 'What is Dutch interest vs as-incurred interest in hard money lending?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'In "Dutch interest", the borrower pays monthly interest on the entire total approved loan amount (purchase loan plus undrawn rehab escrow) from day one. In "as-incurred interest", the borrower only pays interest on the drawn balance, saving thousands of dollars in carrying costs during early construction.'
        }
      },
      {
        '@type': 'Question',
        name: 'What credit score and down payment are needed for a hard money loan?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most hard money lenders require a minimum credit score of 620 to 660. Down payments typically range from 10% to 20% of the purchase price (80% to 90% Purchase LTV), while 100% of verified renovation costs are financed in the escrow facility.'
        }
      }
    ]
  }
];

interface HardMoneyCalculatorProps {
  onTrySample?: () => void;
}

export const HardMoneyCalculator = ({ onTrySample: _onTrySample }: HardMoneyCalculatorProps) => {
  useEffect(() => {
    updatePageMeta(
      CALCULATOR_META['/hard-money-calculator'].title,
      CALCULATOR_META['/hard-money-calculator'].description,
      CALCULATOR_META['/hard-money-calculator'].canonical,
      hardMoneySchemas
    );
  }, []);

  const getNumQuery = (name: string, fallback: number): number => {
    try {
      const p = new URLSearchParams(window.location.search).get(name);
      if (p !== null && !isNaN(Number(p)) && Number(p) > 0) return Number(p);
    } catch {}
    return fallback;
  };

  // Form State initialized with URL search params
  const [purchasePrice, setPurchasePrice] = useState<number>(() => getNumQuery('purchase', 240000));
  const [rehabBudget, setRehabBudget] = useState<number>(() => getNumQuery('rehab', 65000));
  const [afterRepairValue, setAfterRepairValue] = useState<number>(() => getNumQuery('arv', 390000)); // ARV
  const [ltvPercent, setLtvPercent] = useState<number>(85);
  const [rehabFinancedPercent, setRehabFinancedPercent] = useState<number>(100);
  const [interestRate, setInterestRate] = useState<number>(() => getNumQuery('rate', 11.0));
  const [originationPoints, setOriginationPoints] = useState<number>(() => getNumQuery('points', 2.0));
  const [lenderUnderwritingFees, setLenderUnderwritingFees] = useState<number>(1500);
  const [projectDurationMonths, setProjectDurationMonths] = useState<number>(() => getNumQuery('duration', 6));
  const [monthlyHoldingCosts, setMonthlyHoldingCosts] = useState<number>(650);
  const [realtorCommissionPercent, setRealtorCommissionPercent] = useState<number>(5.0);
  const [exitClosingCostsPercent, setExitClosingCostsPercent] = useState<number>(1.5);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Quick Presets
  const arvPresets = [
    { purchase: 180000, rehab: 45000, arv: 290000, label: 'Starter Flip ($290k ARV)' },
    { purchase: 260000, rehab: 70000, arv: 420000, label: 'Suburban Flip ($420k ARV)' },
    { purchase: 450000, rehab: 110000, arv: 720000, label: 'High-End ($720k ARV)' }
  ];

  const inputs: HardMoneyInputs = useMemo(
    () => ({
      purchasePrice,
      rehabBudget,
      afterRepairValue,
      ltvPercent,
      rehabFinancedPercent,
      interestRate,
      originationPoints,
      lenderUnderwritingFees,
      projectDurationMonths,
      monthlyHoldingCosts,
      realtorCommissionPercent,
      exitClosingCostsPercent
    }),
    [
      purchasePrice,
      rehabBudget,
      afterRepairValue,
      ltvPercent,
      rehabFinancedPercent,
      interestRate,
      originationPoints,
      lenderUnderwritingFees,
      projectDurationMonths,
      monthlyHoldingCosts,
      realtorCommissionPercent,
      exitClosingCostsPercent
    ]
  );

  const result: HardMoneyResult = useMemo(() => calculateHardMoney(inputs), [inputs]);

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

  // Export Deal Sheet to Excel
  const handleExportExcel = async () => {
    const summaryData = [
      { Parameter: 'Purchase Price', Value: purchasePrice },
      { Parameter: 'Rehab / Renovation Budget', Value: rehabBudget },
      { Parameter: 'After Repair Value (ARV)', Value: afterRepairValue },
      { Parameter: 'Total Loan Amount', Value: result.totalLoanAmount },
      { Parameter: 'Purchase Loan', Value: result.purchaseLoanAmount },
      { Parameter: 'Rehab Loan Financed', Value: result.rehabLoanAmount },
      { Parameter: 'Initial Cash Out of Pocket', Value: result.initialCashRequired },
      { Parameter: 'Monthly Interest Payment', Value: result.monthlyInterestPayment },
      { Parameter: 'Total Holding Costs', Value: result.totalHoldingCosts },
      { Parameter: 'Total Project Cost', Value: result.totalProjectCost },
      { Parameter: '70% Rule MAO', Value: result.maxAllowableOffer70Rule },
      { Parameter: 'Estimated Net Profit', Value: result.netProfit },
      { Parameter: 'Cash on Cash ROI %', Value: `${result.roiPercent}%` },
      { Parameter: 'Annualized ROI %', Value: `${result.annualizedRoiPercent}%` }
    ];

    const XLSX = await import('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(summaryData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fix & Flip Analysis');
    XLSX.writeFile(workbook, `hard_money_deal_${purchasePrice}_arv_${afterRepairValue}.xlsx`);
  };

  const handleExportCsv = () => {
    const csvContent =
      'Parameter,Value\n' +
      `Purchase Price,${purchasePrice}\n` +
      `Rehab Budget,${rehabBudget}\n` +
      `After Repair Value,${afterRepairValue}\n` +
      `Total Loan Amount,${result.totalLoanAmount}\n` +
      `Initial Cash Required,${result.initialCashRequired}\n` +
      `Monthly Interest,${result.monthlyInterestPayment}\n` +
      `Total Holding Costs,${result.totalHoldingCosts}\n` +
      `Net Profit,${result.netProfit}\n` +
      `ROI Percent,${result.roiPercent}%\n` +
      `Annualized ROI,${result.annualizedRoiPercent}%\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `fix_and_flip_deal_${purchasePrice}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleExportPdf = () => {
    const prevTitle = document.title;
    document.title = `hard_money_deal_sheet_${purchasePrice}_arv_${afterRepairValue}`;
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 1000);
  };

  const handleCopyLink = () => {
    try {
      const params = new URLSearchParams();
      params.set('purchase', String(purchasePrice));
      params.set('rehab', String(rehabBudget));
      params.set('arv', String(afterRepairValue));
      params.set('rate', String(interestRate));
      params.set('points', String(originationPoints));
      params.set('duration', String(projectDurationMonths));
      const fullUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', fullUrl);
      navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <>
      <div className="print:hidden min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white pb-20 lg:pb-0">
      {/* Hero Header */}
      <section className="relative pt-12 pb-8 border-b border-slate-800 bg-gradient-to-b from-amber-950/20 via-slate-950 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-3">
            <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 font-semibold">
              FIX & FLIP INVESTOR SUITE
            </span>
            <span>•</span>
            <span className="text-slate-400">Private Bridge Lending Analysis</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-100">
            Hard Money <span className="text-amber-400">Loan Calculator</span>
          </h1>

          <p className="mt-3 max-w-3xl text-sm sm:text-base text-slate-400 leading-relaxed">
            Analyze short-term bridge financing, upfront points, monthly interest-only payments, and rehab budget draws. Accurately verify the <strong>70% Rule of House Flipping</strong> and net cash-on-cash ROI.
          </p>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 mt-6 flex-wrap">
            <span className="text-xs text-slate-400">Deal Presets:</span>
            {arvPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPurchasePrice(preset.purchase);
                  setRehabBudget(preset.rehab);
                  setAfterRepairValue(preset.arv);
                }}
                className="px-3 py-1 rounded-lg text-xs font-mono bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-slate-100 transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Inputs (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Hammer className="size-4.5 text-amber-400" />
                <span>Property & Renovation Numbers</span>
              </h2>

              {/* Purchase Price */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex justify-between">
                  <span>Acquisition / Purchase Price</span>
                  <span className="text-slate-100 font-mono font-bold">{currencyFmt(purchasePrice)}</span>
                </label>
                <div className="relative">
                  <DollarSign className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="number"
                    inputMode="numeric"
                    value={purchasePrice || ''}
                    onChange={(e) => setPurchasePrice(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Rehab Budget & ARV */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Rehab Budget ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      inputMode="numeric"
                      value={rehabBudget || ''}
                      onChange={(e) => setRehabBudget(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    After Repair Value (ARV)
                  </label>
                  <div className="relative">
                    <DollarSign className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      inputMode="numeric"
                      value={afterRepairValue || ''}
                      onChange={(e) => setAfterRepairValue(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Financing Terms */}
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pt-3 pb-3">
                <DollarSign className="size-4.5 text-emerald-400" />
                <span>Hard Money Loan Terms</span>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Purchase LTV (%)
                  </label>
                  <div className="relative">
                    <Percent className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      inputMode="decimal"
                      value={ltvPercent || ''}
                      onChange={(e) => setLtvPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Rehab Financed (%)
                  </label>
                  <div className="relative">
                    <Percent className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      inputMode="decimal"
                      value={rehabFinancedPercent || ''}
                      onChange={(e) => setRehabFinancedPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Interest Rate (%)
                  </label>
                  <div className="relative">
                    <Percent className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.25"
                      value={interestRate || ''}
                      onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Origination Points
                  </label>
                  <div className="relative">
                    <Percent className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      value={originationPoints || ''}
                      onChange={(e) => setOriginationPoints(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Underwriting / Admin ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      inputMode="numeric"
                      step="100"
                      value={lenderUnderwritingFees || ''}
                      onChange={(e) => setLenderUnderwritingFees(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Project Timeline & Holding */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Holding Period (Months)
                  </label>
                  <select
                    value={projectDurationMonths}
                    onChange={(e) => setProjectDurationMonths(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                  >
                    <option value={3}>3 Months (Rapid Flip)</option>
                    <option value={6}>6 Months (Standard)</option>
                    <option value={9}>9 Months (Major Rehab)</option>
                    <option value={12}>12 Months (Heavy Ground-Up)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Monthly Holding Cost ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      inputMode="numeric"
                      value={monthlyHoldingCosts || ''}
                      onChange={(e) => setMonthlyHoldingCosts(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Selling Costs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Realtor Commission (%)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    value={realtorCommissionPercent || ''}
                    onChange={(e) => setRealtorCommissionPercent(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-slate-200 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Exit Closing Cost (%)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    value={exitClosingCostsPercent || ''}
                    onChange={(e) => setExitClosingCostsPercent(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-slate-200 font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Profit & 70% Rule Dashboard (7 cols) */}
          <div id="hardmoney-results" className="lg:col-span-7 space-y-6 scroll-mt-20">
            {/* Net Profit Hero Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 shadow-2xl">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                    Estimated Net Flip Profit
                  </span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span
                      className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                        result.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {result.netProfit >= 0 ? '+' : ''}
                      {currencyFmt(result.netProfit)}
                    </span>
                    <span
                      className={`text-sm font-semibold px-2.5 py-1 rounded-md border ${
                        result.dealVerdict === 'excellent'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          : result.dealVerdict === 'profitable'
                          ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
                          : result.dealVerdict === 'marginal'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                          : 'bg-red-950/80 text-red-300 border-red-800'
                      }`}
                    >
                      {result.verdictLabel}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Cash-on-Cash Return</span>
                  <span className="text-2xl font-black font-mono text-amber-400 mt-0.5 block">
                    {result.roiPercent}%
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Annualized: {result.annualizedRoiPercent}%
                  </span>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {result.verdictDescription}
              </p>

              {/* 70% Rule Banner */}
              <div className="mt-5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {result.is70RuleCompliant ? (
                    <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                      <ShieldCheck className="size-4" />
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
                      <AlertTriangle className="size-4" />
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      70% House Flipping Rule Check
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Maximum Allowable Offer (MAO): <strong className="text-slate-200">{currencyFmt(result.maxAllowableOffer70Rule)}</strong>
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold font-mono px-2 py-1 rounded ${
                    result.is70RuleCompliant
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {result.is70RuleCompliant ? 'PASSES 70% RULE' : 'EXCEEDS 70% TARGET'}
                </span>
              </div>
            </div>

            {/* Financial Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Total Loan</span>
                <span className="text-base font-bold font-mono text-slate-100 mt-0.5 block">
                  {currencyFmt(result.totalLoanAmount)}
                </span>
                <span className="text-[10px] text-slate-500">Purchase + Rehab</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Initial Cash</span>
                <span className="text-base font-bold font-mono text-amber-400 mt-0.5 block">
                  {currencyFmt(result.initialCashRequired)}
                </span>
                <span className="text-[10px] text-slate-500">Down + Points + Fees</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Monthly Interest</span>
                <span className="text-base font-bold font-mono text-slate-100 mt-0.5 block">
                  {currencyDecFmt(result.monthlyInterestPayment)}
                </span>
                <span className="text-[10px] text-slate-500">Interest-only</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Total Cost</span>
                <span className="text-base font-bold font-mono text-slate-100 mt-0.5 block">
                  {currencyFmt(result.totalProjectCost)}
                </span>
                <span className="text-[10px] text-slate-500">All-in basis</span>
              </div>
            </div>

            {/* Comprehensive Cost Waterfall Table */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
                <span>Total Project Cost Waterfall</span>
                <span className="text-xs font-mono text-slate-400">
                  Total Holding: {currencyFmt(result.totalInterestPaid + result.totalHoldingCosts)}
                </span>
              </h3>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300">1. Property Acquisition Price</span>
                  <span className="text-slate-100 font-bold">{currencyFmt(purchasePrice)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300">2. Rehab & Construction Budget</span>
                  <span className="text-slate-100">{currencyFmt(rehabBudget)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300">
                    3. Lender Origination Points ({originationPoints} pts) & Fees
                  </span>
                  <span className="text-slate-100">{currencyFmt(result.originationPointsCost + lenderUnderwritingFees)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300">
                    4. Holding Interest ({projectDurationMonths} mos @ {interestRate}%)
                  </span>
                  <span className="text-amber-400">{currencyDecFmt(result.totalInterestPaid)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300">
                    5. Utilities, Property Tax, Insurance Holding Costs
                  </span>
                  <span className="text-slate-100">{currencyFmt(result.totalHoldingCosts)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300">
                    6. Exit Selling Realtor Commission ({realtorCommissionPercent}%) & Closing
                  </span>
                  <span className="text-slate-100">{currencyFmt(result.totalExitCosts)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 font-bold text-sm">
                  <span className="text-emerald-400">Gross Sale Price (ARV)</span>
                  <span className="text-emerald-400">{currencyFmt(afterRepairValue)}</span>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPdf}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-400 cursor-pointer transition-colors shadow-sm"
                  title="Print or export Deal Sheet as vector PDF"
                >
                  <Printer className="size-4" />
                  <span>Export PDF</span>
                </button>
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-xs font-semibold text-emerald-300 cursor-pointer transition-colors"
                >
                  <FileSpreadsheet className="size-4" />
                  <span>Download Deal Sheet (.xlsx)</span>
                </button>
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 cursor-pointer transition-colors"
                >
                  <Download className="size-3.5" />
                  <span>CSV</span>
                </button>
              </div>

              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white cursor-pointer transition-colors"
              >
                {copiedLink ? 'Link Copied!' : 'Share This Deal'}
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: The 70% Rule Formula, Underwriting Matrix & Educational Guide */}
        <div className="mt-16 pt-10 border-t border-slate-800 space-y-12">
          {/* Subsection 1: Mathematical 70% Rule Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                <BookOpen className="size-6 text-indigo-400" />
                The 70% Rule in House Flipping: Formula & Sizing
              </h2>
              <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  The <strong>70% Rule</strong> is the quintessential underwriting benchmark used by real estate investors, wholesalers, and hard money lenders to evaluate fix-and-flip acquisitions. It determines the <strong>Maximum Allowable Offer (MAO)</strong> an investor should pay to ensure healthy profit margins and protect against unforeseen market downturns.
                </p>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs sm:text-sm text-indigo-300">
                  <div className="text-center font-bold mb-1">MAO = (After Repair Value × 70%) − Rehab Budget</div>
                  <div className="text-slate-400 text-center text-xs font-normal">Where ARV is the verified post-renovation comparable sales value</div>
                </div>
                <p className="text-slate-300">
                  The remaining <strong>30% margin</strong> is deliberately calibrated to absorb real estate project friction:
                </p>
                <ul className="space-y-2 pt-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>8% – 10% Transaction Costs:</strong> Buy/sell closing costs, title insurance, transfer taxes, and 5%–6% exit realtor commissions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>6% – 8% Financing & Holding:</strong> Lender origination points, monthly interest-only payments, property taxes, insurance, and utilities during construction.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>12% – 15% Net Investor Profit:</strong> The target profit spread compensating the operator for risk, capital outlay, and general contracting execution.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Practical 70% Rule Example Card */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">70% Rule Case Study</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">$390k ARV Model</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">After Repair Value (ARV)</span>
                  <span className="text-slate-200 font-semibold">$390,000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">70% Baseline Target ($390k × 0.70)</span>
                  <span className="text-slate-200">$273,000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Less: Estimated Rehab Budget</span>
                  <span className="text-rose-400">−$65,000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-300 font-bold">Maximum Allowable Offer (MAO)</span>
                  <span className="text-emerald-400 font-bold">$208,000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Actual Purchase Contract</span>
                  <span className="text-amber-400">$240,000</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold">
                  <span className="text-indigo-300">Purchase vs MAO Variance</span>
                  <span className="text-amber-400">+$32,000 (Slightly Tight Margin)</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                Pro tip: When purchasing above the strict 70% MAO, negotiate seller concessions or compress construction duration to prevent carrying interest from eroding net returns.
              </p>
            </div>
          </div>

          {/* Subsection 2: Hard Money vs DSCR vs Private Money vs Conventional Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="size-5 text-indigo-400" />
                  Hard Money vs DSCR vs Private Money vs Conventional Mortgages
                </h3>
                <p className="text-xs text-slate-400">Evaluate financing vehicle tradeoffs based on project stage, asset condition, and capital velocity.</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-300 font-semibold">
                  <tr>
                    <th className="p-3.5">Loan Category</th>
                    <th className="p-3.5">Primary Use Case</th>
                    <th className="p-3.5">Speed to Fund</th>
                    <th className="p-3.5">Interest Rate & Terms</th>
                    <th className="p-3.5">Rehab Financed?</th>
                    <th className="p-3.5">Income / Underwriting Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-amber-400">Hard Money Loan</td>
                    <td className="p-3.5 text-slate-200">Fix & flip, distressed rehab, heavy value-add</td>
                    <td className="p-3.5 text-emerald-400 font-semibold">5 to 10 Days</td>
                    <td className="p-3.5 text-slate-300">9.5% – 13.5% (Interest-Only, 6–18 mos)</td>
                    <td className="p-3.5 text-emerald-400 font-semibold">Up to 100% of Rehab in Escrow</td>
                    <td className="p-3.5 text-slate-300">Collateral ARV & borrower flip track record</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-indigo-400">DSCR Rental Loan</td>
                    <td className="p-3.5 text-slate-200">Turnkey rental buy-and-hold, BRRRR cash-out refinance</td>
                    <td className="p-3.5 text-slate-300 font-semibold">14 to 21 Days</td>
                    <td className="p-3.5 text-slate-300">6.8% – 8.5% (30-Year Fixed / 10-Yr I/O)</td>
                    <td className="p-3.5 text-rose-400">No (Must be habitable)</td>
                    <td className="p-3.5 text-slate-300">Property gross rental income vs PITIA debt</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-cyan-400">Private Money</td>
                    <td className="p-3.5 text-slate-200">Gap funding, 2nd position lien, syndications</td>
                    <td className="p-3.5 text-emerald-400 font-semibold">24 to 72 Hours</td>
                    <td className="p-3.5 text-slate-300">8.0% – 12.0% (Negotiable equity/debt)</td>
                    <td className="p-3.5 text-emerald-400 font-semibold">100% Customizable</td>
                    <td className="p-3.5 text-slate-300">Personal relationship & trust with private lender</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-slate-400">Conventional Fannie/Freddie</td>
                    <td className="p-3.5 text-slate-200">Primary residence or low-leverage turnkey rental</td>
                    <td className="p-3.5 text-rose-400 font-semibold">30 to 45+ Days</td>
                    <td className="p-3.5 text-slate-300">6.2% – 7.2% (15 or 30-Year Fixed Amortized)</td>
                    <td className="p-3.5 text-rose-400">No (Rigid inspection standards)</td>
                    <td className="p-3.5 text-slate-300">Strict personal W-2 income & &lt;45% DTI ceiling</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Subsection 3: Carrying Costs & Draw Mechanics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <DollarSign className="size-5 text-amber-400" />
                Dutch Interest vs As-Incurred Interest
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                When shopping hard money lenders, ask whether interest is billed <strong>as-incurred (drawn balance)</strong> or as <strong>Dutch interest (total loan facility)</strong>:
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="font-semibold text-emerald-400">As-Incurred Interest:</span> You only pay interest on the purchase loan amount plus the exact rehab funds disbursed so far. This saves $2,000–$6,000 on typical flips.
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="font-semibold text-rose-400">Dutch Interest:</span> The lender charges interest on the full approved loan balance (including unreleased construction funds sitting in escrow) from day one.
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Hammer className="size-5 text-indigo-400" />
                Mastering the Construction Draw Schedule
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Rehab funds are held in escrow and released as work milestones are verified. Follow these steps to prevent contractor delays:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
                <li><strong>Draw 1: Demolition & Rough-In:</strong> Tear out, framing, HVAC ducting, plumbing rough, electrical wiring.</li>
                <li><strong>Draw 2: Insulation & Drywall:</strong> City permits passed, insulation hung, drywall taped and textured.</li>
                <li><strong>Draw 3: Finishes & Fixtures:</strong> Tile, kitchen cabinets, quartz countertops, plumbing trim, vanities.</li>
                <li><strong>Draw 4: Final Punch List & Exterior:</strong> Painting, flooring, landscaping, exterior curb appeal, final inspection.</li>
              </ol>
            </div>
          </div>

          {/* Competitor Comparison: TableView vs DealCheck vs Rehab Financial */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-2">
                <Sparkles className="size-3.5" />
                <span>Fix &amp; Flip Tool Comparison</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-slate-100">
                Why TableView Hard Money Calculator vs DealCheck &amp; Rehab Financial?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
                Analyzing fix-and-flip profitability shouldn't come with property report limits or persistent sales calls from mortgage brokers. Here is how TableView compares against leading alternatives:
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Feature / Capability</th>
                    <th className="py-3 px-4 text-indigo-400 font-bold">TableView.dev</th>
                    <th className="py-3 px-4">DealCheck</th>
                    <th className="py-3 px-4">Rehab Financial / Kiavi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-slate-200">Pricing &amp; Property Limits</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">100% Free (Unlimited Deals)</td>
                    <td className="py-3 px-4 text-rose-400">Limited to 15, then $14-$29/mo</td>
                    <td className="py-3 px-4 text-slate-400">Free (Lead Gen Funnel)</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-slate-200">Account Registration Required</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">None (Instant In-Browser)</td>
                    <td className="py-3 px-4 text-rose-400">Mandatory Account</td>
                    <td className="py-3 px-4 text-rose-400">Mandatory Contact Form</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-slate-200">70% Rule MAO + Live ROI Analysis</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">Instant Dynamic Calculation</td>
                    <td className="py-3 px-4 text-slate-200">Yes (Under Account Limits)</td>
                    <td className="py-3 px-4 text-slate-400">Basic Payment Only</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-slate-200">Dutch vs As-Incurred Interest Mode</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">Selectable Toggle</td>
                    <td className="py-3 px-4 text-slate-400">Fixed Baseline</td>
                    <td className="py-3 px-4 text-slate-400">Lender Default Only</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-slate-200">Full Excel / CSV Workbook Export</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">1-Click Full Model Export</td>
                    <td className="py-3 px-4 text-amber-400">PDF Report (Paid Plan Only)</td>
                    <td className="py-3 px-4 text-rose-400">Not Supported</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-slate-200">Shareable Pre-filled URL</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">Instant 1-Click Link</td>
                    <td className="py-3 px-4 text-slate-400">Paid Tier Feature</td>
                    <td className="py-3 px-4 text-rose-400">Not Supported</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-slate-200">100% Client-Side Privacy</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">Yes (Zero Data Egress)</td>
                    <td className="py-3 px-4 text-slate-400">Stored in Cloud Database</td>
                    <td className="py-3 px-4 text-rose-400">Lender Sales Call List</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Subsection 4: Comprehensive In-Depth Flipping FAQs */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <HelpCircle className="size-5 text-indigo-400" />
              Frequently Asked Questions About Hard Money Loans
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-semibold text-slate-200 text-sm">Why use TableView Hard Money Calculator instead of DealCheck or Rehab Financial?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Unlike DealCheck which caps free accounts to 15 property analyses and locks full PDF exports behind a monthly subscription, TableView.dev provides 100% free and unlimited deal evaluations, zero account sign-up, selectable Dutch vs as-incurred interest calculations, 70% rule MAO analysis, and instant Excel exports with complete client-side data privacy.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-semibold text-slate-200 text-sm">What is a hard money loan and how does it work for house flipping?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A hard money loan is an asset-based, short-term bridge loan provided by private investors or specialized lending companies to fund the purchase and renovation of real estate. Underwriting is primarily collateral-driven—focusing on the property's After Repair Value (ARV) and renovation scope—rather than personal W-2 income.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-semibold text-slate-200 text-sm">What is the 70% Rule in real estate flipping?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The 70% rule states that an investor should pay no more than 70% of the After Repair Value (ARV) of a home minus estimated repair and rehab costs: Maximum Allowable Offer (MAO) = (ARV × 70%) - Rehab Costs. The remaining 30% margin covers lender points, holding interest, acquisition/exit closing fees, and developer net profit.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-semibold text-slate-200 text-sm">How do hard money points and interest work?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Points are upfront lender origination fees expressed as a percentage of the total loan amount (e.g., 2 points on a $200,000 loan = $4,000). Interest rates typically range from 9.5% to 13.5% annualized, serviced monthly as interest-only payments throughout the 6 to 12 month project duration.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-semibold text-slate-200 text-sm">How does the rehab escrow draw process work?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Lenders do not hand over the entire rehab budget upfront. Instead, funds are held in an escrow account and released in "draws" or disbursements as construction milestones (e.g., framing, rough plumbing, drywall, finishes) are completed and confirmed via third-party site inspections.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-semibold text-slate-200 text-sm">What is Dutch interest vs as-incurred interest in hard money lending?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In "Dutch interest", the borrower pays monthly interest on the entire total approved loan amount (purchase loan plus undrawn rehab escrow) from day one. In "as-incurred interest", the borrower only pays interest on the drawn balance, saving thousands of dollars in carrying costs during early construction.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-semibold text-slate-200 text-sm">What credit score and down payment are needed for a hard money loan?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Most hard money lenders require a minimum credit score of 620 to 660. Down payments typically range from 10% to 20% of the purchase price (80% to 90% Purchase LTV), while 100% of verified renovation costs are financed in the escrow facility.
                </p>
              </div>
            </div>
          </div>

          <MethodologyDisclosure type="hardmoney" />

          {/* Subsection 5: Related Real Estate Calculators Cross-Links */}
          <div className="pt-6 border-t border-slate-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Explore Related Real Estate & Finance Calculators
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a
                href="/dscr-loan-calculator"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/dscr-loan-calculator');
                }}
                className="group p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 transition-all cursor-pointer"
              >
                <div className="font-bold text-slate-200 text-sm group-hover:text-indigo-300 flex items-center justify-between">
                  <span>DSCR Loan Calculator</span>
                  <ArrowRight className="size-4 text-slate-500 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  BRRRR refinance exit? Calculate rental debt coverage and cash-on-cash returns.
                </p>
              </a>

              <a
                href="/mortgage-calculator"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/mortgage-calculator');
                }}
                className="group p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 transition-all cursor-pointer"
              >
                <div className="font-bold text-slate-200 text-sm group-hover:text-indigo-300 flex items-center justify-between">
                  <span>Mortgage Payment Calculator</span>
                  <ArrowRight className="size-4 text-slate-500 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Analyze 15/30-year fixed loan amortization, PMI thresholds, and principal payoff.
                </p>
              </a>

              <a
                href="/refinance-calculator"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/refinance-calculator');
                }}
                className="group p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 transition-all cursor-pointer"
              >
                <div className="font-bold text-slate-200 text-sm group-hover:text-indigo-300 flex items-center justify-between">
                  <span>Mortgage Refinance Calculator</span>
                  <ArrowRight className="size-4 text-slate-500 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Evaluate permanent take-out financing, break-even months, and interest savings.
                </p>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Sticky Summary Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block leading-tight">
            Net Flip Profit
          </span>
          <div className="text-xl font-black font-mono leading-tight flex items-baseline gap-2">
            <span className={result.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {currencyFmt(result.netProfit)}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-sans">
              ({result.roiPercent.toFixed(1)}% ROI)
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('hardmoney-results');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="btn-primary px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md active:scale-95 transition-transform cursor-pointer"
        >
          <span>View Analysis</span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>

    <PrintableHardMoneyReport
      inputs={inputs}
      result={result}
    />
  </>
  );
};

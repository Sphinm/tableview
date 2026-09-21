import { useState, useMemo, useEffect } from 'react';
import {
  Hammer,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Sparkles,
  Printer,
  Share2,
  Check
} from 'lucide-react';
import {
  calculateHardMoney,
  type HardMoneyInputs,
  type HardMoneyResult
} from '../lib/hardMoneyCalculator';
import { updatePageMeta } from '../lib/router';
import { CALCULATOR_META } from '../data/routeMeta';
import { MethodologyDisclosure } from '../components/MethodologyDisclosure';
import { AdSlot } from '../components/AdSlot';
import { CalculatorFaqSection } from '../components/CalculatorFaqSection';
import { PrintableHardMoneyReport } from '../components/PrintableHardMoneyReport';
import { RelatedCalculators } from '../components/RelatedCalculators';
import { CurrencyInput } from '../components/CurrencyInput';
import { NumericInput } from '../components/NumericInput';
import {
  CalculatorPresetsBar,
  type CalculatorPreset,
  CashFlowDonutChart,
  PageHeader,
  PrintReportButton,
} from '../components/calculator-kit';
import { SuiteSubNav } from '../components/SuiteSubNav';
import { InfoTooltip } from '../components/InfoTooltip';
import { ResultAnnouncer } from '../components/ResultAnnouncer';
import { composeAnnouncement } from '../lib/resultAnnouncement';
import { formatUsd, formatUsdSigned } from '@tableview/shared';

const HARD_MONEY_PRESETS: CalculatorPreset<HardMoneyInputs>[] = [
  {
    id: 'standard-flip',
    label: 'Standard Fix & Flip (70% Rule)',
    badge: 'Popular',
    description: 'Moderate cosmetic rehab with 6-month turnaround meeting the classic 70% rule',
    values: {
      purchasePrice: 220000,
      rehabBudget: 50000,
      afterRepairValue: 360000,
      ltvPercent: 85,
      rehabFinancedPercent: 100,
      interestRate: 10.5,
      originationPoints: 2.0,
      lenderUnderwritingFees: 1500,
      projectDurationMonths: 6,
      monthlyHoldingCosts: 650,
      realtorCommissionPercent: 5.0,
      exitClosingCostsPercent: 1.5,
    },
  },
  {
    id: 'heavy-rehab',
    label: 'Heavy Rehab / Addition (65% MAO)',
    badge: 'High Spread',
    description: 'Major structural renovation or square footage addition requiring 9-month hold',
    values: {
      purchasePrice: 180000,
      rehabBudget: 95000,
      afterRepairValue: 420000,
      ltvPercent: 80,
      rehabFinancedPercent: 100,
      interestRate: 11.25,
      originationPoints: 2.5,
      lenderUnderwritingFees: 1800,
      projectDurationMonths: 9,
      monthlyHoldingCosts: 800,
      realtorCommissionPercent: 5.0,
      exitClosingCostsPercent: 1.5,
    },
  },
  {
    id: 'quick-turnaround',
    label: 'Wholetail / Cosmetic (4 Months)',
    badge: 'Fast Turn',
    description: 'Light paint & carpet cosmetic refresh with low holding debt overhead',
    values: {
      purchasePrice: 280000,
      rehabBudget: 25000,
      afterRepairValue: 375000,
      ltvPercent: 90,
      rehabFinancedPercent: 100,
      interestRate: 10.0,
      originationPoints: 1.5,
      lenderUnderwritingFees: 1200,
      projectDurationMonths: 4,
      monthlyHoldingCosts: 500,
      realtorCommissionPercent: 4.5,
      exitClosingCostsPercent: 1.0,
    },
  },
  {
    id: 'brrrr-hold',
    label: 'BRRRR Buy & Refinance',
    badge: 'Long-term Hold',
    description: 'Bridge acquisition targeting cash-out refinance into long-term DSCR mortgage',
    values: {
      purchasePrice: 200000,
      rehabBudget: 45000,
      afterRepairValue: 320000,
      ltvPercent: 85,
      rehabFinancedPercent: 100,
      interestRate: 10.75,
      originationPoints: 2.0,
      lenderUnderwritingFees: 1500,
      projectDurationMonths: 6,
      monthlyHoldingCosts: 600,
      realtorCommissionPercent: 0,
      exitClosingCostsPercent: 2.0,
    },
  },
];

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
          text: 'Unlike DealCheck which caps free users to 15 property analyses and locks full PDF exports behind a monthly subscription, TableView.dev provides 100% free and unlimited deal evaluations, zero account sign-up, Dutch interest calculations on the full loan commitment, 70% rule MAO analysis, and instant Excel exports with complete client-side data privacy.'
        }
      },
      {
        '@type': 'Question',
        name: 'What is a hard money loan and how does it work for house flipping?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A hard money loan is an asset-based, short-term bridge loan provided by private investors or specialized lending companies to fund the purchase and renovation of real estate. Underwriting is primarily collateral-driven (focusing on the property\'s After Repair Value (ARV) and renovation scope) rather than personal W-2 income.'
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
          text: 'Points are upfront lender origination fees expressed as a percentage of the loan amount (e.g., 2 points on a $200,000 loan = $4,000). While typical bridge and hard money interest rates often range from 9.5% to 13.5%+ annualized, terms vary significantly by lender, property type, borrower track record, market conditions, and deal structure. Loans are commonly serviced monthly as interest-only payments throughout the 6 to 18 month project duration.'
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
          text: 'In "Dutch interest", the borrower pays monthly interest on the entire total approved loan amount (purchase loan plus undrawn rehab escrow) from day one. In "as-incurred interest", the borrower only pays interest on the drawn balance, saving thousands of dollars in carrying costs during early construction. This calculator currently uses the Dutch interest method, which provides a conservative (higher) estimate of your carrying costs.'
        }
      },
      {
        '@type': 'Question',
        name: 'What credit score and down payment are needed for a hard money loan?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Typical underwriting requirements vary by lender, property condition, and borrower experience. Most asset-based bridge lenders look for credit scores around 620 to 660+, while down payments commonly range from 10% to 25% of purchase price (75% to 90% Purchase LTV), with eligible renovation costs escrowed in draw facilities.'
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
  const [wholesalerAssignmentFee, setWholesalerAssignmentFee] = useState<number>(() => getNumQuery('wholesale', 0));
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

  const [activePresetId, setActivePresetId] = useState<string | null>('standard-flip');

  const handleSelectPreset = (preset: CalculatorPreset<HardMoneyInputs>) => {
    setActivePresetId(preset.id);
    const v = preset.values;
    if (!v) return;
    if (v.purchasePrice !== undefined) setPurchasePrice(v.purchasePrice);
    if (v.rehabBudget !== undefined) setRehabBudget(v.rehabBudget);
    if (v.afterRepairValue !== undefined) setAfterRepairValue(v.afterRepairValue);
    if (v.wholesalerAssignmentFee !== undefined) setWholesalerAssignmentFee(v.wholesalerAssignmentFee);
    else setWholesalerAssignmentFee(0);
    if (v.ltvPercent !== undefined) setLtvPercent(v.ltvPercent);
    if (v.rehabFinancedPercent !== undefined) setRehabFinancedPercent(v.rehabFinancedPercent);
    if (v.interestRate !== undefined) setInterestRate(v.interestRate);
    if (v.originationPoints !== undefined) setOriginationPoints(v.originationPoints);
    if (v.lenderUnderwritingFees !== undefined) setLenderUnderwritingFees(v.lenderUnderwritingFees);
    if (v.projectDurationMonths !== undefined) setProjectDurationMonths(v.projectDurationMonths);
    if (v.monthlyHoldingCosts !== undefined) setMonthlyHoldingCosts(v.monthlyHoldingCosts);
    if (v.realtorCommissionPercent !== undefined) setRealtorCommissionPercent(v.realtorCommissionPercent);
    if (v.exitClosingCostsPercent !== undefined) setExitClosingCostsPercent(v.exitClosingCostsPercent);
  };

  const inputs: HardMoneyInputs = useMemo(
    () => ({
      purchasePrice,
      rehabBudget,
      afterRepairValue,
      wholesalerAssignmentFee,
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
      wholesalerAssignmentFee,
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
      ...(wholesalerAssignmentFee > 0 ? [{ Parameter: 'Wholesaler Assignment Fee', Value: wholesalerAssignmentFee }] : []),
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
      (wholesalerAssignmentFee > 0 ? `Wholesaler Assignment Fee,${wholesalerAssignmentFee}\n` : '') +
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
      if (wholesalerAssignmentFee > 0) params.set('wholesale', String(wholesalerAssignmentFee));
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
      {/* data-sentry-mask: purchase price, ARV and rehab budget are the user's own deal. */}
      <div data-sentry-mask="true" className="print:hidden min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white pb-20 lg:pb-0">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <PageHeader
          breadcrumbs={[
            { label: 'Calculators', path: '/finance-calculator' },
            { label: 'Hard Money Loan' }
          ]}
          badge={{
            icon: Hammer,
            label: 'Fix & Flip Bridge Lending Suite',
            tone: 'amber'
          }}
          title="Hard Money Loan Calculator"
          description="Analyze short-term bridge financing, upfront points, monthly interest-only payments, and rehab budget draws. Accurately verify the 70% Rule of House Flipping and net cash-on-cash ROI with 100% private in-browser math."
          actions={
            <>
              <PrintReportButton onPrint={handleExportPdf} label="Print Deal Sheet" />
              <button
                type="button"
                onClick={handleCopyLink}
                className="h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer transition-all shadow-xs active:scale-95 shrink-0"
                title="Copy shareable link with current deal parameters"
              >
                {copiedLink ? (
                  <>
                    <Check className="size-4 text-emerald-700" />
                    <span className="text-emerald-700 font-medium">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="size-4 text-amber-700" />
                    <span>Share Deal</span>
                  </>
                )}
              </button>
            </>
          }
          presets={
            <CalculatorPresetsBar
              presets={HARD_MONEY_PRESETS}
              activeId={activePresetId}
              onSelect={handleSelectPreset}
              title="Flip Scenarios"
            />
          }
        />

        <SuiteSubNav suite="commercial" />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Inputs (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Hammer className="size-4.5 text-amber-700" />
                <span>Property & Renovation Numbers</span>
              </h2>

              {/* Purchase Price */}
              <div>
                <label htmlFor="hardmoney-acquisition-purchase-price" className="block text-xs font-semibold text-slate-700 mb-1.5 flex justify-between">
                  <span>Acquisition / Purchase Price</span>
                  <span className="text-slate-900 font-mono font-bold">{currencyFmt(purchasePrice)}</span>
                </label>
                <CurrencyInput id="hardmoney-acquisition-purchase-price"
                  value={purchasePrice}
                  onChange={(v) => setPurchasePrice(Math.max(0, v))}
                  className="py-2 text-base sm:text-sm font-mono focus:border-amber-500"
                />
              </div>

              {/* Rehab Budget & ARV */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="hardmoney-rehab-budget" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Rehab Budget ($)
                  </label>
                  <CurrencyInput id="hardmoney-rehab-budget"
                    value={rehabBudget}
                    onChange={(v) => setRehabBudget(Math.max(0, v))}
                    className="py-2 text-base sm:text-sm font-mono focus:border-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <label htmlFor="hardmoney-after-repair-value-arv" className="block text-xs font-semibold text-slate-700">
                      After Repair Value (ARV)
                    </label>
                    <InfoTooltip
                      title="After Repair Value (ARV)"
                      content="The anticipated resale value of the property once all construction, cosmetic updates, and repairs are completed."
                    />
                  </div>
                  <CurrencyInput id="hardmoney-after-repair-value-arv"
                    value={afterRepairValue}
                    onChange={(v) => setAfterRepairValue(Math.max(0, v))}
                    className="py-2 text-base sm:text-sm font-mono font-bold text-amber-700 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Wholesaler Assignment Fee */}
              <div>
                <div className="flex items-center gap-1 mb-1.5">
                  <label htmlFor="hardmoney-wholesale-fee" className="block text-xs font-semibold text-slate-700">
                    Wholesaler Assignment Fee ($)
                  </label>
                  <InfoTooltip
                    title="Wholesaler Assignment Fee"
                    content="Contract assignment fee paid to a wholesaler or deal finder. Assignment fees increase your all-in cash outlay and reduce your Maximum Allowable Offer (MAO)."
                  />
                </div>
                <CurrencyInput
                  id="hardmoney-wholesale-fee"
                  value={wholesalerAssignmentFee}
                  onChange={(v) => setWholesalerAssignmentFee(Math.max(0, v))}
                  className="py-2 text-base sm:text-sm font-mono focus:border-amber-500"
                />
                <span className="block text-[11px] text-slate-500 mt-1">
                  Optional finder/assignment fee paid at acquisition closing (enter $0 if buying direct)
                </span>
              </div>

              {/* Financing Terms */}
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pt-3 pb-3">
                <DollarSign className="size-4.5 text-emerald-700" />
                <span>Hard Money Loan Terms</span>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <label htmlFor="hardmoney-purchase-ltv" className="block text-xs font-semibold text-slate-700">
                      Purchase LTV (%)
                    </label>
                    <InfoTooltip
                      title="Loan-to-Value on Purchase"
                      content="The percentage of the purchase price funded by the lender. Borrowers cover the remaining percentage as down payment."
                    />
                  </div>
                  <NumericInput id="hardmoney-purchase-ltv"
                    value={ltvPercent}
                    onChange={(v) => setLtvPercent(Math.max(0, Math.min(100, v)))}
                    suffix="%"
                    className="py-2 text-base sm:text-sm font-mono focus:border-amber-500"
                  />
                </div>

                <div>
                  <label htmlFor="hardmoney-rehab-financed" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Rehab Financed (%)
                  </label>
                  <NumericInput id="hardmoney-rehab-financed"
                    value={rehabFinancedPercent}
                    onChange={(v) => setRehabFinancedPercent(Math.max(0, Math.min(100, v)))}
                    suffix="%"
                    className="py-2 text-base sm:text-sm font-mono focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="hardmoney-interest-rate" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Interest Rate (%)
                  </label>
                  <NumericInput id="hardmoney-interest-rate"
                    value={interestRate}
                    onChange={(v) => setInterestRate(Math.max(0, v))}
                    suffix="%"
                    step={0.25}
                    className="py-2 text-base sm:text-sm font-mono focus:border-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <label htmlFor="hardmoney-origination-points" className="block text-xs font-semibold text-slate-700">
                      Origination Points
                    </label>
                    <InfoTooltip
                      title="Hard Money Points"
                      content="Upfront fees charged by the private lender (typically 1 to 3 points, where 1 point = 1% of total loan amount)."
                    />
                  </div>
                  <NumericInput id="hardmoney-origination-points"
                    value={originationPoints}
                    onChange={(v) => setOriginationPoints(Math.max(0, v))}
                    suffix="%"
                    step={0.5}
                    className="py-2 text-base sm:text-sm font-mono focus:border-amber-500"
                  />
                </div>

                <div>
                  <label htmlFor="hardmoney-underwriting-admin" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Underwriting / Admin ($)
                  </label>
                  <CurrencyInput id="hardmoney-underwriting-admin"
                    value={lenderUnderwritingFees}
                    onChange={(v) => setLenderUnderwritingFees(Math.max(0, v))}
                    className="py-2 text-base sm:text-sm font-mono focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Project Timeline & Holding */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="hardmoney-holding-period-months" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Holding Period (Months)
                  </label>
                  <select id="hardmoney-holding-period-months"
                    value={projectDurationMonths}
                    onChange={(e) => setProjectDurationMonths(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-base sm:text-sm text-slate-900 font-mono focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                  >
                    <option value={3}>3 Months (Rapid Flip)</option>
                    <option value={6}>6 Months (Standard)</option>
                    <option value={9}>9 Months (Major Rehab)</option>
                    <option value={12}>12 Months (Heavy Ground-Up)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="hardmoney-monthly-holding-cost" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Monthly Holding Cost ($)
                  </label>
                  <CurrencyInput id="hardmoney-monthly-holding-cost"
                    value={monthlyHoldingCosts}
                    onChange={(v) => setMonthlyHoldingCosts(Math.max(0, v))}
                    className="py-2 text-base sm:text-sm font-mono focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Selling Costs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="hardmoney-realtor-commission" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Realtor Commission (%)
                  </label>
                  <NumericInput id="hardmoney-realtor-commission"
                    value={realtorCommissionPercent}
                    onChange={(v) => setRealtorCommissionPercent(Math.max(0, v))}
                    suffix="%"
                    step={0.5}
                    className="py-2 text-base sm:text-sm font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="hardmoney-exit-closing-cost" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Exit Closing Cost (%)
                  </label>
                  <NumericInput id="hardmoney-exit-closing-cost"
                    value={exitClosingCostsPercent}
                    onChange={(v) => setExitClosingCostsPercent(Math.max(0, v))}
                    suffix="%"
                    step={0.5}
                    className="py-2 text-base sm:text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Profit & 70% Rule Dashboard (7 cols) */}
          <div id="hardmoney-results" className="lg:col-span-7 space-y-6 scroll-mt-20">
            {/* Announce the recomputed profit and 70% rule for screen readers. */}
            <ResultAnnouncer
              message={composeAnnouncement(
                [
                  { label: 'net profit', value: formatUsdSigned(result.netProfit) },
                  { label: 'return on investment', value: `${result.roiPercent.toFixed(1)}%` },
                  { label: 'maximum allowable offer', value: formatUsd(result.maxAllowableOffer70Rule) },
                ],
                {
                  context: 'Results updated',
                  trailing: `${result.verdictLabel}. ${result.is70RuleCompliant ? 'Meets the 70% rule.' : 'Exceeds the 70% rule threshold.'}`,
                }
              )}
            />

            {/* Net Profit Hero Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold block">
                    Estimated Net Flip Profit
                  </span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span
                      className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                        result.netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {result.netProfit >= 0 ? '+' : ''}
                      {currencyFmt(result.netProfit)}
                    </span>
                    <span
                      className={`text-sm font-semibold px-2.5 py-1 rounded-md border ${
                        result.dealVerdict === 'excellent'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : result.dealVerdict === 'profitable'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : result.dealVerdict === 'marginal'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {result.verdictLabel}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Cash-on-Cash Return</span>
                  <span className="text-2xl font-black font-mono text-amber-700 mt-0.5 block">
                    {result.roiPercent}%
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Annualized: {result.annualizedRoiPercent}%
                  </span>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                {result.verdictDescription}
              </p>

              {/* 70% Rule Banner */}
              <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {result.is70RuleCompliant ? (
                    <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="size-4" />
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
                      <AlertTriangle className="size-4" />
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      70% House Flipping Rule Check
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Maximum Allowable Offer (MAO): <strong className="text-slate-900">{currencyFmt(result.maxAllowableOffer70Rule)}</strong>
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold font-mono px-2.5 py-1 rounded-md border ${
                    result.is70RuleCompliant
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {result.is70RuleCompliant ? 'PASSES 70% RULE' : 'EXCEEDS 70% TARGET'}
                </span>
              </div>
            </div>

            {/* Financial Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 block">Total Loan</span>
                <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
                  {currencyFmt(result.totalLoanAmount)}
                </span>
                <span className="text-[10px] text-slate-500">Purchase + Rehab</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 block">Initial Cash</span>
                <span className="text-base font-bold font-mono text-amber-700 mt-0.5 block">
                  {currencyFmt(result.initialCashRequired)}
                </span>
                <span className="text-[10px] text-slate-500">Down + Points + Fees</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 block">Monthly Interest</span>
                <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
                  {currencyDecFmt(result.monthlyInterestPayment)}
                </span>
                <span className="text-[10px] text-slate-500">Interest-only</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 block">Total Cost</span>
                <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
                  {currencyFmt(result.totalProjectCost)}
                </span>
                <span className="text-[10px] text-slate-500">All-in basis</span>
              </div>
            </div>

            {/* Project Capital & Cost Allocation Donut */}
            <CashFlowDonutChart
              segments={[
                { id: 'purchase', label: 'Purchase Loan', amount: result.purchaseLoanAmount, color: '#6366f1' },
                { id: 'down', label: 'Cash Down & Points', amount: result.initialCashRequired, color: '#06b6d4' },
                { id: 'rehab', label: 'Rehab Budget', amount: rehabBudget, color: '#8b5cf6' },
                { id: 'holding', label: 'Holding Debt & Carrying', amount: result.totalHoldingCosts + result.totalInterestPaid, color: '#f59e0b' },
                { id: 'exit', label: 'Exit Selling & Closing', amount: result.totalExitCosts, color: '#f43f5e' },
                ...(result.netProfit > 0 ? [{ id: 'profit', label: 'Net Flip Profit', amount: result.netProfit, color: '#10b981' }] : []),
              ]}
              centerTitle="Project ARV"
              centerValue={currencyFmt(afterRepairValue)}
              title="Project Capital Allocation & Profit Spread"
              subtitle="Visual allocation of acquisition, renovation draws, financing debt, selling costs, and projected profit."
            />

            {/* Comprehensive Cost Waterfall Table */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Total Project Cost Waterfall</span>
                <span className="text-xs font-mono text-slate-500">
                  Total Holding: {currencyFmt(result.totalInterestPaid + result.totalHoldingCosts)}
                </span>
              </h3>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">1. Property Acquisition Price</span>
                  <span className="text-slate-900 font-bold">{currencyFmt(purchasePrice)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">2. Rehab & Construction Budget</span>
                  <span className="text-slate-900">{currencyFmt(rehabBudget)}</span>
                </div>
                {wholesalerAssignmentFee > 0 && (
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-600">Wholesaler / Finder Assignment Fee</span>
                    <span className="text-slate-900">{currencyFmt(wholesalerAssignmentFee)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">
                    3. Lender Origination Points ({originationPoints} pts) & Fees
                  </span>
                  <span className="text-slate-900">{currencyFmt(result.originationPointsCost + lenderUnderwritingFees)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">
                    4. Holding Interest ({projectDurationMonths} mos @ {interestRate}%)
                  </span>
                  <span className="text-amber-700 font-semibold">{currencyDecFmt(result.totalInterestPaid)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">
                    5. Utilities, Property Tax, Insurance Holding Costs
                  </span>
                  <span className="text-slate-900">{currencyFmt(result.totalHoldingCosts)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">
                    6. Exit Selling Realtor Commission ({realtorCommissionPercent}%) & Closing
                  </span>
                  <span className="text-slate-900">{currencyFmt(result.totalExitCosts)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 font-bold text-sm">
                  <span className="text-emerald-700">Gross Sale Price (ARV)</span>
                  <span className="text-emerald-700">{currencyFmt(afterRepairValue)}</span>
                </div>
              </div>
            </div>

            {/* Timeline Delay Sensitivity Matrix */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Timeline Delay Sensitivity (Holding Cost Slippage)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  How permit delays, material lead times, and contractor overruns erode cash-on-cash returns.
                </p>
              </div>

              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="py-2 pr-3">Scenario</th>
                      <th className="py-2 px-2.5 text-right">Hold Time</th>
                      <th className="py-2 px-2.5 text-right">Carrying Cost</th>
                      <th className="py-2 px-2.5 text-right">Extra Drag</th>
                      <th className="py-2 px-2.5 text-right">Net Profit</th>
                      <th className="py-2 px-2.5 text-right">Cash ROI</th>
                      <th className="py-2 pl-3 text-right">Viability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {result.timelineSensitivity.map((sc) => (
                      <tr key={sc.label} className="hover:bg-slate-50/75 transition-colors">
                        <td className="py-2.5 pr-3 font-sans font-medium text-slate-900">
                          {sc.label}
                        </td>
                        <td className="py-2.5 px-2.5 text-right text-slate-600">
                          {sc.durationMonths} mos
                        </td>
                        <td className="py-2.5 px-2.5 text-right text-slate-900">
                          {currencyFmt(sc.totalCarryingCost)}
                        </td>
                        <td className="py-2.5 px-2.5 text-right text-amber-700">
                          {sc.additionalCostVsBase > 0 ? `+${currencyFmt(sc.additionalCostVsBase)}` : '—'}
                        </td>
                        <td className={`py-2.5 px-2.5 text-right font-bold ${
                          sc.netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'
                        }`}>
                          {sc.netProfit >= 0 ? '+' : ''}{currencyFmt(sc.netProfit)}
                        </td>
                        <td className="py-2.5 px-2.5 text-right text-slate-900">
                          {sc.roiPercent}%
                        </td>
                        <td className="py-2.5 pl-3 text-right">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-sans font-semibold border ${
                            sc.verdict === 'profitable'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : sc.verdict === 'marginal'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {sc.verdict.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Card */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPdf}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-semibold text-amber-800 cursor-pointer transition-colors shadow-2xs"
                  title="Print or export Deal Sheet as vector PDF"
                >
                  <Printer className="size-4" />
                  <span>Export PDF</span>
                </button>
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold text-emerald-800 cursor-pointer transition-colors"
                >
                  <FileSpreadsheet className="size-4" />
                  <span>Download Deal Sheet (.xlsx)</span>
                </button>
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer transition-colors"
                >
                  <Download className="size-3.5" />
                  <span>CSV</span>
                </button>
              </div>

              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white cursor-pointer transition-colors shadow-xs"
              >
                {copiedLink ? 'Link Copied!' : 'Share This Deal'}
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: The 70% Rule Formula, Underwriting Matrix & Educational Guide */}
        <div className="mt-16 pt-10 border-t border-slate-200 space-y-12">
          {/* Subsection 1: Mathematical 70% Rule Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen className="size-6 text-indigo-600" />
                The 70% Rule in House Flipping: Formula & Sizing
              </h2>
              <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <p>
                  The <strong>70% Rule</strong> is the quintessential underwriting benchmark used by real estate investors, wholesalers, and hard money lenders to evaluate fix-and-flip acquisitions. It determines the <strong>Maximum Allowable Offer (MAO)</strong> an investor should pay to ensure healthy profit margins and protect against unforeseen market downturns.
                </p>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs sm:text-sm text-indigo-700">
                  <div className="text-center font-bold mb-1">MAO = (After Repair Value × 70%) − Rehab Budget</div>
                  <div className="text-slate-500 text-center text-xs font-normal">Where ARV is the verified post-renovation comparable sales value</div>
                </div>
                <p className="text-slate-700">
                  The remaining <strong>30% margin</strong> is deliberately calibrated to absorb real estate project friction:
                </p>
                <ul className="space-y-2 pt-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span><strong>8% – 10% Transaction Costs:</strong> Buy/sell closing costs, title insurance, transfer taxes, and 5%–6% exit realtor commissions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span><strong>6% – 8% Financing & Holding:</strong> Lender origination points, monthly interest-only payments, property taxes, insurance, and utilities during construction.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span><strong>12% – 15% Net Investor Profit:</strong> The target profit spread compensating the operator for risk, capital outlay, and general contracting execution.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Practical 70% Rule Example Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">70% Rule Case Study</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">$390k ARV Model</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">After Repair Value (ARV)</span>
                  <span className="text-slate-900 font-semibold">$390,000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">70% Baseline Target ($390k × 0.70)</span>
                  <span className="text-slate-900">$273,000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Less: Estimated Rehab Budget</span>
                  <span className="text-rose-700 font-semibold">−$65,000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600 font-bold">Maximum Allowable Offer (MAO)</span>
                  <span className="text-emerald-700 font-bold">$208,000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Actual Purchase Contract</span>
                  <span className="text-amber-700 font-semibold">$240,000</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold">
                  <span className="text-indigo-700">Purchase vs MAO Variance</span>
                  <span className="text-amber-700">+$32,000 (Slightly Tight Margin)</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                Pro tip: When purchasing above the strict 70% MAO, negotiate seller concessions or compress construction duration to prevent carrying interest from eroding net returns.
              </p>
            </div>
          </div>

          {/* Subsection 2: Hard Money vs DSCR vs Private Money vs Conventional Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="size-5 text-indigo-600" />
                  Hard Money vs DSCR vs Private Money vs Conventional Mortgages
                </h3>
                <p className="text-xs text-slate-600">Evaluate financing vehicle tradeoffs based on project stage, asset condition, and capital velocity.</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-3.5">Loan Category</th>
                    <th className="p-3.5">Primary Use Case</th>
                    <th className="p-3.5">Speed to Fund</th>
                    <th className="p-3.5">Interest Rate & Terms</th>
                    <th className="p-3.5">Rehab Financed?</th>
                    <th className="p-3.5">Income / Underwriting Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-bold text-amber-700">Hard Money Loan</td>
                    <td className="p-3.5 text-slate-800">Fix & flip, distressed rehab, heavy value-add</td>
                    <td className="p-3.5 text-emerald-700 font-semibold">5 to 10 Days</td>
                    <td className="p-3.5 text-slate-700">9.5% – 13.5% (Interest-Only, 6–18 mos)</td>
                    <td className="p-3.5 text-emerald-700 font-semibold">Up to 100% of Rehab in Escrow</td>
                    <td className="p-3.5 text-slate-700">Collateral ARV & borrower flip track record</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-bold text-indigo-700">DSCR Rental Loan</td>
                    <td className="p-3.5 text-slate-800">Turnkey rental buy-and-hold, BRRRR cash-out refinance</td>
                    <td className="p-3.5 text-slate-700 font-semibold">14 to 21 Days</td>
                    <td className="p-3.5 text-slate-700">6.8% – 8.5% (30-Year Fixed / 10-Yr I/O)</td>
                    <td className="p-3.5 text-rose-700 font-medium">No (Must be habitable)</td>
                    <td className="p-3.5 text-slate-700">Property gross rental income vs PITIA debt</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-bold text-cyan-700">Private Money</td>
                    <td className="p-3.5 text-slate-800">Gap funding, 2nd position lien, syndications</td>
                    <td className="p-3.5 text-emerald-700 font-semibold">24 to 72 Hours</td>
                    <td className="p-3.5 text-slate-700">8.0% – 12.0% (Negotiable equity/debt)</td>
                    <td className="p-3.5 text-emerald-700 font-semibold">100% Customizable</td>
                    <td className="p-3.5 text-slate-700">Personal relationship & trust with private lender</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-bold text-slate-700">Conventional Fannie/Freddie</td>
                    <td className="p-3.5 text-slate-800">Primary residence or low-leverage turnkey rental</td>
                    <td className="p-3.5 text-rose-700 font-semibold">30 to 45+ Days</td>
                    <td className="p-3.5 text-slate-700">6.2% – 7.2% (15 or 30-Year Fixed Amortized)</td>
                    <td className="p-3.5 text-rose-700 font-medium">No (Rigid inspection standards)</td>
                    <td className="p-3.5 text-slate-700">Strict personal W-2 income & &lt;45% DTI ceiling</td>
                  </tr>
                </tbody>
              </table>
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-2xs text-slate-500 italic">
                * Note: Typical terms, rates, and LTV limits vary by lender, property type, borrower track record, market conditions, and deal structure. All underwriting benchmarks are provided for educational and estimation purposes.
              </div>
            </div>
          </div>

          {/* Subsection 3: Carrying Costs & Draw Mechanics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="size-5 text-amber-700" />
                Dutch Interest vs As-Incurred Interest
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When shopping hard money lenders, ask whether interest is billed <strong>as-incurred (drawn balance)</strong> or as <strong>Dutch interest (total loan facility)</strong>:
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-emerald-700">As-Incurred Interest:</span> You only pay interest on the purchase loan amount plus the exact rehab funds disbursed so far. This saves $2,000–$6,000 on typical flips.
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-rose-700">Dutch Interest:</span> The lender charges interest on the full approved loan balance (including unreleased construction funds sitting in escrow) from day one.
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Hammer className="size-5 text-indigo-600" />
                Mastering the Construction Draw Schedule
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rehab funds are held in escrow and released as work milestones are verified. Follow these steps to prevent contractor delays:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600">
                <li><strong>Draw 1: Demolition & Rough-In:</strong> Tear out, framing, HVAC ducting, plumbing rough, electrical wiring.</li>
                <li><strong>Draw 2: Insulation & Drywall:</strong> City permits passed, insulation hung, drywall taped and textured.</li>
                <li><strong>Draw 3: Finishes & Fixtures:</strong> Tile, kitchen cabinets, quartz countertops, plumbing trim, vanities.</li>
                <li><strong>Draw 4: Final Punch List & Exterior:</strong> Painting, flooring, landscaping, exterior curb appeal, final inspection.</li>
              </ol>
            </div>
          </div>

          {/* Competitor Comparison: TableView vs DealCheck vs Rehab Financial */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 mb-2">
                <Sparkles className="size-3.5" />
                <span>Fix &amp; Flip Tool Comparison</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-slate-900">
                Why TableView Hard Money Calculator vs DealCheck &amp; Rehab Financial?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                Analyzing fix-and-flip profitability shouldn't come with property report limits or persistent sales calls from mortgage brokers. Here is how TableView compares against leading alternatives:
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Feature / Capability</th>
                    <th className="py-3 px-4 text-indigo-700 font-bold">TableView.dev</th>
                    <th className="py-3 px-4">DealCheck</th>
                    <th className="py-3 px-4">Rehab Financial / Kiavi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">Pricing &amp; Property Limits</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">100% Free (Unlimited Deals)</td>
                    <td className="py-3 px-4 text-rose-700 font-medium">Limited to 15, then $14-$29/mo</td>
                    <td className="py-3 px-4 text-slate-600">Free (Lead Gen Funnel)</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">Account Registration Required</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">None (Instant In-Browser)</td>
                    <td className="py-3 px-4 text-rose-700 font-medium">Mandatory Account</td>
                    <td className="py-3 px-4 text-rose-700 font-medium">Mandatory Contact Form</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">70% Rule MAO + Live ROI Analysis</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">Instant Dynamic Calculation</td>
                    <td className="py-3 px-4 text-slate-700">Yes (Under Account Limits)</td>
                    <td className="py-3 px-4 text-slate-600">Basic Payment Only</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">Dutch vs As-Incurred Interest Mode</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">Selectable Toggle</td>
                    <td className="py-3 px-4 text-slate-600">Fixed Baseline</td>
                    <td className="py-3 px-4 text-slate-600">Lender Default Only</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">Full Excel / CSV Workbook Export</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">1-Click Full Model Export</td>
                    <td className="py-3 px-4 text-amber-700">PDF Report (Paid Plan Only)</td>
                    <td className="py-3 px-4 text-rose-700 font-medium">Not Supported</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">Shareable Pre-filled URL</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">Instant 1-Click Link</td>
                    <td className="py-3 px-4 text-slate-600">Paid Tier Feature</td>
                    <td className="py-3 px-4 text-rose-700 font-medium">Not Supported</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">In-Browser Privacy</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">Yes (Zero Data Egress)</td>
                    <td className="py-3 px-4 text-slate-600">Stored in Cloud Database</td>
                    <td className="py-3 px-4 text-rose-700 font-medium">Lender Sales Call List</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Highest-intent placement: the reader has just seen their own numbers. */}
          <AdSlot unit="calculatorResult" className="my-8" />

          {/* FAQ rendered from the shared registry so the prerendered markup matches. */}
          <CalculatorFaqSection
            path="/hard-money-calculator"
            title="Frequently Asked Questions About Hard Money Loans"
          />

          <MethodologyDisclosure type="hardmoney" />

          <RelatedCalculators currentSlug="hard-money-calculator" category="real-estate" />
        </div>
      </div>

      {/* Mobile Sticky Summary Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-lg flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-500 block leading-tight">
            Net Flip Profit
          </span>
          <div className="text-xl font-black font-mono leading-tight flex items-baseline gap-2">
            <span className={result.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
              {currencyFmt(result.netProfit)}
            </span>
            <span className="text-xs font-semibold text-slate-500 font-sans">
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
          className="btn-primary px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs active:scale-95 transition-transform cursor-pointer"
        >
          <span>View Analysis</span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>

    {/* Closing unit at the end of the editorial content. */}
    <AdSlot unit="calculatorFaq" format="horizontal" />

    <PrintableHardMoneyReport
      inputs={inputs}
      result={result}
    />
  </>
  );
};

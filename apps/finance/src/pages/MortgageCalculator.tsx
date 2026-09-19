import { useState, useMemo, useEffect } from 'react';
import {
  DollarSign,
  Calendar,
  ShieldCheck,
  PiggyBank,
  Download,
  FileSpreadsheet,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Printer,
  Bookmark,
  Wallet,
  CheckCircle2,
  Scale,
  Building2
} from 'lucide-react';
import {
  type MortgageInputs,
  type FicoScoreTier,
  FICO_PROFILES,
  estimateCashToClose,
  calculateDtiAffordability,
  calculateMortgage,
  generateAmortizationSchedule,
  getAnnualAmortizationSchedule,
  getAmortizationChartData,
  calculateBiweeklyComparison,
  exportAmortizationToCsv
} from '../lib/mortgageCalculator';
import { SavedScenariosModal } from '../components/SavedScenariosModal';
import { CurrencyInput } from '../components/CurrencyInput';
import { NumericInput } from '../components/NumericInput';
import { MonthYearPicker } from '../components/MonthYearPicker';
import { updatePageMeta, navigateTo } from '../lib/router';
import { CALCULATOR_META } from '../data/routeMeta';
import { ShareCalculationButton } from '../components/ShareCalculationButton';
import { MethodologyDisclosure } from '../components/MethodologyDisclosure';
import { AdSlot } from '../components/AdSlot';
import { CalculatorFaqSection } from '../components/CalculatorFaqSection';
import { getCalculatorFaqs } from '../data/calculatorFaqs';
import { PaymentDonutChart } from '../components/PaymentDonutChart';
import { AmortizationChart } from '../components/AmortizationChart';
import { PrintableMortgageReport } from '../components/PrintableMortgageReport';
import { PmmsRateTicker } from '../components/PmmsRateTicker';
import { RelatedCalculators } from '../components/RelatedCalculators';
import { CalculatorPresetsBar, PrintReportButton, PageHeader } from '../components/calculator-kit';
import { SuiteSubNav } from '../components/SuiteSubNav';
import { LenderReadyDossierModal } from '../components/LenderReadyDossierModal';
import { ProBrandingModal } from '../components/ProBrandingModal';
import { InfoTooltip } from '../components/InfoTooltip';

// Sourced from the shared registry so the rendered page, the JSON-LD and the
// prerendered HTML can never disagree. This page previously declared FAQPage
// schema for questions that appeared nowhere on the page, which violates
// Google's structured data guidelines.
const mortgageFaqs = getCalculatorFaqs('/mortgage-calculator');

const mortgageSchemas = [
  {
    '@type': 'WebApplication',
    name: 'Mortgage Calculator with Amortization Schedule',
    url: 'https://tableview.dev/mortgage-calculator',
    description: 'Free in-browser mortgage payment calculator. Calculates monthly PITI, PMI auto-dropoff, property taxes, HOA, and amortization schedules with Excel export.',
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
      { '@type': 'ListItem', position: 3, name: 'Mortgage Calculator', item: 'https://tableview.dev/mortgage-calculator' }
    ]
  },
  {
    '@type': 'FAQPage',
    mainEntity: mortgageFaqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  }
];

interface MortgageCalculatorProps {
  onTrySample?: () => void;
}

export const MortgageCalculator = ({ onTrySample: _onTrySample }: MortgageCalculatorProps) => {
  const [showScenariosModal, setShowScenariosModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [showBrandingModal, setShowBrandingModal] = useState(false);

  useEffect(() => {
    updatePageMeta(
      CALCULATOR_META['/mortgage-calculator'].title,
      CALCULATOR_META['/mortgage-calculator'].description,
      CALCULATOR_META['/mortgage-calculator'].canonical,
      mortgageSchemas
    );
  }, []);

  const getNumQuery = (name: string, fallback: number): number => {
    try {
      const p = new URLSearchParams(window.location.search).get(name);
      if (p !== null && !isNaN(Number(p)) && Number(p) > 0) return Number(p);
    } catch {}
    return fallback;
  };

  // Form State initialized with URL search params support
  const [homeValue, setHomeValue] = useState<number>(() => getNumQuery('homeValue', 400000));
  const [downPayment, setDownPayment] = useState<number>(() => getNumQuery('downPayment', 80000));
  const [downPaymentType, setDownPaymentType] = useState<'money' | 'percent'>('money');
  const [interestRate, setInterestRate] = useState<number>(() => getNumQuery('rate', 6.48));
  const [loanTermYears, setLoanTermYears] = useState<number>(() => getNumQuery('term', 30));
  const [startMonth, setStartMonth] = useState<number>(9);
  const [startYear, setStartYear] = useState<number>(2026);
  const [propertyTaxYearly, setPropertyTaxYearly] = useState<number>(() => getNumQuery('tax', 3000));
  const [pmiRate, setPmiRate] = useState<number>(0.5);
  const [ficoTier, setFicoTier] = useState<FicoScoreTier>('760+');
  const [closingCostPercent, setClosingCostPercent] = useState<number>(3.0);
  const [grossAnnualIncome, setGrossAnnualIncome] = useState<number>(120000);
  const [monthlyOtherDebts, setMonthlyOtherDebts] = useState<number>(600);
  const [homeInsuranceYearly, setHomeInsuranceYearly] = useState<number>(() => getNumQuery('insurance', 1500));
  const [monthlyHoa, setMonthlyHoa] = useState<number>(() => getNumQuery('hoa', 0));
  const [loanType, setLoanType] = useState<'conventional' | 'fha' | 'va' | 'usda'>('conventional');
  const buyOrRefi = 'buy' as const;
  
  // Extra Principal Input for Simulator
  const [extraMonthlyPrincipal, setExtraMonthlyPrincipal] = useState<number>(0);
  const [extraLumpSumAmount, setExtraLumpSumAmount] = useState<number>(0);
  const [extraLumpSumMonth, setExtraLumpSumMonth] = useState<number>(24);

  // View state for Amortization table
  const [scheduleView, setScheduleView] = useState<'annual' | 'monthly'>('annual');
  const [monthlyPage, setMonthlyPage] = useState<number>(1);
  const [activePreset, setActivePreset] = useState<string | null>('30-yr-conventional');
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'breakdown' | 'cashToClose' | 'dti' | 'payoff' | 'schedule'>('breakdown');

  const MORTGAGE_PRESETS = [
    {
      id: '30-yr-conventional',
      label: '30-Yr Fixed',
      badge: '20% Down',
      apply: () => {
        setHomeValue(400000);
        setDownPayment(80000);
        setDownPaymentType('money');
        setInterestRate(6.5);
        setLoanTermYears(30);
        setLoanType('conventional');
        setPropertyTaxYearly(3200);
        setHomeInsuranceYearly(1500);
        setMonthlyHoa(0);
        setExtraMonthlyPrincipal(0);
      }
    },
    {
      id: '15-yr-fast-equity',
      label: '15-Yr Fixed',
      badge: 'Fast Equity',
      apply: () => {
        setHomeValue(400000);
        setDownPayment(80000);
        setDownPaymentType('money');
        setInterestRate(5.85);
        setLoanTermYears(15);
        setLoanType('conventional');
        setPropertyTaxYearly(3200);
        setHomeInsuranceYearly(1500);
        setMonthlyHoa(0);
        setExtraMonthlyPrincipal(0);
      }
    },
    {
      id: 'fha-starter',
      label: 'FHA 30-Yr',
      badge: '3.5% Down',
      apply: () => {
        setHomeValue(350000);
        setDownPayment(12250);
        setDownPaymentType('money');
        setInterestRate(6.25);
        setLoanTermYears(30);
        setLoanType('fha');
        setPropertyTaxYearly(3000);
        setHomeInsuranceYearly(1400);
        setMonthlyHoa(0);
        setExtraMonthlyPrincipal(0);
      }
    },
    {
      id: 'starter-condo',
      label: 'Condo w/ HOA',
      badge: 'Starter',
      apply: () => {
        setHomeValue(280000);
        setDownPayment(28000);
        setDownPaymentType('money');
        setInterestRate(6.6);
        setLoanTermYears(30);
        setLoanType('conventional');
        setPropertyTaxYearly(2400);
        setHomeInsuranceYearly(900);
        setMonthlyHoa(280);
        setExtraMonthlyPrincipal(0);
      }
    },
    {
      id: 'jumbo-luxury',
      label: 'Jumbo Loan',
      badge: 'High Balance',
      apply: () => {
        setHomeValue(950000);
        setDownPayment(190000);
        setDownPaymentType('money');
        setInterestRate(6.75);
        setLoanTermYears(30);
        setLoanType('conventional');
        setPropertyTaxYearly(8500);
        setHomeInsuranceYearly(2800);
        setMonthlyHoa(0);
        setExtraMonthlyPrincipal(0);
      }
    }
  ];

  // Sync Down Payment when type changes
  const handleDownPaymentTypeChange = (newType: 'money' | 'percent') => {
    if (newType === downPaymentType) return;
    if (newType === 'percent') {
      const pct = homeValue > 0 ? Number(((downPayment / homeValue) * 100).toFixed(2)) : 20;
      setDownPayment(pct);
    } else {
      const amt = Number(((homeValue * downPayment) / 100).toFixed(0));
      setDownPayment(amt);
    }
    setDownPaymentType(newType);
  };

  // Quick Presets
  const homeValuePresets = [250000, 400000, 600000, 850000, 1200000];
  const termPresets = [10, 15, 20, 30];

  // Calculations
  const inputs: MortgageInputs = useMemo(
    () => ({
      homeValue,
      downPayment,
      downPaymentType,
      interestRate,
      loanTermYears,
      startMonth,
      startYear,
      propertyTaxYearly,
      pmiRate,
      homeInsuranceYearly,
      monthlyHoa,
      loanType,
      buyOrRefi,
      extraMonthlyPrincipal,
      extraLumpSumAmount,
      extraLumpSumMonth
    }),
    [
      homeValue,
      downPayment,
      downPaymentType,
      interestRate,
      loanTermYears,
      startMonth,
      startYear,
      propertyTaxYearly,
      pmiRate,
      homeInsuranceYearly,
      monthlyHoa,
      loanType,
      buyOrRefi,
      extraMonthlyPrincipal,
      extraLumpSumAmount,
      extraLumpSumMonth
    ]
  );

  const summary = useMemo(() => calculateMortgage(inputs), [inputs]);
  const monthlySchedule = useMemo(
    () => generateAmortizationSchedule(inputs, extraMonthlyPrincipal, extraLumpSumAmount, extraLumpSumMonth),
    [inputs, extraMonthlyPrincipal, extraLumpSumAmount, extraLumpSumMonth]
  );
  const chartData = useMemo(() => getAmortizationChartData(monthlySchedule), [monthlySchedule]);
  const annualSchedule = useMemo(
    () => getAnnualAmortizationSchedule(monthlySchedule),
    [monthlySchedule]
  );
  const biweekly = useMemo(() => calculateBiweeklyComparison(inputs), [inputs]);

  const cashToClose = useMemo(() => {
    return estimateCashToClose(homeValue, summary.downPaymentAmount, closingCostPercent);
  }, [homeValue, summary.downPaymentAmount, closingCostPercent]);

  const dtiAnalysis = useMemo(() => {
    return calculateDtiAffordability(grossAnnualIncome, monthlyOtherDebts, summary.totalMonthlyPayment);
  }, [grossAnnualIncome, monthlyOtherDebts, summary.totalMonthlyPayment]);

  const handleSelectFicoTier = (tier: FicoScoreTier) => {
    setFicoTier(tier);
    setPmiRate(FICO_PROFILES[tier].defaultPmiRate);
  };

  // Format Currency Helper
  const fmt = (val: number) =>
    val.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  const fmtInt = (val: number) =>
    val.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

  // Calculate slices for Donut Chart
  const totalMonthly = summary.totalMonthlyPayment || 1;
  const piPct = (summary.monthlyPrincipalAndInterest / totalMonthly) * 100;
  const taxPct = (summary.monthlyPropertyTax / totalMonthly) * 100;
  const insPct = (summary.monthlyHomeInsurance / totalMonthly) * 100;
  const pmiPct = (summary.monthlyPmi / totalMonthly) * 100;
  const hoaPct = (summary.monthlyHoa / totalMonthly) * 100;

  // Monthly pagination
  const rowsPerPage = 24;
  const totalMonthlyPages = Math.ceil(monthlySchedule.length / rowsPerPage);
  const paginatedMonthlyRows = useMemo(() => {
    const start = (monthlyPage - 1) * rowsPerPage;
    return monthlySchedule.slice(start, start + rowsPerPage);
  }, [monthlySchedule, monthlyPage]);

  // Export handlers
  const handleExportCsv = () => {
    const csvContent = exportAmortizationToCsv(monthlySchedule);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mortgage_amortization_${homeValue}_${loanTermYears}yr.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    const data = monthlySchedule.map((row) => ({
      'Month #': row.monthIndex,
      'Year': row.year,
      'Month': row.monthName,
      'Starting Balance ($)': Number(row.startingBalance.toFixed(2)),
      'Principal ($)': Number(row.principalPaid.toFixed(2)),
      'Interest ($)': Number(row.interestPaid.toFixed(2)),
      'Property Tax ($)': Number(row.propertyTax.toFixed(2)),
      'Home Insurance ($)': Number(row.homeInsurance.toFixed(2)),
      'PMI ($)': Number(row.pmi.toFixed(2)),
      'HOA ($)': Number(row.hoa.toFixed(2)),
      'Total Payment ($)': Number(row.totalPayment.toFixed(2)),
      'Ending Balance ($)': Number(row.endingBalance.toFixed(2)),
      'Cumulative Interest ($)': Number(row.totalInterestToDate.toFixed(2))
    }));

    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Amortization Schedule');
    XLSX.writeFile(wb, `mortgage_schedule_${homeValue}.xlsx`);
  };

  const handleExportPdf = () => {
    const prevTitle = document.title;
    const viewSuffix = scheduleView === 'monthly' ? 'monthly_schedule' : 'annual_summary';
    document.title = `mortgage_amortization_statement_${homeValue}_${loanTermYears}yr_${viewSuffix}`;
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 1000);
  };

  return (
    <>
      {/* data-sentry-mask: every field on this page is the user's own financial position. */}
      <div data-sentry-mask="true" className="print:hidden w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-24 lg:pb-12 space-y-10">
      {/* Canonical Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Calculators', path: '/finance-calculator' },
          { label: 'Mortgage Calculator' }
        ]}
        badge={{
          icon: ShieldCheck,
          label: '100% In-Browser Private · Zero Cloud Egress',
          tone: 'emerald'
        }}
        title="Home Mortgage & Loan Calculator"
        description="Accurately calculate your total monthly mortgage payment including principal, interest, real estate taxes, homeowner insurance, PMI, and HOA fees. Includes real-time amortization schedules and bi-weekly savings analysis."
        actions={
          <>
            <button
              type="button"
              onClick={() => navigateTo('/refinance-calculator')}
              className="h-9 px-3.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs active:scale-95 shrink-0"
              title="Compare refinancing rates and break-even horizon"
            >
              <span>Refinance Break-Even</span>
              <ArrowRight className="size-3 text-indigo-500" />
            </button>
            <ShareCalculationButton
              params={{
                homeValue,
                downPayment,
                rate: interestRate,
                term: loanTermYears,
                tax: propertyTaxYearly,
                insurance: homeInsuranceYearly,
                hoa: monthlyHoa
              }}
              title="Share Deal"
            />
            <button
              type="button"
              onClick={() => setShowScenariosModal(true)}
              className="h-9 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5 shrink-0"
              title="Save or compare deal scenarios locally in your browser"
            >
              <Bookmark className="size-3.5 text-indigo-500" />
              <span>Saved Scenarios</span>
            </button>
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
            <PrintReportButton onPrint={handleExportPdf} label="Print / PDF" />
          </>
        }
        presets={
          <CalculatorPresetsBar
            presets={MORTGAGE_PRESETS}
            activePresetId={activePreset}
            onSelectPreset={(preset) => {
              setActivePreset(preset.id);
              preset.apply?.();
            }}
          />
        }
      />

      <SuiteSubNav suite="mortgage" />

      {/* Main 2-Column Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Loan Input Parameters (5 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-300/80 rounded-2xl p-5 sm:p-7 space-y-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200/80 pb-3 flex items-center gap-2">
              <DollarSign className="size-4 text-emerald-600" />
              Property & Loan Information
            </h2>

            {/* Home Value */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <label htmlFor="home-value" className="text-xs font-semibold text-slate-700">
                  Home Purchase Price
                </label>
                <InfoTooltip
                  title="Home Purchase Price"
                  content="The agreed contract price of the home. All down payment and loan calculations are based on this value."
                />
              </div>
              <CurrencyInput
                id="home-value"
                value={homeValue}
                onChange={setHomeValue}
                className="py-2.5"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>Quick Values:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  {homeValuePresets.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setHomeValue(preset);
                        if (downPaymentType === 'percent') {
                          // keep pct
                        } else {
                          setDownPayment(Math.round(preset * 0.2));
                        }
                      }}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[10px] cursor-pointer transition-colors font-mono"
                    >
                      ${preset >= 1000000 ? `${preset / 1000000}M` : `${preset / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Down Payment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <label htmlFor="down-payment" className="text-xs font-semibold text-slate-700">
                    Down Payment
                  </label>
                  <InfoTooltip
                    title="Down Payment & PMI Rule"
                    content="Conventional loans typically require 20% down to waive Private Mortgage Insurance (PMI). Putting down less than 20% (e.g. 3% to 5%) is allowed, but monthly PMI will be added until your loan balance reaches 78-80% LTV."
                  />
                </div>
                {/* $ or % Toggle */}
                <div className="inline-flex rounded-lg border border-slate-300 bg-slate-100 p-0.5 text-xs font-semibold shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleDownPaymentTypeChange('money')}
                    className={`px-3 py-1 sm:py-0.5 rounded-md transition-all cursor-pointer ${
                      downPaymentType === 'money'
                        ? 'bg-slate-900 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    $ (Dollar)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownPaymentTypeChange('percent')}
                    className={`px-3 py-1 sm:py-0.5 rounded-md transition-all cursor-pointer ${
                      downPaymentType === 'percent'
                        ? 'bg-slate-900 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    % (Percent)
                  </button>
                </div>
              </div>
              {downPaymentType === 'money' ? (
                <CurrencyInput
                  id="down-payment"
                  value={downPayment}
                  onChange={setDownPayment}
                  className="py-2.5"
                />
              ) : (
                <NumericInput
                  id="down-payment"
                  value={downPayment}
                  onChange={setDownPayment}
                  suffix="%"
                  max={100}
                  className="py-2.5"
                />
              )}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>
                  Actual Down: <strong className="text-slate-900">{fmtInt(summary.downPaymentAmount)}</strong> ({summary.downPaymentPercent.toFixed(1)}%)
                </span>
                <span>
                  Loan Amount: <strong className="text-slate-900">{fmtInt(summary.loanAmount)}</strong>
                </span>
              </div>
            </div>

            {/* Freddie Mac PMMS Benchmark Rate Ticker */}
            <PmmsRateTicker
              currentRate={interestRate}
              onSelectRate={(rate, term) => {
                setInterestRate(rate);
                if (term) setLoanTermYears(term);
              }}
            />

            {/* Interest Rate & Term */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <label htmlFor="interest-rate" className="text-xs font-semibold text-slate-700">
                    Interest Rate (APR)
                  </label>
                  <InfoTooltip
                    title="Interest Rate vs APR"
                    content="Interest rate is the basic annual cost of borrowing. The Annual Percentage Rate (APR) reflects the true yearly cost of the loan including lender fees, points, and closing expenses."
                  />
                </div>
                <NumericInput
                  id="interest-rate"
                  value={interestRate}
                  onChange={setInterestRate}
                  suffix="%"
                  className="py-2.5"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <label htmlFor="loan-term" className="text-xs font-semibold text-slate-700">
                    Loan Term (Years)
                  </label>
                  <InfoTooltip
                    title="Loan Term"
                    content="The length of time to repay the mortgage. 30-year terms offer lower monthly payments, while 15-year terms significantly cut total interest paid over the life of the loan."
                  />
                </div>
                <NumericInput
                  id="loan-term"
                  value={loanTermYears}
                  onChange={setLoanTermYears}
                  suffix="years"
                  className="py-2.5"
                />
              </div>
            </div>

            {/* Term presets */}
            <div className="flex items-center gap-2 pt-0.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-600">Quick Terms:</span>
              {termPresets.map(term => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setLoanTermYears(term)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                    loanTermYears === term
                      ? 'bg-slate-900 text-white border border-slate-900 ring-2 ring-slate-900/10'
                      : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-300'
                  }`}
                >
                  {term} Yrs
                </button>
              ))}
            </div>

            {/* Start Date */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                First Payment Start Date
              </label>
              <MonthYearPicker
                id="mortgage-start-date"
                month={startMonth}
                year={startYear}
                onChange={({ month, year }) => {
                  setStartMonth(month);
                  setStartYear(year);
                }}
              />
            </div>
          </div>

          {/* Taxes, Insurance, and HOA Fees Card */}
          <div className="bg-white border border-slate-300/80 rounded-2xl p-5 sm:p-7 space-y-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200/80 pb-3 flex items-center gap-2">
              <ShieldCheck className="size-4 text-cyan-600" />
              Taxes, Insurance & Fees
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Property Tax */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <label htmlFor="property-tax" className="text-xs font-semibold text-slate-700">
                      Property Taxes
                    </label>
                    <InfoTooltip
                      title="Real Estate Property Taxes"
                      content="Local municipal or county taxes assessed on your home's taxable value, usually collected monthly via an escrow account to fund public schools and municipal infrastructure."
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {fmt(summary.monthlyPropertyTax)}/mo
                  </span>
                </div>
                <CurrencyInput
                  id="property-tax"
                  value={propertyTaxYearly}
                  onChange={setPropertyTaxYearly}
                  suffix="/yr"
                  className="py-2 text-xs"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>{(homeValue > 0 ? ((propertyTaxYearly / homeValue) * 100).toFixed(2) : '0.00')}% effective</span>
                  <div className="flex items-center gap-1">
                    {[
                      { s: 'CA', r: 0.73 },
                      { s: 'TX', r: 1.68 },
                      { s: 'FL', r: 0.86 },
                      { s: 'Avg', r: 1.05 }
                    ].map(p => (
                      <button
                        key={p.s}
                        type="button"
                        onClick={() => setPropertyTaxYearly(Math.round(homeValue * (p.r / 100)))}
                        className="px-2 py-1 sm:py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] sm:text-[10px] cursor-pointer transition-colors"
                        title={`Set to ${p.s} rate (${p.r}%)`}
                      >
                        {p.s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Home Insurance */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <label htmlFor="home-insurance" className="text-xs font-semibold text-slate-700">
                      Homeowners Ins
                    </label>
                    <InfoTooltip
                      title="Homeowners Hazard Insurance (HOI)"
                      content="Covers property damage from fire, storm hazards, theft, and personal liability. Lenders require active hazard insurance coverage before funding any mortgage."
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {fmt(summary.monthlyHomeInsurance)}/mo
                  </span>
                </div>
                <CurrencyInput
                  id="home-insurance"
                  value={homeInsuranceYearly}
                  onChange={setHomeInsuranceYearly}
                  suffix="/yr"
                  className="py-2 text-xs"
                />
              </div>

              {/* PMI Rate */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <label htmlFor="pmi-rate" className="font-semibold text-slate-700">
                      PMI Rate
                    </label>
                    <InfoTooltip
                      title="Private Mortgage Insurance (PMI)"
                      content="Annual PMI rate typically ranges from 0.2% to 1.5% depending on down payment and FICO score. Under the federal Homeowners Protection Act, PMI automatically cancels once your balance reaches 78% of the original home purchase price."
                    />
                    {summary.isPmiRequired ? (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-normal whitespace-nowrap">
                        Active (&lt;20%)
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-normal whitespace-nowrap">
                        Waived (&ge;20%)
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono shrink-0">
                    {fmt(summary.monthlyPmi)}/mo
                  </span>
                </div>
                <NumericInput
                  id="pmi-rate"
                  value={summary.isPmiRequired ? pmiRate : 0}
                  onChange={setPmiRate}
                  disabled={!summary.isPmiRequired}
                  suffix="%"
                  className="py-2 text-xs"
                />
                {summary.isPmiRequired && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-slate-700">FICO Credit Tier:</span>
                        <InfoTooltip
                          title="FICO & Fannie Mae LLPA"
                          content="Loan-Level Price Adjustments (LLPAs) are risk fees charged by Fannie Mae and Freddie Mac. Higher credit tiers receive lower monthly PMI premiums and lower interest rates."
                        />
                      </div>
                      <span className="text-slate-500 font-medium">{FICO_PROFILES[ficoTier].creditRating}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {(['760+', '720-759', '680-719', '640-679', '620-639'] as FicoScoreTier[]).map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => handleSelectFicoTier(tier)}
                          className={`py-1 text-[10px] font-bold rounded border transition-all cursor-pointer text-center ${
                            ficoTier === tier
                              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight pt-0.5">
                      {FICO_PROFILES[ficoTier].description} (Fannie Mae LLPA: +{FICO_PROFILES[ficoTier].llpaRateAdjustment}%)
                    </p>
                  </div>
                )}
              </div>

              {/* Monthly HOA */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <label htmlFor="monthly-hoa" className="text-xs font-semibold text-slate-700">
                      Monthly HOA Dues
                    </label>
                    <InfoTooltip
                      title="Homeowners Association (HOA) Fees"
                      content="Monthly fees assessed by HOA boards for shared amenities, roof/exterior insurance, community landscaping, and trash collection. Lenders include this fee in debt-to-income (DTI) underwriting."
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {fmt(summary.monthlyHoa)}/mo
                  </span>
                </div>
                <CurrencyInput
                  id="monthly-hoa"
                  value={monthlyHoa}
                  onChange={setMonthlyHoa}
                  suffix="/mo"
                  className="py-2 text-xs"
                />
              </div>
            </div>

            {/* Loan Program Type */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center gap-1.5">
                <label htmlFor="loan-type" className="text-xs font-semibold text-slate-700">
                  Loan Program Type
                </label>
                <InfoTooltip
                  title="Mortgage Loan Programs"
                  content="Conventional loans conform to Fannie Mae / Freddie Mac standards. FHA allows low credit / 3.5% down. VA offers 0% down for veterans, and USDA offers 0% down in qualifying rural locations."
                />
              </div>
              <select
                id="loan-type"
                value={loanType}
                onChange={(e) => setLoanType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-base sm:text-xs font-medium outline-none cursor-pointer focus:border-indigo-500"
              >
                <option value="conventional">Conventional Loan (Standard PMI if down &lt; 20%)</option>
                <option value="fha">FHA Loan (Federal Housing Administration)</option>
                <option value="va">VA Loan (0% Down for Veterans & Military)</option>
                <option value="usda">USDA Loan (Rural Development Loan)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Results & Repayment Breakdown (6 Cols) */}
        <div id="results-section" className="lg:col-span-6 space-y-5 scroll-mt-20">
          {/* Main Monthly Payment Hero Card (High Contrast Dark Slate) */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 space-y-5 shadow-lg border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 size-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 relative z-10">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  Estimated Total Monthly Payment
                </span>
                <div className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
                  {fmt(summary.totalMonthlyPayment)}
                  <span className="text-sm sm:text-base font-normal text-slate-400 ml-1.5">/month</span>
                </div>
              </div>

              <div className="text-left sm:text-right bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-700/80">
                <span className="text-[11px] text-slate-400 block">Annual Payment</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {fmt(summary.annualPaymentAmount)}
                </span>
              </div>
            </div>

            {/* Visual Stacked Bar Breakdown */}
            <div className="space-y-2.5 relative z-10">
              <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex border border-slate-700 p-0.5 shadow-inner">
                <div
                  style={{ width: `${piPct}%` }}
                  className="bg-indigo-500 rounded-l-full h-full transition-all duration-300"
                  title={`P&I: ${fmt(summary.monthlyPrincipalAndInterest)} (${piPct.toFixed(1)}%)`}
                />
                <div
                  style={{ width: `${taxPct}%` }}
                  className="bg-cyan-400 h-full transition-all duration-300"
                  title={`Taxes: ${fmt(summary.monthlyPropertyTax)} (${taxPct.toFixed(1)}%)`}
                />
                <div
                  style={{ width: `${insPct}%` }}
                  className="bg-emerald-400 h-full transition-all duration-300"
                  title={`Insurance: ${fmt(summary.monthlyHomeInsurance)} (${insPct.toFixed(1)}%)`}
                />
                {pmiPct > 0 && (
                  <div
                    style={{ width: `${pmiPct}%` }}
                    className="bg-amber-400 h-full transition-all duration-300"
                    title={`PMI: ${fmt(summary.monthlyPmi)} (${pmiPct.toFixed(1)}%)`}
                  />
                )}
                {hoaPct > 0 && (
                  <div
                    style={{ width: `${hoaPct}%` }}
                    className="bg-purple-400 rounded-r-full h-full transition-all duration-300"
                    title={`HOA: ${fmt(summary.monthlyHoa)} (${hoaPct.toFixed(1)}%)`}
                  />
                )}
              </div>

              {/* Legend & Breakdown Items */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
                    <span className="size-2 rounded-full bg-indigo-500" />
                    <span>Principal & Interest</span>
                  </div>
                  <div className="text-sm font-bold text-white font-mono">
                    {fmt(summary.monthlyPrincipalAndInterest)}
                  </div>
                  <div className="text-[11px] text-slate-400">{piPct.toFixed(1)}% of total</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
                    <span className="size-2 rounded-full bg-cyan-400" />
                    <span>Property Taxes</span>
                  </div>
                  <div className="text-sm font-bold text-white font-mono">
                    {fmt(summary.monthlyPropertyTax)}
                  </div>
                  <div className="text-[11px] text-slate-400">{taxPct.toFixed(1)}% of total</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <span className="size-2 rounded-full bg-emerald-400" />
                    <span>Home Insurance</span>
                  </div>
                  <div className="text-sm font-bold text-white font-mono">
                    {fmt(summary.monthlyHomeInsurance)}
                  </div>
                  <div className="text-[11px] text-slate-400">{insPct.toFixed(1)}% of total</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
                    <span className="size-2 rounded-full bg-amber-400" />
                    <span>PMI Insurance</span>
                  </div>
                  <div className="text-sm font-bold text-white font-mono">
                    {summary.monthlyPmi > 0 ? fmt(summary.monthlyPmi) : '$0.00'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {summary.monthlyPmi > 0 ? `${pmiPct.toFixed(1)}% of total` : 'Not required'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium">
                    <span className="size-2 rounded-full bg-purple-400" />
                    <span>Monthly HOA</span>
                  </div>
                  <div className="text-sm font-bold text-white font-mono">
                    {fmt(summary.monthlyHoa)}
                  </div>
                  <div className="text-[11px] text-slate-400">{hoaPct.toFixed(1)}% of total</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                    <Calendar className="size-3 text-slate-400" />
                    <span>Loan Pay-off Date</span>
                  </div>
                  <div className="text-sm font-bold text-white font-mono">
                    {summary.payoffDateString}
                  </div>
                  <div className="text-[11px] text-slate-400">{summary.totalMonths} total payments</div>
                </div>
              </div>
            </div>
          </div>

          {/* Focused Analysis Tabs - High Contrast Segmented Control */}
          <div className="flex items-center p-1 bg-white border border-slate-300 rounded-xl shadow-xs gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveAnalysisTab('breakdown')}
              className={`py-2 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 sm:flex-1 ${
                activeAnalysisTab === 'breakdown'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <PiggyBank className="size-3.5 text-amber-500" />
              <span>Cost Breakdown</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveAnalysisTab('cashToClose')}
              className={`py-2 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 sm:flex-1 ${
                activeAnalysisTab === 'cashToClose'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Wallet className="size-3.5 text-emerald-500" />
              <span>Cash to Close</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveAnalysisTab('dti')}
              className={`py-2 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 sm:flex-1 ${
                activeAnalysisTab === 'dti'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Scale className="size-3.5 text-blue-500" />
              <span>DTI & Qualify</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveAnalysisTab('payoff')}
              className={`py-2 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 sm:flex-1 ${
                activeAnalysisTab === 'payoff'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Sparkles className="size-3.5 text-amber-400" />
              <span>Payoff Simulator</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveAnalysisTab('schedule')}
              className={`py-2 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 sm:flex-1 ${
                activeAnalysisTab === 'schedule'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Calendar className="size-3.5 text-indigo-500" />
              <span>Amortization</span>
            </button>
          </div>

          {/* Tab 1: Breakdown & Totals */}
          {activeAnalysisTab === 'breakdown' && (
            <div className="bg-white border border-slate-300/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs animate-in fade-in-50 duration-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <PiggyBank className="size-4 text-amber-500" />
                Total Cost Over Life of Loan ({summary.totalMonths} Months)
              </h3>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 block">Total Interest Paid</span>
                  <span className="text-lg font-bold text-slate-900 font-mono">
                    {fmt(summary.totalInterestPaid)}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {(summary.totalInterestPaid / (summary.loanAmount || 1) * 100).toFixed(0)}% of principal
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 block">Total Principal Paid</span>
                  <span className="text-lg font-bold text-slate-900 font-mono">
                    {fmt(summary.loanAmount)}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    100% of original loan
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 block">Total Taxes & Insurance</span>
                  <span className="text-lg font-bold text-slate-900 font-mono">
                    {fmt(summary.totalPropertyTaxPaid + summary.totalHomeInsurancePaid + summary.totalPmiPaid)}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Over {loanTermYears} years
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 block">Total of All Payments</span>
                  <span className="text-lg font-bold text-emerald-600 font-mono">
                    {fmt(summary.totalOfAllPayments)}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    P&I, taxes, insurance, fees
                  </span>
                </div>
              </div>

              {/* Visual Donut Chart Breakdown */}
              <PaymentDonutChart
                principalAndInterest={summary.monthlyPrincipalAndInterest}
                propertyTax={summary.monthlyPropertyTax}
                homeInsurance={summary.monthlyHomeInsurance}
                hoa={summary.monthlyHoa}
                pmi={summary.monthlyPmi}
                totalMonthly={summary.totalMonthlyPayment}
              />

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">Loan Amount</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">{fmt(summary.loanAmount)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">Total Interest</span>
                  <span className="text-sm font-bold text-rose-600 font-mono">{fmt(summary.totalInterestPaid)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">Payoff Date</span>
                  <span className="text-sm font-bold text-indigo-600 font-mono">{summary.payoffDateString}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">Total Payments</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">{fmt(summary.totalOfAllPayments)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Cash to Close Breakdown */}
          {activeAnalysisTab === 'cashToClose' && (
            <div className="bg-white border border-slate-300/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="size-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Estimated Cash to Close Breakdown
                  </h3>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">
                  Due on Settlement Day
                </span>
              </div>

              {/* Top Banner with Total Required */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold block">Total Estimated Cash to Close</span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-0.5">
                    {fmtInt(cashToClose.totalCashToClose)}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Down Payment ({fmtInt(cashToClose.downPayment)}) + Closing Costs & Prepaids ({fmtInt(cashToClose.totalClosingCosts)})
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-800/80 p-2 rounded-lg border border-slate-700 text-xs">
                  <label htmlFor="closing-pct" className="text-slate-300 font-medium">Closing Cost Est:</label>
                  <select
                    id="closing-pct"
                    value={closingCostPercent}
                    onChange={(e) => setClosingCostPercent(Number(e.target.value))}
                    className="bg-slate-900 text-white font-mono font-bold px-2 py-1 rounded border border-slate-600 text-xs outline-none cursor-pointer"
                  >
                    <option value={2.0}>2.0% (Low Cost)</option>
                    <option value={2.5}>2.5% (Competitive)</option>
                    <option value={3.0}>3.0% (National Avg)</option>
                    <option value={3.5}>3.5% (High Escrow)</option>
                    <option value={4.0}>4.0% (Conservative)</option>
                  </select>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-700 flex justify-between">
                  <span>Itemized Closing Expense</span>
                  <span>Estimated Amount</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="px-4 py-3 flex justify-between items-center hover:bg-slate-50/60">
                    <div>
                      <span className="font-semibold text-slate-900 block">Down Payment</span>
                      <span className="text-[11px] text-slate-500">Your upfront equity investment ({summary.downPaymentPercent.toFixed(1)}%)</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">{fmtInt(cashToClose.downPayment)}</span>
                  </div>

                  <div className="px-4 py-3 flex justify-between items-center hover:bg-slate-50/60">
                    <div>
                      <span className="font-semibold text-slate-900 block">Lender Origination & Processing</span>
                      <span className="text-[11px] text-slate-500">Underwriting, processing, credit report, application fee</span>
                    </div>
                    <span className="font-mono text-slate-800 font-medium">{fmt(cashToClose.lenderFees)}</span>
                  </div>

                  <div className="px-4 py-3 flex justify-between items-center hover:bg-slate-50/60">
                    <div>
                      <span className="font-semibold text-slate-900 block">Title & Settlement Fees</span>
                      <span className="text-[11px] text-slate-500">Lender title insurance policy, escrow/closing attorney, title search</span>
                    </div>
                    <span className="font-mono text-slate-800 font-medium">{fmt(cashToClose.titleAndEscrow)}</span>
                  </div>

                  <div className="px-4 py-3 flex justify-between items-center hover:bg-slate-50/60">
                    <div>
                      <span className="font-semibold text-slate-900 block">Prepaids & Escrow Reserves</span>
                      <span className="text-[11px] text-slate-500">Prepaid daily interest + 3 to 6 months homeowners insurance & property tax buffer</span>
                    </div>
                    <span className="font-mono text-slate-800 font-medium">{fmt(cashToClose.prepaidsAndEscrow)}</span>
                  </div>

                  <div className="px-4 py-3 flex justify-between items-center hover:bg-slate-50/60">
                    <div>
                      <span className="font-semibold text-slate-900 block">Third-Party Appraisals & Inspections</span>
                      <span className="text-[11px] text-slate-500">Licensed residential appraisal, pest/radon inspections, flood certification</span>
                    </div>
                    <span className="font-mono text-slate-800 font-medium">{fmt(cashToClose.thirdPartyServices)}</span>
                  </div>

                  <div className="px-4 py-3 flex justify-between items-center hover:bg-slate-50/60">
                    <div>
                      <span className="font-semibold text-slate-900 block">Government Recording & Transfer Taxes</span>
                      <span className="text-[11px] text-slate-500">County deed and mortgage recording fees, local transfer stamps</span>
                    </div>
                    <span className="font-mono text-slate-800 font-medium">{fmt(cashToClose.governmentFees)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-blue-950">
                  <CheckCircle2 className="size-4 text-blue-600" />
                  Borrower Tip: Closing Day Wire
                </span>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Lenders will issue a formal Closing Disclosure (CD) at least 3 business days before settlement showing the exact penny-accurate cash required. In the US, closing funds must typically be sent via wire transfer or cashier's check.
                </p>
              </div>
            </div>
          )}

          {/* Tab: DTI Affordability & Qualification Check */}
          {activeAnalysisTab === 'dti' && (
            <div className="bg-white border border-slate-300/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Scale className="size-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Debt-to-Income (DTI) Qualification Check
                  </h3>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                  dtiAnalysis.isQualifiedMortgage
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {dtiAnalysis.isQualifiedMortgage ? 'QM Conforming Qualified' : 'Exceeds QM 43% Cap'}
                </span>
              </div>

              {/* Income and Debts Quick Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gross Annual Household Income ($)
                  </label>
                  <CurrencyInput
                    value={grossAnnualIncome}
                    onChange={setGrossAnnualIncome}
                    className="py-2 text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Pre-tax income = {fmtInt(dtiAnalysis.monthlyGrossIncome)}/mo
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Debt Obligations ($/mo)
                  </label>
                  <CurrencyInput
                    value={monthlyOtherDebts}
                    onChange={setMonthlyOtherDebts}
                    className="py-2 text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Auto loans, student loans, credit card min. payments
                  </span>
                </div>
              </div>

              {/* Front-End & Back-End DTI Meters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Front-End */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-700">Front-End DTI (Housing)</span>
                      <InfoTooltip
                        title="Front-End DTI (28% Rule)"
                        content="The percentage of your monthly pre-tax income that goes strictly toward housing (Principal, Interest, Property Taxes, Home Insurance, HOA). Lenders typically look for 28% or lower."
                      />
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-base">{dtiAnalysis.frontEndDti}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        dtiAnalysis.frontEndStatus === 'ideal'
                          ? 'bg-emerald-500'
                          : dtiAnalysis.frontEndStatus === 'acceptable'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, (dtiAnalysis.frontEndDti / 50) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Target: &le; 28%</span>
                    <span className={`font-semibold ${
                      dtiAnalysis.frontEndStatus === 'ideal' ? 'text-emerald-700' : 'text-slate-700'
                    }`}>
                      {dtiAnalysis.frontEndStatus === 'ideal' ? 'Ideal (≤ 28%)' : dtiAnalysis.frontEndStatus === 'acceptable' ? 'Acceptable' : 'High (> 36%)'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 pt-1 leading-tight">
                    Housing payment ({fmt(summary.totalMonthlyPayment)}) divided by gross monthly income ({fmtInt(dtiAnalysis.monthlyGrossIncome)}).
                  </p>
                </div>

                {/* Back-End */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-700">Back-End DTI (Total Debt)</span>
                      <InfoTooltip
                        title="Back-End DTI (43% QM Ceiling)"
                        content="The percentage of your monthly pre-tax income needed for all recurring debts combined (housing + auto loans + student loans + minimum credit card payments). Under CFPB Qualified Mortgage standards, 43% is the typical benchmark cap."
                      />
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-base">{dtiAnalysis.backEndDti}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        dtiAnalysis.backEndStatus === 'ideal'
                          ? 'bg-emerald-500'
                          : dtiAnalysis.backEndStatus === 'acceptable'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, (dtiAnalysis.backEndDti / 60) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>QM Guideline: &le; 43%</span>
                    <span className={`font-semibold ${
                      dtiAnalysis.backEndStatus === 'ideal' ? 'text-emerald-700' : dtiAnalysis.backEndStatus === 'acceptable' ? 'text-amber-700' : 'text-rose-700'
                    }`}>
                      {dtiAnalysis.backEndStatus === 'ideal' ? 'Conservative' : dtiAnalysis.backEndStatus === 'acceptable' ? 'Conforming QM Cap' : 'High (> 43%)'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 pt-1 leading-tight">
                    Housing + debts ({fmt(summary.totalMonthlyPayment + monthlyOtherDebts)}) divided by gross monthly income.
                  </p>
                </div>
              </div>

              {/* Max Recommended Payment Callout */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-600 block">Max Recommended Monthly Housing at 43% QM Cap:</span>
                  <span className="text-[11px] text-slate-500">Assuming current ${monthlyOtherDebts.toLocaleString()}/mo debt load</span>
                </div>
                <span className="text-base font-bold font-mono text-slate-900">
                  {fmtInt(dtiAnalysis.maxSuggestedHousingPayment)}/mo
                </span>
              </div>
            </div>
          )}

          {/* Tab 2: Payoff Simulator */}
          {activeAnalysisTab === 'payoff' && (
            <div className="bg-white border border-slate-300/90 rounded-2xl p-6 space-y-4 shadow-xs animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Bi-Weekly Mortgage & Early Payoff Acceleration
                  </h3>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">
                  26 half-payments/yr
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
                  <span className="text-xs text-emerald-800 font-medium block">Interest Savings</span>
                  <span className="text-xl font-black text-emerald-700 font-mono mt-0.5">
                    {fmt(biweekly.interestSaved)}
                  </span>
                  <span className="text-[11px] text-emerald-600 block mt-0.5">Saved in mortgage interest</span>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-200/80">
                  <span className="text-xs text-indigo-800 font-medium block">Pay Off Early By</span>
                  <span className="text-xl font-black text-indigo-700 font-mono mt-0.5">
                    {biweekly.yearsSaved} Yrs ({biweekly.monthsSaved} Mo)
                  </span>
                  <span className="text-[11px] text-indigo-600 block mt-0.5">Shortens your loan term</span>
                </div>
              </div>

              {/* Extra Monthly Payment simulator */}
              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-3">
                <label htmlFor="extra-monthly-principal" className="text-xs text-slate-700 font-semibold">
                  Add Extra Monthly Principal:
                </label>
                <div className="w-36">
                  <CurrencyInput
                    id="extra-monthly-principal"
                    value={extraMonthlyPrincipal}
                    onChange={setExtraMonthlyPrincipal}
                    placeholder="0"
                    className="py-1.5 text-base sm:text-xs font-semibold"
                  />
                </div>
              </div>

              {/* One-Time Lump Sum Simulator */}
              <div className="pt-3 border-t border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="extra-lump-sum" className="text-xs text-slate-700 font-semibold">
                    One-time Lump Sum Principal:
                  </label>
                  <div className="w-36">
                    <CurrencyInput
                      id="extra-lump-sum"
                      value={extraLumpSumAmount}
                      onChange={setExtraLumpSumAmount}
                      placeholder="0"
                      className="py-1.5 text-base sm:text-xs font-semibold"
                    />
                  </div>
                </div>
                {extraLumpSumAmount > 0 && (
                  <div className="flex items-center justify-between text-[11px] text-slate-600 pl-1">
                    <span>Pay at Month #{extraLumpSumMonth} (Yr {(extraLumpSumMonth / 12).toFixed(1)}):</span>
                    <input
                      type="range"
                      min="1"
                      max={Math.min(360, loanTermYears * 12)}
                      value={extraLumpSumMonth}
                      onChange={(e) => setExtraLumpSumMonth(Number(e.target.value))}
                      className="w-32 accent-indigo-600 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Schedule Quick Summary */}
          {activeAnalysisTab === 'schedule' && (
            <div className="bg-white border border-slate-300/90 rounded-2xl p-6 space-y-4 shadow-xs animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Amortization Summary
                  </h3>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono">
                  {summary.totalMonths} payments
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Over {loanTermYears} years, you will make {summary.totalMonths} payments totaling <strong className="text-slate-900 font-mono">{fmt(summary.totalOfAllPayments)}</strong>, with <strong className="text-slate-900 font-mono">{fmt(summary.totalInterestPaid)}</strong> in interest.
              </p>

              <div className="pt-2">
                <a
                  href="#amortization-schedule-section"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Calendar className="size-3.5" />
                  <span>View Full Schedule & Export Table Below</span>
                  <ArrowRight className="size-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Visual Amortization Chart */}
      <AmortizationChart data={chartData} />

      {/* Full Amortization Schedule Section */}
      <div id="amortization-schedule-section" className="bg-white border border-slate-300/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="size-5 text-indigo-600" />
              <span>Mortgage Amortization Schedule</span>
            </h3>
            <p className="text-xs text-slate-500">
              Detailed breakdown of principal reduction, interest, and ending balances across each payment period.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full sm:w-auto">
            {/* View Toggle */}
            <div className="grid grid-cols-2 sm:inline-flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setScheduleView('annual')}
                className={`px-3 py-2 sm:py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                  scheduleView === 'annual'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Annual Summary
              </button>
              <button
                type="button"
                onClick={() => setScheduleView('monthly')}
                className={`px-3 py-2 sm:py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                  scheduleView === 'monthly'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly ({monthlySchedule.length})
              </button>
            </div>

            {/* Export Buttons */}
            <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleExportPdf}
                className="px-3 py-2 sm:py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Print or save as bank-grade vector PDF statement"
              >
                <Printer className="size-3.5" />
                <span>Export PDF ({scheduleView === 'monthly' ? 'Monthly' : 'Annual'})</span>
              </button>

              <button
                onClick={handleExportExcel}
                className="px-3 py-2 sm:py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Download formatted Excel workbook (.xlsx)"
              >
                <FileSpreadsheet className="size-3.5" />
                <span>Export Excel</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="px-3 py-2 sm:py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Download CSV spreadsheet"
              >
                <Download className="size-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Amortization Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-sans font-semibold">
              <tr>
                <th className="py-3 px-4">{scheduleView === 'annual' ? 'Year' : 'Date'}</th>
                <th className="py-3 px-4">Starting Balance</th>
                <th className="py-3 px-4 text-emerald-600">Principal Paid</th>
                <th className="py-3 px-4 text-indigo-600">Interest Paid</th>
                <th className="py-3 px-4">Taxes & Ins</th>
                <th className="py-3 px-4 font-bold text-slate-900">Total Payment</th>
                <th className="py-3 px-4">Ending Balance</th>
                <th className="py-3 px-4 text-slate-500">Total Interest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {scheduleView === 'annual'
                ? annualSchedule.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-sans font-bold text-slate-900">
                        {row.year}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">{fmt(row.startingBalance)}</td>
                      <td className="py-2.5 px-4 text-emerald-600 font-medium">{fmt(row.principalPaid)}</td>
                      <td className="py-2.5 px-4 text-indigo-600 font-medium">{fmt(row.interestPaid)}</td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {fmt(row.propertyTax + row.homeInsurance + row.pmi + row.hoa)}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{fmt(row.totalPayment)}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{fmt(row.endingBalance)}</td>
                      <td className="py-2.5 px-4 text-slate-500">{fmt(row.totalInterestToDate)}</td>
                    </tr>
                  ))
                : paginatedMonthlyRows.map((row) => (
                    <tr key={row.monthIndex} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                        {row.monthName} {row.year} <span className="text-[10px] text-slate-500">(#{row.monthIndex})</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">{fmt(row.startingBalance)}</td>
                      <td className="py-2.5 px-4 text-emerald-600 font-medium">{fmt(row.principalPaid)}</td>
                      <td className="py-2.5 px-4 text-indigo-600 font-medium">{fmt(row.interestPaid)}</td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {fmt(row.propertyTax + row.homeInsurance + row.pmi + row.hoa)}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{fmt(row.totalPayment)}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{fmt(row.endingBalance)}</td>
                      <td className="py-2.5 px-4 text-slate-500">{fmt(row.totalInterestToDate)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Monthly View Pagination */}
        {scheduleView === 'monthly' && totalMonthlyPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-2">
            <span>
              Showing {(monthlyPage - 1) * rowsPerPage + 1} to{' '}
              {Math.min(monthlyPage * rowsPerPage, monthlySchedule.length)} of {monthlySchedule.length} payments
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMonthlyPage((p) => Math.max(1, p - 1))}
                disabled={monthlyPage === 1}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 border border-slate-200 text-slate-700 transition-colors cursor-pointer shadow-2xs"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 font-mono text-slate-900">
                Page {monthlyPage} of {totalMonthlyPages}
              </span>
              <button
                type="button"
                onClick={() => setMonthlyPage((p) => Math.min(totalMonthlyPages, p + 1))}
                disabled={monthlyPage === totalMonthlyPages}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 border border-slate-200 text-slate-700 transition-colors cursor-pointer shadow-2xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Highest-intent placement: the reader has just seen their own numbers. */}
      <AdSlot unit="calculatorResult" className="my-8" />

      <MethodologyDisclosure type="mortgage" />

      {/* Competitor Comparison Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 mb-2">
            <Sparkles className="size-3.5 text-indigo-500" />
            <span>Independent Comparison</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Why TableView vs Bankrate, Zillow &amp; Karl's Mortgage Calculator?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            Many major online mortgage calculators serve primarily as lead-generation funnels that collect your phone number and sell it to dozens of competing loan officers. Here is how TableView compares on privacy, features, and analytical depth:
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Feature / Capability</th>
                <th className="py-3 px-4 text-indigo-700 font-bold">TableView.dev</th>
                <th className="py-3 px-4">Bankrate</th>
                <th className="py-3 px-4">Zillow</th>
                <th className="py-3 px-4">Karl's Mortgage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-semibold text-slate-900">In-Browser Privacy</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">Yes (Zero Data Egress)</td>
                <td className="py-3 px-4 text-slate-500">No (Server-Tracked)</td>
                <td className="py-3 px-4 text-slate-500">No (Account / Cloud Tracking)</td>
                <td className="py-3 px-4 text-emerald-600">Yes</td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-semibold text-slate-900">No Lead Capture / Broker Spam</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">Yes (Never Sells Your Data)</td>
                <td className="py-3 px-4 text-rose-600">No (Sells Phone Leads)</td>
                <td className="py-3 px-4 text-rose-600">No (Lender Lead Forms)</td>
                <td className="py-3 px-4 text-amber-600">No (Lead Forms)</td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-semibold text-slate-900">Monthly + Lump-Sum Extra Payments</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">Yes (Both Supported)</td>
                <td className="py-3 px-4 text-slate-700">Yes</td>
                <td className="py-3 px-4 text-slate-500">Monthly Only</td>
                <td className="py-3 px-4 text-slate-700">Yes</td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-semibold text-slate-900">Bi-Weekly Accelerated Schedule</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">Built-In Comparison</td>
                <td className="py-3 px-4 text-slate-500">Hidden in Sub-menu</td>
                <td className="py-3 px-4 text-rose-600">Not Supported</td>
                <td className="py-3 px-4 text-slate-700">Yes</td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-semibold text-slate-900">Interactive SVG Visual Payoff Chart</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">Yes (Zero Bloat SVG)</td>
                <td className="py-3 px-4 text-slate-700">Yes</td>
                <td className="py-3 px-4 text-slate-500">Basic Donut Only</td>
                <td className="py-3 px-4 text-slate-700">Yes</td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-semibold text-slate-900">Excel / CSV Spreadsheet Export</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">1-Click Full Schedule</td>
                <td className="py-3 px-4 text-slate-500">CSV Only</td>
                <td className="py-3 px-4 text-rose-600">Not Supported</td>
                <td className="py-3 px-4 text-slate-500">Basic Text / CSV</td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-semibold text-slate-900">Shareable Pre-filled URL</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">Instant 1-Click Link</td>
                <td className="py-3 px-4 text-rose-600">Not Supported</td>
                <td className="py-3 px-4 text-rose-600">Not Supported</td>
                <td className="py-3 px-4 text-slate-500">Query string only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Knowledge & Explainer Guide Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="size-5 text-indigo-600" />
          Understanding Your Mortgage Payment Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm">What is PITI?</h4>
            <p>
              PITI stands for <strong>Principal, Interest, Taxes, and Insurance</strong>. These four components make up the standard monthly cost of homeownership. In addition to PITI, homeowner association (HOA) fees and private mortgage insurance (PMI) may be included in your monthly payment.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm">When does PMI drop off?</h4>
            <p>
              Under the Homeowners Protection Act, for conventional loans, lenders must automatically terminate PMI once your mortgage principal balance reaches <strong>78% of the original property value</strong> (or you can request cancellation once your loan balance reaches <strong>80% LTV</strong>). This calculator automatically accounts for this dynamic cancellation in your amortization schedule.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm">How Bi-Weekly Payments Save Money</h4>
            <p>
              Making half-payments every two weeks results in 26 half-payments per year (the equivalent of 13 monthly payments instead of 12). That extra payment goes entirely toward your principal, shortening a 30-year mortgage by 4 to 6 years and saving tens of thousands of dollars in interest.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm">In-Browser Privacy Guarantee</h4>
            <p>
              None of your financial inputs, loan balances, or income assumptions are ever transmitted to any remote server or tracked by third-party advertisers. All amortization mathematics and CSV exports execute exclusively in local browser WebAssembly and JavaScript memory.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ rendered from the shared registry so the prerendered markup matches. */}
      <CalculatorFaqSection
        path="/mortgage-calculator"
        title="Frequently Asked Questions About Mortgage Payments"
      />

      {/* Closing unit at the end of the editorial content. */}
      <AdSlot unit="calculatorFaq" format="horizontal" />

      {/* Related Calculators Cross-Sell */}
      <div className="mb-8">
        <RelatedCalculators currentSlug="mortgage-calculator" category="real-estate" />
      </div>

      {/* Mobile Sticky Summary Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-lg flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-500 block leading-tight">
            Monthly Est.
          </span>
          <div className="text-xl font-black text-slate-900 font-mono leading-tight">
            {fmt(summary.totalMonthlyPayment)}
            <span className="text-xs font-normal text-slate-500 font-sans ml-1">/mo</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('results-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="btn-primary px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md active:scale-95 transition-transform cursor-pointer"
        >
          <span>View Details</span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>

    <SavedScenariosModal
      isOpen={showScenariosModal}
      onClose={() => setShowScenariosModal(false)}
      calculatorId="mortgage"
      currentData={{
        homeValue,
        downPayment,
        downPaymentType,
        interestRate,
        loanTermYears,
        propertyTaxYearly,
        homeInsuranceYearly,
        monthlyHoa
      }}
      currentMetrics={{
        headline: `$${Math.round(summary.totalMonthlyPayment).toLocaleString()}/mo`,
        subline: `${loanTermYears}yr Fixed @ ${interestRate}% ($${Math.round(summary.loanAmount).toLocaleString()} Loan)`
      }}
      onLoadScenario={(data) => {
        if (data.homeValue) setHomeValue(data.homeValue);
        if (data.downPayment) setDownPayment(data.downPayment);
        if (data.downPaymentType) setDownPaymentType(data.downPaymentType);
        if (data.interestRate) setInterestRate(data.interestRate);
        if (data.loanTermYears) setLoanTermYears(data.loanTermYears);
        if (data.propertyTaxYearly !== undefined) setPropertyTaxYearly(data.propertyTaxYearly);
        if (data.homeInsuranceYearly !== undefined) setHomeInsuranceYearly(data.homeInsuranceYearly);
        if (data.monthlyHoa !== undefined) setMonthlyHoa(data.monthlyHoa);
      }}
      onUpgradePro={() => {
        setShowScenariosModal(false);
        setShowDossierModal(true);
      }}
    />

    <LenderReadyDossierModal
      isOpen={showDossierModal}
      onClose={() => setShowDossierModal(false)}
      dealTitle={`${loanTermYears}Y Fixed Mortgage · $${homeValue.toLocaleString()}`}
      dealId={`mtg_${homeValue}_${Math.round(summary.loanAmount)}_${interestRate}_${loanTermYears}`}
      onExportExcel={handleExportExcel}
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

    <PrintableMortgageReport
      homeValue={homeValue}
      downPayment={summary.downPaymentAmount}
      loanAmount={summary.loanAmount}
      interestRate={interestRate}
      loanTermYears={loanTermYears}
      loanType={loanType}
      startMonth={startMonth}
      startYear={startYear}
      propertyTaxYearly={propertyTaxYearly}
      homeInsuranceYearly={homeInsuranceYearly}
      monthlyHoa={monthlyHoa}
      summary={summary}
      annualSchedule={annualSchedule}
      monthlySchedule={monthlySchedule}
      scheduleView={scheduleView}
      extraMonthlyPrincipal={extraMonthlyPrincipal}
      cashToClose={cashToClose}
      dtiAnalysis={dtiAnalysis}
      ficoTier={ficoTier}
    />
  </>
  );
};

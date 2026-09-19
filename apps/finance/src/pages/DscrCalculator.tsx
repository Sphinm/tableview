import { useState, useMemo, useEffect } from 'react';
import {
  Calculator,
  Building,
  TrendingUp,
  Download,
  FileSpreadsheet,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  ShieldCheck,
  Printer,
  Bookmark,
  Share2,
  Check
} from 'lucide-react';
import {
  calculateDscr,
  generateDscrAmortization,
  type DscrInputs
} from '../lib/dscrCalculator';
import { updatePageMeta } from '../lib/router';
import { CALCULATOR_META } from '../data/routeMeta';
import { MethodologyDisclosure } from '../components/MethodologyDisclosure';
import { AdSlot } from '../components/AdSlot';
import { CalculatorFaqSection } from '../components/CalculatorFaqSection';
import { PrintableDscrReport } from '../components/PrintableDscrReport';
import { SavedScenariosModal } from '../components/SavedScenariosModal';
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
import { AiUnderwritingCard } from '../components/AiUnderwritingCard';

interface DscrPresetValues {
  propertyValue: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
  isInterestOnly: boolean;
  monthlyRent: number;
  annualPropertyTax: number;
  annualInsurance: number;
  monthlyHoa: number;
  vacancyRate: number;
  managementFeeRate: number;
  annualMaintenanceReserve: number;
}

const DSCR_INVESTOR_PRESETS: CalculatorPreset<DscrPresetValues>[] = [
  {
    id: 'strong-cashflow',
    label: '1.35x Prime Cash Flow',
    badge: 'Tier 1 Target',
    description: 'Conservative 25% down payment with robust rental yield meeting prime lender terms',
    values: {
      propertyValue: 400000,
      downPaymentPercent: 25,
      interestRate: 6.875,
      loanTermYears: 30,
      isInterestOnly: false,
      monthlyRent: 3300,
      annualPropertyTax: 4800,
      annualInsurance: 1400,
      monthlyHoa: 0,
      vacancyRate: 5,
      managementFeeRate: 8,
      annualMaintenanceReserve: 1800,
    },
  },
  {
    id: 'breakeven-100',
    label: '1.00x Break-Even Threshold',
    badge: 'Minimum Tier',
    description: 'Market rent strictly equals PITIA debt service and escrows',
    values: {
      propertyValue: 350000,
      downPaymentPercent: 20,
      interestRate: 7.25,
      loanTermYears: 30,
      isInterestOnly: false,
      monthlyRent: 2350,
      annualPropertyTax: 4200,
      annualInsurance: 1200,
      monthlyHoa: 50,
      vacancyRate: 5,
      managementFeeRate: 8,
      annualMaintenanceReserve: 1200,
    },
  },
  {
    id: 'interest-only-dscr',
    label: '10-Yr Interest-Only (1.50x+)',
    badge: 'Cash Flow Boost',
    description: 'Eliminates principal repayment to maximize monthly cash-in-pocket and pass tight DSCR guidelines',
    values: {
      propertyValue: 500000,
      downPaymentPercent: 20,
      interestRate: 7.125,
      loanTermYears: 30,
      isInterestOnly: true,
      monthlyRent: 3800,
      annualPropertyTax: 6000,
      annualInsurance: 1600,
      monthlyHoa: 0,
      vacancyRate: 5,
      managementFeeRate: 8,
      annualMaintenanceReserve: 2400,
    },
  },
  {
    id: 'str-high-yield',
    label: 'Vacation Rental / STR',
    badge: 'High Yield',
    description: 'Short-term rental property with elevated gross revenue against operating escrows',
    values: {
      propertyValue: 600000,
      downPaymentPercent: 25,
      interestRate: 7.375,
      loanTermYears: 30,
      isInterestOnly: false,
      monthlyRent: 5200,
      annualPropertyTax: 7200,
      annualInsurance: 2400,
      monthlyHoa: 150,
      vacancyRate: 10,
      managementFeeRate: 15,
      annualMaintenanceReserve: 3600,
    },
  },
];

const dscrSchemas = [
  {
    '@type': 'WebApplication',
    name: 'DSCR Loan Calculator for Rental Properties',
    url: 'https://tableview.dev/dscr-loan-calculator',
    description: 'Free in-browser DSCR loan calculator and BiggerPockets Pro alternative. Accurately calculate Debt-Service Coverage Ratio, monthly PITIA, net cash flow, and maximum loan amounts without paywalls.',
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
    name: 'DSCR Real Estate Investment Mortgage',
    description: 'Non-QM mortgage program underwriting based on rental property cash flow rather than personal W-2 income or DTI.',
    category: 'MortgageLoan'
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
        name: 'DSCR Loan Calculator',
        item: 'https://tableview.dev/dscr-loan-calculator'
      }
    ]
  },
  {
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Why use TableView DSCR Calculator instead of BiggerPockets Pro or Visio Lending?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Unlike BiggerPockets which limits free users to 5 property reports before requiring a $39/month Pro subscription, and broker sites like Visio Lending that require phone/email lead forms, TableView.dev is 100% free with unlimited calculations, zero account registration, dual residential/commercial underwriting formulas, reverse loan amount solving, and instant Excel export.'
        }
      },
      {
        '@type': 'Question',
        name: 'What is a DSCR loan and how does it work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A DSCR (Debt-Service Coverage Ratio) loan is a non-QM mortgage for real estate investors. Rather than verifying personal W-2 tax returns or personal debt-to-income (DTI) ratios, lenders qualify the loan based solely on the property\'s expected or actual rental income compared to its monthly PITIA (Principal, Interest, Taxes, Insurance, HOA).'
        }
      },
      {
        '@type': 'Question',
        name: 'What is the minimum DSCR required to qualify for a loan?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most non-QM lenders seek a DSCR of 1.20x to 1.25x for competitive rates and up to 80% LTV. However, many lenders offer sub-1.0 or no-ratio DSCR loans down to 0.75x or even 0.0x for properties in high-appreciation markets or short-term rentals, typically requiring a 25% to 30% down payment.'
        }
      },
      {
        '@type': 'Question',
        name: 'How is the DSCR ratio calculated?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'DSCR = Gross Monthly Rental Income / Monthly PITIA. For example, if a rental property generates $3,000 per month in gross rent and the total monthly payment (PITIA) is $2,400, the DSCR is $3,000 / $2,400 = 1.25x.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I use an LLC or corporate entity for a DSCR loan?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. In fact, most DSCR lenders encourage or mandate that properties close in the name of an LLC, LP, or corporation to shield personal assets and facilitate multi-partner syndications.'
        }
      },
      {
        '@type': 'Question',
        name: 'Are short-term rentals (Airbnb and VRBO) eligible for DSCR financing?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Many modern DSCR lenders allow projected or historical short-term rental revenue verified through AirDNA Rentalizer or 12-month platform operating statements to underwrite debt service.'
        }
      },
      {
        '@type': 'Question',
        name: 'What is the difference between Interest-Only and 30-Year Fixed DSCR loans?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'An interest-only (I/O) DSCR loan lowers your mandatory monthly payment during the initial 5 to 10 year period by eliminating principal payments. This significantly boosts your monthly DSCR ratio and maximizes immediate cash flow.'
        }
      }
    ]
  }
];

interface DscrCalculatorProps {
  onTrySample?: () => void;
}

export const DscrCalculator = ({ onTrySample: _onTrySample }: DscrCalculatorProps) => {
  const [showScenariosModal, setShowScenariosModal] = useState(false);

  useEffect(() => {
    updatePageMeta(
      CALCULATOR_META['/dscr-loan-calculator'].title,
      CALCULATOR_META['/dscr-loan-calculator'].description,
      CALCULATOR_META['/dscr-loan-calculator'].canonical,
      dscrSchemas
    );
  }, []);

  const getNumQuery = (name: string, fallback: number): number => {
    try {
      const p = new URLSearchParams(window.location.search).get(name);
      if (p !== null && !isNaN(Number(p)) && Number(p) > 0) return Number(p);
    } catch {}
    return fallback;
  };

  // Form State initialized with URL query params
  const [propertyValue, setPropertyValue] = useState<number>(() => getNumQuery('price', 450000));
  const [downPayment, setDownPayment] = useState<number>(() => getNumQuery('dp', getNumQuery('down', 25)));
  const [downPaymentType, setDownPaymentType] = useState<'percent' | 'money'>('percent');
  const [interestRate, setInterestRate] = useState<number>(() => getNumQuery('rate', 7.25));
  const [loanTermYears, setLoanTermYears] = useState<number>(() => getNumQuery('term', 30));
  const [isInterestOnly, setIsInterestOnly] = useState<boolean>(() => {
    try {
      return new URLSearchParams(window.location.search).get('io') === 'true';
    } catch {
      return false;
    }
  });
  const [monthlyRent, setMonthlyRent] = useState<number>(() => getNumQuery('rent', 3800));

  const [isPrefilledFromCopilot, setIsPrefilledFromCopilot] = useState<boolean>(() => {
    try {
      return new URLSearchParams(window.location.search).has('price');
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleUrlSync = () => {
      const search = window.location.search;
      if (!search) return;
      const params = new URLSearchParams(search);
      const p = params.get('price');
      if (p && !isNaN(Number(p)) && Number(p) > 0) {
        setPropertyValue(Number(p));
        setIsPrefilledFromCopilot(true);
      }
      const dp = params.get('dp') || params.get('down');
      if (dp && !isNaN(Number(dp)) && Number(dp) > 0) {
        setDownPayment(Number(dp));
      }
      const r = params.get('rate');
      if (r && !isNaN(Number(r)) && Number(r) > 0) {
        setInterestRate(Number(r));
      }
      const rent = params.get('rent');
      if (rent && !isNaN(Number(rent)) && Number(rent) > 0) {
        setMonthlyRent(Number(rent));
      }
      const term = params.get('term');
      if (term && !isNaN(Number(term)) && Number(term) > 0) {
        setLoanTermYears(Number(term));
      }
    };
    window.addEventListener('popstate', handleUrlSync);
    return () => window.removeEventListener('popstate', handleUrlSync);
  }, []);
  const [annualPropertyTax, setAnnualPropertyTax] = useState<number>(() => getNumQuery('tax', 5400));
  const [annualInsurance, setAnnualInsurance] = useState<number>(() => getNumQuery('ins', 1600));
  const [monthlyHoa, setMonthlyHoa] = useState<number>(() => getNumQuery('hoa', 0));
  const [vacancyRate, setVacancyRate] = useState<number>(5);
  const [managementFeeRate, setManagementFeeRate] = useState<number>(8);
  const [annualMaintenanceReserve, setAnnualMaintenanceReserve] = useState<number>(2000);
  const targetDscr = 1.25;

  // Amortization Schedule View
  const [scheduleView, setScheduleView] = useState<'annual' | 'monthly'>('annual');
  const [schedulePage, setSchedulePage] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string | null>('strong-cashflow');

  const handleSelectPreset = (preset: CalculatorPreset<DscrPresetValues>) => {
    setActivePresetId(preset.id);
    const v = preset.values;
    if (!v) return;
    if (v.propertyValue !== undefined) setPropertyValue(v.propertyValue);
    if (v.downPaymentPercent !== undefined) {
      setDownPaymentType('percent');
      setDownPayment(v.downPaymentPercent);
    }
    if (v.interestRate !== undefined) setInterestRate(v.interestRate);
    if (v.loanTermYears !== undefined) setLoanTermYears(v.loanTermYears);
    if (v.isInterestOnly !== undefined) setIsInterestOnly(v.isInterestOnly);
    if (v.monthlyRent !== undefined) setMonthlyRent(v.monthlyRent);
    if (v.annualPropertyTax !== undefined) setAnnualPropertyTax(v.annualPropertyTax);
    if (v.annualInsurance !== undefined) setAnnualInsurance(v.annualInsurance);
    if (v.monthlyHoa !== undefined) setMonthlyHoa(v.monthlyHoa);
    if (v.vacancyRate !== undefined) setVacancyRate(v.vacancyRate);
    if (v.managementFeeRate !== undefined) setManagementFeeRate(v.managementFeeRate);
    if (v.annualMaintenanceReserve !== undefined) setAnnualMaintenanceReserve(v.annualMaintenanceReserve);
  };

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
      { year: number; payment: number; principal: number; interest: number; balance: number; accumulatedInterest: number }
    >();
    let cumInt = 0;
    for (const row of fullMonthlySchedule) {
      cumInt += row.interest;
      const current = map.get(row.year) || {
        year: row.year,
        payment: 0,
        principal: 0,
        interest: 0,
        balance: row.balance,
        accumulatedInterest: 0
      };
      current.payment += row.payment;
      current.principal += row.principal;
      current.interest += row.interest;
      current.balance = row.balance;
      current.accumulatedInterest = cumInt;
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
  const handleExportExcel = async () => {
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

    const XLSX = await import('xlsx');
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

  const handleExportPdf = () => {
    const prevTitle = document.title;
    const viewSuffix = scheduleView === 'monthly' ? 'monthly_schedule' : 'annual_summary';
    document.title = `dscr_underwriting_statement_${propertyValue}_${viewSuffix}`;
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 1000);
  };

  const handleCopyLink = () => {
    try {
      const params = new URLSearchParams();
      params.set('price', String(propertyValue));
      params.set('down', String(downPayment));
      params.set('rate', String(interestRate));
      params.set('term', String(loanTermYears));
      params.set('rent', String(monthlyRent));
      params.set('tax', String(annualPropertyTax));
      params.set('ins', String(annualInsurance));
      params.set('hoa', String(monthlyHoa));
      if (isInterestOnly) params.set('io', 'true');
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
    <>
      {/* data-sentry-mask: rental income, loan terms and PITIA are the user's own deal. */}
      <div data-sentry-mask="true" className="print:hidden min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white pb-20 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <PageHeader
          breadcrumbs={[
            { label: 'Calculators', path: '/finance-calculator' },
            { label: 'DSCR Loan' }
          ]}
          badge={{
            icon: Building,
            label: 'Real Estate Investor Debt Modeler',
            tone: 'indigo'
          }}
          title="DSCR Loan Calculator"
          description="Calculate your Debt-Service Coverage Ratio (DSCR), net cash flow, and maximum eligible loan amount for residential rental properties (1-4 units and commercial). 100% private in-browser math with zero personal income verification."
          actions={
            <>
              <PrintReportButton onPrint={handleExportPdf} />
              <button
                type="button"
                onClick={handleCopyLink}
                className="h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer transition-all shadow-xs active:scale-95 shrink-0"
                title="Copy shareable link with current deal parameters"
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
                <span>Export Schedule (.xlsx)</span>
              </button>
            </>
          }
          presets={
            <CalculatorPresetsBar
              presets={DSCR_INVESTOR_PRESETS}
              activeId={activePresetId}
              onSelect={handleSelectPreset}
              title="DSCR Scenarios"
            />
          }
        />

        <SuiteSubNav suite="commercial" />

        {/* AI Deal Copilot Pre-fill Notification Banner */}
        {isPrefilledFromCopilot && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs flex flex-wrap items-center justify-between gap-3 text-emerald-200 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-400/30">
                <Sparkles className="size-4" />
              </div>
              <div>
                <span className="font-bold text-white tracking-tight block">
                  Auto-Populated from Natural Language Scenario
                </span>
                <span className="text-emerald-300">
                  Property Value: <strong className="text-white">${propertyValue.toLocaleString()}</strong> · Down Payment: <strong className="text-white">{downPayment}%</strong> · Gross Rent: <strong className="text-white">${monthlyRent.toLocaleString()}/mo</strong> · Rate: <strong className="text-white">{interestRate}%</strong>
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              Ready for Underwriting
            </span>
          </div>
        )}

        {/* Main Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Building className="size-4.5 text-indigo-600" />
                <span>Property & Loan Parameters</span>
              </h2>

              {/* Purchase Price */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex justify-between">
                  <span>Purchase / Property Value</span>
                  <span className="text-indigo-600 font-mono font-bold">{currencyFmt(propertyValue)}</span>
                </label>
                <CurrencyInput
                  value={propertyValue}
                  onChange={(v) => setPropertyValue(Math.max(0, v))}
                  className="py-2 text-base sm:text-sm font-mono"
                />
              </div>

              {/* Down Payment */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Down Payment</label>
                  <div className="flex items-center rounded-lg bg-slate-100 border border-slate-200 p-0.5 text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => handleDownPaymentTypeChange('percent')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        downPaymentType === 'percent'
                          ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownPaymentTypeChange('money')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        downPaymentType === 'money'
                          ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      $
                    </button>
                  </div>
                </div>

                {downPaymentType === 'percent' ? (
                  <NumericInput
                    value={downPayment}
                    onChange={(v) => setDownPayment(Math.max(0, v))}
                    suffix="%"
                    step={0.5}
                    className="py-2 text-base sm:text-sm font-mono"
                  />
                ) : (
                  <CurrencyInput
                    value={downPayment}
                    onChange={(v) => setDownPayment(Math.max(0, v))}
                    className="py-2 text-base sm:text-sm font-mono"
                  />
                )}
                <p className="text-[11px] text-slate-500 mt-1 flex justify-between">
                  <span>Down Payment Amount: {currencyFmt(result.downPaymentAmount)}</span>
                  <span>LTV: {result.ltv}%</span>
                </p>
              </div>

              {/* Interest Rate & Term */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Interest Rate (%)
                  </label>
                  <NumericInput
                    value={interestRate}
                    onChange={(v) => setInterestRate(Math.max(0, v))}
                    suffix="%"
                    step={0.125}
                    className="py-2 text-base sm:text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Loan Term
                  </label>
                  <select
                    value={loanTermYears}
                    onChange={(e) => setLoanTermYears(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-base sm:text-sm text-slate-900 font-mono focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
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
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900 block">Interest-Only Loan</span>
                    <InfoTooltip
                      title="Interest-Only Option"
                      content="Reduces monthly debt payments during initial years (e.g. 5-10 yrs) by eliminating principal repayment, significantly increasing your DSCR ratio."
                    />
                  </div>
                  <span className="text-[11px] text-slate-500">Lower monthly payment to boost DSCR ratio</span>
                </div>
                <input
                  type="checkbox"
                  checked={isInterestOnly}
                  onChange={(e) => setIsInterestOnly(e.target.checked)}
                  className="size-4.5 rounded text-indigo-600 bg-white border-slate-300 cursor-pointer focus:ring-indigo-500"
                />
              </div>

              {/* Rental Income & Expenses */}
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pt-3 pb-3">
                <TrendingUp className="size-4.5 text-emerald-600" />
                <span>Rental Income & Operating Expenses</span>
              </h2>

              {/* Monthly Gross Rent */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex justify-between">
                  <span className="inline-flex items-center gap-1">
                    <span>Monthly Gross Rent Expected</span>
                    <InfoTooltip
                      title="Appraiser 1007 Rent Schedule"
                      content="The market rent determined by an appraiser's Form 1007 (or existing lease agreement) used by DSCR underwriters."
                    />
                  </span>
                  <span className="text-emerald-700 font-mono font-bold">{currencyFmt(monthlyRent)}/mo</span>
                </label>
                <CurrencyInput
                  value={monthlyRent}
                  onChange={(v) => setMonthlyRent(Math.max(0, v))}
                  className="py-2 text-base sm:text-sm font-mono"
                />
              </div>

              {/* Taxes & Insurance */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Annual Property Tax
                  </label>
                  <CurrencyInput
                    value={annualPropertyTax}
                    onChange={(v) => setAnnualPropertyTax(Math.max(0, v))}
                    className="py-2 text-base sm:text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Annual Insurance
                  </label>
                  <CurrencyInput
                    value={annualInsurance}
                    onChange={(v) => setAnnualInsurance(Math.max(0, v))}
                    className="py-2 text-base sm:text-sm font-mono"
                  />
                </div>
              </div>

              {/* HOA & Operating Reserves */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Monthly HOA ($)
                  </label>
                  <CurrencyInput
                    value={monthlyHoa}
                    onChange={(v) => setMonthlyHoa(Math.max(0, v))}
                    className="py-2 text-base sm:text-sm font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Vacancy (%)
                    </label>
                    <InfoTooltip
                      title="Vacancy & Credit Loss"
                      content="Typical underwriting allowance of 5% to 8% to account for month-to-month tenant transitions."
                    />
                  </div>
                  <NumericInput
                    value={vacancyRate}
                    onChange={(v) => setVacancyRate(Math.max(0, v))}
                    suffix="%"
                    className="py-2 text-base sm:text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mgmt Fee (%)
                  </label>
                  <NumericInput
                    value={managementFeeRate}
                    onChange={(v) => setManagementFeeRate(Math.max(0, v))}
                    suffix="%"
                    className="py-2 text-base sm:text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Key Results & DSCR Gauge (7 cols) */}
          <div id="dscr-results" className="lg:col-span-7 space-y-6 scroll-mt-20">
            {/* Primary Result Hero Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold block">
                      Debt-Service Coverage Ratio (DSCR)
                    </span>
                    <InfoTooltip
                      title="What is DSCR?"
                      content="DSCR = Gross Rental Income ÷ Total Debt Service (PITIA). A DSCR of 1.25x means the property generates 25% more rental income than required to pay the mortgage, taxes, and insurance."
                    />
                  </div>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-indigo-600">
                      {result.grossDscr.toFixed(2)}x
                    </span>
                    <span
                      className={`text-sm font-semibold px-2.5 py-1 rounded-md border ${
                        result.qualificationStatus === 'prime'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : result.qualificationStatus === 'standard'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : result.qualificationStatus === 'low'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {result.statusLabel}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Monthly Net Cash Flow</span>
                  <span
                    className={`text-xl sm:text-2xl font-black font-mono mt-0.5 block ${
                      result.monthlyNetCashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {result.monthlyNetCashFlow >= 0 ? '+' : ''}
                    {currencyDecFmt(result.monthlyNetCashFlow)}
                  </span>
                  <span className="text-[11px] text-slate-500">after all operating expenses</span>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                {result.statusDescription}
              </p>

              {/* Progress Visual Bar for DSCR */}
              <div className="mt-5 pt-3 border-t border-slate-100">
                <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-1.5">
                  <span>0.75x (Breakeven Risk)</span>
                  <span>1.0x (PITIA Breakeven)</span>
                  <span>1.25x (Prime Target)</span>
                  <span>1.5x+ (Super Cashflow)</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
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
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 block">Monthly PITIA</span>
                <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
                  {currencyFmt(result.monthlyPitia)}
                </span>
                <span className="text-[10px] text-slate-400">Debt + Escrows</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 block">Cash-on-Cash ROI</span>
                <span className="text-base font-bold font-mono text-emerald-600 mt-0.5 block">
                  {result.cashOnCashReturn}%
                </span>
                <span className="text-[10px] text-slate-400">Annual Return</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 block">Loan Amount</span>
                <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
                  {currencyFmt(result.loanAmount)}
                </span>
                <span className="text-[10px] text-slate-400">{result.ltv}% LTV</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 block">Max Loan (1.25x)</span>
                <span className="text-base font-bold font-mono text-indigo-600 mt-0.5 block">
                  {currencyFmt(result.maxLoanAmountAtTargetDscr)}
                </span>
                <span className="text-[10px] text-slate-400">at current rent</span>
              </div>
            </div>

            {/* AI Underwriting Health Check (TypeSafe System 1) */}
            <AiUnderwritingCard
              dscr={result.grossDscr}
              ltv={result.ltv}
              monthlyRent={monthlyRent}
              propertyValue={propertyValue}
              loanAmount={result.loanAmount}
            />

            {/* Visual Cash Flow Allocation Donut */}
            <CashFlowDonutChart
              segments={[
                { id: 'pi', label: 'Principal & Interest', amount: result.monthlyPrincipalAndInterest, color: '#6366f1' },
                { id: 'taxes', label: 'Property Taxes', amount: result.monthlyTaxes, color: '#10b981' },
                { id: 'insurance', label: 'Home Insurance', amount: result.monthlyInsurance, color: '#06b6d4' },
                ...(result.monthlyHoa > 0 ? [{ id: 'hoa', label: 'HOA Fees', amount: result.monthlyHoa, color: '#f59e0b' }] : []),
                { id: 'mgmt', label: 'Management & Vacancy', amount: result.monthlyManagementFee, color: '#8b5cf6' },
                ...(result.monthlyMaintenance > 0 ? [{ id: 'maint', label: 'Maintenance Reserve', amount: result.monthlyMaintenance, color: '#64748b' }] : []),
              ]}
              centerTitle="Monthly Outflow"
              centerValue={currencyFmt(result.monthlyPitia + result.monthlyManagementFee + result.monthlyMaintenance)}
              title="Monthly Cash Outflow Distribution"
              subtitle="Visual breakdown of debt service, property taxes, insurance escrows, and reserves."
            />

            {/* Monthly PITIA Expense Breakdown Table */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Monthly PITIA & Expense Breakdown</span>
                <span className="text-xs font-mono text-slate-500">
                  Total Monthly Outflow: {currencyFmt(result.monthlyPitia + result.monthlyManagementFee + result.monthlyMaintenance)}
                </span>
              </h3>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-indigo-500" />
                    Principal & Interest {isInterestOnly ? '(Interest Only)' : ''}
                  </span>
                  <span className="text-slate-900 font-bold">{currencyDecFmt(result.monthlyPrincipalAndInterest)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Property Taxes
                  </span>
                  <span className="text-slate-900">{currencyDecFmt(result.monthlyTaxes)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-cyan-500" />
                    Homeowners Insurance
                  </span>
                  <span className="text-slate-900">{currencyDecFmt(result.monthlyInsurance)}</span>
                </div>
                {result.monthlyHoa > 0 && (
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-amber-500" />
                      HOA Fees
                    </span>
                    <span className="text-slate-900">{currencyDecFmt(result.monthlyHoa)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-slate-400" />
                    Property Management ({vacancyRate}% Vacancy + {managementFeeRate}% Mgmt)
                  </span>
                  <span className="text-slate-700">{currencyDecFmt(result.monthlyManagementFee)}</span>
                </div>
              </div>
            </div>

            {/* Investor Action Card */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="size-4 text-amber-500" />
                  Looking for competitive DSCR lending options?
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Qualify using this exact cash flow model without tax returns or personal W-2 forms.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200 shadow-2xs cursor-pointer transition-colors"
                >
                  {copiedLink ? 'Link Copied!' : 'Share Deal'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowScenariosModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200 shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Save or compare DSCR scenarios locally in your browser"
                >
                  <Bookmark className="size-3.5 text-indigo-600" />
                  <span>Saved Scenarios</span>
                </button>
                <button
                  onClick={handleExportPdf}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title={scheduleView === 'monthly' ? "Export full monthly amortization schedule as vector PDF" : "Export annual summary amortization schedule as vector PDF"}
                >
                  <Printer className="size-3.5" />
                  <span>Export PDF ({scheduleView === 'monthly' ? 'Monthly' : 'Annual'})</span>
                </button>
                <button
                  onClick={handleExportExcel}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Download complete Excel financial model"
                >
                  <FileSpreadsheet className="size-3.5" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Interactive Amortization Table */}
        <div className="mt-12 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calculator className="size-5 text-indigo-600" />
                <span>DSCR Loan Amortization Schedule</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Full 30-year principal paydown schedule and equity accumulation trajectory.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium">
                <button
                  onClick={() => setScheduleView('annual')}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    scheduleView === 'annual'
                      ? 'bg-white text-slate-900 font-bold border border-slate-300 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Annual Summary
                </button>
                <button
                  onClick={() => setScheduleView('monthly')}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    scheduleView === 'monthly'
                      ? 'bg-white text-slate-900 font-bold border border-slate-300 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Monthly Details
                </button>
              </div>

              <button
                onClick={handleExportPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold text-indigo-700 transition-colors cursor-pointer shadow-2xs"
                title={scheduleView === 'monthly' ? "Export full monthly amortization schedule as vector PDF" : "Export annual summary amortization schedule as vector PDF"}
              >
                <Printer className="size-3.5" />
                <span>Export PDF ({scheduleView === 'monthly' ? 'Monthly' : 'Annual'})</span>
              </button>

              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold text-emerald-700 transition-colors cursor-pointer shadow-2xs"
                title="Download Excel spreadsheet"
              >
                <FileSpreadsheet className="size-3.5" />
                <span>Excel (.xlsx)</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
                title="Download CSV"
              >
                <Download className="size-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[420px]">
              <table className="w-full border-collapse text-left font-mono text-xs">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-700">
                  <tr>
                    <th className="p-3">Period</th>
                    <th className="p-3">Total Payment</th>
                    <th className="p-3">Principal</th>
                    <th className="p-3">Interest</th>
                    <th className="p-3">Ending Loan Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {scheduleView === 'annual'
                    ? annualSchedule.map((row) => (
                        <tr key={row.year} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-semibold text-indigo-700">Year {row.year}</td>
                          <td className="p-3 text-slate-800">{currencyDecFmt(row.payment)}</td>
                          <td className="p-3 text-emerald-700 font-semibold">{currencyDecFmt(row.principal)}</td>
                          <td className="p-3 text-amber-700">{currencyDecFmt(row.interest)}</td>
                          <td className="p-3 text-slate-900 font-bold">{currencyFmt(row.balance)}</td>
                        </tr>
                      ))
                    : fullMonthlySchedule
                        .slice((schedulePage - 1) * 24, schedulePage * 24)
                        .map((row) => (
                          <tr key={row.month} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-semibold text-indigo-700">Month {row.month} (Yr {row.year})</td>
                            <td className="p-3 text-slate-800">{currencyDecFmt(row.payment)}</td>
                            <td className="p-3 text-emerald-700">{currencyDecFmt(row.principal)}</td>
                            <td className="p-3 text-amber-700">{currencyDecFmt(row.interest)}</td>
                            <td className="p-3 text-slate-900 font-bold">{currencyFmt(row.balance)}</td>
                          </tr>
                        ))}
                </tbody>
              </table>
            </div>

            {scheduleView === 'monthly' && (
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span>Showing months {(schedulePage - 1) * 24 + 1} to {Math.min(fullMonthlySchedule.length, schedulePage * 24)}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSchedulePage((p) => Math.max(1, p - 1))}
                    disabled={schedulePage === 1}
                    className="px-2.5 py-1 rounded bg-white border border-slate-200 disabled:opacity-40 cursor-pointer shadow-2xs hover:bg-slate-50 text-slate-700"
                  >
                    Prev
                  </button>
                  <span>Page {schedulePage} of {Math.ceil(fullMonthlySchedule.length / 24)}</span>
                  <button
                    onClick={() => setSchedulePage((p) => Math.min(Math.ceil(fullMonthlySchedule.length / 24), p + 1))}
                    disabled={schedulePage >= Math.ceil(fullMonthlySchedule.length / 24)}
                    className="px-2.5 py-1 rounded bg-white border border-slate-200 disabled:opacity-40 cursor-pointer shadow-2xs hover:bg-slate-50 text-slate-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Deep Formula, Underwriting Guidelines & Educational Guide */}
        <div className="mt-16 pt-10 border-t border-slate-200 space-y-12">
          {/* Subsection 1: Mathematical Formula & Line-by-Line Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen className="size-6 text-indigo-600" />
                How to Calculate Debt-Service Coverage Ratio (DSCR)
              </h2>
              <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <p>
                  A <strong>DSCR (Debt-Service Coverage Ratio) loan</strong> is a premier non-QM (Non-Qualified Mortgage) financing program engineered specifically for real estate investors. Unlike conventional Fannie Mae or Freddie Mac loans, DSCR lenders qualify borrowers based exclusively on the property's gross rental cash flow rather than personal W-2 income, tax returns, or debt-to-income (DTI) ratios.
                </p>
                <p>
                  Secondary market mortgage underwriters calculate the coverage ratio using this exact mathematical formula:
                </p>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs sm:text-sm text-indigo-700">
                  <div className="text-center font-bold mb-1">DSCR = Gross Monthly Rental Income ÷ Monthly PITIA</div>
                  <div className="text-slate-500 text-center text-xs font-normal">Where PITIA = Principal + Interest + Taxes + Insurance + HOA</div>
                </div>
                <ul className="space-y-2 pt-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Gross Rental Income:</strong> Verified via appraisal Form 1007 (Rent Schedule), executed lease agreements, or 12-month AirDNA short-term rental market performance.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Monthly PITIA:</strong> The comprehensive mortgage liability, including principal amortized over 30 years, note interest rate, real estate taxes, hazard/flood insurance, and mandatory HOA dues.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Interest-Only Advantage:</strong> Electing an Interest-Only (I/O) structure removes principal from the denominator during initial years, substantially elevating your DSCR ratio.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Practical Underwriting Example Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Underwriting Example</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">Passed (1.25x DSCR)</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Property Purchase Price</span>
                  <span className="text-slate-900 font-semibold">$450,000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Down Payment (20% LTV 80%)</span>
                  <span className="text-slate-900">$90,000 (Loan: $360,000)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">30-Yr Fixed P&I Payment (7.25%)</span>
                  <span className="text-slate-900">$2,456 / mo</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Property Taxes & Hazard Insurance</span>
                  <span className="text-slate-900">$583 / mo</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600 font-bold">Total Monthly PITIA Debt</span>
                  <span className="text-rose-600 font-bold">$3,039 / mo</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600 font-bold">Market Rental Income</span>
                  <span className="text-emerald-700 font-bold">$3,800 / mo</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold">
                  <span className="text-indigo-700">Coverage Ratio ($3,800 ÷ $3,039)</span>
                  <span className="text-emerald-700">1.250x</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                At 1.25x DSCR, the borrower meets prime institutional underwriting criteria, unlocking tier-1 interest rate pricing and maximum 80% LTV financing without submitting tax returns.
              </p>
            </div>
          </div>

          {/* Subsection 2: DSCR Underwriting Matrix Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="size-5 text-indigo-600" />
                  DSCR Lender Qualification Tiers & Underwriting Matrix
                </h3>
                <p className="text-xs text-slate-600">Standard guidelines applied by private capital and secondary non-QM securitization conduits.</p>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 w-fit">
                Updated for 2025/2026 Guidelines
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-3.5">DSCR Tier</th>
                    <th className="p-3.5">Cash Flow Status</th>
                    <th className="p-3.5">Max LTV</th>
                    <th className="p-3.5">Interest Rate Impact</th>
                    <th className="p-3.5">Min Reserves Required</th>
                    <th className="p-3.5">Underwriting Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-bold text-emerald-700">≥ 1.25x</td>
                    <td className="p-3.5 text-slate-700">Strong Cash Flow (25%+ surplus)</td>
                    <td className="p-3.5 text-slate-900 font-mono">80% LTV</td>
                    <td className="p-3.5 text-emerald-700 font-medium">Lowest (Baseline Par)</td>
                    <td className="p-3.5 text-slate-700">3 to 6 months PITIA</td>
                    <td className="p-3.5 text-emerald-700 font-semibold">Automatic Institutional Approval</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-bold text-indigo-700">1.00x – 1.24x</td>
                    <td className="p-3.5 text-slate-700">Breakeven to Moderate Cash Flow</td>
                    <td className="p-3.5 text-slate-900 font-mono">75% – 80% LTV</td>
                    <td className="p-3.5 text-slate-700 font-medium">+0.250% to +0.375%</td>
                    <td className="p-3.5 text-slate-700">6 months PITIA</td>
                    <td className="p-3.5 text-indigo-700 font-semibold">Standard Approval</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-bold text-amber-700">0.75x – 0.99x</td>
                    <td className="p-3.5 text-slate-700">Deficit / Negative Cash Flow</td>
                    <td className="p-3.5 text-slate-900 font-mono">70% – 75% LTV</td>
                    <td className="p-3.5 text-amber-700 font-medium">+0.500% to +0.875%</td>
                    <td className="p-3.5 text-slate-700">6 to 9 months PITIA</td>
                    <td className="p-3.5 text-amber-700 font-semibold">Sub-1.0 Program (Needs FICO 700+)</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-bold text-rose-700">&lt; 0.75x / No Ratio</td>
                    <td className="p-3.5 text-slate-700">High Deficit or Vacant Asset</td>
                    <td className="p-3.5 text-slate-900 font-mono">65% – 70% LTV</td>
                    <td className="p-3.5 text-rose-700 font-medium">+1.000% to +1.500%</td>
                    <td className="p-3.5 text-slate-700">9 to 12 months PITIA</td>
                    <td className="p-3.5 text-rose-700 font-semibold">No-Ratio Exception (High Equity Required)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Subsection 3: DSCR Loan vs Conventional vs Hard Money Comparison */}
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="size-5 text-indigo-600" />
              DSCR Loan vs Conventional Mortgage vs Hard Money Comparison
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-3.5">Feature / Dimension</th>
                    <th className="p-3.5 text-indigo-700 font-bold">DSCR Investment Loan</th>
                    <th className="p-3.5 text-slate-700">Conventional Fannie/Freddie</th>
                    <th className="p-3.5 text-amber-700 font-bold">Hard Money / Bridge Loan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-semibold text-slate-800">Income Verification</td>
                    <td className="p-3.5 text-indigo-700 font-semibold">Rental Income Only (Form 1007/Lease)</td>
                    <td className="p-3.5 text-slate-600">W-2, Paystubs, 2 Yrs Tax Returns</td>
                    <td className="p-3.5 text-amber-700 font-semibold">After-Repair Value (ARV) & Scope</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-semibold text-slate-800">DTI Restrictions</td>
                    <td className="p-3.5 text-emerald-700 font-semibold">None (0% Personal DTI Impact)</td>
                    <td className="p-3.5 text-slate-600">Strict 45% – 50% Ceiling</td>
                    <td className="p-3.5 text-emerald-700 font-semibold">None</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-semibold text-slate-800">Property Portfolio Limit</td>
                    <td className="p-3.5 text-emerald-700 font-semibold">Unlimited Properties</td>
                    <td className="p-3.5 text-rose-600 font-semibold">Capped at 10 Mortgaged Properties</td>
                    <td className="p-3.5 text-emerald-700 font-semibold">Unlimited Properties</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-semibold text-slate-800">Vesting in LLC / Entity</td>
                    <td className="p-3.5 text-emerald-700 font-semibold">Permitted & Highly Encouraged</td>
                    <td className="p-3.5 text-rose-600">Individual Names Only (No LLCs)</td>
                    <td className="p-3.5 text-emerald-700 font-semibold">Required in Business Entity</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-semibold text-slate-800">Loan Term & Structure</td>
                    <td className="p-3.5 text-slate-700">30-Year Fixed / 10-Yr Interest-Only</td>
                    <td className="p-3.5 text-slate-700">15 or 30-Year Fully Amortized Fixed</td>
                    <td className="p-3.5 text-slate-700">6 to 18 Months Interest-Only Bridge</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-semibold text-slate-800">Speed of Funding</td>
                    <td className="p-3.5 text-slate-700">14 to 21 Business Days</td>
                    <td className="p-3.5 text-slate-600">30 to 50+ Days</td>
                    <td className="p-3.5 text-emerald-700 font-bold">5 to 10 Business Days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Competitor Comparison: TableView vs BiggerPockets vs Visio Lending */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 mb-2">
                <Sparkles className="size-3.5" />
                <span>Investor Tool Comparison</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-slate-900">
                Why TableView DSCR Calculator vs BiggerPockets &amp; Visio Lending?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                Evaluating DSCR rental deals shouldn't require paying $39/month subscriptions or submitting your phone number to aggressive mortgage brokers. Here is how TableView compares against leading alternatives:
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Feature / Capability</th>
                    <th className="py-3 px-4 text-indigo-700 font-bold">TableView.dev</th>
                    <th className="py-3 px-4">BiggerPockets Pro</th>
                    <th className="py-3 px-4">Visio Lending</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">Pricing &amp; Usage Limits</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">100% Free Forever (Unlimited)</td>
                    <td className="py-3 px-4 text-rose-600 font-medium">5 Reports Free, then $39/mo Pro</td>
                    <td className="py-3 px-4 text-slate-600">Free but Gated by Broker Contact</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">Account / Sign-Up Requirement</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">None (Instant In-Browser)</td>
                    <td className="py-3 px-4 text-rose-600 font-medium">Mandatory Registration</td>
                    <td className="py-3 px-4 text-rose-600 font-medium">Mandatory Lead Form</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">Residential &amp; Commercial DSCR Standards</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">Both (Gross Rent &amp; Net NOI)</td>
                    <td className="py-3 px-4 text-slate-600">Residential Rental Only</td>
                    <td className="py-3 px-4 text-slate-600">Residential 1-4 Units</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">Reverse Max Loan Solver (Target 1.25x)</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">Built-In Automatic Solver</td>
                    <td className="py-3 px-4 text-slate-600">Manual Guess &amp; Check</td>
                    <td className="py-3 px-4 text-rose-600 font-medium">Not Available</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">Full Amortization &amp; Cash-Flow Table</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">Yes + 1-Click Excel Export</td>
                    <td className="py-3 px-4 text-amber-700">PDF Report (Requires Pro)</td>
                    <td className="py-3 px-4 text-rose-600 font-medium">Summary Only</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">Shareable Pre-filled URL</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">Instant 1-Click Link</td>
                    <td className="py-3 px-4 text-slate-600">Saved in User Account</td>
                    <td className="py-3 px-4 text-rose-600 font-medium">Not Supported</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">Data Privacy (Zero Data Egress)</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">In-Browser Private</td>
                    <td className="py-3 px-4 text-slate-600">Saved to Cloud Account</td>
                    <td className="py-3 px-4 text-rose-600 font-medium">Captured for Sales Outreach</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <MethodologyDisclosure type="dscr" />

          {/* Highest-intent placement: the reader has just seen their own numbers. */}
          <AdSlot unit="calculatorResult" className="my-8" />

          {/* FAQ rendered from the shared registry so the prerendered markup matches. */}
          <CalculatorFaqSection
            path="/dscr-loan-calculator"
            title="Frequently Asked Questions About DSCR Loans"
          />

          <RelatedCalculators currentSlug="dscr-loan-calculator" category="real-estate" />
        </div>
      </div>

      {/* Mobile Sticky Summary Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-lg flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-500 block leading-tight">
            DSCR Coverage
          </span>
          <div className="text-xl font-black font-mono leading-tight flex items-baseline gap-2">
            <span className={result.grossDscr >= 1.25 ? 'text-emerald-600' : result.grossDscr >= 1.0 ? 'text-indigo-600' : 'text-rose-600'}>
              {result.grossDscr.toFixed(2)}x
            </span>
            <span className="text-xs font-semibold text-slate-500 font-sans">({result.statusLabel})</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('dscr-results');
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

    <SavedScenariosModal
      isOpen={showScenariosModal}
      onClose={() => setShowScenariosModal(false)}
      calculatorId="dscr"
      currentData={{
        propertyValue,
        downPayment,
        interestRate,
        loanTermYears,
        isInterestOnly,
        monthlyRent,
        annualPropertyTax,
        annualInsurance,
        monthlyHoa
      }}
      currentMetrics={{
        headline: `${result.grossDscr.toFixed(2)}x DSCR (${result.statusLabel})`,
        subline: `${currencyFmt(propertyValue)} Property · Net Cash Flow: ${currencyFmt(result.monthlyNetCashFlow)}/mo`
      }}
      onLoadScenario={(data) => {
        if (data.propertyValue) setPropertyValue(data.propertyValue);
        if (data.downPayment) setDownPayment(data.downPayment);
        if (data.interestRate) setInterestRate(data.interestRate);
        if (data.loanTermYears) setLoanTermYears(data.loanTermYears);
        if (data.isInterestOnly !== undefined) setIsInterestOnly(data.isInterestOnly);
        if (data.monthlyRent) setMonthlyRent(data.monthlyRent);
        if (data.annualPropertyTax !== undefined) setAnnualPropertyTax(data.annualPropertyTax);
        if (data.annualInsurance !== undefined) setAnnualInsurance(data.annualInsurance);
        if (data.monthlyHoa !== undefined) setMonthlyHoa(data.monthlyHoa);
      }}
    />

    {/* Closing unit at the end of the editorial content. */}
    <AdSlot unit="calculatorFaq" format="horizontal" />

    <PrintableDscrReport
      inputs={inputs}
      result={result}
      annualSchedule={annualSchedule}
      monthlySchedule={fullMonthlySchedule}
      scheduleView={scheduleView}
    />
  </>
  );
};

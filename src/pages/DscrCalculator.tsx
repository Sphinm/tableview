import { useState, useMemo, useEffect } from 'react';
import {
  Calculator,
  DollarSign,
  Building,
  TrendingUp,
  Download,
  FileSpreadsheet,
  Sparkles,
  Percent,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  ShieldCheck,
  Printer,
  Bookmark
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
  const [downPayment, setDownPayment] = useState<number>(() => getNumQuery('down', 20));
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
  const [annualPropertyTax, setAnnualPropertyTax] = useState<number>(() => getNumQuery('tax', 5400));
  const [annualInsurance, setAnnualInsurance] = useState<number>(() => getNumQuery('ins', 1600));
  const [monthlyHoa, setMonthlyHoa] = useState<number>(() => getNumQuery('hoa', 0));
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
      <div className="print:hidden min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white pb-20 lg:pb-0">
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
                    inputMode="numeric"
                    value={propertyValue || ''}
                    onChange={(e) => setPropertyValue(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
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
                    inputMode={downPaymentType === 'percent' ? 'decimal' : 'numeric'}
                    step={downPaymentType === 'percent' ? '0.5' : '1000'}
                    value={downPayment || ''}
                    onChange={(e) => setDownPayment(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
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
                      inputMode="decimal"
                      step="0.125"
                      value={interestRate || ''}
                      onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
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
                    inputMode="numeric"
                    value={monthlyRent || ''}
                    onChange={(e) => setMonthlyRent(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
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
                      inputMode="numeric"
                      value={annualPropertyTax || ''}
                      onChange={(e) => setAnnualPropertyTax(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
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
                      inputMode="numeric"
                      value={annualInsurance || ''}
                      onChange={(e) => setAnnualInsurance(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
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
                      inputMode="numeric"
                      value={monthlyHoa || ''}
                      onChange={(e) => setMonthlyHoa(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
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
                      inputMode="decimal"
                      value={vacancyRate || ''}
                      onChange={(e) => setVacancyRate(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
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
                      inputMode="decimal"
                      value={managementFeeRate || ''}
                      onChange={(e) => setManagementFeeRate(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-2 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
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
                      inputMode="numeric"
                      value={annualMaintenanceReserve || ''}
                      onChange={(e) => setAnnualMaintenanceReserve(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-2 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Target DSCR
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.05"
                    value={targetDscr || ''}
                    onChange={(e) => setTargetDscr(Math.max(0.5, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-indigo-300 font-mono font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Key Metrics & Qualification Dashboard (7 cols) */}
          <div id="dscr-results" className="lg:col-span-7 space-y-6 scroll-mt-20">
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
                <span className="text-[11px] text-slate-400 block">Loan Amount</span>
                <span className="text-base font-bold font-mono text-slate-100 mt-0.5 block">
                  {currencyFmt(result.loanAmount)}
                </span>
                <span className="text-[10px] text-slate-500">{result.ltv}% LTV</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Max Loan (1.25x)</span>
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
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 cursor-pointer transition-colors"
                >
                  {copiedLink ? 'Link Copied!' : 'Share Deal'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowScenariosModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Save or compare DSCR scenarios locally in your browser"
                >
                  <Bookmark className="size-3.5 text-indigo-400" />
                  <span>Saved Scenarios</span>
                </button>
                <button
                  onClick={handleExportPdf}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  title={scheduleView === 'monthly' ? "Export full monthly amortization schedule as vector PDF" : "Export annual summary amortization schedule as vector PDF"}
                >
                  <Printer className="size-3.5" />
                  <span>Export PDF ({scheduleView === 'monthly' ? 'Monthly' : 'Annual'})</span>
                </button>
                <button
                  onClick={handleExportExcel}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
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
                onClick={handleExportPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-800/80 text-xs font-semibold text-indigo-300 transition-colors cursor-pointer"
                title={scheduleView === 'monthly' ? "Export full monthly amortization schedule as vector PDF" : "Export annual summary amortization schedule as vector PDF"}
              >
                <Printer className="size-3.5" />
                <span>Export PDF ({scheduleView === 'monthly' ? 'Monthly' : 'Annual'})</span>
              </button>

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

        {/* Section 3: Deep Formula, Underwriting Guidelines & Educational Guide */}
        <div className="mt-16 pt-10 border-t border-slate-800 space-y-12">
          {/* Subsection 1: Mathematical Formula & Line-by-Line Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                <BookOpen className="size-6 text-indigo-400" />
                How to Calculate Debt-Service Coverage Ratio (DSCR)
              </h2>
              <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  A <strong>DSCR (Debt-Service Coverage Ratio) loan</strong> is a premier non-QM (Non-Qualified Mortgage) financing program engineered specifically for real estate investors. Unlike conventional Fannie Mae or Freddie Mac loans, DSCR lenders qualify borrowers based exclusively on the property's gross rental cash flow rather than personal W-2 income, tax returns, or debt-to-income (DTI) ratios.
                </p>
                <p>
                  Secondary market mortgage underwriters calculate the coverage ratio using this exact mathematical formula:
                </p>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs sm:text-sm text-indigo-300">
                  <div className="text-center font-bold mb-1">DSCR = Gross Monthly Rental Income ÷ Monthly PITIA</div>
                  <div className="text-slate-400 text-center text-xs font-normal">Where PITIA = Principal + Interest + Taxes + Insurance + HOA</div>
                </div>
                <ul className="space-y-2 pt-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Gross Rental Income:</strong> Verified via appraisal Form 1007 (Rent Schedule), executed lease agreements, or 12-month AirDNA short-term rental market performance.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Monthly PITIA:</strong> The comprehensive mortgage liability, including principal amortized over 30 years, note interest rate, real estate taxes, hazard/flood insurance, and mandatory HOA dues.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Interest-Only Advantage:</strong> Electing an Interest-Only (I/O) structure removes principal from the denominator during initial years, substantially elevating your DSCR ratio.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Practical Underwriting Example Card */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Underwriting Example</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">Passed (1.25x DSCR)</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Property Purchase Price</span>
                  <span className="text-slate-200 font-semibold">$450,000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Down Payment (20% LTV 80%)</span>
                  <span className="text-slate-200">$90,000 (Loan: $360,000)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">30-Yr Fixed P&I Payment (7.25%)</span>
                  <span className="text-slate-200">$2,456 / mo</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Property Taxes & Hazard Insurance</span>
                  <span className="text-slate-200">$583 / mo</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-300 font-bold">Total Monthly PITIA Debt</span>
                  <span className="text-rose-400 font-bold">$3,039 / mo</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-300 font-bold">Market Rental Income</span>
                  <span className="text-emerald-400 font-bold">$3,800 / mo</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold">
                  <span className="text-indigo-300">Coverage Ratio ($3,800 ÷ $3,039)</span>
                  <span className="text-emerald-400">1.250x</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                At 1.25x DSCR, the borrower meets prime institutional underwriting criteria, unlocking tier-1 interest rate pricing and maximum 80% LTV financing without submitting tax returns.
              </p>
            </div>
          </div>

          {/* Subsection 2: DSCR Underwriting Matrix Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="size-5 text-indigo-400" />
                  DSCR Lender Qualification Tiers & Underwriting Matrix
                </h3>
                <p className="text-xs text-slate-400">Standard guidelines applied by private capital and secondary non-QM securitization conduits.</p>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 w-fit">
                Updated for 2025/2026 Guidelines
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-300 font-semibold">
                  <tr>
                    <th className="p-3.5">DSCR Tier</th>
                    <th className="p-3.5">Cash Flow Status</th>
                    <th className="p-3.5">Max LTV</th>
                    <th className="p-3.5">Interest Rate Impact</th>
                    <th className="p-3.5">Min Reserves Required</th>
                    <th className="p-3.5">Underwriting Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-emerald-400">≥ 1.25x</td>
                    <td className="p-3.5 text-slate-300">Strong Cash Flow (25%+ surplus)</td>
                    <td className="p-3.5 text-slate-200 font-mono">80% LTV</td>
                    <td className="p-3.5 text-emerald-400 font-medium">Lowest (Baseline Par)</td>
                    <td className="p-3.5 text-slate-300">3 to 6 months PITIA</td>
                    <td className="p-3.5 text-emerald-300 font-semibold">Automatic Institutional Approval</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-indigo-400">1.00x – 1.24x</td>
                    <td className="p-3.5 text-slate-300">Breakeven to Moderate Cash Flow</td>
                    <td className="p-3.5 text-slate-200 font-mono">75% – 80% LTV</td>
                    <td className="p-3.5 text-slate-300 font-medium">+0.250% to +0.375%</td>
                    <td className="p-3.5 text-slate-300">6 months PITIA</td>
                    <td className="p-3.5 text-indigo-300 font-semibold">Standard Approval</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-amber-400">0.75x – 0.99x</td>
                    <td className="p-3.5 text-slate-300">Deficit / Negative Cash Flow</td>
                    <td className="p-3.5 text-slate-200 font-mono">70% – 75% LTV</td>
                    <td className="p-3.5 text-amber-400 font-medium">+0.500% to +0.875%</td>
                    <td className="p-3.5 text-slate-300">6 to 9 months PITIA</td>
                    <td className="p-3.5 text-amber-300 font-semibold">Sub-1.0 Program (Needs FICO 700+)</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-rose-400">&lt; 0.75x / No Ratio</td>
                    <td className="p-3.5 text-slate-300">High Deficit or Vacant Asset</td>
                    <td className="p-3.5 text-slate-200 font-mono">65% – 70% LTV</td>
                    <td className="p-3.5 text-rose-400 font-medium">+1.000% to +1.500%</td>
                    <td className="p-3.5 text-slate-300">9 to 12 months PITIA</td>
                    <td className="p-3.5 text-rose-300 font-semibold">No-Ratio Exception (High Equity Required)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Subsection 3: DSCR Loan vs Conventional vs Hard Money Comparison */}
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
              <Calculator className="size-5 text-indigo-400" />
              DSCR Loan vs Conventional Mortgage vs Hard Money Comparison
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-300 font-semibold">
                  <tr>
                    <th className="p-3.5">Feature / Dimension</th>
                    <th className="p-3.5 text-indigo-400">DSCR Investment Loan</th>
                    <th className="p-3.5 text-slate-300">Conventional Fannie/Freddie</th>
                    <th className="p-3.5 text-amber-400">Hard Money / Bridge Loan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-semibold text-slate-200">Income Verification</td>
                    <td className="p-3.5 text-indigo-300 font-semibold">Rental Income Only (Form 1007/Lease)</td>
                    <td className="p-3.5 text-slate-400">W-2, Paystubs, 2 Yrs Tax Returns</td>
                    <td className="p-3.5 text-amber-300 font-semibold">After-Repair Value (ARV) & Scope</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-semibold text-slate-200">DTI Restrictions</td>
                    <td className="p-3.5 text-emerald-400 font-semibold">None (0% Personal DTI Impact)</td>
                    <td className="p-3.5 text-slate-400">Strict 45% – 50% Ceiling</td>
                    <td className="p-3.5 text-emerald-400 font-semibold">None</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-semibold text-slate-200">Property Portfolio Limit</td>
                    <td className="p-3.5 text-emerald-400 font-semibold">Unlimited Properties</td>
                    <td className="p-3.5 text-rose-400 font-semibold">Capped at 10 Mortgaged Properties</td>
                    <td className="p-3.5 text-emerald-400 font-semibold">Unlimited Properties</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-semibold text-slate-200">Vesting in LLC / Entity</td>
                    <td className="p-3.5 text-emerald-400 font-semibold">Permitted & Highly Encouraged</td>
                    <td className="p-3.5 text-rose-400">Individual Names Only (No LLCs)</td>
                    <td className="p-3.5 text-emerald-400 font-semibold">Required in Business Entity</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-semibold text-slate-200">Loan Term & Structure</td>
                    <td className="p-3.5 text-slate-200">30-Year Fixed / 10-Yr Interest-Only</td>
                    <td className="p-3.5 text-slate-200">15 or 30-Year Fully Amortized Fixed</td>
                    <td className="p-3.5 text-slate-200">6 to 18 Months Interest-Only Bridge</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-semibold text-slate-200">Speed of Funding</td>
                    <td className="p-3.5 text-slate-200">14 to 21 Business Days</td>
                    <td className="p-3.5 text-slate-400">30 to 50+ Days</td>
                    <td className="p-3.5 text-emerald-400 font-bold">5 to 10 Business Days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Competitor Comparison: TableView vs BiggerPockets vs Visio Lending */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-2">
                <Sparkles className="size-3.5" />
                <span>Investor Tool Comparison</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-slate-100">
                Why TableView DSCR Calculator vs BiggerPockets &amp; Visio Lending?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
                Evaluating DSCR rental deals shouldn't require paying $39/month subscriptions or submitting your phone number to aggressive mortgage brokers. Here is how TableView compares against leading alternatives:
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Feature / Capability</th>
                    <th className="py-3 px-4 text-indigo-400 font-bold">TableView.dev</th>
                    <th className="py-3 px-4">BiggerPockets Pro</th>
                    <th className="py-3 px-4">Visio Lending</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-slate-200">Pricing &amp; Usage Limits</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">100% Free Forever (Unlimited)</td>
                    <td className="py-3 px-4 text-rose-400">5 Reports Free, then $39/mo Pro</td>
                    <td className="py-3 px-4 text-slate-400">Free but Gated by Broker Contact</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-slate-200">Account / Sign-Up Requirement</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">None (Instant In-Browser)</td>
                    <td className="py-3 px-4 text-rose-400">Mandatory Registration</td>
                    <td className="py-3 px-4 text-rose-400">Mandatory Lead Form</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-slate-200">Residential &amp; Commercial DSCR Standards</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">Both (Gross Rent &amp; Net NOI)</td>
                    <td className="py-3 px-4 text-slate-400">Residential Rental Only</td>
                    <td className="py-3 px-4 text-slate-400">Residential 1-4 Units</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-slate-200">Reverse Max Loan Solver (Target 1.25x)</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">Built-In Automatic Solver</td>
                    <td className="py-3 px-4 text-slate-400">Manual Guess &amp; Check</td>
                    <td className="py-3 px-4 text-rose-400">Not Available</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-slate-200">Full Amortization &amp; Cash-Flow Table</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">Yes + 1-Click Excel Export</td>
                    <td className="py-3 px-4 text-amber-400">PDF Report (Requires Pro)</td>
                    <td className="py-3 px-4 text-rose-400">Summary Only</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-slate-200">Shareable Pre-filled URL</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">Instant 1-Click Link</td>
                    <td className="py-3 px-4 text-slate-400">Saved in User Account</td>
                    <td className="py-3 px-4 text-rose-400">Not Supported</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-slate-200">Data Privacy (Zero Data Egress)</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">100% Client-Side Private</td>
                    <td className="py-3 px-4 text-slate-400">Saved to Cloud Account</td>
                    <td className="py-3 px-4 text-rose-400">Captured for Sales Outreach</td>
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
      </section>

      {/* Mobile Sticky Summary Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block leading-tight">
            DSCR Coverage
          </span>
          <div className="text-xl font-black font-mono leading-tight flex items-baseline gap-2">
            <span className={result.grossDscr >= 1.25 ? 'text-emerald-400' : result.grossDscr >= 1.0 ? 'text-indigo-400' : 'text-rose-400'}>
              {result.grossDscr.toFixed(2)}x
            </span>
            <span className="text-xs font-semibold text-slate-400 font-sans">({result.statusLabel})</span>
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

import { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Calculator,
  DollarSign,
  Calendar,
  ShieldCheck,
  PiggyBank,
  TrendingDown,
  Download,
  FileSpreadsheet,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  type MortgageInputs,
  calculateMortgage,
  generateAmortizationSchedule,
  getAnnualAmortizationSchedule,
  calculateBiweeklyComparison,
  exportAmortizationToCsv,
  getMonthName
} from '../lib/mortgageCalculator';
import { updatePageMeta, navigateTo } from '../lib/router';
import { ShareCalculationButton } from '../components/ShareCalculationButton';
import { MethodologyDisclosure } from '../components/MethodologyDisclosure';

const mortgageFaqs = [
  {
    q: 'What is PITI in a monthly mortgage payment?',
    a: 'PITI stands for Principal, Interest, Taxes, and Insurance. These four components make up your total housing payment. In addition, homeowner association (HOA) fees and private mortgage insurance (PMI) may be included depending on your loan structure.'
  },
  {
    q: 'When does Private Mortgage Insurance (PMI) automatically cancel?',
    a: 'Under the federal Homeowners Protection Act, conventional mortgage lenders must automatically cancel PMI once your principal balance reaches 78% of the original home value, or you can request cancellation once your balance reaches 80% LTV.'
  },
  {
    q: 'How does an extra monthly principal payment save money?',
    a: 'Extra principal payments reduce your outstanding balance faster, which reduces future compound interest. Making an extra $100-$200 monthly principal payment can shave 4 to 6 years off a 30-year mortgage and save $30,000+ in interest.'
  },
  {
    q: 'What is the standard formula for a 30-year fixed mortgage?',
    a: 'Monthly payment M = P * [r(1+r)^n] / [(1+r)^n - 1], where P is loan principal, r is monthly interest rate (annual rate / 12), and n is total number of monthly payments (360 for 30 years).'
  }
];

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

export const MortgageCalculator = ({ onTrySample }: MortgageCalculatorProps) => {
  useEffect(() => {
    updatePageMeta(
      'Mortgage Calculator - Real Estate Home Loan & Amortization Tool | TableView.dev',
      'Free, 100% private in-browser mortgage calculator. Calculate monthly payments with PMI, property taxes, home insurance, and HOA fees. Includes interactive amortization schedules and Excel/CSV export.',
      '/mortgage-calculator',
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
  const [homeInsuranceYearly, setHomeInsuranceYearly] = useState<number>(() => getNumQuery('insurance', 1500));
  const [monthlyHoa, setMonthlyHoa] = useState<number>(() => getNumQuery('hoa', 0));
  const [loanType, setLoanType] = useState<'conventional' | 'fha' | 'va' | 'usda'>('conventional');
  const buyOrRefi = 'buy' as const;
  
  // Extra Principal Input for Simulator
  const [extraMonthlyPrincipal, setExtraMonthlyPrincipal] = useState<number>(0);

  // View state for Amortization table
  const [scheduleView, setScheduleView] = useState<'annual' | 'monthly'>('annual');
  const [monthlyPage, setMonthlyPage] = useState<number>(1);

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
      extraMonthlyPrincipal
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
      extraMonthlyPrincipal
    ]
  );

  const summary = useMemo(() => calculateMortgage(inputs), [inputs]);
  const monthlySchedule = useMemo(
    () => generateAmortizationSchedule(inputs, extraMonthlyPrincipal),
    [inputs, extraMonthlyPrincipal]
  );
  const annualSchedule = useMemo(
    () => getAnnualAmortizationSchedule(monthlySchedule),
    [monthlySchedule]
  );
  const biweekly = useMemo(() => calculateBiweeklyComparison(inputs), [inputs]);

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

  const handleExportExcel = () => {
    const data = monthlySchedule.map(row => ({
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

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Amortization Schedule');
    XLSX.writeFile(wb, `mortgage_schedule_${homeValue}.xlsx`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Top Banner & Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-3.5" />
            <span>100% In-Browser Private Calculator · Zero Cloud Egress</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('/mortgage-calculator')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold btn-primary shadow-sm cursor-pointer"
            >
              Purchase Loan
            </button>
            <button
              onClick={() => navigateTo('/refinance-calculator')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Refinance Break-Even</span>
              <ArrowRight className="size-3 text-indigo-400" />
            </button>
            <button
              onClick={() => navigateTo('/finance-calculator')}
              className="hidden sm:flex px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              All Calcs
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
              title="Share Calculation"
            />
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
            <Calculator className="size-8 text-indigo-400" />
            <span>Home Mortgage & Loan Calculator</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl mt-1 leading-relaxed">
            Accurately calculate your total monthly mortgage payment including principal, interest, real estate taxes, homeowner insurance, PMI, and HOA fees. Includes real-time amortization schedules and bi-weekly savings analysis.
          </p>
        </div>
      </div>

      {/* Main 2-Column Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Loan Input Parameters (5 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800/80 pb-3 flex items-center gap-2">
              <DollarSign className="size-4 text-emerald-400" />
              Property & Loan Information
            </h2>

            {/* Home Value */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="home-value" className="text-xs font-semibold text-slate-300">
                  Home Purchase Price
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
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
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors cursor-pointer"
                    >
                      ${preset / 1000}k
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                  $
                </span>
                <input
                  id="home-value"
                  type="number"
                  step="1000"
                  min="0"
                  value={homeValue}
                  onChange={(e) => setHomeValue(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-sm font-semibold tracking-wide outline-none transition-colors"
                />
              </div>
            </div>

            {/* Down Payment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="down-payment" className="text-xs font-semibold text-slate-300">
                  Down Payment
                </label>
                {/* $ or % Toggle */}
                <div className="inline-flex rounded-lg border border-slate-800 bg-slate-950 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => handleDownPaymentTypeChange('money')}
                    className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                      downPaymentType === 'money'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    $ (Dollar)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownPaymentTypeChange('percent')}
                    className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                      downPaymentType === 'percent'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    % (Percent)
                  </button>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                  {downPaymentType === 'money' ? '$' : '%'}
                </span>
                <input
                  id="down-payment"
                  type="number"
                  step={downPaymentType === 'percent' ? '0.5' : '1000'}
                  min="0"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-sm font-semibold tracking-wide outline-none transition-colors"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span>
                  Actual Down: <strong className="text-slate-200">{fmtInt(summary.downPaymentAmount)}</strong> ({summary.downPaymentPercent.toFixed(1)}%)
                </span>
                <span>
                  Loan Amount: <strong className="text-slate-200">{fmtInt(summary.loanAmount)}</strong>
                </span>
              </div>
            </div>

            {/* Interest Rate & Term */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="interest-rate" className="text-xs font-semibold text-slate-300">
                  Interest Rate (APR)
                </label>
                <div className="relative">
                  <input
                    id="interest-rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="25"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-sm font-semibold outline-none transition-colors"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    %
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="loan-term" className="text-xs font-semibold text-slate-300">
                  Loan Term (Years)
                </label>
                <div className="relative">
                  <input
                    id="loan-term"
                    type="number"
                    step="1"
                    min="1"
                    max="50"
                    value={loanTermYears}
                    onChange={(e) => setLoanTermYears(Number(e.target.value))}
                    className="w-full pl-3.5 pr-14 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-sm font-semibold outline-none transition-colors"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">
                    years
                  </span>
                </div>
              </div>
            </div>

            {/* Term presets */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-[11px] text-slate-400">Quick Terms:</span>
              {termPresets.map(term => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setLoanTermYears(term)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    loanTermYears === term
                      ? 'bg-slate-800 text-slate-100 font-bold border border-slate-700'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {term} Yrs
                </button>
              ))}
            </div>

            {/* Start Date */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <label htmlFor="start-month" className="text-xs font-semibold text-slate-300">
                  Start Month
                </label>
                <select
                  id="start-month"
                  value={startMonth}
                  onChange={(e) => setStartMonth(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium outline-none cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>
                      {getMonthName(m)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="start-year" className="text-xs font-semibold text-slate-300">
                  Start Year
                </label>
                <input
                  id="start-year"
                  type="number"
                  min="1990"
                  max="2100"
                  value={startYear}
                  onChange={(e) => setStartYear(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium outline-none"
                />
              </div>
            </div>
          </div>

          {/* Taxes, Insurance, and HOA Fees Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800/80 pb-3 flex items-center gap-2">
              <ShieldCheck className="size-4 text-cyan-400" />
              Taxes, Insurance & Fees
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Property Tax */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="property-tax" className="text-xs font-semibold text-slate-300">
                    Property Tax
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {fmt(summary.monthlyPropertyTax)}/mo
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    $
                  </span>
                  <input
                    id="property-tax"
                    type="number"
                    min="0"
                    step="100"
                    value={propertyTaxYearly}
                    onChange={(e) => setPropertyTaxYearly(Number(e.target.value))}
                    className="w-full pl-7 pr-12 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-semibold outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">
                    /yr
                  </span>
                </div>
              </div>

              {/* Home Insurance */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="home-insurance" className="text-xs font-semibold text-slate-300">
                    Homeowners Ins
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {fmt(summary.monthlyHomeInsurance)}/mo
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    $
                  </span>
                  <input
                    id="home-insurance"
                    type="number"
                    min="0"
                    step="50"
                    value={homeInsuranceYearly}
                    onChange={(e) => setHomeInsuranceYearly(Number(e.target.value))}
                    className="w-full pl-7 pr-12 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-semibold outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">
                    /yr
                  </span>
                </div>
              </div>

              {/* PMI Rate */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="pmi-rate" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    PMI Insurance
                    {summary.isPmiRequired ? (
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-normal">
                        Active (&lt;20% down)
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-normal">
                        Waived (&gt;=20% down)
                      </span>
                    )}
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {fmt(summary.monthlyPmi)}/mo
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="pmi-rate"
                    type="number"
                    min="0"
                    step="0.05"
                    max="5"
                    value={pmiRate}
                    onChange={(e) => setPmiRate(Number(e.target.value))}
                    disabled={!summary.isPmiRequired}
                    className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-semibold outline-none disabled:opacity-40"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    %
                  </span>
                </div>
              </div>

              {/* Monthly HOA */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="monthly-hoa" className="text-xs font-semibold text-slate-300">
                    Monthly HOA Dues
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {fmt(summary.monthlyHoa)}/mo
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    $
                  </span>
                  <input
                    id="monthly-hoa"
                    type="number"
                    min="0"
                    step="25"
                    value={monthlyHoa}
                    onChange={(e) => setMonthlyHoa(Number(e.target.value))}
                    className="w-full pl-7 pr-12 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-semibold outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">
                    /mo
                  </span>
                </div>
              </div>
            </div>

            {/* Loan Program Type */}
            <div className="space-y-1.5 pt-2">
              <label htmlFor="loan-type" className="text-xs font-semibold text-slate-300">
                Loan Program Type
              </label>
              <select
                id="loan-type"
                value={loanType}
                onChange={(e) => setLoanType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium outline-none cursor-pointer"
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
        <div className="lg:col-span-6 space-y-6">
          {/* Main Monthly Payment Card */}
          <div className="bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 size-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-6">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  Estimated Total Monthly Payment
                </span>
                <div className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight mt-1">
                  {fmt(summary.totalMonthlyPayment)}
                  <span className="text-sm sm:text-base font-normal text-slate-400 ml-1.5">/month</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 block">Annual Payment:</span>
                <span className="text-base font-bold text-slate-200 font-mono">
                  {fmt(summary.annualPaymentAmount)}
                </span>
              </div>
            </div>

            {/* Visual Stacked Bar Breakdown */}
            <div className="space-y-2">
              <div className="h-3.5 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800 p-0.5">
                <div
                  style={{ width: `${piPct}%` }}
                  className="bg-indigo-500 rounded-l-full h-full transition-all duration-300"
                  title={`P&I: ${fmt(summary.monthlyPrincipalAndInterest)} (${piPct.toFixed(1)}%)`}
                />
                <div
                  style={{ width: `${taxPct}%` }}
                  className="bg-cyan-500 h-full transition-all duration-300"
                  title={`Taxes: ${fmt(summary.monthlyPropertyTax)} (${taxPct.toFixed(1)}%)`}
                />
                <div
                  style={{ width: `${insPct}%` }}
                  className="bg-emerald-500 h-full transition-all duration-300"
                  title={`Insurance: ${fmt(summary.monthlyHomeInsurance)} (${insPct.toFixed(1)}%)`}
                />
                {pmiPct > 0 && (
                  <div
                    style={{ width: `${pmiPct}%` }}
                    className="bg-amber-500 h-full transition-all duration-300"
                    title={`PMI: ${fmt(summary.monthlyPmi)} (${pmiPct.toFixed(1)}%)`}
                  />
                )}
                {hoaPct > 0 && (
                  <div
                    style={{ width: `${hoaPct}%` }}
                    className="bg-purple-500 rounded-r-full h-full transition-all duration-300"
                    title={`HOA: ${fmt(summary.monthlyHoa)} (${hoaPct.toFixed(1)}%)`}
                  />
                )}
              </div>

              {/* Legend & Breakdown Items */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
                    <span className="size-2 rounded-full bg-indigo-500" />
                    <span>Principal & Interest</span>
                  </div>
                  <div className="text-sm font-bold text-slate-100 font-mono">
                    {fmt(summary.monthlyPrincipalAndInterest)}
                  </div>
                  <div className="text-[11px] text-slate-400">{piPct.toFixed(1)}% of total</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
                    <span className="size-2 rounded-full bg-cyan-500" />
                    <span>Property Taxes</span>
                  </div>
                  <div className="text-sm font-bold text-slate-100 font-mono">
                    {fmt(summary.monthlyPropertyTax)}
                  </div>
                  <div className="text-[11px] text-slate-400">{taxPct.toFixed(1)}% of total</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span>Home Insurance</span>
                  </div>
                  <div className="text-sm font-bold text-slate-100 font-mono">
                    {fmt(summary.monthlyHomeInsurance)}
                  </div>
                  <div className="text-[11px] text-slate-400">{insPct.toFixed(1)}% of total</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                    <span className="size-2 rounded-full bg-amber-500" />
                    <span>PMI Insurance</span>
                  </div>
                  <div className="text-sm font-bold text-slate-100 font-mono">
                    {summary.monthlyPmi > 0 ? fmt(summary.monthlyPmi) : '$0.00'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {summary.monthlyPmi > 0 ? `${pmiPct.toFixed(1)}% of total` : 'Not required'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium">
                    <span className="size-2 rounded-full bg-purple-500" />
                    <span>Monthly HOA</span>
                  </div>
                  <div className="text-sm font-bold text-slate-100 font-mono">
                    {fmt(summary.monthlyHoa)}
                  </div>
                  <div className="text-[11px] text-slate-400">{hoaPct.toFixed(1)}% of total</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                    <Calendar className="size-3 text-slate-400" />
                    <span>Loan Pay-off Date</span>
                  </div>
                  <div className="text-sm font-bold text-slate-100 font-mono">
                    {summary.payoffDateString}
                  </div>
                  <div className="text-[11px] text-slate-400">{summary.totalMonths} total payments</div>
                </div>
              </div>
            </div>
          </div>

          {/* Loan Life Totals & Metrics Grid */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <PiggyBank className="size-4 text-amber-400" />
              Total Cost Over Life of Loan ({summary.totalMonths} Months)
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400 block">Total Interest Paid</span>
                <span className="text-lg font-bold text-slate-100 font-mono">
                  {fmt(summary.totalInterestPaid)}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {(summary.totalInterestPaid / (summary.loanAmount || 1) * 100).toFixed(0)}% of principal
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400 block">Total Principal Paid</span>
                <span className="text-lg font-bold text-slate-100 font-mono">
                  {fmt(summary.loanAmount)}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  100% of original loan
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400 block">Total Taxes & Insurance</span>
                <span className="text-lg font-bold text-slate-100 font-mono">
                  {fmt(summary.totalPropertyTaxPaid + summary.totalHomeInsurancePaid + summary.totalPmiPaid)}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Over {loanTermYears} years
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400 block">Total of All Payments</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {fmt(summary.totalOfAllPayments)}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  P&I, taxes, insurance, fees
                </span>
              </div>
            </div>
          </div>

          {/* Bi-Weekly Accelerated Savings Optimizer */}
          <div className="bg-gradient-to-r from-indigo-950/30 to-emerald-950/30 border border-indigo-500/20 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <TrendingDown className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">Bi-Weekly Payment Optimizer</h4>
                  <p className="text-[11px] text-slate-400">
                    Pay every 2 weeks (26 half-payments = 13 full payments/year)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 block">Interest Savings</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {fmt(biweekly.interestSaved)}
                </span>
                <span className="text-[11px] text-slate-400 block">Saved in mortgage interest</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 block">Pay Off Early By</span>
                <span className="text-base font-bold text-indigo-400 font-mono">
                  {biweekly.yearsSaved} Years ({biweekly.monthsSaved} Months)
                </span>
                <span className="text-[11px] text-slate-400 block">Shortens your loan term</span>
              </div>
            </div>

            {/* Extra Monthly Payment simulator */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
              <label htmlFor="extra-monthly-principal" className="text-xs text-slate-300 font-medium">
                Add Extra Principal Monthly:
              </label>
              <div className="relative w-36">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                <input
                  id="extra-monthly-principal"
                  type="number"
                  step="50"
                  min="0"
                  value={extraMonthlyPrincipal}
                  onChange={(e) => setExtraMonthlyPrincipal(Number(e.target.value))}
                  placeholder="0"
                  className="w-full pl-6 pr-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-100 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Amortization Schedule Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="size-5 text-indigo-400" />
              <span>Mortgage Amortization Schedule</span>
            </h3>
            <p className="text-xs text-slate-400">
              Detailed breakdown of principal reduction, interest, and ending balances across each payment period.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Toggle */}
            <div className="inline-flex rounded-xl border border-slate-800 bg-slate-950 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setScheduleView('annual')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  scheduleView === 'annual'
                    ? 'btn-primary shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Annual Summary
              </button>
              <button
                type="button"
                onClick={() => setScheduleView('monthly')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  scheduleView === 'monthly'
                    ? 'btn-primary shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Monthly Schedule ({monthlySchedule.length})
              </button>
            </div>

            {/* Export Buttons */}
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Download formatted Excel workbook (.xlsx)"
            >
              <FileSpreadsheet className="size-3.5" />
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-800 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Download CSV spreadsheet"
            >
              <Download className="size-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Amortization Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-300 font-sans font-semibold">
              <tr>
                <th className="py-3 px-4">{scheduleView === 'annual' ? 'Year' : 'Date'}</th>
                <th className="py-3 px-4">Starting Balance</th>
                <th className="py-3 px-4 text-emerald-400">Principal Paid</th>
                <th className="py-3 px-4 text-indigo-400">Interest Paid</th>
                <th className="py-3 px-4">Taxes & Ins</th>
                <th className="py-3 px-4 font-bold text-slate-100">Total Payment</th>
                <th className="py-3 px-4">Ending Balance</th>
                <th className="py-3 px-4 text-slate-400">Total Interest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {scheduleView === 'annual'
                ? annualSchedule.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-2.5 px-4 font-sans font-bold text-slate-200">
                        {row.year}
                      </td>
                      <td className="py-2.5 px-4 text-slate-400">{fmt(row.startingBalance)}</td>
                      <td className="py-2.5 px-4 text-emerald-400 font-medium">{fmt(row.principalPaid)}</td>
                      <td className="py-2.5 px-4 text-indigo-400 font-medium">{fmt(row.interestPaid)}</td>
                      <td className="py-2.5 px-4 text-slate-400">
                        {fmt(row.propertyTax + row.homeInsurance + row.pmi + row.hoa)}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-100">{fmt(row.totalPayment)}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-200">{fmt(row.endingBalance)}</td>
                      <td className="py-2.5 px-4 text-slate-500">{fmt(row.totalInterestToDate)}</td>
                    </tr>
                  ))
                : paginatedMonthlyRows.map((row) => (
                    <tr key={row.monthIndex} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-2.5 px-4 font-sans font-medium text-slate-200">
                        {row.monthName} {row.year} <span className="text-[10px] text-slate-500">(#{row.monthIndex})</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-400">{fmt(row.startingBalance)}</td>
                      <td className="py-2.5 px-4 text-emerald-400 font-medium">{fmt(row.principalPaid)}</td>
                      <td className="py-2.5 px-4 text-indigo-400 font-medium">{fmt(row.interestPaid)}</td>
                      <td className="py-2.5 px-4 text-slate-400">
                        {fmt(row.propertyTax + row.homeInsurance + row.pmi + row.hoa)}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-100">{fmt(row.totalPayment)}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-200">{fmt(row.endingBalance)}</td>
                      <td className="py-2.5 px-4 text-slate-500">{fmt(row.totalInterestToDate)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Monthly View Pagination */}
        {scheduleView === 'monthly' && totalMonthlyPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 pt-2">
            <span>
              Showing {(monthlyPage - 1) * rowsPerPage + 1} to{' '}
              {Math.min(monthlyPage * rowsPerPage, monthlySchedule.length)} of {monthlySchedule.length} payments
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMonthlyPage((p) => Math.max(1, p - 1))}
                disabled={monthlyPage === 1}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 transition-colors cursor-pointer"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 font-mono text-slate-200">
                Page {monthlyPage} of {totalMonthlyPages}
              </span>
              <button
                type="button"
                onClick={() => setMonthlyPage((p) => Math.min(totalMonthlyPages, p + 1))}
                disabled={monthlyPage === totalMonthlyPages}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <MethodologyDisclosure type="mortgage" />

      {/* Bottom Knowledge & Explainer Guide Card */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-6">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <HelpCircle className="size-5 text-indigo-400" />
          Understanding Your Mortgage Payment Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-400 leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 text-sm">What is PITI?</h4>
            <p>
              PITI stands for <strong>Principal, Interest, Taxes, and Insurance</strong>. These four components make up the standard monthly cost of homeownership. In addition to PITI, homeowner association (HOA) fees and private mortgage insurance (PMI) may be included in your monthly payment.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 text-sm">When does PMI drop off?</h4>
            <p>
              Under the Homeowners Protection Act, for conventional loans, lenders must automatically terminate PMI once your mortgage principal balance reaches <strong>78% of the original property value</strong> (or you can request cancellation once your loan balance reaches <strong>80% LTV</strong>). This calculator automatically accounts for this dynamic cancellation in your amortization schedule.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 text-sm">How Bi-Weekly Payments Save Money</h4>
            <p>
              Making half-payments every two weeks results in 26 half-payments per year—the equivalent of 13 monthly payments instead of 12. That extra payment goes entirely toward your principal, shortening a 30-year mortgage by 4 to 6 years and saving tens of thousands of dollars in interest.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 text-sm">100% Client-Side Privacy Guarantee</h4>
            <p>
              None of your financial inputs, loan balances, or income assumptions are ever transmitted to any remote server or tracked by third-party advertisers. All amortization mathematics and CSV exports execute exclusively in local browser WebAssembly and JavaScript memory.
            </p>
          </div>
        </div>

        {/* Workbench CTA */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-slate-200">
              Need to analyze large mortgage or loan portfolio files?
            </h4>
            <p className="text-xs text-slate-400">
              Drop Fannie Mae/Freddie Mac single-family loan files or local spreadsheets directly into DuckDB-Wasm in memory.
            </p>
          </div>

          <button
            onClick={() => {
              navigateTo('/');
              if (onTrySample) {
                setTimeout(() => onTrySample(), 120);
              }
            }}
            className="btn-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all shrink-0 whitespace-nowrap"
          >
            <Sparkles className="size-4 text-amber-400" />
            <span>Open TableView Workbench</span>
            <ArrowRight className="size-3.5 opacity-80" />
          </button>
        </div>
      </div>
    </div>
  );
};

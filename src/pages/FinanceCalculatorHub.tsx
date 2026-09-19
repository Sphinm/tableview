import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Car,
  CreditCard,
  TrendingUp,
  Landmark,
  Home,
  ShieldCheck,
  ArrowRight,
  PiggyBank,
  RefreshCw,
  Building,
  Hammer,
  Server,
  Zap,
  HelpCircle,
  Scale,
  DollarSign,
  ChevronDown,
  Check,
} from 'lucide-react';
import { AdSlot } from '../components/AdSlot';
import { CurrencyInput } from '../components/CurrencyInput';
import { NumericInput } from '../components/NumericInput';
import { SuiteSubNav } from '../components/SuiteSubNav';
import {
  calculateAutoLoan,
  calculatePersonalLoan,
  calculateCompoundSavings,
  calculateCreditCardPayoff,
  type AutoLoanInputs,
  type PersonalLoanInputs,
  type CompoundSavingsInputs,
  type CreditCardPayoffInputs
} from '../lib/financeCalculators';
import { updatePageMeta, navigateTo } from '../lib/router';
import { CALCULATOR_META } from '../data/routeMeta';
import { preloadRoute } from '../lib/routePreload';

export const FinanceCalculatorHub = () => {
  useEffect(() => {
    updatePageMeta(
      CALCULATOR_META['/finance-calculator'].title,
      CALCULATOR_META['/finance-calculator'].description,
      CALCULATOR_META['/finance-calculator'].canonical
    );
  }, []);

  const [activeTab, setActiveTab] = useState<'auto' | 'personal' | 'savings' | 'creditCard'>('auto');
  const [isTabDropdownOpen, setIsTabDropdownOpen] = useState<boolean>(false);
  const tabDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tabDropdownRef.current && !tabDropdownRef.current.contains(event.target as Node)) {
        setIsTabDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const CALCULATOR_TABS = [
    {
      id: 'auto' as const,
      label: 'Auto Loan Calculator',
      icon: Car,
      desc: 'Vehicle financing & monthly loan payment'
    },
    {
      id: 'personal' as const,
      label: 'Personal Loan Calculator',
      icon: CreditCard,
      desc: 'Unsecured installment loan modeling'
    },
    {
      id: 'savings' as const,
      label: 'Compound Savings & Growth',
      icon: TrendingUp,
      desc: 'APY compounding interest & wealth projections'
    },
    {
      id: 'creditCard' as const,
      label: 'Credit Card Payoff',
      icon: PiggyBank,
      desc: 'Accelerated debt elimination schedule'
    },
  ];

  const currentTab = CALCULATOR_TABS.find((t) => t.id === activeTab) || CALCULATOR_TABS[0];
  const CurrentTabIcon = currentTab.icon;

  // Currency Formatter
  const fmt = (val: number) =>
    val.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  // --- 1. Auto Loan State ---
  const [autoPrice, setAutoPrice] = useState<number>(35000);
  const [autoDown, setAutoDown] = useState<number>(5000);
  const [autoTradeIn, setAutoTradeIn] = useState<number>(3000);
  const [autoTaxRate, setAutoTaxRate] = useState<number>(7.0);
  const [autoRate, setAutoRate] = useState<number>(5.9);
  const [autoTerm, setAutoTerm] = useState<number>(60);

  const autoInputs: AutoLoanInputs = useMemo(
    () => ({
      vehiclePrice: autoPrice,
      downPayment: autoDown,
      tradeInValue: autoTradeIn,
      salesTaxRate: autoTaxRate,
      interestRate: autoRate,
      termMonths: autoTerm
    }),
    [autoPrice, autoDown, autoTradeIn, autoTaxRate, autoRate, autoTerm]
  );
  const autoResult = useMemo(() => calculateAutoLoan(autoInputs), [autoInputs]);

  // --- 2. Personal Loan State ---
  const [personalAmount, setPersonalAmount] = useState<number>(15000);
  const [personalRate, setPersonalRate] = useState<number>(9.5);
  const [personalTerm, setPersonalTerm] = useState<number>(36);

  const personalInputs: PersonalLoanInputs = useMemo(
    () => ({
      loanAmount: personalAmount,
      interestRate: personalRate,
      termMonths: personalTerm
    }),
    [personalAmount, personalRate, personalTerm]
  );
  const personalResult = useMemo(() => calculatePersonalLoan(personalInputs), [personalInputs]);

  // --- 3. Compound Savings State ---
  const [savingsInitial, setSavingsInitial] = useState<number>(10000);
  const [savingsMonthly, setSavingsMonthly] = useState<number>(500);
  const [savingsReturn, setSavingsReturn] = useState<number>(8.0);
  const [savingsYears, setSavingsYears] = useState<number>(15);

  const savingsInputs: CompoundSavingsInputs = useMemo(
    () => ({
      initialDeposit: savingsInitial,
      monthlyDeposit: savingsMonthly,
      annualReturnRate: savingsReturn,
      investmentYears: savingsYears
    }),
    [savingsInitial, savingsMonthly, savingsReturn, savingsYears]
  );
  const savingsResult = useMemo(() => calculateCompoundSavings(savingsInputs), [savingsInputs]);

  // --- 4. Credit Card Payoff State ---
  const [ccBalance, setCcBalance] = useState<number>(8000);
  const [ccRate, setCcRate] = useState<number>(21.99);
  const [ccMonthlyPayment, setCcMonthlyPayment] = useState<number>(350);

  const ccInputs: CreditCardPayoffInputs = useMemo(
    () => ({
      cardBalance: ccBalance,
      interestRate: ccRate,
      monthlyPayment: ccMonthlyPayment
    }),
    [ccBalance, ccRate, ccMonthlyPayment]
  );
  const ccResult = useMemo(() => calculateCreditCardPayoff(ccInputs), [ccInputs]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            <span>Private Financial Planning · Zero Tracking or Data Storage</span>
          </div>

          <button
            onMouseEnter={() => preloadRoute('/mortgage-calculator')}
            onFocus={() => preloadRoute('/mortgage-calculator')}
            onClick={() => navigateTo('/mortgage-calculator')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-indigo-700 hover:bg-slate-50 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Home className="size-3.5 text-indigo-600" />
            <span>Switch to Home Mortgage Calculator</span>
            <ArrowRight className="size-3" />
          </button>
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Landmark className="size-8 text-indigo-600" />
            <span>Financial Planning & Loan Calculators</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl mt-1 leading-relaxed">
            A comprehensive suite of personal finance calculation tools. Model car purchases, personal installment loans, compound investment growth, and debt-free credit card payoff strategies with instant precision.
          </p>
        </div>
      </div>

      <SuiteSubNav suite="personal" />

      {/* Featured Flagship Real Estate, FinOps & Mortgage Calculators */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Flagship Investment, FinOps & Mortgage Calculators
          </span>
          <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Excel (.xlsx) Export Supported
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Cap Rate & Rental Property Cash Flow */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex flex-col justify-between gap-3.5 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                <Building className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-900 truncate">Cap Rate & Cash Flow</h2>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Flagship CRE
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-snug">
                  Model NOI, Cap Rate, Cash-on-Cash Return, and 10-year equity building projections.
                </p>
              </div>
            </div>
            <button
              onMouseEnter={() => preloadRoute('/cap-rate-calculator')}
              onFocus={() => preloadRoute('/cap-rate-calculator')}
              onClick={() => navigateTo('/cap-rate-calculator')}
              className="btn-primary w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Underwrite Rental Deal</span>
              <ArrowRight className="size-3" />
            </button>
          </div>

          {/* DSCR Loan */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex flex-col justify-between gap-3.5 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                <Building className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-900 truncate">DSCR Loan Calculator</h2>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    High ROI
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-snug">
                  Rental property cash flow, debt coverage ratio tiers & 30-year amortization.
                </p>
              </div>
            </div>
            <button
              onMouseEnter={() => preloadRoute('/dscr-loan-calculator')}
              onFocus={() => preloadRoute('/dscr-loan-calculator')}
              onClick={() => navigateTo('/dscr-loan-calculator')}
              className="btn-primary w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Calculate DSCR</span>
              <ArrowRight className="size-3" />
            </button>
          </div>

          {/* Hard Money */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex flex-col justify-between gap-3.5 shadow-xs hover:border-amber-300 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                <Hammer className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-900 truncate">Hard Money & Flip</h2>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    70% Rule
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-snug">
                  Fix & flip loan points, interest-only holding costs, MAO & net profit ROI.
                </p>
              </div>
            </div>
            <button
              onMouseEnter={() => preloadRoute('/hard-money-calculator')}
              onFocus={() => preloadRoute('/hard-money-calculator')}
              onClick={() => navigateTo('/hard-money-calculator')}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <span>Analyze Flip Deal</span>
              <ArrowRight className="size-3" />
            </button>
          </div>

          {/* Snowflake Cost */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex flex-col justify-between gap-3.5 shadow-xs hover:border-sky-300 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
                <Server className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-900 truncate">Snowflake Cost Sizer</h2>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200">
                    FinOps
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-snug">
                  Warehouse credit burn rate, multi-cluster autoscaling & auto-suspend savings.
                </p>
              </div>
            </div>
            <button
              onMouseEnter={() => preloadRoute('/snowflake-cost-calculator')}
              onFocus={() => preloadRoute('/snowflake-cost-calculator')}
              onClick={() => navigateTo('/snowflake-cost-calculator')}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <span>Size Snowflake Warehouse</span>
              <ArrowRight className="size-3" />
            </button>
          </div>

          {/* Parquet Storage & Query Savings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex flex-col justify-between gap-3.5 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                <Zap className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-900 truncate">Parquet Cloud Savings</h2>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    S3 & Athena
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-snug">
                  S3 compressed storage cut & Athena / BigQuery columnar scan byte reduction.
                </p>
              </div>
            </div>
            <button
              onMouseEnter={() => preloadRoute('/parquet-storage-calculator')}
              onFocus={() => preloadRoute('/parquet-storage-calculator')}
              onClick={() => navigateTo('/parquet-storage-calculator')}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <span>Calculate Cloud Savings</span>
              <ArrowRight className="size-3" />
            </button>
          </div>

          {/* Mortgage Calculator */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex flex-col justify-between gap-3.5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
                <Home className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-900 truncate">Mortgage Calculator</h2>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Popular
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-snug">
                  PITI breakdown, dynamic PMI drop-off, property taxes & annual amortization.
                </p>
              </div>
            </div>
            <button
              onMouseEnter={() => preloadRoute('/mortgage-calculator')}
              onFocus={() => preloadRoute('/mortgage-calculator')}
              onClick={() => navigateTo('/mortgage-calculator')}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-slate-200 shadow-2xs"
            >
              <span>Open Mortgage</span>
              <ArrowRight className="size-3" />
            </button>
          </div>

          {/* Refinance Break-Even */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex flex-col justify-between gap-3.5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
                <RefreshCw className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-900 truncate">Refinance Break-Even</h2>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Break-Even
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-snug">
                  Current vs new loan, points & closing fees, monthly savings & 7-year net equity.
                </p>
              </div>
            </div>
            <button
              onMouseEnter={() => preloadRoute('/refinance-calculator')}
              onFocus={() => preloadRoute('/refinance-calculator')}
              onClick={() => navigateTo('/refinance-calculator')}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-slate-200 shadow-2xs"
            >
              <span>Evaluate Refinance</span>
              <ArrowRight className="size-3" />
            </button>
          </div>

          {/* Loan Comparison */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex flex-col justify-between gap-3.5 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                <Scale className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-900 truncate">Loan Comparison</h2>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Side-by-Side
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-snug">
                  Compare two loans head-to-head, discount points break-even, and interest savings.
                </p>
              </div>
            </div>
            <button
              onMouseEnter={() => preloadRoute('/loan-comparison-calculator')}
              onFocus={() => preloadRoute('/loan-comparison-calculator')}
              onClick={() => navigateTo('/loan-comparison-calculator')}
              className="btn-primary w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Compare Loans</span>
              <ArrowRight className="size-3" />
            </button>
          </div>

          {/* Commercial Real Estate Loan */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex flex-col justify-between gap-3.5 shadow-xs hover:border-cyan-300 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center shrink-0">
                <Building className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-900 truncate">Commercial Loan</h2>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">
                    Balloon
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-snug">
                  CRE balloon payment at maturity, 20-30yr amortization, and interest-only periods.
                </p>
              </div>
            </div>
            <button
              onMouseEnter={() => preloadRoute('/commercial-loan-calculator')}
              onFocus={() => preloadRoute('/commercial-loan-calculator')}
              onClick={() => navigateTo('/commercial-loan-calculator')}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all font-semibold"
            >
              <span>Model Commercial Debt</span>
              <ArrowRight className="size-3" />
            </button>
          </div>

          {/* Salary to Hourly Calculator */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex flex-col justify-between gap-3.5 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                <DollarSign className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-900 truncate">Salary to Hourly</h2>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Payroll
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-snug">
                  Convert annual salary to hourly wage, 26x bi-weekly pay, FLSA overtime & PTO value.
                </p>
              </div>
            </div>
            <button
              onMouseEnter={() => preloadRoute('/salary-to-hourly-calculator')}
              onFocus={() => preloadRoute('/salary-to-hourly-calculator')}
              onClick={() => navigateTo('/salary-to-hourly-calculator')}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all font-semibold"
            >
              <span>Convert Salary</span>
              <ArrowRight className="size-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Calculator Dropdown Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Interactive Calculator Workspace
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Switch between vehicle financing, personal loans, compound growth, and debt payoff
          </p>
        </div>

        <div ref={tabDropdownRef} className="relative min-w-[220px] sm:min-w-[260px]">
          <button
            type="button"
            onClick={() => setIsTabDropdownOpen(!isTabDropdownOpen)}
            className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs transition-all cursor-pointer text-slate-800"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <CurrentTabIcon className="size-4 text-indigo-600" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {currentTab.label}
              </span>
            </div>
            <ChevronDown className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${isTabDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isTabDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Financial Calculator
              </div>
              {CALCULATOR_TABS.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsTabDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                      isSelected ? 'bg-indigo-50/60 text-indigo-950 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <Icon className="size-4 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                          {tab.label}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {tab.desc}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="size-4 text-indigo-600 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* --- TAB 1: Auto Loan Calculator --- */}
      {activeTab === 'auto' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Car className="size-4 text-emerald-600" />
              Vehicle Purchase & Financing
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Vehicle Purchase Price</label>
                <CurrencyInput
                  value={autoPrice}
                  onChange={setAutoPrice}
                  className="py-2 text-base sm:text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Cash Down Payment</label>
                  <CurrencyInput
                    value={autoDown}
                    onChange={setAutoDown}
                    className="py-2 text-base sm:text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Trade-In Allowance</label>
                  <CurrencyInput
                    value={autoTradeIn}
                    onChange={setAutoTradeIn}
                    className="py-2 text-base sm:text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Sales Tax Rate</label>
                  <NumericInput
                    value={autoTaxRate}
                    onChange={setAutoTaxRate}
                    suffix="%"
                    step={0.1}
                    min={0}
                    max={20}
                    className="py-2 text-base sm:text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Interest Rate (APR)</label>
                  <NumericInput
                    value={autoRate}
                    onChange={setAutoRate}
                    suffix="%"
                    step={0.05}
                    min={0}
                    max={30}
                    className="py-2 text-base sm:text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Loan Term (Months)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[36, 48, 60, 72].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setAutoTerm(m)}
                      className={`py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        autoTerm === m
                          ? 'btn-primary shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {m} Mo ({m / 12} Yrs)
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Estimated Monthly Auto Payment
              </span>
              <div className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-1">
                {fmt(autoResult.monthlyPayment)}
                <span className="text-sm font-normal text-slate-500 ml-1.5">/month</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block">Total Financed Principal</span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {fmt(autoResult.financedAmount)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block">Estimated Sales Tax</span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {fmt(autoResult.salesTaxAmount)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block">Total Interest Over Loan</span>
                <span className="text-lg font-bold text-indigo-600 font-mono">
                  {fmt(autoResult.totalInterest)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block">Total Vehicle Cost</span>
                <span className="text-lg font-bold text-emerald-600 font-mono">
                  {fmt(autoResult.totalVehicleCost)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: Personal Loan Calculator --- */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <CreditCard className="size-4 text-indigo-600" />
              Personal Installment Loan
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Loan Amount</label>
                <CurrencyInput
                  value={personalAmount}
                  onChange={setPersonalAmount}
                  className="py-2 text-base sm:text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Interest Rate (APR)</label>
                  <NumericInput
                    value={personalRate}
                    onChange={setPersonalRate}
                    suffix="%"
                    step={0.1}
                    min={0}
                    max={36}
                    className="py-2 text-base sm:text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Loan Term</label>
                  <select
                    value={personalTerm}
                    onChange={(e) => setPersonalTerm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-base sm:text-xs font-semibold outline-none cursor-pointer focus:border-indigo-500"
                  >
                    <option value={12}>12 Months (1 Year)</option>
                    <option value={24}>24 Months (2 Years)</option>
                    <option value={36}>36 Months (3 Years)</option>
                    <option value={48}>48 Months (4 Years)</option>
                    <option value={60}>60 Months (5 Years)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Estimated Monthly Payment
              </span>
              <div className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-1">
                {fmt(personalResult.monthlyPayment)}
                <span className="text-sm font-normal text-slate-500 ml-1.5">/month</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block">Total Loan Principal</span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {fmt(personalAmount)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block">Total Interest Paid</span>
                <span className="text-lg font-bold text-indigo-600 font-mono">
                  {fmt(personalResult.totalInterest)}
                </span>
              </div>

              <div className="col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block">Total of All Payments</span>
                <span className="text-xl font-bold text-emerald-600 font-mono">
                  {fmt(personalResult.totalPayment)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: Compound Savings & Growth --- */}
      {activeTab === 'savings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <TrendingUp className="size-4 text-emerald-600" />
              Compound Savings & Investment Plan
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Initial Starting Deposit</label>
                <CurrencyInput
                  value={savingsInitial}
                  onChange={setSavingsInitial}
                  className="py-2 text-base sm:text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Monthly Deposit / Contribution</label>
                <CurrencyInput
                  value={savingsMonthly}
                  onChange={setSavingsMonthly}
                  className="py-2 text-base sm:text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Expected Annual Return</label>
                  <NumericInput
                    value={savingsReturn}
                    onChange={setSavingsReturn}
                    suffix="%"
                    step={0.25}
                    min={0}
                    max={25}
                    className="py-2 text-base sm:text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Investment Horizon (Years)</label>
                  <NumericInput
                    value={savingsYears}
                    onChange={setSavingsYears}
                    step={1}
                    min={1}
                    max={50}
                    className="py-2 text-base sm:text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Estimated Future Balance After {savingsYears} Years
              </span>
              <div className="text-3xl sm:text-5xl font-black text-emerald-600 tracking-tight mt-1">
                {fmt(savingsResult.futureValue)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block">Total Principal Invested</span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {fmt(savingsResult.totalPrincipalInvested)}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {((savingsResult.totalPrincipalInvested / savingsResult.futureValue) * 100).toFixed(1)}% of final total
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block">Total Compound Interest</span>
                <span className="text-lg font-bold text-emerald-600 font-mono">
                  {fmt(savingsResult.totalInterestEarned)}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {((savingsResult.totalInterestEarned / savingsResult.futureValue) * 100).toFixed(1)}% pure growth
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: Credit Card Payoff --- */}
      {activeTab === 'creditCard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <PiggyBank className="size-4 text-amber-600" />
              Credit Card Balance & Repayment
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Outstanding Card Balance</label>
                <CurrencyInput
                  value={ccBalance}
                  onChange={setCcBalance}
                  className="py-2 text-base sm:text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Interest Rate (APR)</label>
                  <NumericInput
                    value={ccRate}
                    onChange={setCcRate}
                    suffix="%"
                    step={0.1}
                    min={0}
                    max={40}
                    className="py-2 text-base sm:text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Planned Monthly Payment</label>
                  <CurrencyInput
                    value={ccMonthlyPayment}
                    onChange={setCcMonthlyPayment}
                    className="py-2 text-base sm:text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            {ccResult.isPayoffPossible ? (
              <>
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                    Estimated Time to Debt-Free
                  </span>
                  <div className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-1">
                    {ccResult.monthsToPayoff} Months
                    <span className="text-sm font-normal text-slate-500 ml-2">
                      ({ccResult.yearsToPayoff} Years)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block">Total Interest Paid</span>
                    <span className="text-lg font-bold text-amber-600 font-mono">
                      {fmt(ccResult.totalInterestPaid)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block">Total Paid Back</span>
                    <span className="text-lg font-bold text-slate-900 font-mono">
                      {fmt(ccResult.totalAmountPaid)}
                    </span>
                  </div>

                  <div className="col-span-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-xs text-emerald-800 font-semibold block">
                      Versus Paying Only Minimums:
                    </span>
                    <p className="text-xs text-slate-600 mt-1">
                      Paying minimums takes approx. <strong>{ccResult.minimumPaymentComparison.months} months</strong> and costs <strong>{fmt(ccResult.minimumPaymentComparison.interest)}</strong> in interest! Your fixed plan saves <strong>{fmt(Math.max(0, ccResult.minimumPaymentComparison.interest - ccResult.totalInterestPaid))}</strong>.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 text-center space-y-2">
                <span className="text-amber-600 font-bold">Monthly Payment Too Low</span>
                <p className="text-xs text-slate-600">
                  Your monthly payment of {fmt(ccMonthlyPayment)} does not cover the monthly interest of {fmt(ccBalance * (ccRate / 100 / 12))}. Increase your payment to start reducing the balance.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Highest-intent placement beneath calculation outcomes */}
      <AdSlot unit="calculatorResult" className="my-8" />

      {/* Common Financial Planning FAQs */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="size-5 text-indigo-600" />
          <span>Financial Planning & Loan Questions</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm">Are my financial numbers uploaded or stored?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              No. All calculations run 100% client-side in your browser JavaScript/Wasm sandbox. None of your loan amounts, interest rates, balances, or financial details are ever transmitted to any remote server.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm">How does compound interest accelerate wealth building?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Compound interest earns returns on both your initial principal and previous accumulated interest. Over 10+ years, exponential compounding typically exceeds total direct deposits, significantly accelerating net worth growth.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm">What is the difference between APR and interest rate?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              The nominal interest rate is the base cost of borrowing the principal. APR (Annual Percentage Rate) includes additional upfront lender fees, origination points, and documentation costs, reflecting the true annualized borrowing expense.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm">Can I export loan schedules into Microsoft Excel?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Yes. Use our standalone DSCR, Hard Money, Mortgage, and Refinance tools to generate multi-year monthly amortization schedules and export formatted .xlsx spreadsheets with one click.
            </p>
          </div>
        </div>
      </div>

      {/* In-article closing ad placement */}
      <AdSlot unit="calculatorFaq" format="horizontal" />
    </div>
  );
};

import { useState, useMemo, useEffect } from 'react';
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
  HelpCircle
} from 'lucide-react';
import { AdSlot } from '../components/AdSlot';
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

export const FinanceCalculatorHub = () => {
  useEffect(() => {
    updatePageMeta(
      CALCULATOR_META['/finance-calculator'].title,
      CALCULATOR_META['/finance-calculator'].description,
      CALCULATOR_META['/finance-calculator'].canonical
    );
  }, []);

  const [activeTab, setActiveTab] = useState<'auto' | 'personal' | 'savings' | 'creditCard'>('auto');

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Top Banner & Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-3.5" />
            <span>100% Client-Side Financial Planning · Zero Tracking or Data Storage</span>
          </div>

          <button
            onClick={() => navigateTo('/mortgage-calculator')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Home className="size-3.5 text-indigo-400" />
            <span>Switch to Home Mortgage Calculator</span>
            <ArrowRight className="size-3" />
          </button>
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
            <Landmark className="size-8 text-indigo-400" />
            <span>Financial Planning & Loan Calculators</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl mt-1 leading-relaxed">
            A comprehensive suite of personal finance calculation tools. Model car purchases, personal installment loans, compound investment growth, and debt-free credit card payoff strategies with instant precision.
          </p>
        </div>
      </div>

      {/* Featured Flagship Real Estate, FinOps & Mortgage Calculators */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Flagship Investment, FinOps & Mortgage Calculators
          </span>
          <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Excel (.xlsx) Export Supported
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* DSCR Loan */}
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-slate-950 p-4.5 flex flex-col justify-between gap-3.5 shadow-sm hover:border-indigo-500/50 transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Building className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-100 truncate">DSCR Loan Calculator</h2>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    High ROI
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  Rental property cash flow, debt coverage ratio tiers & 30-year amortization.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('/dscr-loan-calculator')}
              className="btn-primary w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Calculate DSCR</span>
              <ArrowRight className="size-3" />
            </button>
          </div>

          {/* Hard Money */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/30 via-slate-900/60 to-slate-950 p-4.5 flex flex-col justify-between gap-3.5 shadow-sm hover:border-amber-500/50 transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Hammer className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-100 truncate">Hard Money & Flip</h2>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    70% Rule
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  Fix & flip loan points, interest-only holding costs, MAO & net profit ROI.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('/hard-money-calculator')}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-slate-950 flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <span>Analyze Flip Deal</span>
              <ArrowRight className="size-3" />
            </button>
          </div>

          {/* Snowflake Cost */}
          <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-b from-sky-950/30 via-slate-900/60 to-slate-950 p-4.5 flex flex-col justify-between gap-3.5 shadow-sm hover:border-sky-500/50 transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
                <Server className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-100 truncate">Snowflake Cost Sizer</h2>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    FinOps
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  Warehouse credit burn rate, multi-cluster autoscaling & auto-suspend savings.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('/snowflake-cost-calculator')}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <span>Size Snowflake Warehouse</span>
              <ArrowRight className="size-3" />
            </button>
          </div>

          {/* Parquet Storage & Query Savings */}
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 via-slate-900/60 to-slate-950 p-4.5 flex flex-col justify-between gap-3.5 shadow-sm hover:border-emerald-500/50 transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Zap className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-100 truncate">Parquet Cloud Savings</h2>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    S3 & Athena
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  S3 compressed storage cut & Athena / BigQuery columnar scan byte reduction.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('/parquet-storage-calculator')}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <span>Calculate Cloud Savings</span>
              <ArrowRight className="size-3" />
            </button>
          </div>

          {/* Mortgage Calculator */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/70 to-slate-950 p-4.5 flex flex-col justify-between gap-3.5 shadow-sm hover:border-slate-700 transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0">
                <Home className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-100 truncate">Mortgage Calculator</h2>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Popular
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  PITI breakdown, dynamic PMI drop-off, property taxes & annual amortization.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('/mortgage-calculator')}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-slate-700/80"
            >
              <span>Open Mortgage</span>
              <ArrowRight className="size-3" />
            </button>
          </div>

          {/* Refinance Break-Even */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/70 to-slate-950 p-4.5 flex flex-col justify-between gap-3.5 shadow-sm hover:border-slate-700 transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0">
                <RefreshCw className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-100 truncate">Refinance Break-Even</h2>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Break-Even
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  Current vs new loan, points & closing fees, monthly savings & 7-year net equity.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('/refinance-calculator')}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-slate-700/80"
            >
              <span>Evaluate Refinance</span>
              <ArrowRight className="size-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Tool Categories Tab Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('auto')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'auto'
              ? 'btn-primary shadow-sm'
              : 'text-slate-400 hover:text-slate-100 bg-slate-900/60 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Car className="size-4" />
          <span>Auto Loan Calculator</span>
        </button>

        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'personal'
              ? 'btn-primary shadow-sm'
              : 'text-slate-400 hover:text-slate-100 bg-slate-900/60 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <CreditCard className="size-4" />
          <span>Personal Loan Calculator</span>
        </button>

        <button
          onClick={() => setActiveTab('savings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'savings'
              ? 'btn-primary shadow-sm'
              : 'text-slate-400 hover:text-slate-100 bg-slate-900/60 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <TrendingUp className="size-4" />
          <span>Compound Savings & Growth</span>
        </button>

        <button
          onClick={() => setActiveTab('creditCard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'creditCard'
              ? 'btn-primary shadow-sm'
              : 'text-slate-400 hover:text-slate-100 bg-slate-900/60 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <PiggyBank className="size-4" />
          <span>Credit Card Payoff</span>
        </button>
      </div>

      {/* --- TAB 1: Auto Loan Calculator --- */}
      {activeTab === 'auto' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800/80 pb-3 flex items-center gap-2">
              <Car className="size-4 text-emerald-400" />
              Vehicle Purchase & Financing
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Vehicle Purchase Price</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    step="500"
                    min="0"
                    value={autoPrice}
                    onChange={(e) => setAutoPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-base sm:text-sm font-semibold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Cash Down Payment</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      step="500"
                      min="0"
                      value={autoDown}
                      onChange={(e) => setAutoDown(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-base sm:text-xs font-semibold outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Trade-In Allowance</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      step="500"
                      min="0"
                      value={autoTradeIn}
                      onChange={(e) => setAutoTradeIn(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-base sm:text-xs font-semibold outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Sales Tax Rate</label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      min="0"
                      max="20"
                      value={autoTaxRate}
                      onChange={(e) => setAutoTaxRate(Number(e.target.value))}
                      className="w-full pl-3 pr-7 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-base sm:text-xs font-semibold outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Interest Rate (APR)</label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.05"
                      min="0"
                      max="30"
                      value={autoRate}
                      onChange={(e) => setAutoRate(Number(e.target.value))}
                      className="w-full pl-3 pr-7 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-base sm:text-xs font-semibold outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Loan Term (Months)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[36, 48, 60, 72].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setAutoTerm(m)}
                      className={`py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        autoTerm === m
                          ? 'btn-primary shadow-sm'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      {m} Mo ({m / 12} Yrs)
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Estimated Monthly Auto Payment
              </span>
              <div className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight mt-1">
                {fmt(autoResult.monthlyPayment)}
                <span className="text-sm font-normal text-slate-400 ml-1.5">/month</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 block">Total Financed Principal</span>
                <span className="text-lg font-bold text-slate-100 font-mono">
                  {fmt(autoResult.financedAmount)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 block">Estimated Sales Tax</span>
                <span className="text-lg font-bold text-slate-100 font-mono">
                  {fmt(autoResult.salesTaxAmount)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 block">Total Interest Over Loan</span>
                <span className="text-lg font-bold text-indigo-400 font-mono">
                  {fmt(autoResult.totalInterest)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 block">Total Vehicle Cost</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
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
          <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800/80 pb-3 flex items-center gap-2">
              <CreditCard className="size-4 text-indigo-400" />
              Personal Installment Loan
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Loan Amount</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    step="500"
                    min="500"
                    value={personalAmount}
                    onChange={(e) => setPersonalAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-base sm:text-sm font-semibold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Interest Rate (APR)</label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      min="0"
                      max="36"
                      value={personalRate}
                      onChange={(e) => setPersonalRate(Number(e.target.value))}
                      className="w-full pl-3 pr-7 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-base sm:text-xs font-semibold outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Loan Term</label>
                  <select
                    value={personalTerm}
                    onChange={(e) => setPersonalTerm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-base sm:text-xs font-semibold outline-none cursor-pointer"
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

          <div className="lg:col-span-6 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Estimated Monthly Payment
              </span>
              <div className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight mt-1">
                {fmt(personalResult.monthlyPayment)}
                <span className="text-sm font-normal text-slate-400 ml-1.5">/month</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 block">Total Loan Principal</span>
                <span className="text-lg font-bold text-slate-100 font-mono">
                  {fmt(personalAmount)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 block">Total Interest Paid</span>
                <span className="text-lg font-bold text-indigo-400 font-mono">
                  {fmt(personalResult.totalInterest)}
                </span>
              </div>

              <div className="col-span-2 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 block">Total of All Payments</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">
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
          <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800/80 pb-3 flex items-center gap-2">
              <TrendingUp className="size-4 text-emerald-400" />
              Compound Savings & Investment Plan
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Initial Starting Deposit</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    step="500"
                    min="0"
                    value={savingsInitial}
                    onChange={(e) => setSavingsInitial(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-base sm:text-sm font-semibold outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Monthly Deposit / Contribution</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    step="50"
                    min="0"
                    value={savingsMonthly}
                    onChange={(e) => setSavingsMonthly(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-base sm:text-sm font-semibold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Expected Annual Return</label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.25"
                      min="0"
                      max="25"
                      value={savingsReturn}
                      onChange={(e) => setSavingsReturn(Number(e.target.value))}
                      className="w-full pl-3 pr-7 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-base sm:text-xs font-semibold outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Investment Horizon (Years)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    step="1"
                    min="1"
                    max="50"
                    value={savingsYears}
                    onChange={(e) => setSavingsYears(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-base sm:text-xs font-semibold outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Estimated Future Balance After {savingsYears} Years
              </span>
              <div className="text-3xl sm:text-5xl font-black text-emerald-400 tracking-tight mt-1">
                {fmt(savingsResult.futureValue)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 block">Total Principal Invested</span>
                <span className="text-lg font-bold text-slate-100 font-mono">
                  {fmt(savingsResult.totalPrincipalInvested)}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {((savingsResult.totalPrincipalInvested / savingsResult.futureValue) * 100).toFixed(1)}% of final total
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 block">Total Compound Interest</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {fmt(savingsResult.totalInterestEarned)}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
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
          <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800/80 pb-3 flex items-center gap-2">
              <PiggyBank className="size-4 text-amber-400" />
              Credit Card Balance & Repayment
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Outstanding Card Balance</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    step="100"
                    min="0"
                    value={ccBalance}
                    onChange={(e) => setCcBalance(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-base sm:text-sm font-semibold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Interest Rate (APR)</label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      min="0"
                      max="40"
                      value={ccRate}
                      onChange={(e) => setCcRate(Number(e.target.value))}
                      className="w-full pl-3 pr-7 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-base sm:text-xs font-semibold outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Planned Monthly Payment</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      step="25"
                      min="10"
                      value={ccMonthlyPayment}
                      onChange={(e) => setCcMonthlyPayment(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-base sm:text-xs font-semibold outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            {ccResult.isPayoffPossible ? (
              <>
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                    Estimated Time to Debt-Free
                  </span>
                  <div className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight mt-1">
                    {ccResult.monthsToPayoff} Months
                    <span className="text-sm font-normal text-slate-400 ml-2">
                      ({ccResult.yearsToPayoff} Years)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-xs text-slate-400 block">Total Interest Paid</span>
                    <span className="text-lg font-bold text-amber-400 font-mono">
                      {fmt(ccResult.totalInterestPaid)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-xs text-slate-400 block">Total Paid Back</span>
                    <span className="text-lg font-bold text-slate-100 font-mono">
                      {fmt(ccResult.totalAmountPaid)}
                    </span>
                  </div>

                  <div className="col-span-2 p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                    <span className="text-xs text-emerald-400 font-semibold block">
                      Versus Paying Only Minimums:
                    </span>
                    <p className="text-xs text-slate-300 mt-1">
                      Paying minimums takes approx. <strong>{ccResult.minimumPaymentComparison.months} months</strong> and costs <strong>{fmt(ccResult.minimumPaymentComparison.interest)}</strong> in interest! Your fixed plan saves <strong>{fmt(Math.max(0, ccResult.minimumPaymentComparison.interest - ccResult.totalInterestPaid))}</strong>.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 text-center space-y-2">
                <span className="text-amber-400 font-bold">Monthly Payment Too Low</span>
                <p className="text-xs text-slate-400">
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
      <div className="space-y-4 pt-6 border-t border-slate-800">
        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <HelpCircle className="size-5 text-indigo-400" />
          <span>Financial Planning & Loan Questions</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-slate-200 text-sm">Are my financial numbers uploaded or stored?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              No. All calculations run 100% client-side in your browser JavaScript/Wasm sandbox. None of your loan amounts, interest rates, balances, or financial details are ever transmitted to any remote server.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-slate-200 text-sm">How does compound interest accelerate wealth building?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compound interest earns returns on both your initial principal and previous accumulated interest. Over 10+ years, exponential compounding typically exceeds total direct deposits, significantly accelerating net worth growth.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-slate-200 text-sm">What is the difference between APR and interest rate?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              The nominal interest rate is the base cost of borrowing the principal. APR (Annual Percentage Rate) includes additional upfront lender fees, origination points, and documentation costs, reflecting the true annualized borrowing expense.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-slate-200 text-sm">Can I export loan schedules into Microsoft Excel?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
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

import { useEffect } from 'react';
import {
  Building,
  Hammer,
  Scale,
  Home,
  RefreshCw,
  DollarSign,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { AdSlot } from '../components/AdSlot';
import { AiDealCopilot } from '../components/AiDealCopilot';
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Top Value Proposition Hero Section (Natural Language First) */}
      <div className="space-y-6 pt-1 sm:pt-3">
        <div className="text-center max-w-3xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-200/80 text-indigo-700 shadow-2xs">
            <Sparkles className="size-3.5 text-indigo-600 animate-pulse" />
            <span>Natural Language Financial Copilot · 0ms Client-Side Math</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Describe Any Deal. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
              We'll Calculate It Instantly.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Skip tedious 20-field forms. Paste broker emails, MLS listings, or napkin notes — TableView extracts parameters, fills missing assumptions with PMMS® benchmarks, and opens fully modeled calculators in 0ms.
          </p>

          {/* Trust & Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-1 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>100% In-Browser Privacy</span>
            </div>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <Zap className="size-4 text-amber-500" />
              <span>Zero-Latency Math</span>
            </div>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-indigo-600" />
              <span>Freddie Mac PMMS® Benchmarks</span>
            </div>
          </div>
        </div>

        {/* AI Deal Copilot Workbench (Hero Centerpiece) */}
        <AiDealCopilot />
      </div>

      {/* Featured Flagship Real Estate, Lending & Advisory Calculators (Bottom Card Menu) */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Specialized Underwriting & Financial Calculators
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct spreadsheet inputs, cash flow waterfalls, and amortization schedules.
            </p>
          </div>
          <span className="hidden sm:inline-block text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Excel (.xlsx) Export Supported
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Cap Rate & Rental Property Cash Flow */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex flex-col justify-between gap-3.5 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                <Building className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 truncate">Cap Rate & Cash Flow</h3>
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

          {/* 2. DSCR Loan */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex flex-col justify-between gap-3.5 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                <Building className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 truncate">DSCR Loan Calculator</h3>
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

          {/* 3. Hard Money */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex flex-col justify-between gap-3.5 shadow-xs hover:border-amber-300 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                <Hammer className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 truncate">Hard Money & Flip</h3>
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

          {/* 4. Commercial Real Estate Loan */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex flex-col justify-between gap-3.5 shadow-xs hover:border-cyan-300 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center shrink-0">
                <Building className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 truncate">Commercial Loan</h3>
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

          {/* 5. Section 1031 Exchange Tax Deferral */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex flex-col justify-between gap-3.5 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                <Scale className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 truncate">1031 Exchange Tax</h3>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Tax Deferral
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-snug">
                  Capital gains tax deferral, recognized boot, basis calculations & replacement debt.
                </p>
              </div>
            </div>
            <button
              onMouseEnter={() => preloadRoute('/section-1031-exchange-calculator')}
              onFocus={() => preloadRoute('/section-1031-exchange-calculator')}
              onClick={() => navigateTo('/section-1031-exchange-calculator')}
              className="btn-primary w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Calculate 1031 Gain</span>
              <ArrowRight className="size-3" />
            </button>
          </div>

          {/* 6. Side-by-Side Loan Comparison */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex flex-col justify-between gap-3.5 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                <Scale className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 truncate">Loan Comparison</h3>
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

          {/* 7. Mortgage Calculator */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex flex-col justify-between gap-3.5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
                <Home className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 truncate">Mortgage Calculator</h3>
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

          {/* 8. Refinance Break-Even */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex flex-col justify-between gap-3.5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
                <RefreshCw className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 truncate">Refinance Break-Even</h3>
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

          {/* 9. Salary to Hourly Calculator */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex flex-col justify-between gap-3.5 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                <DollarSign className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 truncate">Salary to Hourly</h3>
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
              Yes. Use our standalone Cap Rate, DSCR, Hard Money, Mortgage, and Refinance tools to generate multi-year monthly amortization schedules and export formatted .xlsx spreadsheets with one click.
            </p>
          </div>
        </div>
      </div>

      {/* In-article closing ad placement */}
      <AdSlot unit="calculatorFaq" format="horizontal" />
    </div>
  );
};

export default FinanceCalculatorHub;

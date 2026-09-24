import { useEffect } from 'react';
import {
  Building,
  Hammer,
  Scale,
  Home,
  RefreshCw,
  DollarSign,
  Landmark,
  Sparkles,
  FileSpreadsheet,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { AdSlot } from '../components/AdSlot';
import { LATEST_PMMS_RATES } from '../data/pmmsRates';
import { AiDealCopilot } from '../components/AiDealCopilot';
import { updatePageMeta, navigateTo } from '../lib/router';
import { CALCULATOR_META } from '../data/routeMeta';
import { preloadRoute } from '../lib/routePreload';
import { trackUserClick } from '../lib/sentry';

/**
 * Unified calculator card definition. A single template keeps iconography,
 * badges, radii, and button styling identical across every card.
 */
const CALCULATOR_CARDS = [
  {
    icon: Building,
    title: 'Cap Rate & Cash Flow',
    badge: 'Flagship CRE',
    description:
      'Model NOI, Cap Rate, Cash-on-Cash Return, and 10-year equity building projections.',
    route: '/cap-rate-calculator',
    cta: 'Underwrite Rental Deal',
  },
  {
    icon: Building,
    title: 'DSCR Loan Calculator',
    badge: 'High ROI',
    description:
      'Rental property cash flow, debt coverage ratio tiers & 30-year amortization.',
    route: '/dscr-loan-calculator',
    cta: 'Calculate DSCR',
  },
  {
    icon: Hammer,
    title: 'Hard Money & Flip',
    badge: '70% Rule',
    description:
      'Fix & flip loan points, interest-only holding costs, MAO & net profit ROI.',
    route: '/hard-money-calculator',
    cta: 'Analyze Flip Deal',
  },
  {
    icon: Building,
    title: 'Commercial Loan',
    badge: 'Balloon',
    description:
      'CRE balloon payment at maturity, 20-30yr amortization, and interest-only periods.',
    route: '/commercial-loan-calculator',
    cta: 'Model Commercial Debt',
  },
  {
    icon: Scale,
    title: '1031 Exchange Tax',
    badge: 'Tax Deferral',
    description:
      'Capital gains tax deferral, recognized boot, basis calculations & replacement debt.',
    route: '/section-1031-exchange-calculator',
    cta: 'Calculate 1031 Gain',
  },
  {
    icon: Scale,
    title: 'Loan Comparison',
    badge: 'Side-by-Side',
    description:
      'Compare two loans head-to-head, discount points break-even, and interest savings.',
    route: '/loan-comparison-calculator',
    cta: 'Compare Loans',
  },
  {
    icon: Home,
    title: 'Mortgage Calculator',
    badge: 'Popular',
    description:
      'PITI breakdown, dynamic PMI drop-off, property taxes & annual amortization.',
    route: '/mortgage-calculator',
    cta: 'Open Mortgage',
  },
  {
    icon: RefreshCw,
    title: 'Refinance Break-Even',
    badge: 'Break-Even',
    description:
      'Current vs new loan, points & closing fees, monthly savings & 7-year net equity.',
    route: '/refinance-calculator',
    cta: 'Evaluate Refinance',
  },
  {
    icon: DollarSign,
    title: 'Salary to Hourly',
    badge: 'Payroll',
    description:
      'Convert annual salary to hourly wage, 26x bi-weekly pay, FLSA overtime & PTO value.',
    route: '/salary-to-hourly-calculator',
    cta: 'Convert Salary',
  },
];

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
      <div className="space-y-4">
        <div className="hero-band rounded-3xl px-5 py-7 sm:px-10 sm:py-9">
          <div className="relative z-10 text-center max-w-3xl mx-auto space-y-3.5">
            {/* Credential pill */}
            {/*
              The pill carries its own darker surface. It sits over the lightest
              point of the band bloom, where a translucent white pill left its
              11px labels at 3.7-4.2:1. A dark scrim guarantees the backdrop.
            */}
            <div className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-slate-950/30 border border-white/20 text-white backdrop-blur-xs">
              <Landmark className="size-3.5 text-amber-300 shrink-0" />
              <span>Institutional Underwriting Suite</span>
              <span className="text-slate-400 hidden sm:inline">|</span>
              <span className="text-amber-200">100% in-browser</span>
            </div>

            <h1 className="text-[1.85rem] leading-[1.1] sm:text-4xl lg:text-[2.9rem] font-black text-white tracking-tight">
              From broker email to
              <br className="hidden sm:block" /> <span className="text-amber-300">lender-ready model.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl mx-auto">
              Paste any deal — an MLS listing, a term sheet, a napkin note. TableView extracts the
              figures, fills the gaps with Freddie Mac PMMS® benchmarks, and opens a fully modeled
              calculator on your device.
            </p>

            {/* Primary calls to action */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <a
                href="#calculator-suite"
                onClick={() => trackUserClick('hub_explore_calculators_click')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
              >
                <span>Explore the calculators</span>
                <ArrowRight className="size-4" />
              </a>
              <a
                href="#deal-copilot"
                onClick={() => trackUserClick('hub_try_copilot_click')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm transition-colors"
              >
                <Sparkles className="size-4 text-amber-300" />
                <span>Try the AI deal copilot</span>
              </a>
            </div>


            <p className="text-[11px] text-slate-200 pt-0.5">
              Benchmark source: Freddie Mac PMMS® &amp; Mortgage News Daily ·
              <span className="text-white font-medium"> {LATEST_PMMS_RATES.asOfDate}</span>
            </p>
          </div>
        </div>

        {/* AI Deal Copilot Workbench (Hero Centerpiece) */}
        <div id="deal-copilot" className="scroll-mt-24">
          <AiDealCopilot />
        </div>

        {/*
          Proof points sit BELOW the input on purpose. The input is the primary
          action, so it belongs immediately under the headline; the supporting
          statistics read as reinforcement afterwards. Keeping them in the hero
          pushed the textarea ~195px below the fold, so the one control the page
          is built around was invisible on load.
        */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { value: '10', label: 'Institutional calculators', note: 'Mortgage to 1031 exchange' },
            { value: '9', label: 'Underwriting guides', note: 'Technical, with formulas' },
            { value: '0', label: 'Files uploaded', note: 'Nothing leaves your device' },
            { value: '100%', label: 'Local computation', note: 'Deterministic and repeatable' },
          ].map((stat) => (
            <div key={stat.label} className="hero-stat rounded-xl px-4 py-3">
              <div className="text-2xl font-black font-mono text-indigo-700 tracking-tight leading-none">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-slate-800 mt-1.5 leading-snug">{stat.label}</div>
              <div className="text-[11px] text-slate-500 leading-snug mt-0.5">{stat.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Flagship Real Estate, Lending & Advisory Calculators (Bottom Card Menu) */}
      <div id="calculator-suite" className="space-y-5 pt-10 scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-700 block mb-1.5">
              Calculator Suite
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Ten institutional underwriting models
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Full amortization schedules, cash-flow waterfalls, sensitivity analysis and Excel export — no
              paywall, no account.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <FileSpreadsheet className="size-3.5" />
            Excel (.xlsx) export
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CALCULATOR_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.route}
                className="rounded-lg border border-slate-200 bg-white p-4.5 flex flex-col justify-between gap-3.5 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{card.title}</h3>
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {card.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-snug">{card.description}</p>
                  </div>
                </div>
                <button
                  onMouseEnter={() => preloadRoute(card.route)}
                  onFocus={() => preloadRoute(card.route)}
                  onClick={() => {
                    trackUserClick('hub_calculator_card_click', {
                      title: card.title,
                      route: card.route,
                    });
                    navigateTo(card.route);
                  }}
                  className="btn-primary w-full py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>{card.cta}</span>
                  <ArrowRight className="size-3" />
                </button>
              </div>
            );
          })}
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

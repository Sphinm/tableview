import {
  Building,
  Home,
  ArrowRightLeft,
  Hammer,
  Scale,
  DollarSign,
  Server,
  PiggyBank,
  ArrowRight
} from 'lucide-react';
import { navigateTo } from '../lib/router';

export const FinancialBentoGrid = () => {
  const realEstateTools = [
    {
      path: '/dscr-loan-calculator',
      title: 'DSCR Loan Calculator',
      badge: 'Investor Favorite',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: Building,
      iconColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description:
        'Calculate Debt Service Coverage Ratio (DSCR), maximum qualifying loan amount, and net rental cash flow without personal W-2 income verification.',
      metrics: ['DSCR Ratio (NOI / Debt)', 'BiggerPockets Pro Alt', 'Instant .xlsx Export']
    },
    {
      path: '/commercial-loan-calculator',
      title: 'Commercial CRE Loan & Balloon Calculator',
      badge: 'Underwriting Tier',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      icon: Building,
      iconColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      description:
        'Underwrite commercial mortgages with 5, 7, or 10-year balloon maturities, custom amortization periods (up to 30 years), and interest-only phases.',
      metrics: ['Balloon Balance at Maturity', 'LTV & Debt Yield', 'Commercial Deal Sheet']
    },
    {
      path: '/section-1031-exchange-calculator',
      title: '1031 Exchange Tax Deferral Calculator',
      badge: 'IRC §1031',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      icon: Scale,
      iconColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      description:
        'Calculate realized capital gain, cash boot, mortgage boot, deferred taxable gain, and track strict 45-day identification and 180-day exchange deadlines.',
      metrics: ['Boot & Capital Gains Tax', '45/180-Day Timeline', 'Reinvestment Targets']
    },
    {
      path: '/loan-comparison-calculator',
      title: 'Loan Comparison & Points Analyzer',
      badge: 'Side-by-Side',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      icon: ArrowRightLeft,
      iconColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      description:
        'Compare two loan scenarios side-by-side. Calculate exact monthly savings, lifetime interest differentials, and discount point break-even months.',
      metrics: ['Discount Points Break-Even', 'Lifetime Interest Delta', 'Dual Amortization Matrix']
    },
    {
      path: '/mortgage-calculator',
      title: 'Residential Mortgage & Amortization',
      badge: 'High-Precision',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      icon: Home,
      iconColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      description:
        'Full P&I loan modeling with automated PMI cancellation at 80% LTV, property tax, homeowners insurance, HOA, and accelerated extra principal payoff schedules.',
      metrics: ['PMI 80% Dropoff Engine', 'Extra Monthly Payoff', 'Bi-Weekly Schedule']
    },
    {
      path: '/refinance-calculator',
      title: 'Mortgage Refinance Break-Even Calculator',
      badge: 'Equity Guard',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      icon: ArrowRightLeft,
      iconColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      description:
        'Analyze refinance viability with closing cost recovery months, net cumulative savings, and critical warnings against resetting the 30-year interest clock.',
      metrics: ['Net Break-Even Months', 'Reset Clock Warning', 'Closing Cost Roll-In']
    },
    {
      path: '/hard-money-calculator',
      title: 'Hard Money & Fix-and-Flip Calculator',
      badge: '70% Rule MAO',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      icon: Hammer,
      iconColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      description:
        'Calculate lender points, interest-only monthly holding costs, Maximum Allowable Offer (MAO) using the 70% rule, net flip profit, and annualized ROI.',
      metrics: ['70% Rule MAO', 'Points & Holding Costs', 'Annualized Flip ROI']
    }
  ];

  const payrollAndFinOpsTools = [
    {
      path: '/salary-to-hourly-calculator',
      title: 'Salary to Hourly & Wage Matrix',
      badge: 'Payroll Engine',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: DollarSign,
      iconColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description:
        'Convert salary to exact hourly, daily, bi-weekly, and monthly rates. Model 1.5x FLSA overtime, PTO value, and explore 10 dedicated programmatic wage benchmarks.',
      metrics: ['FLSA 1.5x Overtime', '26x Bi-Weekly Paycheck', 'PTO & Holiday Value']
    },
    {
      path: '/snowflake-cost-calculator',
      title: 'Snowflake Warehouse Cost Calculator',
      badge: 'FinOps Sizing',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      icon: Server,
      iconColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      description:
        'Estimate Snowflake monthly credit consumption, multi-cluster warehouse autoscaling, storage tiers, and compute savings from aggressive auto-suspend policies.',
      metrics: ['Credit Sizing (XS to 6X)', 'Multi-Cluster Scaling', 'Auto-Suspend FinOps']
    },
    {
      path: '/parquet-storage-calculator',
      title: 'Parquet Cloud Storage & Query Savings',
      badge: 'Cloud Optimization',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      icon: PiggyBank,
      iconColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      description:
        'Calculate storage cost reduction and AWS Athena / Google BigQuery scan savings achieved by migrating raw CSV or JSON data to Snappy-compressed Apache Parquet.',
      metrics: ['80%+ Storage Reduction', 'Athena Scan Savings', 'AWS S3 Tier Analysis']
    }
  ];

  return (
    <section id="calculators-matrix" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Section 1: Real Estate & Commercial Debt */}
      <div className="mb-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 mb-2">
              <Building className="size-3" />
              <span>Real Estate & Institutional Debt</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight [text-wrap:balance]">
              Commercial Debt, Mortgages & Property Underwriting
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl [text-wrap:pretty]">
              Full-featured client-side underwriting models with real amortization schedules, points analysis, and 1-click Excel deal sheets.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">7 Instruments Available</span>
        </div>

        {/* Bento Grid: Real Estate */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {realEstateTools.map((calc) => (
            <div
              key={calc.path}
              onClick={() => navigateTo(calc.path)}
              className="group cursor-pointer p-[1px] rounded-2xl bg-gradient-to-b from-slate-800/80 via-slate-800/40 to-slate-900/90 hover:from-indigo-500/40 hover:via-slate-700/60 hover:to-indigo-500/20 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 shadow-sm hover:shadow-lg hover:shadow-indigo-950/20"
            >
              <div className="rounded-[calc(1rem-1px)] p-5 sm:p-6 bg-slate-950/95 group-hover:bg-slate-900/90 h-full flex flex-col justify-between transition-colors">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className={`size-10 rounded-xl border flex items-center justify-center shrink-0 ${calc.iconColor}`}>
                      <calc.icon className="size-5" />
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${calc.badgeColor}`}>
                      {calc.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors mb-2">
                    {calc.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {calc.description}
                  </p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-900 group-hover:border-slate-800 transition-colors mb-4">
                    {calc.metrics.map((metric) => (
                      <span
                        key={metric}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 border border-slate-800/80"
                      >
                        {metric}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                    <span>Launch Modeler</span>
                    <span className="size-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-500 group-hover:text-white transition-all duration-200">
                      <ArrowRight className="size-3" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Payroll, Compensation & Cloud FinOps */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 mb-2">
              <DollarSign className="size-3" />
              <span>Compensation & FinOps Analytics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight [text-wrap:balance]">
              Payroll Matrices & Cloud Infrastructure Sizing
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl [text-wrap:pretty]">
              High-intent salary conversion matrices and cloud data warehouse consumption models running in client RAM.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">3 Models Available</span>
        </div>

        {/* Bento Grid: Payroll & FinOps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {payrollAndFinOpsTools.map((calc) => (
            <div
              key={calc.path}
              onClick={() => navigateTo(calc.path)}
              className="group cursor-pointer p-[1px] rounded-2xl bg-gradient-to-b from-slate-800/80 via-slate-800/40 to-slate-900/90 hover:from-emerald-500/40 hover:via-slate-700/60 hover:to-emerald-500/20 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 shadow-sm hover:shadow-lg hover:shadow-emerald-950/20"
            >
              <div className="rounded-[calc(1rem-1px)] p-5 sm:p-6 bg-slate-950/95 group-hover:bg-slate-900/90 h-full flex flex-col justify-between transition-colors">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className={`size-10 rounded-xl border flex items-center justify-center shrink-0 ${calc.iconColor}`}>
                      <calc.icon className="size-5" />
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${calc.badgeColor}`}>
                      {calc.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-300 transition-colors mb-2">
                    {calc.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {calc.description}
                  </p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-900 group-hover:border-slate-800 transition-colors mb-4">
                    {calc.metrics.map((metric) => (
                      <span
                        key={metric}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 border border-slate-800/80"
                      >
                        {metric}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
                    <span>Launch Modeler</span>
                    <span className="size-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-emerald-600 group-hover:border-emerald-500 group-hover:text-white transition-all duration-200">
                      <ArrowRight className="size-3" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

import { ShieldCheck, Layers, Sparkles, ArrowRight, Building, Scale, Calculator } from 'lucide-react';
import { navigateTo } from '../lib/router';

export const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-slate-800">
      {/* Header */}
      <div className="mb-12 pb-8 border-b border-slate-200 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 mb-4 shadow-2xs">
          <Sparkles className="size-3.5 text-indigo-600" />
          <span>Institutional-Grade Financial & Underwriting Suite</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          About TableView Underwriting
        </h1>
        <p className="text-base sm:text-lg text-slate-800 leading-relaxed max-w-2xl">
          TableView is an institutional real estate and debt modeling suite built for real estate investors, mortgage brokers, acquisitions analysts, and private lenders. Underwrite DSCR loans, BRRRR cycles, rental property cap rates, IRC §1031 tax exchanges, and commercial mortgages—running 100% privately in your browser tab.
        </p>
      </div>

      {/* Problem & Solution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="p-6 rounded-2xl bg-red-50/70 border border-red-200 shadow-2xs">
          <h3 className="text-base font-bold text-red-900 mb-2">The Industry Standard: Paywalls & Privacy Leaks</h3>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
            Real estate investors and loan sponsors are routinely forced into two frustrating compromises: pay expensive $390/year subscriptions (like BiggerPockets Pro) just to export basic loan dossiers, or use free broker portals that harvest proprietary deal numbers, property addresses, and client financials to sell as leads to high-pressure lenders.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-2xs">
          <h3 className="text-base font-bold text-emerald-900 mb-2">The TableView Way: 100% Private & Open</h3>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
            All analytical modeling, amortization schedules, and risk assessment engines execute strictly inside your local browser memory. Zero sensitive deal data touches remote servers. Zero paywalls, zero telemetry, and instant one-click lender-ready Excel and PDF dossier exports.
          </p>
        </div>
      </div>

      {/* Underwriting Engines Deep Dive */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2.5">
          <Layers className="size-6 text-indigo-600" />
          Underwriting Engines & Mathematical Standards
        </h2>
        
        <div className="space-y-4 text-sm leading-relaxed text-slate-800">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-4">
            <div className="size-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0">
              <Building className="size-5" />
            </div>
            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-1">Commercial Debt & DSCR Underwriting</h4>
              <p className="text-xs sm:text-sm text-slate-800">
                Accurately computes Net Operating Income (NOI), Debt Service Coverage Ratio (DSCR), Debt Yield, and Maximum Allowable Offer (MAO). Models interest-only structures, balloon payoffs at 5/7/10-year maturities, and multi-tiered qualification criteria (Tier 1 Prime, Tier 2 Standard, and sub-1.0x warnings).
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-4">
            <div className="size-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
              <Scale className="size-5" />
            </div>
            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-1">IRS IRC §1031 Tax Deferral & Timeline Engine</h4>
              <p className="text-xs sm:text-sm text-slate-800">
                Implements statutory Treasury regulations for like-kind property exchanges. Calculates realized capital gain, cash boot, mortgage debt relief boot, and exact statutory 45-day identification and 180-day exchange completion deadlines with weekend/holiday rollover compliance.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-4">
            <div className="size-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
              <Calculator className="size-5" />
            </div>
            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-1">CFPB TRID Compliance & Amortization Precision</h4>
              <p className="text-xs sm:text-sm text-slate-800">
                Residential mortgage algorithms match Consumer Financial Protection Bureau (CFPB) Loan Estimate rules, calculating 5-year paid metrics, Total Interest Percentage (TIP), Fannie Mae PMI automatic cancellation at 78% LTV, and accelerated bi-weekly payment savings.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Principles */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2.5">
          <ShieldCheck className="size-6 text-indigo-600" />
          Our Core Principles
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs sm:text-sm">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <h4 className="text-slate-900 font-bold mb-2">1. Client Privacy First</h4>
            <p className="text-slate-800">
              Your deal financials, client incomes, and underwriting assumptions never leave your browser. Even if your internet disconnects, calculations continue running locally.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <h4 className="text-slate-900 font-bold mb-2">2. Institutional Rigor</h4>
            <p className="text-slate-800">
              Every formula adheres to statutory federal guidelines: IRS Code §1031, CFPB TRID rules, Fannie Mae LLPA schedules, and standard commercial banking conventions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <h4 className="text-slate-900 font-bold mb-2">3. Zero Paywalls</h4>
            <p className="text-slate-800">
              Professional-grade real estate analysis should be accessible without credit cards or monthly software subscriptions. Export full Excel models and PDF reports freely.
            </p>
          </div>
        </div>
      </div>

      {/* Editorial & Methodology Standards */}
      <div className="mb-16 p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 mb-2">Methodology & Professional Disclosure</h3>
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed mb-3">
          Our financial calculators, debt models, and underwriting guides are authored and maintained by experienced quantitative analysts, real estate investors, and commercial debt practitioners. All algorithms are audited against secondary market guidelines and federal statutory requirements.
        </p>
        <p className="text-xs text-slate-700 leading-relaxed">
          TableView provides financial modeling for educational and underwriting evaluation purposes. While our models match commercial banking ledgers with zero-roundoff precision, users should verify transaction specifics with licensed mortgage professionals, CPAs, or attorneys.
        </p>
      </div>

      {/* CTA Section */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Ready to Underwrite Your Next Deal?</h3>
          <p className="text-xs sm:text-sm text-slate-800 max-w-lg">
            Explore our complete suite of institutional calculators or test our AI Deal Copilot with your transaction parameters.
          </p>
        </div>
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('/');
          }}
          className="btn-primary px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors shrink-0 cursor-pointer"
        >
          <span>Launch Underwriting Hub</span>
          <ArrowRight className="size-3.5" />
        </a>
      </div>

    </div>
  );
};

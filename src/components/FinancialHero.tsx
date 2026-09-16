import { ArrowRight, ShieldCheck, Zap, Lock, Calculator, Database } from 'lucide-react';
import { navigateTo } from '../lib/router';

interface FinancialHeroProps {
  onExploreClick?: () => void;
}

export const FinancialHero = ({ onExploreClick }: FinancialHeroProps) => {
  const modelingDomains = [
    'Commercial Loans & CRE Balloons',
    'DSCR Investor Debt Service',
    'IRC §1031 Tax Deferral',
    'Mortgage & Extra Payments',
    'Refinance Break-Even',
    'Hard Money & 70% Rule MAO',
    'Salary to Hourly Matrix',
    'Cloud FinOps Sizing'
  ];

  const handleExplore = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      const el = document.getElementById('calculators-matrix');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Ambient background glow mesh */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[840px] h-[440px] bg-gradient-to-tr from-indigo-100/70 via-slate-100/50 to-emerald-100/60 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Hero Header Area */}
      <section className="pt-12 pb-8 md:pt-16 md:pb-12 text-center max-w-4xl mx-auto px-4 sm:px-6">
        {/* Version / Trust badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-medium tracking-wide bg-white border border-slate-200 text-slate-700 shadow-2xs mb-6">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>100% In-Browser Privacy · Institutional Math · Zero Server Uploads</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] [text-wrap:balance] mb-5">
          The 100% Private In-Browser{' '}
          <span className="bg-gradient-to-r from-emerald-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
            Financial & Commercial Modeling
          </span>{' '}
          Engine
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto mb-7 [text-wrap:pretty]">
          Institutional-grade debt modeling, commercial real estate underwriting, IRC §1031 tax deferral, and payroll analytics running 100% client-side in WebAssembly with instant Excel exports.
        </p>

        {/* Modeling Focus Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-8 max-w-3xl mx-auto">
          {modelingDomains.map((domain) => (
            <span
              key={domain}
              className="px-3 py-1 rounded-lg text-xs font-mono font-medium bg-white text-slate-700 border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors"
            >
              {domain}
            </span>
          ))}
        </div>

        {/* Primary CTAs with Button-in-Button Island Architecture */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
          <button
            type="button"
            onClick={handleExplore}
            className="group w-full sm:w-auto pl-6 pr-3.5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-3 shadow-md shadow-slate-900/10 active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <span>Explore All 10+ Calculators</span>
            <span className="size-7 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center text-white transition-transform duration-200 group-hover:scale-105">
              <Calculator className="size-3.5" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('/data-tools')}
            className="group w-full sm:w-auto pl-5 pr-3 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-900 font-medium text-sm flex items-center justify-center gap-3 border border-slate-200 hover:border-slate-300 shadow-xs active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Database className="size-4 text-emerald-600" />
              <span>Open Data Workbench</span>
            </span>
            <span className="size-7 rounded-full bg-slate-100 border border-slate-200 group-hover:bg-slate-200 flex items-center justify-center text-slate-600 group-hover:text-slate-900 transition-all duration-200 group-hover:translate-x-0.5">
              <ArrowRight className="size-3.5" />
            </span>
          </button>
        </div>

        {/* Institutional Trust Badges Row */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
            <span>0 Bytes Uploaded (100% Local RAM)</span>
          </div>
          <div className="hidden sm:inline-block text-slate-300">·</div>
          <div className="flex items-center gap-1.5 text-indigo-700 font-medium">
            <Zap className="size-4 shrink-0 text-indigo-600" />
            <span>Instant WebAssembly Amortization</span>
          </div>
          <div className="hidden sm:inline-block text-slate-300">·</div>
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Lock className="size-3.5 shrink-0 text-slate-500" />
            <span>SEC & IRS Rule Compliant Math</span>
          </div>
        </div>
      </section>
    </div>
  );
};

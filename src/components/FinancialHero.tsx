import { ArrowRight, ShieldCheck, Zap, Lock, Calculator, Database } from 'lucide-react';
import { navigateTo } from '../lib/router';

interface FinancialHeroProps {
  onExploreClick?: () => void;
}

export const FinancialHero = ({ onExploreClick }: FinancialHeroProps) => {
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-slate-100 border border-slate-300 text-slate-900 shadow-2xs mb-6">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span>100% In-Browser Privacy · Institutional Math · Zero Server Uploads</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] [text-wrap:balance] mb-5">
          The Private In-Browser Financial & Commercial Modeling Engine
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-800 leading-relaxed max-w-2xl mx-auto mb-8 [text-wrap:pretty]">
          Institutional-grade debt modeling, commercial real estate underwriting, IRC §1031 tax deferral, and payroll analytics running 100% client-side with instant Excel exports.
        </p>

        {/* Primary CTAs with Restrained, Standard Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
          <button
            type="button"
            onClick={handleExplore}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all cursor-pointer"
          >
            <Calculator className="size-4" />
            <span>Explore All 10+ Calculators</span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('/data-tools')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-300 shadow-2xs active:scale-[0.99] transition-all cursor-pointer"
          >
            <Database className="size-4 text-slate-700" />
            <span>Open Data Workbench</span>
            <ArrowRight className="size-3.5 text-slate-700" />
          </button>
        </div>

        {/* Institutional Trust Badges Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-900">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
            <span>0 Bytes Uploaded · 100% Local RAM</span>
          </div>
          <span className="hidden sm:inline text-slate-400">·</span>
          <div className="flex items-center gap-1.5">
            <Zap className="size-4 text-indigo-600 shrink-0" />
            <span>Instant Client-Side Computation</span>
          </div>
          <span className="hidden sm:inline text-slate-400">·</span>
          <div className="flex items-center gap-1.5">
            <Lock className="size-3.5 text-slate-700 shrink-0" />
            <span>SEC & IRS Rule Compliant Math</span>
          </div>
        </div>
      </section>
    </div>
  );
};

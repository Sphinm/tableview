import { ArrowRight, ShieldCheck, Zap, Video, Calculator, Database, Sparkles, Image as ImageIcon } from 'lucide-react';
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
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[920px] h-[480px] bg-gradient-to-tr from-blue-100/60 via-indigo-100/50 to-emerald-100/50 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Hero Header Area */}
      <section className="pt-12 pb-8 md:pt-16 md:pb-12 text-center max-w-4xl mx-auto px-4 sm:px-6">
        {/* Version / Trust badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-900 shadow-xs mb-6">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px] tracking-wide uppercase text-slate-700 font-bold">100% Client-Side</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">Zero Server Uploads · Wasm Speed · Private & Free</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] [text-wrap:balance] mb-5">
          The Private In-Browser Suite for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Media, Data & Finance</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8 [text-wrap:pretty]">
          Compress gigabyte videos & batch images at Wasm speed without quality loss. Run DuckDB SQL queries on massive Parquet files, and model commercial real estate debt — completely inside your browser.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <button
            type="button"
            onClick={() => navigateTo('/video-compressor')}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer"
          >
            <Video className="size-4 text-white" />
            <span>Compress Video</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/30 text-indigo-100 font-bold">Wasm</span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('/image-compressor')}
            className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-200 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
          >
            <ImageIcon className="size-4 text-emerald-600" />
            <span>Compress Images</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">Batch</span>
          </button>

          <button
            type="button"
            onClick={handleExplore}
            className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-200 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
          >
            <Calculator className="size-4 text-indigo-600" />
            <span>Calculators</span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('/data-tools')}
            className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-200 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
          >
            <Database className="size-4 text-purple-600" />
            <span>Data Tools</span>
            <ArrowRight className="size-3.5 text-slate-400" />
          </button>
        </div>

        {/* Institutional Trust Badges Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
            <span>0 Bytes Uploaded · 100% Local Device</span>
          </div>
          <span className="hidden sm:inline text-slate-300">·</span>
          <div className="flex items-center gap-1.5">
            <Zap className="size-4 text-indigo-600 shrink-0" />
            <span>Instant Client-Side Computation</span>
          </div>
          <span className="hidden sm:inline text-slate-300">·</span>
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-4 text-amber-500 shrink-0" />
            <span>30 Free Monthly Cloud Credits</span>
          </div>
        </div>
      </section>
    </div>
  );
};

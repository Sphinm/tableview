import { useRef } from 'react';
import { Sparkles, FolderOpen, ShieldCheck, ArrowRight, RefreshCw, Zap, Lock } from 'lucide-react';
import { ToolGrid } from './ToolGrid';

interface HeroSectionProps {
  onFileSelected: (file: File) => void;
  onTrySample: () => void;
  isLoading: boolean;
  loadingStatus: string;
}

export const HeroSection = ({
  onFileSelected,
  onTrySample,
  isLoading,
  loadingStatus
}: HeroSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = [
    'CSV & TSV',
    'Excel (.xlsx / .xls)',
    'Apache Parquet',
    'JSON & NDJSON',
    'DuckDB SQL',
    'Commercial Loans & Mortgages',
    'Payroll & Wage Models'
  ];

  return (
    <div className="relative w-full overflow-hidden">
      {/* Ambient background glow mesh */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-600/10 via-indigo-600/10 to-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Hidden file input for general file selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".parquet,.csv,.tsv,.json,.jsonl,.ndjson,.xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onFileSelected(e.target.files[0]);
            e.target.value = '';
          }
        }}
      />

      {/* Hero Header Area (iLovePDF Style) */}
      <section className="pt-12 pb-6 md:pt-16 md:pb-8 text-center max-w-4xl mx-auto px-4 sm:px-6">
        {/* Version / Trust badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-medium tracking-wide bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-2xs mb-6">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>100% In-Browser Privacy · DuckDB-Wasm SIMD Engine · Zero Server Uploads</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] [text-wrap:balance] mb-5">
          The 100% Private In-Browser{' '}
          <span className="bg-gradient-to-r from-emerald-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
            Spreadsheet & Analytical Modeling
          </span>{' '}
          Engine
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto mb-7 [text-wrap:pretty]">
          Fast, zero-server-egress workspace for inspecting CSV, Excel, Parquet, and JSON, running DuckDB SQL analytics, and modeling commercial loans, mortgages, and payroll directly in browser memory.
        </p>

        {/* Supported Formats Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-8">
          {supportedFormats.map((format) => (
            <span
              key={format}
              className="px-3 py-1 rounded-lg text-xs font-mono font-medium bg-white text-slate-700 border border-slate-200 shadow-2xs"
            >
              {format}
            </span>
          ))}
        </div>

        {/* Primary CTAs with Button-in-Button Island Architecture */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="group w-full sm:w-auto pl-6 pr-3.5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer"
          >
            <span>Select Local Data File</span>
            <span className="size-7 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center text-white transition-transform duration-200 group-hover:scale-105">
              <FolderOpen className="size-3.5" />
            </span>
          </button>

          <button
            onClick={onTrySample}
            disabled={isLoading}
            title={isLoading ? loadingStatus : 'Generate 1,000-row sample dataset in memory'}
            className="group w-full sm:w-auto pl-5 pr-3 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-900 font-medium text-sm flex items-center justify-center gap-3 border border-slate-200 hover:border-slate-300 shadow-xs active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                <span>{loadingStatus}</span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-2">
                  <Sparkles className="size-4 text-amber-500" />
                  <span>Try 1-Click Sample Dataset</span>
                </span>
                <span className="size-7 rounded-full bg-slate-100 border border-slate-200 group-hover:bg-slate-200 flex items-center justify-center text-slate-600 group-hover:text-slate-900 transition-all duration-200 group-hover:translate-x-0.5">
                  <ArrowRight className="size-3.5" />
                </span>
              </>
            )}
          </button>
        </div>

        {/* Trust Badges Row */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="size-4 shrink-0" />
            <span>0 Bytes Uploaded (100% Local RAM)</span>
          </div>
          <div className="hidden sm:inline-block text-slate-700">·</div>
          <div className="flex items-center gap-1.5 text-indigo-300 font-medium">
            <Zap className="size-4 shrink-0 text-indigo-400" />
            <span>Instant WebAssembly SIMD</span>
          </div>
          <div className="hidden sm:inline-block text-slate-700">·</div>
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Lock className="size-3.5 shrink-0 text-slate-400" />
            <span>Works Offline After First Load</span>
          </div>
        </div>
      </section>

      {/* The Core iLovePDF-Style Small Block Entry Grid */}
      <ToolGrid onFileSelected={onFileSelected} isLoading={isLoading} />
    </div>
  );
};


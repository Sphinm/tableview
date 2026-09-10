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
    'Calculators & FinOps'
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-slate-900/90 border border-slate-800 text-slate-300 shadow-sm mb-6">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>100% In-Browser Privacy · DuckDB-Wasm SIMD Engine · Zero Server Uploads</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-100 tracking-tight leading-[1.15] mb-5">
          Every tool you need to{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            view, query & convert
          </span>{' '}
          data files
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto mb-7">
          Fast, 100% private in-browser viewers, converters, and SQL workbench for CSV, Excel, Parquet, and JSON. Runs entirely in local browser WebAssembly memory with zero cloud file uploads.
        </p>

        {/* Supported Formats Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-8">
          {supportedFormats.map((format) => (
            <span
              key={format}
              className="px-3 py-1 rounded-lg text-xs font-mono font-medium bg-slate-900/80 text-slate-300 border border-slate-800 shadow-xs"
            >
              {format}
            </span>
          ))}
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <FolderOpen className="size-4.5" />
            <span>Select Local Data File</span>
          </button>

          <button
            onClick={onTrySample}
            disabled={isLoading}
            title={isLoading ? loadingStatus : 'Generate 1,000-row sample dataset in memory'}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-slate-100 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-800 hover:border-slate-700 shadow-sm transition-all cursor-pointer disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                <span>{loadingStatus}</span>
              </>
            ) : (
              <>
                <Sparkles className="size-4 text-amber-400" />
                <span>Try 1-Click Sample Dataset</span>
                <ArrowRight className="size-3.5 opacity-70" />
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
            <span>Works 100% Offline</span>
          </div>
        </div>
      </section>

      {/* The Core iLovePDF-Style Small Block Entry Grid */}
      <ToolGrid onFileSelected={onFileSelected} isLoading={isLoading} />
    </div>
  );
};


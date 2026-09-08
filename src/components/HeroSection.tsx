import { useRef } from 'react';
import { Sparkles, FolderOpen, ShieldCheck, ArrowRight } from 'lucide-react';
import { ProductShell } from './ProductShell';

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
    'Apache Parquet',
    'DuckDB SQL',
    'Excel (.xlsx)',
    'CSV & TSV',
    'GeoParquet',
    'JSON Lines'
  ];

  return (
    <section className="relative w-full pt-10 pb-16 md:pt-14 md:pb-24 overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept=".parquet,.csv,.tsv,.json,.jsonl,.ndjson"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) onFileSelected(e.target.files[0]);
        }}
      />

      {/* Ambient background glow mesh */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/15 to-pink-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Version badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-800/80 text-indigo-300 shadow-sm">
              <span className="size-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>DuckDB-Wasm Engine · 100% Client-Side Sandbox</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              In-Browser Parquet & SQL Workbench.{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Zero Setup. 100% Private.
              </span>
            </h1>

            {/* Lead Description */}
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Open, inspect schemas, execute vectorized DuckDB SQL queries, and convert complex columnar files to formatted Microsoft Excel (.xlsx) directly inside your browser. No Python environment required. Zero server uploads.
            </p>

            {/* Supported Formats Pills */}
            <div className="pt-1">
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2.5">
                Supported Formats & Engines
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5">
                {supportedFormats.map((format) => (
                  <span
                    key={format}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-900/80 text-slate-300 border border-slate-800"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={onTrySample}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="size-4 text-indigo-200" />
                <span>{isLoading ? loadingStatus : 'Try 1-Click Sample Dataset'}</span>
                <ArrowRight className="size-3.5 opacity-80" />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                <FolderOpen className="size-4 text-slate-400" />
                <span>Select Local File</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 flex items-center justify-center lg:justify-start gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-400 shrink-0" />
              <span>Files never leave your computer. Drag and drop any .parquet or .csv file here.</span>
            </p>

            {/* Stat Counters */}
            <div className="pt-6 border-t border-slate-900 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-white">0s</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono mt-0.5">Setup Time</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">0 Bytes</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono mt-0.5">Server Upload</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-indigo-400">100%</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono mt-0.5">Offline Ready</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Product Shell */}
          <div className="lg:col-span-6 relative">
            <ProductShell
              onFileSelected={onFileSelected}
              onTrySample={onTrySample}
              isLoading={isLoading}
              loadingStatus={loadingStatus}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { UploadCloud, FileSpreadsheet, Lock, Zap, Sparkles } from 'lucide-react';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  onTrySample: () => void;
  isLoading: boolean;
  loadingStatus?: string;
}

export const DropZone = ({
  onFileSelected,
  onTrySample,
  isLoading,
  loadingStatus = 'Initializing engine...'
}: DropZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero title & intro */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs mb-4">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>DuckDB WebAssembly · In-Browser SQL & Exporter</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Open & Convert Parquet Files{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Privately
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Drop any <code className="text-indigo-300 font-mono text-sm bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-900">.parquet</code>,{' '}
          <code className="text-indigo-300 font-mono text-sm bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-900">.csv</code> or{' '}
          <code className="text-indigo-300 font-mono text-sm bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-900">.json</code> file to preview rows, inspect schemas, and export directly to native <strong className="text-slate-200">Excel (.xlsx)</strong> or CSV.
        </p>
      </div>

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative group rounded-3xl border-2 border-dashed transition-all duration-200 p-8 sm:p-12 text-center cursor-pointer overflow-hidden ${
          isDragOver
            ? 'border-indigo-400 bg-indigo-950/30 scale-[1.01] shadow-2xl shadow-indigo-500/10'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/70'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".parquet,.geoparquet,.csv,.tsv,.json,.jsonl,.ndjson"
          className="hidden"
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="size-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <p className="text-base font-medium text-slate-200">{loadingStatus}</p>
            <p className="text-xs text-slate-400">Loading DuckDB Wasm and indexing column pages...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto size-16 rounded-2xl bg-gradient-to-b from-indigo-500/10 to-indigo-500/20 border border-indigo-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UploadCloud className="size-8 text-indigo-400" />
            </div>

            <div>
              <p className="text-lg font-semibold text-white">
                Drag and drop your file here, or{' '}
                <span className="text-indigo-400 underline underline-offset-4 group-hover:text-indigo-300">
                  browse files
                </span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports Apache Parquet (.parquet), CSV, TSV, JSON, JSON Lines. Fast even with large files.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTrySample();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-800/80 shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <Sparkles className="size-3.5 text-indigo-400" />
                No file ready? Try 1,000-Row Sample Dataset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Trust & Feature Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 shrink-0">
            <Lock className="size-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-200">100% In-Browser Privacy</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Your files never touch our servers. Execution happens on your local CPU via WebAssembly.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-950/60 text-indigo-400 border border-indigo-800/40 shrink-0">
            <FileSpreadsheet className="size-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Convert to Excel & CSV</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Export directly to native Microsoft Excel (.xlsx) or CSV with accurate column types and headers.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-purple-950/60 text-purple-400 border border-purple-800/40 shrink-0">
            <Zap className="size-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Instant SQL Workbench</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Run lightning-fast DuckDB SQL queries with aggregates, filters, and schema inspection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

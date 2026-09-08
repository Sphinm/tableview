import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { UploadCloud, Sparkles, FolderOpen, ShieldCheck } from 'lucide-react';
import { type ToolConfig } from '../data/tools';
import { navigateTo } from '../lib/router';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  onTrySample: () => void;
  isLoading: boolean;
  loadingStatus?: string;
  toolConfig?: ToolConfig;
}

export const DropZone = ({
  onFileSelected,
  onTrySample,
  isLoading,
  loadingStatus = 'Initializing engine...',
  toolConfig
}: DropZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeToolSlug = toolConfig?.slug;

  const quickTools = [
    { slug: '', name: 'All-in-One', path: '/' },
    { slug: 'parquet-viewer', name: 'Parquet Viewer', path: '/parquet-viewer' },
    { slug: 'parquet-to-excel', name: 'Parquet to Excel', path: '/parquet-to-excel' },
    { slug: 'parquet-to-csv', name: 'Parquet to CSV', path: '/parquet-to-csv' },
    { slug: 'csv-to-parquet', name: 'CSV to Parquet', path: '/csv-to-parquet' },
    { slug: 'parquet-schema-inspector', name: 'Schema Inspector', path: '/parquet-schema-inspector' }
  ];

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
    <div className="relative w-full max-w-5xl mx-auto px-4 pt-10 pb-16">
      {/* Ambient background glow for high-end dark theme */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[600px] h-[350px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-medium mb-5 shadow-sm">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toolConfig?.badge || 'In-Browser DuckDB-Wasm · 100% Client-Side Privacy'}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-5">
          {toolConfig ? (
            <>
              {toolConfig.h1} <span className="text-indigo-400">{toolConfig.h1Highlight}</span>
            </>
          ) : (
            <>
              The In-Browser <span className="text-indigo-400">Parquet Workbench</span>
            </>
          )}
        </h1>

        <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
          {toolConfig?.subtitle ||
            'Open, inspect schemas, query with DuckDB SQL, and convert Parquet, CSV & JSON to Excel. Runs entirely in your local browser memory with zero server uploads.'}
        </p>
      </div>

      {/* Main Workbench Window Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Window Titlebar & Integrated Tool Navigation */}
        <div className="border-b border-slate-800/80 bg-slate-950/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* macOS window control dots */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-red-500/80" />
            <span className="size-2.5 rounded-full bg-amber-500/80" />
            <span className="size-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-[11px] font-mono text-slate-400 ml-2">tableview-workbench</span>
          </div>

          {/* Integrated Tool Selector Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto py-0.5">
            {quickTools.map(tool => {
              const isActive = (!activeToolSlug && tool.slug === '') || activeToolSlug === tool.slug;
              return (
                <button
                  key={tool.slug}
                  onClick={() => navigateTo(tool.path)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {tool.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Drop Zone Area */}
        <div className="p-4 sm:p-8">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className={`relative rounded-xl border-2 border-dashed transition-all duration-200 p-8 sm:p-14 text-center cursor-pointer overflow-hidden ${
              isDragOver
                ? 'border-indigo-400 bg-indigo-950/30 scale-[1.005] shadow-2xl shadow-indigo-500/10'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/70'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={toolConfig?.acceptExtensions || '.parquet,.geoparquet,.csv,.tsv,.json,.jsonl,.ndjson'}
              className="hidden"
              disabled={isLoading}
            />

            {isLoading ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-4">
                <div className="size-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <p className="text-base font-semibold text-white">{loadingStatus}</p>
                <p className="text-xs text-slate-400">Loading DuckDB-Wasm engine and indexing pages...</p>
              </div>
            ) : (
              <div className="space-y-5 max-w-xl mx-auto">
                <div className="mx-auto size-14 rounded-2xl bg-indigo-950/70 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm">
                  <UploadCloud className="size-7" />
                </div>

                <div>
                  <p className="text-lg font-bold text-white tracking-tight">
                    Drag and drop your file here, or{' '}
                    <span className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">
                      browse
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {toolConfig?.acceptLabel ||
                      'Supports Apache Parquet (.parquet), GeoParquet, CSV, TSV, JSON, JSON Lines'}
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    <FolderOpen className="size-4" />
                    Choose Local File
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTrySample();
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 shadow-sm transition-all cursor-pointer"
                  >
                    <Sparkles className="size-3.5 text-indigo-400" />
                    Try 1,000-Row Sample
                  </button>
                </div>

                {/* Supported Format Badges */}
                <div className="pt-3 flex items-center justify-center gap-2 flex-wrap">
                  {['.parquet', '.geoparquet', '.csv', '.tsv', '.json', '.jsonl'].map(ext => (
                    <span
                      key={ext}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900/80 text-slate-400 border border-slate-800"
                    >
                      {ext}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Workbench Bottom Bar with Privacy Assurance */}
        <div className="border-t border-slate-800/80 bg-slate-950/60 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <ShieldCheck className="size-4 shrink-0" />
            <span>100% In-Browser Privacy: Files never leave your local device memory</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Powered by DuckDB-Wasm v1.1.3
          </div>
        </div>
      </div>
    </div>
  );
};

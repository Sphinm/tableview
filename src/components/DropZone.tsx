import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { UploadCloud, Sparkles, FolderOpen, ShieldCheck, ArrowLeft } from 'lucide-react';
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
    { slug: '', name: 'All Tools', path: '/' },
    { slug: 'csv-viewer', name: 'CSV Viewer', path: '/csv-viewer' },
    { slug: 'csv-to-excel', name: 'CSV to Excel', path: '/csv-to-excel' },
    { slug: 'excel-viewer', name: 'Excel Viewer', path: '/excel-viewer' },
    { slug: 'parquet-viewer', name: 'Parquet Viewer', path: '/parquet-viewer' },
    { slug: 'parquet-to-excel', name: 'Parquet to Excel', path: '/parquet-to-excel' },
    { slug: 'parquet-to-csv', name: 'Parquet to CSV', path: '/parquet-to-csv' },
    { slug: 'csv-to-parquet', name: 'CSV to Parquet', path: '/csv-to-parquet' },
    { slug: 'excel-to-csv', name: 'Excel to CSV', path: '/excel-to-csv' },
    { slug: 'sql-workbench', name: 'SQL Workbench', path: '/sql-workbench' }
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
      e.target.value = '';
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 pt-10 pb-16">
      {/* Ambient background glow for high-end dark theme */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[600px] h-[350px] bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="flex items-center justify-center mb-4">
          <button
            onClick={() => navigateTo('/')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer px-3 py-1 rounded-lg hover:bg-slate-800/60"
          >
            <ArrowLeft className="size-3.5" />
            <span>← Back to All Tools</span>
          </button>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-xs sm:text-sm font-medium mb-5 shadow-sm">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toolConfig?.badge || 'In-Browser DuckDB-Wasm · 100% Client-Side Privacy'}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-100 tracking-tight leading-[1.1] mb-5">
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

        <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
          {toolConfig?.subtitle ||
            'Open, inspect schemas, query with DuckDB SQL, and convert Parquet, CSV & JSON to Excel. Runs entirely in your local browser memory with zero server uploads.'}
        </p>
      </div>

      {/* Main Workbench Window Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Window Titlebar & Integrated Tool Navigation */}
        <div className="border-b border-slate-800/80 bg-slate-950/60 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* macOS window control dots */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-red-500/80" />
            <span className="size-2.5 rounded-full bg-amber-500/80" />
            <span className="size-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-xs font-mono text-slate-400 ml-2">tableview-workbench</span>
          </div>

          {/* Integrated Tool Selector Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto py-0.5">
            {quickTools.map(tool => {
              const isActive = (!activeToolSlug && tool.slug === '') || activeToolSlug === tool.slug;
              return (
                <button
                  key={tool.slug}
                  onClick={() => navigateTo(tool.path)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-950 font-semibold shadow-sm border border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700/80'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
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
              accept={toolConfig?.acceptExtensions || '.parquet,.geoparquet,.csv,.tsv,.json,.jsonl,.ndjson,.xlsx,.xls'}
              className="hidden"
              disabled={isLoading}
            />

            {isLoading ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-4">
                <div className="size-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <p className="text-lg font-semibold text-slate-100">{loadingStatus}</p>
                <p className="text-sm text-slate-400">Loading DuckDB-Wasm engine and indexing pages...</p>
              </div>
            ) : (
              <div className="space-y-6 max-w-xl mx-auto">
                <div className="mx-auto size-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shadow-sm">
                  <UploadCloud className="size-8" />
                </div>

                <div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                    Drag and drop your file here, or{' '}
                    <span className="text-slate-200 underline underline-offset-4 hover:text-slate-100">
                      browse
                    </span>
                  </p>
                  <p className="text-sm text-slate-400 mt-2">
                    {toolConfig?.acceptLabel ||
                      'Supports Apache Parquet (.parquet), GeoParquet, CSV, TSV, JSON, Excel (.xlsx)'}
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="btn-primary inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
                  >
                    <FolderOpen className="size-4.5" />
                    Choose Local File
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTrySample();
                    }}
                    className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold text-slate-200 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 shadow-sm transition-all cursor-pointer"
                  >
                    <Sparkles className="size-4 text-amber-400" />
                    Try 1,000-Row Sample
                  </button>
                </div>

                {/* Supported Format Badges */}
                <div className="pt-3 flex items-center justify-center gap-2 flex-wrap">
                  {(toolConfig?.acceptExtensions.split(',') || ['.parquet', '.geoparquet', '.csv', '.tsv', '.json', '.xlsx']).map(ext => (
                    <span
                      key={ext}
                      className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-900/80 text-slate-300 border border-slate-800"
                    >
                      {ext.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Workbench Bottom Bar with Privacy Assurance */}
        <div className="border-t border-slate-800/80 bg-slate-950/60 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-slate-400">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <ShieldCheck className="size-4.5 shrink-0" />
            <span>100% In-Browser Privacy: Files never leave your local device memory</span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Powered by DuckDB-Wasm v1.1.3
          </div>
        </div>
      </div>
    </div>
  );
};

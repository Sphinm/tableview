import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { UploadCloud, FolderOpen, ShieldCheck, ArrowLeft } from 'lucide-react';
import { type ToolConfig } from '../data/tools';
import { navigateTo } from '../lib/router';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  onTrySample?: () => void;
  isLoading: boolean;
  loadingStatus?: string;
  toolConfig?: ToolConfig;
}

export const DropZone = ({
  onFileSelected,
  onTrySample: _onTrySample,
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
    { slug: 'sql-workbench', name: 'SQL Workbench', path: '/sql-workbench' },
    { slug: 'finance-calculator', name: 'Calculators', path: '/finance-calculator' }
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
      {/* Ambient background glow for light theme */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[600px] h-[350px] bg-gradient-to-b from-indigo-100/60 via-slate-100/40 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="flex items-center justify-center mb-4">
          <button
            onClick={() => navigateTo('/')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-900 hover:underline transition-colors cursor-pointer px-3 py-1 rounded-lg hover:bg-slate-100 font-semibold"
          >
            <ArrowLeft className="size-3.5 text-slate-700" />
            <span>← Back to All Tools</span>
          </button>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold mb-5 shadow-2xs">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{toolConfig?.badge || 'In-Browser DuckDB-Wasm · 100% Client-Side Privacy'}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-5">
          {toolConfig ? (
            <>
              {toolConfig.h1} <span className="text-indigo-600">{toolConfig.h1Highlight}</span>
            </>
          ) : (
            <>
              The In-Browser <span className="text-indigo-600">Data Workspace</span>
            </>
          )}
        </h1>

        <p className="text-lg sm:text-xl text-slate-800 leading-relaxed max-w-2xl mx-auto">
          {toolConfig?.subtitle ||
            'Open, inspect schemas, query with DuckDB SQL, and convert Parquet, CSV, Excel & JSON. Runs entirely in your local browser memory with zero server uploads.'}
        </p>
      </div>

      {/* Main Workbench Window Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        {/* Window Titlebar & Integrated Tool Navigation */}
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* macOS window control dots */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-400" />
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="size-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono text-slate-700 font-medium ml-2">tableview-workbench</span>
          </div>

          {/* Integrated Tool Selector Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto py-0.5">
            {quickTools.map(tool => {
              const isActive = (!activeToolSlug && tool.slug === '') || activeToolSlug === tool.slug;
              return (
                <button
                  key={tool.slug}
                  onClick={() => navigateTo(tool.path)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 font-bold shadow-2xs border border-slate-200'
                      : 'text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {tool.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Drop Zone Area */}
        <div className="p-4 sm:p-8 bg-slate-50/40">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 p-8 sm:p-14 text-center cursor-pointer overflow-hidden ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-50/50 scale-[1.005] shadow-lg shadow-indigo-500/10'
                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60 shadow-2xs'
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
                <div className="size-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                <p className="text-lg font-semibold text-slate-900">{loadingStatus}</p>
                <p className="text-sm text-slate-500">Loading DuckDB-Wasm engine and indexing pages...</p>
              </div>
            ) : (
              <div className="space-y-6 max-w-xl mx-auto">
                <div className="mx-auto size-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
                  <UploadCloud className="size-8" />
                </div>

                <div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Drag and drop your file here, or{' '}
                    <span className="text-indigo-600 underline underline-offset-4 hover:text-indigo-700">
                      browse
                    </span>
                  </p>
                  <p className="text-sm text-slate-700 font-medium mt-2">
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
                    className="inline-flex items-center gap-2.5 pl-5 pr-3.5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Choose Local File</span>
                    <span className="p-1 rounded-lg bg-white/15 text-white">
                      <FolderOpen className="size-4" />
                    </span>
                  </button>
                </div>

                {/* Supported Format Badges */}
                <div className="pt-3 flex items-center justify-center gap-2 flex-wrap">
                  {(toolConfig?.acceptExtensions.split(',') || ['.parquet', '.geoparquet', '.csv', '.tsv', '.json', '.xlsx']).map(ext => (
                    <span
                      key={ext}
                      className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-slate-100 text-slate-800 border border-slate-300"
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
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-slate-500">
          <div className="flex items-center gap-2 text-emerald-700 font-medium">
            <ShieldCheck className="size-4.5 shrink-0 text-emerald-600" />
            <span>100% In-Browser Privacy: Files never leave your local device memory</span>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Powered by DuckDB-Wasm v1.1.3
          </div>
        </div>
      </div>
    </div>
  );
};

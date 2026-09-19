import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { UploadCloud, FolderOpen, ShieldCheck } from 'lucide-react';
import { type ToolConfig } from '../data/tools';
import { analytics } from '../lib/analytics';

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
      const file = e.dataTransfer.files[0];
      analytics.fileDropped({ name: file.name, size: file.size });
      onFileSelected(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      analytics.fileDropped({ name: file.name, size: file.size });
      onFileSelected(file);
      e.target.value = '';
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 pt-6 pb-12">
      {/* Ambient background glow for light theme */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[600px] h-[300px] bg-gradient-to-b from-indigo-100/50 via-slate-100/30 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold mb-4 shadow-2xs">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{toolConfig?.badge || 'DuckDB-Wasm · In-Browser Privacy'}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15] mb-3">
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

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {toolConfig?.subtitle ||
            'Open, inspect schemas, query with DuckDB SQL, and convert Parquet, CSV, Excel & JSON. Runs entirely in your local browser memory with zero server uploads.'}
        </p>
      </div>

      {/* Main Workbench Window Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Window Titlebar */}
        <div className="border-b border-slate-200/80 bg-slate-50 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-rose-400" />
              <span className="size-2.5 rounded-full bg-amber-400" />
              <span className="size-2.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-xs font-mono text-slate-500 font-medium ml-1">
              tableview-workbench ~ {toolConfig?.shortTitle || 'local-session'}
            </span>
          </div>

          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            RAM Execution
          </span>
        </div>

        {/* Drop Zone Area */}
        <div className="p-4 sm:p-8 bg-slate-50/30">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 p-8 sm:p-12 text-center cursor-pointer overflow-hidden ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-50/50 scale-[1.005] shadow-lg shadow-indigo-500/10'
                : 'border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50/50 shadow-2xs'
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
                <p className="text-xs text-slate-500">Loading DuckDB-Wasm engine and indexing pages...</p>
              </div>
            ) : (
              <div className="space-y-5 max-w-xl mx-auto">
                <div className="mx-auto size-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
                  <UploadCloud className="size-7" />
                </div>

                <div>
                  <p className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    Drag and drop your file here, or{' '}
                    <span className="text-indigo-600 underline underline-offset-4 hover:text-indigo-700">
                      browse
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-1.5">
                    {toolConfig?.acceptLabel ||
                      'Supports Apache Parquet (.parquet), GeoParquet, CSV, TSV, JSON, Excel (.xlsx)'}
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-2 pl-4 pr-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Choose Local File</span>
                    <span className="p-1 rounded-lg bg-white/15 text-white">
                      <FolderOpen className="size-3.5" />
                    </span>
                  </button>
                </div>

                {/* Supported Format Badges */}
                <div className="pt-2 flex items-center justify-center gap-1.5 flex-wrap">
                  {(toolConfig?.acceptExtensions.split(',') || ['.parquet', '.geoparquet', '.csv', '.tsv', '.json', '.xlsx']).map(ext => (
                    <span
                      key={ext}
                      className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200"
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
        <div className="border-t border-slate-200/80 bg-slate-50 px-5 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
            <span>100% In-Browser Privacy: Files never leave your local device memory</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Powered by DuckDB-Wasm
          </div>
        </div>
      </div>
    </div>
  );
};

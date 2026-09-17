import React, { useState, useEffect, useRef } from 'react';
import {
  FileSpreadsheet,
  Database,
  ArrowRightLeft,
  ArrowRight,
  Download,
  UploadCloud,
  Check,
  RefreshCw,
  Sparkles,
  Table,
  FileCode,
  Zap,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { PageHeader } from '../components/calculator-kit/PageHeader';
import { AdSlot } from '../components/AdSlot';
import { updatePageMeta } from '../lib/router';
import { DATA_CONVERTER_META } from '../data/routeMeta';
import {
  loadFileIntoDuckDB,
  generateSampleParquet,
  exportToParquet,
  exportToExcel,
  exportToCsv,
  exportToJson,
  queryTablePreview,
  type ColumnSchema
} from '../lib/duckdb';

type DataFormat = 'auto' | 'csv' | 'excel' | 'parquet' | 'json';
type TargetFormat = 'parquet' | 'excel' | 'csv' | 'json';

interface ConversionPreset {
  id: string;
  source: DataFormat;
  target: TargetFormat;
  label: string;
  badge: string;
  desc: string;
}

const CONVERSION_PRESETS: ConversionPreset[] = [
  {
    id: 'csv-to-parquet',
    source: 'csv',
    target: 'parquet',
    label: 'CSV ➔ Parquet',
    badge: 'Save ~90%',
    desc: 'Shrink bulky text spreadsheets into query-ready columnar Parquet with ZSTD compression.'
  },
  {
    id: 'parquet-to-excel',
    source: 'parquet',
    target: 'excel',
    label: 'Parquet ➔ Excel',
    badge: 'Office .xlsx',
    desc: 'Convert binary Apache Parquet datasets into clean Microsoft Excel spreadsheets.'
  },
  {
    id: 'csv-to-excel',
    source: 'csv',
    target: 'excel',
    label: 'CSV ➔ Excel',
    badge: 'Formatted',
    desc: 'Format comma-separated plain text into genuine native Excel workbooks.'
  },
  {
    id: 'parquet-to-csv',
    source: 'parquet',
    target: 'csv',
    label: 'Parquet ➔ CSV',
    badge: 'Universal',
    desc: 'Extract columnar Parquet records into universal comma-delimited text.'
  },
  {
    id: 'excel-to-parquet',
    source: 'excel',
    target: 'parquet',
    label: 'Excel ➔ Parquet',
    badge: 'Big Data',
    desc: 'Transform Excel sheets into high-speed compressed Parquet for cloud lakes & DuckDB.'
  },
  {
    id: 'json-to-csv',
    source: 'json',
    target: 'csv',
    label: 'JSON ➔ CSV / Excel',
    badge: 'Flatten',
    desc: 'Flatten nested REST API responses and JSON dumps into tabular rows.'
  }
];

export const DataConverter: React.FC = () => {
  useEffect(() => {
    updatePageMeta(
      DATA_CONVERTER_META.title,
      DATA_CONVERTER_META.description,
      DATA_CONVERTER_META.canonical,
      [
        {
          '@type': 'WebApplication',
          name: DATA_CONVERTER_META.title,
          description: DATA_CONVERTER_META.description,
          url: 'https://tableview.dev/data-converter',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Any'
        }
      ]
    );
  }, []);

  const [sourceFormat, setSourceFormat] = useState<DataFormat>('auto');
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('parquet');
  const [parquetCodec, setParquetCodec] = useState<'ZSTD' | 'SNAPPY'>('ZSTD');

  // Loaded dataset state
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<'parquet' | 'csv' | 'json' | null>(null);
  const [currentTable, setCurrentTable] = useState<string | null>(null);
  const [columns, setColumns] = useState<ColumnSchema[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, any>[]>([]);
  const [totalRowCount, setTotalRowCount] = useState<number>(0);

  // Status & Progress
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionResult, setConversionResult] = useState<{
    originalSize: number;
    convertedSize: number;
    filename: string;
    durationMs: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const processLoadedTable = async (tableName: string, fType: 'parquet' | 'csv' | 'json', name: string, size: number) => {
    try {
      setLoadingStatus('Reading table schema & preview rows in DuckDB...');
      const preview = await queryTablePreview(tableName, fType, 5);
      setCurrentTable(tableName);
      setDetectedFormat(fType);
      setFileName(name);
      setFileSize(size);
      setColumns(preview.columns);
      setPreviewRows(preview.rows);
      setTotalRowCount(preview.totalRows);
      setConversionResult(null);
      setErrorMessage(null);
    } catch (err: any) {
      console.error('Failed to preview table:', err);
      setErrorMessage(`Failed to read data preview: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  const handleFileChange = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    setConversionResult(null);
    setLoadingStatus(`Reading ${file.name} locally into in-browser DuckDB engine...`);

    try {
      const res = await loadFileIntoDuckDB(file);
      await processLoadedTable(res.tableName, res.fileType, file.name, file.size);
    } catch (err: any) {
      console.error('Failed to load file for conversion:', err);
      setErrorMessage(`Could not parse file: ${err?.message || 'Unknown error'}. Please ensure the file is valid.`);
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  const handleTrySample = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setConversionResult(null);
    setLoadingStatus('Generating 1,000-row sample e-commerce transactions in memory...');

    try {
      const res = await generateSampleParquet('ecommerce');
      await processLoadedTable(res.tableName, res.fileType, 'sample_ecommerce_orders.csv', 84200);
    } catch (err: any) {
      console.error('Failed to generate sample dataset:', err);
      setErrorMessage(`Could not generate sample: ${err?.message || 'Unknown error'}`);
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  const handleConvert = async () => {
    if (!currentTable || !detectedFormat) return;

    setIsConverting(true);
    setErrorMessage(null);
    const start = performance.now();

    try {
      let exportStats: { size: number; filename: string };

      if (targetFormat === 'parquet') {
        exportStats = await exportToParquet(currentTable, detectedFormat, parquetCodec);
      } else if (targetFormat === 'excel') {
        exportStats = await exportToExcel(currentTable, detectedFormat);
      } else if (targetFormat === 'csv') {
        exportStats = await exportToCsv(currentTable, detectedFormat);
      } else {
        exportStats = await exportToJson(currentTable, detectedFormat);
      }

      const durationMs = Math.round(performance.now() - start);
      setConversionResult({
        originalSize: fileSize || 80000,
        convertedSize: exportStats.size,
        filename: exportStats.filename,
        durationMs
      });
    } catch (err: any) {
      console.error('Conversion failed:', err);
      setErrorMessage(`Conversion failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsConverting(false);
    }
  };

  const handleReset = () => {
    setCurrentTable(null);
    setFileName(null);
    setFileSize(null);
    setDetectedFormat(null);
    setColumns([]);
    setPreviewRows([]);
    setTotalRowCount(0);
    setConversionResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Data Workbench', path: '/data-tools' },
          { label: 'Universal Data Converter' }
        ]}
        badge={{
          label: 'DuckDB-Wasm · 100% Client-Side Privacy',
          tone: 'emerald'
        }}
        title="Universal In-Browser Data Converter"
        titleHighlight="Client-Side"
        description="Convert datasets between Apache Parquet, Microsoft Excel (.xlsx), CSV, TSV, and JSON formats in your local browser memory with zero server uploads."
      />

      {/* Quick Conversion Presets */}
      <div className="mb-8">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
          <Sparkles className="size-3.5 text-amber-500" />
          <span>Popular Conversion Pairs</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {CONVERSION_PRESETS.map((preset) => {
            const isSelected = targetFormat === preset.target;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setSourceFormat(preset.source);
                  setTargetFormat(preset.target);
                }}
                className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-400 shadow-xs ring-1 ring-indigo-400/50'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-slate-900 truncate">{preset.label}</span>
                  </div>
                  <span className="inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-100/70 text-indigo-700">
                    {preset.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Format Selector Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Source Format */}
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <UploadCloud className="size-3.5 text-indigo-600" />
            <span>Input Format</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'auto' as const, label: 'Auto Detect' },
              { id: 'csv' as const, label: 'CSV / TSV' },
              { id: 'excel' as const, label: 'Excel (.xlsx)' },
              { id: 'parquet' as const, label: 'Parquet (.parquet)' },
              { id: 'json' as const, label: 'JSON / JSONL' }
            ].map((fmt) => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => setSourceFormat(fmt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  sourceFormat === fmt.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Direction Indicator */}
        <div className="hidden md:flex items-center justify-center size-10 rounded-2xl bg-slate-100 text-slate-500 shrink-0">
          <ArrowRight className="size-5" />
        </div>

        {/* Target Format */}
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Download className="size-3.5 text-emerald-600" />
            <span>Target Output Format</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'parquet' as const, label: 'Parquet (ZSTD / Snappy)', icon: Database },
              { id: 'excel' as const, label: 'Excel (.xlsx)', icon: Table },
              { id: 'csv' as const, label: 'CSV', icon: FileSpreadsheet },
              { id: 'json' as const, label: 'JSON', icon: FileCode }
            ].map((fmt) => {
              const Icon = fmt.icon;
              const isSelected = targetFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setTargetFormat(fmt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{fmt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Workspace: Upload or Active Preview */}
      {!currentTable ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-8 sm:p-14 text-center shadow-xs transition-all hover:border-slate-400">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
            }}
            accept=".parquet,.geoparquet,.csv,.tsv,.xlsx,.xls,.json,.ndjson,.jsonl"
            className="hidden"
          />

          <div className="size-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100">
            <ArrowRightLeft className="size-8 animate-pulse" />
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
            Drop CSV, Excel, Parquet, or JSON to Convert
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mb-6">
            All conversions run entirely in your local browser WebAssembly. Your datasets are never uploaded to any remote server.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <UploadCloud className="size-4" />
              <span>Choose File to Convert</span>
            </button>

            <button
              type="button"
              onClick={handleTrySample}
              disabled={isLoading}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Sparkles className="size-4 text-amber-500" />
              <span>⚡ Try Sample Dataset</span>
            </button>
          </div>

          {isLoading && (
            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-indigo-600">
              <RefreshCw className="size-4 animate-spin" />
              <span>{loadingStatus || 'Processing file in DuckDB memory...'}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium max-w-md mx-auto">
              {errorMessage}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active File Metadata Header */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <CheckCircle2 className="size-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                    {fileName}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                    {detectedFormat}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>Size: <strong className="text-slate-800">{fileSize ? formatBytes(fileSize) : '—'}</strong></span>
                  <span>•</span>
                  <span>Total Rows: <strong className="text-slate-800">{totalRowCount.toLocaleString()}</strong></span>
                  <span>•</span>
                  <span>Columns: <strong className="text-slate-800">{columns.length}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Choose Another File
              </button>
            </div>
          </div>

          {/* Target Output Settings & Action Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-white border border-indigo-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                <Zap className="size-3.5" />
                <span>Ready to Convert</span>
              </div>
              <h4 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Export as <span className="text-indigo-600 uppercase">{targetFormat}</span>
              </h4>
              <p className="text-xs text-slate-600 max-w-md">
                {targetFormat === 'parquet' && 'Columnar ZSTD compression generates high-speed, compact files for data lakes.'}
                {targetFormat === 'excel' && 'Native Microsoft Excel workbook (.xlsx) ready to open in Office 365 or Google Sheets.'}
                {targetFormat === 'csv' && 'Standard RFC 4180 comma-separated values compatible with all database tools.'}
                {targetFormat === 'json' && 'Structured JSON records array formatted for web apps and APIs.'}
              </p>

              {targetFormat === 'parquet' && (
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="font-semibold text-slate-700">Codec:</span>
                  {(['ZSTD', 'SNAPPY'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setParquetCodec(c)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold cursor-pointer transition-all ${
                        parquetCodec === c
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleConvert}
                disabled={isConverting}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
              >
                {isConverting ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    <span>Converting...</span>
                  </>
                ) : (
                  <>
                    <Download className="size-4" />
                    <span>Convert & Download .{targetFormat}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Post-Conversion Feedback Banner */}
          {conversionResult && (
            <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">
                    Conversion Complete! Downloaded as {conversionResult.filename}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-emerald-800 mt-0.5">
                    <span>Speed: <strong>{conversionResult.durationMs}ms</strong></span>
                    <span>•</span>
                    <span>Original: <strong>{formatBytes(conversionResult.originalSize)}</strong></span>
                    <span>➔</span>
                    <span>Converted: <strong>{formatBytes(conversionResult.convertedSize)}</strong></span>
                    {conversionResult.convertedSize < conversionResult.originalSize && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                        -{Math.round(((conversionResult.originalSize - conversionResult.convertedSize) / conversionResult.originalSize) * 100)}% Smaller
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConvert}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
              >
                Download Again
              </button>
            </div>
          )}

          {/* Compact 5-Row Data Preview */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table className="size-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-800">Dataset Preview (First 5 Rows)</span>
                <span className="text-[10px] text-slate-400 font-mono">Total {totalRowCount.toLocaleString()} rows</span>
              </div>
            </div>

            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    {columns.map((col) => (
                      <th key={col.name} className="px-3.5 py-2 font-semibold whitespace-nowrap">
                        <div>{col.name}</div>
                        <div className="text-[9px] text-slate-400 font-normal">{col.type}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {previewRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/80">
                      {columns.map((col) => {
                        const val = row[col.name];
                        const displayVal = val === null || val === undefined ? 'null' : typeof val === 'object' ? JSON.stringify(val) : String(val);
                        return (
                          <td key={col.name} className="px-3.5 py-2 whitespace-nowrap text-slate-700 max-w-xs truncate">
                            {displayVal}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Ad slot */}
      <div className="max-w-4xl mx-auto my-10">
        <AdSlot unit="workbenchLeaderboard" format="horizontal" />
      </div>

      {/* Knowledge & FAQ Section */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <div className="max-w-3xl">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
            Frequently Asked Questions & Architecture
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mb-6">
            Everything you need to know about in-browser dataset conversion.
          </p>

          <div className="space-y-4">
            {[
              {
                q: 'Are my spreadsheets or database records uploaded to a server?',
                a: 'Never. TableView executes all conversions locally inside your browser via WebAssembly (DuckDB-Wasm and SheetJS). Your data stays strictly on your physical machine.'
              },
              {
                q: 'Why convert CSV to Apache Parquet?',
                a: 'Parquet is a columnar binary format with ZSTD compression that reduces file sizes by up to 90% while accelerating analytical SQL query speeds by 10x–50x.'
              },
              {
                q: 'What is the file size limit?',
                a: 'Because conversions occur entirely in client-side RAM, the limit is governed by your browser memory. Files with hundreds of thousands of rows convert in just a few seconds.'
              },
              {
                q: 'Can I convert Parquet files to Excel (.xlsx)?',
                a: 'Yes! Parquet files cannot be opened natively by Microsoft Excel. Our converter parses Parquet columnar blocks and generates genuine XML .xlsx spreadsheets ready for Excel 2016+, Office 365, or Google Sheets.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-1.5 flex items-start gap-2">
                  <HelpCircle className="size-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

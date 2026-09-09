import { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Sparkles,
  Zap,
  HardDrive,
  ArrowRight,
  Database
} from 'lucide-react';
import {
  calculateParquetSavings,
  type ParquetSavingsInputs,
  type RawDataFormat,
  type ParquetCompressionCodec,
  type CloudProvider,
  type ParquetSavingsResult
} from '../lib/parquetSavingsCalculator';
import { updatePageMeta, navigateTo } from '../lib/router';

interface ParquetSavingsCalculatorProps {
  onTrySample?: () => void;
}

export const ParquetSavingsCalculator = ({ onTrySample: _onTrySample }: ParquetSavingsCalculatorProps) => {
  useEffect(() => {
    updatePageMeta(
      'Parquet Cloud Storage & Query Savings Calculator — AWS S3 & Athena Cost Tool | TableView.dev',
      'Calculate exact cloud bill savings by converting CSV, JSON, or text logs to Apache Parquet. Estimate AWS S3 storage reduction and Athena/BigQuery scan savings.',
      '/parquet-storage-calculator'
    );
  }, []);

  // Form State
  const [dataFormat, setDataFormat] = useState<RawDataFormat>('csv');
  const [rawSizeAmount, setRawSizeAmount] = useState<number>(25);
  const [rawSizeUnit, setRawSizeUnit] = useState<'GB' | 'TB' | 'PB'>('TB');
  const [monthlyDataGrowthPercent, setMonthlyDataGrowthPercent] = useState<number>(4);
  const [compressionCodec, setCompressionCodec] = useState<ParquetCompressionCodec>('zstd');
  const [cloudProvider, setCloudProvider] = useState<CloudProvider>('aws_s3');
  const [runsAthenaOrBigQuery, setRunsAthenaOrBigQuery] = useState<boolean>(true);
  const [queriesPerDay, setQueriesPerDay] = useState<number>(40);
  const [avgColumnsScannedPercent, setAvgColumnsScannedPercent] = useState<number>(15);
  const [queryEngine, setQueryEngine] = useState<'athena' | 'bigquery' | 'snowflake_external'>('athena');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Quick Presets
  const sizePresets = [
    { amount: 500, unit: 'GB' as const, label: '500 GB' },
    { amount: 10, unit: 'TB' as const, label: '10 TB' },
    { amount: 50, unit: 'TB' as const, label: '50 TB' },
    { amount: 250, unit: 'TB' as const, label: '250 TB' }
  ];

  const inputs: ParquetSavingsInputs = useMemo(
    () => ({
      dataFormat,
      rawSizeAmount,
      rawSizeUnit,
      monthlyDataGrowthPercent,
      compressionCodec,
      cloudProvider,
      runsAthenaOrBigQuery,
      queriesPerDay,
      avgColumnsScannedPercent,
      queryEngine
    }),
    [
      dataFormat,
      rawSizeAmount,
      rawSizeUnit,
      monthlyDataGrowthPercent,
      compressionCodec,
      cloudProvider,
      runsAthenaOrBigQuery,
      queriesPerDay,
      avgColumnsScannedPercent,
      queryEngine
    ]
  );

  const result: ParquetSavingsResult = useMemo(() => calculateParquetSavings(inputs), [inputs]);

  const currencyFmt = (n: number) =>
    n.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

  const currencyDecFmt = (n: number) =>
    n.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  const handleExportExcel = () => {
    const summaryData = [
      { Metric: 'Raw Data Format', Value: dataFormat.toUpperCase() },
      { Metric: 'Raw Data Size', Value: result.rawSizeFormatted },
      { Metric: 'Parquet Compression Codec', Value: compressionCodec.toUpperCase() },
      { Metric: 'Compressed Parquet Size', Value: result.parquetSizeFormatted },
      { Metric: 'Size Reduction Ratio', Value: `${result.compressionRatioPercent}% (${result.sizeReductionFactor}x smaller)` },
      { Metric: 'Cloud Storage Provider', Value: cloudProvider.replace('_', ' ').toUpperCase() },
      { Metric: 'Monthly Raw Storage Cost', Value: result.monthlyRawStorageCost },
      { Metric: 'Monthly Parquet Storage Cost', Value: result.monthlyParquetStorageCost },
      { Metric: 'Monthly Storage Dollar Savings', Value: result.monthlyStorageSavings },
      { Metric: 'Monthly Athena / BigQuery Scan Savings', Value: result.monthlyQuerySavings },
      { Metric: 'Total Net Monthly Cloud Savings', Value: result.totalMonthlySavings },
      { Metric: 'Total Annual Cloud Bill Savings', Value: result.totalAnnualSavings },
      { Metric: '3-Year Compounded Savings', Value: result.totalThreeYearSavings }
    ];

    const worksheet = XLSX.utils.json_to_sheet(summaryData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Parquet ROI Analysis');
    XLSX.writeFile(workbook, `parquet_cloud_savings_${rawSizeAmount}${rawSizeUnit}.xlsx`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Hero Header */}
      <section className="relative pt-12 pb-8 border-b border-slate-800 bg-gradient-to-b from-indigo-950/20 via-slate-950 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-3">
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 font-semibold">
              CLOUD STORAGE & QUERY OPTIMIZER
            </span>
            <span>•</span>
            <span className="text-slate-400">AWS S3, Athena & BigQuery FinOps</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-100">
            Parquet Storage & Query <span className="text-emerald-400">Savings Calculator</span>
          </h1>

          <p className="mt-3 max-w-3xl text-sm sm:text-base text-slate-400 leading-relaxed">
            See how much your organization saves by converting uncompressed CSV, JSON, or log streams into columnar <strong>Apache Parquet (.parquet)</strong>. Cuts cloud storage by <strong>75% to 85%</strong> and Athena query scan costs by up to <strong>90%</strong>.
          </p>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 mt-6 flex-wrap">
            <span className="text-xs text-slate-400">Common Data Volumes:</span>
            {sizePresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setRawSizeAmount(preset.amount);
                  setRawSizeUnit(preset.unit);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
                  rawSizeAmount === preset.amount && rawSizeUnit === preset.unit
                    ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Calculator Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Inputs (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Database className="size-4.5 text-emerald-400" />
                <span>Dataset Specifications</span>
              </h2>

              {/* Data Format */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Current Raw Data Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['csv', 'json', 'jsonl', 'tsv', 'text_log'] as RawDataFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setDataFormat(fmt)}
                      className={`p-2 rounded-xl text-xs font-mono border transition-all cursor-pointer uppercase ${
                        dataFormat === fmt
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {fmt.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Volume Amount & Unit */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex justify-between">
                  <span>Current Raw Volume</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {rawSizeAmount} {rawSizeUnit}
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={rawSizeAmount || ''}
                    onChange={(e) => setRawSizeAmount(Math.max(0.1, Number(e.target.value)))}
                    className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <select
                    value={rawSizeUnit}
                    onChange={(e) => setRawSizeUnit(e.target.value as any)}
                    className="w-24 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none"
                  >
                    <option value="GB">GB</option>
                    <option value="TB">TB</option>
                    <option value="PB">PB</option>
                  </select>
                </div>
              </div>

              {/* Compression Codec & Cloud Provider */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Target Codec
                  </label>
                  <select
                    value={compressionCodec}
                    onChange={(e) => setCompressionCodec(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none"
                  >
                    <option value="zstd">ZSTD (Optimal)</option>
                    <option value="snappy">Snappy (Fast)</option>
                    <option value="gzip">GZIP (Legacy)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Cloud Storage
                  </label>
                  <select
                    value={cloudProvider}
                    onChange={(e) => setCloudProvider(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none"
                  >
                    <option value="aws_s3">AWS S3</option>
                    <option value="google_cloud">GCP Cloud</option>
                    <option value="azure_blob">Azure Blob</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Growth (%/mo)
                  </label>
                  <input
                    type="number"
                    value={monthlyDataGrowthPercent || ''}
                    onChange={(e) => setMonthlyDataGrowthPercent(Math.max(0, Number(e.target.value)))}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Athena / BigQuery Querying Settings */}
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pt-3 pb-3">
                <Zap className="size-4.5 text-amber-400" />
                <span>Query Engine & Scan Workload</span>
              </h2>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Querying (Athena / BigQuery)</span>
                  <span className="text-[11px] text-slate-400">Include serverless query scan cost savings</span>
                </div>
                <input
                  type="checkbox"
                  checked={runsAthenaOrBigQuery}
                  onChange={(e) => setRunsAthenaOrBigQuery(e.target.checked)}
                  className="size-4.5 rounded text-emerald-600 bg-slate-900 border-slate-700 cursor-pointer"
                />
              </div>

              {runsAthenaOrBigQuery && (
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Query Engine
                      </label>
                      <select
                        value={queryEngine}
                        onChange={(e) => setQueryEngine(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none"
                      >
                        <option value="athena">AWS Athena ($5/TB)</option>
                        <option value="bigquery">Google BigQuery ($6.25/TB)</option>
                        <option value="snowflake_external">Snowflake External Table</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Queries / Day
                      </label>
                      <input
                        type="number"
                        value={queriesPerDay || ''}
                        onChange={(e) => setQueriesPerDay(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-medium text-slate-300">
                        Avg Columns Scanned in SELECT
                      </label>
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        {avgColumnsScannedPercent}% of columns
                      </span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={60}
                      value={avgColumnsScannedPercent}
                      onChange={(e) => setAvgColumnsScannedPercent(Number(e.target.value))}
                      className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Parquet column pruning only reads queried columns, eliminating {100 - avgColumnsScannedPercent}% of data scan fees.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Savings & ROI Dashboard (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Total Annual Savings Hero Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 shadow-2xl">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                    Estimated Annual Cloud Cost Savings
                  </span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-emerald-400">
                      {currencyFmt(result.totalAnnualSavings)}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">
                      {result.compressionRatioPercent}% REDUCTION
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Monthly Savings</span>
                  <span className="text-2xl font-black font-mono text-slate-100 mt-0.5 block">
                    {currencyFmt(result.totalMonthlySavings)}/mo
                  </span>
                  <span className="text-[11px] text-slate-500">
                    3-Yr Total: {currencyFmt(result.totalThreeYearSavings)}
                  </span>
                </div>
              </div>

              {/* Visual Footprint Comparison Bar */}
              <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">
                    Raw {dataFormat.toUpperCase()}: <strong className="text-slate-200">{result.rawSizeFormatted}</strong>
                  </span>
                  <span className="text-emerald-400 font-bold">
                    Parquet {compressionCodec.toUpperCase()}: <strong>{result.parquetSizeFormatted}</strong> ({result.sizeReductionFactor}x smaller)
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex items-center px-1 text-[10px] text-slate-400">
                    <span>Raw Dataset (100%)</span>
                  </div>
                  <div
                    className="h-3 bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(6, 100 - result.compressionRatioPercent)}%` }}
                    title={`Compressed to ${100 - result.compressionRatioPercent}% of original footprint`}
                  />
                </div>
              </div>
            </div>

            {/* Savings Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-1">
                  <HardDrive className="size-4 text-indigo-400" />
                  S3 Storage Cost Savings
                </div>
                <div className="text-2xl font-black font-mono text-indigo-300">
                  {currencyFmt(result.annualStorageSavings)}/yr
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  From {currencyFmt(result.monthlyRawStorageCost)}/mo down to {currencyFmt(result.monthlyParquetStorageCost)}/mo on cloud storage.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-1">
                  <Zap className="size-4 text-amber-400" />
                  Athena / Query Scan Savings
                </div>
                <div className="text-2xl font-black font-mono text-amber-400">
                  {currencyFmt(result.annualQuerySavings)}/yr
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Eliminates unneeded row and column scans through dictionary encoding and predicate pushdown.
                </p>
              </div>
            </div>

            {/* Detailed Line Items */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
                <span>Cost Comparison: Raw vs Apache Parquet</span>
                <span className="text-xs font-mono text-emerald-400">
                  ~{result.querySpeedupFactor}x Faster Execution
                </span>
              </h3>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300">Monthly Cloud Storage (S3 / Blob)</span>
                  <div className="space-x-3 text-right">
                    <span className="text-slate-400 line-through">{currencyDecFmt(result.monthlyRawStorageCost)}</span>
                    <span className="text-emerald-400 font-bold">{currencyDecFmt(result.monthlyParquetStorageCost)}</span>
                  </div>
                </div>

                {runsAthenaOrBigQuery && (
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-300">Monthly Query Scanning Fees</span>
                    <div className="space-x-3 text-right">
                      <span className="text-slate-400 line-through">{currencyDecFmt(result.monthlyRawQueryCost)}</span>
                      <span className="text-emerald-400 font-bold">{currencyDecFmt(result.monthlyParquetQueryCost)}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 text-sm font-bold">
                  <span className="text-slate-200">Total Net Monthly Savings</span>
                  <span className="text-emerald-400">+{currencyFmt(result.totalMonthlySavings)} / month</span>
                </div>
              </div>
            </div>

            {/* Action Card: Excel Export & Share */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-xs font-semibold text-emerald-300 cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="size-4" />
                <span>Export Cloud FinOps Excel (.xlsx)</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white cursor-pointer transition-colors"
              >
                {copiedLink ? 'Link Copied!' : 'Share ROI Estimate'}
              </button>
            </div>

            {/* Direct Conversion Call to Action */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-emerald-950/80 border border-indigo-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="size-4 text-amber-400" />
                  Ready to convert your {dataFormat.toUpperCase()} to Parquet?
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Convert immediately inside your browser. Zero file upload, 100% private with DuckDB-Wasm.
                </p>
              </div>

              <button
                onClick={() => navigateTo('/csv-to-parquet')}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-lg whitespace-nowrap cursor-pointer"
              >
                <span>Convert to Parquet Now</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

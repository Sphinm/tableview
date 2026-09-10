import { useState, useMemo, useEffect } from 'react';
import {
  FileSpreadsheet,
  Sparkles,
  Zap,
  HardDrive,
  ArrowRight,
  Database,
  BookOpen,
  HelpCircle,
  ShieldCheck
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
import { MethodologyDisclosure } from '../components/MethodologyDisclosure';

const parquetSchemas = [
  {
    '@type': 'WebApplication',
    name: 'Parquet Cloud Storage & Query Savings Calculator',
    url: 'https://tableview.dev/parquet-storage-calculator',
    description: 'Calculate cloud storage and query engine bill savings when migrating from CSV/JSON to Apache Parquet across AWS S3, Athena, Google BigQuery, and Snowflake external tables.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  },
  {
    '@type': 'SoftwareApplication',
    name: 'Apache Parquet Cloud Cost Optimizer',
    description: 'Cloud FinOps analytics tool estimating columnar storage reduction, dictionary encoding gains, and Athena SQL scan cost cuts.',
    applicationCategory: 'DeveloperApplication'
  },
  {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://tableview.dev/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Cloud & FinOps Calculators',
        item: 'https://tableview.dev/parquet-storage-calculator'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Parquet Savings Calculator',
        item: 'https://tableview.dev/parquet-storage-calculator'
      }
    ]
  },
  {
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Why does Apache Parquet reduce AWS S3 storage bills by 80% to 90%?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Unlike row-based text files (CSV or JSON) where repetitive text strings are duplicated row by row, Apache Parquet organizes data in columns. Similar data types are grouped together, enabling ultra-efficient dictionary encoding, run-length encoding (RLE), bit-packing, and high-ratio compression codecs like ZSTD or Snappy.'
        }
      },
      {
        '@type': 'Question',
        name: 'How does Parquet cut Amazon Athena and Google BigQuery scanning costs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Serverless query engines like AWS Athena bill $5.00 per TB of data scanned from S3. Because Parquet is columnar, a query selecting only 3 columns from a 50-column dataset reads ONLY those 3 columns from disk (column projection), skipping 90%+ of the file bytes. Combined with min/max predicate pushdown, Athena scan bills routinely fall by 90% to 99%.'
        }
      },
      {
        '@type': 'Question',
        name: 'Which Parquet compression codec is best: Snappy, ZSTD, or GZIP?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Snappy is the cloud default: it offers blazing fast decompression speeds with ~75% size reduction, ideal for real-time streaming queries. ZSTD (level 3) is the modern gold standard: it achieves 85% to 90% compression ratios while maintaining decomp speed close to Snappy. GZIP provides maximum compression but suffers from significantly slower decompression CPU overhead.'
        }
      },
      {
        '@type': 'Question',
        name: 'What is Predicate Pushdown and Row Group Pruning?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Parquet files divide tables into Row Groups (typically 128 MB to 512 MB) and store min/max statistics for every column in the file footer metadata. When you run a query like "WHERE event_date >= \'2025-01-01\'", the query engine reads the footer and skips reading entire row groups that don\'t match the criteria, avoiding millions of bytes of I/O.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I convert large CSV or JSON files to Parquet directly in the browser?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Using TableView\'s DuckDB-Wasm in-browser converter, you can convert gigabyte-sized CSV, JSON, and NDJSON files into Snappy or ZSTD Parquet files directly inside your browser without uploading any confidential data to third-party servers.'
        }
      },
      {
        '@type': 'Question',
        name: 'How does Parquet compare to Apache ORC or Avro?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Avro is a row-oriented format optimized for write-heavy streaming message queues (Kafka). Parquet and ORC are both columnar formats optimized for analytical read queries (OLAP). Parquet has achieved universal cross-platform dominance across Spark, DuckDB, Trino, Snowflake, Databricks, ClickHouse, and AWS Athena.'
        }
      }
    ]
  }
];

interface ParquetSavingsCalculatorProps {
  onTrySample?: () => void;
}

export const ParquetSavingsCalculator = ({ onTrySample: _onTrySample }: ParquetSavingsCalculatorProps) => {
  useEffect(() => {
    updatePageMeta(
      'Parquet Cloud Storage & Query Savings Calculator — AWS S3 & Athena Cost Tool | TableView.dev',
      'Calculate exact cloud bill savings by converting CSV, JSON, or text logs to Apache Parquet. Estimate AWS S3 storage reduction and Athena/BigQuery scan savings.',
      '/parquet-storage-calculator',
      parquetSchemas
    );
  }, []);

  const getNumQuery = (name: string, fallback: number): number => {
    try {
      const p = new URLSearchParams(window.location.search).get(name);
      if (p !== null && !isNaN(Number(p)) && Number(p) > 0) return Number(p);
    } catch {}
    return fallback;
  };

  const getStringQuery = <T extends string>(name: string, fallback: T): T => {
    try {
      const p = new URLSearchParams(window.location.search).get(name);
      if (p !== null) return p as T;
    } catch {}
    return fallback;
  };

  // Form State initialized with URL query params
  const [dataFormat, setDataFormat] = useState<RawDataFormat>(() => getStringQuery('format', 'csv'));
  const [rawSizeAmount, setRawSizeAmount] = useState<number>(() => getNumQuery('size', 25));
  const [rawSizeUnit, setRawSizeUnit] = useState<'GB' | 'TB' | 'PB'>(() => getStringQuery('unit', 'TB'));
  const [monthlyDataGrowthPercent, setMonthlyDataGrowthPercent] = useState<number>(4);
  const [compressionCodec, setCompressionCodec] = useState<ParquetCompressionCodec>(() => getStringQuery('codec', 'zstd'));
  const [cloudProvider, setCloudProvider] = useState<CloudProvider>(() => getStringQuery('provider', 'aws_s3'));
  const [runsAthenaOrBigQuery, setRunsAthenaOrBigQuery] = useState<boolean>(true);
  const [queriesPerDay, setQueriesPerDay] = useState<number>(() => getNumQuery('queries', 40));
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

  const handleExportExcel = async () => {
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

    const XLSX = await import('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(summaryData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Parquet ROI Analysis');
    XLSX.writeFile(workbook, `parquet_cloud_savings_${rawSizeAmount}${rawSizeUnit}.xlsx`);
  };

  const handleCopyLink = () => {
    try {
      const params = new URLSearchParams();
      params.set('format', dataFormat);
      params.set('size', String(rawSizeAmount));
      params.set('unit', rawSizeUnit);
      params.set('codec', compressionCodec);
      params.set('provider', cloudProvider);
      params.set('queries', String(queriesPerDay));
      const fullUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', fullUrl);
      navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
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

        {/* Section 3: Architecture Deep Dive, 10 TB Benchmark Matrix & Educational Guide */}
        <div className="mt-16 pt-10 border-t border-slate-800 space-y-12">
          {/* Subsection 1: Why Parquet Saves Money */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Zap className="size-6 text-emerald-400" />
              Why Apache Parquet Cuts Cloud Storage & Query Bills by 80% to 95%
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
              Traditional data formats like CSV, TSV, and JSON store data row-by-row in plain text. When your cloud data lake grows into tens or hundreds of terabytes, row-based formats cause massive cloud spend because analytical queries scan every single character from beginning to end. Apache Parquet completely revolutionizes cloud data economics through four architectural pillars:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-400 text-xs sm:text-sm">
                  <Database className="size-4 shrink-0" />
                  <span>1. Columnar Projection</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In a table with 50 columns, running <code className="text-indigo-300 font-mono text-[11px]">SELECT user_id, amount</code> reads ONLY those 2 columns from S3. The remaining 48 columns are completely skipped on disk, slashing Athena/BigQuery scan costs by 95%.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-400 text-xs sm:text-sm">
                  <HardDrive className="size-4 shrink-0" />
                  <span>2. Dictionary Encoding</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Repeating strings (e.g. status codes, state names, browser agents) are assigned a compact integer index in a local dictionary table, collapsing gigabytes of redundant characters into tiny byte arrays.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-400 text-xs sm:text-sm">
                  <BookOpen className="size-4 shrink-0" />
                  <span>3. Predicate Pushdown</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Parquet files contain header and footer metadata recording the minimum and maximum values for each 128 MB Row Group. Query engines use these statistics to skip reading unneeded chunks entirely.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-400 text-xs sm:text-sm">
                  <Sparkles className="size-4 shrink-0" />
                  <span>4. Modern Codecs (ZSTD)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Because similar data types and values are stored contiguous to one another, compression algorithms like Zstandard (ZSTD) and Snappy achieve compression factors of 5x to 10x over raw text.
                </p>
              </div>
            </div>
          </div>

          {/* Subsection 2: 10 TB Storage & Query Scan Cost Comparison Benchmark */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="size-5 text-emerald-400" />
                  10 TB Cloud Cost Benchmark: Raw CSV vs Snappy vs ZSTD Parquet
                </h3>
                <p className="text-xs text-slate-400">Modeled with standard AWS S3 Standard ($0.023/GB) and Athena ($5.00/TB scanned) running 50 queries/day.</p>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 w-fit">
                Based on 10 TB Raw Telemetry
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-300 font-semibold">
                  <tr>
                    <th className="p-3.5">Storage Format & Codec</th>
                    <th className="p-3.5">Stored Size</th>
                    <th className="p-3.5">Monthly S3 Cost</th>
                    <th className="p-3.5">Athena Scanning Cost</th>
                    <th className="p-3.5">Total Monthly Bill</th>
                    <th className="p-3.5">Annual FinOps Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-rose-400">Raw Uncompressed CSV</td>
                    <td className="p-3.5 font-mono text-slate-200">10,000 GB (10 TB)</td>
                    <td className="p-3.5 font-mono text-slate-300">$230.00 / mo</td>
                    <td className="p-3.5 font-mono text-rose-400 font-medium">$7,500.00 / mo</td>
                    <td className="p-3.5 font-mono text-rose-400 font-bold">$7,730.00 / mo</td>
                    <td className="p-3.5 text-slate-400">Baseline ($0 saved)</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-amber-300">GZIP Compressed CSV (.csv.gz)</td>
                    <td className="p-3.5 font-mono text-slate-200">3,000 GB (3 TB)</td>
                    <td className="p-3.5 font-mono text-slate-300">$69.00 / mo</td>
                    <td className="p-3.5 font-mono text-amber-400 font-medium">$2,250.00 / mo</td>
                    <td className="p-3.5 font-mono text-amber-300 font-bold">$2,319.00 / mo</td>
                    <td className="p-3.5 text-emerald-400 font-mono font-semibold">+$64,932 / year</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-cyan-300">Parquet + Snappy (Standard)</td>
                    <td className="p-3.5 font-mono text-slate-200">2,200 GB (2.2 TB)</td>
                    <td className="p-3.5 font-mono text-slate-300">$50.60 / mo</td>
                    <td className="p-3.5 font-mono text-cyan-300 font-medium">$247.50 / mo</td>
                    <td className="p-3.5 font-mono text-cyan-300 font-bold">$298.10 / mo</td>
                    <td className="p-3.5 text-emerald-400 font-mono font-bold">+$89,182 / year</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50 bg-emerald-950/20">
                    <td className="p-3.5 font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-amber-400" />
                      <span>Parquet + ZSTD Level 3 (Recommended)</span>
                    </td>
                    <td className="p-3.5 font-mono text-emerald-300 font-bold">1,400 GB (1.4 TB)</td>
                    <td className="p-3.5 font-mono text-emerald-400">$32.20 / mo</td>
                    <td className="p-3.5 font-mono text-emerald-400 font-medium">$157.50 / mo</td>
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">$189.70 / mo</td>
                    <td className="p-3.5 text-emerald-300 font-mono font-bold">+$90,483 / year (97.5% Cut)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Subsection 3: Compression Codec Selection Guide */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                <Zap className="size-4" />
                Snappy Codec (Fastest Decompression)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Default for Apache Spark, Trino, and Hive. Prioritizes maximum CPU decompression throughput over raw ratio. Ideal for real-time streaming queries where query latency must remain below 100 milliseconds.
              </p>
              <div className="text-[11px] text-slate-400 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
                Avg Ratio: 70% – 78% reduction<br />CPU Decompression: Blazing fast
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-800/80 bg-emerald-950/10 space-y-3">
              <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <Sparkles className="size-4 text-amber-400" />
                Zstandard / ZSTD (Best Overall)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                The modern gold standard created by Meta. Provides near-GZIP compression density while retaining near-Snappy decompression speed. Supported natively across DuckDB, Snowflake, Athena, and BigQuery.
              </p>
              <div className="text-[11px] text-slate-400 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
                Avg Ratio: 85% – 92% reduction<br />CPU Decompression: Ultra balanced
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <HardDrive className="size-4" />
                GZIP Codec (Cold Archival)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Maximum bit-packing compression. However, GZIP suffers from significant CPU decompression latency and cannot be split as efficiently across threads. Recommended exclusively for write-once cold archival storage.
              </p>
              <div className="text-[11px] text-slate-400 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
                Avg Ratio: 82% – 88% reduction<br />CPU Decompression: High latency
              </div>
            </div>
          </div>

          {/* Subsection 4: Comprehensive In-Depth Parquet FAQs */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <HelpCircle className="size-5 text-emerald-400" />
              Frequently Asked Questions About Parquet Cloud Savings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-semibold text-slate-200 text-sm">Why does Apache Parquet reduce AWS S3 storage bills by 80% to 90%?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Unlike row-based text files (CSV or JSON) where repetitive text strings are duplicated row by row, Apache Parquet organizes data in columns. Similar data types are grouped together, enabling ultra-efficient dictionary encoding, run-length encoding (RLE), bit-packing, and high-ratio compression codecs like ZSTD or Snappy.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-semibold text-slate-200 text-sm">How does Parquet cut Amazon Athena and Google BigQuery scanning costs?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Serverless query engines like AWS Athena bill $5.00 per TB of data scanned from S3. Because Parquet is columnar, a query selecting only 3 columns from a 50-column dataset reads ONLY those 3 columns from disk (column projection), skipping 90%+ of the file bytes. Combined with min/max predicate pushdown, Athena scan bills routinely fall by 90% to 99%.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-semibold text-slate-200 text-sm">Which Parquet compression codec is best: Snappy, ZSTD, or GZIP?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Snappy is the cloud default: it offers blazing fast decompression speeds with ~75% size reduction, ideal for real-time streaming queries. ZSTD (level 3) is the modern gold standard: it achieves 85% to 90% compression ratios while maintaining decomp speed close to Snappy. GZIP provides maximum compression but suffers from significantly slower decompression CPU overhead.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-semibold text-slate-200 text-sm">What is Predicate Pushdown and Row Group Pruning?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Parquet files divide tables into Row Groups (typically 128 MB to 512 MB) and store min/max statistics for every column in the file footer metadata. When you run a query like "WHERE event_date &gt;= '2025-01-01'", the query engine reads the footer and skips reading entire row groups that don't match the criteria, avoiding millions of bytes of I/O.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-semibold text-slate-200 text-sm">Can I convert large CSV or JSON files to Parquet directly in the browser?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Yes! Using TableView's DuckDB-Wasm in-browser converter, you can convert gigabyte-sized CSV, JSON, and NDJSON files into Snappy or ZSTD Parquet files directly inside your browser without uploading any confidential data to third-party servers.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-semibold text-slate-200 text-sm">How does Parquet compare to Apache ORC or Avro?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Avro is a row-oriented format optimized for write-heavy streaming message queues (Kafka). Parquet and ORC are both columnar formats optimized for analytical read queries (OLAP). Parquet has achieved universal cross-platform dominance across Spark, DuckDB, Trino, Snowflake, Databricks, ClickHouse, and AWS Athena.
                </p>
              </div>
            </div>
          </div>

          {/* Methodology & FinOps Disclosure */}
          <MethodologyDisclosure type="cloud" />

          {/* Subsection 5: Related Data Engineering Tools Cross-Links */}
          <div className="pt-6 border-t border-slate-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Explore Related Parquet & Cloud FinOps Tools
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a
                href="/csv-to-parquet"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/csv-to-parquet');
                }}
                className="group p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer"
              >
                <div className="font-bold text-slate-200 text-sm group-hover:text-emerald-300 flex items-center justify-between">
                  <span>CSV to Parquet Converter</span>
                  <ArrowRight className="size-4 text-slate-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-1" />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  100% private, client-side DuckDB-Wasm converter with Snappy/ZSTD compression.
                </p>
              </a>

              <a
                href="/parquet-viewer"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/parquet-viewer');
                }}
                className="group p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer"
              >
                <div className="font-bold text-slate-200 text-sm group-hover:text-emerald-300 flex items-center justify-between">
                  <span>Online Parquet Viewer</span>
                  <ArrowRight className="size-4 text-slate-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-1" />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Inspect file schema, row groups, metadata, and execute live SQL in your browser.
                </p>
              </a>

              <a
                href="/snowflake-cost-calculator"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/snowflake-cost-calculator');
                }}
                className="group p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer"
              >
                <div className="font-bold text-slate-200 text-sm group-hover:text-emerald-300 flex items-center justify-between">
                  <span>Snowflake Cost Calculator</span>
                  <ArrowRight className="size-4 text-slate-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-1" />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Estimate warehouse sizing credits, multi-cluster autoscaling, and storage costs.
                </p>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

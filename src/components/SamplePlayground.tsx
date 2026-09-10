import { useState } from 'react';
import { ShoppingCart, TrendingUp, Server, Play, Download, Check, Sparkles } from 'lucide-react';
import type { SamplePreset } from '../lib/duckdb';

interface SamplePlaygroundProps {
  onSelectSample: (preset: SamplePreset) => void;
  isLoading?: boolean;
}

export const SamplePlayground = ({ onSelectSample, isLoading }: SamplePlaygroundProps) => {
  const [downloadingPreset, setDownloadingPreset] = useState<SamplePreset | null>(null);
  const [downloadedPreset, setDownloadedPreset] = useState<SamplePreset | null>(null);

  const handleDownload = async (preset: SamplePreset, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingPreset(preset);
    try {
      // Lazy: keeps the DuckDB engine out of the initial bundle.
      const { downloadSampleParquet } = await import('../lib/duckdb');
      await downloadSampleParquet(preset);
      setDownloadedPreset(preset);
      setTimeout(() => setDownloadedPreset(null), 2500);
    } catch (err) {
      console.error('Failed to download sample parquet:', err);
    } finally {
      setDownloadingPreset(null);
    }
  };

  const samples: {
    id: SamplePreset;
    title: string;
    subtitle: string;
    icon: any;
    rows: string;
    size: string;
    columns: string[];
    color: string;
  }[] = [
    {
      id: 'ecommerce',
      title: 'E-Commerce Transactions',
      subtitle: 'Multi-currency retail orders, customer IDs, timestamps, categories, and payment gateways.',
      icon: ShoppingCart,
      rows: '1,000 rows',
      size: '~48 KB',
      columns: ['order_id', 'amount_usd', 'currency', 'status', 'gateway', 'category'],
      color: 'indigo'
    },
    {
      id: 'financial',
      title: 'Financial Equity Trades',
      subtitle: 'Live-style exchange trade ticks with ticker symbols, execution prices, volumes, and venues.',
      icon: TrendingUp,
      rows: '1,000 rows',
      size: '~42 KB',
      columns: ['trade_id', 'ticker', 'side', 'execution_price', 'shares', 'venue', 'spread'],
      color: 'emerald'
    },
    {
      id: 'telemetry',
      title: 'Cloud Access & HTTP Logs',
      subtitle: 'API server access logs with client IPs, endpoints, HTTP status codes, and latency metrics.',
      icon: Server,
      rows: '1,000 rows',
      size: '~45 KB',
      columns: ['request_id', 'client_ip', 'endpoint', 'status_code', 'latency_ms', 'region'],
      color: 'amber'
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-700 text-slate-300 mb-3 shadow-sm">
          <Sparkles className="size-3.5 text-indigo-400" />
          <span>Interactive Data Playground</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Explore Free Sample Datasets (Parquet, CSV & SQL)
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mt-2 leading-relaxed">
          Don't have a dataset file ready? Launch realistic industry datasets directly into the DuckDB-Wasm engine to test SQL queries, schema inspection, and Excel export—or download them to test your local pipelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {samples.map((s) => {
          const Icon = s.icon;
          const isDownloading = downloadingPreset === s.id;
          const isDownloaded = downloadedPreset === s.id;

          return (
            <div
              key={s.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700">
                    <Icon className="size-5 text-indigo-400" />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    <span>{s.rows}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-300">{s.size}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-100 mb-1.5 group-hover:text-indigo-300 transition-colors">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {s.subtitle}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {s.columns.map((col) => (
                    <span
                      key={col}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800/80"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => onSelectSample(s.id)}
                  disabled={isLoading}
                  className="btn-primary py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                  title="Open and query dataset in TableView"
                >
                  <Play className="size-3 fill-current" />
                  <span>Open Live</span>
                </button>

                <button
                  onClick={(e) => handleDownload(s.id, e)}
                  disabled={isDownloading}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  title="Download .parquet file to local computer"
                >
                  {isDownloaded ? (
                    <>
                      <Check className="size-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Saved</span>
                    </>
                  ) : (
                    <>
                      <Download className="size-3.5 text-slate-400" />
                      <span>{isDownloading ? 'Exporting...' : '.parquet'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

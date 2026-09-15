import { Database, ArrowRight, ShieldCheck } from 'lucide-react';
import { navigateTo } from '../lib/router';

export const DataWorkbenchBanner = () => {
  const quickLinks = [
    { label: 'CSV Viewer', path: '/csv-viewer' },
    { label: 'Excel (.xlsx) Viewer', path: '/excel-viewer' },
    { label: 'Apache Parquet Reader', path: '/parquet-viewer' },
    { label: 'JSON Viewer & Formatter', path: '/json-formatter' },
    { label: 'DuckDB SQL Console', path: '/sql-workbench' },
    { label: 'Format Converters', path: '/data-tools' }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-12">
      <div className="p-[1px] rounded-3xl bg-gradient-to-r from-emerald-500/30 via-slate-800/80 to-cyan-500/30 shadow-xl shadow-emerald-950/10">
        <div className="rounded-[calc(1.5rem-1px)] bg-slate-950/95 p-6 sm:p-8 md:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 mb-3">
              <Database className="size-3" />
              <span>In-Browser Data Workbench & DuckDB SQL</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight leading-tight [text-wrap:balance] mb-3">
              Need to inspect, query, or convert spreadsheets & datasets?
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed [text-wrap:pretty] mb-5">
              TableView includes a full client-side data processing workspace powered by DuckDB-Wasm SIMD. Open gigabyte-scale CSVs, Excel workbooks, and Apache Parquet files directly in browser RAM with zero server egress.
            </p>

            {/* Quick format tags */}
            <div className="flex flex-wrap gap-2">
              {quickLinks.map((link) => (
                <a
                  key={link.path + link.label}
                  href={link.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo(link.path);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-emerald-400 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigateTo('/data-tools')}
              className="group pl-5 pr-3 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center gap-3 shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Launch Data Workbench</span>
              <span className="size-7 rounded-xl bg-white/15 group-hover:bg-white/25 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="size-4" />
              </span>
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              <span>0 B Uploaded · 100% Client-Side</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

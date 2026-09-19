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
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 md:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-2xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 mb-3">
            <Database className="size-3.5 text-emerald-600" />
            <span>In-Browser Data Workbench & DuckDB SQL</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug mb-2">
            Need to inspect, query, or convert spreadsheets & datasets?
          </h2>

          <p className="text-sm text-slate-800 leading-relaxed mb-5">
            TableView includes a client-side data processing workspace powered by DuckDB-Wasm. Open gigabyte-scale CSVs, Excel workbooks, and Apache Parquet files directly in browser RAM with zero server egress.
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
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-50 text-slate-900 border border-slate-300 hover:bg-slate-100 shadow-2xs transition-colors"
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
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <span>Launch Data Workbench</span>
            <ArrowRight className="size-4" />
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            <span>0 Bytes Uploaded · In-Browser Processing</span>
          </div>
        </div>
      </div>
    </section>
  );
};

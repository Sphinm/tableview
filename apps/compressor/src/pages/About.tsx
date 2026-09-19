import { Cpu, ShieldCheck, Zap, Layers, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { navigateTo } from '../lib/router';

export const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-slate-800">
      {/* Header */}
      <div className="mb-12 pb-8 border-b border-slate-200 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 mb-4 shadow-2xs">
          <Sparkles className="size-3.5" />
          <span>The Next-Generation In-Browser Data Workbench</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          About TableView.dev
        </h1>
        <p className="text-base sm:text-lg text-slate-800 leading-relaxed max-w-2xl">
          TableView.dev is a private, client-side data workspace built for data engineers, analysts, and operators: inspect, query with SQL, and convert CSV, Excel (.xlsx), Apache Parquet, and JSON files directly in your browser tab (plus run institutional-grade financial and FinOps calculations) with zero cloud uploads.
        </p>
      </div>

      {/* Problem & Solution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="p-6 rounded-2xl bg-red-50/70 border border-red-200 shadow-2xs">
          <h3 className="text-base font-bold text-red-900 mb-2">The Old Way: High Friction & Privacy Risk</h3>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
            Data practitioners had two painful choices: install bloated desktop software or configure Python virtual environments with Pandas and PyArrow, or upload sensitive financial files, customer records, and internal logs to generic "online converter" websites where confidential data is exposed to remote servers.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-2xs">
          <h3 className="text-base font-bold text-emerald-900 mb-2">The TableView Way: 100% In-Browser & Instant</h3>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
            By compiling DuckDB to WebAssembly and combining client-side financial engines, TableView brings an analytical workstation straight to your browser tab. Datasets are parsed in local RAM at near-native CPU speeds. Zero server uploads, zero telemetry, and zero installation required.
          </p>
        </div>
      </div>

      {/* Architecture Deep Dive */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2.5">
          <Layers className="size-6 text-indigo-600" />
          Under the Hood: Modern WebAssembly Stack
        </h2>
        
        <div className="space-y-4 text-sm leading-relaxed text-slate-800">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-4">
            <div className="size-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0">
              <Cpu className="size-5" />
            </div>
            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-1">DuckDB-Wasm Analytical Engine</h4>
              <p className="text-xs sm:text-sm text-slate-800">
                DuckDB is the gold standard for in-process analytical databases. Its WebAssembly compilation brings SIMD-accelerated columnar operations, dictionary decoding, and multithreaded SQL querying straight to client web workers.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-4">
            <div className="size-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
              <Lock className="size-5" />
            </div>
            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-1">Zero-Upload Privacy Sandbox</h4>
              <p className="text-xs sm:text-sm text-slate-800">
                When you drag a file into TableView, the browser creates an in-memory virtual file descriptor in the WebAssembly sandbox. HIPAA, GDPR, and enterprise confidentiality rules are fully satisfied because network traffic is non-existent.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-4">
            <div className="size-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
              <Zap className="size-5" />
            </div>
            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-1">Streaming Multi-Format Exporter</h4>
              <p className="text-xs sm:text-sm text-slate-800">
                Equipped with SheetJS and DuckDB Arrow bridges, TableView accurately converts complex columnar types (timestamps, decimals, nested structs) into standard Microsoft Excel (.xlsx) workbooks and CSV files.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Principles */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2.5">
          <ShieldCheck className="size-6 text-indigo-600" />
          Our Core Principles
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs sm:text-sm">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <h4 className="text-slate-900 font-bold mb-2">1. Privacy First</h4>
            <p className="text-slate-800">
              We never inspect, save, or log user data. If you unplug your internet connection, the app continues functioning seamlessly in offline mode.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <h4 className="text-slate-900 font-bold mb-2">2. Mathematical Rigor</h4>
            <p className="text-slate-800">
              All financial algorithms (DSCR, 1031 exchange, amortization curves, FLSA overtime) adhere strictly to IRS, CFPB, and statutory federal rules.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <h4 className="text-slate-900 font-bold mb-2">3. Maximum Speed</h4>
            <p className="text-slate-800">
              Zero bloated UI libraries. Built with modern React 19, Tailwind CSS v4, and SIMD-accelerated WebAssembly for near-native CPU throughput.
            </p>
          </div>
        </div>
      </div>

      {/* Editorial & Authorship Disclosure */}
      <div className="mb-16 p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 mb-2">Editorial & Authorship Standards</h3>
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed mb-3">
          Our technical guides, financial models, and documentation are authored and maintained by senior data engineers and quantitative analysts. We review algorithms against standard Fannie Mae/Freddie Mac guidelines, CFPB disclosure rules, and IRS Treasury regulations.
        </p>
        <p className="text-xs text-slate-700 leading-relaxed">
          TableView.dev provides models for educational and informational purposes. While we strive for zero-roundoff precision matching commercial bank ledgers, users should always verify transaction specifics with licensed financial advisors, CPAs, or attorneys.
        </p>
      </div>

      {/* Feedback & Product Evolution */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Continuous Innovation & Feedback</h3>
          <p className="text-xs sm:text-sm text-slate-800 max-w-lg">
            TableView.dev is continuously updated with faster Wasm drivers and broader columnar format support. Have a format request or feature idea?
          </p>
        </div>
        <a
          href="/contact"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('/contact');
          }}
          className="btn-primary px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors shrink-0"
        >
          <span>Share Feedback</span>
          <ArrowRight className="size-3.5" />
        </a>
      </div>

    </div>
  );
};

import { Cpu, ShieldCheck, Zap, Layers, Lock, Sparkles } from 'lucide-react';
import { AdSlot } from '../components/AdSlot';
import { GithubIcon } from '../components/icons/GithubIcon';

export const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-slate-300">
      {/* Header */}
      <div className="mb-12 pb-8 border-b border-slate-800 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-950/60 border border-indigo-800 text-indigo-400 mb-4">
          <Sparkles className="size-3.5" />
          <span>The Next-Generation In-Browser Data Workbench</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          About TableView.dev
        </h1>
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl">
          TableView.dev was engineered to solve a common developer pain point: inspecting and querying large Apache Parquet datasets without launching heavy Python notebooks or uploading sensitive data to remote cloud servers.
        </p>
      </div>

      {/* Problem & Solution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="p-6 rounded-2xl bg-red-950/20 border border-red-900/40">
          <h3 className="text-base font-semibold text-red-300 mb-2">The Old Way: High Friction & Privacy Risk</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Data engineers and analysts had two painful choices: spin up a local Python virtualenv with Pandas and PyArrow, or upload internal production logs to generic "online converter" websites where confidential customer data is exposed to third-party servers.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-800/50">
          <h3 className="text-base font-semibold text-emerald-300 mb-2">The TableView Way: 100% In-Browser & Instant</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            By compiling DuckDB to WebAssembly, TableView executes an entire vectorized SQL analytical database inside your browser tab. Files are decoded in local RAM at near-native CPU speeds. Zero uploads, zero telemetry, and zero installation required.
          </p>
        </div>
      </div>

      {/* Architecture Deep Dive */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2.5">
          <Layers className="size-6 text-indigo-400" />
          Under the Hood: Modern WebAssembly Stack
        </h2>
        
        <div className="space-y-4 text-sm leading-relaxed text-slate-400">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
            <div className="size-10 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/60 flex items-center justify-center shrink-0">
              <Cpu className="size-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-1">DuckDB-Wasm Analytical Engine</h4>
              <p className="text-xs text-slate-400">
                DuckDB is the gold standard for in-process analytical databases. Its WebAssembly compilation brings SIMD-accelerated columnar operations, dictionary decoding, and multithreaded SQL querying straight to client web workers.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
            <div className="size-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center justify-center shrink-0">
              <Lock className="size-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-1">Zero-Upload Privacy Sandbox</h4>
              <p className="text-xs text-slate-400">
                When you drag a file into TableView, the browser creates an in-memory virtual file descriptor in the WebAssembly sandbox. HIPAA, GDPR, and enterprise confidentiality rules are fully satisfied because network traffic is non-existent.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
            <div className="size-10 rounded-xl bg-purple-950 text-purple-400 border border-purple-800/60 flex items-center justify-center shrink-0">
              <Zap className="size-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-1">Streaming Multi-Format Exporter</h4>
              <p className="text-xs text-slate-400">
                Equipped with SheetJS and DuckDB Arrow bridges, TableView accurately converts complex columnar types (timestamps, decimals, nested structs) into standard Microsoft Excel (.xlsx) workbooks and CSV files.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Principles */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2.5">
          <ShieldCheck className="size-6 text-indigo-400" />
          Our Core Principles
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs sm:text-sm">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
            <h4 className="text-white font-semibold mb-2">1. Privacy First</h4>
            <p className="text-slate-400">
              We never inspect, save, or log user data. If you unplug your internet connection, the app continues functioning seamlessly.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
            <h4 className="text-white font-semibold mb-2">2. Open & Free</h4>
            <p className="text-slate-400">
              TableView is completely free to use and open-sourced under the MIT license, empowering data teams worldwide.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
            <h4 className="text-white font-semibold mb-2">3. Maximum Speed</h4>
            <p className="text-slate-400">
              No bloated UI libraries. Built with modern React 19, Tailwind CSS v4, and minimal runtime dependencies for instant page loads.
            </p>
          </div>
        </div>
      </div>

      {/* Open Source Contribution */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-slate-950/40 border border-indigo-900/60 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Open Source & Community Driven</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
            TableView.dev is continuously developed by passionate data engineers. Found a bug or need support for a new data format? Check our GitHub.
          </p>
        </div>
        <a
          href="https://github.com/Sphinm/tableview"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-colors shrink-0"
        >
          <GithubIcon className="size-4" />
          View on GitHub
        </a>
      </div>

      <AdSlot className="mt-12" />
    </div>
  );
};

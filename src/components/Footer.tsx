import { navigateTo } from '../lib/router';
import {
  Table,
  ShieldCheck,
  BookOpen,
  Mail,
  Cpu,
  Zap,
  ArrowUpRight,
  ArrowUp,
  Sparkles,
  Lock,
  ExternalLink
} from 'lucide-react';

interface FooterProps {
  onTrySample?: () => void;
}

const GithubIcon = ({ className = 'size-4' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

export const Footer = ({ onTrySample }: FooterProps) => {
  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigateTo(path);
  };

  const handleTrySampleClick = () => {
    if (window.location.pathname !== '/') {
      navigateTo('/');
      setTimeout(() => {
        onTrySample?.();
      }, 100);
    } else {
      onTrySample?.();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800 text-slate-400 mt-20 pt-16 pb-12 relative transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Pre-Footer Action Banner */}
        <div className="relative rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 sm:p-10 mb-16 shadow-xl overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 size-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 -mb-10 size-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Zero Data Egress · Pure Client WebAssembly Sandbox</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                Ready to Inspect & Query Your Datasets?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Open Apache Parquet, GeoParquet, CSV, or Excel files up to 2GB in memory. Zero cloud uploads, zero telemetry, and instantaneous DuckDB SQL queries.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleTrySampleClick}
                className="btn-primary w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="size-4 text-amber-400 dark:text-amber-500" />
                <span>Try 1,000-Row Sample</span>
              </button>

              <a
                href="https://github.com/Sphinm/tableview"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-slate-100 border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm whitespace-nowrap"
              >
                <GithubIcon className="size-4 text-slate-300" />
                <span>Star on GitHub</span>
                <ArrowUpRight className="size-3.5 opacity-60" />
              </a>
            </div>
          </div>
        </div>

        {/* Brand & Mission Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-12 border-b border-slate-800 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 border border-slate-700/60 dark:border-transparent flex items-center justify-center font-bold shadow-sm ring-1 ring-slate-800/80">
                <Table className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 text-lg tracking-tight">TableView.dev</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/80 text-[11px] font-mono font-medium text-slate-300">
                    v1.2.0 Wasm
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              Fast, 100% private in-browser Apache Parquet inspector, SQL query workbench, and native Excel converter powered by DuckDB-Wasm.
            </p>

            {/* Architecture Highlights */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="size-3.5" />
                Client-Side Sandbox
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                <Zap className="size-3.5" />
                DuckDB-Wasm Engine
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300">
                <Lock className="size-3.5 text-slate-400" />
                Zero Server Telemetry
              </span>
            </div>
          </div>

          {/* Engine Status Card */}
          <div className="w-full md:w-auto p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 min-w-[240px]">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-slate-300">Engine Health</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Operational
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
              <span>Network Egress:</span>
              <span className="font-mono font-medium text-slate-200">0 B (Offline Capable)</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Execution Target:</span>
              <span className="font-mono font-medium text-slate-200">Local WebAssembly</span>
            </div>
          </div>
        </div>

        {/* 4-column link grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 py-12 text-sm">
          {/* Column 1: Tools & Converters */}
          <div>
            <h4 className="text-slate-100 font-semibold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
              <Table className="size-3.5 text-slate-400" />
              Free Online Tools
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="/parquet-viewer"
                  onClick={(e) => handleNav(e, '/parquet-viewer')}
                  className="group flex items-center justify-between text-slate-400 hover:text-slate-100 transition-colors"
                >
                  <span>Parquet Viewer Online</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 opacity-80 group-hover:opacity-100 font-mono">
                    Instant
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="/parquet-to-excel"
                  onClick={(e) => handleNav(e, '/parquet-to-excel')}
                  className="group flex items-center justify-between text-slate-400 hover:text-slate-100 transition-colors"
                >
                  <span>Parquet to Excel (.xlsx)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 opacity-80 group-hover:opacity-100 font-mono">
                    Popular
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="/parquet-to-csv"
                  onClick={(e) => handleNav(e, '/parquet-to-csv')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  Parquet to CSV Converter
                </a>
              </li>
              <li>
                <a
                  href="/csv-to-parquet"
                  onClick={(e) => handleNav(e, '/csv-to-parquet')}
                  className="group flex items-center justify-between text-slate-400 hover:text-slate-100 transition-colors"
                >
                  <span>CSV to Parquet (ZSTD)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 opacity-80 group-hover:opacity-100 font-mono">
                    Fast
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="/json-to-parquet"
                  onClick={(e) => handleNav(e, '/json-to-parquet')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  JSON to Parquet Converter
                </a>
              </li>
              <li>
                <a
                  href="/parquet-schema-inspector"
                  onClick={(e) => handleNav(e, '/parquet-schema-inspector')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  Parquet Schema Inspector
                </a>
              </li>
              <li>
                <a
                  href="/mortgage-calculator"
                  onClick={(e) => handleNav(e, '/mortgage-calculator')}
                  className="group flex items-center justify-between text-slate-400 hover:text-slate-100 transition-colors"
                >
                  <span>Mortgage Calculator</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 opacity-80 group-hover:opacity-100 font-mono">
                    New
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="/finance-calculator"
                  onClick={(e) => handleNav(e, '/finance-calculator')}
                  className="group flex items-center justify-between text-slate-400 hover:text-slate-100 transition-colors"
                >
                  <span>Financial Calculators</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 opacity-80 group-hover:opacity-100 font-mono">
                    Suite
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Technical Guides */}
          <div>
            <h4 className="text-slate-100 font-semibold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
              <BookOpen className="size-3.5 text-slate-400" />
              Technical Guides
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="/guides/what-is-apache-parquet"
                  onClick={(e) => handleNav(e, '/guides/what-is-apache-parquet')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  What is Apache Parquet?
                </a>
              </li>
              <li>
                <a
                  href="/guides/convert-parquet-to-excel"
                  onClick={(e) => handleNav(e, '/guides/convert-parquet-to-excel')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  Parquet to Excel Guide
                </a>
              </li>
              <li>
                <a
                  href="/guides/duckdb-wasm-in-browser-olap"
                  onClick={(e) => handleNav(e, '/guides/duckdb-wasm-in-browser-olap')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  DuckDB-Wasm Deep Dive
                </a>
              </li>
              <li>
                <a
                  href="/guides/inspect-parquet-metadata-and-schema"
                  onClick={(e) => handleNav(e, '/guides/inspect-parquet-metadata-and-schema')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  Inspect Schema & Metadata
                </a>
              </li>
              <li>
                <a
                  href="/guides/parquet-vs-csv-vs-json-benchmark"
                  onClick={(e) => handleNav(e, '/guides/parquet-vs-csv-vs-json-benchmark')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  Storage & Cost Benchmarks
                </a>
              </li>
              <li className="pt-1">
                <a
                  href="/guides"
                  onClick={(e) => handleNav(e, '/guides')}
                  className="text-slate-200 hover:text-slate-100 transition-colors font-semibold flex items-center gap-1.5"
                >
                  <span>Browse All 6 Guides</span>
                  <ArrowUpRight className="size-3.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Architecture & Security */}
          <div>
            <h4 className="text-slate-100 font-semibold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
              <Cpu className="size-3.5 text-slate-400" />
              Engine & Privacy
            </h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-slate-300 font-medium block">100% Client WebAssembly</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Decodes Snappy, GZIP, and ZSTD blocks directly in memory.
                </span>
              </li>
              <li>
                <span className="text-slate-300 font-medium block">Zero Cloud Egress</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  No files or row samples are ever uploaded to any backend.
                </span>
              </li>
              <li>
                <span className="text-slate-300 font-medium block">60 FPS Virtual Windowing</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  DOM virtualization handles hundreds of thousands of rows smoothly.
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Project & Support */}
          <div>
            <h4 className="text-slate-100 font-semibold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
              <Mail className="size-3.5 text-slate-400" />
              Project & Support
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="/about"
                  onClick={(e) => handleNav(e, '/about')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  About TableView
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => handleNav(e, '/contact')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  Contact & Feedback
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Sphinm/tableview/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-100 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Report Bug / Issue</span>
                  <ExternalLink className="size-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  onClick={(e) => handleNav(e, '/privacy')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  onClick={(e) => handleNav(e, '/terms')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/privacy#advertising"
                  onClick={(e) => handleNav(e, '/privacy#advertising')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  Ad Choices & Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & legal bar */}
        <div className="pt-8 border-t border-slate-900 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} TableView.dev. Licensed under MIT.</span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <a
              href="https://github.com/Sphinm/tableview"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-200 inline-flex items-center gap-1 transition-colors"
            >
              <GithubIcon className="size-3.5" />
              <span>GitHub</span>
            </a>
          </div>

          <div className="text-slate-400 text-center text-[11px] max-w-md">
            Apache Parquet is a registered trademark of the Apache Software Foundation. DuckDB is a trademark of the DuckDB Foundation.
          </div>

          {/* Smooth Scroll to Top Button */}
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-800 transition-colors cursor-pointer text-xs font-medium shadow-sm"
            title="Scroll back to top"
          >
            <ArrowUp className="size-3.5" />
            <span>Back to top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

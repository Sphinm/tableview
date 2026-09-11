import { navigateTo } from '../lib/router';
import { getBugReportMailto } from '../lib/feedback';
import { openCookieSettings } from '../lib/consent';
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
  Calculator,
  ArrowRight
} from 'lucide-react';

interface FooterProps {
  onTrySample?: () => void;
}

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                Ready to Inspect, Query & Model Your Data?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Open CSV, Excel, Apache Parquet, or JSON files of hundreds of megabytes directly in browser memory. Zero cloud uploads, zero telemetry, instantaneous DuckDB SQL queries, and free financial calculators.
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
                href="/finance-calculator"
                onClick={(e) => handleNav(e, '/finance-calculator')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-slate-100 border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm whitespace-nowrap"
              >
                <Calculator className="size-4 text-indigo-400" />
                <span>Financial Calculators</span>
                <ArrowRight className="size-3.5 opacity-60" />
              </a>
            </div>
          </div>
        </div>

        {/* Brand & Mission Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-12 border-b border-slate-800 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="brand-icon size-9 rounded-xl flex items-center justify-center font-bold shadow-sm ring-1 ring-slate-800/80">
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
              100% private in-browser data workspace for CSV, Excel, Parquet, and JSON with SQL analytics, two-way format conversion, and institutional-grade financial calculators powered by DuckDB-Wasm.
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
              <span>Your data egress:</span>
              <span className="font-mono font-medium text-slate-200">0 B — files never uploaded</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Execution Target:</span>
              <span className="font-mono font-medium text-slate-200">Local WebAssembly</span>
            </div>
          </div>
        </div>

        {/* 5-column link grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-6 py-12 text-sm">
          {/* Column 1: Parquet & Data Tools */}
          <div>
            <h4 className="text-slate-100 font-semibold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
              <Table className="size-3.5 text-slate-400" />
              Data Tools
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="/csv-viewer"
                  onClick={(e) => handleNav(e, '/csv-viewer')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  CSV Viewer
                </a>
              </li>
              <li>
                <a
                  href="/csv-to-excel"
                  onClick={(e) => handleNav(e, '/csv-to-excel')}
                  className="group flex items-center justify-between text-slate-400 hover:text-slate-100 transition-colors"
                >
                  <span>CSV to Excel</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                    Popular
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="/excel-viewer"
                  onClick={(e) => handleNav(e, '/excel-viewer')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  Excel Viewer (.xlsx)
                </a>
              </li>
              <li>
                <a
                  href="/parquet-viewer"
                  onClick={(e) => handleNav(e, '/parquet-viewer')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  Parquet Viewer
                </a>
              </li>
              <li>
                <a
                  href="/parquet-to-excel"
                  onClick={(e) => handleNav(e, '/parquet-to-excel')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  Parquet to Excel
                </a>
              </li>
              <li>
                <a
                  href="/excel-to-csv"
                  onClick={(e) => handleNav(e, '/excel-to-csv')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  Excel to CSV
                </a>
              </li>
              <li>
                <a
                  href="/sql-workbench"
                  onClick={(e) => handleNav(e, '/sql-workbench')}
                  className="group flex items-center justify-between text-slate-400 hover:text-slate-100 transition-colors"
                >
                  <span>SQL Workbench</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                    DuckDB
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Financial Calculators */}
          <div>
            <h4 className="text-slate-100 font-semibold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
              <Calculator className="size-3.5 text-indigo-400" />
              Calculators & FinOps
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="/dscr-loan-calculator"
                  onClick={(e) => handleNav(e, '/dscr-loan-calculator')}
                  className="group flex items-center justify-between text-slate-400 hover:text-slate-100 transition-colors"
                >
                  <span>DSCR Loan Calculator</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                    High ROI
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="/hard-money-calculator"
                  onClick={(e) => handleNav(e, '/hard-money-calculator')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  Hard Money & Flip
                </a>
              </li>
              <li>
                <a
                  href="/snowflake-cost-calculator"
                  onClick={(e) => handleNav(e, '/snowflake-cost-calculator')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  Snowflake Warehouse
                </a>
              </li>
              <li>
                <a
                  href="/parquet-storage-calculator"
                  onClick={(e) => handleNav(e, '/parquet-storage-calculator')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  Parquet Cloud Savings
                </a>
              </li>
              <li>
                <a
                  href="/mortgage-calculator"
                  onClick={(e) => handleNav(e, '/mortgage-calculator')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  Mortgage Calculator
                </a>
              </li>
              <li>
                <a
                  href="/refinance-calculator"
                  onClick={(e) => handleNav(e, '/refinance-calculator')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  Refinance Break-Even
                </a>
              </li>
              <li className="pt-1">
                <a
                  href="/finance-calculator"
                  onClick={(e) => handleNav(e, '/finance-calculator')}
                  className="text-slate-200 hover:text-slate-100 transition-colors font-medium flex items-center gap-1.5 group"
                >
                  <span>All 10+ Calculators</span>
                  <ArrowRight className="size-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Technical Guides */}
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
                  <span>Browse All 9 Technical Guides</span>
                  <ArrowUpRight className="size-3.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Architecture & Security */}
          <div>
            <h4 className="text-slate-100 font-semibold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
              <Cpu className="size-3.5 text-slate-400" />
              Engine & Privacy
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="/guides/duckdb-wasm-in-browser-olap"
                  onClick={(e) => handleNav(e, '/guides/duckdb-wasm-in-browser-olap')}
                  className="group block"
                >
                  <span className="text-slate-300 group-hover:text-slate-100 font-medium block transition-colors">
                    100% Client WebAssembly
                  </span>
                  <span className="text-[11px] text-slate-400 group-hover:text-slate-300 block mt-0.5 transition-colors">
                    Decodes Snappy, GZIP, and ZSTD blocks directly in memory.
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  onClick={(e) => handleNav(e, '/privacy')}
                  className="group block"
                >
                  <span className="text-slate-300 group-hover:text-slate-100 font-medium block transition-colors">
                    Zero Cloud Egress
                  </span>
                  <span className="text-[11px] text-slate-400 group-hover:text-slate-300 block mt-0.5 transition-colors">
                    No files or row samples are ever uploaded to any backend.
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  onClick={(e) => handleNav(e, '/about')}
                  className="group block"
                >
                  <span className="text-slate-300 group-hover:text-slate-100 font-medium block transition-colors">
                    60 FPS Virtual Windowing
                  </span>
                  <span className="text-[11px] text-slate-400 group-hover:text-slate-300 block mt-0.5 transition-colors">
                    DOM virtualization handles hundreds of thousands of rows smoothly.
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Project & Support */}
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
                  href={getBugReportMailto()}
                  className="hover:text-slate-100 transition-colors flex items-center gap-1.5"
                  title="Directly open email with preset feedback email, subject, and bug template"
                >
                  <span>Report Bug / Issue</span>
                  <Mail className="size-3 text-slate-500" />
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
                {/* GDPR/ePrivacy requires withdrawing consent to be as easy as giving it. */}
                <button
                  type="button"
                  onClick={openCookieSettings}
                  className="hover:text-slate-100 transition-colors block text-left cursor-pointer"
                >
                  Cookie Settings
                </button>
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
                  href="/disclaimer"
                  onClick={(e) => handleNav(e, '/disclaimer')}
                  className="hover:text-slate-100 transition-colors block"
                >
                  Disclaimer & Disclosure
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
            <span>© {new Date().getFullYear()} TableView.dev. All rights reserved.</span>
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

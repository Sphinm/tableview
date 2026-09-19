import { navigateTo } from '../lib/router';
import { getBugReportMailto } from '../lib/feedback';
import { openCookieSettings } from '../lib/consent';
import { isCalculatorRoute, isCompressionRoute } from '../lib/resolveRoute';
import {
  Table,
  ShieldCheck,
  Zap,
  ArrowUp,
  Sparkles,
  Lock,
  Calculator,
  ArrowRight,
  Video,
  Activity,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onTrySample?: () => void;
  currentPath?: string;
}

export const Footer = ({ onTrySample: _onTrySample, currentPath }: FooterProps) => {
  const activePath = currentPath ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  const isHome = activePath === '/';
  const isCalculator = isCalculatorRoute(activePath);
  const isCompression = isCompressionRoute(activePath);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigateTo(path);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className={`w-full bg-slate-50 border-t border-slate-200 text-slate-700 relative transition-colors ${
        isCompression ? 'mt-10 pt-8 pb-8' : 'mt-12 sm:mt-16 pt-10 pb-10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Pre-Footer Action Banner: ONLY shown on homepage (subpages omit this module) */}
        {isHome && (
          <div className="relative rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 mb-12 shadow-sm overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 size-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 -mb-10 size-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200/60 text-emerald-700">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Zero Data Egress · Pure Client WebAssembly Sandbox</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Ready to Inspect, Query & Model Your Data?
                </h3>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                  Open CSV, Excel, Apache Parquet, or JSON files of hundreds of megabytes directly in browser memory. Zero cloud uploads, zero telemetry, instantaneous DuckDB SQL queries.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <a
                  href="/data-tools"
                  onClick={(e) => handleNav(e, '/data-tools')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="size-4 text-amber-400" />
                  <span>Open Data Workbench</span>
                </a>

                <a
                  href="/finance-calculator"
                  onClick={(e) => handleNav(e, '/finance-calculator')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <Calculator className="size-4 text-indigo-600" />
                  <span>Financial Calculators</span>
                  <ArrowRight className="size-3.5 opacity-60" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Brand & Mission Row: ONLY shown on homepage (subpages omit this module) */}
        {isHome && (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-8 border-b border-slate-200 gap-6">
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <BrandLogo size={36} className="shadow-xs shrink-0" />
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-lg tracking-tight">TableView.dev</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-mono font-medium text-emerald-700">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    In-Browser Engine
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-800 max-w-lg leading-relaxed">
                100% private in-browser data workspace for CSV, Excel, Parquet, and JSON with SQL analytics, two-way format conversion, and free media & financial tools.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <ShieldCheck className="size-3.5" />
                  Client-Side Sandbox
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 border border-indigo-200 text-indigo-700">
                  <Zap className="size-3.5" />
                  DuckDB-Wasm Engine
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-900 shadow-2xs">
                  <Lock className="size-3.5 text-slate-700" />
                  Zero Server Telemetry
                </span>
              </div>
            </div>

            <div className="w-full md:w-auto p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 min-w-[220px] shadow-2xs">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold text-slate-900">Engine Health</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Operational
                </span>
              </div>
              <div className="text-[11px] text-slate-700 font-medium flex items-center justify-between border-t border-slate-200 pt-1.5">
                <span>Data egress:</span>
                <span className="font-mono font-bold text-slate-900">0 B</span>
              </div>
              <div className="text-[11px] text-slate-700 font-medium flex items-center justify-between">
                <span>Target:</span>
                <span className="font-mono font-bold text-slate-900">Local Wasm</span>
              </div>
            </div>
          </div>
        )}


        {/* 2. Context-Aware Navigation Columns */}
        {isCompression ? (
          /* Compression Pages: Compact 3-Column Layout */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 py-8 text-sm">
            {/* Column 1: Compression Tools */}
            <div>
              <h4 className="text-slate-900 font-semibold uppercase tracking-wider text-xs mb-3.5 flex items-center gap-2">
                <Video className="size-3.5 text-emerald-600" />
                Compression Studio
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/video-compressor"
                    onClick={(e) => handleNav(e, '/video-compressor')}
                    className="text-emerald-700 font-medium hover:text-emerald-800 transition-colors flex items-center justify-between"
                  >
                    <span>Video Compressor</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                      Wasm
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="/image-compressor"
                    onClick={(e) => handleNav(e, '/image-compressor')}
                    className="text-slate-700 hover:text-slate-900 transition-colors flex items-center justify-between"
                  >
                    <span>Image Compressor</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 font-mono">
                      Batch
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="/compress-mp4"
                    onClick={(e) => handleNav(e, '/compress-mp4')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block text-xs"
                  >
                    Compress MP4 Video
                  </a>
                </li>
                <li>
                  <a
                    href="/compress-video-for-discord"
                    onClick={(e) => handleNav(e, '/compress-video-for-discord')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block text-xs"
                  >
                    Compress Video for Discord (25MB)
                  </a>
                </li>
                <li>
                  <a
                    href="/compress-png"
                    onClick={(e) => handleNav(e, '/compress-png')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block text-xs"
                  >
                    Compress PNG (Transparent)
                  </a>
                </li>
                <li>
                  <a
                    href="/compress-jpg"
                    onClick={(e) => handleNav(e, '/compress-jpg')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block text-xs"
                  >
                    Compress JPG Photos (EXIF Stripped)
                  </a>
                </li>
                <li>
                  <a
                    href="/compress-webp"
                    onClick={(e) => handleNav(e, '/compress-webp')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block text-xs"
                  >
                    Compress WebP (Google Speed)
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: Popular Tools */}
            <div>
              <h4 className="text-slate-900 font-bold uppercase tracking-wider text-xs mb-3.5 flex items-center gap-2">
                <Table className="size-3.5 text-slate-700" />
                Popular Utilities
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="/csv-viewer"
                    onClick={(e) => handleNav(e, '/csv-viewer')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    CSV Viewer & Search
                  </a>
                </li>
                <li>
                  <a
                    href="/excel-viewer"
                    onClick={(e) => handleNav(e, '/excel-viewer')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Excel Viewer (.xlsx)
                  </a>
                </li>
                <li>
                  <a
                    href="/sql-workbench"
                    onClick={(e) => handleNav(e, '/sql-workbench')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    DuckDB SQL Console
                  </a>
                </li>
                <li>
                  <a
                    href="/finance-calculator"
                    onClick={(e) => handleNav(e, '/finance-calculator')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Financial Calculators
                  </a>
                </li>
                <li>
                  <a
                    href="/json-formatter"
                    onClick={(e) => handleNav(e, '/json-formatter')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    JSON Formatter & Validator
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Privacy & Legal */}
            <div>
              <h4 className="text-slate-900 font-semibold uppercase tracking-wider text-xs mb-3.5 flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                Privacy & Legal
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="/privacy"
                    onClick={(e) => handleNav(e, '/privacy')}
                    className="text-slate-700 hover:text-slate-900 font-medium transition-colors block"
                  >
                    Privacy Policy (Zero Upload Guarantee)
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={openCookieSettings}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block text-left cursor-pointer"
                  >
                    Cookie Settings
                  </button>
                </li>
                <li>
                  <a
                    href="/terms"
                    onClick={(e) => handleNav(e, '/terms')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    onClick={(e) => handleNav(e, '/contact')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Contact & Feedback
                  </a>
                </li>
                <li>
                  <a
                    href={getBugReportMailto()}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors flex items-center gap-1.5"
                  >
                    <span>Report Bug / Issue</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        ) : isCalculator ? (
          /* Calculator Pages: Focused 4-Column Layout */
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-6 py-8 text-sm">
            {/* Column 1: Real Estate & Debt */}
            <div>
              <h4 className="text-slate-900 font-semibold uppercase tracking-wider text-xs mb-3.5 flex items-center gap-2">
                <Calculator className="size-3.5 text-indigo-600" />
                Real Estate & Debt
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="/dscr-loan-calculator"
                    onClick={(e) => handleNav(e, '/dscr-loan-calculator')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    DSCR Loan Calculator
                  </a>
                </li>
                <li>
                  <a
                    href="/commercial-loan-calculator"
                    onClick={(e) => handleNav(e, '/commercial-loan-calculator')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Commercial Loan & Balloon
                  </a>
                </li>
                <li>
                  <a
                    href="/balloon-payment-calculator"
                    onClick={(e) => handleNav(e, '/balloon-payment-calculator')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Balloon Payment Calculator
                  </a>
                </li>
                <li>
                  <a
                    href="/section-1031-exchange-calculator"
                    onClick={(e) => handleNav(e, '/section-1031-exchange-calculator')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    1031 Exchange Tax Deferral
                  </a>
                </li>
                <li>
                  <a
                    href="/1031-exchange-timeline-calculator"
                    onClick={(e) => handleNav(e, '/1031-exchange-timeline-calculator')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    1031 Exchange Timeline (45/180)
                  </a>
                </li>
                <li>
                  <a
                    href="/loan-comparison-calculator"
                    onClick={(e) => handleNav(e, '/loan-comparison-calculator')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Loan Comparison (Side-by-Side)
                  </a>
                </li>
                <li>
                  <a
                    href="/mortgage-calculator"
                    onClick={(e) => handleNav(e, '/mortgage-calculator')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Mortgage & Extra Payments
                  </a>
                </li>
                <li>
                  <a
                    href="/amortization-schedule-calculator"
                    onClick={(e) => handleNav(e, '/amortization-schedule-calculator')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Amortization Schedule
                  </a>
                </li>
                <li>
                  <a
                    href="/mortgage-payoff-calculator"
                    onClick={(e) => handleNav(e, '/mortgage-payoff-calculator')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Mortgage Payoff Calculator
                  </a>
                </li>
                <li>
                  <a
                    href="/refinance-calculator"
                    onClick={(e) => handleNav(e, '/refinance-calculator')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Refinance Break-Even
                  </a>
                </li>
                <li>
                  <a
                    href="/cash-out-refinance-calculator"
                    onClick={(e) => handleNav(e, '/cash-out-refinance-calculator')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Cash-Out Refinance
                  </a>
                </li>
                <li>
                  <a
                    href="/hard-money-calculator"
                    onClick={(e) => handleNav(e, '/hard-money-calculator')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Hard Money (70% Rule MAO)
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: Payroll & FinOps */}
            <div>
              <h4 className="text-slate-900 font-semibold uppercase tracking-wider text-xs mb-3.5 flex items-center gap-2">
                <Zap className="size-3.5 text-emerald-600" />
                Payroll & FinOps
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="/salary-to-hourly-calculator"
                    onClick={(e) => handleNav(e, '/salary-to-hourly-calculator')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Salary to Hourly Matrix
                  </a>
                </li>
                <li>
                  <a
                    href="/snowflake-cost-calculator"
                    onClick={(e) => handleNav(e, '/snowflake-cost-calculator')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Snowflake Warehouse Cost
                  </a>
                </li>
                <li>
                  <a
                    href="/parquet-storage-calculator"
                    onClick={(e) => handleNav(e, '/parquet-storage-calculator')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Parquet Storage Savings
                  </a>
                </li>
                <li>
                  <a
                    href="/60000-a-year-is-how-much-an-hour"
                    onClick={(e) => handleNav(e, '/60000-a-year-is-how-much-an-hour')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    $60k/yr is How Much/Hour?
                  </a>
                </li>
                <li>
                  <a
                    href="/100000-a-year-is-how-much-an-hour"
                    onClick={(e) => handleNav(e, '/100000-a-year-is-how-much-an-hour')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    $100k/yr is How Much/Hour?
                  </a>
                </li>
                <li className="pt-1">
                  <a
                    href="/finance-calculator"
                    onClick={(e) => handleNav(e, '/finance-calculator')}
                    className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                  >
                    <span>All 10+ Calculators</span>
                    <ArrowRight className="size-3" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Media & Dev Tools */}
            <div>
              <h4 className="text-slate-900 font-semibold uppercase tracking-wider text-xs mb-3.5 flex items-center gap-2">
                <Video className="size-3.5 text-cyan-600" />
                Media & Dev Tools
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="/video-compressor"
                    onClick={(e) => handleNav(e, '/video-compressor')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Video Compressor (Wasm)
                  </a>
                </li>
                <li>
                  <a
                    href="/image-compressor"
                    onClick={(e) => handleNav(e, '/image-compressor')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Image Compressor (Batch)
                  </a>
                </li>
                <li>
                  <a
                    href="/data-tools"
                    onClick={(e) => handleNav(e, '/data-tools')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Data Workbench
                  </a>
                </li>
                <li>
                  <a
                    href="/sql-workbench"
                    onClick={(e) => handleNav(e, '/sql-workbench')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    DuckDB SQL Console
                  </a>
                </li>
                <li>
                  <a
                    href="/json-formatter"
                    onClick={(e) => handleNav(e, '/json-formatter')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    JSON Formatter
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Project & Legal */}
            <div>
              <h4 className="text-slate-900 font-semibold uppercase tracking-wider text-xs mb-3.5 flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-slate-700" />
                Support & Legal
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="/about"
                    onClick={(e) => handleNav(e, '/about')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    About TableView
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    onClick={(e) => handleNav(e, '/contact')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Contact & Feedback
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    onClick={(e) => handleNav(e, '/privacy')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={openCookieSettings}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block text-left cursor-pointer"
                  >
                    Cookie Settings
                  </button>
                </li>
                <li>
                  <a
                    href="/terms"
                    onClick={(e) => handleNav(e, '/terms')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/disclaimer"
                    onClick={(e) => handleNav(e, '/disclaimer')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Disclaimer
                  </a>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          /* General / Data Workbench: 4 Clean Balanced Columns */
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-6 py-8 text-sm">
            {/* Column 1: Data Workbench */}
            <div>
              <h4 className="text-slate-900 font-semibold uppercase tracking-wider text-xs mb-3.5 flex items-center gap-2">
                <Table className="size-3.5 text-slate-700" />
                Data Workbench
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="/data-tools"
                    onClick={(e) => handleNav(e, '/data-tools')}
                    className="text-emerald-700 font-medium hover:text-emerald-800 transition-colors block"
                  >
                    Data Workbench Studio
                  </a>
                </li>
                <li>
                  <a
                    href="/csv-viewer"
                    onClick={(e) => handleNav(e, '/csv-viewer')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    CSV Viewer
                  </a>
                </li>
                <li>
                  <a
                    href="/excel-viewer"
                    onClick={(e) => handleNav(e, '/excel-viewer')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Excel Viewer (.xlsx)
                  </a>
                </li>
                <li>
                  <a
                    href="/parquet-viewer"
                    onClick={(e) => handleNav(e, '/parquet-viewer')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Parquet Viewer
                  </a>
                </li>
                <li>
                  <a
                    href="/parquet-to-excel"
                    onClick={(e) => handleNav(e, '/parquet-to-excel')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Parquet to Excel
                  </a>
                </li>
                <li>
                  <a
                    href="/geoparquet-viewer"
                    onClick={(e) => handleNav(e, '/geoparquet-viewer')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    GeoParquet Viewer
                  </a>
                </li>
                <li>
                  <a
                    href="/json-to-csv"
                    onClick={(e) => handleNav(e, '/json-to-csv')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    JSON to CSV
                  </a>
                </li>
                <li>
                  <a
                    href="/json-to-excel"
                    onClick={(e) => handleNav(e, '/json-to-excel')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    JSON to Excel
                  </a>
                </li>
                <li>
                  <a
                    href="/excel-to-json"
                    onClick={(e) => handleNav(e, '/excel-to-json')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Excel to JSON
                  </a>
                </li>
                <li>
                  <a
                    href="/tsv-viewer"
                    onClick={(e) => handleNav(e, '/tsv-viewer')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    TSV Viewer
                  </a>
                </li>
                <li>
                  <a
                    href="/sql-workbench"
                    onClick={(e) => handleNav(e, '/sql-workbench')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    DuckDB SQL Console
                  </a>
                </li>
                <li>
                  <a
                    href="/json-formatter"
                    onClick={(e) => handleNav(e, '/json-formatter')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    JSON Formatter
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: Media & Compressors */}
            <div>
              <h4 className="text-slate-900 font-semibold uppercase tracking-wider text-xs mb-3.5 flex items-center gap-2">
                <Video className="size-3.5 text-emerald-600" />
                Media & Compressors
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="/video-compressor"
                    onClick={(e) => handleNav(e, '/video-compressor')}
                    className="text-slate-700 hover:text-slate-900 font-medium transition-colors flex items-center justify-between"
                  >
                    <span>Video Compressor</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                      Wasm
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="/compress-mp4"
                    onClick={(e) => handleNav(e, '/compress-mp4')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Compress MP4 Video
                  </a>
                </li>
                <li>
                  <a
                    href="/compress-video-for-discord"
                    onClick={(e) => handleNav(e, '/compress-video-for-discord')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Compress for Discord
                  </a>
                </li>
                <li>
                  <a
                    href="/image-compressor"
                    onClick={(e) => handleNav(e, '/image-compressor')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Image Compressor (Batch)
                  </a>
                </li>
                <li>
                  <a
                    href="/compress-png"
                    onClick={(e) => handleNav(e, '/compress-png')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Compress PNG (Alpha)
                  </a>
                </li>
                <li>
                  <a
                    href="/compress-jpg"
                    onClick={(e) => handleNav(e, '/compress-jpg')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Compress JPG (EXIF)
                  </a>
                </li>
                <li>
                  <a
                    href="/compress-webp"
                    onClick={(e) => handleNav(e, '/compress-webp')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Compress WebP
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Financial Calculators */}
            <div>
              <h4 className="text-slate-900 font-semibold uppercase tracking-wider text-xs mb-3.5 flex items-center gap-2">
                <Calculator className="size-3.5 text-indigo-600" />
                Financial Calculators
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="/dscr-loan-calculator"
                    onClick={(e) => handleNav(e, '/dscr-loan-calculator')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    DSCR Loan Calculator
                  </a>
                </li>
                <li>
                  <a
                    href="/commercial-loan-calculator"
                    onClick={(e) => handleNav(e, '/commercial-loan-calculator')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Commercial Loan & Balloon
                  </a>
                </li>
                <li>
                  <a
                    href="/mortgage-calculator"
                    onClick={(e) => handleNav(e, '/mortgage-calculator')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Mortgage & Extra Payments
                  </a>
                </li>
                <li>
                  <a
                    href="/salary-to-hourly-calculator"
                    onClick={(e) => handleNav(e, '/salary-to-hourly-calculator')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Salary to Hourly Matrix
                  </a>
                </li>
                <li>
                  <a
                    href="/snowflake-cost-calculator"
                    onClick={(e) => handleNav(e, '/snowflake-cost-calculator')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Snowflake Warehouse Cost
                  </a>
                </li>
                <li className="pt-1">
                  <a
                    href="/finance-calculator"
                    onClick={(e) => handleNav(e, '/finance-calculator')}
                    className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                  >
                    <span>All 10+ Calculators</span>
                    <ArrowRight className="size-3" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Guides & Legal */}
            <div>
              <h4 className="text-slate-900 font-semibold uppercase tracking-wider text-xs mb-3.5 flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-slate-700" />
                Guides & Legal
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="/is-it-down"
                    onClick={(e) => handleNav(e, '/is-it-down')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors flex items-center gap-1.5"
                  >
                    <Activity className="size-3 text-slate-500 shrink-0" />
                    Is It Down Checker
                  </a>
                </li>
                <li>
                  <a
                    href="/guides"
                    onClick={(e) => handleNav(e, '/guides')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Technical Guides Hub
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    onClick={(e) => handleNav(e, '/about')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    About TableView
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    onClick={(e) => handleNav(e, '/contact')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Contact & Feedback
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    onClick={(e) => handleNav(e, '/privacy')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={openCookieSettings}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block text-left cursor-pointer"
                  >
                    Cookie Settings
                  </button>
                </li>
                <li>
                  <a
                    href="/terms"
                    onClick={(e) => handleNav(e, '/terms')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/disclaimer"
                    onClick={(e) => handleNav(e, '/disclaimer')}
                    className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                  >
                    Disclaimer
                  </a>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* 3. Bottom copyright & legal bar */}
        <div className="pt-6 border-t border-slate-200 text-xs text-slate-700 font-medium flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} TableView.dev. All rights reserved.</span>
          </div>

          {!isCompression && (
            <div className="text-slate-700 text-center text-[11px] max-w-md font-medium">
              Apache Parquet is a registered trademark of the Apache Software Foundation. DuckDB is a trademark of the DuckDB Foundation.
            </div>
          )}

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow-2xs transition-colors cursor-pointer text-xs font-semibold"
            title="Scroll back to top"
          >
            <ArrowUp className="size-3" />
            <span>Back to top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

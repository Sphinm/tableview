import { navigateTo } from '../lib/router';
import { Table, ShieldCheck, BookOpen, Mail, FileText } from 'lucide-react';

export const Footer = () => {
  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigateTo(path);
  };

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 text-slate-400 mt-20 pt-16 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top brand row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-12 border-b border-slate-900 gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="size-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/30">
                <Table className="size-4" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">TableView.dev</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Fast, 100% private in-browser Apache Parquet inspector, SQL query workbench, and native Excel converter powered by DuckDB-Wasm.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/60 border border-emerald-800/80 text-emerald-400">
              <ShieldCheck className="size-3.5" />
              100% Client-Side Sandbox
            </span>
          </div>
        </div>

        {/* 4-column link grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 text-xs">
          {/* Column 1: Tools & Converters */}
          <div>
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px] mb-4 flex items-center gap-1.5">
              <Table className="size-3.5 text-indigo-400" />
              Free Online Tools
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="/parquet-viewer"
                  onClick={(e) => handleNav(e, '/parquet-viewer')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Parquet Viewer Online
                </a>
              </li>
              <li>
                <a
                  href="/parquet-to-excel"
                  onClick={(e) => handleNav(e, '/parquet-to-excel')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Parquet to Excel (.xlsx)
                </a>
              </li>
              <li>
                <a
                  href="/parquet-to-csv"
                  onClick={(e) => handleNav(e, '/parquet-to-csv')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Parquet to CSV Converter
                </a>
              </li>
              <li>
                <a
                  href="/csv-to-parquet"
                  onClick={(e) => handleNav(e, '/csv-to-parquet')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  CSV to Parquet (ZSTD)
                </a>
              </li>
              <li>
                <a
                  href="/json-to-parquet"
                  onClick={(e) => handleNav(e, '/json-to-parquet')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  JSON to Parquet Converter
                </a>
              </li>
              <li>
                <a
                  href="/parquet-schema-inspector"
                  onClick={(e) => handleNav(e, '/parquet-schema-inspector')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Parquet Schema Inspector
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Technical Guides */}
          <div>
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px] mb-4 flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-indigo-400" />
              Technical Guides
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="/guides/what-is-apache-parquet"
                  onClick={(e) => handleNav(e, '/guides/what-is-apache-parquet')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  What is Apache Parquet?
                </a>
              </li>
              <li>
                <a
                  href="/guides/convert-parquet-to-excel"
                  onClick={(e) => handleNav(e, '/guides/convert-parquet-to-excel')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Parquet to Excel Guide
                </a>
              </li>
              <li>
                <a
                  href="/guides/duckdb-wasm-in-browser-olap"
                  onClick={(e) => handleNav(e, '/guides/duckdb-wasm-in-browser-olap')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  DuckDB-Wasm Deep Dive
                </a>
              </li>
              <li>
                <a
                  href="/guides/inspect-parquet-metadata-and-schema"
                  onClick={(e) => handleNav(e, '/guides/inspect-parquet-metadata-and-schema')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Inspect Schema & Metadata
                </a>
              </li>
              <li>
                <a
                  href="/guides/parquet-vs-csv-vs-json-benchmark"
                  onClick={(e) => handleNav(e, '/guides/parquet-vs-csv-vs-json-benchmark')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Storage & Cost Benchmarks
                </a>
              </li>
              <li>
                <a
                  href="/guides"
                  onClick={(e) => handleNav(e, '/guides')}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                >
                  Browse All 6 Guides →
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Project & About */}
          <div>
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px] mb-4 flex items-center gap-1.5">
              <Mail className="size-3.5 text-indigo-400" />
              Project & Support
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="/about"
                  onClick={(e) => handleNav(e, '/about')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  About TableView
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => handleNav(e, '/contact')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Contact & Feedback
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => handleNav(e, '/contact')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Report an Issue / Bug
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  onClick={(e) => handleNav(e, '/about')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  DuckDB-Wasm Engine
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Compliance */}
          <div>
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px] mb-4 flex items-center gap-1.5">
              <FileText className="size-3.5 text-indigo-400" />
              Legal & Privacy
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="/privacy"
                  onClick={(e) => handleNav(e, '/privacy')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  onClick={(e) => handleNav(e, '/terms')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/privacy#advertising"
                  onClick={(e) => handleNav(e, '/privacy')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Ad Choices & Cookies
                </a>
              </li>
              <li>
                <span className="text-slate-400 text-[11px] block mt-2">
                  Zero Server Log Policy: All file decoding executes exclusively on client CPU memory.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 border-t border-slate-900 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} TableView.dev. All rights reserved. Open-source under MIT License.
          </div>
          <div className="text-slate-400 text-center sm:text-right">
            Apache Parquet is a registered trademark of the Apache Software Foundation. DuckDB is a trademark of the DuckDB Foundation.
          </div>
        </div>
      </div>
    </footer>
  );
};

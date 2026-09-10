import { Fragment, useState } from 'react';
import { ChevronDown, ShieldCheck, Cpu, HardDriveDownload, Table, CheckCircle2, ArrowRight } from 'lucide-react';
import { type ToolConfig, TOOLS_CONFIG } from '../data/tools';
import { navigateTo } from '../lib/router';
import { AdSlot } from './AdSlot';

/**
 * How many tool cards to show before the in-feed ad. Six fills two rows on the
 * 3-column desktop grid, so the ad sits on a natural boundary rather than
 * splitting a row.
 */
const IN_FEED_AD_AFTER_INDEX = 5;

interface SeoSectionProps {
  toolConfig?: ToolConfig;
}

export const SeoSection = ({ toolConfig }: SeoSectionProps) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const defaultFaqs = [
    {
      q: 'Do my CSV, Excel, Parquet, or JSON files leave my computer?',
      a: 'No, absolutely not. TableView executes 100% of its data ingestion, SQL query execution, format conversions, and financial calculations locally using DuckDB WebAssembly (Wasm) and client-side JavaScript. Your datasets, row values, and deal parameters never touch external cloud servers. You can even disconnect your internet after the page loads and continue working completely offline.'
    },
    {
      q: 'How do I convert an Apache Parquet or CSV file to Excel (.xlsx)?',
      a: 'Simply drag and drop your .parquet or .csv file onto TableView, wait a moment for the in-browser schema detection, and click "Export Excel (.xlsx)". The application converts the tabular and Arrow buffers into a native Microsoft Excel workbook with preserved data types and cell formats.'
    },
    {
      q: 'Can I convert CSV or JSON files into compressed Apache Parquet (.parquet)?',
      a: 'Yes! TableView includes a reverse converter: drop any .csv, .tsv, or .json file, select "Convert to Parquet (ZSTD)", and your browser will generate an optimized Apache Parquet file using DuckDB’s native columnar engine.'
    },
    {
      q: 'What is the maximum file size supported?',
      a: 'Because Apache Parquet stores data in columnar chunks and DuckDB streams metadata and pages on-demand, TableView can comfortably explore files up to several hundred megabytes (and millions of rows) depending on your device RAM.'
    },
    {
      q: 'Can I execute custom SQL queries against my local files?',
      a: 'Yes. Switch to the "SQL Console" tab in the workbench to run standard analytical SQL queries—including WHERE filters, GROUP BY aggregations, window functions, and JOINs—directly over your local dataset.'
    },
    {
      q: 'Are the financial and FinOps calculators free and private?',
      a: 'Yes! All financial models (DSCR rental loans, hard money & fix-and-flip, Snowflake warehouse sizing, cloud storage savings, mortgages, and refinance break-even) run 100% client-side with zero lead forms, no broker spam calls, no paywalls, and instant Excel (.xlsx) downloads.'
    }
  ];

  const faqs = toolConfig?.faqs || defaultFaqs;

  const toolsList = Object.values(TOOLS_CONFIG);

  // Generate FAQPage JSON-LD for search engine rich snippets
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(f => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.a
      }
    }))
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-16 border-t border-slate-900 mt-6">
      {/* FAQ Schema Script Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Bento Grid: Core Product Capabilities */}
      <div className="mb-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight mb-3">
            Engineered for Modern Data & Financial Workflows
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            No heavy desktop installations, no Python dependencies, and zero security compromises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Vectorized SQL (Wide: 2 cols) */}
          <div className="md:col-span-2 p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="size-8 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Cpu className="size-4.5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Vectorized Query Engine
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-100 mb-2">
                Embedded DuckDB-Wasm Processing
              </h3>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl mb-4">
                Executes columnar SQL directly on your local CPU via WebAssembly SIMD. Run group-by aggregations, string filters, and window functions over hundreds of thousands of rows in milliseconds.
              </p>
            </div>

            {/* Code Snippet Preview */}
            <div className="rounded-xl bg-slate-950 border border-slate-800/80 p-4 font-mono text-xs sm:text-sm text-slate-300 overflow-x-auto shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60 text-slate-400 text-xs">
                <span>duckdb-wasm-interactive-query</span>
                <span className="text-emerald-400 font-mono">⚡ 4ms execution</span>
              </div>
              <p className="text-indigo-400">SELECT <span className="text-slate-200">category, count(*), round(avg(amount), 2) AS avg_rev</span></p>
              <p className="text-indigo-400">FROM <span className="text-amber-300">parquet_scan('dataset.parquet')</span></p>
              <p className="text-indigo-400">WHERE <span className="text-slate-200">status = 'COMPLETED'</span></p>
              <p className="text-indigo-400">GROUP BY <span className="text-slate-200">1</span> ORDER BY <span className="text-slate-200">2 DESC LIMIT 5;</span></p>
            </div>
          </div>

          {/* Card 2: Air-Gapped Privacy */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="size-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="size-4.5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Zero Telemetry
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-100 mb-2">
                100% Air-Gapped Privacy
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Confidential financial ledgers, HIPAA clinical databases, and internal logs never exit your machine.
              </p>
            </div>

            <ul className="space-y-2.5 pt-3 border-t border-slate-800/60 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>Zero server file uploads</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>Works offline without Wi-Fi</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>In-memory sandbox lifecycle</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Two-Way Conversion */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="size-8 rounded-lg bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <HardDriveDownload className="size-4.5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                  Bi-Directional
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-100 mb-2">
                Multi-Format Conversion
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Convert seamlessly between CSV, Microsoft Excel (.xlsx), Apache Parquet, and JSON—or compress bulky flat files into high-ratio ZSTD Parquet directly in your browser.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-center gap-2 flex-wrap">
              <span className="text-emerald-400 font-semibold">.csv</span>
              <span>⇄</span>
              <span className="text-green-400 font-semibold">.xlsx</span>
              <span>⇄</span>
              <span className="text-indigo-400 font-semibold">.parquet</span>
              <span>⇄</span>
              <span className="text-amber-400 font-semibold">.json</span>
            </div>
          </div>

          {/* Card 4: Schema Profiling & DDL (Wide: 2 cols) */}
          <div className="md:col-span-2 p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="size-8 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Table className="size-4.5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  Statistical Profiling
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-100 mb-2">
                Deep Schema & Null Auditing
              </h3>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
                Inspect physical and logical column types, unique cardinality, minimum/maximum values, and null percentage metrics. Extract ready-to-run SQL DDL (<code className="text-cyan-300 font-mono">CREATE TABLE</code>) in a single click.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                Data Types
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                Null % Warnings
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                Approx Cardinality
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                Instant DDL Generation
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Suite Directory */}
      <div className="mb-20">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight mb-3">
            Free Dedicated Online Data Tools
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Select a specialized tool below to start viewing, converting, or inspecting your datasets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {toolsList.map((tool, index) => (
            <Fragment key={tool.slug}>
            <div
              onClick={() => navigateTo(tool.path)}
              className="p-5 sm:p-6 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                    {tool.badge.split('·')[0].trim()}
                  </span>
                  <ArrowRight className="size-4 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors mb-2">
                  {tool.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                  {tool.metaDescription}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/60 text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                <span>Launch Tool</span>
                <span>→</span>
              </div>
            </div>

            {/* In-feed ad. Spans the full grid width so it never looks like a tool card. */}
            {index === IN_FEED_AD_AFTER_INDEX && (
              <div className="sm:col-span-2 lg:col-span-3">
                <AdSlot unit="toolInArticle" format="horizontal" className="my-2" />
              </div>
            )}
            </Fragment>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 text-center mb-6">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-base font-semibold text-slate-200">{faq.q}</span>
                  <ChevronDown
                    className={`size-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm sm:text-base text-slate-400 border-t border-slate-800/60 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Closing unit after the FAQ, where the reader has finished the page. */}
      <div className="max-w-3xl mx-auto">
        <AdSlot unit="toolInArticle" />
      </div>
    </section>
  );
};

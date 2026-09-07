import { useState } from 'react';
import { ChevronDown, ShieldCheck, Cpu, HardDriveDownload } from 'lucide-react';

export const SeoSection = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Do my Parquet or CSV files leave my browser?',
      a: 'No. TableView processes 100% of your data locally on your machine using DuckDB WebAssembly (Wasm). Your files and data rows are never uploaded, sent over the network, or stored on any server. You can even disconnect your Wi-Fi after the page loads and continue opening and converting files.'
    },
    {
      q: 'How do I convert a Parquet file to Excel (.xlsx)?',
      a: 'Simply drag and drop your .parquet file into TableView, wait 1 second for the table preview to render, and click the green "Export to Excel (.xlsx)" button. TableView converts your columnar data directly into a native Microsoft Excel workbook with proper column names and types.'
    },
    {
      q: 'What is the file size limit?',
      a: 'Because TableView uses Apache Parquet column-pruning and DuckDB streaming, it can comfortably open and query files up to several hundred megabytes (and millions of rows) depending on your device RAM. Only the metadata and visible pages are materialized in memory.'
    },
    {
      q: 'What formats does TableView support?',
      a: 'TableView natively supports Apache Parquet (.parquet), GeoParquet, Comma-Separated Values (.csv, .tsv), and JSON / JSON Lines (.json, .jsonl, .ndjson).'
    },
    {
      q: 'Can I write SQL queries over my local Parquet files?',
      a: 'Yes! Toggle to the "SQL Console" tab in the workbench to run any standard DuckDB SQL statement—including filters (WHERE), aggregations (GROUP BY), joins, sorting, and window functions—directly against your local dataset.'
    }
  ];

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-16 border-t border-slate-900 mt-12">
      {/* How it works grid */}
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Built for Fast, Private Data Inspection
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          No need to open a Jupyter notebook, spin up Python Pandas, or install heavy desktop viewers just to see what is inside a dataset.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
          <div className="size-10 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/60 flex items-center justify-center mb-4">
            <Cpu className="size-5" />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">Powered by DuckDB-Wasm</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Runs an in-process analytical SQL database directly inside your browser tab. Zero network latency, instant schema discovery, and multithreaded query speed.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
          <div className="size-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center justify-center mb-4">
            <ShieldCheck className="size-5" />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">Confidential & Compliant</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ideal for HIPAA, GDPR, and enterprise production logs. Sensitive customer data stays safely enclosed within your local browser memory sandbox.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
          <div className="size-10 rounded-xl bg-purple-950 text-purple-400 border border-purple-800/60 flex items-center justify-center mb-4">
            <HardDriveDownload className="size-5" />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">One-Click Multi-Format Export</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Easily transform complex columnar schemas from AWS S3, Snowflake, or Databricks into clean, formatted Excel (.xlsx) or CSV files for business teams.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mb-16">
        <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-6">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm font-medium text-slate-200">{faq.q}</span>
                  <ChevronDown
                    className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-400 border-t border-slate-800/60 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-8 border-t border-slate-900 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200">TableView.dev</span>
          <span>© {new Date().getFullYear()}</span>
          <span>·</span>
          <span>Open-Source In-Browser Parquet Viewer & Converter</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <a href="#top" className="hover:text-slate-200 transition-colors">
            Back to Top
          </a>
          <a
            href="https://github.com/Sphinm/tableview"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-200 transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </section>
  );
};

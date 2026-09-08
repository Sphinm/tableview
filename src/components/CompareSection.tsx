import { Check, X, ShieldAlert, Sparkles, Scale } from 'lucide-react';

export const CompareSection = () => {
  const comparisonData = [
    {
      feature: 'Setup & Time to First Row',
      tableview: { text: '0 seconds · Instant in browser tab', highlight: true, icon: Check },
      pandas: { text: '3–5 mins · Requires venv & pip packages', icon: null },
      desktop: { text: '5–10 mins · Requires 200MB+ install', icon: null },
      cloud: { text: '1–2 mins · Upload queues & waiting', icon: null }
    },
    {
      feature: 'Data Privacy & Security',
      tableview: { text: '100% Local RAM · Zero bytes uploaded', highlight: true, icon: Check },
      pandas: { text: 'Local on device', icon: Check },
      desktop: { text: 'Local on device', icon: Check },
      cloud: { text: 'Critical Risk · Uploaded to 3rd party', highlightBad: true, icon: ShieldAlert }
    },
    {
      feature: 'Interactive SQL Analytics',
      tableview: { text: 'Built-in DuckDB OLAP engine', highlight: true, icon: Check },
      pandas: { text: 'Manual Python code or extra setup', icon: null },
      desktop: { text: 'Full SQL database interface', icon: Check },
      cloud: { text: 'None · Static conversion only', highlightBad: true, icon: X }
    },
    {
      feature: 'Formatted Excel (.xlsx) Export',
      tableview: { text: '1-Click native type-preserving export', highlight: true, icon: Check },
      pandas: { text: 'Requires openpyxl script', icon: null },
      desktop: { text: 'Complex multi-step wizard', icon: null },
      cloud: { text: 'Capped at 10–25MB or paywalled', highlightBad: true, icon: X }
    },
    {
      feature: 'Memory & Performance Model',
      tableview: { text: 'Streaming column pruning (Wasm)', highlight: true, icon: Check },
      pandas: { text: 'High memory · Prone to OOM crashes', icon: null },
      desktop: { text: 'Heavy RAM · Java heap constraints', icon: null },
      cloud: { text: 'Server timeouts on large datasets', highlightBad: true, icon: X }
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-slate-900">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-950/60 border border-indigo-800 text-indigo-400 mb-3.5">
          <Scale className="size-3.5" />
          <span>Workflow Comparison</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4">
          How TableView Compares to Traditional Tools
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Why engineering teams are replacing heavy desktop installations, local virtual environments, and risky cloud upload tools with TableView.
        </p>
      </div>

      {/* Comparison Matrix Table */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/60 text-xs text-slate-300">
                <th className="p-4 sm:p-5 font-semibold w-1/4">Evaluation Criteria</th>
                <th className="p-4 sm:p-5 font-bold w-1/4 bg-indigo-950/40 border-x border-indigo-500/30 text-indigo-300">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-extrabold">TableView.dev</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-600 text-white font-semibold flex items-center gap-1">
                      <Sparkles className="size-2.5" />
                      Recommended
                    </span>
                  </div>
                </th>
                <th className="p-4 sm:p-5 font-semibold w-1/6 text-slate-400">Python / Pandas</th>
                <th className="p-4 sm:p-5 font-semibold w-1/6 text-slate-400">Desktop GUI (DBeaver)</th>
                <th className="p-4 sm:p-5 font-semibold w-1/6 text-slate-400">Cloud Web Converters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {comparisonData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/20 transition-colors">
                  <td className="p-4 sm:p-5 font-medium text-slate-200">
                    {row.feature}
                  </td>
                  {/* TableView Column (Highlighted) */}
                  <td className="p-4 sm:p-5 bg-indigo-950/20 border-x border-indigo-500/20 font-medium text-white">
                    <div className="flex items-center gap-2">
                      <div className="size-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center justify-center shrink-0">
                        <Check className="size-3" />
                      </div>
                      <span>{row.tableview.text}</span>
                    </div>
                  </td>
                  {/* Pandas Column */}
                  <td className="p-4 sm:p-5 text-slate-400">
                    <div className="flex items-center gap-2">
                      {row.pandas.icon && <row.pandas.icon className="size-4 text-slate-400 shrink-0" />}
                      <span>{row.pandas.text}</span>
                    </div>
                  </td>
                  {/* Desktop Column */}
                  <td className="p-4 sm:p-5 text-slate-400">
                    <div className="flex items-center gap-2">
                      {row.desktop.icon && <row.desktop.icon className="size-4 text-slate-400 shrink-0" />}
                      <span>{row.desktop.text}</span>
                    </div>
                  </td>
                  {/* Cloud Converters Column */}
                  <td className={`p-4 sm:p-5 ${row.cloud.highlightBad ? 'text-red-400/90 font-medium' : 'text-slate-400'}`}>
                    <div className="flex items-center gap-2">
                      {row.cloud.icon && (
                        <row.cloud.icon className={`size-4 shrink-0 ${row.cloud.highlightBad ? 'text-red-400' : 'text-slate-400'}`} />
                      )}
                      <span>{row.cloud.text}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

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
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-slate-200">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700 mb-3.5 shadow-2xs">
          <Scale className="size-3.5 text-indigo-600" />
          <span>Workflow Comparison</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          How TableView Compares to Traditional Tools
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Why engineering teams are replacing heavy desktop installations, local virtual environments, and risky cloud upload tools with TableView.
        </p>
      </div>

      {/* Comparison Matrix Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-600">
                <th className="p-4 sm:p-5 font-semibold w-1/4">Evaluation Criteria</th>
                <th className="p-4 sm:p-5 font-bold w-1/4 bg-indigo-50/60 border-x-2 border-indigo-200 text-slate-900 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-900 font-extrabold">TableView.dev</span>
                    <span className="badge-recommended px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                      <Sparkles className="size-2.5" />
                      Recommended
                    </span>
                  </div>
                </th>
                <th className="p-4 sm:p-5 font-semibold w-1/6 text-slate-600">Python / Pandas</th>
                <th className="p-4 sm:p-5 font-semibold w-1/6 text-slate-600">Desktop GUI (DBeaver)</th>
                <th className="p-4 sm:p-5 font-semibold w-1/6 text-slate-600">Cloud Web Converters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {comparisonData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 sm:p-5 font-medium text-slate-800">
                    {row.feature}
                  </td>
                  {/* TableView Column (Highlighted) */}
                  <td className="p-4 sm:p-5 bg-indigo-50/20 border-x-2 border-indigo-100 font-semibold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="size-5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                        <Check className="size-3 stroke-[3]" />
                      </div>
                      <span>{row.tableview.text}</span>
                    </div>
                  </td>
                  {/* Pandas Column */}
                  <td className="p-4 sm:p-5 text-slate-600">
                    <div className="flex items-center gap-2">
                      {row.pandas.icon && <row.pandas.icon className="size-4 text-slate-500 shrink-0" />}
                      <span>{row.pandas.text}</span>
                    </div>
                  </td>
                  {/* Desktop Column */}
                  <td className="p-4 sm:p-5 text-slate-600">
                    <div className="flex items-center gap-2">
                      {row.desktop.icon && <row.desktop.icon className="size-4 text-slate-500 shrink-0" />}
                      <span>{row.desktop.text}</span>
                    </div>
                  </td>
                  {/* Cloud Converters Column */}
                  <td className={`p-4 sm:p-5 ${row.cloud.highlightBad ? 'text-red-700 font-medium' : 'text-slate-600'}`}>
                    <div className="flex items-center gap-2">
                      {row.cloud.icon && (
                        <row.cloud.icon className={`size-4 shrink-0 ${row.cloud.highlightBad ? 'text-red-600' : 'text-slate-500'}`} />
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

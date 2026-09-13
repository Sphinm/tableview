import React from 'react';

interface PrintableReportHeaderProps {
  title: string;
  subtitle?: string;
  referenceId?: string;
}

export const PrintableReportHeader: React.FC<PrintableReportHeaderProps> = ({
  title,
  subtitle = '100% Private In-Browser Financial & Debt Modeling Report',
  referenceId,
}) => {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="hidden print:flex flex-col border-b-2 border-slate-900 pb-4 mb-6 text-slate-950">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-slate-950">
              TableView<span className="text-indigo-600">.dev</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
              Executive Brief
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            {subtitle}
          </p>
        </div>

        <div className="text-right text-xs text-slate-600">
          <div><strong className="text-slate-950">Date:</strong> {today}</div>
          {referenceId && (
            <div className="font-mono text-[10px] text-slate-500 mt-0.5">Ref: {referenceId}</div>
          )}
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
            100% Private Client Calculation (Zero Cloud Egress)
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-950">{title}</h1>
        <span className="text-[11px] text-slate-500 italic">Generated via tableview.dev</span>
      </div>
    </div>
  );
};

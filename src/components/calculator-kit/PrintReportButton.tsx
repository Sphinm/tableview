import { Printer } from 'lucide-react';

interface PrintReportButtonProps {
  label?: string;
  className?: string;
  onBeforePrint?: () => void;
  onPrint?: () => void;
}

export const PrintReportButton = ({
  label = 'Print / PDF Report',
  className = '',
  onBeforePrint,
  onPrint,
}: PrintReportButtonProps) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
      return;
    }
    if (onBeforePrint) {
      onBeforePrint();
    }
    // Small timeout ensures any pre-print DOM adjustments settle
    setTimeout(() => {
      window.print();
    }, 50);
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className={`no-print h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 cursor-pointer transition-all shadow-sm active:scale-95 shrink-0 ${className}`}
      title="Open browser print dialog to print or save clean vector PDF report"
    >
      <Printer className="size-4 text-indigo-400" />
      <span>{label}</span>
    </button>
  );
};

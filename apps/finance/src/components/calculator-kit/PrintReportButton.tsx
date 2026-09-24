import { Printer } from 'lucide-react';
import { analytics } from '../../lib/analytics';
import { trackUserClick } from '../../lib/sentry';

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
    const calculator = (typeof window !== 'undefined' ? window.location.pathname.replace(/^\//, '') : '') || 'mortgage';
    trackUserClick('calculator_print_pdf_click', { calculator });
    analytics.calculatorExport({
      calculator,
      format: 'print_pdf',
    });

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
      className={`no-print h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-900 border border-slate-200 hover:border-slate-300 cursor-pointer transition-all shadow-2xs active:scale-95 shrink-0 ${className}`}
      title="Open browser print dialog to print or save clean vector PDF report"
    >
      <Printer className="size-4 text-indigo-600" />
      <span>{label}</span>
    </button>
  );
};

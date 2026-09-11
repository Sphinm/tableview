import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { getCalculatorFaqs } from '../data/calculatorFaqs';

interface CalculatorFaqSectionProps {
  /** Canonical calculator path, e.g. '/dscr-loan-calculator'. */
  path: string;
  title: string;
  /** Index of the question expanded on first render; null collapses all. */
  defaultOpen?: number | null;
  className?: string;
}

/**
 * Renders a calculator's FAQ from the shared registry.
 *
 * Every calculator uses this rather than inlining markup, which guarantees the
 * visible content and the prerendered <noscript> / FAQPage JSON-LD come from the
 * same source. Emitting FAQ markup a visitor cannot see would be cloaking.
 */
export const CalculatorFaqSection = ({
  path,
  title,
  defaultOpen = 0,
  className = '',
}: CalculatorFaqSectionProps) => {
  const faqs = getCalculatorFaqs(path);
  const [openFaq, setOpenFaq] = useState<number | null>(defaultOpen);

  // Render nothing rather than an empty heading if a path is unregistered.
  if (faqs.length === 0) return null;

  return (
    <section className={`space-y-4 ${className}`}>
      <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
        <HelpCircle className="size-5 text-indigo-400" />
        {title}
      </h3>
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openFaq === index;
          return (
            <div
              key={faq.q}
              className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
              >
                <h4 className="text-sm sm:text-base font-semibold text-slate-200">{faq.q}</h4>
                <ChevronDown
                  className={`size-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-indigo-400' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-sm text-slate-400 border-t border-slate-800/60 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

import { AlertTriangle, CheckCircle2, Scale } from 'lucide-react';
import { AdSlot } from '../components/AdSlot';
import { updatePageMeta } from '../lib/router';
import { useEffect } from 'react';

export const Disclaimer = () => {
  useEffect(() => {
    updatePageMeta(
      'Disclaimer & Financial Disclosure | TableView.dev',
      'Legal disclaimers, financial calculation disclosures, and terms of informational use for TableView.dev and its personal finance and cloud cost calculators.',
      '/disclaimer'
    );
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-slate-300">
      {/* Header */}
      <div className="mb-10 pb-8 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-amber-950/60 border border-amber-800 text-amber-400 mb-4">
          <AlertTriangle className="size-3.5" />
          <span>Legal & Financial Disclaimer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight mb-4">
          Disclaimer & Disclosure
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Please read this disclaimer carefully before utilizing any tools, financial calculators, data utilities, or guides on TableView.dev.
        </p>
      </div>

      {/* Core Warning Box */}
      <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-800/40 shadow-sm mb-12">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-amber-900/40 text-amber-300 border border-amber-700/50 shrink-0 mt-0.5">
            <Scale className="size-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-amber-200 mb-1.5">
              Not Financial, Investment, or Legal Advice
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              All financial calculators, cost estimators, debt-service coverage ratio (DSCR) simulations, fix-and-flip models, mortgage repayment projections, and related guides provided on TableView.dev are strictly for <strong>informational and educational purposes only</strong>. None of the content on this website constitutes financial, investment, legal, tax, or mortgage underwriting advice.
            </p>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-10 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-slate-100 mb-3 flex items-center gap-2">
            <CheckCircle2 className="size-5 text-indigo-400" />
            1. No Fiduciary or Client Relationship
          </h2>
          <p className="text-slate-400">
            Your use of TableView.dev, including any calculation tools, articles, or contact forms, does not create an advisor-client, broker-client, or fiduciary relationship between you and TableView.dev or its creators. You should consult a qualified financial advisor, certified public accountant (CPA), licensed mortgage professional, or legal counsel before executing any property purchase, financing decision, or cloud infrastructure commitment.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-100 mb-3 flex items-center gap-2">
            <CheckCircle2 className="size-5 text-indigo-400" />
            2. Accuracy of Calculations and Estimates
          </h2>
          <p className="text-slate-400 mb-3">
            While we endeavor to keep mathematical formulas, interest calculations, and cloud pricing benchmarks up to date:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li><strong>Market Variances:</strong> Actual mortgage interest rates, lender points, underwriting guidelines, and closing fees fluctuate dynamically based on macroeconomic conditions and individual credit profiles.</li>
            <li><strong>Cloud Pricing Revisions:</strong> Cloud provider storage (e.g., AWS S3, Google Cloud, Azure) and database compute rates (e.g., Snowflake, Athena) are subject to periodic vendor price adjustments and regional availability.</li>
            <li><strong>Estimates Only:</strong> All calculations are hypothetical estimates and do not guarantee actual savings, profits, or qualification approval from any third-party lender or cloud service provider.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-100 mb-3 flex items-center gap-2">
            <CheckCircle2 className="size-5 text-indigo-400" />
            3. 100% Client-Side Processing Assurance
          </h2>
          <p className="text-slate-400">
            TableView.dev operates entirely within your browser client using WebAssembly. We do not store, inspect, transmit, or monetize your uploaded files or numeric inputs. Any dataset parsing errors, spreadsheet generation outcomes, or data conversions are executed solely on your device CPU.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-100 mb-3 flex items-center gap-2">
            <CheckCircle2 className="size-5 text-indigo-400" />
            4. Third-Party Advertising & External Links
          </h2>
          <p className="text-slate-400">
            TableView.dev may display advertisements delivered by third-party advertising networks, such as Google AdSense, as well as links to external software documentation and services. We do not endorse, guarantee, or assume responsibility for any products, services, or lending offerings advertised by third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-100 mb-3 flex items-center gap-2">
            <CheckCircle2 className="size-5 text-indigo-400" />
            5. Contact Information
          </h2>
          <p className="text-slate-400">
            If you have questions regarding this Disclaimer, please reach out to our legal and support team at{' '}
            <a href="mailto:support@tableview.dev" className="text-indigo-400 hover:underline font-medium">
              support@tableview.dev
            </a>.
          </p>
        </section>
      </div>

      <AdSlot className="mt-12" />
    </div>
  );
};

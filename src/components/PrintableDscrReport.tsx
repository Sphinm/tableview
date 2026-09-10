import React from 'react';
import { type DscrInputs, type DscrResult } from '../lib/dscrCalculator';

interface PrintableDscrReportProps {
  inputs: DscrInputs;
  result: DscrResult;
}

export const PrintableDscrReport: React.FC<PrintableDscrReportProps> = ({
  inputs,
  result,
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

  return (
    <div className="hidden print:block font-sans text-slate-900 bg-white p-2">
      {/* Institutional Document Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-950 uppercase">
                TableView<span className="text-indigo-600">.dev</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-300">
                Institutional Underwriting Sheet
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              DSCR Real Estate Investment Underwriting Executive Summary
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Debt-Service Coverage Ratio (DSCR) Cash Flow Assessment & Loan Viability
            </p>
          </div>
          <div className="text-right text-xs text-slate-600 space-y-0.5">
            <div><span className="font-semibold text-slate-800">Date:</span> {currentDate}</div>
            <div><span className="font-semibold text-slate-800">Ref ID:</span> DSCR-{Math.round(result.loanAmount % 100000).toString().padStart(5, '0')}</div>
            <div><span className="font-semibold text-slate-800">Status:</span> {result.statusLabel}</div>
          </div>
        </div>
      </div>

      {/* Key Metric Highlights Banner */}
      <div className="grid grid-cols-4 gap-3 mb-6 print-avoid-break">
        <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-500">Gross DSCR (PITIA)</div>
          <div className="text-xl font-black text-indigo-700 mt-0.5">
            {result.grossDscr.toFixed(2)}x
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Target: {inputs.targetDscr.toFixed(2)}x</div>
        </div>

        <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-500">Net DSCR (NOI)</div>
          <div className="text-xl font-black text-slate-900 mt-0.5">
            {result.netDscr.toFixed(2)}x
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Commercial Underwriting</div>
        </div>

        <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-500">Monthly Net Cash Flow</div>
          <div className={`text-xl font-black mt-0.5 ${result.monthlyNetCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {fmt(result.monthlyNetCashFlow)}/mo
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{fmt(result.annualNetCashFlow)} / year</div>
        </div>

        <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-500">Cash-on-Cash Return</div>
          <div className="text-xl font-black text-emerald-700 mt-0.5">
            {result.cashOnCashReturn.toFixed(2)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Initial: {fmt(result.totalInitialInvestment)}</div>
        </div>
      </div>

      {/* Property & Debt Structure vs Operating Pro-Forma */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Left: Financing Structure */}
        <div className="border border-slate-300 rounded-lg p-4 bg-slate-50/40">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5 mb-2.5">
            1. Property & Loan Underwriting Terms
          </h2>
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Property Purchase Price:</td>
                <td className="py-1 font-semibold text-right text-slate-900">{fmt(inputs.propertyValue)}</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Down Payment Amount:</td>
                <td className="py-1 font-semibold text-right text-slate-900">{fmt(result.downPaymentAmount)} ({((result.downPaymentAmount / inputs.propertyValue) * 100).toFixed(1)}%)</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Loan Amount & LTV:</td>
                <td className="py-1 font-bold text-right text-indigo-700">{fmt(result.loanAmount)} ({result.ltv.toFixed(1)}% LTV)</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Interest Rate:</td>
                <td className="py-1 font-bold text-right text-slate-900">{inputs.interestRate.toFixed(2)}% {inputs.isInterestOnly ? '(Interest-Only)' : 'Amortizing'}</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Amortization Term:</td>
                <td className="py-1 font-semibold text-right text-slate-900">{inputs.loanTermYears} Years</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Monthly Debt Service (P&I):</td>
                <td className="py-1 font-bold text-right text-slate-900">{fmt(result.monthlyPrincipalAndInterest)}/mo</td>
              </tr>
              <tr className="bg-indigo-50/60 font-bold">
                <td className="py-1.5 px-1 text-indigo-900">Total Monthly PITIA Debt:</td>
                <td className="py-1.5 px-1 text-right text-indigo-900 text-sm">{fmt(result.monthlyPitia)}/mo</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right: Income & Operating Statement */}
        <div className="border border-slate-300 rounded-lg p-4 bg-slate-50/40">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5 mb-2.5">
            2. Pro-Forma Operating Statement (Monthly)
          </h2>
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Gross Scheduled Rent:</td>
                <td className="py-1 font-bold text-right text-emerald-700 font-mono">+{fmt(result.grossMonthlyRent)}</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Vacancy Allowance ({inputs.vacancyRate}%):</td>
                <td className="py-1 text-right text-slate-600 font-mono">-{fmt((result.grossMonthlyRent * inputs.vacancyRate) / 100)}</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Effective Gross Income (EGI):</td>
                <td className="py-1 font-semibold text-right text-slate-900 font-mono">{fmt(result.effectiveMonthlyIncome)}</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Property Tax & Insurance:</td>
                <td className="py-1 text-right text-slate-600 font-mono">-{fmt(result.monthlyTaxes + result.monthlyInsurance)}</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">HOA & Property Management:</td>
                <td className="py-1 text-right text-slate-600 font-mono">-{fmt(result.monthlyHoa + result.monthlyManagementFee)}</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Maintenance Reserve:</td>
                <td className="py-1 text-right text-slate-600 font-mono">-{fmt(result.monthlyMaintenance)}</td>
              </tr>
              <tr className="bg-slate-100 font-bold">
                <td className="py-1.5 px-1 text-slate-900">Net Operating Income (NOI):</td>
                <td className="py-1.5 px-1 text-right text-slate-900 font-mono">{fmt(result.monthlyNetOperatingIncome)}/mo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Underwriting Assessment Callout */}
      <div className="border border-slate-300 rounded-lg p-4 bg-slate-50/30 mb-6 print-avoid-break">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5 mb-2.5">
          3. Institutional Underwriting Assessment
        </h2>
        <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
          <p>
            <span className="font-bold text-slate-900">Coverage Rating:</span>{' '}
            <span className="font-semibold text-indigo-700">{result.statusLabel}</span> — {result.statusDescription}
          </p>
          <p>
            <span className="font-bold text-slate-900">Max Supported Loan at {inputs.targetDscr.toFixed(2)}x DSCR:</span>{' '}
            <span className="font-mono font-bold text-slate-900">{fmt(result.maxLoanAmountAtTargetDscr)}</span>{' '}
            {result.loanAmount <= result.maxLoanAmountAtTargetDscr ? (
              <span className="text-emerald-700 font-semibold">(Requested loan of {fmt(result.loanAmount)} is fully covered)</span>
            ) : (
              <span className="text-rose-700 font-semibold">(Exceeds target DSCR threshold by {fmt(result.loanAmount - result.maxLoanAmountAtTargetDscr)})</span>
            )}
          </p>
        </div>
      </div>

      {/* Compliance & Disclosure */}
      <div className="border-t border-slate-300 pt-3 text-[9px] text-slate-500 leading-relaxed print-avoid-break">
        <p className="font-semibold text-slate-700">COMMERCIAL REAL ESTATE & NON-QM DSCR UNDERWRITING NOTICE:</p>
        <p>
          DSCR loans are commercial business-purpose mortgages for residential investment properties (1-4 units and multifamily). Ratios and qualification tiers are strictly projections based on market rent estimates (Form 1007 / 1025 appraisal rent schedules) and user-supplied expenses. Formal underwriting approval is subject to appraisal review, title verification, liquidity reserves (typically 3-6 months PITIA), and credit score tiers.
        </p>
        <div className="flex justify-between items-center mt-2 text-slate-400">
          <span>Generated client-side via TableView.dev Real Estate Analytics Engine</span>
          <span>Page 1 of DSCR Underwriting Statement</span>
        </div>
      </div>
    </div>
  );
};

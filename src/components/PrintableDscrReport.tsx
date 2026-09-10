import React from 'react';
import { type DscrInputs, type DscrResult, type DscrAmortizationRow } from '../lib/dscrCalculator';

export interface DscrAnnualAmortizationRow {
  year: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  accumulatedInterest?: number;
}

interface PrintableDscrReportProps {
  inputs: DscrInputs;
  result: DscrResult;
  annualSchedule: DscrAnnualAmortizationRow[];
  monthlySchedule?: DscrAmortizationRow[];
  scheduleView?: 'annual' | 'monthly';
}

export const PrintableDscrReport: React.FC<PrintableDscrReportProps> = ({
  inputs,
  result,
  annualSchedule,
  monthlySchedule = [],
  scheduleView = 'annual',
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;
  const isMonthly = scheduleView === 'monthly';

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
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold border border-slate-400">
                Institutional Underwriting Sheet
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-1">
              DSCR Real Estate Investment Underwriting Statement
            </h1>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Debt-Service Coverage Ratio (DSCR) Cash Flow Assessment & {isMonthly ? `Full ${monthlySchedule.length}-Month Payment Schedule` : '30-Year Loan Amortization Schedule'}
            </p>
          </div>
          <div className="text-right text-xs text-slate-700 space-y-0.5">
            <div><span className="font-bold text-slate-900">Date:</span> {currentDate}</div>
            <div><span className="font-bold text-slate-900">Ref ID:</span> DSCR-{Math.round(result.loanAmount % 100000).toString().padStart(5, '0')}</div>
            <div><span className="font-bold text-slate-900">Schedule Mode:</span> {isMonthly ? 'Monthly Details' : 'Annual Summary'}</div>
            <div><span className="font-bold text-slate-900">Status:</span> {result.statusLabel}</div>
          </div>
        </div>
      </div>

      {/* Key Metric Highlights Banner */}
      <div className="grid grid-cols-4 gap-3 mb-6 print-avoid-break">
        <div className="border-2 border-slate-300 rounded-lg p-3 bg-slate-50 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-600">Gross DSCR (PITIA)</div>
          <div className="text-xl font-black text-indigo-700 mt-0.5">
            {result.grossDscr.toFixed(2)}x
          </div>
          <div className="text-[10px] font-semibold text-slate-500 mt-0.5">Target: {inputs.targetDscr.toFixed(2)}x</div>
        </div>

        <div className="border-2 border-slate-300 rounded-lg p-3 bg-slate-50 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-600">Net DSCR (NOI)</div>
          <div className="text-xl font-black text-slate-950 mt-0.5">
            {result.netDscr.toFixed(2)}x
          </div>
          <div className="text-[10px] font-semibold text-slate-500 mt-0.5">Commercial Underwriting</div>
        </div>

        <div className="border-2 border-slate-300 rounded-lg p-3 bg-slate-50 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-600">Monthly Net Cash Flow</div>
          <div className={`text-xl font-black mt-0.5 ${result.monthlyNetCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {fmt(result.monthlyNetCashFlow)}/mo
          </div>
          <div className="text-[10px] font-semibold text-slate-500 mt-0.5">{fmt(result.annualNetCashFlow)} / year</div>
        </div>

        <div className="border-2 border-slate-300 rounded-lg p-3 bg-slate-50 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-600">Cash-on-Cash Return</div>
          <div className="text-xl font-black text-emerald-700 mt-0.5">
            {result.cashOnCashReturn.toFixed(2)}%
          </div>
          <div className="text-[10px] font-semibold text-slate-500 mt-0.5">Initial: {fmt(result.totalInitialInvestment)}</div>
        </div>
      </div>

      {/* Property & Debt Structure vs Operating Pro-Forma */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Left: Financing Structure */}
        <div className="border-2 border-slate-300 rounded-lg p-4 bg-slate-50/70">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-300 pb-1.5 mb-2.5">
            1. Property & Loan Underwriting Terms
          </h2>
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b border-slate-200 py-1">
                <td className="py-1 text-slate-700 font-medium">Property Purchase Price:</td>
                <td className="py-1 font-bold text-right text-slate-950 font-mono">{fmt(inputs.propertyValue)}</td>
              </tr>
              <tr className="border-b border-slate-200 py-1">
                <td className="py-1 text-slate-700 font-medium">Down Payment Amount:</td>
                <td className="py-1 font-semibold text-right text-slate-900 font-mono">{fmt(result.downPaymentAmount)} ({((result.downPaymentAmount / inputs.propertyValue) * 100).toFixed(1)}%)</td>
              </tr>
              <tr className="border-b border-slate-200 py-1">
                <td className="py-1 text-slate-700 font-medium">Loan Amount & LTV:</td>
                <td className="py-1 font-black text-right text-indigo-700 font-mono">{fmt(result.loanAmount)} ({result.ltv.toFixed(1)}% LTV)</td>
              </tr>
              <tr className="border-b border-slate-200 py-1">
                <td className="py-1 text-slate-700 font-medium">Interest Rate:</td>
                <td className="py-1 font-bold text-right text-slate-900 font-mono">{inputs.interestRate.toFixed(2)}% {inputs.isInterestOnly ? '(Interest-Only)' : 'Amortizing'}</td>
              </tr>
              <tr className="border-b border-slate-200 py-1">
                <td className="py-1 text-slate-700 font-medium">Amortization Term:</td>
                <td className="py-1 font-semibold text-right text-slate-900 font-mono">{inputs.loanTermYears} Years ({inputs.loanTermYears * 12} Months)</td>
              </tr>
              <tr className="border-b border-slate-200 py-1">
                <td className="py-1 text-slate-700 font-medium">Monthly Debt Service (P&I):</td>
                <td className="py-1 font-bold text-right text-slate-900 font-mono">{fmt(result.monthlyPrincipalAndInterest)}/mo</td>
              </tr>
              <tr className="bg-indigo-50/80 font-bold border-t border-indigo-200">
                <td className="py-1.5 px-1 text-indigo-950">Total Monthly PITIA Debt:</td>
                <td className="py-1.5 px-1 text-right text-indigo-950 text-sm font-black font-mono">{fmt(result.monthlyPitia)}/mo</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right: Income & Operating Statement */}
        <div className="border-2 border-slate-300 rounded-lg p-4 bg-slate-50/70">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-300 pb-1.5 mb-2.5">
            2. Pro-Forma Operating Statement (Monthly)
          </h2>
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b border-slate-200 py-1">
                <td className="py-1 text-slate-700 font-medium">Gross Scheduled Rent:</td>
                <td className="py-1 font-bold text-right text-emerald-700 font-mono">+{fmt(result.grossMonthlyRent)}</td>
              </tr>
              <tr className="border-b border-slate-200 py-1">
                <td className="py-1 text-slate-700 font-medium">Vacancy Allowance ({inputs.vacancyRate}%):</td>
                <td className="py-1 text-right text-slate-700 font-mono">-{fmt((result.grossMonthlyRent * inputs.vacancyRate) / 100)}</td>
              </tr>
              <tr className="border-b border-slate-200 py-1">
                <td className="py-1 text-slate-700 font-medium">Effective Gross Income (EGI):</td>
                <td className="py-1 font-semibold text-right text-slate-900 font-mono">{fmt(result.effectiveMonthlyIncome)}</td>
              </tr>
              <tr className="border-b border-slate-200 py-1">
                <td className="py-1 text-slate-700 font-medium">Property Tax & Insurance:</td>
                <td className="py-1 text-right text-slate-700 font-mono">-{fmt(result.monthlyTaxes + result.monthlyInsurance)}</td>
              </tr>
              <tr className="border-b border-slate-200 py-1">
                <td className="py-1 text-slate-700 font-medium">HOA & Property Management:</td>
                <td className="py-1 text-right text-slate-700 font-mono">-{fmt(result.monthlyHoa + result.monthlyManagementFee)}</td>
              </tr>
              <tr className="border-b border-slate-200 py-1">
                <td className="py-1 text-slate-700 font-medium">Maintenance Reserve:</td>
                <td className="py-1 text-right text-slate-700 font-mono">-{fmt(result.monthlyMaintenance)}</td>
              </tr>
              <tr className="bg-slate-100 font-bold border-t border-slate-300">
                <td className="py-1.5 px-1 text-slate-950">Net Operating Income (NOI):</td>
                <td className="py-1.5 px-1 text-right text-slate-950 font-black font-mono">{fmt(result.monthlyNetOperatingIncome)}/mo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Underwriting Assessment Callout */}
      <div className="border-2 border-slate-300 rounded-lg p-4 bg-slate-50/50 mb-6 print-avoid-break">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-300 pb-1.5 mb-2.5">
          3. Institutional Underwriting Assessment
        </h2>
        <div className="text-xs text-slate-800 space-y-2 leading-relaxed">
          <p>
            <span className="font-bold text-slate-950">Coverage Rating:</span>{' '}
            <span className="font-bold text-indigo-700">{result.statusLabel}</span> — {result.statusDescription}
          </p>
          <p>
            <span className="font-bold text-slate-950">Max Supported Loan at {inputs.targetDscr.toFixed(2)}x DSCR:</span>{' '}
            <span className="font-mono font-bold text-slate-950">{fmt(result.maxLoanAmountAtTargetDscr)}</span>{' '}
            {result.loanAmount <= result.maxLoanAmountAtTargetDscr ? (
              <span className="text-emerald-700 font-bold">(Requested loan of {fmt(result.loanAmount)} is fully covered)</span>
            ) : (
              <span className="text-rose-700 font-bold">(Exceeds target DSCR threshold by {fmt(result.loanAmount - result.maxLoanAmountAtTargetDscr)})</span>
            )}
          </p>
        </div>
      </div>

      {/* 4. Complete Loan Amortization Schedule (Monthly or Annual) */}
      <div className="mb-6">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1.5 mb-2.5 flex justify-between items-center">
          <span>
            {isMonthly
              ? `4. Complete Monthly Loan Amortization Schedule (${monthlySchedule.length} Months)`
              : `4. Complete 30-Year Loan Amortization Schedule (Annual Summary)`}
          </span>
          <span className="text-[10px] font-semibold text-slate-600">
            {inputs.isInterestOnly ? 'Interest-Only' : `${inputs.loanTermYears}-Year Fixed Amortization`}
          </span>
        </h2>

        {isMonthly ? (
          <table className="w-full text-[10px] border border-slate-300">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="py-1.5 px-2 text-left">Period</th>
                <th className="py-1.5 px-2 text-right">Monthly Payment</th>
                <th className="py-1.5 px-2 text-right text-emerald-300 font-bold">Principal</th>
                <th className="py-1.5 px-2 text-right text-rose-300 font-bold">Interest</th>
                <th className="py-1.5 px-2 text-right font-bold text-white">Ending Balance</th>
                <th className="py-1.5 px-2 text-right text-slate-300">Cumulative Interest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {monthlySchedule.map((row) => (
                <tr key={row.month} className="even:bg-slate-50/70">
                  <td className="py-1 px-2 font-sans font-bold text-slate-950">
                    Month {row.month} <span className="text-slate-500 font-normal text-[9px]">(Yr {row.year})</span>
                  </td>
                  <td className="py-1 px-2 text-right text-slate-900 font-bold">
                    ${row.payment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-1 px-2 text-right text-emerald-700 font-semibold">
                    ${row.principal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-1 px-2 text-right text-rose-700">
                    ${row.interest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-1 px-2 text-right font-bold text-slate-950">
                    ${Math.round(row.balance).toLocaleString()}
                  </td>
                  <td className="py-1 px-2 text-right text-slate-700">
                    ${Math.round(row.accumulatedInterest ?? 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-[10px] border border-slate-300">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="py-1.5 px-2 text-left">Period</th>
                <th className="py-1.5 px-2 text-right">Annual Payment</th>
                <th className="py-1.5 px-2 text-right text-emerald-300 font-bold">Principal Paid</th>
                <th className="py-1.5 px-2 text-right text-rose-300 font-bold">Interest Paid</th>
                <th className="py-1.5 px-2 text-right font-bold text-white">Ending Balance</th>
                <th className="py-1.5 px-2 text-right text-slate-300">Cumulative Interest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {annualSchedule.map((row) => (
                <tr key={row.year} className="even:bg-slate-50/70">
                  <td className="py-1 px-2 font-sans font-bold text-slate-950">Year {row.year}</td>
                  <td className="py-1 px-2 text-right text-slate-900 font-bold">${Math.round(row.payment).toLocaleString()}</td>
                  <td className="py-1 px-2 text-right text-emerald-700 font-semibold">${Math.round(row.principal).toLocaleString()}</td>
                  <td className="py-1 px-2 text-right text-rose-700">${Math.round(row.interest).toLocaleString()}</td>
                  <td className="py-1 px-2 text-right font-bold text-slate-950">${Math.round(row.balance).toLocaleString()}</td>
                  <td className="py-1 px-2 text-right text-slate-700">${Math.round(row.accumulatedInterest ?? 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Compliance & Disclosure */}
      <div className="border-t border-slate-300 pt-3 text-[9px] text-slate-500 leading-relaxed print-avoid-break">
        <p className="font-semibold text-slate-700">COMMERCIAL REAL ESTATE & NON-QM DSCR UNDERWRITING NOTICE:</p>
        <p>
          DSCR loans are commercial business-purpose mortgages for residential investment properties (1-4 units and multifamily). Ratios and qualification tiers are strictly projections based on market rent estimates (Form 1007 / 1025 appraisal rent schedules) and user-supplied expenses. Formal underwriting approval is subject to appraisal review, title verification, liquidity reserves (typically 3-6 months PITIA), and credit score tiers.
        </p>
        <div className="flex justify-between items-center mt-2 text-slate-400">
          <span>Generated client-side via TableView.dev Real Estate Analytics Engine</span>
          <span>Official Statement of DSCR Underwriting ({isMonthly ? 'Complete Monthly Ledger' : 'Annual Summary Ledger'})</span>
        </div>
      </div>
    </div>
  );
};

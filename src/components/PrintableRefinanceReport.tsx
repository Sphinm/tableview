import React from 'react';
import { type RefinanceInputs, type RefinanceSummary, type AnnualRefinanceRow, type RefinanceScheduleRow } from '../lib/refinanceCalculator';

interface PrintableRefinanceReportProps {
  inputs: RefinanceInputs;
  summary: RefinanceSummary;
  annualSchedule: AnnualRefinanceRow[];
  monthlySchedule?: RefinanceScheduleRow[];
  scheduleView?: 'annual' | 'monthly';
}

export const PrintableRefinanceReport: React.FC<PrintableRefinanceReportProps> = ({
  inputs,
  summary,
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
  const isPositiveSavings = summary.monthlyPaymentSavings > 0;

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
                Official Analysis
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Mortgage Refinance & Break-Even Evaluation Report
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Side-by-Side Current vs. Proposed Financing Analysis · Generated 100% In-Browser
            </p>
          </div>
          <div className="text-right text-xs text-slate-600 space-y-0.5">
            <div><span className="font-semibold text-slate-800">Date:</span> {currentDate}</div>
            <div><span className="font-semibold text-slate-800">Ref ID:</span> REFI-{Math.round(summary.newLoanAmount % 100000).toString().padStart(5, '0')}</div>
            <div><span className="font-semibold text-slate-800">Privacy:</span> Zero Cloud Upload</div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      <div className="border border-slate-300 rounded-lg overflow-hidden mb-6">
        <div className="bg-slate-800 text-white px-4 py-2 flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider">1. Loan Structure Comparison</span>
          <span className="text-xs font-medium text-slate-300">Target Holding Period: {inputs.yearsBeforeSell} Years</span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-700">
              <th className="py-2 px-4 text-left">Parameter</th>
              <th className="py-2 px-4 text-right">Current Loan</th>
              <th className="py-2 px-4 text-right">Refinanced Loan</th>
              <th className="py-2 px-4 text-right font-bold text-indigo-900">Net Difference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="py-2 px-4 text-slate-600">Principal Balance / Loan Amount</td>
              <td className="py-2 px-4 text-right font-mono">{fmt(summary.currentBalance)}</td>
              <td className="py-2 px-4 text-right font-mono">{fmt(summary.newLoanAmount)}</td>
              <td className="py-2 px-4 text-right font-mono text-slate-600">
                {inputs.rollCostsIntoLoan ? `+${fmt(summary.totalClosingCosts)} (rolled-in)` : '$0 delta'}
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-600">Interest Rate (Note Rate)</td>
              <td className="py-2 px-4 text-right font-bold font-mono text-rose-600">{inputs.currentInterestRate.toFixed(3)}%</td>
              <td className="py-2 px-4 text-right font-bold font-mono text-emerald-600">{inputs.newInterestRate.toFixed(3)}%</td>
              <td className="py-2 px-4 text-right font-bold font-mono text-emerald-700">
                {(inputs.currentInterestRate - inputs.newInterestRate).toFixed(3)}% lower
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-600">Loan Term Remaining</td>
              <td className="py-2 px-4 text-right font-mono">{Math.floor(summary.monthsRemainingOld / 12)} yrs ({summary.monthsRemainingOld} mo)</td>
              <td className="py-2 px-4 text-right font-mono">{inputs.newTermYears} yrs ({inputs.newTermYears * 12} mo)</td>
              <td className="py-2 px-4 text-right font-mono text-slate-600">
                {summary.extraMonthsAdded > 0 ? `+${summary.extraMonthsAdded} mo (clock reset)` : `${Math.abs(summary.extraMonthsAdded)} mo shortened`}
              </td>
            </tr>
            <tr className="bg-indigo-50/50 font-bold">
              <td className="py-2 px-4 text-indigo-950">Monthly Payment (P&I)</td>
              <td className="py-2 px-4 text-right font-mono text-slate-900">{fmt(summary.currentMonthlyPayment)}</td>
              <td className="py-2 px-4 text-right font-mono text-indigo-700">{fmt(summary.newMonthlyPayment)}</td>
              <td className={`py-2 px-4 text-right font-mono ${isPositiveSavings ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isPositiveSavings ? `Save ${fmt(summary.monthlyPaymentSavings)}/mo` : `+${fmt(Math.abs(summary.monthlyPaymentSavings))}/mo`}
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-600">Upfront Refinancing Closing Costs</td>
              <td className="py-2 px-4 text-right font-mono text-slate-400">—</td>
              <td className="py-2 px-4 text-right font-mono text-slate-900">{fmt(summary.totalClosingCosts)}</td>
              <td className="py-2 px-4 text-right font-mono text-slate-600">
                {inputs.rollCostsIntoLoan ? 'Financed into loan' : 'Paid out-of-pocket'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Break-Even & Financial Verdict Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6 print-avoid-break">
        <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/50 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-500">Monthly Break-Even</div>
          <div className="text-lg font-black text-indigo-700 mt-0.5">
            {summary.breakEvenMonths !== null ? `${summary.breakEvenMonths} Months` : 'N/A (Higher Payment)'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {summary.breakEvenMonths !== null ? `${(summary.breakEvenMonths / 12).toFixed(1)} years to recover fees` : 'Refinancing shortens term'}
          </div>
        </div>

        <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/50 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-500">Net Equity Break-Even</div>
          <div className="text-lg font-black text-emerald-700 mt-0.5">
            {summary.equityBreakEvenMonths !== null ? `${summary.equityBreakEvenMonths} Months` : 'N/A'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Factors interest & tax deductions</div>
        </div>

        <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/50 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-500">{inputs.yearsBeforeSell}-Year Net Savings</div>
          <div className="text-lg font-black text-slate-900 mt-0.5">
            {fmt(summary.totalNetBenefit)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Cumulative benefit at exit</div>
        </div>
      </div>

      {/* Schedule Table: Monthly or Annual */}
      <div className="mb-6">
        <div className="flex justify-between items-end border-b-2 border-slate-900 pb-1.5 mb-2.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
            {scheduleView === 'monthly'
              ? `2. Complete Monthly Refinance Payment Schedule (${monthlySchedule.length} Months)`
              : `2. Complete Annual Amortization & Equity Tracking Schedule (${annualSchedule.length} Years)`}
          </h2>
          <span className="text-[10px] text-slate-500 font-mono">
            {scheduleView === 'monthly' ? 'Full term monthly projection' : 'Annual rollup'}
          </span>
        </div>

        {scheduleView === 'monthly' ? (
          <table className="w-full text-[9px] border border-slate-300">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="py-1 px-1.5 text-left">Mo</th>
                <th className="py-1 px-1.5 text-left">Yr</th>
                <th className="py-1 px-1.5 text-right">Old Balance</th>
                <th className="py-1 px-1.5 text-right">New Balance</th>
                <th className="py-1 px-1.5 text-right">Old P&I</th>
                <th className="py-1 px-1.5 text-right">New P&I</th>
                <th className="py-1 px-1.5 text-right text-emerald-300 font-bold">Monthly Save</th>
                <th className="py-1 px-1.5 text-right text-emerald-300 font-bold">Cumul. Save</th>
                <th className="py-1 px-1.5 text-right text-indigo-300 font-bold">Equity Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {monthlySchedule.map((row) => (
                <tr key={row.month} className="even:bg-slate-50/70">
                  <td className="py-0.5 px-1.5 font-sans font-bold text-slate-900">{row.month}</td>
                  <td className="py-0.5 px-1.5 font-sans text-slate-600">Yr {row.year}</td>
                  <td className="py-0.5 px-1.5 text-right">${Math.round(row.oldBalance).toLocaleString()}</td>
                  <td className="py-0.5 px-1.5 text-right font-semibold text-slate-900">${Math.round(row.newBalance).toLocaleString()}</td>
                  <td className="py-0.5 px-1.5 text-right text-slate-600">${Math.round(row.oldPayment).toLocaleString()}</td>
                  <td className="py-0.5 px-1.5 text-right text-slate-600">${Math.round(row.newPayment).toLocaleString()}</td>
                  <td className={`py-0.5 px-1.5 text-right font-semibold ${row.monthlySavings >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    ${Math.round(row.monthlySavings).toLocaleString()}
                  </td>
                  <td className={`py-0.5 px-1.5 text-right font-semibold ${row.cumulativeSavings >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    ${Math.round(row.cumulativeSavings).toLocaleString()}
                  </td>
                  <td className="py-0.5 px-1.5 text-right font-bold text-indigo-700">
                    ${Math.round(row.equityDifference).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-[10px] border border-slate-300">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="py-1.5 px-2 text-left">Year</th>
                <th className="py-1.5 px-2 text-right">Old Balance</th>
                <th className="py-1.5 px-2 text-right">New Balance</th>
                <th className="py-1.5 px-2 text-right">Old Annual Int.</th>
                <th className="py-1.5 px-2 text-right">New Annual Int.</th>
                <th className="py-1.5 px-2 text-right text-emerald-300 font-bold">Annual Savings</th>
                <th className="py-1.5 px-2 text-right text-indigo-300 font-bold">Equity Gain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {annualSchedule.map((row) => (
                <tr key={row.year} className="even:bg-slate-50/70">
                  <td className="py-1 px-2 font-sans font-bold text-slate-900">{row.year}</td>
                  <td className="py-1 px-2 text-right">${Math.round(row.oldEndingBalance).toLocaleString()}</td>
                  <td className="py-1 px-2 text-right font-semibold text-slate-900">${Math.round(row.newEndingBalance).toLocaleString()}</td>
                  <td className="py-1 px-2 text-right text-slate-600">${Math.round(row.oldAnnualInterest).toLocaleString()}</td>
                  <td className="py-1 px-2 text-right text-slate-600">${Math.round(row.newAnnualInterest).toLocaleString()}</td>
                  <td className="py-1 px-2 text-right font-semibold text-emerald-700">${Math.round(row.annualSavings).toLocaleString()}</td>
                  <td className="py-1 px-2 text-right font-bold text-indigo-700">${Math.round(row.endingEquityDiff).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Compliance Notice */}
      <div className="border-t border-slate-300 pt-3 text-[9px] text-slate-500 leading-relaxed print-avoid-break">
        <p className="font-semibold text-slate-700">REFINANCE ADVISORY & REGULATORY NOTE:</p>
        <p>
          Calculations are simulated estimates based on user-entered parameters. Refinancing an existing mortgage may increase total finance charges over the life of the loan if the loan term is extended (the 30-year reset clock effect). This analysis does not include state transfer taxes, title insurance recording variations, or pre-payment penalty clauses of existing lienholders. Generated 100% locally in browser on TableView.dev.
        </p>
        <div className="flex justify-between items-center mt-2 text-slate-400">
          <span>Generated client-side via TableView.dev Mortgage Planning Engine</span>
          <span>Page 1 of Refinance Statement</span>
        </div>
      </div>
    </div>
  );
};

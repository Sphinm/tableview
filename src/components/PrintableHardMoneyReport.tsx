import React from 'react';
import { type HardMoneyInputs, type HardMoneyResult } from '../lib/hardMoneyCalculator';

interface PrintableHardMoneyReportProps {
  inputs: HardMoneyInputs;
  result: HardMoneyResult;
}

export const PrintableHardMoneyReport: React.FC<PrintableHardMoneyReportProps> = ({
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
                Fix & Flip Deal Sheet
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Hard Money & Bridge Loan Deal Underwriting Summary
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Rehab Financing, Holding Cost Modeling & Net Flip Profitability
            </p>
          </div>
          <div className="text-right text-xs text-slate-600 space-y-0.5">
            <div><span className="font-semibold text-slate-800">Date:</span> {currentDate}</div>
            <div><span className="font-semibold text-slate-800">Ref ID:</span> FLIP-{Math.round(result.totalLoanAmount % 100000).toString().padStart(5, '0')}</div>
            <div><span className="font-semibold text-slate-800">Rating:</span> {result.verdictLabel}</div>
          </div>
        </div>
      </div>

      {/* Headline Deal Metrics */}
      <div className="grid grid-cols-4 gap-3 mb-6 print-avoid-break">
        <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-500">Projected Net Profit</div>
          <div className={`text-xl font-black mt-0.5 ${result.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {fmt(result.netProfit)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{result.profitMarginPercent.toFixed(1)}% of ARV</div>
        </div>

        <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-500">Cash-on-Cash ROI</div>
          <div className="text-xl font-black text-indigo-700 mt-0.5">
            {result.roiPercent.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{result.annualizedRoiPercent.toFixed(1)}% Annualized</div>
        </div>

        <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-500">Total Capital Needed</div>
          <div className="text-xl font-black text-slate-900 mt-0.5">
            {fmt(result.initialCashRequired)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Down + Fees + Points</div>
        </div>

        <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-500">70% Rule Benchmark</div>
          <div className={`text-xl font-black mt-0.5 ${result.is70RuleCompliant ? 'text-emerald-700' : 'text-amber-700'}`}>
            {result.is70RuleCompliant ? 'Compliant' : 'Tight Margin'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">MAO: {fmt(result.maxAllowableOffer70Rule)}</div>
        </div>
      </div>

      {/* Two Column Cost Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Left: Property & Financing Details */}
        <div className="border border-slate-300 rounded-lg p-4 bg-slate-50/40">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5 mb-2.5">
            1. Property & Financing Breakdown
          </h2>
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Purchase Price:</td>
                <td className="py-1 font-semibold text-right text-slate-900 font-mono">{fmt(inputs.purchasePrice)}</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Rehabilitation Budget:</td>
                <td className="py-1 font-semibold text-right text-slate-900 font-mono">{fmt(inputs.rehabBudget)}</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">After Repair Value (ARV):</td>
                <td className="py-1 font-bold text-right text-indigo-700 font-mono">{fmt(inputs.afterRepairValue)}</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Purchase Loan ({inputs.ltvPercent}%):</td>
                <td className="py-1 text-right text-slate-900 font-mono">{fmt(result.purchaseLoanAmount)}</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Rehab Loan Escrow ({inputs.rehabFinancedPercent}%):</td>
                <td className="py-1 text-right text-slate-900 font-mono">{fmt(result.rehabLoanAmount)}</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Total Hard Money Loan:</td>
                <td className="py-1 font-bold text-right text-indigo-700 font-mono">{fmt(result.totalLoanAmount)}</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Interest Rate:</td>
                <td className="py-1 font-semibold text-right text-slate-900 font-mono">{inputs.interestRate.toFixed(2)}% Interest-Only</td>
              </tr>
              <tr className="bg-indigo-50/60 font-bold">
                <td className="py-1.5 px-1 text-indigo-900">Monthly Interest Payment:</td>
                <td className="py-1.5 px-1 text-right text-indigo-900 font-mono">{fmt(result.monthlyInterestPayment)}/mo</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right: Total Project Cost & Waterfall */}
        <div className="border border-slate-300 rounded-lg p-4 bg-slate-50/40">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5 mb-2.5">
            2. Total Project Cost Waterfall
          </h2>
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Purchase Price:</td>
                <td className="py-1 text-right text-slate-900 font-mono">{fmt(inputs.purchasePrice)}</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Rehab Budget:</td>
                <td className="py-1 text-right text-slate-900 font-mono">{fmt(inputs.rehabBudget)}</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Origination Points ({inputs.originationPoints} pts):</td>
                <td className="py-1 text-right text-slate-900 font-mono">{fmt(result.originationPointsCost)}</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Lender Underwriting Fees:</td>
                <td className="py-1 text-right text-slate-900 font-mono">{fmt(inputs.lenderUnderwritingFees)}</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Holding Costs ({inputs.projectDurationMonths} mos):</td>
                <td className="py-1 text-right text-slate-900 font-mono">{fmt(result.totalHoldingCosts)}</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Selling & Realtor Exit Costs:</td>
                <td className="py-1 text-right text-slate-900 font-mono">{fmt(result.totalExitCosts)}</td>
              </tr>
              <tr className="bg-slate-100 font-bold">
                <td className="py-1.5 px-1 text-slate-900">Total Project All-In Cost:</td>
                <td className="py-1.5 px-1 text-right text-slate-900 font-mono">{fmt(result.totalProjectCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="border-t border-slate-300 pt-3 text-[9px] text-slate-500 leading-relaxed print-avoid-break">
        <p className="font-semibold text-slate-700">HARD MONEY / BRIDGE FINANCING UNDERWRITING NOTICE:</p>
        <p>
          Hard money loans are asset-based, short-term debt instruments primarily governed by commercial underwriting guidelines. Interest rates and points vary heavily depending on borrower experience (number of flips completed in past 24-36 months), scope of work feasibility, and market liquidity. Construction draws require third-party inspection certifications before escrow releases. Generated 100% in-browser on TableView.dev.
        </p>
        <div className="flex justify-between items-center mt-2 text-slate-400">
          <span>Generated client-side via TableView.dev Fix & Flip Analytics</span>
          <span>Page 1 of Hard Money Deal Sheet</span>
        </div>
      </div>
    </div>
  );
};

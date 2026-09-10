import React from 'react';
import { type MortgageSummary, type AnnualAmortizationRow, type AmortizationRow } from '../lib/mortgageCalculator';

interface PrintableMortgageReportProps {
  homeValue: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  loanType: string;
  startMonth: number;
  startYear: number;
  propertyTaxYearly: number;
  homeInsuranceYearly: number;
  monthlyHoa: number;
  summary: MortgageSummary;
  annualSchedule: AnnualAmortizationRow[];
  monthlySchedule?: AmortizationRow[];
  scheduleView?: 'annual' | 'monthly';
  extraMonthlyPrincipal?: number;
}

export const PrintableMortgageReport: React.FC<PrintableMortgageReportProps> = ({
  homeValue,
  downPayment,
  loanAmount,
  interestRate,
  loanTermYears,
  loanType,
  startMonth,
  startYear,
  propertyTaxYearly,
  homeInsuranceYearly,
  monthlyHoa,
  summary,
  annualSchedule,
  monthlySchedule = [],
  scheduleView = 'annual',
  extraMonthlyPrincipal = 0,
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const downPaymentPct = ((downPayment / homeValue) * 100).toFixed(1);
  const totalMonthly = summary.totalMonthlyPayment;
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
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-300">
                Official Statement
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Residential Mortgage Amortization & PITI Statement
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Prepared for Financial Planning & Lender Loan Comparison · Generated 100% In-Browser
            </p>
          </div>
          <div className="text-right text-xs text-slate-600 space-y-0.5">
            <div><span className="font-semibold text-slate-800">Date:</span> {currentDate}</div>
            <div><span className="font-semibold text-slate-800">Ref ID:</span> MTG-{(homeValue % 100000).toString().padStart(5, '0')}-{loanTermYears}Y</div>
            <div><span className="font-semibold text-slate-800">Privacy:</span> Zero Cloud Upload</div>
          </div>
        </div>
      </div>

      {/* Overview Grid: Loan Specs & Key Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Loan Specs */}
        <div className="border-2 border-slate-300 rounded-lg p-4 bg-slate-50/70">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b-2 border-slate-300 pb-1.5 mb-2.5">
            1. Property & Financing Specifications
          </h2>
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b border-slate-200 py-1">
                <td className="py-1 text-slate-700 font-medium">Property / Home Value:</td>
                <td className="py-1 font-bold text-right text-slate-900 font-mono">${homeValue.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-slate-200 py-1">
                <td className="py-1 text-slate-700 font-medium">Down Payment:</td>
                <td className="py-1 font-semibold text-right text-slate-900 font-mono">${downPayment.toLocaleString()} ({downPaymentPct}%)</td>
              </tr>
              <tr className="border-b border-slate-200 py-1">
                <td className="py-1 text-slate-700 font-medium">Initial Principal Loan Amount:</td>
                <td className="py-1 font-black text-right text-indigo-700 font-mono">${loanAmount.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-slate-200 py-1">
                <td className="py-1 text-slate-700 font-medium">Note Interest Rate:</td>
                <td className="py-1 font-bold text-right text-slate-900 font-mono">{interestRate.toFixed(2)}% Fixed</td>
              </tr>
              <tr className="border-b border-slate-200 py-1">
                <td className="py-1 text-slate-700 font-medium">Loan Term & Type:</td>
                <td className="py-1 font-semibold text-right text-slate-900 font-mono">{loanTermYears} Years ({loanTermYears * 12} mo) · {loanType.toUpperCase()}</td>
              </tr>
              <tr>
                <td className="py-1 text-slate-700 font-medium">First Payment Date:</td>
                <td className="py-1 font-semibold text-right text-slate-900 font-mono">{startMonth}/{startYear}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Monthly Payment Structure (PITI) */}
        <div className="border-2 border-slate-300 rounded-lg p-4 bg-slate-50/70">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b-2 border-slate-300 pb-1.5 mb-2.5 flex justify-between">
            <span>2. Monthly Payment (PITI Breakdown)</span>
            <span className="text-indigo-700 font-black">${Math.round(totalMonthly).toLocaleString()}/mo</span>
          </h2>
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Principal & Interest (P&I):</td>
                <td className="py-1 font-semibold text-right text-slate-900">${Math.round(summary.monthlyPrincipalAndInterest).toLocaleString()}</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Estimated Property Taxes:</td>
                <td className="py-1 font-semibold text-right text-slate-900">${Math.round(propertyTaxYearly / 12).toLocaleString()}</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Homeowners Insurance:</td>
                <td className="py-1 font-semibold text-right text-slate-900">${Math.round(homeInsuranceYearly / 12).toLocaleString()}</td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">Private Mortgage Ins. (PMI):</td>
                <td className="py-1 font-semibold text-right text-slate-900">
                  {summary.monthlyPmi > 0 ? `$${Math.round(summary.monthlyPmi).toLocaleString()}` : '$0 (None / ≥20% equity)'}
                </td>
              </tr>
              <tr className="border-b border-slate-100 py-1">
                <td className="py-1 text-slate-600">HOA Dues / Assessment:</td>
                <td className="py-1 font-semibold text-right text-slate-900">${Math.round(monthlyHoa).toLocaleString()}</td>
              </tr>
              <tr className="bg-indigo-50/60 font-bold">
                <td className="py-1.5 px-1 text-indigo-900">Total Monthly Housing Cost:</td>
                <td className="py-1.5 px-1 text-right text-indigo-900 text-sm font-black">${Math.round(totalMonthly).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Lifetime Cost & Key Milestone Summary */}
      <div className="border border-slate-300 rounded-lg p-4 bg-slate-50/30 mb-6 print-avoid-break">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5 mb-2.5">
          3. Lifetime Obligation & Key Payoff Milestones
        </h2>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="p-2 bg-white rounded border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Payments</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">${Math.round(summary.totalOfAllPayments).toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">Over {loanTermYears} years</div>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Interest Paid</div>
            <div className="text-sm font-bold text-rose-600 mt-0.5">${Math.round(summary.totalInterestPaid).toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">{((summary.totalInterestPaid / (loanAmount || 1)) * 100).toFixed(0)}% of principal</div>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">PMI Cancellation</div>
            <div className="text-sm font-bold text-emerald-600 mt-0.5">
              {summary.isPmiRequired ? 'Auto at 78% LTV' : 'No PMI Required'}
            </div>
            <div className="text-[10px] text-slate-500">HPA 1998 standard</div>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Projected Payoff</div>
            <div className="text-sm font-bold text-indigo-700 mt-0.5">{startMonth}/{startYear + loanTermYears}</div>
            <div className="text-[10px] text-slate-500">{loanTermYears * 12} payments</div>
          </div>
        </div>

        {extraMonthlyPrincipal > 0 && (
          <div className="mt-3 p-2 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
            <span className="font-bold">Acceleration Scenario Active:</span> Making an additional ${extraMonthlyPrincipal.toLocaleString()} monthly principal payment significantly shortens loan duration and saves substantial compound interest.
          </div>
        )}
      </div>

      {/* Amortization Schedule Ledger (Monthly or Annual) */}
      <div className="mb-6">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b-2 border-slate-900 pb-1.5 mb-2.5 flex justify-between items-center">
          <span>
            {isMonthly
              ? `4. Complete Monthly Amortization Schedule (${monthlySchedule.length} Months)`
              : `4. Complete Annual Amortization Schedule (${loanTermYears} Years)`}
          </span>
          <span className="text-[10px] font-semibold text-slate-600">
            {loanTermYears}Y Fixed · {loanType.toUpperCase()}
          </span>
        </h2>

        {isMonthly ? (
          <table className="w-full text-[10px] border border-slate-300">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="py-1.5 px-2 text-left">Period</th>
                <th className="py-1.5 px-2 text-right">Starting Balance</th>
                <th className="py-1.5 px-2 text-right text-emerald-300 font-bold">Principal</th>
                <th className="py-1.5 px-2 text-right text-rose-300 font-bold">Interest</th>
                <th className="py-1.5 px-2 text-right text-slate-300">Taxes & Ins.</th>
                <th className="py-1.5 px-2 text-right font-bold text-white">Total Payment</th>
                <th className="py-1.5 px-2 text-right font-bold text-white">Ending Balance</th>
                <th className="py-1.5 px-2 text-right text-slate-300">Cumulative Interest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {monthlySchedule.map((row) => (
                <tr key={row.monthIndex} className="even:bg-slate-50/70">
                  <td className="py-1 px-2 font-sans font-bold text-slate-950">
                    {row.monthName} {row.year} <span className="text-slate-500 font-normal text-[9px]">(M{row.monthIndex})</span>
                  </td>
                  <td className="py-1 px-2 text-right text-slate-800">${Math.round(row.startingBalance).toLocaleString()}</td>
                  <td className="py-1 px-2 text-right text-emerald-700 font-semibold">${Math.round(row.principalPaid).toLocaleString()}</td>
                  <td className="py-1 px-2 text-right text-rose-700">${Math.round(row.interestPaid).toLocaleString()}</td>
                  <td className="py-1 px-2 text-right text-slate-600">${Math.round(row.propertyTax + row.homeInsurance).toLocaleString()}</td>
                  <td className="py-1 px-2 text-right font-bold text-slate-900">${Math.round(row.totalPayment).toLocaleString()}</td>
                  <td className="py-1 px-2 text-right font-bold text-slate-950">${Math.round(row.endingBalance).toLocaleString()}</td>
                  <td className="py-1 px-2 text-right text-slate-700">${Math.round(row.totalInterestToDate).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-[10px] border border-slate-300">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="py-1.5 px-2 text-left">Year</th>
                <th className="py-1.5 px-2 text-right">Starting Balance</th>
                <th className="py-1.5 px-2 text-right text-emerald-300 font-bold">Principal Paid</th>
                <th className="py-1.5 px-2 text-right text-rose-300 font-bold">Interest Paid</th>
                <th className="py-1.5 px-2 text-right text-slate-300">Taxes & Ins.</th>
                <th className="py-1.5 px-2 text-right font-bold text-white">Total Payment</th>
                <th className="py-1.5 px-2 text-right font-bold text-white">Ending Balance</th>
                <th className="py-1.5 px-2 text-right text-slate-300">Cumulative Interest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {annualSchedule.map((row) => (
                <tr key={row.year} className="even:bg-slate-50/70">
                  <td className="py-1 px-2 font-sans font-bold text-slate-950">Year {row.year}</td>
                  <td className="py-1 px-2 text-right text-slate-800">${Math.round(row.startingBalance).toLocaleString()}</td>
                  <td className="py-1 px-2 text-right text-emerald-700 font-semibold">${Math.round(row.principalPaid).toLocaleString()}</td>
                  <td className="py-1 px-2 text-right text-rose-700">${Math.round(row.interestPaid).toLocaleString()}</td>
                  <td className="py-1 px-2 text-right text-slate-600">${Math.round(row.propertyTax + row.homeInsurance).toLocaleString()}</td>
                  <td className="py-1 px-2 text-right font-bold text-slate-900">${Math.round(row.totalPayment).toLocaleString()}</td>
                  <td className="py-1 px-2 text-right font-bold text-slate-950">${Math.round(row.endingBalance).toLocaleString()}</td>
                  <td className="py-1 px-2 text-right text-slate-700">${Math.round(row.totalInterestToDate).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Compliance Notice & Institutional Footer */}
      <div className="border-t border-slate-300 pt-3 text-[9px] text-slate-500 leading-relaxed print-avoid-break">
        <p className="font-semibold text-slate-700">COMPLIANCE & TRUTH IN LENDING ACT (TILA) NOTICE:</p>
        <p>
          This mortgage analysis is produced for informational and financial comparison purposes only and does not constitute a commitment to lend, credit offer, formal Loan Estimate (LE), or Closing Disclosure (CD) under CFPB regulations (TRID/RESPA). Actual interest rates, annual percentage rates (APR), closing fees, property tax assessments, and insurance premiums will vary based on creditworthiness, property appraisal, down payment verification, and specific lender guidelines.
        </p>
        <div className="flex justify-between items-center mt-2 text-slate-400">
          <span>Generated client-side via TableView.dev Mortgage Planning Engine</span>
          <span>Page 1 of Amortization Statement</span>
        </div>
      </div>
    </div>
  );
};

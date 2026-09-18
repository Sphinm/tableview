import React from 'react';
import {
  type MortgageSummary,
  type AnnualAmortizationRow,
  type AmortizationRow,
  type CashToCloseBreakdown,
  type DtiAffordabilityResult,
  type FicoScoreTier,
  FICO_PROFILES
} from '../lib/mortgageCalculator';

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
  cashToClose?: CashToCloseBreakdown;
  dtiAnalysis?: DtiAffordabilityResult;
  ficoTier?: FicoScoreTier;
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
  cashToClose,
  dtiAnalysis,
  ficoTier = '760+',
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

      {/* Section 3: Cash to Close & Settlement Breakdown */}
      {cashToClose && (
        <div className="border-2 border-slate-300 rounded-lg p-4 bg-slate-50/50 mb-6 print-avoid-break">
          <div className="flex justify-between items-center border-b-2 border-slate-300 pb-1.5 mb-2.5">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-950">
              3. Estimated Cash to Close (Settlement Day Funds)
            </h2>
            <span className="text-sm font-black text-emerald-800 font-mono">
              Total Required: ${Math.round(cashToClose.totalCashToClose).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-slate-200 py-1">
                  <td className="py-1 text-slate-700 font-medium">Down Payment Equity:</td>
                  <td className="py-1 font-bold text-right text-slate-900 font-mono">${Math.round(cashToClose.downPayment).toLocaleString()}</td>
                </tr>
                <tr className="border-b border-slate-200 py-1">
                  <td className="py-1 text-slate-700 font-medium">Lender Origination & Processing:</td>
                  <td className="py-1 font-semibold text-right text-slate-900 font-mono">${Math.round(cashToClose.lenderFees).toLocaleString()}</td>
                </tr>
                <tr className="py-1">
                  <td className="py-1 text-slate-700 font-medium">Title & Settlement Attorney Fees:</td>
                  <td className="py-1 font-semibold text-right text-slate-900 font-mono">${Math.round(cashToClose.titleAndEscrow).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-slate-200 py-1">
                  <td className="py-1 text-slate-700 font-medium">Prepaids & Escrow Reserves (3-6 mo):</td>
                  <td className="py-1 font-semibold text-right text-slate-900 font-mono">${Math.round(cashToClose.prepaidsAndEscrow).toLocaleString()}</td>
                </tr>
                <tr className="border-b border-slate-200 py-1">
                  <td className="py-1 text-slate-700 font-medium">Third-Party Appraisal & Inspections:</td>
                  <td className="py-1 font-semibold text-right text-slate-900 font-mono">${Math.round(cashToClose.thirdPartyServices).toLocaleString()}</td>
                </tr>
                <tr className="py-1">
                  <td className="py-1 text-slate-700 font-medium">Government Recording & Transfer Taxes:</td>
                  <td className="py-1 font-semibold text-right text-slate-900 font-mono">${Math.round(cashToClose.governmentFees).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 4: Underwriting & Debt-to-Income (DTI) Qualification Review */}
      {dtiAnalysis && (
        <div className="border-2 border-slate-300 rounded-lg p-4 bg-slate-50/50 mb-6 print-avoid-break">
          <div className="flex justify-between items-center border-b-2 border-slate-300 pb-1.5 mb-2.5">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-950">
              4. Borrower Underwriting & Debt-to-Income (CFPB QM 28/43 Rule)
            </h2>
            <span className={`text-xs font-bold px-2 py-0.5 rounded border font-mono ${
              dtiAnalysis.isQualifiedMortgage
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-rose-100 text-rose-900 border-rose-300'
            }`}>
              {dtiAnalysis.isQualifiedMortgage ? 'QUALIFIED MORTGAGE (QM) CONFORMING' : 'DTI EXCEEDS 43% QM CAP'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3 text-xs text-center">
            <div className="p-2 bg-white rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-medium block">Gross Annual Income</span>
              <span className="font-bold text-slate-900 font-mono">${Math.round(dtiAnalysis.monthlyGrossIncome * 12).toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 block">${Math.round(dtiAnalysis.monthlyGrossIncome).toLocaleString()}/mo</span>
            </div>
            <div className="p-2 bg-white rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-medium block">Front-End DTI (Housing)</span>
              <span className={`font-bold font-mono text-sm ${dtiAnalysis.frontEndStatus === 'ideal' ? 'text-emerald-700' : 'text-slate-800'}`}>
                {dtiAnalysis.frontEndDti}%
              </span>
              <span className="text-[10px] text-slate-400 block">Benchmark: ≤ 28%</span>
            </div>
            <div className="p-2 bg-white rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-medium block">Back-End DTI (Total Debt)</span>
              <span className={`font-bold font-mono text-sm ${dtiAnalysis.backEndStatus === 'ideal' || dtiAnalysis.backEndStatus === 'acceptable' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {dtiAnalysis.backEndDti}%
              </span>
              <span className="text-[10px] text-slate-400 block">QM Conforming Cap: ≤ 43%</span>
            </div>
            <div className="p-2 bg-white rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-medium block">Credit Score Tier</span>
              <span className="font-bold text-indigo-700 font-mono text-sm">
                {ficoTier ? FICO_PROFILES[ficoTier]?.label || ficoTier : '760+'}
              </span>
              <span className="text-[10px] text-slate-400 block">
                LLPA: +{ficoTier ? FICO_PROFILES[ficoTier]?.llpaRateAdjustment : 0}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Lifetime Cost & Key Milestone Summary */}
      <div className="border border-slate-300 rounded-lg p-4 bg-slate-50/30 mb-6 print-avoid-break">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5 mb-2.5">
          5. Lifetime Obligation & Key Payoff Milestones
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
              ? `6. Complete Monthly Amortization Schedule (${monthlySchedule.length} Months)`
              : `6. Complete Annual Amortization Schedule (${loanTermYears} Years)`}
          </span>
          <span className="text-[10px] font-semibold text-slate-600">
            {loanTermYears}Y Fixed · {loanType.toUpperCase()}
          </span>
        </h2>

        {isMonthly ? (
          <table className="w-full text-[10px] border border-slate-300">
            <thead className="bg-slate-100 text-slate-900 border-b border-slate-300">
              <tr>
                <th className="py-1.5 px-2 text-left font-bold">Period</th>
                <th className="py-1.5 px-2 text-right font-bold">Starting Balance</th>
                <th className="py-1.5 px-2 text-right text-emerald-700 font-bold">Principal</th>
                <th className="py-1.5 px-2 text-right text-rose-700 font-bold">Interest</th>
                <th className="py-1.5 px-2 text-right text-slate-700 font-bold">Taxes & Ins.</th>
                <th className="py-1.5 px-2 text-right font-bold text-slate-950">Total Payment</th>
                <th className="py-1.5 px-2 text-right font-bold text-slate-950">Ending Balance</th>
                <th className="py-1.5 px-2 text-right text-slate-700 font-bold">Cumulative Interest</th>
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
            <thead className="bg-slate-100 text-slate-900 border-b border-slate-300">
              <tr>
                <th className="py-1.5 px-2 text-left font-bold">Year</th>
                <th className="py-1.5 px-2 text-right font-bold">Starting Balance</th>
                <th className="py-1.5 px-2 text-right text-emerald-700 font-bold">Principal Paid</th>
                <th className="py-1.5 px-2 text-right text-rose-700 font-bold">Interest Paid</th>
                <th className="py-1.5 px-2 text-right text-slate-700 font-bold">Taxes & Ins.</th>
                <th className="py-1.5 px-2 text-right font-bold text-slate-950">Total Payment</th>
                <th className="py-1.5 px-2 text-right font-bold text-slate-950">Ending Balance</th>
                <th className="py-1.5 px-2 text-right text-slate-700 font-bold">Cumulative Interest</th>
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

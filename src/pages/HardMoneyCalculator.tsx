import { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Hammer,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Percent
} from 'lucide-react';
import {
  calculateHardMoney,
  type HardMoneyInputs,
  type HardMoneyResult
} from '../lib/hardMoneyCalculator';
import { updatePageMeta } from '../lib/router';

interface HardMoneyCalculatorProps {
  onTrySample?: () => void;
}

export const HardMoneyCalculator = ({ onTrySample: _onTrySample }: HardMoneyCalculatorProps) => {
  useEffect(() => {
    updatePageMeta(
      'Hard Money Loan Calculator — Fix & Flip Profit, Points & 70% Rule Tool | TableView.dev',
      'Free in-browser Hard Money Loan calculator for real estate flippers. Calculate points, interest-only holding costs, 70% rule Maximum Allowable Offer (MAO), net flip profit, and annualized ROI.',
      '/hard-money-calculator'
    );
  }, []);

  // Form State
  const [purchasePrice, setPurchasePrice] = useState<number>(240000);
  const [rehabBudget, setRehabBudget] = useState<number>(65000);
  const [afterRepairValue, setAfterRepairValue] = useState<number>(390000); // ARV
  const [ltvPercent, setLtvPercent] = useState<number>(85);
  const [rehabFinancedPercent, setRehabFinancedPercent] = useState<number>(100);
  const [interestRate, setInterestRate] = useState<number>(11.0);
  const [originationPoints, setOriginationPoints] = useState<number>(2.0);
  const [lenderUnderwritingFees, setLenderUnderwritingFees] = useState<number>(1500);
  const [projectDurationMonths, setProjectDurationMonths] = useState<number>(6);
  const [monthlyHoldingCosts, setMonthlyHoldingCosts] = useState<number>(650);
  const [realtorCommissionPercent, setRealtorCommissionPercent] = useState<number>(5.0);
  const [exitClosingCostsPercent, setExitClosingCostsPercent] = useState<number>(1.5);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Quick Presets
  const arvPresets = [
    { purchase: 180000, rehab: 45000, arv: 290000, label: 'Starter Flip ($290k ARV)' },
    { purchase: 260000, rehab: 70000, arv: 420000, label: 'Suburban Flip ($420k ARV)' },
    { purchase: 450000, rehab: 110000, arv: 720000, label: 'High-End ($720k ARV)' }
  ];

  const inputs: HardMoneyInputs = useMemo(
    () => ({
      purchasePrice,
      rehabBudget,
      afterRepairValue,
      ltvPercent,
      rehabFinancedPercent,
      interestRate,
      originationPoints,
      lenderUnderwritingFees,
      projectDurationMonths,
      monthlyHoldingCosts,
      realtorCommissionPercent,
      exitClosingCostsPercent
    }),
    [
      purchasePrice,
      rehabBudget,
      afterRepairValue,
      ltvPercent,
      rehabFinancedPercent,
      interestRate,
      originationPoints,
      lenderUnderwritingFees,
      projectDurationMonths,
      monthlyHoldingCosts,
      realtorCommissionPercent,
      exitClosingCostsPercent
    ]
  );

  const result: HardMoneyResult = useMemo(() => calculateHardMoney(inputs), [inputs]);

  const currencyFmt = (n: number) =>
    n.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

  const currencyDecFmt = (n: number) =>
    n.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  // Export Deal Sheet to Excel
  const handleExportExcel = () => {
    const summaryData = [
      { Parameter: 'Purchase Price', Value: purchasePrice },
      { Parameter: 'Rehab / Renovation Budget', Value: rehabBudget },
      { Parameter: 'After Repair Value (ARV)', Value: afterRepairValue },
      { Parameter: 'Total Loan Amount', Value: result.totalLoanAmount },
      { Parameter: 'Purchase Loan', Value: result.purchaseLoanAmount },
      { Parameter: 'Rehab Loan Financed', Value: result.rehabLoanAmount },
      { Parameter: 'Initial Cash Out of Pocket', Value: result.initialCashRequired },
      { Parameter: 'Monthly Interest Payment', Value: result.monthlyInterestPayment },
      { Parameter: 'Total Holding Costs', Value: result.totalHoldingCosts },
      { Parameter: 'Total Project Cost', Value: result.totalProjectCost },
      { Parameter: '70% Rule MAO', Value: result.maxAllowableOffer70Rule },
      { Parameter: 'Estimated Net Profit', Value: result.netProfit },
      { Parameter: 'Cash on Cash ROI %', Value: `${result.roiPercent}%` },
      { Parameter: 'Annualized ROI %', Value: `${result.annualizedRoiPercent}%` }
    ];

    const worksheet = XLSX.utils.json_to_sheet(summaryData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fix & Flip Analysis');
    XLSX.writeFile(workbook, `hard_money_deal_${purchasePrice}_arv_${afterRepairValue}.xlsx`);
  };

  const handleExportCsv = () => {
    const csvContent =
      'Parameter,Value\n' +
      `Purchase Price,${purchasePrice}\n` +
      `Rehab Budget,${rehabBudget}\n` +
      `After Repair Value,${afterRepairValue}\n` +
      `Total Loan Amount,${result.totalLoanAmount}\n` +
      `Initial Cash Required,${result.initialCashRequired}\n` +
      `Monthly Interest,${result.monthlyInterestPayment}\n` +
      `Total Holding Costs,${result.totalHoldingCosts}\n` +
      `Net Profit,${result.netProfit}\n` +
      `ROI Percent,${result.roiPercent}%\n` +
      `Annualized ROI,${result.annualizedRoiPercent}%\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `fix_and_flip_deal_${purchasePrice}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Hero Header */}
      <section className="relative pt-12 pb-8 border-b border-slate-800 bg-gradient-to-b from-amber-950/20 via-slate-950 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-3">
            <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 font-semibold">
              FIX & FLIP INVESTOR SUITE
            </span>
            <span>•</span>
            <span className="text-slate-400">Private Bridge Lending Analysis</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-100">
            Hard Money <span className="text-amber-400">Loan Calculator</span>
          </h1>

          <p className="mt-3 max-w-3xl text-sm sm:text-base text-slate-400 leading-relaxed">
            Analyze short-term bridge financing, upfront points, monthly interest-only payments, and rehab budget draws. Accurately verify the <strong>70% Rule of House Flipping</strong> and net cash-on-cash ROI.
          </p>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 mt-6 flex-wrap">
            <span className="text-xs text-slate-400">Deal Presets:</span>
            {arvPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPurchasePrice(preset.purchase);
                  setRehabBudget(preset.rehab);
                  setAfterRepairValue(preset.arv);
                }}
                className="px-3 py-1 rounded-lg text-xs font-mono bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-slate-100 transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Inputs (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Hammer className="size-4.5 text-amber-400" />
                <span>Property & Renovation Numbers</span>
              </h2>

              {/* Purchase Price */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex justify-between">
                  <span>Acquisition / Purchase Price</span>
                  <span className="text-slate-100 font-mono font-bold">{currencyFmt(purchasePrice)}</span>
                </label>
                <div className="relative">
                  <DollarSign className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="number"
                    value={purchasePrice || ''}
                    onChange={(e) => setPurchasePrice(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Rehab Budget & ARV */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Rehab Budget ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      value={rehabBudget || ''}
                      onChange={(e) => setRehabBudget(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    After Repair Value (ARV)
                  </label>
                  <div className="relative">
                    <DollarSign className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      value={afterRepairValue || ''}
                      onChange={(e) => setAfterRepairValue(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Financing Terms */}
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pt-3 pb-3">
                <DollarSign className="size-4.5 text-emerald-400" />
                <span>Hard Money Loan Terms</span>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Purchase LTV (%)
                  </label>
                  <div className="relative">
                    <Percent className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      value={ltvPercent || ''}
                      onChange={(e) => setLtvPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Rehab Financed (%)
                  </label>
                  <div className="relative">
                    <Percent className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      value={rehabFinancedPercent || ''}
                      onChange={(e) => setRehabFinancedPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Interest Rate (%)
                  </label>
                  <div className="relative">
                    <Percent className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      step="0.25"
                      value={interestRate || ''}
                      onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Origination Points
                  </label>
                  <div className="relative">
                    <Percent className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      step="0.5"
                      value={originationPoints || ''}
                      onChange={(e) => setOriginationPoints(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Underwriting / Admin ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      step="100"
                      value={lenderUnderwritingFees || ''}
                      onChange={(e) => setLenderUnderwritingFees(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Project Timeline & Holding */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Holding Period (Months)
                  </label>
                  <select
                    value={projectDurationMonths}
                    onChange={(e) => setProjectDurationMonths(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value={3}>3 Months (Rapid Flip)</option>
                    <option value={6}>6 Months (Standard)</option>
                    <option value={9}>9 Months (Major Rehab)</option>
                    <option value={12}>12 Months (Heavy Ground-Up)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Monthly Holding Cost ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      value={monthlyHoldingCosts || ''}
                      onChange={(e) => setMonthlyHoldingCosts(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Selling Costs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Realtor Commission (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={realtorCommissionPercent || ''}
                    onChange={(e) => setRealtorCommissionPercent(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Exit Closing Cost (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={exitClosingCostsPercent || ''}
                    onChange={(e) => setExitClosingCostsPercent(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Profit & 70% Rule Dashboard (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Net Profit Hero Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 shadow-2xl">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                    Estimated Net Flip Profit
                  </span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span
                      className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                        result.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {result.netProfit >= 0 ? '+' : ''}
                      {currencyFmt(result.netProfit)}
                    </span>
                    <span
                      className={`text-sm font-semibold px-2.5 py-1 rounded-md border ${
                        result.dealVerdict === 'excellent'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          : result.dealVerdict === 'profitable'
                          ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
                          : result.dealVerdict === 'marginal'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                          : 'bg-red-950/80 text-red-300 border-red-800'
                      }`}
                    >
                      {result.verdictLabel}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Cash-on-Cash Return</span>
                  <span className="text-2xl font-black font-mono text-amber-400 mt-0.5 block">
                    {result.roiPercent}%
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Annualized: {result.annualizedRoiPercent}%
                  </span>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {result.verdictDescription}
              </p>

              {/* 70% Rule Banner */}
              <div className="mt-5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {result.is70RuleCompliant ? (
                    <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                      <ShieldCheck className="size-4" />
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
                      <AlertTriangle className="size-4" />
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      70% House Flipping Rule Check
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Maximum Allowable Offer (MAO): <strong className="text-slate-200">{currencyFmt(result.maxAllowableOffer70Rule)}</strong>
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold font-mono px-2 py-1 rounded ${
                    result.is70RuleCompliant
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {result.is70RuleCompliant ? 'PASSES 70% RULE' : 'EXCEEDS 70% TARGET'}
                </span>
              </div>
            </div>

            {/* Financial Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Total Loan Amount</span>
                <span className="text-base font-bold font-mono text-slate-100 mt-0.5 block">
                  {currencyFmt(result.totalLoanAmount)}
                </span>
                <span className="text-[10px] text-slate-500">Purchase + Rehab</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Initial Cash Required</span>
                <span className="text-base font-bold font-mono text-amber-400 mt-0.5 block">
                  {currencyFmt(result.initialCashRequired)}
                </span>
                <span className="text-[10px] text-slate-500">Down + Points + Fees</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Monthly Interest</span>
                <span className="text-base font-bold font-mono text-slate-100 mt-0.5 block">
                  {currencyDecFmt(result.monthlyInterestPayment)}
                </span>
                <span className="text-[10px] text-slate-500">Interest-only</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Total Project Cost</span>
                <span className="text-base font-bold font-mono text-slate-100 mt-0.5 block">
                  {currencyFmt(result.totalProjectCost)}
                </span>
                <span className="text-[10px] text-slate-500">All-in basis</span>
              </div>
            </div>

            {/* Comprehensive Cost Waterfall Table */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
                <span>Total Project Cost Waterfall</span>
                <span className="text-xs font-mono text-slate-400">
                  Total Holding: {currencyFmt(result.totalInterestPaid + result.totalHoldingCosts)}
                </span>
              </h3>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300">1. Property Acquisition Price</span>
                  <span className="text-slate-100 font-bold">{currencyFmt(purchasePrice)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300">2. Rehab & Construction Budget</span>
                  <span className="text-slate-100">{currencyFmt(rehabBudget)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300">
                    3. Lender Origination Points ({originationPoints} pts) & Fees
                  </span>
                  <span className="text-slate-100">{currencyFmt(result.originationPointsCost + lenderUnderwritingFees)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300">
                    4. Holding Interest ({projectDurationMonths} mos @ {interestRate}%)
                  </span>
                  <span className="text-amber-400">{currencyDecFmt(result.totalInterestPaid)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300">
                    5. Utilities, Property Tax, Insurance Holding Costs
                  </span>
                  <span className="text-slate-100">{currencyFmt(result.totalHoldingCosts)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300">
                    6. Exit Selling Realtor Commission ({realtorCommissionPercent}%) & Closing
                  </span>
                  <span className="text-slate-100">{currencyFmt(result.totalExitCosts)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 font-bold text-sm">
                  <span className="text-emerald-400">Gross Sale Price (ARV)</span>
                  <span className="text-emerald-400">{currencyFmt(afterRepairValue)}</span>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-xs font-semibold text-emerald-300 cursor-pointer transition-colors"
                >
                  <FileSpreadsheet className="size-4" />
                  <span>Download Deal Sheet (.xlsx)</span>
                </button>
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 cursor-pointer transition-colors"
                >
                  <Download className="size-3.5" />
                  <span>CSV</span>
                </button>
              </div>

              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white cursor-pointer transition-colors"
              >
                {copiedLink ? 'Link Copied!' : 'Share This Deal'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

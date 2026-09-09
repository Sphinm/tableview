import { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Server,
  FileSpreadsheet,
  Sparkles,
  TrendingDown,
  HardDrive
} from 'lucide-react';
import {
  calculateSnowflakeCost,
  WAREHOUSE_CREDITS,
  EDITION_DEFAULTS,
  type SnowflakeInputs,
  type SnowflakeWarehouseSize,
  type SnowflakeEdition,
  type SnowflakeResult
} from '../lib/snowflakeCalculator';
import { updatePageMeta } from '../lib/router';

interface SnowflakeCalculatorProps {
  onTrySample?: () => void;
}

export const SnowflakeCalculator = ({ onTrySample: _onTrySample }: SnowflakeCalculatorProps) => {
  useEffect(() => {
    updatePageMeta(
      'Snowflake Cost Calculator — Warehouse Sizing, Credits & FinOps Estimator | TableView.dev',
      'Free in-browser Snowflake cost and credit calculator. Estimate monthly compute, multi-cluster warehouse autoscaling, storage, and auto-suspend FinOps savings.',
      '/snowflake-cost-calculator'
    );
  }, []);

  // Form State
  const [edition, setEdition] = useState<SnowflakeEdition>('enterprise');
  const [warehouseSize, setWarehouseSize] = useState<SnowflakeWarehouseSize>('Medium');
  const [clusterCount, setClusterCount] = useState<number>(1);
  const [activeHoursPerDay, setActiveHoursPerDay] = useState<number>(8);
  const [activeDaysPerMonth, setActiveDaysPerMonth] = useState<number>(22);
  const [storageTb, setStorageTb] = useState<number>(15);
  const [storagePricingTier, setStoragePricingTier] = useState<'capacity' | 'on_demand'>('capacity');
  const [autoSuspendEfficiency, setAutoSuspendEfficiency] = useState<number>(20);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const inputs: SnowflakeInputs = useMemo(
    () => ({
      edition,
      warehouseSize,
      clusterCount,
      activeHoursPerDay,
      activeDaysPerMonth,
      storageTb,
      storagePricingTier,
      autoSuspendEfficiency
    }),
    [
      edition,
      warehouseSize,
      clusterCount,
      activeHoursPerDay,
      activeDaysPerMonth,
      storageTb,
      storagePricingTier,
      autoSuspendEfficiency
    ]
  );

  const result: SnowflakeResult = useMemo(() => calculateSnowflakeCost(inputs), [inputs]);

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

  const handleExportExcel = () => {
    const summaryData = [
      { Parameter: 'Snowflake Edition', Value: EDITION_DEFAULTS[edition].name },
      { Parameter: 'Warehouse Size', Value: warehouseSize },
      { Parameter: 'Credits Per Hour (Per Cluster)', Value: WAREHOUSE_CREDITS[warehouseSize] },
      { Parameter: 'Average Cluster Count', Value: clusterCount },
      { Parameter: 'Active Hours Per Day', Value: activeHoursPerDay },
      { Parameter: 'Active Days Per Month', Value: activeDaysPerMonth },
      { Parameter: 'Compressed Storage in TB', Value: storageTb },
      { Parameter: 'Total Monthly Credits', Value: result.creditsPerMonth },
      { Parameter: 'Total Annual Credits', Value: result.creditsPerYear },
      { Parameter: 'Monthly Compute Cost', Value: result.monthlyComputeCost },
      { Parameter: 'Monthly Storage Cost', Value: result.monthlyStorageCost },
      { Parameter: 'Total Monthly Snowflake Bill', Value: result.totalMonthlyCost },
      { Parameter: 'Total Annual Snowflake Bill', Value: result.totalAnnualCost },
      { Parameter: 'Auto-Suspend FinOps Savings (Mo)', Value: result.potentialAutoSuspendSavingsMonthly },
      { Parameter: 'Annual Pre-Commit Savings Potential', Value: result.annualCommittedDiscountSavings }
    ];

    const worksheet = XLSX.utils.json_to_sheet(summaryData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Snowflake Estimate');
    XLSX.writeFile(workbook, `snowflake_cost_estimate_${warehouseSize}.xlsx`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Hero Header */}
      <section className="relative pt-12 pb-8 border-b border-slate-800 bg-gradient-to-b from-cyan-950/20 via-slate-950 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-3">
            <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 font-semibold">
              DATA ENGINEERING & FINOPS
            </span>
            <span>•</span>
            <span className="text-slate-400">Cloud Data Warehouse Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-100">
            Snowflake Cost <span className="text-cyan-400">Calculator</span>
          </h1>

          <p className="mt-3 max-w-3xl text-sm sm:text-base text-slate-400 leading-relaxed">
            Estimate Snowflake compute credits, warehouse right-sizing, multi-cluster autoscaling, and storage costs. Simulate <strong>auto-suspend optimization</strong> and enterprise pre-commitment discounts.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Server className="size-4.5 text-cyan-400" />
                <span>Warehouse Configuration</span>
              </h2>

              {/* Edition Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Snowflake Edition
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['standard', 'enterprise', 'business_critical'] as SnowflakeEdition[]).map((ed) => (
                    <button
                      key={ed}
                      type="button"
                      onClick={() => setEdition(ed)}
                      className={`p-2.5 rounded-xl text-xs font-mono border transition-all cursor-pointer text-center ${
                        edition === ed
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold capitalize">{ed.replace('_', ' ')}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        ${EDITION_DEFAULTS[ed].pricePerCredit}/credit
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Warehouse Size (T-Shirt Size Picker) */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 flex justify-between">
                  <span>Warehouse Size</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    {warehouseSize} ({WAREHOUSE_CREDITS[warehouseSize]} credits/hr)
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(WAREHOUSE_CREDITS) as SnowflakeWarehouseSize[]).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setWarehouseSize(size)}
                      className={`p-2 rounded-xl text-xs font-mono border transition-all cursor-pointer text-center ${
                        warehouseSize === size
                          ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-sm'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-semibold truncate">{size}</div>
                      <div className="text-[10px] opacity-75">{WAREHOUSE_CREDITS[size]} cr/hr</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Multi-Cluster Autoscaling */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Average Active Clusters (Multi-Cluster)
                  </label>
                  <span className="text-xs font-mono text-cyan-400 font-bold">{clusterCount} cluster(s)</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={clusterCount}
                  onChange={(e) => setClusterCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Runtime Schedules */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Hours Active / Day
                  </label>
                  <select
                    value={activeHoursPerDay}
                    onChange={(e) => setActiveHoursPerDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none"
                  >
                    <option value={4}>4 Hours (Light Batch)</option>
                    <option value={8}>8 Hours (Business Day)</option>
                    <option value={12}>12 Hours (Extended)</option>
                    <option value={24}>24 Hours (Continuous 24/7)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Active Days / Month
                  </label>
                  <select
                    value={activeDaysPerMonth}
                    onChange={(e) => setActiveDaysPerMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none"
                  >
                    <option value={22}>22 Days (Weekdays Only)</option>
                    <option value={30}>30 Days (Every Day)</option>
                  </select>
                </div>
              </div>

              {/* Storage in TB & Pricing Model */}
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex justify-between">
                    <span>Compressed Storage in Snowflake (TB)</span>
                    <span className="text-slate-100 font-mono font-bold">{storageTb} TB</span>
                  </label>
                  <div className="relative">
                    <HardDrive className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      value={storageTb || ''}
                      onChange={(e) => setStorageTb(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setStoragePricingTier('capacity')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-mono border transition-colors cursor-pointer ${
                      storagePricingTier === 'capacity'
                        ? 'bg-cyan-950/80 border-cyan-600 text-cyan-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Capacity ($23/TB)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStoragePricingTier('on_demand')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-mono border transition-colors cursor-pointer ${
                      storagePricingTier === 'on_demand'
                        ? 'bg-cyan-950/80 border-cyan-600 text-cyan-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    On-Demand ($40/TB)
                  </button>
                </div>
              </div>

              {/* FinOps Auto-Suspend Simulator */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-amber-400" />
                    Auto-Suspend Optimization
                  </label>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {autoSuspendEfficiency}% Savings
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40}
                  step={5}
                  value={autoSuspendEfficiency}
                  onChange={(e) => setAutoSuspendEfficiency(Number(e.target.value))}
                  className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-[11px] text-slate-400">
                  Reduces idle time billing by aggressively tuning auto-suspend down to 60 seconds.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Cost Breakdown & FinOps Insights (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Total Cost Hero Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 shadow-2xl">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                    Estimated Monthly Snowflake Bill
                  </span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-cyan-400">
                      {currencyFmt(result.totalMonthlyCost)}
                    </span>
                    <span className="text-xs font-mono text-slate-400">/ month</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Annualized Spend</span>
                  <span className="text-2xl font-black font-mono text-slate-100 mt-0.5 block">
                    {currencyFmt(result.totalAnnualCost)}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {result.creditsPerYear.toLocaleString()} Credits / year
                  </span>
                </div>
              </div>

              {/* Progress Bar: Compute vs Storage */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-cyan-400" />
                    Compute: {currencyFmt(result.monthlyComputeCost)} ({result.computePercentage}%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-indigo-400" />
                    Storage: {currencyFmt(result.monthlyStorageCost)} ({result.storagePercentage}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                  <div
                    className="h-full bg-cyan-500 transition-all duration-300"
                    style={{ width: `${result.computePercentage}%` }}
                  />
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${result.storagePercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* FinOps Savings Opportunities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 mb-1">
                  <TrendingDown className="size-4" />
                  Auto-Suspend Waste Saved
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400">
                  {currencyFmt(result.potentialAutoSuspendSavingsMonthly)}/mo
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Saved monthly by eliminating idle warehouse runway between scheduled dbt jobs.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 mb-1">
                  <Sparkles className="size-4 text-amber-400" />
                  Pre-Commit Discount Potential
                </div>
                <div className="text-2xl font-black font-mono text-indigo-300">
                  ~{currencyFmt(result.annualCommittedDiscountSavings)}/yr
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Estimated annual savings if negotiating a 1-year prepaid capacity contract.
                </p>
              </div>
            </div>

            {/* Detailed Line-Item Breakdown Table */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
                <span>Detailed Cost Summary</span>
                <span className="text-xs font-mono text-slate-400">
                  Credits consumed: {result.creditsPerMonth} / month
                </span>
              </h3>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300">
                    Warehouse Compute ({warehouseSize} × {clusterCount} cluster @ {result.effectivePricePerCredit.toFixed(2)}/cr)
                  </span>
                  <span className="text-slate-100 font-bold">{currencyDecFmt(result.monthlyComputeCost)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300">
                    Storage ({storageTb} TB @ ${storagePricingTier === 'capacity' ? '23' : '40'}/TB)
                  </span>
                  <span className="text-slate-100">{currencyDecFmt(result.monthlyStorageCost)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300">
                    Cloud Services Layer (Free pool up to 10% compute)
                  </span>
                  <span className="text-emerald-400">$0.00 (Covered)</span>
                </div>
                <div className="flex justify-between items-center pt-2 text-sm font-bold">
                  <span className="text-cyan-400">Total Monthly Cost</span>
                  <span className="text-cyan-400">{currencyFmt(result.totalMonthlyCost)}</span>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-xs font-semibold text-emerald-300 cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="size-4" />
                <span>Export FinOps Spreadsheet (.xlsx)</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white cursor-pointer transition-colors"
              >
                {copiedLink ? 'Link Copied!' : 'Share Estimate'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

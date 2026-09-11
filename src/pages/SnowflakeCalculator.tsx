import { useState, useMemo, useEffect } from 'react';
import {
  Server,
  FileSpreadsheet,
  Sparkles,
  TrendingDown,
  HardDrive,
  CheckCircle2,
  Layers,
  ShieldCheck
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
import { CALCULATOR_META } from '../data/routeMeta';
import { MethodologyDisclosure } from '../components/MethodologyDisclosure';
import { AdSlot } from '../components/AdSlot';
import { CalculatorFaqSection } from '../components/CalculatorFaqSection';
import { RelatedCalculators } from '../components/RelatedCalculators';

const snowflakeSchemas = [
  {
    '@type': 'WebApplication',
    name: 'Snowflake Warehouse Cost & Credit Calculator',
    url: 'https://tableview.dev/snowflake-cost-calculator',
    description: 'Free Snowflake cost estimator for data teams and FinOps engineers. Accurately calculate warehouse credit consumption, multi-cluster autoscaling, compressed storage tiers, and auto-suspend savings.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  },
  {
    '@type': 'SoftwareApplication',
    name: 'Snowflake FinOps Cost Optimization Suite',
    description: 'Interactive cost modeling tool for Snowflake Virtual Warehouses, Standard/Enterprise/Business Critical editions, and S3/Azure storage.',
    applicationCategory: 'DeveloperApplication'
  },
  {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://tableview.dev/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Cloud & FinOps Calculators',
        item: 'https://tableview.dev/snowflake-cost-calculator'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Snowflake Cost Calculator',
        item: 'https://tableview.dev/snowflake-cost-calculator'
      }
    ]
  },
  {
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does Snowflake calculate virtual warehouse credit consumption?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Snowflake compute is billed in credits per second, with a 60-second minimum charge every time a warehouse starts or resizes. T-shirt sizes scale exponentially in powers of 2: X-Small consumes 1 credit/hour, Small consumes 2 credits/hour, Medium consumes 4, Large consumes 8, X-Large consumes 16, and up to 6X-Large at 512 credits/hour.'
        }
      },
      {
        '@type': 'Question',
        name: 'What is the price per Snowflake credit across editions?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'On-demand list prices are typically $2.00 per credit for Standard Edition, $3.00 for Enterprise Edition (which includes multi-cluster warehouses and 90-day Time Travel), and $4.00 for Business Critical Edition (which includes HIPAA/PCI compliance, Tri-Secret Secure customer-managed keys, and private networking links).'
        }
      },
      {
        '@type': 'Question',
        name: 'How does Multi-Cluster Warehouse (MCW) autoscaling affect cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Multi-cluster warehouses (available on Enterprise and above) scale horizontally by spinning up identical warehouse clusters (e.g., Min: 1, Max: 4) to eliminate query queue times during peak dashboard spikes. Cost is strictly additive: 3 active Medium clusters running for 1 hour consume 3 × 4 = 12 credits.'
        }
      },
      {
        '@type': 'Question',
        name: 'What is the recommended Auto-Suspend setting for Snowflake warehouses?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For interactive BI dashboards and ad-hoc analytics, set AUTO_SUSPEND = 60 (1 minute). Because Snowflake bills by the second after the initial 60 seconds, reducing the auto-suspend window from the default 10 minutes down to 1 minute frequently slashes idle compute spend by 25% to 50%.'
        }
      },
      {
        '@type': 'Question',
        name: 'How much does Snowflake storage cost per TB?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'On-demand capacity storage is billed at $40 per TB per month, while committed pre-purchased capacity contracts discount storage down to approximately $23 per TB per month. Snowflake automatically compresses data upon ingestion (typically achieving a 3x to 5x compression factor).'
        }
      },
      {
        '@type': 'Question',
        name: 'Should I scale up (larger warehouse) or scale out (multi-cluster)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Scale up (e.g. Medium to Large) when you need to speed up a single heavy ETL job, large aggregation, or memory-intensive query. Scale out (multi-cluster) when hundreds of concurrent users or BI tools like Tableau/Looker are experiencing query queuing delays.'
        }
      }
    ]
  }
];

interface SnowflakeCalculatorProps {
  onTrySample?: () => void;
}

export const SnowflakeCalculator = ({ onTrySample: _onTrySample }: SnowflakeCalculatorProps) => {
  useEffect(() => {
    updatePageMeta(
      CALCULATOR_META['/snowflake-cost-calculator'].title,
      CALCULATOR_META['/snowflake-cost-calculator'].description,
      CALCULATOR_META['/snowflake-cost-calculator'].canonical,
      snowflakeSchemas
    );
  }, []);

  const getNumQuery = (name: string, fallback: number): number => {
    try {
      const p = new URLSearchParams(window.location.search).get(name);
      if (p !== null && !isNaN(Number(p)) && Number(p) > 0) return Number(p);
    } catch {}
    return fallback;
  };

  const getStringQuery = <T extends string>(name: string, fallback: T): T => {
    try {
      const p = new URLSearchParams(window.location.search).get(name);
      if (p !== null) return p as T;
    } catch {}
    return fallback;
  };

  // Form State initialized with URL params
  const [edition, setEdition] = useState<SnowflakeEdition>(() => getStringQuery('edition', 'enterprise'));
  const [warehouseSize, setWarehouseSize] = useState<SnowflakeWarehouseSize>(() => getStringQuery('size', 'Medium'));
  const [clusterCount, setClusterCount] = useState<number>(() => getNumQuery('clusters', 1));
  const [activeHoursPerDay, setActiveHoursPerDay] = useState<number>(() => getNumQuery('hours', 8));
  const [activeDaysPerMonth, setActiveDaysPerMonth] = useState<number>(() => getNumQuery('days', 22));
  const [storageTb, setStorageTb] = useState<number>(() => getNumQuery('storage', 15));
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

  const handleExportExcel = async () => {
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

    const XLSX = await import('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(summaryData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Snowflake Estimate');
    XLSX.writeFile(workbook, `snowflake_cost_estimate_${warehouseSize}.xlsx`);
  };

  const handleCopyLink = () => {
    try {
      const params = new URLSearchParams();
      params.set('edition', edition);
      params.set('size', warehouseSize);
      params.set('clusters', String(clusterCount));
      params.set('hours', String(activeHoursPerDay));
      params.set('days', String(activeDaysPerMonth));
      params.set('storage', String(storageTb));
      const fullUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', fullUrl);
      navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    // data-sentry-mask: warehouse sizes and spend figures are the user's own cloud bill.
    <div data-sentry-mask="true" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
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

        {/* Section 3: Snowflake Sizing Matrix, FinOps Playbook & Educational Guide */}
        <div className="mt-16 pt-10 border-t border-slate-800 space-y-12">
          {/* Subsection 1: Warehouse Credit Consumption Matrix */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="size-6 text-cyan-400" />
                  Snowflake Warehouse Sizing & Credit Consumption Matrix
                </h2>
                <p className="text-xs text-slate-400">Virtual warehouses scale compute power exponentially in powers of 2.</p>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 w-fit">
                Billed Per-Second (60s Minimum)
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-300 font-semibold">
                  <tr>
                    <th className="p-3.5">Size</th>
                    <th className="p-3.5">Credits / Hour</th>
                    <th className="p-3.5">Servers (Nodes)</th>
                    <th className="p-3.5">Standard ($2/cr)</th>
                    <th className="p-3.5">Enterprise ($3/cr)</th>
                    <th className="p-3.5">Optimal Workload Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-cyan-300">X-Small (XS)</td>
                    <td className="p-3.5 font-mono text-slate-200">1 credit</td>
                    <td className="p-3.5 text-slate-400">1 server (8 threads)</td>
                    <td className="p-3.5 font-mono text-slate-300">$2.00 / hr</td>
                    <td className="p-3.5 font-mono text-cyan-400 font-medium">$3.00 / hr</td>
                    <td className="p-3.5 text-slate-300">Lightweight ELT, single-table staging, low-volume tasks</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-cyan-300">Small (S)</td>
                    <td className="p-3.5 font-mono text-slate-200">2 credits</td>
                    <td className="p-3.5 text-slate-400">2 servers (16 threads)</td>
                    <td className="p-3.5 font-mono text-slate-300">$4.00 / hr</td>
                    <td className="p-3.5 font-mono text-cyan-400 font-medium">$6.00 / hr</td>
                    <td className="p-3.5 text-slate-300">Scheduled dbt models, moderate ingestion pipelines, small team BI</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-cyan-300">Medium (M)</td>
                    <td className="p-3.5 font-mono text-slate-200">4 credits</td>
                    <td className="p-3.5 text-slate-400">4 servers (32 threads)</td>
                    <td className="p-3.5 font-mono text-slate-300">$8.00 / hr</td>
                    <td className="p-3.5 font-mono text-cyan-400 font-medium">$12.00 / hr</td>
                    <td className="p-3.5 text-slate-300">Production BI reporting (Looker/Tableau), medium data mart transforms</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-cyan-300">Large (L)</td>
                    <td className="p-3.5 font-mono text-slate-200">8 credits</td>
                    <td className="p-3.5 text-slate-400">8 servers (64 threads)</td>
                    <td className="p-3.5 font-mono text-slate-300">$16.00 / hr</td>
                    <td className="p-3.5 font-mono text-cyan-400 font-medium">$24.00 / hr</td>
                    <td className="p-3.5 text-slate-300">Complex multi-table joins, hourly automated pipelines, heavy aggregations</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-indigo-400">X-Large (XL)</td>
                    <td className="p-3.5 font-mono text-slate-200">16 credits</td>
                    <td className="p-3.5 text-slate-400">16 servers (128 threads)</td>
                    <td className="p-3.5 font-mono text-slate-300">$32.00 / hr</td>
                    <td className="p-3.5 font-mono text-indigo-300 font-medium">$48.00 / hr</td>
                    <td className="p-3.5 text-slate-300">Large-scale batch warehouse loads, billion-row customer telemetry</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-indigo-400">2X-Large to 4X-Large</td>
                    <td className="p-3.5 font-mono text-slate-200">32 – 128 credits</td>
                    <td className="p-3.5 text-slate-400">32 – 128 servers</td>
                    <td className="p-3.5 font-mono text-slate-300">$64 – $256 / hr</td>
                    <td className="p-3.5 font-mono text-indigo-300 font-medium">$96 – $384 / hr</td>
                    <td className="p-3.5 text-slate-300">Petabyte-scale enterprise migrations, machine learning feature engineering</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Subsection 2: Top 5 FinOps Strategies */}
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
              <TrendingDown className="size-5 text-emerald-400" />
              Top 5 FinOps Strategies to Cut Snowflake Spend by 30%+
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-200 text-xs sm:text-sm">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>1. Set AUTO_SUSPEND = 60</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Default auto-suspend is 10 minutes (600 seconds). For interactive analytics, reducing this to 60 seconds eliminates idle compute waste immediately after analysts finish querying.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-200 text-xs sm:text-sm">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>2. Isolate ETL from BI</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Never mix scheduled batch data pipelines with live user BI dashboards on the same warehouse. Dedicated warehouses prevent queued queries from forcing expensive autoscaling.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-200 text-xs sm:text-sm">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>3. Enforce Resource Monitors</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Attach Snowflake Resource Monitors to every warehouse cluster with hard 100% suspend caps and 80%/90% alert notifications to stop runaway Cartesian product queries.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-200 text-xs sm:text-sm">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>4. Use Transient Staging Tables</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Staging and raw ELT tables don't need 90 days of Time Travel or 7-day Fail-Safe insurance. Creating them as `TRANSIENT` slashes uncompressed auxiliary storage overhead.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-200 text-xs sm:text-sm">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>5. Offload Raw Data to Parquet</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Keep cold historical logs in external object storage (AWS S3, Google Cloud Storage) formatted as Apache Parquet, and query via external tables or Iceberg tables at fraction of cost.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-200 text-xs sm:text-sm">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>6. Pre-Purchase Capacity</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Negotiate 1 to 3-year capacity commitments with Snowflake sales reps. Storage drops from $40/TB to $23/TB, and effective credit rates drop by 15% to 30%.
                </p>
              </div>
            </div>
          </div>

          {/* Subsection 3: Editions Comparison Table */}
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="size-5 text-cyan-400" />
              Snowflake Editions Comparison Matrix
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-300 font-semibold">
                  <tr>
                    <th className="p-3.5">Capability / Feature</th>
                    <th className="p-3.5 text-slate-300">Standard Edition</th>
                    <th className="p-3.5 text-cyan-400">Enterprise Edition</th>
                    <th className="p-3.5 text-indigo-400">Business Critical Edition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-semibold text-slate-200">On-Demand Price / Credit</td>
                    <td className="p-3.5 font-mono text-slate-200">$2.00 / credit</td>
                    <td className="p-3.5 font-mono text-cyan-300 font-bold">$3.00 / credit</td>
                    <td className="p-3.5 font-mono text-indigo-300 font-bold">$4.00 / credit</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-semibold text-slate-200">Multi-Cluster Warehouses (Auto-Scale)</td>
                    <td className="p-3.5 text-rose-400">Not Available</td>
                    <td className="p-3.5 text-emerald-400 font-semibold">Included (Max concurrency)</td>
                    <td className="p-3.5 text-emerald-400 font-semibold">Included</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-semibold text-slate-200">Time Travel Retention Window</td>
                    <td className="p-3.5 text-slate-400">1 Day Maximum</td>
                    <td className="p-3.5 text-emerald-400 font-semibold">Up to 90 Days</td>
                    <td className="p-3.5 text-emerald-400 font-semibold">Up to 90 Days</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-semibold text-slate-200">Search Optimization Service</td>
                    <td className="p-3.5 text-rose-400">Not Available</td>
                    <td className="p-3.5 text-emerald-400 font-semibold">Included</td>
                    <td className="p-3.5 text-emerald-400 font-semibold">Included</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-semibold text-slate-200">Security & Compliance Enclaves</td>
                    <td className="p-3.5 text-slate-400">SOC 1/2, PCI-DSS (L2)</td>
                    <td className="p-3.5 text-slate-200">Column/Row-Level Security Policies</td>
                    <td className="p-3.5 text-indigo-300 font-semibold">Tri-Secret Secure, HIPAA, AWS PrivateLink</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Highest-intent placement: the reader has just seen their own numbers. */}
          <AdSlot unit="calculatorResult" className="my-8" />

          {/* FAQ rendered from the shared registry so the prerendered markup matches. */}
          <CalculatorFaqSection
            path="/snowflake-cost-calculator"
            title="Frequently Asked Questions About Snowflake Costs"
          />

          {/* Closing unit at the end of the editorial content. */}
          <AdSlot unit="calculatorFaq" format="horizontal" />

          <MethodologyDisclosure type="cloud" />

          <RelatedCalculators currentSlug="snowflake-cost-calculator" category="cloud-finops" />
        </div>
      </section>
    </div>
  );
};

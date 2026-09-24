import { useState, useMemo, useEffect } from 'react';
import {
  Repeat,
  DollarSign,
  Building,
  Wrench,
  Key,
  ShieldCheck,
  Download,
  Share2,
  Check,
  Sparkles,
  Calendar
} from 'lucide-react';
import { CurrencyInput } from '../components/CurrencyInput';
import { NumericInput } from '../components/NumericInput';
import { SuiteSubNav } from '../components/SuiteSubNav';
import { AdSlot } from '../components/AdSlot';
import { updatePageMeta } from '../lib/router';
import {
  calculateBrrrr,
  type BrrrrInputs,
  type BrrrrResult,
} from '../lib/brrrrCalculator';
import { getNumQuery } from '../lib/urlState';
import { ResultAnnouncer } from '../components/ResultAnnouncer';
import { composeAnnouncement } from '../lib/resultAnnouncement';
import { formatUsd, formatUsdSigned } from '@tableview/shared';
import { trackUserClick } from '../lib/sentry';

interface BrrrrPreset {
  id: string;
  label: string;
  description: string;
  inputs: BrrrrInputs;
}

const BRRRR_PRESETS: BrrrrPreset[] = [
  {
    id: 'infinite-deal',
    label: 'Perfect Infinite Return ($0 Left)',
    description: 'High equity forced appreciation where 100% of invested capital is extracted via 75% refi.',
    inputs: {
      purchasePrice: 110000,
      rehabCost: 35000,
      purchaseClosingCosts: 3000,
      financingType: 'hard_money',
      hardMoneyLtcPercent: 90,
      hardMoneyRate: 11.5,
      hardMoneyPoints: 2,
      holdingPeriodMonths: 5,
      monthlyHoldingCosts: 350,

      afterRepairValue: 215000,
      grossMonthlyRent: 1950,
      vacancyRatePercent: 5,
      propertyManagementPercent: 8,
      monthlyPropertyTaxes: 210,
      monthlyInsurance: 95,
      monthlyHoa: 0,
      monthlyMaintenanceCapex: 175,

      refinanceLtvPercent: 75,
      refinanceInterestRate: 6.875,
      refinanceTermYears: 30,
      refinanceClosingCosts: 3800,
    },
  },
  {
    id: 'distressed-sfr',
    label: 'Distressed Single Family Rehab',
    description: 'Moderate rehab with standard 10% capital remaining in deal and strong positive cash flow.',
    inputs: {
      purchasePrice: 160000,
      rehabCost: 45000,
      purchaseClosingCosts: 4000,
      financingType: 'hard_money',
      hardMoneyLtcPercent: 85,
      hardMoneyRate: 12.0,
      hardMoneyPoints: 2,
      holdingPeriodMonths: 6,
      monthlyHoldingCosts: 450,

      afterRepairValue: 275000,
      grossMonthlyRent: 2350,
      vacancyRatePercent: 5,
      propertyManagementPercent: 8,
      monthlyPropertyTaxes: 260,
      monthlyInsurance: 110,
      monthlyHoa: 0,
      monthlyMaintenanceCapex: 200,

      refinanceLtvPercent: 75,
      refinanceInterestRate: 7.125,
      refinanceTermYears: 30,
      refinanceClosingCosts: 4500,
    },
  },
  {
    id: 'cash-turnkey',
    label: 'All-Cash Fast BRRRR',
    description: 'Self-funded purchase and rehab without hard money points or interest, refi takeout after 6 months.',
    inputs: {
      purchasePrice: 95000,
      rehabCost: 28000,
      purchaseClosingCosts: 2500,
      financingType: 'cash',
      hardMoneyLtcPercent: 0,
      hardMoneyRate: 0,
      hardMoneyPoints: 0,
      holdingPeriodMonths: 4,
      monthlyHoldingCosts: 250,

      afterRepairValue: 175000,
      grossMonthlyRent: 1650,
      vacancyRatePercent: 5,
      propertyManagementPercent: 8,
      monthlyPropertyTaxes: 160,
      monthlyInsurance: 80,
      monthlyHoa: 0,
      monthlyMaintenanceCapex: 140,

      refinanceLtvPercent: 75,
      refinanceInterestRate: 6.75,
      refinanceTermYears: 30,
      refinanceClosingCosts: 3200,
    },
  },
];

export const BrrrrCalculator = () => {
  useEffect(() => {
    updatePageMeta(
      'BRRRR Calculator: Buy, Rehab, Rent, Refinance, Repeat | TableView',
      'Free in-browser BRRRR strategy calculator and BiggerPockets Pro alternative. Model acquisition, rehab, rental cash flow, cash-out refinance, net capital left, and infinite return without paywalls.',
      '/brrrr-calculator'
    );
  }, []);

  // Form State initialized with URL query params support
  const [purchasePrice, setPurchasePrice] = useState<number>(() => getNumQuery('price', 110000));
  const [rehabCost, setRehabCost] = useState<number>(() => getNumQuery('rehab', 35000));
  const [purchaseClosingCosts, setPurchaseClosingCosts] = useState<number>(3000);
  const [financingType, setFinancingType] = useState<'cash' | 'hard_money'>('hard_money');
  const [hardMoneyLtcPercent, setHardMoneyLtcPercent] = useState<number>(90);
  const [hardMoneyRate, setHardMoneyRate] = useState<number>(11.5);
  const [hardMoneyPoints, setHardMoneyPoints] = useState<number>(2);
  const [holdingPeriodMonths, setHoldingPeriodMonths] = useState<number>(5);
  const [monthlyHoldingCosts, setMonthlyHoldingCosts] = useState<number>(350);

  const [afterRepairValue, setAfterRepairValue] = useState<number>(() => getNumQuery('arv', 215000));
  const [grossMonthlyRent, setGrossMonthlyRent] = useState<number>(() => getNumQuery('rent', 1950));
  const [vacancyRatePercent, setVacancyRatePercent] = useState<number>(5);
  const [propertyManagementPercent, setPropertyManagementPercent] = useState<number>(8);
  const [monthlyPropertyTaxes, setMonthlyPropertyTaxes] = useState<number>(210);
  const [monthlyInsurance, setMonthlyInsurance] = useState<number>(95);
  const [monthlyHoa, setMonthlyHoa] = useState<number>(0);
  const [monthlyMaintenanceCapex, setMonthlyMaintenanceCapex] = useState<number>(175);

  const [refinanceLtvPercent, setRefinanceLtvPercent] = useState<number>(75);
  const [refinanceInterestRate, setRefinanceInterestRate] = useState<number>(6.875);
  const [refinanceTermYears, setRefinanceTermYears] = useState<number>(30);
  const [refinanceClosingCosts, setRefinanceClosingCosts] = useState<number>(3800);

  const [copiedLink, setCopiedLink] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('infinite-deal');

  const currentInputs: BrrrrInputs = useMemo(() => ({
    purchasePrice,
    rehabCost,
    purchaseClosingCosts,
    financingType,
    hardMoneyLtcPercent,
    hardMoneyRate,
    hardMoneyPoints,
    holdingPeriodMonths,
    monthlyHoldingCosts,

    afterRepairValue,
    grossMonthlyRent,
    vacancyRatePercent,
    propertyManagementPercent,
    monthlyPropertyTaxes,
    monthlyInsurance,
    monthlyHoa,
    monthlyMaintenanceCapex,

    refinanceLtvPercent,
    refinanceInterestRate,
    refinanceTermYears,
    refinanceClosingCosts,
  }), [
    purchasePrice,
    rehabCost,
    purchaseClosingCosts,
    financingType,
    hardMoneyLtcPercent,
    hardMoneyRate,
    hardMoneyPoints,
    holdingPeriodMonths,
    monthlyHoldingCosts,
    afterRepairValue,
    grossMonthlyRent,
    vacancyRatePercent,
    propertyManagementPercent,
    monthlyPropertyTaxes,
    monthlyInsurance,
    monthlyHoa,
    monthlyMaintenanceCapex,
    refinanceLtvPercent,
    refinanceInterestRate,
    refinanceTermYears,
    refinanceClosingCosts,
  ]);

  const result: BrrrrResult = useMemo(() => {
    return calculateBrrrr(currentInputs);
  }, [currentInputs]);

  const handleApplyPreset = (preset: BrrrrPreset) => {
    setActivePreset(preset.id);
    const i = preset.inputs;
    setPurchasePrice(i.purchasePrice);
    setRehabCost(i.rehabCost);
    setPurchaseClosingCosts(i.purchaseClosingCosts);
    setFinancingType(i.financingType);
    setHardMoneyLtcPercent(i.hardMoneyLtcPercent);
    setHardMoneyRate(i.hardMoneyRate);
    setHardMoneyPoints(i.hardMoneyPoints);
    setHoldingPeriodMonths(i.holdingPeriodMonths);
    setMonthlyHoldingCosts(i.monthlyHoldingCosts);

    setAfterRepairValue(i.afterRepairValue);
    setGrossMonthlyRent(i.grossMonthlyRent);
    setVacancyRatePercent(i.vacancyRatePercent);
    setPropertyManagementPercent(i.propertyManagementPercent);
    setMonthlyPropertyTaxes(i.monthlyPropertyTaxes);
    setMonthlyInsurance(i.monthlyInsurance);
    setMonthlyHoa(i.monthlyHoa);
    setMonthlyMaintenanceCapex(i.monthlyMaintenanceCapex);

    setRefinanceLtvPercent(i.refinanceLtvPercent);
    setRefinanceInterestRate(i.refinanceInterestRate);
    setRefinanceTermYears(i.refinanceTermYears);
    setRefinanceClosingCosts(i.refinanceClosingCosts);
  };

  const handleCopyLink = () => {
    trackUserClick('brrrr_copy_link');
    const url = new URL(window.location.href);
    url.searchParams.set('price', purchasePrice.toString());
    url.searchParams.set('rehab', rehabCost.toString());
    url.searchParams.set('arv', afterRepairValue.toString());
    url.searchParams.set('rent', grossMonthlyRent.toString());
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportCsv = () => {
    trackUserClick('brrrr_export_csv');
    const rows = [
      ['Metric', 'Value'],
      ['Purchase Price', `$${purchasePrice.toLocaleString('en-US')}`],
      ['Estimated Rehab Cost', `$${rehabCost.toLocaleString('en-US')}`],
      ['Total Project Cost', `$${result.phase1.totalProjectCost.toLocaleString('en-US')}`],
      ['Initial Cash Invested Out-of-Pocket', `$${result.phase1.totalCashInvested.toLocaleString('en-US')}`],
      ['After Repair Value (ARV)', `$${afterRepairValue.toLocaleString('en-US')}`],
      ['Gross Monthly Rent', `$${grossMonthlyRent.toLocaleString('en-US')}`],
      ['Stabilized Monthly NOI', `$${Math.round(result.phase2.monthlyNoi).toLocaleString('en-US')}`],
      ['Cap Rate on Cost', `${result.phase2.capRateOnCost.toFixed(2)}%`],
      ['Cap Rate on ARV', `${result.phase2.capRateOnArv.toFixed(2)}%`],
      ['Refinance Loan Amount (75% ARV)', `$${result.phase3.refinanceLoanAmount.toLocaleString('en-US')}`],
      ['Net Cash Extracted at Refinance', `$${result.phase3.netCashFromRefinance.toLocaleString('en-US')}`],
      ['Net Capital Left in Deal', `$${result.verdict.netCapitalLeftInDeal.toLocaleString('en-US')}`],
      ['Infinite Return Status', result.verdict.isInfiniteReturn ? 'YES (100%+ Capital Recovered)' : 'NO'],
      ['Post-Refinance Monthly Cash Flow', `$${Math.round(result.verdict.postRefiMonthlyCashFlow).toLocaleString('en-US')}`],
      ['Cash-on-Cash Return', result.verdict.isInfiniteReturn ? 'Infinite Return (>=100%)' : `${result.verdict.cashOnCashReturnPercent.toFixed(2)}%`],
      ['Post-Refinance DSCR', result.verdict.postRefiDscr.toFixed(2) + 'x'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `brrrr_underwriting_model_${purchasePrice}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Top Breadcrumb & Suite Navigation */}
      <SuiteSubNav suite="commercial" currentPath="/brrrr-calculator" />

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 mb-2 shadow-2xs">
            <Repeat className="size-3.5 text-emerald-700 animate-spin-slow" />
            <span>BRRRR Strategy Cycle Underwriting Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            BRRRR Method Calculator
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Underwrite the complete 4-phase investor lifecycle: <strong>Buy</strong>, <strong>Rehab</strong>, <strong>Rent</strong>, <strong>Refinance</strong>, and <strong>Repeat</strong>. Model cash invested, cash extracted, net capital left in deal, and infinite return velocity.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            {copiedLink ? <Check className="size-3.5 text-emerald-700" /> : <Share2 className="size-3.5" />}
            <span>{copiedLink ? 'Copied URL' : 'Share Scenario'}</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Download className="size-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Preset Scenario Selector Bar */}
      <div className="mb-8 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="size-4 text-amber-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Quick Deal Presets</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {BRRRR_PRESETS.map((p) => {
            const isSelected = activePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-slate-50/50 hover:bg-slate-100/70 border-slate-200'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{p.label}</div>
                <div className="text-[11px] text-slate-600 mt-1 leading-snug">{p.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 4-Phase Input Accordion (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Phase 1: BUY & REHAB */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center border border-indigo-200">
                  1
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Phase 1: Buy & Rehab Acquisition</h2>
                  <span className="text-[11px] text-slate-500">Purchase price, rehab budget & short-term debt</span>
                </div>
              </div>
              <Wrench className="size-4 text-slate-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="brrrr-purchase-price" className="text-xs font-semibold text-slate-700">Purchase Price ($)</label>
                <CurrencyInput id="brrrr-purchase-price" value={purchasePrice} onChange={setPurchasePrice} />
              </div>
              <div className="space-y-1">
                <label htmlFor="brrrr-estimated-rehab-budget" className="text-xs font-semibold text-slate-700">Estimated Rehab Budget ($)</label>
                <CurrencyInput id="brrrr-estimated-rehab-budget" value={rehabCost} onChange={setRehabCost} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="space-y-1">
                <label htmlFor="brrrr-purchase-closing" className="text-xs font-semibold text-slate-700">Purchase Closing ($)</label>
                <CurrencyInput id="brrrr-purchase-closing" value={purchaseClosingCosts} onChange={setPurchaseClosingCosts} />
              </div>
              <div className="space-y-1">
                <label htmlFor="brrrr-holding-months" className="text-xs font-semibold text-slate-700">Holding Months</label>
                <NumericInput id="brrrr-holding-months" value={holdingPeriodMonths} onChange={setHoldingPeriodMonths} min={1} max={36} suffix="mo" />
              </div>
              <div className="space-y-1">
                <label htmlFor="brrrr-monthly-holding" className="text-xs font-semibold text-slate-700">Monthly Holding ($)</label>
                <CurrencyInput id="brrrr-monthly-holding" value={monthlyHoldingCosts} onChange={setMonthlyHoldingCosts} />
              </div>
            </div>

            {/* Financing Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 block mb-2">Acquisition Financing Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFinancingType('hard_money')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    financingType === 'hard_money'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Hard Money / Bridge Loan
                </button>
                <button
                  type="button"
                  onClick={() => setFinancingType('cash')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    financingType === 'cash'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  100% Cash Purchase
                </button>
              </div>
            </div>

            {financingType === 'hard_money' && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-in fade-in duration-150">
                <div>
                  <label htmlFor="brrrr-loan-to-cost-ltc" className="font-semibold text-slate-700 block mb-1">Loan-to-Cost (LTC)</label>
                  <NumericInput id="brrrr-loan-to-cost-ltc" value={hardMoneyLtcPercent} onChange={setHardMoneyLtcPercent} suffix="%" min={50} max={100} />
                  <span className="text-[10px] text-slate-500 block mt-1">Loan: ${(result.phase1.hardMoneyLoanAmount).toLocaleString('en-US')}</span>
                </div>
                <div>
                  <label htmlFor="brrrr-interest-rate-apr" className="font-semibold text-slate-700 block mb-1">Interest Rate (APR)</label>
                  <NumericInput id="brrrr-interest-rate-apr" value={hardMoneyRate} onChange={setHardMoneyRate} suffix="%" step={0.125} min={5} max={25} />
                  <span className="text-[10px] text-slate-500 block mt-1">${result.phase1.monthlyInterestOnlyPayment.toLocaleString('en-US')}/mo I/O</span>
                </div>
                <div>
                  <label htmlFor="brrrr-lender-points" className="font-semibold text-slate-700 block mb-1">Lender Points</label>
                  <NumericInput id="brrrr-lender-points" value={hardMoneyPoints} onChange={setHardMoneyPoints} suffix="pts" step={0.5} min={0} max={6} />
                  <span className="text-[10px] text-slate-500 block mt-1">${result.phase1.hardMoneyPointsCost.toLocaleString('en-US')} fee</span>
                </div>
              </div>
            )}
          </div>

          {/* Phase 2: RENT & STABILIZE */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-emerald-50 text-emerald-700 font-black text-xs flex items-center justify-center border border-emerald-200">
                  2
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Phase 2: Rent & Property Stabilization</h2>
                  <span className="text-[11px] text-slate-500">Gross rental income, operating expenses & stabilized NOI</span>
                </div>
              </div>
              <Key className="size-4 text-slate-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="brrrr-gross-monthly-rent" className="text-xs font-semibold text-slate-700">Gross Monthly Rent ($)</label>
                <CurrencyInput id="brrrr-gross-monthly-rent" value={grossMonthlyRent} onChange={setGrossMonthlyRent} />
              </div>
              <div className="space-y-1">
                <label htmlFor="brrrr-vacancy-rate" className="text-xs font-semibold text-slate-700">Vacancy Rate (%)</label>
                <NumericInput id="brrrr-vacancy-rate" value={vacancyRatePercent} onChange={setVacancyRatePercent} suffix="%" min={0} max={30} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label htmlFor="brrrr-property-mgmt" className="text-xs font-semibold text-slate-700">Property Mgmt (%)</label>
                <NumericInput id="brrrr-property-mgmt" value={propertyManagementPercent} onChange={setPropertyManagementPercent} suffix="%" min={0} max={20} />
              </div>
              <div className="space-y-1">
                <label htmlFor="brrrr-monthly-taxes" className="text-xs font-semibold text-slate-700">Monthly Taxes ($)</label>
                <CurrencyInput id="brrrr-monthly-taxes" value={monthlyPropertyTaxes} onChange={setMonthlyPropertyTaxes} />
              </div>
              <div className="space-y-1">
                <label htmlFor="brrrr-insurance" className="text-xs font-semibold text-slate-700">Insurance ($)</label>
                <CurrencyInput id="brrrr-insurance" value={monthlyInsurance} onChange={setMonthlyInsurance} />
              </div>
              <div className="space-y-1">
                <label htmlFor="brrrr-maint-capex" className="text-xs font-semibold text-slate-700">Maint & CapEx ($)</label>
                <CurrencyInput id="brrrr-maint-capex" value={monthlyMaintenanceCapex} onChange={setMonthlyMaintenanceCapex} />
              </div>
            </div>
          </div>

          {/* Phase 3: REFINANCE */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-amber-50 text-amber-700 font-black text-xs flex items-center justify-center border border-amber-200">
                  3
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Phase 3: Cash-Out Refinance (The Takeout)</h2>
                  <span className="text-[11px] text-slate-500">Appraised ARV, 30-year takeout loan & capital extraction</span>
                </div>
              </div>
              <DollarSign className="size-4 text-slate-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="brrrr-after-repair-value-arv" className="text-xs font-semibold text-slate-700">After Repair Value (ARV $)</label>
                <CurrencyInput id="brrrr-after-repair-value-arv" value={afterRepairValue} onChange={setAfterRepairValue} />
              </div>
              <div className="space-y-1">
                <label htmlFor="brrrr-refinance-max-ltv" className="text-xs font-semibold text-slate-700">Refinance Max LTV (%)</label>
                <NumericInput id="brrrr-refinance-max-ltv" value={refinanceLtvPercent} onChange={setRefinanceLtvPercent} suffix="%" min={50} max={85} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label htmlFor="brrrr-refinance-rate" className="text-xs font-semibold text-slate-700">Refinance Rate (%)</label>
                <NumericInput id="brrrr-refinance-rate" value={refinanceInterestRate} onChange={setRefinanceInterestRate} suffix="%" step={0.125} min={3} max={15} />
              </div>
              <div className="space-y-1">
                <label htmlFor="brrrr-loan-term-years" className="text-xs font-semibold text-slate-700">Loan Term (Years)</label>
                <NumericInput id="brrrr-loan-term-years" value={refinanceTermYears} onChange={setRefinanceTermYears} suffix="yrs" min={10} max={30} />
              </div>
              <div className="space-y-1">
                <label htmlFor="brrrr-refi-closing-costs" className="text-xs font-semibold text-slate-700">Refi Closing Costs ($)</label>
                <CurrencyInput id="brrrr-refi-closing-costs" value={refinanceClosingCosts} onChange={setRefinanceClosingCosts} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Phase 4 REPEAT Verdict & Financial Dashboard (5 Cols Sticky) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          {/* Announce the post-refinance outcome for screen readers. */}
          <ResultAnnouncer
            message={composeAnnouncement(
              [
                { label: 'post-refinance monthly cash flow', value: formatUsdSigned(result.verdict.postRefiMonthlyCashFlow) },
                { label: 'net capital left in the deal', value: formatUsd(result.verdict.netCapitalLeftInDeal) },
                { label: 'cash-on-cash return', value: `${result.verdict.cashOnCashReturnPercent.toFixed(1)}%` },
                { label: 'post-refinance DSCR', value: `${result.verdict.postRefiDscr.toFixed(2)}x` },
              ],
              { context: 'Results updated', trailing: `${result.verdict.dealRating}.` }
            )}
          />

          {/* Main Verdict Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
            {/* Infinite Return Glorious Celebration Badge */}
            {result.verdict.isInfiniteReturn ? (
              <div className="mb-5 p-4 rounded-2xl bg-emerald-500 text-white shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 size-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-100">
                  <Sparkles className="size-4 text-amber-300 animate-pulse" />
                  <span>The BRRRR Holy Grail</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                  Infinite Return Achieved!
                </div>
                <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                  You extracted 100% of your invested capital at refinance and put an additional <strong>${result.verdict.cashInPocketSurplus.toLocaleString('en-US')}</strong> in your pocket while retaining full ownership of the cash-flowing property!
                </p>
              </div>
            ) : (
              <div className="mb-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Underwriting Verdict</span>
                  <span className="text-sm font-extrabold text-slate-900">{result.verdict.dealRating}</span>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {result.verdict.cashOnCashReturnPercent.toFixed(1)}% CoC
                </span>
              </div>
            )}

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 gap-3.5 mb-6">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Total Cash Invested</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  ${result.phase1.totalCashInvested.toLocaleString('en-US')}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">All-in out-of-pocket</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Cash Out at Refi</span>
                <span className="text-lg font-black text-indigo-600 font-mono">
                  ${result.phase3.netCashFromRefinance.toLocaleString('en-US')}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Net loan proceeds</span>
              </div>

              <div className={`p-3.5 rounded-xl border ${result.verdict.isInfiniteReturn ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[11px] font-semibold text-slate-500 block">Capital Left in Deal</span>
                <span className={`text-lg font-black font-mono ${result.verdict.isInfiniteReturn ? 'text-emerald-700' : 'text-slate-900'}`}>
                  {result.verdict.netCapitalLeftInDeal <= 0 ? '$0 (Fully Recovered)' : `$${result.verdict.netCapitalLeftInDeal.toLocaleString('en-US')}`}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Remaining equity basis</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Post-Refi Cash Flow</span>
                <span className={`text-lg font-black font-mono ${result.verdict.postRefiMonthlyCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  ${Math.round(result.verdict.postRefiMonthlyCashFlow).toLocaleString('en-US')}
                  <span className="text-xs font-normal text-slate-500">/mo</span>
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">${Math.round(result.verdict.postRefiAnnualCashFlow).toLocaleString('en-US')}/year</span>
              </div>
            </div>

            {/* Detailed Lifecycle Capital Waterfall */}
            <div className="space-y-2 text-xs border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                BRRRR Capital Waterfall Breakdown
              </h4>

              <div className="flex items-center justify-between text-slate-600">
                <span>Purchase Price + Rehab:</span>
                <span className="font-mono font-semibold text-slate-900">${result.phase1.totalProjectCost.toLocaleString('en-US')}</span>
              </div>

              {financingType === 'hard_money' && (
                <div className="flex items-center justify-between text-slate-600">
                  <span>Hard Money Loan (Payoff at Refi):</span>
                  <span className="font-mono font-semibold text-indigo-700">-${result.phase1.hardMoneyLoanAmount.toLocaleString('en-US')}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600">
                <span>New 30-Year Refinance Debt ({refinanceLtvPercent}% ARV):</span>
                <span className="font-mono font-semibold text-emerald-700">+${result.phase3.refinanceLoanAmount.toLocaleString('en-US')}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>New 30Y Monthly Debt Service (P&I):</span>
                <span className="font-mono font-semibold text-slate-900">${Math.round(result.phase3.monthlyPrincipalAndInterest).toLocaleString('en-US')}/mo</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Stabilized Monthly NOI:</span>
                <span className="font-mono font-semibold text-slate-900">${Math.round(result.phase2.monthlyNoi).toLocaleString('en-US')}/mo</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Post-Refinance DSCR:</span>
                <span className={`font-mono font-bold ${result.verdict.postRefiDscr >= 1.25 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {result.verdict.postRefiDscr.toFixed(2)}x
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Cap Rate on Cost:</span>
                <span className="font-mono font-semibold text-slate-900">{result.phase2.capRateOnCost.toFixed(2)}%</span>
              </div>
            </div>

            {/* Repeat CTA Button */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Repeat className="size-3.5 text-emerald-400" />
                <span>Repeat With Another Deal</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ad placement */}
      <AdSlot unit="calculatorResult" className="my-10" />

      {/* Educational Walkthrough & FAQ */}
      <div className="mt-12 space-y-6 border-t border-slate-200 pt-10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Investor Playbook</span>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Understanding the BRRRR Method Math
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            The BRRRR method (Buy, Rehab, Rent, Refinance, Repeat) is an institutional wealth-compounding strategy pioneered by real estate investors to recycle the same pool of investment capital into multiple cash-flowing assets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="size-4 text-emerald-700" />
              What is an "Infinite Return"?
            </h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              When the cash-out refinance proceeds equal or exceed your total initial out-of-pocket capital (purchase down payment, rehab costs, closing fees, holding costs), your remaining cash basis in the deal is $0. Mathematically, dividing any positive annual cash flow by $0 invested yields an <strong>infinite return on investment</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Building className="size-4 text-indigo-600" />
              What is the 75% Rule in BRRRR Refinancing?
            </h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Most conventional mortgage lenders and private DSCR loan programs cap cash-out refinances at <strong>75% to 80% of the newly appraised After Repair Value (ARV)</strong>. To recover all your cash, your all-in cost (purchase + rehab) must not exceed 75% of the post-renovation property value.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="size-4 text-amber-700" />
              How Long is the Refinance Seasoning Period?
            </h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Fannie Mae conventional cash-out guidelines typically require a <strong>12-month title seasoning period</strong> before refinancing based on a new appraised value. However, non-QM DSCR lenders frequently allow cash-out refinancing after just <strong>3 to 6 months of ownership</strong> once the lease agreement is executed.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-700" />
              Why Run Calculations Locally?
            </h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Unlike web services that store your purchase offers and property addresses on cloud databases to sell to mortgage brokers, TableView computes 100% in your browser memory. Your proprietary deal pipeline remains confidential.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrrrrCalculator;

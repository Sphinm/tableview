import { useState, useMemo, useEffect } from 'react';
import {
  Calculator,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  Scale,
  Building,
  Landmark,
  RefreshCw,
} from 'lucide-react';
import {
  calculateSection1031,
  todayIso,
  type Section1031Inputs,
} from '../lib/section1031Calculator';
import { updatePageMeta } from '../lib/router';
import { CALCULATOR_META } from '../data/routeMeta';
import { getCalculatorFaqs } from '../data/calculatorFaqs';
import { MethodologyDisclosure } from '../components/MethodologyDisclosure';
import { AdSlot } from '../components/AdSlot';
import { ShareCalculationButton } from '../components/ShareCalculationButton';
import { RelatedCalculators } from '../components/RelatedCalculators';
import { getUrlParams } from '../lib/urlState';

const PATH = '/section-1031-exchange-calculator';
const faqs = getCalculatorFaqs(PATH);

const section1031Schemas = [
  {
    '@type': 'WebApplication',
    name: '1031 Exchange Calculator',
    url: 'https://tableview.dev/section-1031-exchange-calculator',
    description:
      'Free in-browser 1031 exchange calculator. Compute realized gain, cash and mortgage boot, deferred gain, and the 45-day and 180-day statutory deadlines with no data leaving your device.',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  },
  {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  },
  {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tableview.dev/' },
      {
        '@type': 'ListItem',
        position: 2,
        name: '1031 Exchange Calculator',
        item: 'https://tableview.dev/section-1031-exchange-calculator',
      },
    ],
  },
];

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const currencyCents = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const fmt = (n: number) => currency.format(Math.round(n));
const fmt2 = (n: number) => currencyCents.format(n);

/** Read a numeric query parameter, falling back when absent or unparseable. */
function getNumQuery(name: string, fallback: number): number {
  const raw = getUrlParams()[name];
  const parsed = Number(raw);
  return raw !== undefined && Number.isFinite(parsed) ? parsed : fallback;
}

function getDateQuery(name: string, fallback: string): string {
  const raw = getUrlParams()[name];
  return raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : fallback;
}

function getBoolQuery(name: string, fallback: boolean): boolean {
  const raw = getUrlParams()[name];
  if (raw === undefined) return fallback;
  return raw === '1' || raw === 'true';
}

interface FieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  hint?: string;
}

const Field = ({ label, value, onChange, prefix, suffix, step = 1, hint }: FieldProps) => (
  <label className="block">
    <span className="block text-xs font-medium text-slate-400 mb-1.5">{label}</span>
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-3 text-sm text-slate-500 pointer-events-none">{prefix}</span>
      )}
      <input
        type="number"
        inputMode="decimal"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full ${prefix ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-9' : 'pr-3'} py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
      />
      {suffix && (
        <span className="absolute right-3 text-sm text-slate-500 pointer-events-none">{suffix}</span>
      )}
    </div>
    {hint && <span className="block text-[11px] text-slate-500 mt-1 leading-snug">{hint}</span>}
  </label>
);

const StatRow = ({
  label,
  value,
  tone = 'default',
  strong,
}: {
  label: string;
  value: string;
  tone?: 'default' | 'positive' | 'negative' | 'muted';
  strong?: boolean;
}) => {
  const toneClass = {
    default: 'text-slate-100',
    positive: 'text-emerald-400',
    negative: 'text-rose-400',
    muted: 'text-slate-400',
  }[tone];
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-800/60 last:border-0">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`text-sm font-mono ${toneClass} ${strong ? 'font-bold' : 'font-medium'}`}>
        {value}
      </span>
    </div>
  );
};

export const Section1031Calculator = () => {
  useEffect(() => {
    updatePageMeta(
      CALCULATOR_META[PATH].title,
      CALCULATOR_META[PATH].description,
      CALCULATOR_META[PATH].canonical,
      section1031Schemas
    );
  }, []);

  // ---- Relinquished property ----
  const [salePrice, setSalePrice] = useState(() => getNumQuery('sale', 500_000));
  const [sellingCostsPercent, setSellingCostsPercent] = useState(() => getNumQuery('costs', 6));
  const [adjustedBasis, setAdjustedBasis] = useState(() => getNumQuery('basis', 200_000));
  const [accumulatedDepreciation, setAccumulatedDepreciation] = useState(() =>
    getNumQuery('dep', 60_000)
  );
  const [existingMortgagePayoff, setExistingMortgagePayoff] = useState(() =>
    getNumQuery('debt', 150_000)
  );

  // ---- Replacement property ----
  const [replacementPurchasePrice, setReplacementPurchasePrice] = useState(() =>
    getNumQuery('replacement', 600_000)
  );
  const [acquisitionCosts, setAcquisitionCosts] = useState(() => getNumQuery('acq', 0));
  const [newMortgage, setNewMortgage] = useState(() => getNumQuery('newdebt', 150_000));

  // ---- Timeline ----
  const [closingDate, setClosingDate] = useState(() => getDateQuery('closing', todayIso()));
  const [filingExtension, setFilingExtension] = useState(() => getBoolQuery('ext', false));

  // ---- Identification ----
  const [propertiesIdentified, setPropertiesIdentified] = useState(() => getNumQuery('count', 3));
  const [identifiedTotalFmv, setIdentifiedTotalFmv] = useState(() => getNumQuery('fmv', 600_000));

  // ---- Tax rates ----
  const [federalLtcgRatePercent, setFederalLtcgRatePercent] = useState(() => getNumQuery('ltcg', 20));
  const [depreciationRecaptureRatePercent, setDepreciationRecaptureRatePercent] = useState(() =>
    getNumQuery('recap', 25)
  );
  const [stateTaxRatePercent, setStateTaxRatePercent] = useState(() => getNumQuery('state', 0));
  const [applyNiit, setApplyNiit] = useState(() => getBoolQuery('niit', false));

  const [showRates, setShowRates] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copiedNotice, setCopiedNotice] = useState(false);

  const inputs: Section1031Inputs = useMemo(
    () => ({
      salePrice,
      sellingCostsPercent,
      adjustedBasis,
      accumulatedDepreciation,
      existingMortgagePayoff,
      replacementPurchasePrice,
      acquisitionCosts,
      newMortgage,
      closingDate,
      filingExtension,
      propertiesIdentified,
      identifiedTotalFmv,
      relinquishedFmv: salePrice,
      federalLtcgRatePercent,
      depreciationRecaptureRatePercent,
      stateTaxRatePercent,
      applyNiit,
    }),
    [
      salePrice,
      sellingCostsPercent,
      adjustedBasis,
      accumulatedDepreciation,
      existingMortgagePayoff,
      replacementPurchasePrice,
      acquisitionCosts,
      newMortgage,
      closingDate,
      filingExtension,
      propertiesIdentified,
      identifiedTotalFmv,
      federalLtcgRatePercent,
      depreciationRecaptureRatePercent,
      stateTaxRatePercent,
      applyNiit,
    ]
  );

  const result = useMemo(() => calculateSection1031(inputs), [inputs]);

  const shareParams = {
    sale: salePrice,
    costs: sellingCostsPercent,
    basis: adjustedBasis,
    dep: accumulatedDepreciation,
    debt: existingMortgagePayoff,
    replacement: replacementPurchasePrice,
    acq: acquisitionCosts,
    newdebt: newMortgage,
    closing: closingDate,
    ext: filingExtension ? 1 : 0,
    count: propertiesIdentified,
    fmv: identifiedTotalFmv,
    ltcg: federalLtcgRatePercent,
    recap: depreciationRecaptureRatePercent,
    state: stateTaxRatePercent,
    niit: applyNiit ? 1 : 0,
  };

  const handleExportExcel = async () => {
    const summary = [
      { Parameter: 'Sale Price (Relinquished)', Value: salePrice },
      { Parameter: 'Selling Costs', Value: result.sellingCosts },
      { Parameter: 'Net Sale Proceeds', Value: result.netSaleProceeds },
      { Parameter: 'Adjusted Basis', Value: adjustedBasis },
      { Parameter: 'Realized Gain', Value: result.realizedGain },
      { Parameter: 'Replacement Purchase Price', Value: replacementPurchasePrice },
      { Parameter: 'New Financing', Value: newMortgage },
      { Parameter: 'Cash Boot', Value: result.cashBoot },
      { Parameter: 'Mortgage Boot', Value: result.mortgageBoot },
      { Parameter: 'Total Boot', Value: result.totalBoot },
      { Parameter: 'Recognized (Taxable) Gain', Value: result.recognizedGain },
      { Parameter: 'Deferred Gain', Value: result.deferredGain },
      { Parameter: 'Federal Tax Due', Value: result.federalTax },
      { Parameter: 'State Tax Due', Value: result.stateTax },
      { Parameter: 'Total Tax Due', Value: result.totalTaxDue },
      { Parameter: 'Tax If Sold Outright', Value: result.taxIfSoldOutright },
      { Parameter: 'Tax Deferred By Exchanging', Value: result.taxSavedByExchanging },
      { Parameter: '45-Day Identification Deadline', Value: result.identificationDeadline },
      { Parameter: '180-Day Exchange Deadline', Value: result.exchangeDeadline },
      { Parameter: 'Deadline Driven By', Value: result.exchangeDeadlineDriver },
      { Parameter: 'Identification Rule Applied', Value: result.identificationRule },
      { Parameter: 'Identification Compliant', Value: result.identificationCompliant ? 'Yes' : 'No' },
      { Parameter: 'Outcome', Value: result.verdictLabel },
    ];

    const XLSX = await import('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(summary);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '1031 Exchange');
    XLSX.writeFile(workbook, `1031_exchange_${salePrice}.xlsx`);
  };

  const handleExportCsv = () => {
    const rows: [string, string | number][] = [
      ['Sale Price', salePrice],
      ['Net Sale Proceeds', result.netSaleProceeds],
      ['Realized Gain', result.realizedGain],
      ['Cash Boot', result.cashBoot],
      ['Mortgage Boot', result.mortgageBoot],
      ['Total Boot', result.totalBoot],
      ['Recognized Gain', result.recognizedGain],
      ['Deferred Gain', result.deferredGain],
      ['Total Tax Due', result.totalTaxDue],
      ['Tax Deferred', result.taxSavedByExchanging],
      ['45-Day Deadline', result.identificationDeadline],
      ['180-Day Deadline', result.exchangeDeadline],
    ];
    const csv = 'Parameter,Value\n' + rows.map(([k, v]) => `${k},${v}`).join('\n') + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `1031_exchange_${salePrice}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleCopySummary = async () => {
    const text = [
      `1031 Exchange Summary`,
      `Sale price: ${fmt(salePrice)}  |  Net proceeds: ${fmt(result.netSaleProceeds)}`,
      `Realized gain: ${fmt(result.realizedGain)}`,
      `Boot: ${fmt(result.totalBoot)} (cash ${fmt(result.cashBoot)} + debt ${fmt(result.mortgageBoot)})`,
      `Recognized gain: ${fmt(result.recognizedGain)}  |  Deferred: ${fmt(result.deferredGain)}`,
      `Estimated tax due: ${fmt(result.totalTaxDue)}`,
      `45-day deadline: ${result.identificationDeadline}  |  180-day deadline: ${result.exchangeDeadline}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2200);
    } catch {
      // Clipboard unavailable; the export buttons remain the fallback.
    }
  };

  const verdictTone = {
    emerald: {
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      Icon: CheckCircle2,
    },
    amber: {
      border: 'border-amber-500/40',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      Icon: AlertTriangle,
    },
    rose: {
      border: 'border-rose-500/40',
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      Icon: AlertTriangle,
    },
  }[result.verdictColor as 'emerald' | 'amber' | 'rose'] ?? {
    border: 'border-slate-700',
    bg: 'bg-slate-800/40',
    text: 'text-slate-300',
    Icon: AlertTriangle,
  };

  const VerdictIcon = verdictTone.Icon;
  const idDeadlinePassed = result.identificationDaysRemaining < 0;
  const exchDeadlinePassed = result.exchangeDaysRemaining < 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* ---- Header ---- */}
      <header className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-4">
          <Scale className="size-3.5" />
          <span>IRC §1031 · Like-Kind Exchange</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-100 mb-4">
          1031 Exchange Calculator
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Compute your realized gain, cash and mortgage boot, and the tax you actually owe — plus
          the 45-day identification and 180-day exchange deadlines that decide whether the exchange
          qualifies at all. Every figure is calculated in your browser; nothing is uploaded.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ---- Inputs ---- */}
        <div className="lg:col-span-7 space-y-6">
          {/* Relinquished */}
          <section className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800/80 pb-3 mb-5">
              <Building className="size-4 text-indigo-400" />
              Relinquished Property (what you are selling)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Sale Price" value={salePrice} onChange={setSalePrice} prefix="$" step={1000} />
              <Field
                label="Selling Costs"
                value={sellingCostsPercent}
                onChange={setSellingCostsPercent}
                suffix="%"
                step={0.5}
                hint="Commission, title, transfer tax"
              />
              <Field
                label="Adjusted Basis"
                value={adjustedBasis}
                onChange={setAdjustedBasis}
                prefix="$"
                step={1000}
                hint="Purchase price + improvements − depreciation taken"
              />
              <Field
                label="Accumulated Depreciation"
                value={accumulatedDepreciation}
                onChange={setAccumulatedDepreciation}
                prefix="$"
                step={1000}
                hint="Drives §1250 recapture on any boot"
              />
              <Field
                label="Existing Mortgage Payoff"
                value={existingMortgagePayoff}
                onChange={setExistingMortgagePayoff}
                prefix="$"
                step={1000}
              />
            </div>
          </section>

          {/* Replacement */}
          <section className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800/80 pb-3 mb-5">
              <Landmark className="size-4 text-emerald-400" />
              Replacement Property (what you are buying)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Purchase Price"
                value={replacementPurchasePrice}
                onChange={setReplacementPurchasePrice}
                prefix="$"
                step={1000}
              />
              <Field
                label="Acquisition Costs"
                value={acquisitionCosts}
                onChange={setAcquisitionCosts}
                prefix="$"
                step={500}
                hint="Title, escrow, transfer tax"
              />
              <Field
                label="New Financing"
                value={newMortgage}
                onChange={setNewMortgage}
                prefix="$"
                step={1000}
                hint="New debt on the replacement property"
              />
            </div>
          </section>

          {/* Timeline */}
          <section className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800/80 pb-3 mb-5">
              <Clock className="size-4 text-amber-400" />
              Statutory Deadlines
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <label className="block">
                <span className="block text-xs font-medium text-slate-400 mb-1.5">
                  Closing Date (relinquished)
                </span>
                <input
                  type="date"
                  value={closingDate}
                  onChange={(e) => setClosingDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filingExtension}
                  onChange={(e) => setFilingExtension(e.target.checked)}
                  className="mt-0.5 size-4 accent-indigo-500"
                />
                <span className="text-xs text-slate-300 leading-snug">
                  I will file a tax-return extension
                  <span className="block text-[11px] text-slate-500 mt-0.5">
                    Without one, the exchange period can end on April 15 — long before day 180.
                  </span>
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-xl border ${
                  idDeadlinePassed
                    ? 'bg-rose-500/10 border-rose-500/40'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="size-4 text-amber-400" />
                  <span className="text-xs font-semibold text-slate-300">45-Day Identification</span>
                </div>
                <div className="text-lg font-mono font-bold text-slate-100">
                  {result.identificationDeadline}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    idDeadlinePassed ? 'text-rose-400 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {idDeadlinePassed
                    ? `Passed ${Math.abs(result.identificationDaysRemaining)} days ago`
                    : `${result.identificationDaysRemaining} days remaining`}
                </div>
              </div>

              <div
                className={`p-4 rounded-xl border ${
                  exchDeadlinePassed
                    ? 'bg-rose-500/10 border-rose-500/40'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="size-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-300">180-Day Exchange</span>
                </div>
                <div className="text-lg font-mono font-bold text-slate-100">
                  {result.exchangeDeadline}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    exchDeadlinePassed ? 'text-rose-400 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {exchDeadlinePassed
                    ? `Passed ${Math.abs(result.exchangeDaysRemaining)} days ago`
                    : `${result.exchangeDaysRemaining} days remaining`}
                </div>
              </div>
            </div>

            {result.exchangeDeadlineDriver === 'tax-return-due-date' && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
                <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  Your exchange period ends on <strong>April 15</strong>, not day 180. §1031 cuts the
                  exchange period short at the due date of that year&apos;s tax return. Filing an
                  extension would restore the full 180 days.
                </p>
              </div>
            )}
          </section>

          {/* Identification */}
          <section className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800/80 pb-3 mb-5">
              <Scale className="size-4 text-cyan-400" />
              Identification Limits
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Properties Identified"
                value={propertiesIdentified}
                onChange={setPropertiesIdentified}
                step={1}
              />
              <Field
                label="Total FMV Identified"
                value={identifiedTotalFmv}
                onChange={setIdentifiedTotalFmv}
                prefix="$"
                step={1000}
              />
            </div>

            <div
              className={`mt-4 p-3.5 rounded-xl border flex items-start gap-2.5 ${
                result.identificationCompliant
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-rose-500/10 border-rose-500/40'
              }`}
            >
              {result.identificationCompliant ? (
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="size-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs leading-relaxed">
                <p
                  className={
                    result.identificationCompliant ? 'text-emerald-200/90' : 'text-rose-200/90'
                  }
                >
                  {result.identificationRule === '3-property' &&
                    'Within the three-property rule: you may identify up to three properties of any value.'}
                  {result.identificationRule === '200-percent' &&
                    'Within the 200% rule: you may identify any number of properties because their combined value is within 200% of the relinquished property.'}
                  {result.identificationRule === '95-percent' &&
                    'Neither the three-property nor the 200% rule applies, but the 95% rule saves the exchange because you are acquiring at least 95% of the value you identified.'}
                  {result.identificationRule === 'exceeded' &&
                    'This identification exceeds both the three-property and 200% limits, and you are acquiring less than 95% of the value identified — the exchange will not qualify as to the excess.'}
                </p>
              </div>
            </div>
          </section>

          {/* Tax rates */}
          <section className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowRates((v) => !v)}
              className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer text-left"
            >
              <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-200">
                <Calculator className="size-4 text-purple-400" />
                Tax Rate Assumptions
              </span>
              <ChevronDown
                className={`size-4 text-slate-400 transition-transform ${
                  showRates ? 'rotate-180' : ''
                }`}
              />
            </button>
            {showRates && (
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 border-t border-slate-800/80 pt-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Federal Long-Term Capital Gains"
                    value={federalLtcgRatePercent}
                    onChange={setFederalLtcgRatePercent}
                    suffix="%"
                    step={1}
                    hint="0%, 15%, or 20% depending on taxable income"
                  />
                  <Field
                    label="Depreciation Recapture (§1250)"
                    value={depreciationRecaptureRatePercent}
                    onChange={setDepreciationRecaptureRatePercent}
                    suffix="%"
                    step={1}
                    hint="Up to 25% federal"
                  />
                  <Field
                    label="State Income Tax"
                    value={stateTaxRatePercent}
                    onChange={setStateTaxRatePercent}
                    suffix="%"
                    step={0.1}
                    hint="Enter 0 if your state does not tax the gain"
                  />
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer self-start">
                    <input
                      type="checkbox"
                      checked={applyNiit}
                      onChange={(e) => setApplyNiit(e.target.checked)}
                      className="mt-0.5 size-4 accent-indigo-500"
                    />
                    <span className="text-xs text-slate-300 leading-snug">
                      Apply 3.8% NIIT
                      <span className="block text-[11px] text-slate-500 mt-0.5">
                        Net Investment Income Tax, above MAGI thresholds
                      </span>
                    </span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
                  State treatment of §1031 varies widely — a few states do not conform at all, and
                  several impose a claw-back on a later sale of out-of-state replacement property.
                  Enter your own rate rather than relying on a default.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* ---- Results ---- */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-6 space-y-5">
            <section
              className={`rounded-2xl border p-5 sm:p-6 ${verdictTone.border} ${verdictTone.bg}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <VerdictIcon className={`size-5 ${verdictTone.text}`} />
                <span className={`text-sm font-bold uppercase tracking-wider ${verdictTone.text}`}>
                  {result.verdictLabel}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-5">
                {result.verdictDescription}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                    Tax Due Now
                  </div>
                  <div className="text-xl font-mono font-bold text-slate-100">
                    {fmt(result.totalTaxDue)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                    Gain Deferred
                  </div>
                  <div className="text-xl font-mono font-bold text-emerald-400">
                    {fmt(result.deferredGain)}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 sm:p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800/80 pb-3 mb-3">
                Boot Analysis
              </h2>
              <StatRow label="Cash boot (un-reinvested proceeds)" value={fmt2(result.cashBoot)} tone={result.cashBoot > 0 ? 'negative' : 'positive'} />
              <StatRow label="Mortgage boot (un-replaced debt)" value={fmt2(result.mortgageBoot)} tone={result.mortgageBoot > 0 ? 'negative' : 'positive'} />
              <StatRow label="Total boot" value={fmt2(result.totalBoot)} strong />
              {result.additionalCashPaid > 0 && (
                <StatRow
                  label="Cash brought to closing"
                  value={fmt2(result.additionalCashPaid)}
                  tone="muted"
                />
              )}
            </section>

            <section className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 sm:p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800/80 pb-3 mb-3">
                Gain &amp; Tax
              </h2>
              <StatRow label="Net sale proceeds" value={fmt2(result.netSaleProceeds)} />
              <StatRow label="Realized gain" value={fmt2(result.realizedGain)} />
              <StatRow
                label="Recognized (taxable) gain"
                value={fmt2(result.recognizedGain)}
                tone={result.recognizedGain > 0 ? 'negative' : 'positive'}
              />
              {result.recapturePortion > 0 && (
                <StatRow
                  label="— of which §1250 recapture"
                  value={fmt2(result.recapturePortion)}
                  tone="muted"
                />
              )}
              <StatRow label="Federal tax" value={fmt2(result.federalTax)} />
              <StatRow label="State tax" value={fmt2(result.stateTax)} />
              <StatRow label="Total tax due" value={fmt2(result.totalTaxDue)} strong />
              <StatRow
                label="Tax had you sold outright"
                value={fmt2(result.taxIfSoldOutright)}
                tone="muted"
              />
              <StatRow
                label="Deferred by exchanging"
                value={fmt2(result.taxSavedByExchanging)}
                tone="positive"
                strong
              />
            </section>

            {/* Actions */}
            <section className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 sm:p-6 space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="size-3.5" />
                  Excel
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                >
                  <Download className="size-3.5" />
                  CSV
                </button>
              </div>
              <ShareCalculationButton params={shareParams} title="Share this exchange" />
              <button
                type="button"
                onClick={handleCopySummary}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                <RefreshCw className="size-3.5" />
                {copiedNotice ? 'Summary copied' : 'Copy summary for your CPA'}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                <Printer className="size-3.5" />
                Print / Save as PDF
              </button>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                Estimates only, not tax advice. Confirm every figure with a qualified intermediary
                or CPA before closing.
              </p>
            </section>
          </div>
        </div>
      </div>

      <AdSlot unit="calculatorResult" className="my-10" />

      <div className="max-w-4xl mx-auto">
        <MethodologyDisclosure type="section1031" />
      </div>

      {/* ---- FAQ ---- */}
      <section className="max-w-3xl mx-auto mt-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 text-center mb-6">
          Frequently Asked Questions About 1031 Exchanges
        </h2>
        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={faq.q}
                className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-semibold text-slate-200">{faq.q}</span>
                  <ChevronDown
                    className={`size-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-400 border-t border-slate-800/60 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <AdSlot unit="calculatorFaq" format="horizontal" />

      <RelatedCalculators currentSlug="section-1031-exchange-calculator" category="real-estate" />

      {/* ---- Printable report (hidden on screen) ---- */}
      <div className="hidden print:block mt-8 text-slate-950">
        <h2 className="text-xl font-bold mb-1">1031 Exchange Analysis</h2>
        <p className="text-xs text-slate-600 mb-4">
          Prepared {todayIso()} · TableView.dev · estimates only, not tax advice
        </p>
        <table className="w-full text-xs border-collapse">
          <tbody>
            {[
              ['Sale price (relinquished)', fmt2(salePrice)],
              ['Net sale proceeds', fmt2(result.netSaleProceeds)],
              ['Adjusted basis', fmt2(adjustedBasis)],
              ['Realized gain', fmt2(result.realizedGain)],
              ['Replacement purchase price', fmt2(replacementPurchasePrice)],
              ['New financing', fmt2(newMortgage)],
              ['Cash boot', fmt2(result.cashBoot)],
              ['Mortgage boot', fmt2(result.mortgageBoot)],
              ['Total boot', fmt2(result.totalBoot)],
              ['Recognized (taxable) gain', fmt2(result.recognizedGain)],
              ['Deferred gain', fmt2(result.deferredGain)],
              ['Estimated total tax due', fmt2(result.totalTaxDue)],
              ['Tax deferred by exchanging', fmt2(result.taxSavedByExchanging)],
              ['45-day identification deadline', result.identificationDeadline],
              ['180-day exchange deadline', result.exchangeDeadline],
              ['Outcome', result.verdictLabel],
            ].map(([label, value]) => (
              <tr key={label} className="border-b border-slate-300">
                <td className="py-1.5 pr-4 text-left">{label}</td>
                <td className="py-1.5 text-right font-mono">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {copiedNotice && (
        <div className="fixed bottom-6 right-6 z-50 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-2xl no-print">
          Summary copied to clipboard
        </div>
      )}
    </div>
  );
};

import { useState, useMemo, useEffect, useId } from 'react';
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
  ArrowLeftRight,
  Plus,
  Trash2,
  Building,
  Landmark,
  RefreshCw,
} from 'lucide-react';
import {
  calculateSection1031,
  compareReplacementCandidates,
  todayIso,
  type ReplacementCandidate,
  type Section1031Inputs,
} from '../lib/section1031Calculator';
import { updatePageMeta } from '../lib/router';
import { CALCULATOR_META } from '../data/routeMeta';
import { getCalculatorFaqs } from '../data/calculatorFaqs';
import { MethodologyDisclosure } from '../components/MethodologyDisclosure';
import { AdSlot } from '../components/AdSlot';
import { ShareCalculationButton } from '../components/ShareCalculationButton';
import { RelatedCalculators } from '../components/RelatedCalculators';
import { CurrencyInput } from '../components/CurrencyInput';
import { NumericInput } from '../components/NumericInput';
import { getUrlParams } from '../lib/urlState';
import { PageHeader, PrintReportButton } from '../components/calculator-kit';
import { SuiteSubNav } from '../components/SuiteSubNav';
import { InfoTooltip } from '../components/InfoTooltip';
import { trackUserClick } from '../lib/sentry';

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
  tooltip?: { title?: string; content: React.ReactNode };
}

/**
 * Labelled numeric field.
 *
 * The previous version wrapped everything in a single <label>. That looks
 * equivalent but is not: an implicit label binds to the FIRST labelable
 * descendant, and InfoTooltip renders a <button>, so any field carrying a
 * tooltip silently associated its label with the help button and left the
 * actual input unnamed for screen readers. Nesting a button inside a label is
 * also wrong on its own terms — clicking the tooltip would activate the field.
 * Explicit id/htmlFor keeps the association on the input and lets the tooltip
 * sit beside the label instead of inside it.
 */
const Field = ({ label, value, onChange, prefix, suffix, step = 1, hint, tooltip }: FieldProps) => {
  const inputId = useId();
  return (
    <div className="block">
      <div className="flex items-center gap-1 mb-1.5">
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-700">
          {label}
        </label>
        {tooltip && <InfoTooltip title={tooltip.title} content={tooltip.content} />}
      </div>
      {prefix === '$' ? (
        <CurrencyInput
          id={inputId}
          value={Number.isFinite(value) ? value : 0}
          onChange={onChange}
          className="py-2.5 rounded-xl text-sm"
        />
      ) : (
        <NumericInput
          id={inputId}
          value={Number.isFinite(value) ? value : 0}
          onChange={onChange}
          prefix={prefix}
          suffix={suffix}
          step={step}
          className="py-2.5 rounded-xl text-sm"
        />
      )}
      {hint && <span className="block text-[11px] text-slate-600 mt-1 leading-snug">{hint}</span>}
    </div>
  );
};

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
    default: 'text-slate-900',
    positive: 'text-emerald-700',
    negative: 'text-rose-700',
    muted: 'text-slate-500',
  }[tone];
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-600">{label}</span>
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
  const [qualifiedIntermediaryFee, setQualifiedIntermediaryFee] = useState(() =>
    getNumQuery('qi', 0)
  );

  // ---- Replacement property ----
  const [replacementPurchasePrice, setReplacementPurchasePrice] = useState(() =>
    getNumQuery('replacement', 600_000)
  );
  const [acquisitionCosts, setAcquisitionCosts] = useState(() => getNumQuery('acq', 0));
  const [newMortgage, setNewMortgage] = useState(() => getNumQuery('newdebt', 150_000));

  // Multi-candidate mode: §1031 practitioners routinely compare two or three
  // replacement properties to see which combination of price and financing
  // leaves the least boot, so this is the common workflow rather than an extra.
  const [compareMode, setCompareMode] = useState(() => getBoolQuery('compare', false));
  const [candidates, setCandidates] = useState<ReplacementCandidate[]>(() => [
    { id: 'a', label: 'Candidate A', purchasePrice: 600_000, acquisitionCosts: 0, newMortgage: 150_000 },
    { id: 'b', label: 'Candidate B', purchasePrice: 470_000, acquisitionCosts: 0, newMortgage: 150_000 },
  ]);

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
      qualifiedIntermediaryFee,
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
      qualifiedIntermediaryFee,
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

  const comparison = useMemo(
    () => (compareMode ? compareReplacementCandidates(inputs, candidates) : []),
    [compareMode, inputs, candidates]
  );

  const updateCandidate = (id: string, patch: Partial<ReplacementCandidate>) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const addCandidate = () => {
    setCandidates((prev) => {
      // Reuse the lowest unused letter so labels stay readable after removals.
      const used = new Set(prev.map((c) => c.label));
      const letter = 'ABCDEFGH'.split('').find((l) => !used.has(`Candidate ${l}`)) ?? String(prev.length + 1);
      return [
        ...prev,
        {
          id: `c${Date.now()}`,
          label: `Candidate ${letter}`,
          purchasePrice: 500_000,
          acquisitionCosts: 0,
          newMortgage: 150_000,
        },
      ];
    });
  };

  const removeCandidate = (id: string) => {
    setCandidates((prev) => (prev.length <= 2 ? prev : prev.filter((c) => c.id !== id)));
  };

  const shareParams: Record<string, string | number> = {
    sale: salePrice,
    costs: sellingCostsPercent,
    basis: adjustedBasis,
    dep: accumulatedDepreciation,
    debt: existingMortgagePayoff,
    ...(qualifiedIntermediaryFee > 0 ? { qi: qualifiedIntermediaryFee } : {}),
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
    compare: compareMode ? 1 : 0,
  };

  const handleExportExcel = async () => {
    trackUserClick('section_1031_export_excel');
    const summary = [
      { Parameter: 'Sale Price (Relinquished)', Value: salePrice },
      { Parameter: 'Selling Costs (Percentage)', Value: result.sellingCosts - result.qualifiedIntermediaryFee },
      ...(result.qualifiedIntermediaryFee > 0
        ? [{ Parameter: 'Qualified Intermediary (QI) Fee', Value: result.qualifiedIntermediaryFee }]
        : []),
      { Parameter: 'Total Relinquished Closing Costs', Value: result.sellingCosts },
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
    trackUserClick('section_1031_export_csv');
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
    trackUserClick('section_1031_copy_summary');
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
      border: 'border-emerald-200',
      bg: 'bg-emerald-50/80',
      text: 'text-emerald-700',
      Icon: CheckCircle2,
    },
    amber: {
      border: 'border-amber-200',
      bg: 'bg-amber-50/80',
      text: 'text-amber-700',
      Icon: AlertTriangle,
    },
    rose: {
      border: 'border-rose-200',
      bg: 'bg-rose-50/80',
      text: 'text-rose-700',
      Icon: AlertTriangle,
    },
  }[result.verdictColor as 'emerald' | 'amber' | 'rose'] ?? {
    border: 'border-slate-200',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    Icon: AlertTriangle,
  };

  const VerdictIcon = verdictTone.Icon;
  const idDeadlinePassed = result.identificationDaysRemaining < 0;
  const exchDeadlinePassed = result.exchangeDaysRemaining < 0;

  return (
    // data-sentry-mask: this page collects adjusted basis, accumulated
    // depreciation and mortgage balances: effectively the user's tax position.
    <div data-sentry-mask="true" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Canonical Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Calculators', path: '/finance-calculator' },
          { label: '1031 Exchange' }
        ]}
        badge={{
          icon: Scale,
          label: 'IRC §1031 Like-Kind Exchange Modeler',
          tone: 'indigo'
        }}
        title="1031 Exchange Calculator"
        description="Compute realized gain, cash and mortgage boot, and net tax liability under IRC §1031. Tracks 45-day identification and 180-day exchange closing deadlines with 100% private in-browser math."
        actions={
          <>
            <PrintReportButton label="Print Deal Summary" />
            <ShareCalculationButton
              params={shareParams}
              title="Share Deal"
            />
            <button
              type="button"
              onClick={handleExportExcel}
              className="btn-primary h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-sm cursor-pointer transition-transform active:scale-95 shrink-0"
            >
              <Download className="size-4" />
              <span>Export Deal (.xlsx)</span>
            </button>
          </>
        }
      />

      <SuiteSubNav suite="1031" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ---- Inputs ---- */}
        <div className="lg:col-span-7 space-y-6">
          {/* Relinquished */}
          <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xs">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 mb-5">
              <Building className="size-4 text-indigo-600" />
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
                tooltip={{
                  title: "Exchange Closing Expenses",
                  content: "Brokerage commissions, title fees, transfer taxes, and Qualified Intermediary (QI) costs that reduce net sales proceeds."
                }}
              />
              <Field
                label="Adjusted Basis"
                value={adjustedBasis}
                onChange={setAdjustedBasis}
                prefix="$"
                step={1000}
                hint="Purchase price + improvements − depreciation taken"
                tooltip={{
                  title: "Adjusted Basis",
                  content: "Your original purchase price plus capital improvements minus cumulative depreciation deductions taken over the ownership period."
                }}
              />
              <Field
                label="Accumulated Depreciation"
                value={accumulatedDepreciation}
                onChange={setAccumulatedDepreciation}
                prefix="$"
                step={1000}
                hint="Drives §1250 recapture on any boot"
                tooltip={{
                  title: "Depreciation Recapture (§1250)",
                  content: "IRS Section 1250 taxes prior depreciation deductions at a maximum 25% federal rate. Fully deferred if you trade across/up in value without receiving boot."
                }}
              />
              <Field
                label="Existing Mortgage Payoff"
                value={existingMortgagePayoff}
                onChange={setExistingMortgagePayoff}
                prefix="$"
                step={1000}
                tooltip={{
                  title: "Mortgage / Debt Relief Boot",
                  content: "Debt relief occurs if your new mortgage is smaller than your old payoff. You must bring new cash to the table to offset the difference, or it triggers taxable mortgage boot."
                }}
              />
              <Field
                label="Qualified Intermediary (QI) Fee"
                value={qualifiedIntermediaryFee}
                onChange={setQualifiedIntermediaryFee}
                prefix="$"
                step={100}
                hint="Fixed exchange escrow fee (typically $1,000 – $2,500)"
                tooltip={{
                  title: "Qualified Intermediary (QI) Fee",
                  content: "Treasury Reg. §1.1031(k)-1 requires an independent QI to hold exchange escrow. Routine QI and exchange escrow fees are allowable transaction costs that reduce realized gain."
                }}
              />
            </div>
          </section>

          {/* Replacement */}
          <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-5">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900">
                <Landmark className="size-4 text-emerald-700" />
                {compareMode ? 'Replacement Candidates' : 'Replacement Property (what you are buying)'}
              </h2>
              <button
                type="button"
                onClick={() => setCompareMode((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors cursor-pointer shadow-xs"
              >
                <ArrowLeftRight className="size-3.5" />
                {compareMode ? 'Single property' : 'Compare candidates'}
              </button>
            </div>

            {compareMode && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter each replacement property you are considering. Every candidate is measured
                  against the same relinquished sale, so only the replacement side varies.
                </p>

                {candidates.map((candidate) => {
                  const row = comparison.find((c) => c.candidate.id === candidate.id);
                  const tax = row?.result.totalTaxDue ?? 0;
                  return (
                    <div
                      key={candidate.id}
                      className={`p-4 rounded-xl border shadow-xs ${
                        row?.isBest
                          ? 'bg-emerald-50/60 border-emerald-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <input
                          type="text"
                          value={candidate.label}
                          onChange={(e) => updateCandidate(candidate.id, { label: e.target.value })}
                          aria-label="Candidate name"
                          className="bg-transparent text-sm font-semibold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none py-0.5 min-w-0 flex-1"
                        />
                        <div className="flex items-center gap-2 shrink-0">
                          {row?.isBest && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                              <CheckCircle2 className="size-3" />
                              Best
                            </span>
                          )}
                          {candidates.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeCandidate(candidate.id)}
                              aria-label={`Remove ${candidate.label}`}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Field
                          label="Purchase Price"
                          value={candidate.purchasePrice}
                          onChange={(v) => updateCandidate(candidate.id, { purchasePrice: v })}
                          prefix="$"
                          step={1000}
                        />
                        <Field
                          label="Acquisition Costs"
                          value={candidate.acquisitionCosts}
                          onChange={(v) => updateCandidate(candidate.id, { acquisitionCosts: v })}
                          prefix="$"
                          step={500}
                        />
                        <Field
                          label="New Financing"
                          value={candidate.newMortgage}
                          onChange={(v) => updateCandidate(candidate.id, { newMortgage: v })}
                          prefix="$"
                          step={1000}
                        />
                      </div>

                      <div
                        className={`mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs ${
                          row?.isBest ? 'text-emerald-700 font-medium' : 'text-slate-600'
                        }`}
                      >
                        <span>
                          Boot: <span className="font-mono">{fmt(tax === 0 ? 0 : row?.totalBoot ?? 0)}</span>
                        </span>
                        <span>
                          Tax due: <span className="font-mono font-bold">{fmt(tax)}</span>
                          {row && row.taxVsBest > 0 && (
                            <span className="text-rose-700 ml-1">(+{fmt(row.taxVsBest)})</span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={addCandidate}
                  disabled={candidates.length >= 5}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="size-3.5" />
                  {candidates.length >= 5 ? 'Maximum 5 candidates' : 'Add candidate property'}
                </button>
              </div>
            )}

            {!compareMode && (
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
            )}
          </section>

          {/* Timeline */}
          <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xs">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 mb-5">
              <Clock className="size-4 text-amber-700" />
              Statutory Deadlines
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <label className="block">
                <span className="block text-xs font-medium text-slate-700 mb-1.5">
                  Closing Date (relinquished)
                </span>
                <input
                  type="date"
                  value={closingDate}
                  onChange={(e) => setClosingDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filingExtension}
                  onChange={(e) => setFilingExtension(e.target.checked)}
                  className="mt-0.5 size-4 accent-indigo-500"
                />
                <span className="text-xs text-slate-800 leading-snug">
                  I will file a tax-return extension
                  <span className="block text-[11px] text-slate-500 mt-0.5">
                    Without one, the exchange period can end on April 15 (long before day 180).
                  </span>
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-xl border ${
                  idDeadlinePassed
                    ? 'bg-rose-50 border-rose-200'
                    : 'bg-slate-50 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="size-4 text-amber-700" />
                  <span className="text-xs font-semibold text-slate-700">45-Day Identification</span>
                </div>
                <div className="text-lg font-mono font-bold text-slate-900">
                  {result.identificationDeadline}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    idDeadlinePassed ? 'text-rose-700 font-semibold' : 'text-slate-500'
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
                    ? 'bg-rose-50 border-rose-200'
                    : 'bg-slate-50 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="size-4 text-emerald-700" />
                  <span className="text-xs font-semibold text-slate-700">180-Day Exchange</span>
                </div>
                <div className="text-lg font-mono font-bold text-slate-900">
                  {result.exchangeDeadline}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    exchDeadlinePassed ? 'text-rose-700 font-semibold' : 'text-slate-500'
                  }`}
                >
                  {exchDeadlinePassed
                    ? `Passed ${Math.abs(result.exchangeDaysRemaining)} days ago`
                    : `${result.exchangeDaysRemaining} days remaining`}
                </div>
              </div>
            </div>

            {result.exchangeDeadlineDriver === 'tax-return-due-date' && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="size-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  Your exchange period ends on <strong>April 15</strong>, not day 180. §1031 cuts the
                  exchange period short at the due date of that year&apos;s tax return. Filing an
                  extension would restore the full 180 days.
                </p>
              </div>
            )}
          </section>

          {/* Identification */}
          <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xs">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 mb-5">
              <Scale className="size-4 text-cyan-700" />
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
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-rose-50 border-rose-200'
              }`}
            >
              {result.identificationCompliant ? (
                <CheckCircle2 className="size-4 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="size-4 text-rose-700 shrink-0 mt-0.5" />
              )}
              <div className="text-xs leading-relaxed">
                <p
                  className={
                    result.identificationCompliant ? 'text-emerald-800' : 'text-rose-800'
                  }
                >
                  {result.identificationRule === '3-property' &&
                    'Within the three-property rule: you may identify up to three properties of any value.'}
                  {result.identificationRule === '200-percent' &&
                    'Within the 200% rule: you may identify any number of properties because their combined value is within 200% of the relinquished property.'}
                  {result.identificationRule === '95-percent' &&
                    'Neither the three-property nor the 200% rule applies, but the 95% rule saves the exchange because you are acquiring at least 95% of the value you identified.'}
                  {result.identificationRule === 'exceeded' &&
                    'This identification exceeds both the three-property and 200% limits, and you are acquiring less than 95% of the value identified: the exchange will not qualify as to the excess.'}
                </p>
              </div>
            </div>
          </section>

          {/* Tax rates */}
          <section className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setShowRates((v) => !v)}
              aria-expanded={showRates}
              aria-controls="tax-rate-assumptions"
              className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer text-left hover:bg-slate-50 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900">
                <Calculator className="size-4 text-indigo-600" />
                Tax Rate Assumptions
              </span>
              <ChevronDown
                className={`size-4 text-slate-400 transition-transform ${
                  showRates ? 'rotate-180' : ''
                }`}
              />
            </button>
            {showRates && (
              <div id="tax-rate-assumptions" className="px-5 sm:px-6 pb-5 sm:pb-6 border-t border-slate-100 pt-5">
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
                  <div>
                    <Field
                      label="State Income Tax"
                      value={stateTaxRatePercent}
                      onChange={setStateTaxRatePercent}
                      suffix="%"
                      step={0.1}
                      hint="Enter 0 if your state does not tax the gain"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[11px] font-medium text-slate-500 mr-0.5">Presets:</span>
                      {[
                        { label: 'CA (13.3%)', rate: 13.3 },
                        { label: 'NY (10.9%)', rate: 10.9 },
                        { label: 'NJ (10.75%)', rate: 10.75 },
                        { label: 'TX / FL (0%)', rate: 0 },
                        { label: 'US Avg (5.0%)', rate: 5.0 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setStateTaxRatePercent(preset.rate)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors border cursor-pointer ${
                            stateTaxRatePercent === preset.rate
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer self-start">
                    <input
                      type="checkbox"
                      checked={applyNiit}
                      onChange={(e) => setApplyNiit(e.target.checked)}
                      className="mt-0.5 size-4 accent-indigo-500"
                    />
                    <span className="text-xs text-slate-800 leading-snug">
                      Apply 3.8% NIIT
                      <span className="block text-[11px] text-slate-500 mt-0.5">
                        Net Investment Income Tax, above MAGI thresholds
                      </span>
                    </span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
                  State treatment of §1031 varies widely: a few states do not conform at all, and
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
              className={`rounded-2xl border p-5 sm:p-6 shadow-xs ${verdictTone.border} ${verdictTone.bg}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <VerdictIcon className={`size-5 ${verdictTone.text}`} />
                <span className={`text-sm font-bold uppercase tracking-wider ${verdictTone.text}`}>
                  {result.verdictLabel}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                {result.verdictDescription}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                    Tax Due Now
                  </div>
                  <div className="text-xl font-mono font-bold text-slate-900">
                    {fmt(result.totalTaxDue)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                    Gain Deferred
                  </div>
                  <div className="text-xl font-mono font-bold text-emerald-700">
                    {fmt(result.deferredGain)}
                  </div>
                </div>
              </div>
            </section>

            {/* Side-by-side ranking, only in compare mode. */}
            {compareMode && comparison.length > 0 && (
              <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xs">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 mb-3">
                  Candidate Comparison
                </h2>
                <div className="space-y-2">
                  {[...comparison]
                    .sort((a, b) => a.rank - b.rank)
                    .map((row) => (
                      <div
                        key={row.candidate.id}
                        className={`flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0 ${
                          row.isBest ? 'text-emerald-700 font-medium' : 'text-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span
                            className={`size-5 shrink-0 rounded-md text-[11px] font-bold flex items-center justify-center ${
                              row.isBest
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {row.rank}
                          </span>
                          <span className="text-xs truncate">{row.candidate.label}</span>
                        </span>
                        <span className="text-xs font-mono shrink-0">
                          {fmt(row.result.totalTaxDue)}
                          {row.taxVsBest > 0 && (
                            <span className="text-rose-700 ml-1">+{fmt(row.taxVsBest)}</span>
                          )}
                        </span>
                      </div>
                    ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                  Ranked by tax due. Adding cash or financing to a candidate reduces boot; a fully
                  deferred candidate reaches $0.
                </p>
              </section>
            )}

            <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 mb-3">
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

            <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 mb-3">
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
                  label="· of which §1250 recapture"
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
            <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-3 shadow-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="size-3.5 text-emerald-700" />
                  Excel
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="size-3.5 text-indigo-600" />
                  CSV
                </button>
              </div>
              <ShareCalculationButton params={shareParams} title="Share this exchange" />
              <button
                type="button"
                onClick={handleCopySummary}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className="size-3.5 text-slate-500" />
                {copiedNotice ? 'Summary copied' : 'Copy summary for your CPA'}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer shadow-xs"
              >
                <Printer className="size-3.5 text-slate-500" />
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
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-6">
          Frequently Asked Questions About 1031 Exchanges
        </h2>
        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={faq.q}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm sm:text-base font-semibold text-slate-900">{faq.q}</span>
                  <ChevronDown
                    className={`size-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-600 border-t border-slate-100 leading-relaxed">
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
              ['Selling costs (broker/transfer)', fmt2(result.sellingCosts - result.qualifiedIntermediaryFee)],
              ...(result.qualifiedIntermediaryFee > 0
                ? ([['Qualified Intermediary (QI) fee', fmt2(result.qualifiedIntermediaryFee)]] as [string, string][])
                : []),
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

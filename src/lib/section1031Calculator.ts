/**
 * IRC §1031 Like-Kind Exchange calculator.
 *
 * What this models
 * ----------------
 * A §1031 exchange lets an investor defer capital-gains tax when they sell
 * investment real property and reinvest the proceeds into replacement property
 * of like kind. The gain is DEFERRED, not forgiven: the basis carries over into
 * the replacement property.
 *
 * The tax only becomes due to the extent the investor receives "boot" — value
 * taken out of the exchange rather than rolled into the replacement property.
 * Boot has two forms:
 *
 *   1. Cash boot   — net sale proceeds not reinvested in the replacement.
 *   2. Mortgage boot — debt paid off on the relinquished property that is not
 *      replaced by new debt on the replacement property. (Paying off a mortgage
 *      without taking on new debt means the investor has been "cashed out" of
 *      that equity.)
 *
 * Core identity:
 *   recognized gain = min(realized gain, total boot)
 *   deferred gain   = realized gain - recognized gain
 *
 * Regulatory rules implemented
 * ----------------------------
 * - 45-day identification period and 180-day exchange period, both running from
 *   the closing of the relinquished property (§1031(k)(1)(A)). Neither is
 *   extendable, even for hardship.
 * - The exchange period ends on the EARLIER of 180 days or the due date of the
 *   taxpayer's return for the year of the transfer, INCLUDING extensions. This
 *   is the single most commonly missed deadline rule: a December closing with
 *   no filing extension effectively gets far less than 180 days.
 * - Identification limits: the 3-property rule, the 200% rule, and the 95% rule.
 * - Unrecaptured §1250 gain (depreciation recapture) is recognized BEFORE
 *   long-term capital gain, so it is taxed at its own rate.
 *
 * What this deliberately does NOT do
 * ----------------------------------
 * - It does not guess state tax rates. State treatment of §1031 ranges from
 *   full conformity (California) to non-conformity (Pennsylvania), and several
 *   states impose a claw-back on later sale of the replacement property. The
 *   rate is an input.
 * - It does not model related-party rules, reverse exchanges, improvement
 *   exchanges, seller-financed ("installment") exchanges, or partnership /
 *   TIC structures.
 * - It is an estimator, not tax advice.
 */

/** ISO date string (YYYY-MM-DD). */
export type IsoDate = string;

export interface Section1031Inputs {
  // ---- Relinquished (property being sold) ----
  salePrice: number;
  /** Total selling costs (commission + title + transfer tax) as % of sale price. */
  sellingCostsPercent: number;
  /**
   * Adjusted basis = original purchase price + capital improvements
   * - depreciation already taken. This is NOT the purchase price.
   */
  adjustedBasis: number;
  /** Depreciation previously deducted; drives §1250 recapture on any boot. */
  accumulatedDepreciation: number;
  /** Mortgage balance paid off at closing. */
  existingMortgagePayoff: number;

  // ---- Replacement (property being bought) ----
  replacementPurchasePrice: number;
  /** Closing costs on the replacement (title, escrow, transfer tax). */
  acquisitionCosts: number;
  /** New financing placed on the replacement property. */
  newMortgage: number;

  // ---- Timeline ----
  /** Closing date of the relinquished property. Starts both clocks. */
  closingDate: IsoDate;
  /** Whether the taxpayer filed for an extension on that year's return. */
  filingExtension: boolean;

  // ---- Identification ----
  propertiesIdentified: number;
  /** Total fair market value of everything identified. */
  identifiedTotalFmv: number;
  /** FMV of the relinquished property, used for the 200% rule. */
  relinquishedFmv: number;

  // ---- Tax rates (user-supplied; see module note) ----
  federalLtcgRatePercent: number;
  depreciationRecaptureRatePercent: number;
  stateTaxRatePercent: number;
  /** Net Investment Income Tax, 3.8%, applies above MAGI thresholds. */
  applyNiit: boolean;
}

export type Verdict = 'full-deferral' | 'partial-boot' | 'taxable';
export type IdentificationRule = '3-property' | '200-percent' | '95-percent' | 'exceeded';

export interface Section1031Result {
  // Relinquished side
  sellingCosts: number;
  netSaleProceeds: number;
  realizedGain: number;
  /** Cash the investor actually walks away with before reinvesting. */
  cashFromSale: number;

  // Replacement side
  totalReplacementCost: number;

  // Boot
  cashBoot: number;
  mortgageBoot: number;
  totalBoot: number;
  /** Debt paid off on the relinquished property that was not replaced. */
  debtReplacementShortfall: number;
  /** Cash the investor had to bring to closing beyond their sale proceeds. */
  additionalCashPaid: number;
  /** The same figure as a fraction of the debt relief, for "cured" messaging. */
  debtReliefCuredByCash: boolean;

  // Gain
  recognizedGain: number;
  deferredGain: number;
  recapturePortion: number;
  capitalGainPortion: number;

  // Tax
  federalTax: number;
  stateTax: number;
  totalTaxDue: number;
  taxIfSoldOutright: number;
  taxSavedByExchanging: number;

  // Timeline
  identificationDeadline: IsoDate;
  exchangeDeadline: IsoDate;
  /** Which constraint ended the exchange period. */
  exchangeDeadlineDriver: '180-days' | 'tax-return-due-date';
  identificationDaysRemaining: number;
  exchangeDaysRemaining: number;

  // Identification compliance
  identificationRule: IdentificationRule;
  identificationCompliant: boolean;

  // Verdict
  verdict: Verdict;
  verdictLabel: string;
  verdictColor: string;
  verdictDescription: string;
}

const MS_PER_DAY = 86_400_000;

/** Parse an ISO date as UTC midnight, so date maths is timezone-stable. */
function parseIsoDate(iso: IsoDate): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
}

function toIso(date: Date): IsoDate {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: IsoDate, days: number): IsoDate {
  const d = parseIsoDate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toIso(d);
}

/** Whole days from `from` to `to`; negative when `to` is in the past. */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((parseIsoDate(to).getTime() - parseIsoDate(from).getTime()) / MS_PER_DAY);
}

export function todayIso(): IsoDate {
  return toIso(new Date());
}

/**
 * Due date of the return for the year of the transfer.
 *
 * The §1031 exchange period cannot run past the unextended due date of that
 * year's return, so a late-year closing gets less than 180 days unless the
 * taxpayer files for an extension.
 */
export function taxReturnDueDate(closingDate: IsoDate, filingExtension: boolean): IsoDate {
  const year = parseIsoDate(closingDate).getUTCFullYear();
  // Individual returns are due April 15; an extension moves them to October 15.
  return filingExtension ? `${year + 1}-10-15` : `${year + 1}-04-15`;
}

/**
 * Classify the identification under the three safe harbours of §1031.
 *
 * - 3-property rule: identify up to three properties, any value.
 * - 200% rule: identify any number, provided total FMV <= 200% of the
 *   relinquished property's FMV.
 * - 95% rule: if neither applies, the exchange still qualifies provided the
 *   taxpayer actually acquires at least 95% of the value identified.
 */
export function evaluateIdentification(inputs: {
  propertiesIdentified: number;
  identifiedTotalFmv: number;
  relinquishedFmv: number;
  acquiredFmv: number;
}): { rule: IdentificationRule; compliant: boolean } {
  const { propertiesIdentified, identifiedTotalFmv, relinquishedFmv, acquiredFmv } = inputs;

  if (propertiesIdentified <= 0) {
    return { rule: '3-property', compliant: true };
  }

  if (propertiesIdentified <= 3) {
    return { rule: '3-property', compliant: true };
  }

  // Guard against a zero/absent relinquished FMV making the ratio meaningless.
  if (relinquishedFmv > 0 && identifiedTotalFmv <= relinquishedFmv * 2) {
    return { rule: '200-percent', compliant: true };
  }

  const acquiredNinetyFive = identifiedTotalFmv * 0.95;
  const compliant = identifiedTotalFmv > 0 && acquiredFmv >= acquiredNinetyFive;
  return { rule: compliant ? '95-percent' : 'exceeded', compliant };
}

const clampPercent = (value: number) => Math.min(100, Math.max(0, value || 0));

export function calculateSection1031(
  inputs: Section1031Inputs,
  today: IsoDate = todayIso()
): Section1031Result {
  const salePrice = Math.max(0, inputs.salePrice);
  const adjustedBasis = Math.max(0, inputs.adjustedBasis);
  const accumulatedDepreciation = Math.max(0, inputs.accumulatedDepreciation);

  // ---- Relinquished side ----
  const sellingCosts = (salePrice * clampPercent(inputs.sellingCostsPercent)) / 100;
  const netSaleProceeds = salePrice - sellingCosts;
  const realizedGain = Math.max(0, netSaleProceeds - adjustedBasis);
  const mortgagePayoff = Math.max(0, inputs.existingMortgagePayoff);
  const cashFromSale = netSaleProceeds - mortgagePayoff;

  // ---- Replacement side ----
  const replacementPurchasePrice = Math.max(0, inputs.replacementPurchasePrice);
  const acquisitionCosts = Math.max(0, inputs.acquisitionCosts);
  const totalReplacementCost = replacementPurchasePrice + acquisitionCosts;
  const newMortgage = Math.max(0, inputs.newMortgage);

  // ---- Boot ----
  //
  // Two requirements must BOTH be met to avoid boot:
  //   1. Reinvest all net proceeds.
  //   2. Replace all debt (with new debt, or with cash brought to closing).
  //
  // Getting either wrong produces boot, and the two interact:
  //
  //   - Cash boot is measured against the cash the investor actually had to put
  //     in, so new financing on the replacement REDUCES the cash required and
  //     therefore INCREASES cash boot. Buying a $100k property with a $50k loan
  //     only absorbs $50k of proceeds, leaving the rest in the investor's pocket.
  //   - Mortgage boot is debt relief, but it is cured by cash the investor puts
  //     in BEYOND their proceeds. Paying off a $50k mortgage and buying the
  //     replacement outright with an extra $50k of personal cash is not boot.
  //
  // Both were wrong in an earlier revision of this module; the three canonical
  // cases in the test file pin the behaviour down.
  const cashNeeded = totalReplacementCost - newMortgage;
  const additionalCashPaid = Math.max(0, cashNeeded - cashFromSale);

  const cashBoot = Math.max(0, cashFromSale - cashNeeded);

  const debtRelief = Math.max(0, mortgagePayoff - newMortgage);
  const debtReplacementShortfall = debtRelief;
  const mortgageBoot = Math.max(0, debtRelief - additionalCashPaid);

  const totalBoot = cashBoot + mortgageBoot;
  const isFullyDeferred = totalBoot <= 0.005;

  // ---- Gain recognition ----
  // Only boot is taxable; the remainder of the gain carries into the new basis.
  const recognizedGain = Math.min(realizedGain, totalBoot);
  const deferredGain = Math.max(0, realizedGain - recognizedGain);

  // Depreciation recapture is recognized first, at its own rate.
  const recapturePortion = Math.min(recognizedGain, accumulatedDepreciation);
  const capitalGainPortion = Math.max(0, recognizedGain - recapturePortion);

  // ---- Tax ----
  const niitRate = inputs.applyNiit ? 3.8 : 0;
  const federalTax =
    (recapturePortion * clampPercent(inputs.depreciationRecaptureRatePercent)) / 100 +
    (capitalGainPortion * (clampPercent(inputs.federalLtcgRatePercent) + niitRate)) / 100;
  const stateTax = (recognizedGain * clampPercent(inputs.stateTaxRatePercent)) / 100;
  const totalTaxDue = federalTax + stateTax;

  // What the same sale would have cost with no exchange at all.
  const outrightRecapture = Math.min(realizedGain, accumulatedDepreciation);
  const outrightCapital = Math.max(0, realizedGain - outrightRecapture);
  const taxIfSoldOutright =
    (outrightRecapture * clampPercent(inputs.depreciationRecaptureRatePercent)) / 100 +
    (outrightCapital * (clampPercent(inputs.federalLtcgRatePercent) + niitRate)) / 100 +
    (realizedGain * clampPercent(inputs.stateTaxRatePercent)) / 100;

  const taxSavedByExchanging = Math.max(0, taxIfSoldOutright - totalTaxDue);

  // ---- Timeline ----
  const closingDate = inputs.closingDate;
  const identificationDeadline = addDays(closingDate, 45);
  const day180 = addDays(closingDate, 180);
  const returnDue = taxReturnDueDate(closingDate, inputs.filingExtension);
  const exchangeDeadline = day180 <= returnDue ? day180 : returnDue;

  const identificationDaysRemaining = daysBetween(today, identificationDeadline);
  const exchangeDaysRemaining = daysBetween(today, exchangeDeadline);

  // ---- Identification ----
  const { rule: identificationRule, compliant: identificationCompliant } = evaluateIdentification({
    propertiesIdentified: inputs.propertiesIdentified,
    identifiedTotalFmv: inputs.identifiedTotalFmv,
    relinquishedFmv: inputs.relinquishedFmv,
    acquiredFmv: totalReplacementCost,
  });

  // ---- Verdict ----
  let verdict: Verdict;
  if (isFullyDeferred) {
    verdict = 'full-deferral';
  } else if (recognizedGain >= realizedGain && realizedGain > 0) {
    // Boot consumed the entire gain — economically this is just a taxable sale.
    verdict = 'taxable';
  } else {
    verdict = 'partial-boot';
  }

  const bootBreakdown: string[] = [];
  if (cashBoot > 0.005) bootBreakdown.push(`${formatUsd(cashBoot)} of un-reinvested cash`);
  if (mortgageBoot > 0.005) bootBreakdown.push(`${formatUsd(mortgageBoot)} of un-replaced debt`);

  const verdictCopy: Record<Verdict, { label: string; color: string; description: string }> = {
    'full-deferral': {
      label: 'Fully Deferred',
      color: 'emerald',
      description:
        'You are receiving no boot. The entire realized gain carries into the replacement property\'s basis and no tax is due on this exchange.',
    },
    'partial-boot': {
      label: 'Partial Boot',
      color: 'amber',
      description: `You are taking ${bootBreakdown.join(' and ')} out of the exchange. Tax is due on that portion only; the remaining ${formatUsd(
        deferredGain
      )} of gain stays deferred.`,
    },
    taxable: {
      label: 'Taxable — No Deferral',
      color: 'rose',
      description:
        'Boot equals or exceeds your entire realized gain, so nothing is deferred. This is economically a taxable sale rather than an exchange.',
    },
  };

  return {
    sellingCosts: round2(sellingCosts),
    netSaleProceeds: round2(netSaleProceeds),
    realizedGain: round2(realizedGain),
    cashFromSale: round2(cashFromSale),

    totalReplacementCost: round2(totalReplacementCost),

    cashBoot: round2(cashBoot),
    mortgageBoot: round2(mortgageBoot),
    totalBoot: round2(totalBoot),
    debtReplacementShortfall: round2(debtReplacementShortfall),
    additionalCashPaid: round2(additionalCashPaid),
    debtReliefCuredByCash: debtRelief > 0 && additionalCashPaid >= debtRelief,

    recognizedGain: round2(recognizedGain),
    deferredGain: round2(deferredGain),
    recapturePortion: round2(recapturePortion),
    capitalGainPortion: round2(capitalGainPortion),

    federalTax: round2(federalTax),
    stateTax: round2(stateTax),
    totalTaxDue: round2(totalTaxDue),
    taxIfSoldOutright: round2(taxIfSoldOutright),
    taxSavedByExchanging: round2(taxSavedByExchanging),

    identificationDeadline,
    exchangeDeadline,
    exchangeDeadlineDriver: exchangeDeadline === day180 ? '180-days' : 'tax-return-due-date',
    identificationDaysRemaining,
    exchangeDaysRemaining,

    identificationRule,
    identificationCompliant,

    verdict,
    verdictLabel: verdictCopy[verdict].label,
    verdictColor: verdictCopy[verdict].color,
    verdictDescription: verdictCopy[verdict].description,
  };
}

/** A candidate replacement property the investor is considering. */
export interface ReplacementCandidate {
  id: string;
  label: string;
  purchasePrice: number;
  acquisitionCosts: number;
  newMortgage: number;
}

export interface CandidateComparison {
  candidate: ReplacementCandidate;
  result: Section1031Result;
  /** Dense rank by total tax due; 1 is the best candidate. */
  rank: number;
  isBest: boolean;
  /** Extra tax this candidate costs versus the best one. */
  taxVsBest: number;
  /** Boot this candidate leaves on the table. */
  totalBoot: number;
}

/**
 * Compare several candidate replacement properties against one relinquished
 * sale.
 *
 * This is the real §1031 workflow: an investor typically identifies two or
 * three properties and has to decide which combination of price and financing
 * leaves the least boot. Every candidate is evaluated with the same relinquished
 * figures, so only the replacement side varies.
 *
 * Candidates are ranked by total tax due (dense ranking, so ties share a rank),
 * which is the number the investor actually cares about.
 */
export function compareReplacementCandidates(
  base: Section1031Inputs,
  candidates: ReplacementCandidate[],
  today: IsoDate = todayIso()
): CandidateComparison[] {
  if (candidates.length === 0) return [];

  const evaluated = candidates.map((candidate) => ({
    candidate,
    result: calculateSection1031(
      {
        ...base,
        replacementPurchasePrice: Math.max(0, candidate.purchasePrice),
        acquisitionCosts: Math.max(0, candidate.acquisitionCosts),
        newMortgage: Math.max(0, candidate.newMortgage),
      },
      today
    ),
  }));

  // Dense rank on tax due.
  const sortedTaxes = [...new Set(evaluated.map((e) => e.result.totalTaxDue))].sort((a, b) => a - b);
  const bestTax = sortedTaxes[0];

  return evaluated.map((entry) => {
    const rank = sortedTaxes.indexOf(entry.result.totalTaxDue) + 1;
    return {
      ...entry,
      rank,
      isBest: rank === 1,
      taxVsBest: round2(entry.result.totalTaxDue - bestTax),
      totalBoot: entry.result.totalBoot,
    };
  });
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatUsd(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

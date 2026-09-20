import { calculateMortgage, type MortgageInputs } from './mortgageCalculator';
import { calculateDscr, type DscrInputs } from './dscrCalculator';
import { calculateRefinance, type RefinanceInputs } from './refinanceCalculator';
import { calculateHardMoney, type HardMoneyInputs } from './hardMoneyCalculator';
import { LATEST_PMMS_RATES } from '../data/pmmsRates';

export interface ParamItem {
  key: string;
  label: string;
  value: number;
  formattedValue: string;
  isAssumed: boolean;
  explanation?: string;
}

export interface InstantCalculationResult {
  canCalculate: boolean;
  targetCalculator: 'mortgage' | 'dscr' | 'refinance' | 'hard_money';
  targetTitle: string;
  targetRoute: string;
  params: ParamItem[];
  primaryMetricLabel: string;
  primaryMetricValue: string;
  secondaryMetricLabel: string;
  secondaryMetricValue: string;
  verdictLabel: string;
  verdictTone: 'emerald' | 'indigo' | 'amber' | 'rose';
  verdictDescription: string;
  prefilledUrl: string;
}

/**
 * Parses numeric monetary values from text, supporting:
 * - Chinese "万" / "w": 80万 -> 800000, 85.5万 -> 855000
 * - English "k" / "m": $850k -> 850000, $2.4M -> 2400000
 * - Comma numbers: $850,000 -> 850000
 */
export function parseAmount(str: string): number | null {
  if (!str) return null;
  const cleaned = str.trim().toLowerCase();

  /*
   * Latin unit shorthands require a word boundary.
   *
   * Without it, the bare letter matched inside ordinary English words: the "w"
   * of "with" satisfied the Chinese 万 branch and the "m" of "mortgage" satisfied
   * the million branch. Since the digits captured were those *after* the last
   * comma, "$1,200,000 with ..." parsed as "000 w" -> 0, and "$600,000 mortgage"
   * as "000 m" -> 0. The amount then failed the >= 10000 price check and the
   * whole parse returned null, so two of the most common words in real broker
   * email silently disabled the feature. 万 is a CJK character and needs no
   * boundary.
   *
   * Commas are captured so "1,200k" is not truncated at the comma, then stripped
   * before parsing.
   */
  const toNumber = (raw: string) => parseFloat(raw.replace(/,/g, ''));

  // 万 / w pattern
  const wanMatch = cleaned.match(/([\d.,]+)\s*(?:万|w\b)/);
  if (wanMatch) {
    const num = toNumber(wanMatch[1]);
    if (!isNaN(num)) return Math.round(num * 10000);
  }

  // M / million pattern
  const millionMatch = cleaned.match(/([\d.,]+)\s*(?:m\b|million\b)/);
  if (millionMatch) {
    const num = toNumber(millionMatch[1]);
    if (!isNaN(num)) return Math.round(num * 1000000);
  }

  // K / thousand pattern
  const kMatch = cleaned.match(/([\d.,]+)\s*(?:k\b|thousand\b)/);
  if (kMatch) {
    const num = toNumber(kMatch[1]);
    if (!isNaN(num)) return Math.round(num * 1000);
  }

  // Standard raw numbers with optional commas or currency symbols
  const rawMatch = cleaned.replace(/[$,¥￥\s]/g, '').match(/(\d+(?:\.\d+)?)/);
  if (rawMatch) {
    const num = parseFloat(rawMatch[1]);
    if (!isNaN(num)) return num;
  }

  return null;
}

/**
 * Helper to parse Chinese fractions like "三成" (30%), "两成半" (25%), "3成" (30%), "3.5成" (35%)
 */
export function parseChineseCheng(str: string): number | null {
  if (!str) return null;
  const chengMap: Record<string, number> = {
    '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5,
    '六': 6, '七': 7, '八': 8, '九': 9, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
  };

  // e.g. "两成半", "3成半", "三成半"
  const banMatch = str.match(/([一二两三四五六七八九\d])\s*成半/);
  if (banMatch && chengMap[banMatch[1]]) {
    return chengMap[banMatch[1]] * 10 + 5;
  }

  // e.g. "2.5成", "3.5成"
  const dotCheng = str.match(/(\d(?:\.\d)?)\s*成/);
  if (dotCheng) {
    const val = parseFloat(dotCheng[1]);
    if (!isNaN(val)) return Math.round(val * 10);
  }

  // e.g. "三成", "两成", "3成", "2成"
  const singleMatch = str.match(/([一二两三四五六七八九\d])\s*成/);
  if (singleMatch && chengMap[singleMatch[1]]) {
    return chengMap[singleMatch[1]] * 10;
  }

  return null;
}

/**
 * Words marking a figure as a recurring cost or transaction fee rather than a
 * property's value. A listing is dense with these ($8,400/yr taxes, $250/mo HOA,
 * $12,000 closing costs) and they frequently appear BEFORE the price, so a
 * leftmost-match strategy picks a fee as the purchase price.
 */
const EXPENSE_CONTEXT =
  /(tax|taxes|insurance|hoa|dues|fee|fees|closing|escrow|rehab|repair|renovation|maintenance|rent|rented|monthly|commission|points|utilities|holding|inspection|appraisal|survey|title|deposit|税|保险|物业|维修|装修|租金|首付)/i;

/** Words that explicitly introduce a property's value. */
const PROPERTY_PRICE_CONTEXT =
  /(price|value|asking|listed\s*at|purchase|cost|总价|售价|挂牌|标价|评估|一套|property|home|house|unit|building|listing|房子|房产)/i;

/**
 * Every money-looking token in a string, in order of appearance.
 *
 * Three shapes: a currency-prefixed figure ("$850,000"), a unit-suffixed figure
 * ("85万", "$240k", "1.2M"), and a bare five-to-eight digit figure ("450000").
 */
const MONEY_TOKEN =
  /[$¥￥]\s*\d[\d,]*(?:\.\d+)?\s*(?:万|million|w\b|k\b|m\b)?|\d[\d,]*(?:\.\d+)?\s*(?:万|million|w\b|k\b|m\b)|\b\d{5,8}\b/gi;

/**
 * Choose the figure that most plausibly represents the property's value.
 *
 * The previous implementation returned the FIRST currency-shaped match, which
 * meant "Closing costs around $12,000 ... The property itself is $525,000"
 * extracted $12,000 as the home value. Rather than ranking by position, every
 * candidate is scored on its surrounding context:
 *
 *   1. A figure introduced by a property word ("asking price", "home value",
 *      "总价") and NOT flagged as a cost wins.
 *   2. Otherwise the largest figure that is not in a cost context wins, because
 *      the property's value dominates the fees in a listing.
 *
 * The context is the preceding few WORDS, not a fixed character window. A
 * character window slices mid-word: "property itself is" became "roperty itself
 * is", so the price was not recognised as a price, while "Closing costs" became
 * "sing costs" and its "cost" read as a property word. Counting words avoids
 * both, and stops the window reaching across a sentence boundary.
 */
export function selectPropertyPrice(text: string): number | null {
  const candidates: { value: number; strong: boolean; expense: boolean }[] = [];

  MONEY_TOKEN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = MONEY_TOKEN.exec(text)) !== null) {
    const raw = match[0];
    const value = parseAmount(raw);
    if (!value || value < 10000) continue;

    const before = text
      .slice(0, match.index)
      .split(/[\s,;:.!?()[\]{}"']+/)
      .filter(Boolean)
      .slice(-4)
      .join(' ');
    const after = text.slice(match.index + raw.length, match.index + raw.length + 10);
    const looksRecurring = /^\s*(\/\s*(mo|yr|month|year)|per\s+(month|year|annum))/i.test(after);
    const expense = EXPENSE_CONTEXT.test(before) || looksRecurring;

    candidates.push({ value, strong: !expense && PROPERTY_PRICE_CONTEXT.test(before), expense });
  }

  if (candidates.length === 0) return null;

  const strong = candidates.filter((c) => c.strong);
  if (strong.length > 0) return Math.max(...strong.map((c) => c.value));

  const clean = candidates.filter((c) => !c.expense);
  if (clean.length > 0) return Math.max(...clean.map((c) => c.value));

  return candidates[0].value;
}

/**
 * Currency formatter helper
 */
const fmtCurrency = (val: number) =>
  val.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

/**
 * Extract financial parameters and perform instant local calculation
 */
export function extractAndCalculateDeal(
  text: string,
  overrides?: {
    downPaymentPercent?: number;
    loanTermYears?: number;
    interestRate?: number;
  }
): InstantCalculationResult | null {
  if (!text || !text.trim()) return null;

  const lower = text.toLowerCase();

  // 1. Detect target tool intent
  const isExplicitMortgage =
    lower.includes('自住') ||
    lower.includes('刚需') ||
    lower.includes('学区房') ||
    lower.includes('自住房') ||
    lower.includes('owner occupied') ||
    lower.includes('primary residence');

  const isDscr =
    !isExplicitMortgage &&
    (lower.includes('dscr') ||
      lower.includes('租') ||
      /\brents?\b/i.test(lower) ||
      /\brented\b/i.test(lower) ||
      /\brental\b/i.test(lower) ||
      /\btenant\b/i.test(lower) ||
      lower.includes('4-plex') ||
      lower.includes('quad') ||
      lower.includes('duplex') ||
      lower.includes('triplex') ||
      lower.includes('airbnb') ||
      lower.includes('投资房') ||
      lower.includes('包租') ||
      lower.includes('收租'));

  const isRefinance =
    !isDscr &&
    (lower.includes('refinance') ||
      lower.includes('refi') ||
      lower.includes('转贷') ||
      lower.includes('重贷') ||
      lower.includes('cash out') ||
      lower.includes('降息') ||
      lower.includes('break even'));

  const isHardMoney =
    !isDscr &&
    !isRefinance &&
    (lower.includes('flip') ||
      lower.includes('hard money') ||
      lower.includes('rehab') ||
      lower.includes('70%') ||
      lower.includes('炒房') ||
      lower.includes('翻新') ||
      lower.includes('过桥'));

  // 2. Pre-extract Down Payment string to prevent matching down payment as property price
  // e.g. "首付 20 万买 100 万的房子" -> dpString: "首付 20 万"
  let dpRawMatchStr = '';
  let preExtractedDpAmount: number | null = null;
  const dpAmtMatch = text.match(
    /(?:首付|down\s*payment|down)\s*(?:为|是|：|:)?\s*([$¥￥]?\s*[\d.,]+\s*(?:万|w|k|m)?)/i
  );
  if (dpAmtMatch) {
    dpRawMatchStr = dpAmtMatch[0];
    preExtractedDpAmount = parseAmount(dpAmtMatch[1]);
  }

  // Text with down payment phrase masked out for price extraction
  const textWithoutDp = dpRawMatchStr ? text.replace(dpRawMatchStr, ' ') : text;

  // 3. Extract purchase price / property value
  let price: number | null = null;
  let priceIsAssumed = false;

  // Patterns for price:
  // Property value, chosen by context rather than by leftmost position so that
  // fees, taxes and shorthand down payments cannot masquerade as the price.
  price = selectPropertyPrice(textWithoutDp);

  // If still no price found, we cannot calculate accurately
  if (!price) {
    return null;
  }

  // 4. Extract Down Payment Percentage
  let downPaymentPct: number | null = overrides?.downPaymentPercent ?? null;
  let downPaymentIsAssumed = false;

  if (downPaymentPct === null) {
    // Check for Chinese fraction: e.g. "首付两成半", "三成首付", "首付 3 成"
    const chengVal = parseChineseCheng(text);
    if (chengVal !== null && chengVal >= 5 && chengVal <= 90) {
      downPaymentPct = chengVal;
    }
  }

  if (downPaymentPct === null) {
    const dpMatch = text.match(/(?:首付|down\s*payment|down)\s*(?:为|是|：|:)?\s*(\d{1,2}(?:\.\d+)?)\s*%/i);
    const dpPctPreMatch = text.match(/(\d{1,2}(?:\.\d+)?)\s*%\s*(?:首付|down)/i);
    if (dpMatch) {
      downPaymentPct = parseFloat(dpMatch[1]);
    } else if (dpPctPreMatch) {
      downPaymentPct = parseFloat(dpPctPreMatch[1]);
    } else if (preExtractedDpAmount && preExtractedDpAmount < price) {
      downPaymentPct = Math.round((preExtractedDpAmount / price) * 100);
    }
  }

  if (downPaymentPct === null) {
    // Smart heuristic default: 20% (standard conventional / DSCR baseline)
    downPaymentPct = isDscr ? 25 : 20;
    downPaymentIsAssumed = true;
  }

  // 5. Extract Interest Rate
  let interestRate: number | null = overrides?.interestRate ?? null;
  let rateIsAssumed = false;

  if (interestRate === null) {
    // "rate is 7%" and "loan at 12%" are the two most common phrasings after
    // the explicit "rate 7%" form, so the separator list accepts is/of/=/at.
    const rateMatch = text.match(/(?:利率|利息|interest\s*rate|rate|apr)\s*(?:为|是|：|:|能拿到|约|is|of|=)?\s*(\d{1,2}(?:\.\d+)?)\s*%/i);
    const ratePrefixMatch = text.match(/(\d{1,2}(?:\.\d{1,3})?)\s*%\s*(?:利率|利息|rate)/i);
    const rateAtMatch = text.match(/(?:at|@)\s*(\d{1,2}(?:\.\d+)?)\s*%/i);
    if (rateMatch) {
      interestRate = parseFloat(rateMatch[1]);
    } else if (ratePrefixMatch) {
      interestRate = parseFloat(ratePrefixMatch[1]);
    } else if (rateAtMatch) {
      interestRate = parseFloat(rateAtMatch[1]);
    } else {
      // Look for bare percentages like 6.5% or 7.125% that aren't down payment
      const anyPct = text.match(/\b(\d{1,2}\.\d{1,3})\s*%/);
      if (anyPct && parseFloat(anyPct[1]) !== downPaymentPct) {
        interestRate = parseFloat(anyPct[1]);
      }
    }
  }

  if (interestRate === null) {
    // Smart heuristic default: Freddie Mac PMMS benchmark
    interestRate = isDscr ? 7.25 : LATEST_PMMS_RATES.fixed30.rate || 6.95;
    rateIsAssumed = true;
  }

  // 6. Extract Loan Term
  let termYears: number | null = overrides?.loanTermYears ?? null;
  let termIsAssumed = false;

  if (termYears === null) {
    // "30-year" and "15-yr" are the usual English spellings; the hyphen must be
    // accepted or the term is silently treated as unknown and defaulted to 30.
    const termMatch = text.match(/(\d{1,2})\s*[-–—]?\s*(?:年|year|yr|期)/i);
    if (termMatch) {
      const parsed = parseInt(termMatch[1], 10);
      if (parsed === 15 || parsed === 20 || parsed === 30 || parsed === 40) {
        termYears = parsed;
      }
    }
  }

  if (termYears === null) {
    termYears = 30; // Industry gold standard
    termIsAssumed = true;
  }

  // 7. Extract Monthly Rent (for DSCR)
  let monthlyRent: number | null = null;
  let rentIsAssumed = false;

  if (isDscr) {
    const rentRegexes = [
      /(?:月租|租金|能租|已租|可租|带租约|能收|gross\s*rent|\brents?\b|rented\s*for)\s*(?:为|是|：|:|约)?\s*([$¥￥]?\s*[\d.,]+\s*(?:万|w|k)?)/i,
      /([$¥￥]?\s*[\d.,]+\s*(?:万|w|k)?)\s*(?:块|元)?\s*(?:\/月|\/mo|per\s*month|一个?月)/i,
    ];

    for (const reg of rentRegexes) {
      const m = text.match(reg);
      if (m) {
        const parsedRent = parseAmount(m[1]);
        if (parsedRent && parsedRent < price && parsedRent >= 300) {
          monthlyRent = parsedRent;
          break;
        }
      }
    }

    if (!monthlyRent) {
      // Benchmark rental yield: ~0.8% of purchase price per month
      monthlyRent = Math.round(price * 0.008);
      rentIsAssumed = true;
    }
  }

  // 7. Assemble Param List
  const params: ParamItem[] = [
    {
      key: 'price',
      label: isDscr ? 'Property Price' : 'Home Value',
      value: price,
      formattedValue: fmtCurrency(price),
      isAssumed: priceIsAssumed,
      explanation: priceIsAssumed ? 'Assumed baseline price' : 'Extracted from input',
    },
    {
      key: 'downPayment',
      label: 'Down Payment',
      value: downPaymentPct,
      formattedValue: `${downPaymentPct}% (${fmtCurrency(Math.round(price * (downPaymentPct / 100)))})`,
      isAssumed: downPaymentIsAssumed,
      explanation: downPaymentIsAssumed
        ? `Industry standard ${downPaymentPct}% (avoids PMI)`
        : 'Extracted from input',
    },
    {
      key: 'interestRate',
      label: 'Interest Rate',
      value: interestRate,
      /*
       * Show the rate the user actually wrote. Rates are quoted to an eighth
       * (5.875%, 6.625%), and rounding the displayed figure to 2dp made the
       * panel disagree with the input — the URL carried 5.875 while the chip
       * said 5.88%. Trailing zeros are trimmed so 7.5% does not read 7.500%.
       */
      formattedValue: `${Number(interestRate.toFixed(3))}%`,
      isAssumed: rateIsAssumed,
      explanation: rateIsAssumed ? 'Freddie Mac PMMS® market benchmark' : 'Extracted from input',
    },
    {
      key: 'loanTerm',
      label: 'Loan Term',
      value: termYears,
      formattedValue: `${termYears} Years`,
      isAssumed: termIsAssumed,
      explanation: termIsAssumed ? 'Standard 30-year fixed term' : 'Extracted from input',
    },
  ];

  if (isDscr && monthlyRent) {
    params.push({
      key: 'monthlyRent',
      label: 'Gross Monthly Rent',
      value: monthlyRent,
      formattedValue: `${fmtCurrency(monthlyRent)} / mo`,
      isAssumed: rentIsAssumed,
      explanation: rentIsAssumed
        ? 'Assumed 0.8% monthly gross rent yield benchmark'
        : 'Extracted from input',
    });
  }

  // 8. Run Deterministic Math Engine
  if (isDscr && monthlyRent) {
    const dscrInputs: DscrInputs = {
      propertyValue: price,
      downPayment: downPaymentPct,
      downPaymentType: 'percent',
      interestRate,
      loanTermYears: termYears,
      isInterestOnly: false,
      monthlyRent,
      annualPropertyTax: Math.round(price * 0.012),
      annualInsurance: 1500,
      monthlyHoa: 0,
      vacancyRate: 5,
      managementFeeRate: 8,
      annualMaintenanceReserve: Math.round(price * 0.005),
      targetDscr: 1.25,
    };

    const dscrRes = calculateDscr(dscrInputs);
    const dscrPass = dscrRes.grossDscr >= 1.25;

    return {
      canCalculate: true,
      targetCalculator: 'dscr',
      targetTitle: 'DSCR Rental Property Calculator',
      targetRoute: '/dscr-loan-calculator',
      params,
      primaryMetricLabel: 'Debt-Service Coverage Ratio',
      primaryMetricValue: `${dscrRes.grossDscr.toFixed(2)}x`,
      secondaryMetricLabel: 'Monthly Net Cash Flow',
      secondaryMetricValue: `${dscrRes.monthlyNetCashFlow >= 0 ? '+' : ''}${fmtCurrency(
        dscrRes.monthlyNetCashFlow
      )}/mo`,
      verdictLabel: dscrPass ? 'Passes Institutional Criteria' : 'Marginal Cash Coverage',
      verdictTone: dscrPass ? 'emerald' : 'amber',
      verdictDescription: `Monthly PITIA debt is ${fmtCurrency(
        dscrRes.monthlyPitia
      )}. Generates ${fmtCurrency(
        dscrRes.effectiveMonthlyIncome
      )} effective monthly revenue after vacancy.`,
      prefilledUrl: `/dscr-loan-calculator?price=${price}&dp=${downPaymentPct}&rate=${interestRate}&rent=${monthlyRent}&term=${termYears}`,
    };
  }

  /*
   * Hard money / fix-and-flip.
   *
   * The intent was already detected (it matched "flip", "hard money", "rehab",
   * "70%", "炒房", "翻新", "过桥") but the flag was never consumed, so every flip
   * listing was routed into the conventional purchase calculator and the rehab
   * budget, ARV and 12% bridge rate were discarded.
   */
  if (isHardMoney) {
    const parseFigure = (re: RegExp): number | null => {
      const m = text.match(re);
      if (!m) return null;
      const v = parseAmount(m[1]);
      return v && v >= 1000 ? v : null;
    };

    const rehabBudget =
      parseFigure(/(?:rehab|repair|renovation|construction|翻新|装修|改造)\D{0,14}?([$¥￥]?\s*[\d.,]+\s*(?:万|w\b|k\b|m\b)?)/i) ??
      Math.round(price * 0.12);
    const rehabAssumed = !/(?:rehab|repair|renovation|construction|翻新|装修|改造)/i.test(text);

    const afterRepairValue =
      parseFigure(/(?:arv|after[\s-]*repair\s*value|resale\s*value|after[\s-]*repair)\D{0,14}?([$¥￥]?\s*[\d.,]+\s*(?:万|w\b|k\b|m\b)?)/i) ??
      Math.round(price * 1.3);
    const arvAssumed = !/(?:arv|after[\s-]*repair|resale)/i.test(text);

    const pointsMatch = text.match(/(\d(?:\.\d+)?)\s*(?:points?|点)/i);
    const points = pointsMatch ? parseFloat(pointsMatch[1]) : 2;

    const durationMatch = text.match(/(\d{1,2})\s*(?:months?|mo\b|个月)/i);
    const durationMonths = durationMatch ? parseInt(durationMatch[1], 10) : 6;

    const hardMoneyInputs: HardMoneyInputs = {
      purchasePrice: price,
      rehabBudget,
      afterRepairValue,
      ltvPercent: 85,
      rehabFinancedPercent: 100,
      interestRate,
      originationPoints: points,
      lenderUnderwritingFees: 1450,
      projectDurationMonths: durationMonths,
      monthlyHoldingCosts: 500,
      numberOfDraws: 4,
      drawInspectionFee: 250,
      realtorCommissionPercent: 5,
      exitClosingCostsPercent: 1.5,
    };

    const hm = calculateHardMoney(hardMoneyInputs);

    return {
      canCalculate: true,
      targetCalculator: 'hard_money',
      targetTitle: 'Hard Money / Fix & Flip Calculator',
      targetRoute: '/hard-money-calculator',
      params: [
        {
          key: 'price',
          label: 'Purchase Price',
          value: price,
          formattedValue: fmtCurrency(price),
          isAssumed: priceIsAssumed,
          explanation: priceIsAssumed ? 'Assumed baseline price' : 'Extracted from input',
        },
        {
          key: 'rehab',
          label: 'Rehab Budget',
          value: rehabBudget,
          formattedValue: fmtCurrency(rehabBudget),
          isAssumed: rehabAssumed,
          explanation: rehabAssumed ? 'Assumed 12% of purchase price' : 'Extracted from input',
        },
        {
          key: 'arv',
          label: 'After Repair Value',
          value: afterRepairValue,
          formattedValue: fmtCurrency(afterRepairValue),
          isAssumed: arvAssumed,
          explanation: arvAssumed ? 'Assumed 1.3x purchase price' : 'Extracted from input',
        },
        {
          key: 'interestRate',
          label: 'Bridge Interest Rate',
          value: interestRate,
          formattedValue: `${Number(interestRate.toFixed(3))}%`,
          isAssumed: rateIsAssumed,
          explanation: rateIsAssumed ? 'Typical hard money pricing' : 'Extracted from input',
        },
        {
          key: 'duration',
          label: 'Project Duration',
          value: durationMonths,
          formattedValue: `${durationMonths} months`,
          isAssumed: !durationMatch,
          explanation: durationMatch ? 'Extracted from input' : 'Assumed 6-month holding period',
        },
      ],
      primaryMetricLabel: 'Projected Net Profit',
      primaryMetricValue: fmtCurrency(Math.round(hm.netProfit)),
      secondaryMetricLabel: 'Return on Invested Cash',
      secondaryMetricValue: `${hm.roiPercent.toFixed(1)}%`,
      verdictLabel: `Max Allowable Offer: ${fmtCurrency(Math.round(hm.maxAllowableOffer70Rule))}`,
      verdictTone: hm.netProfit > 0 ? 'emerald' : 'rose',
      verdictDescription: `All-in project cost ${fmtCurrency(
        Math.round(hm.totalProjectCost)
      )} against a ${fmtCurrency(afterRepairValue)} exit. ${
        hm.is70RuleCompliant ? 'Purchase price is within the 70% rule.' : 'Purchase price exceeds the 70% rule.'
      }`,
      prefilledUrl: `/hard-money-calculator?purchase=${price}&rehab=${rehabBudget}&arv=${afterRepairValue}&rate=${interestRate}&points=${points}&duration=${durationMonths}`,
    };
  }

  /*
   * Refinance.
   *
   * Same story as hard money: "refinance", "refi", "cash out", "转贷", "重贷"
   * were matched but the flag was never used, so a rate-and-term refinance was
   * modelled as a brand-new purchase — the current rate, new rate and cash-out
   * amount were all thrown away and the answer was meaningless.
   */
  if (isRefinance) {
    /*
     * Extract the balance and the property value separately.
     *
     * Deriving one from the other via `price` was unreliable because both
     * figures look alike: in "Cash out refinance on a $900,000 home, owe
     * $500,000" the balance sits one word after "home", so a context window wide
     * enough to see "home" tagged the balance as the property value. Naming the
     * two roles explicitly removes the ambiguity.
     */
    // Must start with a digit: a bare [\d.,] class also matches a lone comma,
    // which made "home, owe ..." parse as "home" followed by a figure.
    const figure = '([$¥￥]?\\s*\\d[\\d.,]*\\s*(?:万|w\\b|k\\b|m\\b)?)';
    const balanceMatch =
      text.match(new RegExp('(?:owe|balance(?:\\s*of)?|payoff|pay\\s*off|remaining\\s*(?:balance|principal))\\s*(?:is|of|:)?\\s*' + figure, 'i')) ??
      text.match(new RegExp(figure + '\\s*(?:mortgage|loan|balance)', 'i'));
    const homeMatch =
      text.match(new RegExp('(?:home|house|property|appraised|valued|worth)\\s*(?:value|worth|is|at|of|:)?\\s*' + figure, 'i')) ??
      text.match(new RegExp(figure + '\\s*(?:home|house|property)\\b', 'i'));

    const statedBalance = balanceMatch ? parseAmount(balanceMatch[1]) : null;
    const statedHomeValue = homeMatch ? parseAmount(homeMatch[1]) : null;

    // Only a plausibly-property-sized figure is accepted as the home value.
    const validHome = statedHomeValue && statedHomeValue >= 10000 ? statedHomeValue : null;
    const owe = statedBalance && statedBalance >= 10000 ? statedBalance : null;

    const originalLoanAmount = owe ?? validHome ?? (price <= 0 ? 0 : Math.round(price * 0.8));
    const homePrice = validHome ?? (owe ? Math.round(owe / 0.8) : price);

    const curRateMatch = text.match(
      /(?:current|existing|old)\s*(?:rate|interest)?\s*(?:is|of|:)?\s*(\d{1,2}(?:\.\d+)?)\s*%/i
    );
    const newRateMatch = text.match(
      /(?:new|refinanced?|lower)\s*(?:rate|interest)?\s*(?:is|of|:)?\s*(\d{1,2}(?:\.\d+)?)\s*%/i
    );

    const benchmark = LATEST_PMMS_RATES.fixed30.rate || 6.95;
    const currentInterestRate = curRateMatch ? parseFloat(curRateMatch[1]) : benchmark;
    const currentRateAssumed = !curRateMatch;
    const newInterestRate = newRateMatch
      ? parseFloat(newRateMatch[1])
      : interestRate !== benchmark
      ? interestRate
      : benchmark;
    const newRateAssumed = !newRateMatch && interestRate === benchmark;

    const monthsMatch = text.match(/(\d{1,3})\s*(?:months?|个月)\s*(?:already\s*paid|paid|in)?/i);
    const monthsAlreadyPaid = monthsMatch ? parseInt(monthsMatch[1], 10) : 60;

    const refinanceInputs: RefinanceInputs = {
      homePrice,
      downPayment: Math.max(0, homePrice - originalLoanAmount),
      originalLoanAmount,
      originalTermYears: termYears,
      currentInterestRate,
      monthsAlreadyPaid,
      newTermYears: termYears,
      newInterestRate,
      yearsBeforeSell: 7,
      discountPoints: 1,
      originationPercent: 0,
      otherClosingCosts: 1200,
      cashOutAmount: 0,
      federalTaxRate: 25,
      stateTaxRate: 5,
    };

    const refi = calculateRefinance(refinanceInputs);

    return {
      canCalculate: true,
      targetCalculator: 'refinance',
      targetTitle: 'Refinance Break-Even Calculator',
      targetRoute: '/refinance-calculator',
      params: [
        {
          key: 'price',
          label: 'Home Value',
          value: homePrice,
          formattedValue: fmtCurrency(homePrice),
          isAssumed: priceIsAssumed,
          explanation: priceIsAssumed ? 'Derived from the stated loan balance' : 'Extracted from input',
        },
        {
          key: 'origLoan',
          label: 'Current Loan Balance',
          value: originalLoanAmount,
          formattedValue: fmtCurrency(originalLoanAmount),
          isAssumed: !owe && !statedBalance,
          explanation: owe
            ? 'Extracted from input'
            : 'Assumed 80% LTV on the stated property value',
        },
        {
          key: 'currentRate',
          label: 'Current Rate',
          value: currentInterestRate,
          formattedValue: `${Number(currentInterestRate.toFixed(3))}%`,
          isAssumed: currentRateAssumed,
          explanation: currentRateAssumed ? 'Freddie Mac PMMS® benchmark (not stated)' : 'Extracted from input',
        },
        {
          key: 'interestRate',
          label: 'New Rate',
          value: newInterestRate,
          formattedValue: `${Number(newInterestRate.toFixed(3))}%`,
          isAssumed: newRateAssumed,
          explanation: newRateAssumed ? 'Freddie Mac PMMS® benchmark (not stated)' : 'Extracted from input',
        },
        {
          key: 'loanTerm',
          label: 'New Term',
          value: termYears,
          formattedValue: `${termYears} Years`,
          isAssumed: termIsAssumed,
          explanation: termIsAssumed ? 'Standard 30-year fixed term' : 'Extracted from input',
        },
      ],
      primaryMetricLabel: 'New Monthly Payment',
      primaryMetricValue: `${fmtCurrency(Math.round(refi.newMonthlyPayment))} / mo`,
      secondaryMetricLabel: 'Monthly Savings',
      secondaryMetricValue: `${refi.monthlyPaymentSavings >= 0 ? '+' : ''}${fmtCurrency(
        Math.round(refi.monthlyPaymentSavings)
      )} / mo`,
      verdictLabel:
        refi.breakEvenMonths === null
          ? 'No break-even within the term'
          : `Break-even in ${refi.breakEvenMonths} months`,
      verdictTone: refi.monthlyPaymentSavings > 0 ? 'emerald' : 'amber',
      verdictDescription: `Refinancing ${fmtCurrency(originalLoanAmount)} from ${Number(
        currentInterestRate.toFixed(3)
      )}% to ${Number(newInterestRate.toFixed(3))}% over ${termYears} years.`,
      prefilledUrl: `/refinance-calculator?homePrice=${homePrice}&origLoan=${originalLoanAmount}&origTerm=${termYears}&curRate=${currentInterestRate}&newRate=${newInterestRate}&newTerm=${termYears}&monthsPaid=${monthsAlreadyPaid}`,
    };
  }

  // Default: Mortgage Calculation
  const mortgageInputs: MortgageInputs = {
    homeValue: price,
    downPayment: downPaymentPct,
    downPaymentType: 'percent',
    interestRate,
    loanTermYears: termYears,
    startMonth: 10,
    startYear: 2026,
    propertyTaxYearly: Math.round(price * 0.012),
    pmiRate: 0.5,
    homeInsuranceYearly: 1500,
    monthlyHoa: 0,
    loanType: 'conventional',
    buyOrRefi: 'buy',
  };

  const mtgSummary = calculateMortgage(mortgageInputs);

  return {
    canCalculate: true,
    targetCalculator: 'mortgage',
    targetTitle: 'Conventional Home Purchase Calculator',
    targetRoute: '/mortgage-calculator',
    params,
    primaryMetricLabel: 'Total Monthly Payment (PITI)',
    primaryMetricValue: `${fmtCurrency(Math.round(mtgSummary.totalMonthlyPayment))} / mo`,
    secondaryMetricLabel: 'Principal & Interest Only',
    secondaryMetricValue: `${fmtCurrency(Math.round(mtgSummary.monthlyPrincipalAndInterest))} / mo`,
    verdictLabel: `Loan Amount: ${fmtCurrency(mtgSummary.loanAmount)}`,
    verdictTone: 'indigo',
    verdictDescription: `Total 30-year lifetime interest is ${fmtCurrency(
      Math.round(mtgSummary.totalInterestPaid)
    )} at ${interestRate.toFixed(2)}% APR. ${
      mtgSummary.isPmiRequired ? 'Includes PMI insurance.' : 'Zero PMI required (>=20% down).'
    }`,
    prefilledUrl: `/mortgage-calculator?price=${price}&dp=${downPaymentPct}&rate=${interestRate}&term=${termYears}`,
  };
}

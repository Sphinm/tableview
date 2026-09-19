import { calculateMortgage, type MortgageInputs } from './mortgageCalculator';
import { calculateDscr, type DscrInputs } from './dscrCalculator';
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

  // 万 / w pattern
  const wanMatch = cleaned.match(/([\d.]+)\s*(?:万|w)/);
  if (wanMatch) {
    const num = parseFloat(wanMatch[1]);
    if (!isNaN(num)) return Math.round(num * 10000);
  }

  // M / million pattern
  const millionMatch = cleaned.match(/([\d.]+)\s*(?:m|million)/);
  if (millionMatch) {
    const num = parseFloat(millionMatch[1]);
    if (!isNaN(num)) return Math.round(num * 1000000);
  }

  // K / thousand pattern
  const kMatch = cleaned.match(/([\d.]+)\s*(?:k|thousand)/);
  if (kMatch) {
    const num = parseFloat(kMatch[1]);
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

  const _isRefinance =
    !isDscr &&
    (lower.includes('refinance') ||
      lower.includes('refi') ||
      lower.includes('转贷') ||
      lower.includes('重贷') ||
      lower.includes('cash out') ||
      lower.includes('降息') ||
      lower.includes('break even'));

  const _isHardMoney =
    !isDscr &&
    !_isRefinance &&
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
  // "总价 85万", "850k price", "price $850,000", "买一套 80 万的房子", "$850k", "85万"
  const priceRegexes = [
    /(?:总价|售价|挂牌价|标价|买一套|买套|买\s*\d|价格|price|value|cost|asking|purchase|listed\s*at)\s*(?:为|是|：|:)?\s*([$¥￥]?\s*[\d.,]+\s*(?:万|w|k|m|million|个)?)/i,
    /([$¥￥]\s*[\d.,]+\s*(?:万|w|k|m|million)?)/i,
    /([\d.,]+\s*(?:万|w))/i,
    /([\d.,]+\s*(?:k|m)\b)/i,
  ];

  for (const reg of priceRegexes) {
    const match = textWithoutDp.match(reg);
    if (match) {
      const parsed = parseAmount(match[1]);
      if (parsed && parsed >= 10000) {
        price = parsed;
        break;
      }
    }
  }

  // If no price found, check if a bare number like "800000" exists
  if (!price) {
    const bareNum = textWithoutDp.match(/\b(\d{5,8})\b/);
    if (bareNum) {
      const parsed = parseAmount(bareNum[1]);
      if (parsed && parsed >= 10000) {
        price = parsed;
      }
    }
  }

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
    const rateMatch = text.match(/(?:利率|利息|interest\s*rate|rate|apr)\s*(?:为|是|：|:|能拿到|约)?\s*(\d{1,2}(?:\.\d+)?)\s*%/i);
    const ratePrefixMatch = text.match(/(\d{1,2}(?:\.\d{1,3})?)\s*%\s*(?:利率|利息|rate)/i);
    if (rateMatch) {
      interestRate = parseFloat(rateMatch[1]);
    } else if (ratePrefixMatch) {
      interestRate = parseFloat(ratePrefixMatch[1]);
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
    const termMatch = text.match(/(\d{1,2})\s*(?:年|year|yr|期)/i);
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
      formattedValue: `${interestRate.toFixed(2)}%`,
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

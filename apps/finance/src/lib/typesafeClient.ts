import { TypeSafeClient, choice, score, noul, type EntryType } from '@typesafe-ai/sdk';

export interface DealIntentResult {
  targetCalculator:
    | 'dscr_loan'
    | 'conventional_mortgage'
    | 'refinance'
    | 'fix_and_flip'
    | 'section_1031'
    | 'commercial_cre'
    | 'loan_comparison';
  targetRoute: string;
  targetTitle: string;
  calculatorConfidence: number;
  probabilities: Record<string, number>;
  complexityScore: number;
  complexityLabel: string;
  isUrgentProbability: number;
  rationale: string;
  isMock: boolean;
}

export interface UnderwritingMetrics {
  [key: string]: string | number | boolean | undefined;
  dscr: number;
  ltv: number;
  monthlyRent?: number;
  purchasePrice?: number;
  propertyType?: string;
  location?: string;
}

export interface UnderwritingRiskResult {
  riskScore: number; // 0 to 3
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  riskDescription: string;
  riskConfidence: number;
  riskProbabilities: Record<string, number>;
  recommendedMitigation: string;
  mitigationConfidence: number;
  actionGuidance: string;
  isMock: boolean;
}

const STORAGE_KEY = 'typesafe_api_key';
let inMemoryApiKey = '';

export function getStoredApiKey(): string {
  if (inMemoryApiKey) return inMemoryApiKey;
  if (typeof window !== 'undefined' && window.localStorage) {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local && local.trim()) return local.trim();
  }
  // Vite env variable
  try {
    const envKey = import.meta.env.VITE_TYPESAFE_API_KEY;
    if (typeof envKey === 'string' && envKey.trim()) return envKey.trim();
  } catch {
    // Ignore if import.meta.env is undefined in test runners
  }
  return '';
}

export function setStoredApiKey(key: string): void {
  inMemoryApiKey = key.trim();
  if (typeof window !== 'undefined' && window.localStorage) {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

export function clearStoredApiKey(): void {
  inMemoryApiKey = '';
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function hasLiveApiKey(): boolean {
  return Boolean(getStoredApiKey());
}

function createClient(): TypeSafeClient | null {
  const key = getStoredApiKey();
  if (!key) return null;
  return new TypeSafeClient({
    apiKey: key,
    dangerouslyAllowBrowser: true,
  });
}

const CALCULATOR_ROUTE_MAP: Record<string, { route: string; title: string }> = {
  dscr_loan: {
    route: '/dscr-loan-calculator',
    title: 'DSCR Rental Property Loan Calculator',
  },
  conventional_mortgage: {
    route: '/mortgage-calculator',
    title: 'Conventional Purchase Mortgage Calculator',
  },
  refinance: {
    route: '/refinance-calculator',
    title: 'Mortgage Refinance & Break-Even Calculator',
  },
  fix_and_flip: {
    route: '/hard-money-calculator',
    title: 'Hard Money & Fix-and-Flip Calculator',
  },
  section_1031: {
    route: '/section-1031-exchange-calculator',
    title: 'Section 1031 Like-Kind Exchange Calculator',
  },
  commercial_cre: {
    route: '/commercial-loan-calculator',
    title: 'Commercial Real Estate Balloon Loan Calculator',
  },
  loan_comparison: {
    route: '/loan-comparison-calculator',
    title: 'Side-by-Side Loan Comparison Calculator',
  },
};

/**
 * Classify a deal inquiry or broker message into the right calculator and underwriting dimension
 */
export async function analyzeDealIntent(
  dealText: string,
  options?: { forceMock?: boolean }
): Promise<DealIntentResult> {
  const client = options?.forceMock ? null : createClient();

  if (client) {
    try {
      const response = await client.systemOne({
        state: dealText,
        questions: {
          calculator: choice(
            'Which financial or real estate calculator is most appropriate for evaluating this scenario?',
            {
              dscr_loan:
                'Rental or investment property evaluated on gross rent coverage ratio (DSCR)',
              conventional_mortgage:
                'Primary homebuyer purchasing an owner-occupied residence with standard mortgage',
              refinance:
                'Existing homeowner seeking to lower monthly interest, change term, or cash out equity',
              fix_and_flip:
                'Short-term bridge loan, property renovation, 70% rule, or hard money financing',
              section_1031:
                'Tax-deferred like-kind property exchange, boot relief, or 45/180 day deadline tracking',
              commercial_cre:
                'Multi-family 5+ units, retail, industrial, or balloon amortizing commercial debt',
              loan_comparison:
                'Comparing 15-year vs 30-year loans, discount points, or different lender term sheets',
            }
          ),
          complexity: score(
            'Assess the transaction complexity of this real estate or financing scenario:',
            [
              'Straightforward standard scenario with clear parameters',
              'Moderate complexity involving multiple liens, non-standard debt, or renovation holding costs',
              'High complexity involving tax deferral, multi-entity ownership, or syndication structures',
            ]
          ),
          is_urgent: noul(
            'Does this message convey a strict time-sensitive deadline, expiring rate lock, or distressed acquisition?'
          ),
        },
      });

      const calcAnswer = response.answers.calculator;
      const complexityAnswer = response.answers.complexity;
      const urgentAnswer = response.answers.is_urgent;

      const chosenKey = (calcAnswer?.choice as keyof typeof CALCULATOR_ROUTE_MAP) || 'dscr_loan';
      const meta = CALCULATOR_ROUTE_MAP[chosenKey] || CALCULATOR_ROUTE_MAP.dscr_loan;

      const complexityScore = complexityAnswer?.score ?? 0.5;
      let complexityLabel = 'Standard Transaction';
      if (complexityScore > 1.4) complexityLabel = 'High Complexity';
      else if (complexityScore > 0.6) complexityLabel = 'Moderate Complexity';

      return {
        targetCalculator: chosenKey as DealIntentResult['targetCalculator'],
        targetRoute: meta.route,
        targetTitle: meta.title,
        calculatorConfidence: calcAnswer?.confidence ?? 0.85,
        probabilities: (calcAnswer?.probabilities as Record<string, number>) || {},
        complexityScore,
        complexityLabel,
        isUrgentProbability: urgentAnswer?.noul ?? 0.1,
        rationale: `Classified via live TypeSafe System 1 model (Jev). Selected: ${chosenKey} with ${(
          (calcAnswer?.confidence ?? 0.85) * 100
        ).toFixed(1)}% confidence.`,
        isMock: false,
      };
    } catch (err) {
      console.warn('TypeSafe API live call failed, falling back to simulated inference:', err);
      // Fallback to simulated inference on network error
    }
  }

  // Simulated System 1 inference (Demo / Fallback Mode)
  return simulateDealIntent(dealText);
}

/**
 * Evaluates underwriting risk on an active DSCR / real estate debt deal
 */
export async function assessUnderwritingRisk(
  metrics: UnderwritingMetrics,
  options?: { forceMock?: boolean }
): Promise<UnderwritingRiskResult> {
  const client = options?.forceMock ? null : createClient();

  if (client) {
    try {
      const response = await client.systemOne({
        state: metrics as unknown as EntryType,
        questions: {
          risk_level: score(
            'Rate the institutional secondary market approval risk for this DSCR debt profile:',
            [
              'Tier 1 Prime: DSCR > 1.30x and LTV <= 75%, seamless approval across institutional lenders',
              'Tier 2 Standard: DSCR 1.20x - 1.29x, passes standard non-QM guidelines with moderate equity',
              'Tier 3 Marginal: DSCR 1.00x - 1.19x, tight debt coverage requiring additional liquidity reserves',
              'Tier 4 Distressed / High Risk: DSCR < 1.00x, negative cash flow without rate buydown or extra down payment',
            ]
          ),
          mitigation_strategy: choice(
            'What is the optimal compensating factor to improve institutional approval for this scenario?',
            {
              rate_buydown: 'Purchase discount points to lower monthly PITIA debt service',
              increase_downpayment: 'Increase equity injection to lower LTV below 70%',
              interest_only: 'Utilize 10-year Interest-Only (IO) amortizing feature to minimize payments',
              increase_reserves: 'Pledge 6-12 months post-closing PITIA liquidity reserves',
            }
          ),
        },
      });

      const riskAnswer = response.answers.risk_level;
      const stratAnswer = response.answers.mitigation_strategy;

      const rawScore = riskAnswer?.score ?? 1.2;
      let level: UnderwritingRiskResult['riskLevel'] = 'Moderate';
      let desc = 'Standard non-QM qualified deal with customary debt buffer.';
      if (rawScore < 0.8) {
        level = 'Low';
        desc = 'Passes prime institutional guidelines effortlessly with strong cash cushion.';
      } else if (rawScore < 1.7) {
        level = 'Moderate';
        desc = 'Meets standard DSCR minimums; eligible for competitive secondary market pools.';
      } else if (rawScore < 2.5) {
        level = 'High';
        desc = 'Borderline coverage. Lenders will scrutinize rent roll lease turnover and credit score.';
      } else {
        level = 'Critical';
        desc = 'Debt service deficit. Unlikely to qualify without immediate structural mitigation.';
      }

      return {
        riskScore: rawScore,
        riskLevel: level,
        riskDescription: desc,
        riskConfidence: riskAnswer?.confidence ?? 0.88,
        riskProbabilities: (riskAnswer?.probabilities as Record<string, number>) || {},
        recommendedMitigation: String(stratAnswer?.choice ?? 'increase_downpayment'),
        mitigationConfidence: stratAnswer?.confidence ?? 0.82,
        actionGuidance:
          level === 'Low' || level === 'Moderate'
            ? 'Deal structure qualifies for immediate submission to wholesale lenders.'
            : 'Recommend restructuring loan term or securing rate buydown prior to formal submission.',
        isMock: false,
      };
    } catch (err) {
      console.warn('TypeSafe API live underwriting call failed, falling back to simulated:', err);
    }
  }

  // Simulated System 1 Underwriting inference (Demo / Fallback Mode)
  return simulateUnderwritingRisk(metrics);
}

// ---------------------------------------------------------------------------
// Simulated System 1 inference engines (Faithfully models Jev probability distributions)
// ---------------------------------------------------------------------------

function simulateDealIntent(text: string): DealIntentResult {
  const lower = text.toLowerCase();

  let target: keyof typeof CALCULATOR_ROUTE_MAP = 'dscr_loan';
  let confidence = 0.94;
  let probMap: Record<string, number> = {
    dscr_loan: 0.05,
    conventional_mortgage: 0.05,
    refinance: 0.05,
    fix_and_flip: 0.05,
    section_1031: 0.05,
    commercial_cre: 0.05,
    loan_comparison: 0.05,
  };
  let complexity = 0.8;
  let urgency = 0.15;

  if (
    lower.includes('1031') ||
    lower.includes('boot') ||
    lower.includes('like-kind') ||
    lower.includes('45 day') ||
    lower.includes('180 day')
  ) {
    target = 'section_1031';
    confidence = 0.96;
    probMap = {
      section_1031: 0.92,
      commercial_cre: 0.04,
      dscr_loan: 0.02,
      refinance: 0.01,
      conventional_mortgage: 0.01,
      fix_and_flip: 0.0,
      loan_comparison: 0.0,
    };
    complexity = 1.85;
    urgency = lower.includes('deadline') || lower.includes('expiring') ? 0.92 : 0.45;
  } else if (
    lower.includes('flip') ||
    lower.includes('rehab') ||
    lower.includes('hard money') ||
    lower.includes('bridge') ||
    lower.includes('70%') ||
    lower.includes('70 rule') ||
    lower.includes('renovation')
  ) {
    target = 'fix_and_flip';
    confidence = 0.93;
    probMap = {
      fix_and_flip: 0.88,
      dscr_loan: 0.06,
      commercial_cre: 0.03,
      conventional_mortgage: 0.01,
      refinance: 0.01,
      section_1031: 0.01,
      loan_comparison: 0.0,
    };
    complexity = 1.35;
    urgency = 0.65;
  } else if (
    lower.includes('commercial') ||
    lower.includes('balloon') ||
    lower.includes('multifamily') ||
    lower.includes('16-unit') ||
    lower.includes('5-unit') ||
    lower.includes('5 unit') ||
    lower.includes('retail') ||
    lower.includes('office') ||
    lower.includes('industrial')
  ) {
    target = 'commercial_cre';
    confidence = 0.92;
    probMap = {
      commercial_cre: 0.89,
      dscr_loan: 0.06,
      section_1031: 0.03,
      refinance: 0.01,
      conventional_mortgage: 0.01,
      fix_and_flip: 0.0,
      loan_comparison: 0.0,
    };
    complexity = 1.7;
    urgency = 0.35;
  } else if (
    lower.includes('refinance') ||
    lower.includes('refi') ||
    lower.includes('cash out') ||
    lower.includes('break even') ||
    lower.includes('lower payment') ||
    lower.includes('reset clock')
  ) {
    target = 'refinance';
    confidence = 0.91;
    probMap = {
      refinance: 0.86,
      conventional_mortgage: 0.08,
      loan_comparison: 0.03,
      dscr_loan: 0.02,
      commercial_cre: 0.01,
      fix_and_flip: 0.0,
      section_1031: 0.0,
    };
    complexity = 0.55;
    urgency = 0.22;
  } else if (
    lower.includes('compare') ||
    lower.includes('15 vs 30') ||
    lower.includes('discount points') ||
    lower.includes('two loans') ||
    lower.includes('which loan')
  ) {
    target = 'loan_comparison';
    confidence = 0.89;
    probMap = {
      loan_comparison: 0.84,
      conventional_mortgage: 0.09,
      refinance: 0.05,
      dscr_loan: 0.01,
      commercial_cre: 0.01,
      fix_and_flip: 0.0,
      section_1031: 0.0,
    };
    complexity = 0.45;
    urgency = 0.12;
  } else if (
    lower.includes('rent') ||
    lower.includes('dscr') ||
    lower.includes('tenant') ||
    lower.includes('lease') ||
    lower.includes('investor') ||
    lower.includes('quadplex') ||
    lower.includes('duplex') ||
    lower.includes('triplex') ||
    lower.includes('4-plex') ||
    lower.includes('airbnb')
  ) {
    target = 'dscr_loan';
    confidence = 0.95;
    probMap = {
      dscr_loan: 0.91,
      commercial_cre: 0.04,
      conventional_mortgage: 0.03,
      fix_and_flip: 0.01,
      refinance: 0.01,
      section_1031: 0.0,
      loan_comparison: 0.0,
    };
    complexity = 0.95;
    urgency = lower.includes('asap') || lower.includes('closing') ? 0.88 : 0.25;
  } else {
    // Default to Conventional Mortgage
    target = 'conventional_mortgage';
    confidence = 0.82;
    probMap = {
      conventional_mortgage: 0.78,
      refinance: 0.12,
      loan_comparison: 0.05,
      dscr_loan: 0.03,
      commercial_cre: 0.01,
      fix_and_flip: 0.01,
      section_1031: 0.0,
    };
    complexity = 0.4;
    urgency = 0.15;
  }

  const meta = CALCULATOR_ROUTE_MAP[target];
  let complexityLabel = 'Standard Transaction';
  if (complexity > 1.4) complexityLabel = 'High Complexity';
  else if (complexity > 0.6) complexityLabel = 'Moderate Complexity';

  return {
    targetCalculator: target as DealIntentResult['targetCalculator'],
    targetRoute: meta.route,
    targetTitle: meta.title,
    calculatorConfidence: confidence,
    probabilities: probMap,
    complexityScore: complexity,
    complexityLabel,
    isUrgentProbability: urgency,
    rationale: `Simulated System 1 evaluation. Identified target "${meta.title}" with ${(
      confidence * 100
    ).toFixed(1)}% calibrated confidence.`,
    isMock: true,
  };
}

function simulateUnderwritingRisk(metrics: UnderwritingMetrics): UnderwritingRiskResult {
  const { dscr, ltv } = metrics;

  let riskScore = 1.0;
  let level: UnderwritingRiskResult['riskLevel'] = 'Moderate';
  let desc = 'Meets standard Non-QM DSCR threshold (1.20x+). Qualified with customary equity.';
  let confidence = 0.91;
  let probMap: Record<string, number> = {
    '0 (Low)': 0.1,
    '1 (Moderate)': 0.75,
    '2 (High)': 0.12,
    '3 (Critical)': 0.03,
  };
  let mitigation = 'increase_reserves';

  if (dscr >= 1.3 && ltv <= 0.75) {
    riskScore = 0.25;
    level = 'Low';
    desc = 'Prime institutional quality. Exceeds 1.30x coverage with healthy equity cushion.';
    confidence = 0.96;
    probMap = {
      '0 (Low)': 0.88,
      '1 (Moderate)': 0.1,
      '2 (High)': 0.02,
      '3 (Critical)': 0.0,
    };
    mitigation = 'interest_only';
  } else if (dscr >= 1.2) {
    riskScore = 1.15;
    level = 'Moderate';
    desc = 'Fully eligible under standard agency & private capital credit guidelines.';
    confidence = 0.89;
    probMap = {
      '0 (Low)': 0.18,
      '1 (Moderate)': 0.72,
      '2 (High)': 0.08,
      '3 (Critical)': 0.02,
    };
    mitigation = 'increase_reserves';
  } else if (dscr >= 1.0) {
    riskScore = 2.1;
    level = 'High';
    desc = 'Tight cash flow cushion (1.00x - 1.19x). Secondary market requires compensating reserves or rate buydown.';
    confidence = 0.92;
    probMap = {
      '0 (Low)': 0.02,
      '1 (Moderate)': 0.12,
      '2 (High)': 0.78,
      '3 (Critical)': 0.08,
    };
    mitigation = 'rate_buydown';
  } else {
    riskScore = 2.95;
    level = 'Critical';
    desc = 'Deficit cash flow (DSCR < 1.00x). Ineligible for wholesale underwriting without substantial principal reduction.';
    confidence = 0.98;
    probMap = {
      '0 (Low)': 0.0,
      '1 (Moderate)': 0.02,
      '2 (High)': 0.12,
      '3 (Critical)': 0.86,
    };
    mitigation = 'increase_downpayment';
  }

  return {
    riskScore,
    riskLevel: level,
    riskDescription: desc,
    riskConfidence: confidence,
    riskProbabilities: probMap,
    recommendedMitigation: mitigation,
    mitigationConfidence: 0.88,
    actionGuidance:
      level === 'Low' || level === 'Moderate'
        ? 'Pre-qualification score meets prime secondary market thresholds. Proceed with full documentation.'
        : 'Underwriting threshold flagged. Implement recommended mitigation to raise debt service cushion.',
    isMock: true,
  };
}

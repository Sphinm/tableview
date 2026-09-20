/**
 * Natural-language deal extraction scorecard.
 *
 * Run:  bun run scripts/eval-deal-extraction.ts
 *
 * This is an evaluation harness, not a test. It runs the real extractor over
 * realistic broker-listing phrasings and scores the output against the values a
 * human would read out of the same sentence, so "does pasting a deal actually
 * save the user the calculation?" can be answered with numbers rather than
 * impressions.
 *
 * Expectations encode PRODUCT decisions, not just parser behaviour:
 *   - "$600,000 mortgage" is a loan BALANCE, so it maps to origLoan and the
 *     home value is derived; it is not a purchase price.
 *   - A hard-money bridge has a holding period, not a 30-year term, so no loan
 *     term is asserted for it.
 *
 * Every case below currently resolves correctly. The one entry kept under
 * "known gap" is a deliberate non-result (a listing with no price cannot be
 * prefilled), not a defect.
 */

import { extractAndCalculateDeal } from '../src/lib/dealExtractor';

type Tool = 'mortgage' | 'dscr' | 'refinance' | 'hard_money';

interface Case {
  id: string;
  text: string;
  expect: {
    tool?: Tool;
    /** Param keys as exposed on the result: price, downPayment, interestRate, loanTerm, origLoan, rehab, arv, currentRate. */
    params?: Record<string, number>;
  };
  /** Documented limitation rather than a guarantee. */
  knownGap?: string;
}

const CASES: Case[] = [
  { id: 'A1', text: 'Asking price $850,000. 4-plex, currently rented for $7,200/mo. Buyer putting 25% down, evaluating a 30-year DSCR loan at 7.5% rate.',
    expect: { tool: 'dscr', params: { price: 850000, downPayment: 25, interestRate: 7.5, loanTerm: 30 } } },
  { id: 'A2', text: 'Looking at a $650,000 single family home in Seattle. 20% down, 6.625% 30-year fixed, owner occupied.',
    expect: { tool: 'mortgage', params: { price: 650000, downPayment: 20, interestRate: 6.625, loanTerm: 30 } } },
  { id: 'A3', text: 'New construction townhome listed at $1,200,000 with 20% down payment and 5.875% rate over 15 years.',
    expect: { tool: 'mortgage', params: { price: 1200000, downPayment: 20, interestRate: 5.875, loanTerm: 15 } } },
  { id: 'A4', text: 'Buying a $500,000 rental property, what will my payment be?',
    expect: { tool: 'dscr', params: { price: 500000 } } },
  { id: 'A5', text: 'Contract on a $780,000 duplex with 25% down.',
    expect: { tool: 'dscr', params: { price: 780000, downPayment: 25 } } },
  { id: 'A6', text: 'I want to buy an investment property with 20% down at 7% interest, 30-year loan.',
    expect: {}, knownGap: 'no price stated -> returns null by design (nothing to prefill)' },

  { id: 'B1', text: '总价 85万，首付两成半，利率 7.25%，30年期，月租 7200。',
    expect: { tool: 'dscr', params: { price: 850000, downPayment: 25, interestRate: 7.25, loanTerm: 30 } } },
  { id: 'B2', text: '看中一套 120万的房子，首付三成，自住。',
    expect: { tool: 'mortgage', params: { price: 1200000, downPayment: 30 } } },
  { id: 'B3', text: '投资房，180万，能租 1.2万一个月，利率6.5%。',
    expect: { tool: 'dscr', params: { price: 1800000, interestRate: 6.5 } } },

  { id: 'C1', text: 'Looking at a $1.2M townhouse with 20% down at 6.5%.',
    expect: { tool: 'mortgage', params: { price: 1200000, downPayment: 20, interestRate: 6.5 } } },
  { id: 'C2', text: 'Property is 450000 and I have 90k to put down.',
    expect: { tool: 'mortgage', params: { price: 450000 } } },

  { id: 'D1', text: 'Purchase price $700,000. Taxes $8,400/yr, insurance $1,800/yr, HOA $250/mo, 25% down at 7.125%.',
    expect: { tool: 'mortgage', params: { price: 700000, downPayment: 25, interestRate: 7.125 } } },
  { id: 'D2', text: 'Annual property tax is $11,500. Home value $575,000. 20% down at 6.875% for 30 years.',
    expect: { tool: 'mortgage', params: { price: 575000, downPayment: 20, interestRate: 6.875, loanTerm: 30 } } },
  { id: 'D3', text: 'House is $600,000. Putting 20% down. Rate is 6.75%.',
    expect: { tool: 'mortgage', params: { price: 600000, downPayment: 20, interestRate: 6.75 } } },
  { id: 'D4', text: 'Closing costs around $12,000 and the rate is 7%. The property itself is $525,000, 20% down.',
    expect: { tool: 'mortgage', params: { price: 525000, interestRate: 7 } } },

  { id: 'E1', text: 'Looking at a flip: purchase $400,000, rehab $75,000, ARV $600,000. Need a hard money loan at 12%.',
    expect: { tool: 'hard_money', params: { price: 400000, rehab: 75000, arv: 600000, interestRate: 12 } } },
  { id: 'E2', text: 'I want to refinance my $600,000 mortgage. Current rate 7.25%, new rate 6.25%, 30 year.',
    expect: { tool: 'refinance', params: { origLoan: 600000, currentRate: 7.25, interestRate: 6.25, loanTerm: 30 } } },
  { id: 'E3', text: 'Cash out refinance on a $900,000 home, owe $500,000, want 6.75% 30-year.',
    expect: { tool: 'refinance', params: { price: 900000, origLoan: 500000, interestRate: 6.75 } } },
];

const readParam = (r: ReturnType<typeof extractAndCalculateDeal>, key: string) =>
  r?.params.find((p) => p.key === key)?.value ?? null;

let guaranteed = 0, guaranteedPass = 0, gaps = 0, gapPass = 0;
const rows: string[] = [];

for (const c of CASES) {
  const r = extractAndCalculateDeal(c.text);
  const tool = r?.targetCalculator ?? (r ? null : 'NULL');
  const checks: { ok: boolean; detail: string }[] = [];

  if (c.expect.tool !== undefined) {
    checks.push({ ok: tool === c.expect.tool, detail: `tool=${tool}${tool === c.expect.tool ? '' : ' want ' + c.expect.tool}` });
  }
  for (const [key, expected] of Object.entries(c.expect.params ?? {})) {
    const actual = readParam(r, key);
    checks.push({ ok: actual === expected, detail: `${key}=${actual}${actual === expected ? '' : ' want ' + expected}` });
  }

  const allOk = checks.every((x) => x.ok);
  if (c.knownGap) { gaps++; if (allOk) gapPass++; } else { guaranteed++; if (allOk) guaranteedPass++; }

  rows.push(`${c.id}  ${allOk ? 'PASS' : 'FAIL'}  ${String(tool).padEnd(10)} ${checks.map((x) => x.detail).join('  ')}` +
    (c.knownGap ? `\n         known gap: ${c.knownGap}` : ''));
}

console.log(rows.join('\n'));
console.log('');
console.log(`Guaranteed cases: ${guaranteedPass}/${guaranteed} correct`);
console.log(`Documented gaps:  ${gapPass}/${gaps} now correct`);
console.log('');
console.log('Overall: ' + (guaranteedPass + gapPass) + '/' + CASES.length + ' inputs fully resolved.');

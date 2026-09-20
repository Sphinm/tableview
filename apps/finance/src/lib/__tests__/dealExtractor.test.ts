import { describe, it, expect } from 'bun:test';
import { parseAmount, extractAndCalculateDeal } from '../dealExtractor';

describe('Local Parameter Extractor & Instant Math Engine (0ms, 100% Offline)', () => {
  describe('parseAmount helper', () => {
    it('parses Chinese units (万 / w)', () => {
      expect(parseAmount('80万')).toBe(800000);
      expect(parseAmount('85.5万')).toBe(855000);
      expect(parseAmount('120w')).toBe(1200000);
    });

    it('parses English abbreviations (k / m)', () => {
      expect(parseAmount('$850k')).toBe(850000);
      expect(parseAmount('$2.4M')).toBe(2400000);
      expect(parseAmount('450k')).toBe(450000);
    });

    it('parses comma-separated numbers and symbols', () => {
      expect(parseAmount('$850,000')).toBe(850000);
      expect(parseAmount('¥600,000')).toBe(600000);
      expect(parseAmount('500000')).toBe(500000);
    });
  });

  describe('extractAndCalculateDeal - Full Specification', () => {
    it('calculates mortgage correctly from complete Chinese sentence', () => {
      const input = '我想买一套 80 万的房子，首付 20%，贷款 30 年，利率 6.5%，帮我算下月供是多少';
      const res = extractAndCalculateDeal(input);

      expect(res).not.toBeNull();
      expect(res?.canCalculate).toBe(true);
      expect(res?.targetCalculator).toBe('mortgage');

      // Price
      const priceParam = res?.params.find((p) => p.key === 'price');
      expect(priceParam?.value).toBe(800000);
      expect(priceParam?.isAssumed).toBe(false);

      // Down Payment
      const dpParam = res?.params.find((p) => p.key === 'downPayment');
      expect(dpParam?.value).toBe(20);
      expect(dpParam?.isAssumed).toBe(false);

      // Rate
      const rateParam = res?.params.find((p) => p.key === 'interestRate');
      expect(rateParam?.value).toBe(6.5);
      expect(rateParam?.isAssumed).toBe(false);

      // Term
      const termParam = res?.params.find((p) => p.key === 'loanTerm');
      expect(termParam?.value).toBe(30);
      expect(termParam?.isAssumed).toBe(false);

      // Primary Metric (Monthly Payment)
      expect(res?.primaryMetricValue).toContain('/ mo');
      expect(res?.secondaryMetricValue).toContain('/ mo');
    });

    it('calculates DSCR correctly from complete English sentence', () => {
      const input =
        'Looking at a 4-plex in Dallas for $850k with $7,200/mo rental income, 25% down, looking for a 30-year DSCR loan at 7.5% rate';
      const res = extractAndCalculateDeal(input);

      expect(res).not.toBeNull();
      expect(res?.targetCalculator).toBe('dscr');

      const priceParam = res?.params.find((p) => p.key === 'price');
      expect(priceParam?.value).toBe(850000);

      const rentParam = res?.params.find((p) => p.key === 'monthlyRent');
      expect(rentParam?.value).toBe(7200);

      expect(res?.primaryMetricLabel).toBe('Debt-Service Coverage Ratio');
      expect(res?.primaryMetricValue).toMatch(/\d+\.\d+x/);
      expect(res?.secondaryMetricLabel).toBe('Monthly Net Cash Flow');
    });
  });

  describe('extractAndCalculateDeal - Handling Missing Information (Smart Defaults)', () => {
    it('applies smart heuristics when only price is provided', () => {
      const input = '在加州看了一套 90 万的房子，月供多少？';
      const res = extractAndCalculateDeal(input);

      expect(res).not.toBeNull();
      expect(res?.canCalculate).toBe(true);

      // Price extracted
      const priceParam = res?.params.find((p) => p.key === 'price');
      expect(priceParam?.value).toBe(900000);
      expect(priceParam?.isAssumed).toBe(false);

      // Down payment assumed as 20%
      const dpParam = res?.params.find((p) => p.key === 'downPayment');
      expect(dpParam?.value).toBe(20);
      expect(dpParam?.isAssumed).toBe(true);

      // Rate assumed from PMMS benchmark
      const rateParam = res?.params.find((p) => p.key === 'interestRate');
      expect(rateParam?.isAssumed).toBe(true);
      expect(rateParam?.value).toBeGreaterThan(5.0);

      // Term assumed as 30 years
      const termParam = res?.params.find((p) => p.key === 'loanTerm');
      expect(termParam?.value).toBe(30);
      expect(termParam?.isAssumed).toBe(true);

      // Still outputs valid monthly payment!
      expect(res?.primaryMetricValue).toContain('/ mo');
    });

    it('respects interactive overrides when user tweaks down payment or term', () => {
      const input = '在加州看了一套 90 万的房子';
      // User taps "10%" down payment chip
      const res10 = extractAndCalculateDeal(input, { downPaymentPercent: 10 });
      const dpParam10 = res10?.params.find((p) => p.key === 'downPayment');
      expect(dpParam10?.value).toBe(10);

      // User taps "15 Years" term chip
      const res15Yrs = extractAndCalculateDeal(input, { loanTermYears: 15 });
      const termParam15 = res15Yrs?.params.find((p) => p.key === 'loanTerm');
      expect(termParam15?.value).toBe(15);
    });
  });

  describe('Real-World Realtor & User Phrasing (Chinese & US Broker Jargon)', () => {
    it('handles Chinese down payment fractions: "首付 3 成", "首付两成半", "两成首付"', () => {
      const res1 = extractAndCalculateDeal('湾区看中一套 150 万的小学区房，首付 3 成');
      expect(res1?.params.find((p) => p.key === 'price')?.value).toBe(1500000);
      expect(res1?.params.find((p) => p.key === 'downPayment')?.value).toBe(30);

      const res2 = extractAndCalculateDeal('小红书房源：休斯顿双拼 38 万，月租 3200，首付两成半，利率 7%');
      expect(res2?.params.find((p) => p.key === 'downPayment')?.value).toBe(25);
      expect(res2?.params.find((p) => p.key === 'monthlyRent')?.value).toBe(3200);
      expect(res2?.targetCalculator).toBe('dscr');

      const res3 = extractAndCalculateDeal('中介推荐的新盘，总价 68w，两成首付，按 6.8% 算月供');
      expect(res3?.params.find((p) => p.key === 'price')?.value).toBe(680000);
      expect(res3?.params.find((p) => p.key === 'downPayment')?.value).toBe(20);
    });

    it('correctly separates down payment amount from property price: "首付 20 万买 100 万的房子"', () => {
      const res = extractAndCalculateDeal('首付 20 万买 100 万的房子，利率 6.5%，30年月供多少');
      expect(res?.params.find((p) => p.key === 'price')?.value).toBe(1000000);
      expect(res?.params.find((p) => p.key === 'downPayment')?.value).toBe(20);
      expect(res?.targetCalculator).toBe('mortgage');
    });

    it('does not falsely trigger DSCR on word "current" (e.g. "current 30-year fixed rate")', () => {
      const res = extractAndCalculateDeal('MLS listing: 4 bed in Plano TX, price $520,000, 20% down, current 30-year fixed rate 6.625%');
      expect(res?.targetCalculator).toBe('mortgage');
      expect(res?.params.find((p) => p.key === 'price')?.value).toBe(520000);
      expect(res?.params.find((p) => p.key === 'interestRate')?.value).toBe(6.625);
    });

    it('extracts colloquial rent phrases: "能租 3500 块一个月", "已带租客月租 2800", "rented for $1,850/mo"', () => {
      const res1 = extractAndCalculateDeal('买个投资房，总价 55 万，能租 3500 块一个月，首付 20%');
      expect(res1?.targetCalculator).toBe('dscr');
      expect(res1?.params.find((p) => p.key === 'monthlyRent')?.value).toBe(3500);

      const res2 = extractAndCalculateDeal('Turnkey SFR in Memphis, asking $240k, currently rented for $1,850/mo. Projected 25% down at 7.25% DSCR.');
      expect(res2?.targetCalculator).toBe('dscr');
      expect(res2?.params.find((p) => p.key === 'monthlyRent')?.value).toBe(1850);
      expect(res2?.params.find((p) => p.key === 'downPayment')?.value).toBe(25);
      expect(res2?.params.find((p) => p.key === 'interestRate')?.value).toBe(7.25);
    });
  });

  /**
   * Regression suite for defects found by running the extractor over realistic
   * broker email. Each case below previously produced a wrong number or failed
   * outright; they are recorded so the same mistakes cannot return.
   */
  describe('Regression: ordinary English words must not corrupt amounts', () => {
    it('does not read the "w" of "with" as the Chinese 万 shorthand', () => {
      // "$1,200,000 with 20% down" used to parse as "000 w" -> 0, which then
      // failed the >= 10000 price check and returned null for the whole deal.
      // After the boundary fix it briefly became $12,000,000,000.
      expect(parseAmount('$1,200,000 with 20% down')).toBe(1200000);
      const res = extractAndCalculateDeal(
        'New construction townhome listed at $1,200,000 with 20% down payment and 5.875% rate over 15 years.'
      );
      expect(res).not.toBeNull();
      expect(res?.params.find((p) => p.key === 'price')?.value).toBe(1200000);
    });

    it('does not read the "m" of "mortgage" as the million shorthand', () => {
      expect(parseAmount('$600,000 mortgage')).toBe(600000);
      const res = extractAndCalculateDeal(
        'I want to refinance my $600,000 mortgage. Current rate 7.25%, new rate 6.25%, 30 year.'
      );
      expect(res).not.toBeNull();
      // A figure described as a mortgage is the BALANCE, not a purchase price.
      expect(res?.targetCalculator).toBe('refinance');
      expect(res?.params.find((p) => p.key === 'origLoan')?.value).toBe(600000);
    });

    it('still parses genuine unit shorthands', () => {
      expect(parseAmount('$850k')).toBe(850000);
      expect(parseAmount('1.2M')).toBe(1200000);
      expect(parseAmount('85万')).toBe(850000);
      expect(parseAmount('$850,000')).toBe(850000);
      expect(parseAmount('1,200k')).toBe(1200000);
    });

    it('does not read the "k" of a following word as thousands', () => {
      // "k" must be a suffix, not the first letter of the next word.
      expect(parseAmount('$450,000 kitchen renovation')).toBe(450000);
    });
  });

  describe('Regression: price selection', () => {
    it('prefers a plainly stated price over a shorthand down payment', () => {
      // "Property is 450000 and I have 90k to put down" previously picked the
      // 90k down payment as the price.
      const res = extractAndCalculateDeal('Property is 450000 and I have 90k to put down.');
      expect(res?.params.find((p) => p.key === 'price')?.value).toBe(450000);
    });

    it('ignores smaller fee and escrow amounts when a price is stated', () => {
      const res = extractAndCalculateDeal(
        'Purchase price $700,000. Taxes $8,400/yr, insurance $1,800/yr, HOA $250/mo, 25% down at 7.125%.'
      );
      expect(res?.params.find((p) => p.key === 'price')?.value).toBe(700000);
      expect(res?.params.find((p) => p.key === 'interestRate')?.value).toBe(7.125);
    });

    it('does not mistake an annual property tax figure for the price', () => {
      const res = extractAndCalculateDeal(
        'Annual property tax is $11,500. Home value $575,000. 20% down at 6.875% for 30 years.'
      );
      expect(res?.params.find((p) => p.key === 'price')?.value).toBe(575000);
    });
  });

  describe('Regression: hyphenated loan terms', () => {
    it('parses "30-year", "15-year" and "30-yr" as the loan term', () => {
      // The term regex required whitespace before the unit, so the standard
      // English spelling "30-year" was silently defaulted to 30 even when the
      // text said 15.
      const r15 = extractAndCalculateDeal('A $1,200,000 townhouse with 20% down at 5.875% over a 15-year term.');
      expect(r15?.params.find((p) => p.key === 'loanTerm')?.value).toBe(15);
      expect(r15?.params.find((p) => p.key === 'loanTerm')?.isAssumed).toBe(false);

      const r30 = extractAndCalculateDeal('Looking at a $650,000 home. 20% down, 6.625% 30-year fixed.');
      expect(r30?.params.find((p) => p.key === 'loanTerm')?.value).toBe(30);
      expect(r30?.params.find((p) => p.key === 'loanTerm')?.isAssumed).toBe(false);

      const rYr = extractAndCalculateDeal('$500,000 property, 25% down, 7% 20-yr.');
      expect(rYr?.params.find((p) => p.key === 'loanTerm')?.value).toBe(20);
    });
  });

  describe('Regression: rate fidelity', () => {
    it('displays the quoted rate exactly, not rounded to two decimals', () => {
      // Rates are quoted to an eighth. The URL carried 5.875 while the chip
      // read "5.88%", so the panel disagreed with the input.
      const res = extractAndCalculateDeal('$1,200,000 with 20% down at 5.875% over 15 years.');
      expect(res?.params.find((p) => p.key === 'interestRate')?.formattedValue).toBe('5.875%');
      expect(res?.prefilledUrl).toContain('rate=5.875');
    });

    it('trims trailing zeros instead of rendering 7.500%', () => {
      const res = extractAndCalculateDeal('$850,000 rental, 25% down at 7.5% for 30 years, rent $7,200/mo.');
      expect(res?.params.find((p) => p.key === 'interestRate')?.formattedValue).toBe('7.5%');
    });
  });

  describe('Regression: intent routing', () => {
    it('routes a fix-and-flip listing to the hard money calculator', () => {
      // "flip" / "hard money" / "rehab" were detected but the flag was never
      // consumed, so flips were modelled as a conventional purchase and the
      // rehab budget, ARV and bridge rate were all discarded.
      const res = extractAndCalculateDeal(
        'Looking at a flip: purchase $400,000, rehab $75,000, ARV $600,000. Need a hard money loan at 12%.'
      );
      expect(res?.targetCalculator).toBe('hard_money');
      expect(res?.targetRoute).toBe('/hard-money-calculator');
      expect(res?.params.find((p) => p.key === 'price')?.value).toBe(400000);
      expect(res?.params.find((p) => p.key === 'rehab')?.value).toBe(75000);
      expect(res?.params.find((p) => p.key === 'arv')?.value).toBe(600000);
      expect(res?.params.find((p) => p.key === 'interestRate')?.value).toBe(12);
      expect(res?.prefilledUrl).toContain('/hard-money-calculator?');
      expect(res?.prefilledUrl).toContain('arv=600000');
    });

    it('routes a rate-and-term refinance to the refinance calculator', () => {
      const res = extractAndCalculateDeal(
        'I want to refinance my $600,000 mortgage. Current rate 7.25%, new rate 6.25%, 30 year.'
      );
      expect(res?.targetCalculator).toBe('refinance');
      expect(res?.targetRoute).toBe('/refinance-calculator');
      // The new rate drives the decision, so it is the primary rate shown.
      expect(res?.params.find((p) => p.key === 'interestRate')?.value).toBe(6.25);
      expect(res?.params.find((p) => p.key === 'currentRate')?.value).toBe(7.25);
      // A loan balance implies a property value; refinance needs both.
      expect(res?.params.find((p) => p.key === 'price')?.value).toBe(750000);
    });

    it('keeps the property value and the balance apart on a cash-out refinance', () => {
      // Both figures look alike and the balance sits one word after "home".
      const res = extractAndCalculateDeal(
        'Cash out refinance on a $900,000 home, owe $500,000, want 6.75% 30-year.'
      );
      expect(res?.targetCalculator).toBe('refinance');
      expect(res?.params.find((p) => p.key === 'price')?.value).toBe(900000);
      expect(res?.params.find((p) => p.key === 'origLoan')?.value).toBe(500000);
      expect(res?.params.find((p) => p.key === 'interestRate')?.value).toBe(6.75);
    });

    it('does not route an ordinary purchase as a refinance', () => {
      const res = extractAndCalculateDeal(
        'Looking at a $650,000 single family home in Seattle. 20% down, 6.625% 30-year fixed, owner occupied.'
      );
      expect(res?.targetCalculator).toBe('mortgage');
    });
  });

  describe('Regression: price selection by context', () => {
    it('ignores a closing-cost figure mentioned before the price', () => {
      const res = extractAndCalculateDeal(
        'Closing costs around $12,000 and the rate is 7%. The property itself is $525,000, 20% down.'
      );
      expect(res?.params.find((p) => p.key === 'price')?.value).toBe(525000);
      expect(res?.params.find((p) => p.key === 'interestRate')?.value).toBe(7);
    });

    it('ignores an annual tax figure stated immediately before the value', () => {
      const res = extractAndCalculateDeal(
        'Annual property tax is $11,500. Home value $575,000. 20% down at 6.875% for 30 years.'
      );
      expect(res?.params.find((p) => p.key === 'price')?.value).toBe(575000);
    });

    it('prefers a property value over a shorthand down payment', () => {
      const res = extractAndCalculateDeal('Property is 450000 and I have 90k to put down.');
      expect(res?.params.find((p) => p.key === 'price')?.value).toBe(450000);
    });
  });
});
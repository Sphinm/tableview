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
});

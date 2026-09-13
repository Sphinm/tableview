import { describe, it, expect } from 'bun:test';
import { calculateSingleLoan, compareLoans, type LoanParameters } from '../loanComparisonCalculator';

describe('Loan Comparison Calculator Engine', () => {
  const loanA: LoanParameters = {
    name: 'Loan Option A (30-Year Fixed)',
    loanAmount: 400000,
    interestRate: 6.5,
    termYears: 30,
    originationPoints: 0,
    upfrontFees: 1500,
    extraMonthlyPayment: 0
  };

  const loanB: LoanParameters = {
    name: 'Loan Option B (15-Year Fixed)',
    loanAmount: 400000,
    interestRate: 5.75,
    termYears: 15,
    originationPoints: 1.0,
    upfrontFees: 2000,
    extraMonthlyPayment: 0
  };

  it('calculates scheduled monthly payment accurately for 30-year fixed', () => {
    const res = calculateSingleLoan(loanA);
    // 400k at 6.5% 30yr = $2,528.27
    expect(res.scheduledMonthlyPayment).toBeCloseTo(2528.27, 1);
    expect(res.totalMonthsScheduled).toBe(360);
    expect(res.actualMonthsToPayoff).toBe(360);
    expect(res.upfrontClosingCosts).toBe(1500);
    expect(res.totalInterestPaid).toBeGreaterThan(500000);
  });

  it('calculates scheduled monthly payment accurately for 15-year fixed with points', () => {
    const res = calculateSingleLoan(loanB);
    // 400k at 5.75% 15yr = $3,321.60
    expect(res.scheduledMonthlyPayment).toBeCloseTo(3321.60, 1);
    expect(res.totalMonthsScheduled).toBe(180);
    // 1% points of 400k is 4000 + 2000 upfront fees = 6000
    expect(res.upfrontClosingCosts).toBe(6000);
  });

  it('computes side-by-side comparison verdict correctly', () => {
    const comparison = compareLoans(loanA, loanB);
    // Loan A is cheaper monthly
    expect(comparison.recommendation.lowerMonthly).toBe('A');
    // Loan B has far lower lifetime interest and overall cost
    expect(comparison.recommendation.lowerInterest).toBe('B');
    expect(comparison.recommendation.betterOverall).toBe('B');
    expect(comparison.totalInterestDiff).toBeGreaterThan(250000); // 15yr saves over $250k interest
  });

  it('handles extra monthly payments accelerating payoff', () => {
    const loanWithExtra: LoanParameters = {
      ...loanA,
      extraMonthlyPayment: 300
    };
    const res = calculateSingleLoan(loanWithExtra);
    expect(res.actualMonthlyPayment).toBeCloseTo(2828.27, 1);
    expect(res.actualMonthsToPayoff).toBeLessThan(360);
    expect(res.actualYearsToPayoff).toBeLessThan(25);
    expect(res.totalInterestPaid).toBeLessThan(calculateSingleLoan(loanA).totalInterestPaid);
  });

  it('computes break-even months when paying discount points for lower rate', () => {
    const zeroPointsLoan: LoanParameters = {
      name: 'Zero Points',
      loanAmount: 300000,
      interestRate: 7.0,
      termYears: 30,
      originationPoints: 0,
      upfrontFees: 1000,
      extraMonthlyPayment: 0
    };

    const onePointLoan: LoanParameters = {
      name: 'Discount Point Loan',
      loanAmount: 300000,
      interestRate: 6.5,
      termYears: 30,
      originationPoints: 1.0, // $3000 extra cost
      upfrontFees: 1000,
      extraMonthlyPayment: 0
    };

    const comp = compareLoans(zeroPointsLoan, onePointLoan);
    // Monthly payment for 7.0% on 300k is ~1995.91
    // Monthly payment for 6.5% on 300k is ~1896.20 (saves ~99.71/mo)
    // Extra fee is $3000 -> breaks even in ~30-31 months
    expect(comp.breakEvenMonths).toBeGreaterThanOrEqual(28);
    expect(comp.breakEvenMonths).toBeLessThanOrEqual(35);
  });

  it('separates parenthetical e.g. notes from the headline into subHeadline', () => {
    const loanWithEgA: LoanParameters = {
      name: 'Loan Option A (e.g. 30-Yr Fixed)',
      loanAmount: 400000,
      interestRate: 6.75,
      termYears: 30,
      originationPoints: 0,
      upfrontFees: 1500,
      extraMonthlyPayment: 0
    };

    const loanWithEgB: LoanParameters = {
      name: 'Loan Option B (e.g. 15-Yr or Lower Rate)',
      loanAmount: 400000,
      interestRate: 5.875,
      termYears: 15,
      originationPoints: 1.0,
      upfrontFees: 2500,
      extraMonthlyPayment: 0
    };

    const comp = compareLoans(loanWithEgA, loanWithEgB);
    // Headline must NOT contain the e.g. notes
    expect(comp.recommendation.headline).not.toContain('(e.g.');
    expect(comp.recommendation.headline).toContain('Loan Option B saves you');
    expect(comp.recommendation.headline).toContain('compared to Loan Option A');

    // Sub-headline must contain the extracted e.g. notes
    expect(comp.recommendation.subHeadline).toBe('(e.g. 15-Yr or Lower Rate vs. 30-Yr Fixed)');
  });
});

import { describe, it, expect } from 'bun:test';
import { calculateHardMoney, type HardMoneyInputs } from '../hardMoneyCalculator';

describe('Hard Money Loan Calculator Engine', () => {
  const sampleInputs: HardMoneyInputs = {
    purchasePrice: 220000,
    rehabBudget: 60000,
    afterRepairValue: 360000, // ARV
    ltvPercent: 85, // 85% on purchase
    rehabFinancedPercent: 100, // 100% rehab financed
    interestRate: 11.0,
    originationPoints: 2.0,
    lenderUnderwritingFees: 1500,
    projectDurationMonths: 6,
    monthlyHoldingCosts: 600,
    realtorCommissionPercent: 5.0,
    exitClosingCostsPercent: 1.5
  };

  it('calculates loan amounts and points accurately', () => {
    const res = calculateHardMoney(sampleInputs);
    // Purchase loan: 220k * 85% = 187,000
    expect(res.purchaseLoanAmount).toBe(187000);
    // Rehab loan: 60,000
    expect(res.rehabLoanAmount).toBe(60000);
    expect(res.totalLoanAmount).toBe(247000);
    // 2 points on 247k = 4,940
    expect(res.originationPointsCost).toBe(4940);
  });

  it('calculates monthly interest-only payments and holding costs', () => {
    const res = calculateHardMoney(sampleInputs);
    // 247,000 * 11% / 12 = $2,264.17/mo
    expect(res.monthlyInterestPayment).toBeCloseTo(2264.17, 1);
    // 6 months of interest = $13,585.00
    expect(res.totalInterestPaid).toBeCloseTo(13585.00, 0);
    expect(res.totalHoldingCosts).toBe(3600); // 600 * 6
  });

  it('computes 70% rule compliance and MAO properly', () => {
    const res = calculateHardMoney(sampleInputs);
    // 70% MAO = (360k * 0.7) - 60k = 252k - 60k = 192,000
    expect(res.maxAllowableOffer70Rule).toBe(192000);
    // Purchase price is 220k, which is > 192k -> false
    expect(res.is70RuleCompliant).toBe(false);
  });

  it('computes net profit, ROI, and deal verdict', () => {
    const res = calculateHardMoney(sampleInputs);
    expect(res.netProfit).toBeGreaterThan(0);
    expect(res.roiPercent).toBeGreaterThan(0);
    expect(res.annualizedRoiPercent).toBeGreaterThan(res.roiPercent);
    expect(['excellent', 'profitable', 'marginal']).toContain(res.dealVerdict);
  });
});

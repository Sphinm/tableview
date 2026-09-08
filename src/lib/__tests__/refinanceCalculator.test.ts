import { describe, it, expect } from 'bun:test';
import {
  calculateMonthlyPayment,
  calculateRemainingBalance,
  calculateRefinance,
  generateRefinanceSchedule,
  getAnnualRefinanceSchedule,
  type RefinanceInputs
} from '../refinanceCalculator';

describe('Refinance Calculator Engine', () => {
  it('calculates standard monthly mortgage payment accurately', () => {
    // $320,000 at 7.00% for 30 years = $2,128.97
    const payment = calculateMonthlyPayment(320000, 7.0, 30);
    expect(Number(payment.toFixed(2))).toBe(2128.97);

    // $300,849.24 at 5.75% for 15 years = $2,498.28
    const refiPayment = calculateMonthlyPayment(300849.24, 5.75, 15);
    expect(Number(refiPayment.toFixed(2))).toBe(2498.28);
  });

  it('calculates remaining mortgage balance after 60 months accurately', () => {
    // $320,000 at 7.00% for 30 years after 60 months = $301,221.09
    const bal = calculateRemainingBalance(320000, 7.0, 30, 60);
    expect(Number(bal.toFixed(2))).toBe(301221.09);
  });

  it('calculates comprehensive refinance analysis accurately', () => {
    const inputs: RefinanceInputs = {
      homePrice: 400000,
      downPayment: 80000,
      originalLoanAmount: 320000,
      originalTermYears: 30,
      currentInterestRate: 7.0,
      monthsAlreadyPaid: 60,
      newTermYears: 15,
      newInterestRate: 5.75,
      yearsBeforeSell: 7,
      discountPoints: 1.0,
      originationPercent: 0.0,
      otherClosingCosts: 1200,
      cashOutAmount: 0,
      federalTaxRate: 25.0,
      stateTaxRate: 5.0
    };

    const res = calculateRefinance(inputs);

    // Initial payments & balances
    expect(Number(res.currentMonthlyPayment.toFixed(2))).toBe(2128.97);
    expect(Number(res.currentBalance.toFixed(2))).toBe(301221.09);
    expect(Number(res.newLoanAmount.toFixed(2))).toBe(301221.09);
    expect(Number(res.newMonthlyPayment.toFixed(2))).toBe(2501.37);
    expect(Number(res.monthlyPaymentSavings.toFixed(2))).toBe(-372.40);

    // Closing Costs
    expect(Number(res.discountPointsCost.toFixed(2))).toBe(3012.21);
    expect(Number(res.totalClosingCosts.toFixed(2))).toBe(4212.21);

    // Horizon Analysis (7 years = 84 months)
    expect(res.horizonYears).toBe(7);
    expect(Number(res.totalPaymentsOldHorizon.toFixed(2))).toBe(178833.31);
    expect(Number(res.totalPaymentsNewHorizon.toFixed(2))).toBe(210115.10);
    expect(Number(res.paymentSavingsHorizon.toFixed(2))).toBe(-31281.79);

    expect(Number(res.totalInterestOldHorizon.toFixed(2))).toBe(138674.43);
    expect(Number(res.totalInterestNewHorizon.toFixed(2))).toBe(101010.98);
    expect(Number(res.interestSavingsHorizon.toFixed(2))).toBe(37663.45);

    // Ending Balances & Equity Difference
    expect(Number(res.oldHorizonBalance.toFixed(2))).toBe(261062.21);
    expect(Number(res.newHorizonBalance.toFixed(2))).toBe(192116.96);
    expect(Number(res.balanceDifferenceAtHorizon.toFixed(2))).toBe(68945.25);
    expect(Number(res.balanceDiffLessTaxShift.toFixed(2))).toBe(57646.21);

    // Total Net Benefit
    expect(Number(res.totalNetBenefit.toFixed(2))).toBe(22152.21);
    expect(Number(res.lifetimeInterestSaved.toFixed(2))).toBe(188443.74);
  });

  it('calculates break-even months correctly when monthly payment drops', () => {
    // 30-year 7.25% refinancing to 30-year 5.75%
    const inputs: RefinanceInputs = {
      homePrice: 400000,
      downPayment: 80000,
      originalLoanAmount: 320000,
      originalTermYears: 30,
      currentInterestRate: 7.25,
      monthsAlreadyPaid: 36,
      newTermYears: 30,
      newInterestRate: 5.75,
      yearsBeforeSell: 7,
      discountPoints: 0.5,
      originationPercent: 0.0,
      otherClosingCosts: 1500,
      federalTaxRate: 0,
      stateTaxRate: 0
    };

    const res = calculateRefinance(inputs);
    expect(res.monthlyPaymentSavings).toBeGreaterThan(0);
    expect(res.breakEvenMonths).not.toBeNull();
    expect(res.breakEvenMonths).toBeLessThan(36);
  });

  it('generates monthly and annual schedules consistently', () => {
    const inputs: RefinanceInputs = {
      homePrice: 400000,
      downPayment: 80000,
      originalLoanAmount: 320000,
      originalTermYears: 30,
      currentInterestRate: 7.0,
      monthsAlreadyPaid: 60,
      newTermYears: 15,
      newInterestRate: 5.75,
      yearsBeforeSell: 7,
      discountPoints: 1.0,
      originationPercent: 0.0,
      otherClosingCosts: 1200,
      federalTaxRate: 25.0,
      stateTaxRate: 5.0
    };

    const summary = calculateRefinance(inputs);
    const monthly = generateRefinanceSchedule(inputs, summary);
    expect(monthly.length).toBeGreaterThan(84);

    const annual = getAnnualRefinanceSchedule(monthly);
    expect(annual.length).toBeGreaterThanOrEqual(7);
    expect(annual[0].year).toBe(1);
    expect(annual[6].year).toBe(7);
  });
});

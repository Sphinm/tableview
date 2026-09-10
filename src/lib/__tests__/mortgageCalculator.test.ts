import { describe, it, expect } from 'bun:test';
import {
  calculateMortgage,
  generateAmortizationSchedule,
  getAmortizationChartData,
  calculateBiweeklyComparison,
  type MortgageInputs
} from '../mortgageCalculator';

describe('Mortgage Calculator Engine', () => {
  const baseInputs: MortgageInputs = {
    homeValue: 400000,
    downPayment: 80000, // 20%
    downPaymentType: 'money',
    interestRate: 6.5,
    loanTermYears: 30,
    startMonth: 1,
    startYear: 2026,
    propertyTaxYearly: 4800,
    pmiRate: 0.5,
    homeInsuranceYearly: 1200,
    monthlyHoa: 100,
    loanType: 'conventional',
    buyOrRefi: 'buy'
  };

  it('calculates standard 30-year fixed monthly principal and interest correctly', () => {
    const summary = calculateMortgage(baseInputs);
    expect(summary.loanAmount).toBe(320000);
    expect(summary.downPaymentPercent).toBe(20);
    expect(summary.isPmiRequired).toBe(false);
    expect(summary.monthlyPmi).toBe(0);
    // Standard P&I on $320k at 6.5% for 30 years is ~$2,022.61
    expect(Math.round(summary.monthlyPrincipalAndInterest)).toBe(2023);
    // Taxes: $400/mo, Insurance: $100/mo, HOA: $100/mo -> Total: ~$2,623
    expect(Math.round(summary.totalMonthlyPayment)).toBe(2623);
  });

  it('calculates and cancels PMI when down payment is less than 20%', () => {
    const inputsWithPmi: MortgageInputs = {
      ...baseInputs,
      downPayment: 40000 // 10% down -> $360k loan
    };
    const summary = calculateMortgage(inputsWithPmi);
    expect(summary.isPmiRequired).toBe(true);
    expect(summary.monthlyPmi).toBeGreaterThan(0);

    const schedule = generateAmortizationSchedule(inputsWithPmi);
    const pmiRows = schedule.filter((r) => r.pmi > 0);
    const zeroPmiRows = schedule.filter((r) => r.pmi === 0);

    // Initial rows should have PMI, later rows should cancel PMI at 80% LTV ($320k balance)
    expect(pmiRows.length).toBeGreaterThan(0);
    expect(zeroPmiRows.length).toBeGreaterThan(0);
    const firstZeroPmi = zeroPmiRows[0];
    expect(firstZeroPmi.startingBalance).toBeLessThanOrEqual(320000.01);
  });

  it('handles monthly extra principal and accelerates payoff', () => {
    const scheduleNormal = generateAmortizationSchedule(baseInputs, 0);
    const scheduleExtra = generateAmortizationSchedule(baseInputs, 300); // $300 extra monthly

    expect(scheduleExtra.length).toBeLessThan(scheduleNormal.length);
    const lastRowExtra = scheduleExtra[scheduleExtra.length - 1];
    const lastRowNormal = scheduleNormal[scheduleNormal.length - 1];
    expect(lastRowExtra.totalInterestToDate).toBeLessThan(lastRowNormal.totalInterestToDate);
  });

  it('handles one-time lump-sum extra payment at target month', () => {
    // Inject $25,000 extra payment at month 24
    const scheduleNormal = generateAmortizationSchedule(baseInputs, 0, 0, 0);
    const scheduleLump = generateAmortizationSchedule(baseInputs, 0, 25000, 24);

    expect(scheduleLump.length).toBeLessThan(scheduleNormal.length);
    const month24Row = scheduleLump.find((r) => r.monthIndex === 24);
    expect(month24Row).toBeDefined();
    expect(month24Row!.principalPaid).toBeGreaterThan(25000);
  });

  it('computes biweekly accelerated schedule savings correctly', () => {
    const biweekly = calculateBiweeklyComparison(baseInputs);
    expect(biweekly.interestSaved).toBeGreaterThan(10000);
    expect(biweekly.yearsSaved).toBeGreaterThanOrEqual(4);
  });

  it('extracts valid checkpoints for visual charts', () => {
    const schedule = generateAmortizationSchedule(baseInputs);
    const chartPoints = getAmortizationChartData(schedule);

    expect(chartPoints.length).toBeGreaterThan(10);
    expect(chartPoints[0].endingBalance).toBe(320000);
    expect(chartPoints[chartPoints.length - 1].endingBalance).toBe(0);
  });
});

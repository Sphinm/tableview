import { describe, it, expect } from 'bun:test';
import {
  calculateRentalProperty,
  calculateMonthlyMortgage,
  calculateRemainingBalance,
  RENTAL_PRESETS,
  type RentalPropertyInput
} from '../capRateCalculator';

describe('Rental Property Cash Flow & Cap Rate Underwriting Engine', () => {
  it('correctly calculates monthly mortgage payment and remaining balance', () => {
    // $280,000 loan at 6.875% for 30 years
    const monthlyPayment = calculateMonthlyMortgage(280000, 6.875, 30);
    // Standard PMT = 280000 * (0.06875/12) / (1 - (1 + 0.06875/12)^-360) ≈ 1839.51
    expect(monthlyPayment).toBeCloseTo(1839.40, 1);

    // Remaining balance after 10 years (120 months)
    const balance10Yr = calculateRemainingBalance(280000, 6.875, 30, 120);
    expect(balance10Yr).toBeGreaterThan(230000);
    expect(balance10Yr).toBeLessThan(250000);

    // Balance after full term (360 months) should be 0
    const balance30Yr = calculateRemainingBalance(280000, 6.875, 30, 360);
    expect(balance30Yr).toBe(0);
  });

  it('correctly underwrites Turnkey SFH with institutional NOI separation', () => {
    const input: RentalPropertyInput = {
      purchasePrice: 350000,
      closingCostPercent: 2.5,
      rehabBudget: 5000,
      downPaymentPercent: 20,
      interestRate: 6.875,
      loanTermYears: 30,
      monthlyRent: 2600,
      otherMonthlyIncome: 50,
      vacancyRate: 5,
      propertyTaxAnnual: 4200,
      insuranceAnnual: 1400,
      hoaMonthly: 45,
      managementFeePercent: 8,
      maintenancePercent: 5,
      capexMonthly: 150,
      utilitiesMonthly: 0,
      otherExpensesAnnual: 300
    };

    const out = calculateRentalProperty(input);

    // Acquisition & Financing
    expect(out.purchasePrice).toBe(350000);
    expect(out.closingCosts).toBe(8750); // 350,000 * 2.5%
    expect(out.downPaymentAmount).toBe(70000); // 20%
    expect(out.loanAmount).toBe(280000);
    expect(out.totalInitialCashRequired).toBe(70000 + 8750 + 5000); // 83,750

    // Income
    expect(out.grossScheduledRentMonthly).toBe(2600);
    expect(out.grossScheduledIncomeMonthly).toBe(2650);
    expect(out.grossScheduledIncomeAnnual).toBe(31800); // 2650 * 12
    expect(out.vacancyLossAnnual).toBe(31800 * 0.05); // 1590
    expect(out.effectiveGrossIncomeAnnual).toBe(31800 - 1590); // 30210

    // OpEx
    expect(out.totalOperatingExpensesAnnual).toBeGreaterThan(10000);
    expect(out.totalOperatingExpensesAnnual).toBeLessThan(15000);

    // Institutional NOI must strictly exclude debt service
    expect(out.noiAnnual).toBe(out.effectiveGrossIncomeAnnual - out.totalOperatingExpensesAnnual);
    expect(out.noiMonthly).toBeCloseTo(out.noiAnnual / 12, 2);

    // Debt service
    expect(out.monthlyDebtService).toBeCloseTo(1839.40, 1);
    expect(out.annualDebtService).toBeCloseTo(out.monthlyDebtService * 12, 1);

    // Net Cash Flow = NOI - Debt Service
    expect(out.netCashFlowAnnual).toBeCloseTo(out.noiAnnual - out.annualDebtService, 2);
    expect(out.netCashFlowMonthly).toBeCloseTo(out.netCashFlowAnnual / 12, 2);

    // Cap Rate = NOI / Purchase Price
    expect(out.capRate).toBeCloseTo((out.noiAnnual / 350000) * 100, 2);
    expect(out.capRate).toBeGreaterThan(4.0);

    // Cash-on-Cash Return = Net Cash Flow / Total Initial Cash
    expect(out.cashOnCashReturn).toBeCloseTo((out.netCashFlowAnnual / out.totalInitialCashRequired) * 100, 2);

    // DSCR
    expect(out.dscr).not.toBeNull();
    if (out.dscr !== null) {
      expect(out.dscr).toBeCloseTo(out.noiAnnual / out.annualDebtService, 2);
    }
  });

  it('models All-Cash purchase where debt service is $0 and Cap Rate equals Cash-on-Cash (excluding closing costs)', () => {
    const cashInput = RENTAL_PRESETS.find((p) => p.id === 'all-cash-purchase')!.input;
    const out = calculateRentalProperty(cashInput);

    expect(out.loanAmount).toBe(0);
    expect(out.monthlyDebtService).toBe(0);
    expect(out.annualDebtService).toBe(0);
    expect(out.dscr).toBeNull();

    // Annual cash flow must equal NOI exactly
    expect(out.netCashFlowAnnual).toBe(out.noiAnnual);
    expect(out.netCashFlowMonthly).toBe(out.noiMonthly);

    // Cap Rate & CoC comparison
    // Purchase Price: 400,000, Closing costs: 8,000, Total Cash: 408,000
    // Cap Rate = NOI / 400,000; CoC = NOI / 408,000
    expect(out.capRate).toBeGreaterThan(0);
    expect(out.cashOnCashReturn).toBeLessThanOrEqual(out.capRate);
    expect(out.cashOnCashReturn).toBeCloseTo((out.noiAnnual / 408000) * 100, 2);
  });

  it('correctly detects negative cash flow and provides risk warnings', () => {
    const underwaterInput: RentalPropertyInput = {
      purchasePrice: 600000,
      closingCostPercent: 3.0,
      rehabBudget: 10000,
      downPaymentPercent: 5, // high leverage
      interestRate: 8.5,
      loanTermYears: 30,
      monthlyRent: 2200, // low rent for $600k purchase
      otherMonthlyIncome: 0,
      vacancyRate: 10,
      propertyTaxAnnual: 9000,
      insuranceAnnual: 2500,
      hoaMonthly: 200,
      managementFeePercent: 10,
      maintenancePercent: 8,
      capexMonthly: 200,
      utilitiesMonthly: 150,
      otherExpensesAnnual: 500
    };

    const out = calculateRentalProperty(underwaterInput);

    expect(out.netCashFlowAnnual).toBeLessThan(0);
    expect(out.netCashFlowMonthly).toBeLessThan(0);
    expect(out.cashOnCashReturn).toBeLessThan(0);
    expect(out.verdict.status).toBe('negative');
    expect(out.verdict.risks.length).toBeGreaterThan(0);
  });

  it('evaluates the 1% Rule and 50% Rule benchmarks accurately', () => {
    // Midwest cash cow: $180,000 purchase, $2,100 rent -> 1.17% rent-to-price ratio
    const cashCowInput = RENTAL_PRESETS.find((p) => p.id === 'midwest-cash-cow')!.input;
    const cowOut = calculateRentalProperty(cashCowInput);

    expect(cowOut.rentToPriceRatio).toBeCloseTo((2100 / 180000) * 100, 2);
    expect(cowOut.meets1PercentRule).toBe(true);
    expect(cowOut.ruleOf50EstimatedExpenses).toBe(cowOut.grossScheduledIncomeAnnual * 0.5);

    // SFH: $350k purchase, $2600 rent -> 0.74%
    const sfhInput = RENTAL_PRESETS.find((p) => p.id === 'turnkey-sfh')!.input;
    const sfhOut = calculateRentalProperty(sfhInput);
    expect(sfhOut.meets1PercentRule).toBe(false);
  });

  it('generates a 10-year wealth accumulation projection schedule', () => {
    const input = RENTAL_PRESETS.find((p) => p.id === 'turnkey-sfh')!.input;
    const out = calculateRentalProperty(input);

    expect(out.projections.length).toBe(10);

    const year1 = out.projections[0];
    const year5 = out.projections[4];
    const year10 = out.projections[9];

    expect(year1.year).toBe(1);
    expect(year10.year).toBe(10);

    // Appreciation increases property value
    expect(year10.propertyValue).toBeGreaterThan(year5.propertyValue);
    expect(year5.propertyValue).toBeGreaterThan(year1.propertyValue);

    // Amortization pays down loan balance
    expect(year10.loanBalance).toBeLessThan(year5.loanBalance);
    expect(year5.loanBalance).toBeLessThan(year1.loanBalance);

    // Equity expands from both appreciation and paydown
    expect(year10.equity).toBeGreaterThan(year1.equity);
  });

  it('handles edge cases gracefully without NaN or division by zero', () => {
    const zeroInput: RentalPropertyInput = {
      purchasePrice: 0,
      closingCostPercent: 0,
      rehabBudget: 0,
      downPaymentPercent: 0,
      interestRate: 0,
      loanTermYears: 0,
      monthlyRent: 0,
      otherMonthlyIncome: 0,
      vacancyRate: 0,
      propertyTaxAnnual: 0,
      insuranceAnnual: 0,
      hoaMonthly: 0,
      managementFeePercent: 0,
      maintenancePercent: 0,
      capexMonthly: 0,
      utilitiesMonthly: 0,
      otherExpensesAnnual: 0
    };

    const out = calculateRentalProperty(zeroInput);
    expect(Number.isFinite(out.capRate)).toBe(true);
    expect(Number.isFinite(out.cashOnCashReturn)).toBe(true);
    expect(Number.isFinite(out.grossRentMultiplier)).toBe(true);
    expect(Number.isFinite(out.breakEvenOccupancyRate)).toBe(true);
    expect(out.monthlyDebtService).toBe(0);
    expect(out.noiAnnual).toBe(0);
  });
});

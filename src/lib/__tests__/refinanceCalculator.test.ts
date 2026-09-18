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

  it('supports rolling closing costs into new loan balance (zero out of pocket)', () => {
    const inputsWithoutRoll: RefinanceInputs = {
      homePrice: 400000,
      downPayment: 80000,
      originalLoanAmount: 320000,
      originalTermYears: 30,
      currentInterestRate: 7.0,
      monthsAlreadyPaid: 48,
      newTermYears: 30,
      newInterestRate: 6.0,
      yearsBeforeSell: 5,
      discountPoints: 1.0,
      originationPercent: 0.0,
      otherClosingCosts: 2500,
      federalTaxRate: 0,
      stateTaxRate: 0,
      rollCostsIntoLoan: false
    };

    const inputsWithRoll: RefinanceInputs = {
      ...inputsWithoutRoll,
      rollCostsIntoLoan: true
    };

    const resWithout = calculateRefinance(inputsWithoutRoll);
    const resWith = calculateRefinance(inputsWithRoll);

    expect(resWith.newLoanAmount).toBeGreaterThan(resWithout.newLoanAmount);
    expect(resWith.newLoanAmount).toBe(resWithout.newLoanAmount + resWithout.totalClosingCosts);
    expect(resWith.newMonthlyPayment).toBeGreaterThan(resWithout.newMonthlyPayment);
  });

  it('detects 30-year clock reset warning when refi extends debt horizon and costs more lifetime interest', () => {
    // Borrower already paid 96 months (8 years) on 30-yr loan at 6.0%, refis to another 30-yr loan at 5.75%
    const inputs: RefinanceInputs = {
      homePrice: 400000,
      downPayment: 80000,
      originalLoanAmount: 320000,
      originalTermYears: 30,
      currentInterestRate: 6.0,
      monthsAlreadyPaid: 96,
      newTermYears: 30,
      newInterestRate: 5.75,
      yearsBeforeSell: 10,
      discountPoints: 0.5,
      originationPercent: 0,
      otherClosingCosts: 2000,
      federalTaxRate: 0,
      stateTaxRate: 0
    };

    const res = calculateRefinance(inputs);
    expect(res.isResettingClock).toBe(true);
    expect(res.extraMonthsAdded).toBe(96); // 8 extra years
    // Even though monthly payment savings > 0, lifetime interest is higher
    expect(res.monthlyPaymentSavings).toBeGreaterThan(0);
    expect(res.lifetimeInterestSaved).toBeLessThan(0);
    expect(res.clockResetWarning).toBeDefined();
    expect(res.clockResetWarning).toContain('Resetting your loan term adds');
  });

  it('correctly incorporates current vs new PMI into monthly and horizon savings', () => {
    const baseInputs: RefinanceInputs = {
      homePrice: 400000,
      downPayment: 40000, // 10% down initially
      originalLoanAmount: 360000,
      originalTermYears: 30,
      currentInterestRate: 6.5,
      monthsAlreadyPaid: 48, // 4 years in
      newTermYears: 30,
      newInterestRate: 6.0,
      yearsBeforeSell: 5,
      discountPoints: 0,
      originationPercent: 0,
      otherClosingCosts: 3000,
      federalTaxRate: 0,
      stateTaxRate: 0,
      currentMonthlyPmi: 180, // paying $180/mo PMI
      newMonthlyPmi: 0 // refi eliminates PMI because home appreciated
    };

    const res = calculateRefinance(baseInputs);
    expect(res.currentMonthlyPmi).toBe(180);
    expect(res.newMonthlyPmi).toBe(0);
    expect(res.monthlyPmiSavings).toBe(180);
    // 5 years * 12 months = 60 months * $180 = $10,800
    expect(res.horizonPmiSavings).toBe(10800);
  });

  it('correctly calculates NPV discounted net benefit', () => {
    const inputs: RefinanceInputs = {
      homePrice: 400000,
      downPayment: 80000,
      originalLoanAmount: 320000,
      originalTermYears: 30,
      currentInterestRate: 7.0,
      monthsAlreadyPaid: 12,
      newTermYears: 30,
      newInterestRate: 5.5,
      yearsBeforeSell: 10,
      discountPoints: 1.0,
      originationPercent: 0,
      otherClosingCosts: 2500,
      federalTaxRate: 0,
      stateTaxRate: 0,
      discountRate: 6.0 // 6% annual discount rate
    };

    const res = calculateRefinance(inputs);
    expect(res.discountRateUsed).toBe(6.0);
    // Because future savings are discounted at 6%, NPV net benefit should be less than nominal net benefit
    expect(res.npvNetBenefit).toBeLessThan(res.totalNetBenefit);
  });

  it('correctly calculates FHA Streamline UFMIP and 36-month refund credit', () => {
    const fhaInputs: RefinanceInputs = {
      homePrice: 350000,
      downPayment: 12250,
      originalLoanAmount: 337750,
      originalTermYears: 30,
      currentInterestRate: 6.75,
      monthsAlreadyPaid: 12, // 1 year in (< 36 months)
      newTermYears: 30,
      newInterestRate: 5.75,
      yearsBeforeSell: 7,
      discountPoints: 0,
      originationPercent: 0,
      otherClosingCosts: 2000,
      federalTaxRate: 0,
      stateTaxRate: 0,
      refiProgram: 'fha_streamline',
      fhaOriginalUfmip: 5910 // 1.75% of original
    };

    const res = calculateRefinance(fhaInputs);
    expect(res.refiProgram).toBe('fha_streamline');
    // After 12 months, refund credit is ~53% (24/36 * 80%) of $5,910
    expect(res.fhaUfmipRefundCredit).toBeGreaterThan(3000);
    // Government fee should be net of the refund credit
    expect(res.governmentUpfrontFee).toBeLessThan(res.currentBalance * 0.0175);
    expect(res.totalClosingCosts).toBeCloseTo(2000 + res.governmentUpfrontFee, 2);
  });

  it('correctly calculates VA IRRRL 0.50% funding fee', () => {
    const vaInputs: RefinanceInputs = {
      homePrice: 450000,
      downPayment: 0,
      originalLoanAmount: 450000,
      originalTermYears: 30,
      currentInterestRate: 6.5,
      monthsAlreadyPaid: 24,
      newTermYears: 30,
      newInterestRate: 5.5,
      yearsBeforeSell: 5,
      discountPoints: 0,
      originationPercent: 0,
      otherClosingCosts: 1500,
      federalTaxRate: 0,
      stateTaxRate: 0,
      refiProgram: 'va_irrrl'
    };

    const res = calculateRefinance(vaInputs);
    expect(res.refiProgram).toBe('va_irrrl');
    // VA IRRRL flat 0.50% funding fee
    expect(res.governmentUpfrontFee).toBeCloseTo(res.currentBalance * 0.005, 0);
    expect(res.totalClosingCosts).toBeCloseTo(1500 + res.governmentUpfrontFee, 2);
  });
});

import { describe, it, expect } from 'bun:test';
import { calculateCommercialLoan, type CommercialLoanInputs } from '../commercialLoanCalculator';

describe('Commercial Real Estate Loan & Balloon Calculator Engine', () => {
  const standardInputs: CommercialLoanInputs = {
    propertyPrice: 1000000,
    downPaymentPercent: 25,
    interestRate: 7.0,
    amortizationYears: 25,
    balloonTermYears: 5,
    interestOnlyMonths: 0,
    originationPoints: 1.0,
    closingFees: 5000
  };

  it('calculates down payment, loan amount, and LTV correctly', () => {
    const res = calculateCommercialLoan(standardInputs);
    expect(res.downPaymentAmount).toBe(250000);
    expect(res.loanAmount).toBe(750000);
    expect(res.ltv).toBe(75.0);
    expect(res.hasBalloonPayment).toBe(true);
  });

  it('computes regular monthly P&I payment on 25-year schedule accurately', () => {
    const res = calculateCommercialLoan(standardInputs);
    // $750,000 at 7% on 25yr = $5,300.84/mo
    expect(res.regularMonthlyPayment).toBeCloseTo(5300.84, 1);
  });

  it('computes 5-year balloon maturity balance and principal reduction accurately', () => {
    const res = calculateCommercialLoan(standardInputs);
    expect(res.balloonMaturityMonth).toBe(60);
    // After 5 years on 25yr 7% schedule, balance is ~$680k
    expect(res.balloonDueAmount).toBeGreaterThan(670000);
    expect(res.balloonDueAmount).toBeLessThan(690000);
    expect(res.balloonDuePercentOfOriginal).toBeGreaterThan(88);
    expect(res.refinanceRiskLevel).toBe('High');
  });

  it('handles interest-only initial periods correctly', () => {
    const ioInputs: CommercialLoanInputs = {
      ...standardInputs,
      interestOnlyMonths: 24 // 2 years IO
    };
    const res = calculateCommercialLoan(ioInputs);
    // IO payment = 750k * 7% / 12 = $4,375.00
    expect(res.interestOnlyMonthlyPayment).toBe(4375);
    // After IO, P&I resets over remaining 23 years (25 - 2)
    expect(res.regularMonthlyPayment).toBeGreaterThan(5301.21);
    // Because 2 years were IO, less principal was paid by Year 5
    expect(res.balloonDueAmount).toBeGreaterThan(calculateCommercialLoan(standardInputs).balloonDueAmount);
  });

  it('handles fully amortizing commercial loans without balloon penalty', () => {
    const fullyAmortizing: CommercialLoanInputs = {
      ...standardInputs,
      balloonTermYears: 25 // no balloon
    };
    const res = calculateCommercialLoan(fullyAmortizing);
    expect(res.hasBalloonPayment).toBe(false);
    expect(res.balloonDueAmount).toBe(0);
    expect(res.refinanceRiskLevel).toBe('Low');
  });
});

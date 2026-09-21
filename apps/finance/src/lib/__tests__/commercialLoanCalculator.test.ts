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

  it('correctly models Actual/360 day count convention yielding higher interest', () => {
    const standard30360 = calculateCommercialLoan({
      ...standardInputs,
      dayCountConvention: '30/360'
    });
    const actual360 = calculateCommercialLoan({
      ...standardInputs,
      dayCountConvention: 'actual/360'
    });

    // Actual/360 charges ~365/360 ratio of interest each month
    expect(actual360.totalInterestBeforeBalloon).toBeGreaterThan(standard30360.totalInterestBeforeBalloon);
    // Because more of the monthly payment went to interest, less went to principal
    expect(actual360.balloonDueAmount).toBeGreaterThan(standard30360.balloonDueAmount);
  });

  it('correctly calculates SBA 7(a) guarantee fees', () => {
    const sba7a = calculateCommercialLoan({
      ...standardInputs,
      loanProgram: 'sba7a',
      sba7aGuaranteePercent: 75
    });
    // Loan is 750,000 (> 700k tier -> 3.5% fee on 75% guaranteed portion)
    // 750k * 75% = 562,500 * 3.5% = 19,687.50
    expect(sba7a.sbaGuaranteeFee).toBe(19688);
    expect(sba7a.upfrontCosts).toBe(7500 + 5000 + 19688);
  });

  it('correctly calculates SBA 504 CDC fees', () => {
    const sba504 = calculateCommercialLoan({
      ...standardInputs,
      loanProgram: 'sba504',
      sba504CdcPercent: 40
    });
    // Property price = 1,000,000. 40% CDC debenture = 400,000
    // Fees: 1.5% CDC processing (6,000) + 0.5% SBA guarantee (2,000) + 0.25% funding (1,000) = 9,000
    expect(sba504.sbaGuaranteeFee).toBe(9000);
    expect(sba504.upfrontCosts).toBe(7500 + 5000 + 9000);
  });

  it('accurately calculates Step-Down prepayment penalties upon early exit', () => {
    // Pay off at month 24 (Year 2) with default 5-4-3-2-1% schedule -> 4% penalty
    const res = calculateCommercialLoan({
      ...standardInputs,
      prepaymentPenaltyType: 'stepdown',
      prepaymentPayoffMonth: 24,
      stepdownSchedule: [5, 4, 3, 2, 1]
    });

    expect(res.prepaymentPenaltyType).toBe('stepdown');
    expect(res.prepaymentPayoffMonth).toBe(24);
    // 4% of balance at month 24
    expect(res.prepaymentPenaltyAmount).toBeCloseTo(res.prepaymentPayoffBalance * 0.04, 0);
    expect(res.totalPayoffWithPenalty).toBe(res.prepaymentPayoffBalance + res.prepaymentPenaltyAmount);
  });

  it('accurately calculates Yield Maintenance prepayment penalty with floor', () => {
    const res = calculateCommercialLoan({
      ...standardInputs,
      prepaymentPenaltyType: 'yield_maintenance',
      prepaymentPayoffMonth: 36, // Month 36 (24 months remaining to 60-month balloon)
      treasuryRateAtPayoff: 4.5 // Note is 7.0%, spread = 2.5%
    });

    expect(res.prepaymentPenaltyType).toBe('yield_maintenance');
    // Lost yield = balance * 2.5% * (24/12 = 2 years) = balance * 5.0%
    expect(res.prepaymentPenaltyAmount).toBeCloseTo(res.prepaymentPayoffBalance * 0.05, 0);
    expect(res.totalPayoffWithPenalty).toBe(res.prepaymentPayoffBalance + res.prepaymentPenaltyAmount);
  });

  it('accurately calculates Debt Yield and categorizes health tier', () => {
    // 750k loan with 90k NOI -> Debt Yield = 90k / 750k = 12.0% (Prime)
    const primeRes = calculateCommercialLoan({
      ...standardInputs,
      annualNoi: 90000
    });
    expect(primeRes.debtYieldPercent).toBe(12.0);
    expect(primeRes.debtYieldHealth).toBe('prime');

    // 750k loan with 65k NOI -> Debt Yield = 65k / 750k = 8.67% (Moderate)
    const modRes = calculateCommercialLoan({
      ...standardInputs,
      annualNoi: 65000
    });
    expect(modRes.debtYieldPercent).toBeCloseTo(8.67, 1);
    expect(modRes.debtYieldHealth).toBe('moderate');

    // 750k loan with 50k NOI -> Debt Yield = 50k / 750k = 6.67% (Elevated)
    const lowRes = calculateCommercialLoan({
      ...standardInputs,
      annualNoi: 50000
    });
    expect(lowRes.debtYieldPercent).toBeCloseTo(6.67, 1);
    expect(lowRes.debtYieldHealth).toBe('elevated');
  });

  it('evaluates Dual-Constraint Debt Sizing (LTV vs DSCR)', () => {
    // 1M property, 75% max LTV = 750k LTV max loan.
    // At 95k NOI and 1.25 DSCR hurdle:
    // Max annual debt service = 95,000 / 1.25 = 76,000/yr = 6,333.33/mo
    // At 7% 25yr, supported loan is ~$896k.
    // Therefore, LTV is the binding constraint!
    const ltvBinding = calculateCommercialLoan({
      ...standardInputs,
      annualNoi: 95000,
      minDscrHurdle: 1.25,
      maxLtvHurdle: 75
    });
    expect(ltvBinding.maxLoanByLtv).toBe(750000);
    expect(ltvBinding.maxLoanByDscr).toBeGreaterThan(850000);
    expect(ltvBinding.bindingConstraint).toBe('LTV');
    expect(ltvBinding.underwrittenMaxLoan).toBe(750000);

    // If NOI is lower: 60k NOI at 1.25 DSCR:
    // Max debt service = 60k / 1.25 = 48,000/yr = 4,000/mo
    // At 7% 25yr, supported loan is ~$565k (< 750k).
    // Therefore, DSCR is the binding constraint!
    const dscrBinding = calculateCommercialLoan({
      ...standardInputs,
      annualNoi: 60000,
      minDscrHurdle: 1.25,
      maxLtvHurdle: 75
    });
    expect(dscrBinding.maxLoanByDscr).toBeLessThan(600000);
    expect(dscrBinding.bindingConstraint).toBe('DSCR');
    expect(dscrBinding.underwrittenMaxLoan).toBe(dscrBinding.maxLoanByDscr);
  });
});

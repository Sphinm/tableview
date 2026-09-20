import { describe, it, expect } from 'bun:test';
import {
  calculateBrrrr,
  type BrrrrInputs,
} from '../brrrrCalculator';

describe('BRRRR Method Underwriting Engine', () => {
  it('calculates an all-cash BRRRR deal with capital left in the deal accurately', () => {
    const inputs: BrrrrInputs = {
      // Phase 1: Buy & Rehab
      purchasePrice: 120000,
      rehabCost: 35000,
      purchaseClosingCosts: 3000,
      financingType: 'cash',
      hardMoneyLtcPercent: 90,
      hardMoneyRate: 11.5,
      hardMoneyPoints: 2,
      holdingPeriodMonths: 6,
      monthlyHoldingCosts: 400,

      // Phase 2: Rent & Stabilize
      afterRepairValue: 200000,
      grossMonthlyRent: 1800,
      vacancyRatePercent: 5,
      propertyManagementPercent: 8,
      monthlyPropertyTaxes: 200,
      monthlyInsurance: 100,
      monthlyHoa: 0,
      monthlyMaintenanceCapex: 150,

      // Phase 3: Refinance
      refinanceLtvPercent: 75, // $150,000 refi loan
      refinanceInterestRate: 7.0,
      refinanceTermYears: 30,
      refinanceClosingCosts: 4000,
    };

    const result = calculateBrrrr(inputs);

    // Total Cash Invested = $120,000 (purchase) + $35,000 (rehab) + $3,000 (closing) + (6 * $400 holding) = $160,400
    expect(result.phase1.totalCashInvested).toBe(160400);

    // Refinance Loan = $200,000 * 75% = $150,000
    expect(result.phase3.refinanceLoanAmount).toBe(150000);

    // Cash Out Net = $150,000 - $0 existing debt - $4,000 refi closing = $146,000
    expect(result.phase3.netCashFromRefinance).toBe(146000);

    // Net Capital Left in Deal = $160,400 - $146,000 = $14,400
    expect(result.verdict.netCapitalLeftInDeal).toBe(14400);
    expect(result.verdict.isInfiniteReturn).toBe(false);

    // NOI calculation:
    // Effective Rent = $1,800 * 0.95 = $1,710
    // Expenses = $144 (Mgmt 8% of $1,800) + $200 (Tax) + $100 (Ins) + $150 (Maint) = $594
    // Monthly NOI = $1,710 - $594 = $1,116
    expect(Math.round(result.phase2.monthlyNoi)).toBe(1116);

    // Refi P&I for $150k at 7% 30Y = ~$997.95
    expect(Math.round(result.phase3.monthlyPrincipalAndInterest)).toBe(998);

    // Post-Refi Monthly Cash Flow = $1,116 - $998 = $118/mo
    expect(Math.round(result.verdict.postRefiMonthlyCashFlow)).toBe(118);

    // Cash-on-Cash Return: ($118 * 12) / $14,400 = ~9.8%
    expect(result.verdict.cashOnCashReturnPercent).toBeGreaterThan(9.0);
    expect(result.verdict.cashOnCashReturnPercent).toBeLessThan(11.0);
  });

  it('correctly triggers the Infinite Return verdict when all capital is pulled out', () => {
    const inputs: BrrrrInputs = {
      purchasePrice: 100000,
      rehabCost: 30000,
      purchaseClosingCosts: 2000,
      financingType: 'cash',
      hardMoneyLtcPercent: 90,
      hardMoneyRate: 11.0,
      hardMoneyPoints: 2,
      holdingPeriodMonths: 4,
      monthlyHoldingCosts: 300,

      // Excellent equity creation: ARV $210,000
      afterRepairValue: 210000,
      grossMonthlyRent: 1900,
      vacancyRatePercent: 5,
      propertyManagementPercent: 8,
      monthlyPropertyTaxes: 180,
      monthlyInsurance: 90,
      monthlyHoa: 0,
      monthlyMaintenanceCapex: 150,

      // Refi at 75% = $157,500
      refinanceLtvPercent: 75,
      refinanceInterestRate: 6.875,
      refinanceTermYears: 30,
      refinanceClosingCosts: 3500,
    };

    const result = calculateBrrrr(inputs);

    // Total Cash Invested = $100,000 + $30,000 + $2,000 + (4 * $300) = $133,200
    expect(result.phase1.totalCashInvested).toBe(133200);

    // Refi Net Cash = $157,500 - $3,500 = $154,000
    expect(result.phase3.netCashFromRefinance).toBe(154000);

    // Net Capital Left = $133,200 - $154,000 = -$20,800 (Cash profit in pocket!)
    expect(result.verdict.netCapitalLeftInDeal).toBeLessThan(0);
    expect(result.verdict.isInfiniteReturn).toBe(true);
    expect(result.verdict.cashInPocketSurplus).toBe(20800);
  });

  it('correctly underwrites Hard Money loan financing during rehab phase', () => {
    const inputs: BrrrrInputs = {
      purchasePrice: 150000,
      rehabCost: 50000,
      purchaseClosingCosts: 4000,
      financingType: 'hard_money',
      hardMoneyLtcPercent: 90, // 90% of ($150k + $50k) = $180,000 loan
      hardMoneyRate: 12.0,     // 12% annualized = 1% / month = $1,800/mo interest
      hardMoneyPoints: 2,      // 2% of $180,000 = $3,600
      holdingPeriodMonths: 6,
      monthlyHoldingCosts: 500, // taxes, insurance, utilities

      afterRepairValue: 260000,
      grossMonthlyRent: 2400,
      vacancyRatePercent: 5,
      propertyManagementPercent: 8,
      monthlyPropertyTaxes: 250,
      monthlyInsurance: 120,
      monthlyHoa: 0,
      monthlyMaintenanceCapex: 200,

      refinanceLtvPercent: 75, // 75% of $260k = $195,000
      refinanceInterestRate: 7.125,
      refinanceTermYears: 30,
      refinanceClosingCosts: 4500,
    };

    const result = calculateBrrrr(inputs);

    // Hard money loan amount = 90% of $200k = $180,000
    expect(result.phase1.hardMoneyLoanAmount).toBe(180000);

    // Loan Points = $3,600
    expect(result.phase1.hardMoneyPointsCost).toBe(3600);

    // Monthly Interest = $180k * 1% = $1,800
    expect(result.phase1.monthlyInterestOnlyPayment).toBe(1800);

    // Total Holding Cost = (6 * $1,800 interest) + (6 * $500 other) = $10,800 + $3,000 = $13,800
    expect(result.phase1.totalHoldingCosts).toBe(13800);

    // Initial Cash Out-of-Pocket = $200,000 (total project) - $180,000 (loan) + $4,000 (closing) + $3,600 (points) + $13,800 (holding) = $41,400
    expect(result.phase1.totalCashInvested).toBe(41400);

    // Refinance pays off the $180k hard money loan:
    // Refinance Loan = $195,000
    // Net Cash Out = $195,000 - $180,000 (payoff) - $4,500 (closing) = $10,500
    expect(result.phase3.netCashFromRefinance).toBe(10500);

    // Net Capital Left in Deal = $41,400 - $10,500 = $30,900
    expect(result.verdict.netCapitalLeftInDeal).toBe(30900);

    // DSCR on new loan:
    expect(result.verdict.postRefiDscr).toBeGreaterThan(1.10);
  });
});

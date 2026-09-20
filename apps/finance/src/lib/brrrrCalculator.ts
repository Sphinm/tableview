/**
 * BRRRR (Buy, Rehab, Rent, Refinance, Repeat) Method Underwriting Engine
 *
 * Models the entire real estate investor life cycle:
 * Phase 1: Buy & Rehab (Cash or Hard Money acquisition + holding costs)
 * Phase 2: Rent & Stabilize (NOI, Cap Rate, Operating Expenses)
 * Phase 3: Refinance (30-Year permanent takeout debt, debt payoff, cash extraction)
 * Phase 4: Repeat (Net Capital Left in Deal, Infinite Return verdict, Cash-on-Cash Return, DSCR)
 */

export interface BrrrrInputs {
  // Phase 1: Buy & Rehab
  purchasePrice: number;
  rehabCost: number;
  purchaseClosingCosts: number;
  financingType: 'cash' | 'hard_money';
  hardMoneyLtcPercent: number; // e.g. 90%
  hardMoneyRate: number;       // e.g. 11.5%
  hardMoneyPoints: number;     // e.g. 2 points
  holdingPeriodMonths: number; // e.g. 6 months
  monthlyHoldingCosts: number; // taxes, insurance, utilities during rehab

  // Phase 2: Rent & Stabilize
  afterRepairValue: number;
  grossMonthlyRent: number;
  vacancyRatePercent: number;
  propertyManagementPercent: number;
  monthlyPropertyTaxes: number;
  monthlyInsurance: number;
  monthlyHoa: number;
  monthlyMaintenanceCapex: number;

  // Phase 3: Refinance
  refinanceLtvPercent: number;  // e.g. 75%
  refinanceInterestRate: number; // e.g. 7.0%
  refinanceTermYears: number;   // e.g. 30
  refinanceClosingCosts: number;// e.g. 4000
}

export interface BrrrrResult {
  phase1: {
    totalProjectCost: number;
    hardMoneyLoanAmount: number;
    hardMoneyPointsCost: number;
    monthlyInterestOnlyPayment: number;
    totalHoldingCosts: number;
    totalCashInvested: number;
  };
  phase2: {
    effectiveMonthlyRent: number;
    totalMonthlyExpenses: number;
    monthlyNoi: number;
    annualNoi: number;
    capRateOnCost: number;
    capRateOnArv: number;
  };
  phase3: {
    refinanceLoanAmount: number;
    existingDebtPayoff: number;
    netCashFromRefinance: number;
    monthlyPrincipalAndInterest: number;
  };
  verdict: {
    totalCashInvested: number;
    cashRecoveredAtRefi: number;
    netCapitalLeftInDeal: number;
    isInfiniteReturn: boolean;
    cashInPocketSurplus: number;
    postRefiMonthlyCashFlow: number;
    postRefiAnnualCashFlow: number;
    cashOnCashReturnPercent: number;
    postRefiDscr: number;
    dealRating: 'Exceptional (Infinite Return)' | 'Strong (High Cash-on-Cash)' | 'Moderate' | 'Tight / Capital Heavy';
  };
}

export function calculateBrrrr(inputs: BrrrrInputs): BrrrrResult {
  const {
    purchasePrice,
    rehabCost,
    purchaseClosingCosts,
    financingType,
    hardMoneyLtcPercent,
    hardMoneyRate,
    hardMoneyPoints,
    holdingPeriodMonths,
    monthlyHoldingCosts,

    afterRepairValue,
    grossMonthlyRent,
    vacancyRatePercent,
    propertyManagementPercent,
    monthlyPropertyTaxes,
    monthlyInsurance,
    monthlyHoa,
    monthlyMaintenanceCapex,

    refinanceLtvPercent,
    refinanceInterestRate,
    refinanceTermYears,
    refinanceClosingCosts,
  } = inputs;

  // --- Phase 1: Buy & Rehab ---
  const totalProjectCost = purchasePrice + rehabCost;
  let hardMoneyLoanAmount = 0;
  let hardMoneyPointsCost = 0;
  let monthlyInterestOnlyPayment = 0;
  let totalHoldingInterest = 0;

  if (financingType === 'hard_money') {
    const ltcRatio = Math.max(0, Math.min(100, hardMoneyLtcPercent)) / 100;
    hardMoneyLoanAmount = Math.round(totalProjectCost * ltcRatio);
    hardMoneyPointsCost = Math.round(hardMoneyLoanAmount * (hardMoneyPoints / 100));
    monthlyInterestOnlyPayment = Math.round(hardMoneyLoanAmount * (hardMoneyRate / 100 / 12));
    totalHoldingInterest = monthlyInterestOnlyPayment * holdingPeriodMonths;
  }

  const otherHoldingCostsTotal = monthlyHoldingCosts * holdingPeriodMonths;
  const totalHoldingCosts = totalHoldingInterest + otherHoldingCostsTotal;

  // Initial cash out-of-pocket:
  // For cash: purchasePrice + rehabCost + purchaseClosingCosts + otherHoldingCostsTotal
  // For hard money: (totalProjectCost - hardMoneyLoanAmount) + purchaseClosingCosts + hardMoneyPointsCost + totalHoldingCosts
  const totalCashInvested =
    financingType === 'hard_money'
      ? (totalProjectCost - hardMoneyLoanAmount) + purchaseClosingCosts + hardMoneyPointsCost + totalHoldingCosts
      : purchasePrice + rehabCost + purchaseClosingCosts + totalHoldingCosts;

  // --- Phase 2: Rent & Stabilize ---
  const vacancyLoss = grossMonthlyRent * (vacancyRatePercent / 100);
  const effectiveMonthlyRent = grossMonthlyRent - vacancyLoss;
  const managementFee = grossMonthlyRent * (propertyManagementPercent / 100);

  const totalMonthlyExpenses =
    managementFee +
    monthlyPropertyTaxes +
    monthlyInsurance +
    monthlyHoa +
    monthlyMaintenanceCapex;

  const monthlyNoi = effectiveMonthlyRent - totalMonthlyExpenses;
  const annualNoi = monthlyNoi * 12;

  const capRateOnCost = totalProjectCost > 0 ? (annualNoi / totalProjectCost) * 100 : 0;
  const capRateOnArv = afterRepairValue > 0 ? (annualNoi / afterRepairValue) * 100 : 0;

  // --- Phase 3: Refinance ---
  const refinanceLoanAmount = Math.round(afterRepairValue * (refinanceLtvPercent / 100));
  const existingDebtPayoff = financingType === 'hard_money' ? hardMoneyLoanAmount : 0;
  const netCashFromRefinance = refinanceLoanAmount - existingDebtPayoff - refinanceClosingCosts;

  // Calculate new 30-year P&I
  const monthlyRate = refinanceInterestRate / 100 / 12;
  const totalPayments = refinanceTermYears * 12;
  let monthlyPrincipalAndInterest = 0;
  if (monthlyRate > 0 && totalPayments > 0) {
    monthlyPrincipalAndInterest =
      (refinanceLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
  } else if (totalPayments > 0) {
    monthlyPrincipalAndInterest = refinanceLoanAmount / totalPayments;
  }

  // --- Phase 4: Repeat & Verdict ---
  const netCapitalLeftInDeal = totalCashInvested - netCashFromRefinance;
  const isInfiniteReturn = netCapitalLeftInDeal <= 0;
  const cashInPocketSurplus = isInfiniteReturn ? Math.abs(netCapitalLeftInDeal) : 0;

  const postRefiMonthlyCashFlow = monthlyNoi - monthlyPrincipalAndInterest;
  const postRefiAnnualCashFlow = postRefiMonthlyCashFlow * 12;

  let cashOnCashReturnPercent = 0;
  if (isInfiniteReturn) {
    cashOnCashReturnPercent = 999.9; // Representation of Infinite CoC return
  } else if (netCapitalLeftInDeal > 0) {
    cashOnCashReturnPercent = (postRefiAnnualCashFlow / netCapitalLeftInDeal) * 100;
  }

  // Post-Refinance DSCR
  const totalPitia =
    monthlyPrincipalAndInterest +
    monthlyPropertyTaxes +
    monthlyInsurance +
    monthlyHoa;
  const postRefiDscr = totalPitia > 0 ? grossMonthlyRent / totalPitia : 0;

  let dealRating: BrrrrResult['verdict']['dealRating'] = 'Moderate';
  if (isInfiniteReturn) {
    dealRating = 'Exceptional (Infinite Return)';
  } else if (cashOnCashReturnPercent >= 15) {
    dealRating = 'Strong (High Cash-on-Cash)';
  } else if (cashOnCashReturnPercent < 6) {
    dealRating = 'Tight / Capital Heavy';
  }

  return {
    phase1: {
      totalProjectCost,
      hardMoneyLoanAmount,
      hardMoneyPointsCost,
      monthlyInterestOnlyPayment,
      totalHoldingCosts,
      totalCashInvested,
    },
    phase2: {
      effectiveMonthlyRent,
      totalMonthlyExpenses,
      monthlyNoi,
      annualNoi,
      capRateOnCost,
      capRateOnArv,
    },
    phase3: {
      refinanceLoanAmount,
      existingDebtPayoff,
      netCashFromRefinance,
      monthlyPrincipalAndInterest,
    },
    verdict: {
      totalCashInvested,
      cashRecoveredAtRefi: netCashFromRefinance,
      netCapitalLeftInDeal,
      isInfiniteReturn,
      cashInPocketSurplus,
      postRefiMonthlyCashFlow,
      postRefiAnnualCashFlow,
      cashOnCashReturnPercent,
      postRefiDscr,
      dealRating,
    },
  };
}

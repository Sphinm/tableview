/**
 * Side-by-Side Loan Comparison Calculator Engine
 * 100% Client-Side Pure Mathematics (Zero Server Egress)
 */

export interface LoanParameters {
  name: string;
  loanAmount: number;
  interestRate: number; // e.g. 6.5 for 6.5%
  termYears: number; // e.g. 30
  originationPoints: number; // e.g. 1.0 for 1%
  upfrontFees: number; // e.g. $1,500
  extraMonthlyPayment: number; // e.g. $100
  // ARM (Adjustable Rate Mortgage) parameters
  isArm?: boolean; // true if this is an ARM loan
  armFixedMonths?: number; // e.g. 84 for a 7/1 ARM (7 years)
  armAdjustedRate?: number; // expected rate after adjustment, e.g. 8.0%
  armRateCap?: number; // max lifetime rate cap, e.g. 11.5%
  rollCostsIntoLoan?: boolean; // roll closing costs and points into the financed loan balance
}

export interface SingleLoanResult {
  name: string;
  loanAmount: number;
  financedLoanAmount: number;
  rollCostsIntoLoan: boolean;
  interestRate: number;
  termYears: number;
  scheduledMonthlyPayment: number;
  actualMonthlyPayment: number; // scheduled + extra
  totalMonthsScheduled: number;
  actualMonthsToPayoff: number;
  actualYearsToPayoff: number;
  totalInterestPaid: number;
  upfrontClosingCosts: number;
  totalLoanCost: number; // loan amount + interest + upfront fees
  // CFPB Loan Estimate Page 3 Metrics
  in5YearsTotalPaid: number; // total payments made over first 5 years (or loan payoff)
  in5YearsPrincipalPaid: number; // principal paid off over first 5 years
  in5YearsInterestPaid: number; // interest paid over first 5 years
  in5YearsEndingBalance: number; // loan balance at month 60
  in5YearsNetCost: number; // net cost = payments + upfront fees - principal reduction
  totalInterestPercentage: number; // TIP: total interest as % of original loan amount
  amortizationPreview: {
    year: number;
    balance: number;
    interestPaidYear: number;
    principalPaidYear: number;
    totalInterestPaidSoFar: number;
  }[];
}

export interface LoanComparisonSummary {
  loanA: SingleLoanResult;
  loanB: SingleLoanResult;
  monthlyPaymentDiff: number; // A - B (positive: B is cheaper monthly)
  totalInterestDiff: number; // A - B (positive: B has less interest)
  totalCostDiff: number; // A - B (positive: B has lower total cost)
  upfrontCostDiff: number; // A - B (positive: A costs more upfront)
  in5YearsNetCostDiff: number; // A - B (positive: B has lower 5-year net cost)
  breakEvenMonths: number | null; // months for lower-rate loan to recoup higher upfront fees
  recommendation: {
    betterOverall: 'A' | 'B' | 'TIE';
    lowerMonthly: 'A' | 'B' | 'TIE';
    lowerInterest: 'A' | 'B' | 'TIE';
    headline: string;
    subHeadline?: string;
    description: string;
  };
}

export function calculateSingleLoan(params: LoanParameters): SingleLoanResult {
  const {
    name,
    loanAmount,
    interestRate,
    termYears,
    originationPoints = 0,
    upfrontFees = 0,
    extraMonthlyPayment = 0
  } = params;

  const totalMonthsScheduled = Math.round(termYears * 12);
  const monthlyRate = interestRate > 0 ? interestRate / 100 / 12 : 0;

  const rollCosts = params.rollCostsIntoLoan ?? false;
  const upfrontClosingCosts = (loanAmount * (originationPoints / 100)) + upfrontFees;
  const financedLoanAmount = rollCosts ? loanAmount + upfrontClosingCosts : loanAmount;

  // Scheduled Monthly P&I based on financed balance
  let scheduledMonthlyPayment = 0;
  if (monthlyRate === 0) {
    scheduledMonthlyPayment = totalMonthsScheduled > 0 ? financedLoanAmount / totalMonthsScheduled : 0;
  } else {
    const factor = Math.pow(1 + monthlyRate, totalMonthsScheduled);
    scheduledMonthlyPayment = totalMonthsScheduled > 0 ? (financedLoanAmount * monthlyRate * factor) / (factor - 1) : 0;
  }

  const actualMonthlyPayment = scheduledMonthlyPayment + Math.max(0, extraMonthlyPayment);

  // Simulate monthly amortization starting from financedLoanAmount
  let balance = financedLoanAmount;
  let cumulativeInterest = 0;
  let monthsCount = 0;

  const yearlyData: {
    year: number;
    balance: number;
    interestPaidYear: number;
    principalPaidYear: number;
    totalInterestPaidSoFar: number;
  }[] = [];

  let currentYearInterest = 0;
  let currentYearPrincipal = 0;

  // CFPB 5-Year Horizon tracking
  let in5YearsTotalPaid = 0;
  let in5YearsPrincipalPaid = 0;
  let in5YearsInterestPaid = 0;
  let in5YearsEndingBalance = financedLoanAmount;

  // ARM support: track rate changes
  const isArm = params.isArm ?? false;
  const armFixedMonths = params.armFixedMonths ?? 84; // default 7 years
  const armAdjustedRate = Math.min(params.armAdjustedRate ?? interestRate, params.armRateCap ?? 100);
  let currentMonthlyRate = monthlyRate;
  let currentPayment = actualMonthlyPayment;
  let armAdjusted = false;

  while (balance > 0.01 && monthsCount < totalMonthsScheduled * 2) {
    monthsCount++;

    // ARM rate adjustment: recalculate payment when fixed period ends
    if (isArm && !armAdjusted && monthsCount > armFixedMonths && balance > 0.01) {
      currentMonthlyRate = armAdjustedRate / 100 / 12;
      const remainingMonths = totalMonthsScheduled - monthsCount + 1;
      if (currentMonthlyRate > 0 && remainingMonths > 0) {
        const factor = Math.pow(1 + currentMonthlyRate, remainingMonths);
        const newScheduled = balance * ((currentMonthlyRate * factor) / (factor - 1));
        currentPayment = newScheduled + Math.max(0, extraMonthlyPayment);
      }
      armAdjusted = true;
    }

    const monthlyInterest = balance * currentMonthlyRate;
    let payment = currentPayment;

    if (payment > balance + monthlyInterest) {
      payment = balance + monthlyInterest;
    }

    const principalPaid = payment - monthlyInterest;
    balance = Math.max(0, balance - principalPaid);
    cumulativeInterest += monthlyInterest;
    currentYearInterest += monthlyInterest;
    currentYearPrincipal += principalPaid;

    if (monthsCount <= 60) {
      in5YearsTotalPaid += payment;
      in5YearsPrincipalPaid += principalPaid;
      in5YearsInterestPaid += monthlyInterest;
      in5YearsEndingBalance = balance;
    }

    if (monthsCount % 12 === 0 || balance <= 0.01) {
      const year = Math.ceil(monthsCount / 12);
      yearlyData.push({
        year,
        balance: Math.round(balance),
        interestPaidYear: Math.round(currentYearInterest),
        principalPaidYear: Math.round(currentYearPrincipal),
        totalInterestPaidSoFar: Math.round(cumulativeInterest)
      });
      currentYearInterest = 0;
      currentYearPrincipal = 0;
    }
  }

  const actualMonthsToPayoff = monthsCount;
  const actualYearsToPayoff = Number((actualMonthsToPayoff / 12).toFixed(1));
  const totalLoanCost = rollCosts
    ? financedLoanAmount + cumulativeInterest
    : loanAmount + cumulativeInterest + upfrontClosingCosts;

  const in5YearsNetCost = Math.round(in5YearsTotalPaid + (rollCosts ? 0 : upfrontClosingCosts) - in5YearsPrincipalPaid);
  const totalInterestPercentage = loanAmount > 0
    ? Number(((cumulativeInterest / loanAmount) * 100).toFixed(2))
    : 0;

  return {
    name,
    loanAmount: Math.round(loanAmount),
    financedLoanAmount: Math.round(financedLoanAmount),
    rollCostsIntoLoan: rollCosts,
    interestRate,
    termYears,
    scheduledMonthlyPayment: Number(scheduledMonthlyPayment.toFixed(2)),
    actualMonthlyPayment: Number(actualMonthlyPayment.toFixed(2)),
    totalMonthsScheduled,
    actualMonthsToPayoff,
    actualYearsToPayoff,
    totalInterestPaid: Math.round(cumulativeInterest),
    upfrontClosingCosts: rollCosts ? 0 : Math.round(upfrontClosingCosts),
    totalLoanCost: Math.round(totalLoanCost),
    in5YearsTotalPaid: Math.round(in5YearsTotalPaid),
    in5YearsPrincipalPaid: Math.round(in5YearsPrincipalPaid),
    in5YearsInterestPaid: Math.round(in5YearsInterestPaid),
    in5YearsEndingBalance: Math.round(in5YearsEndingBalance),
    in5YearsNetCost,
    totalInterestPercentage,
    amortizationPreview: yearlyData
  };
}

export function compareLoans(loanAParams: LoanParameters, loanBParams: LoanParameters): LoanComparisonSummary {
  const loanA = calculateSingleLoan(loanAParams);
  const loanB = calculateSingleLoan(loanBParams);

  const monthlyPaymentDiff = Number((loanA.actualMonthlyPayment - loanB.actualMonthlyPayment).toFixed(2));
  const totalInterestDiff = loanA.totalInterestPaid - loanB.totalInterestPaid;
  const totalCostDiff = loanA.totalLoanCost - loanB.totalLoanCost;
  const upfrontCostDiff = loanA.upfrontClosingCosts - loanB.upfrontClosingCosts;
  const in5YearsNetCostDiff = loanA.in5YearsNetCost - loanB.in5YearsNetCost;

  // Calculate Break-Even Months (if one loan has higher upfront fees but lower monthly payments)
  let breakEvenMonths: number | null = null;
  if (loanA.upfrontClosingCosts > loanB.upfrontClosingCosts && loanB.actualMonthlyPayment > loanA.actualMonthlyPayment) {
    // Loan A costs more upfront, but saves monthly
    const monthlySavings = loanB.actualMonthlyPayment - loanA.actualMonthlyPayment;
    const feeDifference = loanA.upfrontClosingCosts - loanB.upfrontClosingCosts;
    breakEvenMonths = Math.ceil(feeDifference / monthlySavings);
  } else if (loanB.upfrontClosingCosts > loanA.upfrontClosingCosts && loanA.actualMonthlyPayment > loanB.actualMonthlyPayment) {
    // Loan B costs more upfront, but saves monthly
    const monthlySavings = loanA.actualMonthlyPayment - loanB.actualMonthlyPayment;
    const feeDifference = loanB.upfrontClosingCosts - loanA.upfrontClosingCosts;
    breakEvenMonths = Math.ceil(feeDifference / monthlySavings);
  }

  // Determine Winners
  let betterOverall: 'A' | 'B' | 'TIE' = 'TIE';
  if (totalCostDiff > 50) betterOverall = 'B';
  else if (totalCostDiff < -50) betterOverall = 'A';

  let lowerMonthly: 'A' | 'B' | 'TIE' = 'TIE';
  if (monthlyPaymentDiff > 1) lowerMonthly = 'B';
  else if (monthlyPaymentDiff < -1) lowerMonthly = 'A';

  let lowerInterest: 'A' | 'B' | 'TIE' = 'TIE';
  if (totalInterestDiff > 50) lowerInterest = 'B';
  else if (totalInterestDiff < -50) lowerInterest = 'A';

  // Helpers to clean loan names and extract (e.g. ...) notes
  const cleanLoanName = (name: string): string =>
    name.replace(/\s*\((?:e\.?g\.?|ex\.)[^)]*\)/gi, '').trim() || name;

  const extractEgNote = (name: string): string | null => {
    const match = name.match(/\(((?:e\.?g\.?|ex\.)[^)]*)\)/i);
    return match ? match[1].trim() : null;
  };

  const cleanNameA = cleanLoanName(loanA.name);
  const cleanNameB = cleanLoanName(loanB.name);
  const egA = extractEgNote(loanA.name);
  const egB = extractEgNote(loanB.name);

  // Construct Recommendation Headline & Sub-headline
  let headline = '';
  let subHeadline: string | undefined;
  let description = '';

  if (betterOverall === 'TIE') {
    headline = 'Both loan options have virtually identical total lifetime costs.';
    if (egA || egB) {
      subHeadline = egA && egB ? `(${egA} vs. ${egB.replace(/^e\.g\.\s*/i, '')})` : `(${egA || egB})`;
    }
    description = 'Compare upfront closing costs and monthly cash flow flexibility to decide.';
  } else {
    const winnerClean = betterOverall === 'A' ? cleanNameA : cleanNameB;
    const loserClean = betterOverall === 'A' ? cleanNameB : cleanNameA;
    const winnerEg = betterOverall === 'A' ? egA : egB;
    const loserEg = betterOverall === 'A' ? egB : egA;
    const costSavings = Math.abs(totalCostDiff).toLocaleString();

    headline = `${winnerClean} saves you $${costSavings} in total lifetime costs compared to ${loserClean}.`;

    if (winnerEg || loserEg) {
      if (winnerEg && loserEg) {
        subHeadline = `(${winnerEg} vs. ${loserEg.replace(/^e\.g\.\s*/i, '')})`;
      } else if (winnerEg) {
        subHeadline = `(${winnerEg})`;
      } else if (loserEg) {
        subHeadline = `(vs. ${loserEg})`;
      }
    }

    if (lowerMonthly === betterOverall) {
      description = `${winnerClean} offers both a lower monthly payment and lower overall interest over the life of the loan.`;
    } else {
      const lowerMonthlyClean = lowerMonthly === 'A' ? cleanNameA : cleanNameB;
      const monthlySavings = Math.abs(monthlyPaymentDiff).toFixed(2);
      description = `While ${lowerMonthlyClean} saves you $${monthlySavings}/month in cash flow, ${winnerClean} is mathematically cheaper in the long run because it builds equity faster and incurs significantly less interest.`;
      if (breakEvenMonths) {
        description += ` Upfront cost difference breaks even in approximately ${breakEvenMonths} months.`;
      }
    }
  }

  return {
    loanA,
    loanB,
    monthlyPaymentDiff,
    totalInterestDiff,
    totalCostDiff,
    upfrontCostDiff,
    in5YearsNetCostDiff,
    breakEvenMonths,
    recommendation: {
      betterOverall,
      lowerMonthly,
      lowerInterest,
      headline,
      subHeadline,
      description
    }
  };
}

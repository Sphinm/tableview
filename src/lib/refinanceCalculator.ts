/**
 * Mortgage Refinance Calculator Engine
 * Modeled after mortgagecalculator.org/calculators/should-i-refinance.php
 * 100% client-side, zero data egress.
 */

export interface RefinanceInputs {
  // Original Loan Details
  homePrice: number;
  downPayment: number;
  originalLoanAmount: number;
  originalTermYears: number;
  currentInterestRate: number; // e.g. 7.0 for 7.00%
  monthsAlreadyPaid: number; // e.g. 60

  // Refinanced Loan Details
  newTermYears: number; // e.g. 15 or 30
  newInterestRate: number; // e.g. 5.75
  yearsBeforeSell: number; // e.g. 7

  // Fees and Points
  discountPoints: number; // e.g. 1.0 (%)
  originationPercent: number; // e.g. 0.0 (%)
  otherClosingCosts: number; // e.g. 1200 ($)
  cashOutAmount?: number; // e.g. 0 ($)

  // Tax rates
  federalTaxRate: number; // e.g. 25 (%)
  stateTaxRate: number; // e.g. 5 (%)
}

export interface RefinanceSummary {
  // Current Loan At Refi
  currentMonthlyPayment: number;
  currentBalance: number;
  monthsRemainingOld: number;

  // New Loan
  newLoanAmount: number;
  newMonthlyPayment: number;
  monthlyPaymentSavings: number; // old - new (positive = save monthly, negative = pay more)

  // Closing Costs
  discountPointsCost: number;
  originationFeeCost: number;
  otherClosingCosts: number;
  totalClosingCosts: number;

  // Break-Even Metrics
  breakEvenMonths: number | null; // months to recoup closing costs purely via monthly payment drop
  equityBreakEvenMonths: number | null; // months until cumulative interest savings - tax loss >= closing costs

  // Horizon Analysis (e.g. 7 Years)
  horizonYears: number;
  horizonMonths: number;
  
  // Horizon Payments
  totalPaymentsOldHorizon: number;
  totalPaymentsNewHorizon: number;
  paymentSavingsHorizon: number; // old payments - new payments over horizon

  // Horizon Interest
  totalInterestOldHorizon: number;
  totalInterestNewHorizon: number;
  interestSavingsHorizon: number; // old interest - new interest

  // Horizon Taxes
  taxSavingsOld: number;
  taxSavingsNew: number;
  taxShiftLoss: number; // old tax saving - new tax saving (less interest paid means less itemized deduction)

  // Horizon Balance / Equity
  oldHorizonBalance: number;
  newHorizonBalance: number;
  balanceDifferenceAtHorizon: number; // old balance - new balance (extra equity built!)
  balanceDiffLessTaxShift: number; // balance diff - taxShiftLoss

  // Net Refinancing Benefit
  totalNetBenefit: number; // balanceDiffLessTaxShift + paymentSavingsHorizon - totalClosingCosts

  // Full Lifetime Totals
  lifetimeInterestOldRemaining: number;
  lifetimeInterestNew: number;
  lifetimeInterestSaved: number;
}

export interface RefinanceScheduleRow {
  month: number;
  year: number;
  oldPayment: number;
  oldPrincipal: number;
  oldInterest: number;
  oldBalance: number;
  newPayment: number;
  newPrincipal: number;
  newInterest: number;
  newBalance: number;
  monthlySavings: number;
  cumulativeSavings: number;
  equityDifference: number; // oldBalance - newBalance
  cumulativeNetBenefit: number;
}

export interface AnnualRefinanceRow {
  year: number;
  oldAnnualPayment: number;
  oldAnnualPrincipal: number;
  oldAnnualInterest: number;
  oldEndingBalance: number;
  newAnnualPayment: number;
  newAnnualPrincipal: number;
  newAnnualInterest: number;
  newEndingBalance: number;
  annualSavings: number;
  endingEquityDiff: number;
}

/**
 * Standard fixed-rate monthly mortgage payment formula
 */
export function calculateMonthlyPayment(principal: number, annualRatePercent: number, termYears: number): number {
  if (principal <= 0) return 0;
  const n = termYears * 12;
  if (n <= 0) return 0;
  if (annualRatePercent <= 0) return principal / n;
  const r = annualRatePercent / 100 / 12;
  const factor = Math.pow(1 + r, n);
  return (principal * (r * factor)) / (factor - 1);
}

/**
 * Calculate remaining loan balance after m elapsed months
 */
export function calculateRemainingBalance(
  originalPrincipal: number,
  annualRatePercent: number,
  termYears: number,
  monthsElapsed: number
): number {
  if (originalPrincipal <= 0) return 0;
  const totalMonths = termYears * 12;
  if (monthsElapsed >= totalMonths) return 0;
  if (monthsElapsed <= 0) return originalPrincipal;
  if (annualRatePercent <= 0) {
    return Math.max(0, originalPrincipal - (originalPrincipal / totalMonths) * monthsElapsed);
  }

  const r = annualRatePercent / 100 / 12;
  const factorTotal = Math.pow(1 + r, totalMonths);
  const factorElapsed = Math.pow(1 + r, monthsElapsed);

  const balance = originalPrincipal * ((factorTotal - factorElapsed) / (factorTotal - 1));
  return Math.max(0, balance);
}

/**
 * Main Refinance Analysis Calculation matching mortgagecalculator.org
 */
export function calculateRefinance(inputs: RefinanceInputs): RefinanceSummary {
  const {
    originalLoanAmount,
    originalTermYears,
    currentInterestRate,
    monthsAlreadyPaid,
    newTermYears,
    newInterestRate,
    yearsBeforeSell,
    discountPoints,
    originationPercent,
    otherClosingCosts,
    cashOutAmount = 0,
    federalTaxRate,
    stateTaxRate
  } = inputs;

  // 1. Current loan calculations
  const currentMonthlyPayment = calculateMonthlyPayment(originalLoanAmount, currentInterestRate, originalTermYears);
  const currentBalance = calculateRemainingBalance(originalLoanAmount, currentInterestRate, originalTermYears, monthsAlreadyPaid);
  const totalOldMonths = originalTermYears * 12;
  const monthsRemainingOld = Math.max(0, totalOldMonths - monthsAlreadyPaid);

  // 2. New refinanced loan amount & payment
  const newLoanAmount = currentBalance + (cashOutAmount > 0 ? cashOutAmount : 0);
  const newMonthlyPayment = calculateMonthlyPayment(newLoanAmount, newInterestRate, newTermYears);
  const monthlyPaymentSavings = currentMonthlyPayment - newMonthlyPayment;

  // 3. Upfront closing costs
  const discountPointsCost = newLoanAmount * (Math.max(0, discountPoints) / 100);
  const originationFeeCost = newLoanAmount * (Math.max(0, originationPercent) / 100);
  const totalClosingCosts = discountPointsCost + originationFeeCost + Math.max(0, otherClosingCosts);

  // 4. Break-even in months (Monthly payment savings vs closing costs)
  let breakEvenMonths: number | null = null;
  if (monthlyPaymentSavings > 0 && totalClosingCosts > 0) {
    breakEvenMonths = Math.ceil(totalClosingCosts / monthlyPaymentSavings);
  }

  // 5. Horizon Simulation (e.g. 7 years = 84 months)
  const horizonYears = Math.max(1, Math.min(30, yearsBeforeSell));
  const horizonMonths = horizonYears * 12;

  let oldBal = currentBalance;
  let newBal = newLoanAmount;
  const rOld = currentInterestRate / 100 / 12;
  const rNew = newInterestRate / 100 / 12;

  let totalPaymentsOldHorizon = 0;
  let totalPaymentsNewHorizon = 0;
  let totalInterestOldHorizon = 0;
  let totalInterestNewHorizon = 0;

  const totalTaxRate = (Math.max(0, federalTaxRate) + Math.max(0, stateTaxRate)) / 100;
  let equityBreakEvenMonths: number | null = null;

  for (let m = 1; m <= horizonMonths; m++) {
    // Old loan month step
    let oldInt = 0;
    let oldPrin = 0;
    let oldPay = 0;
    if (oldBal > 0.001) {
      oldInt = oldBal * rOld;
      oldPay = Math.min(currentMonthlyPayment, oldBal + oldInt);
      oldPrin = oldPay - oldInt;
      oldBal = Math.max(0, oldBal - oldPrin);
    }
    totalPaymentsOldHorizon += oldPay;
    totalInterestOldHorizon += oldInt;

    // New loan month step
    let newInt = 0;
    let newPrin = 0;
    let newPay = 0;
    if (newBal > 0.001) {
      newInt = newBal * rNew;
      newPay = Math.min(newMonthlyPayment, newBal + newInt);
      newPrin = newPay - newInt;
      newBal = Math.max(0, newBal - newPrin);
    }
    totalPaymentsNewHorizon += newPay;
    totalInterestNewHorizon += newInt;

    // Check equity & interest break-even
    if (equityBreakEvenMonths === null && totalClosingCosts > 0) {
      const cumInterestSaved = totalInterestOldHorizon - totalInterestNewHorizon;
      const netBenefitAtMonth = cumInterestSaved * (1 - totalTaxRate);
      if (netBenefitAtMonth >= totalClosingCosts) {
        equityBreakEvenMonths = m;
      }
    }
  }

  const paymentSavingsHorizon = totalPaymentsOldHorizon - totalPaymentsNewHorizon;
  const interestSavingsHorizon = totalInterestOldHorizon - totalInterestNewHorizon;

  // Tax calculations
  const taxSavingsOld = totalInterestOldHorizon * totalTaxRate;
  const taxSavingsNew = totalInterestNewHorizon * totalTaxRate;
  const taxShiftLoss = taxSavingsOld - taxSavingsNew;

  // Horizon balances
  const oldHorizonBalance = oldBal;
  const newHorizonBalance = newBal;
  const balanceDifferenceAtHorizon = oldHorizonBalance - newHorizonBalance;
  const balanceDiffLessTaxShift = balanceDifferenceAtHorizon - taxShiftLoss;

  // Total Refinancing Benefit Over Horizon Years:
  // Loan Balance Savings + Monetary Savings - Total Closing Costs
  const totalNetBenefit = balanceDiffLessTaxShift + paymentSavingsHorizon - totalClosingCosts;

  // 6. Full Lifetime Calculations
  // Total interest remaining on old loan
  let remOldBal = currentBalance;
  let lifetimeInterestOldRemaining = 0;
  for (let m = 1; m <= monthsRemainingOld; m++) {
    if (remOldBal <= 0.001) break;
    const i = remOldBal * rOld;
    const p = Math.min(currentMonthlyPayment, remOldBal + i) - i;
    lifetimeInterestOldRemaining += i;
    remOldBal = Math.max(0, remOldBal - p);
  }

  // Total interest on new loan
  let remNewBal = newLoanAmount;
  let lifetimeInterestNew = 0;
  const totalNewMonths = newTermYears * 12;
  for (let m = 1; m <= totalNewMonths; m++) {
    if (remNewBal <= 0.001) break;
    const i = remNewBal * rNew;
    const p = Math.min(newMonthlyPayment, remNewBal + i) - i;
    lifetimeInterestNew += i;
    remNewBal = Math.max(0, remNewBal - p);
  }

  const lifetimeInterestSaved = lifetimeInterestOldRemaining - lifetimeInterestNew;

  return {
    currentMonthlyPayment,
    currentBalance,
    monthsRemainingOld,
    newLoanAmount,
    newMonthlyPayment,
    monthlyPaymentSavings,
    discountPointsCost,
    originationFeeCost,
    otherClosingCosts: Math.max(0, otherClosingCosts),
    totalClosingCosts,
    breakEvenMonths,
    equityBreakEvenMonths,
    horizonYears,
    horizonMonths,
    totalPaymentsOldHorizon,
    totalPaymentsNewHorizon,
    paymentSavingsHorizon,
    totalInterestOldHorizon,
    totalInterestNewHorizon,
    interestSavingsHorizon,
    taxSavingsOld,
    taxSavingsNew,
    taxShiftLoss,
    oldHorizonBalance,
    newHorizonBalance,
    balanceDifferenceAtHorizon,
    balanceDiffLessTaxShift,
    totalNetBenefit,
    lifetimeInterestOldRemaining,
    lifetimeInterestNew,
    lifetimeInterestSaved
  };
}

/**
 * Generate monthly comparison schedule for up to horizon or max loan terms
 */
export function generateRefinanceSchedule(inputs: RefinanceInputs, summary: RefinanceSummary): RefinanceScheduleRow[] {
  const maxMonths = Math.max(summary.horizonMonths, Math.min(360, Math.max(inputs.newTermYears * 12, summary.monthsRemainingOld)));
  const rows: RefinanceScheduleRow[] = [];

  let oldBal = summary.currentBalance;
  let newBal = summary.newLoanAmount;
  const rOld = inputs.currentInterestRate / 100 / 12;
  const rNew = inputs.newInterestRate / 100 / 12;

  let cumSavings = -summary.totalClosingCosts;

  for (let m = 1; m <= maxMonths; m++) {
    // Old loan
    let oldInt = 0;
    let oldPrin = 0;
    let oldPay = 0;
    if (oldBal > 0.001) {
      oldInt = oldBal * rOld;
      oldPay = Math.min(summary.currentMonthlyPayment, oldBal + oldInt);
      oldPrin = oldPay - oldInt;
      oldBal = Math.max(0, oldBal - oldPrin);
    }

    // New loan
    let newInt = 0;
    let newPrin = 0;
    let newPay = 0;
    if (newBal > 0.001) {
      newInt = newBal * rNew;
      newPay = Math.min(summary.newMonthlyPayment, newBal + newInt);
      newPrin = newPay - newInt;
      newBal = Math.max(0, newBal - newPrin);
    }

    const monthlySav = oldPay - newPay;
    cumSavings += monthlySav;
    const equityDiff = oldBal - newBal;
    const cumNetBenefit = equityDiff + cumSavings;

    rows.push({
      month: m,
      year: Math.ceil(m / 12),
      oldPayment: oldPay,
      oldPrincipal: oldPrin,
      oldInterest: oldInt,
      oldBalance: oldBal,
      newPayment: newPay,
      newPrincipal: newPrin,
      newInterest: newInt,
      newBalance: newBal,
      monthlySavings: monthlySav,
      cumulativeSavings: cumSavings,
      equityDifference: equityDiff,
      cumulativeNetBenefit: cumNetBenefit
    });

    if (oldBal <= 0.001 && newBal <= 0.001 && m >= summary.horizonMonths) {
      break;
    }
  }

  return rows;
}

/**
 * Aggregate monthly rows to annual schedule
 */
export function getAnnualRefinanceSchedule(monthly: RefinanceScheduleRow[]): AnnualRefinanceRow[] {
  const annualMap = new Map<number, AnnualRefinanceRow>();

  for (const row of monthly) {
    const y = row.year;
    if (!annualMap.has(y)) {
      annualMap.set(y, {
        year: y,
        oldAnnualPayment: 0,
        oldAnnualPrincipal: 0,
        oldAnnualInterest: 0,
        oldEndingBalance: row.oldBalance,
        newAnnualPayment: 0,
        newAnnualPrincipal: 0,
        newAnnualInterest: 0,
        newEndingBalance: row.newBalance,
        annualSavings: 0,
        endingEquityDiff: row.equityDifference
      });
    }

    const cur = annualMap.get(y)!;
    cur.oldAnnualPayment += row.oldPayment;
    cur.oldAnnualPrincipal += row.oldPrincipal;
    cur.oldAnnualInterest += row.oldInterest;
    cur.oldEndingBalance = row.oldBalance;

    cur.newAnnualPayment += row.newPayment;
    cur.newAnnualPrincipal += row.newPrincipal;
    cur.newAnnualInterest += row.newInterest;
    cur.newEndingBalance = row.newBalance;

    cur.annualSavings += row.monthlySavings;
    cur.endingEquityDiff = row.equityDifference;
  }

  return Array.from(annualMap.values());
}

/**
 * Format CSV string for refinance comparison export
 */
export function exportRefinanceToCsv(summary: RefinanceSummary, annualRows: AnnualRefinanceRow[]): string {
  const lines: string[] = [];
  lines.push('--- TableView.dev Mortgage Refinance Comparison Report ---');
  lines.push(`Total Refinancing Benefit (${summary.horizonYears} Years),${summary.totalNetBenefit.toFixed(2)}`);
  lines.push(`Monthly Payment Before,${summary.currentMonthlyPayment.toFixed(2)}`);
  lines.push(`Monthly Payment After,${summary.newMonthlyPayment.toFixed(2)}`);
  lines.push(`Monthly Savings,${summary.monthlyPaymentSavings.toFixed(2)}`);
  lines.push(`Total Closing Costs,${summary.totalClosingCosts.toFixed(2)}`);
  lines.push(`Break-Even Horizon (Months),${summary.breakEvenMonths ?? 'N/A (Higher Payment)'}`);
  lines.push(`Remaining Balance Before Refi,${summary.currentBalance.toFixed(2)}`);
  lines.push(`Refinanced Loan Balance,${summary.newLoanAmount.toFixed(2)}`);
  lines.push(`Interest Savings Over ${summary.horizonYears} Years,${summary.interestSavingsHorizon.toFixed(2)}`);
  lines.push(`Home Equity Gain in ${summary.horizonYears} Years,${summary.balanceDifferenceAtHorizon.toFixed(2)}`);
  lines.push(`Lifetime Interest Saved,${summary.lifetimeInterestSaved.toFixed(2)}`);
  lines.push('');
  lines.push('Year,Old Annual Payment,Old Principal,Old Interest,Old Balance,New Annual Payment,New Principal,New Interest,New Balance,Annual Savings,Equity Gain');

  for (const r of annualRows) {
    lines.push(
      [
        r.year,
        r.oldAnnualPayment.toFixed(2),
        r.oldAnnualPrincipal.toFixed(2),
        r.oldAnnualInterest.toFixed(2),
        r.oldEndingBalance.toFixed(2),
        r.newAnnualPayment.toFixed(2),
        r.newAnnualPrincipal.toFixed(2),
        r.newAnnualInterest.toFixed(2),
        r.newEndingBalance.toFixed(2),
        r.annualSavings.toFixed(2),
        r.endingEquityDiff.toFixed(2)
      ].join(',')
    );
  }

  return lines.join('\n');
}

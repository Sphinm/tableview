// Financial Calculators Calculation Engine
// Replicating personal finance calculation tools from mortgagecalculator.org/calculators/index.php

export interface PersonalLoanInputs {
  loanAmount: number;
  interestRate: number; // APR %
  termMonths: number;
}

export interface PersonalLoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  monthlySchedule: Array<{
    month: number;
    startingBalance: number;
    principal: number;
    interest: number;
    endingBalance: number;
  }>;
}

export function calculatePersonalLoan(inputs: PersonalLoanInputs): PersonalLoanResult {
  const principal = Math.max(0, inputs.loanAmount);
  const n = Math.max(1, Math.round(inputs.termMonths));
  const annualRate = Math.max(0, inputs.interestRate);
  const r = annualRate / 100 / 12;

  let monthlyPayment = 0;
  if (principal > 0) {
    if (r === 0) {
      monthlyPayment = principal / n;
    } else {
      const factor = Math.pow(1 + r, n);
      monthlyPayment = principal * ((r * factor) / (factor - 1));
    }
  }

  const schedule = [];
  let balance = principal;
  let totalInterest = 0;

  for (let m = 1; m <= n; m++) {
    const startBal = balance;
    const interest = balance * r;
    totalInterest += interest;
    let p = monthlyPayment - interest;
    if (p >= balance || m === n) {
      p = balance;
      balance = 0;
    } else {
      balance -= p;
    }
    schedule.push({
      month: m,
      startingBalance: startBal,
      principal: p,
      interest: interest,
      endingBalance: Math.max(0, balance)
    });
    if (balance <= 0.005) break;
  }

  const totalPayment = schedule.reduce((sum, row) => sum + row.principal + row.interest, 0);

  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    monthlySchedule: schedule
  };
}

export interface AutoLoanInputs {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  salesTaxRate: number; // %
  interestRate: number; // APR %
  termMonths: number; // e.g. 36, 48, 60, 72
}

export interface AutoLoanResult {
  salesTaxAmount: number;
  financedAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalVehicleCost: number;
}

export function calculateAutoLoan(inputs: AutoLoanInputs): AutoLoanResult {
  const price = Math.max(0, inputs.vehiclePrice);
  const downPayment = Math.min(price, Math.max(0, inputs.downPayment));
  const tradeIn = Math.min(price, Math.max(0, inputs.tradeInValue));
  const taxRate = Math.max(0, inputs.salesTaxRate) / 100;
  
  // Tax typically applies to vehicle price minus trade-in allowance
  const taxableAmount = Math.max(0, price - tradeIn);
  const salesTaxAmount = taxableAmount * taxRate;
  
  const financedAmount = Math.max(0, price + salesTaxAmount - downPayment - tradeIn);
  const n = Math.max(1, Math.round(inputs.termMonths));
  const r = Math.max(0, inputs.interestRate) / 100 / 12;

  let monthlyPayment = 0;
  if (financedAmount > 0) {
    if (r === 0) {
      monthlyPayment = financedAmount / n;
    } else {
      const factor = Math.pow(1 + r, n);
      monthlyPayment = financedAmount * ((r * factor) / (factor - 1));
    }
  }

  const totalPayments = monthlyPayment * n;
  const totalInterest = Math.max(0, totalPayments - financedAmount);
  const totalVehicleCost = downPayment + tradeIn + totalPayments;

  return {
    salesTaxAmount,
    financedAmount,
    monthlyPayment,
    totalInterest,
    totalVehicleCost
  };
}

export interface CompoundSavingsInputs {
  initialDeposit: number;
  monthlyDeposit: number;
  annualReturnRate: number; // %
  investmentYears: number;
}

export interface CompoundSavingsYearRow {
  year: number;
  startingBalance: number;
  annualDeposit: number;
  interestEarned: number;
  endingBalance: number;
  totalContributionsToDate: number;
  totalInterestToDate: number;
}

export interface CompoundSavingsResult {
  futureValue: number;
  totalPrincipalInvested: number;
  totalInterestEarned: number;
  yearlySchedule: CompoundSavingsYearRow[];
}

export function calculateCompoundSavings(inputs: CompoundSavingsInputs): CompoundSavingsResult {
  const initial = Math.max(0, inputs.initialDeposit);
  const monthlyDeposit = Math.max(0, inputs.monthlyDeposit);
  const annualRate = Math.max(0, inputs.annualReturnRate) / 100;
  const monthlyRate = annualRate / 12;
  const totalYears = Math.max(1, Math.min(60, Math.round(inputs.investmentYears)));

  let currentBalance = initial;
  let cumulativeDeposits = initial;
  let cumulativeInterest = 0;

  const yearlySchedule: CompoundSavingsYearRow[] = [];

  for (let y = 1; y <= totalYears; y++) {
    const startBal = currentBalance;
    let yearDeposits = 0;
    let yearInterest = 0;

    for (let m = 1; m <= 12; m++) {
      currentBalance += monthlyDeposit;
      yearDeposits += monthlyDeposit;
      cumulativeDeposits += monthlyDeposit;

      const monthlyInterest = currentBalance * monthlyRate;
      currentBalance += monthlyInterest;
      yearInterest += monthlyInterest;
      cumulativeInterest += monthlyInterest;
    }

    yearlySchedule.push({
      year: y,
      startingBalance: startBal,
      annualDeposit: yearDeposits,
      interestEarned: yearInterest,
      endingBalance: currentBalance,
      totalContributionsToDate: cumulativeDeposits,
      totalInterestToDate: cumulativeInterest
    });
  }

  return {
    futureValue: currentBalance,
    totalPrincipalInvested: cumulativeDeposits,
    totalInterestEarned: cumulativeInterest,
    yearlySchedule
  };
}

export interface CreditCardPayoffInputs {
  cardBalance: number;
  interestRate: number; // APR %
  monthlyPayment: number;
}

export interface CreditCardPayoffResult {
  monthsToPayoff: number;
  yearsToPayoff: number;
  totalInterestPaid: number;
  totalAmountPaid: number;
  isPayoffPossible: boolean;
  minimumPaymentComparison: {
    months: number;
    interest: number;
  };
}

export function calculateCreditCardPayoff(inputs: CreditCardPayoffInputs): CreditCardPayoffResult {
  const balance = Math.max(0, inputs.cardBalance);
  const r = Math.max(0, inputs.interestRate) / 100 / 12;
  const payment = Math.max(0, inputs.monthlyPayment);

  // If monthly payment does not cover monthly interest, loan will never be paid off
  const monthlyInterestOnInitial = balance * r;
  if (balance > 0 && payment <= monthlyInterestOnInitial) {
    return {
      monthsToPayoff: Infinity,
      yearsToPayoff: Infinity,
      totalInterestPaid: Infinity,
      totalAmountPaid: Infinity,
      isPayoffPossible: false,
      minimumPaymentComparison: { months: 0, interest: 0 }
    };
  }

  let curBal = balance;
  let months = 0;
  let totalInterest = 0;
  const maxCap = 600; // 50 years max

  while (curBal > 0.01 && months < maxCap) {
    const interest = curBal * r;
    totalInterest += interest;
    let principal = payment - interest;
    if (principal >= curBal) {
      curBal = 0;
    } else {
      curBal -= principal;
    }
    months++;
  }

  // Minimum payment simulation (~2% of balance or $25 minimum)
  let minBal = balance;
  let minMonths = 0;
  let minTotalInterest = 0;
  while (minBal > 0.01 && minMonths < 600) {
    const interest = minBal * r;
    minTotalInterest += interest;
    const minPay = Math.max(25, minBal * 0.02);
    let principal = minPay - interest;
    if (principal <= 0) principal = 5;
    if (principal >= minBal) {
      minBal = 0;
    } else {
      minBal -= principal;
    }
    minMonths++;
  }

  return {
    monthsToPayoff: months,
    yearsToPayoff: Number((months / 12).toFixed(1)),
    totalInterestPaid: totalInterest,
    totalAmountPaid: balance + totalInterest,
    isPayoffPossible: true,
    minimumPaymentComparison: {
      months: minMonths,
      interest: minTotalInterest
    }
  };
}

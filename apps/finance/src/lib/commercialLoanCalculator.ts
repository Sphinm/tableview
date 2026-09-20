/**
 * Commercial Real Estate (CRE) Loan & Balloon Payment Calculator Engine
 * 100% Client-Side Pure Mathematics (Zero Server Egress)
 */

export interface CommercialLoanInputs {
  propertyPrice: number; // e.g. $1,500,000
  downPaymentPercent: number; // e.g. 25 (%)
  interestRate: number; // e.g. 7.25 (%)
  amortizationYears: number; // e.g. 25 (schedule duration used for monthly payments)
  balloonTermYears: number; // e.g. 5, 7, 10 or 25 (actual note maturity date)
  interestOnlyMonths?: number; // e.g. 0 or 24 months
  originationPoints?: number; // e.g. 1.0 (%)
  closingFees?: number; // e.g. $7,500 (legal, appraisal, phase 1 environmental)
  dayCountConvention?: '30/360' | 'actual/360'; // default: '30/360'
  loanProgram?: 'conventional' | 'sba7a' | 'sba504'; // default: 'conventional'
  // SBA 7(a) specifics
  sba7aGuaranteePercent?: number; // e.g. 75 or 85 (%) — portion guaranteed by SBA
  // SBA 504 specifics (CDC debenture portion)
  sba504CdcPercent?: number; // e.g. 40 (%) — portion funded by CDC/SBA debenture
  sba504CdcRate?: number; // e.g. 5.5 (%) — CDC debenture interest rate

  // Prepayment penalty modeling
  prepaymentPenaltyType?: 'none' | 'stepdown' | 'yield_maintenance'; // default: 'none'
  prepaymentPayoffMonth?: number; // e.g. 36 (early exit at month 36)
  stepdownSchedule?: number[]; // e.g. [5, 4, 3, 2, 1] percentage penalty per year
  treasuryRateAtPayoff?: number; // e.g. 4.25 (%) for yield maintenance comparison
}

export interface CommercialAmortizationMonth {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  endingBalance: number;
  isBalloonPaymentMonth?: boolean;
}

export interface CommercialAmortizationYear {
  year: number;
  paymentsTotal: number;
  principalTotal: number;
  interestTotal: number;
  endingBalance: number;
}

export interface CommercialLoanSummary {
  propertyPrice: number;
  downPaymentAmount: number;
  loanAmount: number;
  ltv: number; // loan to value %
  interestRate: number;
  amortizationYears: number;
  balloonTermYears: number;
  hasBalloonPayment: boolean;
  interestOnlyMonths: number;

  // Monthly Payments
  regularMonthlyPayment: number; // P&I based on amortization schedule
  interestOnlyMonthlyPayment: number; // during IO period (if any)

  // Balloon Maturity Figures
  balloonMaturityMonth: number;
  balloonDueAmount: number; // lump sum due at maturity
  balloonDuePercentOfOriginal: number; // % of original loan remaining at balloon
  totalPaymentsBeforeBalloon: number;
  totalPrincipalBeforeBalloon: number;
  totalInterestBeforeBalloon: number;
  
  // Upfront & Lifetime Costs
  upfrontCosts: number;
  sbaGuaranteeFee: number; // SBA 7(a) guarantee fee or SBA 504 CDC fees
  loanProgram: string;
  totalCostAtBalloonMaturity: number; // down payment + upfront costs + monthly payments + balloon lump sum

  // Prepayment Penalty Analysis
  prepaymentPenaltyType: string;
  prepaymentPayoffMonth: number;
  prepaymentPenaltyAmount: number;
  prepaymentPayoffBalance: number;
  totalPayoffWithPenalty: number;

  // Risk & Refinance Assessment
  refinanceRiskLevel: 'Low' | 'Moderate' | 'High';
  refinanceAnalysis: string;

  // Schedule Preview
  yearlySchedule: CommercialAmortizationYear[];
}

export function calculateCommercialLoan(inputs: CommercialLoanInputs): CommercialLoanSummary {
  const {
    propertyPrice,
    downPaymentPercent,
    interestRate,
    amortizationYears,
    balloonTermYears,
    interestOnlyMonths = 0,
    originationPoints = 0,
    closingFees = 0
  } = inputs;

  const downPaymentAmount = propertyPrice * (downPaymentPercent / 100);
  const loanAmount = propertyPrice - downPaymentAmount;
  const ltv = propertyPrice > 0 ? (loanAmount / propertyPrice) * 100 : 0;

  const monthlyRate = interestRate > 0 ? interestRate / 100 / 12 : 0;

  const dayCount = inputs.dayCountConvention ?? '30/360';
  // For Actual/360: daily rate = annualRate / 360, then multiply by actual days in month
  // Approximation: monthly interest = balance * annualRate / 360 * avgDaysInMonth
  // avgDaysInMonth = 365/12 ≈ 30.4167
  // This gives a factor of (365/360)/12 vs the standard 1/12
  const actual360Factor = dayCount === 'actual/360' ? 365 / 360 : 1;

  const totalAmortizationMonths = Math.round(amortizationYears * 12);
  const balloonMaturityMonth = Math.round(Math.min(balloonTermYears, amortizationYears) * 12);
  const hasBalloonPayment = balloonTermYears < amortizationYears;

  // Interest-only monthly payment
  const interestOnlyMonthlyPayment = loanAmount * monthlyRate * actual360Factor;

  // Regular scheduled P&I payment based on remaining amortization
  let regularMonthlyPayment = 0;
  const amortizationMonthsAfterIO = Math.max(1, totalAmortizationMonths - interestOnlyMonths);
  if (monthlyRate === 0) {
    regularMonthlyPayment = loanAmount / amortizationMonthsAfterIO;
  } else {
    const factor = Math.pow(1 + monthlyRate, amortizationMonthsAfterIO);
    regularMonthlyPayment = (loanAmount * monthlyRate * factor) / (factor - 1);
  }

  // Upfront fees & SBA Guarantee/CDC Fees
  const loanProgram = inputs.loanProgram ?? 'conventional';
  let sbaGuaranteeFee = 0;

  if (loanProgram === 'sba7a') {
    // SBA 7(a): guarantee fee is based on the guaranteed portion only
    // Fee tiers: loans <= $150K: 2%, $150K-$700K: 3%, > $700K: 3.5% (on guaranteed portion)
    const guaranteePercent = Math.min(90, Math.max(0, inputs.sba7aGuaranteePercent ?? 75)) / 100;
    const guaranteedPortion = loanAmount * guaranteePercent;
    let feeRate = 0.035;
    if (loanAmount <= 150000) {
      feeRate = 0.02;
    } else if (loanAmount <= 700000) {
      feeRate = 0.03;
    }
    sbaGuaranteeFee = guaranteedPortion * feeRate;
  } else if (loanProgram === 'sba504') {
    // SBA 504: CDC processing fee (~1.5%) + SBA guarantee fee (~0.5%) + funding fee (~0.25%)
    // Charged on CDC/SBA debenture portion (typically 40% of project cost)
    const cdcPercent = Math.min(50, Math.max(0, inputs.sba504CdcPercent ?? 40)) / 100;
    const cdcPortion = propertyPrice * cdcPercent;
    const cdcProcessingFee = cdcPortion * 0.015;
    const sbaGuarantee = cdcPortion * 0.005;
    const fundingFee = cdcPortion * 0.0025;
    sbaGuaranteeFee = cdcProcessingFee + sbaGuarantee + fundingFee;
  }

  const upfrontCosts = (loanAmount * (originationPoints / 100)) + closingFees + sbaGuaranteeFee;

  // Simulate monthly amortization until balloon maturity
  let balance = loanAmount;
  let totalPaymentsBeforeBalloon = 0;
  let totalPrincipalBeforeBalloon = 0;
  let totalInterestBeforeBalloon = 0;

  const yearlySchedule: {
    year: number;
    paymentsTotal: number;
    principalTotal: number;
    interestTotal: number;
    endingBalance: number;
  }[] = [];

  let currentYearPayments = 0;
  let currentYearPrincipal = 0;
  let currentYearInterest = 0;

  // Track balance at prepayment payoff month
  const penaltyType = inputs.prepaymentPenaltyType ?? 'none';
  const targetPayoffMonth = Math.min(balloonMaturityMonth, Math.max(1, inputs.prepaymentPayoffMonth ?? balloonMaturityMonth));
  let balanceAtPayoffMonth = loanAmount;

  for (let m = 1; m <= balloonMaturityMonth; m++) {
    const isIO = m <= interestOnlyMonths;
    const interest = balance * monthlyRate * actual360Factor;
    let payment = isIO ? interestOnlyMonthlyPayment : regularMonthlyPayment;

    let principal = isIO ? 0 : payment - interest;
    if (principal > balance) {
      principal = balance;
      payment = principal + interest;
    }

    balance = Math.max(0, balance - principal);
    if (m === targetPayoffMonth) {
      balanceAtPayoffMonth = balance;
    }

    totalPaymentsBeforeBalloon += payment;
    totalPrincipalBeforeBalloon += principal;
    totalInterestBeforeBalloon += interest;

    currentYearPayments += payment;
    currentYearPrincipal += principal;
    currentYearInterest += interest;

    if (m % 12 === 0 || m === balloonMaturityMonth) {
      const yearNum = Math.ceil(m / 12);
      yearlySchedule.push({
        year: yearNum,
        paymentsTotal: Math.round(currentYearPayments),
        principalTotal: Math.round(currentYearPrincipal),
        interestTotal: Math.round(currentYearInterest),
        endingBalance: Math.round(balance)
      });
      currentYearPayments = 0;
      currentYearPrincipal = 0;
      currentYearInterest = 0;
    }
  }

  const balloonDueAmount = Math.round(balance);
  const balloonDuePercentOfOriginal = loanAmount > 0 ? Number(((balloonDueAmount / loanAmount) * 100).toFixed(1)) : 0;
  const totalCostAtBalloonMaturity = Math.round(downPaymentAmount + upfrontCosts + totalPaymentsBeforeBalloon + (hasBalloonPayment ? balloonDueAmount : 0));

  // Prepayment Penalty Calculation
  let prepaymentPenaltyAmount = 0;
  if (penaltyType === 'stepdown') {
    const payoffYear = Math.ceil(targetPayoffMonth / 12);
    const schedule = inputs.stepdownSchedule ?? [5, 4, 3, 2, 1];
    const penaltyPct = schedule[payoffYear - 1] ?? 0;
    prepaymentPenaltyAmount = balanceAtPayoffMonth * (penaltyPct / 100);
  } else if (penaltyType === 'yield_maintenance') {
    const treasury = inputs.treasuryRateAtPayoff ?? 4.0;
    const lostSpread = Math.max(0, (interestRate - treasury) / 100);
    const remainingMonths = Math.max(0, balloonMaturityMonth - targetPayoffMonth);
    const lostYield = balanceAtPayoffMonth * lostSpread * (remainingMonths / 12);
    const minFloor = balanceAtPayoffMonth * 0.01; // 1% minimum fee standard
    prepaymentPenaltyAmount = Math.max(minFloor, lostYield);
  }

  const prepaymentPayoffBalance = Math.round(balanceAtPayoffMonth);
  const totalPayoffWithPenalty = Math.round(balanceAtPayoffMonth + prepaymentPenaltyAmount);

  // Risk & Refinance Assessment
  let refinanceRiskLevel: 'Low' | 'Moderate' | 'High' = 'Low';
  let refinanceAnalysis = '';

  if (!hasBalloonPayment) {
    refinanceRiskLevel = 'Low';
    refinanceAnalysis = 'Fully amortizing loan. The principal will be paid down to $0 at the end of term with zero balloon refinancing risk.';
  } else if (balloonDuePercentOfOriginal > 80) {
    refinanceRiskLevel = 'High';
    refinanceAnalysis = `High refinancing dependency: At Year ${balloonTermYears}, you will still owe $${balloonDueAmount.toLocaleString('en-US')} (${balloonDuePercentOfOriginal}% of original debt). You must refinance, sell the property, or pay cash. If market interest rates rise or commercial property values soften, qualifying for a new loan may require an equity injection.`;
  } else if (balloonDuePercentOfOriginal > 60) {
    refinanceRiskLevel = 'Moderate';
    refinanceAnalysis = `Moderate refinancing dependency: At Year ${balloonTermYears}, $${balloonDueAmount.toLocaleString('en-US')} (${balloonDuePercentOfOriginal}%) remains. You will have built solid principal equity, but refinancing terms should be planned 6–12 months prior to the balloon deadline.`;
  } else {
    refinanceRiskLevel = 'Low';
    refinanceAnalysis = `Low refinancing risk: By Year ${balloonTermYears}, more than half of the loan principal will be amortized. You will hold substantial property equity making refinancing straightforward.`;
  }

  return {
    propertyPrice: Math.round(propertyPrice),
    downPaymentAmount: Math.round(downPaymentAmount),
    loanAmount: Math.round(loanAmount),
    ltv: Number(ltv.toFixed(1)),
    interestRate,
    amortizationYears,
    balloonTermYears,
    hasBalloonPayment,
    interestOnlyMonths,
    regularMonthlyPayment: Number(regularMonthlyPayment.toFixed(2)),
    interestOnlyMonthlyPayment: Number(interestOnlyMonthlyPayment.toFixed(2)),
    balloonMaturityMonth,
    balloonDueAmount,
    balloonDuePercentOfOriginal,
    totalPaymentsBeforeBalloon: Math.round(totalPaymentsBeforeBalloon),
    totalPrincipalBeforeBalloon: Math.round(totalPrincipalBeforeBalloon),
    totalInterestBeforeBalloon: Math.round(totalInterestBeforeBalloon),
    upfrontCosts: Math.round(upfrontCosts),
    sbaGuaranteeFee: Math.round(sbaGuaranteeFee),
    loanProgram,
    totalCostAtBalloonMaturity,
    prepaymentPenaltyType: penaltyType,
    prepaymentPayoffMonth: targetPayoffMonth,
    prepaymentPenaltyAmount: Math.round(prepaymentPenaltyAmount),
    prepaymentPayoffBalance,
    totalPayoffWithPenalty,
    refinanceRiskLevel,
    refinanceAnalysis,
    yearlySchedule
  };
}

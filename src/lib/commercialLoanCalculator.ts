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
  totalCostAtBalloonMaturity: number; // down payment + upfront costs + monthly payments + balloon lump sum

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
  const totalAmortizationMonths = Math.round(amortizationYears * 12);
  const balloonMaturityMonth = Math.round(Math.min(balloonTermYears, amortizationYears) * 12);
  const hasBalloonPayment = balloonTermYears < amortizationYears;

  // Interest-only monthly payment
  const interestOnlyMonthlyPayment = loanAmount * monthlyRate;

  // Regular scheduled P&I payment based on remaining amortization
  let regularMonthlyPayment = 0;
  const amortizationMonthsAfterIO = Math.max(1, totalAmortizationMonths - interestOnlyMonths);
  if (monthlyRate === 0) {
    regularMonthlyPayment = loanAmount / amortizationMonthsAfterIO;
  } else {
    const factor = Math.pow(1 + monthlyRate, amortizationMonthsAfterIO);
    regularMonthlyPayment = (loanAmount * monthlyRate * factor) / (factor - 1);
  }

  // Upfront fees
  const upfrontCosts = (loanAmount * (originationPoints / 100)) + closingFees;

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

  for (let m = 1; m <= balloonMaturityMonth; m++) {
    const isIO = m <= interestOnlyMonths;
    const interest = balance * monthlyRate;
    let payment = isIO ? interestOnlyMonthlyPayment : regularMonthlyPayment;

    let principal = isIO ? 0 : payment - interest;
    if (principal > balance) {
      principal = balance;
      payment = principal + interest;
    }

    balance = Math.max(0, balance - principal);
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

  // Risk & Refinance Assessment
  let refinanceRiskLevel: 'Low' | 'Moderate' | 'High' = 'Low';
  let refinanceAnalysis = '';

  if (!hasBalloonPayment) {
    refinanceRiskLevel = 'Low';
    refinanceAnalysis = 'Fully amortizing loan. The principal will be paid down to $0 at the end of term with zero balloon refinancing risk.';
  } else if (balloonDuePercentOfOriginal > 80) {
    refinanceRiskLevel = 'High';
    refinanceAnalysis = `High refinancing dependency: At Year ${balloonTermYears}, you will still owe $${balloonDueAmount.toLocaleString()} (${balloonDuePercentOfOriginal}% of original debt). You must refinance, sell the property, or pay cash. If market interest rates rise or commercial property values soften, qualifying for a new loan may require an equity injection.`;
  } else if (balloonDuePercentOfOriginal > 60) {
    refinanceRiskLevel = 'Moderate';
    refinanceAnalysis = `Moderate refinancing dependency: At Year ${balloonTermYears}, $${balloonDueAmount.toLocaleString()} (${balloonDuePercentOfOriginal}%) remains. You will have built solid principal equity, but refinancing terms should be planned 6–12 months prior to the balloon deadline.`;
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
    totalCostAtBalloonMaturity,
    refinanceRiskLevel,
    refinanceAnalysis,
    yearlySchedule
  };
}

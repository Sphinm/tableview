export interface DscrInputs {
  propertyValue: number;
  downPayment: number;
  downPaymentType: 'money' | 'percent';
  interestRate: number;
  loanTermYears: number;
  isInterestOnly: boolean;
  interestOnlyYears?: number;
  monthlyRent: number;
  annualPropertyTax: number;
  annualInsurance: number;
  monthlyHoa: number;
  vacancyRate: number; // e.g. 5%
  managementFeeRate: number; // e.g. 8%
  annualMaintenanceReserve: number; // e.g. 1% of property value or fixed $
  targetDscr: number; // e.g. 1.25
}

export interface DscrResult {
  loanAmount: number;
  downPaymentAmount: number;
  ltv: number;
  monthlyPrincipalAndInterest: number;
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyHoa: number;
  monthlyPitia: number;
  
  // Income & Expenses
  grossMonthlyRent: number;
  effectiveMonthlyIncome: number;
  monthlyManagementFee: number;
  monthlyMaintenance: number;
  monthlyTotalOperatingExpenses: number;
  monthlyNetOperatingIncome: number; // NOI
  
  // DSCR Ratios
  grossDscr: number; // Gross Rent / PITIA (Standard 1-4 Unit Investor DSCR)
  netDscr: number; // NOI / Debt Service (Commercial Underwriting DSCR)
  
  // Cash Flow & Returns
  monthlyNetCashFlow: number; // Effective Income - PITIA - Mgmt - Maint
  annualNetCashFlow: number;
  cashOnCashReturn: number; // (Annual Cash Flow / Total Initial Cash Invested) * 100
  totalInitialInvestment: number; // Down payment + estimated 2.5% closing costs
  
  // Underwriting Rating
  qualificationStatus: 'prime' | 'standard' | 'low' | 'declined';
  statusLabel: string;
  statusColor: string;
  statusDescription: string;
  
  // Max loan amount supported at Target DSCR (e.g. 1.25)
  maxLoanAmountAtTargetDscr: number;
}

export interface DscrAmortizationRow {
  year: number;
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  accumulatedInterest: number;
  accumulatedPrincipal: number;
}

export function calculateDscr(inputs: DscrInputs): DscrResult {
  const propertyValue = Math.max(1, inputs.propertyValue);
  
  // Down payment calculation
  let downPaymentAmount = 0;
  if (inputs.downPaymentType === 'percent') {
    downPaymentAmount = (propertyValue * Math.min(99, Math.max(1, inputs.downPayment))) / 100;
  } else {
    downPaymentAmount = Math.min(propertyValue, Math.max(0, inputs.downPayment));
  }
  
  const loanAmount = Math.max(0, propertyValue - downPaymentAmount);
  const ltv = propertyValue > 0 ? (loanAmount / propertyValue) * 100 : 0;
  
  // Monthly rates
  const monthlyRate = inputs.interestRate / 100 / 12;
  const totalMonths = Math.max(12, inputs.loanTermYears * 12);
  
  // P&I calculation
  let monthlyPrincipalAndInterest = 0;
  if (loanAmount > 0) {
    if (inputs.isInterestOnly) {
      monthlyPrincipalAndInterest = loanAmount * monthlyRate;
    } else if (monthlyRate > 0) {
      monthlyPrincipalAndInterest =
        (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    } else {
      monthlyPrincipalAndInterest = loanAmount / totalMonths;
    }
  }
  
  // Monthly escrows
  const monthlyTaxes = inputs.annualPropertyTax / 12;
  const monthlyInsurance = inputs.annualInsurance / 12;
  const monthlyHoa = Math.max(0, inputs.monthlyHoa);
  const monthlyPitia = monthlyPrincipalAndInterest + monthlyTaxes + monthlyInsurance + monthlyHoa;
  
  // Income calculations
  const grossMonthlyRent = Math.max(0, inputs.monthlyRent);
  const vacancyDeduction = grossMonthlyRent * (Math.max(0, inputs.vacancyRate) / 100);
  const effectiveMonthlyIncome = Math.max(0, grossMonthlyRent - vacancyDeduction);
  
  const monthlyManagementFee = grossMonthlyRent * (Math.max(0, inputs.managementFeeRate) / 100);
  const monthlyMaintenance = Math.max(0, inputs.annualMaintenanceReserve / 12);
  
  const monthlyTotalOperatingExpenses =
    monthlyTaxes + monthlyInsurance + monthlyHoa + monthlyManagementFee + monthlyMaintenance;
    
  const monthlyNetOperatingIncome = effectiveMonthlyIncome - monthlyTotalOperatingExpenses;
  
  // DSCR calculation
  const grossDscr = monthlyPitia > 0 ? Number((grossMonthlyRent / monthlyPitia).toFixed(3)) : 0;
  const netDscr =
    monthlyPrincipalAndInterest > 0
      ? Number(((monthlyNetOperatingIncome * 12) / (monthlyPrincipalAndInterest * 12)).toFixed(3))
      : 0;
      
  // Net cash flow
  const monthlyNetCashFlow = effectiveMonthlyIncome - monthlyPitia - monthlyManagementFee - monthlyMaintenance;
  const annualNetCashFlow = monthlyNetCashFlow * 12;
  
  const estimatedClosingCosts = loanAmount * 0.025; // 2.5% standard lending closing costs
  const totalInitialInvestment = downPaymentAmount + estimatedClosingCosts;
  
  const cashOnCashReturn =
    totalInitialInvestment > 0 ? Number(((annualNetCashFlow / totalInitialInvestment) * 100).toFixed(2)) : 0;
    
  // Underwriting Rating
  let qualificationStatus: 'prime' | 'standard' | 'low' | 'declined' = 'standard';
  let statusLabel = 'Standard Qualification';
  let statusColor = 'text-emerald-400';
  let statusDescription = 'Cash flow is positive and meets typical secondary market DSCR requirements (1.00 - 1.24).';
  
  if (grossDscr >= 1.25) {
    qualificationStatus = 'prime';
    statusLabel = 'Prime Investor Tier (DSCR ≥ 1.25)';
    statusColor = 'text-emerald-400';
    statusDescription = 'Excellent debt coverage. Eligible for the most competitive interest rates and highest leverage (up to 80% LTV).';
  } else if (grossDscr >= 1.0) {
    qualificationStatus = 'standard';
    statusLabel = 'Qualified / Cash-Flow Positive (1.00 - 1.24)';
    statusColor = 'text-indigo-400';
    statusDescription = 'Rental income fully covers PITIA. Eligible for standard DSCR financing without personal income verification.';
  } else if (grossDscr >= 0.75) {
    qualificationStatus = 'low';
    statusLabel = 'Marginal / Below 1.0 (0.75 - 0.99)';
    statusColor = 'text-amber-400';
    statusDescription = 'Property is cash-flow negative. Some lenders allow this with higher down payments (25-30%) and 6-12 months of reserves.';
  } else {
    qualificationStatus = 'declined';
    statusLabel = 'High Risk / Underperforming (< 0.75)';
    statusColor = 'text-red-400';
    statusDescription = 'Significant rental deficit. You will need a higher down payment, interest-only terms, or renegotiated purchase price.';
  }
  
  // Calculate Maximum Loan Amount supported at target DSCR
  let maxLoanAmountAtTargetDscr = 0;
  const target = Math.max(0.5, inputs.targetDscr);
  const allowablePitia = grossMonthlyRent / target;
  const allowableDebtService = allowablePitia - monthlyTaxes - monthlyInsurance - monthlyHoa;
  
  if (allowableDebtService > 0 && monthlyRate > 0) {
    if (inputs.isInterestOnly) {
      maxLoanAmountAtTargetDscr = allowableDebtService / monthlyRate;
    } else {
      maxLoanAmountAtTargetDscr =
        (allowableDebtService * (Math.pow(1 + monthlyRate, totalMonths) - 1)) /
        (monthlyRate * Math.pow(1 + monthlyRate, totalMonths));
    }
  }
  
  return {
    loanAmount: Math.round(loanAmount),
    downPaymentAmount: Math.round(downPaymentAmount),
    ltv: Number(ltv.toFixed(1)),
    monthlyPrincipalAndInterest: Math.round(monthlyPrincipalAndInterest * 100) / 100,
    monthlyTaxes: Math.round(monthlyTaxes * 100) / 100,
    monthlyInsurance: Math.round(monthlyInsurance * 100) / 100,
    monthlyHoa: Math.round(monthlyHoa * 100) / 100,
    monthlyPitia: Math.round(monthlyPitia * 100) / 100,
    grossMonthlyRent: Math.round(grossMonthlyRent * 100) / 100,
    effectiveMonthlyIncome: Math.round(effectiveMonthlyIncome * 100) / 100,
    monthlyManagementFee: Math.round(monthlyManagementFee * 100) / 100,
    monthlyMaintenance: Math.round(monthlyMaintenance * 100) / 100,
    monthlyTotalOperatingExpenses: Math.round(monthlyTotalOperatingExpenses * 100) / 100,
    monthlyNetOperatingIncome: Math.round(monthlyNetOperatingIncome * 100) / 100,
    grossDscr,
    netDscr,
    monthlyNetCashFlow: Math.round(monthlyNetCashFlow * 100) / 100,
    annualNetCashFlow: Math.round(annualNetCashFlow * 100) / 100,
    cashOnCashReturn,
    totalInitialInvestment: Math.round(totalInitialInvestment),
    qualificationStatus,
    statusLabel,
    statusColor,
    statusDescription,
    maxLoanAmountAtTargetDscr: Math.round(Math.max(0, maxLoanAmountAtTargetDscr))
  };
}

export function generateDscrAmortization(inputs: DscrInputs): DscrAmortizationRow[] {
  const { propertyValue, downPayment, downPaymentType, interestRate, loanTermYears, isInterestOnly } = inputs;
  
  let downPaymentAmount = 0;
  if (downPaymentType === 'percent') {
    downPaymentAmount = (propertyValue * Math.min(99, Math.max(1, downPayment))) / 100;
  } else {
    downPaymentAmount = Math.min(propertyValue, Math.max(0, downPayment));
  }
  
  let balance = Math.max(0, propertyValue - downPaymentAmount);
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanTermYears * 12;
  
  let monthlyPayment = 0;
  if (balance > 0) {
    if (isInterestOnly) {
      monthlyPayment = balance * monthlyRate;
    } else if (monthlyRate > 0) {
      monthlyPayment =
        (balance * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    } else {
      monthlyPayment = balance / totalMonths;
    }
  }
  
  const schedule: DscrAmortizationRow[] = [];
  let accumulatedInterest = 0;
  let accumulatedPrincipal = 0;
  
  for (let m = 1; m <= totalMonths; m++) {
    if (balance <= 0) break;
    
    const interest = balance * monthlyRate;
    let principal = isInterestOnly ? 0 : monthlyPayment - interest;
    if (principal > balance) {
      principal = balance;
    }
    
    balance -= principal;
    accumulatedInterest += interest;
    accumulatedPrincipal += principal;
    
    schedule.push({
      year: Math.ceil(m / 12),
      month: m,
      payment: isInterestOnly ? interest : monthlyPayment,
      principal: Math.round(principal * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      accumulatedInterest: Math.round(accumulatedInterest * 100) / 100,
      accumulatedPrincipal: Math.round(accumulatedPrincipal * 100) / 100
    });
  }
  
  return schedule;
}

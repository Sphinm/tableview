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
  monthlyUtilities?: number; // e.g. $150 (water, trash, electric)
  monthlyCapexReserve?: number; // e.g. $100 (roof, HVAC capital expenditures reserve)
  monthlyOtherExpenses?: number; // e.g. $50 (landscaping, pest control, accounting)
  targetDscr: number; // e.g. 1.25
  prepaymentPenaltyStructure?: '5-4-3-2-1' | '3-2-1' | 'none'; // default: '5-4-3-2-1'
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
  monthlyUtilities: number;
  monthlyCapexReserve: number;
  monthlyOtherExpenses: number;
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

  // Reverse DSCR Rent Sizing Thresholds
  rentThresholds: DscrRentThreshold[];

  // Prepayment Penalty (PPP) Analysis
  prepaymentPenaltyStructure: '5-4-3-2-1' | '3-2-1' | 'none';
  prepaymentSchedule: DscrPppYear[];
}

export interface DscrRentThreshold {
  targetDscr: number;
  tierName: string;
  badge: string;
  description: string;
  requiredMonthlyRent: number;
  variance: number;
  isMet: boolean;
}

export interface DscrPppYear {
  year: number;
  penaltyRatePercent: number;
  estimatedLoanBalance: number;
  penaltyAmount: number;
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
  // IO period: use interestOnlyYears if provided, otherwise treat as full-term IO
  const ioMonths = inputs.isInterestOnly
    ? Math.min((inputs.interestOnlyYears ?? inputs.loanTermYears) * 12, totalMonths)
    : 0;

  let monthlyPrincipalAndInterest = 0;
  if (loanAmount > 0) {
    if (ioMonths >= totalMonths) {
      // Full-term interest-only
      monthlyPrincipalAndInterest = loanAmount * monthlyRate;
    } else if (ioMonths > 0) {
      // Partial IO: DSCR uses the IO payment during the IO period
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
  
  const monthlyManagementFee = effectiveMonthlyIncome * (Math.max(0, inputs.managementFeeRate) / 100);
  const monthlyMaintenance = Math.max(0, inputs.annualMaintenanceReserve / 12);
  const monthlyUtilities = Math.max(0, inputs.monthlyUtilities || 0);
  const monthlyCapexReserve = Math.max(0, inputs.monthlyCapexReserve || 0);
  const monthlyOtherExpenses = Math.max(0, inputs.monthlyOtherExpenses || 0);
  
  const monthlyTotalOperatingExpenses =
    monthlyTaxes +
    monthlyInsurance +
    monthlyHoa +
    monthlyManagementFee +
    monthlyMaintenance +
    monthlyUtilities +
    monthlyCapexReserve +
    monthlyOtherExpenses;
    
  const monthlyNetOperatingIncome = effectiveMonthlyIncome - monthlyTotalOperatingExpenses;
  
  // DSCR calculation
  const grossDscr = monthlyPitia > 0 ? Number((grossMonthlyRent / monthlyPitia).toFixed(3)) : 0;
  const netDscr =
    monthlyPrincipalAndInterest > 0
      ? Number(((monthlyNetOperatingIncome * 12) / (monthlyPrincipalAndInterest * 12)).toFixed(3))
      : 0;
      
  // Net cash flow (effective income minus all debt service and non-PITIA operating expenses)
  const monthlyNetCashFlow = monthlyNetOperatingIncome - monthlyPrincipalAndInterest;
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

  // Reverse DSCR Rent Thresholds
  const thresholdTiers = [
    {
      targetDscr: 1.00,
      tierName: 'Break-Even Floor',
      badge: '1.00x DSCR',
      description: 'Breakeven threshold where gross rental receipts cover 100% of PITIA carrying cost.',
    },
    {
      targetDscr: 1.15,
      tierName: 'Standard Non-QM',
      badge: '1.15x DSCR',
      description: 'Typical secondary market qualifying floor for standard DSCR mortgage programs.',
    },
    {
      targetDscr: 1.20,
      tierName: 'Preferred Agency Tier',
      badge: '1.20x DSCR',
      description: 'Standard institutional hurdle rate for competitive rates and lower reserve requirements.',
    },
    {
      targetDscr: 1.25,
      tierName: 'Prime Investor Tier',
      badge: '1.25x DSCR',
      description: 'Unlocks top-tier pricing, lowest note interest rates, and maximum 80% LTV leverage.',
    },
    {
      targetDscr: 1.35,
      tierName: 'Conservative / Cash-Rich',
      badge: '1.35x DSCR',
      description: 'Substantial cash-flow cushion against market rent declines or prolonged tenant vacancy.',
    },
  ];

  const rentThresholds: DscrRentThreshold[] = thresholdTiers.map((t) => {
    const requiredRent = monthlyPitia * t.targetDscr;
    const variance = grossMonthlyRent - requiredRent;
    return {
      targetDscr: t.targetDscr,
      tierName: t.tierName,
      badge: t.badge,
      description: t.description,
      requiredMonthlyRent: Math.round(requiredRent * 100) / 100,
      variance: Math.round(variance * 100) / 100,
      isMet: grossMonthlyRent >= requiredRent - 0.01,
    };
  });

  // Prepayment Penalty (PPP) Analysis
  const pppStructure: '5-4-3-2-1' | '3-2-1' | 'none' = inputs.prepaymentPenaltyStructure || '5-4-3-2-1';
  let penaltyRates: number[] = [];
  if (pppStructure === '5-4-3-2-1') {
    penaltyRates = [5, 4, 3, 2, 1];
  } else if (pppStructure === '3-2-1') {
    penaltyRates = [3, 2, 1];
  }

  const prepaymentSchedule: DscrPppYear[] = [];
  if (penaltyRates.length > 0 && loanAmount > 0) {
    for (let yr = 1; yr <= penaltyRates.length; yr++) {
      const rate = penaltyRates[yr - 1];
      let yrBalance = loanAmount;
      if (inputs.isInterestOnly && (inputs.interestOnlyYears ?? inputs.loanTermYears) >= yr) {
        yrBalance = loanAmount;
      } else if (monthlyRate > 0) {
        const mElapsed = yr * 12;
        const factorTotal = Math.pow(1 + monthlyRate, totalMonths);
        const factorElapsed = Math.pow(1 + monthlyRate, mElapsed);
        yrBalance = (loanAmount * (factorTotal - factorElapsed)) / (factorTotal - 1);
      }
      yrBalance = Math.max(0, yrBalance);
      prepaymentSchedule.push({
        year: yr,
        penaltyRatePercent: rate,
        estimatedLoanBalance: Math.round(yrBalance),
        penaltyAmount: Math.round((yrBalance * (rate / 100)) * 100) / 100,
      });
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
    monthlyUtilities: Math.round(monthlyUtilities * 100) / 100,
    monthlyCapexReserve: Math.round(monthlyCapexReserve * 100) / 100,
    monthlyOtherExpenses: Math.round(monthlyOtherExpenses * 100) / 100,
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
    maxLoanAmountAtTargetDscr: Math.round(Math.max(0, maxLoanAmountAtTargetDscr)),
    rentThresholds,
    prepaymentPenaltyStructure: pppStructure,
    prepaymentSchedule
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
  
  // IO period calculation
  const ioMonths = isInterestOnly
    ? Math.min((inputs.interestOnlyYears ?? loanTermYears) * 12, totalMonths)
    : 0;
  
  // Pre-compute amortizing payment (used after IO period ends)
  let amortPayment = 0;
  // We'll recalculate this when IO period ends based on remaining balance
  
  const schedule: DscrAmortizationRow[] = [];
  let accumulatedInterest = 0;
  let accumulatedPrincipal = 0;
  
  for (let m = 1; m <= totalMonths; m++) {
    if (balance <= 0) break;
    
    const interest = balance * monthlyRate;
    let principal: number;
    let payment: number;
    
    if (m <= ioMonths) {
      // Interest-only period
      principal = 0;
      payment = interest;
    } else {
      // Amortizing period
      if (m === ioMonths + 1 || (ioMonths === 0 && m === 1)) {
        // (Re)calculate amortizing payment based on current balance and remaining months
        const remainingMonths = totalMonths - m + 1;
        if (monthlyRate > 0) {
          amortPayment =
            (balance * (monthlyRate * Math.pow(1 + monthlyRate, remainingMonths))) /
            (Math.pow(1 + monthlyRate, remainingMonths) - 1);
        } else {
          amortPayment = balance / remainingMonths;
        }
      }
      payment = amortPayment;
      principal = payment - interest;
      if (principal > balance) {
        principal = balance;
      }
    }
    
    balance -= principal;
    accumulatedInterest += interest;
    accumulatedPrincipal += principal;
    
    schedule.push({
      year: Math.ceil(m / 12),
      month: m,
      payment: Math.round(payment * 100) / 100,
      principal: Math.round(principal * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      accumulatedInterest: Math.round(accumulatedInterest * 100) / 100,
      accumulatedPrincipal: Math.round(accumulatedPrincipal * 100) / 100
    });
  }
  
  return schedule;
}

/**
 * Rental Property Cash Flow & Cap Rate Underwriting Engine
 * 
 * Complies with institutional commercial and residential real estate standards:
 * 1. NOI strictly excludes mortgage debt service (principal & interest).
 * 2. Cap Rate = NOI / Purchase Price * 100%.
 * 3. Cash-on-Cash Return = Annual Pre-Tax Cash Flow / Total Initial Cash Invested * 100%.
 * 4. Multi-year wealth accumulation models: cash flow + principal paydown + appreciation.
 */

export interface RentalPropertyInput {
  // Acquisition
  purchasePrice: number;
  closingCostPercent: number; // e.g. 2.5%
  rehabBudget: number; // upfront repairs/renovations

  // Financing
  downPaymentPercent: number; // e.g. 20% (or 100% for all-cash)
  interestRate: number; // annual interest rate %
  loanTermYears: number; // e.g. 30

  // Income
  monthlyRent: number;
  otherMonthlyIncome: number; // laundry, parking, storage, pet rent
  vacancyRate: number; // vacancy & credit loss % (e.g. 5%)
  annualRentGrowthPercent?: number; // default 3%

  // Operating Expenses (OpEx)
  propertyTaxAnnual: number;
  insuranceAnnual: number;
  hoaMonthly: number;
  managementFeePercent: number; // % of collected rent (EGI)
  maintenancePercent: number; // % of gross rent for ongoing repairs
  capexMonthly: number; // capital expenditure reserve ($/mo) for big items (roof/HVAC)
  utilitiesMonthly: number; // owner-paid utilities ($/mo)
  otherExpensesAnnual: number; // accounting, legal, permits, landscaping
  annualExpenseInflationPercent?: number; // default 2.5%
  annualAppreciationPercent?: number; // default 3.5%
}

export interface ExpenseBreakdownItem {
  name: string;
  monthly: number;
  annual: number;
  percentOfEGI: number;
}

export interface YearProjection {
  year: number;
  propertyValue: number;
  loanBalance: number;
  equity: number;
  grossRentAnnual: number;
  effectiveGrossIncome: number;
  operatingExpenses: number;
  noi: number;
  debtService: number;
  netCashFlowAnnual: number;
  cumulativeCashFlow: number;
  totalReturn: number; // cumulative cash flow + (propertyValue - purchasePrice) - loanPaydown
  cashOnCash: number;
}

export interface RentalPropertyOutput {
  // Acquisition Summary
  purchasePrice: number;
  closingCosts: number;
  rehabBudget: number;
  totalAcquisitionCost: number;
  downPaymentAmount: number;
  loanAmount: number;
  totalInitialCashRequired: number;

  // Financing Details
  monthlyDebtService: number;
  annualDebtService: number;

  // Income Summary
  grossScheduledRentMonthly: number;
  grossScheduledIncomeMonthly: number;
  grossScheduledIncomeAnnual: number;
  vacancyLossAnnual: number;
  effectiveGrossIncomeAnnual: number;
  effectiveGrossIncomeMonthly: number;

  // Operating Expenses (OpEx)
  expenses: ExpenseBreakdownItem[];
  totalOperatingExpensesAnnual: number;
  totalOperatingExpensesMonthly: number;
  operatingExpenseRatio: number; // OER = OpEx / EGI * 100%

  // Cash Flow & Yield Metrics
  noiAnnual: number;
  noiMonthly: number;
  netCashFlowAnnual: number;
  netCashFlowMonthly: number;
  capRate: number; // NOI / Purchase Price * 100%
  cashOnCashReturn: number; // Net Cash Flow / Total Cash Invested * 100%
  grossRentMultiplier: number; // Purchase Price / GSI Annual
  breakEvenOccupancyRate: number; // (OpEx + Debt Service) / GSI * 100%
  dscr: number | null; // NOI / Debt Service (null if all-cash)

  // Rules of Thumb & Screening Benchmarks
  rentToPriceRatio: number; // Monthly Rent / Purchase Price * 100%
  meets1PercentRule: boolean;
  ruleOf50EstimatedExpenses: number; // GSI * 50%
  ruleOf50Variance: number; // Actual OpEx - 50% Benchmark

  // Deal Health Verdict
  verdict: {
    status: 'excellent' | 'good' | 'fair' | 'caution' | 'negative';
    title: string;
    summary: string;
    pros: string[];
    risks: string[];
  };

  // 10-Year Projections
  projections: YearProjection[];
}

/**
 * Calculates monthly mortgage payment (principal and interest).
 */
export function calculateMonthlyMortgage(loanAmount: number, annualRatePercent: number, termYears: number): number {
  if (loanAmount <= 0 || termYears <= 0) return 0;
  if (annualRatePercent <= 0) return loanAmount / (termYears * 12);

  const monthlyRate = annualRatePercent / 100 / 12;
  const numPayments = termYears * 12;
  const factor = Math.pow(1 + monthlyRate, numPayments);
  return (loanAmount * monthlyRate * factor) / (factor - 1);
}

/**
 * Calculates remaining loan balance after n monthly payments.
 */
export function calculateRemainingBalance(
  loanAmount: number,
  annualRatePercent: number,
  termYears: number,
  monthsPaid: number
): number {
  if (loanAmount <= 0) return 0;
  if (monthsPaid >= termYears * 12) return 0;
  if (annualRatePercent <= 0) {
    const monthlyPayment = loanAmount / (termYears * 12);
    return Math.max(0, loanAmount - monthlyPayment * monthsPaid);
  }

  const r = annualRatePercent / 100 / 12;
  const n = termYears * 12;
  const p = monthsPaid;
  const factorN = Math.pow(1 + r, n);
  const factorP = Math.pow(1 + r, p);

  return Math.max(0, (loanAmount * (factorN - factorP)) / (factorN - 1));
}

/**
 * Main Underwriting Calculation
 */
export function calculateRentalProperty(input: RentalPropertyInput): RentalPropertyOutput {
  const purchasePrice = Math.max(0, input.purchasePrice);
  const closingCosts = purchasePrice * (Math.max(0, input.closingCostPercent) / 100);
  const rehabBudget = Math.max(0, input.rehabBudget);
  const totalAcquisitionCost = purchasePrice + closingCosts + rehabBudget;

  // Financing
  const downPaymentPercent = Math.min(100, Math.max(0, input.downPaymentPercent));
  const downPaymentAmount = purchasePrice * (downPaymentPercent / 100);
  const isCashPurchase = downPaymentPercent >= 100;
  const loanAmount = isCashPurchase ? 0 : Math.max(0, purchasePrice - downPaymentAmount);
  const totalInitialCashRequired = downPaymentAmount + closingCosts + rehabBudget;

  const monthlyDebtService = isCashPurchase
    ? 0
    : calculateMonthlyMortgage(loanAmount, input.interestRate, input.loanTermYears);
  const annualDebtService = monthlyDebtService * 12;

  // Gross Scheduled Income
  const grossScheduledRentMonthly = Math.max(0, input.monthlyRent);
  const otherIncomeMonthly = Math.max(0, input.otherMonthlyIncome);
  const grossScheduledIncomeMonthly = grossScheduledRentMonthly + otherIncomeMonthly;
  const grossScheduledIncomeAnnual = grossScheduledIncomeMonthly * 12;

  // Vacancy
  const vacancyRate = Math.min(100, Math.max(0, input.vacancyRate));
  const vacancyLossAnnual = grossScheduledIncomeAnnual * (vacancyRate / 100);
  const effectiveGrossIncomeAnnual = Math.max(0, grossScheduledIncomeAnnual - vacancyLossAnnual);
  const effectiveGrossIncomeMonthly = effectiveGrossIncomeAnnual / 12;

  // Operating Expenses
  const propertyTaxAnnual = Math.max(0, input.propertyTaxAnnual);
  const insuranceAnnual = Math.max(0, input.insuranceAnnual);
  const hoaAnnual = Math.max(0, input.hoaMonthly) * 12;
  const managementFeeAnnual = effectiveGrossIncomeAnnual * (Math.max(0, input.managementFeePercent) / 100);
  const maintenanceAnnual = grossScheduledIncomeAnnual * (Math.max(0, input.maintenancePercent) / 100);
  const capexAnnual = Math.max(0, input.capexMonthly) * 12;
  const utilitiesAnnual = Math.max(0, input.utilitiesMonthly) * 12;
  const otherExpensesAnnual = Math.max(0, input.otherExpensesAnnual);

  const totalOperatingExpensesAnnual =
    propertyTaxAnnual +
    insuranceAnnual +
    hoaAnnual +
    managementFeeAnnual +
    maintenanceAnnual +
    capexAnnual +
    utilitiesAnnual +
    otherExpensesAnnual;

  const totalOperatingExpensesMonthly = totalOperatingExpensesAnnual / 12;
  const operatingExpenseRatio =
    effectiveGrossIncomeAnnual > 0 ? (totalOperatingExpensesAnnual / effectiveGrossIncomeAnnual) * 100 : 0;

  const expenses: ExpenseBreakdownItem[] = [
    {
      name: 'Property Taxes',
      monthly: propertyTaxAnnual / 12,
      annual: propertyTaxAnnual,
      percentOfEGI: effectiveGrossIncomeAnnual > 0 ? (propertyTaxAnnual / effectiveGrossIncomeAnnual) * 100 : 0
    },
    {
      name: 'Property Insurance',
      monthly: insuranceAnnual / 12,
      annual: insuranceAnnual,
      percentOfEGI: effectiveGrossIncomeAnnual > 0 ? (insuranceAnnual / effectiveGrossIncomeAnnual) * 100 : 0
    },
    {
      name: 'Property Management',
      monthly: managementFeeAnnual / 12,
      annual: managementFeeAnnual,
      percentOfEGI: effectiveGrossIncomeAnnual > 0 ? (managementFeeAnnual / effectiveGrossIncomeAnnual) * 100 : 0
    },
    {
      name: 'Maintenance & Repairs',
      monthly: maintenanceAnnual / 12,
      annual: maintenanceAnnual,
      percentOfEGI: effectiveGrossIncomeAnnual > 0 ? (maintenanceAnnual / effectiveGrossIncomeAnnual) * 100 : 0
    },
    {
      name: 'CapEx Reserves',
      monthly: capexAnnual / 12,
      annual: capexAnnual,
      percentOfEGI: effectiveGrossIncomeAnnual > 0 ? (capexAnnual / effectiveGrossIncomeAnnual) * 100 : 0
    },
    {
      name: 'HOA Fees',
      monthly: hoaAnnual / 12,
      annual: hoaAnnual,
      percentOfEGI: effectiveGrossIncomeAnnual > 0 ? (hoaAnnual / effectiveGrossIncomeAnnual) * 100 : 0
    },
    {
      name: 'Utilities (Owner-Paid)',
      monthly: utilitiesAnnual / 12,
      annual: utilitiesAnnual,
      percentOfEGI: effectiveGrossIncomeAnnual > 0 ? (utilitiesAnnual / effectiveGrossIncomeAnnual) * 100 : 0
    },
    {
      name: 'Other Operating Expenses',
      monthly: otherExpensesAnnual / 12,
      annual: otherExpensesAnnual,
      percentOfEGI: effectiveGrossIncomeAnnual > 0 ? (otherExpensesAnnual / effectiveGrossIncomeAnnual) * 100 : 0
    }
  ].filter((e) => e.annual > 0);

  // Core Real Estate Underwriting Metrics
  // 1. NOI strictly excludes mortgage debt service
  const noiAnnual = effectiveGrossIncomeAnnual - totalOperatingExpensesAnnual;
  const noiMonthly = noiAnnual / 12;

  // 2. Net Cash Flow
  const netCashFlowAnnual = noiAnnual - annualDebtService;
  const netCashFlowMonthly = netCashFlowAnnual / 12;

  // 3. Cap Rate
  const capRate = purchasePrice > 0 ? (noiAnnual / purchasePrice) * 100 : 0;

  // 4. Cash on Cash Return
  const cashOnCashReturn =
    totalInitialCashRequired > 0 ? (netCashFlowAnnual / totalInitialCashRequired) * 100 : 0;

  // 5. Gross Rent Multiplier (GRM)
  const grossRentMultiplier =
    grossScheduledIncomeAnnual > 0 ? purchasePrice / grossScheduledIncomeAnnual : 0;

  // 6. Break-Even Occupancy
  const breakEvenOccupancyRate =
    grossScheduledIncomeAnnual > 0
      ? ((totalOperatingExpensesAnnual + annualDebtService) / grossScheduledIncomeAnnual) * 100
      : 0;

  // 7. DSCR
  const dscr = annualDebtService > 0 ? noiAnnual / annualDebtService : null;

  // Rules of Thumb
  const rentToPriceRatio = purchasePrice > 0 ? (grossScheduledRentMonthly / purchasePrice) * 100 : 0;
  const meets1PercentRule = rentToPriceRatio >= 1.0;
  const ruleOf50EstimatedExpenses = grossScheduledIncomeAnnual * 0.5;
  const ruleOf50Variance = totalOperatingExpensesAnnual - ruleOf50EstimatedExpenses;

  // Health Verdict Analysis
  let status: 'excellent' | 'good' | 'fair' | 'caution' | 'negative' = 'fair';
  let title = 'Moderate Cash Flow Deal';
  let summary = 'This property generates positive cash flow with modest returns.';
  const pros: string[] = [];
  const risks: string[] = [];

  if (cashOnCashReturn >= 10 && capRate >= 7.5) {
    status = 'excellent';
    title = 'High-Yield Strong Cash Flow Asset';
    summary = 'Outstanding cash-on-cash yield and healthy capitalization rate with strong margin of safety.';
    pros.push(`High Cash-on-Cash Return: ${cashOnCashReturn.toFixed(1)}%`);
    pros.push(`Robust Cap Rate: ${capRate.toFixed(1)}%`);
  } else if (cashOnCashReturn >= 6 && capRate >= 5.5) {
    status = 'good';
    title = 'Solid Investment Grade Asset';
    summary = 'Property covers operating expenses and debt service with consistent positive monthly cash flow.';
    pros.push(`Healthy Cash-on-Cash Return: ${cashOnCashReturn.toFixed(1)}%`);
    pros.push(`Institutional Cap Rate: ${capRate.toFixed(1)}%`);
  } else if (cashOnCashReturn > 0) {
    status = 'fair';
    title = 'Modest Cash Flow Asset';
    summary = 'The property produces positive cash flow, though cash-on-cash yield is conservative.';
    pros.push(`Positive Monthly Cash Flow: $${Math.round(netCashFlowMonthly).toLocaleString()}/mo`);
  } else if (cashOnCashReturn === 0) {
    status = 'caution';
    title = 'Break-Even Asset';
    summary = 'Cash flow exactly balances expenses and debt service. Highly vulnerable to unexpected repairs or vacancies.';
    risks.push('Zero cash flow margin for unexpected maintenance');
  } else {
    status = 'negative';
    title = 'Negative Cash Flow Warning';
    summary = 'Operating expenses and debt service exceed rental revenue. The investor must subsidize the asset out-of-pocket.';
    risks.push(`Monthly Deficit: -$${Math.abs(Math.round(netCashFlowMonthly)).toLocaleString()}/mo`);
  }

  if (meets1PercentRule) {
    pros.push(`Passes the 1% Rule (${rentToPriceRatio.toFixed(2)}% monthly rent to price)`);
  } else {
    risks.push(`Below 1% Rule threshold (${rentToPriceRatio.toFixed(2)}% rent to price)`);
  }

  if (dscr !== null) {
    if (dscr >= 1.25) {
      pros.push(`Strong DSCR (${dscr.toFixed(2)}x) satisfies institutional lender debt covenants`);
    } else if (dscr < 1.0) {
      risks.push(`DSCR is below 1.0x (${dscr.toFixed(2)}x) — loan payments exceed net operating income`);
    } else {
      risks.push(`Tight DSCR (${dscr.toFixed(2)}x) below the typical 1.20x-1.25x commercial threshold`);
    }
  }

  if (operatingExpenseRatio > 55) {
    risks.push(`High Operating Expense Ratio (${operatingExpenseRatio.toFixed(1)}% of gross revenue)`);
  }

  const verdict = {
    status,
    title,
    summary,
    pros,
    risks
  };

  // 10-Year Projections
  const rentGrowth = (input.annualRentGrowthPercent ?? 3) / 100;
  const expenseInflation = (input.annualExpenseInflationPercent ?? 2.5) / 100;
  const appreciation = (input.annualAppreciationPercent ?? 3.5) / 100;

  const projections: YearProjection[] = [];
  let cumulativeCashFlow = 0;

  for (let year = 1; year <= 10; year++) {
    const propertyValue = purchasePrice * Math.pow(1 + appreciation, year);
    const loanBalance = isCashPurchase
      ? 0
      : calculateRemainingBalance(loanAmount, input.interestRate, input.loanTermYears, year * 12);
    const equity = propertyValue - loanBalance;

    const grossRentAnnual = grossScheduledIncomeAnnual * Math.pow(1 + rentGrowth, year - 1);
    const effectiveGrossIncome = grossRentAnnual * (1 - vacancyRate / 100);
    const operatingExpenses = totalOperatingExpensesAnnual * Math.pow(1 + expenseInflation, year - 1);
    const yearNoi = effectiveGrossIncome - operatingExpenses;
    const netCashFlowAnnual = yearNoi - annualDebtService;

    cumulativeCashFlow += netCashFlowAnnual;
    const capitalAppreciation = propertyValue - purchasePrice;
    const loanPaydown = loanAmount - loanBalance;
    const totalReturn = cumulativeCashFlow + capitalAppreciation + loanPaydown;
    const yearCashOnCash = totalInitialCashRequired > 0 ? (netCashFlowAnnual / totalInitialCashRequired) * 100 : 0;

    projections.push({
      year,
      propertyValue: Math.round(propertyValue),
      loanBalance: Math.round(loanBalance),
      equity: Math.round(equity),
      grossRentAnnual: Math.round(grossRentAnnual),
      effectiveGrossIncome: Math.round(effectiveGrossIncome),
      operatingExpenses: Math.round(operatingExpenses),
      noi: Math.round(yearNoi),
      debtService: Math.round(annualDebtService),
      netCashFlowAnnual: Math.round(netCashFlowAnnual),
      cumulativeCashFlow: Math.round(cumulativeCashFlow),
      totalReturn: Math.round(totalReturn),
      cashOnCash: Number(yearCashOnCash.toFixed(2))
    });
  }

  return {
    purchasePrice,
    closingCosts,
    rehabBudget,
    totalAcquisitionCost,
    downPaymentAmount,
    loanAmount,
    totalInitialCashRequired,

    monthlyDebtService,
    annualDebtService,

    grossScheduledRentMonthly,
    grossScheduledIncomeMonthly,
    grossScheduledIncomeAnnual,
    vacancyLossAnnual,
    effectiveGrossIncomeAnnual,
    effectiveGrossIncomeMonthly,

    expenses,
    totalOperatingExpensesAnnual,
    totalOperatingExpensesMonthly,
    operatingExpenseRatio,

    noiAnnual,
    noiMonthly,
    netCashFlowAnnual,
    netCashFlowMonthly,
    capRate,
    cashOnCashReturn,
    grossRentMultiplier,
    breakEvenOccupancyRate,
    dscr,

    rentToPriceRatio,
    meets1PercentRule,
    ruleOf50EstimatedExpenses,
    ruleOf50Variance,

    verdict,
    projections
  };
}

/**
 * Standard Presets for Quick Investor Scenario Analysis
 */
export const RENTAL_PRESETS = [
  {
    id: 'turnkey-sfh',
    name: 'Turnkey Single-Family',
    tagline: 'Suburban Class B SFH with conventional financing',
    input: {
      purchasePrice: 350000,
      closingCostPercent: 2.5,
      rehabBudget: 5000,
      downPaymentPercent: 20,
      interestRate: 6.875,
      loanTermYears: 30,
      monthlyRent: 2600,
      otherMonthlyIncome: 50,
      vacancyRate: 5,
      propertyTaxAnnual: 4200,
      insuranceAnnual: 1400,
      hoaMonthly: 45,
      managementFeePercent: 8,
      maintenancePercent: 5,
      capexMonthly: 150,
      utilitiesMonthly: 0,
      otherExpensesAnnual: 300,
      annualRentGrowthPercent: 3,
      annualExpenseInflationPercent: 2.5,
      annualAppreciationPercent: 3.5
    } as RentalPropertyInput
  },
  {
    id: 'multifamily-duplex',
    name: 'Multifamily Duplex',
    tagline: '2-unit income property with scale advantages',
    input: {
      purchasePrice: 650000,
      closingCostPercent: 2.5,
      rehabBudget: 15000,
      downPaymentPercent: 25,
      interestRate: 7.125,
      loanTermYears: 30,
      monthlyRent: 5400,
      otherMonthlyIncome: 200,
      vacancyRate: 6,
      propertyTaxAnnual: 8200,
      insuranceAnnual: 2400,
      hoaMonthly: 0,
      managementFeePercent: 7,
      maintenancePercent: 6,
      capexMonthly: 250,
      utilitiesMonthly: 120,
      otherExpensesAnnual: 500,
      annualRentGrowthPercent: 3,
      annualExpenseInflationPercent: 2.5,
      annualAppreciationPercent: 3.5
    } as RentalPropertyInput
  },
  {
    id: 'midwest-cash-cow',
    name: 'Midwest High-Yield',
    tagline: 'High rent-to-price ratio cash cow meeting the 1% rule',
    input: {
      purchasePrice: 180000,
      closingCostPercent: 3.0,
      rehabBudget: 8000,
      downPaymentPercent: 20,
      interestRate: 7.25,
      loanTermYears: 30,
      monthlyRent: 2100,
      otherMonthlyIncome: 50,
      vacancyRate: 8,
      propertyTaxAnnual: 2600,
      insuranceAnnual: 1100,
      hoaMonthly: 0,
      managementFeePercent: 10,
      maintenancePercent: 8,
      capexMonthly: 150,
      utilitiesMonthly: 0,
      otherExpensesAnnual: 250,
      annualRentGrowthPercent: 2.5,
      annualExpenseInflationPercent: 2.5,
      annualAppreciationPercent: 2.5
    } as RentalPropertyInput
  },
  {
    id: 'all-cash-purchase',
    name: 'All-Cash Acquisition',
    tagline: '100% equity purchase: Cap Rate equals Cash-on-Cash Return',
    input: {
      purchasePrice: 400000,
      closingCostPercent: 2.0,
      rehabBudget: 0,
      downPaymentPercent: 100,
      interestRate: 0,
      loanTermYears: 30,
      monthlyRent: 3200,
      otherMonthlyIncome: 0,
      vacancyRate: 5,
      propertyTaxAnnual: 5200,
      insuranceAnnual: 1600,
      hoaMonthly: 0,
      managementFeePercent: 8,
      maintenancePercent: 5,
      capexMonthly: 200,
      utilitiesMonthly: 0,
      otherExpensesAnnual: 400,
      annualRentGrowthPercent: 3,
      annualExpenseInflationPercent: 2.5,
      annualAppreciationPercent: 3.5
    } as RentalPropertyInput
  }
];

export interface MortgageInputs {
  homeValue: number;
  downPayment: number;
  downPaymentType: 'money' | 'percent';
  interestRate: number; // e.g. 6.48 for 6.48%
  loanTermYears: number; // e.g. 30
  startMonth: number; // 1-12
  startYear: number; // e.g. 2026
  propertyTaxYearly: number; // e.g. 3000
  pmiRate: number; // e.g. 0.5%
  homeInsuranceYearly: number; // e.g. 1500
  monthlyHoa: number; // e.g. 0
  loanType: 'conventional' | 'fha' | 'va' | 'usda';
  buyOrRefi: 'buy' | 'refi';
  extraMonthlyPrincipal?: number;
  extraLumpSumAmount?: number;
  extraLumpSumMonth?: number;
}

export interface MortgageSummary {
  loanAmount: number;
  downPaymentAmount: number;
  downPaymentPercent: number;
  monthlyPrincipalAndInterest: number;
  monthlyPropertyTax: number;
  monthlyHomeInsurance: number;
  monthlyPmi: number;
  isPmiRequired: boolean;
  monthlyHoa: number;
  totalMonthlyPayment: number;
  totalInterestPaid: number;
  totalPropertyTaxPaid: number;
  totalHomeInsurancePaid: number;
  totalPmiPaid: number;
  totalHoaPaid: number;
  totalOfAllPayments: number;
  annualPaymentAmount: number;
  payoffMonth: number;
  payoffYear: number;
  payoffDateString: string;
  totalMonths: number;
}

export interface AmortizationRow {
  monthIndex: number; // 1, 2, ...
  year: number;
  month: number;
  monthName: string;
  startingBalance: number;
  principalPaid: number;
  interestPaid: number;
  propertyTax: number;
  homeInsurance: number;
  pmi: number;
  hoa: number;
  totalPayment: number;
  endingBalance: number;
  totalInterestToDate: number;
  totalPrincipalToDate: number;
}

export interface AnnualAmortizationRow {
  year: number;
  startingBalance: number;
  principalPaid: number;
  interestPaid: number;
  propertyTax: number;
  homeInsurance: number;
  pmi: number;
  hoa: number;
  totalPayment: number;
  endingBalance: number;
  totalInterestToDate: number;
  totalPrincipalToDate: number;
}

export interface AmortizationChartPoint {
  label: string;
  year: number;
  monthIndex: number;
  endingBalance: number;
  totalInterestToDate: number;
  totalPrincipalToDate: number;
}

export interface BiweeklyComparison {
  monthlyPayment: number;
  biweeklyPayment: number;
  monthlyTotalInterest: number;
  biweeklyTotalInterest: number;
  interestSaved: number;
  monthlyMonths: number;
  biweeklyMonths: number;
  monthsSaved: number;
  yearsSaved: number;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function getMonthName(monthNum: number): string {
  return MONTH_NAMES[(monthNum - 1) % 12] || 'Jan';
}

/**
 * Calculates core mortgage metrics and repayment summary
 */
export function calculateMortgage(inputs: MortgageInputs): MortgageSummary {
  const homeValue = Math.max(0, inputs.homeValue);
  
  let downPaymentAmount = 0;
  let downPaymentPercent = 0;

  if (inputs.downPaymentType === 'percent') {
    downPaymentPercent = Math.min(100, Math.max(0, inputs.downPayment));
    downPaymentAmount = (homeValue * downPaymentPercent) / 100;
  } else {
    downPaymentAmount = Math.min(homeValue, Math.max(0, inputs.downPayment));
    downPaymentPercent = homeValue > 0 ? (downPaymentAmount / homeValue) * 100 : 0;
  }

  const loanAmount = Math.max(0, homeValue - downPaymentAmount);
  const totalMonths = Math.max(1, Math.round(inputs.loanTermYears * 12));
  const annualRate = Math.max(0, inputs.interestRate);
  const monthlyRate = annualRate / 100 / 12;

  // Monthly Principal & Interest
  let monthlyPrincipalAndInterest = 0;
  if (loanAmount > 0) {
    if (monthlyRate === 0) {
      monthlyPrincipalAndInterest = loanAmount / totalMonths;
    } else {
      const factor = Math.pow(1 + monthlyRate, totalMonths);
      monthlyPrincipalAndInterest = loanAmount * ((monthlyRate * factor) / (factor - 1));
    }
  }

  const monthlyPropertyTax = Math.max(0, inputs.propertyTaxYearly) / 12;
  const monthlyHomeInsurance = Math.max(0, inputs.homeInsuranceYearly) / 12;
  const monthlyHoa = Math.max(0, inputs.monthlyHoa);

  // === Mortgage Insurance / Funding Fees by Loan Type ===
  let isPmiRequired = false;
  let monthlyMI = 0;
  let upfrontFee = 0; // FHA UFMIP, VA Funding Fee, USDA Guarantee Fee

  if (inputs.loanType === 'conventional') {
    isPmiRequired = downPaymentPercent < 20;
    monthlyMI = isPmiRequired ? (loanAmount * (Math.max(0, inputs.pmiRate) / 100)) / 12 : 0;
  } else if (inputs.loanType === 'fha') {
    // FHA UFMIP: 1.75% of base loan (typically financed into the loan)
    upfrontFee = loanAmount * 0.0175;
    // FHA Annual MIP: 0.55% for most borrowers (> 15yr term, LTV > 95%)
    // MIP lasts the life of the loan if down payment < 10%, otherwise 11 years
    const annualMipRate = 0.0055;
    monthlyMI = ((loanAmount + upfrontFee) * annualMipRate) / 12;
    isPmiRequired = true;
  } else if (inputs.loanType === 'va') {
    // VA Funding Fee: varies by down payment and usage
    // First use: 0% down = 2.15%, 5-9.99% down = 1.5%, 10%+ down = 1.25%
    // Subsequent use: 0% down = 3.3%, 5-9.99% down = 1.5%, 10%+ down = 1.25%
    let fundingFeeRate: number;
    if (downPaymentPercent >= 10) {
      fundingFeeRate = 0.0125;
    } else if (downPaymentPercent >= 5) {
      fundingFeeRate = 0.015;
    } else {
      fundingFeeRate = 0.0215; // first use default
    }
    upfrontFee = loanAmount * fundingFeeRate;
    // VA has NO monthly mortgage insurance
    monthlyMI = 0;
    isPmiRequired = false;
  } else if (inputs.loanType === 'usda') {
    // USDA Upfront Guarantee Fee: 1% of loan amount
    upfrontFee = loanAmount * 0.01;
    // USDA Annual Fee: 0.35% of remaining loan balance
    const annualFeeRate = 0.0035;
    monthlyMI = ((loanAmount + upfrontFee) * annualFeeRate) / 12;
    isPmiRequired = true;
  }

  const monthlyPmi = monthlyMI;

  const totalMonthlyPayment =
    monthlyPrincipalAndInterest + monthlyPropertyTax + monthlyHomeInsurance + monthlyPmi + monthlyHoa;

  // Generate amortization to compute exact totals (including dynamic PMI drop-off at 80% LTV)
  const schedule = generateAmortizationSchedule(inputs);
  
  let totalInterestPaid = 0;
  let totalPmiPaid = 0;
  let totalPropertyTaxPaid = 0;
  let totalHomeInsurancePaid = 0;
  let totalHoaPaid = 0;
  let totalOfAllPayments = 0;

  for (const row of schedule) {
    totalInterestPaid += row.interestPaid;
    totalPmiPaid += row.pmi;
    totalPropertyTaxPaid += row.propertyTax;
    totalHomeInsurancePaid += row.homeInsurance;
    totalHoaPaid += row.hoa;
    totalOfAllPayments += row.totalPayment;
  }

  const payoffDate = schedule.length > 0 ? schedule[schedule.length - 1] : null;
  const payoffMonth = payoffDate ? payoffDate.month : inputs.startMonth;
  const payoffYear = payoffDate ? payoffDate.year : inputs.startYear + inputs.loanTermYears;
  const payoffDateString = `${getMonthName(payoffMonth)} ${payoffYear}`;

  return {
    loanAmount,
    downPaymentAmount,
    downPaymentPercent,
    monthlyPrincipalAndInterest,
    monthlyPropertyTax,
    monthlyHomeInsurance,
    monthlyPmi,
    isPmiRequired,
    monthlyHoa,
    totalMonthlyPayment,
    totalInterestPaid,
    totalPropertyTaxPaid,
    totalHomeInsurancePaid,
    totalPmiPaid,
    totalHoaPaid,
    totalOfAllPayments,
    annualPaymentAmount: totalMonthlyPayment * 12,
    payoffMonth,
    payoffYear,
    payoffDateString,
    totalMonths: schedule.length
  };
}

/**
 * Generates month-by-month full amortization schedule
 */
export function generateAmortizationSchedule(
  inputs: MortgageInputs,
  extraMonthlyPrincipal: number = 0,
  extraLumpSumAmount: number = 0,
  extraLumpSumMonth: number = 0
): AmortizationRow[] {
  const homeValue = Math.max(0, inputs.homeValue);
  let downPaymentAmount = 0;

  if (inputs.downPaymentType === 'percent') {
    const downPaymentPercent = Math.min(100, Math.max(0, inputs.downPayment));
    downPaymentAmount = (homeValue * downPaymentPercent) / 100;
  } else {
    downPaymentAmount = Math.min(homeValue, Math.max(0, inputs.downPayment));
  }

  let balance = Math.max(0, homeValue - downPaymentAmount);
  if (balance <= 0) return [];

  const totalNominalMonths = Math.max(1, Math.round(inputs.loanTermYears * 12));
  const monthlyRate = Math.max(0, inputs.interestRate) / 100 / 12;

  let baseMonthlyPI = 0;
  if (monthlyRate === 0) {
    baseMonthlyPI = balance / totalNominalMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, totalNominalMonths);
    baseMonthlyPI = balance * ((monthlyRate * factor) / (factor - 1));
  }

  const monthlyTax = Math.max(0, inputs.propertyTaxYearly) / 12;
  const monthlyInsurance = Math.max(0, inputs.homeInsuranceYearly) / 12;
  const monthlyHoa = Math.max(0, inputs.monthlyHoa);

  const monthlyExtra = extraMonthlyPrincipal || inputs.extraMonthlyPrincipal || 0;
  const lumpSum = extraLumpSumAmount || inputs.extraLumpSumAmount || 0;
  const lumpSumMonth = extraLumpSumMonth || inputs.extraLumpSumMonth || 0;

  // PMI threshold: 80% of original home value
  const pmiThreshold = homeValue * 0.8;
  // Government loan MI for amortization schedule
  const downPaymentPercent = homeValue > 0 ? (downPaymentAmount / homeValue) * 100 : 0;
  let initialPmiRequired = false;
  let initialPmiAmount = 0;
  let fhaMipLifeOfLoan = false;
  let fhaMipMonths = 0; // 0 = life of loan

  if (inputs.loanType === 'conventional') {
    initialPmiRequired = (downPaymentAmount / (homeValue || 1)) < 0.2;
    const monthlyPmiRate = (Math.max(0, inputs.pmiRate) / 100) / 12;
    initialPmiAmount = initialPmiRequired ? (homeValue - downPaymentAmount) * monthlyPmiRate : 0;
  } else if (inputs.loanType === 'fha') {
    initialPmiRequired = true;
    const baseLoan = homeValue - downPaymentAmount;
    const ufmip = baseLoan * 0.0175;
    initialPmiAmount = ((baseLoan + ufmip) * 0.0055) / 12;
    fhaMipLifeOfLoan = downPaymentPercent < 10;
    fhaMipMonths = fhaMipLifeOfLoan ? 0 : 11 * 12; // 11 years if dp >= 10%
  } else if (inputs.loanType === 'usda') {
    initialPmiRequired = true;
    const baseLoan = homeValue - downPaymentAmount;
    const guaranteeFee = baseLoan * 0.01;
    initialPmiAmount = ((baseLoan + guaranteeFee) * 0.0035) / 12;
  }
  // VA: no monthly MI, so initialPmiRequired stays false

  const schedule: AmortizationRow[] = [];
  let currentMonth = inputs.startMonth;
  let currentYear = inputs.startYear;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;

  let monthIndex = 1;
  const maxSafetyIterations = 1200; // 100 years cap

  while (balance > 0.005 && monthIndex <= maxSafetyIterations) {
    const startingBalance = balance;
    const interestPayment = balance * monthlyRate;
    cumulativeInterest += interestPayment;

    let additionalPrincipal = monthlyExtra;
    if (lumpSum > 0 && monthIndex === lumpSumMonth) {
      additionalPrincipal += lumpSum;
    }

    let principalPayment = baseMonthlyPI - interestPayment + additionalPrincipal;

    // Handle last month balance cutoff
    if (principalPayment >= balance) {
      principalPayment = balance;
      balance = 0;
    } else {
      balance = balance - principalPayment;
    }

    cumulativePrincipal += principalPayment;

    let pmiPayment = 0;
    if (initialPmiRequired) {
      if (inputs.loanType === 'conventional') {
        // Conventional: drops at 80% LTV
        pmiPayment = startingBalance > pmiThreshold ? initialPmiAmount : 0;
      } else if (inputs.loanType === 'fha') {
        // FHA: life of loan if dp < 10%, else 11 years
        if (fhaMipLifeOfLoan) {
          pmiPayment = initialPmiAmount;
        } else {
          pmiPayment = monthIndex <= fhaMipMonths ? initialPmiAmount : 0;
        }
      } else if (inputs.loanType === 'usda') {
        // USDA: annual fee for life of loan
        pmiPayment = initialPmiAmount;
      }
    }
    const totalPayment = principalPayment + interestPayment + monthlyTax + monthlyInsurance + pmiPayment + monthlyHoa;

    schedule.push({
      monthIndex,
      year: currentYear,
      month: currentMonth,
      monthName: getMonthName(currentMonth),
      startingBalance,
      principalPaid: principalPayment,
      interestPaid: interestPayment,
      propertyTax: monthlyTax,
      homeInsurance: monthlyInsurance,
      pmi: pmiPayment,
      hoa: monthlyHoa,
      totalPayment,
      endingBalance: Math.max(0, balance),
      totalInterestToDate: cumulativeInterest,
      totalPrincipalToDate: cumulativePrincipal
    });

    monthIndex++;
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }

  return schedule;
}

/**
 * Aggregates monthly schedule into annual rows for concise breakdown
 */
export function getAnnualAmortizationSchedule(monthlySchedule: AmortizationRow[]): AnnualAmortizationRow[] {
  const annualMap = new Map<number, AnnualAmortizationRow>();

  for (const row of monthlySchedule) {
    if (!annualMap.has(row.year)) {
      annualMap.set(row.year, {
        year: row.year,
        startingBalance: row.startingBalance,
        principalPaid: 0,
        interestPaid: 0,
        propertyTax: 0,
        homeInsurance: 0,
        pmi: 0,
        hoa: 0,
        totalPayment: 0,
        endingBalance: row.endingBalance,
        totalInterestToDate: row.totalInterestToDate,
        totalPrincipalToDate: row.totalPrincipalToDate
      });
    }

    const annual = annualMap.get(row.year)!;
    annual.principalPaid += row.principalPaid;
    annual.interestPaid += row.interestPaid;
    annual.propertyTax += row.propertyTax;
    annual.homeInsurance += row.homeInsurance;
    annual.pmi += row.pmi;
    annual.hoa += row.hoa;
    annual.totalPayment += row.totalPayment;
    annual.endingBalance = row.endingBalance;
    annual.totalInterestToDate = row.totalInterestToDate;
    annual.totalPrincipalToDate = row.totalPrincipalToDate;
  }

  return Array.from(annualMap.values());
}

/**
 * Extracts annual checkpoints for responsive SVG charts
 */
export function getAmortizationChartData(schedule: AmortizationRow[]): AmortizationChartPoint[] {
  if (schedule.length === 0) return [];
  const points: AmortizationChartPoint[] = [];

  const first = schedule[0];
  points.push({
    label: `Start (${first.year})`,
    year: first.year,
    monthIndex: 0,
    endingBalance: Math.round(first.startingBalance),
    totalInterestToDate: 0,
    totalPrincipalToDate: 0
  });

  for (let i = 0; i < schedule.length; i++) {
    const row = schedule[i];
    if (row.monthIndex % 12 === 0 || i === schedule.length - 1) {
      points.push({
        label: `Yr ${Math.round(row.monthIndex / 12)} (${row.year})`,
        year: row.year,
        monthIndex: row.monthIndex,
        endingBalance: Math.round(row.endingBalance),
        totalInterestToDate: Math.round(row.totalInterestToDate),
        totalPrincipalToDate: Math.round(row.totalPrincipalToDate)
      });
    }
  }

  return points;
}

/**
 * Simulates Bi-Weekly accelerated payments vs Standard Monthly payments
 */
export function calculateBiweeklyComparison(inputs: MortgageInputs): BiweeklyComparison {
  const monthlySummary = calculateMortgage(inputs);
  const monthlyPI = monthlySummary.monthlyPrincipalAndInterest;
  const biweeklyPI = monthlyPI / 2; // Bi-weekly half-payment, paid 26 times/year = 13 full payments

  // Monthly schedule
  const monthlySchedule = generateAmortizationSchedule(inputs);
  const monthlyTotalInterest = monthlySchedule.reduce((sum, r) => sum + r.interestPaid, 0);
  const monthlyMonths = monthlySchedule.length;

  // Bi-weekly simulation: effectively adds (1 monthly payment / 12) extra principal each month
  const extraMonthlyPrincipal = monthlyPI / 12;
  const biweeklySchedule = generateAmortizationSchedule(inputs, extraMonthlyPrincipal);
  const biweeklyTotalInterest = biweeklySchedule.reduce((sum, r) => sum + r.interestPaid, 0);
  const biweeklyMonths = biweeklySchedule.length;

  const interestSaved = Math.max(0, monthlyTotalInterest - biweeklyTotalInterest);
  const monthsSaved = Math.max(0, monthlyMonths - biweeklyMonths);
  const yearsSaved = Number((monthsSaved / 12).toFixed(1));

  return {
    monthlyPayment: monthlySummary.totalMonthlyPayment,
    biweeklyPayment: biweeklyPI + (monthlySummary.monthlyPropertyTax + monthlySummary.monthlyHomeInsurance + monthlySummary.monthlyHoa) / 2,
    monthlyTotalInterest,
    biweeklyTotalInterest,
    interestSaved,
    monthlyMonths,
    biweeklyMonths,
    monthsSaved,
    yearsSaved
  };
}

/**
 * Generates CSV string from amortization schedule for instant download
 */
export function exportAmortizationToCsv(schedule: AmortizationRow[]): string {
  const headers = [
    'Month #',
    'Year',
    'Month',
    'Starting Balance',
    'Principal Paid',
    'Interest Paid',
    'Property Tax',
    'Home Insurance',
    'PMI',
    'HOA',
    'Total Payment',
    'Ending Balance',
    'Cumulative Interest'
  ];

  const rows = schedule.map(row => [
    row.monthIndex,
    row.year,
    row.monthName,
    row.startingBalance.toFixed(2),
    row.principalPaid.toFixed(2),
    row.interestPaid.toFixed(2),
    row.propertyTax.toFixed(2),
    row.homeInsurance.toFixed(2),
    row.pmi.toFixed(2),
    row.hoa.toFixed(2),
    row.totalPayment.toFixed(2),
    row.endingBalance.toFixed(2),
    row.totalInterestToDate.toFixed(2)
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

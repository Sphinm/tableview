/**
 * Salary to Hourly & Overtime Calculator Engine
 * Pure mathematical conversion, zero annual tax maintenance, 100% in-browser.
 */

export type FilingStatus = 'single' | 'married' | 'head_of_household';

export interface TaxInputs {
  filingStatus?: FilingStatus; // default: 'single'
  state?: string; // 2-letter postal code (e.g. 'CA', 'TX', 'NY', 'FL')
  customStateTaxRate?: number; // optional custom rate overriding state preset
  preTaxDeductionsAnnual?: number; // 401(k), HSA, health insurance
}

export interface TakeHomePaySummary {
  grossAnnualIncome: number;
  filingStatus: FilingStatus;
  state: string;

  // Deductions
  standardDeduction: number;
  preTaxDeductions: number;
  federalTaxableIncome: number;

  // Tax Breakdown
  federalIncomeTax: number;
  stateIncomeTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  additionalMedicareTax: number;
  totalFicaTax: number;
  totalTax: number;

  // Effective Tax Rates (%)
  effectiveFederalRate: number;
  effectiveStateRate: number;
  effectiveFicaRate: number;
  effectiveTotalTaxRate: number;

  // Net Take-Home Pay Across Pay Periods
  annualTakeHome: number;
  monthlyTakeHome: number;
  biWeeklyTakeHome: number; // 26 pay periods
  semiMonthlyTakeHome: number; // 24 pay periods
  weeklyTakeHome: number;
  hourlyTakeHome: number;
}

export interface SalaryInputs {
  mode: 'salary-to-hourly' | 'hourly-to-salary';
  amount: number; // annual salary in salary-to-hourly mode, or hourly rate in hourly-to-salary mode
  hoursPerWeek?: number; // default 40
  weeksPerYear?: number; // default 52
  paidHolidaysDays?: number; // default 10
  paidVacationDays?: number; // default 15
  overtimeHoursPerWeek?: number; // default 0
  taxInputs?: TaxInputs; // optional tax inputs for take-home pay estimation
}

export interface SalaryBreakdownItem {
  period: 'Hourly' | 'Daily (8h)' | 'Weekly (40h)' | 'Bi-Weekly (26x)' | 'Semi-Monthly (24x)' | 'Monthly (12x)' | 'Annual';
  amount: number;
  formatted: string;
  notes: string;
}

export interface SalarySummary {
  mode: 'salary-to-hourly' | 'hourly-to-salary';
  inputAmount: number;
  hoursPerWeek: number;
  weeksPerYear: number;
  totalAnnualHours: number;

  // Standard Wages Matrix
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  biWeeklyRate: number;
  semiMonthlyRate: number;
  monthlyRate: number;
  annualSalary: number;

  // Overtime Earnings (FLSA Fair Labor Standards Act compliant 1.5x / 2.0x)
  overtimeRate15x: number; // 1.5x (Time-and-a-half)
  overtimeRate20x: number; // 2.0x (Double time / Holiday)
  overtimeHoursPerWeek: number;
  annualOvertimePay: number;
  totalAnnualCompensationWithOvertime: number;

  // Paid Time Off (PTO) Value
  totalPtoDays: number;
  totalPtoHours: number;
  ptoMonetaryValue: number;

  breakdownTable: SalaryBreakdownItem[];
  takeHomePay?: TakeHomePaySummary;
}

export function calculateSalary(inputs: SalaryInputs): SalarySummary {
  const {
    mode,
    amount,
    hoursPerWeek = 40,
    weeksPerYear = 52,
    paidHolidaysDays = 10,
    paidVacationDays = 15,
    overtimeHoursPerWeek = 0
  } = inputs;

  const validHoursPerWeek = Math.max(1, hoursPerWeek);
  const validWeeksPerYear = Math.max(1, Math.min(52, weeksPerYear));
  const totalAnnualHours = validHoursPerWeek * validWeeksPerYear;
  const hoursPerDay = validHoursPerWeek / 5;

  let hourlyRate = 0;
  let annualSalary = 0;

  if (mode === 'salary-to-hourly') {
    annualSalary = Math.max(0, amount);
    hourlyRate = totalAnnualHours > 0 ? annualSalary / totalAnnualHours : 0;
  } else {
    hourlyRate = Math.max(0, amount);
    annualSalary = hourlyRate * totalAnnualHours;
  }

  // Calculate standard timeframes
  const dailyRate = hourlyRate * hoursPerDay;
  const weeklyRate = hourlyRate * validHoursPerWeek;
  const biWeeklyRate = annualSalary / 26; // 26 pay periods per standard US payroll year
  const semiMonthlyRate = annualSalary / 24; // 24 pay periods (twice per month, e.g. 1st & 15th)
  const monthlyRate = annualSalary / 12;

  // Overtime rates
  const overtimeRate15x = Number((hourlyRate * 1.5).toFixed(2));
  const overtimeRate20x = Number((hourlyRate * 2.0).toFixed(2));
  const annualOvertimePay = Math.max(0, overtimeHoursPerWeek) * overtimeRate15x * validWeeksPerYear;
  const totalAnnualCompensationWithOvertime = annualSalary + annualOvertimePay;

  // PTO
  const totalPtoDays = paidHolidaysDays + paidVacationDays;
  const totalPtoHours = totalPtoDays * hoursPerDay;
  const ptoMonetaryValue = Math.round(totalPtoHours * hourlyRate);

  const formatUsd = (val: number) => `$${Number(val.toFixed(2)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const breakdownTable: SalaryBreakdownItem[] = [
    {
      period: 'Hourly',
      amount: Number(hourlyRate.toFixed(2)),
      formatted: formatUsd(hourlyRate),
      notes: `Based on ${validHoursPerWeek} hrs/week`
    },
    {
      period: 'Daily (8h)',
      amount: Number(dailyRate.toFixed(2)),
      formatted: formatUsd(dailyRate),
      notes: `${hoursPerDay.toFixed(1)} standard working hours`
    },
    {
      period: 'Weekly (40h)',
      amount: Number(weeklyRate.toFixed(2)),
      formatted: formatUsd(weeklyRate),
      notes: '1 standard calendar work week'
    },
    {
      period: 'Bi-Weekly (26x)',
      amount: Number(biWeeklyRate.toFixed(2)),
      formatted: formatUsd(biWeeklyRate),
      notes: 'Every two weeks (most common US payroll cycle)'
    },
    {
      period: 'Semi-Monthly (24x)',
      amount: Number(semiMonthlyRate.toFixed(2)),
      formatted: formatUsd(semiMonthlyRate),
      notes: 'Twice per month (typically 1st and 15th)'
    },
    {
      period: 'Monthly (12x)',
      amount: Number(monthlyRate.toFixed(2)),
      formatted: formatUsd(monthlyRate),
      notes: '12 pay periods per year'
    },
    {
      period: 'Annual',
      amount: Math.round(annualSalary),
      formatted: `$${Math.round(annualSalary).toLocaleString('en-US')}`,
      notes: `${totalAnnualHours.toLocaleString('en-US')} standard working hours/year`
    }
  ];

  return {
    mode,
    inputAmount: amount,
    hoursPerWeek: validHoursPerWeek,
    weeksPerYear: validWeeksPerYear,
    totalAnnualHours,
    hourlyRate: Number(hourlyRate.toFixed(2)),
    dailyRate: Number(dailyRate.toFixed(2)),
    weeklyRate: Number(weeklyRate.toFixed(2)),
    biWeeklyRate: Number(biWeeklyRate.toFixed(2)),
    semiMonthlyRate: Number(semiMonthlyRate.toFixed(2)),
    monthlyRate: Number(monthlyRate.toFixed(2)),
    annualSalary: Math.round(annualSalary),
    overtimeRate15x,
    overtimeRate20x,
    overtimeHoursPerWeek,
    annualOvertimePay: Math.round(annualOvertimePay),
    totalAnnualCompensationWithOvertime: Math.round(totalAnnualCompensationWithOvertime),
    totalPtoDays,
    totalPtoHours,
    ptoMonetaryValue,
    breakdownTable,
    takeHomePay: inputs.taxInputs ? calculateTakeHomePay(totalAnnualCompensationWithOvertime, inputs.taxInputs) : undefined
  };
}

const STATE_TAX_RATES: Record<string, number> = {
  AL: 4.5, AK: 0, AZ: 2.5, AR: 4.4, CA: 8.0, CO: 4.4, CT: 5.5, DE: 5.5,
  FL: 0, GA: 5.39, HI: 7.5, ID: 5.695, IL: 4.95, IN: 3.05, IA: 3.8, KS: 5.2,
  KY: 4.0, LA: 4.25, ME: 6.5, MD: 5.0, MA: 5.0, MI: 4.25, MN: 7.5, MS: 4.7,
  MO: 4.8, MT: 5.9, NE: 5.84, NV: 0, NH: 0, NJ: 6.37, NM: 4.9, NY: 6.5,
  NC: 4.5, ND: 2.5, OH: 3.5, OK: 4.75, OR: 8.75, PA: 3.07, RI: 4.75, SC: 6.4,
  SD: 0, TN: 0, TX: 0, UT: 4.65, VT: 6.6, VA: 5.75, WA: 0, WV: 5.12,
  WI: 5.3, WY: 0, DC: 6.5
};

export function calculateTakeHomePay(
  grossAnnualIncome: number,
  taxInputs: TaxInputs = {}
): TakeHomePaySummary {
  const filingStatus = taxInputs.filingStatus ?? 'single';
  const stateCode = (taxInputs.state ?? 'None').toUpperCase();
  const preTaxDeductions = Math.max(0, taxInputs.preTaxDeductionsAnnual ?? 0);

  // 2025 Standard Deductions (IRS Rev. Proc. 2024-40)
  let standardDeduction = 15000;
  if (filingStatus === 'married') {
    standardDeduction = 30000;
  } else if (filingStatus === 'head_of_household') {
    standardDeduction = 22500;
  }

  // Taxable income
  const grossAfterPreTax = Math.max(0, grossAnnualIncome - preTaxDeductions);
  const federalTaxableIncome = Math.max(0, grossAfterPreTax - standardDeduction);

  // 2025 Federal Brackets
  type Bracket = [number, number, number]; // [floor, ceiling, rate]
  let brackets: Bracket[] = [];

  if (filingStatus === 'married') {
    brackets = [
      [0, 23850, 0.10],
      [23850, 96950, 0.12],
      [96950, 206700, 0.22],
      [206700, 394600, 0.24],
      [394600, 501050, 0.32],
      [501050, 751600, 0.35],
      [751600, Infinity, 0.37]
    ];
  } else if (filingStatus === 'head_of_household') {
    brackets = [
      [0, 17000, 0.10],
      [17000, 64850, 0.12],
      [64850, 103350, 0.22],
      [103350, 197300, 0.24],
      [197300, 250500, 0.32],
      [250500, 626350, 0.35],
      [626350, Infinity, 0.37]
    ];
  } else {
    // Single
    brackets = [
      [0, 11925, 0.10],
      [11925, 48475, 0.12],
      [48475, 103350, 0.22],
      [103350, 197300, 0.24],
      [197300, 250525, 0.32],
      [250525, 626350, 0.35],
      [626350, Infinity, 0.37]
    ];
  }

  let federalIncomeTax = 0;
  for (const [floor, cap, rate] of brackets) {
    if (federalTaxableIncome > floor) {
      const taxableChunk = Math.min(federalTaxableIncome, cap) - floor;
      federalIncomeTax += taxableChunk * rate;
    }
  }

  // FICA Taxes
  // Social Security: 6.2% up to $176,100 wage base limit (2025)
  const ssWageLimit = 176100;
  const socialSecurityTax = Math.min(grossAnnualIncome, ssWageLimit) * 0.062;

  // Medicare: 1.45% plus 0.9% additional over threshold ($200k single/HOH, $250k married)
  const baseMedicareTax = grossAnnualIncome * 0.0145;
  const additionalMedicareThreshold = filingStatus === 'married' ? 250000 : 200000;
  const additionalMedicareTax =
    grossAnnualIncome > additionalMedicareThreshold
      ? (grossAnnualIncome - additionalMedicareThreshold) * 0.009
      : 0;
  const medicareTax = baseMedicareTax + additionalMedicareTax;
  const totalFicaTax = socialSecurityTax + medicareTax;

  // State Income Tax
  let stateRate = 0;
  if (taxInputs.customStateTaxRate !== undefined) {
    stateRate = Math.max(0, taxInputs.customStateTaxRate);
  } else if (stateCode in STATE_TAX_RATES) {
    stateRate = STATE_TAX_RATES[stateCode];
  }
  const stateIncomeTax = federalTaxableIncome * (stateRate / 100);

  const totalTax = federalIncomeTax + stateIncomeTax + totalFicaTax;
  const annualTakeHome = Math.max(0, grossAnnualIncome - totalTax - preTaxDeductions);

  const effectiveFederalRate = grossAnnualIncome > 0 ? (federalIncomeTax / grossAnnualIncome) * 100 : 0;
  const effectiveStateRate = grossAnnualIncome > 0 ? (stateIncomeTax / grossAnnualIncome) * 100 : 0;
  const effectiveFicaRate = grossAnnualIncome > 0 ? (totalFicaTax / grossAnnualIncome) * 100 : 0;
  const effectiveTotalTaxRate = grossAnnualIncome > 0 ? (totalTax / grossAnnualIncome) * 100 : 0;

  return {
    grossAnnualIncome: Math.round(grossAnnualIncome),
    filingStatus,
    state: stateCode,
    standardDeduction: Math.round(standardDeduction),
    preTaxDeductions: Math.round(preTaxDeductions),
    federalTaxableIncome: Math.round(federalTaxableIncome),
    federalIncomeTax: Math.round(federalIncomeTax * 100) / 100,
    stateIncomeTax: Math.round(stateIncomeTax * 100) / 100,
    socialSecurityTax: Math.round(socialSecurityTax * 100) / 100,
    medicareTax: Math.round(medicareTax * 100) / 100,
    additionalMedicareTax: Math.round(additionalMedicareTax * 100) / 100,
    totalFicaTax: Math.round(totalFicaTax * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    effectiveFederalRate: Number(effectiveFederalRate.toFixed(2)),
    effectiveStateRate: Number(effectiveStateRate.toFixed(2)),
    effectiveFicaRate: Number(effectiveFicaRate.toFixed(2)),
    effectiveTotalTaxRate: Number(effectiveTotalTaxRate.toFixed(2)),
    annualTakeHome: Math.round(annualTakeHome * 100) / 100,
    monthlyTakeHome: Math.round((annualTakeHome / 12) * 100) / 100,
    biWeeklyTakeHome: Math.round((annualTakeHome / 26) * 100) / 100,
    semiMonthlyTakeHome: Math.round((annualTakeHome / 24) * 100) / 100,
    weeklyTakeHome: Math.round((annualTakeHome / 52) * 100) / 100,
    hourlyTakeHome: Number((annualTakeHome / (40 * 52)).toFixed(2))
  };
}

/**
 * Salary to Hourly & Overtime Calculator Engine
 * Pure mathematical conversion, zero annual tax maintenance, 100% in-browser.
 */

export interface SalaryInputs {
  mode: 'salary-to-hourly' | 'hourly-to-salary';
  amount: number; // annual salary in salary-to-hourly mode, or hourly rate in hourly-to-salary mode
  hoursPerWeek?: number; // default 40
  weeksPerYear?: number; // default 52
  paidHolidaysDays?: number; // default 10
  paidVacationDays?: number; // default 15
  overtimeHoursPerWeek?: number; // default 0
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
      formatted: `$${Math.round(annualSalary).toLocaleString()}`,
      notes: `${totalAnnualHours.toLocaleString()} standard working hours/year`
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
    breakdownTable
  };
}

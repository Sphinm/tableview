import { describe, it, expect } from 'bun:test';
import { calculateSalary, type SalaryInputs } from '../salaryCalculator';

describe('Salary to Hourly & Overtime Calculator Engine', () => {
  it('converts standard $85,000 annual salary to hourly and periods accurately', () => {
    const inputs: SalaryInputs = {
      mode: 'salary-to-hourly',
      amount: 85000,
      hoursPerWeek: 40,
      weeksPerYear: 52
    };
    const res = calculateSalary(inputs);
    expect(res.totalAnnualHours).toBe(2080);
    // 85000 / 2080 = $40.865 -> $40.87
    expect(res.hourlyRate).toBe(40.87);
    expect(res.biWeeklyRate).toBeCloseTo(85000 / 26, 1);
    expect(res.monthlyRate).toBeCloseTo(85000 / 12, 1);
    expect(res.overtimeRate15x).toBeCloseTo(40.87 * 1.5, 1);
    expect(res.overtimeRate20x).toBeCloseTo(40.87 * 2.0, 1);
  });

  it('converts $35/hour wage to annual salary and overtime earnings correctly', () => {
    const inputs: SalaryInputs = {
      mode: 'hourly-to-salary',
      amount: 35,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      overtimeHoursPerWeek: 5 // 5 hours overtime/wk
    };
    const res = calculateSalary(inputs);
    // 35 * 40 * 52 = $72,800
    expect(res.annualSalary).toBe(72800);
    expect(res.overtimeRate15x).toBe(52.5); // 35 * 1.5
    expect(res.overtimeRate20x).toBe(70.0); // 35 * 2.0
    // Overtime pay: 5 hrs * $52.50 * 52 wks = $13,650
    expect(res.annualOvertimePay).toBe(13650);
    expect(res.totalAnnualCompensationWithOvertime).toBe(72800 + 13650);
  });

  it('calculates PTO value accurately', () => {
    const inputs: SalaryInputs = {
      mode: 'salary-to-hourly',
      amount: 104000, // $50/hour
      hoursPerWeek: 40,
      weeksPerYear: 52,
      paidHolidaysDays: 10,
      paidVacationDays: 15
    };
    const res = calculateSalary(inputs);
    expect(res.hourlyRate).toBe(50.0);
    expect(res.totalPtoDays).toBe(25);
    // 25 days * 8 hrs * $50 = $10,000
    expect(res.ptoMonetaryValue).toBe(10000);
  });
});

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

  it('calculates 2025 federal tax, FICA, and take-home pay for Single filer in no-tax state', () => {
    const res = calculateSalary({
      mode: 'salary-to-hourly',
      amount: 100000,
      taxInputs: {
        filingStatus: 'single',
        state: 'TX' // 0% state tax
      }
    });

    const tax = res.takeHomePay!;
    expect(tax).toBeDefined();
    expect(tax.grossAnnualIncome).toBe(100000);
    // Standard deduction for single (2025): $15,000
    expect(tax.standardDeduction).toBe(15000);
    expect(tax.federalTaxableIncome).toBe(85000);

    // 2025 brackets on $85k taxable:
    // 10% on first $11,925 = $1,192.50
    // 12% on ($48,475 - $11,925 = $36,550) = $4,386.00
    // 22% on ($85,000 - $48,475 = $36,525) = $8,035.50
    // Total federal = $13,614.00
    expect(tax.federalIncomeTax).toBeCloseTo(13614.00, 0);

    // FICA:
    // Social Security: 6.2% of 100k = $6,200
    expect(tax.socialSecurityTax).toBe(6200);
    // Medicare: 1.45% of 100k = $1,450 (no additional medicare since < $200k)
    expect(tax.medicareTax).toBe(1450);
    expect(tax.additionalMedicareTax).toBe(0);
    expect(tax.totalFicaTax).toBe(7650);

    // TX state tax = $0
    expect(tax.stateIncomeTax).toBe(0);

    // Total tax: 13,614 + 7,650 = 21,264
    expect(tax.totalTax).toBeCloseTo(21264, 0);
    // Take-home pay: 100,000 - 21,264 = $78,736
    expect(tax.annualTakeHome).toBeCloseTo(78736, 0);
    expect(tax.monthlyTakeHome).toBeCloseTo(78736 / 12, 1);
    expect(tax.biWeeklyTakeHome).toBeCloseTo(78736 / 26, 1);
  });

  it('correctly caps Social Security at $176,100 wage base limit and applies Additional Medicare Tax', () => {
    const res = calculateSalary({
      mode: 'salary-to-hourly',
      amount: 250000,
      taxInputs: {
        filingStatus: 'single',
        state: 'FL'
      }
    });

    const tax = res.takeHomePay!;
    // SS capped at $176,100 * 6.2% = $10,918.20
    expect(tax.socialSecurityTax).toBe(10918.20);
    // Medicare: 1.45% of $250k = $3,625
    // Additional Medicare: 0.9% on excess over $200k ($50,000 * 0.9% = $450)
    expect(tax.additionalMedicareTax).toBe(450);
    expect(tax.medicareTax).toBe(3625 + 450);
  });

  it('correctly uses Married Filing Jointly standard deduction and brackets', () => {
    const res = calculateSalary({
      mode: 'salary-to-hourly',
      amount: 120000,
      taxInputs: {
        filingStatus: 'married',
        state: 'WA'
      }
    });

    const tax = res.takeHomePay!;
    // 2025 MFJ standard deduction = $30,000
    expect(tax.standardDeduction).toBe(30000);
    expect(tax.federalTaxableIncome).toBe(90000);
    // Because MFJ brackets are wider, federal tax is lower than single
    expect(tax.effectiveFederalRate).toBeLessThan(10);
  });
});

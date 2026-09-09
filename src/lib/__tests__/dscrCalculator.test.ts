import { describe, it, expect } from 'bun:test';
import { calculateDscr, generateDscrAmortization, type DscrInputs } from '../dscrCalculator';

describe('DSCR Loan Calculator Engine', () => {
  const sampleInputs: DscrInputs = {
    propertyValue: 500000,
    downPayment: 20,
    downPaymentType: 'percent',
    interestRate: 7.0,
    loanTermYears: 30,
    isInterestOnly: false,
    monthlyRent: 4000,
    annualPropertyTax: 6000,
    annualInsurance: 1800,
    monthlyHoa: 150,
    vacancyRate: 5,
    managementFeeRate: 8,
    annualMaintenanceReserve: 2400,
    targetDscr: 1.25
  };

  it('calculates loan amounts and down payments correctly', () => {
    const res = calculateDscr(sampleInputs);
    expect(res.downPaymentAmount).toBe(100000);
    expect(res.loanAmount).toBe(400000);
    expect(res.ltv).toBe(80.0);
  });

  it('computes monthly debt service and PITIA accurately', () => {
    const res = calculateDscr(sampleInputs);
    // 400k at 7% 30yr = ~$2,661.21/mo
    expect(res.monthlyPrincipalAndInterest).toBeGreaterThan(2650);
    expect(res.monthlyPrincipalAndInterest).toBeLessThan(2670);
    expect(res.monthlyTaxes).toBe(500);
    expect(res.monthlyInsurance).toBe(150);
    expect(res.monthlyHoa).toBe(150);
    expect(res.monthlyPitia).toBeCloseTo(res.monthlyPrincipalAndInterest + 500 + 150 + 150, 1);
  });

  it('evaluates DSCR ratio and qualification tiers accurately', () => {
    const res = calculateDscr(sampleInputs);
    // Gross rent = 4000, PITIA ~= 3461 -> DSCR ~= 1.155 (Standard tier: 1.0 to 1.24)
    expect(res.grossDscr).toBeGreaterThan(1.1);
    expect(res.grossDscr).toBeLessThan(1.24);
    expect(res.qualificationStatus).toBe('standard');

    // Test Prime Tier when rent is higher
    const primeRes = calculateDscr({ ...sampleInputs, monthlyRent: 5000 });
    expect(primeRes.grossDscr).toBeGreaterThanOrEqual(1.25);
    expect(primeRes.qualificationStatus).toBe('prime');

    // Test Low/Declined Tier
    const lowRes = calculateDscr({ ...sampleInputs, monthlyRent: 2000 });
    expect(lowRes.grossDscr).toBeLessThan(1.0);
  });

  it('handles interest-only loans properly', () => {
    const ioRes = calculateDscr({ ...sampleInputs, isInterestOnly: true });
    // 400k * 7% / 12 = $2,333.33/mo
    expect(ioRes.monthlyPrincipalAndInterest).toBeCloseTo(2333.33, 1);
    expect(ioRes.monthlyPitia).toBeLessThan(calculateDscr(sampleInputs).monthlyPitia);
  });

  it('generates full amortization schedule', () => {
    const schedule = generateDscrAmortization(sampleInputs);
    expect(schedule.length).toBe(360);
    expect(schedule[schedule.length - 1].balance).toBe(0);
  });
});

import { describe, it, expect } from 'bun:test';
import { calculateSnowflakeCost, type SnowflakeInputs } from '../snowflakeCalculator';

describe('Snowflake Warehouse Cost Calculator Engine', () => {
  const sampleInputs: SnowflakeInputs = {
    edition: 'enterprise', // $3.00/credit
    warehouseSize: 'Medium', // 4 credits/hr
    clusterCount: 1,
    activeHoursPerDay: 8,
    activeDaysPerMonth: 22,
    storageTb: 10,
    storagePricingTier: 'capacity', // $23/TB
    autoSuspendEfficiency: 15 // 15% savings
  };

  it('calculates credit consumption and compute cost', () => {
    const res = calculateSnowflakeCost(sampleInputs);
    // 4 credits/hr * (1 - 0.15) = 3.4 credits/hr
    expect(res.creditsPerHour).toBe(4);
    expect(res.effectivePricePerCredit).toBe(3.0);
    // 3.4 credits/hr * 8 hrs * 22 days = 598.4 credits/mo * $3 = ~$1,795.20
    expect(res.monthlyComputeCost).toBeCloseTo(1795.2, 0);
  });

  it('calculates compressed storage cost', () => {
    const res = calculateSnowflakeCost(sampleInputs);
    // 10 TB * $23/TB = $230/mo
    expect(res.monthlyStorageCost).toBe(230);
  });

  it('computes annual total and multi-cluster scaling', () => {
    const res = calculateSnowflakeCost(sampleInputs);
    expect(res.totalMonthlyCost).toBe(res.monthlyComputeCost + res.monthlyStorageCost);
    expect(res.totalAnnualCost).toBeCloseTo(res.totalMonthlyCost * 12, 1);

    // Multi-cluster 2 clusters should double compute
    const scaled = calculateSnowflakeCost({ ...sampleInputs, clusterCount: 2 });
    expect(scaled.monthlyComputeCost).toBeCloseTo(res.monthlyComputeCost * 2, 1);
  });
});

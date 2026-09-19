import { describe, it, expect } from 'bun:test';
import { calculateParquetSavings, type ParquetSavingsInputs } from '../parquetSavingsCalculator';

describe('Parquet Storage & Query Savings Calculator Engine', () => {
  const sampleInputs: ParquetSavingsInputs = {
    dataFormat: 'csv',
    rawSizeAmount: 20,
    rawSizeUnit: 'TB',
    monthlyDataGrowthPercent: 3,
    compressionCodec: 'zstd',
    cloudProvider: 'aws_s3',
    runsAthenaOrBigQuery: true,
    queriesPerDay: 50,
    avgColumnsScannedPercent: 15,
    queryEngine: 'athena'
  };

  it('calculates file size reduction and compression factor', () => {
    const res = calculateParquetSavings(sampleInputs);
    // CSV with ZSTD compresses ~84% -> parquet size is ~16% of raw (3.2 TB)
    expect(res.compressionRatioPercent).toBe(84);
    expect(res.sizeReductionFactor).toBeGreaterThanOrEqual(6.0);
    expect(res.parquetSizeFormatted).toContain('TB');
  });

  it('calculates monthly S3 storage savings', () => {
    const res = calculateParquetSavings(sampleInputs);
    // 20 TB raw * ~$23.55 = ~$471/mo
    expect(res.monthlyRawStorageCost).toBeGreaterThan(450);
    expect(res.monthlyParquetStorageCost).toBeLessThan(80);
    expect(res.monthlyStorageSavings).toBeGreaterThan(380);
    expect(res.annualStorageSavings).toBeGreaterThan(4500);
  });

  it('calculates query scan savings (Athena column projection)', () => {
    const res = calculateParquetSavings(sampleInputs);
    // 20 TB * 50 queries/day * 30.5 days * $5/TB scanned is astronomical for raw CSV
    expect(res.monthlyRawQueryCost).toBeGreaterThan(res.monthlyParquetQueryCost * 10);
    expect(res.monthlyQuerySavings).toBeGreaterThan(0);
    expect(res.totalAnnualSavings).toBeGreaterThan(10000);
  });
});

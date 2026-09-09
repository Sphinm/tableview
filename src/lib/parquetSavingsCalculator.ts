export type RawDataFormat = 'csv' | 'json' | 'jsonl' | 'tsv' | 'text_log';
export type ParquetCompressionCodec = 'snappy' | 'zstd' | 'gzip' | 'uncompressed';
export type CloudProvider = 'aws_s3' | 'google_cloud' | 'azure_blob';

export interface ParquetSavingsInputs {
  dataFormat: RawDataFormat;
  rawSizeAmount: number;
  rawSizeUnit: 'GB' | 'TB' | 'PB';
  monthlyDataGrowthPercent: number; // e.g. 5% monthly growth
  compressionCodec: ParquetCompressionCodec;
  cloudProvider: CloudProvider;
  
  // Analytics & Querying
  runsAthenaOrBigQuery: boolean;
  queriesPerDay: number; // e.g. 25 queries/day
  avgColumnsScannedPercent: number; // e.g. 15% of columns used in typical SELECT query
  queryEngine: 'athena' | 'bigquery' | 'snowflake_external';
}

export interface ParquetSavingsResult {
  rawSizeBytes: number;
  rawSizeFormatted: string;
  parquetSizeBytes: number;
  parquetSizeFormatted: string;
  
  compressionRatioPercent: number; // e.g. 82% smaller
  sizeReductionFactor: number; // e.g. 5.5x smaller
  
  // Storage Costs
  monthlyRawStorageCost: number;
  monthlyParquetStorageCost: number;
  monthlyStorageSavings: number;
  annualStorageSavings: number;
  
  // Query Scan Costs (Athena / BigQuery)
  monthlyRawQueryCost: number;
  monthlyParquetQueryCost: number;
  monthlyQuerySavings: number;
  annualQuerySavings: number;
  
  // Total Savings
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  totalThreeYearSavings: number; // Including compounding data growth
  
  // Performance Benchmark
  querySpeedupFactor: number; // e.g. 8x to 15x faster query execution
}

// Typical compression ratios by format and codec
const COMPRESSION_RATIOS: Record<RawDataFormat, Record<ParquetCompressionCodec, number>> = {
  csv: {
    snappy: 0.76, // 76% reduction (4.2x smaller)
    zstd: 0.84, // 84% reduction (6.25x smaller)
    gzip: 0.82,
    uncompressed: 0.45
  },
  tsv: {
    snappy: 0.77,
    zstd: 0.85,
    gzip: 0.83,
    uncompressed: 0.46
  },
  json: {
    snappy: 0.82, // JSON keys repeat, huge savings
    zstd: 0.89, // 89% reduction (9x smaller)
    gzip: 0.88,
    uncompressed: 0.55
  },
  jsonl: {
    snappy: 0.81,
    zstd: 0.88,
    gzip: 0.87,
    uncompressed: 0.54
  },
  text_log: {
    snappy: 0.84,
    zstd: 0.91,
    gzip: 0.90,
    uncompressed: 0.60
  }
};

// Standard Hot Tier Cloud Storage rates per TB per month
const CLOUD_STORAGE_RATES_PER_TB: Record<CloudProvider, number> = {
  aws_s3: 23.55, // $0.023/GB = ~$23.55/TB
  google_cloud: 20.48, // $0.020/GB = ~$20.48/TB
  azure_blob: 20.97 // $0.0205/GB = ~$20.97/TB
};

// Query scan rates per TB scanned
const QUERY_SCAN_RATES_PER_TB = {
  athena: 5.0, // AWS Athena is $5.00/TB scanned
  bigquery: 6.25, // Google BigQuery on-demand is $6.25/TB scanned
  snowflake_external: 4.5
};

export function calculateParquetSavings(inputs: ParquetSavingsInputs): ParquetSavingsResult {
  // Convert raw size to gigabytes
  let rawSizeGb = inputs.rawSizeAmount;
  if (inputs.rawSizeUnit === 'TB') {
    rawSizeGb = inputs.rawSizeAmount * 1024;
  } else if (inputs.rawSizeUnit === 'PB') {
    rawSizeGb = inputs.rawSizeAmount * 1024 * 1024;
  }
  rawSizeGb = Math.max(0.1, rawSizeGb);
  const rawSizeTb = rawSizeGb / 1024;
  const rawSizeBytes = rawSizeGb * 1024 * 1024 * 1024;
  
  // Compression calculation
  const ratio = COMPRESSION_RATIOS[inputs.dataFormat][inputs.compressionCodec] || 0.8;
  const parquetSizeGb = rawSizeGb * (1 - ratio);
  const parquetSizeTb = parquetSizeGb / 1024;
  const parquetSizeBytes = parquetSizeGb * 1024 * 1024 * 1024;
  
  const compressionRatioPercent = Math.round(ratio * 100);
  const sizeReductionFactor = Number((1 / (1 - ratio)).toFixed(1));
  
  // Storage Cost
  const storageRatePerTb = CLOUD_STORAGE_RATES_PER_TB[inputs.cloudProvider];
  const monthlyRawStorageCost = rawSizeTb * storageRatePerTb;
  const monthlyParquetStorageCost = parquetSizeTb * storageRatePerTb;
  const monthlyStorageSavings = Math.max(0, monthlyRawStorageCost - monthlyParquetStorageCost);
  const annualStorageSavings = monthlyStorageSavings * 12;
  
  // Query Scanning Cost
  let monthlyRawQueryCost = 0;
  let monthlyParquetQueryCost = 0;
  
  if (inputs.runsAthenaOrBigQuery) {
    const scanRatePerTb = QUERY_SCAN_RATES_PER_TB[inputs.queryEngine];
    const queriesPerMonth = Math.max(0, inputs.queriesPerDay) * 30.5;
    
    // Raw files (CSV/JSON) MUST scan 100% of the entire file on every query
    const rawTbScannedPerMonth = rawSizeTb * queriesPerMonth;
    monthlyRawQueryCost = rawTbScannedPerMonth * scanRatePerTb;
    
    // Parquet has Column Projection (only reads queried columns) + Row Group statistics
    const colScanFraction = Math.max(0.05, Math.min(1.0, inputs.avgColumnsScannedPercent / 100));
    // Parquet scans only compressed bytes of the relevant columns
    const parquetTbScannedPerMonth = parquetSizeTb * colScanFraction * queriesPerMonth;
    monthlyParquetQueryCost = parquetTbScannedPerMonth * scanRatePerTb;
  }
  
  const monthlyQuerySavings = Math.max(0, monthlyRawQueryCost - monthlyParquetQueryCost);
  const annualQuerySavings = monthlyQuerySavings * 12;
  
  const totalMonthlySavings = monthlyStorageSavings + monthlyQuerySavings;
  const totalAnnualSavings = totalMonthlySavings * 12;
  
  // Compounding 3-year savings with monthly growth
  const growthRate = Math.max(0, inputs.monthlyDataGrowthPercent) / 100;
  let totalThreeYearSavings = 0;
  let currentMonthly = totalMonthlySavings;
  for (let m = 1; m <= 36; m++) {
    totalThreeYearSavings += currentMonthly;
    currentMonthly *= 1 + growthRate;
  }
  
  // Query speedup factor (columnar scan + dictionary decode typically yields 5x to 20x speedup)
  const querySpeedupFactor = Math.min(25, Math.max(4, Math.round(sizeReductionFactor * 1.8)));
  
  return {
    rawSizeBytes,
    rawSizeFormatted: formatDataSize(rawSizeGb),
    parquetSizeBytes,
    parquetSizeFormatted: formatDataSize(parquetSizeGb),
    compressionRatioPercent,
    sizeReductionFactor,
    monthlyRawStorageCost: Math.round(monthlyRawStorageCost * 100) / 100,
    monthlyParquetStorageCost: Math.round(monthlyParquetStorageCost * 100) / 100,
    monthlyStorageSavings: Math.round(monthlyStorageSavings * 100) / 100,
    annualStorageSavings: Math.round(annualStorageSavings * 100) / 100,
    monthlyRawQueryCost: Math.round(monthlyRawQueryCost * 100) / 100,
    monthlyParquetQueryCost: Math.round(monthlyParquetQueryCost * 100) / 100,
    monthlyQuerySavings: Math.round(monthlyQuerySavings * 100) / 100,
    annualQuerySavings: Math.round(annualQuerySavings * 100) / 100,
    totalMonthlySavings: Math.round(totalMonthlySavings * 100) / 100,
    totalAnnualSavings: Math.round(totalAnnualSavings * 100) / 100,
    totalThreeYearSavings: Math.round(totalThreeYearSavings),
    querySpeedupFactor
  };
}

function formatDataSize(sizeInGb: number): string {
  if (sizeInGb >= 1024 * 1024) {
    return `${(sizeInGb / (1024 * 1024)).toFixed(2)} PB`;
  }
  if (sizeInGb >= 1024) {
    return `${(sizeInGb / 1024).toFixed(2)} TB`;
  }
  return `${sizeInGb.toFixed(1)} GB`;
}

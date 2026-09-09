export type SnowflakeWarehouseSize =
  | 'X-Small'
  | 'Small'
  | 'Medium'
  | 'Large'
  | 'X-Large'
  | '2X-Large'
  | '3X-Large'
  | '4X-Large';

export type SnowflakeEdition = 'standard' | 'enterprise' | 'business_critical' | 'custom';

export interface SnowflakeInputs {
  edition: SnowflakeEdition;
  customCreditPrice?: number;
  warehouseSize: SnowflakeWarehouseSize;
  clusterCount: number; // Multi-cluster autoscaling average (1 to 10)
  activeHoursPerDay: number; // 1 to 24
  activeDaysPerMonth: number; // 1 to 31
  storageTb: number; // Compressed storage in Snowflake in TB
  storagePricingTier: 'capacity' | 'on_demand'; // $23/TB capacity vs $40/TB on-demand
  autoSuspendEfficiency: number; // 0 to 40% savings from aggressive 60s auto-suspend
}

export const WAREHOUSE_CREDITS: Record<SnowflakeWarehouseSize, number> = {
  'X-Small': 1,
  Small: 2,
  Medium: 4,
  Large: 8,
  'X-Large': 16,
  '2X-Large': 32,
  '3X-Large': 64,
  '4X-Large': 128
};

export const EDITION_DEFAULTS: Record<SnowflakeEdition, { name: string; pricePerCredit: number; description: string }> = {
  standard: {
    name: 'Standard Edition',
    pricePerCredit: 2.0,
    description: 'Entry-level edition with single-cluster warehouses and 1-day Time Travel.'
  },
  enterprise: {
    name: 'Enterprise Edition',
    pricePerCredit: 3.0,
    description: 'Most popular. Multi-cluster warehouses, up to 90 days Time Travel, and Materialized Views.'
  },
  business_critical: {
    name: 'Business Critical',
    pricePerCredit: 4.0,
    description: 'HIPAA & PCI-DSS compliance, customer-managed keys (Tri-Secret), and AWS PrivateLink.'
  },
  custom: {
    name: 'Custom Contract',
    pricePerCredit: 2.5,
    description: 'Custom pre-negotiated enterprise capacity discount rate.'
  }
};

export interface SnowflakeResult {
  creditsPerHour: number;
  creditsPerDay: number;
  creditsPerMonth: number;
  creditsPerYear: number;
  
  effectivePricePerCredit: number;
  
  monthlyComputeCost: number;
  monthlyStorageCost: number;
  monthlyCloudServicesCost: number; // Estimated ~10% cloud services allowance
  totalMonthlyCost: number;
  totalAnnualCost: number;
  
  // FinOps Savings potential
  potentialAutoSuspendSavingsMonthly: number;
  annualCommittedDiscountSavings: number; // Typical 18% commit discount
  
  // Breakdown percentages
  computePercentage: number;
  storagePercentage: number;
}

export function calculateSnowflakeCost(inputs: SnowflakeInputs): SnowflakeResult {
  const creditsPerHourPerCluster = WAREHOUSE_CREDITS[inputs.warehouseSize] || 1;
  const clusterCount = Math.max(1, Math.min(10, inputs.clusterCount));
  const totalCreditsPerHour = creditsPerHourPerCluster * clusterCount;
  
  const activeHours = Math.max(0.1, Math.min(24, inputs.activeHoursPerDay));
  const activeDays = Math.max(1, Math.min(31, inputs.activeDaysPerMonth));
  
  // Auto-suspend efficiency deduction (e.g. 15% wasted idle seconds removed)
  const efficiencyMultiplier = 1 - Math.max(0, Math.min(0.4, inputs.autoSuspendEfficiency / 100));
  const adjustedCreditsPerHour = totalCreditsPerHour * efficiencyMultiplier;
  
  const creditsPerDay = adjustedCreditsPerHour * activeHours;
  const creditsPerMonth = creditsPerDay * activeDays;
  const creditsPerYear = creditsPerMonth * 12;
  
  let pricePerCredit = EDITION_DEFAULTS[inputs.edition].pricePerCredit;
  if (inputs.edition === 'custom' && inputs.customCreditPrice && inputs.customCreditPrice > 0) {
    pricePerCredit = inputs.customCreditPrice;
  }
  
  const monthlyComputeCost = creditsPerMonth * pricePerCredit;
  
  // Storage
  const storageRatePerTb = inputs.storagePricingTier === 'capacity' ? 23.0 : 40.0;
  const monthlyStorageCost = Math.max(0, inputs.storageTb) * storageRatePerTb;
  
  // Cloud services: Snowflake gives 10% compute credit allowance free.
  // Excess beyond 10% is rarely more than 2-3% in well-managed accounts.
  const monthlyCloudServicesCost = 0; // Covered by 10% free pool in standard setups
  
  const totalMonthlyCost = monthlyComputeCost + monthlyStorageCost + monthlyCloudServicesCost;
  const totalAnnualCost = totalMonthlyCost * 12;
  
  // Potential savings if auto-suspend was NOT tuned (waste calculation)
  const unoptimizedCreditsPerMonth = totalCreditsPerHour * activeHours * activeDays;
  const unoptimizedComputeCost = unoptimizedCreditsPerMonth * pricePerCredit;
  const potentialAutoSuspendSavingsMonthly = Math.max(0, unoptimizedComputeCost - monthlyComputeCost);
  
  // Annual commit discount (Snowflake usually offers 15-22% discount for 1-3 year prepayment)
  const annualCommittedDiscountSavings = totalAnnualCost * 0.18;
  
  const computePercentage = totalMonthlyCost > 0 ? (monthlyComputeCost / totalMonthlyCost) * 100 : 0;
  const storagePercentage = totalMonthlyCost > 0 ? (monthlyStorageCost / totalMonthlyCost) * 100 : 0;
  
  return {
    creditsPerHour: Number(totalCreditsPerHour.toFixed(1)),
    creditsPerDay: Number(creditsPerDay.toFixed(1)),
    creditsPerMonth: Number(creditsPerMonth.toFixed(1)),
    creditsPerYear: Math.round(creditsPerYear),
    effectivePricePerCredit: pricePerCredit,
    monthlyComputeCost: Math.round(monthlyComputeCost * 100) / 100,
    monthlyStorageCost: Math.round(monthlyStorageCost * 100) / 100,
    monthlyCloudServicesCost: Math.round(monthlyCloudServicesCost * 100) / 100,
    totalMonthlyCost: Math.round(totalMonthlyCost * 100) / 100,
    totalAnnualCost: Math.round(totalAnnualCost * 100) / 100,
    potentialAutoSuspendSavingsMonthly: Math.round(potentialAutoSuspendSavingsMonthly * 100) / 100,
    annualCommittedDiscountSavings: Math.round(annualCommittedDiscountSavings * 100) / 100,
    computePercentage: Number(computePercentage.toFixed(1)),
    storagePercentage: Number(storagePercentage.toFixed(1))
  };
}

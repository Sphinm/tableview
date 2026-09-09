export interface HardMoneyInputs {
  purchasePrice: number;
  rehabBudget: number;
  afterRepairValue: number; // ARV
  
  // Financing structure
  ltvPercent: number; // e.g. 85% of purchase price
  rehabFinancedPercent: number; // e.g. 100% of rehab financed through draws
  interestRate: number; // e.g. 10.5%
  originationPoints: number; // e.g. 2.0 points
  lenderUnderwritingFees: number; // e.g. $1,450
  
  // Project timeline & holding
  projectDurationMonths: number; // e.g. 6 months
  monthlyHoldingCosts: number; // utilities, property tax, insurance, lawn care ($500/mo)
  
  // Exit selling costs
  realtorCommissionPercent: number; // e.g. 5.0%
  exitClosingCostsPercent: number; // e.g. 1.5%
}

export interface HardMoneyResult {
  // Loan Amounts
  purchaseLoanAmount: number;
  rehabLoanAmount: number;
  totalLoanAmount: number;
  
  // Out of pocket capital required (Initial Cash)
  downPaymentOnPurchase: number;
  downPaymentOnRehab: number;
  originationPointsCost: number;
  initialCashRequired: number; // Down payments + points + underwriting fees
  
  // Ongoing Holding Costs
  monthlyInterestPayment: number;
  totalInterestPaid: number;
  totalHoldingCosts: number;
  
  // Selling Costs
  realtorCommission: number;
  exitClosingCosts: number;
  totalExitCosts: number;
  
  // Deal Analysis & 70% Rule
  totalProjectCost: number; // Purchase + Rehab + All Financing + Holding + Exit Costs
  maxAllowableOffer70Rule: number; // (ARV * 0.70) - Rehab
  maoDifference: number; // MAO - PurchasePrice (positive means purchase price is great!)
  is70RuleCompliant: boolean;
  
  // Bottom Line Profitability
  grossSalesProceeds: number; // ARV
  netProfit: number; // ARV - totalProjectCost
  roiPercent: number; // (netProfit / totalCashInvested) * 100
  annualizedRoiPercent: number; // roi * (12 / duration)
  profitMarginPercent: number; // (netProfit / ARV) * 100
  
  // Rating
  dealVerdict: 'excellent' | 'profitable' | 'marginal' | 'unprofitable';
  verdictLabel: string;
  verdictColor: string;
  verdictDescription: string;
}

export function calculateHardMoney(inputs: HardMoneyInputs): HardMoneyResult {
  const purchasePrice = Math.max(0, inputs.purchasePrice);
  const rehabBudget = Math.max(0, inputs.rehabBudget);
  const arv = Math.max(0, inputs.afterRepairValue);
  const duration = Math.max(1, inputs.projectDurationMonths);
  
  // Loans
  const purchaseLoanAmount = (purchasePrice * Math.min(100, Math.max(0, inputs.ltvPercent))) / 100;
  const rehabLoanAmount = (rehabBudget * Math.min(100, Math.max(0, inputs.rehabFinancedPercent))) / 100;
  const totalLoanAmount = purchaseLoanAmount + rehabLoanAmount;
  
  // Down payments
  const downPaymentOnPurchase = purchasePrice - purchaseLoanAmount;
  const downPaymentOnRehab = rehabBudget - rehabLoanAmount;
  
  // Upfront lender costs
  const originationPointsCost = (totalLoanAmount * Math.max(0, inputs.originationPoints)) / 100;
  const underwritingFees = Math.max(0, inputs.lenderUnderwritingFees);
  const initialCashRequired =
    downPaymentOnPurchase + downPaymentOnRehab + originationPointsCost + underwritingFees;
    
  // Monthly interest-only payments (Hard money is virtually always interest-only)
  const annualInterestRate = Math.max(0, inputs.interestRate) / 100;
  const monthlyInterestPayment = (totalLoanAmount * annualInterestRate) / 12;
  const totalInterestPaid = monthlyInterestPayment * duration;
  const totalHoldingCosts = Math.max(0, inputs.monthlyHoldingCosts) * duration;
  
  // Exit / Selling costs
  const realtorCommission = (arv * Math.max(0, inputs.realtorCommissionPercent)) / 100;
  const exitClosingCosts = (arv * Math.max(0, inputs.exitClosingCostsPercent)) / 100;
  const totalExitCosts = realtorCommission + exitClosingCosts;
  
  // Total cost of the flip project
  const totalProjectCost =
    purchasePrice +
    rehabBudget +
    originationPointsCost +
    underwritingFees +
    totalInterestPaid +
    totalHoldingCosts +
    totalExitCosts;
    
  // 70% Rule of House Flipping
  const maxAllowableOffer70Rule = arv * 0.7 - rehabBudget;
  const maoDifference = maxAllowableOffer70Rule - purchasePrice;
  const is70RuleCompliant = purchasePrice <= maxAllowableOffer70Rule;
  
  // Total cash invested over the entire flip
  const totalCashInvested = initialCashRequired + totalInterestPaid + totalHoldingCosts;
  
  // Bottom line profit
  const netProfit = arv - totalProjectCost;
  const roiPercent = totalCashInvested > 0 ? (netProfit / totalCashInvested) * 100 : 0;
  const annualizedRoiPercent = duration > 0 ? roiPercent * (12 / duration) : 0;
  const profitMarginPercent = arv > 0 ? (netProfit / arv) * 100 : 0;
  
  // Deal Verdict
  let dealVerdict: 'excellent' | 'profitable' | 'marginal' | 'unprofitable' = 'profitable';
  let verdictLabel = 'Profitable Deal';
  let verdictColor = 'text-emerald-400';
  let verdictDescription = 'Healthy profit margin and return on capital for standard fix-and-flip criteria.';
  
  if (netProfit >= 45000 && roiPercent >= 25) {
    dealVerdict = 'excellent';
    verdictLabel = 'Excellent Deal (High ROI)';
    verdictColor = 'text-emerald-400';
    verdictDescription = 'High buffer for unforeseen renovation overruns and excellent cash-on-cash returns.';
  } else if (netProfit >= 20000 && roiPercent >= 15) {
    dealVerdict = 'profitable';
    verdictLabel = 'Solid Profitable Flip';
    verdictColor = 'text-indigo-400';
    verdictDescription = 'Meets standard commercial bridge lending risk parameters and investor hurdle rates.';
  } else if (netProfit > 0) {
    dealVerdict = 'marginal';
    verdictLabel = 'Marginal / Thin Margin';
    verdictColor = 'text-amber-400';
    verdictDescription = 'Low profit cushion. Any 10% budget overrun or timeline delay could wipe out net profit.';
  } else {
    dealVerdict = 'unprofitable';
    verdictLabel = 'Negative Return (Loss)';
    verdictColor = 'text-red-400';
    verdictDescription = 'Financing points, interest, and exit closing costs exceed project appreciation. Renegotiate purchase price.';
  }
  
  return {
    purchaseLoanAmount: Math.round(purchaseLoanAmount),
    rehabLoanAmount: Math.round(rehabLoanAmount),
    totalLoanAmount: Math.round(totalLoanAmount),
    downPaymentOnPurchase: Math.round(downPaymentOnPurchase),
    downPaymentOnRehab: Math.round(downPaymentOnRehab),
    originationPointsCost: Math.round(originationPointsCost),
    initialCashRequired: Math.round(initialCashRequired),
    monthlyInterestPayment: Math.round(monthlyInterestPayment * 100) / 100,
    totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
    totalHoldingCosts: Math.round(totalHoldingCosts * 100) / 100,
    realtorCommission: Math.round(realtorCommission * 100) / 100,
    exitClosingCosts: Math.round(exitClosingCosts * 100) / 100,
    totalExitCosts: Math.round(totalExitCosts * 100) / 100,
    totalProjectCost: Math.round(totalProjectCost * 100) / 100,
    maxAllowableOffer70Rule: Math.round(maxAllowableOffer70Rule),
    maoDifference: Math.round(maoDifference),
    is70RuleCompliant,
    grossSalesProceeds: Math.round(arv),
    netProfit: Math.round(netProfit * 100) / 100,
    roiPercent: Number(roiPercent.toFixed(2)),
    annualizedRoiPercent: Number(annualizedRoiPercent.toFixed(2)),
    profitMarginPercent: Number(profitMarginPercent.toFixed(2)),
    dealVerdict,
    verdictLabel,
    verdictColor,
    verdictDescription
  };
}

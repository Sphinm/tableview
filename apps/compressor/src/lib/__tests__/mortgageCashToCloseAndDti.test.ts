import { describe, it, expect } from 'bun:test';
import {
  estimateCashToClose,
  calculateDtiAffordability,
  FICO_PROFILES,
  FicoScoreTier
} from '../mortgageCalculator';
import { calculateRefinance, RefinanceInputs } from '../refinanceCalculator';
import { calculateSingleLoan, compareLoans, LoanParameters } from '../loanComparisonCalculator';

describe('Mortgage Borrower Real-World Enhancements', () => {
  describe('Cash to Close Estimator', () => {
    it('accurately itemizes closing costs, prepaids/escrow, and calculates total cash to close', () => {
      const homeValue = 400000;
      const downPayment = 80000; // 20% down, loanAmount = 320,000
      const cashToClose = estimateCashToClose(homeValue, downPayment, 3.0);

      expect(cashToClose.downPayment).toBe(80000);
      expect(cashToClose.totalClosingCosts).toBe(9600); // 3.0% of $320k loan
      expect(cashToClose.totalCashToClose).toBe(89600);

      // Verify itemized components sum up to total closing costs
      const itemizedTotal =
        cashToClose.lenderFees +
        cashToClose.thirdPartyServices +
        cashToClose.titleAndEscrow +
        cashToClose.prepaidsAndEscrow +
        cashToClose.governmentFees;
      expect(Math.abs(itemizedTotal - cashToClose.totalClosingCosts)).toBeLessThanOrEqual(1);
    });

    it('handles zero or custom closing cost percentages gracefully', () => {
      const result = estimateCashToClose(300000, 15000, 2.5); // loanAmount = 285,000
      expect(result.totalClosingCosts).toBe(7125);
      expect(result.totalCashToClose).toBe(22125);
    });
  });

  describe('DTI Affordability & Qualification Check', () => {
    it('approves a borrower within standard Qualified Mortgage guidelines (<=28% front, <=43% back)', () => {
      const result = calculateDtiAffordability(120000, 800, 2500);

      expect(result.monthlyGrossIncome).toBe(10000);
      expect(result.frontEndDti).toBe(25.0);
      expect(result.backEndDti).toBe(33.0);
      expect(result.frontEndStatus).toBe('ideal');
      expect(result.backEndStatus).toBe('ideal');
      expect(result.isQualifiedMortgage).toBe(true);
      expect(result.maxSuggestedHousingPayment).toBe(3500); // 10,000 * 0.43 - 800 = 3500
    });

    it('flags acceptable status when back-end DTI is between 36% and 43%', () => {
      const result = calculateDtiAffordability(100000, 1200, 2200);

      expect(result.frontEndStatus).toBe('ideal');
      expect(result.backEndStatus).toBe('acceptable');
      expect(result.isQualifiedMortgage).toBe(true);
    });

    it('flags high status when back-end DTI exceeds 43% QM threshold', () => {
      const result = calculateDtiAffordability(60000, 800, 2000);

      expect(result.frontEndStatus).toBe('high');
      expect(result.backEndStatus).toBe('high');
      expect(result.isQualifiedMortgage).toBe(false);
    });
  });

  describe('FICO Credit Score Profiles', () => {
    it('provides accurate PMI rates and LLPA descriptions for all standard tiers', () => {
      const tiers: FicoScoreTier[] = ['760+', '720-759', '680-719', '640-679', '620-639'];
      tiers.forEach((tier) => {
        const profile = FICO_PROFILES[tier];
        expect(profile).toBeDefined();
        expect(profile.defaultPmiRate).toBeGreaterThan(0);
        expect(profile.creditRating).toBeTruthy();
      });

      expect(FICO_PROFILES['760+'].defaultPmiRate).toBeLessThan(FICO_PROFILES['680-719'].defaultPmiRate);
      expect(FICO_PROFILES['680-719'].defaultPmiRate).toBeLessThan(FICO_PROFILES['620-639'].defaultPmiRate);
    });
  });

  describe('Refinance 80% LTV Guardrail', () => {
    it('detects when cash-out refinance exceeds conventional 80% LTV ceiling', () => {
      const inputs: RefinanceInputs = {
        homePrice: 500000,
        originalLoanAmount: 400000,
        originalTermYears: 30,
        currentInterestRate: 7.0,
        monthsAlreadyPaid: 12,
        newTermYears: 30,
        newInterestRate: 5.5,
        yearsBeforeSell: 5,
        discountPoints: 0,
        originationPercent: 0,
        otherClosingCosts: 5000,
        cashOutAmount: 50000,
        rollCostsIntoLoan: false
      };

      const result = calculateRefinance(inputs);
      expect(result.cashOutLtv).toBeGreaterThan(80);
      expect(result.isExceedingCashOutLtv).toBe(true);
      expect(result.maxAllowedCashOut).toBeLessThan(50000);
    });

    it('passes when cash-out refinance is safely under 80% LTV', () => {
      const inputs: RefinanceInputs = {
        homePrice: 600000,
        originalLoanAmount: 350000,
        originalTermYears: 30,
        currentInterestRate: 6.5,
        monthsAlreadyPaid: 60,
        newTermYears: 30,
        newInterestRate: 5.25,
        yearsBeforeSell: 5,
        discountPoints: 0,
        originationPercent: 0,
        otherClosingCosts: 4000,
        cashOutAmount: 40000,
        rollCostsIntoLoan: false
      };

      const result = calculateRefinance(inputs);
      expect(result.cashOutLtv).toBeLessThanOrEqual(80);
      expect(result.isExceedingCashOutLtv).toBe(false);
      expect(result.maxAllowedCashOut).toBeGreaterThanOrEqual(40000);
    });
  });

  describe('Loan Comparison CFPB 5-Year Horizon and TIP', () => {
    it('computes 5-year paid, principal reduction, and TIP in accordance with TRID / CFPB LE', () => {
      const params: LoanParameters = {
        name: '30-Year Fixed 6.5%',
        loanAmount: 300000,
        interestRate: 6.5,
        termYears: 30,
        originationPoints: 0,
        upfrontFees: 3000,
        extraMonthlyPayment: 0
      };

      const singleLoan = calculateSingleLoan(params);

      expect(singleLoan.in5YearsTotalPaid).toBeGreaterThan(110000);
      expect(singleLoan.in5YearsTotalPaid).toBeLessThan(120000);
      expect(singleLoan.in5YearsPrincipalPaid).toBeGreaterThan(15000);
      expect(singleLoan.in5YearsPrincipalPaid).toBeLessThan(25000);
      expect(singleLoan.in5YearsEndingBalance).toBe(300000 - singleLoan.in5YearsPrincipalPaid);
      expect(singleLoan.totalInterestPercentage).toBeGreaterThan(100);
      expect(singleLoan.totalInterestPercentage).toBeLessThan(150);
    });

    it('correctly compares 5-year net holding cost between 15-year and 30-year loans', () => {
      const loan30: LoanParameters = {
        name: '30-Year Fixed',
        loanAmount: 400000,
        interestRate: 6.5,
        termYears: 30,
        originationPoints: 0,
        upfrontFees: 2000,
        extraMonthlyPayment: 0
      };

      const loan15: LoanParameters = {
        name: '15-Year Fixed',
        loanAmount: 400000,
        interestRate: 5.75,
        termYears: 15,
        originationPoints: 0,
        upfrontFees: 2000,
        extraMonthlyPayment: 0
      };

      const comparison = compareLoans(loan30, loan15);

      expect(comparison.loanB.in5YearsPrincipalPaid).toBeGreaterThan(comparison.loanA.in5YearsPrincipalPaid);
      expect(comparison.in5YearsNetCostDiff).toBeGreaterThan(0);
    });
  });
});

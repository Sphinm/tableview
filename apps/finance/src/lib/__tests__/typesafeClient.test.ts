import { describe, it, expect, beforeEach } from 'bun:test';
import {
  analyzeDealIntent,
  assessUnderwritingRisk,
  getStoredApiKey,
  setStoredApiKey,
  clearStoredApiKey,
  hasLiveApiKey,
} from '../typesafeClient';

describe('TypeSafe AI Client & System 1 Decision Layer', () => {
  beforeEach(() => {
    clearStoredApiKey();
  });

  describe('API Key Storage Management', () => {
    it('manages API key in storage properly', () => {
      expect(hasLiveApiKey()).toBe(false);
      expect(getStoredApiKey()).toBe('');

      setStoredApiKey('ts_live_test_key_12345');
      expect(hasLiveApiKey()).toBe(true);
      expect(getStoredApiKey()).toBe('ts_live_test_key_12345');

      clearStoredApiKey();
      expect(hasLiveApiKey()).toBe(false);
      expect(getStoredApiKey()).toBe('');
    });
  });

  describe('analyzeDealIntent (Intent Routing & Primitives)', () => {
    it('routes rental property & DSCR inquiries to dscr_loan calculator', async () => {
      const message =
        'Looking at a 4-plex in Dallas for $850k with $7,200/mo rental income, looking for a DSCR loan at 7.5% rate';
      const result = await analyzeDealIntent(message, { forceMock: true });

      expect(result.targetCalculator).toBe('dscr_loan');
      expect(result.targetRoute).toBe('/dscr-loan-calculator');
      expect(result.calculatorConfidence).toBeGreaterThan(0.85);
      expect(result.probabilities['dscr_loan']).toBeGreaterThan(0.8);
      expect(result.isMock).toBe(true);
    });

    it('routes 1031 tax deferred exchange questions to section_1031 calculator', async () => {
      const message =
        'Selling our warehouse and need a 1031 like-kind exchange to defer capital gains and boot, 45 day identification deadline approaching';
      const result = await analyzeDealIntent(message, { forceMock: true });

      expect(result.targetCalculator).toBe('section_1031');
      expect(result.targetRoute).toBe('/section-1031-exchange-calculator');
      expect(result.complexityScore).toBeGreaterThan(1.4);
      expect(result.isUrgentProbability).toBeGreaterThan(0.8);
    });

    it('routes house flip / rehab inquiries to fix_and_flip calculator', async () => {
      const message =
        'Need a hard money bridge loan for a fix and flip in Phoenix. ARV is $450k, rehab budget $60k, buying at 70% rule.';
      const result = await analyzeDealIntent(message, { forceMock: true });

      expect(result.targetCalculator).toBe('fix_and_flip');
      expect(result.targetRoute).toBe('/hard-money-calculator');
      expect(result.probabilities['fix_and_flip']).toBeGreaterThan(0.8);
    });

    it('routes refinance break-even inquiries to refinance calculator', async () => {
      const message =
        'Want to refinance my 6.8% mortgage down to 5.75% and calculate cash-out refi break-even without resetting the 30-year clock';
      const result = await analyzeDealIntent(message, { forceMock: true });

      expect(result.targetCalculator).toBe('refinance');
      expect(result.targetRoute).toBe('/refinance-calculator');
    });

    it('routes commercial balloon debt questions to commercial_cre calculator', async () => {
      const message =
        'Commercial multifamily loan for a 16-unit complex, 25 year amortization with a 7-year balloon payment refinance requirement';
      const result = await analyzeDealIntent(message, { forceMock: true });

      expect(result.targetCalculator).toBe('commercial_cre');
      expect(result.targetRoute).toBe('/commercial-loan-calculator');
      expect(result.complexityScore).toBeGreaterThan(1.4);
    });
  });

  describe('assessUnderwritingRisk (Composite Scoring & Underwriting Guardrails)', () => {
    it('rates strong DSCR (>1.30x) and low LTV (<=75%) as Low Risk (Tier 1 Prime)', async () => {
      const result = await assessUnderwritingRisk(
        { dscr: 1.35, ltv: 0.7 },
        { forceMock: true }
      );

      expect(result.riskLevel).toBe('Low');
      expect(result.riskScore).toBeLessThan(0.8);
      expect(result.riskConfidence).toBeGreaterThan(0.9);
      expect(result.actionGuidance).toMatch(/prime/i);
    });

    it('rates standard DSCR (1.20x - 1.29x) as Moderate Risk (Tier 2 Standard)', async () => {
      const result = await assessUnderwritingRisk(
        { dscr: 1.24, ltv: 0.8 },
        { forceMock: true }
      );

      expect(result.riskLevel).toBe('Moderate');
      expect(result.riskScore).toBeGreaterThanOrEqual(0.8);
      expect(result.riskScore).toBeLessThan(1.7);
    });

    it('rates tight DSCR (1.00x - 1.19x) as High Risk with rate_buydown recommendation', async () => {
      const result = await assessUnderwritingRisk(
        { dscr: 1.12, ltv: 0.8 },
        { forceMock: true }
      );

      expect(result.riskLevel).toBe('High');
      expect(result.riskScore).toBeGreaterThanOrEqual(1.7);
      expect(result.recommendedMitigation).toBe('rate_buydown');
    });

    it('rates deficient DSCR (<1.00x) as Critical Risk requiring equity reduction', async () => {
      const result = await assessUnderwritingRisk(
        { dscr: 0.88, ltv: 0.8 },
        { forceMock: true }
      );

      expect(result.riskLevel).toBe('Critical');
      expect(result.riskScore).toBeGreaterThanOrEqual(2.5);
      expect(result.recommendedMitigation).toBe('increase_downpayment');
    });
  });
});

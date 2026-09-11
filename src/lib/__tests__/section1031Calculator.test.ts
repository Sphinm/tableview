import { describe, it, expect } from 'bun:test';
import {
  calculateSection1031,
  evaluateIdentification,
  taxReturnDueDate,
  addDays,
  daysBetween,
  type Section1031Inputs,
} from '../section1031Calculator';

/** A clean, fully-deferred baseline: all cash and all debt rolled over. */
const baseInputs = (overrides: Partial<Section1031Inputs> = {}): Section1031Inputs => ({
  salePrice: 500_000,
  sellingCostsPercent: 6,
  adjustedBasis: 200_000,
  accumulatedDepreciation: 60_000,
  existingMortgagePayoff: 150_000,

  replacementPurchasePrice: 600_000,
  acquisitionCosts: 0,
  newMortgage: 150_000,

  closingDate: '2026-03-10',
  filingExtension: false,

  propertiesIdentified: 2,
  identifiedTotalFmv: 600_000,
  relinquishedFmv: 500_000,

  federalLtcgRatePercent: 20,
  depreciationRecaptureRatePercent: 25,
  stateTaxRatePercent: 0,
  applyNiit: false,
  ...overrides,
});

describe('1031 exchange — gain and boot arithmetic', () => {
  it('computes realized gain from net proceeds, not gross sale price', () => {
    const r = calculateSection1031(baseInputs());
    // 500,000 - 6% (30,000) = 470,000 net; minus 200,000 basis = 270,000
    expect(r.sellingCosts).toBe(30_000);
    expect(r.netSaleProceeds).toBe(470_000);
    expect(r.realizedGain).toBe(270_000);
  });

  it('defers the entire gain when all cash and all debt are replaced', () => {
    const r = calculateSection1031(baseInputs());

    expect(r.cashBoot).toBe(0);
    expect(r.mortgageBoot).toBe(0);
    expect(r.totalBoot).toBe(0);
    expect(r.recognizedGain).toBe(0);
    expect(r.deferredGain).toBe(270_000);
    expect(r.totalTaxDue).toBe(0);
    expect(r.verdict).toBe('full-deferral');
  });

  it('charges only cash boot when the debt is replaced exactly', () => {
    const r = calculateSection1031(
      baseInputs({ replacementPurchasePrice: 400_000, newMortgage: 150_000 })
    );

    // 470,000 net of costs, less the 150,000 payoff = 320,000 in hand.
    expect(r.cashFromSale).toBe(320_000);
    // The replacement absorbs 400,000 - 150,000 = 250,000 of it, so 70,000 is boot.
    expect(r.cashBoot).toBe(70_000);
    // Debt in matched debt out, so no mortgage boot.
    expect(r.mortgageBoot).toBe(0);
    expect(r.totalBoot).toBe(70_000);
  });

  it('counts new financing against cash boot', () => {
    const r = calculateSection1031(
      baseInputs({ replacementPurchasePrice: 250_000, newMortgage: 150_000 })
    );

    // 320,000 of cash in hand, but the replacement only absorbs 250,000 - 150,000
    // = 100,000 of it, because the rest is financed. The remaining 220,000 stays
    // in the investor's pocket and is boot.
    expect(r.cashFromSale).toBe(320_000);
    expect(r.cashBoot).toBe(220_000);
    expect(r.recognizedGain).toBe(220_000);
    expect(r.deferredGain).toBe(50_000);
    expect(r.verdict).toBe('partial-boot');
  });

  it('charges mortgage boot when debt relief is not replaced', () => {
    // Pay off a 150k mortgage, take no new debt, and buy a property small
    // enough that no additional cash is needed.
    const r = calculateSection1031(
      baseInputs({ replacementPurchasePrice: 320_000, newMortgage: 0 })
    );

    // Every dollar of the 320,000 cash in hand is absorbed, so no cash boot...
    expect(r.cashBoot).toBe(0);
    // ...but 150,000 of debt was relieved and never replaced.
    expect(r.mortgageBoot).toBe(150_000);
    expect(r.recognizedGain).toBe(150_000);
    expect(r.verdict).toBe('partial-boot');
  });

  it('lets cash paid in beyond the proceeds cure debt relief', () => {
    // Same debt relief, but the replacement is large enough that the investor
    // must bring 150,000 of their own money to closing. That extra cash
    // substitutes for the debt they did not replace, so there is no boot.
    const r = calculateSection1031(
      baseInputs({ replacementPurchasePrice: 470_000, newMortgage: 0 })
    );

    expect(r.cashBoot).toBe(0);
    expect(r.additionalCashPaid).toBe(150_000);
    expect(r.debtReliefCuredByCash).toBe(true);
    expect(r.mortgageBoot).toBe(0);
    expect(r.recognizedGain).toBe(0);
    expect(r.verdict).toBe('full-deferral');
  });

  it('replaces debt with new debt and defers everything', () => {
    const r = calculateSection1031(
      baseInputs({ replacementPurchasePrice: 470_000, newMortgage: 150_000 })
    );

    expect(r.mortgageBoot).toBe(0);
    expect(r.cashBoot).toBe(0);
    expect(r.recognizedGain).toBe(0);
  });

  it('caps recognized gain at realized gain', () => {
    // Boot far larger than the gain: cannot recognise more than was realised.
    const r = calculateSection1031(
      baseInputs({
        adjustedBasis: 460_000, // only 10,000 of gain
        replacementPurchasePrice: 0,
        newMortgage: 0,
      })
    );

    expect(r.realizedGain).toBe(10_000);
    expect(r.totalBoot).toBeGreaterThan(r.realizedGain);
    expect(r.recognizedGain).toBe(10_000);
    expect(r.deferredGain).toBe(0);
    expect(r.verdict).toBe('taxable');
  });
});

describe('1031 exchange — taxation of boot', () => {
  it('taxes depreciation recapture before capital gain', () => {
    const r = calculateSection1031(
      baseInputs({
        accumulatedDepreciation: 60_000,
        // 400,000 - 150,000 financing absorbs 250,000 of the 320,000 in hand,
        // leaving exactly 70,000 of cash boot.
        replacementPurchasePrice: 400_000,
        federalLtcgRatePercent: 20,
        depreciationRecaptureRatePercent: 25,
        stateTaxRatePercent: 0,
      })
    );

    expect(r.recognizedGain).toBe(70_000);
    // Recapture is recognised first, and only up to the depreciation taken.
    expect(r.recapturePortion).toBe(60_000);
    expect(r.capitalGainPortion).toBe(10_000);
    // 60,000 @ 25% + 10,000 @ 20% = 15,000 + 2,000
    expect(r.federalTax).toBe(17_000);
  });

  it('counts the full recognized gain as capital gain when no depreciation was taken', () => {
    const r = calculateSection1031(
      baseInputs({
        accumulatedDepreciation: 0,
        replacementPurchasePrice: 400_000,
      })
    );

    expect(r.recapturePortion).toBe(0);
    expect(r.capitalGainPortion).toBe(70_000);
    // 70,000 @ 20%
    expect(r.federalTax).toBe(14_000);
  });

  it('applies NIIT only when requested', () => {
    const without = calculateSection1031(
      baseInputs({ accumulatedDepreciation: 0, replacementPurchasePrice: 400_000 })
    );
    const withNiit = calculateSection1031(
      baseInputs({ accumulatedDepreciation: 0, replacementPurchasePrice: 400_000, applyNiit: true })
    );

    expect(without.federalTax).toBe(14_000);
    // 70,000 @ (20% + 3.8%)
    expect(withNiit.federalTax).toBe(16_660);
  });

  it('applies the state rate to the whole recognized gain', () => {
    const r = calculateSection1031(
      baseInputs({
        accumulatedDepreciation: 60_000,
        replacementPurchasePrice: 400_000,
        stateTaxRatePercent: 9.3,
      })
    );

    // 70,000 @ 9.3%
    expect(r.stateTax).toBe(6_510);
    expect(r.totalTaxDue).toBe(23_510);
  });

  it('quantifies the saving versus an outright sale', () => {
    const r = calculateSection1031(baseInputs());

    // Fully deferred: the entire tax bill is avoided for now.
    expect(r.totalTaxDue).toBe(0);
    // 60,000 @ 25% + 210,000 @ 20% = 15,000 + 42,000
    expect(r.taxIfSoldOutright).toBe(57_000);
    expect(r.taxSavedByExchanging).toBe(57_000);
  });
});

/**
 * The three canonical boot cases from practitioner literature. An earlier
 * revision of this module computed cash boot without netting new financing and
 * mortgage boot without netting cash paid in, and failed cases A and B.
 */
describe('1031 exchange — canonical boot cases (regression guard)', () => {
  const simple = (over: Partial<Section1031Inputs>) =>
    calculateSection1031(
      baseInputs({
        salePrice: 100_000,
        sellingCostsPercent: 0,
        adjustedBasis: 0,
        accumulatedDepreciation: 0,
        existingMortgagePayoff: 0,
        acquisitionCosts: 0,
        ...over,
      })
    );

  it('A: buying with new debt leaves proceeds in pocket as cash boot', () => {
    // Sell outright for 100k with no debt, buy 100k using a 50k mortgage.
    // Only 50k of the proceeds is absorbed; the other 50k is boot.
    const r = simple({ replacementPurchasePrice: 100_000, newMortgage: 50_000 });
    expect(r.cashBoot).toBe(50_000);
    expect(r.mortgageBoot).toBe(0);
    expect(r.totalBoot).toBe(50_000);
  });

  it('B: cash paid in beyond the proceeds cures debt relief', () => {
    // Sell for 100k owing 50k (so 50k of proceeds), buy 100k outright by
    // bringing 50k of personal cash. The debt was relieved but replaced with
    // cash, so there is no boot.
    const r = simple({
      existingMortgagePayoff: 50_000,
      replacementPurchasePrice: 100_000,
      newMortgage: 0,
    });
    expect(r.cashFromSale).toBe(50_000);
    expect(r.additionalCashPaid).toBe(50_000);
    expect(r.cashBoot).toBe(0);
    expect(r.mortgageBoot).toBe(0);
    expect(r.totalBoot).toBe(0);
    expect(r.verdict).toBe('full-deferral');
  });

  it('C: shrinking the replacement produces mortgage boot', () => {
    // Same 50k of debt relief, but the replacement is small enough that no
    // extra cash is needed — so the relief stands as boot.
    const r = simple({
      existingMortgagePayoff: 50_000,
      replacementPurchasePrice: 50_000,
      newMortgage: 0,
    });
    expect(r.cashBoot).toBe(0);
    expect(r.mortgageBoot).toBe(50_000);
    expect(r.totalBoot).toBe(50_000);
  });
});

describe('1031 exchange — statutory deadlines', () => {
  it('runs a 45-day identification clock from closing', () => {
    const r = calculateSection1031(baseInputs({ closingDate: '2026-03-10' }));
    expect(r.identificationDeadline).toBe('2026-04-24');
  });

  it('runs a 180-day exchange clock from closing', () => {
    const r = calculateSection1031(baseInputs({ closingDate: '2026-03-10' }));
    expect(r.exchangeDeadline).toBe('2026-09-06');
    expect(r.exchangeDeadlineDriver).toBe('180-days');
  });

  it('cuts the exchange period short when the tax return is due first', () => {
    // A December closing: 180 days would run to June, but the return for that
    // tax year is due April 15 — the earlier date governs.
    const r = calculateSection1031(
      baseInputs({ closingDate: '2026-12-01', filingExtension: false })
    );

    expect(r.exchangeDeadline).toBe('2027-04-15');
    expect(r.exchangeDeadlineDriver).toBe('tax-return-due-date');
  });

  it('restores the full 180 days when an extension is filed', () => {
    const r = calculateSection1031(
      baseInputs({ closingDate: '2026-12-01', filingExtension: true })
    );

    // 180 days from 2026-12-01 is 2027-05-30, and the extended due date
    // (2027-10-15) is later, so the 180-day clock governs.
    expect(r.exchangeDeadline).toBe('2027-05-30');
    expect(r.exchangeDeadlineDriver).toBe('180-days');
  });

  it('places the unextended due date on April 15 of the following year', () => {
    expect(taxReturnDueDate('2026-05-01', false)).toBe('2027-04-15');
    expect(taxReturnDueDate('2026-05-01', true)).toBe('2027-10-15');
  });

  it('reports days remaining relative to a supplied date', () => {
    const r = calculateSection1031(baseInputs({ closingDate: '2026-03-10' }), '2026-03-20');
    expect(r.identificationDaysRemaining).toBe(35);
    expect(r.exchangeDaysRemaining).toBe(170);
  });

  it('reports negative days once a deadline has passed', () => {
    const r = calculateSection1031(baseInputs({ closingDate: '2026-03-10' }), '2026-05-01');
    expect(r.identificationDaysRemaining).toBeLessThan(0);
  });
});

describe('1031 exchange — identification safe harbours', () => {
  it('allows up to three properties of any value', () => {
    const r = evaluateIdentification({
      propertiesIdentified: 3,
      identifiedTotalFmv: 99_000_000,
      relinquishedFmv: 500_000,
      acquiredFmv: 0,
    });
    expect(r.rule).toBe('3-property');
    expect(r.compliant).toBe(true);
  });

  it('allows any number of properties within 200% of relinquished FMV', () => {
    const r = evaluateIdentification({
      propertiesIdentified: 7,
      identifiedTotalFmv: 1_000_000, // exactly 200% of 500,000
      relinquishedFmv: 500_000,
      acquiredFmv: 0,
    });
    expect(r.rule).toBe('200-percent');
    expect(r.compliant).toBe(true);
  });

  it('rejects a 200% breach when less than 95% is acquired', () => {
    const r = evaluateIdentification({
      propertiesIdentified: 7,
      identifiedTotalFmv: 2_000_000, // 400% of relinquished
      relinquishedFmv: 500_000,
      acquiredFmv: 1_000_000, // only 50% of identified value
    });
    expect(r.rule).toBe('exceeded');
    expect(r.compliant).toBe(false);
  });

  it('rescues a 200% breach by acquiring at least 95% of identified value', () => {
    const r = evaluateIdentification({
      propertiesIdentified: 7,
      identifiedTotalFmv: 2_000_000,
      relinquishedFmv: 500_000,
      acquiredFmv: 1_900_000, // exactly 95%
    });
    expect(r.rule).toBe('95-percent');
    expect(r.compliant).toBe(true);
  });

  it('rejects just under the 95% threshold', () => {
    const r = evaluateIdentification({
      propertiesIdentified: 7,
      identifiedTotalFmv: 2_000_000,
      relinquishedFmv: 500_000,
      acquiredFmv: 1_899_999,
    });
    expect(r.rule).toBe('exceeded');
    expect(r.compliant).toBe(false);
  });

  it('does not treat zero identified properties as a violation', () => {
    expect(
      evaluateIdentification({
        propertiesIdentified: 0,
        identifiedTotalFmv: 0,
        relinquishedFmv: 500_000,
        acquiredFmv: 0,
      }).compliant
    ).toBe(true);
  });
});

describe('1031 exchange — defensive handling', () => {
  it('clamps a negative basis and negative prices to zero', () => {
    const r = calculateSection1031(
      baseInputs({ salePrice: -100, adjustedBasis: -5, existingMortgagePayoff: -1 })
    );
    expect(r.netSaleProceeds).toBe(0);
    expect(r.realizedGain).toBe(0);
  });

  it('caps percentage inputs at 100', () => {
    const r = calculateSection1031(baseInputs({ sellingCostsPercent: 500 }));
    expect(r.sellingCosts).toBe(500_000);
    expect(r.netSaleProceeds).toBe(0);
  });

  it('never reports a loss as a positive realized gain', () => {
    const r = calculateSection1031(baseInputs({ adjustedBasis: 900_000 }));
    expect(r.realizedGain).toBe(0);
    expect(r.deferredGain).toBe(0);
    expect(r.totalTaxDue).toBe(0);
  });

  it('handles a zero-price sale without dividing by zero', () => {
    const r = calculateSection1031(baseInputs({ salePrice: 0 }));
    expect(Number.isFinite(r.realizedGain)).toBe(true);
    expect(Number.isFinite(r.taxIfSoldOutright)).toBe(true);
  });
});

describe('date helpers', () => {
  it('adds days across a month boundary', () => {
    expect(addDays('2026-01-30', 5)).toBe('2026-02-04');
  });

  it('adds days across a leap day', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });

  it('counts days in both directions', () => {
    expect(daysBetween('2026-01-01', '2026-01-31')).toBe(30);
    expect(daysBetween('2026-01-31', '2026-01-01')).toBe(-30);
  });
});

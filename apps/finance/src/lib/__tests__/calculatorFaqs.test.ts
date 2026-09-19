import { describe, it, expect } from 'bun:test';
import { CALCULATOR_FAQS, getCalculatorFaqs } from '../../data/calculatorFaqs';
import { isKnownRoute, resolveRoutePath } from '../resolveRoute';

/**
 * The FAQ registry feeds the prerenderer, which writes text into the static HTML
 * that a crawler reads. Two invariants matter:
 *
 *   1. Only calculators that RENDER this data may be registered — emitting FAQ
 *      copy a visitor cannot see would be cloaking.
 *   2. The FAQPage structured data must match the on-page content, or Google
 *      reports a mismatch.
 */
describe('Calculator FAQ registry', () => {
  const entries = Object.entries(CALCULATOR_FAQS);

  it('is keyed by canonical paths', () => {
    for (const [path] of entries) {
      expect(path.startsWith('/')).toBe(true);
      expect(path).toBe(path.toLowerCase());
    }
  });

  it('gives every registered calculator at least three questions', () => {
    for (const [path, faqs] of entries) {
      expect(`${path} has ${faqs.length}`).toBe(
        `${path} has ${Math.max(faqs.length, 3)}`
      );
    }
  });

  it('has a non-trivial question and answer for every entry', () => {
    for (const [path, faqs] of entries) {
      for (const faq of faqs) {
        expect(faq.q.length, `${path}: question too short`).toBeGreaterThan(15);
        // Answers are what actually rank; a stub would be worse than nothing.
        expect(faq.a.length, `${path}: answer too short`).toBeGreaterThan(120);
      }
    }
  });

  it('never repeats a question within a calculator', () => {
    for (const [path, faqs] of entries) {
      const questions = faqs.map((f) => f.q);
      expect(new Set(questions).size, `${path} has duplicate questions`).toBe(questions.length);
    }
  });

  it('returns an empty list for an unregistered path', () => {
    expect(getCalculatorFaqs('/not-a-calculator')).toEqual([]);
    expect(getCalculatorFaqs('')).toEqual([]);
  });

  it('registers every calculator that used to ship no crawlable content', () => {
    // These six previously had zero static words. A missing key would silently
    // revert them to invisible-without-JavaScript.
    const required = [
      '/mortgage-calculator',
      '/refinance-calculator',
      '/dscr-loan-calculator',
      '/hard-money-calculator',
      '/snowflake-cost-calculator',
      '/parquet-storage-calculator',
      '/section-1031-exchange-calculator',
    ];
    for (const path of required) {
      expect(`${path} has ${getCalculatorFaqs(path).length > 0}`).toBe(`${path} has true`);
    }
  });

  it('maps every registered path to a real, indexable route', () => {
    // A typo'd key would register FAQ copy that no page ever renders, and the
    // prerenderer would either skip it or emit cloaked content.
    for (const path of Object.keys(CALCULATOR_FAQS)) {
      expect(isKnownRoute(resolveRoutePath(path).path), `${path} is not a known route`).toBe(true);
    }
  });

  it('never ships a page whose FAQ markup is invisible', () => {
    // The mortgage and refinance pages previously declared FAQPage structured
    // data for questions that appeared nowhere on the rendered page. Google
    // treats markup for invisible content as a guidelines violation, so the
    // registry must be the source the pages render FROM.
    const pagesUsingRegistry = [
      'pages/MortgageCalculator.tsx',
      'pages/RefinanceCalculator.tsx',
      'pages/DscrCalculator.tsx',
      'pages/HardMoneyCalculator.tsx',
      'pages/SnowflakeCalculator.tsx',
      'pages/ParquetSavingsCalculator.tsx',
      'pages/Section1031Calculator.tsx',
    ];

    const fs = require('node:fs');
    const path = require('node:path');
    const root = path.join(import.meta.dir, '..', '..');

    const missing: string[] = [];
    for (const rel of pagesUsingRegistry) {
      const source = fs.readFileSync(path.join(root, rel), 'utf8');
      const rendersRegistry =
        source.includes('CalculatorFaqSection') || source.includes('getCalculatorFaqs');
      if (!rendersRegistry) missing.push(rel);
    }

    expect(missing).toEqual([]);
  });

  it('registers the 1031 exchange calculator', () => {
    const faqs = getCalculatorFaqs('/section-1031-exchange-calculator');
    expect(faqs.length).toBeGreaterThanOrEqual(3);
    // The deadline rules are the differentiator; they must be covered.
    const text = faqs.map((f) => `${f.q} ${f.a}`).join(' ').toLowerCase();
    expect(text).toContain('boot');
    expect(text).toContain('45-day');
    expect(text).toContain('180');
  });
});

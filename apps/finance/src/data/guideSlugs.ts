/**
 * Lightweight index of financial guide slugs.
 *
 * A unit test asserts this list stays in sync with guidesData.
 */
export const GUIDE_SLUGS: readonly string[] = [
  'dscr-loans-complete-investor-guide',
  'mortgage-refinance-break-even-guide',
  'commercial-real-estate-loan-types',
  'section-1031-exchange-rules-timeline',
  'how-to-calculate-dscr',
  'loan-amortization-math-explained',
  'flsa-overtime-rules-and-exemptions',
  'hard-money-loans-for-fix-and-flip',
  'commercial-balloon-mortgages-risks',
];

const GUIDE_SLUG_SET = new Set<string>(GUIDE_SLUGS);

export function isGuideSlug(slug: string): boolean {
  return GUIDE_SLUG_SET.has(slug);
}

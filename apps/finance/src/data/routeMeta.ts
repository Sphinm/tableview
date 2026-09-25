/**
 * Single source of truth for per-route <title>, <meta name="description"> and
 * canonical URL.
 *
 * Both the runtime (page components) and the build-time prerenderer read from
 * here, so the static HTML a crawler receives can never drift from what the SPA
 * produces after hydration.
 */
export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
}

export const HOME_META: PageMeta = {
  title: 'TableView: Institutional Real Estate & Lending Underwriting Suite',
  description:
    'Institutional real estate underwriting, DSCR loans, BRRRR strategy, fix & flip MAO, IRC §1031 tax deferrals, and commercial debt modeling running 100% private in your browser.',
  canonical: '/',
};

export const GUIDES_HUB_META: PageMeta = {
  title: 'Real Estate & Lending Underwriting Guides | TableView.dev',
  description:
    'In-depth practitioner guides, mathematical formulas, and underwriting benchmarks for DSCR loans, 1031 tax exchanges, mortgage amortization, and commercial debt.',
  canonical: '/guides',
};

/** Meta for every dedicated calculator plus the underwriting hub. */
export const CALCULATOR_META: Record<string, PageMeta> = {
  '/mortgage-calculator': {
    title: 'Mortgage Calculator: Payments & Amortization | TableView',
    description:
      'Free, 100% private in-browser mortgage calculator. Calculate monthly payments with PMI, property taxes, home insurance, and HOA fees. Includes interactive amortization schedules and Excel/CSV export.',
    canonical: '/mortgage-calculator',
  },
  '/dscr-loan-calculator': {
    title: 'DSCR Loan Calculator for Rental Properties | TableView',
    description:
      'Free in-browser DSCR loan calculator and BiggerPockets Pro alternative without paywalls. Calculate debt service coverage ratio, maximum qualifying loan amount, cash flow, and amortization with Excel export.',
    canonical: '/dscr-loan-calculator',
  },
  '/cap-rate-calculator': {
    title: 'Rental Property Cash Flow & Cap Rate Calculator | TableView',
    description:
      'Underwrite residential & commercial rental properties with institutional precision. Model NOI, Cap Rate, Cash-on-Cash Return, 10-year wealth building, and 1% rule.',
    canonical: '/cap-rate-calculator',
  },
  '/hard-money-calculator': {
    title: 'Hard Money Loan Calculator: Fix & Flip ROI | TableView',
    description:
      'Free in-browser Hard Money Loan calculator and DealCheck alternative. Calculate points, interest-only holding costs, 70% rule Maximum Allowable Offer (MAO), net flip profit, and annualized ROI without subscriptions.',
    canonical: '/hard-money-calculator',
  },
  '/refinance-calculator': {
    title: 'Mortgage Refinance Break-Even Calculator | TableView',
    description:
      'Free, 100% private in-browser mortgage refinance break-even calculator. Compare monthly savings, net equity break-even, roll-in closing costs, and 30-year reset clock warnings without broker ads or lead forms.',
    canonical: '/refinance-calculator',
  },
  '/brrrr-calculator': {
    title: 'BRRRR Calculator: Buy, Rehab, Rent, Refinance | TableView',
    description:
      'Free in-browser BRRRR strategy calculator and BiggerPockets Pro alternative. Model acquisition, rehab, rental cash flow, cash-out refinance, net capital left, and infinite return without paywalls.',
    canonical: '/brrrr-calculator',
  },
  '/brrrr-method-calculator': {
    title: 'BRRRR Method Strategy & Cash-Out Refi Calculator | TableView',
    description:
      'Comprehensive 4-phase BRRRR calculator for real estate investors. Underwrite purchase, rehab holding costs, tenant stabilization, and 30-year cash-out refinance.',
    canonical: '/brrrr-method-calculator',
  },
  '/section-1031-exchange-calculator': {
    title: '1031 Exchange Calculator: Boot & Capital Gains | TableView',
    description:
      'Free in-browser 1031 exchange calculator. Compute realized gain, cash and mortgage boot, deferred gain and the tax you actually owe, plus the 45-day identification and 180-day exchange deadlines. Nothing is uploaded.',
    canonical: '/section-1031-exchange-calculator',
  },
  '/loan-comparison-calculator': {
    title: 'Loan Comparison Calculator: Side-by-Side | TableView',
    description:
      'Compare two loans side-by-side. Calculate monthly payment differences, lifetime interest savings, break-even on discount points, and total costs with Excel export.',
    canonical: '/loan-comparison-calculator',
  },
  '/commercial-loan-calculator': {
    title: 'Commercial Real Estate Loan Calculator | TableView',
    description:
      'Calculate commercial mortgage payments, balloon payment at maturity, interest-only options, and loan balance with instant Excel schedule export.',
    canonical: '/commercial-loan-calculator',
  },
  '/salary-to-hourly-calculator': {
    title: 'Salary to Hourly Calculator & Paycheck Matrix | TableView',
    description:
      'Convert annual salary to hourly wage, daily, weekly, bi-weekly (26x), and monthly paycheck. Compute FLSA 1.5x overtime and PTO value with Excel export.',
    canonical: '/salary-to-hourly-calculator',
  },
  '/finance-calculator': {
    title: 'Real Estate & Lending Underwriting Calculators | TableView',
    description:
      'Free, 100% private in-browser underwriting calculators for real estate investors and lenders. Model mortgages, DSCR rental loans, cap rates, BRRRR, hard money and fix-and-flip deals, 1031 exchanges, and commercial debt.',
    canonical: '/finance-calculator',
  },
  '/amortization-schedule-calculator': {
    title: 'Loan Amortization Schedule Calculator | TableView',
    description:
      'Free online loan amortization schedule calculator. Generate complete monthly and annual principal and interest payment breakdown tables with extra payoff modeling and Excel export.',
    canonical: '/amortization-schedule-calculator',
  },
  '/mortgage-payoff-calculator': {
    title: 'Early Mortgage Payoff Calculator | TableView',
    description:
      'Calculate how much time and interest you save by making extra monthly or lump-sum principal payments on your mortgage. Free in-browser tool with interactive schedules.',
    canonical: '/mortgage-payoff-calculator',
  },
  '/cash-out-refinance-calculator': {
    title: 'Cash-Out Refinance Calculator & Break-Even | TableView',
    description:
      'Calculate cash-out refinance borrowing capacity, new monthly payments, closing cost break-even, and net cash in hand from home equity. 100% private in-browser tool.',
    canonical: '/cash-out-refinance-calculator',
  },
  '/balloon-payment-calculator': {
    title: 'Commercial Balloon Payment Calculator | TableView',
    description:
      'Calculate remaining balloon balance at loan maturity for 5, 7, or 10-year commercial mortgages with 20-30 year amortization schedules. Free in-browser tool.',
    canonical: '/balloon-payment-calculator',
  },
  '/1031-exchange-timeline-calculator': {
    title: '1031 Exchange Deadline Calculator (45/180 Days) | TableView',
    description:
      'Calculate exact statutory 45-day identification and 180-day closing deadlines for IRS Section 1031 like-kind property exchanges. Includes weekend rules and boot tax.',
    canonical: '/1031-exchange-timeline-calculator',
  },
};

/** Meta for the informational / legal pages. */
export const STATIC_PAGE_META: Record<string, PageMeta> = {
  '/about': {
    title: 'About TableView: Institutional Real Estate & Lending Underwriting',
    description: 'Learn about TableView.dev and our 100% private, client-side financial underwriting architecture.',
    canonical: '/about',
  },
  '/contact': {
    title: 'Contact & Feedback | TableView.dev',
    description: 'Contact the TableView financial engineering team.',
    canonical: '/contact',
  },
  '/privacy': {
    title: 'Privacy Policy | TableView.dev',
    description: 'TableView privacy policy: 100% local processing with zero server file storage.',
    canonical: '/privacy',
  },
  '/privacy-policy': {
    title: 'Privacy Policy | TableView.dev',
    description: 'TableView privacy policy: 100% local processing with zero server file storage.',
    canonical: '/privacy-policy',
  },
  '/terms': {
    title: 'Terms of Service | TableView.dev',
    description: 'TableView terms of service.',
    canonical: '/terms',
  },
  '/terms-of-service': {
    title: 'Terms of Service | TableView.dev',
    description: 'TableView terms of service.',
    canonical: '/terms-of-service',
  },
  '/disclaimer': {
    title: 'Disclaimer & Disclosure | TableView.dev',
    description:
      'Legal disclaimers, financial calculation disclosures, and terms of informational use for TableView.dev.',
    canonical: '/disclaimer',
  },
  '/pricing': {
    title: 'Pricing & Plans: Free, Single Deal Pass & Pro | TableView',
    description:
      'Transparent pricing for financial underwriting. 10+ free calculators with 100% in-browser privacy, $9.99 Single Deal Pass, or TableView Pro ($19/mo) for unlimited white-label deliverables.',
    canonical: '/pricing',
  },
  '/upgrade': {
    title: 'Upgrade to TableView Pro | Unlimited Institutional Deliverables',
    description:
      'Upgrade to TableView Pro for unlimited watermark-free PDF Pre-Approval Dossiers, live formula Excel models, and custom white-label branding.',
    canonical: '/pricing',
  },
  '/account': {
    title: 'My Account & Subscriptions | TableView.dev',
    description:
      'Manage your TableView membership, billing, unlocked single deal passes, saved calculation models, and broker white-label branding profile.',
    canonical: '/account',
  },
  '/profile': {
    title: 'My Account & Subscriptions | TableView.dev',
    description:
      'Manage your TableView membership, billing, unlocked single deal passes, saved calculation models, and broker white-label branding profile.',
    canonical: '/account',
  },
};

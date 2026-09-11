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
  title: 'TableView.dev — Browser Data Workspace for CSV, Excel, Parquet & JSON',
  description:
    '100% private in-browser data workspace. View, query with SQL, and convert CSV, Excel (.xlsx), Apache Parquet, and JSON files directly in your browser with zero server uploads.',
  canonical: '/',
};

export const GUIDES_HUB_META: PageMeta = {
  title: 'Apache Parquet & DuckDB Guides | TableView.dev',
  description:
    'In-depth technical guides, architecture comparisons, and performance benchmarks for Apache Parquet, DuckDB-Wasm, and columnar formats.',
  canonical: '/guides',
};

/** Meta for the six dedicated calculators plus the finance hub. */
export const CALCULATOR_META: Record<string, PageMeta> = {
  '/mortgage-calculator': {
    title: 'Mortgage Calculator - Real Estate Home Loan & Amortization Tool | TableView.dev',
    description:
      'Free, 100% private in-browser mortgage calculator. Calculate monthly payments with PMI, property taxes, home insurance, and HOA fees. Includes interactive amortization schedules and Excel/CSV export.',
    canonical: '/mortgage-calculator',
  },
  '/dscr-loan-calculator': {
    title: 'DSCR Loan Calculator — Free BiggerPockets Alternative & Investor Tool | TableView.dev',
    description:
      'Free in-browser DSCR loan calculator and BiggerPockets Pro alternative without paywalls. Calculate debt service coverage ratio, maximum qualifying loan amount, cash flow, and amortization with Excel export.',
    canonical: '/dscr-loan-calculator',
  },
  '/hard-money-calculator': {
    title: 'Hard Money Loan Calculator — Free DealCheck Alternative & Fix-Flip ROI Tool | TableView.dev',
    description:
      'Free in-browser Hard Money Loan calculator and DealCheck alternative. Calculate points, interest-only holding costs, 70% rule Maximum Allowable Offer (MAO), net flip profit, and annualized ROI without subscriptions.',
    canonical: '/hard-money-calculator',
  },
  '/refinance-calculator': {
    title: 'Mortgage Refinance Break-Even Calculator - SmartAsset & Bankrate Alternative | TableView.dev',
    description:
      'Free, 100% private in-browser mortgage refinance break-even calculator. Compare monthly savings, net equity break-even, roll-in closing costs, and 30-year reset clock warnings without broker ads or lead forms.',
    canonical: '/refinance-calculator',
  },
  '/snowflake-cost-calculator': {
    title: 'Snowflake Cost Calculator — Warehouse Sizing, Credits & FinOps Estimator | TableView.dev',
    description:
      'Free in-browser Snowflake cost and credit calculator. Estimate monthly compute, multi-cluster warehouse autoscaling, storage, and auto-suspend FinOps savings.',
    canonical: '/snowflake-cost-calculator',
  },
  '/parquet-storage-calculator': {
    title: 'Parquet Cloud Storage & Query Savings Calculator — AWS S3 & Athena Cost Tool | TableView.dev',
    description:
      'Calculate exact cloud bill savings by converting CSV, JSON, or text logs to Apache Parquet. Estimate AWS S3 storage reduction and Athena/BigQuery scan savings.',
    canonical: '/parquet-storage-calculator',
  },
  '/section-1031-exchange-calculator': {
    title: '1031 Exchange Calculator — Boot, Deferred Gain & 45/180-Day Deadlines | TableView.dev',
    description:
      'Free in-browser 1031 exchange calculator. Compute realized gain, cash and mortgage boot, deferred gain and the tax you actually owe, plus the 45-day identification and 180-day exchange deadlines. Nothing is uploaded.',
    canonical: '/section-1031-exchange-calculator',
  },
  '/finance-calculator': {
    title: 'Financial Calculators Hub - Free Personal Finance & Loan Tools | TableView.dev',
    description:
      'Free, 100% private in-browser financial planning calculators. Calculate auto loans, personal loans, compound savings interest, and credit card payoff strategies.',
    canonical: '/finance-calculator',
  },
};

/** Meta for the informational / legal pages. */
export const STATIC_PAGE_META: Record<string, PageMeta> = {
  '/about': {
    title: 'About TableView.dev — In-Browser Data Processing',
    description: 'Learn about TableView.dev and our client-side architecture.',
    canonical: '/about',
  },
  '/contact': {
    title: 'Contact & Feedback | TableView.dev',
    description: 'Contact the TableView engineering team.',
    canonical: '/contact',
  },
  '/privacy': {
    title: 'Privacy Policy | TableView.dev',
    description: 'TableView privacy policy: 100% local processing with zero server file storage.',
    canonical: '/privacy',
  },
  '/terms': {
    title: 'Terms of Service | TableView.dev',
    description: 'TableView terms of service.',
    canonical: '/terms',
  },
  '/disclaimer': {
    title: 'Disclaimer & Disclosure | TableView.dev',
    description:
      'Legal disclaimers, financial calculation disclosures, and terms of informational use for TableView.dev.',
    canonical: '/disclaimer',
  },
};

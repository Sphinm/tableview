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
  title: 'TableView.dev: 100% Private In-Browser Financial & Commercial Modeling Engine',
  description:
    'Institutional debt modeling, commercial real estate underwriting, IRC §1031 tax deferral, and payroll analytics running 100% client-side in WebAssembly. Zero server uploads.',
  canonical: '/',
};

export const DATA_TOOLS_META: PageMeta = {
  title: 'In-Browser Data Workbench & DuckDB SQL Console | TableView.dev',
  description:
    '100% private in-browser data workspace. Inspect, convert, and query large CSV, Excel (.xlsx), Apache Parquet, and JSON files with DuckDB-Wasm SIMD. Zero server uploads.',
  canonical: '/data-tools',
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
    title: 'DSCR Loan Calculator: Free BiggerPockets Alternative & Investor Tool | TableView.dev',
    description:
      'Free in-browser DSCR loan calculator and BiggerPockets Pro alternative without paywalls. Calculate debt service coverage ratio, maximum qualifying loan amount, cash flow, and amortization with Excel export.',
    canonical: '/dscr-loan-calculator',
  },
  '/hard-money-calculator': {
    title: 'Hard Money Loan Calculator: Free DealCheck Alternative & Fix-Flip ROI Tool | TableView.dev',
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
    title: 'Snowflake Cost Calculator: Warehouse Sizing, Credits & FinOps Estimator | TableView.dev',
    description:
      'Free in-browser Snowflake cost and credit calculator. Estimate monthly compute, multi-cluster warehouse autoscaling, storage, and auto-suspend FinOps savings.',
    canonical: '/snowflake-cost-calculator',
  },
  '/parquet-storage-calculator': {
    title: 'Parquet Cloud Storage & Query Savings Calculator: AWS S3 & Athena Cost Tool | TableView.dev',
    description:
      'Calculate exact cloud bill savings by converting CSV, JSON, or text logs to Apache Parquet. Estimate AWS S3 storage reduction and Athena/BigQuery scan savings.',
    canonical: '/parquet-storage-calculator',
  },
  '/section-1031-exchange-calculator': {
    title: '1031 Exchange Calculator: Boot, Deferred Gain & 45/180-Day Deadlines | TableView.dev',
    description:
      'Free in-browser 1031 exchange calculator. Compute realized gain, cash and mortgage boot, deferred gain and the tax you actually owe, plus the 45-day identification and 180-day exchange deadlines. Nothing is uploaded.',
    canonical: '/section-1031-exchange-calculator',
  },
  '/loan-comparison-calculator': {
    title: 'Loan Comparison Calculator: Side-by-Side Payment & Interest Analysis | TableView.dev',
    description:
      'Compare two loans side-by-side. Calculate monthly payment differences, lifetime interest savings, break-even on discount points, and total costs with Excel export.',
    canonical: '/loan-comparison-calculator',
  },
  '/commercial-loan-calculator': {
    title: 'Commercial Real Estate Loan & Balloon Payment Calculator | TableView.dev',
    description:
      'Calculate commercial mortgage payments, balloon payment at maturity, interest-only options, and loan balance with instant Excel schedule export.',
    canonical: '/commercial-loan-calculator',
  },
  '/salary-to-hourly-calculator': {
    title: 'Salary to Hourly Calculator: Convert Paycheck, Overtime & Wage Matrix | TableView.dev',
    description:
      'Convert annual salary to hourly wage, daily, weekly, bi-weekly (26x), and monthly paycheck. Compute FLSA 1.5x overtime and PTO value with Excel export.',
    canonical: '/salary-to-hourly-calculator',
  },
  '/json-formatter': {
    title: 'JSON Formatter, Validator & Beautifier Online: 100% Client-Side | TableView.dev',
    description:
      'Format, indent, validate, and minify JSON online. 100% private in-browser tool with line and column syntax error detection. Zero server uploads.',
    canonical: '/json-formatter',
  },
  '/sql-formatter': {
    title: 'SQL Formatter, Beautifier & Minifier Online: DuckDB, Postgres & MySQL | TableView.dev',
    description:
      'Beautify, indent, format, and minify SQL queries online. Supports DuckDB, PostgreSQL, MySQL, SQLite, Snowflake, and BigQuery. 100% in-browser.',
    canonical: '/sql-formatter',
  },
  '/finance-calculator': {
    title: 'Financial Calculators Hub - Free Personal Finance & Loan Tools | TableView.dev',
    description:
      'Free, 100% private in-browser financial planning calculators. Calculate auto loans, personal loans, compound savings interest, and credit card payoff strategies.',
    canonical: '/finance-calculator',
  },
  '/amortization-schedule-calculator': {
    title: 'Loan Amortization Schedule Calculator: Monthly Principal & Interest Breakdown | TableView.dev',
    description:
      'Free online loan amortization schedule calculator. Generate complete monthly and annual principal and interest payment breakdown tables with extra payoff modeling and Excel export.',
    canonical: '/amortization-schedule-calculator',
  },
  '/mortgage-payoff-calculator': {
    title: 'Early Mortgage Payoff Calculator: Extra Principal & Interest Savings | TableView.dev',
    description:
      'Calculate how much time and interest you save by making extra monthly or lump-sum principal payments on your mortgage. Free in-browser tool with interactive schedules.',
    canonical: '/mortgage-payoff-calculator',
  },
  '/cash-out-refinance-calculator': {
    title: 'Cash-Out Refinance Calculator: Home Equity Extraction & Break-Even | TableView.dev',
    description:
      'Calculate cash-out refinance borrowing capacity, new monthly payments, closing cost break-even, and net cash in hand from home equity. 100% private in-browser tool.',
    canonical: '/cash-out-refinance-calculator',
  },
  '/balloon-payment-calculator': {
    title: 'Commercial Balloon Payment Calculator: Maturity Balance & Debt Yield | TableView.dev',
    description:
      'Calculate remaining balloon balance at loan maturity for 5, 7, or 10-year commercial mortgages with 20-30 year amortization schedules. Free in-browser tool.',
    canonical: '/balloon-payment-calculator',
  },
  '/1031-exchange-timeline-calculator': {
    title: '1031 Exchange Deadline Calculator: 45-Day Identification & 180-Day Close | TableView.dev',
    description:
      'Calculate exact statutory 45-day identification and 180-day closing deadlines for IRS Section 1031 like-kind property exchanges. Includes weekend rules and boot tax.',
    canonical: '/1031-exchange-timeline-calculator',
  },
};

/** Meta for the informational / legal pages. */
export const STATIC_PAGE_META: Record<string, PageMeta> = {
  '/data-tools': DATA_TOOLS_META,
  '/about': {
    title: 'About TableView.dev: In-Browser Data Processing',
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
  '/video-compressor': {
    title: 'Free Online Video Compressor: 100% In-Browser & No Watermark | TableView.dev',
    description:
      'Fast online video compressor with zero server upload. Reduce MP4, MOV, WebM, and MKV file size with preset quality or exact target MB. 100% private in-browser.',
    canonical: '/video-compressor',
  },
  '/image-compressor': {
    title: 'Free Online Image Compressor: Batch JPG, PNG, WebP & ZIP Export | TableView.dev',
    description:
      'Batch compress images online without quality loss. Supports JPEG, PNG, and WebP with before/after visual comparison and 1-click ZIP packaging.',
    canonical: '/image-compressor',
  },
  '/compress-mp4': {
    title: 'Compress MP4 Video Online Free: Reduce MP4 File Size No Watermark | TableView.dev',
    description:
      'Free online MP4 compressor. Shrink MP4 video file size up to 90% in your browser with WebAssembly FFmpeg. Zero uploads, zero watermarks, and custom target MB.',
    canonical: '/compress-mp4',
  },
  '/compress-video-for-discord': {
    title: 'Compress Video for Discord (25MB & 50MB): Free Online Wasm Compressor | TableView.dev',
    description:
      'Compress video for Discord free online. Easily reduce video size below Discord\'s 25MB or 50MB file size limit with high visual quality and no watermarks.',
    canonical: '/compress-video-for-discord',
  },
  '/compress-png': {
    title: 'Compress PNG Online Free: Lossless & Lossy Alpha Image Compressor | TableView.dev',
    description:
      'Compress PNG images online with full transparency support. Reduce PNG file size by up to 70% in your browser tab without uploading photos to external servers.',
    canonical: '/compress-png',
  },
  '/compress-jpg': {
    title: 'Compress JPG & JPEG Images Online: Fast In-Browser Photo Shrinker | TableView.dev',
    description:
      'Compress JPG and JPEG photos online for free. Adjust compression quality, resize dimensions, and batch download optimized images as a ZIP file.',
    canonical: '/compress-jpg',
  },
  '/compress-webp': {
    title: 'Compress WebP Images Online: Free Client-Side WebP Optimizer | TableView.dev',
    description:
      'Compress and optimize WebP images directly in your browser. Reduce file size while preserving high visual fidelity and alpha transparency. 100% private.',
    canonical: '/compress-webp',
  },
  '/is-it-down': {
    title: 'Is It Down Right Now? Free Website Status & Uptime Checker | TableView.dev',
    description:
      'Check if a website is down for everyone or just you. Instant real-time server status and response code tested from global edge nodes.',
    canonical: '/is-it-down',
  },
};

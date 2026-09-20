/**
 * Single source of truth for per-route <title>, <meta name="description"> and
 * canonical URL.
 *
 * Both the runtime (page components) and the build-time prerenderer read from
 * here, so the static HTML a crawler receives can never drift from what the SPA
 * produces after hydration.
 *
 * Scope: data/FinOps routes owned by tools.tableview.dev only. Finance
 * calculators, salary long-tail, and media compression live in apps/finance
 * and apps/compressor respectively.
 */
export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
}

export const HOME_META: PageMeta = {
  title: 'TableView Data Tools — In-Browser Parquet Viewer & DuckDB SQL Workbench',
  description:
    '100% private in-browser data workspace. Inspect, convert, and query large CSV, Excel (.xlsx), Apache Parquet, and JSON files with DuckDB-Wasm. Zero server uploads.',
  canonical: '/',
};

export const DATA_TOOLS_META: PageMeta = {
  title: 'In-Browser Data Workbench & DuckDB SQL | TableView',
  description:
    '100% private in-browser data workspace. Inspect, convert, and query large CSV, Excel (.xlsx), Apache Parquet, and JSON files with DuckDB-Wasm SIMD. Zero server uploads.',
  canonical: '/data-tools',
};

export const DATA_CONVERTER_META: PageMeta = {
  title: 'Convert CSV, Excel, Parquet & JSON Online | TableView',
  description:
    'Convert datasets between Apache Parquet, Microsoft Excel (.xlsx), CSV, and JSON 100% in your browser. Powered by DuckDB-Wasm, ZSTD columnar compression, zero server uploads, completely private.',
  canonical: '/data-converter',
};

export const GUIDES_HUB_META: PageMeta = {
  title: 'Apache Parquet & DuckDB Guides | TableView.dev',
  description:
    'In-depth technical guides, architecture comparisons, and performance benchmarks for Apache Parquet, DuckDB-Wasm, and columnar formats.',
  canonical: '/guides',
};

/** Meta for the four tools-owned calculators and formatters. */
export const CALCULATOR_META: Record<string, PageMeta> = {
  '/snowflake-cost-calculator': {
    title: 'Snowflake Cost & Credit Calculator | TableView',
    description:
      'Free in-browser Snowflake cost and credit calculator. Estimate monthly compute, multi-cluster warehouse autoscaling, storage, and auto-suspend FinOps savings.',
    canonical: '/snowflake-cost-calculator',
  },
  '/parquet-storage-calculator': {
    title: 'Parquet S3 & Athena Cloud Savings Calculator | TableView',
    description:
      'Calculate exact cloud bill savings by converting CSV, JSON, or text logs to Apache Parquet. Estimate AWS S3 storage reduction and Athena/BigQuery scan savings.',
    canonical: '/parquet-storage-calculator',
  },
  '/json-formatter': {
    title: 'Online JSON Formatter & Validator | TableView',
    description:
      'Format, indent, validate, and minify JSON online. 100% private in-browser tool with line and column syntax error detection. Zero server uploads.',
    canonical: '/json-formatter',
  },
  '/sql-formatter': {
    title: 'Online SQL Formatter & Beautifier | TableView',
    description:
      'Beautify, indent, format, and minify SQL queries online. Supports DuckDB, PostgreSQL, MySQL, SQLite, Snowflake, and BigQuery. 100% in-browser.',
    canonical: '/sql-formatter',
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
  '/is-it-down': {
    title: 'Is It Down Right Now? Website Uptime Checker | TableView',
    description:
      'Check if a website is down for everyone or just you. Instant real-time server status and response code tested from global edge nodes.',
    canonical: '/is-it-down',
  },
  '/data-converter': DATA_CONVERTER_META,
};

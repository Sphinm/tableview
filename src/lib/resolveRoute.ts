import { TOOLS_CONFIG } from '../data/tools';
import { isGuideSlug, GUIDE_SLUGS } from '../data/guideSlugs';
import { SALARY_LONG_TAIL_MAP, SALARY_LONG_TAIL_PAGES } from '../data/salaryLongTail';

export interface RouteState {
  path: string;
  slug?: string;
}

/**
 * Keyword aliases mapping high-intent search URLs onto the canonical tool page.
 * Kept in a pure module so the build-time prerenderer and the runtime router
 * resolve every alias to exactly the same destination.
 */
export const TOOL_ALIASES: Record<string, string> = {
  'open-csv': 'csv-viewer',
  'csv': 'csv-viewer',
  'view-csv': 'csv-viewer',
  'csv-reader': 'csv-viewer',
  'open-excel': 'excel-viewer',
  'xlsx-viewer': 'excel-viewer',
  'xls-viewer': 'excel-viewer',
  'excel': 'excel-viewer',
  'open-parquet': 'parquet-viewer',
  'parquet-reader': 'parquet-viewer',
  'sql': 'sql-workbench',
  'sql-on-csv': 'sql-workbench',
  'sql-on-parquet': 'sql-workbench',
  'query-csv': 'sql-workbench',
  'query-parquet': 'sql-workbench',
  'csv-sql': 'sql-workbench',
  'sql-runner': 'sql-workbench',
  'sql-on-csv-parquet': 'sql-workbench',
  'duckdb': 'sql-workbench',
  'sql-console': 'sql-workbench',
  'convert-parquet-to-csv': 'parquet-to-csv',
  'convert-csv-to-parquet': 'csv-to-parquet',
  'convert-csv-to-excel': 'csv-to-excel',
  'convert-excel-to-csv': 'excel-to-csv',
  'ndjson-viewer': 'json-viewer',
  'jsonl-viewer': 'json-viewer',
};

/** Calculator / hub URL families, each mapped to its canonical route. */
const CALCULATOR_ROUTES: { pattern: RegExp; path: string }[] = [
  { pattern: /^\/(?:tools\/)?(?:mortgage-calculator|mortgage)$/, path: '/mortgage-calculator' },
  {
    // The optional .php suffix applies to BOTH forms. It previously hung off the
    // `calculators/` alternative only, so /should-i-refinance.php fell through
    // and rendered a 404 page.
    pattern: /^\/(?:tools\/)?(?:refinance-calculator|refinance|(?:calculators\/)?should-i-refinance(?:\.php)?)$/,
    path: '/refinance-calculator',
  },
  { pattern: /^\/(?:tools\/)?(?:dscr-loan-calculator|dscr-calculator|dscr)$/, path: '/dscr-loan-calculator' },
  {
    pattern: /^\/(?:tools\/)?(?:hard-money-calculator|hard-money-loan-calculator|fix-and-flip-calculator|hard-money)$/,
    path: '/hard-money-calculator',
  },
  {
    pattern: /^\/(?:tools\/)?(?:snowflake-cost-calculator|snowflake-calculator|snowflake-warehouse-calculator)$/,
    path: '/snowflake-cost-calculator',
  },
  {
    pattern: /^\/(?:tools\/)?(?:parquet-storage-calculator|parquet-savings-calculator|parquet-cost-calculator)$/,
    path: '/parquet-storage-calculator',
  },
  {
    // 1031 / like-kind exchange. "1031" alone is a real search term, and
    // "like-kind-exchange" is the statutory phrasing.
    pattern:
      /^\/(?:tools\/)?(?:section-1031-exchange-calculator|1031-exchange-calculator|1031-calculator|like-kind-exchange-calculator|1031-exchange|1031)$/,
    path: '/section-1031-exchange-calculator',
  },
  {
    pattern: /^\/(?:tools\/)?(?:loan-comparison-calculator|loan-compare|compare-loans|loan-comparison)$/,
    path: '/loan-comparison-calculator',
  },
  {
    pattern:
      /^\/(?:tools\/)?(?:commercial-loan-calculator|commercial-mortgage-calculator|balloon-payment-calculator|commercial-property-loan-calculator|commercial-real-estate-loan-calculator)$/,
    path: '/commercial-loan-calculator',
  },
  {
    pattern:
      /^\/(?:tools\/)?(?:salary-to-hourly-calculator|hourly-to-salary-calculator|salary-to-hourly|hourly-to-salary|salary-calculator)$/,
    path: '/salary-to-hourly-calculator',
  },
  {
    pattern: /^\/(?:tools\/)?(?:json-formatter|json-beautifier|json-validator|json-viewer-online|format-json)$/,
    path: '/json-formatter',
  },
  {
    pattern: /^\/(?:tools\/)?(?:sql-formatter|sql-beautifier|sql-minify|format-sql)$/,
    path: '/sql-formatter',
  },
  { pattern: /^\/(?:finance-calculator|calculators|financial-calculators|calculator)$/, path: '/finance-calculator' },
];

/** Informational page aliases. */
const STATIC_ALIASES: { pattern: RegExp; path: string }[] = [
  { pattern: /^\/(?:privacy|privacy-policy)$/, path: '/privacy' },
  { pattern: /^\/(?:terms|terms-of-service|tos)$/, path: '/terms' },
  { pattern: /^\/(?:about|about-us)$/, path: '/about' },
  { pattern: /^\/(?:contact|contact-us|support)$/, path: '/contact' },
];

const GUIDE_HUB_PATTERN = /^\/(?:guides|guide|docs|blog|articles?)$/;
const GUIDE_DETAIL_PATTERN = /^\/(?:guides|guide|docs|blog|articles?)\/([a-zA-Z0-9_-]+)$/;

/** Data Workbench aliases. */
const WORKBENCH_PATTERN = /^\/(?:data-tools|data-workbench|workbench|tools|converters|viewers)$/;

/**
 * Pure path -> route resolution. No window, no DOM: safe to run in the browser,
 * in unit tests, and inside the build-time prerenderer.
 *
 * @param cleanPath pathname only — already stripped of query/hash, trailing slash removed
 */
export function resolveRoutePath(cleanPath: string): RouteState {
  const raw = !cleanPath ? '/' : cleanPath;

  for (const { pattern, path } of CALCULATOR_ROUTES) {
    if (pattern.test(raw)) return { path };
  }

  for (const { pattern, path } of STATIC_ALIASES) {
    if (pattern.test(raw)) return { path };
  }

  if (SALARY_LONG_TAIL_MAP[raw]) {
    return { path: '/salary-to-hourly-calculator', slug: SALARY_LONG_TAIL_MAP[raw].slug };
  }

  const potentialToolSlug = raw.startsWith('/tools/') ? raw.replace('/tools/', '') : raw.slice(1);
  const resolvedToolSlug = TOOL_ALIASES[potentialToolSlug] || potentialToolSlug;

  if (resolvedToolSlug && TOOLS_CONFIG[resolvedToolSlug]) {
    return { path: '/tools/:toolSlug', slug: resolvedToolSlug };
  }

  const guideMatch = raw.match(GUIDE_DETAIL_PATTERN);
  if (guideMatch) {
    return { path: '/guides/:slug', slug: guideMatch[1] };
  }

  // Direct guide slugs indexed by search engines (e.g. /what-is-apache-parquet)
  const potentialGuideSlug = raw.startsWith('/') ? raw.slice(1) : raw;
  if (isGuideSlug(potentialGuideSlug)) {
    return { path: '/guides/:slug', slug: potentialGuideSlug };
  }

  if (GUIDE_HUB_PATTERN.test(raw)) {
    return { path: '/guides' };
  }

  if (WORKBENCH_PATTERN.test(raw)) {
    return { path: '/data-tools' };
  }

  return { path: raw };
}

/**
 * Route keys the app renders a real page for. Anything outside this set is a
 * genuine 404 and must be marked noindex, because Cloudflare Pages' SPA
 * fallback answers unknown paths with HTTP 200 (soft-404 index bloat).
 *
 * NOTE: '/guides/:slug' belongs here. App's meta effect runs *after* the
 * child page's own updatePageMeta call (React fires child effects first), so a
 * missing entry here would silently stamp noindex onto every guide.
 */
export const KNOWN_ROUTES: ReadonlySet<string> = new Set([
  '/',
  '/data-tools',
  '/tools/:toolSlug',
  '/guides',
  '/guides/:slug',
  '/finance-calculator',
  '/calculator',
  '/mortgage-calculator',
  '/refinance-calculator',
  '/dscr-loan-calculator',
  '/hard-money-calculator',
  '/snowflake-cost-calculator',
  '/parquet-storage-calculator',
  '/section-1031-exchange-calculator',
  '/loan-comparison-calculator',
  '/commercial-loan-calculator',
  '/salary-to-hourly-calculator',
  ...SALARY_LONG_TAIL_PAGES.map((p) => p.path),
  '/json-formatter',
  '/sql-formatter',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/disclaimer',
]);

export function isKnownRoute(path: string): boolean {
  return KNOWN_ROUTES.has(path);
}

/**
 * Checks if a given path or alias represents any calculator page
 * (including commercial, mortgage, refinance, dscr, salary long-tail, etc.).
 */
export function isCalculatorRoute(currentPath: string): boolean {
  if (!currentPath) return false;
  return (
    currentPath.includes('calculator') ||
    currentPath.includes('refinance') ||
    currentPath.includes('mortgage') ||
    currentPath.includes('dscr') ||
    currentPath.includes('hard-money') ||
    currentPath.includes('snowflake') ||
    currentPath.includes('loan') ||
    currentPath.includes('exchange') ||
    currentPath.includes('salary') ||
    currentPath.includes('how-much-an-hour')
  );
}

/**
 * Every URL that must exist as a prerendered static file, with the canonical
 * path it should advertise. Aliases are emitted too (they are real search
 * entry points) but always point their canonical tag at the primary route.
 */
export function listPrerenderTargets(): { url: string; canonical: string }[] {
  const targets = new Map<string, string>();

  const add = (url: string, canonical: string) => {
    if (!targets.has(url)) targets.set(url, canonical);
  };

  // Homepage (Financial Modeling Engine)
  add('/', '/');

  // Secondary Data Tools Workbench & Aliases
  add('/data-tools', '/data-tools');
  add('/workbench', '/data-tools');
  add('/tools', '/data-tools');
  add('/viewers', '/data-tools');
  add('/converters', '/data-tools');

  // Tool landing pages (canonical paths)
  for (const slug of Object.keys(TOOLS_CONFIG)) {
    add(`/${slug}`, `/${slug}`);
  }

  // Keyword aliases -> canonical tool page
  for (const [alias, slug] of Object.entries(TOOL_ALIASES)) {
    add(`/${alias}`, `/${slug}`);
  }

  // Calculator aliases
  const calculatorAliases: Record<string, string[]> = {
    '/mortgage-calculator': ['/mortgage'],
    '/refinance-calculator': [
      '/refinance',
      '/should-i-refinance',
      '/should-i-refinance.php',
      '/calculators/should-i-refinance.php',
    ],
    '/dscr-loan-calculator': ['/dscr', '/dscr-calculator'],
    '/hard-money-calculator': ['/hard-money', '/fix-and-flip-calculator', '/hard-money-loan-calculator'],
    '/snowflake-cost-calculator': ['/snowflake-calculator', '/snowflake-warehouse-calculator'],
    '/parquet-storage-calculator': ['/parquet-savings-calculator', '/parquet-cost-calculator'],
    '/finance-calculator': ['/calculators', '/financial-calculators', '/calculator'],
    '/section-1031-exchange-calculator': [
      '/1031',
      '/1031-exchange',
      '/1031-calculator',
      '/1031-exchange-calculator',
      '/like-kind-exchange-calculator',
    ],
    '/loan-comparison-calculator': ['/loan-compare', '/compare-loans', '/loan-comparison'],
    '/commercial-loan-calculator': [
      '/commercial-mortgage-calculator',
      '/balloon-payment-calculator',
      '/commercial-property-loan-calculator',
      '/commercial-real-estate-loan-calculator',
    ],
    '/salary-to-hourly-calculator': [
      '/hourly-to-salary-calculator',
      '/salary-to-hourly',
      '/hourly-to-salary',
      '/salary-calculator',
    ],
    '/json-formatter': ['/json-beautifier', '/json-validator', '/json-viewer-online', '/format-json'],
    '/sql-formatter': ['/sql-beautifier', '/sql-minify', '/format-sql'],
  };
  for (const [canonical, aliases] of Object.entries(calculatorAliases)) {
    // The canonical itself must exist too — /finance-calculator is not in
    // TOOLS_CONFIG, so without this its aliases pointed at a missing page.
    add(canonical, canonical);
    for (const alias of aliases) add(alias, canonical);
  }

  // Programmatic Salary Long-Tail Pages
  for (const page of SALARY_LONG_TAIL_PAGES) {
    add(page.path, page.path);
  }

  // Guides
  add('/guides', '/guides');
  for (const slug of GUIDE_SLUGS) {
    add(`/guides/${slug}`, `/guides/${slug}`);
    add(`/${slug}`, `/guides/${slug}`);
  }

  // Informational
  for (const path of ['/about', '/contact', '/privacy', '/terms', '/disclaimer']) {
    add(path, path);
  }
  add('/privacy-policy', '/privacy');
  add('/terms-of-service', '/terms');
  add('/about-us', '/about');
  add('/contact-us', '/contact');

  return [...targets].map(([url, canonical]) => ({ url, canonical }));
}

// Re-exported for the prerenderer; importing data/guides.ts here would pull the
// article bodies into the router's module graph.
export { GUIDE_SLUGS };

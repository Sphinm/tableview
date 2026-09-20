import { TOOLS_CONFIG } from '../data/tools';
import { isGuideSlug, GUIDE_SLUGS } from '../data/guideSlugs';

export interface RouteState {
  path: string;
  slug?: string;
}

/**
 * Keyword aliases mapping high-intent search URLs onto the canonical tool page.
 * Kept in a pure module so the build-time prerenderer and the runtime router
 * resolve every alias to exactly the same destination.
 *
 * Scope: data-tools aliases only (tools.tableview.dev). Finance and media
 * aliases live in apps/finance and apps/compressor respectively.
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
  'convert-json-to-csv': 'json-to-csv',
  'convert-json-to-excel': 'json-to-excel',
  'convert-excel-to-json': 'excel-to-json',
  'convert-tsv-to-csv': 'tsv-viewer',
  'tsv': 'tsv-viewer',
  'view-tsv': 'tsv-viewer',
  'tsv-reader': 'tsv-viewer',
  'geoparquet': 'geoparquet-viewer',
  'ndjson-viewer': 'json-viewer',
  'jsonl-viewer': 'json-viewer',
};

/** FinOps / formatter URL families, each mapped to its canonical route. */
const CALCULATOR_ROUTES: { pattern: RegExp; path: string }[] = [
  {
    pattern: /^\/(?:tools\/)?(?:snowflake-cost-calculator|snowflake-calculator|snowflake-warehouse-calculator)$/,
    path: '/snowflake-cost-calculator',
  },
  {
    pattern: /^\/(?:tools\/)?(?:parquet-storage-calculator|parquet-savings-calculator|parquet-cost-calculator)$/,
    path: '/parquet-storage-calculator',
  },
  {
    pattern: /^\/(?:tools\/)?(?:json-formatter|json-beautifier|json-validator|json-viewer-online|format-json)$/,
    path: '/json-formatter',
  },
  {
    pattern: /^\/(?:tools\/)?(?:sql-formatter|sql-beautifier|sql-minify|format-sql)$/,
    path: '/sql-formatter',
  },
  {
    pattern: /^\/(?:tools\/)?is-it-down$/,
    path: '/is-it-down',
  },
  { pattern: /^\/(?:tools\/)?(?:data-converter|converter|converters|format-converter)$/, path: '/data-converter' },
];

/** Informational page aliases. */
const STATIC_ALIASES: { pattern: RegExp; path: string }[] = [
  { pattern: /^\/(?:privacy|privacy-policy)$/, path: '/privacy' },
  { pattern: /^\/(?:terms|terms-of-service|tos)$/, path: '/terms' },
  { pattern: /^\/(?:about|about-us)$/, path: '/about' },
  { pattern: /^\/(?:contact|contact-us|support)$/, path: '/contact' },
];

export const GUIDE_ALIASES: Record<string, string> = {
  'duckdb-wasm-in-browser-analytics': 'duckdb-wasm-in-browser-olap',
};

const GUIDE_HUB_PATTERN = /^\/(?:guides|guide|docs|blog|articles?)$/;
const GUIDE_DETAIL_PATTERN = /^\/(?:guides|guide|docs|blog|articles?)\/([a-zA-Z0-9_-]+)$/;

/** Data Workbench aliases. */
const WORKBENCH_PATTERN = /^\/(?:data-tools|data-workbench|workbench|tools|viewers)$/;

/**
 * Pure path -> route resolution. No window, no DOM: safe to run in the browser,
 * in unit tests, and inside the build-time prerenderer.
 */
export function resolveRoutePath(cleanPath: string): RouteState {
  const raw = !cleanPath ? '/' : cleanPath;

  for (const { pattern, path } of CALCULATOR_ROUTES) {
    if (pattern.test(raw)) return { path };
  }

  for (const { pattern, path } of STATIC_ALIASES) {
    if (pattern.test(raw)) return { path };
  }

  const potentialToolSlug = raw.startsWith('/tools/') ? raw.replace('/tools/', '') : raw.slice(1);
  const resolvedToolSlug = TOOL_ALIASES[potentialToolSlug] || potentialToolSlug;

  if (resolvedToolSlug && TOOLS_CONFIG[resolvedToolSlug]) {
    return { path: '/tools/:toolSlug', slug: resolvedToolSlug };
  }

  const guideMatch = raw.match(GUIDE_DETAIL_PATTERN);
  if (guideMatch) {
    const rawSlug = guideMatch[1];
    const resolvedSlug = GUIDE_ALIASES[rawSlug] || rawSlug;
    return { path: '/guides/:slug', slug: resolvedSlug };
  }

  const potentialGuideSlug = raw.startsWith('/') ? raw.slice(1) : raw;
  const resolvedPotentialSlug = GUIDE_ALIASES[potentialGuideSlug] || potentialGuideSlug;
  if (isGuideSlug(resolvedPotentialSlug)) {
    return { path: '/guides/:slug', slug: resolvedPotentialSlug };
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
 */
export const KNOWN_ROUTES: ReadonlySet<string> = new Set([
  '/',
  '/data-tools',
  '/data-converter',
  '/tools/:toolSlug',
  '/guides',
  '/guides/:slug',
  '/snowflake-cost-calculator',
  '/parquet-storage-calculator',
  '/json-formatter',
  '/sql-formatter',
  '/is-it-down',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/disclaimer',
]);

export function isKnownRoute(path: string): boolean {
  return KNOWN_ROUTES.has(path);
}

export const CALCULATOR_CANONICAL_PATHS: ReadonlySet<string> = new Set([
  '/snowflake-cost-calculator',
  '/parquet-storage-calculator',
]);

export const COMPRESSION_CANONICAL_PATHS: ReadonlySet<string> = new Set([]);

export function isCalculatorRoute(currentPath: string): boolean {
  if (!currentPath) return false;
  const cleanPath = currentPath.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  const resolved = resolveRoutePath(cleanPath);
  return CALCULATOR_CANONICAL_PATHS.has(resolved.path);
}

export function isCompressionRoute(currentPath: string): boolean {
  if (!currentPath || COMPRESSION_CANONICAL_PATHS.size === 0) return false;
  const cleanPath = currentPath.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  const resolved = resolveRoutePath(cleanPath);
  return COMPRESSION_CANONICAL_PATHS.has(resolved.path);
}

export function getCanonicalPath(rawPath: string): string {
  if (!rawPath || rawPath === '/') return '/';
  const clean = rawPath.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  const resolved = resolveRoutePath(clean);

  if (resolved.path === '/tools/:toolSlug' && resolved.slug) {
    return TOOLS_CONFIG[resolved.slug]?.path || `/${resolved.slug}`;
  }
  if (resolved.path === '/guides/:slug' && resolved.slug) {
    return `/guides/${resolved.slug}`;
  }
  return resolved.path;
}

export type NavCategoryId = 'home' | 'calculators' | 'data' | 'media' | 'guides' | 'system' | 'static' | 'unknown';

export function getRouteCategory(rawPath: string): NavCategoryId {
  const canonical = getCanonicalPath(rawPath);
  if (canonical === '/') return 'home';
  if (canonical === '/guides' || canonical.startsWith('/guides/')) return 'guides';
  if (CALCULATOR_CANONICAL_PATHS.has(canonical)) return 'calculators';
  if (canonical === '/is-it-down') return 'system';
  if (['/about', '/contact', '/privacy', '/terms', '/disclaimer'].includes(canonical)) return 'static';
  if (canonical === '/data-tools' || canonical === '/data-converter' || canonical === '/json-formatter' || canonical === '/sql-formatter') return 'data';

  const slug = canonical.replace(/^\//, '');
  if (TOOLS_CONFIG[slug]) return 'data';

  return 'unknown';
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

  add('/', '/');

  add('/data-tools', '/data-tools');
  add('/workbench', '/data-tools');
  add('/tools', '/data-tools');
  add('/viewers', '/data-tools');

  add('/data-converter', '/data-converter');
  add('/converters', '/data-converter');
  add('/converter', '/data-converter');

  for (const slug of Object.keys(TOOLS_CONFIG)) {
    add(`/${slug}`, `/${slug}`);
  }

  for (const [alias, slug] of Object.entries(TOOL_ALIASES)) {
    add(`/${alias}`, `/${slug}`);
  }

  const calculatorAliases: Record<string, string[]> = {
    '/snowflake-cost-calculator': ['/snowflake-calculator', '/snowflake-warehouse-calculator'],
    '/parquet-storage-calculator': ['/parquet-savings-calculator', '/parquet-cost-calculator'],
    '/json-formatter': ['/json-beautifier', '/json-validator', '/json-viewer-online', '/format-json'],
    '/sql-formatter': ['/sql-beautifier', '/sql-minify', '/format-sql'],
    '/is-it-down': [],
  };
  for (const [canonical, aliases] of Object.entries(calculatorAliases)) {
    add(canonical, canonical);
    for (const alias of aliases) add(alias, canonical);
  }

  add('/guides', '/guides');
  for (const slug of GUIDE_SLUGS) {
    add(`/guides/${slug}`, `/guides/${slug}`);
    add(`/${slug}`, `/guides/${slug}`);
  }
  for (const [alias, canonicalSlug] of Object.entries(GUIDE_ALIASES)) {
    add(`/guides/${alias}`, `/guides/${canonicalSlug}`);
    add(`/${alias}`, `/guides/${canonicalSlug}`);
  }

  for (const path of ['/about', '/contact', '/privacy', '/terms', '/disclaimer']) {
    add(path, path);
  }
  add('/privacy-policy', '/privacy');
  add('/terms-of-service', '/terms');
  add('/about-us', '/about');
  add('/contact-us', '/contact');

  return [...targets.entries()].map(([url, canonical]) => ({ url, canonical }));
}

// Re-exported for the prerenderer; importing data/guides.ts here would pull the
// article bodies into the router's module graph.
export { GUIDE_SLUGS };

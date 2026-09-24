import { isGuideSlug, GUIDE_SLUGS } from '../data/guideSlugs';
import { SALARY_LONG_TAIL_MAP, SALARY_LONG_TAIL_PAGES } from '../data/salaryLongTail';

export interface RouteState {
  path: string;
  slug?: string;
}

/**
 * Calculator / hub URL families, each mapped to its canonical route.
 * Kept in a pure module so the build-time prerenderer and the runtime router
 * resolve every alias to exactly the same destination.
 */
const CALCULATOR_ROUTES: { pattern: RegExp; path: string }[] = [
  { pattern: /^\/(?:tools\/)?(?:mortgage-calculator|mortgage)$/, path: '/mortgage-calculator' },
  {
    pattern: /^\/(?:tools\/)?(?:amortization-schedule-calculator|loan-amortization-calculator|amortization-calculator)$/,
    path: '/amortization-schedule-calculator',
  },
  {
    pattern: /^\/(?:tools\/)?(?:mortgage-payoff-calculator|early-payoff-calculator|early-mortgage-payoff-calculator)$/,
    path: '/mortgage-payoff-calculator',
  },
  {
    // The optional .php suffix applies to BOTH forms. It previously hung off the
    // 'calculators/' alternative only, so /should-i-refinance.php fell through
    // and rendered a 404 page.
    pattern: /^\/(?:tools\/)?(?:refinance-calculator|refinance|(?:calculators\/)?should-i-refinance(?:\.php)?)$/,
    path: '/refinance-calculator',
  },
  {
    pattern: /^\/(?:tools\/)?(?:cash-out-refinance-calculator|cash-out-refinance)$/,
    path: '/cash-out-refinance-calculator',
  },
  { pattern: /^\/(?:tools\/)?(?:dscr-loan-calculator|dscr-calculator|dscr)$/, path: '/dscr-loan-calculator' },
  {
    pattern:
      /^\/(?:tools\/)?(?:cap-rate-calculator|rental-property-calculator|rental-cash-flow-calculator|cap-rate|rental-calculator|rental-property-cash-flow-calculator)$/,
    path: '/cap-rate-calculator',
  },
  {
    pattern: /^\/(?:tools\/)?(?:hard-money-calculator|hard-money-loan-calculator|fix-and-flip-calculator|hard-money)$/,
    path: '/hard-money-calculator',
  },
  {
    pattern: /^\/(?:tools\/)?(?:brrrr-calculator|brrrr-method-calculator|brrrr)$/,
    path: '/brrrr-calculator',
  },
  {
    // 1031 / like-kind exchange. "1031" alone is a real search term, and
    // "like-kind-exchange" is the statutory phrasing.
    pattern:
      /^\/(?:tools\/)?(?:section-1031-exchange-calculator|1031-exchange-calculator|1031-calculator|like-kind-exchange-calculator|1031-exchange|1031)$/,
    path: '/section-1031-exchange-calculator',
  },
  {
    pattern: /^\/(?:tools\/)?(?:1031-exchange-timeline-calculator|1031-timeline-calculator|1031-deadline-calculator)$/,
    path: '/1031-exchange-timeline-calculator',
  },
  {
    pattern: /^\/(?:tools\/)?(?:loan-comparison-calculator|loan-compare|compare-loans|loan-comparison)$/,
    path: '/loan-comparison-calculator',
  },
  {
    pattern:
      /^\/(?:tools\/)?(?:commercial-loan-calculator|commercial-mortgage-calculator|commercial-property-loan-calculator|commercial-real-estate-loan-calculator)$/,
    path: '/commercial-loan-calculator',
  },
  {
    pattern: /^\/(?:tools\/)?(?:balloon-payment-calculator|balloon-mortgage-calculator)$/,
    path: '/balloon-payment-calculator',
  },
  {
    pattern:
      /^\/(?:tools\/)?(?:salary-to-hourly-calculator|hourly-to-salary-calculator|salary-to-hourly|hourly-to-salary|salary-calculator)$/,
    path: '/salary-to-hourly-calculator',
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

export const GUIDE_ALIASES: Record<string, string> = {
  'dscr-loan-complete-guide': 'dscr-loans-complete-investor-guide',
  'section-1031-exchange-timeline-rules': 'section-1031-exchange-rules-timeline',
};

const GUIDE_HUB_PATTERN = /^\/(?:guides|guide|docs|blog|articles?)$/;
const GUIDE_DETAIL_PATTERN = /^\/(?:guides|guide|docs|blog|articles?)\/([a-zA-Z0-9_-]+)$/;

/**
 * Pure path -> route resolution. No window, no DOM: safe to run in the browser,
 * in unit tests, and inside the build-time prerenderer.
 *
 * @param cleanPath pathname only - already stripped of query/hash, trailing slash removed
 */
export function resolveRoutePath(cleanPath: string): RouteState {
  const raw = !cleanPath ? '/' : cleanPath;

  for (const { pattern, path } of CALCULATOR_ROUTES) {
    if (pattern.test(raw)) return { path };
  }

  for (const { pattern, path } of STATIC_ALIASES) {
    if (pattern.test(raw)) return { path };
  }

  const shareMatch = raw.match(/^\/share\/([a-zA-Z0-9_-]+)$/);
  if (shareMatch) {
    return { path: '/share/:dealId', slug: shareMatch[1] };
  }

  if (SALARY_LONG_TAIL_MAP[raw]) {
    return { path: '/salary-to-hourly-calculator', slug: SALARY_LONG_TAIL_MAP[raw].slug };
  }

  const guideMatch = raw.match(GUIDE_DETAIL_PATTERN);
  if (guideMatch) {
    const rawSlug = guideMatch[1];
    const resolvedSlug = GUIDE_ALIASES[rawSlug] || rawSlug;
    return { path: '/guides/:slug', slug: resolvedSlug };
  }

  // Direct guide slugs indexed by search engines (e.g. /how-to-calculate-dscr)
  const potentialGuideSlug = raw.startsWith('/') ? raw.slice(1) : raw;
  const resolvedPotentialSlug = GUIDE_ALIASES[potentialGuideSlug] || potentialGuideSlug;
  if (isGuideSlug(resolvedPotentialSlug)) {
    return { path: '/guides/:slug', slug: resolvedPotentialSlug };
  }

  if (GUIDE_HUB_PATTERN.test(raw)) {
    return { path: '/guides' };
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
  '/guides',
  '/guides/:slug',
  '/finance-calculator',
  '/mortgage-calculator',
  '/amortization-schedule-calculator',
  '/mortgage-payoff-calculator',
  '/refinance-calculator',
  '/cash-out-refinance-calculator',
  '/dscr-loan-calculator',
  '/cap-rate-calculator',
  '/hard-money-calculator',
  '/brrrr-calculator',
  '/section-1031-exchange-calculator',
  '/1031-exchange-timeline-calculator',
  '/loan-comparison-calculator',
  '/commercial-loan-calculator',
  '/balloon-payment-calculator',
  '/salary-to-hourly-calculator',
  ...SALARY_LONG_TAIL_PAGES.map((p) => p.path),
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
  '/finance-calculator',
  '/mortgage-calculator',
  '/amortization-schedule-calculator',
  '/mortgage-payoff-calculator',
  '/refinance-calculator',
  '/cash-out-refinance-calculator',
  '/dscr-loan-calculator',
  '/cap-rate-calculator',
  '/hard-money-calculator',
  '/brrrr-calculator',
  '/section-1031-exchange-calculator',
  '/1031-exchange-timeline-calculator',
  '/loan-comparison-calculator',
  '/commercial-loan-calculator',
  '/balloon-payment-calculator',
  '/salary-to-hourly-calculator',
]);

/**
 * Checks if a given path or alias represents any calculator page
 * (including commercial, mortgage, refinance, dscr, salary long-tail, etc.).
 */
export function isCalculatorRoute(currentPath: string): boolean {
  if (!currentPath) return false;
  const cleanPath = currentPath.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  const resolved = resolveRoutePath(cleanPath);
  return CALCULATOR_CANONICAL_PATHS.has(resolved.path);
}

/**
 * Resolves any URL path (including bare slugs, aliases, and keyword redirects)
 * into its primary canonical destination path (e.g. /dscr -> /dscr-loan-calculator,
 * /how-to-calculate-dscr -> /guides/how-to-calculate-dscr).
 */
export function getCanonicalPath(rawPath: string): string {
  if (!rawPath || rawPath === '/') return '/';
  const clean = rawPath.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  const resolved = resolveRoutePath(clean);

  if (resolved.path === '/guides/:slug' && resolved.slug) {
    return '/guides/' + resolved.slug;
  }
  return resolved.path;
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

  // Homepage (Real Estate & Lending Underwriting Hub)
  add('/', '/');

  // Calculator aliases
  const calculatorAliases: Record<string, string[]> = {
    '/mortgage-calculator': ['/mortgage'],
    '/amortization-schedule-calculator': ['/loan-amortization-calculator', '/amortization-calculator'],
    '/mortgage-payoff-calculator': ['/early-payoff-calculator', '/early-mortgage-payoff-calculator'],
    '/refinance-calculator': [
      '/refinance',
      '/should-i-refinance',
      '/should-i-refinance.php',
      '/calculators/should-i-refinance.php',
    ],
    '/cash-out-refinance-calculator': ['/cash-out-refinance'],
    '/dscr-loan-calculator': ['/dscr', '/dscr-calculator'],
    '/cap-rate-calculator': [
      '/rental-property-calculator',
      '/rental-cash-flow-calculator',
      '/cap-rate',
      '/rental-calculator',
      '/rental-property-cash-flow-calculator',
    ],
    '/hard-money-calculator': ['/hard-money', '/fix-and-flip-calculator', '/hard-money-loan-calculator'],
    '/brrrr-calculator': ['/brrrr', '/brrrr-method-calculator'],
    '/finance-calculator': ['/calculators', '/financial-calculators', '/calculator'],
    '/section-1031-exchange-calculator': [
      '/1031',
      '/1031-exchange',
      '/1031-calculator',
      '/1031-exchange-calculator',
      '/like-kind-exchange-calculator',
    ],
    '/1031-exchange-timeline-calculator': ['/1031-timeline-calculator', '/1031-deadline-calculator'],
    '/loan-comparison-calculator': ['/loan-compare', '/compare-loans', '/loan-comparison'],
    '/commercial-loan-calculator': [
      '/commercial-mortgage-calculator',
      '/commercial-property-loan-calculator',
      '/commercial-real-estate-loan-calculator',
    ],
    '/balloon-payment-calculator': ['/balloon-mortgage-calculator'],
    '/salary-to-hourly-calculator': [
      '/hourly-to-salary-calculator',
      '/salary-to-hourly',
      '/hourly-to-salary',
      '/salary-calculator',
    ],
  };
  for (const [canonical, aliases] of Object.entries(calculatorAliases)) {
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
    add('/guides/' + slug, '/guides/' + slug);
    add('/' + slug, '/guides/' + slug);
  }
  for (const [alias, canonicalSlug] of Object.entries(GUIDE_ALIASES)) {
    add('/guides/' + alias, '/guides/' + canonicalSlug);
    add('/' + alias, '/guides/' + canonicalSlug);
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

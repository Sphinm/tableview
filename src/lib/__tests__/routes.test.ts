import { describe, it, expect } from 'bun:test';
import { listPrerenderTargets, resolveRoutePath, isKnownRoute, isCalculatorRoute, GUIDE_SLUGS } from '../resolveRoute';
import { TOOLS_CONFIG } from '../../data/tools';
import { guidesData } from '../../data/guides';
import { HOME_META, GUIDES_HUB_META, CALCULATOR_META, STATIC_PAGE_META } from '../../data/routeMeta';
import { SALARY_LONG_TAIL_MAP } from '../../data/salaryLongTail';

/** Route keys the app actually renders (mirrors App.tsx's switch). */
const APP_ROUTES = new Set([
  '/',
  '/data-tools',
  '/data-converter',
  '/tools/:toolSlug',
  '/guides',
  '/guides/:slug',
  '/finance-calculator',
  '/calculator',
  '/mortgage-calculator',
  '/amortization-schedule-calculator',
  '/mortgage-payoff-calculator',
  '/refinance-calculator',
  '/cash-out-refinance-calculator',
  '/dscr-loan-calculator',
  '/hard-money-calculator',
  '/snowflake-cost-calculator',
  '/parquet-storage-calculator',
  '/section-1031-exchange-calculator',
  '/1031-exchange-timeline-calculator',
  '/loan-comparison-calculator',
  '/commercial-loan-calculator',
  '/balloon-payment-calculator',
  '/salary-to-hourly-calculator',
  '/json-formatter',
  '/sql-formatter',
  '/media-tools',
  '/video-compressor',
  '/compress-mp4',
  '/compress-video-for-discord',
  '/image-compressor',
  '/compress-png',
  '/compress-jpg',
  '/compress-webp',
  '/is-it-down',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/disclaimer',
]);

const TOOLS_BY_PATH = new Map(Object.values(TOOLS_CONFIG).map((cfg) => [cfg.path, cfg]));

/** Mirrors the title resolution order in scripts/prerender.ts. */
function titleFor(canonical: string): string | undefined {
  if (canonical === '/') return HOME_META.title;
  if (canonical === '/guides') return GUIDES_HUB_META.title;

  if (canonical.startsWith('/guides/')) {
    const guide = guidesData.find((g) => g.slug === canonical.replace('/guides/', ''));
    return guide ? (guide.metaTitle || `${guide.title} | TableView.dev`) : undefined;
  }

  const calc = CALCULATOR_META[canonical];
  if (calc) return calc.title;

  const salaryPage = SALARY_LONG_TAIL_MAP[canonical];
  if (salaryPage) return salaryPage.metaTitle;

  const tool = TOOLS_BY_PATH.get(canonical);
  if (tool) return tool.metaTitle;

  return STATIC_PAGE_META[canonical]?.title;
}

const targets = listPrerenderTargets();

describe('Prerender target manifest', () => {
  it('covers every tool landing page', () => {
    const urls = new Set(targets.map((t) => t.url));
    for (const cfg of Object.values(TOOLS_CONFIG)) {
      expect(urls.has(cfg.path)).toBe(true);
    }
  });

  it('covers every guide, both canonical and bare-slug form', () => {
    const urls = new Set(targets.map((t) => t.url));
    for (const slug of GUIDE_SLUGS) {
      expect(urls.has(`/guides/${slug}`)).toBe(true);
      // Bare slugs are indexed by search engines and must keep working.
      expect(urls.has(`/${slug}`)).toBe(true);
    }
  });

  it('resolves every target to a route the app can render', () => {
    const unresolvable: string[] = [];
    for (const { url } of targets) {
      const route = resolveRoutePath(url).path;
      if (!APP_ROUTES.has(route)) unresolvable.push(`${url} -> ${route}`);
    }
    expect(unresolvable).toEqual([]);
  });

  it('gives every canonical route a resolvable title', () => {
    const missing = new Set<string>();
    for (const { canonical } of targets) {
      if (!titleFor(canonical)) missing.add(canonical);
    }
    expect([...missing]).toEqual([]);
  });

  it('never emits two different canonical pages with the same title', () => {
    const seen = new Map<string, string>();
    const collisions: string[] = [];

    for (const { canonical } of targets) {
      const title = titleFor(canonical);
      if (!title) continue;
      const owner = seen.get(title);
      if (owner && owner !== canonical) collisions.push(`${owner} vs ${canonical}`);
      else seen.set(title, canonical);
    }

    expect(collisions).toEqual([]);
  });

  it('canonicalises every alias onto a path that is itself a target', () => {
    const urls = new Set(targets.map((t) => t.url));
    const orphans = targets.filter((t) => !urls.has(t.canonical)).map((t) => t.canonical);
    expect([...new Set(orphans)]).toEqual([]);
  });

  it('never points two different URLs at different canonicals for the same URL', () => {
    const byUrl = new Map<string, string>();
    for (const { url, canonical } of targets) {
      expect(byUrl.has(url) && byUrl.get(url) !== canonical).toBe(false);
      byUrl.set(url, canonical);
    }
  });

  it('registers the 1031 exchange calculator and its aliases', () => {
    const byUrl = new Map(targets.map((t) => [t.url, t.canonical]));
    const canonical = '/section-1031-exchange-calculator';

    expect(byUrl.get(canonical)).toBe(canonical);
    for (const alias of ['/1031', '/1031-calculator', '/1031-exchange-calculator', '/like-kind-exchange-calculator']) {
      expect(byUrl.get(alias)).toBe(canonical);
    }
  });

  it('resolves every 1031 alias to the calculator, not a 404', () => {
    for (const alias of ['/1031', '/1031-calculator', '/1031-exchange', '/like-kind-exchange-calculator']) {
      expect(resolveRoutePath(alias).path).toBe('/section-1031-exchange-calculator');
    }
  });

  it('sends the sitemap-contradicting aliases to the workbench canonical', () => {
    // These two were previously listed in the sitemap with their own URL while
    // canonicalising to /sql-workbench, which Search Console reports as a
    // "Duplicate, Google chose different canonical" error.
    const target = (url: string) => targets.find((t) => t.url === url);
    expect(target('/sql-on-csv')?.canonical).toBe('/sql-workbench');
    expect(target('/sql-on-parquet')?.canonical).toBe('/sql-workbench');
  });
});

describe('Route resolution used by both runtime and prerenderer', () => {
  it('maps high-intent aliases to their tool page', () => {
    expect(resolveRoutePath('/open-csv')).toEqual({ path: '/tools/:toolSlug', slug: 'csv-viewer' });
    expect(resolveRoutePath('/duckdb')).toEqual({ path: '/tools/:toolSlug', slug: 'sql-workbench' });
  });

  it('maps calculator aliases to the dedicated calculator route', () => {
    expect(resolveRoutePath('/should-i-refinance.php').path).toBe('/refinance-calculator');
    expect(resolveRoutePath('/calculators/should-i-refinance.php').path).toBe('/refinance-calculator');
    expect(resolveRoutePath('/fix-and-flip-calculator').path).toBe('/hard-money-calculator');
  });

  it('treats an unknown path as a 404 rather than a tool', () => {
    expect(resolveRoutePath('/definitely-not-real').path).toBe('/definitely-not-real');
  });
});

describe('Known-route classification (drives the noindex 404 guard)', () => {
  it('classifies every route produced by a prerender target as known', () => {
    // A false negative here would stamp noindex onto a real page, because App's
    // meta effect runs after the child page's own updatePageMeta call.
    const unknown = targets
      .map((t) => resolveRoutePath(t.url).path)
      .filter((route) => !isKnownRoute(route));

    expect([...new Set(unknown)]).toEqual([]);
  });

  it('classifies guide detail pages as known', () => {
    expect(isKnownRoute(resolveRoutePath('/guides/what-is-apache-parquet').path)).toBe(true);
  });

  it('classifies tool landing pages as known', () => {
    expect(isKnownRoute(resolveRoutePath('/csv-viewer').path)).toBe(true);
    expect(isKnownRoute(resolveRoutePath('/open-csv').path)).toBe(true);
  });

  it('does not classify a typo as known', () => {
    expect(isKnownRoute(resolveRoutePath('/this-page-does-not-exist').path)).toBe(false);
    expect(isKnownRoute('/nope')).toBe(false);
  });

  it('maps every alias route to a known destination', () => {
    for (const { url } of targets) {
      expect(isKnownRoute(resolveRoutePath(url).path)).toBe(true);
    }
  });

  describe('isCalculatorRoute', () => {
    it('identifies all primary financial calculators', () => {
      const calcPaths = [
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
        '/finance-calculator',
        '/calculator',
      ];

      for (const p of calcPaths) {
        expect(isCalculatorRoute(p)).toBe(true);
      }
    });

    it('identifies programmatic salary SEO routes', () => {
      expect(isCalculatorRoute('/30000-a-year-is-how-much-an-hour')).toBe(true);
      expect(isCalculatorRoute('/100000-a-year-is-how-much-an-hour')).toBe(true);
    });

    it('returns false for data tools, guides, and static pages', () => {
      expect(isCalculatorRoute('/')).toBe(false);
      expect(isCalculatorRoute('/csv-viewer')).toBe(false);
      expect(isCalculatorRoute('/parquet-viewer')).toBe(false);
      expect(isCalculatorRoute('/sql-workbench')).toBe(false);
      expect(isCalculatorRoute('/json-formatter')).toBe(false);
      expect(isCalculatorRoute('/guides')).toBe(false);
      expect(isCalculatorRoute('/about')).toBe(false);
      expect(isCalculatorRoute('/privacy')).toBe(false);

      // Regression: Guides containing financial keywords like "loan", "dscr", "exchange", "mortgage"
      // must NEVER be misclassified as calculator routes!
      expect(isCalculatorRoute('/guides/dscr-loans-complete-investor-guide')).toBe(false);
      expect(isCalculatorRoute('/guides/section-1031-exchange-rules-timeline')).toBe(false);
      expect(isCalculatorRoute('/guides/how-to-calculate-dscr')).toBe(false);
      expect(isCalculatorRoute('/guides/commercial-real-estate-loan-types')).toBe(false);
      expect(isCalculatorRoute('/guides/commercial-balloon-mortgages-risks')).toBe(false);
      expect(isCalculatorRoute('/guides/mortgage-refinance-break-even-guide')).toBe(false);
      expect(isCalculatorRoute('/guides/hard-money-loans-for-fix-and-flip')).toBe(false);

      // Bare slug forms must also never be misclassified as calculator routes
      expect(isCalculatorRoute('/dscr-loans-complete-investor-guide')).toBe(false);
      expect(isCalculatorRoute('/section-1031-exchange-rules-timeline')).toBe(false);
    });
  });
});

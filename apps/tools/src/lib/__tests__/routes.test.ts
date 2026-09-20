import { describe, it, expect } from 'bun:test';
import { listPrerenderTargets, resolveRoutePath, isKnownRoute, isCalculatorRoute, GUIDE_SLUGS } from '../resolveRoute';
import { TOOLS_CONFIG } from '../../data/tools';
import { guidesData } from '../../data/guides';
import { HOME_META, GUIDES_HUB_META, CALCULATOR_META, STATIC_PAGE_META } from '../../data/routeMeta';

/** Route keys the app actually renders (mirrors App.tsx's switch). */
const APP_ROUTES = new Set([
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

  it('sends the sitemap-contradicting aliases to the workbench canonical', () => {
    const target = (url: string) => targets.find((t) => t.url === url);
    expect(target('/sql-on-csv')?.canonical).toBe('/sql-workbench');
    expect(target('/sql-on-parquet')?.canonical).toBe('/sql-workbench');
  });

  it('emits FinOps calculator aliases onto their canonical', () => {
    const byUrl = new Map(targets.map((t) => [t.url, t.canonical]));
    expect(byUrl.get('/snowflake-cost-calculator')).toBe('/snowflake-cost-calculator');
    expect(byUrl.get('/snowflake-calculator')).toBe('/snowflake-cost-calculator');
    expect(byUrl.get('/parquet-storage-calculator')).toBe('/parquet-storage-calculator');
    expect(byUrl.get('/parquet-savings-calculator')).toBe('/parquet-storage-calculator');
    expect(byUrl.get('/json-beautifier')).toBe('/json-formatter');
    expect(byUrl.get('/sql-beautifier')).toBe('/sql-formatter');
  });
});

describe('Route resolution used by both runtime and prerenderer', () => {
  it('maps high-intent aliases to their tool page', () => {
    expect(resolveRoutePath('/open-csv')).toEqual({ path: '/tools/:toolSlug', slug: 'csv-viewer' });
    expect(resolveRoutePath('/duckdb')).toEqual({ path: '/tools/:toolSlug', slug: 'sql-workbench' });
  });

  it('maps FinOps/formatter aliases to the dedicated route', () => {
    expect(resolveRoutePath('/snowflake-calculator').path).toBe('/snowflake-cost-calculator');
    expect(resolveRoutePath('/parquet-savings-calculator').path).toBe('/parquet-storage-calculator');
    expect(resolveRoutePath('/json-beautifier').path).toBe('/json-formatter');
    expect(resolveRoutePath('/format-sql').path).toBe('/sql-formatter');
  });

  it('treats an unknown path as a 404 rather than a tool', () => {
    expect(resolveRoutePath('/definitely-not-real').path).toBe('/definitely-not-real');
  });
});

describe('Known-route classification (drives the noindex 404 guard)', () => {
  it('classifies every route produced by a prerender target as known', () => {
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
    it('identifies the FinOps calculators', () => {
      expect(isCalculatorRoute('/snowflake-cost-calculator')).toBe(true);
      expect(isCalculatorRoute('/parquet-storage-calculator')).toBe(true);
      expect(isCalculatorRoute('/snowflake-calculator')).toBe(true);
      expect(isCalculatorRoute('/parquet-savings-calculator')).toBe(true);
    });

    it('returns false for formatters, data tools, guides, and static pages', () => {
      expect(isCalculatorRoute('/')).toBe(false);
      expect(isCalculatorRoute('/json-formatter')).toBe(false);
      expect(isCalculatorRoute('/sql-formatter')).toBe(false);
      expect(isCalculatorRoute('/csv-viewer')).toBe(false);
      expect(isCalculatorRoute('/parquet-viewer')).toBe(false);
      expect(isCalculatorRoute('/sql-workbench')).toBe(false);
      expect(isCalculatorRoute('/guides')).toBe(false);
      expect(isCalculatorRoute('/about')).toBe(false);
      expect(isCalculatorRoute('/privacy')).toBe(false);
    });
  });
});

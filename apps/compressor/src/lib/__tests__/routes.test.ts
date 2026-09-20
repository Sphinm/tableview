import { describe, it, expect } from 'bun:test';
import { listPrerenderTargets, resolveRoutePath, isKnownRoute, isCompressionRoute, isCalculatorRoute } from '../resolveRoute';
import { HOME_META, STATIC_PAGE_META } from '../../data/routeMeta';

/** Route keys the app actually renders (mirrors App.tsx's switch). */
const APP_ROUTES = new Set([
  '/',
  '/media-tools',
  '/video-compressor',
  '/compress-mp4',
  '/compress-video-for-discord',
  '/image-compressor',
  '/compress-png',
  '/compress-jpg',
  '/compress-webp',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/disclaimer',
]);

function titleFor(canonical: string): string | undefined {
  if (canonical === '/') return HOME_META.title;
  return STATIC_PAGE_META[canonical]?.title;
}

const targets = listPrerenderTargets();

describe('Prerender target manifest', () => {
  it('covers every media tool landing page', () => {
    const urls = new Set(targets.map((t) => t.url));
    for (const p of ['/media-tools','/video-compressor','/compress-mp4','/compress-video-for-discord','/image-compressor','/compress-png','/compress-jpg','/compress-webp']) {
      expect(urls.has(p)).toBe(true);
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

  it('emits media aliases onto their canonical', () => {
    const byUrl = new Map(targets.map((t) => [t.url, t.canonical]));
    expect(byUrl.get('/compress-video')).toBe('/video-compressor');
    expect(byUrl.get('/mp4-compressor')).toBe('/compress-mp4');
    expect(byUrl.get('/compress-image')).toBe('/image-compressor');
    expect(byUrl.get('/png-compressor')).toBe('/compress-png');
    expect(byUrl.get('/discord-video-compressor')).toBe('/compress-video-for-discord');
  });
});

describe('Route resolution used by both runtime and prerenderer', () => {
  it('maps media aliases to their tool page', () => {
    expect(resolveRoutePath('/compress-video').path).toBe('/video-compressor');
    expect(resolveRoutePath('/video-compress').path).toBe('/video-compressor');
    expect(resolveRoutePath('/mp4-compressor').path).toBe('/compress-mp4');
    expect(resolveRoutePath('/compress-image').path).toBe('/image-compressor');
    expect(resolveRoutePath('/png-compress').path).toBe('/compress-png');
    expect(resolveRoutePath('/jpeg-compressor').path).toBe('/compress-jpg');
    expect(resolveRoutePath('/webp-compressor').path).toBe('/compress-webp');
  });

  it('resolves direct media paths to themselves', () => {
    expect(resolveRoutePath('/video-compressor').path).toBe('/video-compressor');
    expect(resolveRoutePath('/image-compressor').path).toBe('/image-compressor');
    expect(resolveRoutePath('/media-tools').path).toBe('/media-tools');
  });

  it('resolves informational aliases', () => {
    expect(resolveRoutePath('/privacy-policy').path).toBe('/privacy');
    expect(resolveRoutePath('/terms-of-service').path).toBe('/terms');
  });

  it('treats an unknown path as a 404', () => {
    expect(resolveRoutePath('/definitely-not-real').path).toBe('/definitely-not-real');
  });
});

describe('Known-route classification (drives the noindex 404 guard)', () => {
  it('classifies every prerender target as known', () => {
    const unknown = targets
      .map((t) => resolveRoutePath(t.url).path)
      .filter((route) => !isKnownRoute(route));
    expect([...new Set(unknown)]).toEqual([]);
  });

  it('classifies media pages as known', () => {
    expect(isKnownRoute(resolveRoutePath('/video-compressor').path)).toBe(true);
    expect(isKnownRoute(resolveRoutePath('/compress-mp4').path)).toBe(true);
  });

  it('does not classify a typo as known', () => {
    expect(isKnownRoute(resolveRoutePath('/this-page-does-not-exist').path)).toBe(false);
  });

  it('flags compression routes but never calculator routes', () => {
    expect(isCompressionRoute('/video-compressor')).toBe(true);
    expect(isCompressionRoute('/compress-png')).toBe(true);
    expect(isCompressionRoute('/')).toBe(false);
    expect(isCompressionRoute('/about')).toBe(false);
    expect(isCalculatorRoute('/video-compressor')).toBe(false);
    expect(isCalculatorRoute('/anything')).toBe(false);
  });
});

/**
 * Pure path -> route resolution for the media compression app.
 *
 * Scope: media compression routes plus legal/informational pages owned by
 * compress.tableview.dev. Data tools, finance calculators, and guides are
 * resolved by apps/tools and apps/finance respectively, so they are absent here.
 */
export interface RouteState {
  path: string;
  slug?: string;
}

const CALCULATOR_ROUTES: { pattern: RegExp; path: string }[] = [
  {
    pattern: /^\/(?:tools\/)?(?:media-tools|media|compression-tools)$/,
    path: '/media-tools',
  },
  {
    pattern: /^\/(?:tools\/)?(?:video-compressor|compress-video|video-compress|reduce-video-size)$/,
    path: '/video-compressor',
  },
  {
    pattern: /^\/(?:tools\/)?(?:compress-mp4|mp4-compressor|mp4-compress)$/,
    path: '/compress-mp4',
  },
  {
    pattern: /^\/(?:tools\/)?(?:compress-video-for-discord|discord-video-compressor)$/,
    path: '/compress-video-for-discord',
  },
  {
    pattern: /^\/(?:tools\/)?(?:image-compressor|compress-image|image-compress|photo-compressor|reduce-image-size)$/,
    path: '/image-compressor',
  },
  {
    pattern: /^\/(?:tools\/)?(?:compress-png|png-compressor|png-compress)$/,
    path: '/compress-png',
  },
  {
    pattern: /^\/(?:tools\/)?(?:compress-jpg|compress-jpeg|jpeg-compressor|jpg-compressor)$/,
    path: '/compress-jpg',
  },
  {
    pattern: /^\/(?:tools\/)?(?:compress-webp|webp-compressor|webp-compress)$/,
    path: '/compress-webp',
  },
];

const STATIC_ALIASES: { pattern: RegExp; path: string }[] = [
  { pattern: /^\/(?:privacy|privacy-policy)$/, path: '/privacy' },
  { pattern: /^\/(?:terms|terms-of-service|tos)$/, path: '/terms' },
  { pattern: /^\/(?:about|about-us)$/, path: '/about' },
  { pattern: /^\/(?:contact|contact-us|support)$/, path: '/contact' },
];

export function resolveRoutePath(cleanPath: string): RouteState {
  const raw = !cleanPath ? '/' : cleanPath;

  for (const { pattern, path } of CALCULATOR_ROUTES) {
    if (pattern.test(raw)) return { path };
  }

  for (const { pattern, path } of STATIC_ALIASES) {
    if (pattern.test(raw)) return { path };
  }

  return { path: raw };
}

/**
 * Route keys the app renders a real page for. Anything outside this set is a
 * genuine 404 and must be marked noindex (soft-404 index bloat guard).
 */
export const KNOWN_ROUTES: ReadonlySet<string> = new Set([
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

export function isKnownRoute(path: string): boolean {
  return KNOWN_ROUTES.has(path);
}

export const CALCULATOR_CANONICAL_PATHS: ReadonlySet<string> = new Set([]);

export const COMPRESSION_CANONICAL_PATHS: ReadonlySet<string> = new Set([
  '/media-tools',
  '/video-compressor',
  '/compress-mp4',
  '/compress-video-for-discord',
  '/image-compressor',
  '/compress-png',
  '/compress-jpg',
  '/compress-webp',
]);

export function isCalculatorRoute(currentPath: string): boolean {
  if (!currentPath || CALCULATOR_CANONICAL_PATHS.size === 0) return false;
  const cleanPath = currentPath.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  return CALCULATOR_CANONICAL_PATHS.has(resolveRoutePath(cleanPath).path);
}

export function isCompressionRoute(currentPath: string): boolean {
  if (!currentPath) return false;
  const cleanPath = currentPath.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  return COMPRESSION_CANONICAL_PATHS.has(resolveRoutePath(cleanPath).path);
}

export function getCanonicalPath(rawPath: string): string {
  if (!rawPath || rawPath === '/') return '/';
  const clean = rawPath.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  return resolveRoutePath(clean).path;
}

export type NavCategoryId = 'home' | 'calculators' | 'data' | 'media' | 'guides' | 'system' | 'static' | 'unknown';

export function getRouteCategory(rawPath: string): NavCategoryId {
  const canonical = getCanonicalPath(rawPath);
  if (canonical === '/') return 'home';
  if (COMPRESSION_CANONICAL_PATHS.has(canonical)) return 'media';
  if (['/about', '/contact', '/privacy', '/terms', '/disclaimer'].includes(canonical)) return 'static';
  return 'unknown';
}

/**
 * Every URL that must exist as a prerendered static file, with the canonical
 * path it should advertise.
 */
export function listPrerenderTargets(): { url: string; canonical: string }[] {
  const targets = new Map<string, string>();
  const add = (url: string, canonical: string) => {
    if (!targets.has(url)) targets.set(url, canonical);
  };

  add('/', '/');

  const compressorAliases: Record<string, string[]> = {
    '/media-tools': ['/media', '/compression-tools'],
    '/video-compressor': ['/compress-video', '/video-compress', '/reduce-video-size'],
    '/compress-mp4': ['/mp4-compressor', '/mp4-compress'],
    '/compress-video-for-discord': ['/discord-video-compressor'],
    '/image-compressor': ['/compress-image', '/image-compress', '/photo-compressor', '/reduce-image-size'],
    '/compress-png': ['/png-compressor', '/png-compress'],
    '/compress-jpg': ['/compress-jpeg', '/jpeg-compressor', '/jpg-compressor'],
    '/compress-webp': ['/webp-compressor', '/webp-compress'],
  };
  for (const [canonical, aliases] of Object.entries(compressorAliases)) {
    add(canonical, canonical);
    for (const alias of aliases) add(alias, canonical);
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

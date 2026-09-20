import { resolveRoutePath } from './resolveRoute';

type ComponentLoader = () => Promise<unknown>;

/**
 * Registry of dynamic import loaders mapped to canonical route paths.
 * Calling a loader triggers the browser to fetch and cache the corresponding
 * JS chunk before the user clicks, eliminating Suspense fallback loading screens.
 */
const ROUTE_LOADERS: Record<string, ComponentLoader> = {
  // Media Tools Suite
  '/video-compressor': () => import('../pages/VideoCompressor'),
  '/compress-mp4': () => import('../pages/VideoCompressor'),
  '/compress-video-for-discord': () => import('../pages/VideoCompressor'),
  '/compress-video': () => import('../pages/VideoCompressor'),
  '/image-compressor': () => import('../pages/ImageCompressor'),
  '/compress-png': () => import('../pages/ImageCompressor'),
  '/compress-jpg': () => import('../pages/ImageCompressor'),
  '/compress-webp': () => import('../pages/ImageCompressor'),
  '/compress-image': () => import('../pages/ImageCompressor'),
  '/media-tools': () => import('../pages/MediaToolsHub'),

  // Legal & Platform Pages
  '/about': () => import('../pages/About'),
  '/contact': () => import('../pages/Contact'),
  '/privacy': () => import('../pages/PrivacyPolicy'),
  '/terms': () => import('../pages/TermsOfService'),
  '/disclaimer': () => import('../pages/Disclaimer'),
};

const preloadedRoutes = new Set<string>();

/**
 * Preloads the chunk for the given route path.
 * Safe to call multiple times; duplicates are ignored once requested.
 */
export function preloadRoute(rawPath: string): void {
  if (typeof window === 'undefined' || !rawPath) return;

  try {
    const cleanPath = rawPath.split('?')[0].split('#')[0];
    if (cleanPath === '/' || cleanPath === '') return;

    const resolved = resolveRoutePath(cleanPath);
    const key = resolved.path;

    if (preloadedRoutes.has(key)) return;

    const loader = ROUTE_LOADERS[key];
    if (loader) {
      preloadedRoutes.add(key);
      loader().catch(() => {
        // Reset on network failure so it can be retried
        preloadedRoutes.delete(key);
      });
    }
  } catch {
    // Ignore in non-browser or test environments
  }
}

/**
 * Preloads a list of route paths sequentially or concurrently.
 */
export function preloadRoutes(paths: string[]): void {
  if (typeof window === 'undefined') return;
  for (const p of paths) {
    preloadRoute(p);
  }
}

/**
 * Preloads routes when the browser thread is idle,
 * preventing any impact on active interactions or initial rendering.
 */
export function idlePreloadRoutes(paths: string[]): void {
  if (typeof window === 'undefined') return;
  const run = () => preloadRoutes(paths);
  const idle = (window as any).requestIdleCallback;
  if (typeof idle === 'function') {
    idle(run, { timeout: 3000 });
  } else {
    setTimeout(run, 1500);
  }
}

/**
 * Installs a global delegated hover listener on the window.
 * Any anchor tag with href starting with '/' or element with data-route
 * will have its corresponding chunk preloaded on mouseover/focusin.
 */
export function initGlobalHoverPreloader(): () => void {
  if (typeof window === 'undefined') return () => {};

  const onPointerOver = (e: MouseEvent) => {
    const target = (e.target as HTMLElement)?.closest('a[href^="/"], [data-route]');
    if (!target) return;
    const href = target.getAttribute('href') || target.getAttribute('data-route');
    if (href && href.startsWith('/') && href !== '/' && target.getAttribute('target') !== '_blank') {
      preloadRoute(href);
    }
  };

  const onFocusIn = (e: FocusEvent) => {
    const target = (e.target as HTMLElement)?.closest('a[href^="/"], [data-route]');
    if (!target) return;
    const href = target.getAttribute('href') || target.getAttribute('data-route');
    if (href && href.startsWith('/') && href !== '/' && target.getAttribute('target') !== '_blank') {
      preloadRoute(href);
    }
  };

  window.addEventListener('mouseover', onPointerOver, { passive: true });
  window.addEventListener('focusin', onFocusIn, { passive: true });

  return () => {
    window.removeEventListener('mouseover', onPointerOver);
    window.removeEventListener('focusin', onFocusIn);
  };
}

/**
 * Automatically warms up high-priority popular calculators in local Cache Storage
 * during browser idle time after initial page boot.
 */
export function schedulePopularCalculatorsPreload(delayMs = 2500): void {
  if (typeof window === 'undefined') return;
  setTimeout(() => {
    idlePreloadRoutes([
      '/video-compressor',
      '/compress-mp4',
      '/image-compressor',
      '/compress-png',
      '/compress-jpg',
      '/compress-webp',
    ]);
  }, delayMs);
}

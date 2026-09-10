import { useState, useEffect } from 'react';
import { resolveRoutePath, type RouteState } from './resolveRoute';

export type { RouteState };

export function updatePageMeta(
  title: string,
  description: string,
  canonicalPath: string = '/',
  schemas?: Record<string, any>[],
  noindex: boolean = false
) {
  document.title = title;

  // The SPA fallback answers unknown paths with HTTP 200, so a 404 view must
  // declare noindex itself or search engines will index every typo.
  let robots = document.querySelector('meta[name="robots"]');
  if (!robots) {
    robots = document.createElement('meta');
    robots.setAttribute('name', 'robots');
    document.head.appendChild(robots);
  }
  robots.setAttribute(
    'content',
    noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  );

  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);

  let metaTitle = document.querySelector('meta[name="title"]');
  if (metaTitle) metaTitle.setAttribute('content', title);

  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title);

  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', description);

  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (!ogUrl) {
    ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    document.head.appendChild(ogUrl);
  }
  ogUrl.setAttribute('content', `https://tableview.dev${canonicalPath}`);

  let twitterCard = document.querySelector('meta[name="twitter:card"]');
  if (!twitterCard) {
    twitterCard = document.createElement('meta');
    twitterCard.setAttribute('name', 'twitter:card');
    document.head.appendChild(twitterCard);
  }
  twitterCard.setAttribute('content', 'summary_large_image');

  let twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (!twitterTitle) {
    twitterTitle = document.createElement('meta');
    twitterTitle.setAttribute('name', 'twitter:title');
    document.head.appendChild(twitterTitle);
  }
  twitterTitle.setAttribute('content', title);

  let twitterDesc = document.querySelector('meta[name="twitter:description"]');
  if (!twitterDesc) {
    twitterDesc = document.createElement('meta');
    twitterDesc.setAttribute('name', 'twitter:description');
    document.head.appendChild(twitterDesc);
  }
  twitterDesc.setAttribute('content', description);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', `https://tableview.dev${canonicalPath}`);

  // Inject or update JSON-LD structured schemas
  const oldScript = document.getElementById('page-structured-data');
  if (oldScript) {
    oldScript.remove();
  }

  if (schemas && schemas.length > 0) {
    const script = document.createElement('script');
    script.id = 'page-structured-data';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(
      schemas.length === 1
        ? schemas[0]
        : {
            '@context': 'https://schema.org',
            '@graph': schemas
          }
    );
    document.head.appendChild(script);
  }
}

export function parseCurrentLocation(): RouteState {
  if (typeof window === 'undefined') {
    return { path: '/' };
  }

  // Check if restored from a static 404 fallback redirect
  try {
    const redirected = sessionStorage.getItem('redirect_path');
    if (redirected) {
      sessionStorage.removeItem('redirect_path');
      window.history.replaceState({}, '', redirected);
    }
  } catch {
    // Ignore in case of restricted environments
  }

  // Prioritize real pathname, but if hash begins with '#/' (e.g. legacy link or old bug like /page1#/page2),
  // honor the '#/' path and clean up the address bar to canonical format.
  let raw = window.location.pathname;
  if (window.location.hash.startsWith('#/')) {
    raw = window.location.hash.slice(1);
    try {
      window.history.replaceState({}, '', raw);
    } catch {
      // Ignore
    }
  }
  if (!raw || raw === '') raw = '/';

  // Strip query strings and in-page hash anchors
  let cleanPath = raw.split('?')[0].split('#')[0];
  
  // Normalize trailing slashes (e.g., /guides/ -> /guides)
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }

  // The remaining resolution logic is shared with the build-time prerenderer
  // so that aliases can never diverge between the two.
  return resolveRoutePath(cleanPath);
}

export function navigateTo(to: string) {
  const target = to.startsWith('/') ? to : `/${to}`;
  window.history.pushState({}, '', target);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function useRouter() {
  const [route, setRoute] = useState<RouteState>(() => parseCurrentLocation());

  useEffect(() => {
    let lastPath = window.location.pathname;

    const scrollToAnchor = () => {
      if (window.location.hash && !window.location.hash.startsWith('#/')) {
        const id = window.location.hash.replace(/^#/, '');
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    const handleLocationChange = () => {
      const currentPath = window.location.pathname;
      const newRoute = parseCurrentLocation();
      setRoute(newRoute);

      if (currentPath !== lastPath) {
        lastPath = currentPath;
        if (window.location.hash && !window.location.hash.startsWith('#/')) {
          setTimeout(scrollToAnchor, 120);
        } else {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      } else {
        // Hash changed or re-navigated on the same page
        if (window.location.hash && !window.location.hash.startsWith('#/')) {
          setTimeout(scrollToAnchor, 60);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    // Initial check on mount if landing directly on an anchor URL (e.g. /guides/...#architecture)
    if (window.location.hash && !window.location.hash.startsWith('#/')) {
      setTimeout(scrollToAnchor, 180);
    }

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  return {
    ...route,
    navigate: navigateTo
  };
}
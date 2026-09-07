import { useState, useEffect } from 'react';

export interface RouteState {
  path: string;
  slug?: string;
}

export function parseCurrentLocation(): RouteState {
  // Support both hash fallback (#/about) and pathname (/about)
  let raw = window.location.hash ? window.location.hash.replace(/^#/, '') : window.location.pathname;
  if (!raw || raw === '') raw = '/';

  // Strip query strings and hash anchors
  let cleanPath = raw.split('?')[0].split('#')[0];
  
  // Normalize trailing slashes (e.g., /guides/ -> /guides)
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }

  // Match /guides/:slug or /guide/:slug or /articles/:slug or /blog/:slug
  const guideMatch = cleanPath.match(/^\/(?:guides|guide|docs|blog|articles?)\/([a-zA-Z0-9_-]+)$/);
  if (guideMatch) {
    return { path: '/guides/:slug', slug: guideMatch[1] };
  }

  // Aliases for guides hub: /guide, /docs, /blog, /articles
  if (/^\/(?:guides|guide|docs|blog|articles?)$/.test(cleanPath)) {
    return { path: '/guides' };
  }

  return { path: cleanPath };
}

export function navigateTo(to: string) {
  // If user is using hash routing, preserve hash mode; else use standard pushState
  if (window.location.hash) {
    window.location.hash = to.startsWith('/') ? to : `/${to}`;
  } else {
    window.history.pushState({}, '', to);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function useRouter() {
  const [route, setRoute] = useState<RouteState>(() => parseCurrentLocation());

  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(parseCurrentLocation());
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
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

import { useState, useEffect } from 'react';

export interface RouteState {
  path: string;
  slug?: string;
}

export function parseCurrentLocation(): RouteState {
  // Support both hash fallback (#/about) and pathname (/about)
  let raw = window.location.hash ? window.location.hash.replace(/^#/, '') : window.location.pathname;
  if (!raw || raw === '') raw = '/';

  const cleanPath = raw.split('?')[0].split('#')[0];

  // Match /guides/:slug
  const guideMatch = cleanPath.match(/^\/guides\/([a-zA-Z0-9_-]+)$/);
  if (guideMatch) {
    return { path: '/guides/:slug', slug: guideMatch[1] };
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

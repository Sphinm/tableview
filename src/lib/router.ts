import { useState, useEffect } from 'react';

export interface RouteState {
  path: string;
  slug?: string;
}

import { TOOLS_CONFIG } from '../data/tools';

export function updatePageMeta(title: string, description: string, canonicalPath: string = '/') {
  document.title = title;

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

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', `https://tableview.dev${canonicalPath}`);
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

  // Check if matches a dedicated tool landing page
  const potentialToolSlug = cleanPath.startsWith('/tools/')
    ? cleanPath.replace('/tools/', '')
    : cleanPath.slice(1);

  if (potentialToolSlug && TOOLS_CONFIG[potentialToolSlug]) {
    return { path: '/tools/:toolSlug', slug: potentialToolSlug };
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

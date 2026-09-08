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

  // Check if matches a dedicated tool landing page (e.g. /parquet-viewer or /tools/parquet-viewer)
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

  // Canonical aliases for standard informational pages to avoid 404s
  if (/^\/(?:privacy|privacy-policy)$/.test(cleanPath)) {
    return { path: '/privacy' };
  }

  if (/^\/(?:terms|terms-of-service|tos)$/.test(cleanPath)) {
    return { path: '/terms' };
  }

  if (/^\/(?:about|about-us)$/.test(cleanPath)) {
    return { path: '/about' };
  }

  if (/^\/(?:contact|contact-us|support)$/.test(cleanPath)) {
    return { path: '/contact' };
  }

  // Workbench aliases: /tools, /converters, /viewers
  if (/^\/(?:tools|converters|viewers)$/.test(cleanPath)) {
    return { path: '/' };
  }

  // Dedicated Mortgage Calculator route & aliases
  if (/^\/(?:mortgage-calculator|mortgage)$/.test(cleanPath)) {
    return { path: '/mortgage-calculator' };
  }

  // Financial Calculators Hub route & aliases
  if (/^\/(?:finance-calculator|calculators|financial-calculators|calculator)$/.test(cleanPath)) {
    return { path: '/finance-calculator' };
  }

  return { path: cleanPath };
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
        // Hash changed on the same page
        setTimeout(scrollToAnchor, 60);
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

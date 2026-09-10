import { useState, useEffect } from 'react';

export interface RouteState {
  path: string;
  slug?: string;
}

import { TOOLS_CONFIG } from '../data/tools';
import { guidesData } from '../data/guides';

export function updatePageMeta(
  title: string,
  description: string,
  canonicalPath: string = '/',
  schemas?: Record<string, any>[]
) {
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

  // Keyword aliases for high-intent search URLs
  const TOOL_ALIASES: Record<string, string> = {
    'open-csv': 'csv-viewer',
    'csv': 'csv-viewer',
    'view-csv': 'csv-viewer',
    'csv-reader': 'csv-viewer',
    'open-excel': 'excel-viewer',
    'xlsx-viewer': 'excel-viewer',
    'xls-viewer': 'excel-viewer',
    'excel': 'excel-viewer',
    'open-parquet': 'parquet-viewer',
    'parquet-reader': 'parquet-viewer',
    'sql': 'sql-workbench',
    'sql-on-csv': 'sql-workbench',
    'sql-on-parquet': 'sql-workbench',
    'query-csv': 'sql-workbench',
    'query-parquet': 'sql-workbench',
    'csv-sql': 'sql-workbench',
    'sql-runner': 'sql-workbench',
    'sql-on-csv-parquet': 'sql-workbench',
    'duckdb': 'sql-workbench',
    'sql-console': 'sql-workbench',
    'convert-parquet-to-csv': 'parquet-to-csv',
    'convert-csv-to-parquet': 'csv-to-parquet',
    'convert-csv-to-excel': 'csv-to-excel',
    'convert-excel-to-csv': 'excel-to-csv',
    'ndjson-viewer': 'json-viewer',
    'jsonl-viewer': 'json-viewer'
  };

  const resolvedToolSlug = TOOL_ALIASES[potentialToolSlug] || potentialToolSlug;

  if (resolvedToolSlug && TOOLS_CONFIG[resolvedToolSlug]) {
    return { path: '/tools/:toolSlug', slug: resolvedToolSlug };
  }

  // Match /guides/:slug or /guide/:slug or /articles/:slug or /blog/:slug
  const guideMatch = cleanPath.match(/^\/(?:guides|guide|docs|blog|articles?)\/([a-zA-Z0-9_-]+)$/);
  if (guideMatch) {
    return { path: '/guides/:slug', slug: guideMatch[1] };
  }

  // Support direct guide slugs indexed by search engines (e.g. /what-is-apache-parquet)
  const potentialGuideSlug = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath;
  if (guidesData.some((g) => g.slug === potentialGuideSlug)) {
    return { path: '/guides/:slug', slug: potentialGuideSlug };
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
  if (/^\/(?:tools\/)?(?:mortgage-calculator|mortgage)$/.test(cleanPath)) {
    return { path: '/mortgage-calculator' };
  }

  // Dedicated Refinance Calculator route & aliases (including should-i-refinance.php)
  if (/^\/(?:tools\/)?(?:refinance-calculator|refinance|calculators\/should-i-refinance(?:\.php)?|should-i-refinance)$/.test(cleanPath)) {
    return { path: '/refinance-calculator' };
  }

  // Dedicated DSCR Loan Calculator route & aliases
  if (/^\/(?:tools\/)?(?:dscr-loan-calculator|dscr-calculator|dscr)$/.test(cleanPath)) {
    return { path: '/dscr-loan-calculator' };
  }

  // Dedicated Hard Money & Fix-and-Flip Calculator route & aliases
  if (/^\/(?:tools\/)?(?:hard-money-calculator|hard-money-loan-calculator|fix-and-flip-calculator|hard-money)$/.test(cleanPath)) {
    return { path: '/hard-money-calculator' };
  }

  // Dedicated Snowflake Cost Calculator route & aliases
  if (/^\/(?:tools\/)?(?:snowflake-cost-calculator|snowflake-calculator|snowflake-warehouse-calculator)$/.test(cleanPath)) {
    return { path: '/snowflake-cost-calculator' };
  }

  // Dedicated Parquet Storage & Query Savings Calculator route & aliases
  if (/^\/(?:tools\/)?(?:parquet-storage-calculator|parquet-savings-calculator|parquet-cost-calculator)$/.test(cleanPath)) {
    return { path: '/parquet-storage-calculator' };
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

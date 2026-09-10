import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { parseCurrentLocation } from '../router';

describe('Router Routing & Aliases Engine', () => {
  const originalWindow = (globalThis as any).window;

  beforeEach(() => {
    let currentPath = '/';
    (globalThis as any).window = {
      location: {
        get pathname() {
          return currentPath;
        },
        hash: ''
      },
      history: {
        replaceState: (_: any, __: any, url: string) => {
          currentPath = url;
        }
      }
    };
    (globalThis as any).sessionStorage = {
      getItem: () => null,
      removeItem: () => null
    };
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
  });

  const setPath = (path: string) => {
    (globalThis as any).window.history.replaceState({}, '', path);
  };

  it('routes root / to workbench', () => {
    setPath('/');
    const route = parseCurrentLocation();
    expect(route.path).toBe('/');
  });

  it('routes standard file tools to /tools/:toolSlug', () => {
    setPath('/csv-viewer');
    expect(parseCurrentLocation()).toEqual({ path: '/tools/:toolSlug', slug: 'csv-viewer' });

    setPath('/parquet-to-excel');
    expect(parseCurrentLocation()).toEqual({ path: '/tools/:toolSlug', slug: 'parquet-to-excel' });

    setPath('/sql-workbench');
    expect(parseCurrentLocation()).toEqual({ path: '/tools/:toolSlug', slug: 'sql-workbench' });
  });

  it('routes dedicated calculators directly to their interactive pages', () => {
    setPath('/dscr-loan-calculator');
    expect(parseCurrentLocation().path).toBe('/dscr-loan-calculator');

    setPath('/mortgage-calculator');
    expect(parseCurrentLocation().path).toBe('/mortgage-calculator');

    setPath('/refinance-calculator');
    expect(parseCurrentLocation().path).toBe('/refinance-calculator');

    setPath('/hard-money-calculator');
    expect(parseCurrentLocation().path).toBe('/hard-money-calculator');

    setPath('/snowflake-cost-calculator');
    expect(parseCurrentLocation().path).toBe('/snowflake-cost-calculator');

    setPath('/parquet-storage-calculator');
    expect(parseCurrentLocation().path).toBe('/parquet-storage-calculator');

    setPath('/finance-calculator');
    expect(parseCurrentLocation().path).toBe('/finance-calculator');
  });

  it('resolves tool aliases properly', () => {
    setPath('/open-csv');
    expect(parseCurrentLocation()).toEqual({ path: '/tools/:toolSlug', slug: 'csv-viewer' });

    setPath('/sql-runner');
    expect(parseCurrentLocation()).toEqual({ path: '/tools/:toolSlug', slug: 'sql-workbench' });

    setPath('/jsonl-viewer');
    expect(parseCurrentLocation()).toEqual({ path: '/tools/:toolSlug', slug: 'json-viewer' });
  });

  it('resolves informational pages and aliases', () => {
    setPath('/about');
    expect(parseCurrentLocation().path).toBe('/about');

    setPath('/about-us');
    expect(parseCurrentLocation().path).toBe('/about');

    setPath('/privacy-policy');
    expect(parseCurrentLocation().path).toBe('/privacy');

    setPath('/terms-of-service');
    expect(parseCurrentLocation().path).toBe('/terms');
  });

  it('resolves guides hub and guide articles', () => {
    setPath('/guides');
    expect(parseCurrentLocation().path).toBe('/guides');

    setPath('/guide');
    expect(parseCurrentLocation().path).toBe('/guides');

    setPath('/guides/what-is-apache-parquet');
    expect(parseCurrentLocation()).toEqual({ path: '/guides/:slug', slug: 'what-is-apache-parquet' });
  });
});

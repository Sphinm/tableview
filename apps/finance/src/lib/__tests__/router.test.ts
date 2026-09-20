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

  it('routes root / to the underwriting hub', () => {
    setPath('/');
    expect(parseCurrentLocation().path).toBe('/');
  });

  it('routes every financial calculator to its interactive page', () => {
    for (const p of [
      '/dscr-loan-calculator',
      '/mortgage-calculator',
      '/refinance-calculator',
      '/hard-money-calculator',
      '/cap-rate-calculator',
      '/brrrr-calculator',
      '/section-1031-exchange-calculator',
      '/commercial-loan-calculator',
      '/finance-calculator',
    ]) {
      setPath(p);
      expect(parseCurrentLocation().path).toBe(p);
    }
  });

  it('resolves calculator aliases to their canonical calculator', () => {
    setPath('/dscr');
    expect(parseCurrentLocation().path).toBe('/dscr-loan-calculator');

    setPath('/fix-and-flip-calculator');
    expect(parseCurrentLocation().path).toBe('/hard-money-calculator');

    setPath('/brrrr-method-calculator');
    expect(parseCurrentLocation().path).toBe('/brrrr-calculator');

    setPath('/1031');
    expect(parseCurrentLocation().path).toBe('/section-1031-exchange-calculator');
  });

  it('no longer resolves data-tool or compressor URLs', () => {
    // Those suites live on their own origins now; the finance router must not
    // claim them, or they would render the finance 404 behind a fake route.
    setPath('/csv-viewer');
    expect(parseCurrentLocation().path).toBe('/csv-viewer');

    setPath('/open-csv');
    expect(parseCurrentLocation().path).toBe('/open-csv');

    setPath('/video-compressor');
    expect(parseCurrentLocation().path).toBe('/video-compressor');
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

    setPath('/guides/how-to-calculate-dscr');
    expect(parseCurrentLocation()).toEqual({ path: '/guides/:slug', slug: 'how-to-calculate-dscr' });
  });
});

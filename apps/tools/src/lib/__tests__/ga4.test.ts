import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import {
  setConsent,
  initConsent,
  loadAnalytics,
  GA4_MEASUREMENT_ID,
  __resetLoadLatchesForTests,
} from '../consent';

/**
 * GA4 must NEVER be requested before the visitor grants analytics consent.
 * These tests assert the observable side effects (injected <script> tags)
 * rather than internal flags, because the script tag is what actually causes a
 * network request to Google.
 */
describe('Google Analytics 4 loading', () => {
  let store: Record<string, string>;
  let appended: { src: string; dataset: Record<string, string> }[];
  let gtagCalls: any[][];
  let originalWindow: any;
  let originalStorage: any;
  let originalDocument: any;

  beforeEach(() => {
    store = {};
    appended = [];
    gtagCalls = [];
    originalWindow = (globalThis as any).window;
    originalStorage = (globalThis as any).localStorage;
    originalDocument = (globalThis as any).document;

    __resetLoadLatchesForTests();

    (globalThis as any).localStorage = {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
    };

    (globalThis as any).document = {
      // Pretend nothing is in the DOM, so every load() path is exercised.
      querySelector: () => null,
      createElement: () => ({ dataset: {} as Record<string, string>, src: '' }),
      head: {
        appendChild: (el: any) => {
          appended.push({ src: el.src, dataset: el.dataset });
        },
      },
    };

    (globalThis as any).window = {
      gtag: (...args: any[]) => gtagCalls.push(args),
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
      location: { reload: () => {} },
    };
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
    (globalThis as any).localStorage = originalStorage;
    (globalThis as any).document = originalDocument;
  });

  it('uses a well-formed GA4 measurement id', () => {
    expect(GA4_MEASUREMENT_ID).toMatch(/^G-[A-Z0-9]{8,}$/);
  });

  it('makes no request to Google before any consent decision', () => {
    // Nothing has called loadAnalytics yet — this is the state of a first-time
    // visitor who has not touched the banner.
    expect(appended).toEqual([]);
    expect(gtagCalls).toEqual([]);
  });

  /** Scripts tagged as GA4 specifically — consent also starts session replay. */
  const ga4Scripts = () => appended.filter((s) => s.dataset.tableviewGa4 === 'true');

  it('loads the GA4 script after consent is granted', () => {
    setConsent(true);

    expect(ga4Scripts().length).toBe(1);
    expect(ga4Scripts()[0].src).toBe(`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`);
  });

  it('does NOT load GA4 when consent is declined', () => {
    setConsent(false);

    expect(ga4Scripts()).toEqual([]);
    expect(appended).toEqual([]);
  });

  it('configures the correct measurement id', () => {
    loadAnalytics();

    const config = gtagCalls.find((c) => c[0] === 'config');
    expect(config).toBeDefined();
    expect(config![1]).toBe(GA4_MEASUREMENT_ID);
  });

  it('disables advertising signals on the analytics property', () => {
    loadAnalytics();

    const config = gtagCalls.find((c) => c[0] === 'config');
    // Analytics consent must not silently double as advertising consent.
    expect(config![2]).toMatchObject({
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
  });

  it('sends the js bootstrap call exactly once', () => {
    loadAnalytics();
    loadAnalytics();
    loadAnalytics();

    expect(gtagCalls.filter((c) => c[0] === 'js').length).toBe(1);
  });

  it('injects the script tag exactly once even when called repeatedly', () => {
    loadAnalytics();
    loadAnalytics();

    expect(ga4Scripts().length).toBe(1);
  });

  it('re-loads a previously granted choice on boot without a banner click', () => {
    store['tableview_cookie_consent'] = 'accepted';

    initConsent();

    expect(ga4Scripts().length).toBe(1);
    expect(ga4Scripts()[0].src).toContain(GA4_MEASUREMENT_ID);
  });

  it('does not load on boot when the visitor previously declined', () => {
    store['tableview_cookie_consent'] = 'essential_only';

    initConsent();

    expect(ga4Scripts()).toEqual([]);
  });
});

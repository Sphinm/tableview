import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { getConsent, setConsent, openCookieSettings } from '../consent';

/**
 * Consent logic is compliance-critical: a bug that reports "granted" when the
 * user declined would mean loading ad/analytics tags without consent.
 */
describe('Consent management', () => {
  let store: Record<string, string>;
  let consentCalls: any[][];
  let listeners: Record<string, (() => void)[]>;
  let originalWindow: any;
  let originalStorage: any;

  beforeEach(() => {
    store = {};
    consentCalls = [];
    listeners = {};
    originalWindow = (globalThis as any).window;
    originalStorage = (globalThis as any).localStorage;

    (globalThis as any).localStorage = {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
    };

    (globalThis as any).window = {
      gtag: (...args: any[]) => consentCalls.push(args),
      addEventListener: (type: string, fn: () => void) => {
        (listeners[type] ||= []).push(fn);
      },
      removeEventListener: () => {},
      dispatchEvent: (event: any) => {
        (listeners[event.type] || []).forEach((fn) => fn());
        return true;
      },
      location: { reload: () => {} },
    };
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
    (globalThis as any).localStorage = originalStorage;
  });

  it('reports "unset" before the visitor has chosen', () => {
    expect(getConsent()).toBe('unset');
  });

  it('records an accept and pushes a granting consent update', () => {
    setConsent(true);

    expect(getConsent()).toBe('granted');
    const update = consentCalls.find((c) => c[0] === 'consent' && c[1] === 'update');
    expect(update).toBeDefined();
    expect(update![2]).toMatchObject({
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    });
  });

  it('records a decline and pushes a denying consent update', () => {
    setConsent(false);

    expect(getConsent()).toBe('denied');
    const update = consentCalls.find((c) => c[0] === 'consent' && c[1] === 'update');
    expect(update![2]).toMatchObject({
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });
  });

  it('treats an unrecognised stored value as "unset" rather than consent', () => {
    store['tableview_cookie_consent'] = 'yes-please';
    expect(getConsent()).toBe('unset');
  });

  it('survives localStorage being unavailable', () => {
    (globalThis as any).localStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };

    expect(getConsent()).toBe('unset');
    expect(() => setConsent(true)).not.toThrow();
  });

  it('does not throw when the Consent Mode stub is absent', () => {
    (globalThis as any).window = { addEventListener: () => {}, removeEventListener: () => {} };
    expect(() => setConsent(true)).not.toThrow();
    expect(getConsent()).toBe('granted');
  });

  it('notifies the banner when the visitor asks to change their choice', () => {
    let notified = false;
    (globalThis as any).window.addEventListener('tableview:open-cookie-settings', () => {
      notified = true;
    });

    openCookieSettings();
    expect(notified).toBe(true);
  });
});

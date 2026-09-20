import { describe, it, expect } from 'bun:test';
import { COOKIE_BANNER_SELECTOR, isCookieBannerPresent } from '../cookieBannerPlacement';

/** Minimal stand-in for the one DOM call the detector makes. */
function rootWith(banner: boolean): ParentNode {
  return {
    querySelector: (selector: string) =>
      banner && selector === COOKIE_BANNER_SELECTOR ? ({} as Element) : null,
  } as unknown as ParentNode;
}

describe('Cookie-banner detection', () => {
  it('reports the banner as present only when it is actually mounted', () => {
    expect(isCookieBannerPresent(rootWith(true))).toBe(true);
    expect(isCookieBannerPresent(rootWith(false))).toBe(false);
  });

  it('detects the banner through a stable accessibility hook, not a class name', () => {
    expect(COOKIE_BANNER_SELECTOR).toBe('[aria-label="Close banner"]');
  });
});

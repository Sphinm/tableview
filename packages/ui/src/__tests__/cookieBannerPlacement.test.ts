import { describe, it, expect } from 'bun:test';
import {
  COOKIE_BANNER_SELECTOR,
  isCookieBannerPresent,
  shouldLiftForCookieBanner,
} from '../cookieBannerPlacement';

/** Minimal stand-in for the one DOM call the rule makes. */
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
    // The banner is styled with Tailwind utilities that churn; its close button's
    // aria-label is the part that has to stay put.
    expect(COOKIE_BANNER_SELECTOR).toBe('[aria-label="Close banner"]');
  });
});

describe('Cookie-banner collision avoidance', () => {
  it('lifts the button while the banner is on screen', () => {
    expect(shouldLiftForCookieBanner(true)).toBe(true);
  });

  it('rests the button back in the corner once the banner is gone', () => {
    expect(shouldLiftForCookieBanner(false)).toBe(false);
  });
});

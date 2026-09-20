/**
 * Locating and detecting the cookie banner.
 *
 * The banner claims the same bottom-right corner as the floating feedback
 * button, so the button has to know whether it is on screen right now.
 *
 * Detecting the banner by **presence** — rather than inferring it from stored
 * consent — is deliberate. Consent only tells you whether the banner is due to
 * appear the first time; a visitor can also reopen it from the footer, after
 * which it stays up until they choose again. An earlier revision inferred the
 * state and cleared it on a 1.5s timer, which dropped the button back behind a
 * banner that was still visible.
 */
export const COOKIE_BANNER_SELECTOR = '[aria-label="Close banner"]';

/**
 * Whether the cookie banner is currently mounted.
 *
 * Takes the root to query instead of reaching for `document`, which keeps it a
 * plain function that can be exercised without a DOM.
 */
export function isCookieBannerPresent(root: ParentNode): boolean {
  return root.querySelector(COOKIE_BANNER_SELECTOR) !== null;
}

/**
 * Whether the floating button must sit above the cookie banner.
 *
 * Kept as a named rule (rather than inlining `if (bannerPresent)`) so the
 * placement decision has one home shared by the component and its tests.
 */
export function shouldLiftForCookieBanner(bannerPresent: boolean): boolean {
  return bannerPresent;
}

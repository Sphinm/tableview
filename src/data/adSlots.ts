/**
 * AdSense configuration — the single place to change ad unit IDs.
 *
 * These IDs come from the AdSense dashboard (Ads -> By ad unit). Until a unit is
 * approved and its ID is pasted here, the slot keeps the PLACEHOLDER value and
 * AdSlot deliberately does NOT push a request for it: requesting an invalid slot
 * spams the console with errors and counts as invalid ad requests against the
 * account.
 *
 * To go live:
 *   1. Create a unit in AdSense for each entry below.
 *   2. Replace its '0000000000' with the real `data-ad-slot` value.
 *   3. Run `bun run adslots:check` to confirm every intended placement resolves.
 */

export const ADSENSE_CLIENT = 'ca-pub-3414270480046504';

/** The value AdSense assigns to nothing — treated as "not configured". */
export const PLACEHOLDER_SLOT = '0000000000';

/**
 * Ad unit registry, keyed by *placement intent* rather than by page, so the same
 * unit can be reused where the surrounding content shape is the same.
 */
export const AD_UNITS = {
  /** Inside long-form copy: tool landing pages, between feature and FAQ blocks. */
  toolInArticle: '0000000000',
  /** Guides hub listing and guide article body. */
  guideInArticle: '0000000000',
  /** Directly beneath a calculator's result summary — highest commercial intent. */
  calculatorResult: '0000000000',
  /** Between FAQ entries on a calculator page. */
  calculatorFaq: '0000000000',
  /** Below the file drop zone, before any file is loaded. */
  workbenchLeaderboard: '0000000000',
} as const;

export type AdUnitKey = keyof typeof AD_UNITS;

/** True when the unit is still the unconfigured placeholder. */
export function isPlaceholderSlot(slot: string | undefined): boolean {
  return !slot || slot === PLACEHOLDER_SLOT;
}

/**
 * Which placements are live. Used by the checker script and by AdSlot's
 * dev-time console hint.
 */
export function configuredUnits(): AdUnitKey[] {
  return (Object.keys(AD_UNITS) as AdUnitKey[]).filter((key) => !isPlaceholderSlot(AD_UNITS[key]));
}

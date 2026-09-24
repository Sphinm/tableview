/**
 * Billing & Monetization Configuration for TableView Finance
 *
 * During the compliance and underwriting review period with Dodo Payments (0/3 submitted),
 * setting PUBLIC_BETA_FREE_ACCESS to true unlocks all Pro features and Single Deal Passes
 * for users 100% free of charge without requiring a credit card or payment gateway redirect.
 *
 * Once Dodo Payments verification passes and Go-Live is unlocked, simply change
 * PUBLIC_BETA_FREE_ACCESS to false to activate live checkout.
 */
export const BILLING_CONFIG = {
  /** When true, grants free one-click unlock for Pro membership & Deal Passes during beta review */
  PUBLIC_BETA_FREE_ACCESS: false,

  /** Dodo Payments Catalog IDs */
  DODO_PRODUCTS: {
    DEAL_PASS: 'pdt_0NoH8a1OCj6WLZs1X4QEp',
    PRO_MONTHLY: 'pdt_0NoH8xSY84Q9x8j4N0b0V',
    PRO_YEARLY: 'pdt_0NoH9OyMm3YOX0ump1AbW',
  },
} as const;

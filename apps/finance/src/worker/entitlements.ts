/**
 * Entitlement resolution — the single source of truth for what a paying user may do.
 *
 * Provider-agnostic on purpose. Stripe, Paddle and Lemon Squeezy each use their own
 * status vocabulary and their own webhook shapes, but every one of them reduces to the
 * same two facts: "is there a live subscription?" and "was this one-off thing bought?".
 * Normalising at the boundary means the rest of the system — and the whole UI — never
 * learns which provider is in use, so the provider can be swapped without touching
 * feature gates.
 *
 * Pure and dependency-free: no I/O, no imports, no clock reads. `now` is a parameter so
 * the rules can be tested at exact instants rather than approximately.
 *
 * This replaces the previous model, where the client wrote its own plan into
 * localStorage and the server was never consulted. Entitlements are now derived
 * server-side from records the payment provider is the authority for; the browser only
 * ever receives the answer.
 */

/** Capabilities the UI gates on. Keep these coarse — one key per sellable promise. */
export type EntitlementKey =
  | 'unlimited_exports'
  | 'white_label_branding'
  | 'share_links'
  | 'unlimited_scenarios'
  | 'pro_models';

/** Every capability an active Pro subscription confers. */
export const PRO_ENTITLEMENTS: EntitlementKey[] = [
  'unlimited_exports',
  'white_label_branding',
  'share_links',
  'unlimited_scenarios',
  'pro_models',
];

/**
 * Normalised subscription states. Providers disagree on spelling and on granularity
 * (e.g. `on_trial` vs `trialing`, `cancelled` vs `canceled`, `unpaid` vs `past_due`),
 * so everything is folded into this set.
 */
export type NormalizedStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'paused'
  | 'incomplete'
  | 'expired'
  | 'unknown';

const STATUS_MAP: Record<string, NormalizedStatus> = {
  // Stripe
  active: 'active',
  trialing: 'trialing',
  past_due: 'past_due',
  unpaid: 'past_due',
  canceled: 'canceled',
  incomplete: 'incomplete',
  incomplete_expired: 'expired',
  paused: 'paused',
  // Paddle
  // (active / trialing / past_due / paused / canceled share the spellings above)
  // Lemon Squeezy
  on_trial: 'trialing',
  cancelled: 'canceled',
  expired: 'expired',
};

/**
 * Anything unrecognised resolves to `unknown`, which is deliberately NOT entitled.
 * A provider adding a new state must therefore fail closed rather than accidentally
 * granting access.
 */
export function normalizeSubscriptionStatus(raw: string): NormalizedStatus {
  if (!raw) return 'unknown';
  return STATUS_MAP[String(raw).toLowerCase().trim()] ?? 'unknown';
}

export interface SubscriptionRecord {
  status: string;
  /** End of the period the customer has already paid for (epoch ms). */
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  /** Provider price identifier, kept for diagnostics and future plan tiers. */
  priceId?: string | null;
}

export interface PurchaseRecord {
  /** Which product was bought, e.g. `deal_pass`. */
  productKey: string;
  /** The thing it unlocks, e.g. a deal id. */
  resourceId: string | null;
  /** Set when refunded; a refunded purchase confers nothing. */
  refundedAt?: number | null;
}

export type EntitlementInterval = 'month' | 'year' | 'one_time' | 'none';

export interface EntitlementState {
  plan: 'free' | 'pro';
  interval: EntitlementInterval;
  membershipTitle: string;
  keys: EntitlementKey[];
  /** Resource ids unlocked by one-off purchases. */
  dealPasses: string[];
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
  /** Where the entitlement came from, for support and debugging. */
  source: 'subscription' | 'purchase' | 'none';
}

/**
 * How long a failed payment keeps working. Long enough that a card expiring on a
 * weekend does not lock a paying customer out mid-deal, short enough that a genuinely
 * abandoned subscription stops consuming service.
 */
export const GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * The product key that grants a single deal rather than the subscription tier.
 * One-time purchases are modelled as entitlements too, so there is exactly one path
 * the UI asks about.
 */
export const DEAL_PASS_PRODUCT_KEY = 'deal_pass';

function isSubscriptionEntitled(sub: SubscriptionRecord, now: number): boolean {
  const status = normalizeSubscriptionStatus(sub.status);
  const periodEnd = Number.isFinite(sub.currentPeriodEnd) ? sub.currentPeriodEnd : 0;

  switch (status) {
    case 'active':
    case 'trialing':
      return true;

    case 'past_due':
      // Failed payment: keep serving through the grace window.
      return now <= periodEnd + GRACE_PERIOD_MS;

    case 'canceled':
      // Cancelled means "will not renew", not "revoked early" — the customer has paid
      // for this period, so access ends with it. No grace here: the period elapsed.
      return now <= periodEnd;

    case 'paused':
    case 'incomplete':
    case 'expired':
    case 'unknown':
    default:
      return false;
  }
}

export function resolveEntitlements(input: {
  subscription?: SubscriptionRecord | null;
  purchases?: PurchaseRecord[] | null;
  now: number;
}): EntitlementState {
  const { subscription, purchases, now } = input;

  const dealPasses = [
    ...new Set(
      (purchases ?? [])
        .filter(
          (p) =>
            p.productKey === DEAL_PASS_PRODUCT_KEY &&
            typeof p.resourceId === 'string' &&
            p.resourceId.length > 0 &&
            !p.refundedAt
        )
        .map((p) => p.resourceId as string)
    ),
  ].sort();

  const hasLiveSubscription = Boolean(subscription) && isSubscriptionEntitled(subscription!, now);
  const hasProPurchase = (purchases ?? []).some(
    (p) => p.productKey === 'pro_membership' && !p.refundedAt
  );

  if (hasLiveSubscription || hasProPurchase) {
    const sub = subscription;
    const isYearly =
      sub?.priceId === 'pdt_0NoH9OyMm3YOX0ump1AbW' ||
      Boolean(sub?.priceId && sub.priceId.toLowerCase().includes('year')) ||
      (typeof sub?.currentPeriodEnd === 'number' && sub.currentPeriodEnd - now > 45 * 24 * 60 * 60 * 1000);

    const interval: EntitlementInterval = isYearly ? 'year' : 'month';
    const membershipTitle = isYearly ? 'Pro Annual' : 'Pro Monthly';

    return {
      plan: 'pro',
      interval,
      membershipTitle,
      keys: [...PRO_ENTITLEMENTS],
      dealPasses,
      currentPeriodEnd: sub?.currentPeriodEnd ?? undefined,
      cancelAtPeriodEnd: Boolean(sub?.cancelAtPeriodEnd),
      source: hasLiveSubscription ? 'subscription' : 'purchase',
    };
  }

  const hasDealPass = dealPasses.length > 0;
  return {
    plan: 'free',
    interval: hasDealPass ? 'one_time' : 'none',
    membershipTitle: hasDealPass ? 'Single Deal Pass' : 'Free Starter',
    keys: [],
    dealPasses,
    source: hasDealPass ? 'purchase' : 'none',
  };
}

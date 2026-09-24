import { describe, it, expect } from 'bun:test';
import {
  normalizeSubscriptionStatus,
  resolveEntitlements,
  GRACE_PERIOD_MS,
  type PurchaseRecord,
  type SubscriptionRecord,
} from '../entitlements';

const NOW = 1_800_000_000_000; // fixed clock
const DAY = 24 * 60 * 60 * 1000;

const sub = (over: Partial<SubscriptionRecord> = {}): SubscriptionRecord => ({
  status: 'active',
  currentPeriodEnd: NOW + 20 * DAY,
  cancelAtPeriodEnd: false,
  priceId: 'price_pro_monthly',
  ...over,
});

const pass = (over: Partial<PurchaseRecord> = {}): PurchaseRecord => ({
  productKey: 'deal_pass',
  resourceId: 'deal_123',
  refundedAt: null,
  ...over,
});

describe('normalizeSubscriptionStatus', () => {
  it('maps each provider\'s vocabulary onto one set of states', () => {
    // Stripe / Paddle / Lemon Squeezy all spell these differently.
    expect(normalizeSubscriptionStatus('active')).toBe('active');
    expect(normalizeSubscriptionStatus('trialing')).toBe('trialing');
    expect(normalizeSubscriptionStatus('on_trial')).toBe('trialing');
    expect(normalizeSubscriptionStatus('past_due')).toBe('past_due');
    expect(normalizeSubscriptionStatus('unpaid')).toBe('past_due');
    expect(normalizeSubscriptionStatus('cancelled')).toBe('canceled');
    expect(normalizeSubscriptionStatus('canceled')).toBe('canceled');
    expect(normalizeSubscriptionStatus('expired')).toBe('expired');
    expect(normalizeSubscriptionStatus('paused')).toBe('paused');
    expect(normalizeSubscriptionStatus('incomplete')).toBe('incomplete');
    expect(normalizeSubscriptionStatus('incomplete_expired')).toBe('expired');
  });

  it('treats an unknown status as not entitled rather than guessing', () => {
    expect(normalizeSubscriptionStatus('some_new_provider_state')).toBe('unknown');
  });
});

describe('resolveEntitlements', () => {
  it('grants nothing without a subscription or a purchase', () => {
    const state = resolveEntitlements({ now: NOW });
    expect(state.plan).toBe('free');
    expect(state.keys).toEqual([]);
    expect(state.dealPasses).toEqual([]);
  });

  it('grants the full Pro set while the subscription is active', () => {
    const state = resolveEntitlements({ subscription: sub(), now: NOW });
    expect(state.plan).toBe('pro');
    expect(state.keys).toContain('unlimited_exports');
    expect(state.keys).toContain('white_label_branding');
    expect(state.keys).toContain('share_links');
    expect(state.keys).toContain('unlimited_scenarios');
    expect(state.keys).toContain('pro_models');
  });

  it('treats a trial as full Pro access', () => {
    const state = resolveEntitlements({ subscription: sub({ status: 'trialing' }), now: NOW });
    expect(state.plan).toBe('pro');
  });

  it('keeps access until period end when the user cancels at period end', () => {
    // The whole point of "cancel anytime": paid time is not revoked early.
    const state = resolveEntitlements({
      subscription: sub({ cancelAtPeriodEnd: true, currentPeriodEnd: NOW + 5 * DAY }),
      now: NOW,
    });
    expect(state.plan).toBe('pro');
    expect(state.cancelAtPeriodEnd).toBe(true);
  });

  it('keeps access during the paid period after the provider marks it canceled', () => {
    const state = resolveEntitlements({
      subscription: sub({ status: 'canceled', currentPeriodEnd: NOW + 2 * DAY }),
      now: NOW,
    });
    expect(state.plan).toBe('pro');
  });

  it('revokes access once the paid period has actually elapsed', () => {
    const state = resolveEntitlements({
      subscription: sub({ status: 'canceled', currentPeriodEnd: NOW - DAY }),
      now: NOW,
    });
    expect(state.plan).toBe('free');
    expect(state.keys).toEqual([]);
  });

  it('allows a grace window for a failed payment instead of cutting off immediately', () => {
    const failed = sub({ status: 'past_due', currentPeriodEnd: NOW - 1 * DAY });
    expect(resolveEntitlements({ subscription: failed, now: NOW }).plan).toBe('pro');
    // ...but not forever.
    expect(
      resolveEntitlements({ subscription: failed, now: NOW + GRACE_PERIOD_MS + DAY }).plan
    ).toBe('free');
  });

  it('does not grant access to paused, incomplete or expired subscriptions', () => {
    for (const status of ['paused', 'incomplete', 'expired', 'unknown'] as const) {
      expect(resolveEntitlements({ subscription: sub({ status }), now: NOW }).plan).toBe('free');
    }
  });

  it('unlocks exactly the purchased deal, not the whole Pro tier', () => {
    const state = resolveEntitlements({ purchases: [pass()], now: NOW });
    expect(state.plan).toBe('free');
    expect(state.dealPasses).toEqual(['deal_123']);
    expect(state.keys).not.toContain('unlimited_exports');
  });

  it('ignores a refunded purchase', () => {
    const state = resolveEntitlements({ purchases: [pass({ refundedAt: NOW - DAY })], now: NOW });
    expect(state.dealPasses).toEqual([]);
  });

  it('ignores a purchase that is not a deal pass', () => {
    const state = resolveEntitlements({
      purchases: [pass({ productKey: 'something_else' })],
      now: NOW,
    });
    expect(state.dealPasses).toEqual([]);
  });

  it('deduplicates deal passes when the same deal was bought twice', () => {
    const state = resolveEntitlements({ purchases: [pass(), pass()], now: NOW });
    expect(state.dealPasses).toEqual(['deal_123']);
  });

  it('grants Pro plan when a pro_membership purchase exists', () => {
    const state = resolveEntitlements({
      purchases: [{ productKey: 'pro_membership', resourceId: null, refundedAt: null }],
      now: NOW,
    });
    expect(state.plan).toBe('pro');
    expect(state.keys).toContain('unlimited_exports');
  });

  it('is deterministic for the same inputs and clock', () => {
    const input = { subscription: sub(), purchases: [pass()], now: NOW };
    expect(resolveEntitlements(input).keys).toEqual(resolveEntitlements(input).keys);
  });
});

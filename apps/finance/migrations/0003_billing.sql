-- Migration: 0003_billing.sql
-- Payment and entitlement state, in the identity database (tableview_db) alongside
-- `users`.
--
-- Design notes:
--
-- 1. Provider-agnostic. The columns a provider owns are namespaced with
--    `provider_*` and paired with a `provider` discriminator plus a UNIQUE
--    constraint, so switching or adding a provider (Stripe <-> Paddle <-> Lemon
--    Squeezy) never needs a schema change or a data migration.
--
-- 2. The provider is the authority for money; this database is the authority for
--    access. Rows here are only ever written by verified webhooks, never by the
--    browser. That is the correction to the previous model, where the client wrote
--    its own plan and the server was never consulted.
--
-- 3. Guest checkout is supported. A buyer need not have an account before paying, so
--    `user_id` is nullable and is resolved from `email` when the webhook lands. This
--    matters for a $9.99 one-off, where forcing signup first loses the sale.
--
-- 4. Webhook delivery is assumed to be at-least-once AND out-of-order, because that is
--    what every provider actually guarantees. Correctness therefore rests on two
--    separate mechanisms: the `billing_webhook_events` primary key makes processing
--    idempotent, and `last_event_at` makes it order-independent. Relying on either
--    alone produces a known class of bug (double-extended subscriptions, or a
--    cancelled subscription coming back to life).

-- One row per (provider customer <-> our user).
CREATE TABLE IF NOT EXISTS billing_customers (
  id                    TEXT PRIMARY KEY,
  user_id               TEXT REFERENCES users(id) ON DELETE SET NULL,
  provider              TEXT NOT NULL,
  provider_customer_id  TEXT NOT NULL,
  email                 TEXT,
  country               TEXT,              -- ISO 3166-1 alpha-2, for tax evidence
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL,
  UNIQUE (provider, provider_customer_id)
);

CREATE INDEX IF NOT EXISTS idx_billing_customers_user  ON billing_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_customers_email ON billing_customers(email);

-- Recurring subscriptions. Status is stored RAW as the provider sent it; the
-- normalisation to our own states happens in code (worker/entitlements.ts) so that a
-- provider's new or renamed status cannot require a data migration.
--
-- `last_event_at` is the ordering guard. Providers do NOT guarantee webhook delivery
-- order, so a stale "active" event arriving after a newer "canceled" one would
-- otherwise resurrect a cancelled subscription. Every upsert is conditional on the
-- incoming event being at least as new as the stored one.
CREATE TABLE IF NOT EXISTS billing_subscriptions (
  id                        TEXT PRIMARY KEY,
  customer_id               TEXT NOT NULL REFERENCES billing_customers(id) ON DELETE CASCADE,
  provider                  TEXT NOT NULL,
  provider_subscription_id  TEXT NOT NULL,
  provider_price_id         TEXT,
  status                    TEXT NOT NULL,
  current_period_end        INTEGER,
  cancel_at_period_end      INTEGER NOT NULL DEFAULT 0,
  canceled_at               INTEGER,
  last_event_at             INTEGER NOT NULL DEFAULT 0,  -- ordering guard
  created_at                INTEGER NOT NULL,
  updated_at                INTEGER NOT NULL,
  UNIQUE (provider, provider_subscription_id)
);

CREATE INDEX IF NOT EXISTS idx_billing_subs_customer ON billing_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_billing_subs_status   ON billing_subscriptions(status);

-- One-off purchases that unlock a single resource rather than a tier.
CREATE TABLE IF NOT EXISTS billing_purchases (
  id                 TEXT PRIMARY KEY,
  customer_id        TEXT REFERENCES billing_customers(id) ON DELETE SET NULL,
  provider           TEXT NOT NULL,
  provider_order_id  TEXT NOT NULL,
  product_key        TEXT NOT NULL,        -- e.g. 'deal_pass'
  resource_id        TEXT,                 -- e.g. the deal id it unlocks
  amount_minor       INTEGER,              -- integer minor units; never a float
  currency           TEXT,                 -- ISO 4217
  refunded_at        INTEGER,              -- a refunded purchase grants nothing
  last_event_at      INTEGER NOT NULL DEFAULT 0,  -- ordering guard, as above
  created_at         INTEGER NOT NULL,
  UNIQUE (provider, provider_order_id)
);

CREATE INDEX IF NOT EXISTS idx_billing_purchases_customer ON billing_purchases(customer_id);
CREATE INDEX IF NOT EXISTS idx_billing_purchases_product  ON billing_purchases(product_key);

-- Webhook idempotency ledger.
--
-- Every provider retries deliveries, and the same event is routinely delivered more
-- than once. Claiming the event id here BEFORE doing any work makes processing
-- exactly-once-by-id, so a retry cannot double-extend a subscription or re-grant a
-- refund. The primary key is the provider's own event id, which is what makes the
-- claim atomic.
CREATE TABLE IF NOT EXISTS billing_webhook_events (
  id            TEXT PRIMARY KEY,          -- provider event id
  provider      TEXT NOT NULL,
  event_type    TEXT NOT NULL,
  received_at   INTEGER NOT NULL,
  processed_at  INTEGER,
  error         TEXT                       -- set when handling failed, so it can be replayed
);

CREATE INDEX IF NOT EXISTS idx_billing_events_received ON billing_webhook_events(received_at);
CREATE INDEX IF NOT EXISTS idx_billing_events_unprocessed ON billing_webhook_events(processed_at);

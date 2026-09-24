import type { PaymentProviderAdapter, NormalizedWebhookEvent } from '../billingWebhook';
import { constantTimeEqual } from '../billingWebhookRoute';

/**
 * Stripe webhook adapter.
 *
 * Implements Stripe-Signature v1 HMAC-SHA256 timestamped signature verification
 * and event normalization.
 */
export const stripeAdapter: PaymentProviderAdapter = {
  id: 'stripe',
  signatureHeader: 'stripe-signature',

  async verifySignature({ rawBody, headers, secret }): Promise<boolean> {
    const signatureHeader = headers.get(this.signatureHeader);
    if (!signatureHeader) return false;

    // Header format: t=timestamp,v1=signature
    const parts = signatureHeader.split(',').reduce<Record<string, string>>((acc, item) => {
      const [k, v] = item.split('=');
      if (k && v) acc[k.trim()] = v.trim();
      return acc;
    }, {});

    const timestamp = parts['t'];
    const signature = parts['v1'];
    if (!timestamp || !signature) return false;

    try {
      const signedPayload = `${timestamp}.${rawBody}`;
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
      const expected = [...new Uint8Array(mac)]
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      return constantTimeEqual(expected, signature.toLowerCase());
    } catch {
      return false;
    }
  },

  normalize({ rawBody }): NormalizedWebhookEvent | null {
    try {
      const event = JSON.parse(rawBody) as {
        id: string;
        type: string;
        created: number;
        data?: { object?: any };
      };

      const eventId = event.id;
      const eventType = event.type;
      const occurredAt = (event.created ? event.created * 1000 : Date.now());
      const obj = event.data?.object || {};

      switch (eventType) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          return {
            providerEventId: eventId,
            type: 'subscription_upsert',
            occurredAt,
            subscription: {
              providerCustomerId: obj.customer,
              email: obj.customer_email || null,
              providerSubscriptionId: obj.id,
              providerPriceId: obj.items?.data?.[0]?.price?.id || null,
              status: obj.status, // Normalized by entitlements.ts
              currentPeriodEnd: obj.current_period_end ? obj.current_period_end * 1000 : null,
              cancelAtPeriodEnd: Boolean(obj.cancel_at_period_end),
            },
          };
        }

        case 'checkout.session.completed': {
          if (obj.mode === 'payment') {
            const meta = obj.metadata || {};
            const productKey = meta.productKey || 'deal_pass';

            return {
              providerEventId: eventId,
              type: 'purchase_upsert',
              occurredAt,
              purchase: {
                providerCustomerId: obj.customer || null,
                email: obj.customer_details?.email || obj.customer_email || null,
                providerOrderId: obj.id,
                productKey,
                resourceId: meta.dealId || null,
                amountMinor: obj.amount_total || 999,
                currency: String(obj.currency || 'usd').toUpperCase(),
              },
            };
          }
          // If subscription checkout, customer.subscription.created will follow
          return { providerEventId: eventId, type: 'ignore', occurredAt };
        }

        case 'charge.refunded': {
          const paymentIntent = obj.payment_intent || obj.id;
          return {
            providerEventId: eventId,
            type: 'purchase_refund',
            occurredAt,
            purchase: { providerOrderId: paymentIntent },
          };
        }

        default:
          return { providerEventId: eventId, type: 'ignore', occurredAt };
      }
    } catch {
      return null;
    }
  },
};

import type { PaymentProviderAdapter, NormalizedWebhookEvent } from '../billingWebhook';
import { constantTimeEqual } from '../billingWebhookRoute';

/**
 * Creem Merchant of Record (MoR) webhook adapter.
 *
 * Implements HMAC-SHA256 signature verification and payload normalization
 * for Creem subscription and checkout events.
 */
export const creemAdapter: PaymentProviderAdapter = {
  id: 'creem',
  signatureHeader: 'creem-signature',

  async verifySignature({ rawBody, headers, secret }): Promise<boolean> {
    const provided = headers.get(this.signatureHeader);
    if (!provided) return false;

    try {
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
      const expected = [...new Uint8Array(mac)]
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      return constantTimeEqual(expected, provided.trim().toLowerCase());
    } catch {
      return false;
    }
  },

  normalize({ rawBody }): NormalizedWebhookEvent | null {
    try {
      const body = JSON.parse(rawBody) as {
        id?: string;
        eventType?: string;
        event_type?: string;
        created_at?: number | string;
        object?: any;
        data?: any;
      };

      const eventId = body.id || `creem_evt_${Date.now()}`;
      const eventType = body.eventType || body.event_type || '';
      const occurredAt =
        (typeof body.created_at === 'number'
          ? body.created_at
          : Date.parse(body.created_at as string)) || Date.now();

      const obj = body.object || body.data?.object || body.data || {};

      switch (eventType) {
        case 'subscription.active':
        case 'subscription.paid':
        case 'subscription.canceled':
        case 'subscription.past_due':
        case 'subscription.trialing':
        case 'subscription.created':
        case 'subscription.updated': {
          const rawStatus = eventType.startsWith('subscription.')
            ? eventType.split('.')[1]
            : obj.status || 'active';

          return {
            providerEventId: eventId,
            type: 'subscription_upsert',
            occurredAt,
            subscription: {
              providerCustomerId: obj.customer?.id || obj.customer_id || 'cust_unknown',
              email: obj.customer?.email || obj.email || null,
              providerSubscriptionId: obj.id || obj.subscription_id || eventId,
              providerPriceId: obj.product_id || obj.product || obj.price_id || null,
              status: rawStatus,
              currentPeriodEnd: obj.current_period_end
                ? typeof obj.current_period_end === 'number'
                  ? obj.current_period_end
                  : Date.parse(obj.current_period_end)
                : null,
              cancelAtPeriodEnd: Boolean(obj.cancel_at_period_end),
            },
          };
        }

        case 'checkout.completed':
        case 'order.paid': {
          const meta = obj.metadata || obj.custom_fields || {};
          const productKey = meta.productKey || (obj.product_id?.includes('deal') ? 'deal_pass' : 'deal_pass');

          if (productKey !== 'deal_pass') {
            return { providerEventId: eventId, type: 'ignore', occurredAt };
          }

          return {
            providerEventId: eventId,
            type: 'purchase_upsert',
            occurredAt,
            purchase: {
              providerCustomerId: obj.customer?.id || obj.customer_id || null,
              email: obj.customer?.email || obj.email || null,
              providerOrderId: obj.order?.id || obj.order_id || obj.id || eventId,
              productKey: 'deal_pass',
              resourceId: meta.dealId || meta.resourceId || null,
              amountMinor: Number(obj.order?.amount ?? obj.amount ?? 999),
              currency: String(obj.order?.currency ?? obj.currency ?? 'USD').toUpperCase(),
            },
          };
        }

        case 'refund.created':
        case 'order.refunded': {
          const orderId = obj.order?.id || obj.order_id || obj.id;
          if (!orderId) {
            return { providerEventId: eventId, type: 'ignore', occurredAt };
          }
          return {
            providerEventId: eventId,
            type: 'purchase_refund',
            occurredAt,
            purchase: { providerOrderId: orderId },
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

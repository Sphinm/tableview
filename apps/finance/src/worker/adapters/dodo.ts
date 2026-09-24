import type { PaymentProviderAdapter, NormalizedWebhookEvent } from '../billingWebhook';
import { constantTimeEqual } from '../billingWebhookRoute';

/**
 * Dodo Payments Merchant of Record (MoR) webhook adapter.
 *
 * Follows the Standard Webhooks (Svix) specification with HMAC-SHA256
 * signature verification and payload normalization for Dodo Payments.
 */
export const dodoAdapter: PaymentProviderAdapter = {
  id: 'dodo',
  signatureHeader: 'webhook-signature',

  async verifySignature({ rawBody, headers, secret }): Promise<boolean> {
    const signatureHeader = headers.get(this.signatureHeader);
    const msgId = headers.get('webhook-id');
    const timestamp = headers.get('webhook-timestamp');

    if (!signatureHeader || !msgId || !timestamp) {
      return false;
    }

    try {
      // Dodo webhook secrets usually follow the 'whsec_BASE64' format
      const cleanSecret = secret.startsWith('whsec_') ? secret.slice(6) : secret;
      let rawKeyBytes: Uint8Array;
      try {
        const bin = atob(cleanSecret);
        rawKeyBytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) {
          rawKeyBytes[i] = bin.charCodeAt(i);
        }
      } catch {
        rawKeyBytes = new TextEncoder().encode(cleanSecret);
      }

      const key = await crypto.subtle.importKey(
        'raw',
        rawKeyBytes as any,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      // Signed payload is `${webhook-id}.${webhook-timestamp}.${rawBody}`
      const signedContent = `${msgId}.${timestamp}.${rawBody}`;
      const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedContent));
      const expectedBase64 = btoa(String.fromCharCode(...new Uint8Array(mac)));

      // Signatures header may contain multiple space-separated signatures: "v1,signature1 v1,signature2"
      const passedSignatures = signatureHeader.split(' ').map((s) => s.trim());
      for (const sig of passedSignatures) {
        const actual = sig.startsWith('v1,') ? sig.slice(3) : sig;
        if (constantTimeEqual(expectedBase64, actual)) {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  },

  normalize({ rawBody }: { rawBody: string }): NormalizedWebhookEvent | null {
    try {
      const body = JSON.parse(rawBody) as {
        type?: string;
        timestamp?: string | number;
        data?: any;
      };

      const eventType = body.type || '';
      const data = body.data || {};
      const eventId =
        data.payment_id ||
        data.subscription_id ||
        data.id ||
        `dodo_evt_${Date.now()}`;

      const occurredAt =
        (typeof body.timestamp === 'number'
          ? body.timestamp
          : Date.parse(body.timestamp as string)) || Date.now();

      // 1. Subscription Events
      if (eventType.startsWith('subscription.')) {
        let rawStatus = eventType.replace('subscription.', '');
        if (rawStatus === 'renewed') rawStatus = 'active';

        const periodEndRaw = data.next_billing_date || data.current_period_end;
        const currentPeriodEnd = periodEndRaw
          ? typeof periodEndRaw === 'number'
            ? periodEndRaw
            : Date.parse(periodEndRaw)
          : null;

        return {
          providerEventId: eventId,
          type: 'subscription_upsert',
          occurredAt,
          subscription: {
            providerCustomerId: data.customer?.customer_id || data.customer_id || 'cust_unknown',
            email: data.customer?.email || data.email || null,
            providerSubscriptionId: data.subscription_id || eventId,
            providerPriceId: data.product_id || null,
            status: data.status || rawStatus,
            currentPeriodEnd,
            cancelAtPeriodEnd: Boolean(data.cancel_at_next_billing_date || data.cancelled_at),
          },
        };
      }

      // 2. One-Time Payment Events
      if (eventType === 'payment.succeeded') {
        const meta = data.metadata || {};
        const pdtId = data.product_cart?.[0]?.product_id || data.product_id;
        const isProProduct =
          meta.productKey === 'pro_membership' ||
          pdtId === 'pdt_0NoH8xSY84Q9x8j4N0b0V' ||
          pdtId === 'pdt_0NoH9OyMm3YOX0ump1AbW';

        const productKey = isProProduct ? 'pro_membership' : (meta.productKey || 'deal_pass');

        return {
          providerEventId: eventId,
          type: 'purchase_upsert',
          occurredAt,
          purchase: {
            providerCustomerId: data.customer?.customer_id || data.customer_id || null,
            email: data.customer?.email || data.email || meta.userEmail || null,
            providerOrderId: data.payment_id || eventId,
            productKey,
            resourceId: meta.dealId || null,
            amountMinor: typeof data.total_amount === 'number' ? data.total_amount : 999,
            currency: (data.currency || 'USD').toUpperCase(),
          },
        };
      }

      // 3. Payment Refunds
      if (eventType === 'payment.refunded') {
        return {
          providerEventId: eventId,
          type: 'purchase_refund',
          occurredAt,
          purchase: {
            providerOrderId: data.payment_id || eventId,
          },
        };
      }

      return {
        providerEventId: eventId,
        type: 'ignore',
        occurredAt,
      };
    } catch {
      return null;
    }
  },
};

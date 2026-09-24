import { describe, it, expect } from 'bun:test';
import { creemAdapter } from '../adapters/creem';
import { stripeAdapter } from '../adapters/stripe';
import { dodoAdapter } from '../adapters/dodo';

describe('Payment Provider Adapters', () => {
  describe('Creem Adapter', () => {
    it('verifies HMAC-SHA256 signature correctly', async () => {
      const secret = 'creem_test_secret_key_123';
      const rawBody = JSON.stringify({ id: 'evt_100', eventType: 'subscription.active' });

      // Generate HMAC-SHA256
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signatureBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
      const validSig = [...new Uint8Array(signatureBuffer)]
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const headers = new Headers({ 'creem-signature': validSig });
      const isValid = await creemAdapter.verifySignature({ rawBody, headers, secret });
      expect(isValid).toBe(true);

      const invalidHeaders = new Headers({ 'creem-signature': 'wrong_signature' });
      const isInvalid = await creemAdapter.verifySignature({ rawBody, headers: invalidHeaders, secret });
      expect(isInvalid).toBe(false);
    });

    it('normalizes subscription events', () => {
      const rawBody = JSON.stringify({
        id: 'evt_creem_sub_1',
        eventType: 'subscription.paid',
        created_at: 1727180000000,
        object: {
          id: 'sub_12345',
          customer: { id: 'cust_abc', email: 'investor@example.com' },
          product: 'prod_pro_yearly',
          current_period_end: '2027-09-24T00:00:00Z',
          cancel_at_period_end: false,
        },
      });

      const normalized = creemAdapter.normalize({ rawBody });
      expect(normalized).not.toBeNull();
      expect(normalized?.type).toBe('subscription_upsert');
      if (normalized?.type === 'subscription_upsert') {
        expect(normalized.subscription.providerSubscriptionId).toBe('sub_12345');
        expect(normalized.subscription.providerCustomerId).toBe('cust_abc');
        expect(normalized.subscription.email).toBe('investor@example.com');
        expect(normalized.subscription.status).toBe('paid');
      }
    });

    it('normalizes single deal pass checkout events', () => {
      const rawBody = JSON.stringify({
        id: 'evt_creem_order_1',
        eventType: 'checkout.completed',
        created_at: 1727180000000,
        object: {
          id: 'order_999',
          customer: { id: 'cust_def', email: 'buyer@example.com' },
          metadata: { productKey: 'deal_pass', dealId: 'deal_dscr_450k' },
          amount: 999,
          currency: 'USD',
        },
      });

      const normalized = creemAdapter.normalize({ rawBody });
      expect(normalized?.type).toBe('purchase_upsert');
      if (normalized?.type === 'purchase_upsert') {
        expect(normalized.purchase.productKey).toBe('deal_pass');
        expect(normalized.purchase.resourceId).toBe('deal_dscr_450k');
        expect(normalized.purchase.amountMinor).toBe(999);
      }
    });
  });

  describe('Stripe Adapter', () => {
    it('verifies Stripe timestamped signature', async () => {
      const secret = 'whsec_test_stripe_secret';
      const rawBody = JSON.stringify({ id: 'evt_stripe_1', type: 'customer.subscription.created' });
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signedPayload = `${timestamp}.${rawBody}`;

      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signatureBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
      const sigHex = [...new Uint8Array(signatureBuffer)]
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const headers = new Headers({ 'stripe-signature': `t=${timestamp},v1=${sigHex}` });
      const isValid = await stripeAdapter.verifySignature({ rawBody, headers, secret });
      expect(isValid).toBe(true);
    });

    it('normalizes Stripe checkout session for single deal pass', () => {
      const rawBody = JSON.stringify({
        id: 'evt_stripe_checkout',
        type: 'checkout.session.completed',
        created: 1727180000,
        data: {
          object: {
            id: 'cs_test_123',
            mode: 'payment',
            customer: 'cus_stripe_1',
            customer_email: 'buyer@example.com',
            amount_total: 999,
            currency: 'usd',
            metadata: { productKey: 'deal_pass', dealId: 'dscr_property_1' },
          },
        },
      });

      const normalized = stripeAdapter.normalize({ rawBody });
      expect(normalized?.type).toBe('purchase_upsert');
      if (normalized?.type === 'purchase_upsert') {
        expect(normalized.purchase.productKey).toBe('deal_pass');
        expect(normalized.purchase.resourceId).toBe('dscr_property_1');
        expect(normalized.purchase.amountMinor).toBe(999);
        expect(normalized.purchase.currency).toBe('USD');
      }
    });
  });

  describe('Dodo Adapter', () => {
    it('verifies Standard Webhooks (Svix) signature correctly with whsec_ prefix', async () => {
      // 32-byte secret encoded as base64 with whsec_ prefix
      const rawSecretBytes = new Uint8Array(32).fill(7);
      const b64Secret = btoa(String.fromCharCode(...rawSecretBytes));
      const secret = `whsec_${b64Secret}`;

      const rawBody = JSON.stringify({ type: 'payment.succeeded', data: { payment_id: 'pay_123' } });
      const msgId = 'msg_dodo_999';
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signedContent = `${msgId}.${timestamp}.${rawBody}`;

      const key = await crypto.subtle.importKey(
        'raw',
        rawSecretBytes as any,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedContent));
      const sigBase64 = btoa(String.fromCharCode(...new Uint8Array(mac)));

      const headers = new Headers({
        'webhook-signature': `v1,${sigBase64}`,
        'webhook-id': msgId,
        'webhook-timestamp': timestamp,
      });

      const isValid = await dodoAdapter.verifySignature({ rawBody, headers, secret });
      expect(isValid).toBe(true);

      const invalidHeaders = new Headers({
        'webhook-signature': 'v1,tampered_sig',
        'webhook-id': msgId,
        'webhook-timestamp': timestamp,
      });
      const isInvalid = await dodoAdapter.verifySignature({ rawBody, headers: invalidHeaders, secret });
      expect(isInvalid).toBe(false);
    });

    it('normalizes Dodo subscription.active event', () => {
      const rawBody = JSON.stringify({
        type: 'subscription.active',
        timestamp: '2026-09-24T12:00:00Z',
        data: {
          subscription_id: 'sub_dodo_789',
          customer: {
            customer_id: 'cust_dodo_1',
            email: 'investor@fund.example',
          },
          product_id: 'pdt_pro_monthly',
          status: 'active',
          next_billing_date: '2026-10-24T12:00:00Z',
          cancel_at_next_billing_date: false,
        },
      });

      const normalized = dodoAdapter.normalize({ rawBody });

      expect(normalized).not.toBeNull();
      expect(normalized?.type).toBe('subscription_upsert');
      if (normalized?.type === 'subscription_upsert') {
        expect(normalized.subscription.providerSubscriptionId).toBe('sub_dodo_789');
        expect(normalized.subscription.providerCustomerId).toBe('cust_dodo_1');
        expect(normalized.subscription.email).toBe('investor@fund.example');
        expect(normalized.subscription.status).toBe('active');
        expect(normalized.subscription.cancelAtPeriodEnd).toBe(false);
      }
    });

    it('normalizes Dodo payment.succeeded event for deal pass', () => {
      const rawBody = JSON.stringify({
        type: 'payment.succeeded',
        timestamp: '2026-09-24T12:00:00Z',
        data: {
          payment_id: 'pay_dodo_456',
          customer: {
            customer_id: 'cust_dodo_2',
            email: 'borrower@home.example',
          },
          total_amount: 999,
          currency: 'USD',
          metadata: {
            productKey: 'deal_pass',
            dealId: 'dscr_property_888',
          },
        },
      });

      const normalized = dodoAdapter.normalize({ rawBody });
      expect(normalized?.type).toBe('purchase_upsert');
      if (normalized?.type === 'purchase_upsert') {
        expect(normalized.purchase.productKey).toBe('deal_pass');
        expect(normalized.purchase.resourceId).toBe('dscr_property_888');
        expect(normalized.purchase.amountMinor).toBe(999);
        expect(normalized.purchase.email).toBe('borrower@home.example');
      }
    });
  });
});

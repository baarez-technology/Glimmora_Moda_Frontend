/**
 * Payment Service — Razorpay integration
 *
 * Endpoints:
 *   POST /api/v1/payment/create-order  — get razorpay_order_id + key for SDK
 *   POST /api/v1/payment/verify        — HMAC-verify signature, confirm order
 *
 * Flow (per BE payment.py docstring):
 *   1. FE calls createRazorpayOrder() → returns razorpay_order_id, razorpay_key_id, pending_order_id
 *   2. FE opens Razorpay checkout modal with the key + order_id (requires Razorpay SDK loaded — see openRazorpayCheckout below)
 *   3. SDK returns razorpay_payment_id + razorpay_signature on success
 *   4. FE calls verifyRazorpayPayment() with all three razorpay_* fields + pending_order_id
 *      → BE verifies signature, confirms order, sets payment_status='paid'
 *
 * Line items are read by BE from the authenticated customer's cart collection — the FE
 * does NOT send products in the create-order body.
 */

import { fetchWithTimeout } from '@/lib/api-cache';

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const token = localStorage.getItem('moda-user-token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch { /* SSR safe */ }
  return headers;
}

// ─── Request / Response shapes (match BE payment.py) ──────────────────────────

export interface CreatePaymentOrderRequest {
  address_id: string;
  customer_phone_number: string;
  delivery_method: string;
  payment_tax?: number;
  payment_shipping?: number;
  payment_currency?: string;
}

export interface CreatePaymentOrderResponse {
  razorpay_order_id: string;     // rzp_ord_xxxx
  razorpay_key_id: string;       // public key for SDK
  amount: number;                // in payment_currency
  currency: string;
  pending_order_id: string;      // internal pending_payments doc _id
}

export interface VerifyPaymentRequest {
  pending_order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function createRazorpayOrder(
  payload: CreatePaymentOrderRequest,
): Promise<CreatePaymentOrderResponse> {
  const res = await fetchWithTimeout('/api/v1/payment/create-order', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Failed to create payment order (${res.status}): ${err.slice(0, 200)}`);
  }
  return res.json();
}

export async function verifyRazorpayPayment(payload: VerifyPaymentRequest): Promise<unknown> {
  const res = await fetchWithTimeout('/api/v1/payment/verify', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Payment verification failed (${res.status}): ${err.slice(0, 200)}`);
  }
  return res.json();
}

// ─── Razorpay SDK helper (browser-side checkout modal) ────────────────────────

interface RazorpayOptions {
  key: string;
  amount: number;            // in smallest currency unit (paise for INR)
  currency: string;
  name: string;
  description?: string;
  order_id: string;          // from createRazorpayOrder
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

/**
 * Lazy-load the Razorpay browser SDK. Resolves when window.Razorpay is available.
 * The SDK script is added to the page on first call only.
 */
export function loadRazorpaySdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Razorpay SDK can only load in the browser'));
      return;
    }
    if (window.Razorpay) {
      resolve();
      return;
    }
    const existing = document.getElementById('razorpay-sdk');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });
}

/**
 * Convenience wrapper: opens the Razorpay checkout modal and resolves with the
 * verification response on success, or rejects on user dismiss / failure.
 *
 * Usage from checkout.tsx:
 *   const order = await createRazorpayOrder({ address_id, ... });
 *   const confirmed = await openRazorpayCheckout(order, {
 *     name: 'ModaGlimmora', description: 'Cart purchase',
 *     prefill: { name: customer.name, email: customer.email },
 *   });
 *   // confirmed is the BE's verify response — order is now paid
 */
export async function openRazorpayCheckout(
  order: CreatePaymentOrderResponse,
  opts: {
    name: string;
    description?: string;
    prefill?: RazorpayOptions['prefill'];
    themeColor?: string;
  },
): Promise<unknown> {
  await loadRazorpaySdk();
  if (!window.Razorpay) throw new Error('Razorpay SDK did not initialise');

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: order.razorpay_key_id,
      amount: Math.round(order.amount * 100), // SDK expects smallest unit (paise)
      currency: order.currency,
      name: opts.name,
      description: opts.description,
      order_id: order.razorpay_order_id,
      prefill: opts.prefill,
      theme: { color: opts.themeColor ?? '#2D2A26' },
      handler: async (response) => {
        try {
          const confirmed = await verifyRazorpayPayment({
            pending_order_id: order.pending_order_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          resolve(confirmed);
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled by user')),
      },
    });
    rzp.open();
  });
}

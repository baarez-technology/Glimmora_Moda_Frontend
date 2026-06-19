/**
 * Restock Alert Service — Customer subscriptions for back-in-stock notifications.
 *
 * Endpoints (per BE restock_alerts.py):
 *   POST   /api/v1/customer/restock-alerts              — subscribe to a product
 *   DELETE /api/v1/customer/restock-alerts/{product_id} — unsubscribe
 *   GET    /api/v1/customer/restock-alerts              — list active subscriptions
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

export interface ServerRestockSubscription {
  productId: string;
  productName: string;
  productImage: string;
  subscribedAt: string;
  estimatedRestockDate: string | null;
}

/** POST /api/v1/customer/restock-alerts — subscribe (idempotent upsert). */
export async function subscribeRestockAlert(productId: string): Promise<void> {
  const res = await fetchWithTimeout('/api/v1/customer/restock-alerts', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Failed to subscribe (${res.status}): ${body.slice(0, 200)}`);
  }
}

/** DELETE /api/v1/customer/restock-alerts/{product_id} — unsubscribe. */
export async function unsubscribeRestockAlert(productId: string): Promise<void> {
  const res = await fetchWithTimeout(`/api/v1/customer/restock-alerts/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Failed to unsubscribe (${res.status}): ${body.slice(0, 200)}`);
  }
}

/** GET /api/v1/customer/restock-alerts — list active subscriptions w/ product detail. */
export async function listRestockAlerts(): Promise<ServerRestockSubscription[]> {
  const res = await fetchWithTimeout('/api/v1/customer/restock-alerts', {
    method: 'GET',
    headers: authHeaders(),
  });
  if (!res.ok) {
    // Treat 401/empty as "no subscriptions" — caller renders empty list.
    if (res.status === 401) return [];
    const body = await res.text().catch(() => '');
    throw new Error(`Failed to list restock alerts (${res.status}): ${body.slice(0, 200)}`);
  }
  return res.json();
}

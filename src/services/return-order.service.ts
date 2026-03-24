/**
 * Customer Return Order API Service
 * Endpoints: /api/v1/customer/return-orders
 */

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('moda-user-token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export interface ApiReturnOrder {
  return_order_id: string;
  order_id: string;
  product_id: string;
  brand_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_profile_picture: string | null;
  reason_for_return: string;
  details: string | null;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}

export interface CreateReturnOrderPayload {
  order_id: string;
  product_id: string;
  reason_for_return: string;
  details?: string;
}

export async function createReturnOrder(payload: CreateReturnOrderPayload): Promise<ApiReturnOrder> {
  const res = await fetch('/api/v1/customer/return-orders', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to submit return request');
  }
  return res.json();
}

export async function getMyReturnOrders(): Promise<ApiReturnOrder[]> {
  const res = await fetch('/api/v1/customer/return-orders', { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load return requests');
  const data = await res.json();
  return data.return_orders ?? [];
}

export async function deleteReturnOrder(returnOrderId: string): Promise<void> {
  const res = await fetch(`/api/v1/customer/return-orders/${returnOrderId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete return request');
}

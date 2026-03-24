/**
 * Brand Return Order API Service
 * Endpoints: /api/v1/brand/return-orders
 */

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('moda-brand-token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export interface BrandApiReturnOrder {
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

export async function getBrandReturnOrders(): Promise<BrandApiReturnOrder[]> {
  const res = await fetch('/api/v1/brand/return-orders', { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load return requests');
  const data = await res.json();
  return data.return_orders ?? [];
}

export async function getBrandReturnOrderDetail(returnOrderId: string): Promise<BrandApiReturnOrder> {
  const res = await fetch(`/api/v1/brand/return-orders/${returnOrderId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load return request');
  return res.json();
}

export async function updateBrandReturnOrderStatus(
  returnOrderId: string,
  status: 'accepted' | 'declined',
): Promise<BrandApiReturnOrder> {
  const res = await fetch(`/api/v1/brand/return-orders/${returnOrderId}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update return status');
  }
  return res.json();
}

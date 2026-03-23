/**
 * Returns Service
 * Manages product return requests (localStorage until backend API exists)
 *
 * Future API endpoints:
 * POST   /api/v1/customer/orders/{order_id}/return — request return
 * GET    /api/v1/customer/orders/{order_id}/return-status — check status
 * GET    /api/v1/brand/returns — list all return requests for brand
 * PATCH  /api/v1/brand/returns/{return_id} — approve/reject return
 */

const RETURNS_KEY = 'moda-returns';

export interface ReturnRequest {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  brand_name: string;
  brand_id?: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  reason: 'wrong_size' | 'defective' | 'not_as_described' | 'changed_mind' | 'other';
  reason_details?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  brand_notes?: string;
  requested_at: string;
  resolved_at?: string;
  refund_amount?: number;
  currency?: string;
}

function getReturns(): ReturnRequest[] {
  try {
    const raw = localStorage.getItem(RETURNS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveReturns(returns: ReturnRequest[]): void {
  try { localStorage.setItem(RETURNS_KEY, JSON.stringify(returns)); } catch { /* ignore */ }
}

// Consumer: submit return request
export function submitReturnRequest(data: {
  order_id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  brand_name: string;
  brand_id?: string;
  reason: ReturnRequest['reason'];
  reason_details?: string;
  refund_amount?: number;
  currency?: string;
}): ReturnRequest {
  const returns = getReturns();
  const userData = typeof window !== 'undefined' ? localStorage.getItem('moda-user-data') : null;
  const user = userData ? JSON.parse(userData) : {};

  const request: ReturnRequest = {
    id: `ret-${Date.now().toString(36)}`,
    ...data,
    customer_id: user.user_id || user.id || '',
    customer_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Customer',
    customer_email: user.email || '',
    status: 'pending',
    requested_at: new Date().toISOString(),
  };

  returns.unshift(request);
  saveReturns(returns);
  return request;
}

// Consumer: get my return requests
export function getMyReturns(): ReturnRequest[] {
  return getReturns();
}

// Consumer: get return status for an order
export function getReturnForOrder(orderId: string): ReturnRequest | null {
  return getReturns().find(r => r.order_id === orderId) || null;
}

// Brand: get all return requests
export function getBrandReturns(): ReturnRequest[] {
  return getReturns();
}

// Brand: approve return
export function approveReturn(returnId: string, notes?: string, refundAmount?: number): ReturnRequest | null {
  const returns = getReturns();
  const idx = returns.findIndex(r => r.id === returnId);
  if (idx === -1) return null;

  returns[idx] = {
    ...returns[idx],
    status: 'approved',
    brand_notes: notes,
    refund_amount: refundAmount ?? returns[idx].refund_amount,
    resolved_at: new Date().toISOString(),
  };
  saveReturns(returns);
  return returns[idx];
}

// Brand: reject return
export function rejectReturn(returnId: string, notes?: string): ReturnRequest | null {
  const returns = getReturns();
  const idx = returns.findIndex(r => r.id === returnId);
  if (idx === -1) return null;

  returns[idx] = {
    ...returns[idx],
    status: 'rejected',
    brand_notes: notes,
    resolved_at: new Date().toISOString(),
  };
  saveReturns(returns);
  return returns[idx];
}

export const RETURN_REASONS: { value: ReturnRequest['reason']; label: string }[] = [
  { value: 'wrong_size', label: 'Wrong size or fit' },
  { value: 'defective', label: 'Defective or damaged' },
  { value: 'not_as_described', label: 'Not as described' },
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'other', label: 'Other reason' },
];

/**
 * Brand Order Service
 * Direct calls to /api/v1/brand/orders/* (brand-scoped, JWT required)
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getToken(): string | null {
  try { return localStorage.getItem('moda-brand-token'); } catch { return null; }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiBrandOrderItem {
  product_id: string;
  brand_id: string;
  product_name: string;
  product_image: string;
  sku: string;
  color: string;
  size: string;
  quantity: number;
  product_price: number;
  delivery_tracking_number: string;
  delivery_status: string;
  delivery_date: string;
}

export interface ApiBrandOrder {
  order_id: string;
  order_date: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_profile_picture: string;
  customer_type: string;
  products: ApiBrandOrderItem[];
  address_id: string;
  delivery_address: string;
  delivery_city: string;
  delivery_postal_code: string;
  delivery_country: string;
  delivery_tag: string;
  delivery_method: string;
  payment_method: string;
  payment_transaction_id: string;
  payment_status: string;
  payment_date: string;
  payment_tax: number;
  payment_shipping: number;
  payment_amount: number;
  payment_currency: string;
}

export interface ApiBrandOrderDetail extends ApiBrandOrder {
  order_status: string;
  order_last_updated_at?: string | null;
  delivery_status: string;
  delivery_date: string;
}

export interface ApiBrandOrdersListResponse {
  orders: ApiBrandOrder[];
  total_orders: number;
  total_pages: number;
  page: number;
  page_size: number;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/** GET /api/v1/brand/orders */
export async function fetchBrandOrders(page = 1): Promise<ApiBrandOrdersListResponse> {
  return apiFetch<ApiBrandOrdersListResponse>(`/api/v1/brand/orders?page=${page}`);
}

/** GET /api/v1/brand/orders/{order_id} */
export async function fetchBrandOrderDetail(orderId: string): Promise<ApiBrandOrderDetail> {
  return apiFetch<ApiBrandOrderDetail>(`/api/v1/brand/orders/${orderId}`);
}

/** PATCH /api/v1/brand/orders/{order_id}/status */
export async function updateBrandOrderStatus(
  orderId: string,
  orderStatus: string
): Promise<{ message: string; order_status: string }> {
  return apiFetch(`/api/v1/brand/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ order_status: orderStatus }),
  });
}

const FILE_TYPE_EXT: Record<string, string> = { json: 'json', csv: 'csv', excel: 'xlsx' };

async function blobDownload(url: string, filename: string): Promise<void> {
  const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
  const response = await fetch(proxyUrl);
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/** POST /api/v1/brand/orders/export */
export async function exportBrandOrders(
  exportType: 'csv' | 'json' | 'excel'
): Promise<{ file_url: string }> {
  const result = await apiFetch<{ file_url: string }>('/api/v1/brand/orders/export', {
    method: 'POST',
    body: JSON.stringify({ export_type: exportType }),
  });

  if (!result.file_url) throw new Error('Export response did not contain a download URL.');

  const ext = FILE_TYPE_EXT[exportType] ?? exportType;
  await blobDownload(result.file_url, `orders-export.${ext}`);

  return result;
}

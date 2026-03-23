/**
 * Order Management Service (Real API)
 * Endpoints: /api/v1/customer/orders/*
 */

import { fetchWithTimeout } from '@/lib/api-cache';
import { getStoredUserToken } from './auth.service';

// ============================================
// Types
// ============================================

export interface OrderProduct {
  product_id: string;
  brand_id: string;
  product_name: string;
  product_image: string;
  sku: string;
  color: string;
  size: string;
  quantity: number;
  product_price: number;
  currency: string;
  delivery_tracking_number: string;
  delivery_status: string;
  delivery_date: string;
}

export interface CustomerOrder {
  order_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_profile_picture: string;
  customer_type: string;
  products: OrderProduct[];
  order_date: string;
  address_id: string;
  delivery_address: string;
  delivery_city: string;
  delivery_postal_code: string;
  delivery_country: string;
  delivery_tag: string;
  delivery_method: string;
  delivery_date: string;
  delivery_status: string;
  delivery_tracking_number: string;
  payment_method: string;
  payment_transaction_id: string;
  payment_status: string;
  payment_date: string;
  payment_tax: number;
  payment_shipping: number;
  payment_amount: number;
  payment_currency: string;
}

export interface CreateOrderProductPayload {
  product_id: string;
  color?: string;
  size?: string;
  quantity?: number;
}

export interface CreateOrderPayload {
  products: CreateOrderProductPayload[];
  address_id: string;
  customer_phone_number: string;
  delivery_method: string;
  payment_method: string;
  payment_transaction_id: string;
  payment_status: string;
  payment_date: string;
  payment_tax: number;
  payment_shipping: number;
  payment_amount: number;
  payment_currency?: string;
}

export interface DeliveryStatusResponse {
  order_id: string;
  delivery_tracking_number: string;
  delivery_status: string;
  delivery_date: string;
}

// ============================================
// Helpers
// ============================================

function authHeaders(): Record<string, string> {
  const token = getStoredUserToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ============================================
// API Functions
// ============================================

/** GET /api/v1/customer/orders — all orders for current customer */
export async function getOrders(): Promise<CustomerOrder[]> {
  const res = await fetchWithTimeout(`/api/v1/customer/orders`, {
    method: 'GET',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch orders' }));
    throw new Error(err.detail || `Failed to fetch orders (${res.status})`);
  }

  return res.json();
}

/** GET /api/v1/customer/orders/:id — single order detail */
export async function getOrderById(orderId: string): Promise<CustomerOrder> {
  const res = await fetchWithTimeout(`/api/v1/customer/orders/${orderId}`, {
    method: 'GET',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch order' }));
    throw new Error(err.detail || `Failed to fetch order (${res.status})`);
  }

  return res.json();
}

/** POST /api/v1/customer/orders — place a new order */
export async function createOrder(payload: CreateOrderPayload): Promise<CustomerOrder> {
  const res = await fetchWithTimeout(`/api/v1/customer/orders`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to place order' }));
    throw new Error(err.detail || `Failed to place order (${res.status})`);
  }

  return res.json();
}

/** GET /api/v1/customer/orders/:id/delivery-status — delivery tracking */
export async function getDeliveryStatus(
  orderId: string,
  trackingNumber: string
): Promise<DeliveryStatusResponse> {
  const params = new URLSearchParams({ delivery_tracking_number: trackingNumber });
  const res = await fetchWithTimeout(
    `/api/v1/customer/orders/${orderId}/delivery-status?${params}`,
    {
      method: 'GET',
      headers: authHeaders(),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch delivery status' }));
    throw new Error(err.detail || `Failed to fetch delivery status (${res.status})`);
  }

  return res.json();
}

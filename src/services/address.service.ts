/**
 * Address Book Service
 * Endpoints: /api/v1/customer/addresses/*
 */

import { fetchWithTimeout } from '@/lib/api-cache';
import { getStoredUserToken } from './auth.service';

// ============================================
// Types
// ============================================

export interface CustomerAddress {
  address_id: string;
  customer_id: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  tag: string;
  created_at: string;
  updated_at: string;
  is_default?: boolean;
}

export interface CreateAddressPayload {
  address: string;
  city: string;
  postal_code: string;
  country: string;
  tag: string;
}

export interface UpdateAddressPayload {
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  tag?: string;
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

/** GET /api/v1/customer/addresses — all addresses for current customer */
export async function getAddresses(): Promise<CustomerAddress[]> {
  const res = await fetchWithTimeout(`/api/v1/customer/addresses`, {
    method: 'GET',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch addresses' }));
    throw new Error(err.detail || `Failed to fetch addresses (${res.status})`);
  }

  return res.json();
}

/** GET /api/v1/customer/addresses/:id — single address */
export async function getAddressById(addressId: string): Promise<CustomerAddress> {
  const res = await fetchWithTimeout(`/api/v1/customer/addresses/${addressId}`, {
    method: 'GET',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch address' }));
    throw new Error(err.detail || `Failed to fetch address (${res.status})`);
  }

  return res.json();
}

/** POST /api/v1/customer/addresses — create new address */
export async function createAddress(payload: CreateAddressPayload): Promise<CustomerAddress> {
  const res = await fetchWithTimeout(`/api/v1/customer/addresses`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to create address' }));
    throw new Error(err.detail || `Failed to create address (${res.status})`);
  }

  return res.json();
}

/** PATCH /api/v1/customer/addresses/:id — partial update */
export async function updateAddress(
  addressId: string,
  payload: UpdateAddressPayload
): Promise<CustomerAddress> {
  const res = await fetchWithTimeout(`/api/v1/customer/addresses/${addressId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to update address' }));
    throw new Error(err.detail || `Failed to update address (${res.status})`);
  }

  return res.json();
}

/** DELETE /api/v1/customer/addresses/:id — hard delete */
export async function deleteAddress(addressId: string): Promise<string> {
  const res = await fetchWithTimeout(`/api/v1/customer/addresses/${addressId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to delete address' }));
    throw new Error(err.detail || `Failed to delete address (${res.status})`);
  }

  return res.json();
}


/** PATCH /api/v1/customer/addresses/:id/make-default — set as default address */
export async function makeDefaultAddress(addressId: string): Promise<CustomerAddress> {
  const res = await fetchWithTimeout(`/api/v1/customer/addresses/${addressId}/make-default`, {
    method: 'PATCH',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to set default address' }));
    throw new Error(err.detail || `Failed to set default address (${res.status})`);
  }

  return res.json();
}

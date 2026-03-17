/**
 * Private Collection Service
 * Direct calls to /api/v1/private-collection/* (brand-scoped, JWT required)
 */

import type { PrivateCollection, PrivateCollectionAccess, RequestedCustomer, UhniCustomer } from '@/types/uhni';

function getToken(): string | null {
  try {
    return localStorage.getItem('moda-brand-token');
  } catch {
    return null;
  }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Backend Response Types ───────────────────────────────────────────────────

export interface ApiRequestedCustomer {
  customer_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  first_name: string;
  last_name: string;
  notes?: string;
}

export interface ApiPrivateCollection {
  private_collection_id: string;
  brand_id: string;
  private_collection_name: string;
  description: string;
  image_url: string;
  access_level: string;
  preview_date?: string | null;
  release_date?: string | null;
  products: string[];
  customer_ids: string[];
  requested_customers: ApiRequestedCustomer[];
  notes?: string;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiProduct {
  product_id: string;
  product_name: string;
  product_image?: string;
  product_category?: string;
  price?: number;
  offer_price?: number;
  tagline?: string;
  [key: string]: unknown;
}

export interface ApiProductsResponse {
  products?: ApiProduct[];
  items?: ApiProduct[];
  data?: ApiProduct[];
  hits?: ApiProduct[];
  total_matched?: number;
  total?: number;
  page_number?: number;
  page_size?: number;
  total_pages?: number;
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

export function mapApiCollection(doc: ApiPrivateCollection): PrivateCollection {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productStubs = (doc.products || []).map(pid => ({ id: pid })) as any[];

  const requestedCustomers: RequestedCustomer[] = (doc.requested_customers || []).map(rc => ({
    customer_id: rc.customer_id,
    status: rc.status,
    first_name: rc.first_name || '',
    last_name: rc.last_name || '',
    notes: rc.notes,
  }));

  return {
    id: doc.private_collection_id,
    name: doc.private_collection_name,
    brandId: doc.brand_id,
    brandName: '',
    description: doc.description,
    heroImage: doc.image_url || '',
    accessLevel: doc.access_level as PrivateCollectionAccess,
    products: productStubs,
    previewDate: doc.preview_date || new Date().toISOString(),
    releaseDate: doc.release_date || new Date().toISOString(),
    invitationRequired: doc.access_level === 'invitation',
    hasAccess: false,
    notes: doc.notes,
    customer_ids: doc.customer_ids || [],
    requested_customers: requestedCustomers,
  };
}

export function mapApiProduct(p: ApiProduct): { id: string; name: string; imageUrl: string; price?: number; category?: string } {
  return {
    id: p.product_id,
    name: p.product_name,
    imageUrl: p.product_image || '',
    price: p.offer_price ?? p.price,
    category: p.product_category,
  };
}

// ─── Collection CRUD ──────────────────────────────────────────────────────────

/** GET /api/v1/private-collection */
export async function fetchPrivateCollections(): Promise<PrivateCollection[]> {
  const docs = await apiFetch<ApiPrivateCollection[]>('/api/v1/private-collection');
  return docs.filter(doc => doc.is_active).map(mapApiCollection);
}

/** GET /api/v1/private-collection/{id} */
export async function fetchPrivateCollection(id: string): Promise<PrivateCollection> {
  const doc = await apiFetch<ApiPrivateCollection>(`/api/v1/private-collection/${id}`);
  return mapApiCollection(doc);
}

/** POST /api/v1/private-collection */
export async function createPrivateCollection(payload: {
  private_collection_name: string;
  description: string;
  image_url: string;
  access_level: string;
  preview_date?: string | null;
  release_date?: string | null;
  products: string[];
  customer_ids?: string[];
  notes?: string;
}): Promise<PrivateCollection> {
  const doc = await apiFetch<ApiPrivateCollection>('/api/v1/private-collection', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapApiCollection(doc);
}

/** PATCH /api/v1/private-collection/{id} */
export async function updatePrivateCollection(
  id: string,
  payload: Partial<{
    private_collection_name: string;
    description: string;
    image_url: string;
    access_level: string;
    preview_date: string | null;
    release_date: string | null;
    products: string[];
    customer_ids: string[];
    notes: string;
    is_active: boolean;
  }>
): Promise<PrivateCollection> {
  const doc = await apiFetch<ApiPrivateCollection>(`/api/v1/private-collection/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return mapApiCollection(doc);
}

/** DELETE /api/v1/private-collection/{id} */
export async function deletePrivateCollection(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/v1/private-collection/${id}`, { method: 'DELETE' });
}

/** PATCH /api/v1/private-collection/{id}/status */
export async function updatePrivateCollectionStatus(
  id: string,
  status: 'upcoming' | 'active' | 'ended'
): Promise<PrivateCollection> {
  const doc = await apiFetch<ApiPrivateCollection>(`/api/v1/private-collection/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return mapApiCollection(doc);
}

// ─── Customer Management ──────────────────────────────────────────────────────

/**
 * GET /api/v1/private-collection/uhni-customers
 * Returns all UHNI customers for the brand.
 */
export async function fetchUhniCustomers(): Promise<UhniCustomer[]> {
  return apiFetch<UhniCustomer[]>('/api/v1/private-collection/uhni-customers');
}

/**
 * PATCH /api/v1/private-collection/{id}/customer-ids
 * Appends customer_ids to the collection (deduplicates server-side).
 */
export async function appendCustomerIds(
  id: string,
  payload: { customer_ids: string[]; notes?: string }
): Promise<PrivateCollection> {
  const doc = await apiFetch<ApiPrivateCollection>(`/api/v1/private-collection/${id}/customer-ids`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return mapApiCollection(doc);
}

/**
 * PATCH /api/v1/private-collection/{id}/requested-customers/status
 * Updates the status of a single entry in requested_customers.
 */
export async function updateRequestedCustomerStatus(
  id: string,
  payload: { customer_id: string; status: 'pending' | 'accepted' | 'rejected'; notes?: string }
): Promise<PrivateCollection> {
  const doc = await apiFetch<ApiPrivateCollection>(
    `/api/v1/private-collection/${id}/requested-customers/status`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );
  return mapApiCollection(doc);
}

// ─── Products ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/private-collection/products
 * Returns paginated products for the brand.
 */
export async function fetchBrandProducts(params?: {
  search?: string;
  min_price?: number;
  max_price?: number;
  page_number?: number;
  page_size?: number;
}): Promise<{ items: ReturnType<typeof mapApiProduct>[]; total: number }> {
  const qs = new URLSearchParams();
  if (params?.search !== undefined) qs.set('search', params.search);
  if (params?.min_price !== undefined) qs.set('min_price', String(params.min_price));
  if (params?.max_price !== undefined) qs.set('max_price', String(params.max_price));
  if (params?.page_number !== undefined) qs.set('page_number', String(params.page_number));
  if (params?.page_size !== undefined) qs.set('page_size', String(params.page_size));

  const raw = await apiFetch<ApiProductsResponse>(
    `/api/v1/private-collection/products?${qs.toString()}`
  );

  const rawItems: ApiProduct[] = raw.products || raw.items || raw.data || raw.hits || [];

  return {
    items: rawItems.map(mapApiProduct),
    total: raw.total_matched ?? raw.total ?? rawItems.length,
  };
}

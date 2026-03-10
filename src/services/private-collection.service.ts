/**
 * Private Collection Service
 * Direct calls to /api/v1/private-collection/* (brand-scoped, JWT required)
 */

import type { PrivateCollection, PrivateCollectionAccess } from '@/types/uhni';
import type { Product } from '@/types/product';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

// ─── Types matching backend response ─────────────────────────────────────────

export interface ApiPrivateCollection {
  private_collection_id: string;
  brand_id: string;
  private_collection_name: string;
  description: string;
  image_url: string;
  access_level: string;
  preview_date?: string | null;
  release_date?: string | null;
  products: string[]; // product_ids
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

/**
 * Map backend API collection to frontend PrivateCollection.
 * Products are returned as stub objects (id only) — resolve them with resolveProductIds().
 */
export function mapApiCollection(doc: ApiPrivateCollection): PrivateCollection {
  // Store only the product ID — names/images are resolved separately in the UI via fetchBrandProducts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productStubs = (doc.products || []).map(pid => ({ id: pid })) as any[];

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

// ─── API Functions ────────────────────────────────────────────────────────────

/** GET /api/v1/private-collection — all active collections for the authenticated brand */
export async function fetchPrivateCollections(): Promise<PrivateCollection[]> {
  const docs = await apiFetch<ApiPrivateCollection[]>('/api/v1/private-collection');
  return docs.filter(doc => doc.is_active).map(mapApiCollection);
}

/** POST /api/v1/private-collection — create a new collection */
export async function createPrivateCollection(payload: {
  private_collection_name: string;
  description: string;
  image_url: string;
  access_level: string;
  preview_date?: string | null;
  release_date?: string | null;
  products: string[];
}): Promise<PrivateCollection> {
  const doc = await apiFetch<ApiPrivateCollection>('/api/v1/private-collection', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapApiCollection(doc);
}

/** PATCH /api/v1/private-collection/{id} — partial update */
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
    is_active: boolean;
  }>
): Promise<PrivateCollection> {
  const doc = await apiFetch<ApiPrivateCollection>(`/api/v1/private-collection/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return mapApiCollection(doc);
}

/** DELETE /api/v1/private-collection/{id} — soft delete */
export async function deletePrivateCollection(id: string): Promise<void> {
  await apiFetch<unknown>(`/api/v1/private-collection/${id}`, { method: 'DELETE' });
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

/**
 * GET /api/v1/private-collection/products
 * Returns paginated products for the brand (for product selection in create/edit forms).
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

  const rawItems: ApiProduct[] =
    raw.products || raw.items || raw.data || raw.hits || [];

  return {
    items: rawItems.map(mapApiProduct),
    total: raw.total_matched ?? raw.total ?? rawItems.length,
  };
}

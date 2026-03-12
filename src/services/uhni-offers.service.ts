/**
 * UHNI Offers Service (Brand Portal)
 * Endpoints: /api/v1/offers
 */

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('moda-brand-token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── API Types ───────────────────────────────────────────────────────────────

export interface ApiOffer {
  offer_id: string;
  brand_id: string;
  offer_type: string;           // "products" | "collections" | "brand"
  offer_products: string[];
  offer_collections: string[];
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  valid_from: string;           // ISO datetime
  valid_until: string;          // ISO datetime
  conditions: string[];
  status: string;
  is_expired: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateOfferPayload {
  offer_type: string;
  offer_products?: string[];
  offer_collections?: string[];
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  valid_from: string;
  valid_until: string;
  conditions?: string[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchUhniOffers(): Promise<ApiOffer[]> {
  const res = await fetch('/api/v1/offers', { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch offers: ${res.status}`);
  return res.json();
}

export async function fetchUhniOffer(offerId: string): Promise<ApiOffer> {
  const res = await fetch(`/api/v1/offers/${offerId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch offer: ${res.status}`);
  return res.json();
}

export async function createUhniOffer(payload: CreateOfferPayload): Promise<ApiOffer> {
  const res = await fetch('/api/v1/offers', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to create offer: ${res.status}`);
  }
  return res.json();
}

export async function updateUhniOffer(offerId: string, payload: Partial<CreateOfferPayload>): Promise<ApiOffer> {
  const res = await fetch(`/api/v1/offers/${offerId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to update offer: ${res.status}`);
  }
  return res.json();
}

// ─── Brand Products / Collections (Elasticsearch) ────────────────────────────

export interface OfferBrandProduct {
  product_id: string;
  product_name: string;
  product_image: string | null;
  price: number;
  sku?: string;
  status?: string;
}

export interface OfferBrandProductsResponse {
  items: OfferBrandProduct[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface OfferBrandCollection {
  collection_id: string;
  collection_name: string;
  collection_image: string | null;
  season?: string;
  year?: number;
  is_active?: boolean;
}

export async function fetchOfferBrandProducts(params: {
  query?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  page_size?: number;
} = {}): Promise<OfferBrandProductsResponse> {
  const qs = new URLSearchParams();
  if (params.query) qs.set('query', params.query);
  if (params.min_price !== undefined) qs.set('min_price', String(params.min_price));
  if (params.max_price !== undefined) qs.set('max_price', String(params.max_price));
  qs.set('page', String(params.page ?? 1));
  qs.set('page_size', String(params.page_size ?? 20));
  const res = await fetch(`/api/v1/offers/brand-products?${qs}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch brand products: ${res.status}`);
  const data = await res.json();
  if (Array.isArray(data)) {
    return { items: data, total: data.length, page: params.page ?? 1, page_size: params.page_size ?? 20, total_pages: 1 };
  }
  // API returns { products, total_matched, total_pages, page_number, page_size }
  const items: OfferBrandProduct[] = (data.products ?? data.items ?? []);
  return {
    items,
    total: data.total_matched ?? data.total ?? items.length,
    page: data.page_number ?? data.page ?? params.page ?? 1,
    page_size: data.page_size ?? params.page_size ?? 20,
    total_pages: data.total_pages ?? 1,
  };
}

export async function fetchOfferBrandCollections(params: {
  is_active?: boolean;
} = {}): Promise<OfferBrandCollection[]> {
  const qs = new URLSearchParams();
  if (params.is_active !== undefined) qs.set('is_active', String(params.is_active));
  const res = await fetch(`/api/v1/offers/brand-collections?${qs}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch brand collections: ${res.status}`);
  return res.json();
}

export async function deleteUhniOffer(offerId: string): Promise<void> {
  const res = await fetch(`/api/v1/offers/${offerId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to delete offer: ${res.status}`);
  }
}

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

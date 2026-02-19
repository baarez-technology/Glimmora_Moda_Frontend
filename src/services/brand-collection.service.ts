/**
 * Brand Collection Service (Real Backend API)
 * Endpoints: /api/v1/collection/*
 */

function getToken(): string | null {
  try {
    return localStorage.getItem('moda-brand-token');
  } catch {
    return null;
  }
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ─── Response Types ─────────────────────────────────────────────────────────

export interface CollectionResponse {
  collection_id: string;
  brand_id: string;
  collection_name: string;
  season: string;
  year: string;
  status: string;
  collection_description: string;
  collection_image: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollectionProductItem {
  image_url: string;
  product_name: string;
  sku: string;
  units: number;
  price: number;
}

export interface CollectionDetailResponse {
  collection_name: string;
  collection_description: string;
  collection_image: string;
  collection_status: string;
  year: string;
  season: string;
  is_active?: boolean;
  number_of_products: number;
  revenue: number;
  views: number;
  total_stocks: number;
  average_product_price: number;
  products: CollectionProductItem[];
}

export interface CollectionCreatePayload {
  collection_name: string;
  season: string;
  year: string;
  status: string;
  collection_description: string;
  collection_image: string;
}

export interface CollectionUpdatePayload {
  collection_name?: string;
  season?: string;
  year?: string;
  status?: string;
  collection_description?: string;
  collection_image?: string;
}

// ─── API Functions ──────────────────────────────────────────────────────────

export async function fetchCollections(): Promise<CollectionResponse[]> {
  const res = await fetch('/api/v1/collection', {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch collections' }));
    throw new Error(err.detail || `Failed to fetch collections (${res.status})`);
  }

  return res.json();
}

export async function fetchCollectionDetail(collectionId: string): Promise<CollectionDetailResponse> {
  const res = await fetch(`/api/v1/collection/${collectionId}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Collection not found' }));
    throw new Error(err.detail || `Failed to fetch collection (${res.status})`);
  }

  return res.json();
}

export async function createCollection(payload: CollectionCreatePayload): Promise<CollectionResponse> {
  const res = await fetch('/api/v1/collection', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to create collection' }));
    throw new Error(err.detail || `Failed to create collection (${res.status})`);
  }

  return res.json();
}

export async function updateCollection(
  collectionId: string,
  payload: CollectionUpdatePayload
): Promise<CollectionResponse> {
  const res = await fetch(`/api/v1/collection/${collectionId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to update collection' }));
    throw new Error(err.detail || `Failed to update collection (${res.status})`);
  }

  return res.json();
}

export async function softDeleteCollection(collectionId: string): Promise<{ message: string }> {
  const res = await fetch(`/api/v1/collection/${collectionId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to delete collection' }));
    throw new Error(err.detail || `Failed to delete collection (${res.status})`);
  }

  return res.json();
}

export async function fetchCollectionBasicInfo(collectionId: string): Promise<CollectionResponse | null> {
  const collections = await fetchCollections();
  return collections.find(c => c.collection_id === collectionId) || null;
}

export async function restoreCollection(collectionId: string): Promise<CollectionResponse> {
  const res = await fetch(`/api/v1/collection/${collectionId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ is_active: true }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to restore collection' }));
    throw new Error(err.detail || `Failed to restore collection (${res.status})`);
  }

  return res.json();
}

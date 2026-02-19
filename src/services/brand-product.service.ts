/**
 * Brand Product Service (Real Backend API)
 * Endpoints: /api/v1/product/*
 *
 * Requests go to the same origin (Next.js rewrites proxy them to the
 * FastAPI backend), so the browser never makes a cross-origin call and
 * CORS preflight is avoided entirely.
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

// ─── Backend Response Types ──────────────────────────────────────────────────

export interface ProductPerformanceMetrics {
  views: number;
  add_to_cart: number;
  purchases: number;
  conversion_rate: number;
  avg_decision_time: number;
  demand_score: number;
  total_revenue: number;
  total_units: number;
}

export interface RegionalStockItem {
  stock_id: string;
  product_id?: string;
  city: string;
  country: string;
  units: number;
  threshold: number;
  is_low_stock: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendProduct {
  product_id: string;
  brand_id: string;
  product_name: string;
  sku: string;
  price: number;
  collection_name: string;
  status: string;
  tagline: string;
  product_description: string;
  product_images: string[];
  product_image: string | null;
  regional_stocks: RegionalStockItem[];
  performance_metrics: ProductPerformanceMetrics;
  is_low_stock: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCreatePayload {
  product_name: string;
  sku: string;
  price: number;
  collection_name: string;
  status: string;
  tagline: string;
  product_description: string;
  product_images: string[];
}

export interface ProductUpdatePayload {
  product_name?: string;
  sku?: string;
  price?: number;
  collection_name?: string;
  status?: string;
  tagline?: string;
  product_description?: string;
  product_images?: string[];
  regional_stocks?: RegionalStockItem[];
  performance_metrics?: Partial<ProductPerformanceMetrics>;
}

export interface RegionalStockAddPayload {
  city: string;
  country: string;
  units: number;
  threshold: number;
}

// ─── API Functions ───────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<BackendProduct[]> {
  const res = await fetch(`/api/v1/product`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch products' }));
    throw new Error(err.detail || `Failed to fetch products (${res.status})`);
  }

  return res.json();
}

export async function fetchProduct(productId: string): Promise<BackendProduct> {
  const res = await fetch(`/api/v1/product/${productId}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Product not found' }));
    throw new Error(err.detail || `Failed to fetch product (${res.status})`);
  }

  return res.json();
}

export async function createProduct(payload: ProductCreatePayload): Promise<BackendProduct> {
  const res = await fetch(`/api/v1/product`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to create product' }));
    throw new Error(err.detail || `Failed to create product (${res.status})`);
  }

  return res.json();
}

export async function updateProduct(
  productId: string,
  payload: ProductUpdatePayload
): Promise<BackendProduct> {
  const res = await fetch(`/api/v1/product/${productId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to update product' }));
    throw new Error(err.detail || `Failed to update product (${res.status})`);
  }

  return res.json();
}

export async function softDeleteProduct(productId: string): Promise<{ message: string }> {
  const res = await fetch(`/api/v1/product/${productId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to delete product' }));
    throw new Error(err.detail || `Failed to delete product (${res.status})`);
  }

  return res.json();
}

export async function setRegionalStocks(
  productId: string,
  stocks: RegionalStockAddPayload[]
): Promise<RegionalStockItem[]> {
  const res = await fetch(`/api/v1/product/${productId}/stocks`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(stocks),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to update stocks' }));
    throw new Error(err.detail || `Failed to update stocks (${res.status})`);
  }

  return res.json();
}

// ─── Collection Names ────────────────────────────────────────────────────────

export interface CollectionNameItem {
  collection_id: string;
  collection_name: string;
}

export async function fetchCollectionNames(): Promise<CollectionNameItem[]> {
  const res = await fetch('/api/v1/collection/names', {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch collections' }));
    throw new Error(err.detail || `Failed to fetch collections (${res.status})`);
  }

  return res.json();
}

// ─── Image Upload ────────────────────────────────────────────────────────────

/**
 * Upload a file to S3 via the backend and return its public URL.
 * Endpoint: POST /api/v1/upload  (multipart/form-data)
 */
export async function uploadImage(file: File): Promise<string> {
  const token = localStorage.getItem('moda-brand-token');
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/v1/upload', {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || `Upload failed (${res.status})`);
  }

  const data = await res.json();
  return data.url;
}

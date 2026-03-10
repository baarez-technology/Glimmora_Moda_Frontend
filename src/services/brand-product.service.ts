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

// ─── Variant Types ──────────────────────────────────────────────────────────

export interface ColorOption {
  name: string;
  hex: string;
}

export interface ColorImages {
  [colorName: string]: string[];
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
  production_time_days?: number;
  is_low_stock: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendProduct {
  product_id: string;
  brand_id: string;
  product_name: string;
  tagline: string;
  product_description: string;
  product_category: string;
  collection_name: string;
  sku: string;
  price: number;
  offer_price: number;
  discount_percentage: number;
  product_image: string | null;
  product_images?: string[];
  sizes: string[];
  color_based_images_mapping: string[];
  regional_stocks: RegionalStockItem[];
  performance_metrics: ProductPerformanceMetrics;
  ai_data?: Record<string, unknown>;
  status: string;
  is_low_stock: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Local-only fields kept for backwards compat with existing components
  colors?: ColorOption[];
  color_images?: ColorImages;
}

/** Paginated response from GET /api/v1/product */
export interface PaginatedProductsResponse {
  total_count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  products: BackendProduct[];
}

/** Simplified product from GET /api/v1/product/products-list */
export interface SimplifiedProduct {
  product_id: string;
  image_url: string;
  product_name: string;
  price: number;
}

export interface ProductCreatePayload {
  product_name: string;
  tagline?: string;
  product_description?: string;
  product_category?: string;
  collection_name?: string;
  sku: string;
  price: number;
  sizes?: string[];
  product_image?: string;
  // Extra fields the frontend sends (backend may ignore gracefully)
  product_images?: string[];
  status?: string;
  colors?: ColorOption[];
  color_images?: ColorImages;
}

export interface ProductUpdatePayload {
  product_name?: string;
  tagline?: string;
  product_description?: string;
  product_category?: string;
  collection_name?: string;
  sku?: string;
  price?: number;
  offer_price?: number;
  discount_percentage?: number;
  sizes?: string[];
  product_image?: string;
  color_based_images_mapping?: string[];
  status?: string;
  is_active?: boolean;
  is_low_stock?: boolean;
  performance_metrics?: Record<string, unknown>;
  ai_data?: Record<string, unknown>;
  // Extra fields for existing UI compatibility
  product_images?: string[];
  colors?: ColorOption[];
  color_images?: ColorImages;
  regional_stocks?: RegionalStockItem[];
}

export interface RegionalStockAddPayload {
  city: string;
  country: string;
  units: number;
  threshold: number;
  production_time_days?: number;
}

export interface ColorImagesPayload {
  color: string;
  images: string[];
}

// ─── API Functions ───────────────────────────────────────────────────────────

/**
 * GET /api/v1/product?page=&page_size=
 * Returns paginated product list for the authenticated brand.
 */
export async function fetchProductsPaginated(
  page = 1,
  pageSize = 100,
): Promise<PaginatedProductsResponse> {
  const res = await fetch(
    `/api/v1/product?page=${page}&page_size=${pageSize}`,
    { headers: authHeaders() },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch products' }));
    throw new Error(err.detail || `Failed to fetch products (${res.status})`);
  }

  return res.json();
}

/**
 * GET /api/v1/product (backwards-compatible — returns flat array)
 * Fetches all products (up to page_size=100) for existing pages that expect BackendProduct[].
 */
export async function fetchProducts(): Promise<BackendProduct[]> {
  const res = await fetch(`/api/v1/product?page=1&page_size=100`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch products' }));
    throw new Error(err.detail || `Failed to fetch products (${res.status})`);
  }

  const data = await res.json();
  // Handle both paginated response and flat array (backwards compat)
  if (Array.isArray(data)) return data;
  if (data.products && Array.isArray(data.products)) return data.products;
  return [];
}

/** GET /api/v1/product/products-list — simplified product list */
export async function fetchProductsList(): Promise<SimplifiedProduct[]> {
  const res = await fetch(`/api/v1/product/products-list`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch products list' }));
    throw new Error(err.detail || `Failed to fetch products list (${res.status})`);
  }

  return res.json();
}

/** GET /api/v1/product/:id */
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

/** POST /api/v1/product — create a new product */
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

/** PATCH /api/v1/product/:id — partial update */
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

/** DELETE /api/v1/product/:id — soft delete (sets is_active=false) */
export async function softDeleteProduct(productId: string): Promise<string> {
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

/** Restore a soft-deleted product (PATCH is_active=true) */
export async function restoreProduct(productId: string): Promise<BackendProduct> {
  return updateProduct(productId, { is_active: true });
}

/** POST /api/v1/product/:id/stocks — replace all regional stocks */
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

/** POST /api/v1/product/:id/color-images — append color-based images */
export async function addColorImages(
  productId: string,
  payload: ColorImagesPayload
): Promise<BackendProduct> {
  const res = await fetch(`/api/v1/product/${productId}/color-images`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to add color images' }));
    throw new Error(err.detail || `Failed to add color images (${res.status})`);
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

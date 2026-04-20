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
  product_image: string | null;
  product_images?: string[];
  sizes: string[];
  // API returns string[] of JSON strings, e.g. '{"color":"Red","hex":"#FF0000","images":["url1"]}'
  color_based_images_mapping: string[];
  // API returns string[] of JSON strings, e.g. '{"stock_id":"...","city":"Mumbai",...}'
  regional_stocks: string[] | null;
  performance_metrics: ProductPerformanceMetrics | null;
  ai_data?: Record<string, unknown>;
  status: string;
  is_low_stock: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Parsing Helpers ────────────────────────────────────────────────────────

/** Check if a string looks like a hex color code */
export function isHexColor(s: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s);
}

/** Approximate a human-readable color name from a hex code */
function hexToColorName(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;

  // Named color lookup (nearest match from common fashion/luxury palette)
  const palette: [string, number, number, number][] = [
    ['Black', 0, 0, 0],
    ['White', 255, 255, 255],
    ['Ivory', 255, 255, 240],
    ['Cream', 255, 253, 208],
    ['Beige', 245, 245, 220],
    ['Sand', 194, 178, 128],
    ['Taupe', 72, 60, 50],
    ['Grey', 128, 128, 128],
    ['Silver', 192, 192, 192],
    ['Charcoal', 54, 69, 79],
    ['Navy', 0, 0, 128],
    ['Royal Blue', 65, 105, 225],
    ['Sky Blue', 135, 206, 235],
    ['Teal', 0, 128, 128],
    ['Turquoise', 64, 224, 208],
    ['Sage', 188, 184, 138],
    ['Olive', 128, 128, 0],
    ['Forest Green', 34, 139, 34],
    ['Emerald', 80, 200, 120],
    ['Mint', 152, 255, 152],
    ['Red', 255, 0, 0],
    ['Crimson', 220, 20, 60],
    ['Burgundy', 128, 0, 32],
    ['Maroon', 128, 0, 0],
    ['Rose', 255, 0, 127],
    ['Pink', 255, 192, 203],
    ['Blush', 222, 93, 131],
    ['Coral', 255, 127, 80],
    ['Peach', 255, 218, 185],
    ['Orange', 255, 165, 0],
    ['Amber', 255, 191, 0],
    ['Gold', 255, 215, 0],
    ['Yellow', 255, 255, 0],
    ['Camel', 193, 154, 107],
    ['Tan', 210, 180, 140],
    ['Brown', 139, 69, 19],
    ['Chocolate', 123, 63, 0],
    ['Cognac', 154, 70, 18],
    ['Lavender', 230, 230, 250],
    ['Lilac', 200, 162, 200],
    ['Purple', 128, 0, 128],
    ['Plum', 142, 69, 133],
    ['Mauve', 224, 176, 255],
  ];

  let closest = 'Color';
  let minDist = Infinity;
  for (const [name, pr, pg, pb] of palette) {
    const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
    if (dist < minDist) {
      minDist = dist;
      closest = name;
    }
  }
  return closest;
}

/** Parse color_based_images_mapping JSON strings into ColorOption[] and ColorImages */
export function parseColorMapping(raw: string[]): { colors: ColorOption[]; colorImages: ColorImages } {
  const colors: ColorOption[] = [];
  const colorImages: ColorImages = {};

  for (const str of raw) {
    try {
      const parsed = typeof str === 'string' ? JSON.parse(str) : str;
      const colorField = parsed.color || '';
      let name = parsed.name || '';
      let hex = parsed.hex || '';

      if (isHexColor(colorField)) {
        // API stored hex as the color identifier
        hex = colorField;
        if (!name) name = hexToColorName(colorField);
      } else if (colorField) {
        // API stored a proper color name
        name = colorField;
      }

      if (!name) continue;
      if (!hex || !isHexColor(hex)) hex = '#000000';

      colors.push({ name, hex });
      colorImages[name] = Array.isArray(parsed.images) ? parsed.images : [];
    } catch {
      // skip unparseable entries
    }
  }

  return { colors, colorImages };
}

/** Parse regional_stocks JSON strings into RegionalStockItem[] */
export function parseRegionalStocks(raw: string[] | null): RegionalStockItem[] {
  if (!raw || !Array.isArray(raw)) return [];

  return raw.map(str => {
    try {
      const parsed = typeof str === 'string' ? JSON.parse(str) : str;
      return {
        stock_id: parsed.stock_id || '',
        product_id: parsed.product_id,
        city: parsed.city || '',
        country: parsed.country || '',
        units: parsed.units ?? 0,
        threshold: parsed.threshold ?? 0,
        production_time_days: parsed.production_time_days,
        is_low_stock: parsed.is_low_stock ?? false,
        is_active: parsed.is_active ?? true,
        created_at: parsed.created_at || '',
        updated_at: parsed.updated_at || '',
      } as RegionalStockItem;
    } catch {
      return null;
    }
  }).filter((s): s is RegionalStockItem => s !== null);
}

/** Compute total units from raw regional_stocks, with fallback to performance_metrics */
export function computeTotalUnits(product: BackendProduct): number {
  const stocks = parseRegionalStocks(product.regional_stocks);
  const fromStocks = stocks.reduce((sum, s) => sum + (s.units ?? 0), 0);
  if (fromStocks > 0) return fromStocks;
  return product.performance_metrics?.total_units ?? 0;
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
}

export interface ProductUpdatePayload {
  product_name?: string;
  tagline?: string;
  product_description?: string;
  product_category?: string;
  collection_name?: string;
  sku?: string;
  price?: number;
  sizes?: string[];
  product_image?: string;
  product_images?: string[];
  color_based_images_mapping?: string[];
  status?: string;
  is_active?: boolean;
  is_low_stock?: boolean;
  performance_metrics?: Record<string, unknown>;
  ai_data?: Record<string, unknown>;
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

// ─── Restock ────────────────────────────────────────────────────────────────

export interface RestockRegionEntry {
  city: string;
  country: string;
  units: number;
}

export interface RestockPayload {
  product_id: string;
  region_mapping: RestockRegionEntry[];
}

export interface RestockHistoryItem {
  restock_id: string;
  product_id: string;
  brand_id: string;
  city: string;
  country: string;
  units: number;
  created_at: string;
  updated_at: string;
}

/** POST /api/v1/product/restock — restock a product */
export async function restockProduct(
  payload: RestockPayload
): Promise<unknown> {
  const res = await fetch(`/api/v1/product/restock`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Restock failed' }));
    throw new Error(err.detail || `Restock failed (${res.status})`);
  }

  return res.json();
}

/** GET /api/v1/product/:id/restock-history — get restock history */
export async function fetchRestockHistory(
  productId: string
): Promise<RestockHistoryItem[]> {
  const res = await fetch(`/api/v1/product/${productId}/restock-history`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch restock history' }));
    throw new Error(err.detail || `Failed to fetch restock history (${res.status})`);
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

// ─── Export / Import ─────────────────────────────────────────────────────────

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
  window.URL.revokeObjectURL(blobUrl);
  link.remove();
}

export interface ProductExportResult {
  file_url: string;
  file_type?: string;
  record_count?: number;
}

export interface ProductImportResult {
  message?: string;
  imported_count?: number;
  product_ids?: string[];
}

/** Extract a download URL from API response (handles both plain string and JSON object) */
function extractUrl(data: unknown): string {
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    return (obj.file_url || obj.url || '') as string;
  }
  return '';
}

/**
 * GET /api/v1/product/export?file_type=json|csv|excel
 * Response: string (S3 URL) or { file_url, file_type, record_count }
 */
export async function exportProductsFromBackend(
  fileType: 'json' | 'csv' | 'excel'
): Promise<ProductExportResult> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api/v1/product/export?file_type=${fileType}`, { headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Export failed' }));
    throw new Error(err.detail || `Export failed (${res.status})`);
  }

  const data = await res.json();
  const url = extractUrl(data);
  if (!url) throw new Error('Export response did not contain a download URL.');

  const ext = FILE_TYPE_EXT[fileType] ?? fileType;
  await blobDownload(url, `products-export.${ext}`);

  return typeof data === 'string' ? { file_url: data } : data;
}

/**
 * GET /api/v1/product/sample?file_type=json|csv|excel
 * Response: string (S3 URL) or { url, file_type }
 */
export async function downloadProductSample(
  fileType: 'json' | 'csv' | 'excel'
): Promise<void> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api/v1/product/sample?file_type=${fileType}`, { headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to download sample' }));
    throw new Error(err.detail || `Failed to download sample (${res.status})`);
  }

  const data = await res.json();
  const url = extractUrl(data);
  if (!url) throw new Error('Sample response did not contain a download URL.');

  const ext = FILE_TYPE_EXT[fileType] ?? fileType;
  await blobDownload(url, `products-sample.${ext}`);
}

/**
 * POST /api/v1/product/import  (multipart/form-data)
 * Fields: file, type (json|csv|excel)
 * Response: string or { message, imported_count, product_ids }
 */
export async function uploadMultipleProducts(file: File): Promise<ProductImportResult> {
  const token = getToken();
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const fileType = ext === 'json' ? 'json' : ext === 'csv' ? 'csv' : 'excel';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', fileType);

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api/v1/product/import`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Import failed' }));
    throw new Error(err.detail || `Import failed (${res.status})`);
  }

  const data = await res.json();
  if (typeof data === 'string') return { message: data };
  return data;
}

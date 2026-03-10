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

// ─── Export / Import / Sample ───────────────────────────────────────────────

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
  link.remove();
}

export interface CollectionExportResult {
  file_url: string;
  file_type: string;
  record_count?: number;
}

export interface CollectionImportResult {
  message?: string;
  imported_count?: number;
  collection_ids?: string[];
}

/**
 * GET /api/v1/collection/export?file_type=json|csv|excel
 * Response: { file_url, file_type, record_count }
 */
export async function exportCollectionsFromBackend(
  fileType: 'json' | 'csv' | 'excel'
): Promise<CollectionExportResult> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api/v1/collection/export?file_type=${fileType}`, { headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Export failed' }));
    throw new Error(err.detail || `Export failed (${res.status})`);
  }

  const result: CollectionExportResult = await res.json();
  if (!result.file_url) throw new Error('Export response did not contain a download URL.');

  const ext = FILE_TYPE_EXT[fileType] ?? fileType;
  await blobDownload(result.file_url, `collections-export.${ext}`);

  return result;
}

/**
 * GET /api/v1/collection/sample?file_type=json|csv|excel
 * Response: { url, file_type }
 */
export async function downloadCollectionSample(
  fileType: 'json' | 'csv' | 'excel'
): Promise<void> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api/v1/collection/sample?file_type=${fileType}`, { headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to download sample' }));
    throw new Error(err.detail || `Failed to download sample (${res.status})`);
  }

  const result: { url: string; file_type: string } = await res.json();
  if (!result.url) throw new Error('Sample response did not contain a download URL.');

  const ext = FILE_TYPE_EXT[fileType] ?? fileType;
  await blobDownload(result.url, `collections-sample.${ext}`);
}

/**
 * POST /api/v1/collection/import  (multipart/form-data)
 * Fields: file, type (json|csv|excel)
 * Response: { message, imported_count, collection_ids }
 */
export async function uploadMultipleCollections(file: File): Promise<CollectionImportResult> {
  const token = getToken();
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const fileType = ext === 'json' ? 'json' : ext === 'csv' ? 'csv' : 'excel';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', fileType);  // API expects 'type', not 'file_type'

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api/v1/collection/import`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to import collections' }));
    throw new Error(err.detail || `Failed to import collections (${res.status})`);
  }

  return res.json();
}

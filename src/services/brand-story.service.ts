/**
 * Brand Story Service (Real Backend API)
 * Endpoints: /api/v1/story/*
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

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

export interface StoryResponse {
  story_id: string;
  brand_id: string;
  title: string;
  story_type: string;
  story_type_subtype: string;
  excerpt: string;
  image_url: string;
  content: Record<string, unknown>[];
  product_list: string[];
  status: string;
  sections: number;
  read_time: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoryCreatePayload {
  title: string;
  story_type: string;
  story_type_subtype: string;
  excerpt: string;
  image_url: string;
  status: string;
  content: Record<string, unknown>[];
  product_list: string[];
  sections: number;
  read_time: number;
}

export interface StoryUpdatePayload {
  title?: string;
  story_type?: string;
  story_type_subtype?: string;
  excerpt?: string;
  image_url?: string;
  status?: string;
  content?: Record<string, unknown>[];
  product_list?: string[];
  sections?: number;
  read_time?: number;
}

export interface ProductListItem {
  product_id: number;
  image_url: string;
  product_name: string;
  price: number;
}

// ─── API Functions ──────────────────────────────────────────────────────────

export async function fetchStories(): Promise<StoryResponse[]> {
  const res = await fetch(`${API_BASE}/api/v1/story`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch stories' }));
    throw new Error(err.detail || `Failed to fetch stories (${res.status})`);
  }

  return res.json();
}

export async function fetchStory(storyId: string): Promise<StoryResponse> {
  const res = await fetch(`${API_BASE}/api/v1/story/${storyId}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Story not found' }));
    throw new Error(err.detail || `Failed to fetch story (${res.status})`);
  }

  return res.json();
}

export async function createStory(payload: StoryCreatePayload): Promise<StoryResponse> {
  const res = await fetch(`${API_BASE}/api/v1/story`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to create story' }));
    throw new Error(err.detail || `Failed to create story (${res.status})`);
  }

  return res.json();
}

export async function updateStory(
  storyId: string,
  payload: StoryUpdatePayload
): Promise<StoryResponse> {
  const res = await fetch(`${API_BASE}/api/v1/story/${storyId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to update story' }));
    throw new Error(err.detail || `Failed to update story (${res.status})`);
  }

  return res.json();
}

export async function softDeleteStory(storyId: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/api/v1/story/${storyId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to delete story' }));
    throw new Error(err.detail || `Failed to delete story (${res.status})`);
  }

  return res.json();
}

export async function restoreStory(storyId: string): Promise<StoryResponse> {
  const res = await fetch(`${API_BASE}/api/v1/story/${storyId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ is_active: true }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to restore story' }));
    throw new Error(err.detail || `Failed to restore story (${res.status})`);
  }

  return res.json();
}

export async function fetchProductsList(): Promise<ProductListItem[]> {
  const res = await fetch(`${API_BASE}/api/v1/product/products-list`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch products list' }));
    throw new Error(err.detail || `Failed to fetch products list (${res.status})`);
  }

  const data = await res.json();
  console.log('[fetchProductsList] response:', data);
  return data;
}

export interface MultiStoryUploadResult {
  message: string;
  inserted_count: number;
  story_ids: string[];
}

export interface StoryExportResult {
  url: string;
  file_type: string;
  total_records: number;
}

const FILE_TYPE_EXT: Record<string, string> = { json: 'json', csv: 'csv', excel: 'xlsx' };

function detectFileType(file: File): 'json' | 'csv' | 'excel' {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'json') return 'json';
  if (ext === 'csv') return 'csv';
  return 'excel';
}

function triggerS3Download(url: string, fallbackName: string) {
  const filename = url.split('/').pop()?.split('?')[0] || fallbackName;
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * POST /api/v1/story/import
 * Bulk import stories via file upload. Auth token required.
 */
export async function uploadMultipleStories(file: File): Promise<MultiStoryUploadResult> {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('file_type', detectFileType(file));

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/v1/story/import`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to upload stories' }));
    throw new Error(err.detail || `Failed to upload stories (${res.status})`);
  }

  return res.json();
}

/**
 * GET /api/v1/story/export?file_type=json|csv|excel
 * Exports all active stories to S3, returns { url, file_type, total_records }.
 * Triggers a direct browser download from the S3 URL.
 */
export async function exportStoriesFromBackend(
  fileType: 'json' | 'csv' | 'excel'
): Promise<StoryExportResult> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/v1/story/export?file_type=${fileType}`, { headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Export failed' }));
    throw new Error(err.detail || `Export failed (${res.status})`);
  }

  const result: StoryExportResult = await res.json();

  if (!result.url) throw new Error('Export response did not contain a download URL.');

  const ext = FILE_TYPE_EXT[fileType] ?? fileType;
  triggerS3Download(result.url, `stories-export.${ext}`);

  return result;
}

/**
 * GET /api/v1/story/sample?file_type=json|csv|excel
 * Returns { url, file_type }. Sends token if available.
 * Triggers a direct browser download from the S3 URL.
 */
export async function downloadStorySample(
  fileType: 'json' | 'csv' | 'excel'
): Promise<void> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/v1/story/sample?file_type=${fileType}`, { headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to download sample' }));
    throw new Error(err.detail || `Failed to download sample (${res.status})`);
  }

  const result: { url: string; file_type: string } = await res.json();

  if (!result.url) throw new Error('Sample response did not contain a download URL.');

  const ext = FILE_TYPE_EXT[fileType] ?? fileType;
  triggerS3Download(result.url, `stories-sample.${ext}`);
}

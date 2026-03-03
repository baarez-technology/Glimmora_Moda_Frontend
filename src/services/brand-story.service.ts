/**
 * Brand Story Service (Real Backend API)
 * Endpoints: /api/v1/story/*
 */

function getToken(): string | null {
  try {
    return localStorage.getItem('moda-brand-token');
  } catch {
    return null;
  }
}

function getBrandId(): string | null {
  try {
    const data = localStorage.getItem('moda-brand-data');
    if (!data) return null;
    const parsed = JSON.parse(data);
    return parsed?.brand_id ?? null;
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
  const res = await fetch('/api/v1/story', {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch stories' }));
    throw new Error(err.detail || `Failed to fetch stories (${res.status})`);
  }

  return res.json();
}

export async function fetchStory(storyId: string): Promise<StoryResponse> {
  const res = await fetch(`/api/v1/story/${storyId}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Story not found' }));
    throw new Error(err.detail || `Failed to fetch story (${res.status})`);
  }

  return res.json();
}

export async function createStory(payload: StoryCreatePayload): Promise<StoryResponse> {
  const res = await fetch('/api/v1/story', {
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
  const res = await fetch(`/api/v1/story/${storyId}`, {
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
  const res = await fetch(`/api/v1/story/${storyId}`, {
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
  const res = await fetch(`/api/v1/story/${storyId}`, {
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
  const res = await fetch('/api/v1/product/products-list', {
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

function detectFileType(file: File): 'json' | 'csv' | 'excel' {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'json') return 'json';
  if (ext === 'csv') return 'csv';
  return 'excel';
}

export async function uploadMultipleStories(file: File): Promise<MultiStoryUploadResult> {
  const token = getToken();
  const brandId = getBrandId();

  if (!brandId) {
    throw new Error('Brand ID not found. Please log in again.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('brand_id', brandId);
  formData.append('file_type', detectFileType(file));

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('/api/v1/multistory', {
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

const FILE_TYPE_EXT: Record<string, string> = { json: 'json', csv: 'csv', excel: 'xlsx' };

/**
 * GET /api/v1/multistory/export?file_type=json|csv|excel
 * Returns the S3 URL as a plain string.
 * We fetch that URL as a blob and trigger a browser Save-As download.
 */
export async function exportStoriesFromBackend(
  fileType: 'json' | 'csv' | 'excel'
): Promise<void> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api/v1/multistory/export?file_type=${fileType}`, { headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Export failed' }));
    throw new Error(err.detail || `Export failed (${res.status})`);
  }

  const raw = await res.json();
  console.log('[exportStoriesFromBackend] raw response:', raw);

  // Normalise — handle plain string OR object with a url field
  const s3Url: string =
    typeof raw === 'string'
      ? raw
      : (raw?.url ?? raw?.download_url ?? raw?.file_url ?? '');

  if (!s3Url) throw new Error('Export response did not contain a download URL.');

  const ext = FILE_TYPE_EXT[fileType] ?? fileType;
  const filename = s3Url.split('/').pop()?.split('?')[0] ?? `stories-export.${ext}`;

  // Direct link download from S3
  const a = document.createElement('a');
  a.href = s3Url;
  a.download = filename;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * GET /api/v1/multistory/sample
 * Downloads the official pre-filled .xlsx template from the backend.
 * Triggers a browser file download automatically.
 */
export async function downloadSampleTemplate(): Promise<void> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('/api/v1/multistory/sample', { headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to download sample' }));
    throw new Error(err.detail || `Failed to download sample (${res.status})`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'stories-sample.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}

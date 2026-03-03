/**
 * Brand Heritage Service (Real Backend API)
 * Endpoints: /api/v1/event/*
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

export interface HeritageEventResponse {
  event_id: string;
  brand_id: string;
  year: number;
  title: string;
  short_description: string;
  full_description: string;
  image_url: string;
  video_url: string;
  significance_type: string;
  significance_type_subtype: string;
  product_list: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HeritageEventCreatePayload {
  year: number;
  title: string;
  short_description: string;
  full_description: string;
  image_url: string;
  video_url: string;
  significance_type: string;
  significance_type_subtype: string;
  product_list: string[];
}

export interface HeritageEventUpdatePayload {
  year?: number;
  title?: string;
  short_description?: string;
  full_description?: string;
  image_url?: string;
  video_url?: string;
  significance_type?: string;
  significance_type_subtype?: string;
  product_list?: string[];
}

// ─── API Functions ──────────────────────────────────────────────────────────

export async function fetchHeritageEvents(): Promise<HeritageEventResponse[]> {
  const res = await fetch(`${API_BASE}/api/v1/event`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch heritage events' }));
    throw new Error(err.detail || `Failed to fetch heritage events (${res.status})`);
  }

  return res.json();
}

export async function fetchHeritageEvent(eventId: string): Promise<HeritageEventResponse> {
  const res = await fetch(`${API_BASE}/api/v1/event/${eventId}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Heritage event not found' }));
    throw new Error(err.detail || `Failed to fetch heritage event (${res.status})`);
  }

  return res.json();
}

export async function createHeritageEvent(payload: HeritageEventCreatePayload): Promise<HeritageEventResponse> {
  const res = await fetch(`${API_BASE}/api/v1/event`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to create heritage event' }));
    throw new Error(err.detail || `Failed to create heritage event (${res.status})`);
  }

  return res.json();
}

export async function updateHeritageEvent(
  eventId: string,
  payload: HeritageEventUpdatePayload
): Promise<HeritageEventResponse> {
  const res = await fetch(`${API_BASE}/api/v1/event/${eventId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to update heritage event' }));
    throw new Error(err.detail || `Failed to update heritage event (${res.status})`);
  }

  return res.json();
}

export async function softDeleteHeritageEvent(eventId: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/api/v1/event/${eventId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to delete heritage event' }));
    throw new Error(err.detail || `Failed to delete heritage event (${res.status})`);
  }

  return res.json();
}

export async function restoreHeritageEvent(eventId: string): Promise<HeritageEventResponse> {
  const res = await fetch(`${API_BASE}/api/v1/event/${eventId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ is_active: true }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to restore heritage event' }));
    throw new Error(err.detail || `Failed to restore heritage event (${res.status})`);
  }

  return res.json();
}

// ─── Bulk Import / Export / Sample ─────────────────────────────────────────

export interface HeritageImportResult {
  imported: number;
  skipped: number;
  total_in_file: number;
}

export interface HeritageExportResult {
  url: string;
  file_type: string;
  total_records: number;
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

const FILE_EXT: Record<string, string> = { json: 'json', csv: 'csv', excel: 'xlsx' };

/**
 * POST /api/v1/event/import?file_type=json|csv|excel
 * file_type is a query param (not a form field) for events.
 */
export async function importHeritageEvents(
  file: File,
  fileType: 'json' | 'csv' | 'excel'
): Promise<HeritageImportResult> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/v1/event/import?file_type=${fileType}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to import heritage events' }));
    throw new Error(err.detail || `Failed to import heritage events (${res.status})`);
  }

  return res.json();
}

/**
 * GET /api/v1/event/export?file_type=json|csv|excel
 * Returns { url, file_type, total_records } — triggers S3 download.
 */
export async function exportHeritageEvents(
  fileType: 'json' | 'csv' | 'excel'
): Promise<HeritageExportResult> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/v1/event/export?file_type=${fileType}`, { headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Export failed' }));
    throw new Error(err.detail || `Export failed (${res.status})`);
  }

  const result: HeritageExportResult = await res.json();

  if (!result.url) throw new Error('Export response did not contain a download URL.');

  const ext = FILE_EXT[fileType] ?? fileType;
  triggerS3Download(result.url, `heritage-export.${ext}`);

  return result;
}

/**
 * GET /api/v1/event/sample?file_type=json|csv|excel
 * Sends token if available — returns { url, file_type }.
 */
export async function downloadHeritageSample(
  fileType: 'json' | 'csv' | 'excel'
): Promise<void> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/v1/event/sample?file_type=${fileType}`, { headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to download sample' }));
    throw new Error(err.detail || `Failed to download sample (${res.status})`);
  }

  const result: { url: string; file_type: string } = await res.json();

  if (!result.url) throw new Error('Sample response did not contain a download URL.');

  const ext = FILE_EXT[fileType] ?? fileType;
  triggerS3Download(result.url, `heritage-sample.${ext}`);
}

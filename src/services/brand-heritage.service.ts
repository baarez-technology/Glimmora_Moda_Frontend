/**
 * Brand Heritage Service (Real Backend API)
 * Endpoints: /api/v1/event/*
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
  const res = await fetch('/api/v1/event', {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch heritage events' }));
    throw new Error(err.detail || `Failed to fetch heritage events (${res.status})`);
  }

  return res.json();
}

export async function fetchHeritageEvent(eventId: string): Promise<HeritageEventResponse> {
  const res = await fetch(`/api/v1/event/${eventId}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Heritage event not found' }));
    throw new Error(err.detail || `Failed to fetch heritage event (${res.status})`);
  }

  return res.json();
}

export async function createHeritageEvent(payload: HeritageEventCreatePayload): Promise<HeritageEventResponse> {
  const res = await fetch('/api/v1/event', {
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
  const res = await fetch(`/api/v1/event/${eventId}`, {
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
  const res = await fetch(`/api/v1/event/${eventId}`, {
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
  const res = await fetch(`/api/v1/event/${eventId}`, {
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

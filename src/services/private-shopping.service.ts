/**
 * Private Shopping Events Service
 * Routes via Next.js rewrite: /api/v1/* -> NEXT_PUBLIC_API_URL/api/v1/*
 *
 * Admin endpoints use brand token, consumer endpoints use user token.
 */

// ─── Auth helpers ────────────────────────────────────────────────────────────

function userAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('moda-user-token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function adminAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('moda-brand-token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type ApiPrivateShoppingStatus = 'upcoming' | 'completed';

export interface ApiPrivateShoppingEvent {
  private_shopping_event_id: string;
  title: string;
  tagline: string;
  description: string;
  dress_code: string;
  private_shopping_status: ApiPrivateShoppingStatus;
  type: string;
  date: string;
  time: string;
  date_day: string;
  location: string;
  spots: number;
  highlights: string[];
  connected_uhni_customers_ids: string[];
  is_already_joined: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePrivateShoppingEventPayload {
  title: string;
  tagline: string;
  description: string;
  dress_code: string;
  date: string;
  time: string;
  location: string;
  spots: number;
  highlights?: string[];
}

export interface UpdatePrivateShoppingEventPayload {
  title?: string;
  tagline?: string;
  description?: string;
  dress_code?: string;
  date?: string;
  time?: string;
  location?: string;
  spots?: number;
  highlights?: string[];
  connected_uhni_customers_ids?: string[];
}

// ─── Admin endpoints (brand token) ──────────────────────────────────────────

/** GET /api/v1/private-shopping-events — List all events (admin) */
export async function getAllPrivateShoppingEvents(): Promise<ApiPrivateShoppingEvent[]> {
  const res = await fetch('/api/v1/private-shopping-events', {
    headers: adminAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch private shopping events: ${res.status}`);
  return res.json();
}

/** POST /api/v1/private-shopping-events — Create event (admin) */
export async function createPrivateShoppingEvent(
  payload: CreatePrivateShoppingEventPayload
): Promise<ApiPrivateShoppingEvent> {
  const res = await fetch('/api/v1/private-shopping-events', {
    method: 'POST',
    headers: adminAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to create event: ${res.status}`);
  }
  return res.json();
}

/** GET /api/v1/private-shopping-events/{id} — Get specific event (admin) */
export async function getPrivateShoppingEventById(
  id: string
): Promise<ApiPrivateShoppingEvent> {
  const res = await fetch(`/api/v1/private-shopping-events/${id}`, {
    headers: adminAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch event ${id}: ${res.status}`);
  return res.json();
}

/** PATCH /api/v1/private-shopping-events/{id} — Update event (admin) */
export async function updatePrivateShoppingEvent(
  id: string,
  payload: UpdatePrivateShoppingEventPayload
): Promise<ApiPrivateShoppingEvent> {
  const res = await fetch(`/api/v1/private-shopping-events/${id}`, {
    method: 'PATCH',
    headers: adminAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to update event ${id}: ${res.status}`);
  }
  return res.json();
}

/** DELETE /api/v1/private-shopping-events/{id} — Delete event (admin) */
export async function deletePrivateShoppingEvent(id: string): Promise<void> {
  const res = await fetch(`/api/v1/private-shopping-events/${id}`, {
    method: 'DELETE',
    headers: adminAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to delete event ${id}: ${res.status}`);
  }
}

// ─── Consumer endpoints (user token) ────────────────────────────────────────

/** GET /api/v1/customer/private-shopping-events — List events with is_already_joined flag */
export async function getPrivateShoppingEvents(): Promise<ApiPrivateShoppingEvent[]> {
  const res = await fetch('/api/v1/customer/private-shopping-events', {
    headers: userAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch private shopping events: ${res.status}`);
  return res.json();
}

/** POST /api/v1/customer/private-shopping-events/{id}/join — Join event */
export async function joinPrivateShoppingEvent(
  id: string
): Promise<ApiPrivateShoppingEvent> {
  const res = await fetch(`/api/v1/customer/private-shopping-events/${id}/join`, {
    method: 'POST',
    headers: userAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to join shopping event: ${res.status}`);
  }
  return res.json();
}

/**
 * Consumer Styling Session Service
 * Routes via Next.js rewrite: /api/v1/customer/styling-sessions/* → backend
 * Auth: Bearer JWT stored in localStorage under 'moda-user-token'.
 */

function getToken(): string | null {
  try { return localStorage.getItem('moda-user-token'); } catch { return null; }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Request / Response types ─────────────────────────────────────────────────

/** Body sent to POST /api/v1/customer/styling-sessions */
export interface CreateStylingSessionPayload {
  brand_id: string;
  preferred_date: string;   // YYYY-MM-DD
  preferred_time: string;   // HH:MM
  duration?: string;        // e.g. "60"
  stylist_id?: string;
  notes?: string;
  location?: string;
}

/** Shape of the 201 response from the backend */
export interface ApiStylingSession {
  session_id: string;
  brand_id: string;
  preferred_date: string;
  preferred_time: string;
  duration?: string | null;
  stylist_id?: string | null;
  notes?: string | null;
  location?: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

const BASE = '/api/v1/customer/styling-sessions';

/**
 * POST /api/v1/customer/styling-sessions
 * Books a new styling session and returns the created session.
 */
export async function createStylingSession(
  payload: CreateStylingSessionPayload
): Promise<ApiStylingSession> {
  return apiFetch<ApiStylingSession>(BASE, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * GET /api/v1/customer/styling-sessions
 * Lists all styling sessions for the authenticated consumer (newest first).
 */
export async function fetchStylingSessions(): Promise<ApiStylingSession[]> {
  return apiFetch<ApiStylingSession[]>(BASE);
}

/**
 * GET /api/v1/customer/styling-sessions/{id}
 * Fetches a single styling session by ID.
 */
export async function fetchStylingSession(id: string): Promise<ApiStylingSession> {
  return apiFetch<ApiStylingSession>(`${BASE}/${id}`);
}

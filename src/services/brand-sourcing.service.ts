/**
 * Brand Sourcing Service
 * Routes via Next.js API route: /api/brand-sourcing/* → backend server-side
 */

function getToken(): string | null {
  try { return localStorage.getItem('moda-brand-token'); } catch { return null; }
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
    headers: { ...authHeaders(), ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiNegotiation {
  negotiations_id?: string;
  default_price?: number;
  offer_price?: number;
  notes?: string;
  is_accepted?: boolean;
}

export interface ApiProductOption {
  option_product_id: string;
  option_title: string;
  description: string;
  source_name: string;
  price: number;
  offer_price: number;
  source_location: string;
  estimate_delivery: string;
  image_url: string;
  notes: string;
  is_customer_selected: boolean;
  negotiations: ApiNegotiation[];
  created_at: string;
}

export interface ApiSourcingMessage {
  message: string;
  type: 'customer' | 'brand';
  created_at: string;
}

export interface ApiTimelineEntry {
  status: string;
  notes: string | null;
  updated_at: string;
}

export interface ApiBrandSourcingRequest {
  sourcing_id: string;
  customer_id: string;
  brand_ids: string[];
  looking_for: string;
  product_category: string;
  description: string;
  budget: string;
  priority: string | null;
  deadline: string | null;
  specifications: string | null;
  product_options: ApiProductOption[];
  messages: ApiSourcingMessage[];
  timelines: ApiTimelineEntry[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AddProductOptionPayload {
  option_title: string;
  description: string;
  source_name: string;
  price: number;
  source_location: string;
  estimate_delivery: string;
  image_url: string;
  notes: string;
}

// ─── API Functions ─────────────────────────────────────────────────────────────

const BASE = '/api/brand-sourcing';

/** GET /api/brand-sourcing */
export async function fetchBrandSourcingRequests(): Promise<ApiBrandSourcingRequest[]> {
  return apiFetch<ApiBrandSourcingRequest[]>(BASE);
}

/** GET /api/brand-sourcing/{sourcing_id} */
export async function fetchBrandSourcingRequest(sourcingId: string): Promise<ApiBrandSourcingRequest> {
  return apiFetch<ApiBrandSourcingRequest>(`${BASE}/${sourcingId}`);
}

/** PATCH /api/brand-sourcing/{sourcing_id}/status */
export async function updateBrandSourcingStatus(
  sourcingId: string,
  status: string,
  notes?: string
): Promise<ApiBrandSourcingRequest> {
  return apiFetch<ApiBrandSourcingRequest>(`${BASE}/${sourcingId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes: notes ?? null }),
  });
}

/** POST /api/brand-sourcing/{sourcing_id}/product-options */
export async function addBrandProductOption(
  sourcingId: string,
  payload: AddProductOptionPayload
): Promise<ApiBrandSourcingRequest> {
  return apiFetch<ApiBrandSourcingRequest>(`${BASE}/${sourcingId}/product-options`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** DELETE /api/brand-sourcing/{sourcing_id}/product-options/{option_id} */
export async function deleteBrandProductOption(
  sourcingId: string,
  optionId: string
): Promise<ApiBrandSourcingRequest> {
  return apiFetch<ApiBrandSourcingRequest>(
    `${BASE}/${sourcingId}/product-options/${optionId}`,
    { method: 'DELETE' }
  );
}

/** POST /api/brand-sourcing/{sourcing_id}/messages */
export async function sendBrandSourcingMessage(
  sourcingId: string,
  message: string
): Promise<ApiBrandSourcingRequest> {
  return apiFetch<ApiBrandSourcingRequest>(
    `${BASE}/${sourcingId}/messages?message=${encodeURIComponent(message)}`,
    { method: 'POST' }
  );
}

/** POST /api/brand-sourcing/{sourcing_id}/product-options/{option_id}/negotiations */
export async function addBrandNegotiation(
  sourcingId: string,
  optionId: string,
  offerPrice: number,
  notes: string
): Promise<ApiBrandSourcingRequest> {
  return apiFetch<ApiBrandSourcingRequest>(
    `${BASE}/${sourcingId}/product-options/${optionId}/negotiations?offer_price=${offerPrice}&notes=${encodeURIComponent(notes)}`,
    { method: 'POST' }
  );
}

/** PATCH /api/brand-sourcing/{sourcing_id}/product-options/{option_id}/negotiations/{neg_id}/accept */
export async function acceptBrandNegotiation(
  sourcingId: string,
  optionId: string,
  negotiationsId: string
): Promise<ApiBrandSourcingRequest> {
  return apiFetch<ApiBrandSourcingRequest>(
    `${BASE}/${sourcingId}/product-options/${optionId}/negotiations/${negotiationsId}/accept`,
    { method: 'PATCH' }
  );
}

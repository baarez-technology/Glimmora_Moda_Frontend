/**
 * Brand Shop/Boutique Locations Service
 *
 * Calls the real backend APIs via the Next.js proxy.
 * All paths are relative (/api/v1/...) — never use absolute URLs (see CLAUDE.md).
 */

// ── Types ────────────────────────────────────────────────────────────

export interface BrandShopLocation {
  shop_id: string;
  brand_id: string;
  shop_name: string;
  shop_type: string; // 'flagship' | 'boutique' | 'outlet' | 'popup' | 'department_store'
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state?: string | null;
  country: string;
  postal_code?: string | null;
  phone?: string | null;
  email?: string | null;
  opening_hours?: string | null;
  image_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateShopLocationPayload = {
  shop_name: string;
  shop_type: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  country: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  opening_hours?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  is_active?: boolean;
};

export type UpdateShopLocationPayload = Partial<CreateShopLocationPayload>;

// ── Auth helpers ─────────────────────────────────────────────────────

const BASE = '/api/v1/brand/shop-locations';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('moda-brand-token') || '';
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  };
}

// ── CRUD Functions ───────────────────────────────────────────────────

/** Get all shop locations for the current brand */
export async function getAllShopLocations(): Promise<BrandShopLocation[]> {
  const res = await fetch(BASE, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch shop locations: ${res.status}`);
  const data = await res.json();
  return data.shop_locations ?? [];
}

/** Add a new shop location */
export async function addShopLocation(payload: CreateShopLocationPayload): Promise<BrandShopLocation> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to add shop location: ${res.status}`);
  return res.json();
}

/** Update an existing shop location */
export async function updateShopLocation(id: string, payload: UpdateShopLocationPayload): Promise<BrandShopLocation> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update shop location: ${res.status}`);
  return res.json();
}

/** Hard delete a shop location */
export async function deleteShopLocation(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete shop location: ${res.status}`);
}

/** Set a shop location as the default */
export async function makeDefaultShopLocation(id: string): Promise<BrandShopLocation> {
  const res = await fetch(`${BASE}/${id}/make-default`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to set default shop location: ${res.status}`);
  return res.json();
}

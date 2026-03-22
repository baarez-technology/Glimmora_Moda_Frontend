/**
 * Brand Shop/Boutique Locations Service
 *
 * Manages brand shop locations using localStorage as a temporary data store.
 * When backend APIs are built, swap localStorage calls with fetch calls.
 */

// ── Types ────────────────────────────────────────────────────────────

export interface BrandShopLocation {
  id: string;
  brand_id: string;
  shop_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone?: string;
  email?: string;
  latitude: number;
  longitude: number;
  opening_hours?: string;
  shop_type: 'flagship' | 'boutique' | 'outlet' | 'popup' | 'department_store';
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export type CreateShopLocationPayload = Omit<BrandShopLocation, 'id' | 'created_at'>;
export type UpdateShopLocationPayload = Partial<Omit<BrandShopLocation, 'id' | 'created_at'>>;

// ── localStorage helpers ─────────────────────────────────────────────

const LS_KEY = 'moda-brand-shops';

function readAll(): BrandShopLocation[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeAll(locations: BrandShopLocation[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify(locations));
}

// ── CRUD Functions ───────────────────────────────────────────────────

/** Get all shop locations for the current brand */
export function getAllShopLocations(): BrandShopLocation[] {
  return readAll();
}

/** Add a new shop location */
export function addShopLocation(data: CreateShopLocationPayload): BrandShopLocation {
  const locations = readAll();
  const newLocation: BrandShopLocation = {
    ...data,
    id: Date.now().toString(36),
    created_at: new Date().toISOString(),
  };
  locations.unshift(newLocation);
  writeAll(locations);
  return newLocation;
}

/** Update an existing shop location */
export function updateShopLocation(id: string, data: UpdateShopLocationPayload): BrandShopLocation {
  const locations = readAll();
  const idx = locations.findIndex(loc => loc.id === id);
  if (idx === -1) throw new Error(`Shop location not found: ${id}`);
  locations[idx] = { ...locations[idx], ...data };
  writeAll(locations);
  return locations[idx];
}

/** Delete a shop location */
export function deleteShopLocation(id: string): void {
  const locations = readAll();
  const filtered = locations.filter(loc => loc.id !== id);
  if (filtered.length === locations.length) throw new Error(`Shop location not found: ${id}`);
  writeAll(filtered);
}

// ── Consumer Function ────────────────────────────────────────────────

/** Get ALL shops across all brands (for consumer map view) */
export function getAllBrandShops(): BrandShopLocation[] {
  return readAll().filter(loc => loc.is_active);
}

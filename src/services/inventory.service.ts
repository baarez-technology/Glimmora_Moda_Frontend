/**
 * Inventory Service — Real Backend API
 * Endpoint: /api/v1/inventory
 */

function getToken(): string | null {
  try {
    return localStorage.getItem('moda-brand-token');
  } catch {
    return null;
  }
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// ─── Raw API Types ────────────────────────────────────────────────────────────

interface ApiCity {
  city: string;
  total_units: number;
  total_value: number;
  revenue_comparison_percentage: number;
}

interface ApiCountry {
  country: string;
  cities: ApiCity[];
}

interface ApiAlert {
  alert_type: string;
  product_id: string;
  product_name: string;
  country: string;
  city: string;
  current_units: number;
  threshold: number;
  alert_created_at: string;
  criticality: 'high' | 'medium' | 'low';
}

interface ApiInventoryRaw {
  total_units: number;
  total_units_comparison_percentage: number;
  total_value: number;
  total_value_comparison_percentage: number;
  total_active_alerts: number;
  regional_distribution: ApiCountry[];
  inventory_alerts: ApiAlert[];
}

// ─── Frontend Types ───────────────────────────────────────────────────────────

export interface InventoryCity {
  city: string;
  units: number;
  value: number;
  changePercent: number;
}

export interface InventoryCountry {
  country: string;
  totalUnits: number;
  totalValue: number;
  changePercent: number;
  cities: InventoryCity[];
}

export interface InventoryAlert {
  id: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  productId: string;
  productName: string;
  country: string;
  city: string;
  currentStock: number;
  threshold: number;
  message: string;
  createdAt: string;
}

export interface InventoryData {
  totalUnits: number;
  totalUnitsChangePercent: number;
  totalValue: number;
  totalValueChangePercent: number;
  totalActiveAlerts: number;
  countries: InventoryCountry[];
  alerts: InventoryAlert[];
  fetchedAt: string;
}

// ─── Transform ────────────────────────────────────────────────────────────────

function transformAlert(a: ApiAlert): InventoryAlert {
  const label = a.alert_type === 'low_stock' ? 'Low stock' : 'Restock';
  const message = a.alert_type === 'low_stock'
    ? `${label} in ${a.city} — ${a.current_units} units (threshold: ${a.threshold})`
    : `Restock in ${a.city} — ${a.current_units} units restocked`;

  return {
    id: `${a.product_id}_${a.city}_${a.alert_type}`,
    type: a.alert_type,
    priority: a.criticality,
    productId: a.product_id,
    productName: a.product_name,
    country: a.country,
    city: a.city,
    currentStock: a.current_units,
    threshold: a.threshold,
    message,
    createdAt: a.alert_created_at,
  };
}

function transformCountry(c: ApiCountry): InventoryCountry {
  const totalUnits = c.cities.reduce((s, x) => s + x.total_units, 0);
  const totalValue = c.cities.reduce((s, x) => s + x.total_value, 0);
  const avgChange = c.cities.length > 0
    ? c.cities.reduce((s, x) => s + x.revenue_comparison_percentage, 0) / c.cities.length
    : 100;

  return {
    country: c.country,
    totalUnits,
    totalValue,
    changePercent: avgChange,
    cities: c.cities.map(city => ({
      city: city.city,
      units: city.total_units,
      value: city.total_value,
      changePercent: city.revenue_comparison_percentage,
    })),
  };
}

function transform(raw: ApiInventoryRaw): InventoryData {
  const countries = raw.regional_distribution.map(transformCountry);

  const criticalityOrder = { high: 0, medium: 1, low: 2 };
  const alerts = raw.inventory_alerts
    .map(transformAlert)
    .sort((a, b) => criticalityOrder[a.priority] - criticalityOrder[b.priority]);

  return {
    totalUnits: raw.total_units,
    totalUnitsChangePercent: raw.total_units_comparison_percentage,
    totalValue: raw.total_value,
    totalValueChangePercent: raw.total_value_comparison_percentage,
    totalActiveAlerts: raw.total_active_alerts,
    countries,
    alerts,
    fetchedAt: new Date().toISOString(),
  };
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function fetchInventory(): Promise<InventoryData> {
  const res = await fetch('/api/v1/inventory', { headers: authHeaders() });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch inventory' }));
    throw new Error(err.detail || `Failed to fetch inventory (${res.status})`);
  }

  const raw: ApiInventoryRaw = await res.json();
  return transform(raw);
}

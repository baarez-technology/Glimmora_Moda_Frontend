/**
 * Brand Intelligence Service (B17-B27)
 *
 * Endpoints: GET /api/v1/intelligence/*
 * Auth: Brand token (moda-brand-token)
 *
 * Tries real API first, falls back to mock data if API unavailable.
 */

import { apiRequest } from './api-client';
import type { ApiResponse } from './api-client';
import type {
  DemandSimulation,
  BrandIntelligenceSignal,
  BrandConciergeConfig,
  MemoryImprint,
  BrandDigitalTwin,
  CulturalAuthority,
  BoutiquePerformance,
  CounterfeitAlert,
  DropSimulation,
  HeritageAsset,
  ClientArchetype,
} from '@/types/brand-intelligence';
import {
  mockDemandSimulations,
  mockIntelligenceSignals,
  mockBrandConciergeConfig,
  mockMemoryImprints,
  mockBrandDigitalTwin,
  mockCulturalAuthority,
  mockBoutiquePerformances,
  mockCounterfeitAlerts,
  mockDropSimulations,
  mockHeritageAssets,
  mockClientArchetypes,
} from '@/data/brand-intelligence';

// ============================================
// Auth helpers
// ============================================

function getBrandToken(): string | null {
  try {
    return localStorage.getItem('moda-brand-token');
  } catch {
    return null;
  }
}

function brandHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getBrandToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// ============================================
// Generic fetcher — real API first, mock fallback
// ============================================

/**
 * Extract array data from API response.
 * API returns objects like { simulations: [...], total: N } — not raw arrays.
 * This function finds the first array property in the response.
 */
function extractArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    // Try common wrapper keys first
    for (const key of ['data', 'items', 'results']) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }
    // Find first array property
    for (const val of Object.values(obj)) {
      if (Array.isArray(val)) return val as T[];
    }
  }
  return [];
}

async function fetchIntelligence<T>(
  endpoint: string,
  mockFallback: () => T | Promise<T>,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: unknown,
): Promise<ApiResponse<T>> {
  const token = getBrandToken();

  if (token) {
    try {
      const res = await window.fetch(`/api/v1/intelligence/${endpoint}`, {
        method,
        headers: brandHeaders(),
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      if (res.ok) {
        const raw = await res.json();
        return {
          data: raw as T,
          success: true,
          timestamp: new Date().toISOString(),
        };
      }
    } catch {
      // API failed — fall through to mock
    }
  }

  return apiRequest<T>(`/api/brand/intelligence/${endpoint}`, {
    method,
    mockHandler: mockFallback,
  });
}

// ============================================
// B17: Design-to-Demand Simulation
// ============================================

export async function getDemandSimulations(): Promise<ApiResponse<DemandSimulation[]>> {
  const res = await fetchIntelligence<DemandSimulation[]>('design-demand', () => mockDemandSimulations);
  // API returns { simulations: [...] }
  if (res.data && !Array.isArray(res.data)) {
    res.data = extractArray<DemandSimulation>(res.data);
  }
  return res;
}

// ============================================
// B18: Intelligence Agent — Signal Feed
// ============================================

export async function getIntelligenceSignals(): Promise<ApiResponse<BrandIntelligenceSignal[]>> {
  const res = await fetchIntelligence<BrandIntelligenceSignal[]>('signals', () => mockIntelligenceSignals);
  // API returns { signal_feed: [...] }
  if (res.data && !Array.isArray(res.data)) {
    const raw = res.data as unknown as Record<string, unknown>;
    res.data = (raw?.signal_feed ?? extractArray<BrandIntelligenceSignal>(raw)) as BrandIntelligenceSignal[];
  }
  return res;
}

// ============================================
// B19: AGI Concierge Config
// ============================================

export async function getBrandConciergeConfig(): Promise<ApiResponse<BrandConciergeConfig>> {
  return fetchIntelligence('concierge-config', () => mockBrandConciergeConfig);
}

// ============================================
// B20: Brand Memory Imprint (BMI)
// ============================================

export async function getMemoryImprints(): Promise<ApiResponse<MemoryImprint[]>> {
  const res = await fetchIntelligence<MemoryImprint[]>('memory-imprints', () => mockMemoryImprints);
  // API returns { memory_imprints: [...] }
  if (res.data && !Array.isArray(res.data)) {
    const raw = res.data as unknown as Record<string, unknown>;
    res.data = (raw?.memory_imprints ?? extractArray<MemoryImprint>(raw)) as MemoryImprint[];
  }
  return res;
}

// ============================================
// B21: Brand Digital Twin
// ============================================

export async function getBrandDigitalTwin(): Promise<ApiResponse<BrandDigitalTwin>> {
  return fetchIntelligence('digital-twin', () => mockBrandDigitalTwin);
}

// ============================================
// B22: Cultural Brand Capital Engine (CBCE)
// ============================================

export async function getCulturalAuthority(): Promise<ApiResponse<CulturalAuthority[]>> {
  const res = await fetchIntelligence<CulturalAuthority[]>('cultural-authority', () => mockCulturalAuthority);
  // API returns { dimensions: [...] }
  if (res.data && !Array.isArray(res.data)) {
    const raw = res.data as unknown as Record<string, unknown>;
    res.data = (raw?.dimensions ?? extractArray<CulturalAuthority>(raw)) as CulturalAuthority[];
  }
  return res;
}

// ============================================
// B23: Boutique Performance Index (BPI)
// ============================================

export async function getBoutiquePerformances(): Promise<ApiResponse<BoutiquePerformance[]>> {
  const res = await fetchIntelligence<BoutiquePerformance[]>('boutique-performances', () => mockBoutiquePerformances);
  // API returns { boutiques: [...] }
  if (res.data && !Array.isArray(res.data)) {
    const raw = res.data as unknown as Record<string, unknown>;
    res.data = (raw?.boutiques ?? extractArray<BoutiquePerformance>(raw)) as BoutiquePerformance[];
  }
  return res;
}

// ============================================
// B24: Counterfeit Digital Detection (CDDI)
// ============================================

export async function getCounterfeitAlerts(): Promise<ApiResponse<CounterfeitAlert[]>> {
  const res = await fetchIntelligence<CounterfeitAlert[]>('counterfeit-alerts', () => mockCounterfeitAlerts);
  // API returns { alerts: [...] }
  if (res.data && !Array.isArray(res.data)) {
    const raw = res.data as unknown as Record<string, unknown>;
    res.data = (raw?.alerts ?? extractArray<CounterfeitAlert>(raw)) as CounterfeitAlert[];
  }
  return res;
}

export async function updateCounterfeitAlert(id: string, status: string): Promise<void> {
  try {
    await window.fetch(`/api/v1/intelligence/counterfeit-alerts/${id}`, {
      method: 'PATCH',
      headers: brandHeaders(),
      body: JSON.stringify({ status }),
    });
  } catch { /* fire-and-forget */ }
}

export async function reportCounterfeitAlert(payload: {
  product_id: string;
  similarity: number;
  source: string;
  source_url?: string;
  region?: string;
  risk_level?: string;
}): Promise<CounterfeitAlert | null> {
  try {
    const res = await window.fetch('/api/v1/intelligence/counterfeit-alerts', {
      method: 'POST',
      headers: brandHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

// ============================================
// B25: Global Drop Strategy Simulator (GDSS)
// ============================================

export async function getDropSimulations(): Promise<ApiResponse<DropSimulation[]>> {
  const res = await fetchIntelligence<DropSimulation[]>('drop-simulations', () => mockDropSimulations);
  // API returns { simulations: [...] }
  if (res.data && !Array.isArray(res.data)) {
    const raw = res.data as unknown as Record<string, unknown>;
    res.data = (raw?.simulations ?? extractArray<DropSimulation>(raw)) as DropSimulation[];
  }
  return res;
}

export async function createDropSimulation(payload: {
  drop_name: string;
  collection_name?: string;
  product_ids: string[];
  launch_date?: string;
}): Promise<ApiResponse<DropSimulation>> {
  return fetchIntelligence('drop-simulations', () => mockDropSimulations[0], 'POST', payload);
}

export async function updateDropSimulationStatus(
  simulationId: string,
  status: DropSimulation['status'],
): Promise<ApiResponse<DropSimulation>> {
  return fetchIntelligence(
    `drop-simulations/${simulationId}`,
    () => ({ ...mockDropSimulations[0], status }),
    'PATCH',
    { status },
  );
}

// ============================================
// B26: Heritage Preservation AI (HPAI)
// ============================================

export async function getHeritageAssets(): Promise<ApiResponse<HeritageAsset[]>> {
  const res = await fetchIntelligence<HeritageAsset[]>('heritage-assets', () => mockHeritageAssets);
  // API returns { assets: [...] }
  if (res.data && !Array.isArray(res.data)) {
    const raw = res.data as unknown as Record<string, unknown>;
    res.data = (raw?.assets ?? extractArray<HeritageAsset>(raw)) as HeritageAsset[];
  }
  return res;
}

export async function createHeritageAsset(payload: {
  name: string;
  era: string;
  year?: number;
  significance: string;
  description: string;
  digital_status?: string;
  image?: string;
  condition_notes?: string;
}): Promise<HeritageAsset | null> {
  try {
    const res = await window.fetch('/api/v1/intelligence/heritage-assets', {
      method: 'POST',
      headers: brandHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function updateHeritageAsset(assetId: string, payload: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await window.fetch(`/api/v1/intelligence/heritage-assets/${assetId}`, {
      method: 'PATCH',
      headers: brandHeaders(),
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch { return false; }
}

export async function deleteHeritageAsset(assetId: string): Promise<boolean> {
  try {
    const res = await window.fetch(`/api/v1/intelligence/heritage-assets/${assetId}`, {
      method: 'DELETE',
      headers: brandHeaders(),
    });
    return res.ok;
  } catch { return false; }
}

// ============================================
// B27: Ultra-Premium Client Genome (UPCG)
// ============================================

function mapArchetype(a: Record<string, unknown>): ClientArchetype {
  return {
    archetypeId: (a.id ?? a.archetypeId ?? a.archetype_id ?? '') as string,
    label: (a.label ?? '') as string,
    description: (a.description ?? '') as string,
    clientCount: (a.clientCount ?? a.client_count ?? 0) as number,
    averageLifetimeValue: (a.avgLifetimeValue ?? a.avg_lifetime_value ?? a.averageLifetimeValue ?? 0) as number,
    retentionRate: (a.retentionRate ?? a.retention_rate ?? 0) as number,
    spendPattern: (a.spendPattern ?? a.spend_pattern ?? []) as ClientArchetype['spendPattern'],
    behaviorTraits: (a.traits ?? a.behaviorTraits ?? a.behavior_traits ?? []) as ClientArchetype['behaviorTraits'],
    preferences: (a.preferences ?? []) as string[],
  };
}

export async function getClientArchetypes(): Promise<ApiResponse<ClientArchetype[]>> {
  const res = await fetchIntelligence<ClientArchetype[]>('client-archetypes', () => mockClientArchetypes);
  // API returns { archetypes: [...] }
  if (res.data && !Array.isArray(res.data)) {
    const raw = res.data as unknown as Record<string, unknown>;
    const archetypes = (raw?.archetypes ?? extractArray(raw)) as Record<string, unknown>[];
    res.data = archetypes.map(mapArchetype);
  }
  return res;
}

/**
 * Brand Intelligence Service
 * Endpoints: /api/brand/intelligence/*
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
// B17: Design-to-Demand Simulation
// ============================================

export async function getDemandSimulations(): Promise<ApiResponse<DemandSimulation[]>> {
  return apiRequest<DemandSimulation[]>('/api/brand/intelligence/demand-simulations', {
    mockHandler: () => mockDemandSimulations,
  });
}

// ============================================
// B18: Intelligence Agent
// ============================================

export async function getIntelligenceSignals(): Promise<ApiResponse<BrandIntelligenceSignal[]>> {
  return apiRequest<BrandIntelligenceSignal[]>('/api/brand/intelligence/signals', {
    mockHandler: () => mockIntelligenceSignals,
  });
}

// ============================================
// B19: AGI Concierge Config
// ============================================

export async function getBrandConciergeConfig(): Promise<ApiResponse<BrandConciergeConfig>> {
  return apiRequest<BrandConciergeConfig>('/api/brand/intelligence/concierge-config', {
    mockHandler: () => mockBrandConciergeConfig,
  });
}

// ============================================
// B20: Brand Memory Imprint
// ============================================

export async function getMemoryImprints(): Promise<ApiResponse<MemoryImprint[]>> {
  return apiRequest<MemoryImprint[]>('/api/brand/intelligence/memory-imprints', {
    mockHandler: () => mockMemoryImprints,
  });
}

// ============================================
// B21: Brand Digital Twin
// ============================================

export async function getBrandDigitalTwin(): Promise<ApiResponse<BrandDigitalTwin>> {
  return apiRequest<BrandDigitalTwin>('/api/brand/intelligence/digital-twin', {
    mockHandler: () => mockBrandDigitalTwin,
  });
}

// ============================================
// B22: Cultural Brand Capital Engine (CBCE)
// ============================================

export async function getCulturalAuthority(): Promise<ApiResponse<CulturalAuthority[]>> {
  return apiRequest<CulturalAuthority[]>('/api/brand/intelligence/cultural-authority', {
    mockHandler: () => mockCulturalAuthority,
  });
}

// ── Intelligence API helpers ───────────────────────────────────────────────────

function intelligenceAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const token = localStorage.getItem('moda-brand-token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch { /* SSR */ }
  return headers;
}

// ============================================
// B23: Boutique Performance Index (BPI)
// ============================================

let _boutiqueCache: BoutiquePerformance[] | null = null;

export async function getBoutiquePerformances(): Promise<ApiResponse<BoutiquePerformance[]>> {
  if (_boutiqueCache) {
    return { data: _boutiqueCache, success: true, timestamp: new Date().toISOString() };
  }
  try {
    const res = await fetch('/api/v1/intelligence/boutique-performances', {
      headers: intelligenceAuthHeaders(),
    });
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    const raw = json.boutiques ?? json.data ?? json;
    const data: BoutiquePerformance[] = Array.isArray(raw) ? raw : [];
    _boutiqueCache = data;
    return { data, success: true, timestamp: new Date().toISOString() };
  } catch {
    return { data: mockBoutiquePerformances, success: true, timestamp: new Date().toISOString() };
  }
}

// ============================================
// B24: Counterfeit Digital Detection (CDDI)
// ============================================

let _counterfeitCache: CounterfeitAlert[] | null = null;

export async function getCounterfeitAlerts(): Promise<ApiResponse<CounterfeitAlert[]>> {
  if (_counterfeitCache) {
    return { data: _counterfeitCache, success: true, timestamp: new Date().toISOString() };
  }
  try {
    const res = await fetch('/api/v1/intelligence/counterfeit-alerts', {
      headers: intelligenceAuthHeaders(),
    });
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    const raw = json.alerts ?? json.data ?? json;
    const data: CounterfeitAlert[] = Array.isArray(raw) ? raw : [];
    _counterfeitCache = data;
    return { data, success: true, timestamp: new Date().toISOString() };
  } catch {
    return { data: mockCounterfeitAlerts, success: true, timestamp: new Date().toISOString() };
  }
}

export async function updateCounterfeitAlert(id: string, status: string): Promise<void> {
  // Update cache optimistically
  if (_counterfeitCache) {
    _counterfeitCache = _counterfeitCache.map(a => a.id === id ? { ...a, status: status as CounterfeitAlert['status'] } : a);
  }
  try {
    await fetch(`/api/v1/intelligence/counterfeit-alerts/${id}`, {
      method: 'PATCH',
      headers: intelligenceAuthHeaders(),
      body: JSON.stringify({ status }),
    });
  } catch { /* fire-and-forget */ }
}

// ============================================
// B25: Global Drop Strategy Simulator (GDSS)
// ============================================

export async function getDropSimulations(): Promise<ApiResponse<DropSimulation[]>> {
  return apiRequest<DropSimulation[]>('/api/brand/intelligence/drop-simulations', {
    mockHandler: () => mockDropSimulations,
  });
}

// ============================================
// B26: Heritage Preservation AI (HPAI)
// ============================================

let _heritageCache: HeritageAsset[] | null = null;

export async function getHeritageAssets(): Promise<ApiResponse<HeritageAsset[]>> {
  if (_heritageCache) {
    return { data: _heritageCache, success: true, timestamp: new Date().toISOString() };
  }
  try {
    const res = await fetch('/api/v1/intelligence/heritage-assets', {
      headers: intelligenceAuthHeaders(),
    });
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    const raw = json.assets ?? json.data ?? json;
    const data: HeritageAsset[] = Array.isArray(raw) ? raw : [];
    _heritageCache = data;
    return { data, success: true, timestamp: new Date().toISOString() };
  } catch {
    return { data: mockHeritageAssets, success: true, timestamp: new Date().toISOString() };
  }
}

// ============================================
// B27: Ultra-Premium Client Genome (UPCG)
// ============================================

let _upcgCache: ClientArchetype[] | null = null;

function mapArchetype(a: Record<string, unknown>): ClientArchetype {
  return {
    archetypeId: (a.id ?? a.archetypeId ?? '') as string,
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
  if (_upcgCache) {
    return { data: _upcgCache, success: true, timestamp: new Date().toISOString() };
  }
  try {
    const res = await fetch('/api/v1/intelligence/client-archetypes', {
      headers: intelligenceAuthHeaders(),
    });
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    const raw = json.archetypes ?? json.data ?? json;
    const data: ClientArchetype[] = Array.isArray(raw) ? raw.map(mapArchetype) : [];
    _upcgCache = data;
    return { data, success: true, timestamp: new Date().toISOString() };
  } catch {
    return { data: mockClientArchetypes, success: true, timestamp: new Date().toISOString() };
  }
}

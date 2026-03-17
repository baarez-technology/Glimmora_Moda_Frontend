/**
 * Brand Intelligence Service (B17-B27)
 *
 * Endpoints: GET /api/v1/intelligence/*
 * Auth: Brand token (moda-brand-token)
 *
 * Tries real API first, falls back to mock data if API unavailable.
 */

import { fetchWithTimeout } from '@/lib/api-cache';
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

async function fetchIntelligence<T>(
  endpoint: string,
  mockFallback: () => T | Promise<T>,
  method: 'GET' | 'POST' | 'PATCH' = 'GET',
  body?: unknown,
): Promise<ApiResponse<T>> {
  const token = getBrandToken();

  // Try real API if brand is authenticated
  if (token) {
    try {
      const res = await fetchWithTimeout(`/api/v1/intelligence/${endpoint}`, {
        method,
        headers: brandHeaders(),
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          data: data as T,
          success: true,
          timestamp: new Date().toISOString(),
        };
      }
      console.log(`[brand-intelligence] API ${endpoint}: ${res.status}, falling back to mock`);
    } catch (err) {
      console.log(`[brand-intelligence] API ${endpoint} failed, using mock:`, err);
    }
  }

  // Fallback to mock
  return apiRequest<T>(`/api/brand/intelligence/${endpoint}`, {
    method,
    mockHandler: mockFallback,
  });
}

// ============================================
// B17: Design-to-Demand Simulation
// ============================================

export async function getDemandSimulations(): Promise<ApiResponse<DemandSimulation[]>> {
  return fetchIntelligence('design-demand', () => mockDemandSimulations);
}

// ============================================
// B18: Intelligence Agent — Signal Feed
// ============================================

export async function getIntelligenceSignals(): Promise<ApiResponse<BrandIntelligenceSignal[]>> {
  return fetchIntelligence('signals', () => mockIntelligenceSignals);
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
  return fetchIntelligence('memory-imprints', () => mockMemoryImprints);
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
  return fetchIntelligence('cultural-authority', () => mockCulturalAuthority);
}

// ============================================
// B23: Boutique Performance Index (BPI)
// ============================================

export async function getBoutiquePerformances(): Promise<ApiResponse<BoutiquePerformance[]>> {
  return fetchIntelligence('boutique-performances', () => mockBoutiquePerformances);
}

// ============================================
// B24: Counterfeit Digital Detection (CDDI)
// ============================================

export async function getCounterfeitAlerts(): Promise<ApiResponse<CounterfeitAlert[]>> {
  return fetchIntelligence('counterfeit-alerts', () => mockCounterfeitAlerts);
}

// ============================================
// B25: Global Drop Strategy Simulator (GDSS)
// ============================================

export async function getDropSimulations(): Promise<ApiResponse<DropSimulation[]>> {
  return fetchIntelligence('drop-simulations', () => mockDropSimulations);
}

export async function createDropSimulation(payload: {
  dropName: string;
  collection: string;
  launchDate: string;
  regions: string[];
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
  return fetchIntelligence('heritage-assets', () => mockHeritageAssets);
}

// ============================================
// B27: Ultra-Premium Client Genome (UPCG)
// ============================================

export async function getClientArchetypes(): Promise<ApiResponse<ClientArchetype[]>> {
  return fetchIntelligence('client-archetypes', () => mockClientArchetypes);
}

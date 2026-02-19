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

// ============================================
// B23: Boutique Performance Index (BPI)
// ============================================

export async function getBoutiquePerformances(): Promise<ApiResponse<BoutiquePerformance[]>> {
  return apiRequest<BoutiquePerformance[]>('/api/brand/intelligence/boutique-performances', {
    mockHandler: () => mockBoutiquePerformances,
  });
}

// ============================================
// B24: Counterfeit Digital Detection (CDDI)
// ============================================

export async function getCounterfeitAlerts(): Promise<ApiResponse<CounterfeitAlert[]>> {
  return apiRequest<CounterfeitAlert[]>('/api/brand/intelligence/counterfeit-alerts', {
    mockHandler: () => mockCounterfeitAlerts,
  });
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

export async function getHeritageAssets(): Promise<ApiResponse<HeritageAsset[]>> {
  return apiRequest<HeritageAsset[]>('/api/brand/intelligence/heritage-assets', {
    mockHandler: () => mockHeritageAssets,
  });
}

// ============================================
// B27: Ultra-Premium Client Genome (UPCG)
// ============================================

export async function getClientArchetypes(): Promise<ApiResponse<ClientArchetype[]>> {
  return apiRequest<ClientArchetype[]>('/api/brand/intelligence/client-archetypes', {
    mockHandler: () => mockClientArchetypes,
  });
}

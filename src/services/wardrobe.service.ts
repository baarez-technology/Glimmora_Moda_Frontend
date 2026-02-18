/**
 * Wardrobe Service
 * Endpoints: /api/wardrobe/*
 */

import { apiRequest } from './api-client';
import type { ApiResponse } from './api-client';
import type { WardrobeItem, Product } from '@/types';
import type { WardrobeAnalysis, FitConfidence, DigitalBodyTwin, CompleteOutfit } from '@/types/intelligence';
import { mockFitConfidence, mockBodyTwin, mockWardrobeAnalysis, getMockOutfits } from '@/data/wardrobe';

export async function getWardrobe(): Promise<ApiResponse<WardrobeItem[]>> {
  return apiRequest<WardrobeItem[]>('/api/wardrobe', {
    mockHandler: () => {
      try {
        const stored = localStorage.getItem('moda-wardrobe');
        return stored ? JSON.parse(stored) : [];
      } catch { return []; }
    },
  });
}

export async function addToWardrobe(item: WardrobeItem): Promise<ApiResponse<WardrobeItem>> {
  return apiRequest<WardrobeItem>('/api/wardrobe', {
    method: 'POST',
    body: item,
    mockHandler: () => item,
  });
}

export async function removeFromWardrobe(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return apiRequest<{ deleted: boolean }>(`/api/wardrobe/${id}`, {
    method: 'DELETE',
    mockHandler: () => ({ deleted: true }),
  });
}

export async function getWardrobeAnalysis(): Promise<ApiResponse<WardrobeAnalysis>> {
  return apiRequest<WardrobeAnalysis>('/api/wardrobe/analysis', {
    mockHandler: () => mockWardrobeAnalysis,
  });
}

export async function getFitConfidence(productId: string): Promise<ApiResponse<FitConfidence>> {
  return apiRequest<FitConfidence>(`/api/wardrobe/fit-confidence/${productId}`, {
    mockHandler: () => mockFitConfidence,
  });
}

export async function getBodyTwinData(): Promise<ApiResponse<DigitalBodyTwin>> {
  return apiRequest<DigitalBodyTwin>('/api/wardrobe/body-twin', {
    mockHandler: () => mockBodyTwin,
  });
}

export async function getOutfitSuggestions(product: Product): Promise<ApiResponse<CompleteOutfit[]>> {
  return apiRequest<CompleteOutfit[]>(`/api/wardrobe/outfit-suggestions/${product.id}`, {
    mockHandler: () => getMockOutfits(product),
  });
}

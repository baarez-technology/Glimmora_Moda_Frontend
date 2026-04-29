/**
 * Wardrobe Service
 * Endpoints: /api/wardrobe/*, /api/v1/customer/wardrobe/*
 */

import { apiRequest } from './api-client';
import type { ApiResponse } from './api-client';
import type { WardrobeItem, Product } from '@/types';
import type { WardrobeAnalysis, FitConfidence, DigitalBodyTwin, CompleteOutfit } from '@/types/intelligence';
import { mockFitConfidence, mockBodyTwin, mockWardrobeAnalysis, getMockOutfits } from '@/data/wardrobe';

// ─── Auth helper (same as calendar service) ─────────────────────────────────

function getUserToken(): string | null {
  return typeof window !== 'undefined'
    ? localStorage.getItem('moda-user-token')
    : null;
}

function getUserAuthHeaders(): Record<string, string> {
  const token = getUserToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Wardrobe Gap Analysis Types ────────────────────────────────────────────

export interface GapSuggestion {
  fabric: string;
  pattern: string;
  color: string;
  product_category: string;
  title: string;
}

export interface GapMatchedProduct {
  product_id: string;
  product_name: string;
  brand_id: string;
  brand_name: string;
  sku: string;
  status: string;
  price: number;
  sizes: string[];
  collection_name: string;
  product_category: string;
  tagline: string;
  product_description: string;
  product_image: string;
  occasions: string[];
  aesthetics: string[];
  color: string;
  pattern: string;
  fabrics: string;
  image_urls?: string[];
  is_low_stock: boolean;
  is_active: boolean;
}

export interface GapAnalysisItem {
  suggestion: GapSuggestion;
  matched_product: GapMatchedProduct | null;
  product_match_score: number;
}

export interface WardrobeGapAnalysisResponse {
  customer_id: string;
  wardrobe_items_count: number;
  gap_suggestions_count: number;
  total_recommendations: number;
  style_notes: string;
  message: string;
  gap_analysis: GapAnalysisItem[];
  analyzed_at?: string;
  cached?: boolean;
}

/** GET /api/v1/customer/wardrobe/silent-cart — read cached result (no computation) */
export async function getSilentCart(): Promise<WardrobeGapAnalysisResponse> {
  const res = await fetch('/api/v1/customer/wardrobe/silent-cart', {
    method: 'GET',
    headers: getUserAuthHeaders(),
  });

  if (res.status === 404) {
    throw new NotFoundError('No cached analysis');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to load silent cart' }));
    throw new Error(err.detail || `Silent cart failed (${res.status})`);
  }

  return res.json();
}

/** POST /api/v1/customer/wardrobe/gap-analysis */
export async function getWardrobeGapAnalysis(regenerate = false): Promise<WardrobeGapAnalysisResponse> {
  const url = regenerate
    ? '/api/v1/customer/wardrobe/gap-analysis?regenerate=true'
    : '/api/v1/customer/wardrobe/gap-analysis';

  const res = await fetch(url, {
    method: 'POST',
    headers: getUserAuthHeaders(),
  });

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ detail: 'Failed to get gap analysis' }));
    throw new Error(err.detail || `Gap analysis failed (${res.status})`);
  }

  return res.json();
}

/** POST /api/v1/wardrobe/gap/dismiss — dismiss a single gap so it stops appearing */
export async function dismissWardrobeGap(gapId: string): Promise<void> {
  const res = await fetch('/api/v1/wardrobe/gap/dismiss', {
    method: 'POST',
    headers: getUserAuthHeaders(),
    body: JSON.stringify({ gapId }),
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({ detail: 'Failed to dismiss gap' }));
    throw new Error(err.detail || `Dismiss gap failed (${res.status})`);
  }
}

/** Custom error for 404 (no cached analysis) */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

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

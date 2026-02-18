/**
 * Brand Service (Consumer-facing)
 * Endpoints: /api/brands/*
 */

import { apiRequest } from './api-client';
import type { ApiResponse } from './api-client';
import type { Brand, BrandStory } from '@/types';
import {
  brands,
  getBrandBySlug as mockGetBySlug,
  getBrandById as mockGetById
} from '@/data/brands';
import {
  brandStories,
  getStoryBySlug as mockGetStoryBySlug,
  getStoriesByBrand as mockGetStoriesByBrand,
  getFeaturedStories as mockGetFeaturedStories
} from '@/data/stories';

export async function getAllBrands(): Promise<ApiResponse<Brand[]>> {
  return apiRequest<Brand[]>('/api/brands', {
    mockHandler: () => brands,
  });
}

export async function getBrandBySlug(slug: string): Promise<ApiResponse<Brand | null>> {
  return apiRequest<Brand | null>(`/api/brands/by-slug/${slug}`, {
    mockHandler: () => mockGetBySlug(slug) ?? null,
  });
}

export async function getBrandById(id: string): Promise<ApiResponse<Brand | null>> {
  return apiRequest<Brand | null>(`/api/brands/${id}`, {
    mockHandler: () => mockGetById(id) ?? null,
  });
}

export async function getAllStories(): Promise<ApiResponse<BrandStory[]>> {
  return apiRequest<BrandStory[]>('/api/stories', {
    mockHandler: () => brandStories,
  });
}

export async function getStoryBySlug(slug: string): Promise<ApiResponse<BrandStory | null>> {
  return apiRequest<BrandStory | null>(`/api/stories/by-slug/${slug}`, {
    mockHandler: () => mockGetStoryBySlug(slug) ?? null,
  });
}

export async function getStoriesByBrand(brandId: string): Promise<ApiResponse<BrandStory[]>> {
  return apiRequest<BrandStory[]>(`/api/stories/by-brand/${brandId}`, {
    mockHandler: () => mockGetStoriesByBrand(brandId),
  });
}

export async function getFeaturedStories(): Promise<ApiResponse<BrandStory[]>> {
  return apiRequest<BrandStory[]>('/api/stories/featured', {
    mockHandler: () => mockGetFeaturedStories(),
  });
}

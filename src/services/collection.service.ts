/**
 * Collection Service (Consumer-facing)
 * Endpoints: /api/collections/*
 */

import { apiRequest, generateMockId } from './api-client';
import type { ApiResponse } from './api-client';
import type { Collection } from '@/types';
import {
  collections,
  getCollectionBySlug as mockGetBySlug,
  getCollectionById as mockGetById,
  getCollectionsByBrand as mockGetByBrand
} from '@/data/collections';

export async function getAllCollections(): Promise<ApiResponse<Collection[]>> {
  return apiRequest<Collection[]>('/api/collections', {
    mockHandler: () => collections,
  });
}

export async function getCollectionBySlug(slug: string): Promise<ApiResponse<Collection | null>> {
  return apiRequest<Collection | null>(`/api/collections/by-slug/${slug}`, {
    mockHandler: () => mockGetBySlug(slug) ?? null,
  });
}

export async function getCollectionById(id: string): Promise<ApiResponse<Collection | null>> {
  return apiRequest<Collection | null>(`/api/collections/${id}`, {
    mockHandler: () => mockGetById(id) ?? null,
  });
}

export async function getCollectionsByBrand(brandId: string): Promise<ApiResponse<Collection[]>> {
  return apiRequest<Collection[]>(`/api/collections/by-brand/${brandId}`, {
    mockHandler: () => mockGetByBrand(brandId),
  });
}

export async function createCollection(
  collection: Omit<Collection, 'id'>
): Promise<ApiResponse<Collection>> {
  return apiRequest<Collection>('/api/collections', {
    method: 'POST',
    body: collection,
    mockHandler: () => ({ ...collection, id: generateMockId('collection') } as Collection),
  });
}

export async function updateCollection(
  id: string,
  updates: Partial<Collection>
): Promise<ApiResponse<Collection>> {
  return apiRequest<Collection>(`/api/collections/${id}`, {
    method: 'PATCH',
    body: updates,
    mockHandler: () => {
      const existing = mockGetById(id);
      if (!existing) throw new Error(`Collection ${id} not found`);
      return { ...existing, ...updates };
    },
  });
}

export async function deleteCollection(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return apiRequest<{ deleted: boolean }>(`/api/collections/${id}`, {
    method: 'DELETE',
    mockHandler: () => ({ deleted: true }),
  });
}

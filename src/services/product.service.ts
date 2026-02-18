/**
 * Product Service
 * Endpoints: /api/products/*
 */

import { apiRequest, apiPaginatedRequest, ApiError, generateMockId } from './api-client';
import type { ApiResponse, PaginationParams, FilterParams, PaginatedResponse } from './api-client';
import type { Product, ProductCategory } from '@/types';
import type { VisualSearchResult } from '@/types';
import {
  products,
  getProductBySlug as mockGetBySlug,
  getProductById as mockGetById,
  getProductsByBrand as mockGetByBrand,
  getProductsByCategory as mockGetByCategory,
  getFeaturedProducts as mockGetFeatured
} from '@/data/products';
import { performVisualSearch as mockVisualSearch } from '@/data/discovery';

export interface ProductFilters extends FilterParams {
  category?: ProductCategory;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: string;
  tags?: string[];
}

export async function getProducts(
  pagination?: PaginationParams,
  filters?: ProductFilters
): Promise<PaginatedResponse<Product>> {
  return apiPaginatedRequest<Product>('/api/products', {
    pagination,
    filters,
    mockHandler: (_pagination, _filters) => {
      let filtered = [...products];
      if (_filters) {
        const f = _filters as ProductFilters;
        if (f.category) filtered = filtered.filter(p => p.category === f.category);
        if (f.brandId) filtered = filtered.filter(p => p.brandId === f.brandId);
        if (f.minPrice !== undefined) filtered = filtered.filter(p => p.price >= (f.minPrice as number));
        if (f.maxPrice !== undefined) filtered = filtered.filter(p => p.price <= (f.maxPrice as number));
        if (f.search) {
          const q = f.search.toLowerCase();
          filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.brandName.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.tags.some(t => t.toLowerCase().includes(q))
          );
        }
      }
      return filtered;
    },
  });
}

export async function getAllProducts(): Promise<ApiResponse<Product[]>> {
  return apiRequest<Product[]>('/api/products/all', {
    mockHandler: () => products,
  });
}

export async function getProductBySlug(slug: string): Promise<ApiResponse<Product | null>> {
  return apiRequest<Product | null>(`/api/products/by-slug/${slug}`, {
    mockHandler: () => mockGetBySlug(slug) ?? null,
  });
}

export async function getProductById(id: string): Promise<ApiResponse<Product | null>> {
  return apiRequest<Product | null>(`/api/products/${id}`, {
    mockHandler: () => mockGetById(id) ?? null,
  });
}

export async function getProductsByBrand(brandId: string): Promise<ApiResponse<Product[]>> {
  return apiRequest<Product[]>(`/api/products/by-brand/${brandId}`, {
    mockHandler: () => mockGetByBrand(brandId),
  });
}

export async function getProductsByCategory(category: ProductCategory): Promise<ApiResponse<Product[]>> {
  return apiRequest<Product[]>(`/api/products/by-category/${category}`, {
    mockHandler: () => mockGetByCategory(category),
  });
}

export async function getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
  return apiRequest<Product[]>('/api/products/featured', {
    mockHandler: () => mockGetFeatured(),
  });
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<ApiResponse<Product>> {
  return apiRequest<Product>('/api/products', {
    method: 'POST',
    body: product,
    mockHandler: () => ({ ...product, id: generateMockId('product') } as Product),
  });
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<ApiResponse<Product>> {
  return apiRequest<Product>(`/api/products/${id}`, {
    method: 'PATCH',
    body: updates,
    mockHandler: () => {
      const existing = mockGetById(id);
      if (!existing) throw new ApiError('NOT_FOUND', `Product ${id} not found`, 404);
      return { ...existing, ...updates };
    },
  });
}

export async function deleteProduct(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return apiRequest<{ deleted: boolean }>(`/api/products/${id}`, {
    method: 'DELETE',
    mockHandler: () => ({ deleted: true }),
  });
}

// ============================================
// Visual Search
// ============================================

export async function performVisualSearch(
  detectedCategory?: string,
  detectedStyle?: string[]
): Promise<ApiResponse<VisualSearchResult[]>> {
  return apiRequest<VisualSearchResult[]>('/api/products/visual-search', {
    method: 'POST',
    body: { detectedCategory, detectedStyle },
    mockHandler: () => mockVisualSearch(detectedCategory, detectedStyle),
  });
}

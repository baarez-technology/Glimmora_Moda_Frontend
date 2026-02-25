/**
 * Recommendation Service (Real Backend API)
 *
 * Calls the real recommendation endpoints:
 * - GET  /api/v1/brands/recommendations
 * - POST /api/v1/products/recommendations
 *
 * Uses relative URLs so requests go through Next.js rewrite proxy
 * (next.config.js proxies /api/v1/* → backend, avoiding CORS issues).
 * Throws on failure so pages can show error states.
 */

import type { Brand, Product } from '@/types';
import type {
  ProductRecommendationRequest,
  ProductRecommendationResponse,
  RecommendedProduct,
  RecommendedBrand,
} from '@/types/recommendation';

function getToken(): string | null {
  try {
    return localStorage.getItem('moda-user-token');
  } catch {
    return null;
  }
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ============================================
// Response Mappers
// ============================================

/** Map API brand → frontend Brand type */
function mapToBrand(raw: RecommendedBrand): Brand {
  const slug = raw.brand_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return {
    id: raw.brand_id,
    name: raw.brand_name,
    slug,
    tagline: '',
    description: '',
    heroImage: raw.profile_picture,
    logoUrl: raw.profile_picture,
    heritage: { founded: 0, founder: '', origin: '', story: '' },
    collections: [],
    stories: [],
  };
}

/** Map API product → frontend Product type */
function mapToProduct(raw: RecommendedProduct): Product {
  const slug = raw.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return {
    id: raw.product_id,
    brandId: raw.brand_id,
    brandName: raw.brand_name,
    name: raw.product_name,
    slug,
    tagline: '',
    description: '',
    narrative: '',
    price: raw.price,
    currency: 'INR',
    images: raw.image_url
      ? [{ id: '1', url: raw.image_url, alt: raw.product_name, type: 'hero' as const }]
      : [],
    variants: [],
    materials: [],
    craftsmanship: [],
    ivEnabled: false,
    availability: {
      status: raw.is_low_stock ? 'limited' : 'available',
      regions: [],
    },
    collection: raw.collection_name,
    category: (raw.product_category as Product['category']) || 'clothing',
    tags: [...raw.occasions, ...raw.aesthetics],
    visibility: 'public',
    experienceMode: 'standard',
    pricingVisibility: 'visible',
    commerceAction: 'add_to_considerations',
    commerceEligible: true,
    craftTags: [],
  };
}

// ============================================
// Brand Recommendations
// ============================================

/**
 * GET /api/v1/brands/recommendations
 *
 * Returns brands recommended for the current customer based on their
 * occasions and aesthetics preferences. Throws on failure.
 */
export async function getRecommendedBrands(): Promise<Brand[]> {
  const res = await fetch(`/api/v1/brands/recommendations`, {
    method: 'GET',
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Brand recommendations failed: ${res.status}`);
  }

  const data: RecommendedBrand[] = await res.json();
  return data.map(mapToBrand);
}

// ============================================
// Product Recommendations
// ============================================

/**
 * POST /api/v1/products/recommendations
 *
 * Runs hybrid BM25 + kNN cosine search. All request fields are optional.
 * Throws on failure.
 */
export async function getRecommendedProducts(
  params?: ProductRecommendationRequest
): Promise<Product[]> {
  const body: ProductRecommendationRequest = {
    page_number: 1,
    page_size: 20,
    ...params,
  };

  const res = await fetch(`/api/v1/products/recommendations`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Product recommendations failed: ${res.status}`);
  }

  const data: ProductRecommendationResponse = await res.json();
  return data.products_data.map(mapToProduct);
}

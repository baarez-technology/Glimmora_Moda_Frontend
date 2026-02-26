/**
 * Recommendation Service (Real Backend API)
 *
 * Calls the real consumer endpoints:
 * - GET  /api/v1/brands/recommendations
 * - POST /api/v1/products/recommendations
 * - GET  /api/v1/stories/search
 * - GET  /api/v1/stories/{story_id}
 * - GET  /api/v1/customer/collections
 * - GET  /api/v1/customer/products/{product_id}
 * - GET  /api/v1/customer/wardrobe
 * - POST /api/v1/customer/wardrobe
 *
 * Uses relative URLs so requests go through Next.js rewrite proxy
 * (next.config.js proxies /api/v1/* → backend, avoiding CORS issues).
 * Throws on failure so pages can show error states.
 */

import type { Brand, BrandStory, StorySection, Product, Collection } from '@/types';
import type {
  ProductRecommendationRequest,
  ProductRecommendationResponse,
  RecommendedProduct,
  RecommendedBrand,
} from '@/types/recommendation';
import { cachedFetch, invalidateCache, fetchWithTimeout } from '@/lib/api-cache';

// Cache TTLs
const BRANDS_TTL = 5 * 60 * 1000;       // 5 min — brands rarely change
const PRODUCTS_TTL = 2 * 60 * 1000;     // 2 min — products may update more often
const COLLECTIONS_TTL = 5 * 60 * 1000;  // 5 min
const STORIES_TTL = 3 * 60 * 1000;      // 3 min
const PRODUCT_DETAIL_TTL = 2 * 60 * 1000; // 2 min

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
  return cachedFetch('brands', async () => {
    const res = await fetchWithTimeout(`/api/v1/brands/recommendations`, {
      method: 'GET',
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Brand recommendations failed: ${res.status}`);
    }

    const data: RecommendedBrand[] = await res.json();
    return data.map(mapToBrand);
  }, BRANDS_TTL);
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

  // Cache key includes params so different queries get separate caches
  const cacheKey = `products:${JSON.stringify(body)}`;

  return cachedFetch(cacheKey, async () => {
    const res = await fetchWithTimeout(`/api/v1/products/recommendations`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Product recommendations failed: ${res.status}`);
    }

    const data: ProductRecommendationResponse = await res.json();
    return data.products_data.map(mapToProduct);
  }, PRODUCTS_TTL);
}

// ============================================
// Story Types (API response shapes)
// ============================================

/** Story from /api/v1/stories/search (list view — no content blocks) */
interface ApiStorySearchResult {
  story_id: string;
  brand_id: string;
  title: string;
  story_type: string;
  story_type_subtype: string;
  excerpt: string;
  image_url: string;
  product_list: string[];
  status: string;
  sections: number;
  read_time: number;
  is_active: boolean;
  created_at_ms: number;
  updated_at_ms: number;
}

/** Story from /api/v1/stories/{id} (detail view — includes content blocks) */
interface ApiStoryDetail extends Omit<ApiStorySearchResult, 'created_at_ms' | 'updated_at_ms'> {
  content: { id: string; type: string; content: string }[];
  created_at: string;
  updated_at: string;
}

// ============================================
// Story Mappers
// ============================================

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** Map search-result story → frontend BrandStory (no content) */
function mapSearchStory(raw: ApiStorySearchResult): BrandStory {
  return {
    id: raw.story_id,
    brandId: raw.brand_id,
    title: raw.title,
    slug: generateSlug(raw.title),
    type: (raw.story_type as BrandStory['type']) || 'heritage',
    excerpt: raw.excerpt,
    content: [],
    heroImage: raw.image_url,
    publishedAt: new Date(raw.created_at_ms).toISOString(),
    readTime: raw.read_time,
    relatedProducts: raw.product_list,
  };
}

/** Map detail story → frontend BrandStory (with content) */
function mapDetailStory(raw: ApiStoryDetail): BrandStory {
  return {
    id: raw.story_id,
    brandId: raw.brand_id,
    title: raw.title,
    slug: generateSlug(raw.title),
    type: (raw.story_type as BrandStory['type']) || 'heritage',
    excerpt: raw.excerpt,
    content: raw.content.map((s): StorySection => ({
      type: s.type as StorySection['type'],
      content: s.content,
    })),
    heroImage: raw.image_url,
    publishedAt: raw.created_at,
    readTime: raw.read_time,
    relatedProducts: raw.product_list,
  };
}

// ============================================
// Story Search
// ============================================

export interface StorySearchParams {
  limit?: number;
  brand_id?: string;
  story_id?: string;
}

/**
 * GET /api/v1/stories/search
 *
 * - No params → all stories (latest first)
 * - brand_id → stories for that brand
 * - story_id → semantically similar stories (kNN)
 */
export async function searchStories(params?: StorySearchParams): Promise<BrandStory[]> {
  const query = new URLSearchParams();
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.brand_id) query.set('brand_id', params.brand_id);
  if (params?.story_id) query.set('story_id', params.story_id);

  const qs = query.toString();
  const cacheKey = `stories:${qs}`;

  return cachedFetch(cacheKey, async () => {
    const res = await fetchWithTimeout(`/api/v1/stories/search${qs ? `?${qs}` : ''}`, {
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Stories search failed: ${res.status}`);
    }

    const data: ApiStorySearchResult[] = await res.json();
    return data.map(mapSearchStory);
  }, STORIES_TTL);
}

/**
 * GET /api/v1/stories/{story_id}
 *
 * Returns full story detail including content blocks.
 */
export async function getStoryById(storyId: string): Promise<BrandStory> {
  const res = await fetchWithTimeout(`/api/v1/stories/${storyId}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Story fetch failed: ${res.status}`);
  }

  const data: ApiStoryDetail = await res.json();
  return mapDetailStory(data);
}

// ============================================
// Collection Types (API response shape)
// ============================================

interface ApiCollection {
  collection_id: string;
  brand_id: string;
  collection_name: string;
  season: string;
  year: string;
  collection_description: string;
  collection_image: string;
  total_products_count: number;
}

function mapToCollection(raw: ApiCollection): Collection {
  return {
    id: raw.collection_id,
    brandId: raw.brand_id,
    name: raw.collection_name,
    slug: generateSlug(raw.collection_name),
    season: raw.season,
    year: parseInt(raw.year, 10) || 0,
    description: raw.collection_description,
    heroImage: raw.collection_image,
    products: [],
    productCount: raw.total_products_count,
  };
}

// ============================================
// Collections
// ============================================

/**
 * GET /api/v1/customer/collections
 *
 * Returns all brand collections (latest first).
 * Pass brand_id to filter for a specific brand.
 */
export async function getCollections(brandId?: string): Promise<Collection[]> {
  const query = new URLSearchParams();
  if (brandId) query.set('brand_id', brandId);

  const qs = query.toString();
  const cacheKey = `collections:${qs}`;

  return cachedFetch(cacheKey, async () => {
    const res = await fetchWithTimeout(`/api/v1/customer/collections${qs ? `?${qs}` : ''}`, {
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Collections fetch failed: ${res.status}`);
    }

    const data: ApiCollection[] = await res.json();
    return data.map(mapToCollection);
  }, COLLECTIONS_TTL);
}

// ============================================
// Product Detail Types (API response shape)
// ============================================

interface ApiProductDetail {
  product_id: string;
  brand_id: string;
  product_name: string;
  sku: string;
  price: number;
  collection_name: string;
  status: string;
  tagline: string;
  product_description: string;
  product_images: string[];
  product_image: string;
  regional_stocks: {
    stock_id: string;
    city: string;
    country: string;
    units: number;
    threshold: number;
    is_low_stock: boolean;
  }[];
  performance_metrics: {
    views: number;
    add_to_cart: number;
    purchases: number;
    conversion_rate: number;
  };
  ai_metadata: {
    product_category: string;
    color: string;
    pattern: string;
    fabrics: string;
  };
  occasions: string[];
  aesthetics: string[];
  is_low_stock: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function mapProductDetail(raw: ApiProductDetail, brandName?: string): Product {
  const slug = raw.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // Build variants from backend data with fallback defaults
  const variants: Product['variants'] = [];

  // Color variant from ai_metadata
  if (raw.ai_metadata?.color) {
    const colorName = raw.ai_metadata.color;
    const colorMap: Record<string, string> = {
      black: '#000000', white: '#FFFFFF', red: '#C41E3A', blue: '#1E3A5F',
      navy: '#1B2A4A', brown: '#6B4226', beige: '#C8B89A', cream: '#FFFDD0',
      grey: '#808080', gray: '#808080', green: '#2D5A27', pink: '#E8A0BF',
      gold: '#C9A962', silver: '#C0C0C0', tan: '#D2B48C', ivory: '#FFFFF0',
      burgundy: '#800020', olive: '#556B2F', camel: '#C19A6B', charcoal: '#36454F',
    };
    const colorValue = colorMap[colorName.toLowerCase()] || '#8B8680';
    variants.push({
      id: `color-${colorName.toLowerCase()}`,
      type: 'color',
      name: colorName.charAt(0).toUpperCase() + colorName.slice(1),
      value: colorValue,
      available: true,
    });
  }

  // Default size variants (backend doesn't provide sizes yet)
  const defaultSizes = ['XS', 'S', 'M', 'L', 'XL'];
  defaultSizes.forEach((size) => {
    variants.push({
      id: `size-${size.toLowerCase()}`,
      type: 'size',
      name: size,
      value: size,
      available: true,
    });
  });

  return {
    id: raw.product_id,
    brandId: raw.brand_id,
    brandName: brandName || '',
    name: raw.product_name,
    slug,
    tagline: raw.tagline,
    description: raw.product_description,
    narrative: '',
    price: raw.price,
    currency: 'INR',
    images: raw.product_images.map((url, i) => ({
      id: String(i + 1),
      url,
      alt: raw.product_name,
      type: i === 0 ? 'hero' as const : 'detail' as const,
    })),
    variants,
    materials: raw.ai_metadata?.fabrics
      ? [{ name: raw.ai_metadata.fabrics, composition: '100%', origin: '' }]
      : [],
    craftsmanship: [],
    ivEnabled: false,
    availability: {
      status: raw.is_low_stock ? 'limited' : 'available',
      regions: raw.regional_stocks.map(s => ({
        region: s.country,
        city: s.city,
        available: s.units > 0,
        confidence: 1,
        deliveryDays: 5,
      })),
    },
    collection: raw.collection_name,
    category: (raw.ai_metadata?.product_category as Product['category']) || 'clothing',
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
// Product Detail
// ============================================

/**
 * GET /api/v1/customer/products/{product_id}
 *
 * Returns full product detail from MongoDB.
 * Optionally pass brandName to include it in the mapped Product.
 */
export async function getProductDetail(productId: string, brandName?: string): Promise<Product> {
  return cachedFetch(`product-detail:${productId}`, async () => {
    const res = await fetchWithTimeout(`/api/v1/customer/products/${productId}`, {
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Product detail fetch failed: ${res.status}`);
    }

    const data: ApiProductDetail = await res.json();
    return mapProductDetail(data, brandName);
  }, PRODUCT_DETAIL_TTL);
}

/** Invalidate wardrobe cache after mutations (add/remove) */
export function invalidateWardrobeCache() {
  invalidateCache('wardrobe');
}

// ============================================
// Wardrobe Types (API response shape)
// ============================================

export interface ApiWardrobeItem {
  wardrobe_id: string;
  customer_id: string;
  product_id: string;
  color: string;
  size: string;
  price: number;
  image_urls: string[];
  product_name: string;
  how_many_buyed_count: number;
  created_at: string;
}

export interface AddToWardrobeRequest {
  product_id: string;
  color: string;
  size: string;
  how_many_buyed_count: number;
}

// ============================================
// Wardrobe
// ============================================

/**
 * GET /api/v1/customer/wardrobe
 *
 * Returns all wardrobe items for the authenticated customer.
 */
export async function getWardrobe(): Promise<ApiWardrobeItem[]> {
  const res = await fetchWithTimeout(`/api/v1/customer/wardrobe`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Wardrobe fetch failed: ${res.status}`);
  }

  return res.json();
}

/**
 * POST /api/v1/customer/wardrobe
 *
 * Adds a product to the customer's wardrobe.
 */
export async function addToWardrobe(params: AddToWardrobeRequest): Promise<ApiWardrobeItem> {
  const res = await fetchWithTimeout(`/api/v1/customer/wardrobe`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`Add to wardrobe failed: ${res.status}`);
  }

  return res.json();
}

/**
 * DELETE /api/v1/customer/wardrobe/{wardrobe_id}
 *
 * Removes a single item from the customer's wardrobe.
 */
export async function removeFromWardrobe(wardrobeId: string): Promise<void> {
  const res = await fetch(`/api/v1/customer/wardrobe/${wardrobeId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Remove from wardrobe failed: ${res.status}`);
  }
}

/**
 * DELETE /api/v1/customer/wardrobe/all
 *
 * Removes all items from the customer's wardrobe.
 */
export async function clearAllWardrobe(): Promise<void> {
  const res = await fetch(`/api/v1/customer/wardrobe/all`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Clear wardrobe failed: ${res.status}`);
  }
}

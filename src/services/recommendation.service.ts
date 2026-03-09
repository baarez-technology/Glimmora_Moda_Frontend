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
import { cachedFetch, invalidateCache, invalidateCacheByPrefix, fetchWithTimeout } from '@/lib/api-cache';

// Cache TTLs
const BRANDS_TTL = 5 * 60 * 1000;       // 5 min — brands rarely change
const PRODUCTS_TTL = 2 * 60 * 1000;     // 2 min — products may update more often
const COLLECTIONS_TTL = 5 * 60 * 1000;  // 5 min
const STORIES_TTL = 3 * 60 * 1000;      // 3 min
const PRODUCT_DETAIL_TTL = 2 * 60 * 1000; // 2 min

const PLACEHOLDER_IMAGE = 'https://placehold.co/800x1000/F5F0EB/8B8680?text=No+Image';

/**
 * Clear all recommendation caches (products, brands, collections, stories).
 * Call this after the user updates their style preferences so the next
 * page load fetches fresh personalised results from the backend.
 */
export function invalidateRecommendationsCache() {
  invalidateCacheByPrefix('products');
  invalidateCache('brands');
  invalidateCacheByPrefix('collections');
  invalidateCacheByPrefix('stories');
}

// In-memory map: productId → image URL from recommendations.
// Populated when recommendation lists load, used as fallback for product detail.
const productImageCache = new Map<string, string>();

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
  // Use brand_logo if available, otherwise generate a placeholder
  const brandImage = raw.brand_logo || `https://placehold.co/800x600/1A1A1A/C9A962?text=${encodeURIComponent(raw.brand_name)}`;
  return {
    id: raw.brand_id,
    name: raw.brand_name,
    slug,
    tagline: '',
    description: '',
    heroImage: brandImage,
    logoUrl: brandImage,
    heritage: { founded: 0, founder: '', origin: '', story: '' },
    collections: [],
    stories: [],
  };
}

/** Map API product → frontend Product type */
function mapToProduct(raw: RecommendedProduct): Product {
  // Flexible image extraction: try image_url, then color_based_images_mapping, then fallback fields
  const rawAny = raw as unknown as Record<string, unknown>;
  const colorImages = Array.isArray(rawAny['color_based_images_mapping'])
    ? (rawAny['color_based_images_mapping'] as { images?: string[] }[]).flatMap(cm => cm.images || []).filter(Boolean)
    : [];
  const imageUrl =
    raw.image_url ||
    (rawAny['product_image'] as string) ||
    (colorImages.length > 0 ? colorImages[0] : '') ||
    (Array.isArray(rawAny['product_images']) && (rawAny['product_images'] as string[])[0]) ||
    '';

  // Cache the image URL so product detail page can use it as fallback
  if (imageUrl) {
    productImageCache.set(raw.product_id, imageUrl);
  }
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
    images: imageUrl
      ? [{ id: '1', url: imageUrl, alt: raw.product_name, type: 'hero' as const }]
      : [{ id: '1', url: PLACEHOLDER_IMAGE, alt: raw.product_name, type: 'hero' as const }],
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
    tags: [...(Array.isArray(raw.occasions) ? raw.occasions : []), ...(Array.isArray(raw.aesthetics) ? raw.aesthetics : [])],
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
  try {
    return await cachedFetch('brands', async () => {
      const res = await fetchWithTimeout(`/api/v1/brands/recommendations`, {
        method: 'GET',
        headers: authHeaders(),
      });

      if (!res.ok) {
        console.log(`[brands] API error: ${res.status}`);
        throw new Error(`Brands API ${res.status}`);
      }

      const data: RecommendedBrand[] = await res.json();
      console.log(`[brands] Loaded ${data.length} brands`);
      return data.map(mapToBrand);
    }, BRANDS_TTL);
  } catch (err) {
    console.log('[brands] Error (will not cache):', err);
    return [];
  }
}

// ============================================
// Product Recommendations
// ============================================

/** Paginated result with metadata */
export interface PaginatedProducts {
  products: Product[];
  totalMatched: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}

/**
 * POST /api/v1/products/recommendations
 *
 * Runs hybrid BM25 + kNN cosine search. All request fields are optional.
 * Throws on failure.
 */
export async function getRecommendedProducts(
  params?: ProductRecommendationRequest
): Promise<Product[]> {
  const result = await getRecommendedProductsPaginated(params);
  return result.products;
}

/**
 * POST /api/v1/products/recommendations (with pagination metadata)
 *
 * Returns products along with pagination info (total count, total pages, etc.)
 */
export async function getRecommendedProductsPaginated(
  params?: ProductRecommendationRequest
): Promise<PaginatedProducts> {
  const body: ProductRecommendationRequest = {
    page_number: 1,
    page_size: 20,
    ...params,
  };

  // Cache key includes params so different queries get separate caches
  const cacheKey = `products:${JSON.stringify(body)}`;

  console.log('[products] Request body:', body);

  return cachedFetch(cacheKey, async () => {
    const res = await fetchWithTimeout(`/api/v1/products/recommendations`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error(`[products] API error ${res.status}:`, errBody);
      throw new Error(`Products API error (${res.status})`);
    }

    const data: ProductRecommendationResponse = await res.json();
    if (!data.products_data) {
      console.warn('[products] API returned no products_data field. Response keys:', Object.keys(data));
      return {
        products: [],
        totalMatched: 0,
        totalPages: 0,
        pageNumber: body.page_number || 1,
        pageSize: body.page_size || 20,
      };
    }
    if (data.products_data.length > 0) {
      const sample = data.products_data[0] as unknown as Record<string, unknown>;
      console.log('[products] Raw API sample:', {
        product_id: sample.product_id,
        product_name: sample.product_name,
        image_url: sample.image_url,
        product_image: sample.product_image,
        product_images: sample.product_images,
        all_keys: Object.keys(sample),
      });
      const withImages = data.products_data.filter(p => !!p.image_url).length;
      console.log(`[products] ${withImages}/${data.products_data.length} have image_url`);
    } else {
      console.warn('[products] API returned 0 products for request:', body);
    }
    return {
      products: data.products_data.map(mapToProduct),
      totalMatched: data.total_matched || 0,
      totalPages: data.total_pages || 0,
      pageNumber: data.page_number || body.page_number || 1,
      pageSize: data.page_size || body.page_size || 20,
    };
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

  try {
    return await cachedFetch(cacheKey, async () => {
      const res = await fetchWithTimeout(`/api/v1/stories/search${qs ? `?${qs}` : ''}`, {
        headers: authHeaders(),
      });

      if (!res.ok) {
        console.log(`[stories] API error: ${res.status}`);
        return [];
      }

      const data: ApiStorySearchResult[] = await res.json();
      return data.map(mapSearchStory);
    }, STORIES_TTL);
  } catch (err) {
    console.log('[stories] Network error:', err);
    return [];
  }
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

  try {
    return await cachedFetch(cacheKey, async () => {
      const res = await fetchWithTimeout(`/api/v1/customer/collections${qs ? `?${qs}` : ''}`, {
        headers: authHeaders(),
      });

      if (!res.ok) {
        console.log(`[collections] API error: ${res.status}`);
        return [];
      }

      const data: ApiCollection[] = await res.json();
      return data.map(mapToCollection);
    }, COLLECTIONS_TTL);
  } catch (err) {
    console.log('[collections] Network error:', err);
    return [];
  }
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
  offer_price?: number | null;
  discount_percentage?: number | null;
  collection_name: string;
  status: string;
  tagline: string;
  product_description: string;
  product_images?: string[];
  product_image: string | null;
  product_category?: string;
  sizes?: string[];
  color_based_images_mapping?: { color: string; hex?: string | null; images?: string[] }[];
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
  // New API shape: ai_data with nested fields
  ai_data?: {
    aesthetics?: string[];
    occasions?: string[];
    pattern?: string;
    fabrics?: string;
    climate_profile?: Record<string, unknown>;
  };
  // Legacy shape: ai_metadata + top-level arrays
  ai_metadata?: {
    product_category?: string;
    color?: string;
    pattern?: string;
    fabrics?: string;
  } | null;
  occasions: string[];
  aesthetics: string[];
  is_low_stock: boolean;
  is_active: boolean;
  created_at: string | { $date: string };
  updated_at: string | { $date: string };
}

function mapProductDetail(raw: ApiProductDetail, brandName?: string): Product {
  const slug = raw.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // Normalize: support both ai_data (new) and ai_metadata (legacy) shapes
  const aiData = raw.ai_data;
  const aiMeta = raw.ai_metadata;
  const fabrics = aiData?.fabrics || aiMeta?.fabrics || '';
  const productCategory = raw.product_category || aiMeta?.product_category || '';
  const occasions = aiData?.occasions || raw.occasions || [];
  const aesthetics = aiData?.aesthetics || raw.aesthetics || [];

  // Build variants from backend data
  const variants: Product['variants'] = [];

  // Name→hex lookup for color swatches
  const colorNameToHex: Record<string, string> = {
    black: '#000000', white: '#FFFFFF', red: '#C41E3A', blue: '#1E3A5F',
    navy: '#1B2A4A', brown: '#6B4226', beige: '#C8B89A', cream: '#FFFDD0',
    grey: '#808080', gray: '#808080', green: '#2D5A27', pink: '#E8A0BF',
    gold: '#C9A962', silver: '#C0C0C0', tan: '#D2B48C', ivory: '#FFFFF0',
    burgundy: '#800020', olive: '#556B2F', camel: '#C19A6B', charcoal: '#36454F',
    orange: '#E07020', yellow: '#D4A017', purple: '#6B3FA0', maroon: '#800000',
    coral: '#FF6F61', teal: '#008080', indigo: '#3F51B5', khaki: '#C3B091',
    peach: '#FFDAB9', lavender: '#B57EDC', rose: '#C77986', mint: '#98D4BB',
    taupe: '#8B7E74', nude: '#E3BC9A', mustard: '#C89B3C', rust: '#B7410E',
    wine: '#722F37', plum: '#6B3A5D', sage: '#9CAF88', mauve: '#915F6D',
    blush: '#DE98AB', champagne: '#F7E7CE', emerald: '#046307', sapphire: '#0F52BA',
    ruby: '#9B111E', amber: '#FFBF00', chocolate: '#3C1414', espresso: '#3C2415',
    midnight: '#191970', pewter: '#8A8D8F', stone: '#928E85', sand: '#C2B280',
    sky: '#87CEEB', lilac: '#C8A2C8', fuchsia: '#C74375', magenta: '#C20078',
    turquoise: '#30D5C8', aqua: '#00CED1', steel: '#71797E', slate: '#708090',
    'off-white': '#FAF9F6', 'off white': '#FAF9F6', offwhite: '#FAF9F6',
    multicolor: '#8B8680', multi: '#8B8680', 'multi-color': '#8B8680',
  };

  function resolveColorHex(hex: string | undefined | null, colorName: string): string {
    // If hex looks valid (#xxx or #xxxxxx), use it
    if (hex && /^#[0-9a-fA-F]{3,8}$/.test(hex)) return hex;
    // If colorName itself is a hex code (API sends hex in color field), use it
    if (colorName && /^#[0-9a-fA-F]{3,8}$/.test(colorName)) return colorName;
    // Try matching color name to known hex values
    const lower = colorName.toLowerCase().trim();
    if (colorNameToHex[lower]) return colorNameToHex[lower];
    // Check if any known name is a substring (e.g. "Light Blue" → blue)
    for (const [name, val] of Object.entries(colorNameToHex)) {
      if (lower.includes(name)) return val;
    }
    // If hex is a CSS color name string (not a hex code), use it as-is for backgroundColor
    if (hex && !hex.startsWith('#')) return hex;
    return '#8B8680';
  }

  // Parse hex to RGB
  function hexToRgb(hex: string): [number, number, number] | null {
    const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (!m) return null;
    return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
  }

  // Find closest named color by RGB distance
  function hexToColorName(hex: string): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return '';
    let bestName = '';
    let bestDist = Infinity;
    for (const [name, val] of Object.entries(colorNameToHex)) {
      const ref = hexToRgb(val);
      if (!ref) continue;
      const dist = Math.sqrt(
        (rgb[0] - ref[0]) ** 2 + (rgb[1] - ref[1]) ** 2 + (rgb[2] - ref[2]) ** 2
      );
      if (dist < bestDist) {
        bestDist = dist;
        bestName = name;
      }
    }
    // Only accept if reasonably close (distance < 80 out of max ~441)
    if (bestDist < 80 && bestName) {
      return bestName.charAt(0).toUpperCase() + bestName.slice(1);
    }
    return '';
  }

  // Resolve a display name for a color (never show raw hex to user)
  function resolveColorName(color: string, hex: string | undefined | null): string {
    // If color is already a readable name (not a hex code), use it
    if (color && !/^#[0-9a-fA-F]+$/.test(color)) {
      return color.charAt(0).toUpperCase() + color.slice(1);
    }
    // Try ai_metadata.color first (most reliable human-readable source)
    if (raw.ai_metadata?.color && !/^#/.test(raw.ai_metadata.color)) {
      return raw.ai_metadata.color.charAt(0).toUpperCase() + raw.ai_metadata.color.slice(1);
    }
    // Try to extract from product name
    const nameLower = raw.product_name.toLowerCase();
    for (const name of Object.keys(colorNameToHex)) {
      if (nameLower.includes(name)) {
        return name.charAt(0).toUpperCase() + name.slice(1);
      }
    }
    // If color is a hex code, find closest named color
    if (color && /^#[0-9a-fA-F]+$/.test(color)) {
      const name = hexToColorName(color);
      if (name) return name;
    }
    // Try hex field
    if (hex && /^#[0-9a-fA-F]+$/.test(hex)) {
      const name = hexToColorName(hex);
      if (name) return name;
    }
    return 'Color';
  }

  // Colors from color_based_images_mapping (real API data) or fallback to ai_metadata or product name
  if (raw.color_based_images_mapping && raw.color_based_images_mapping.length > 0) {
    raw.color_based_images_mapping.forEach((cm) => {
      const hexValue = resolveColorHex(cm.hex, cm.color);
      const displayName = resolveColorName(cm.color, cm.hex);
      variants.push({
        id: `color-${displayName.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'color',
        name: displayName,
        value: hexValue,
        available: true,
      });
    });
  } else {
    // Try ai_metadata.color first, then extract from product name
    let colorName = raw.ai_metadata?.color || '';
    if (!colorName) {
      const nameLower = raw.product_name.toLowerCase();
      for (const name of Object.keys(colorNameToHex)) {
        if (nameLower.includes(name)) {
          colorName = name.charAt(0).toUpperCase() + name.slice(1);
          break;
        }
      }
    }
    if (colorName) {
      const hexValue = resolveColorHex(null, colorName);
      variants.push({
        id: `color-${colorName.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'color',
        name: colorName.charAt(0).toUpperCase() + colorName.slice(1),
        value: hexValue,
        available: true,
      });
    }
  }

  // Sizes from real API data or fallback defaults
  const sizes = raw.sizes && raw.sizes.length > 0
    ? raw.sizes
    : ['XS', 'S', 'M', 'L', 'XL'];
  sizes.forEach((size) => {
    variants.push({
      id: `size-${size.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'size',
      name: size,
      value: size,
      available: true,
    });
  });

  // Build color → images mapping from API (key = resolved hex, must match variant value)
  const colorImageMap: Record<string, Product['images']> = {};
  if (raw.color_based_images_mapping && raw.color_based_images_mapping.length > 0) {
    raw.color_based_images_mapping.forEach((cm) => {
      const colorImages = (cm.images || []).filter(Boolean);
      if (colorImages.length > 0) {
        const hexKey = resolveColorHex(cm.hex, cm.color);
        colorImageMap[hexKey] = colorImages.map((url, i) => ({
          id: `${cm.color}-${i + 1}`,
          url,
          alt: `${raw.product_name} - ${cm.color}`,
          type: i === 0 ? 'hero' as const : 'detail' as const,
        }));
      }
    });
  }

  // Build images list: product_images > color images > product_image > recommendation cache > placeholder
  let imageUrls = raw.product_images?.filter(Boolean) || [];
  if (imageUrls.length === 0 && raw.color_based_images_mapping) {
    imageUrls = raw.color_based_images_mapping.flatMap(cm => cm.images || []).filter(Boolean);
  }

  // Then try product_image single field
  if (imageUrls.length === 0 && raw.product_image) {
    imageUrls = [raw.product_image];
  }

  // Fallback to recommendation cache or placeholder
  if (imageUrls.length === 0) {
    const cachedImg = productImageCache.get(raw.product_id);
    if (cachedImg) {
      imageUrls = [cachedImg];
    } else {
      imageUrls = [PLACEHOLDER_IMAGE];
    }
  }

  return {
    id: raw.product_id,
    brandId: raw.brand_id,
    brandName: brandName || '',
    name: raw.product_name,
    slug,
    tagline: raw.tagline || '',
    description: raw.product_description || '',
    narrative: '',
    price: raw.price,
    originalPrice: undefined,
    currency: 'EUR',
    images: imageUrls.map((url, i) => ({
      id: String(i + 1),
      url,
      alt: raw.product_name,
      type: i === 0 ? 'hero' as const : 'detail' as const,
    })),
    variants,
    materials: fabrics
      ? [{ name: fabrics, composition: '100%', origin: '' }]
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
    category: (productCategory as Product['category']) || 'clothing',
    tags: [...(Array.isArray(occasions) ? occasions : []), ...(Array.isArray(aesthetics) ? aesthetics : [])],
    visibility: 'public',
    experienceMode: 'standard',
    pricingVisibility: 'visible',
    commerceAction: 'add_to_considerations',
    commerceEligible: true,
    craftTags: [],
    colorImageMap: Object.keys(colorImageMap).length > 0 ? colorImageMap : undefined,
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
    console.log('[product-detail] Raw API:', {
      product_id: data.product_id,
      product_images: data.product_images?.length,
      product_image: data.product_image,
      sizes: data.sizes,
      ai_metadata_color: data.ai_metadata?.color,
      color_based_images_mapping: data.color_based_images_mapping?.map(c => ({ color: c.color, hex: c.hex, imageCount: c.images?.length })),
    });
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

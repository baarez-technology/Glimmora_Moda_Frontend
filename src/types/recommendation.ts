/**
 * Recommendation Types
 *
 * Types for the recommendation API endpoints:
 * - GET  /api/v1/brands/recommendations
 * - POST /api/v1/products/recommendations
 */

// ============================================
// Product Recommendations
// ============================================

export interface ProductRecommendationRequest {
  user_product_ids?: string[];
  user_preferences?: {
    occasions?: string[];
    aesthetics?: string[];
  };
  user_min_budget?: number;
  user_max_budget?: number;
  filter_brand_id?: string;
  filter_collection_name?: string;
  page_number?: number;
  page_size?: number;
}

/** Paginated response wrapper from POST /api/v1/products/recommendations */
export interface ProductRecommendationResponse {
  page_number: number;
  page_size: number;
  total_matched: number;
  total_pages: number;
  products_data: RecommendedProduct[];
}

/** Raw product object returned by the recommendation API */
export interface RecommendedProduct {
  product_id: string;
  product_name: string;
  brand_id: string;
  brand_name: string;
  price: number;
  collection_name: string;
  occasions: string[];
  aesthetics: string[];
  product_category: string;
  color: string;
  pattern: string;
  fabrics: string;
  is_low_stock: boolean;
  image_url: string;
  created_at: number;
}

// ============================================
// Brand Recommendations
// ============================================

/** Raw brand object returned by GET /api/v1/brands/recommendations */
export interface RecommendedBrand {
  brand_id: string;
  brand_name: string;
  profile_picture: string;
}

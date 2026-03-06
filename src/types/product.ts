/**
 * Product Types
 *
 * Core product-related type definitions including variants, materials,
 * craftsmanship details, and availability.
 */

// Product Category
export type ProductCategory =
  | 'bags'
  | 'clothing'
  | 'shoes'
  | 'accessories'
  | 'jewelry'
  | 'watches';

// SOW V10.3 Product Visibility & Commerce Types
export type ProductVisibility = 'private' | 'invite_only' | 'public';
export type ExperienceMode = 'standard' | 'iv_immersive' | 'bespoke_only';
export type PricingVisibility = 'visible' | 'on_request' | 'private';
export type CommerceAction = 'add_to_considerations' | 'request_access' | 'direct_purchase';

export interface ProductMedia {
  video?: string;
  motion?: string;
}

// Product Image
export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  type: 'hero' | 'detail' | 'lifestyle' | 'editorial';
}

// Product Variant
export interface ProductVariant {
  id: string;
  type: 'size' | 'color' | 'material';
  name: string;
  value: string;
  available: boolean;
  additionalPrice?: number;
}

// Material
export interface Material {
  name: string;
  composition: string;
  origin: string;
  sustainability?: string;
}

// Craftsmanship Detail
export interface CraftsmanshipDetail {
  title: string;
  description: string;
  duration?: string;
  artisans?: number;
}

// Region Availability
export interface RegionAvailability {
  region: string;
  city: string;
  available: boolean;
  confidence: number;
  deliveryDays: number;
}

// Availability
export interface Availability {
  status: 'available' | 'limited' | 'unavailable' | 'pre-order';
  quantity?: number;
  regions: RegionAvailability[];
  restockDate?: string;
}

// Product
export interface Product {
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  narrative: string;
  price: number;
  originalPrice?: number;
  currency: string;
  images: ProductImage[];
  variants: ProductVariant[];
  materials: Material[];
  craftsmanship: CraftsmanshipDetail[];
  ivEnabled: boolean;
  availability: Availability;
  collection?: string;
  category: ProductCategory;
  tags: string[];
  care?: string[]; // Care instructions for the product
  // SOW V10.3 fields
  visibility: ProductVisibility;
  experienceMode: ExperienceMode;
  pricingVisibility: PricingVisibility;
  commerceAction: CommerceAction;
  commerceEligible: boolean;
  craftTags: string[];
  media?: ProductMedia;
  colorImageMap?: Record<string, ProductImage[]>;
}

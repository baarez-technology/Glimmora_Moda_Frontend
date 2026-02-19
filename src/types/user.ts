/**
 * User Types
 *
 * User profile, fashion identity, and wardrobe item types.
 */

import type { Product } from './product';
import type { Order } from './order';

// Body Twin (basic)
export interface BodyTwin {
  id: string;
  silhouette: 'petite' | 'average' | 'tall' | 'curvy';
  measurements?: {
    height?: number;
    chest?: number;
    waist?: number;
    hips?: number;
  };
}

// Fashion Identity
export interface FashionIdentity {
  occasions: string[];
  aesthetics: string[];
  confidenceLevel: 'decisive' | 'guided' | 'advisory';
  budgetRange?: {
    min: number;
    max: number;
  };
  primaryLocation: string;
  travelDestinations: string[];
  bodyTwin?: BodyTwin;
}

// Wardrobe Item
export interface WardrobeItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
  wearCount: number;
  lastWorn?: string;
  outfitCompatibility: string[];
  note?: string; // Used by wishlist feature
}

// Consideration Item
export interface ConsiderationItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
  selectedVariants: {
    size?: string;
    color?: string;
  };
  agiNote?: string;
  quantity?: number;
}

// User
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
  fashionIdentity?: FashionIdentity;
  wardrobe: WardrobeItem[];
  considerations: ConsiderationItem[];
  orders: Order[];
}

/**
 * Discovery Types (SOW V10.2)
 *
 * Visual search, explore mode, and inspiration board types.
 */

import type { Product, ProductCategory } from './product';

// ============================================
// Visual Search
// ============================================

export interface VisualSearchQuery {
  id: string;
  imageUrl: string;
  uploadedAt: string;
  detectedAttributes: {
    category?: ProductCategory;
    colors?: string[];
    style?: string[];
    material?: string[];
    silhouette?: string;
  };
}

export interface VisualSearchResult {
  productId: string;
  product: Product;
  similarityScore: number; // 0-100
  matchedAttributes: string[];
  highlightedFeatures: string[];
}

// ============================================
// Inspiration Boards
// ============================================

export type BoardItemType = 'product' | 'image' | 'story' | 'collection' | 'outfit' | 'color' | 'note';

export interface BoardItem {
  id: string;
  type: BoardItemType;
  referenceId?: string;
  imageUrl: string;
  title?: string;
  note?: string;
  position?: { x: number; y: number };
  addedAt: string;
  source?: string;
}

export interface InspirationBoard {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  isPrivate: boolean;
  items: BoardItem[];
  collaborators?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

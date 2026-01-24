/**
 * Sharing & Social Types (SOW V10.2)
 *
 * Shareable item and share settings types.
 */

// ============================================
// Shareable Types
// ============================================

export type ShareableType = 'outfit' | 'wishlist' | 'board' | 'wardrobe' | 'look';

export interface ShareableItem {
  id: string;
  type: ShareableType;
  referenceId: string;
  ownerId: string;
  ownerName?: string;
  title: string;
  description?: string;
  coverImage?: string;
  isPublic: boolean;
  shareUrl: string;
  shortCode: string;
  expiresAt?: string;
  viewCount: number;
  saveCount: number;
  password?: string;
  allowComments: boolean;
  createdAt: string;
}

// ============================================
// Share Settings
// ============================================

export interface ShareSettings {
  isPublic: boolean;
  allowComments: boolean;
  expiresIn?: '1day' | '1week' | '1month' | 'never';
  requirePassword: boolean;
  password?: string;
  showPrices: boolean;
  showBrands: boolean;
}

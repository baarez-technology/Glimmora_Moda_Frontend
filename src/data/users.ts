import type { User, ConsiderationItem, UserPreferences } from '@/types';
import { products } from './products';

// ============================================
// MOCK USER
// ============================================

export const mockUser: User = {
  id: 'user-1',
  email: 'sophia@example.com',
  name: 'Sophia Chen',
  fashionIdentity: {
    occasions: ['professional', 'social', 'art'],
    aesthetics: ['classic', 'minimal'],
    confidenceLevel: 'guided',
    budgetRange: { min: 500, max: 5000 },
    primaryLocation: 'Paris',
    travelDestinations: ['Milan', 'Tokyo', 'New York'],
    bodyTwin: {
      id: 'bt-1',
      silhouette: 'average'
    }
  },
  wardrobe: [
    {
      id: 'w1',
      productId: 'dior-bar-jacket',
      product: products.find(p => p.id === 'dior-bar-jacket')!,
      addedAt: '2024-09-15',
      wearCount: 12,
      lastWorn: '2024-12-20',
      outfitCompatibility: ['gucci-horsebit-loafer']
    }
  ],
  considerations: [],
  orders: []
};

// ============================================
// CONSIDERATION ITEMS (Shopping Cart alternative)
// ============================================

export const mockConsiderations: ConsiderationItem[] = [
  {
    id: 'c1',
    productId: 'dior-lady-dior-small',
    product: products.find(p => p.id === 'dior-lady-dior-small')!,
    addedAt: '2024-12-27',
    selectedVariants: {
      size: 'small',
      color: 'Black'
    },
    agiNote: 'This bag complements your wardrobe beautifully. It would pair well with the Bar Jacket you own.'
  },
  {
    id: 'c2',
    productId: 'gucci-horsebit-loafer',
    product: products.find(p => p.id === 'gucci-horsebit-loafer')!,
    addedAt: '2024-12-26',
    selectedVariants: {
      size: '38',
      color: 'Black'
    },
    agiNote: 'A versatile classic that transitions from office to evening effortlessly.'
  }
];

// ============================================
// USER PREFERENCES
// ============================================

export const mockUserPreferences: UserPreferences = {
  id: 'pref-1',
  userId: 'user-1',
  notifications: {
    restockAlerts: true,
    newArrivals: false,
    priceChanges: true,
    outfitSuggestions: true,
    eventReminders: true
  },
  privacy: {
    shareWardrobeInsights: true,
    allowAGILearning: true,
    shareStylePreferences: true
  },
  shopping: {
    budgetMin: 500,
    budgetMax: 15000,
    preferredBrands: ['bottega-veneta', 'celine', 'the-row'],
    excludedCategories: []
  },
  display: {
    currency: 'EUR',
    measurementUnit: 'metric'
  }
};

// ============================================
// RESTOCK NOTIFICATIONS
// ============================================

export const mockRestockNotifications = [
  {
    id: 'rn-1',
    productId: 'hermes-birkin-30',
    product: products.find(p => p.id === 'hermes-birkin-30')!,
    status: 'watching',
    createdAt: '2024-12-15T10:00:00Z',
    preferredSize: 'Birkin 30',
    preferredColor: 'Noir'
  },
  {
    id: 'rn-2',
    productId: 'dior-lady-dior-small',
    product: products.find(p => p.id === 'dior-lady-dior-small')!,
    status: 'available',
    createdAt: '2024-12-20T14:30:00Z',
    notifiedAt: '2024-12-28T09:00:00Z',
    preferredSize: 'Large',
    preferredColor: 'Cherry Red'
  },
  {
    id: 'rn-3',
    productId: 'bottega-cassette',
    product: products.find(p => p.id === 'bottega-cassette')!,
    status: 'notified',
    createdAt: '2024-12-10T08:00:00Z',
    notifiedAt: '2024-12-25T11:00:00Z',
    preferredSize: 'Medium',
    preferredColor: 'Bottega Green'
  }
];

// ============================================
// SILENT CART
// ============================================

export const mockSilentCart = {
  id: 'sc-1',
  userId: 'user-1',
  items: [
    {
      productId: 'gucci-jackie-1961',
      product: products.find(p => p.id === 'gucci-jackie-1961')!,
      addedAt: '2024-12-20T10:00:00Z',
      reason: 'Browsed multiple times and matches your aesthetic preferences',
      confidence: 88,
      occasion: 'Gallery Opening',
      expiresAt: '2025-01-15T23:59:59Z'
    },
    {
      productId: 'hermes-silk-scarf',
      product: products.find(p => p.id === 'hermes-silk-scarf')!,
      addedAt: '2024-12-22T15:30:00Z',
      reason: 'Complements items in your wardrobe and fills a style gap',
      confidence: 92,
      occasion: 'Business Meeting',
      expiresAt: '2025-01-10T23:59:59Z'
    }
  ],
  totalValue: (products.find(p => p.id === 'gucci-jackie-1961')?.price || 0) +
              (products.find(p => p.id === 'hermes-silk-scarf')?.price || 0),
  lastUpdated: '2024-12-28T10:00:00Z',
  agiExplanation: 'Based on your browsing patterns, style preferences, and upcoming calendar events, I\'ve quietly prepared these items for your consideration. Each piece has been selected to complement your existing wardrobe and align with your aesthetic.'
};

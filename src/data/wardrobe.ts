import type { FitConfidence, DigitalBodyTwin, WardrobeAnalysis, CompleteOutfit, Product } from '@/types';
import { products } from './products';

// ============================================
// FIT CONFIDENCE
// ============================================

export const mockFitConfidence: FitConfidence = {
  overallScore: 87,
  suggestedSize: 'FR 38',
  availableSizes: ['XS', 'S', 'M', 'L', 'XL'],
  breakdown: {
    sizeMatch: 92,
    styleMatch: 85,
    proportionMatch: 84
  },
  measurementAnalysis: {
    chestDifferenceCm: -1.2,
    waistDifferenceCm: 0.5,
    shoulderAlignment: 'optimal',
    sleeveLengthEstimate: 'ideal',
  },
  sizeNotes: [
    'Based on your measurements, size FR 38 should fit comfortably through the shoulders',
    'The structured waist will sit at your natural waistline',
    'Sleeve length is optimal for your proportions'
  ],
  returnRisk: 'low',
  returnRiskScore: 8,
  recommendation: 'Based on your Body Twin profile and previous purchases, this piece should fit beautifully. The structured silhouette complements your style preferences for classic tailoring.',
  bodyTwinUsed: true,
  fitEngineVersion: 'mock-v1',
};

// ============================================
// DIGITAL BODY TWIN
// ============================================

export const mockBodyTwin: DigitalBodyTwin = {
  id: 'bt-user-1',
  userId: 'user-1',
  silhouette: 'average',
  measurements: {
    height: 168,
    chest: 88,
    waist: 68,
    hips: 96,
    inseam: 78,
    shoulders: 38
  },
  fitPreferences: {
    tops: 'fitted',
    bottoms: 'relaxed',
    dresses: 'fitted'
  },
  proportions: {
    shoulder: 'medium',
    torso: 'medium',
    legs: 'medium'
  },
  preferredFit: 'fitted',
  createdAt: '2024-06-15T10:00:00Z',
  updatedAt: '2024-12-20T14:30:00Z'
};

// ============================================
// WARDROBE ANALYSIS
// ============================================

export const mockWardrobeAnalysis: WardrobeAnalysis = {
  totalPieces: 24,
  versatilityScore: 78,
  categories: {
    bags: 4,
    clothing: 12,
    shoes: 5,
    accessories: 3
  },
  occasionCoverage: {
    professional: 85,
    evening: 70,
    casual: 90,
    formal: 45,
    travel: 60
  },
  gaps: [
    {
      id: 'gap-1',
      category: 'Evening Clutch',
      priority: 'essential',
      reason: 'Your wardrobe lacks a formal evening bag for black-tie events.',
      occasionsUnlocked: ['Gala', 'Opera', 'Formal Dinner'],
      suggestedProducts: products.filter(p => p.category === 'bags').slice(0, 2)
    },
    {
      id: 'gap-2',
      category: 'Silk Scarf',
      priority: 'recommended',
      reason: 'A versatile silk scarf would add styling options to your existing pieces.',
      occasionsUnlocked: ['Professional', 'Travel', 'Art Events'],
      suggestedProducts: products.filter(p => p.id === 'hermes-silk-scarf')
    },
    {
      id: 'gap-3',
      category: 'Classic Pumps',
      priority: 'nice-to-have',
      reason: 'Black pumps would complete several professional and evening ensembles.',
      occasionsUnlocked: ['Professional', 'Evening', 'Cocktail'],
      suggestedProducts: products.filter(p => p.category === 'shoes').slice(0, 2)
    }
  ],
  styleBalance: 'Classic-Contemporary',
  agiInsight: 'Your wardrobe shows a strong foundation in classic pieces with contemporary touches. To maximize versatility, consider adding more transitional pieces that work across multiple occasions. The current gap in formal accessories limits your evening options.'
};

// ============================================
// COMPLETE OUTFITS
// ============================================

export function getMockOutfits(product: Product): CompleteOutfit[] {
  const relatedProducts = products.filter(p => p.id !== product.id);

  return [
    {
      id: 'outfit-1',
      name: 'Power Professional',
      occasion: 'Business Meeting',
      description: 'A commanding yet refined ensemble perfect for important meetings and presentations.',
      items: [
        {
          type: 'suggested',
          productId: product.id,
          product: product,
          category: product.category.charAt(0).toUpperCase() + product.category.slice(1)
        },
        {
          type: 'wardrobe',
          productId: 'dior-bar-jacket',
          product: products.find(p => p.id === 'dior-bar-jacket') || relatedProducts[0],
          category: 'Jacket',
          note: 'From your wardrobe'
        },
        {
          type: 'suggested',
          productId: 'gucci-horsebit-loafer',
          product: products.find(p => p.id === 'gucci-horsebit-loafer') || relatedProducts[1],
          category: 'Shoes'
        }
      ],
      compatibilityScore: 94,
      totalPrice: product.price + 3200 + 890,
      agiReasoning: 'The structured lines of the Bar Jacket complement the sophistication of this piece, while the Horsebit Loafers ground the look with Italian craftsmanship. This combination projects confidence and refined taste.'
    },
    {
      id: 'outfit-2',
      name: 'Evening Events',
      occasion: 'Art & Culture',
      description: 'An artistically sophisticated look for cultural events and gallery openings.',
      items: [
        {
          type: 'suggested',
          productId: product.id,
          product: product,
          category: product.category.charAt(0).toUpperCase() + product.category.slice(1)
        },
        {
          type: 'suggested',
          productId: 'bottega-cassette',
          product: products.find(p => p.id === 'bottega-cassette') || relatedProducts[2],
          category: 'Bag',
          note: 'The intrecciato weave adds artistic texture'
        },
        {
          type: 'suggested',
          productId: 'hermes-silk-scarf',
          product: products.find(p => p.id === 'hermes-silk-scarf') || relatedProducts[3],
          category: 'Accessory'
        }
      ],
      compatibilityScore: 91,
      totalPrice: product.price + 3200 + 450,
      agiReasoning: 'For cultural environments, this ensemble balances artistic expression with understated luxury. The Bottega intrecciato weave resonates with craft appreciation, while the Hermès scarf adds a touch of heritage artistry.'
    },
    {
      id: 'outfit-3',
      name: 'Weekend Elegance',
      occasion: 'Brunch & Leisure',
      description: 'Effortlessly chic for relaxed yet refined weekend occasions.',
      items: [
        {
          type: 'suggested',
          productId: product.id,
          product: product,
          category: product.category.charAt(0).toUpperCase() + product.category.slice(1)
        },
        {
          type: 'suggested',
          productId: 'gucci-jackie-1961',
          product: products.find(p => p.id === 'gucci-jackie-1961') || relatedProducts[0],
          category: 'Bag',
          note: 'Iconic relaxed sophistication'
        }
      ],
      compatibilityScore: 88,
      totalPrice: product.price + 2950,
      agiReasoning: 'The Jackie bag\'s curved silhouette brings a relaxed elegance that perfectly complements weekend styling while maintaining an air of refined taste.'
    }
  ];
}

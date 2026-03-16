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
  // Build complementary items from DIFFERENT categories than the current product
  const clothing = products.find(p => p.category === 'clothing' && p.id !== product.id);
  const shoes    = products.find(p => p.category === 'shoes' && p.id !== product.id);
  const bags     = products.find(p => p.category === 'bags' && p.id !== product.id);
  const accessories = products.find(p => p.category === 'accessories' && p.id !== product.id);

  // Pick 2-3 items from categories the current product is NOT in
  const complementary = [clothing, shoes, bags, accessories]
    .filter((p): p is Product => p != null && p.category !== product.category);

  const categoryLabel = (cat: string) => cat.charAt(0).toUpperCase() + cat.slice(1);

  // Build outfits using available complementary products
  const outfit1Items = complementary.slice(0, 3);
  const outfit2Items = complementary.length >= 2 ? [complementary[complementary.length - 1], complementary[0]] : complementary.slice(0, 2);
  const outfit3Items = complementary.slice(0, 2);

  const makeItems = (picks: Product[]) => [
    {
      type: 'suggested' as const,
      productId: product.id,
      product: product,
      category: categoryLabel(product.category),
    },
    ...picks.map((p, i) => ({
      type: (i === 0 ? 'wardrobe' : 'suggested') as 'wardrobe' | 'suggested',
      productId: p.id,
      product: p,
      category: categoryLabel(p.category),
      ...(i === 0 ? { note: 'From your wardrobe' } : {}),
    })),
  ];

  const totalPrice = (picks: Product[]) =>
    product.price + picks.reduce((sum, p) => sum + p.price, 0);

  return [
    {
      id: 'outfit-1',
      name: 'Power Professional',
      occasion: 'Business Meeting',
      description: `A commanding yet refined ensemble built around your ${product.name}.`,
      items: makeItems(outfit1Items),
      compatibilityScore: 94,
      totalPrice: totalPrice(outfit1Items),
      agiReasoning: `The ${outfit1Items.map(p => p.name).join(' and ')} complement the ${product.name} with structured elegance — projecting confidence and refined taste for professional settings.`,
    },
    {
      id: 'outfit-2',
      name: 'Evening Events',
      occasion: 'Art & Culture',
      description: `An artistically sophisticated look for cultural events featuring the ${product.name}.`,
      items: makeItems(outfit2Items),
      compatibilityScore: 91,
      totalPrice: totalPrice(outfit2Items),
      agiReasoning: `For cultural environments, the ${outfit2Items.map(p => p.name).join(' paired with ')} balances artistic expression with the understated luxury of your ${product.name}.`,
    },
    {
      id: 'outfit-3',
      name: 'Weekend Elegance',
      occasion: 'Brunch & Leisure',
      description: `Effortlessly chic weekend styling centred on the ${product.name}.`,
      items: makeItems(outfit3Items),
      compatibilityScore: 88,
      totalPrice: totalPrice(outfit3Items),
      agiReasoning: `The relaxed sophistication of ${outfit3Items.map(p => p.name).join(' and ')} perfectly complements weekend styling with the ${product.name}.`,
    },
  ];
}

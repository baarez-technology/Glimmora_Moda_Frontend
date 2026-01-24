import type { InspirationBoard, ExploreMode, VisualSearchResult, Product } from '@/types';
import { products } from './products';

// ============================================
// INSPIRATION BOARDS
// ============================================

export const mockInspirationBoards: InspirationBoard[] = [
  {
    id: 'board-1',
    name: 'Spring Sophistication',
    description: 'Light layers and elegant transitions for the spring season',
    coverImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
    isPrivate: false,
    items: [
      { id: 'bi-1', type: 'product', referenceId: 'dior-bar-jacket', imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800', title: 'Bar Jacket', addedAt: '2025-01-10T10:00:00Z' },
      { id: 'bi-2', type: 'product', referenceId: 'hermes-silk-scarf', imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800', title: 'Silk Scarf', addedAt: '2025-01-11T14:00:00Z' },
      { id: 'bi-3', type: 'image', imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800', note: 'Spring color inspiration', addedAt: '2025-01-12T09:00:00Z' },
    ],
    tags: ['spring', 'elegant', 'transitional'],
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-12T09:00:00Z'
  },
  {
    id: 'board-2',
    name: 'Timeless Icons',
    description: 'Heritage pieces that never go out of style',
    coverImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    isPrivate: false,
    items: [
      { id: 'bi-4', type: 'product', referenceId: 'dior-lady-dior-small', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', title: 'Lady Dior', addedAt: '2025-01-08T10:00:00Z' },
      { id: 'bi-5', type: 'product', referenceId: 'gucci-jackie-1961', imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800', title: 'Jackie 1961', addedAt: '2025-01-08T10:30:00Z' },
      { id: 'bi-6', type: 'product', referenceId: 'hermes-birkin-30', imageUrl: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800', title: 'Birkin 30', addedAt: '2025-01-09T16:00:00Z' },
      { id: 'bi-7', type: 'story', referenceId: 'lady-dior-story', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', title: 'The Lady Dior Legacy', addedAt: '2025-01-09T16:30:00Z' },
    ],
    tags: ['icons', 'heritage', 'investment'],
    createdAt: '2025-01-08T10:00:00Z',
    updatedAt: '2025-01-09T16:30:00Z'
  }
];

export function getInspirationBoards(): InspirationBoard[] {
  return mockInspirationBoards;
}

export function getInspirationBoardById(id: string): InspirationBoard | undefined {
  return mockInspirationBoards.find(b => b.id === id);
}

// ============================================
// EXPLORE MODE
// ============================================

export const defaultExploreMode: ExploreMode = {
  enabled: false,
  hidesPrices: true,
  hidesAddToCart: true,
  hidesAvailability: true,
  focusOnStorytelling: true
};

// ============================================
// VISUAL SEARCH
// ============================================

export function performVisualSearch(
  detectedCategory?: string,
  detectedStyle?: string[]
): VisualSearchResult[] {
  const matchingProducts = products.filter(p => {
    if (detectedCategory && p.category !== detectedCategory) return false;
    if (detectedStyle && !p.tags.some(t => detectedStyle.includes(t))) return false;
    return true;
  });

  return matchingProducts.map(product => ({
    productId: product.id,
    product,
    similarityScore: Math.floor(Math.random() * 25) + 75, // 75-100
    matchedAttributes: [
      detectedCategory ? 'category' : '',
      ...(detectedStyle || []).filter(s => product.tags.includes(s)),
    ].filter(Boolean),
    highlightedFeatures: [product.tagline, product.materials[0]?.name || ''].filter(Boolean)
  })).sort((a, b) => b.similarityScore - a.similarityScore);
}

export function performVisualSearchByImage(imageData: string): VisualSearchResult[] {
  // Mock visual search - in production this would use AI image recognition
  // For now, return random products with simulated similarity scores
  const shuffled = [...products].sort(() => Math.random() - 0.5);
  const numResults = Math.floor(Math.random() * 4) + 4; // 4-8 results

  return shuffled.slice(0, numResults).map((product, index) => ({
    productId: product.id,
    product,
    similarityScore: Math.round(95 - (index * 5) - Math.random() * 10),
    matchedAttributes: getMatchAttributes(product),
    highlightedFeatures: [product.tagline, product.materials[0]?.name || ''].filter(Boolean)
  }));
}

function getMatchAttributes(product: Product): string[] {
  const attributes: string[] = [];

  // Add category-based attributes
  if (product.category === 'bags') {
    attributes.push('silhouette', 'style');
  } else if (product.category === 'clothing') {
    attributes.push('cut', 'color');
  } else if (product.category === 'shoes') {
    attributes.push('style', 'design');
  } else if (product.category === 'jewelry') {
    attributes.push('aesthetic', 'material');
  }

  // Add some general attributes
  const generalAttributes = ['color', 'aesthetic', 'style', 'design'];
  attributes.push(generalAttributes[Math.floor(Math.random() * generalAttributes.length)]);

  return attributes.slice(0, 3);
}

// ============================================
// BODY VISUALIZATION PRESETS
// ============================================

export const bodyVisualizationPresets = {
  bags: { defaultPosition: { x: 0.25, y: 0.55 }, scale: 0.22 },
  clothing: { defaultPosition: { x: 0.5, y: 0.35 }, scale: 0.7 },
  shoes: { defaultPosition: { x: 0.5, y: 0.88 }, scale: 0.12 },
  accessories: { defaultPosition: { x: 0.6, y: 0.25 }, scale: 0.15 },
  jewelry: { defaultPosition: { x: 0.55, y: 0.2 }, scale: 0.08 },
  watches: { defaultPosition: { x: 0.18, y: 0.52 }, scale: 0.06 },
};

export function getVisualizationPreset(category: string) {
  return bodyVisualizationPresets[category as keyof typeof bodyVisualizationPresets] || bodyVisualizationPresets.accessories;
}

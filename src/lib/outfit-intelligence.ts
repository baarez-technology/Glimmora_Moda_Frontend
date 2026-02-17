/**
 * Outfit Intelligence Module
 *
 * Generates dynamic outfit suggestions based on:
 * - Event type and dress code
 * - User's actual wardrobe
 * - Available products catalog
 */

import type { Product, ProductCategory } from '@/types';
import type { CalendarEvent, OutfitSuggestion, OutfitItem } from '@/types';
import type { WardrobeItem } from '@/types';
import { products } from '@/data/products';

// ============================================
// OCCASION MAPPING
// ============================================

// Maps event types to suitable product tags
const eventTypeToTags: Record<string, string[]> = {
  business_meeting: ['tailoring', 'classic', 'investment', 'heritage'],
  dinner_party: ['evening', 'heritage', 'iconic', 'leather'],
  wedding: ['occasion', 'heritage', 'investment', 'iconic'],
  gala: ['evening', 'iconic', 'investment', 'exclusive', 'heritage'],
  gallery_opening: ['contemporary', 'art', 'signature', 'iconic'],
  cocktail_party: ['evening', 'iconic', 'heritage', 'leather'],
  travel: ['everyday', 'leather', 'canvas', 'iconic'],
  date_night: ['evening', 'heritage', 'iconic', 'leather'],
  brunch: ['everyday', 'classic', 'leather', 'casual'],
  conference: ['tailoring', 'classic', 'investment', 'heritage'],
  interview: ['tailoring', 'classic', 'investment', 'heritage'],
  casual_outing: ['everyday', 'casual', 'leather', 'canvas'],
  theater: ['evening', 'heritage', 'iconic', 'investment'],
  concert: ['contemporary', 'everyday', 'signature', 'leather'],
  other: ['everyday', 'classic', 'leather']
};

// Maps dress codes to formality levels (higher = more formal)
const dressCodeFormality: Record<string, number> = {
  casual: 1,
  smart_casual: 2,
  business: 3,
  cocktail: 4,
  formal: 5,
  black_tie: 6
};

// Categories needed for a complete outfit by formality
const categoriesNeededByFormality: Record<number, ProductCategory[]> = {
  1: ['bags', 'shoes'],
  2: ['bags', 'shoes'],
  3: ['bags', 'shoes', 'clothing'],
  4: ['bags', 'shoes', 'clothing', 'accessories'],
  5: ['bags', 'shoes', 'clothing', 'accessories'],
  6: ['bags', 'shoes', 'clothing', 'accessories', 'jewelry']
};

// ============================================
// SCORING FUNCTIONS
// ============================================

/**
 * Calculates how well a product matches an event
 */
function calculateProductEventScore(product: Product, event: CalendarEvent): number {
  let score = 0;
  const eventTags = eventTypeToTags[event.eventType] || eventTypeToTags.other;

  // Tag matching (up to 40 points)
  const matchingTags = product.tags.filter(tag => eventTags.includes(tag));
  score += matchingTags.length * 10;

  // Formality matching (up to 30 points)
  const formality = dressCodeFormality[event.dressCode || 'smart_casual'] || 2;

  // Evening/formal products score higher for formal events
  if (formality >= 4 && (product.tags.includes('evening') || product.tags.includes('occasion'))) {
    score += 30;
  } else if (formality <= 2 && product.tags.includes('everyday')) {
    score += 30;
  } else if (formality === 3 && (product.tags.includes('classic') || product.tags.includes('tailoring'))) {
    score += 30;
  } else {
    score += 10; // Base score for partial match
  }

  // Heritage/iconic products always score well (up to 20 points)
  if (product.tags.includes('heritage') || product.tags.includes('iconic')) {
    score += 20;
  }

  // Investment pieces score well for important events (up to 10 points)
  if (formality >= 4 && product.tags.includes('investment')) {
    score += 10;
  }

  return Math.min(score, 100);
}

/**
 * Gets the category label for display
 */
function getCategoryLabel(category: ProductCategory): string {
  const labels: Record<ProductCategory, string> = {
    bags: 'Bag',
    clothing: 'Clothing',
    shoes: 'Shoes',
    accessories: 'Accessory',
    jewelry: 'Jewelry',
    watches: 'Watch'
  };
  return labels[category] || category;
}

// ============================================
// MAIN GENERATION FUNCTION
// ============================================

/**
 * Generates outfit suggestions for an event based on the user's wardrobe
 */
export function generateOutfitSuggestions(
  event: CalendarEvent,
  wardrobe: WardrobeItem[]
): OutfitSuggestion[] {
  const formality = dressCodeFormality[event.dressCode || 'smart_casual'] || 2;
  const neededCategories = categoriesNeededByFormality[formality] || ['bags', 'shoes'];
  const eventTags = eventTypeToTags[event.eventType] || eventTypeToTags.other;

  // Get wardrobe products with scores
  const wardrobeProducts = wardrobe.map(item => ({
    item,
    product: item.product,
    score: calculateProductEventScore(item.product, event)
  })).sort((a, b) => b.score - a.score);

  // Find matching wardrobe items by category
  const wardrobeByCategory: Record<string, { item: WardrobeItem; product: Product; score: number }[]> = {};
  wardrobeProducts.forEach(wp => {
    const cat = wp.product.category;
    if (!wardrobeByCategory[cat]) {
      wardrobeByCategory[cat] = [];
    }
    wardrobeByCategory[cat].push(wp);
  });

  // Get available products for suggestions (excluding what's in wardrobe)
  const wardrobeProductIds = new Set(wardrobe.map(w => w.product.id));
  const availableProducts = products.filter(p => !wardrobeProductIds.has(p.id));

  // Score available products
  const scoredAvailable = availableProducts.map(product => ({
    product,
    score: calculateProductEventScore(product, event)
  })).sort((a, b) => b.score - a.score);

  // Group available products by category
  const availableByCategory: Record<string, { product: Product; score: number }[]> = {};
  scoredAvailable.forEach(sp => {
    const cat = sp.product.category;
    if (!availableByCategory[cat]) {
      availableByCategory[cat] = [];
    }
    availableByCategory[cat].push(sp);
  });

  // Generate primary suggestion (best match)
  const primaryItems: OutfitItem[] = [];
  const usedProductIds = new Set<string>();

  neededCategories.forEach(category => {
    // First, check wardrobe for matching items
    const wardrobeMatch = wardrobeByCategory[category]?.[0];
    if (wardrobeMatch && wardrobeMatch.score >= 30) {
      primaryItems.push({
        type: 'wardrobe',
        productId: wardrobeMatch.product.id,
        product: wardrobeMatch.product,
        category: getCategoryLabel(category as ProductCategory),
        note: generateWardrobeNote(wardrobeMatch.product, event)
      });
      usedProductIds.add(wardrobeMatch.product.id);
    } else {
      // Suggest a product to fill the gap
      const suggestion = availableByCategory[category]?.find(s => !usedProductIds.has(s.product.id));
      if (suggestion) {
        primaryItems.push({
          type: 'suggested',
          productId: suggestion.product.id,
          product: suggestion.product,
          category: getCategoryLabel(category as ProductCategory),
          note: generateSuggestionNote(suggestion.product, event, category as ProductCategory)
        });
        usedProductIds.add(suggestion.product.id);
      }
    }
  });

  // Calculate confidence based on wardrobe matches
  const wardrobeItemsCount = primaryItems.filter(i => i.type === 'wardrobe').length;
  const totalItems = primaryItems.length;
  const baseConfidence = totalItems > 0 ? Math.round((wardrobeItemsCount / totalItems) * 30 + 65) : 75;

  const primarySuggestion: OutfitSuggestion = {
    id: `sug-${event.id}-primary`,
    name: generateSuggestionName(event, true),
    description: generateSuggestionDescription(event, primaryItems),
    confidence: Math.min(baseConfidence + Math.floor(Math.random() * 10), 98),
    items: primaryItems,
    agiReasoning: generateAGIReasoning(event, primaryItems)
  };

  // Generate alternative suggestion (if we have enough products)
  const suggestions: OutfitSuggestion[] = [primarySuggestion];

  if (availableProducts.length > neededCategories.length) {
    const altItems: OutfitItem[] = [];

    neededCategories.forEach(category => {
      // Try to use different products than primary suggestion
      const wardrobeMatches = wardrobeByCategory[category] || [];
      const altWardrobeMatch = wardrobeMatches.find(m => !usedProductIds.has(m.product.id));

      if (altWardrobeMatch && altWardrobeMatch.score >= 20) {
        altItems.push({
          type: 'wardrobe',
          productId: altWardrobeMatch.product.id,
          product: altWardrobeMatch.product,
          category: getCategoryLabel(category as ProductCategory),
          note: generateWardrobeNote(altWardrobeMatch.product, event)
        });
        usedProductIds.add(altWardrobeMatch.product.id);
      } else {
        const altSuggestion = availableByCategory[category]?.find(s => !usedProductIds.has(s.product.id));
        if (altSuggestion) {
          altItems.push({
            type: 'suggested',
            productId: altSuggestion.product.id,
            product: altSuggestion.product,
            category: getCategoryLabel(category as ProductCategory),
            note: generateSuggestionNote(altSuggestion.product, event, category as ProductCategory)
          });
          usedProductIds.add(altSuggestion.product.id);
        }
      }
    });

    if (altItems.length >= 2) {
      const altWardrobeCount = altItems.filter(i => i.type === 'wardrobe').length;
      const altTotalItems = altItems.length;
      const altConfidence = altTotalItems > 0 ? Math.round((altWardrobeCount / altTotalItems) * 25 + 60) : 70;

      suggestions.push({
        id: `sug-${event.id}-alt`,
        name: generateSuggestionName(event, false),
        description: generateSuggestionDescription(event, altItems),
        confidence: Math.min(altConfidence + Math.floor(Math.random() * 8), 92),
        items: altItems,
        agiReasoning: generateAGIReasoning(event, altItems)
      });
    }
  }

  return suggestions;
}

// ============================================
// HELPER GENERATORS
// ============================================

function generateSuggestionName(event: CalendarEvent, isPrimary: boolean): string {
  const primaryNames: Record<string, string> = {
    business_meeting: 'Executive Presence',
    dinner_party: 'Refined Evening',
    wedding: 'Elegant Celebration',
    gala: 'Grand Occasion',
    gallery_opening: 'Artistic Elegance',
    cocktail_party: 'Sophisticated Soirée',
    travel: 'Effortless Journey',
    date_night: 'Romantic Evening',
    brunch: 'Weekend Chic',
    conference: 'Professional Authority',
    interview: 'Confident First Impression',
    casual_outing: 'Relaxed Refinement',
    theater: 'Cultural Evening',
    concert: 'Modern Expression',
    other: 'Curated Look'
  };

  const altNames: Record<string, string> = {
    business_meeting: 'Modern Professional',
    dinner_party: 'Contemporary Charm',
    wedding: 'Timeless Grace',
    gala: 'Statement Ensemble',
    gallery_opening: 'Contemporary Edge',
    cocktail_party: 'Evening Allure',
    travel: 'Polished Explorer',
    date_night: 'Understated Romance',
    brunch: 'Parisian Morning',
    conference: 'Distinguished Presence',
    interview: 'Poised & Prepared',
    casual_outing: 'Elevated Casual',
    theater: 'Artistic Flair',
    concert: 'Urban Sophistication',
    other: 'Alternative Style'
  };

  return isPrimary
    ? (primaryNames[event.eventType] || primaryNames.other)
    : (altNames[event.eventType] || altNames.other);
}

function generateSuggestionDescription(event: CalendarEvent, items: OutfitItem[]): string {
  const wardrobeCount = items.filter(i => i.type === 'wardrobe').length;
  const suggestedCount = items.filter(i => i.type === 'suggested').length;

  if (wardrobeCount === items.length) {
    return 'A complete look using pieces from your wardrobe, perfectly suited for this occasion.';
  } else if (wardrobeCount > 0) {
    return `Building on ${wardrobeCount} piece${wardrobeCount > 1 ? 's' : ''} from your wardrobe with ${suggestedCount} thoughtfully selected addition${suggestedCount > 1 ? 's' : ''}.`;
  } else {
    return 'A curated ensemble of exceptional pieces selected for this specific occasion.';
  }
}

function generateWardrobeNote(product: Product, event: CalendarEvent): string {
  const notes: string[] = [
    `Your ${product.name} is ideal for this occasion`,
    `Perfect choice from your collection for ${event.eventType.replace('_', ' ')}`,
    `This piece from your wardrobe complements the ${event.dressCode?.replace('_', ' ') || 'occasion'} dress code`,
    `A sophisticated choice from your collection`
  ];
  return notes[Math.floor(Math.random() * notes.length)];
}

function generateSuggestionNote(product: Product, event: CalendarEvent, category: ProductCategory): string {
  const categoryNotes: Record<ProductCategory, string[]> = {
    bags: [
      `The ${product.name} would elevate your look`,
      `A perfect addition to complete your ensemble`,
      `This piece adds sophistication to your outfit`
    ],
    clothing: [
      `The ${product.name} provides the perfect foundation`,
      `A statement piece for this occasion`,
      `Impeccable tailoring for the ${event.dressCode?.replace('_', ' ') || 'event'}`
    ],
    shoes: [
      `These complete the look with understated elegance`,
      `The perfect finishing touch for your ensemble`,
      `Comfort meets sophistication`
    ],
    accessories: [
      `A refined accent to tie the look together`,
      `The perfect detail for this occasion`,
      `An elegant finishing touch`
    ],
    jewelry: [
      `A subtle statement of refined taste`,
      `Adds the perfect sparkle for the evening`,
      `Timeless elegance to complement your look`
    ],
    watches: [
      `A mark of distinction for this occasion`,
      `Precision craftsmanship for the discerning`,
      `The ultimate accessory for this event`
    ]
  };

  const notes = categoryNotes[category] || categoryNotes.accessories;
  return notes[Math.floor(Math.random() * notes.length)];
}

function generateAGIReasoning(event: CalendarEvent, items: OutfitItem[]): string {
  const wardrobeItems = items.filter(i => i.type === 'wardrobe');
  const suggestedItems = items.filter(i => i.type === 'suggested');
  const formality = dressCodeFormality[event.dressCode || 'smart_casual'] || 2;

  let reasoning = '';

  // Event context
  const eventContexts: Record<string, string> = {
    business_meeting: 'For high-stakes professional settings',
    dinner_party: 'For an elegant dining experience',
    wedding: 'For this joyous celebration',
    gala: 'For this prestigious occasion',
    gallery_opening: 'For the artistic atmosphere',
    cocktail_party: 'For evening sophistication',
    travel: 'For effortless travel style',
    date_night: 'For a memorable evening',
    brunch: 'For relaxed weekend elegance',
    conference: 'For professional distinction',
    interview: 'For making a confident impression',
    casual_outing: 'For elevated everyday style',
    theater: 'For cultural appreciation',
    concert: 'For contemporary expression',
    other: 'For this occasion'
  };

  reasoning = eventContexts[event.eventType] || eventContexts.other;

  // Wardrobe integration
  if (wardrobeItems.length > 0) {
    const brands = [...new Set(wardrobeItems.map(i => i.product.brandName))];
    reasoning += `, this look builds on your existing ${brands.join(' and ')} piece${wardrobeItems.length > 1 ? 's' : ''}`;
  }

  // Suggestions rationale
  if (suggestedItems.length > 0) {
    const suggestionBrands = [...new Set(suggestedItems.map(i => i.product.brandName))];
    if (wardrobeItems.length > 0) {
      reasoning += `, complemented by ${suggestionBrands.join(' and ')} to complete the ensemble`;
    } else {
      reasoning += `, featuring exceptional pieces from ${suggestionBrands.join(' and ')}`;
    }
  }

  // Formality note
  if (formality >= 4) {
    reasoning += '. Heritage craftsmanship and timeless design ensure you make a lasting impression.';
  } else if (formality >= 3) {
    reasoning += '. The combination balances professionalism with personal style.';
  } else {
    reasoning += '. This creates an effortlessly polished look appropriate for the setting.';
  }

  return reasoning;
}

// ============================================
// EXPORTS
// ============================================

export { calculateProductEventScore, getCategoryLabel };

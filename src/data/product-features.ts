import type {
  FabricSimulation,
  ContextSimulation,
  ClimateSuitability,
  SustainabilityScore,
  MaterialFeel
} from '@/types';

// ============================================
// FABRIC SIMULATIONS
// ============================================

export const fabricSimulations: Record<string, FabricSimulation> = {
  'dior-lady-dior-small': {
    productId: 'dior-lady-dior-small',
    fabricType: 'leather',
    drapeLevel: 1,
    structureLevel: 5,
    weight: 'medium',
    movement: 'minimal',
    breathability: 'low',
    texture: 'Buttery soft lambskin with the signature quilted Cannage pattern, supple yet structured',
    careComplexity: 'delicate'
  },
  'dior-bar-jacket': {
    productId: 'dior-bar-jacket',
    fabricType: 'wool',
    drapeLevel: 2,
    structureLevel: 4,
    weight: 'medium',
    movement: 'moderate',
    breathability: 'medium',
    texture: 'Crisp wool-silk blend with a refined hand, structured shoulder padding maintains the iconic silhouette',
    careComplexity: 'delicate'
  },
  'gucci-jackie-1961': {
    productId: 'gucci-jackie-1961',
    fabricType: 'leather',
    drapeLevel: 3,
    structureLevel: 3,
    weight: 'medium',
    movement: 'moderate',
    breathability: 'low',
    texture: 'Pebbled calfskin with a natural grain, softens beautifully with wear while maintaining shape',
    careComplexity: 'moderate'
  },
  'gucci-horsebit-loafer': {
    productId: 'gucci-horsebit-loafer',
    fabricType: 'leather',
    drapeLevel: 1,
    structureLevel: 5,
    weight: 'medium',
    movement: 'minimal',
    breathability: 'medium',
    texture: 'Smooth polished calfskin that develops a rich patina over time',
    careComplexity: 'easy'
  },
  'bottega-cassette': {
    productId: 'bottega-cassette',
    fabricType: 'leather',
    drapeLevel: 4,
    structureLevel: 2,
    weight: 'light',
    movement: 'flowing',
    breathability: 'medium',
    texture: 'Ultra-soft nappa lambskin woven into the signature oversized intrecciato, incredibly supple and lightweight',
    careComplexity: 'delicate'
  },
  'hermes-birkin-30': {
    productId: 'hermes-birkin-30',
    fabricType: 'leather',
    drapeLevel: 2,
    structureLevel: 4,
    weight: 'heavy',
    movement: 'minimal',
    breathability: 'low',
    texture: 'Togo calfskin with distinctive natural grain, resistant to scratches while developing character with use',
    careComplexity: 'moderate'
  },
  'hermes-silk-scarf': {
    productId: 'hermes-silk-scarf',
    fabricType: 'silk',
    drapeLevel: 5,
    structureLevel: 1,
    weight: 'ultralight',
    movement: 'flowing',
    breathability: 'high',
    texture: 'Heavyweight silk twill with a lustrous sheen, hand-rolled edges create elegant draping',
    careComplexity: 'delicate'
  },
  'lv-speedy-25': {
    productId: 'lv-speedy-25',
    fabricType: 'canvas',
    drapeLevel: 1,
    structureLevel: 4,
    weight: 'light',
    movement: 'minimal',
    breathability: 'medium',
    texture: 'Iconic coated canvas with vachetta leather trim that develops a warm honey patina over time',
    careComplexity: 'easy'
  },
};

export function getFabricSimulation(productId: string): FabricSimulation | undefined {
  return fabricSimulations[productId];
}

// ============================================
// CONTEXT SIMULATIONS
// ============================================

export const contextSimulations: ContextSimulation[] = [
  { id: 'gallery-opening', name: 'Gallery Opening', type: 'occasion', background: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920', lighting: 'warm', description: 'Sophisticated evening art event with creative professionals', tags: ['evening', 'cultural', 'creative', 'networking'] },
  { id: 'business-meeting', name: 'Business Meeting', type: 'occasion', background: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920', lighting: 'natural', description: 'Professional corporate environment requiring polished presence', tags: ['professional', 'daytime', 'formal', 'corporate'] },
  { id: 'romantic-dinner', name: 'Romantic Dinner', type: 'occasion', background: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920', lighting: 'evening', description: 'Intimate fine dining experience', tags: ['evening', 'romantic', 'elegant', 'dining'] },
  { id: 'weekend-brunch', name: 'Weekend Brunch', type: 'occasion', background: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920', lighting: 'natural', description: 'Relaxed daytime social gathering', tags: ['casual', 'daytime', 'social', 'relaxed'] },
  { id: 'gala-event', name: 'Black Tie Gala', type: 'occasion', background: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1920', lighting: 'dramatic', description: 'Formal black-tie charity or society event', tags: ['formal', 'evening', 'luxury', 'elegant'] },
  { id: 'tropical-vacation', name: 'Tropical Getaway', type: 'travel', background: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920', lighting: 'warm', description: 'Beach resort or tropical destination', tags: ['vacation', 'warm', 'relaxed', 'resort'] },
  { id: 'city-exploration', name: 'City Exploration', type: 'travel', background: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920', lighting: 'natural', description: 'Urban exploration and sightseeing', tags: ['travel', 'walking', 'cultural', 'active'] },
  { id: 'winter-city', name: 'Winter City', type: 'climate', background: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1920', lighting: 'cool', description: 'Cold urban environment requiring layering', tags: ['cold', 'urban', 'layering', 'winter'] },
  { id: 'summer-garden', name: 'Garden Party', type: 'setting', background: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1920', lighting: 'natural', description: 'Outdoor summer celebration', tags: ['outdoor', 'summer', 'social', 'elegant'] },
];

export function getContextSimulations(): ContextSimulation[] {
  return contextSimulations;
}

export function getContextSimulationById(id: string): ContextSimulation | undefined {
  return contextSimulations.find(c => c.id === id);
}

// ============================================
// CLIMATE SUITABILITY
// ============================================

export const climateSuitability: Record<string, ClimateSuitability> = {
  'dior-lady-dior-small': {
    productId: 'dior-lady-dior-small',
    temperatureRange: { min: 5, max: 30 },
    humidity: 'any',
    weather: ['sunny', 'cloudy'],
    seasons: ['spring', 'summer', 'autumn'],
    climates: ['temperate', 'continental'],
    indoorOutdoor: 'both',
    activityLevel: 'low'
  },
  'dior-bar-jacket': {
    productId: 'dior-bar-jacket',
    temperatureRange: { min: 10, max: 22 },
    humidity: 'low',
    weather: ['sunny', 'cloudy'],
    seasons: ['spring', 'autumn'],
    climates: ['temperate', 'continental'],
    indoorOutdoor: 'both',
    activityLevel: 'low'
  },
  'gucci-horsebit-loafer': {
    productId: 'gucci-horsebit-loafer',
    temperatureRange: { min: 10, max: 28 },
    humidity: 'medium',
    weather: ['sunny', 'cloudy'],
    seasons: ['spring', 'summer', 'autumn'],
    climates: ['temperate', 'continental', 'arid'],
    indoorOutdoor: 'both',
    activityLevel: 'moderate'
  },
  'hermes-silk-scarf': {
    productId: 'hermes-silk-scarf',
    temperatureRange: { min: 15, max: 35 },
    humidity: 'any',
    weather: ['sunny', 'cloudy', 'windy'],
    seasons: ['spring', 'summer', 'autumn'],
    climates: ['temperate', 'tropical', 'arid'],
    indoorOutdoor: 'both',
    activityLevel: 'low'
  },
  'bottega-cassette': {
    productId: 'bottega-cassette',
    temperatureRange: { min: 10, max: 28 },
    humidity: 'low',
    weather: ['sunny', 'cloudy'],
    seasons: ['spring', 'summer', 'autumn'],
    climates: ['temperate', 'continental'],
    indoorOutdoor: 'both',
    activityLevel: 'low'
  },
};

export function getClimateSuitability(productId: string): ClimateSuitability | undefined {
  return climateSuitability[productId];
}

// ============================================
// SUSTAINABILITY SCORES
// ============================================

export const sustainabilityScores: Record<string, SustainabilityScore> = {
  'dior-lady-dior-small': {
    productId: 'dior-lady-dior-small',
    overallScore: 72,
    breakdown: { materials: 75, production: 80, packaging: 70, transport: 60, longevity: 95, endOfLife: 55 },
    certifications: ['Responsible Leather', 'Carbon Offset Program'],
    carbonFootprint: '18kg CO2e',
    waterUsage: '120L',
    recyclability: 'low',
    repairability: 'high',
    biodegradable: false,
    veganFriendly: false,
    highlights: ['Lifetime repair service available', 'Responsibly sourced leather', 'Built to last generations'],
    improvements: ['Leather production has environmental impact', 'Metal hardware is not recyclable']
  },
  'hermes-birkin-30': {
    productId: 'hermes-birkin-30',
    overallScore: 78,
    breakdown: { materials: 80, production: 85, packaging: 75, transport: 65, longevity: 98, endOfLife: 60 },
    certifications: ['Hermès Tanneries Standards', 'Artisan Preservation'],
    carbonFootprint: '22kg CO2e',
    waterUsage: '150L',
    recyclability: 'low',
    repairability: 'high',
    biodegradable: false,
    veganFriendly: false,
    highlights: ['Exceptional longevity - often passed down generations', 'Full spa service for restoration', 'Investment piece that retains/gains value'],
    improvements: ['Leather production environmental impact', 'Limited recycling options']
  },
  'bottega-cassette': {
    productId: 'bottega-cassette',
    overallScore: 75,
    breakdown: { materials: 78, production: 80, packaging: 72, transport: 62, longevity: 90, endOfLife: 58 },
    certifications: ['Carbon Neutral Production', 'LWG Certified Tannery'],
    carbonFootprint: '15kg CO2e',
    waterUsage: '100L',
    recyclability: 'medium',
    repairability: 'high',
    biodegradable: false,
    veganFriendly: false,
    highlights: ['Carbon neutral manufacturing', 'Repair and refurbishment services', 'Timeless design reduces fashion waste'],
    improvements: ['Leather sourcing impact', 'Limited end-of-life options']
  },
  'hermes-silk-scarf': {
    productId: 'hermes-silk-scarf',
    overallScore: 82,
    breakdown: { materials: 85, production: 88, packaging: 78, transport: 70, longevity: 92, endOfLife: 75 },
    certifications: ['Sustainable Silk Partnership', 'Traditional Craftsmanship'],
    carbonFootprint: '3kg CO2e',
    waterUsage: '45L',
    recyclability: 'high',
    repairability: 'medium',
    biodegradable: true,
    veganFriendly: false,
    highlights: ['Biodegradable natural fiber', 'Low carbon footprint', 'Timeless designs never out of style'],
    improvements: ['Silk production involves silkworms', 'Delicate care requirements']
  },
};

export function getSustainabilityScore(productId: string): SustainabilityScore | undefined {
  return sustainabilityScores[productId];
}

// ============================================
// MATERIAL FEELS
// ============================================

export const materialFeels: Record<string, MaterialFeel> = {
  'dior-lady-dior-small': {
    productId: 'dior-lady-dior-small',
    texture: 'Buttery soft lambskin with the distinctive quilted Cannage pattern, supple under your fingertips yet holding its elegant form',
    weight: 'Substantial enough to feel luxurious, light enough for all-day wear',
    temperature: 'Cool to the touch initially, warming gently as you carry it close',
    comfort: 'The rounded handles sit naturally in your palm, the bag moving gracefully with your stride',
    sound: 'The soft whisper of leather and the gentle chime of the D.I.O.R. charms',
    aging: 'Develops a subtle patina that deepens in richness, each mark telling a story of moments lived',
    sensoryHighlights: ['Quilted texture invites touch', 'Charms create signature sound', 'Leather warms to body temperature'],
    agiDescription: 'The Lady Dior offers an intimate sensory experience. From the moment your fingers trace the quilted Cannage pattern, you understand why this bag became a legend. The lambskin yields gently under touch while maintaining its architectural form. As you lift it, you feel the reassuring weight of quality—present but never burdensome. The D.I.O.R. charms dance and chime softly with each step, a subtle announcement of presence that those who know will recognize.'
  },
  'hermes-birkin-30': {
    productId: 'hermes-birkin-30',
    texture: 'Togo leather\'s natural grain creates a textured surface that\'s both resilient and inviting to touch',
    weight: 'Generously weighted, a presence in your hand that speaks to its construction',
    temperature: 'Cool leather that gradually absorbs warmth, becoming an extension of yourself',
    comfort: 'The handles, rolled by hand, conform naturally to your grip after gentle use',
    sound: 'The satisfying click of the turnlock, the soft rustle of quality leather',
    aging: 'The leather softens and the color deepens, your Birkin becoming uniquely yours over decades',
    sensoryHighlights: ['Distinctive natural grain', 'Precision hardware clicks', 'Evolves beautifully with time'],
    agiDescription: 'Holding a Birkin for the first time is a revelation. The Togo leather has a distinctive grain that catches light and shadow, resilient enough to resist scratches yet soft enough to invite touch. The weight is substantial—you are holding 18-25 hours of a master artisan\'s life. Each hardware element has been polished to perfection, the turnlock closing with a satisfying precision click that becomes a ritual. Over years, your Birkin will soften, its color deepen, the leather conforming to your life until it becomes irreplaceably, unmistakably yours.'
  },
  'bottega-cassette': {
    productId: 'bottega-cassette',
    texture: 'The oversized intrecciato weave creates soft peaks and valleys, impossibly supple nappa leather',
    weight: 'Surprisingly light for its visual impact, almost weightless on the shoulder',
    temperature: 'Room temperature leather that immediately feels like skin',
    comfort: 'The woven leather creates natural flexibility, the bag moving and bending with you',
    sound: 'Near silence—the weave absorbs sound, only the whisper of leather on leather',
    aging: 'The weave relaxes subtly over time, becoming even more supple while maintaining structure',
    sensoryHighlights: ['Woven texture is mesmerizing to touch', 'Exceptional lightness', 'Moves like fabric'],
    agiDescription: 'The Cassette challenges expectations. Your fingers instinctively want to trace the oversized intrecciato weave, feeling how each strip of nappa leather interlocks with its neighbor. Despite its generous size, the bag is remarkably light—a testament to the tissue-thin leather used in the weaving. Unlike structured bags, the Cassette moves with fluid grace, draping and bending as you move. It\'s the rare luxury item that feels as comfortable on your first day with it as it will after years of companionship.'
  },
  'hermes-silk-scarf': {
    productId: 'hermes-silk-scarf',
    texture: 'Heavyweight silk twill with a luxurious hand, smooth yet substantial between your fingers',
    weight: 'Featherlight yet with the distinctive drape that only quality silk achieves',
    temperature: 'Cool and refreshing against skin, with a gentle warming quality',
    comfort: 'Glides effortlessly when knotted, never bunches or creates bulk',
    sound: 'The whisper of silk as it moves, a barely-there rustle of elegance',
    aging: 'Colors may soften slightly with age, hand-rolled edges maintain their perfection',
    sensoryHighlights: ['Exceptional drape', 'Colors seem to glow from within', 'Hand-rolled edges'],
    agiDescription: 'An Hermès carré is an education in silk. The moment you unfold it, light catches the surface and the colors seem to illuminate from within—this is the result of up to 45 separate screens used in printing. The silk twill has a weight and drape that cheaper scarves cannot replicate, substantial enough to knot beautifully yet light enough to float in a breeze. Run your finger along the edge and feel the hand-rolled hem, a detail that takes a craftsperson many minutes to complete. This is not a scarf; it is wearable art.'
  },
};

export function getMaterialFeel(productId: string): MaterialFeel | undefined {
  return materialFeels[productId];
}

// ============================================
// PRODUCT CONTEXT SIMULATIONS (Extended)
// ============================================

export interface ProductContextWithScore extends ContextSimulation {
  occasion: string;
  climate: 'tropical' | 'temperate' | 'cold';
  weather: 'sunny' | 'cloudy' | 'rainy';
  suitabilityScore: number;
  travelFriendly?: boolean;
  pros?: string[];
  cons?: string[];
}

export function getProductContextSimulations(productId: string): ProductContextWithScore[] {
  const { products } = require('./products');
  const product = products.find((p: { id: string }) => p.id === productId);
  if (!product) return [];

  // Return relevant contexts based on product category
  const relevantContexts = contextSimulations.filter(ctx => {
    if (product.category === 'bags') {
      return ['gallery-opening', 'business-meeting', 'romantic-dinner', 'city-exploration'].includes(ctx.id);
    }
    if (product.category === 'shoes') {
      return ['business-meeting', 'gala-event', 'weekend-brunch', 'city-exploration'].includes(ctx.id);
    }
    return true;
  });

  // Add suitability scores
  return relevantContexts.map(ctx => ({
    ...ctx,
    occasion: ctx.id,
    climate: ctx.type === 'climate' ? 'temperate' as const : 'temperate' as const,
    weather: 'sunny' as const,
    suitabilityScore: Math.floor(Math.random() * 30) + 70,
    travelFriendly: ['city-exploration', 'tropical-vacation'].includes(ctx.id),
    pros: ['Perfect formality level', 'Complements the occasion', 'Comfortable for duration'],
    cons: ['Check venue dress code']
  }));
}

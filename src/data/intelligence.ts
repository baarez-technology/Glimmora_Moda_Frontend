import type {
  AvailabilityIntelligence,
  FashionPassport,
  HeritageEvent,
  CulturalJourney
} from '@/types';
import { products } from './products';

// ============================================
// AVAILABILITY INTELLIGENCE (G-SAIL™)
// ============================================

export function getMockAvailabilityIntelligence(productId: string): AvailabilityIntelligence {
  const product = products.find(p => p.id === productId);
  return {
    productId,
    currentStatus: product?.availability.status || 'available',
    localConfidence: 87,
    alternatives: [
      {
        type: 'geography',
        region: 'Europe',
        city: 'Milan',
        availabilityConfidence: 94,
        deliveryDays: 4,
        priceDifference: 0,
        reason: 'Available at the Milan flagship store with verified stock.'
      },
      {
        type: 'geography',
        region: 'Asia',
        city: 'Tokyo',
        availabilityConfidence: 88,
        deliveryDays: 6,
        priceDifference: 120,
        reason: 'In stock at Ginza boutique. Price difference due to regional pricing.'
      },
      {
        type: 'equivalent',
        availabilityConfidence: 92,
        reason: 'Similar silhouette and craftsmanship from the same collection.',
        product: products.find(p => p.id !== productId && p.category === product?.category)
      }
    ],
    restockPrediction: product?.availability.status === 'limited' ? {
      estimatedDate: '2025-02-15',
      probability: 75
    } : undefined,
    conciergeOption: true
  };
}

// ============================================
// FASHION PASSPORT (AUTHENTICITY)
// ============================================

export function getMockFashionPassport(productId: string): FashionPassport {
  const product = products.find(p => p.id === productId);

  return {
    id: `passport-${productId}`,
    productId,
    serialNumber: `MGP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    authenticity: {
      verified: true,
      verifiedAt: '2024-12-28T10:30:00Z',
      verificationMethod: 'NFC chip + visual inspection'
    },
    provenance: {
      createdIn: product?.materials[0]?.origin || 'France',
      createdAt: '2024-10-15T00:00:00Z',
      artisans: product?.craftsmanship[0]?.artisans || 1,
      craftingHours: parseInt(product?.craftsmanship[0]?.duration?.replace(/\D/g, '') || '8')
    },
    materials: (product?.materials || []).map(m => ({
      name: m.name,
      origin: m.origin,
      certification: m.sustainability ? 'Certified Sustainable' : undefined,
      sustainability: m.sustainability
    })),
    ownership: {
      currentOwner: 'Sophia Chen',
      purchaseDate: '2024-12-28T00:00:00Z',
      transferHistory: []
    },
    care: {
      servicingAvailable: true,
      warrantyExpires: '2026-12-28T00:00:00Z',
      instructions: [
        'Store in dust bag when not in use',
        'Avoid exposure to direct sunlight',
        'Clean with soft, dry cloth only',
        'Keep away from water and moisture',
        'Professional cleaning recommended annually'
      ]
    }
  };
}

// ============================================
// HERITAGE EVENTS
// ============================================

export const heritageEvents: HeritageEvent[] = [
  // Dior Heritage
  { id: 'dior-1946', brandId: 'dior', year: 1946, title: 'House Founded', description: 'Christian Dior establishes his couture house at 30 Avenue Montaigne, Paris.', longDescription: 'With backing from textile magnate Marcel Boussac, Christian Dior opened his fashion house, beginning a revolution in post-war fashion.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', significance: 'milestone' },
  { id: 'dior-1947', brandId: 'dior', year: 1947, title: 'The New Look', description: 'Revolutionary debut collection introduces the iconic "New Look" silhouette.', longDescription: 'The collection featured cinched waists, padded hips, and full skirts, celebrating femininity after years of wartime austerity. Harper\'s Bazaar editor Carmel Snow famously exclaimed, "It\'s such a new look!"', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800', significance: 'milestone', relatedProducts: ['dior-bar-jacket'] },
  { id: 'dior-1995', brandId: 'dior', year: 1995, title: 'Lady Dior Created', description: 'The Lady Dior bag is created, destined to become Princess Diana\'s favorite.', longDescription: 'Originally named "Chouchou," the bag was renamed after Lady Diana, who received it as a gift from First Lady Bernadette Chirac and became inseparable from it.', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', significance: 'innovation', relatedProducts: ['dior-lady-dior-small'] },
  { id: 'dior-2016', brandId: 'dior', year: 2016, title: 'Maria Grazia Chiuri', description: 'First female artistic director appointed in the house\'s 70-year history.', longDescription: 'Maria Grazia Chiuri brings a feminist perspective to the house, blending heritage with contemporary cultural discourse.', significance: 'cultural' },

  // Gucci Heritage
  { id: 'gucci-1921', brandId: 'gucci', year: 1921, title: 'House Founded', description: 'Guccio Gucci opens a small leather goods shop in Florence.', longDescription: 'Inspired by the luggage he saw while working at the Savoy Hotel in London, Guccio Gucci began crafting leather goods that would become synonymous with Italian luxury.', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800', significance: 'milestone' },
  { id: 'gucci-1953', brandId: 'gucci', year: 1953, title: 'Horsebit Loafer', description: 'The iconic Horsebit loafer is introduced, referencing equestrian heritage.', longDescription: 'The distinctive metal horsebit hardware became one of Gucci\'s most recognizable signatures, connecting modern luxury to the brand\'s equestrian roots.', image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800', significance: 'innovation', relatedProducts: ['gucci-horsebit-loafer'] },
  { id: 'gucci-1961', brandId: 'gucci', year: 1961, title: 'Jackie Bag Named', description: 'The hobo bag becomes known as the Jackie after Jacqueline Kennedy Onassis.', longDescription: 'Jacqueline Kennedy Onassis was frequently photographed carrying this curved hobo bag, and by the 1970s it was officially renamed in her honor.', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800', significance: 'cultural', relatedProducts: ['gucci-jackie-1961'] },

  // Hermès Heritage
  { id: 'hermes-1837', brandId: 'hermes', year: 1837, title: 'House Founded', description: 'Thierry Hermès opens a harness workshop on the Grands Boulevards, Paris.', longDescription: 'Beginning as a harness maker serving European nobility, Hermès established the foundation of craftsmanship excellence that continues today.', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800', significance: 'milestone' },
  { id: 'hermes-1937', brandId: 'hermes', year: 1937, title: 'First Silk Scarf', description: 'Hermès introduces the first silk carré, "Jeu des Omnibus et Dames Blanches."', longDescription: 'The launch of the silk scarf marked Hermès\' expansion beyond leather goods. Each design takes up to two years to develop and requires up to 45 screens to print.', significance: 'innovation', relatedProducts: ['hermes-silk-scarf'] },
  { id: 'hermes-1984', brandId: 'hermes', year: 1984, title: 'Birkin Bag Created', description: 'Jean-Louis Dumas creates the Birkin bag for actress Jane Birkin.', longDescription: 'Legend has it that Dumas sat next to Jane Birkin on a flight and sketched the design after she complained about finding a practical yet elegant bag. Each Birkin takes 18-25 hours to create by a single artisan.', image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800', significance: 'milestone', relatedProducts: ['hermes-birkin-30'] },

  // Bottega Veneta Heritage
  { id: 'bottega-1966', brandId: 'bottega-veneta', year: 1966, title: 'House Founded', description: 'Michele Taddei and Renzo Zengiaro found Bottega Veneta in Vicenza.', longDescription: 'Born in the Veneto region of Italy, the house was founded on principles of exceptional leather craftsmanship and discretion.', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800', significance: 'milestone' },
  { id: 'bottega-1968', brandId: 'bottega-veneta', year: 1968, title: 'Intrecciato Born', description: 'The signature intrecciato weaving technique is developed.', longDescription: 'When traditional leather proved too stiff for a client\'s request, artisans began weaving thin strips of leather together, creating the technique that would define the house.', image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800', significance: 'innovation', relatedProducts: ['bottega-cassette'] },

  // Louis Vuitton Heritage
  { id: 'lv-1854', brandId: 'louis-vuitton', year: 1854, title: 'House Founded', description: 'Louis Vuitton opens his first store at 4 Rue Neuve-des-Capucines, Paris.', longDescription: 'After working as a trunk-maker\'s apprentice, Louis Vuitton revolutionized travel with flat-topped trunks that could be stacked, unlike the rounded trunks of the era.', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800', significance: 'milestone' },
  { id: 'lv-1896', brandId: 'louis-vuitton', year: 1896, title: 'Monogram Canvas', description: 'Georges Vuitton creates the iconic Monogram canvas to combat counterfeiting.', longDescription: 'In honor of his father, Georges designed the LV initials interlocked with flowers and quatrefoils, inspired by Japanese and Victorian designs. It became one of the world\'s first designer labels.', significance: 'innovation' },
  { id: 'lv-1930', brandId: 'louis-vuitton', year: 1930, title: 'Speedy Created', description: 'The Speedy bag is introduced as a compact city bag.', longDescription: 'Created as a smaller version of the Keepall travel bag, the Speedy became immortalized when Audrey Hepburn requested an even smaller version, leading to the Speedy 25.', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', significance: 'innovation', relatedProducts: ['lv-speedy-25'] },
];

export function getHeritageEventsByBrand(brandId: string): HeritageEvent[] {
  return heritageEvents.filter(e => e.brandId === brandId).sort((a, b) => a.year - b.year);
}

// ============================================
// CULTURAL JOURNEYS
// ============================================

export const culturalJourneys: CulturalJourney[] = [
  {
    id: 'journey-art',
    type: 'art',
    title: 'Fashion as Art',
    subtitle: 'Where Couture Meets Canvas',
    description: 'Explore the profound connections between fashion houses and the art world, from museum collaborations to designer-artist partnerships.',
    heroImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920',
    duration: '12 min',
    difficulty: 'intermediate',
    stops: [
      { id: 'art-1', order: 1, title: 'The Museum Connection', content: 'Fashion has long sought legitimacy in the halls of great museums. The Costume Institute at the Metropolitan Museum of Art has hosted exhibitions featuring Dior, Chanel, and Alexander McQueen, drawing millions of visitors and blurring the line between fashion and fine art.', mediaUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800', mediaType: 'image', relatedBrands: ['dior'], relatedProducts: ['dior-bar-jacket'], relatedStories: ['lady-dior-story'] },
      { id: 'art-2', order: 2, title: 'Artist Collaborations', content: 'From Elsa Schiaparelli\'s surrealist pieces with Salvador Dalí to Louis Vuitton\'s collaborations with contemporary artists like Yayoi Kusama, fashion has always sought creative dialogue with visual artists.', mediaUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800', mediaType: 'image', relatedBrands: ['louis-vuitton'], relatedProducts: [], relatedStories: [] },
      { id: 'art-3', order: 3, title: 'Craftsmanship as Art', content: 'The métiers d\'art—featherwork, embroidery, pleating—represent fashion\'s living art heritage. These artisanal techniques, often taking decades to master, transform fabric into sculptural masterpieces.', mediaUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800', mediaType: 'image', relatedBrands: ['hermes'], relatedProducts: ['hermes-birkin-30'], relatedStories: ['hermes-craftsmanship'] },
    ]
  },
  {
    id: 'journey-travel',
    type: 'travel',
    title: 'The Grand Tour',
    subtitle: 'Fashion Capitals of the World',
    description: 'Journey through the cities that shaped fashion history—from Parisian ateliers to Italian workshops, discover where style is born.',
    heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920',
    duration: '15 min',
    difficulty: 'beginner',
    stops: [
      { id: 'travel-1', order: 1, title: 'Paris: The Eternal Capital', content: 'Paris remains the undisputed capital of haute couture. The city\'s Right Bank houses the legendary Avenue Montaigne, where Dior, Chanel, and Louis Vuitton maintain their flagship boutiques and ateliers.', mediaUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', mediaType: 'image', relatedBrands: ['dior', 'hermes', 'louis-vuitton'], relatedProducts: ['dior-lady-dior-small'], relatedStories: ['lady-dior-story'] },
      { id: 'travel-2', order: 2, title: 'Florence & Milan: Italian Excellence', content: 'Italy\'s fashion identity spans from Florence\'s leather artisans to Milan\'s ready-to-wear powerhouses. The Veneto region is home to Bottega Veneta\'s workshops, where the intrecciato technique is passed down through generations.', mediaUrl: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800', mediaType: 'image', relatedBrands: ['gucci', 'bottega-veneta'], relatedProducts: ['bottega-cassette'], relatedStories: ['bottega-intrecciato'] },
      { id: 'travel-3', order: 3, title: 'Tokyo: Future Forward', content: 'Tokyo represents fashion\'s avant-garde frontier, where tradition meets innovation. From Issey Miyake\'s pleats to Comme des Garçons\' deconstruction, Japanese designers have redefined fashion\'s possibilities.', mediaUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', mediaType: 'image', relatedBrands: [], relatedProducts: [], relatedStories: [] },
    ]
  },
  {
    id: 'journey-craft',
    type: 'craft',
    title: 'Hands of the Masters',
    subtitle: 'The Artisans Behind Luxury',
    description: 'Meet the craftspeople who dedicate their lives to perfecting techniques passed down through centuries.',
    heroImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1920',
    duration: '18 min',
    difficulty: 'connoisseur',
    stops: [
      { id: 'craft-1', order: 1, title: 'The Leather Arts', content: 'A single Hermès Birkin bag takes 18-25 hours to create, crafted entirely by one artisan. The saddle stitch, using two needles, creates a seam so durable it will outlast the leather itself.', mediaUrl: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800', mediaType: 'image', relatedBrands: ['hermes'], relatedProducts: ['hermes-birkin-30'], relatedStories: ['hermes-craftsmanship'] },
      { id: 'craft-2', order: 2, title: 'The Intrecciato Weave', content: 'Bottega Veneta\'s signature technique involves weaving thin strips of leather together without visible stitching. This labor-intensive process creates a supple, flexible material that\'s uniquely recognizable.', mediaUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800', mediaType: 'image', relatedBrands: ['bottega-veneta'], relatedProducts: ['bottega-cassette'], relatedStories: ['bottega-intrecciato'] },
      { id: 'craft-3', order: 3, title: 'Silk Printing Mastery', content: 'An Hermès silk scarf requires up to 45 separate screens to print a single design. Each color must be applied and dried before the next, a process taking days to complete for one scarf.', mediaUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800', mediaType: 'image', relatedBrands: ['hermes'], relatedProducts: ['hermes-silk-scarf'], relatedStories: [] },
    ]
  },
  {
    id: 'journey-eras',
    type: 'eras',
    title: 'Decades of Style',
    subtitle: 'Fashion Through the Ages',
    description: 'Trace the evolution of style from the post-war New Look to today\'s sustainable luxury movement.',
    heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920',
    duration: '20 min',
    difficulty: 'intermediate',
    stops: [
      { id: 'eras-1', order: 1, title: 'The 1940s-50s: New Look Revolution', content: 'Christian Dior\'s 1947 New Look collection revolutionized post-war fashion, celebrating femininity with cinched waists and full skirts after years of wartime austerity and rationing.', mediaUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800', mediaType: 'image', relatedBrands: ['dior'], relatedProducts: ['dior-bar-jacket'], relatedStories: [] },
      { id: 'eras-2', order: 2, title: 'The 1960s-70s: Youth Culture', content: 'Fashion democratized as youth culture emerged. Ready-to-wear challenged haute couture, while Italian houses like Gucci brought luxury to a new generation of jet-setters.', mediaUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800', mediaType: 'image', relatedBrands: ['gucci'], relatedProducts: ['gucci-jackie-1961'], relatedStories: ['gucci-jackie-story'] },
      { id: 'eras-3', order: 3, title: 'The 1990s-2000s: Logo Era', content: 'Logos became status symbols as luxury became more visible. The Lady Dior bag, carried by Princess Diana, became an icon of the era\'s fascination with heritage and recognition.', mediaUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', mediaType: 'image', relatedBrands: ['dior', 'louis-vuitton'], relatedProducts: ['dior-lady-dior-small', 'lv-speedy-25'], relatedStories: ['lady-dior-story'] },
      { id: 'eras-4', order: 4, title: 'Today: Conscious Luxury', content: 'Modern luxury embraces sustainability and timelessness over trends. Houses invest in environmental initiatives while celebrating the longevity of well-made pieces.', mediaUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800', mediaType: 'image', relatedBrands: ['bottega-veneta', 'hermes'], relatedProducts: ['bottega-cassette'], relatedStories: [] },
    ]
  },
];

export function getCulturalJourneyById(id: string): CulturalJourney | undefined {
  return culturalJourneys.find(j => j.id === id);
}

export function getCulturalJourneysByType(type: string): CulturalJourney[] {
  return culturalJourneys.filter(j => j.type === type);
}

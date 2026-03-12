import type {
  UserTier,
  PersonalConcierge,
  AutonomousShoppingSettings,
  SourcingRequest,
  BespokeOrder,
  UHNIProfile,
  AutonomousActivity,
  PrivateCollection,
  PriceNegotiation,
  UHNIPriceOffer,
  UHNIPriceAlert,
  UHNIPricingTier,
  UHNIPricingSummary,
  UHNIAvailabilitySearch,
  GlobalNetworkStats,
  RestockPrediction,
  ExclusiveEvent,
  PrivateShoppingEvent,
  HeritageArchiveItem,
  IntelligenceInsight,
  ZeroUIConfig,
  InvisibleTransaction,
  ConciergeTask,
  SilentCommerceItem
} from '@/types';
import { products } from './products';

// ============================================
// UHNI (Ultra High Net-worth Individual) DATA
// ============================================

// Current User Tier (toggle this to test UHNI features)
export const mockUserTier: UserTier = 'uhni';

// Personal Concierge
export const mockConcierge: PersonalConcierge = {
  id: 'concierge-1',
  name: 'Isabella Martinez',
  title: 'Senior Fashion Concierge',
  avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
  email: 'isabella.martinez@modaglimmora.com',
  phone: '+33 1 42 86 82 82',
  availability: 'available',
  specialties: ['Haute Couture', 'Rare Vintage', 'Bespoke Tailoring', 'Private Collections'],
  languages: ['English', 'French', 'Italian', 'Spanish'],
  assignedSince: '2024-06-15',
  bio: 'With over 15 years of experience in luxury fashion, Isabella specializes in sourcing rare pieces and coordinating bespoke experiences for discerning clients. Previously with Dior and Hermès private client services.'
};

// Autonomous Shopping Settings
export const mockAutonomousSettings: AutonomousShoppingSettings = {
  enabled: true,
  monthlyBudget: 50000,
  currentMonthSpend: 12400,
  autoApproveThreshold: 5000,
  categories: ['bags', 'accessories', 'jewelry'],
  excludedBrands: [],
  preferredBrands: ['dior', 'hermes', 'bottega-veneta'],
  requireReviewBefore: 'purchase',
  notificationPreference: 'immediate',
  invisibleCommerceMode: false,
  discreetPackaging: true
};

// Sourcing Requests
export const mockSourcingRequests: SourcingRequest[] = [
  {
    id: 'sr-1',
    type: 'specific_item',
    status: 'options_found',
    title: 'Hermès Birkin 25 in Gold Togo',
    description: 'Looking for a Birkin 25 in Gold Togo leather with gold hardware. Prefer new or like-new condition.',
    budget: { min: 15000, max: 25000, flexible: true },
    deadline: '2025-03-01',
    conciergeNotes: [
      {
        id: 'note-1',
        author: 'concierge',
        content: 'I\'ve identified three potential sources for this piece. One from our Paris boutique allocation, one pre-owned in excellent condition from a trusted reseller.',
        timestamp: '2024-12-26T14:30:00Z'
      },
      {
        id: 'note-2',
        author: 'client',
        content: 'I prefer new if possible. What\'s the timeline for the boutique allocation?',
        timestamp: '2024-12-26T16:00:00Z'
      },
      {
        id: 'note-3',
        author: 'concierge',
        content: 'The boutique allocation typically takes 4-8 weeks. I\'ve put you on the priority list. In the meantime, I\'ve added the pre-owned option for your consideration.',
        timestamp: '2024-12-27T09:00:00Z'
      }
    ],
    foundOptions: [
      {
        id: 'opt-1',
        customDescription: 'Hermès Birkin 25 Gold Togo GHW - Boutique Allocation',
        source: 'Hermès Paris - George V',
        condition: 'new',
        price: 21500,
        availableUntil: '2025-02-15',
        conciergeRecommendation: 'Recommended - Direct from boutique with full warranty',
        images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800']
      },
      {
        id: 'opt-2',
        customDescription: 'Hermès Birkin 25 Gold Togo GHW - Pre-owned',
        source: 'Verified Reseller - Rebag',
        condition: 'like_new',
        price: 18900,
        originalPrice: 21500,
        provenance: 'Original owner, purchased 2023, used twice',
        availableUntil: '2025-01-10',
        conciergeRecommendation: 'Excellent value - authenticated with documentation',
        images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800']
      }
    ],
    createdAt: '2024-12-20T10:00:00Z',
    updatedAt: '2024-12-27T09:00:00Z'
  },
  {
    id: 'sr-2',
    type: 'occasion',
    status: 'sourcing',
    title: 'Monaco Grand Prix Weekend Wardrobe',
    description: 'Need complete looks for Monaco GP weekend - yacht party Friday, race day Saturday, gala dinner Sunday.',
    occasion: 'Monaco Grand Prix 2025',
    budget: { min: 30000, max: 60000, flexible: true },
    deadline: '2025-05-15',
    conciergeNotes: [
      {
        id: 'note-4',
        author: 'concierge',
        content: 'I\'m curating options from Dior, Valentino, and Brunello Cucinelli for the yacht party. For race day, considering Loro Piana and Zegna. The gala will feature options from Givenchy and Alexander McQueen.',
        timestamp: '2024-12-28T11:00:00Z'
      }
    ],
    foundOptions: [],
    createdAt: '2024-12-25T14:00:00Z',
    updatedAt: '2024-12-28T11:00:00Z'
  }
];

// Bespoke Orders
export const mockBespokeOrders: BespokeOrder[] = [
  {
    id: 'bespoke-1',
    brandId: 'dior',
    brandName: 'Dior',
    type: 'made_to_measure',
    title: 'Custom Bar Jacket',
    description: 'Made-to-measure Bar Jacket in midnight navy wool with personalized gold buttons bearing client initials.',
    specifications: [
      { category: 'Fabric', label: 'Material', value: 'Super 150s Wool', notes: 'From Loro Piana mill' },
      { category: 'Fabric', label: 'Color', value: 'Midnight Navy' },
      { category: 'Details', label: 'Buttons', value: 'Custom Gold', notes: 'Engraved with initials "SC"' },
      { category: 'Details', label: 'Lining', value: 'Silk Jacquard', notes: 'Dior oblique pattern' },
      { category: 'Fit', label: 'Silhouette', value: 'Classic Bar', notes: 'Slightly nipped waist per fitting' }
    ],
    measurements: {
      bust: 88,
      waist: 68,
      hips: 94,
      shoulders: 38,
      sleeveLength: 60
    },
    status: 'production',
    timeline: [
      {
        id: 'step-1',
        stage: 'consultation',
        title: 'Initial Consultation',
        description: 'Discussed design preferences, fabric selection, and customization options',
        status: 'completed',
        completedAt: '2024-11-15T10:00:00Z'
      },
      {
        id: 'step-2',
        stage: 'design_approval',
        title: 'Design Approval',
        description: 'Finalized design sketches and fabric swatches',
        status: 'completed',
        completedAt: '2024-11-28T14:00:00Z'
      },
      {
        id: 'step-3',
        stage: 'production',
        title: 'Atelier Production',
        description: 'Master tailors crafting the piece at Dior Paris atelier',
        status: 'current',
        estimatedDate: '2025-01-20'
      },
      {
        id: 'step-4',
        stage: 'fitting',
        title: 'First Fitting',
        description: 'Fitting appointment at Dior Paris',
        status: 'upcoming',
        estimatedDate: '2025-01-25'
      },
      {
        id: 'step-5',
        stage: 'final_adjustments',
        title: 'Final Adjustments',
        description: 'Any necessary alterations after fitting',
        status: 'upcoming',
        estimatedDate: '2025-02-01'
      },
      {
        id: 'step-6',
        stage: 'complete',
        title: 'Delivery',
        description: 'White-glove delivery to your address',
        status: 'upcoming',
        estimatedDate: '2025-02-10'
      }
    ],
    estimatedCompletion: '2025-02-10',
    price: 12500,
    depositPaid: 6250,
    depositPercentage: 50,
    atelierContact: 'Maison Dior Couture Atelier, 30 Avenue Montaigne, Paris',
    progressImages: [
      'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800'
    ],
    createdAt: '2024-11-15T10:00:00Z',
    updatedAt: '2024-12-20T16:00:00Z'
  }
];

// Autonomous Activity Feed
export const mockAutonomousActivity: AutonomousActivity[] = [
  {
    id: 'activity-1',
    type: 'prepared',
    product: products.find(p => p.id === 'gucci-jackie-1961')!,
    price: 2900,
    reason: 'Matches your style preferences and complements 3 items in your wardrobe',
    timestamp: '2024-12-28T08:00:00Z',
    autoApproveDeadline: '2024-12-30T08:00:00Z',
    status: 'pending'
  },
  {
    id: 'activity-2',
    type: 'auto_purchased',
    product: products.find(p => p.id === 'hermes-silk-scarf')!,
    price: 450,
    reason: 'Within auto-approve threshold, perfect for your upcoming business meetings',
    timestamp: '2024-12-27T14:30:00Z',
    status: 'completed'
  },
  {
    id: 'activity-3',
    type: 'awaiting_approval',
    product: products.find(p => p.id === 'bottega-cassette')!,
    price: 3200,
    reason: 'Last one available in your preferred color, above auto-approve threshold',
    timestamp: '2024-12-26T10:00:00Z',
    autoApproveDeadline: '2024-12-28T10:00:00Z',
    status: 'pending'
  }
];

// Complete UHNI Profile
export const mockUHNIProfile: UHNIProfile = {
  userId: 'user-1',
  tier: 'uhni',
  memberSince: '2024-06-15',
  concierge: mockConcierge,
  autonomousSettings: mockAutonomousSettings,
  sourcingRequests: mockSourcingRequests,
  bespokeOrders: mockBespokeOrders,
  privateCollectionAccess: ['dior-private-2025', 'hermes-invitation'],
  lifetimeValue: 287500,
  preferences: {
    communicationPreference: 'all',
    preferredContactTimes: ['10:00-12:00', '15:00-18:00'],
    specialRequests: ['Prefer European sizes', 'Allergic to nickel - gold hardware only']
  }
};

// Helper function to get UHNI data
export function getUHNIProfile(): UHNIProfile | null {
  if (mockUserTier === 'uhni') {
    return mockUHNIProfile;
  }
  return null;
}

// ============================================
// PRIVATE COLLECTIONS
// ============================================

export const mockPrivateCollections: PrivateCollection[] = [
  {
    id: 'dior-private-2025',
    name: 'Dior Haute Couture Preview Spring 2025',
    brandId: 'dior',
    brandName: 'Dior',
    description: 'An exclusive first look at the upcoming Haute Couture collection, featuring revolutionary silhouettes inspired by the architecture of Tadao Ando.',
    heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    accessLevel: 'uhni_only',
    products: products.filter(p => p.brandId === 'dior').slice(0, 3),
    previewDate: '2025-01-20',
    releaseDate: '2025-03-15',
    invitationRequired: false,
    hasAccess: true,
    customer_ids: [],
    requested_customers: [],
  },
  {
    id: 'hermes-invitation',
    name: 'Hermès Les Métiers d\'Art',
    brandId: 'hermes',
    brandName: 'Hermès',
    description: 'A celebration of the exceptional craftsmanship from the Hermès ateliers. Limited edition pieces showcasing rare leathers and techniques.',
    heroImage: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800',
    accessLevel: 'invitation',
    products: products.filter(p => p.brandId === 'hermes').slice(0, 4),
    previewDate: '2025-02-01',
    releaseDate: '2025-04-01',
    invitationRequired: true,
    hasAccess: true,
    customer_ids: [],
    requested_customers: [],
  },
  {
    id: 'chanel-limited',
    name: 'Chanel N°5 Centenary Collection',
    brandId: 'chanel',
    brandName: 'Chanel',
    description: 'A limited capsule collection commemorating 100 years of the iconic N°5 fragrance, featuring jewelry and accessories with subtle fragrance bottle motifs.',
    heroImage: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800',
    accessLevel: 'request',
    products: [],
    previewDate: '2025-02-15',
    releaseDate: '2025-05-05',
    invitationRequired: false,
    hasAccess: false,
    customer_ids: [],
    requested_customers: [],
  },
  {
    id: 'bottega-archive',
    name: 'Bottega Veneta Archive Revival',
    brandId: 'bottega-veneta',
    brandName: 'Bottega Veneta',
    description: 'Rare archive pieces reissued in limited quantities. Each piece comes with a certificate of authenticity and archival documentation.',
    heroImage: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800',
    accessLevel: 'uhni_only',
    products: products.filter(p => p.brandId === 'bottega-veneta').slice(0, 2),
    previewDate: '2025-01-10',
    releaseDate: '2025-02-28',
    invitationRequired: false,
    hasAccess: true,
    customer_ids: [],
    requested_customers: [],
  }
];

// ============================================
// UHNI PRICING & NEGOTIATION
// ============================================

export const mockPriceNegotiations: PriceNegotiation[] = [
  {
    id: 'neg-1',
    productId: 'hermes-birkin-30',
    productName: 'Birkin 30 Togo Gold',
    productImage: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800',
    brandName: 'Hermès',
    originalPrice: 21500,
    proposedPrice: 19500,
    counterOffer: 20200,
    status: 'counter_offered',
    conciergeNotes: [
      'Based on your history with the brand, we\'ve secured a special consideration.',
      'Counter offer includes complimentary leather care kit and priority servicing.'
    ],
    createdAt: '2025-01-15T10:00:00Z',
    expiresAt: '2025-02-01T23:59:59Z'
  },
  {
    id: 'neg-2',
    productId: 'dior-bar-jacket',
    productName: 'Bar Jacket Custom',
    productImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
    brandName: 'Dior',
    originalPrice: 12500,
    proposedPrice: 11000,
    status: 'pending',
    conciergeNotes: [
      'Negotiation in progress with the Dior atelier.',
      'Expected response within 48 hours.'
    ],
    createdAt: '2025-01-25T14:30:00Z',
    expiresAt: '2025-02-10T23:59:59Z'
  }
];

export const mockPriceOffers: UHNIPriceOffer[] = [
  {
    id: 'offer-1',
    type: 'brand',
    targetId: 'gucci',
    targetName: 'Gucci Loyalty Reward',
    targetImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
    discountType: 'percentage',
    discountValue: 15,
    validFrom: '2025-01-01',
    validUntil: '2025-02-28',
    claimed: false,
    conditions: ['Valid on full-price items', 'Minimum purchase €2,000']
  },
  {
    id: 'offer-2',
    type: 'collection',
    targetId: 'dior-spring-2025',
    targetName: 'Dior Spring 2025 Preview',
    targetImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    discountType: 'fixed',
    discountValue: 500,
    validFrom: '2025-01-15',
    validUntil: '2025-03-01',
    claimed: false,
    conditions: ['Valid on first purchase from collection', 'Cannot combine with other offers']
  },
  {
    id: 'offer-3',
    type: 'product',
    targetId: 'bottega-cassette',
    targetName: 'Bottega Cassette Bag',
    targetImage: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800',
    discountType: 'percentage',
    discountValue: 10,
    validFrom: '2025-01-20',
    validUntil: '2025-02-15',
    claimed: false,
    conditions: ['Limited to one per client']
  }
];

export const mockPriceAlerts: UHNIPriceAlert[] = [
  {
    id: 'alert-1',
    productId: 'lv-speedy-25',
    productName: 'Speedy Bandoulière 25',
    productImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    brandName: 'Louis Vuitton',
    targetPrice: 1400,
    currentPrice: 1590,
    triggered: false,
    createdAt: '2025-01-10T09:00:00Z'
  },
  {
    id: 'alert-2',
    productId: 'gucci-horsebit-loafer',
    productName: 'Horsebit Loafer',
    productImage: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800',
    brandName: 'Gucci',
    targetPrice: 800,
    currentPrice: 890,
    triggered: false,
    createdAt: '2025-01-18T11:30:00Z'
  }
];

export const mockPricingTiers: UHNIPricingTier[] = [
  {
    tier: 'standard',
    label: 'Standard',
    description: 'Standard retail pricing with seasonal promotions',
    benefits: ['Access to public sales', 'Standard shipping rates', 'General customer service']
  },
  {
    tier: 'preferred',
    label: 'Preferred',
    description: 'Enhanced pricing with loyalty benefits',
    benefits: ['Early access to sales', 'Free standard shipping', 'Priority customer service', 'Birthday discount (5%)'],
    averageDiscount: 5
  },
  {
    tier: 'uhni',
    label: 'UHNI Private',
    description: 'Exclusive pricing with concierge negotiation',
    benefits: [
      'Private negotiation on any item',
      'Pre-release pricing locks',
      'Bundle discount optimization',
      'Complimentary global shipping',
      'Dedicated concierge pricing support',
      'Price match guarantee across regions'
    ],
    averageDiscount: 12
  }
];

export const mockPricingSummary: UHNIPricingSummary = {
  lifetimeSavings: 47850,
  activeNegotiations: 2,
  pendingOffers: 3,
  priceAlertsSet: 2
};

// ============================================
// ENHANCED G-SAIL (GLOBAL SOURCING)
// ============================================

export const mockUHNIAvailabilitySearches: UHNIAvailabilitySearch[] = [
  {
    id: 'search-1',
    productId: 'hermes-kelly-28',
    productName: 'Kelly 28 Sellier Noir',
    productImage: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800',
    brandName: 'Hermès',
    status: 'found',
    priority: 'high',
    createdAt: '2025-01-20T08:00:00Z',
    conciergeAssigned: true,
    alternatives: [
      {
        id: 'alt-1',
        type: 'geography',
        region: 'Europe',
        city: 'Paris',
        boutiqueName: 'Hermès Faubourg Saint-Honoré',
        availabilityConfidence: 94,
        deliveryDays: 3,
        priceDifference: 0,
        reason: 'Available at flagship store. Priority allocation secured.',
        holdAvailable: true,
        holdExpiresAt: '2025-02-01T18:00:00Z',
        conciergeNote: 'Highly recommended - pristine condition, verified in person.',
        verifiedAt: '2025-01-28T10:00:00Z'
      },
      {
        id: 'alt-2',
        type: 'geography',
        region: 'Asia',
        city: 'Tokyo',
        boutiqueName: 'Hermès Ginza',
        availabilityConfidence: 87,
        deliveryDays: 5,
        priceDifference: 150,
        reason: 'In stock at Ginza boutique. Regional pricing applies.',
        holdAvailable: true,
        holdExpiresAt: '2025-02-02T12:00:00Z',
        verifiedAt: '2025-01-27T14:00:00Z'
      }
    ]
  },
  {
    id: 'search-2',
    productId: 'dior-saddle-vintage',
    productName: 'Saddle Bag Vintage 2000',
    productImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    brandName: 'Dior',
    status: 'searching',
    priority: 'standard',
    createdAt: '2025-01-25T11:00:00Z',
    conciergeAssigned: true,
    alternatives: []
  },
  {
    id: 'search-3',
    productId: 'bottega-pouch-large',
    productName: 'The Pouch Large',
    productImage: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800',
    brandName: 'Bottega Veneta',
    status: 'secured',
    priority: 'urgent',
    createdAt: '2025-01-18T09:00:00Z',
    conciergeAssigned: true,
    alternatives: [
      {
        id: 'alt-3',
        type: 'geography',
        region: 'Europe',
        city: 'Milan',
        boutiqueName: 'Bottega Veneta Via Montenapoleone',
        availabilityConfidence: 100,
        deliveryDays: 4,
        priceDifference: -80,
        reason: 'Secured and held for you. Ready for shipment.',
        holdAvailable: false,
        conciergeNote: 'Item secured on Jan 26. Awaiting your confirmation to ship.',
        verifiedAt: '2025-01-26T16:00:00Z'
      }
    ]
  }
];

export const mockGlobalNetworkStats: GlobalNetworkStats = {
  activeSearches: 3,
  regionsConnected: 47,
  boutiquesNetwork: 1250,
  averageDeliveryDays: 4.2,
  successRate: 94.7
};

export const mockRestockPredictions: RestockPrediction[] = [
  {
    productId: 'hermes-constance-mini',
    productName: 'Constance Mini 18',
    productImage: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800',
    brandName: 'Hermès',
    estimatedDate: '2025-02-15',
    probability: 78,
    alertEnabled: true
  },
  {
    productId: 'dior-book-tote',
    productName: 'Book Tote Medium',
    productImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    brandName: 'Dior',
    estimatedDate: '2025-02-08',
    probability: 85,
    alertEnabled: false
  }
];

// ============================================
// EXCLUSIVE EVENTS
// ============================================

export const mockExclusiveEvents: ExclusiveEvent[] = [
  {
    id: 'evt-001',
    title: 'Art of Haute Couture: Behind the Atelier',
    type: 'exhibition',
    host: 'Maison Valentino',
    venue: 'Palazzo Mignanelli',
    city: 'Rome',
    country: 'Italy',
    date: '2026-03-20',
    time: '17:00',
    description: 'A rare glimpse into the Valentino atelier. Witness master artisans at work, explore archive pieces spanning six decades, and enjoy a private dinner in the palazzo gardens.',
    highlights: ['Atelier tour', 'Archive viewing', 'Private dinner', 'Meet the artisans'],
    registrationStatus: 'open',
    maxAttendees: 25,
    spotsLeft: 8
  },
  {
    id: 'evt-002',
    title: 'Watchmaking Masterclass with Patek Philippe',
    type: 'masterclass',
    host: 'Patek Philippe',
    venue: 'Patek Philippe Salon',
    city: 'Geneva',
    country: 'Switzerland',
    date: '2026-04-10',
    time: '10:00',
    description: 'An immersive full-day masterclass in the art of haute horlogerie. Learn from master watchmakers, handle rare complications, and receive a certificate of completion.',
    highlights: ['Hands-on workshop', 'Rare piece handling', 'Certificate', 'Lunch with CEO'],
    registrationStatus: 'registered',
    maxAttendees: 12,
    spotsLeft: 0
  },
  {
    id: 'evt-003',
    title: 'Spring Gala: Fashion Forward Foundation',
    type: 'gala',
    host: 'Fashion Forward Foundation',
    venue: 'The Met',
    city: 'New York',
    country: 'United States',
    date: '2026-05-05',
    time: '19:30',
    description: 'Annual charity gala celebrating the intersection of fashion and sustainability. Black-tie event with live performances, silent auction, and networking with industry leaders.',
    highlights: ['Black-tie dinner', 'Silent auction', 'Live performances', 'Sustainability showcase'],
    registrationStatus: 'open',
    maxAttendees: 200,
    spotsLeft: 45
  }
];

// ============================================
// PRIVATE SHOPPING EVENTS
// ============================================

export const mockPrivateShoppingEvents: PrivateShoppingEvent[] = [
  {
    id: 'pse-001',
    title: 'Chanel Haute Couture Preview',
    designer: 'Chanel',
    venue: 'Palais de Tokyo',
    city: 'Paris',
    date: '2026-03-15',
    time: '18:00',
    duration: '3 hours',
    description: 'An exclusive preview of the upcoming Chanel Haute Couture collection. Private viewing with creative director, champagne reception, and first-access ordering.',
    status: 'upcoming',
    maxGuests: 30,
    guestsConfirmed: 18,
    dressCode: 'Black Tie Optional',
    perks: ['First access to order', 'Meet the designer', 'Champagne reception', 'Personal styling']
  },
  {
    id: 'pse-002',
    title: 'Brunello Cucinelli Private Trunk Show',
    designer: 'Brunello Cucinelli',
    venue: 'The Dorchester',
    city: 'London',
    date: '2026-04-02',
    time: '14:00',
    duration: '4 hours',
    description: 'Private trunk show featuring the complete SS26 collection. Personal consultation with Italian artisans and made-to-measure services.',
    status: 'rsvp_confirmed',
    maxGuests: 20,
    guestsConfirmed: 15,
    dressCode: 'Smart Casual',
    perks: ['Made-to-measure consultation', 'Artisan meet & greet', 'Afternoon tea', 'Exclusive pricing']
  },
  {
    id: 'pse-003',
    title: 'Loro Piana Winter Collection Preview',
    designer: 'Loro Piana',
    venue: 'Mandarin Oriental',
    city: 'Milan',
    date: '2026-02-28',
    time: '19:00',
    duration: '2.5 hours',
    description: 'An intimate evening showcasing Loro Piana\'s finest cashmere and vicuña pieces. Limited edition items available exclusively at this event.',
    status: 'invite_only',
    maxGuests: 15,
    guestsConfirmed: 12,
    dressCode: 'Cocktail',
    perks: ['Limited edition access', 'Fabric workshop', 'Wine tasting', 'Custom monogramming']
  }
];

// ============================================
// HERITAGE ARCHIVE
// ============================================

export const mockHeritageArchiveItems: HeritageArchiveItem[] = [
  {
    id: 'ha-001',
    title: 'The Original Bar Jacket',
    brand: 'Dior',
    era: '1947',
    description: 'The iconic Bar Jacket from Christian Dior\'s revolutionary "New Look" collection that transformed post-war fashion. Featuring nipped waist and full skirt silhouette.',
    significance: 'Defined the post-war feminine silhouette and established Dior as a global fashion house.',
    image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800',
    relatedProducts: ['dior-bar-jacket']
  },
  {
    id: 'ha-002',
    title: 'Kelly Bag Prototype',
    brand: 'Hermès',
    era: '1956',
    description: 'One of the earliest versions of the Kelly bag, renamed after Grace Kelly was photographed shielding her pregnancy with it. Hand-stitched saddle leather with palladium hardware.',
    significance: 'Transformed from a functional saddle bag to the most coveted luxury accessory in history.',
    image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800',
    relatedProducts: ['hermes-kelly-28']
  },
  {
    id: 'ha-003',
    title: 'Intrecciato Weave Sample',
    brand: 'Bottega Veneta',
    era: '1966',
    description: 'An original sample of the signature intrecciato weave technique developed in the Bottega Veneta workshop in Vicenza. This weaving method became the house\'s defining motif.',
    significance: 'The intrecciato weave became synonymous with understated luxury and "when your own initials are enough."',
    image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800',
    relatedProducts: ['bottega-cassette']
  }
];

// ============================================
// INTELLIGENCE INSIGHTS
// ============================================

export const mockIntelligenceInsights: IntelligenceInsight[] = [
  {
    id: 'ins-001',
    title: 'Quiet Luxury Continues to Rise',
    category: 'style_trend',
    summary: 'Demand for understated, logo-free luxury items has increased 34% this quarter. Brands like Loro Piana, Brunello Cucinelli, and The Row are seeing record engagement.',
    impact: 'high',
    trend: 'rising',
    confidence: 92,
    date: '2026-02-15'
  },
  {
    id: 'ins-002',
    title: 'Vintage Hermès Investment Value',
    category: 'investment_piece',
    summary: 'Pre-owned Hermès bags have appreciated 14.2% year-over-year, outperforming the S&P 500. Birkin 25 in exotic leathers showing highest appreciation.',
    impact: 'high',
    trend: 'rising',
    confidence: 88,
    date: '2026-02-10'
  },
  {
    id: 'ins-003',
    title: 'Wardrobe Gap: Evening Wear',
    category: 'wardrobe_gap',
    summary: 'Based on your upcoming calendar events and current wardrobe analysis, you may want to consider adding a formal evening gown. Three events in the next 60 days require black-tie attire.',
    impact: 'medium',
    trend: 'stable',
    confidence: 85,
    date: '2026-02-08'
  },
  {
    id: 'ins-004',
    title: 'Asian Market Luxury Rebound',
    category: 'market_signal',
    summary: 'Chinese luxury spending is rebounding strongly with a 22% increase in Q1 projections. Japanese market continues its steady growth at 8% YoY.',
    impact: 'medium',
    trend: 'rising',
    confidence: 79,
    date: '2026-02-05'
  }
];

// ============================================
// U13: ZERO-UI COMMERCE CONFIG
// ============================================

export const mockZeroUIConfig: ZeroUIConfig = {
  autoReplenish: true,
  invisibleCheckout: false,
  wardrobePreparation: true,
  triggers: [
    {
      id: 'trigger-1',
      type: 'restock',
      description: 'Auto-restock signature fragrances when supply drops below 30 days',
      enabled: true,
      lastTriggered: '2026-01-28T10:00:00Z'
    },
    {
      id: 'trigger-2',
      type: 'seasonal',
      description: 'Prepare seasonal wardrobe transition pieces 4 weeks before equinox',
      enabled: true,
      lastTriggered: '2025-12-15T08:00:00Z'
    },
    {
      id: 'trigger-3',
      type: 'event',
      description: 'Source outfit options 2 weeks before calendar events',
      enabled: false
    },
    {
      id: 'trigger-4',
      type: 'travel',
      description: 'Prepare travel wardrobe based on destination weather and itinerary',
      enabled: true,
      lastTriggered: '2026-02-01T14:00:00Z'
    }
  ],
  preferences: {
    maxAutoSpend: 5000,
    preferredBrands: ['Hermès', 'Dior', 'Loro Piana', 'Brunello Cucinelli'],
    excludedCategories: ['swimwear', 'sportswear'],
    notifyBefore: true,
    notifyAfter: true
  }
};

// ============================================
// U14: INVISIBLE TRANSACTIONS
// ============================================

export const mockInvisibleTransactions: InvisibleTransaction[] = [
  {
    id: 'inv-001',
    productId: 'hermes-silk-scarf',
    productName: 'Hermès Silk Carré 90',
    productImage: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800',
    method: 'auto',
    status: 'completed',
    discretionLevel: 'standard',
    noDigitalTrail: false,
    amount: 450,
    date: '2026-02-10T09:30:00Z'
  },
  {
    id: 'inv-002',
    productId: 'dior-sauvage-refill',
    productName: 'Dior Sauvage Parfum Refill',
    productImage: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800',
    method: 'scheduled',
    status: 'processing',
    discretionLevel: 'high',
    noDigitalTrail: false,
    amount: 180,
    date: '2026-02-14T08:00:00Z'
  },
  {
    id: 'inv-003',
    productId: 'cartier-love-bracelet',
    productName: 'Cartier Love Bracelet Rose Gold',
    productImage: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800',
    method: 'concierge',
    status: 'pending',
    discretionLevel: 'maximum',
    noDigitalTrail: true,
    amount: 7650,
    date: '2026-02-16T11:00:00Z'
  }
];

// ============================================
// U15: CONCIERGE TASKS
// ============================================

export const mockConciergeTasks: ConciergeTask[] = [
  {
    id: 'task-001',
    type: 'styling',
    title: 'Monaco GP Weekend Styling',
    description: 'Prepare complete looks for three Monaco GP events: yacht party, race day, and gala dinner.',
    status: 'in_progress',
    assignedTo: 'Isabella Martinez',
    priority: 'high',
    dueDate: '2026-05-10',
    notes: ['Client prefers European designers', 'No repeat brands across events', 'Jewelry coordination needed'],
    clientInstructions: 'Please ensure all outfits are comfortable for warm weather. I prefer minimal accessories.',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-15T14:30:00Z'
  },
  {
    id: 'task-002',
    type: 'sourcing',
    title: 'Vintage Chanel Jacket Search',
    description: 'Locate a vintage Chanel tweed jacket from the 1990s Karl Lagerfeld era, size 38.',
    status: 'pending',
    assignedTo: 'Isabella Martinez',
    priority: 'medium',
    dueDate: '2026-03-30',
    notes: ['Checking Paris vintage dealers', 'Vestiaire Collective monitoring active'],
    createdAt: '2026-02-10T09:00:00Z',
    updatedAt: '2026-02-10T09:00:00Z'
  },
  {
    id: 'task-003',
    type: 'reservation',
    title: 'Dior Private Viewing Reservation',
    description: 'Reserve private viewing appointment at Dior 30 Montaigne for client visit to Paris.',
    status: 'completed',
    assignedTo: 'Isabella Martinez',
    priority: 'medium',
    dueDate: '2026-02-20',
    notes: ['Confirmed for Feb 22 at 14:00', 'VIP salon reserved', 'Champagne service arranged'],
    createdAt: '2026-02-05T11:00:00Z',
    updatedAt: '2026-02-12T16:00:00Z'
  },
  {
    id: 'task-004',
    type: 'alteration',
    title: 'Bar Jacket Final Fitting',
    description: 'Coordinate final fitting for bespoke Dior Bar Jacket at Paris atelier.',
    status: 'pending',
    assignedTo: 'Isabella Martinez',
    priority: 'urgent',
    dueDate: '2026-02-25',
    notes: ['Atelier confirmed availability', 'Transport arranged from hotel'],
    clientInstructions: 'I will be in Paris Feb 23-26. Morning appointments preferred.',
    createdAt: '2026-02-08T08:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z'
  }
];

// ============================================
// U16: SILENT COMMERCE ITEMS
// ============================================

export const mockSilentCommerceItems: SilentCommerceItem[] = [
  {
    id: 'sc-001',
    productId: 'loro-piana-cashmere-throw',
    productName: 'Loro Piana Baby Cashmere Throw',
    productImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    brandName: 'Loro Piana',
    price: 2850,
    awareness: 'passive',
    context: 'Based on your home decor preferences and upcoming winter travel to Aspen.',
    displayMode: 'ambient',
    relevanceScore: 78
  },
  {
    id: 'sc-002',
    productId: 'brunello-cucinelli-blazer',
    productName: 'Brunello Cucinelli Linen Blazer',
    productImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
    brandName: 'Brunello Cucinelli',
    price: 3200,
    awareness: 'active',
    context: 'Complements 4 items in your wardrobe. Last one in your size at Milan boutique.',
    displayMode: 'card',
    relevanceScore: 92
  },
  {
    id: 'sc-003',
    productId: 'hermes-garden-party',
    productName: 'Hermès Garden Party 36',
    productImage: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800',
    brandName: 'Hermès',
    price: 3400,
    awareness: 'urgent',
    context: 'Rare color just became available. Only 2 units globally. Your concierge can secure it.',
    displayMode: 'notification',
    relevanceScore: 97
  }
];

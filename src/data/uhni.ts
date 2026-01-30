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
  RestockPrediction
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
    hasAccess: true
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
    hasAccess: true
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
    hasAccess: false
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
    hasAccess: true
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

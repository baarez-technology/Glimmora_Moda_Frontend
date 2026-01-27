/**
 * Brand Partner Mock Data
 *
 * Mock data for the Brand Partner portal including profile, stats,
 * bespoke requests, analytics, collections, and AGI configuration.
 */

import type {
  BrandPartner,
  BrandDashboardStats,
  BrandBespokeRequest,
  BrandAnalytics,
  BrandCollection,
  BrandAGIConfig
} from '@/types/brand-partner';

// ============================================
// BRAND PARTNER PROFILE
// ============================================

export const mockBrandPartner: BrandPartner = {
  id: 'brand-001',
  brandId: 'ml-2024-001',
  brandName: 'Maison Lumière',
  brandSlug: 'maison-lumiere',
  tier: 'premium',
  joinedAt: '2024-01-15',
  name: 'Sophie Laurent',
  role: 'brand_director',
  email: 'sophie@maisonlumiere.com',
  brandLogo: 'https://images.unsplash.com/photo-1599751449181-019f82d0c69e?w=200',
  avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
  permissions: ['manage_products', 'view_analytics', 'manage_collections', 'view_customers']
};

// ============================================
// DASHBOARD STATISTICS
// ============================================

export const mockBrandDashboardStats: BrandDashboardStats = {
  totalProducts: 142,
  activeProducts: 128,
  activeCollections: 8,
  bespokeRequests: 12,
  boutiqueCount: 24,
  totalRevenue: 18500000,
  revenueChange: 24,
  averageDemandScore: 87,
  topPerformingBoutique: 'Avenue Montaigne'
};

// ============================================
// BESPOKE REQUESTS
// ============================================

export const mockBrandBespokeRequests: BrandBespokeRequest[] = [
  {
    id: 'bsp-001',
    title: 'Met Gala 2025 Evening Gown',
    customerId: 'client-142',
    customerTier: 'UHNI',
    type: 'couture_gown',
    description: 'Custom evening gown for Met Gala 2025 with hand-embroidered details and sustainable silk',
    specifications: ['Hand-embroidered details', 'Sustainable silk', 'Custom color matching', 'Fitted bodice'],
    budget: {
      min: 45000,
      max: 75000,
      flexible: true
    },
    status: 'in-progress',
    createdAt: '2025-01-10',
    deadline: '2025-04-15',
    quotedPrice: 62000,
    estimatedCompletionDate: '2025-04-01',
    notes: [
      {
        id: 'note-001',
        author: 'Sophie Laurent',
        authorRole: 'creative_director',
        isInternal: false,
        timestamp: '2025-01-12T10:30:00Z',
        content: 'Initial design consultation completed. Client approved sketch #3 with modifications to neckline.'
      },
      {
        id: 'note-002',
        author: 'Design Team',
        authorRole: 'atelier',
        isInternal: true,
        timestamp: '2025-01-14T15:45:00Z',
        content: 'Silk sourced from sustainable supplier in Como. Embroidery pattern finalized.'
      }
    ]
  },
  {
    id: 'bsp-002',
    title: 'Three-Piece Bespoke Suit',
    customerId: 'client-298',
    customerTier: 'Premium',
    type: 'bespoke_tailoring',
    description: 'Three-piece wool suit with custom embroidery for executive boardroom presence',
    specifications: ['Italian wool', 'Custom embroidery', 'Peak lapels', 'Double-breasted waistcoat'],
    budget: {
      min: 8000,
      max: 12000,
      flexible: false
    },
    status: 'pending',
    createdAt: '2025-01-15',
    deadline: '2025-02-28',
    notes: [
      {
        id: 'note-003',
        author: 'Marcus Williams',
        authorRole: 'client',
        isInternal: false,
        timestamp: '2025-01-16T09:00:00Z',
        content: 'Would like to add monogram to waistcoat lining. Can we discuss fabric options?'
      }
    ]
  }
];

// ============================================
// ANALYTICS
// ============================================

export const mockBrandAnalytics: BrandAnalytics = {
  demandSignals: [
    {
      productId: 'prod-001',
      productName: 'Silk Evening Dress',
      productImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400',
      category: 'evening wear',
      demandScore: 92,
      trend: 'rising',
      trendChange: 24,
      signals: ['High search volume', 'Instagram mentions', 'UHNI interest'],
      topRegions: ['North America', 'Europe', 'Middle East'],
      forecastedDemand: 285,
      confidenceLevel: 87
    },
    {
      productId: 'prod-002',
      productName: 'Cashmere Blazer',
      productImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
      category: 'ready to wear',
      demandScore: 78,
      trend: 'stable',
      trendChange: 2,
      signals: ['Consistent orders', 'Seasonal demand'],
      topRegions: ['Asia Pacific', 'Europe', 'North America'],
      forecastedDemand: 156,
      confidenceLevel: 92
    }
  ],
  regionalInsights: [
    {
      region: 'North America',
      countries: ['United States', 'Canada', 'Mexico'],
      marketPotential: 'high',
      demandIndex: 85,
      topCategories: ['Evening Wear', 'Accessories'],
      culturalContext: 'Strong preference for sustainable luxury',
      seasonalTrend: 'Spring/Summer peak',
      recommendedLaunchTiming: 'Q2 2026'
    },
    {
      region: 'Asia Pacific',
      countries: ['Japan', 'Singapore', 'South Korea', 'Hong Kong'],
      marketPotential: 'high',
      demandIndex: 94,
      topCategories: ['Handbags', 'Ready-to-Wear'],
      culturalContext: 'Growing demand for heritage pieces',
      seasonalTrend: 'Year-round steady',
      recommendedLaunchTiming: 'Q1 2026'
    }
  ],
  vipDemandForecast: [
    {
      segment: 'Ultra High Net Worth',
      demandLevel: 88,
      predictedDemand: 245,
      averageSpend: 450000,
      growthPotential: 32,
      keyDrivers: ['Exclusive collections', 'Bespoke services'],
      topProducts: ['Evening Gowns', 'Leather Goods', 'Fine Jewelry']
    },
    {
      segment: 'Preferred Members',
      demandLevel: 72,
      predictedDemand: 892,
      averageSpend: 85000,
      growthPotential: 18,
      keyDrivers: ['New arrivals', 'Limited editions'],
      topProducts: ['Ready-to-Wear', 'Accessories', 'Footwear']
    }
  ],
  boutiquePerformance: [
    {
      boutiqueId: 'bout-001',
      boutiqueName: 'Avenue Montaigne Flagship',
      city: 'Paris',
      country: 'France',
      performanceScore: 94,
      trend: 'up',
      monthlyRevenue: 2850000,
      salesVolume: 228,
      averageOrderValue: 12500,
      topProducts: ['Evening Gowns', 'Leather Bags', 'Fine Jewelry']
    },
    {
      boutiqueId: 'bout-002',
      boutiqueName: 'Madison Avenue',
      city: 'New York',
      country: 'USA',
      performanceScore: 88,
      trend: 'stable',
      monthlyRevenue: 1960000,
      salesVolume: 200,
      averageOrderValue: 9800,
      topProducts: ['Ready-to-Wear', 'Accessories', 'Footwear']
    },
    {
      boutiqueId: 'bout-003',
      boutiqueName: 'Ginza',
      city: 'Tokyo',
      country: 'Japan',
      performanceScore: 91,
      trend: 'up',
      monthlyRevenue: 2324000,
      salesVolume: 207,
      averageOrderValue: 11200,
      topProducts: ['Handbags', 'Scarves', 'Watches']
    }
  ]
};

// ============================================
// COLLECTIONS
// ============================================

export const mockBrandCollections: BrandCollection[] = [
  {
    id: 'coll-001',
    name: 'Spring Awakening 2026',
    season: 'Spring/Summer',
    year: 2026,
    description: 'Celebrating renewal and rebirth with sustainable silk, organic cotton, and regenerative wool. A modern interpretation of classic tailoring.',
    heroImage: 'https://images.unsplash.com/photo-1558769132-cb1aea1c3c23?w=600',
    status: 'active',
    productCount: 42,
    launchDate: '2026-02-15',
    performance: {
      totalSales: 3850000,
      averageRating: 4.8,
      topProduct: 'Silk Midi Dress'
    }
  },
  {
    id: 'coll-002',
    name: 'Autumn Heritage',
    season: 'Fall/Winter',
    year: 2025,
    description: 'Drawing from our archives, reimagined for the contemporary wardrobe with rich textures and timeless silhouettes.',
    heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600',
    status: 'active',
    productCount: 38,
    launchDate: '2025-09-01',
    performance: {
      totalSales: 2940000,
      averageRating: 4.7,
      topProduct: 'Cashmere Overcoat'
    }
  },
  {
    id: 'coll-003',
    name: 'Summer Nights 2026',
    season: 'Spring/Summer',
    year: 2026,
    description: 'Ethereal evening wear inspired by Mediterranean sunsets. Coming this June.',
    heroImage: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600',
    status: 'preview',
    productCount: 28,
    launchDate: '2026-06-01'
  }
];

// ============================================
// AGI CONFIGURATION
// ============================================

export const mockBrandAGIConfig: BrandAGIConfig = {
  enabled: true,
  conciergePersonality: {
    tone: 'artistic',
    formality: 8,
    expertise: ['Heritage', 'Craftsmanship', 'Sustainable Fashion', 'Art History']
  },
  brandVoiceGuidelines: 'Speak with quiet confidence. Emphasize craftsmanship, heritage, and timeless elegance. Avoid trends; focus on enduring style.',
  preferredPhrases: ['Crafted by hand', 'Timeless elegance', 'Heritage inspired', 'Artisanal quality'],
  prohibitedTopics: ['Discounts', 'Sales', 'Fast fashion comparisons', 'Mass production'],
  responseTemplates: [
    {
      id: 'tpl-001',
      category: 'Product Inquiry',
      trigger: 'tell me about this product',
      response: 'This piece is crafted from premium materials using traditional techniques passed down through generations...',
      isActive: true
    },
    {
      id: 'tpl-002',
      category: 'Heritage',
      trigger: 'brand history',
      response: 'Our maison was founded with a commitment to preserving artisanal excellence and timeless design...',
      isActive: true
    }
  ],
  escalationRules: [
    {
      id: 'esc-001',
      condition: 'Bespoke request over €50,000',
      priority: 'high',
      action: 'route_to_specialist',
      notifyRoles: ['creative_director', 'senior_stylist']
    },
    {
      id: 'esc-002',
      condition: 'UHNI client inquiry',
      priority: 'high',
      action: 'assign_concierge',
      notifyRoles: ['concierge_lead']
    },
    {
      id: 'esc-003',
      condition: 'Complex product customization',
      priority: 'medium',
      action: 'request_human_review',
      notifyRoles: ['product_specialist']
    }
  ]
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getBrandPartner(): BrandPartner {
  return mockBrandPartner;
}

export function getBrandDashboardStats(): BrandDashboardStats {
  return mockBrandDashboardStats;
}

export function getBrandBespokeRequests(): BrandBespokeRequest[] {
  return mockBrandBespokeRequests;
}

export function getBrandBespokeRequestById(id: string): BrandBespokeRequest | undefined {
  return mockBrandBespokeRequests.find(r => r.id === id);
}

export function getBrandAnalytics(): BrandAnalytics {
  return mockBrandAnalytics;
}

export function getBrandCollections(): BrandCollection[] {
  return mockBrandCollections;
}

export function getBrandCollectionById(id: string): BrandCollection | undefined {
  return mockBrandCollections.find(c => c.id === id);
}

export function getBrandAGIConfig(): BrandAGIConfig {
  return mockBrandAGIConfig;
}

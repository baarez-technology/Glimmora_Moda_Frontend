'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Brand Partner types (from old AppContext)
export interface BrandPartner {
  id: string;
  brandId: string;
  brandName: string;
  brandSlug: string;
  tier: 'established' | 'emerging' | 'premium';
  joinedAt: string;
  name: string;
  role: string;
  email: string;
  brandLogo?: string;
  avatar?: string;
  permissions: string[];
}

export interface BrandDashboardStats {
  totalProducts: number;
  activeProducts: number;
  activeCollections: number;
  bespokeRequests: number;
  boutiqueCount: number;
  totalRevenue: number;
  revenueChange: number;
  averageDemandScore: number;
  topPerformingBoutique: string;
}

export interface BrandBespokeRequest {
  id: string;
  title: string;
  customerId: string;
  customerTier: string;
  type: string;
  description: string;
  specifications: string[];
  budget: {
    min: number;
    max: number;
    flexible: boolean;
  };
  status: 'pending' | 'reviewing' | 'in-progress' | 'in_production' | 'completed';
  createdAt: string;
  deadline?: string;
  quotedPrice?: number;
  estimatedCompletionDate?: string;
  notes: Array<{
    id: string;
    author: string;
    authorRole: string;
    isInternal: boolean;
    timestamp: string;
    content: string;
  }>;
}

export interface BrandAnalytics {
  demandSignals: Array<{
    productId: string;
    productName: string;
    productImage: string;
    category: string;
    demandScore: number;
    trend: 'rising' | 'stable' | 'declining';
    trendChange: number;
    signals: string[];
    topRegions: string[];
    forecastedDemand: number;
    confidenceLevel: number;
  }>;
  regionalInsights: Array<{
    region: string;
    countries: string[];
    marketPotential: 'high' | 'medium' | 'low';
    demandIndex: number;
    topCategories: string[];
    culturalContext: string;
    seasonalTrend: string;
    recommendedLaunchTiming: string;
  }>;
  vipDemandForecast: Array<{
    segment: string;
    demandLevel: number;
    predictedDemand: number;
    averageSpend: number;
    growthPotential: number;
    keyDrivers: string[];
    topProducts: string[];
  }>;
  boutiquePerformance: Array<{
    boutiqueId: string;
    boutiqueName: string;
    city: string;
    country: string;
    performanceScore: number;
    trend: 'up' | 'stable' | 'down';
    monthlyRevenue: number;
    salesVolume: number;
    averageOrderValue: number;
    topProducts: string[];
  }>;
}

export interface BrandCollection {
  id: string;
  name: string;
  season: string;
  year: number;
  description: string;
  heroImage: string;
  status: 'active' | 'preview' | 'archived';
  productCount: number;
  launchDate: string;
  performance?: {
    totalSales: number;
    averageRating: number;
    topProduct: string;
  };
}

export interface BrandAGIConfig {
  enabled: boolean;
  conciergePersonality: {
    tone: 'formal' | 'warm' | 'artistic' | 'technical';
    formality: number;
    expertise: string[];
  };
  brandVoiceGuidelines: string;
  preferredPhrases: string[];
  prohibitedTopics: string[];
  responseTemplates: Array<{
    id: string;
    category: string;
    trigger: string;
    response: string;
    isActive: boolean;
  }>;
  escalationRules: Array<{
    id: string;
    condition: string;
    priority: 'low' | 'medium' | 'high';
    action: string;
    notifyRoles: string[];
  }>;
}

interface BrandContextType {
  brandPartner: BrandPartner | null;
  brandDashboardStats: BrandDashboardStats | null;
  brandBespokeRequests: BrandBespokeRequest[] | null;
  brandAnalytics: BrandAnalytics | null;
  brandAGIConfig: BrandAGIConfig | null;
  brandCollections: BrandCollection[] | null;
  brandProductInventory: any[] | null;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const { isBrand } = useAuth();

  // Brand Partner-specific data (only loaded for Brand users)
  const brandPartner = isBrand ? {
    id: 'brand-001',
    brandId: 'ml-2024-001',
    brandName: 'Maison Lumière',
    brandSlug: 'maison-lumiere',
    tier: 'premium' as const,
    joinedAt: '2024-01-15',
    name: 'Sophie Laurent',
    role: 'brand_director',
    email: 'sophie@maisonlumiere.com',
    brandLogo: 'https://images.unsplash.com/photo-1599751449181-019f82d0c69e?w=200',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    permissions: ['manage_products', 'view_analytics', 'manage_collections', 'view_customers']
  } : null;

  const brandDashboardStats = isBrand ? {
    totalProducts: 142,
    activeProducts: 128,
    activeCollections: 8,
    bespokeRequests: 12,
    boutiqueCount: 24,
    totalRevenue: 18500000,
    revenueChange: 24,
    averageDemandScore: 87,
    topPerformingBoutique: 'Avenue Montaigne'
  } : null;

  const brandBespokeRequests = isBrand ? [
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
      status: 'in-progress' as const,
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
      status: 'pending' as const,
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
  ] : null;

  const brandAnalytics = isBrand ? {
    demandSignals: [
      {
        productId: 'prod-001',
        productName: 'Silk Evening Dress',
        productImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400',
        category: 'evening wear',
        demandScore: 92,
        trend: 'rising' as const,
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
        trend: 'stable' as const,
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
        marketPotential: 'high' as const,
        demandIndex: 85,
        topCategories: ['Evening Wear', 'Accessories'],
        culturalContext: 'Strong preference for sustainable luxury',
        seasonalTrend: 'Spring/Summer peak',
        recommendedLaunchTiming: 'Q2 2026'
      },
      {
        region: 'Asia Pacific',
        countries: ['Japan', 'Singapore', 'South Korea', 'Hong Kong'],
        marketPotential: 'high' as const,
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
        trend: 'up' as const,
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
        trend: 'stable' as const,
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
        trend: 'up' as const,
        monthlyRevenue: 2324000,
        salesVolume: 207,
        averageOrderValue: 11200,
        topProducts: ['Handbags', 'Scarves', 'Watches']
      }
    ]
  } : null;

  const brandAGIConfig = isBrand ? {
    enabled: true,
    conciergePersonality: {
      tone: 'artistic' as const,
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
        priority: 'high' as const,
        action: 'route_to_specialist',
        notifyRoles: ['creative_director', 'senior_stylist']
      },
      {
        id: 'esc-002',
        condition: 'UHNI client inquiry',
        priority: 'high' as const,
        action: 'assign_concierge',
        notifyRoles: ['concierge_lead']
      },
      {
        id: 'esc-003',
        condition: 'Complex product customization',
        priority: 'medium' as const,
        action: 'request_human_review',
        notifyRoles: ['product_specialist']
      }
    ]
  } : null;

  const brandProductInventory = isBrand ? [] : null;

  const brandCollections = isBrand ? [
    {
      id: 'coll-001',
      name: 'Spring Awakening 2026',
      season: 'Spring/Summer',
      year: 2026,
      description: 'Celebrating renewal and rebirth with sustainable silk, organic cotton, and regenerative wool. A modern interpretation of classic tailoring.',
      heroImage: 'https://images.unsplash.com/photo-1558769132-cb1aea1c3c23?w=600',
      status: 'active' as const,
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
      status: 'active' as const,
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
      status: 'preview' as const,
      productCount: 28,
      launchDate: '2026-06-01'
    }
  ] : null;

  return (
    <BrandContext.Provider
      value={{
        brandPartner,
        brandDashboardStats,
        brandBespokeRequests,
        brandAnalytics,
        brandAGIConfig,
        brandCollections,
        brandProductInventory
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
}

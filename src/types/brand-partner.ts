/**
 * Brand Partner Types
 *
 * Types for the Brand Partner portal including dashboard stats,
 * bespoke requests, analytics, collections, and AGI configuration.
 */

// ============================================
// Brand Partner Profile
// ============================================

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

// ============================================
// Dashboard Statistics
// ============================================

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

// ============================================
// Bespoke Requests
// ============================================

export interface BrandBespokeNote {
  id: string;
  author: string;
  authorRole: string;
  isInternal: boolean;
  timestamp: string;
  content: string;
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
  notes: BrandBespokeNote[];
}

// ============================================
// Analytics
// ============================================

export interface DemandSignal {
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
}

export interface RegionalInsight {
  region: string;
  countries: string[];
  marketPotential: 'high' | 'medium' | 'low';
  demandIndex: number;
  topCategories: string[];
  culturalContext: string;
  seasonalTrend: string;
  recommendedLaunchTiming: string;
}

export interface VIPDemandForecast {
  segment: string;
  demandLevel: number;
  predictedDemand: number;
  averageSpend: number;
  growthPotential: number;
  keyDrivers: string[];
  topProducts: string[];
}

export interface BoutiquePerformance {
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
}

export interface BrandAnalytics {
  demandSignals: DemandSignal[];
  regionalInsights: RegionalInsight[];
  vipDemandForecast: VIPDemandForecast[];
  boutiquePerformance: BoutiquePerformance[];
}

// ============================================
// Collections
// ============================================

export interface BrandCollectionPerformance {
  totalSales: number;
  averageRating: number;
  topProduct: string;
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
  performance?: BrandCollectionPerformance;
}

// ============================================
// AGI Configuration
// ============================================

export interface AGIConciergePersonality {
  tone: 'formal' | 'warm' | 'artistic' | 'technical';
  formality: number;
  expertise: string[];
}

export interface AGIResponseTemplate {
  id: string;
  category: string;
  trigger: string;
  response: string;
  isActive: boolean;
}

export interface AGIEscalationRule {
  id: string;
  condition: string;
  priority: 'low' | 'medium' | 'high';
  action: string;
  notifyRoles: string[];
}

export interface BrandAGIConfig {
  enabled: boolean;
  conciergePersonality: AGIConciergePersonality;
  brandVoiceGuidelines: string;
  preferredPhrases: string[];
  prohibitedTopics: string[];
  responseTemplates: AGIResponseTemplate[];
  escalationRules: AGIEscalationRule[];
}

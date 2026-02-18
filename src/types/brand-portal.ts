/**
 * Brand Portal Types
 *
 * Type definitions for the B2B Brand Partner Dashboard.
 * Extends core product types with brand-specific management features.
 */

import type { Product, ProductCategory } from './product';

// ============================================
// BRAND PARTNER ACCOUNT
// ============================================

export type BrandPartnerTier = 'standard' | 'premium' | 'enterprise';
export type BrandPartnerStatus = 'active' | 'pending' | 'suspended';

export interface BrandTeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'analyst' | 'viewer';
  avatar?: string;
  lastActive: string;
}

export interface BrandAPIKey {
  id: string;
  name: string;
  keyPrefix: string; // e.g., "sk_live_****"
  createdAt: string;
  lastUsed?: string;
  permissions: ('read' | 'write' | 'delete')[];
}

export interface BrandSettings {
  notifications: {
    lowStockAlerts: boolean;
    orderUpdates: boolean;
    demandSignals: boolean;
    weeklyReports: boolean;
  };
  integration: {
    webhookUrl?: string;
    syncFrequency: 'realtime' | 'hourly' | 'daily';
  };
  display: {
    currency: string;
    timezone: string;
    language: string;
  };
}

export interface BrandPartner {
  id: string;
  brandId: string;
  brandName: string;
  brandLogo?: string;
  tier: BrandPartnerTier;
  status: BrandPartnerStatus;
  partnerSince: string;
  teamMembers: BrandTeamMember[];
  apiKeys: BrandAPIKey[];
  settings: BrandSettings;
}

// ============================================
// BRAND PRODUCTS
// ============================================

export type BrandProductStatus = 'draft' | 'published' | 'archived';

export interface RegionalStock {
  region: string;
  city: string;
  units: number;
  lowStockThreshold: number;
  lastUpdated: string;
}

export interface ProductPerformance {
  views: number;
  addToCart: number;
  purchases: number;
  conversionRate: number;
  revenue: number;
  avgTimeToDecision: number; // in hours
}

export interface BrandProduct extends Product {
  status: BrandProductStatus;
  sku: string;
  totalStock: number;
  regionalStock: RegionalStock[];
  demandScore: number; // 0-100
  performanceMetrics: ProductPerformance;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// BRAND COLLECTIONS
// ============================================

export interface BrandCollection {
  id: string;
  name: string;
  slug: string;
  season: string;
  year: number;
  description: string;
  heroImage: string;
  status: 'draft' | 'published' | 'archived';
  productIds: string[];
  productCount: number;
  totalRevenue: number;
  viewCount: number;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// GLOBAL INVENTORY (G-SAIL)
// ============================================

export type InventoryAlertType = 'low_stock' | 'out_of_stock' | 'restock_arriving' | 'overstock';
export type InventoryAlertPriority = 'low' | 'medium' | 'high' | 'critical';

export interface InventoryAlert {
  id: string;
  type: InventoryAlertType;
  priority: InventoryAlertPriority;
  productId: string;
  productName: string;
  region: string;
  city: string;
  currentStock: number;
  threshold?: number;
  message: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface CityInventory {
  city: string;
  units: number;
  value: number;
  changePercent: number;
}

export interface RegionInventory {
  region: string;
  totalUnits: number;
  totalValue: number;
  changePercent: number;
  cities: CityInventory[];
}

export interface GlobalInventoryOverview {
  totalUnits: number;
  totalValue: number;
  changePercent: number;
  regions: RegionInventory[];
  alerts: InventoryAlert[];
  lastSyncedAt: string;
}

// ============================================
// ANALYTICS & DEMAND SIGNALS
// ============================================

export type DemandSignalType = 'rising' | 'falling' | 'seasonal' | 'trending' | 'regional';

export interface DemandSignal {
  id: string;
  type: DemandSignalType;
  category?: ProductCategory;
  region?: string;
  title: string;
  description: string;
  changePercent: number;
  confidence: number; // 0-100
  actionable: boolean;
  suggestedAction?: string;
  createdAt: string;
}

export interface RevenueMetrics {
  current: number;
  previous: number;
  changePercent: number;
  currency: string;
  breakdown: {
    category: ProductCategory;
    revenue: number;
    percentage: number;
  }[];
}

export interface OrderMetrics {
  totalOrders: number;
  changePercent: number;
  averageOrderValue: number;
  aovChangePercent: number;
  returnsCount: number;
  returnRate: number;
}

export interface RegionalMetrics {
  region: string;
  revenue: number;
  orders: number;
  topProduct: string;
  changePercent: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sku: string;
  revenue: number;
  units: number;
  changePercent: number;
}

export interface BrandAnalytics {
  period: {
    start: string;
    end: string;
    label: string;
  };
  revenue: RevenueMetrics;
  orders: OrderMetrics;
  demandSignals: DemandSignal[];
  regionalMetrics: RegionalMetrics[];
  topProducts: TopProduct[];
}

// ============================================
// DASHBOARD SUMMARY
// ============================================

export interface DashboardMetric {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface RecentActivity {
  id: string;
  type: 'order' | 'restock' | 'product_update' | 'alert';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface BrandDashboardData {
  partner: BrandPartner;
  metrics: DashboardMetric[];
  recentActivity: RecentActivity[];
  alerts: InventoryAlert[];
  demandSignals: DemandSignal[];
}

// ============================================
// ORDERS
// ============================================

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tier?: 'standard' | 'preferred' | 'uhni';
}

export interface OrderShipping {
  address: string;
  city: string;
  country: string;
  postalCode: string;
  method: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface BrandOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  shippingInfo: OrderShipping;
  boutique: string;
  region: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// QUICK ACTIONS
// ============================================

export interface QuickAction {
  id: string;
  label: string;
  href: string;
  icon: string;
  description?: string;
}

// ============================================
// UHNI FEATURE TYPES (Re-export from uhni.ts)
// ============================================

export type {
  BespokeOrder,
  BespokeOrderStatus,
  BespokeOrderType,
  BespokeSpecification,
  BespokeTimelineStep,
  PriceNegotiation,
  NegotiationStatus,
  PrivateCollection,
  PrivateCollectionAccess,
  SourcingRequest,
  SourcingRequestStatus,
  SourcingRequestType,
  SourcingOption,
  SourcingNote,
  UHNIPriceOffer,
  UserTier
} from './uhni';

// ============================================
// HERITAGE EVENTS
// ============================================

export type HeritageEventSignificance = 'milestone' | 'collection' | 'innovation' | 'cultural' | 'collaboration' | 'award';

export interface HeritageEvent {
  id: string;
  brandId: string;
  year: number;
  title: string;
  description: string;
  longDescription?: string;
  image?: string;
  significance: HeritageEventSignificance;
  relatedProducts?: string[];
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// BRAND STORIES
// ============================================

export type BrandStoryType = 'heritage' | 'craftsmanship' | 'collection' | 'artisan';
export type BrandStoryStatus = 'draft' | 'published';

export interface StorySection {
  id: string;
  type: 'text' | 'image' | 'video' | 'quote' | 'timeline';
  content: string;
  caption?: string;
  mediaUrl?: string;
}

export interface BrandStory {
  id: string;
  brandId: string;
  title: string;
  type: BrandStoryType;
  excerpt: string;
  content: StorySection[];
  heroImage: string;
  publishedAt?: string;
  status: BrandStoryStatus;
  relatedProducts: string[];
  readTime: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// STYLING SESSIONS
// ============================================

export type StylingSessionType = 'virtual' | 'in_store' | 'home';
export type StylingSessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface StylingSession {
  id: string;
  brandId: string;
  scheduledAt: string;
  duration: number;
  type: StylingSessionType;
  status: StylingSessionStatus;
  notes?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerTier: 'standard' | 'preferred' | 'uhni';
  location?: string;
  stylistName?: string;
  createdAt: string;
  updatedAt: string;
}

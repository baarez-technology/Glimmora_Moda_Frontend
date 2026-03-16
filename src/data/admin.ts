/**
 * Admin Portal Mock Data
 *
 * Comprehensive mock data for the Admin Panel.
 * Uses fictional luxury fashion brand names for realism.
 */

import type {
  AdminUser,
  PlatformMetrics,
  DashboardActivity,
  PlatformUser,
  ManagedBrand,
  ModerationItem,
  FeatureFlag,
  PlatformConfig,
  AnalyticsReport,
  RevenueData,
  UserGrowthData,
  TopBrandData,
  CommissionRule,
  Payout,
  RevenueBreakdown,
  AuditLogEntry,
  SecurityAlert,
  GDPRRequest,
  ServiceHealth,
  SystemMetrics,
  ErrorLogEntry,
} from '@/types/admin';

// ============================================
// ADMIN USER
// ============================================

export function getAdminUser(): AdminUser {
  return {
    id: 'admin-001',
    name: 'Sanjay Mehta',
    email: 'sanjay@glimmora.com',
    role: 'super_admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    lastActive: '2026-03-11T09:30:00Z',
    createdAt: '2024-06-01T00:00:00Z',
  };
}

// ============================================
// PLATFORM METRICS
// ============================================

export function getPlatformMetrics(): PlatformMetrics {
  return {
    totalUsers: 48_520,
    activeUsers: 12_840,
    totalBrands: 156,
    activeBrands: 134,
    totalProducts: 18_472,
    totalOrders: 92_310,
    totalRevenue: 284_750_000,
    currency: 'USD',
    userGrowth: 12.4,
    brandGrowth: 8.7,
    orderGrowth: 15.2,
    revenueGrowth: 22.8,
  };
}

// ============================================
// DASHBOARD ACTIVITY
// ============================================

export function getDashboardActivity(): DashboardActivity[] {
  return [
    {
      id: 'act-001',
      type: 'brand_onboarding',
      message: 'Maison Lumière submitted brand verification documents',
      timestamp: '2026-03-11T08:45:00Z',
      severity: 'info',
    },
    {
      id: 'act-002',
      type: 'order_placed',
      message: 'UHNI client placed a $142,000 bespoke order with Atelier Dorée',
      timestamp: '2026-03-11T07:30:00Z',
      severity: 'success',
    },
    {
      id: 'act-003',
      type: 'content_flagged',
      message: 'Product listing from Haus von Prestige flagged for policy review',
      timestamp: '2026-03-11T06:15:00Z',
      severity: 'warning',
    },
    {
      id: 'act-004',
      type: 'brand_verified',
      message: 'Casa di Eleganza passed final verification — now active on platform',
      timestamp: '2026-03-10T22:00:00Z',
      severity: 'success',
    },
    {
      id: 'act-005',
      type: 'system_alert',
      message: 'CDN response times elevated in EU-West region for 12 minutes',
      timestamp: '2026-03-10T19:42:00Z',
      severity: 'warning',
    },
    {
      id: 'act-006',
      type: 'user_signup',
      message: '47 new consumer accounts created today — 3 flagged for UHNI qualification',
      timestamp: '2026-03-10T18:00:00Z',
      severity: 'info',
    },
    {
      id: 'act-007',
      type: 'order_placed',
      message: 'Heritage collection pre-order from La Maison Royale reached $890,000 GMV',
      timestamp: '2026-03-10T15:20:00Z',
      severity: 'success',
    },
    {
      id: 'act-008',
      type: 'content_flagged',
      message: 'Brand story from Atelier Dorée requires copyright attribution review',
      timestamp: '2026-03-10T14:05:00Z',
      severity: 'warning',
    },
    {
      id: 'act-009',
      type: 'brand_onboarding',
      message: 'Maison Céleste completed quality check — awaiting final approval',
      timestamp: '2026-03-10T11:30:00Z',
      severity: 'info',
    },
    {
      id: 'act-010',
      type: 'system_alert',
      message: 'Scheduled maintenance completed — payment gateway reconnected',
      timestamp: '2026-03-10T04:00:00Z',
      severity: 'info',
    },
  ];
}

// ============================================
// PLATFORM USERS
// ============================================

export function getPlatformUsers(): PlatformUser[] {
  return [
    {
      id: 'usr-001',
      name: 'Isabella Chen',
      email: 'isabella.chen@email.com',
      role: 'uhni',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      phone: '+1 212 555 0101',
      tier: 'Platinum',
      totalOrders: 89,
      totalSpend: 2_340_000,
      createdAt: '2024-09-15T00:00:00Z',
      lastLogin: '2026-03-11T08:12:00Z',
      isTwoFAEnabled: true,
    },
    {
      id: 'usr-002',
      name: 'Alexander Worthington',
      email: 'a.worthington@email.com',
      role: 'uhni',
      status: 'active',
      tier: 'Diamond',
      totalOrders: 142,
      totalSpend: 4_870_000,
      createdAt: '2024-07-01T00:00:00Z',
      lastLogin: '2026-03-10T21:45:00Z',
      isTwoFAEnabled: true,
    },
    {
      id: 'usr-003',
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      role: 'consumer',
      status: 'active',
      totalOrders: 12,
      totalSpend: 28_400,
      createdAt: '2025-06-20T00:00:00Z',
      lastLogin: '2026-03-11T07:00:00Z',
      isTwoFAEnabled: false,
    },
    {
      id: 'usr-004',
      name: 'Marcus Bellingham',
      email: 'marcus.b@email.com',
      role: 'consumer',
      status: 'active',
      totalOrders: 5,
      totalSpend: 14_200,
      createdAt: '2025-11-03T00:00:00Z',
      lastLogin: '2026-03-09T16:30:00Z',
      isTwoFAEnabled: true,
    },
    {
      id: 'usr-005',
      name: 'Sophie Laurent',
      email: 'sophie@maisonlumiere.com',
      role: 'brand',
      status: 'active',
      totalOrders: 0,
      totalSpend: 0,
      createdAt: '2025-01-10T00:00:00Z',
      lastLogin: '2026-03-11T09:15:00Z',
      isTwoFAEnabled: true,
    },
    {
      id: 'usr-006',
      name: 'Henrik Schreiber',
      email: 'henrik@hausvonprestige.com',
      role: 'brand',
      status: 'active',
      totalOrders: 0,
      totalSpend: 0,
      createdAt: '2024-11-22T00:00:00Z',
      lastLogin: '2026-03-10T18:00:00Z',
      isTwoFAEnabled: true,
    },
    {
      id: 'usr-007',
      name: 'Amara Okafor',
      email: 'amara.okafor@email.com',
      role: 'consumer',
      status: 'suspended',
      totalOrders: 2,
      totalSpend: 3_800,
      createdAt: '2025-12-01T00:00:00Z',
      lastLogin: '2026-02-28T10:00:00Z',
      isTwoFAEnabled: false,
    },
    {
      id: 'usr-008',
      name: 'James Harrington',
      email: 'james.h@email.com',
      role: 'uhni',
      status: 'active',
      tier: 'Gold',
      totalOrders: 34,
      totalSpend: 890_000,
      createdAt: '2025-03-15T00:00:00Z',
      lastLogin: '2026-03-11T06:00:00Z',
      isTwoFAEnabled: true,
    },
    {
      id: 'usr-009',
      name: 'Nadia Volkov',
      email: 'nadia.v@email.com',
      role: 'consumer',
      status: 'pending',
      totalOrders: 0,
      totalSpend: 0,
      createdAt: '2026-03-10T00:00:00Z',
      lastLogin: '2026-03-10T00:00:00Z',
      isTwoFAEnabled: false,
    },
    {
      id: 'usr-010',
      name: 'Ravi Kapoor',
      email: 'ravi@glimmora.com',
      role: 'admin',
      status: 'active',
      totalOrders: 0,
      totalSpend: 0,
      createdAt: '2024-08-01T00:00:00Z',
      lastLogin: '2026-03-11T09:00:00Z',
      isTwoFAEnabled: true,
    },
    {
      id: 'usr-011',
      name: 'Elena Rossi',
      email: 'elena@casadieleganza.com',
      role: 'brand',
      status: 'active',
      totalOrders: 0,
      totalSpend: 0,
      createdAt: '2025-08-15T00:00:00Z',
      lastLogin: '2026-03-10T14:30:00Z',
      isTwoFAEnabled: true,
    },
    {
      id: 'usr-012',
      name: 'Daniel Kim',
      email: 'daniel.kim@email.com',
      role: 'consumer',
      status: 'banned',
      totalOrders: 1,
      totalSpend: 950,
      createdAt: '2026-01-05T00:00:00Z',
      lastLogin: '2026-02-14T11:20:00Z',
      isTwoFAEnabled: false,
    },
  ];
}

// ============================================
// MANAGED BRANDS
// ============================================

export function getManagedBrands(): ManagedBrand[] {
  return [
    {
      id: 'brand-001',
      brandName: 'Maison Lumière',
      brandLogo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&q=80',
      category: 'Haute Couture',
      tier: 'heritage',
      status: 'active',
      contactName: 'Sophie Laurent',
      contactEmail: 'sophie@maisonlumiere.com',
      totalProducts: 342,
      totalRevenue: 48_200_000,
      commissionRate: 8,
      partnerSince: '2024-06-15',
      lastActive: '2026-03-11T09:15:00Z',
      performanceScore: 97,
    },
    {
      id: 'brand-002',
      brandName: 'Haus von Prestige',
      brandLogo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&q=80',
      category: 'Ready-to-Wear',
      tier: 'elite',
      status: 'active',
      contactName: 'Henrik Schreiber',
      contactEmail: 'henrik@hausvonprestige.com',
      totalProducts: 518,
      totalRevenue: 36_700_000,
      commissionRate: 10,
      partnerSince: '2024-11-22',
      lastActive: '2026-03-10T18:00:00Z',
      performanceScore: 92,
    },
    {
      id: 'brand-003',
      brandName: 'Casa di Eleganza',
      brandLogo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&q=80',
      category: 'Leather Goods',
      tier: 'elite',
      status: 'active',
      contactName: 'Elena Rossi',
      contactEmail: 'elena@casadieleganza.com',
      totalProducts: 186,
      totalRevenue: 29_400_000,
      commissionRate: 10,
      partnerSince: '2025-02-01',
      lastActive: '2026-03-10T14:30:00Z',
      performanceScore: 89,
    },
    {
      id: 'brand-004',
      brandName: 'Atelier Dorée',
      category: 'Fine Jewelry',
      tier: 'heritage',
      status: 'active',
      contactName: 'Camille Fontaine',
      contactEmail: 'camille@atelierdoree.com',
      totalProducts: 94,
      totalRevenue: 62_100_000,
      commissionRate: 8,
      partnerSince: '2024-03-01',
      lastActive: '2026-03-11T08:00:00Z',
      performanceScore: 98,
    },
    {
      id: 'brand-005',
      brandName: 'La Maison Royale',
      category: 'Haute Couture',
      tier: 'premium',
      status: 'active',
      contactName: 'Jean-Pierre Moreau',
      contactEmail: 'jp@lamaisonroyale.com',
      totalProducts: 210,
      totalRevenue: 19_800_000,
      commissionRate: 12,
      partnerSince: '2025-05-10',
      lastActive: '2026-03-10T15:45:00Z',
      performanceScore: 85,
    },
    {
      id: 'brand-006',
      brandName: 'Maison Céleste',
      category: 'Fragrances',
      tier: 'standard',
      status: 'pending',
      contactName: 'Margaux Deschamps',
      contactEmail: 'margaux@maisonceleste.com',
      totalProducts: 0,
      totalRevenue: 0,
      commissionRate: 15,
      verificationStep: 'final_approval',
      partnerSince: '2026-03-01',
      lastActive: '2026-03-10T11:30:00Z',
      performanceScore: 0,
    },
    {
      id: 'brand-007',
      brandName: 'Palazzo Sartoria',
      category: 'Bespoke Tailoring',
      tier: 'premium',
      status: 'suspended',
      contactName: 'Marco Benedetti',
      contactEmail: 'marco@palazzosartoria.com',
      totalProducts: 76,
      totalRevenue: 8_400_000,
      commissionRate: 12,
      partnerSince: '2025-01-20',
      lastActive: '2026-02-18T10:00:00Z',
      performanceScore: 62,
    },
    {
      id: 'brand-008',
      brandName: 'Soie Éternelle',
      category: 'Silk & Textiles',
      tier: 'standard',
      status: 'verified',
      contactName: 'Léa Beaumont',
      contactEmail: 'lea@soieeternelle.com',
      totalProducts: 48,
      totalRevenue: 1_200_000,
      commissionRate: 15,
      verificationStep: 'quality_check',
      partnerSince: '2026-02-10',
      lastActive: '2026-03-09T17:00:00Z',
      performanceScore: 74,
    },
  ];
}

// ============================================
// MODERATION QUEUE
// ============================================

export function getModerationQueue(): ModerationItem[] {
  return [
    {
      id: 'mod-001',
      contentType: 'product',
      title: 'Lumière Diamond Encrusted Evening Clutch',
      brandName: 'Maison Lumière',
      brandId: 'brand-001',
      submittedAt: '2026-03-11T07:00:00Z',
      status: 'pending',
      preview: 'Hand-crafted evening clutch with 18K white gold clasp and 2.4ct diamond pavé.',
    },
    {
      id: 'mod-002',
      contentType: 'story',
      title: 'The Art of Prussian Tailoring: A Heritage Journey',
      brandName: 'Haus von Prestige',
      brandId: 'brand-002',
      submittedAt: '2026-03-11T06:30:00Z',
      status: 'pending',
      preview: 'Exploring 150 years of Germanic sartorial excellence through archival photographs.',
    },
    {
      id: 'mod-003',
      contentType: 'collection',
      title: 'Primavera 2026 — Garden of Versailles',
      brandName: 'La Maison Royale',
      brandId: 'brand-005',
      submittedAt: '2026-03-10T22:00:00Z',
      status: 'pending',
      preview: '42-piece collection inspired by the geometric perfection of French formal gardens.',
    },
    {
      id: 'mod-004',
      contentType: 'product',
      title: 'Oro Rosa Signet Ring — Limited Edition',
      brandName: 'Atelier Dorée',
      brandId: 'brand-004',
      submittedAt: '2026-03-10T18:00:00Z',
      status: 'approved',
      reviewedBy: 'Ravi Kapoor',
      reviewedAt: '2026-03-10T20:15:00Z',
    },
    {
      id: 'mod-005',
      contentType: 'heritage',
      title: 'Casa di Eleganza: From Florence to the World',
      brandName: 'Casa di Eleganza',
      brandId: 'brand-003',
      submittedAt: '2026-03-10T16:00:00Z',
      status: 'approved',
      reviewedBy: 'Ravi Kapoor',
      reviewedAt: '2026-03-10T19:00:00Z',
    },
    {
      id: 'mod-006',
      contentType: 'review',
      title: 'Customer review contains competitor brand mention',
      brandName: 'Haus von Prestige',
      brandId: 'brand-002',
      submittedAt: '2026-03-10T14:20:00Z',
      status: 'flagged',
      flagReason: 'Review text references competitor pricing — potential policy violation.',
    },
    {
      id: 'mod-007',
      contentType: 'offer',
      title: 'VIP Early Access: Spring Couture Preview',
      brandName: 'Maison Lumière',
      brandId: 'brand-001',
      submittedAt: '2026-03-10T12:00:00Z',
      status: 'pending',
      preview: 'Exclusive 48-hour early access for Platinum and Diamond UHNI clients.',
    },
    {
      id: 'mod-008',
      contentType: 'product',
      title: 'Sartoria Napoli Three-Piece Suit',
      brandName: 'Palazzo Sartoria',
      brandId: 'brand-007',
      submittedAt: '2026-03-09T15:00:00Z',
      status: 'rejected',
      flagReason: 'Brand account is currently suspended — content cannot be published.',
      reviewerNote: 'Brand under review for quality compliance. Reject all new submissions until resolved.',
      reviewedBy: 'Sanjay Mehta',
      reviewedAt: '2026-03-09T17:30:00Z',
    },
    {
      id: 'mod-009',
      contentType: 'story',
      title: 'Silk Routes: The Soie Éternelle Origin Story',
      brandName: 'Soie Éternelle',
      brandId: 'brand-008',
      submittedAt: '2026-03-09T10:00:00Z',
      status: 'approved',
      reviewedBy: 'Ravi Kapoor',
      reviewedAt: '2026-03-09T14:00:00Z',
    },
    {
      id: 'mod-010',
      contentType: 'collection',
      title: "Nuit d'Or — After Dark Collection",
      brandName: 'Atelier Dorée',
      brandId: 'brand-004',
      submittedAt: '2026-03-08T20:00:00Z',
      status: 'flagged',
      flagReason: 'Collection imagery may require model release verification for 3 photographs.',
      reviewerNote: 'Awaiting legal team confirmation on image licensing.',
    },
  ];
}

// ============================================
// FEATURE FLAGS
// ============================================

export function getFeatureFlags(): FeatureFlag[] {
  return [
    {
      id: 'ff-001',
      name: 'UHNI Access Portal',
      key: 'uhni_access',
      description: 'Enable the Ultra High Net-Worth Individual portal with concierge features and private collections.',
      enabled: true,
      environment: 'all',
      updatedAt: '2026-02-15T10:00:00Z',
      updatedBy: 'Sanjay Mehta',
    },
    {
      id: 'ff-002',
      name: 'G-SAIL AI Styling',
      key: 'gsail',
      description: 'Glimmora Style AI — personalized styling recommendations powered by machine learning.',
      enabled: true,
      environment: 'production',
      updatedAt: '2026-03-01T08:00:00Z',
      updatedBy: 'Sanjay Mehta',
    },
    {
      id: 'ff-003',
      name: 'Body Twin',
      key: 'body_twin',
      description: 'Digital body twin technology for virtual try-on and precise fit prediction.',
      enabled: true,
      environment: 'production',
      updatedAt: '2026-02-20T14:00:00Z',
      updatedBy: 'Ravi Kapoor',
    },
    {
      id: 'ff-004',
      name: 'Bespoke Orders',
      key: 'bespoke_orders',
      description: 'Allow UHNI clients to place custom bespoke orders directly with brand ateliers.',
      enabled: true,
      environment: 'all',
      updatedAt: '2026-01-15T10:00:00Z',
      updatedBy: 'Sanjay Mehta',
    },
    {
      id: 'ff-005',
      name: 'Private Collections',
      key: 'private_collections',
      description: 'Invitation-only collections visible exclusively to qualifying UHNI clients.',
      enabled: true,
      environment: 'production',
      updatedAt: '2026-02-01T12:00:00Z',
      updatedBy: 'Sanjay Mehta',
    },
    {
      id: 'ff-006',
      name: 'Price Negotiation',
      key: 'price_negotiation',
      description: 'Enable UHNI clients to submit price offers on eligible luxury items.',
      enabled: false,
      environment: 'staging',
      updatedAt: '2026-03-05T16:00:00Z',
      updatedBy: 'Ravi Kapoor',
    },
    {
      id: 'ff-007',
      name: 'Heritage Stories',
      key: 'heritage_stories',
      description: 'Brand heritage storytelling module with multimedia timeline support.',
      enabled: true,
      environment: 'all',
      updatedAt: '2025-12-10T09:00:00Z',
      updatedBy: 'Sanjay Mehta',
    },
    {
      id: 'ff-008',
      name: 'Global Sourcing',
      key: 'global_sourcing',
      description: 'Cross-border sourcing requests allowing UHNI clients to find rare items worldwide.',
      enabled: true,
      environment: 'production',
      updatedAt: '2026-02-28T11:00:00Z',
      updatedBy: 'Ravi Kapoor',
    },
    {
      id: 'ff-009',
      name: 'Brand Intelligence Dashboard',
      key: 'brand_intelligence',
      description: 'Advanced analytics and intelligence tools for brand partners (B17-B27 modules).',
      enabled: false,
      environment: 'development',
      updatedAt: '2026-03-08T10:00:00Z',
      updatedBy: 'Sanjay Mehta',
    },
    {
      id: 'ff-010',
      name: 'Multi-Currency Checkout',
      key: 'multi_currency',
      description: 'Support for checkout in EUR, GBP, CHF, and JPY in addition to USD.',
      enabled: false,
      environment: 'staging',
      updatedAt: '2026-03-02T14:30:00Z',
      updatedBy: 'Ravi Kapoor',
    },
  ];
}

// ============================================
// PLATFORM CONFIG
// ============================================

export function getPlatformConfig(): PlatformConfig {
  return {
    maintenanceMode: false,
    maintenanceMessage: 'Glimmora is undergoing scheduled maintenance. We will be back shortly.',
    maxUploadSize: 25_000_000,
    rateLimitPerMinute: 120,
    enableRegistration: true,
    enableBrandOnboarding: true,
    defaultCurrency: 'USD',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CHF', 'JPY'],
    minimumPasswordLength: 12,
    sessionTimeout: 3600,
  };
}

// ============================================
// ANALYTICS REPORTS
// ============================================

export function getAnalyticsReports(): AnalyticsReport[] {
  return [
    {
      id: 'rpt-001',
      name: 'Monthly Revenue Summary',
      type: 'revenue',
      period: '30d',
      createdAt: '2026-03-01T00:00:00Z',
      createdBy: 'Sanjay Mehta',
      scheduled: true,
      lastRun: '2026-03-11T00:00:00Z',
    },
    {
      id: 'rpt-002',
      name: 'Weekly User Acquisition',
      type: 'users',
      period: '7d',
      createdAt: '2026-02-01T00:00:00Z',
      createdBy: 'Ravi Kapoor',
      scheduled: true,
      lastRun: '2026-03-10T00:00:00Z',
    },
    {
      id: 'rpt-003',
      name: 'Quarterly Brand Performance',
      type: 'brands',
      period: '90d',
      createdAt: '2026-01-01T00:00:00Z',
      createdBy: 'Sanjay Mehta',
      scheduled: true,
      lastRun: '2026-03-01T00:00:00Z',
    },
    {
      id: 'rpt-004',
      name: 'Product Catalog Audit',
      type: 'products',
      period: '30d',
      createdAt: '2026-02-15T00:00:00Z',
      createdBy: 'Ravi Kapoor',
      scheduled: false,
      lastRun: '2026-02-15T10:00:00Z',
    },
    {
      id: 'rpt-005',
      name: 'UHNI Client Order Analysis',
      type: 'orders',
      period: '90d',
      createdAt: '2026-03-05T00:00:00Z',
      createdBy: 'Sanjay Mehta',
      scheduled: false,
    },
  ];
}

// ============================================
// REVENUE DATA (30 days: Feb 10 – Mar 11 2026)
// ============================================

export function getRevenueData(): RevenueData[] {
  const baseData: [string, number, number][] = [
    ['2026-02-10', 8_420_000, 284],
    ['2026-02-11', 7_890_000, 261],
    ['2026-02-12', 9_150_000, 312],
    ['2026-02-13', 10_200_000, 348],
    ['2026-02-14', 14_600_000, 482],
    ['2026-02-15', 11_300_000, 374],
    ['2026-02-16', 8_750_000, 290],
    ['2026-02-17', 7_620_000, 255],
    ['2026-02-18', 8_940_000, 298],
    ['2026-02-19', 9_310_000, 315],
    ['2026-02-20', 10_100_000, 340],
    ['2026-02-21', 11_450_000, 382],
    ['2026-02-22', 10_800_000, 361],
    ['2026-02-23', 8_200_000, 270],
    ['2026-02-24', 7_950_000, 264],
    ['2026-02-25', 9_600_000, 320],
    ['2026-02-26', 10_350_000, 345],
    ['2026-02-27', 11_200_000, 372],
    ['2026-02-28', 12_800_000, 424],
    ['2026-03-01', 13_500_000, 450],
    ['2026-03-02', 9_100_000, 305],
    ['2026-03-03', 8_400_000, 280],
    ['2026-03-04', 9_750_000, 325],
    ['2026-03-05', 10_600_000, 352],
    ['2026-03-06', 11_900_000, 396],
    ['2026-03-07', 12_400_000, 412],
    ['2026-03-08', 13_100_000, 438],
    ['2026-03-09', 9_800_000, 328],
    ['2026-03-10', 10_200_000, 340],
    ['2026-03-11', 4_500_000, 152],
  ];

  return baseData.map(([date, revenue, orders]) => ({
    date: date as string,
    revenue: revenue as number,
    orders: orders as number,
    avgOrderValue: Math.round((revenue as number) / (orders as number)),
  }));
}

// ============================================
// USER GROWTH DATA (30 days)
// ============================================

export function getUserGrowthData(): UserGrowthData[] {
  const baseData: [string, number, number, number][] = [
    ['2026-02-10', 42, 12_100, 8],
    ['2026-02-11', 38, 12_050, 11],
    ['2026-02-12', 55, 12_200, 6],
    ['2026-02-13', 61, 12_350, 9],
    ['2026-02-14', 87, 12_600, 5],
    ['2026-02-15', 52, 12_400, 7],
    ['2026-02-16', 34, 12_150, 12],
    ['2026-02-17', 29, 12_000, 10],
    ['2026-02-18', 47, 12_180, 8],
    ['2026-02-19', 53, 12_290, 7],
    ['2026-02-20', 58, 12_380, 9],
    ['2026-02-21', 64, 12_500, 6],
    ['2026-02-22', 49, 12_350, 8],
    ['2026-02-23', 31, 12_100, 11],
    ['2026-02-24', 36, 12_150, 10],
    ['2026-02-25', 50, 12_300, 7],
    ['2026-02-26', 57, 12_420, 8],
    ['2026-02-27', 63, 12_550, 6],
    ['2026-02-28', 72, 12_700, 5],
    ['2026-03-01', 78, 12_800, 4],
    ['2026-03-02', 41, 12_400, 9],
    ['2026-03-03', 37, 12_300, 10],
    ['2026-03-04', 48, 12_450, 8],
    ['2026-03-05', 56, 12_560, 7],
    ['2026-03-06', 62, 12_680, 6],
    ['2026-03-07', 69, 12_790, 5],
    ['2026-03-08', 74, 12_880, 4],
    ['2026-03-09', 44, 12_500, 9],
    ['2026-03-10', 51, 12_620, 7],
    ['2026-03-11', 47, 12_840, 3],
  ];

  return baseData.map(([date, newUsers, activeUsers, churnedUsers]) => ({
    date: date as string,
    newUsers: newUsers as number,
    activeUsers: activeUsers as number,
    churnedUsers: churnedUsers as number,
  }));
}

// ============================================
// TOP BRANDS
// ============================================

export function getTopBrands(): TopBrandData[] {
  return [
    {
      brandId: 'brand-004',
      brandName: 'Atelier Dorée',
      revenue: 62_100_000,
      orders: 1_840,
      products: 94,
      growth: 28.5,
    },
    {
      brandId: 'brand-001',
      brandName: 'Maison Lumière',
      revenue: 48_200_000,
      orders: 3_210,
      products: 342,
      growth: 18.2,
    },
    {
      brandId: 'brand-002',
      brandName: 'Haus von Prestige',
      revenue: 36_700_000,
      orders: 4_580,
      products: 518,
      growth: 14.7,
    },
    {
      brandId: 'brand-003',
      brandName: 'Casa di Eleganza',
      revenue: 29_400_000,
      orders: 2_890,
      products: 186,
      growth: 21.3,
    },
    {
      brandId: 'brand-005',
      brandName: 'La Maison Royale',
      revenue: 19_800_000,
      orders: 1_620,
      products: 210,
      growth: 32.1,
    },
    {
      brandId: 'brand-009',
      brandName: 'Maison Vivienne',
      revenue: 15_400_000,
      orders: 1_380,
      products: 164,
      growth: 11.5,
    },
    {
      brandId: 'brand-007',
      brandName: 'Palazzo Sartoria',
      revenue: 8_400_000,
      orders: 720,
      products: 76,
      growth: -4.2,
    },
    {
      brandId: 'brand-010',
      brandName: 'Joaillerie Éclat',
      revenue: 7_600_000,
      orders: 410,
      products: 52,
      growth: 45.8,
    },
  ];
}

// ============================================
// COMMISSION RULES
// ============================================

export function getCommissionRules(): CommissionRule[] {
  return [
    {
      id: 'comm-001',
      brandTier: 'heritage',
      category: 'All Categories',
      rate: 8,
      effectiveFrom: '2025-01-01',
    },
    {
      id: 'comm-002',
      brandTier: 'elite',
      category: 'All Categories',
      rate: 10,
      effectiveFrom: '2025-01-01',
    },
    {
      id: 'comm-003',
      brandTier: 'premium',
      category: 'All Categories',
      rate: 12,
      effectiveFrom: '2025-01-01',
    },
    {
      id: 'comm-004',
      brandTier: 'standard',
      category: 'All Categories',
      rate: 15,
      effectiveFrom: '2025-01-01',
    },
  ];
}

// ============================================
// PAYOUTS
// ============================================

export function getPayouts(): Payout[] {
  return [
    {
      id: 'pay-001',
      brandId: 'brand-004',
      brandName: 'Atelier Dorée',
      amount: 5_420_000,
      currency: 'USD',
      period: 'February 2026',
      status: 'completed',
      commissionAmount: 433_600,
      netAmount: 4_986_400,
      processedAt: '2026-03-05T10:00:00Z',
      createdAt: '2026-03-01T00:00:00Z',
    },
    {
      id: 'pay-002',
      brandId: 'brand-001',
      brandName: 'Maison Lumière',
      amount: 4_180_000,
      currency: 'USD',
      period: 'February 2026',
      status: 'completed',
      commissionAmount: 334_400,
      netAmount: 3_845_600,
      processedAt: '2026-03-05T10:15:00Z',
      createdAt: '2026-03-01T00:00:00Z',
    },
    {
      id: 'pay-003',
      brandId: 'brand-002',
      brandName: 'Haus von Prestige',
      amount: 3_240_000,
      currency: 'USD',
      period: 'February 2026',
      status: 'completed',
      commissionAmount: 324_000,
      netAmount: 2_916_000,
      processedAt: '2026-03-05T10:30:00Z',
      createdAt: '2026-03-01T00:00:00Z',
    },
    {
      id: 'pay-004',
      brandId: 'brand-003',
      brandName: 'Casa di Eleganza',
      amount: 2_580_000,
      currency: 'USD',
      period: 'February 2026',
      status: 'processing',
      commissionAmount: 258_000,
      netAmount: 2_322_000,
      createdAt: '2026-03-01T00:00:00Z',
    },
    {
      id: 'pay-005',
      brandId: 'brand-005',
      brandName: 'La Maison Royale',
      amount: 1_720_000,
      currency: 'USD',
      period: 'February 2026',
      status: 'processing',
      commissionAmount: 206_400,
      netAmount: 1_513_600,
      createdAt: '2026-03-01T00:00:00Z',
    },
    {
      id: 'pay-006',
      brandId: 'brand-004',
      brandName: 'Atelier Dorée',
      amount: 1_890_000,
      currency: 'USD',
      period: 'March 2026 (partial)',
      status: 'pending',
      commissionAmount: 151_200,
      netAmount: 1_738_800,
      createdAt: '2026-03-11T00:00:00Z',
    },
    {
      id: 'pay-007',
      brandId: 'brand-001',
      brandName: 'Maison Lumière',
      amount: 1_450_000,
      currency: 'USD',
      period: 'March 2026 (partial)',
      status: 'pending',
      commissionAmount: 116_000,
      netAmount: 1_334_000,
      createdAt: '2026-03-11T00:00:00Z',
    },
    {
      id: 'pay-008',
      brandId: 'brand-002',
      brandName: 'Haus von Prestige',
      amount: 1_120_000,
      currency: 'USD',
      period: 'March 2026 (partial)',
      status: 'pending',
      commissionAmount: 112_000,
      netAmount: 1_008_000,
      createdAt: '2026-03-11T00:00:00Z',
    },
    {
      id: 'pay-009',
      brandId: 'brand-007',
      brandName: 'Palazzo Sartoria',
      amount: 680_000,
      currency: 'USD',
      period: 'February 2026',
      status: 'failed',
      commissionAmount: 81_600,
      netAmount: 598_400,
      createdAt: '2026-03-01T00:00:00Z',
    },
    {
      id: 'pay-010',
      brandId: 'brand-003',
      brandName: 'Casa di Eleganza',
      amount: 940_000,
      currency: 'USD',
      period: 'March 2026 (partial)',
      status: 'pending',
      commissionAmount: 94_000,
      netAmount: 846_000,
      createdAt: '2026-03-11T00:00:00Z',
    },
  ];
}

// ============================================
// REVENUE BREAKDOWN
// ============================================

export function getRevenueBreakdown(): RevenueBreakdown {
  return {
    totalGMV: 284_750_000,
    totalCommission: 31_322_500,
    totalPayouts: 248_427_500,
    pendingPayouts: 5_000_000,
    currency: 'USD',
  };
}

// ============================================
// AUDIT LOG
// ============================================

export function getAuditLog(): AuditLogEntry[] {
  return [
    {
      id: 'audit-001',
      userId: 'admin-001',
      userName: 'Sanjay Mehta',
      action: 'login',
      resource: 'Admin Portal',
      details: 'Logged in via SSO from verified IP address.',
      ipAddress: '203.0.113.42',
      timestamp: '2026-03-11T09:30:00Z',
    },
    {
      id: 'audit-002',
      userId: 'admin-001',
      userName: 'Sanjay Mehta',
      action: 'config_change',
      resource: 'Feature Flags',
      resourceId: 'ff-009',
      details: 'Disabled brand_intelligence flag in development environment.',
      ipAddress: '203.0.113.42',
      timestamp: '2026-03-11T09:25:00Z',
    },
    {
      id: 'audit-003',
      userId: 'usr-010',
      userName: 'Ravi Kapoor',
      action: 'update',
      resource: 'Brand',
      resourceId: 'brand-006',
      details: 'Advanced Maison Céleste to final_approval verification step.',
      ipAddress: '198.51.100.18',
      timestamp: '2026-03-10T22:30:00Z',
    },
    {
      id: 'audit-004',
      userId: 'usr-010',
      userName: 'Ravi Kapoor',
      action: 'update',
      resource: 'Moderation',
      resourceId: 'mod-004',
      details: 'Approved product listing: Oro Rosa Signet Ring — Limited Edition.',
      ipAddress: '198.51.100.18',
      timestamp: '2026-03-10T20:15:00Z',
    },
    {
      id: 'audit-005',
      userId: 'admin-001',
      userName: 'Sanjay Mehta',
      action: 'delete',
      resource: 'User',
      resourceId: 'usr-012',
      details: 'Banned user Daniel Kim for fraudulent payment activity.',
      ipAddress: '203.0.113.42',
      timestamp: '2026-03-10T18:45:00Z',
    },
    {
      id: 'audit-006',
      userId: 'usr-010',
      userName: 'Ravi Kapoor',
      action: 'update',
      resource: 'Moderation',
      resourceId: 'mod-005',
      details: 'Approved heritage content: Casa di Eleganza — From Florence to the World.',
      ipAddress: '198.51.100.18',
      timestamp: '2026-03-10T19:00:00Z',
    },
    {
      id: 'audit-007',
      userId: 'admin-001',
      userName: 'Sanjay Mehta',
      action: 'update',
      resource: 'Brand',
      resourceId: 'brand-007',
      details: 'Suspended Palazzo Sartoria pending quality compliance review.',
      ipAddress: '203.0.113.42',
      timestamp: '2026-03-09T16:00:00Z',
    },
    {
      id: 'audit-008',
      userId: 'admin-001',
      userName: 'Sanjay Mehta',
      action: 'update',
      resource: 'Moderation',
      resourceId: 'mod-008',
      details: 'Rejected product listing from suspended brand Palazzo Sartoria.',
      ipAddress: '203.0.113.42',
      timestamp: '2026-03-09T17:30:00Z',
    },
    {
      id: 'audit-009',
      userId: 'usr-010',
      userName: 'Ravi Kapoor',
      action: 'export',
      resource: 'Analytics Report',
      resourceId: 'rpt-003',
      details: 'Exported Quarterly Brand Performance report as PDF.',
      ipAddress: '198.51.100.18',
      timestamp: '2026-03-09T14:00:00Z',
    },
    {
      id: 'audit-010',
      userId: 'usr-010',
      userName: 'Ravi Kapoor',
      action: 'config_change',
      resource: 'Feature Flags',
      resourceId: 'ff-006',
      details: 'Moved price_negotiation flag to staging environment for testing.',
      ipAddress: '198.51.100.18',
      timestamp: '2026-03-05T16:00:00Z',
    },
    {
      id: 'audit-011',
      userId: 'admin-001',
      userName: 'Sanjay Mehta',
      action: 'impersonate',
      resource: 'User',
      resourceId: 'usr-005',
      details: 'Impersonated Sophie Laurent (Maison Lumière) to debug brand dashboard issue.',
      ipAddress: '203.0.113.42',
      timestamp: '2026-03-05T11:00:00Z',
    },
    {
      id: 'audit-012',
      userId: 'admin-001',
      userName: 'Sanjay Mehta',
      action: 'create',
      resource: 'Analytics Report',
      resourceId: 'rpt-005',
      details: 'Created new UHNI Client Order Analysis report.',
      ipAddress: '203.0.113.42',
      timestamp: '2026-03-05T09:00:00Z',
    },
    {
      id: 'audit-013',
      userId: 'usr-010',
      userName: 'Ravi Kapoor',
      action: 'login',
      resource: 'Admin Portal',
      details: 'Logged in via password + 2FA from new device.',
      ipAddress: '198.51.100.22',
      timestamp: '2026-03-04T08:30:00Z',
    },
    {
      id: 'audit-014',
      userId: 'admin-001',
      userName: 'Sanjay Mehta',
      action: 'config_change',
      resource: 'Platform Config',
      details: 'Updated session timeout from 1800s to 3600s.',
      ipAddress: '203.0.113.42',
      timestamp: '2026-03-03T14:00:00Z',
    },
    {
      id: 'audit-015',
      userId: 'admin-001',
      userName: 'Sanjay Mehta',
      action: 'update',
      resource: 'User',
      resourceId: 'usr-007',
      details: 'Suspended user Amara Okafor — chargeback investigation.',
      ipAddress: '203.0.113.42',
      timestamp: '2026-03-02T10:00:00Z',
    },
    {
      id: 'audit-016',
      userId: 'usr-010',
      userName: 'Ravi Kapoor',
      action: 'update',
      resource: 'Brand',
      resourceId: 'brand-008',
      details: 'Verified Soie Éternelle — advanced to quality_check step.',
      ipAddress: '198.51.100.18',
      timestamp: '2026-03-01T15:00:00Z',
    },
    {
      id: 'audit-017',
      userId: 'admin-001',
      userName: 'Sanjay Mehta',
      action: 'config_change',
      resource: 'Feature Flags',
      resourceId: 'ff-002',
      details: 'Enabled gsail (G-SAIL AI Styling) in production.',
      ipAddress: '203.0.113.42',
      timestamp: '2026-03-01T08:00:00Z',
    },
    {
      id: 'audit-018',
      userId: 'usr-010',
      userName: 'Ravi Kapoor',
      action: 'export',
      resource: 'User Data',
      details: 'Exported platform user list (48,520 records) as CSV.',
      ipAddress: '198.51.100.18',
      timestamp: '2026-02-28T16:00:00Z',
    },
    {
      id: 'audit-019',
      userId: 'admin-001',
      userName: 'Sanjay Mehta',
      action: 'config_change',
      resource: 'Feature Flags',
      resourceId: 'ff-008',
      details: 'Enabled global_sourcing in production after successful staging tests.',
      ipAddress: '203.0.113.42',
      timestamp: '2026-02-28T11:00:00Z',
    },
    {
      id: 'audit-020',
      userId: 'admin-001',
      userName: 'Sanjay Mehta',
      action: 'logout',
      resource: 'Admin Portal',
      details: 'Session ended — manual logout.',
      ipAddress: '203.0.113.42',
      timestamp: '2026-02-27T19:00:00Z',
    },
  ];
}

// ============================================
// SECURITY ALERTS
// ============================================

export function getSecurityAlerts(): SecurityAlert[] {
  return [
    {
      id: 'sec-001',
      severity: 'high',
      title: 'Multiple failed login attempts detected',
      description: 'IP 45.33.32.156 attempted 23 failed logins against brand partner accounts within 5 minutes. IP has been temporarily blocked.',
      source: 'Auth Service',
      timestamp: '2026-03-11T03:22:00Z',
      resolved: false,
    },
    {
      id: 'sec-002',
      severity: 'critical',
      title: 'Anomalous API usage pattern',
      description: 'Brand API key sk_live_palazzo_**** made 4,200 requests in 60 seconds — exceeds rate limit by 35x. Key has been auto-suspended.',
      source: 'API Gateway',
      timestamp: '2026-03-10T16:45:00Z',
      resolved: true,
      resolvedBy: 'Ravi Kapoor',
      resolvedAt: '2026-03-10T17:10:00Z',
    },
    {
      id: 'sec-003',
      severity: 'medium',
      title: 'Outdated TLS certificate on CDN edge node',
      description: 'CDN edge node eu-west-2 is serving a certificate expiring in 7 days. Auto-renewal scheduled.',
      source: 'CDN Monitor',
      timestamp: '2026-03-09T08:00:00Z',
      resolved: false,
    },
    {
      id: 'sec-004',
      severity: 'low',
      title: 'Admin session from new geographic location',
      description: 'Admin Ravi Kapoor logged in from Singapore (198.51.100.22) — previous sessions were from Mumbai. No action required if expected travel.',
      source: 'Auth Service',
      timestamp: '2026-03-04T08:30:00Z',
      resolved: true,
      resolvedBy: 'Sanjay Mehta',
      resolvedAt: '2026-03-04T09:00:00Z',
    },
    {
      id: 'sec-005',
      severity: 'high',
      title: 'Suspicious payment pattern flagged',
      description: 'User usr-012 (Daniel Kim) placed 3 orders with different payment methods in 10 minutes totaling $2,850. Matches known fraud pattern.',
      source: 'Payment Service',
      timestamp: '2026-02-14T11:15:00Z',
      resolved: true,
      resolvedBy: 'Sanjay Mehta',
      resolvedAt: '2026-02-14T12:00:00Z',
    },
    {
      id: 'sec-006',
      severity: 'medium',
      title: 'Database connection pool approaching limit',
      description: 'Primary database connection pool at 87% capacity (435/500). Consider scaling or optimizing long-running queries.',
      source: 'DB Monitor',
      timestamp: '2026-03-08T14:00:00Z',
      resolved: true,
      resolvedBy: 'Ravi Kapoor',
      resolvedAt: '2026-03-08T15:30:00Z',
    },
  ];
}

// ============================================
// GDPR REQUESTS
// ============================================

export function getGDPRRequests(): GDPRRequest[] {
  return [
    {
      id: 'gdpr-001',
      userId: 'usr-014',
      userName: 'Thomas Keller',
      type: 'data_export',
      status: 'completed',
      requestedAt: '2026-03-05T10:00:00Z',
      completedAt: '2026-03-06T14:00:00Z',
    },
    {
      id: 'gdpr-002',
      userId: 'usr-018',
      userName: 'Marie-Claire Dupont',
      type: 'data_deletion',
      status: 'processing',
      requestedAt: '2026-03-09T08:30:00Z',
    },
    {
      id: 'gdpr-003',
      userId: 'usr-022',
      userName: "Liam O'Brien",
      type: 'consent_update',
      status: 'completed',
      requestedAt: '2026-02-28T12:00:00Z',
      completedAt: '2026-02-28T12:05:00Z',
    },
    {
      id: 'gdpr-004',
      userId: 'usr-031',
      userName: 'Yuki Tanaka',
      type: 'data_export',
      status: 'pending',
      requestedAt: '2026-03-11T07:45:00Z',
    },
  ];
}

// ============================================
// SERVICE HEALTH
// ============================================

export function getServiceHealth(): ServiceHealth[] {
  return [
    {
      name: 'API Gateway',
      status: 'healthy',
      uptime: 99.98,
      responseTime: 42,
      lastCheck: '2026-03-11T09:30:00Z',
      errorRate: 0.02,
    },
    {
      name: 'PostgreSQL Database',
      status: 'healthy',
      uptime: 99.99,
      responseTime: 8,
      lastCheck: '2026-03-11T09:30:00Z',
      errorRate: 0.0,
    },
    {
      name: 'CDN (CloudFront)',
      status: 'degraded',
      uptime: 99.87,
      responseTime: 128,
      lastCheck: '2026-03-11T09:30:00Z',
      errorRate: 0.13,
    },
    {
      name: 'Redis Cache',
      status: 'healthy',
      uptime: 99.97,
      responseTime: 2,
      lastCheck: '2026-03-11T09:30:00Z',
      errorRate: 0.01,
    },
    {
      name: 'Elasticsearch',
      status: 'healthy',
      uptime: 99.95,
      responseTime: 35,
      lastCheck: '2026-03-11T09:30:00Z',
      errorRate: 0.03,
    },
    {
      name: 'Payment Gateway (Stripe)',
      status: 'healthy',
      uptime: 99.99,
      responseTime: 210,
      lastCheck: '2026-03-11T09:30:00Z',
      errorRate: 0.01,
    },
  ];
}

// ============================================
// SYSTEM METRICS
// ============================================

export function getSystemMetrics(): SystemMetrics {
  return {
    cpuUsage: 34.2,
    memoryUsage: 61.8,
    diskUsage: 47.3,
    activeConnections: 1_247,
    requestsPerSecond: 842,
    avgResponseTime: 68,
    errorRate: 0.04,
  };
}

// ============================================
// ERROR LOG
// ============================================

export function getErrorLog(): ErrorLogEntry[] {
  return [
    {
      id: 'err-001',
      level: 'error',
      message: 'TimeoutError: CDN origin response exceeded 5000ms threshold (EU-West)',
      source: 'CDN Proxy',
      count: 47,
      firstSeen: '2026-03-10T19:30:00Z',
      lastSeen: '2026-03-11T08:15:00Z',
      resolved: false,
    },
    {
      id: 'err-002',
      level: 'warning',
      message: 'PaymentIntent confirmation delayed: Stripe webhook retry detected',
      source: 'Payment Service',
      count: 12,
      firstSeen: '2026-03-11T02:00:00Z',
      lastSeen: '2026-03-11T06:30:00Z',
      resolved: false,
    },
    {
      id: 'err-003',
      level: 'error',
      message: 'ImageOptimization: Sharp library OOM on 48MP product image upload',
      source: 'Media Service',
      count: 3,
      firstSeen: '2026-03-10T14:00:00Z',
      lastSeen: '2026-03-10T16:20:00Z',
      resolved: true,
    },
    {
      id: 'err-004',
      level: 'critical',
      message: 'Database connection pool exhausted — 500 errors returned to 23 requests',
      source: 'API Server',
      count: 1,
      firstSeen: '2026-03-08T14:02:00Z',
      lastSeen: '2026-03-08T14:02:00Z',
      resolved: true,
    },
    {
      id: 'err-005',
      level: 'warning',
      message: 'Elasticsearch index refresh lag exceeding 2s on products index',
      source: 'Search Service',
      count: 28,
      firstSeen: '2026-03-09T10:00:00Z',
      lastSeen: '2026-03-11T07:45:00Z',
      resolved: false,
    },
    {
      id: 'err-006',
      level: 'error',
      message: 'Redis MOVED error: Cluster slot migration in progress during cache write',
      source: 'Cache Service',
      count: 8,
      firstSeen: '2026-03-07T03:00:00Z',
      lastSeen: '2026-03-07T03:12:00Z',
      resolved: true,
    },
    {
      id: 'err-007',
      level: 'warning',
      message: 'Rate limit exceeded for brand API key sk_live_palazzo_**** — 4,200 req/min',
      source: 'API Gateway',
      count: 1,
      firstSeen: '2026-03-10T16:45:00Z',
      lastSeen: '2026-03-10T16:45:00Z',
      resolved: true,
    },
    {
      id: 'err-008',
      level: 'error',
      message: 'SMTP delivery failure: Transactional email to marie-claire.dupont@email.com bounced (mailbox full)',
      source: 'Email Service',
      count: 5,
      firstSeen: '2026-03-09T08:30:00Z',
      lastSeen: '2026-03-10T08:30:00Z',
      resolved: false,
    },
  ];
}

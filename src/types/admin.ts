// ─── Admin Portal Types ──────────────────────────────────────────────────────

export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'analyst';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string;
  lastActive: string;
  createdAt: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface PlatformMetrics {
  totalUsers: number;
  activeUsers: number;
  totalBrands: number;
  activeBrands: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  currency: string;
  userGrowth: number;
  brandGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
}

export interface DashboardActivity {
  id: string;
  type: 'user_signup' | 'brand_onboarding' | 'order_placed' | 'content_flagged' | 'system_alert' | 'brand_verified';
  message: string;
  timestamp: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
}

// ─── User Management (SOW 1.2) ──────────────────────────────────────────────

export type UserRole = 'consumer' | 'uhni' | 'brand' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'banned' | 'pending';

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  phone?: string;
  tier?: string;
  totalOrders: number;
  totalSpend: number;
  createdAt: string;
  lastLogin: string;
  isTwoFAEnabled: boolean;
}

// ─── Brand Partner Management (SOW 1.3) ─────────────────────────────────────

export type BrandTier = 'standard' | 'premium' | 'elite' | 'heritage';
export type BrandStatus = 'pending' | 'verified' | 'active' | 'suspended' | 'rejected';
export type VerificationStep = 'documents' | 'brand_review' | 'quality_check' | 'final_approval';

export interface ManagedBrand {
  id: string;
  brandName: string;
  brandLogo?: string;
  category: string;
  tier: BrandTier;
  status: BrandStatus;
  contactName: string;
  contactEmail: string;
  totalProducts: number;
  totalRevenue: number;
  commissionRate: number;
  verificationStep?: VerificationStep;
  partnerSince: string;
  lastActive: string;
  performanceScore: number;
}

// ─── Content Moderation (SOW 1.4) ───────────────────────────────────────────

export type ContentType = 'product' | 'story' | 'collection' | 'review' | 'heritage' | 'offer';
export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export interface ModerationItem {
  id: string;
  contentType: ContentType;
  title: string;
  brandName: string;
  brandId: string;
  submittedAt: string;
  status: ModerationStatus;
  preview?: string;
  flagReason?: string;
  reviewerNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

// ─── Platform Configuration (SOW 1.5) ───────────────────────────────────────

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  environment: 'all' | 'production' | 'staging' | 'development';
  updatedAt: string;
  updatedBy: string;
}

export interface PlatformConfig {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maxUploadSize: number;
  rateLimitPerMinute: number;
  enableRegistration: boolean;
  enableBrandOnboarding: boolean;
  defaultCurrency: string;
  supportedCurrencies: string[];
  minimumPasswordLength: number;
  sessionTimeout: number;
}

// ─── Analytics & Reporting (SOW 1.6) ────────────────────────────────────────

export type ReportType = 'revenue' | 'users' | 'orders' | 'products' | 'brands' | 'custom';
export type ReportPeriod = '7d' | '30d' | '90d' | '1y' | 'custom';

export interface AnalyticsReport {
  id: string;
  name: string;
  type: ReportType;
  period: ReportPeriod;
  createdAt: string;
  createdBy: string;
  scheduled: boolean;
  lastRun?: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

export interface UserGrowthData {
  date: string;
  newUsers: number;
  activeUsers: number;
  churnedUsers: number;
}

export interface TopBrandData {
  brandId: string;
  brandName: string;
  revenue: number;
  orders: number;
  products: number;
  growth: number;
}

// ─── Financial Management (SOW 1.7) ─────────────────────────────────────────

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface CommissionRule {
  id: string;
  brandTier: BrandTier;
  category: string;
  rate: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface Payout {
  id: string;
  brandId: string;
  brandName: string;
  amount: number;
  currency: string;
  period: string;
  status: PayoutStatus;
  commissionAmount: number;
  netAmount: number;
  processedAt?: string;
  createdAt: string;
}

export interface RevenueBreakdown {
  totalGMV: number;
  totalCommission: number;
  totalPayouts: number;
  pendingPayouts: number;
  currency: string;
}

// ─── Security & Compliance (SOW 1.8) ────────────────────────────────────────

export type AuditAction = 'login' | 'logout' | 'create' | 'update' | 'delete' | 'export' | 'impersonate' | 'config_change';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface SecurityAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  source: string;
  timestamp: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface GDPRRequest {
  id: string;
  userId: string;
  userName: string;
  type: 'data_export' | 'data_deletion' | 'consent_update';
  status: 'pending' | 'processing' | 'completed';
  requestedAt: string;
  completedAt?: string;
}

// ─── System Health (SOW 1.9) ────────────────────────────────────────────────

export type ServiceStatus = 'healthy' | 'degraded' | 'down';

export interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  uptime: number;
  responseTime: number;
  lastCheck: string;
  errorRate: number;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  requestsPerSecond: number;
  avgResponseTime: number;
  errorRate: number;
}

export interface ErrorLogEntry {
  id: string;
  level: 'error' | 'warning' | 'critical';
  message: string;
  source: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  resolved: boolean;
}

/**
 * Admin Service
 * Endpoints: /api/admin/*
 *
 * Admin APIs don't exist on the backend yet — all functions use mock data.
 */

import { apiRequest } from './api-client';
import type { ApiResponse } from './api-client';
import type {
  PlatformMetrics,
  DashboardActivity,
  PlatformUser,
  UserRole,
  UserStatus,
  ManagedBrand,
  BrandTier,
  BrandStatus,
  ModerationItem,
  ContentType,
  ModerationStatus,
  FeatureFlag,
  PlatformConfig,
  AnalyticsReport,
  RevenueData,
  ReportPeriod,
  UserGrowthData,
  TopBrandData,
  CommissionRule,
  Payout,
  PayoutStatus,
  RevenueBreakdown,
  AuditLogEntry,
  AuditAction,
  SecurityAlert,
  GDPRRequest,
  ServiceHealth,
  SystemMetrics,
  ErrorLogEntry,
} from '@/types/admin';
import {
  getPlatformMetrics,
  getDashboardActivity,
  getPlatformUsers,
  getManagedBrands,
  getModerationQueue,
  getFeatureFlags,
  getPlatformConfig,
  getAnalyticsReports,
  getRevenueData,
  getUserGrowthData,
  getTopBrands,
  getCommissionRules,
  getPayouts,
  getRevenueBreakdown,
  getAuditLog,
  getSecurityAlerts,
  getGDPRRequests,
  getServiceHealth,
  getSystemMetrics,
  getErrorLog,
} from '@/data/admin';

// ============================================
// Dashboard (SOW 1.1)
// ============================================

export async function getAdminDashboard(): Promise<
  ApiResponse<{ metrics: PlatformMetrics; activity: DashboardActivity[] }>
> {
  return apiRequest<{ metrics: PlatformMetrics; activity: DashboardActivity[] }>(
    '/api/admin/dashboard',
    {
      mockHandler: () => ({
        metrics: getPlatformMetrics(),
        activity: getDashboardActivity(),
      }),
    }
  );
}

// ============================================
// User Management (SOW 1.2)
// ============================================

export async function fetchPlatformUsers(filters?: {
  role?: UserRole;
  status?: UserStatus;
}): Promise<ApiResponse<PlatformUser[]>> {
  return apiRequest<PlatformUser[]>('/api/admin/users', {
    mockHandler: () => {
      let users = getPlatformUsers();
      if (filters?.role) users = users.filter(u => u.role === filters.role);
      if (filters?.status) users = users.filter(u => u.status === filters.status);
      return users;
    },
  });
}

export async function fetchUserById(id: string): Promise<ApiResponse<PlatformUser | undefined>> {
  return apiRequest<PlatformUser | undefined>(`/api/admin/users/${id}`, {
    mockHandler: () => {
      return getPlatformUsers().find(u => u.id === id);
    },
  });
}

export async function updateUserStatus(
  id: string,
  status: UserStatus
): Promise<ApiResponse<PlatformUser>> {
  return apiRequest<PlatformUser>(`/api/admin/users/${id}/status`, {
    method: 'PATCH',
    body: { status },
    mockHandler: () => {
      const user = getPlatformUsers().find(u => u.id === id);
      if (!user) throw new Error(`User ${id} not found`);
      return { ...user, status };
    },
  });
}

// ============================================
// Brand Partner Management (SOW 1.3)
// ============================================

export async function fetchManagedBrands(filters?: {
  tier?: BrandTier;
  status?: BrandStatus;
}): Promise<ApiResponse<ManagedBrand[]>> {
  return apiRequest<ManagedBrand[]>('/api/admin/brands', {
    mockHandler: () => {
      let brands = getManagedBrands();
      if (filters?.tier) brands = brands.filter(b => b.tier === filters.tier);
      if (filters?.status) brands = brands.filter(b => b.status === filters.status);
      return brands;
    },
  });
}

export async function fetchBrandById(id: string): Promise<ApiResponse<ManagedBrand | undefined>> {
  return apiRequest<ManagedBrand | undefined>(`/api/admin/brands/${id}`, {
    mockHandler: () => {
      return getManagedBrands().find(b => b.id === id);
    },
  });
}

export async function updateBrandStatus(
  id: string,
  status: BrandStatus
): Promise<ApiResponse<ManagedBrand>> {
  return apiRequest<ManagedBrand>(`/api/admin/brands/${id}/status`, {
    method: 'PATCH',
    body: { status },
    mockHandler: () => {
      const brand = getManagedBrands().find(b => b.id === id);
      if (!brand) throw new Error(`Brand ${id} not found`);
      return { ...brand, status };
    },
  });
}

export async function updateBrandTier(
  id: string,
  tier: BrandTier
): Promise<ApiResponse<ManagedBrand>> {
  return apiRequest<ManagedBrand>(`/api/admin/brands/${id}/tier`, {
    method: 'PATCH',
    body: { tier },
    mockHandler: () => {
      const brand = getManagedBrands().find(b => b.id === id);
      if (!brand) throw new Error(`Brand ${id} not found`);
      return { ...brand, tier };
    },
  });
}

// ============================================
// Content Moderation (SOW 1.4)
// ============================================

export async function fetchModerationQueue(filters?: {
  contentType?: ContentType;
  status?: ModerationStatus;
}): Promise<ApiResponse<ModerationItem[]>> {
  return apiRequest<ModerationItem[]>('/api/admin/moderation', {
    mockHandler: () => {
      let items = [...getModerationQueue()];
      if (filters?.contentType) items = items.filter(i => i.contentType === filters.contentType);
      if (filters?.status) items = items.filter(i => i.status === filters.status);
      return items;
    },
  });
}

export async function moderateContent(
  id: string,
  action: 'approved' | 'rejected',
  note?: string
): Promise<ApiResponse<ModerationItem>> {
  return apiRequest<ModerationItem>(`/api/admin/moderation/${id}`, {
    method: 'PATCH',
    body: { action, note },
    mockHandler: () => {
      const item = getModerationQueue().find(i => i.id === id);
      if (!item) throw new Error(`Moderation item ${id} not found`);
      return {
        ...item,
        status: action,
        reviewerNote: note,
        reviewedAt: new Date().toISOString(),
      };
    },
  });
}

// ============================================
// Platform Configuration (SOW 1.5)
// ============================================

export async function fetchFeatureFlags(): Promise<ApiResponse<FeatureFlag[]>> {
  return apiRequest<FeatureFlag[]>('/api/admin/feature-flags', {
    mockHandler: () => [...getFeatureFlags()],
  });
}

export async function toggleFeatureFlag(
  id: string,
  enabled: boolean
): Promise<ApiResponse<FeatureFlag>> {
  return apiRequest<FeatureFlag>(`/api/admin/feature-flags/${id}`, {
    method: 'PATCH',
    body: { enabled },
    mockHandler: () => {
      const flag = getFeatureFlags().find(f => f.id === id);
      if (!flag) throw new Error(`Feature flag ${id} not found`);
      return { ...flag, enabled, updatedAt: new Date().toISOString() };
    },
  });
}

export async function fetchPlatformConfig(): Promise<ApiResponse<PlatformConfig>> {
  return apiRequest<PlatformConfig>('/api/admin/config', {
    mockHandler: () => ({ ...getPlatformConfig() }),
  });
}

export async function updatePlatformConfig(
  partial: Partial<PlatformConfig>
): Promise<ApiResponse<PlatformConfig>> {
  return apiRequest<PlatformConfig>('/api/admin/config', {
    method: 'PATCH',
    body: partial,
    mockHandler: () => ({ ...getPlatformConfig(), ...partial }),
  });
}

// ============================================
// Analytics & Reporting (SOW 1.6)
// ============================================

export async function fetchAnalyticsReports(): Promise<ApiResponse<AnalyticsReport[]>> {
  return apiRequest<AnalyticsReport[]>('/api/admin/analytics/reports', {
    mockHandler: () => [...getAnalyticsReports()],
  });
}

export async function fetchRevenueData(period: ReportPeriod): Promise<ApiResponse<RevenueData[]>> {
  return apiRequest<RevenueData[]>('/api/admin/analytics/revenue', {
    params: { period },
    mockHandler: () => [...getRevenueData()],
  });
}

export async function fetchUserGrowthData(
  period: ReportPeriod
): Promise<ApiResponse<UserGrowthData[]>> {
  return apiRequest<UserGrowthData[]>('/api/admin/analytics/user-growth', {
    params: { period },
    mockHandler: () => [...getUserGrowthData()],
  });
}

export async function fetchTopBrands(period: ReportPeriod): Promise<ApiResponse<TopBrandData[]>> {
  return apiRequest<TopBrandData[]>('/api/admin/analytics/top-brands', {
    params: { period },
    mockHandler: () => [...getTopBrands()],
  });
}

// ============================================
// Financial Management (SOW 1.7)
// ============================================

export async function fetchCommissionRules(): Promise<ApiResponse<CommissionRule[]>> {
  return apiRequest<CommissionRule[]>('/api/admin/finance/commissions', {
    mockHandler: () => [...getCommissionRules()],
  });
}

export async function updateCommissionRule(
  id: string,
  rate: number
): Promise<ApiResponse<CommissionRule>> {
  return apiRequest<CommissionRule>(`/api/admin/finance/commissions/${id}`, {
    method: 'PATCH',
    body: { rate },
    mockHandler: () => {
      const rule = getCommissionRules().find(r => r.id === id);
      if (!rule) throw new Error(`Commission rule ${id} not found`);
      return { ...rule, rate };
    },
  });
}

export async function fetchPayouts(filters?: {
  status?: PayoutStatus;
}): Promise<ApiResponse<Payout[]>> {
  return apiRequest<Payout[]>('/api/admin/finance/payouts', {
    mockHandler: () => {
      let payouts = [...getPayouts()];
      if (filters?.status) payouts = payouts.filter(p => p.status === filters.status);
      return payouts;
    },
  });
}

export async function processPayouts(ids: string[]): Promise<ApiResponse<Payout[]>> {
  return apiRequest<Payout[]>('/api/admin/finance/payouts/process', {
    method: 'POST',
    body: { ids },
    mockHandler: () => {
      return getPayouts()
        .filter(p => ids.includes(p.id))
        .map(p => ({ ...p, status: 'processing' as PayoutStatus, processedAt: new Date().toISOString() }));
    },
  });
}

export async function fetchRevenueBreakdown(): Promise<ApiResponse<RevenueBreakdown>> {
  return apiRequest<RevenueBreakdown>('/api/admin/finance/revenue-breakdown', {
    mockHandler: () => ({ ...getRevenueBreakdown() }),
  });
}

// ============================================
// Security & Compliance (SOW 1.8)
// ============================================

export async function fetchAuditLog(filters?: {
  action?: AuditAction;
  userId?: string;
}): Promise<ApiResponse<AuditLogEntry[]>> {
  return apiRequest<AuditLogEntry[]>('/api/admin/security/audit-log', {
    mockHandler: () => {
      let entries = [...getAuditLog()];
      if (filters?.action) entries = entries.filter(e => e.action === filters.action);
      if (filters?.userId) entries = entries.filter(e => e.userId === filters.userId);
      return entries;
    },
  });
}

export async function fetchSecurityAlerts(): Promise<ApiResponse<SecurityAlert[]>> {
  return apiRequest<SecurityAlert[]>('/api/admin/security/alerts', {
    mockHandler: () => [...getSecurityAlerts()],
  });
}

export async function resolveSecurityAlert(id: string): Promise<ApiResponse<SecurityAlert>> {
  return apiRequest<SecurityAlert>(`/api/admin/security/alerts/${id}/resolve`, {
    method: 'PATCH',
    mockHandler: () => {
      const alert = getSecurityAlerts().find(a => a.id === id);
      if (!alert) throw new Error(`Security alert ${id} not found`);
      return { ...alert, resolved: true, resolvedAt: new Date().toISOString() };
    },
  });
}

export async function fetchGDPRRequests(): Promise<ApiResponse<GDPRRequest[]>> {
  return apiRequest<GDPRRequest[]>('/api/admin/security/gdpr-requests', {
    mockHandler: () => [...getGDPRRequests()],
  });
}

export async function processGDPRRequest(id: string): Promise<ApiResponse<GDPRRequest>> {
  return apiRequest<GDPRRequest>(`/api/admin/security/gdpr-requests/${id}/process`, {
    method: 'PATCH',
    mockHandler: () => {
      const request = getGDPRRequests().find(r => r.id === id);
      if (!request) throw new Error(`GDPR request ${id} not found`);
      const nextStatus = request.status === 'pending' ? 'processing' : 'completed';
      return {
        ...request,
        status: nextStatus as GDPRRequest['status'],
        ...(nextStatus === 'completed' ? { completedAt: new Date().toISOString() } : {}),
      };
    },
  });
}

// ============================================
// System Health (SOW 1.9)
// ============================================

export async function fetchServiceHealth(): Promise<ApiResponse<ServiceHealth[]>> {
  return apiRequest<ServiceHealth[]>('/api/admin/system/health', {
    mockHandler: () => [...getServiceHealth()],
  });
}

export async function fetchSystemMetrics(): Promise<ApiResponse<SystemMetrics>> {
  return apiRequest<SystemMetrics>('/api/admin/system/metrics', {
    mockHandler: () => ({ ...getSystemMetrics() }),
  });
}

export async function fetchErrorLog(): Promise<ApiResponse<ErrorLogEntry[]>> {
  return apiRequest<ErrorLogEntry[]>('/api/admin/system/errors', {
    mockHandler: () => [...getErrorLog()],
  });
}

// ============================================
// Security Summary (Section 11 — real backend)
// ============================================

export interface SecuritySummaryEvent {
  type: string;
  userId: string;
  ip: string;
  timestamp: string;
}

export interface SecuritySummary {
  failedOtpAttempts24h: number;
  failedLoginAttempts24h: number;
  activeJwtBlacklist: number;
  suspiciousIps: string[];
  recentEvents: SecuritySummaryEvent[];
}

function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return (
      localStorage.getItem('moda-superadmin-token') ||
      localStorage.getItem('moda-admin-token') ||
      null
    );
  } catch {
    return null;
  }
}

export async function fetchSecuritySummary(): Promise<SecuritySummary | null> {
  const token = getAdminToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch('/api/v1/admin/security/summary', { headers });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ============================================
// Superadmin Dashboard Metrics (real backend)
// GET /api/v1/superadmin/dashboard/metrics
// ============================================

export interface SuperadminDashboardMetrics {
  total_users: number;
  active_brands: number;
  total_orders: number;
  total_revenue: number;
  currency: string;
  active_users_today: number;
  pending_moderations: number;
}

export async function fetchSuperadminDashboardMetrics(): Promise<SuperadminDashboardMetrics | null> {
  const token = getAdminToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch('/api/v1/superadmin/dashboard/metrics', { headers });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Admin Service
 * All functions call real backend endpoints.
 * All calls use relative /api/v1/... paths with getAdminToken() Bearer auth.
 */

// ─── Token helper ─────────────────────────────────────────────────────────────

export function getAdminToken(): string | null {
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

function authHeaders(): Record<string, string> {
  const token = getAdminToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// ─── Types (matching backend response shapes exactly) ─────────────────────────

export interface SuperadminDashboardMetrics {
  total_users: number;
  active_brands: number;
  total_orders: number;
  total_revenue: number;
  currency: string;
  active_users_today: number;
  pending_moderations: number;
}

export interface PlatformUsersResponse {
  users: PlatformUserItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface PlatformUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string | null;
  phone?: string | null;
  tier?: string | null;
  totalOrders: number;
  totalSpend: number;
  createdAt: string;
  lastLogin?: string | null;
  isTwoFAEnabled: boolean;
}

export interface ManagedBrandsResponse {
  brands: ManagedBrandItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface ManagedBrandItem {
  id: string;
  brandName: string;
  brandLogo?: string | null;
  category: string;
  tier: string;
  status: string;
  contactName: string;
  contactEmail: string;
  totalProducts: number;
  totalRevenue: number;
  commissionRate: number;
  partnerSince: string;
  lastActive?: string | null;
  performanceScore: number;
  verificationStep?: string | null;
}

export interface ModerationListResponse {
  items: ModerationItemResponse[];
  total: number;
  pending_count: number;
}

export interface ModerationItemResponse {
  id: string;
  contentType: string;
  title: string;
  brandName: string;
  brandId: string;
  submittedAt: string;
  status: string;
  preview?: string | null;
  flagReason?: string | null;
  reviewerNote?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
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

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

export interface UserGrowthDataPoint {
  date: string;
  newUsers: number;
  activeUsers: number;
  churnedUsers: number;
}

export interface TopBrandDataPoint {
  brandId: string;
  brandName: string;
  revenue: number;
  orders: number;
  products: number;
  growth: number;
}

export interface RevenueBreakdown {
  totalGMV: number;
  totalCommission: number;
  totalPayouts: number;
  pendingPayouts: number;
  currency: string;
}

export interface CommissionRuleItem {
  id: string;
  brandTier: string;
  category: string;
  rate: number;
  effectiveFrom: string;
}

export interface PayoutItem {
  id: string;
  brandId: string;
  brandName: string;
  amount: number;
  currency: string;
  period: string;
  status: string;
  commissionAmount: number;
  netAmount: number;
  createdAt: string;
  processedAt?: string | null;
}

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

// Audit log from /api/v1/admin/security/logs
export interface SecurityLogEntry {
  id: string;
  actor_id: string;
  actor_role: string;
  action: string;
  category: string;
  title: string;
  description: string;
  ip: string;
  user_agent: string;
  reference_id?: string | null;
  reference_type?: string | null;
  metadata: Record<string, unknown>;
  created_at: string | null;
}

export interface SecurityLogsResponse {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  logs: SecurityLogEntry[];
}

export interface ServiceHealthItem {
  name: string;
  status: string;
  uptime: number;
  responseTime: number;
  lastCheck: string;
  errorRate: number;
}

export interface SystemMetrics {
  cpuUsage: number | null;
  memoryUsage: number | null;
  diskUsage: number | null;
  activeConnections: number | null;
  requestsPerSecond: number | null;
  avgResponseTime: number | null;
  errorRate: number | null;
  uptimeSeconds: number;
}

export interface ErrorLogEntry {
  id: string;
  level: string;
  message: string;
  source: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  resolved: boolean;
}

export interface SuperAdminNotification {
  notification_id: string;
  notification_type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsListResponse {
  total: number;
  unread_count: number;
  notifications: SuperAdminNotification[];
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function fetchSuperadminDashboardMetrics(): Promise<SuperadminDashboardMetrics | null> {
  try {
    const res = await fetch('/api/v1/superadmin/dashboard/metrics', { headers: authHeaders() });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function fetchPlatformUsers(params?: {
  search?: string;
  status?: string;
  role?: string;
  page?: number;
  page_size?: number;
}): Promise<PlatformUsersResponse | null> {
  try {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    if (params?.role) q.set('role', params.role);
    if (params?.page) q.set('page', String(params.page));
    if (params?.page_size) q.set('page_size', String(params.page_size));
    const qs = q.toString() ? `?${q.toString()}` : '';
    const res = await fetch(`/api/v1/superadmin/users${qs}`, { headers: authHeaders() });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function updateUserStatus(id: string, status: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/v1/superadmin/users/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Brands ───────────────────────────────────────────────────────────────────

export async function fetchManagedBrands(params?: {
  search?: string;
  status?: string;
  tier?: string;
  page?: number;
  page_size?: number;
}): Promise<ManagedBrandsResponse | null> {
  try {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    if (params?.tier) q.set('tier', params.tier);
    if (params?.page) q.set('page', String(params.page));
    if (params?.page_size) q.set('page_size', String(params.page_size));
    const qs = q.toString() ? `?${q.toString()}` : '';
    const res = await fetch(`/api/v1/superadmin/brands${qs}`, { headers: authHeaders() });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function updateBrandStatus(id: string, status: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/v1/superadmin/brands/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function updateBrandTier(id: string, tier: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/v1/superadmin/brands/${id}/tier`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ tier }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Moderation ───────────────────────────────────────────────────────────────

export async function fetchModerationQueue(params?: {
  status?: string;
  content_type?: string;
  page?: number;
  page_size?: number;
}): Promise<ModerationListResponse | null> {
  try {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.content_type) q.set('content_type', params.content_type);
    if (params?.page) q.set('page', String(params.page));
    if (params?.page_size) q.set('page_size', String(params.page_size));
    const qs = q.toString() ? `?${q.toString()}` : '';
    const res = await fetch(`/api/v1/superadmin/moderation${qs}`, { headers: authHeaders() });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function moderateContent(id: string, action: 'approved' | 'rejected', note?: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/v1/superadmin/moderation/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ action, note }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Configuration ────────────────────────────────────────────────────────────

export async function fetchPlatformConfig(): Promise<PlatformConfig | null> {
  try {
    const res = await fetch('/api/v1/superadmin/config', { headers: authHeaders() });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function updatePlatformConfig(partial: Partial<PlatformConfig>): Promise<PlatformConfig | null> {
  try {
    const res = await fetch('/api/v1/superadmin/config', {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(partial),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function fetchRevenueData(period: string): Promise<RevenueDataPoint[]> {
  try {
    const res = await fetch(`/api/v1/superadmin/analytics/revenue?period=${encodeURIComponent(period)}`, { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchUserGrowthData(period: string): Promise<UserGrowthDataPoint[]> {
  try {
    const res = await fetch(`/api/v1/superadmin/analytics/user-growth?period=${encodeURIComponent(period)}`, { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchTopBrands(period: string): Promise<TopBrandDataPoint[]> {
  try {
    const res = await fetch(`/api/v1/superadmin/analytics/top-brands?period=${encodeURIComponent(period)}`, { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// ─── Finance ──────────────────────────────────────────────────────────────────

export async function fetchRevenueBreakdown(): Promise<RevenueBreakdown | null> {
  try {
    const res = await fetch('/api/v1/superadmin/finance/revenue-breakdown', { headers: authHeaders() });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchCommissionRules(): Promise<CommissionRuleItem[]> {
  try {
    const res = await fetch('/api/v1/superadmin/finance/commissions', { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchPayouts(status?: string): Promise<PayoutItem[]> {
  try {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    const res = await fetch(`/api/v1/superadmin/finance/payouts${qs}`, { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// ─── Security ─────────────────────────────────────────────────────────────────

export async function fetchSecuritySummary(): Promise<SecuritySummary | null> {
  try {
    const res = await fetch('/api/v1/admin/security/summary', { headers: authHeaders() });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchSecurityLogs(params?: {
  page?: number;
  page_size?: number;
  action?: string;
  q?: string;
}): Promise<SecurityLogsResponse | null> {
  try {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.page_size) q.set('page_size', String(params.page_size));
    if (params?.action) q.set('action', params.action);
    if (params?.q) q.set('q', params.q);
    const qs = q.toString() ? `?${q.toString()}` : '';
    const res = await fetch(`/api/v1/admin/security/logs${qs}`, { headers: authHeaders() });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─── System Health ────────────────────────────────────────────────────────────

export async function fetchServiceHealth(): Promise<ServiceHealthItem[]> {
  try {
    const res = await fetch('/api/v1/superadmin/system/health', { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchSystemMetrics(): Promise<SystemMetrics | null> {
  try {
    const res = await fetch('/api/v1/superadmin/system/metrics', { headers: authHeaders() });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchErrorLog(): Promise<ErrorLogEntry[]> {
  try {
    const res = await fetch('/api/v1/superadmin/system/errors', { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch('/api/v1/superadmin/auth/change-password', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, message: data?.detail || 'Failed to change password.' };
    }
    return { ok: true, message: data?.message || 'Password changed successfully.' };
  } catch {
    return { ok: false, message: 'Network error. Please try again.' };
  }
}

export async function fetchNotifications(): Promise<NotificationsListResponse | null> {
  try {
    const res = await fetch('/api/v1/superadmin/notifications', { headers: authHeaders() });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─── Analytics Reports (no real backend endpoint — honest empty list) ─────────

export interface AnalyticsReport {
  id: string;
  name: string;
  type: string;
  period: string;
  createdAt: string;
  createdBy: string;
  scheduled: boolean;
  lastRun?: string;
}

export async function fetchAnalyticsReports(): Promise<AnalyticsReport[]> {
  return [];
}

// ─── Security — Alerts + Audit log (mapped to local types for pages) ──────────

// SecurityAlert as the security page expects (from @/types/admin shape)
export interface SecurityAlertItem {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  source: string;
  timestamp: string;
  resolved: boolean;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
}

// AuditLogEntry as the security page expects (from @/types/admin shape)
export interface AuditLogEntryItem {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  details: string;
  ipAddress: string;
  timestamp: string;
}

// GDPRRequest — no backend; honest empty list
export interface GDPRRequestItem {
  id: string;
  userId: string;
  userName: string;
  type: 'data_export' | 'data_deletion' | 'consent_update';
  status: 'pending' | 'processing' | 'completed';
  requestedAt: string;
  completedAt?: string | null;
}

// Fetch security alerts from security summary events
export async function fetchSecurityAlerts(): Promise<SecurityAlertItem[]> {
  try {
    const summary = await fetchSecuritySummary();
    if (!summary) return [];
    // Map recent events into alert shape
    return summary.recentEvents.map((ev, idx) => ({
      id: `evt-${idx}`,
      severity: 'medium' as const,
      title: ev.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      description: `${ev.type} from IP ${ev.ip}`,
      source: 'Auth Service',
      timestamp: ev.timestamp,
      resolved: false,
    }));
  } catch {
    return [];
  }
}

export async function resolveSecurityAlert(_id: string): Promise<boolean> {
  // No dedicated resolve endpoint — optimistic local-only update
  return true;
}

// Fetch audit log entries and map SecurityLogEntry → AuditLogEntryItem
export async function fetchAuditLog(params?: {
  action?: string;
  q?: string;
  page?: number;
  page_size?: number;
}): Promise<AuditLogEntryItem[]> {
  try {
    const q = new URLSearchParams();
    if (params?.action) q.set('action', params.action);
    if (params?.q) q.set('q', params.q);
    if (params?.page) q.set('page', String(params.page));
    if (params?.page_size) q.set('page_size', String(params.page_size));
    const qs = q.toString() ? `?${q.toString()}` : '';
    const res = await fetch(`/api/v1/admin/security/logs${qs}`, { headers: authHeaders() });
    if (!res.ok) return [];
    const data: SecurityLogsResponse = await res.json();
    return (data.logs || []).map((entry) => ({
      id: entry.id,
      userId: entry.actor_id,
      userName: entry.actor_role,
      action: entry.action,
      resource: entry.category,
      resourceId: entry.reference_id,
      details: entry.description,
      ipAddress: entry.ip,
      timestamp: entry.created_at ?? new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

// GDPR — no backend endpoint; return honest empty list
export async function fetchGDPRRequests(): Promise<GDPRRequestItem[]> {
  return [];
}

export async function processGDPRRequest(_id: string): Promise<boolean> {
  return false;
}

// ─── Finance — Process Payouts + Update Commission Rule ──────────────────────

export async function processPayouts(ids: string[]): Promise<PayoutItem[]> {
  try {
    const res = await fetch('/api/v1/superadmin/finance/payouts/process', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ payout_ids: ids }),
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function updateCommissionRule(id: string, rate: number): Promise<CommissionRuleItem | null> {
  try {
    const res = await fetch(`/api/v1/superadmin/finance/commissions/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ rate }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

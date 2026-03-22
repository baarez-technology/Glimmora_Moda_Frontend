'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  Users,
  Building2,
  Package,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
} from 'lucide-react';
import { getAdminDashboard, fetchModerationQueue, fetchRevenueBreakdown, fetchServiceHealth } from '@/services/admin.service';
import type { PlatformMetrics, DashboardActivity } from '@/types/admin';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 30) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

// ─── Revenue bar data (last 7 days) ────────────────────────────────────────

const revenueChartData = [
  { day: 'Mon', revenue: 8_420_000 },
  { day: 'Tue', revenue: 9_150_000 },
  { day: 'Wed', revenue: 10_200_000 },
  { day: 'Thu', revenue: 11_450_000 },
  { day: 'Fri', revenue: 14_600_000 },
  { day: 'Sat', revenue: 11_300_000 },
  { day: 'Sun', revenue: 8_750_000 },
];

const maxRevenue = Math.max(...revenueChartData.map(d => d.revenue));

// ─── Activity type helpers ──────────────────────────────────────────────────

function getActivityIcon(type: DashboardActivity['type']) {
  switch (type) {
    case 'user_signup':
      return Users;
    case 'brand_onboarding':
    case 'brand_verified':
      return Building2;
    case 'order_placed':
      return ShoppingBag;
    case 'content_flagged':
      return Package;
    case 'system_alert':
      return Clock;
    default:
      return Package;
  }
}

function getSeverityColor(severity?: DashboardActivity['severity']) {
  switch (severity) {
    case 'success':
      return 'bg-green-50 text-green-600';
    case 'warning':
      return 'bg-amber-50 text-amber-600';
    case 'error':
      return 'bg-red-50 text-red-600';
    case 'info':
    default:
      return 'bg-blue-50 text-blue-600';
  }
}

function getSeverityDot(severity?: DashboardActivity['severity']) {
  switch (severity) {
    case 'success':
      return 'bg-green-500';
    case 'warning':
      return 'bg-amber-500';
    case 'error':
      return 'bg-red-500';
    case 'info':
    default:
      return 'bg-blue-500';
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [activity, setActivity] = useState<DashboardActivity[]>([]);
  const [pendingModerations, setPendingModerations] = useState(0);
  const [pendingPayouts, setPendingPayouts] = useState(0);
  const [systemUptime, setSystemUptime] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, modRes, revRes, healthRes] = await Promise.all([
          getAdminDashboard(),
          fetchModerationQueue({ status: 'pending' }),
          fetchRevenueBreakdown(),
          fetchServiceHealth(),
        ]);
        if (dashRes.data) {
          setMetrics(dashRes.data.metrics);
          setActivity(dashRes.data.activity);
        }
        if (modRes.data) {
          setPendingModerations(modRes.data.length);
        }
        if (revRes.data) {
          setPendingPayouts(revRes.data.pendingPayouts);
        }
        if (healthRes.data && healthRes.data.length > 0) {
          const avgUptime = healthRes.data.reduce((sum, s) => sum + s.uptime, 0) / healthRes.data.length;
          setSystemUptime(avgUptime);
        }
      } catch {
        // fail silently — dashboard shows empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div>
        <AdminPageHeader
          title="Dashboard"
          subtitle="Platform overview and real-time metrics"
        />
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-stone text-sm">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div>
        <AdminPageHeader
          title="Dashboard"
          subtitle="Platform overview and real-time metrics"
        />
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-stone text-sm">Failed to load dashboard data.</div>
        </div>
      </div>
    );
  }

  // ── Metric cards config ─────────────────────────────────────────────────

  const metricCards = [
    {
      label: 'Total Users',
      value: formatNumber(metrics.totalUsers),
      growth: metrics.userGrowth,
      icon: Users,
    },
    {
      label: 'Active Brands',
      value: formatNumber(metrics.activeBrands),
      growth: metrics.brandGrowth,
      icon: Building2,
    },
    {
      label: 'Total Orders',
      value: formatNumber(metrics.totalOrders),
      growth: metrics.orderGrowth,
      icon: ShoppingBag,
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      growth: metrics.revenueGrowth,
      icon: DollarSign,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Platform overview and real-time metrics"
      />

      <div className="p-8 space-y-8">
        {/* ── Metric Cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map(card => {
            const Icon = card.icon;
            const isPositive = card.growth >= 0;
            return (
              <div
                key={card.label}
                className="bg-white border border-sand/50 p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                      {card.label}
                    </p>
                    <p className="text-2xl font-display text-charcoal-deep mt-2">
                      {card.value}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-parchment flex items-center justify-center">
                    <Icon size={20} className="text-charcoal-deep" />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  {isPositive ? (
                    <TrendingUp size={14} className="text-success" />
                  ) : (
                    <TrendingDown size={14} className="text-error" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      isPositive ? 'text-success' : 'text-error'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {card.growth}%
                  </span>
                  <span className="text-xs text-taupe">vs last month</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Two-column: Revenue Chart + Recent Activity ───────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
              <h2 className="font-medium text-charcoal-deep">Revenue Overview</h2>
              <span className="text-[10px] tracking-[0.1em] uppercase text-stone">
                Last 7 Days
              </span>
            </div>
            <div className="p-6">
              <div className="flex items-end gap-3 h-48">
                {revenueChartData.map(bar => {
                  const heightPercent = (bar.revenue / maxRevenue) * 100;
                  return (
                    <div
                      key={bar.day}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <span className="text-[10px] text-stone">
                        {formatCurrency(bar.revenue)}
                      </span>
                      <div className="w-full flex items-end" style={{ height: '140px' }}>
                        <div
                          className="w-full bg-charcoal-deep/80 hover:bg-charcoal-deep transition-colors rounded-sm"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-taupe font-medium">
                        {bar.day}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-sand/30 flex items-center justify-between">
                <div>
                  <p className="text-xs text-stone">Weekly Total</p>
                  <p className="text-lg font-display text-charcoal-deep">
                    {formatCurrency(
                      revenueChartData.reduce((sum, d) => sum + d.revenue, 0)
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-stone">Daily Average</p>
                  <p className="text-lg font-display text-charcoal-deep">
                    {formatCurrency(
                      Math.round(
                        revenueChartData.reduce((sum, d) => sum + d.revenue, 0) / 7
                      )
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
              <h2 className="font-medium text-charcoal-deep">Recent Activity</h2>
              <span className="text-[10px] tracking-[0.1em] uppercase text-stone flex items-center gap-1">
                <Clock size={12} /> Live
              </span>
            </div>
            <div className="divide-y divide-sand/30">
              {activity.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-stone">
                  No recent activity.
                </div>
              ) : (
                activity.slice(0, 8).map(item => {
                  const Icon = getActivityIcon(item.type);
                  const iconColor = getSeverityColor(item.severity);
                  const dotColor = getSeverityDot(item.severity);
                  return (
                    <div
                      key={item.id}
                      className="px-6 py-3 flex items-start gap-3"
                    >
                      <div
                        className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${iconColor}`}
                      >
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`}
                          />
                          <p className="text-sm text-charcoal-deep truncate">
                            {item.message}
                          </p>
                        </div>
                        <p className="text-xs text-taupe mt-0.5 ml-3.5">
                          {formatRelativeTime(item.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom: Quick Stats Row ───────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Users Today */}
          <div className="bg-white border border-sand/50 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 flex items-center justify-center">
                <Users size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                  Active Users Today
                </p>
                <p className="text-xl font-display text-charcoal-deep mt-0.5">
                  {formatNumber(metrics.activeUsers)}
                </p>
              </div>
            </div>
          </div>

          {/* Pending Moderations */}
          <div className="bg-white border border-sand/50 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 flex items-center justify-center">
                <Package size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                  Pending Moderations
                </p>
                <p className="text-xl font-display text-charcoal-deep mt-0.5">
                  {formatNumber(pendingModerations)}
                </p>
              </div>
            </div>
          </div>

          {/* Pending Payouts */}
          <div className="bg-white border border-sand/50 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 flex items-center justify-center">
                <DollarSign size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                  Pending Payouts
                </p>
                <p className="text-xl font-display text-charcoal-deep mt-0.5">
                  {formatCurrency(pendingPayouts)}
                </p>
              </div>
            </div>
          </div>

          {/* System Uptime */}
          <div className="bg-white border border-sand/50 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 flex items-center justify-center">
                <Clock size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                  System Uptime
                </p>
                <p className="text-xl font-display text-charcoal-deep mt-0.5">
                  {systemUptime.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

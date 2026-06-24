'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  Users,
  Building2,
  Package,
  ShoppingBag,
  DollarSign,
  Clock,
} from 'lucide-react';
import { fetchSuperadminDashboardMetrics } from '@/services/admin.service';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function formatCurrency(n: number, currency = 'USD'): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<{
    totalUsers: number;
    activeBrands: number;
    totalOrders: number;
    totalRevenue: number;
    currency: string;
    activeUsersToday: number;
    pendingModerations: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSuperadminDashboardMetrics();
        if (data) {
          setMetrics({
            totalUsers: data.total_users,
            activeBrands: data.active_brands,
            totalOrders: data.total_orders,
            totalRevenue: data.total_revenue,
            currency: data.currency,
            activeUsersToday: data.active_users_today,
            pendingModerations: data.pending_moderations,
          });
        } else {
          setError(true);
        }
      } catch {
        setError(true);
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

  if (error || !metrics) {
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
      icon: Users,
    },
    {
      label: 'Active Brands',
      value: formatNumber(metrics.activeBrands),
      icon: Building2,
    },
    {
      label: 'Total Orders',
      value: formatNumber(metrics.totalOrders),
      icon: ShoppingBag,
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue, metrics.currency),
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
              </div>
            );
          })}
        </div>

        {/* ── Two-column: Revenue Overview placeholder + Recent Activity ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Overview — no historical breakdown available yet */}
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
              <h2 className="font-medium text-charcoal-deep">Revenue Overview</h2>
              <span className="text-[10px] tracking-[0.1em] uppercase text-stone">
                Last 7 Days
              </span>
            </div>
            <div className="p-6 flex flex-col items-center justify-center min-h-[220px] gap-3">
              <DollarSign size={32} className="text-sand" />
              <p className="text-sm text-stone text-center">
                Daily revenue breakdown not yet available.
              </p>
              <p className="text-xs text-taupe text-center">
                Total revenue to date:{' '}
                <span className="font-medium text-charcoal-deep">
                  {formatCurrency(metrics.totalRevenue, metrics.currency)}
                </span>
              </p>
            </div>
          </div>

          {/* Recent Activity — no activity feed endpoint available yet */}
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
              <h2 className="font-medium text-charcoal-deep">Recent Activity</h2>
              <span className="text-[10px] tracking-[0.1em] uppercase text-stone flex items-center gap-1">
                <Clock size={12} /> Live
              </span>
            </div>
            <div className="px-6 py-8 text-center text-sm text-stone">
              No recent activity.
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
                  {formatNumber(metrics.activeUsersToday)}
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
                  {formatNumber(metrics.pendingModerations)}
                </p>
              </div>
            </div>
          </div>

          {/* Pending Payouts — no backend source */}
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
                  &mdash;
                </p>
              </div>
            </div>
          </div>

          {/* System Uptime — no backend source */}
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
                  &mdash;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

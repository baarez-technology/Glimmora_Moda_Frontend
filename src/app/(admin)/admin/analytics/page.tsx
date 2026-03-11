'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Users,
  DollarSign,
  Building2,
  Package,
} from 'lucide-react';
import {
  fetchRevenueData,
  fetchUserGrowthData,
  fetchTopBrands,
  fetchAnalyticsReports,
} from '@/services/admin.service';
import type {
  RevenueData,
  UserGrowthData,
  TopBrandData,
  AnalyticsReport,
  ReportPeriod,
} from '@/types/admin';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

function formatGrowth(value: number): string {
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Period Selector ────────────────────────────────────────────────────────

const PERIODS: { label: string; value: ReportPeriod }[] = [
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
  { label: '1y', value: '1y' },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('30d');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([]);
  const [topBrands, setTopBrands] = useState<TopBrandData[]>([]);
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [revRes, ugRes, tbRes, rpRes] = await Promise.all([
        fetchRevenueData(period),
        fetchUserGrowthData(period),
        fetchTopBrands(period),
        fetchAnalyticsReports(),
      ]);
      if (revRes.data) setRevenueData(revRes.data);
      if (ugRes.data) setUserGrowthData(ugRes.data);
      if (tbRes.data) setTopBrands(tbRes.data);
      if (rpRes.data) setReports(rpRes.data);
      setLoading(false);
    }
    loadData();
  }, [period]);

  // Derived revenue summaries
  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = revenueData.reduce((s, d) => s + d.orders, 0);
  const avgOrderValue =
    revenueData.length > 0
      ? revenueData.reduce((s, d) => s + d.avgOrderValue, 0) / revenueData.length
      : 0;

  // Derived user growth summaries
  const newUsersTotal = userGrowthData.reduce((s, d) => s + d.newUsers, 0);
  const avgActiveUsers =
    userGrowthData.length > 0
      ? Math.round(
          userGrowthData.reduce((s, d) => s + d.activeUsers, 0) / userGrowthData.length
        )
      : 0;
  const avgChurnRate =
    userGrowthData.length > 0
      ? userGrowthData.reduce((s, d) => {
          const total = d.activeUsers + d.churnedUsers;
          return s + (total > 0 ? (d.churnedUsers / total) * 100 : 0);
        }, 0) / userGrowthData.length
      : 0;

  // Bar chart helpers (last 7 entries)
  const revenueChart = revenueData.slice(-7);
  const maxRevenue = Math.max(...revenueChart.map((d) => d.revenue), 1);

  const userChart = userGrowthData.slice(-7);
  const maxNewUsers = Math.max(...userChart.map((d) => d.newUsers), 1);

  // Report type badge colors
  const typeBadgeColor: Record<string, string> = {
    revenue: 'bg-emerald-100 text-emerald-800',
    users: 'bg-blue-100 text-blue-800',
    orders: 'bg-amber-100 text-amber-800',
    products: 'bg-purple-100 text-purple-800',
    brands: 'bg-rose-100 text-rose-800',
    custom: 'bg-stone/20 text-charcoal-deep',
  };

  return (
    <div className="min-h-screen bg-parchment/30">
      {/* Header */}
      <AdminPageHeader
        title="Analytics & Reporting"
        subtitle="Platform performance metrics and insights"
        breadcrumbs={[{ label: 'Analytics' }]}
        actions={
          <div className="flex items-center gap-1 bg-charcoal-deep/30 rounded-lg p-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  period === p.value
                    ? 'bg-gold-soft text-charcoal-deep'
                    : 'text-stone/60 hover:text-ivory-cream'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-8">
        {loading ? (
          <div className="text-center py-20 text-stone/60">Loading analytics...</div>
        ) : (
          <>
            {/* ── Revenue Section ──────────────────────────────────────── */}
            <section className="bg-white border border-sand/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <DollarSign size={20} className="text-gold-soft" />
                <h2 className="text-lg font-display tracking-wide text-charcoal-deep">
                  Revenue Overview
                </h2>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-parchment/40 rounded-lg p-4">
                  <p className="text-xs text-stone/60 uppercase tracking-wider">Total Revenue</p>
                  <p className="text-2xl font-semibold text-charcoal-deep mt-1">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
                <div className="bg-parchment/40 rounded-lg p-4">
                  <p className="text-xs text-stone/60 uppercase tracking-wider">Avg Order Value</p>
                  <p className="text-2xl font-semibold text-charcoal-deep mt-1">
                    {formatCurrency(avgOrderValue)}
                  </p>
                </div>
                <div className="bg-parchment/40 rounded-lg p-4">
                  <p className="text-xs text-stone/60 uppercase tracking-wider">Total Orders</p>
                  <p className="text-2xl font-semibold text-charcoal-deep mt-1">
                    {totalOrders.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Bar chart */}
              <div className="space-y-3">
                {revenueChart.map((d) => (
                  <div key={d.date} className="flex items-center gap-3">
                    <span className="text-xs text-stone/60 w-16 shrink-0 text-right">
                      {formatDate(d.date)}
                    </span>
                    <div className="flex-1 bg-parchment/40 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full bg-gold-soft/70 rounded-full transition-all duration-500"
                        style={{ width: `${(d.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-charcoal-deep w-20 shrink-0">
                      {formatCurrency(d.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* ── User Growth Section ─────────────────────────────────── */}
            <section className="bg-white border border-sand/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Users size={20} className="text-gold-soft" />
                <h2 className="text-lg font-display tracking-wide text-charcoal-deep">
                  User Growth
                </h2>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-parchment/40 rounded-lg p-4">
                  <p className="text-xs text-stone/60 uppercase tracking-wider">
                    New Users (Period)
                  </p>
                  <p className="text-2xl font-semibold text-charcoal-deep mt-1">
                    {newUsersTotal.toLocaleString()}
                  </p>
                </div>
                <div className="bg-parchment/40 rounded-lg p-4">
                  <p className="text-xs text-stone/60 uppercase tracking-wider">
                    Active Users (Avg)
                  </p>
                  <p className="text-2xl font-semibold text-charcoal-deep mt-1">
                    {avgActiveUsers.toLocaleString()}
                  </p>
                </div>
                <div className="bg-parchment/40 rounded-lg p-4">
                  <p className="text-xs text-stone/60 uppercase tracking-wider">
                    Churn Rate (Avg)
                  </p>
                  <p className="text-2xl font-semibold text-charcoal-deep mt-1">
                    {avgChurnRate.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Horizontal bars for new users */}
              <div className="space-y-3">
                {userChart.map((d) => (
                  <div key={d.date} className="flex items-center gap-3">
                    <span className="text-xs text-stone/60 w-16 shrink-0 text-right">
                      {formatDate(d.date)}
                    </span>
                    <div className="flex-1 bg-parchment/40 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full bg-blue-400/60 rounded-full transition-all duration-500"
                        style={{ width: `${(d.newUsers / maxNewUsers) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-charcoal-deep w-16 shrink-0">
                      {d.newUsers.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Top Brands Table ────────────────────────────────────── */}
            <section className="bg-white border border-sand/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Building2 size={20} className="text-gold-soft" />
                <h2 className="text-lg font-display tracking-wide text-charcoal-deep">
                  Top Performing Brands
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-sand/50 text-left">
                      <th className="pb-3 pr-4 text-xs text-stone/60 uppercase tracking-wider font-medium">
                        Rank
                      </th>
                      <th className="pb-3 pr-4 text-xs text-stone/60 uppercase tracking-wider font-medium">
                        Brand Name
                      </th>
                      <th className="pb-3 pr-4 text-xs text-stone/60 uppercase tracking-wider font-medium text-right">
                        Revenue
                      </th>
                      <th className="pb-3 pr-4 text-xs text-stone/60 uppercase tracking-wider font-medium text-right">
                        Orders
                      </th>
                      <th className="pb-3 pr-4 text-xs text-stone/60 uppercase tracking-wider font-medium text-right">
                        Products
                      </th>
                      <th className="pb-3 text-xs text-stone/60 uppercase tracking-wider font-medium text-right">
                        Growth
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topBrands.map((brand, idx) => (
                      <tr
                        key={brand.brandId}
                        className="border-b border-sand/20 last:border-0 hover:bg-parchment/20 transition-colors"
                      >
                        <td className="py-3 pr-4 text-stone/60 font-medium">{idx + 1}</td>
                        <td className="py-3 pr-4 font-medium text-charcoal-deep">
                          {brand.brandName}
                        </td>
                        <td className="py-3 pr-4 text-right text-charcoal-deep">
                          {formatCurrency(brand.revenue)}
                        </td>
                        <td className="py-3 pr-4 text-right text-charcoal-deep">
                          {brand.orders.toLocaleString()}
                        </td>
                        <td className="py-3 pr-4 text-right text-charcoal-deep">
                          {brand.products.toLocaleString()}
                        </td>
                        <td className="py-3 text-right">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium ${
                              brand.growth >= 0 ? 'text-emerald-600' : 'text-red-500'
                            }`}
                          >
                            {brand.growth >= 0 ? (
                              <TrendingUp size={14} />
                            ) : (
                              <TrendingDown size={14} />
                            )}
                            {formatGrowth(brand.growth)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {topBrands.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-stone/60">
                          No brand data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── Saved Reports ───────────────────────────────────────── */}
            <section className="bg-white border border-sand/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 size={20} className="text-gold-soft" />
                <h2 className="text-lg font-display tracking-wide text-charcoal-deep">
                  Saved Reports
                </h2>
              </div>

              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between gap-4 p-4 rounded-lg border border-sand/30 hover:border-sand/60 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-charcoal-deep truncate">
                          {report.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full ${
                              typeBadgeColor[report.type] || typeBadgeColor.custom
                            }`}
                          >
                            {report.type}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-stone/60">
                            <Calendar size={12} />
                            {report.period}
                          </span>
                          {report.lastRun && (
                            <span className="text-xs text-stone/60">
                              Last run: {formatFullDate(report.lastRun)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-charcoal-deep bg-parchment/50 hover:bg-parchment rounded-lg transition-colors shrink-0">
                      <Download size={14} />
                      Export
                    </button>
                  </div>
                ))}
                {reports.length === 0 && (
                  <p className="text-center py-8 text-stone/60 text-sm">No saved reports.</p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

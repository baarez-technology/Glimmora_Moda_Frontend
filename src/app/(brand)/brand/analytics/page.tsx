'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  BarChart3,
  Globe,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { BrandPageHeader } from '@/components/brand/BrandPageHeader';
import { MetricCard } from '@/components/brand/MetricCard';
import ExportButton from '@/components/brand/ExportButton';
import { convertToCSV, downloadCSV, buildFilename } from '@/lib/export-utils';
import { formatPrice } from '@/lib/currency';

type TimePeriod = '7d' | '30d' | '90d' | '1y';

// API accepts: 7d | 30d | 90d | 1y
const PERIOD_PARAM: Record<TimePeriod, string> = {
  '7d': '7d',
  '30d': '30d',
  '90d': '90d',
  '1y': '1y',
};

// Raw API response — kpis have nested { value, change_percentage } structure
interface ApiAnalytics {
  brand_id: string;
  period: string;
  period_days: number;
  generated_at: string;
  kpis: Record<string, unknown>;
  revenue_trend: { date: string; revenue: number }[];
  orders_trend: { date: string; orders: number }[];
  revenue_by_category: { category: string; revenue: number; percentage: number }[];
  regional_performance: { region: string; revenue: number; orders: number; top_product: string; change_pct: number }[];
  top_products: { product_id: string; name: string; sku: string; revenue: number; units_sold: number; change_pct: number }[];
  demand_signals: { id: string; type: string; title: string; description: string; change_pct: number; confidence: number; actionable: boolean; suggested_action?: string }[];
}

// Safely extract a numeric value from nested KPI objects
function kpiValue(kpi: unknown): number {
  if (typeof kpi === 'number') return kpi;
  if (kpi && typeof kpi === 'object' && 'value' in kpi) {
    const v = (kpi as Record<string, unknown>).value;
    if (typeof v === 'number') return v;
    if (typeof v === 'string') return parseFloat(v) || 0;
  }
  return 0;
}

function kpiChange(kpi: unknown): number {
  if (kpi && typeof kpi === 'object') {
    const obj = kpi as Record<string, unknown>;
    const cp = obj.change_percentage ?? obj.change_pct ?? 0;
    if (typeof cp === 'number') return cp;
    if (typeof cp === 'string') return parseFloat(cp) || 0;
  }
  return 0;
}

export default function AnalyticsPage() {
  
  const [period, setPeriod] = useState<TimePeriod>('30d');
  const [analytics, setAnalytics] = useState<ApiAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('moda-brand-token');
        const res = await window.fetch(`/api/v1/brand/analytics?period=${PERIOD_PARAM[period]}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error(`Analytics API returned ${res.status}`);
        const data: ApiAnalytics = await res.json();
        if (!cancelled) setAnalytics(data);
      } catch (err) {
        console.error('[Analytics] Failed to load:', err);
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAnalytics();
    return () => { cancelled = true; };
  }, [period]);

  const periodLabels: Record<TimePeriod, string> = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    '1y': 'Last 12 Months'
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone">Loading analytics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-8">
        <div className="bg-error/10 border border-error/20 p-6 text-center">
          <AlertCircle size={24} className="mx-auto text-error mb-2" />
          <p className="text-sm text-error">{error || 'No analytics data available'}</p>
          <button
            onClick={() => { setError(null); setLoading(true); }}
            className="mt-3 px-4 py-2 text-xs text-charcoal-deep border border-sand hover:bg-parchment transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const rawKpis = analytics.kpis || {};
  const kpis = {
    total_revenue: kpiValue(rawKpis.revenue ?? rawKpis.total_revenue),
    revenue_change_pct: kpiChange(rawKpis.revenue ?? rawKpis),
    total_orders: kpiValue(rawKpis.orders ?? rawKpis.total_orders),
    orders_change_pct: kpiChange(rawKpis.orders ?? rawKpis),
    average_order_value: kpiValue(rawKpis.avg_order_value ?? rawKpis.average_order_value),
    aov_change_pct: kpiChange(rawKpis.avg_order_value ?? rawKpis),
    return_rate: kpiValue(rawKpis.return_rate),
  };

  const formatCurrency = (value: number | undefined | null, compact = true) => {
    return compact ? formatPrice(value, undefined, true) : formatPrice(value);
  };

  const periods: { value: TimePeriod; label: string }[] = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '12 Months' }
  ];

  const getDemandSignalColor = (type: string) => {
    switch (type) {
      case 'rising':
      case 'trending':
        return 'bg-success/10 text-success';
      case 'falling':
        return 'bg-error/10 text-error';
      case 'seasonal':
        return 'bg-info/10 text-info';
      case 'regional':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-taupe/10 text-stone';
    }
  };

  const exportTopProductsCSV = () => {
    const rows = analytics.top_products.map(p => ({
      Product: p.name,
      SKU: p.sku,
      Revenue: p.revenue,
      'Units Sold': p.units_sold,
      'Change %': p.change_pct,
    }));
    const csv = convertToCSV(rows);
    downloadCSV(buildFilename('top-products', periodLabels[period]), csv);
  };

  const exportRegionalCSV = () => {
    const rows = analytics.regional_performance.map(r => ({
      Region: r.region,
      Revenue: r.revenue,
      Orders: r.orders,
      'Top Product': r.top_product,
      'Change %': r.change_pct,
    }));
    const csv = convertToCSV(rows);
    downloadCSV(buildFilename('regional-analytics', periodLabels[period]), csv);
  };

  return (
    <div>
      <BrandPageHeader
        title="Analytics"
        subtitle={`Performance data for ${periodLabels[period]}`}
      >
        <div className="flex items-center justify-between">
          {/* Period Selector */}
          <div className="flex items-center gap-1 bg-parchment p-1 w-fit">
            {periods.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-4 py-2 text-xs tracking-[0.1em] uppercase transition-colors ${
                  period === p.value
                    ? 'bg-white text-charcoal-deep'
                    : 'text-stone hover:text-charcoal-deep'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </BrandPageHeader>

      <div className="p-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Revenue"
            value={formatCurrency(kpis.total_revenue)}
            change={kpis.revenue_change_pct}
            changeLabel="vs previous period"
          />
          <MetricCard
            label="Orders"
            value={kpis.total_orders.toLocaleString()}
            change={kpis.orders_change_pct}
            changeLabel="vs previous period"
          />
          <MetricCard
            label="Average Order Value"
            value={formatCurrency(kpis.average_order_value)}
            change={kpis.aov_change_pct}
            changeLabel="vs previous period"
          />
          <MetricCard
            label="Return Rate"
            value={`${kpis.return_rate.toFixed(1)}%`}
            trend={kpis.return_rate > 3 ? 'down' : 'up'}
          />
        </div>

        {/* Chart Placeholders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50">
              <h2 className="font-medium text-charcoal-deep">Revenue Trend</h2>
            </div>
            <div className="p-6 flex items-center justify-center h-64 bg-parchment/20">
              <div className="text-center">
                <BarChart3 size={40} className="mx-auto text-taupe/40 mb-3" />
                <p className="text-sm text-stone">Chart visualization coming soon</p>
                <p className="text-xs text-taupe mt-1">Revenue trend for {periodLabels[period].toLowerCase()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50">
              <h2 className="font-medium text-charcoal-deep">Orders Over Time</h2>
            </div>
            <div className="p-6 flex items-center justify-center h-64 bg-parchment/20">
              <div className="text-center">
                <ShoppingCart size={40} className="mx-auto text-taupe/40 mb-3" />
                <p className="text-sm text-stone">Chart visualization coming soon</p>
                <p className="text-xs text-taupe mt-1">Order volume for {periodLabels[period].toLowerCase()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50">
              <h2 className="font-medium text-charcoal-deep">Revenue by Category</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {(() => {
                  const totalRevenue = (analytics.revenue_by_category || []).reduce((s, i) => s + (i.revenue || 0), 0) || 1;
                  return (analytics.revenue_by_category || []).map(item => {
                    const pct = totalRevenue > 0 ? ((item.revenue || 0) / totalRevenue) * 100 : 0;
                    return (
                      <div key={item.category}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-charcoal-deep capitalize">{item.category}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-stone">{formatCurrency(item.revenue)}</span>
                            <span className="text-xs text-taupe w-12 text-right">{pct.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="h-2 bg-parchment overflow-hidden">
                          <div className="h-full bg-charcoal-deep transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* Regional Performance */}
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50">
              <h2 className="font-medium text-charcoal-deep">Regional Performance</h2>
            </div>
            <div className="divide-y divide-sand/30">
              {(analytics.regional_performance || []).map((region: Record<string, unknown>, idx: number) => {
                const changePct = parseFloat(String(region.change_percentage ?? region.change_pct ?? 0));
                return (
                  <div key={String(region.region || idx)} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-parchment flex items-center justify-center">
                        <Globe size={18} className="text-stone" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-charcoal-deep capitalize">{String(region.region)}</p>
                        <p className="text-xs text-taupe">{Number(region.orders || 0)} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-charcoal-deep">{formatCurrency(Number(region.revenue || 0))}</p>
                      <p className={`text-xs ${changePct >= 0 ? 'text-success' : 'text-error'}`}>
                        {changePct >= 0 ? '+' : ''}{changePct.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
            <h2 className="font-medium text-charcoal-deep">Top Performing Products</h2>
            <Link
              href="/brand/products"
              className="text-xs text-stone hover:text-charcoal-deep transition-colors flex items-center gap-1"
            >
              View All <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-sand/30">
                  <th className="text-left px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                    Product
                  </th>
                  <th className="text-left px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                    SKU
                  </th>
                  <th className="text-right px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                    Revenue
                  </th>
                  <th className="text-right px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                    Units Sold
                  </th>
                  <th className="text-right px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/30">
                {(analytics.top_products || []).map((product: Record<string, unknown>, index: number) => {
                  const changePct = parseFloat(String(product.change_percentage ?? product.change_pct ?? 0));
                  return (
                    <tr key={String(product.product_id || index)} className="hover:bg-parchment/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-taupe w-5">{index + 1}</span>
                          <Link
                            href={`/brand/products/${product.product_id}`}
                            className="text-sm text-charcoal-deep hover:text-gold-muted transition-colors"
                          >
                            {String(product.product_name || product.name || '')}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-stone">{String(product.sku || '')}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-medium text-charcoal-deep">
                          {formatCurrency(Number(product.revenue || 0))}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-stone">{Number(product.units ?? product.units_sold ?? 0)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm ${changePct >= 0 ? 'text-success' : 'text-error'}`}>
                          {changePct >= 0 ? '+' : ''}{changePct.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Demand Signals */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50">
            <h2 className="font-medium text-charcoal-deep">Demand Signals</h2>
          </div>
          <div className="divide-y divide-sand/30">
            {(analytics.demand_signals || []).map((signal: Record<string, unknown>, idx: number) => {
              const signalType = String(signal.signal_type || signal.type || 'demand');
              const changePct = parseFloat(String(signal.change_percentage ?? signal.change_pct ?? 0));
              const actions = signal.suggested_actions as string[] | undefined;
              return (
                <div key={idx} className="px-6 py-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 flex items-center justify-center ${getDemandSignalColor(signalType)}`}>
                      {changePct >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-medium text-charcoal-deep">{String(signal.title || '')}</p>
                        <span className={`px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${getDemandSignalColor(signalType)}`}>
                          {signalType}
                        </span>
                      </div>
                      <p className="text-sm text-stone">{String(signal.subtitle || signal.description || '')}</p>
                      {actions && actions.length > 0 && (
                        <p className="text-xs text-info mt-2 flex items-center gap-1">
                          <BarChart3 size={12} />
                          {actions[0]}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-medium ${changePct >= 0 ? 'text-success' : 'text-error'}`}>
                        {changePct >= 0 ? '+' : ''}{changePct}%
                      </p>
                      <p className="text-xs text-taupe mt-1">
                        {Number(signal.confidence || 0)}% confidence
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

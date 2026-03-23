'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  FolderOpen,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  Plus,
  Clock,
  ShoppingBag,
  Truck,
  Bell,
  Loader2
} from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader } from '@/components/brand/BrandPageHeader';
import { MetricCard } from '@/components/brand/MetricCard';
import { formatPrice } from '@/lib/currency';

interface DashboardData {
  stats: Record<string, { value: number; currency?: string; change_percentage: string; change_label: string }>;
  demand_signals: { title: string; subtitle: string; region: string; change_percentage: string; trend: string }[];
  recent_activity: { type: string; title: string; subtitle: string; timestamp: string }[];
  inventory_alerts: { product_name: string; sku: string; current_stock: number; location: string; alert_type: string }[];
  low_stock_products: { product_name: string; sku: string; stock_units: number; demand_count: number; product_id?: string }[];
}

export default function BrandDashboardPage() {
  const { partner } = useBrand();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('moda-brand-token') : null;
    if (!token) { setLoading(false); return; }

    window.fetch('/api/v1/brand/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then(data => setDashboard(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (!partner) return null;

  const formatCurrency = (value: number | undefined | null, compact = true) => {
    return compact ? formatPrice(value, undefined, true) : formatPrice(value);
  };

  const parseChange = (pct: string | undefined) => {
    if (!pct) return 0;
    return parseFloat(pct) || 0;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    if (type.includes('order')) return ShoppingBag;
    if (type.includes('restock')) return Truck;
    if (type.includes('alert') || type.includes('stock')) return AlertTriangle;
    return Bell;
  };

  const stats = dashboard?.stats || {};
  const firstName = partner.teamMembers?.[0]?.name?.split(' ')[0] || partner.brandName?.split(' ')[0] || 'Partner';

  return (
    <div>
      <BrandPageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${firstName}`}
      />

      <div className="p-8 space-y-8">
        {loading && (
          <div className="text-center py-12">
            <Loader2 size={32} className="mx-auto text-stone animate-spin mb-3" />
            <p className="text-stone text-sm">Loading dashboard...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-error/5 border border-error/20 p-6 text-center">
            <p className="text-sm text-error">Failed to load dashboard: {error}</p>
          </div>
        )}

        {dashboard && !loading && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Products"
                value={stats.products?.value ?? 0}
                change={parseChange(stats.products?.change_percentage)}
                changeLabel={stats.products?.change_label || 'vs last month'}
              />
              <MetricCard
                label="Revenue (MTD)"
                value={formatCurrency(stats.revenue?.value)}
                change={parseChange(stats.revenue?.change_percentage)}
                changeLabel={stats.revenue?.change_label || 'vs last month'}
              />
              <MetricCard
                label="Orders (MTD)"
                value={(stats.orders?.value ?? 0).toLocaleString()}
                change={parseChange(stats.orders?.change_percentage)}
                changeLabel={stats.orders?.change_label || 'vs last month'}
              />
              <MetricCard
                label="Avg Order Value"
                value={formatCurrency(stats.avg_order_value?.value)}
                change={parseChange(stats.avg_order_value?.change_percentage)}
                changeLabel={stats.avg_order_value?.change_label || 'vs last month'}
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Demand Signals */}
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
                  <h2 className="font-medium text-charcoal-deep">Demand Signals</h2>
                  <Link href="/brand/analytics" className="text-xs text-stone hover:text-charcoal-deep transition-colors flex items-center gap-1">
                    View All <ArrowRight size={12} />
                  </Link>
                </div>
                <div className="divide-y divide-sand/30">
                  {(dashboard.demand_signals || []).length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <p className="text-xs text-stone">No demand signals yet</p>
                    </div>
                  ) : (
                    dashboard.demand_signals.map((signal, idx) => {
                      const changePct = parseChange(signal.change_percentage);
                      return (
                        <div key={idx} className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 flex items-center justify-center ${
                              signal.trend === 'up' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                            }`}>
                              {signal.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-charcoal-deep">{signal.title}</p>
                              <p className="text-xs text-stone mt-1">{signal.subtitle}</p>
                              <p className="text-[10px] text-taupe mt-0.5">{signal.region}</p>
                            </div>
                            <span className={`text-sm font-medium ${changePct >= 0 ? 'text-success' : 'text-error'}`}>
                              {signal.change_percentage}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50">
                  <h2 className="font-medium text-charcoal-deep">Quick Actions</h2>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                  <Link href="/brand/products/new" className="flex items-center gap-3 p-4 border border-sand/50 hover:border-sand hover:bg-parchment/30 transition-colors">
                    <div className="w-10 h-10 bg-parchment flex items-center justify-center"><Plus size={20} className="text-charcoal-deep" /></div>
                    <div><p className="text-sm font-medium text-charcoal-deep">Add Product</p><p className="text-xs text-stone">Create new listing</p></div>
                  </Link>
                  <Link href="/brand/collections" className="flex items-center gap-3 p-4 border border-sand/50 hover:border-sand hover:bg-parchment/30 transition-colors">
                    <div className="w-10 h-10 bg-parchment flex items-center justify-center"><FolderOpen size={20} className="text-charcoal-deep" /></div>
                    <div><p className="text-sm font-medium text-charcoal-deep">Collections</p><p className="text-xs text-stone">Manage collections</p></div>
                  </Link>
                  <Link href="/brand/inventory" className="flex items-center gap-3 p-4 border border-sand/50 hover:border-sand hover:bg-parchment/30 transition-colors">
                    <div className="w-10 h-10 bg-parchment flex items-center justify-center"><Package size={20} className="text-charcoal-deep" /></div>
                    <div><p className="text-sm font-medium text-charcoal-deep">Inventory</p><p className="text-xs text-stone">Global stock view</p></div>
                  </Link>
                  <Link href="/brand/analytics" className="flex items-center gap-3 p-4 border border-sand/50 hover:border-sand hover:bg-parchment/30 transition-colors">
                    <div className="w-10 h-10 bg-parchment flex items-center justify-center"><TrendingUp size={20} className="text-charcoal-deep" /></div>
                    <div><p className="text-sm font-medium text-charcoal-deep">Analytics</p><p className="text-xs text-stone">View performance</p></div>
                  </Link>
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
                  {(dashboard.recent_activity || []).length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <p className="text-xs text-stone">No recent activity</p>
                    </div>
                  ) : (
                    dashboard.recent_activity.map((activity, idx) => {
                      const Icon = getActivityIcon(activity.type);
                      return (
                        <div key={idx} className="px-6 py-3 flex items-center gap-3">
                          <div className="w-8 h-8 bg-parchment flex items-center justify-center text-stone">
                            <Icon size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-charcoal-deep truncate">{activity.title}</p>
                            <p className="text-xs text-stone truncate">{activity.subtitle}</p>
                          </div>
                          <span className="text-xs text-taupe whitespace-nowrap">
                            {formatTime(activity.timestamp)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Inventory Alerts */}
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
                  <h2 className="font-medium text-charcoal-deep">Inventory Alerts</h2>
                  {(dashboard.inventory_alerts || []).length > 0 && (
                    <span className="px-2 py-1 text-[10px] tracking-[0.1em] uppercase bg-error/10 text-error">
                      {dashboard.inventory_alerts.length} Active
                    </span>
                  )}
                </div>
                <div className="divide-y divide-sand/30">
                  {(dashboard.inventory_alerts || []).length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Package size={20} className="text-success" />
                      </div>
                      <p className="text-sm text-stone">All inventory levels are healthy</p>
                    </div>
                  ) : (
                    dashboard.inventory_alerts.slice(0, 4).map((alert, idx) => (
                      <div key={idx} className="px-6 py-3 flex items-start gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-error/10 text-error">
                          <AlertTriangle size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-charcoal-deep">{alert.product_name}</p>
                          <p className="text-xs text-stone">{alert.current_stock} units remaining</p>
                          <p className="text-xs text-taupe mt-1">{alert.location}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Low Stock Products */}
            {(dashboard.low_stock_products || []).length > 0 && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="font-medium text-charcoal-deep">Low Stock Products</h2>
                    <span className="px-2 py-1 text-[10px] tracking-[0.1em] uppercase bg-warning/10 text-warning">
                      {dashboard.low_stock_products.length} items
                    </span>
                  </div>
                  <Link href="/brand/products?filter=low-stock" className="text-xs text-stone hover:text-charcoal-deep transition-colors flex items-center gap-1">
                    View All <ArrowRight size={12} />
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-sand/30">
                        <th className="text-left px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Product</th>
                        <th className="text-left px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">SKU</th>
                        <th className="text-right px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Stock</th>
                        <th className="text-right px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Demand</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sand/30">
                      {dashboard.low_stock_products.slice(0, 5).map((product, idx) => (
                        <tr key={idx} className="hover:bg-parchment/30 transition-colors">
                          <td className="px-6 py-3">
                            <p className="text-sm text-charcoal-deep">{product.product_name}</p>
                          </td>
                          <td className="px-6 py-3">
                            <p className="text-sm text-stone">{product.sku}</p>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <span className="text-sm text-warning font-medium">{product.stock_units} units</span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <span className="text-sm text-charcoal-deep">{product.demand_count}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

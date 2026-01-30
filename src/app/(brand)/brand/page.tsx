'use client';

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
  Bell
} from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader } from '@/components/brand/BrandPageHeader';
import { MetricCard } from '@/components/brand/MetricCard';

export default function BrandDashboardPage() {
  const { partner, products, analytics, inventory, recentActivity } = useBrand();

  if (!partner) return null;

  // Calculate metrics
  const publishedProducts = products.filter(p => p.status === 'published').length;
  const totalRevenue = analytics.revenue.current;
  const totalOrders = analytics.orders.totalOrders;
  const aov = analytics.orders.averageOrderValue;

  // Get low stock products
  const lowStockProducts = products.filter(p => p.totalStock > 0 && p.totalStock <= 10);

  // Get active alerts
  const activeAlerts = inventory.alerts.filter(a => !a.resolvedAt);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `€${(value / 1000).toFixed(0)}K`;
    }
    return `€${value.toLocaleString()}`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return ShoppingBag;
      case 'restock': return Truck;
      case 'alert': return Bell;
      default: return Package;
    }
  };

  const getActivityLink = (activity: typeof recentActivity[0]) => {
    if (activity.type === 'order' && activity.metadata?.orderId) {
      // Find order by order number
      const orderNumber = activity.metadata.orderId as string;
      // Map order numbers to order IDs based on our mock data
      const orderMap: Record<string, string> = {
        'MG-28471': 'ord-001',
        'MG-28470': 'ord-002',
        'MG-28469': 'ord-003',
        'MG-28465': 'ord-004',
        'MG-28460': 'ord-005',
        'MG-28455': 'ord-006'
      };
      const orderId = orderMap[orderNumber] || orderNumber;
      return `/brand/orders/${orderId}`;
    }
    if (activity.type === 'product_update' && activity.metadata?.productId) {
      return `/brand/products/${activity.metadata.productId}`;
    }
    if (activity.type === 'alert') {
      return '/brand/inventory';
    }
    return null;
  };

  return (
    <div>
      <BrandPageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${partner.teamMembers[0]?.name.split(' ')[0] || 'Partner'}`}
      />

      <div className="p-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Products"
            value={publishedProducts}
            change={12}
            changeLabel="from last month"
          />
          <MetricCard
            label="Revenue (MTD)"
            value={formatCurrency(totalRevenue)}
            change={analytics.revenue.changePercent}
            changeLabel="vs last month"
          />
          <MetricCard
            label="Orders (MTD)"
            value={totalOrders.toLocaleString()}
            change={analytics.orders.changePercent}
            changeLabel="vs last month"
          />
          <MetricCard
            label="Avg Order Value"
            value={formatCurrency(aov)}
            change={analytics.orders.aovChangePercent}
            changeLabel="vs last month"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Demand Signals */}
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
              <h2 className="font-medium text-charcoal-deep">Demand Signals</h2>
              <Link
                href="/brand/analytics"
                className="text-xs text-stone hover:text-charcoal-deep transition-colors flex items-center gap-1"
              >
                View All <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-sand/30">
              {analytics.demandSignals.slice(0, 4).map(signal => (
                <div key={signal.id} className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center ${
                      signal.changePercent > 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                    }`}>
                      {signal.changePercent > 0 ? (
                        <TrendingUp size={16} />
                      ) : (
                        <TrendingDown size={16} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-charcoal-deep">{signal.title}</p>
                      <p className="text-xs text-stone mt-1">{signal.description}</p>
                    </div>
                    <span className={`text-sm font-medium ${
                      signal.changePercent > 0 ? 'text-success' : 'text-error'
                    }`}>
                      {signal.changePercent > 0 ? '+' : ''}{signal.changePercent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50">
              <h2 className="font-medium text-charcoal-deep">Quick Actions</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <Link
                href="/brand/products/new"
                className="flex items-center gap-3 p-4 border border-sand/50 hover:border-sand hover:bg-parchment/30 transition-colors"
              >
                <div className="w-10 h-10 bg-parchment flex items-center justify-center">
                  <Plus size={20} className="text-charcoal-deep" />
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal-deep">Add Product</p>
                  <p className="text-xs text-stone">Create new listing</p>
                </div>
              </Link>
              <Link
                href="/brand/collections"
                className="flex items-center gap-3 p-4 border border-sand/50 hover:border-sand hover:bg-parchment/30 transition-colors"
              >
                <div className="w-10 h-10 bg-parchment flex items-center justify-center">
                  <FolderOpen size={20} className="text-charcoal-deep" />
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal-deep">Collections</p>
                  <p className="text-xs text-stone">Manage collections</p>
                </div>
              </Link>
              <Link
                href="/brand/inventory"
                className="flex items-center gap-3 p-4 border border-sand/50 hover:border-sand hover:bg-parchment/30 transition-colors"
              >
                <div className="w-10 h-10 bg-parchment flex items-center justify-center">
                  <Package size={20} className="text-charcoal-deep" />
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal-deep">Inventory</p>
                  <p className="text-xs text-stone">Global stock view</p>
                </div>
              </Link>
              <Link
                href="/brand/analytics"
                className="flex items-center gap-3 p-4 border border-sand/50 hover:border-sand hover:bg-parchment/30 transition-colors"
              >
                <div className="w-10 h-10 bg-parchment flex items-center justify-center">
                  <TrendingUp size={20} className="text-charcoal-deep" />
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal-deep">Analytics</p>
                  <p className="text-xs text-stone">View performance</p>
                </div>
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
              {recentActivity.slice(0, 5).map(activity => {
                const Icon = getActivityIcon(activity.type);
                const link = getActivityLink(activity);
                const content = (
                  <>
                    <div className="w-8 h-8 bg-parchment flex items-center justify-center text-stone">
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-charcoal-deep truncate">{activity.title}</p>
                      <p className="text-xs text-stone truncate">{activity.description}</p>
                    </div>
                    <span className="text-xs text-taupe whitespace-nowrap">
                      {formatTime(activity.timestamp)}
                    </span>
                  </>
                );

                return link ? (
                  <Link
                    key={activity.id}
                    href={link}
                    className="px-6 py-3 flex items-center gap-3 hover:bg-parchment/30 transition-colors"
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={activity.id} className="px-6 py-3 flex items-center gap-3">
                    {content}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
              <h2 className="font-medium text-charcoal-deep">Inventory Alerts</h2>
              {activeAlerts.length > 0 && (
                <span className="px-2 py-1 text-[10px] tracking-[0.1em] uppercase bg-error/10 text-error">
                  {activeAlerts.length} Active
                </span>
              )}
            </div>
            <div className="divide-y divide-sand/30">
              {activeAlerts.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package size={20} className="text-success" />
                  </div>
                  <p className="text-sm text-stone">All inventory levels are healthy</p>
                </div>
              ) : (
                activeAlerts.slice(0, 4).map(alert => (
                  <div key={alert.id} className="px-6 py-3 flex items-start gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center ${
                      alert.priority === 'critical' || alert.priority === 'high'
                        ? 'bg-error/10 text-error'
                        : alert.priority === 'medium'
                        ? 'bg-warning/10 text-warning'
                        : 'bg-info/10 text-info'
                    }`}>
                      <AlertTriangle size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-charcoal-deep">{alert.productName}</p>
                      <p className="text-xs text-stone">{alert.message}</p>
                      <p className="text-xs text-taupe mt-1">{alert.city}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {activeAlerts.length > 4 && (
              <div className="px-6 py-3 border-t border-sand/30">
                <Link
                  href="/brand/inventory"
                  className="text-xs text-stone hover:text-charcoal-deep transition-colors flex items-center justify-center gap-1"
                >
                  View All {activeAlerts.length} Alerts <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Products */}
        {lowStockProducts.length > 0 && (
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="font-medium text-charcoal-deep">Low Stock Products</h2>
                <span className="px-2 py-1 text-[10px] tracking-[0.1em] uppercase bg-warning/10 text-warning">
                  {lowStockProducts.length} items
                </span>
              </div>
              <Link
                href="/brand/products?filter=low-stock"
                className="text-xs text-stone hover:text-charcoal-deep transition-colors flex items-center gap-1"
              >
                View All <ArrowRight size={12} />
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
                      Stock
                    </th>
                    <th className="text-right px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                      Demand
                    </th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/30">
                  {lowStockProducts.slice(0, 5).map(product => (
                    <tr key={product.id} className="hover:bg-parchment/30 transition-colors">
                      <td className="px-6 py-3">
                        <p className="text-sm text-charcoal-deep">{product.name}</p>
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-sm text-stone">{product.sku}</p>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="text-sm text-warning font-medium">
                          {product.totalStock} units
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className={`text-sm ${
                          product.demandScore >= 80 ? 'text-success' :
                          product.demandScore >= 50 ? 'text-charcoal-deep' :
                          'text-stone'
                        }`}>
                          {product.demandScore}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Link
                          href={`/brand/products/${product.id}`}
                          className="text-xs text-stone hover:text-charcoal-deep transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

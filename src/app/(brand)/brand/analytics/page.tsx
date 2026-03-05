'use client';

import { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Globe,
  Package,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader } from '@/components/brand/BrandPageHeader';
import { MetricCard } from '@/components/brand/MetricCard';
import ExportButton from '@/components/brand/ExportButton';
import { convertToCSV, downloadCSV, buildFilename } from '@/lib/export-utils';

type TimePeriod = '7d' | '30d' | '90d' | '12m';

// Scale factors to simulate different data per period
const PERIOD_SCALE: Record<TimePeriod, { revenue: number; orders: number; change: number }> = {
  '7d':  { revenue: 0.25, orders: 0.2,  change: 1.4 },
  '30d': { revenue: 1,    orders: 1,    change: 1 },
  '90d': { revenue: 2.8,  orders: 2.5,  change: 0.7 },
  '12m': { revenue: 11,   orders: 10,   change: 0.5 },
};

export default function AnalyticsPage() {
  const { analytics } = useBrand();
  const [period, setPeriod] = useState<TimePeriod>('30d');

  const periodLabels: Record<TimePeriod, string> = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    '12m': 'Last 12 Months'
  };

  if (!analytics) {
    return (
      <div className="p-8 text-center">
        <p className="text-stone">Loading analytics...</p>
      </div>
    );
  }

  const scale = PERIOD_SCALE[period];

  // Period-adjusted metrics
  const periodRevenue = Math.round(analytics.revenue.current * scale.revenue);
  const periodRevenueChange = +(analytics.revenue.changePercent * scale.change).toFixed(1);
  const periodOrders = Math.round(analytics.orders.totalOrders * scale.orders);
  const periodOrdersChange = +(analytics.orders.changePercent * scale.change).toFixed(1);
  const periodAov = periodOrders > 0 ? Math.round(periodRevenue / periodOrders) : 0;
  const periodAovChange = +(analytics.orders.aovChangePercent * scale.change).toFixed(1);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `€${(value / 1000).toFixed(0)}K`;
    }
    return `€${value.toLocaleString()}`;
  };

  const periods: { value: TimePeriod; label: string }[] = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '12m', label: '12 Months' }
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
    const rows = analytics.topProducts.map(p => ({
      Product: p.name,
      SKU: p.sku,
      Revenue: Math.round(p.revenue * scale.revenue),
      'Units Sold': Math.round(p.units * scale.orders),
      'Change %': p.changePercent,
    }));
    const csv = convertToCSV(rows);
    downloadCSV(buildFilename('top-products', periodLabels[period]), csv);
  };

  const exportRegionalCSV = () => {
    const rows = analytics.regionalMetrics.map(r => ({
      Region: r.region,
      Revenue: Math.round(r.revenue * scale.revenue),
      Orders: r.orders,
      'Top Product': r.topProduct,
      'Change %': +(r.changePercent * scale.change).toFixed(1),
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
          <ExportButton options={[
            { label: 'Export Top Products (CSV)', onClick: exportTopProductsCSV },
            { label: 'Export Regional Data (CSV)', onClick: exportRegionalCSV },
          ]} />
        </div>
      </BrandPageHeader>

      <div className="p-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Revenue"
            value={formatCurrency(periodRevenue)}
            change={periodRevenueChange}
            changeLabel="vs previous period"
          />
          <MetricCard
            label="Orders"
            value={periodOrders.toLocaleString()}
            change={periodOrdersChange}
            changeLabel="vs previous period"
          />
          <MetricCard
            label="Average Order Value"
            value={formatCurrency(periodAov)}
            change={periodAovChange}
            changeLabel="vs previous period"
          />
          <MetricCard
            label="Return Rate"
            value={`${analytics.orders.returnRate.toFixed(1)}%`}
            trend={analytics.orders.returnRate > 3 ? 'down' : 'up'}
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
                {analytics.revenue.breakdown.map(item => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-charcoal-deep capitalize">{item.category}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-stone">{formatCurrency(Math.round(item.revenue * scale.revenue))}</span>
                        <span className="text-xs text-taupe w-12 text-right">{item.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-parchment overflow-hidden">
                      <div
                        className="h-full bg-charcoal-deep transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Regional Performance */}
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50">
              <h2 className="font-medium text-charcoal-deep">Regional Performance</h2>
            </div>
            <div className="divide-y divide-sand/30">
              {analytics.regionalMetrics.map(region => (
                <div key={region.region} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-parchment flex items-center justify-center">
                      <Globe size={18} className="text-stone" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-charcoal-deep">{region.region}</p>
                      <p className="text-xs text-taupe">Top: {region.topProduct}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-charcoal-deep">{formatCurrency(Math.round(region.revenue * scale.revenue))}</p>
                    <p className={`text-xs ${region.changePercent >= 0 ? 'text-success' : 'text-error'}`}>
                      {region.changePercent >= 0 ? '+' : ''}{(region.changePercent * scale.change).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
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
                {analytics.topProducts.map((product, index) => (
                  <tr key={product.id} className="hover:bg-parchment/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-taupe w-5">{index + 1}</span>
                        <Link
                          href={`/brand/products/${product.id}`}
                          className="text-sm text-charcoal-deep hover:text-gold-muted transition-colors"
                        >
                          {product.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-stone">{product.sku}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-medium text-charcoal-deep">
                        {formatCurrency(Math.round(product.revenue * scale.revenue))}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-stone">{Math.round(product.units * scale.orders)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm ${product.changePercent >= 0 ? 'text-success' : 'text-error'}`}>
                        {product.changePercent >= 0 ? '+' : ''}{product.changePercent.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
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
            {analytics.demandSignals.map(signal => (
              <div key={signal.id} className="px-6 py-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center ${getDemandSignalColor(signal.type)}`}>
                    {signal.changePercent >= 0 ? (
                      <TrendingUp size={18} />
                    ) : (
                      <TrendingDown size={18} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium text-charcoal-deep">{signal.title}</p>
                      <span className={`px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${getDemandSignalColor(signal.type)}`}>
                        {signal.type}
                      </span>
                    </div>
                    <p className="text-sm text-stone">{signal.description}</p>
                    {signal.actionable && signal.suggestedAction && (
                      <p className="text-xs text-info mt-2 flex items-center gap-1">
                        <BarChart3 size={12} />
                        Suggested: {signal.suggestedAction}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-medium ${signal.changePercent >= 0 ? 'text-success' : 'text-error'}`}>
                      {signal.changePercent >= 0 ? '+' : ''}{signal.changePercent}%
                    </p>
                    <p className="text-xs text-taupe mt-1">
                      {signal.confidence}% confidence
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

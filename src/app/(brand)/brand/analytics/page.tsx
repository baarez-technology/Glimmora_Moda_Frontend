'use client';

import { useState } from 'react';
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

type TimePeriod = '7d' | '30d' | '90d' | '12m';

export default function AnalyticsPage() {
  const { analytics } = useBrand();
  const [period, setPeriod] = useState<TimePeriod>('30d');

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

  return (
    <div>
      <BrandPageHeader
        title="Analytics"
        subtitle={`Performance data for ${analytics.period.label}`}
      >
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
      </BrandPageHeader>

      <div className="p-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Revenue"
            value={formatCurrency(analytics.revenue.current)}
            change={analytics.revenue.changePercent}
            changeLabel="vs previous period"
          />
          <MetricCard
            label="Orders"
            value={analytics.orders.totalOrders.toLocaleString()}
            change={analytics.orders.changePercent}
            changeLabel="vs previous period"
          />
          <MetricCard
            label="Average Order Value"
            value={formatCurrency(analytics.orders.averageOrderValue)}
            change={analytics.orders.aovChangePercent}
            changeLabel="vs previous period"
          />
          <MetricCard
            label="Return Rate"
            value={`${analytics.orders.returnRate.toFixed(1)}%`}
            trend={analytics.orders.returnRate > 3 ? 'down' : 'up'}
          />
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
                        <span className="text-sm text-stone">{formatCurrency(item.revenue)}</span>
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
                    <p className="text-sm text-charcoal-deep">{formatCurrency(region.revenue)}</p>
                    <p className={`text-xs ${region.changePercent >= 0 ? 'text-success' : 'text-error'}`}>
                      {region.changePercent >= 0 ? '+' : ''}{region.changePercent.toFixed(1)}%
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
                        {formatCurrency(product.revenue)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-stone">{product.units}</span>
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

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Globe,
  MapPin,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader } from '@/components/brand/BrandPageHeader';
import { MetricCard } from '@/components/brand/MetricCard';

export default function InventoryPage() {
  const { inventory, resolveAlert } = useBrand();
  const [expandedRegions, setExpandedRegions] = useState<string[]>(['Europe', 'Asia', 'Americas']);

  if (!inventory) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone text-sm">Loading inventory data...</p>
      </div>
    );
  }

  const toggleRegion = (region: string) => {
    setExpandedRegions(prev =>
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `€${(value / 1000).toFixed(0)}K`;
    }
    return `€${value.toLocaleString()}`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAlertPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-error/10 text-error border-error/20';
      case 'high': return 'bg-error/10 text-error border-error/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-info/10 text-info border-info/20';
      default: return 'bg-taupe/10 text-stone border-taupe/20';
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      case 'restock_arriving': return 'Restock Coming';
      case 'overstock': return 'Overstock';
      default: return type;
    }
  };

  const activeAlerts = inventory.alerts.filter(a => !a.resolvedAt);

  // Compute separate change percentages for units vs value from regional data
  const totalRegionUnits = inventory.regions.reduce((sum, r) => sum + r.totalUnits, 0);
  const totalRegionValue = inventory.regions.reduce((sum, r) => sum + r.totalValue, 0);
  const weightedUnitsChange = totalRegionUnits > 0
    ? inventory.regions.reduce((sum, r) => sum + r.changePercent * (r.totalUnits / totalRegionUnits), 0)
    : inventory.changePercent;
  const weightedValueChange = totalRegionValue > 0
    ? inventory.regions.reduce((sum, r) => sum + r.changePercent * (r.totalValue / totalRegionValue), 0)
    : inventory.changePercent;

  return (
    <div>
      <BrandPageHeader
        title="Global Inventory"
        subtitle="G-SAIL - Global Stock and Availability Intelligence Layer"
      >
        <div className="flex items-center gap-4 text-xs text-stone">
          <div className="flex items-center gap-2">
            <Globe size={14} />
            <span>{inventory.regions.length} Regions</span>
          </div>
          <span className="text-taupe">·</span>
          <div className="flex items-center gap-2">
            <RefreshCw size={14} />
            <span>Last synced: {formatTime(inventory.lastSyncedAt)}</span>
          </div>
        </div>
      </BrandPageHeader>

      <div className="p-8 space-y-8">
        {/* Global Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Total Units"
            value={inventory.totalUnits.toLocaleString()}
            change={+weightedUnitsChange.toFixed(1)}
            changeLabel="vs last month"
          />
          <MetricCard
            label="Total Value"
            value={formatCurrency(inventory.totalValue)}
            change={+weightedValueChange.toFixed(1)}
            changeLabel="vs last month"
          />
          <MetricCard
            label="Active Alerts"
            value={activeAlerts.length}
            trend={activeAlerts.length > 0 ? 'down' : 'neutral'}
          />
        </div>

        {/* Regional Breakdown */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50">
            <h2 className="font-medium text-charcoal-deep">Regional Distribution</h2>
          </div>

          <div className="divide-y divide-sand/30">
            {inventory.regions.map(region => {
              const isExpanded = expandedRegions.includes(region.region);
              return (
                <div key={region.region}>
                  {/* Region Header */}
                  <button
                    onClick={() => toggleRegion(region.region)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-parchment/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-parchment flex items-center justify-center">
                        <Globe size={18} className="text-stone" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-charcoal-deep">{region.region}</p>
                        <p className="text-xs text-taupe">{region.cities.length} cities</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-sm text-charcoal-deep">{region.totalUnits.toLocaleString()} units</p>
                        <p className="text-xs text-taupe">{formatCurrency(region.totalValue)}</p>
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${
                        region.changePercent >= 0 ? 'text-success' : 'text-error'
                      }`}>
                        {region.changePercent >= 0 ? (
                          <TrendingUp size={14} />
                        ) : (
                          <TrendingDown size={14} />
                        )}
                        <span>{region.changePercent >= 0 ? '+' : ''}{region.changePercent.toFixed(1)}%</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown size={16} className="text-taupe" />
                      ) : (
                        <ChevronRight size={16} className="text-taupe" />
                      )}
                    </div>
                  </button>

                  {/* Cities */}
                  {isExpanded && (
                    <div className="bg-parchment/20 px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {region.cities.map(city => (
                          <div
                            key={city.city}
                            className="bg-white border border-sand/50 p-4"
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <MapPin size={14} className="text-taupe" />
                              <span className="font-medium text-charcoal-deep">{city.city}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-lg font-display text-charcoal-deep">
                                  {city.units.toLocaleString()}
                                </p>
                                <p className="text-xs text-taupe">units</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-charcoal-deep">
                                  {formatCurrency(city.value)}
                                </p>
                                <p className={`text-xs ${
                                  city.changePercent >= 0 ? 'text-success' : 'text-error'
                                }`}>
                                  {city.changePercent >= 0 ? '+' : ''}{city.changePercent.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
            <h2 className="font-medium text-charcoal-deep">Inventory Alerts</h2>
            {activeAlerts.length > 0 && (
              <span className="px-3 py-1 text-[10px] tracking-[0.1em] uppercase bg-error/10 text-error">
                {activeAlerts.length} Active
              </span>
            )}
          </div>

          {activeAlerts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={24} className="text-success" />
              </div>
              <p className="text-stone">All inventory levels are healthy</p>
              <p className="text-xs text-taupe mt-1">No active alerts at this time</p>
            </div>
          ) : (
            <div className="divide-y divide-sand/30">
              {activeAlerts.map(alert => (
                <div key={alert.id} className="px-6 py-4 flex items-start gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${getAlertPriorityColor(alert.priority)}`}>
                    <AlertTriangle size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/brand/products/${alert.productId}`}
                        className="font-medium text-charcoal-deep hover:text-gold-muted transition-colors"
                      >
                        {alert.productName}
                      </Link>
                      <span className={`px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${getAlertPriorityColor(alert.priority)}`}>
                        {alert.priority}
                      </span>
                    </div>
                    <p className="text-sm text-stone">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-taupe">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {alert.city}, {alert.region}
                      </span>
                      <span>Current: {alert.currentStock} units</span>
                      {alert.threshold && <span>Threshold: {alert.threshold}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`inline-block px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${
                      alert.type === 'low_stock' ? 'bg-warning/10 text-warning' :
                      alert.type === 'out_of_stock' ? 'bg-error/10 text-error' :
                      alert.type === 'restock_arriving' ? 'bg-info/10 text-info' :
                      'bg-taupe/10 text-stone'
                    }`}>
                      {getAlertTypeLabel(alert.type)}
                    </span>
                    <p className="text-xs text-taupe">
                      {formatTime(alert.createdAt)}
                    </p>
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone hover:text-success border border-sand hover:border-success transition-colors"
                    >
                      <CheckCircle size={12} />
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

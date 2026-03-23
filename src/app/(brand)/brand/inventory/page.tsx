'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe, MapPin, AlertTriangle, Package, RefreshCw,
  ChevronDown, ChevronRight, CheckCircle, Loader2, TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import { BrandPageHeader } from '@/components/brand/BrandPageHeader';
import { MetricCard } from '@/components/brand/MetricCard';
import { fetchInventory, type InventoryData, type InventoryAlert } from '@/services/inventory.service';

import { formatPrice as _fp } from '@/lib/currency';
function formatCurrency(value: number) {
  return _fp(value, undefined, true);
}

function formatDate(ts: string) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function getAlertColor(priority: string) {
  switch (priority) {
    case 'high':   return 'bg-error/10 text-error border-error/20';
    case 'medium': return 'bg-warning/10 text-warning border-warning/20';
    default:       return 'bg-info/10 text-info border-info/20';
  }
}

function getAlertTypeLabel(type: string) {
  switch (type) {
    case 'low_stock': return 'Low Stock';
    case 'restock':   return 'Restock';
    default:          return type;
  }
}

export default function InventoryPage() {
  const [data, setData] = useState<InventoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCountries, setExpandedCountries] = useState<string[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await fetchInventory());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCountry = (name: string) => {
    setExpandedCountries(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  const dismissAlert = (id: string) => {
    setDismissedAlerts(prev => new Set([...prev, id]));
  };

  if (isLoading) {
    return (
      <div>
        <BrandPageHeader title="Global Inventory" subtitle="G-SAIL · Global Stock and Availability Intelligence Layer" />
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-taupe" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <BrandPageHeader title="Global Inventory" subtitle="G-SAIL · Global Stock and Availability Intelligence Layer" />
        <div className="p-8 text-center">
          <p className="text-error mb-4">{error || 'No data available'}</p>
          <button
            onClick={load}
            className="px-6 py-3 bg-charcoal-deep text-white text-sm tracking-wider uppercase hover:bg-noir transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const activeAlerts = data.alerts.filter(a => !dismissedAlerts.has(a.id));

  return (
    <div>
      <BrandPageHeader
        title="Global Inventory"
        subtitle="G-SAIL · Global Stock and Availability Intelligence Layer"
      >
        <div className="flex items-center gap-4 text-xs text-stone">
          <div className="flex items-center gap-2">
            <Globe size={14} />
            <span>{data.countries.length} countries</span>
          </div>
          <span className="text-taupe">·</span>
          <div className="flex items-center gap-2">
            <RefreshCw size={14} />
            <span>Fetched: {formatDate(data.fetchedAt)}</span>
          </div>
        </div>
      </BrandPageHeader>

      <div className="p-8 space-y-8">

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Total Units"
            value={data.totalUnits.toLocaleString()}
            change={data.totalUnitsChangePercent}
            changeLabel="vs last period"
          />
          <MetricCard
            label="Total Value"
            value={formatCurrency(data.totalValue)}
            change={data.totalValueChangePercent}
            changeLabel="vs last period"
          />
          <MetricCard
            label="Active Alerts"
            value={data.totalActiveAlerts}
            trend={data.totalActiveAlerts > 0 ? 'down' : 'neutral'}
          />
        </div>

        {/* Regional Distribution */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50">
            <h2 className="font-medium text-charcoal-deep">Regional Distribution</h2>
          </div>

          <div className="divide-y divide-sand/30">
            {data.countries.map(country => {
              const isExpanded = expandedCountries.includes(country.country);
              return (
                <div key={country.country}>
                  {/* Country row */}
                  <button
                    onClick={() => toggleCountry(country.country)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-parchment/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-parchment flex items-center justify-center">
                        <MapPin size={18} className="text-stone" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-charcoal-deep">{country.country}</p>
                        <p className="text-xs text-taupe">{country.cities.length} {country.cities.length === 1 ? 'city' : 'cities'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-sm text-charcoal-deep">{country.totalUnits.toLocaleString()} units</p>
                        <p className="text-xs text-taupe">{formatCurrency(country.totalValue)}</p>
                      </div>
                      <span className={`flex items-center gap-1 text-xs ${country.changePercent > 100 ? 'text-success' : country.changePercent < 100 ? 'text-error' : 'text-stone'}`}>
                        {country.changePercent > 100 ? <TrendingUp size={12} /> : country.changePercent < 100 ? <TrendingDown size={12} /> : <Minus size={12} />}
                        {country.changePercent > 100 ? '+' : ''}{country.changePercent.toFixed(1)}%
                      </span>
                      {isExpanded ? <ChevronDown size={16} className="text-taupe" /> : <ChevronRight size={16} className="text-taupe" />}
                    </div>
                  </button>

                  {/* Cities grid */}
                  {isExpanded && (
                    <div className="bg-parchment/20 px-6 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {country.cities.map(city => (
                          <div key={city.city} className="bg-white border border-sand/50 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <MapPin size={13} className="text-taupe" />
                              <span className="font-medium text-charcoal-deep text-sm">{city.city}</span>
                            </div>
                            <div className="flex items-end justify-between">
                              <div>
                                <p className="text-xl font-display text-charcoal-deep">{city.units.toLocaleString()}</p>
                                <p className="text-xs text-taupe">units</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-charcoal-deep">{formatCurrency(city.value)}</p>
                                <p className={`text-xs ${city.changePercent > 100 ? 'text-success' : city.changePercent < 100 ? 'text-error' : 'text-taupe'}`}>
                                  {city.changePercent.toFixed(1)}%
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
              {activeAlerts.map((alert: InventoryAlert, idx: number) => (
                <div key={`${alert.id}_${idx}`} className="px-6 py-4 flex items-start gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 border ${getAlertColor(alert.priority)}`}>
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
                      <span className={`px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase border ${getAlertColor(alert.priority)}`}>
                        {alert.priority}
                      </span>
                    </div>
                    <p className="text-sm text-stone">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-taupe">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {alert.city}, {alert.country}
                      </span>
                      <span>Current: {alert.currentStock} units</span>
                      {alert.threshold > 0 && <span>Threshold: {alert.threshold}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`inline-block px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${
                      alert.type === 'low_stock' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'
                    }`}>
                      {getAlertTypeLabel(alert.type)}
                    </span>
                    <p className="text-xs text-taupe">{formatDate(alert.createdAt)}</p>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone hover:text-success border border-sand hover:border-success transition-colors"
                    >
                      <CheckCircle size={12} />
                      Dismiss
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

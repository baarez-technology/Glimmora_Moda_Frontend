'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader } from '@/components/brand/BrandPageHeader';
import { BrandHero } from '@/components/brand/BrandHero';
import { formatPrice } from '@/lib/currency';

interface DashboardData {
  stats: Record<string, { value: number; currency?: string; change_percentage: string; change_label: string }>;
  demand_signals: { title: string; subtitle: string; region: string; change_percentage: string; trend: string }[];
  recent_activity: { type: string; title: string; subtitle: string; timestamp: string }[];
  inventory_alerts: { product_name: string; sku: string; current_stock: number; location: string; alert_type: string }[];
  low_stock_products: { product_name: string; sku: string; stock_units: number; demand_count: number; product_id?: string }[];
}

// ─── Inline luxury KPI card with sparkline ─────────────────────────────────────
function LuxuryMetricCard({
  label,
  value,
  changePct,
  changeLabel,
  trendSeed,
}: {
  label: string;
  value: string | number;
  changePct: number;
  changeLabel: string;
  trendSeed: number;
}) {
  // Deterministic mock sparkline based on seed + change direction.
  // Replaces with real history when BE exposes it.
  const sparkPoints = useMemo(() => {
    const points: number[] = [];
    let v = 50;
    for (let i = 0; i < 20; i++) {
      v += (Math.sin(trendSeed + i * 0.6) * 5) + (changePct >= 0 ? 1 : -1);
      points.push(Math.max(10, Math.min(90, v)));
    }
    return points;
  }, [changePct, trendSeed]);

  const sparkPath = `M ${sparkPoints
    .map((y, i) => `${(i / (sparkPoints.length - 1)) * 100},${100 - y}`)
    .join(' L ')}`;

  const sparkStroke = changePct >= 0 ? '#4A6347' : '#8B5252';

  const sparkFill = changePct >= 0 ? 'rgba(74,99,71,0.12)' : 'rgba(139,82,82,0.10)';
  const areaPath = `${sparkPath} L 100,100 L 0,100 Z`;

  return (
    <div className="group relative bg-white rounded-xl border border-sand/50 hover:border-charcoal-deep/15 shadow-card-lift hover:shadow-luxe hover:-translate-y-0.5 transition-all duration-500 p-6 overflow-hidden">
      <div
        className="absolute -top-20 -right-20 w-44 h-44 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background:
            changePct >= 0
              ? 'radial-gradient(circle, rgba(201,169,98,0.22) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(139,82,82,0.18) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between mb-4">
        <span className="text-[10px] font-semibold tracking-[0.28em] uppercase text-stone">{label}</span>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
            changePct >= 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
          }`}
        >
          {changePct >= 0 ? <TrendingUp size={11} strokeWidth={2.25} /> : <TrendingDown size={11} strokeWidth={2.25} />}
          {changePct >= 0 ? '+' : ''}{changePct.toFixed(1)}%
        </span>
      </div>

      <p
        className="relative font-display font-light text-[2.75rem] text-charcoal-deep leading-none tracking-[-0.035em] mb-2 font-mono-tight"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {value}
      </p>

      <p className="relative text-xs text-taupe mb-4">
        {changeLabel}
      </p>

      <svg
        viewBox="0 0 100 60"
        className="relative w-full h-12 overflow-visible"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={areaPath} fill={sparkFill} />
        <path
          d={sparkPath}
          stroke={sparkStroke}
          strokeWidth="1.75"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="100"
          cy={100 - sparkPoints[sparkPoints.length - 1]}
          r="3"
          fill={sparkStroke}
        />
        <circle
          cx="100"
          cy={100 - sparkPoints[sparkPoints.length - 1]}
          r="6"
          fill={sparkStroke}
          opacity="0.18"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
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

      <div className="p-6 md:p-8 lg:p-10 space-y-10">
        {loading && (
          <div className="text-center py-20">
            <Loader2 size={28} className="mx-auto text-gold-soft animate-spin mb-4" strokeWidth={1.5} />
            <p className="text-[10px] tracking-[0.4em] uppercase text-stone">Loading your maison</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-error/5 border border-error/20 p-8 text-center">
            <AlertTriangle size={24} className="text-error mx-auto mb-3" strokeWidth={1.5} />
            <p className="font-display text-xl text-charcoal-deep mb-2">Unable to load dashboard</p>
            <p className="text-sm text-stone">{error}</p>
          </div>
        )}

        {dashboard && !loading && (
          <>
            <BrandHero
              eyebrow={`Welcome back, ${firstName}`}
              title="Your Maison"
              emphasis="at a glance"
              description={`A curated overview of ${partner.brandName || 'your brand'} performance, demand signals, and pieces requiring attention — refreshed live from the platform.`}
              actions={
                <>
                  <Link
                    href="/brand/products/new"
                    className="group inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-charcoal-deep text-ivory-cream text-xs font-semibold tracking-[0.18em] uppercase hover:bg-noir transition-all shadow-glow-noir hover:shadow-glow-gold"
                  >
                    <Plus size={14} strokeWidth={2} />
                    Add a Piece
                  </Link>
                  <Link
                    href="/brand/analytics"
                    className="group inline-flex items-center gap-2 px-5 py-3 rounded-full border border-charcoal-deep/15 bg-white/60 backdrop-blur text-charcoal-deep text-xs font-semibold tracking-[0.18em] uppercase hover:border-charcoal-deep/40 hover:bg-white transition-all"
                  >
                    View Analytics
                    <ArrowRight size={12} strokeWidth={2} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </>
              }
            />

            {/* ═══════════════════════════════════════════════════════════════
                KPI STRIP — Refined cards with sparklines
            ═══════════════════════════════════════════════════════════════ */}
            <section>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <span className="text-[10px] font-semibold tracking-[0.32em] uppercase text-gold-deep block mb-1.5">
                    Pulse
                  </span>
                  <h2
                    className="font-display font-light text-3xl text-charcoal-deep tracking-[-0.025em]"
                    style={{ fontVariationSettings: '"opsz" 144' }}
                  >
                    Key Indicators
                  </h2>
                </div>
                <span className="text-[11px] font-medium tracking-tight text-stone bg-parchment px-3 py-1.5 rounded-full">
                  Last 30 days
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <LuxuryMetricCard
                  label="Products"
                  value={(stats.products?.value ?? 0).toLocaleString()}
                  changePct={parseChange(stats.products?.change_percentage)}
                  changeLabel={stats.products?.change_label || 'vs last month'}
                  trendSeed={1}
                />
                <LuxuryMetricCard
                  label="Revenue MTD"
                  value={formatCurrency(stats.revenue?.value)}
                  changePct={parseChange(stats.revenue?.change_percentage)}
                  changeLabel={stats.revenue?.change_label || 'vs last month'}
                  trendSeed={2}
                />
                <LuxuryMetricCard
                  label="Orders MTD"
                  value={(stats.orders?.value ?? 0).toLocaleString()}
                  changePct={parseChange(stats.orders?.change_percentage)}
                  changeLabel={stats.orders?.change_label || 'vs last month'}
                  trendSeed={3}
                />
                <LuxuryMetricCard
                  label="Avg Order Value"
                  value={formatCurrency(stats.avg_order_value?.value)}
                  changePct={parseChange(stats.avg_order_value?.change_percentage)}
                  changeLabel={stats.avg_order_value?.change_label || 'vs last month'}
                  trendSeed={4}
                />
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                INTELLIGENCE + ACTIONS — two-column editorial
            ═══════════════════════════════════════════════════════════════ */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Demand Signals — spans 2 cols */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-sand/50 shadow-card-lift overflow-hidden">
                <div className="px-7 py-5 border-b border-sand/40 flex items-end justify-between bg-gradient-to-r from-parchment/40 to-transparent">
                  <div>
                    <span className="text-[10px] font-semibold tracking-[0.32em] uppercase text-gold-deep block mb-1">
                      Intelligence
                    </span>
                    <h2
                      className="font-display font-light text-2xl text-charcoal-deep tracking-[-0.025em]"
                      style={{ fontVariationSettings: '"opsz" 144' }}
                    >
                      Demand Signals
                    </h2>
                  </div>
                  <Link href="/brand/analytics" className="group inline-flex items-center gap-1 text-[11px] font-semibold tracking-tight text-charcoal-deep hover:text-gold-deep transition-colors">
                    View All <ArrowRight size={12} strokeWidth={2} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                <div className="divide-y divide-sand/30">
                  {(dashboard.demand_signals || []).length === 0 ? (
                    <div className="px-6 py-16 text-center">
                      <Sparkles size={20} className="text-taupe mx-auto mb-3" strokeWidth={1.5} />
                      <p className="text-xs text-stone italic">No demand signals yet</p>
                      <p className="text-[10px] text-taupe mt-2 max-w-xs mx-auto leading-relaxed">
                        Signals will appear here as the platform observes consumer interest in your pieces.
                      </p>
                    </div>
                  ) : (
                    dashboard.demand_signals.map((signal, idx) => {
                      const isUp = signal.trend === 'up';
                      return (
                        <div key={idx} className="px-7 py-4 hover:bg-parchment/30 transition-colors duration-300">
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isUp ? 'bg-success/12 text-success' : 'bg-error/12 text-error'
                            }`}>
                              {isUp ? <TrendingUp size={16} strokeWidth={2} /> : <TrendingDown size={16} strokeWidth={2} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-display font-medium text-lg text-charcoal-deep tracking-[-0.02em] leading-tight"
                                style={{ fontVariationSettings: '"opsz" 144' }}
                              >
                                {signal.title}
                              </p>
                              <p className="text-sm text-stone mt-1 leading-relaxed">{signal.subtitle}</p>
                              <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-taupe mt-2">{signal.region}</p>
                            </div>
                            <span className={`text-lg font-semibold flex-shrink-0 font-mono-tight ${isUp ? 'text-success' : 'text-error'}`}>
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
              <div className="relative rounded-2xl overflow-hidden bg-mesh-noir text-ivory-cream shadow-glow-noir">
                <div
                  className="absolute -top-24 -right-24 w-56 h-56 rounded-full blur-3xl opacity-40 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(201,169,98,0.5) 0%, transparent 70%)' }}
                  aria-hidden="true"
                />

                <div className="relative px-6 py-5 border-b border-white/10">
                  <span className="text-[10px] font-semibold tracking-[0.32em] uppercase text-gold-soft block mb-1">
                    Atelier
                  </span>
                  <h2
                    className="font-display font-light text-2xl text-ivory-cream tracking-[-0.025em]"
                    style={{ fontVariationSettings: '"opsz" 144' }}
                  >
                    Quick Actions
                  </h2>
                </div>

                <div className="relative p-3 space-y-1.5">
                  {[
                    { href: '/brand/products/new', icon: Plus, label: 'Add Product', desc: 'Create new listing' },
                    { href: '/brand/collections', icon: FolderOpen, label: 'Collections', desc: 'Manage collections' },
                    { href: '/brand/inventory', icon: Package, label: 'Inventory', desc: 'Global stock view' },
                    { href: '/brand/analytics', icon: TrendingUp, label: 'Analytics', desc: 'View performance' },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link
                        key={action.href}
                        href={action.href}
                        className="group flex items-center gap-3.5 p-3 rounded-xl border border-white/5 hover:border-gold-soft/50 hover:bg-white/[0.04] transition-all duration-300"
                      >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gold-soft/15 border border-gold-soft/25 group-hover:bg-gold-soft group-hover:border-gold-soft transition-all duration-300">
                          <Icon size={15} strokeWidth={2} className="text-gold-soft group-hover:text-noir transition-colors duration-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ivory-cream">{action.label}</p>
                          <p className="text-xs text-ivory-cream/55 mt-0.5">{action.desc}</p>
                        </div>
                        <ArrowRight size={14} className="text-ivory-cream/30 group-hover:text-gold-soft group-hover:translate-x-1 transition-all duration-300" strokeWidth={2} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                ACTIVITY + ALERTS — two-column
            ═══════════════════════════════════════════════════════════════ */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-sand/50 shadow-card-lift overflow-hidden">
                <div className="px-7 py-5 border-b border-sand/40 flex items-end justify-between bg-gradient-to-r from-parchment/40 to-transparent">
                  <div>
                    <span className="text-[10px] font-semibold tracking-[0.32em] uppercase text-gold-deep block mb-1">
                      Live
                    </span>
                    <h2
                      className="font-display font-light text-2xl text-charcoal-deep tracking-[-0.025em]"
                      style={{ fontVariationSettings: '"opsz" 144' }}
                    >
                      Recent Activity
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-[11px] font-semibold text-success">
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                    Live
                  </span>
                </div>
                <div className="divide-y divide-sand/30">
                  {(dashboard.recent_activity || []).length === 0 ? (
                    <div className="px-6 py-16 text-center">
                      <Clock size={20} className="text-taupe mx-auto mb-3" strokeWidth={1.5} />
                      <p className="text-xs text-stone italic">No recent activity</p>
                    </div>
                  ) : (
                    dashboard.recent_activity.map((activity, idx) => {
                      const Icon = getActivityIcon(activity.type);
                      return (
                        <div key={idx} className="px-6 py-3.5 flex items-center gap-4 hover:bg-parchment/20 transition-colors duration-500">
                          <div className="w-9 h-9 bg-parchment flex items-center justify-center text-stone flex-shrink-0">
                            <Icon size={14} strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-charcoal-deep truncate">{activity.title}</p>
                            <p className="text-xs text-stone truncate mt-0.5">{activity.subtitle}</p>
                          </div>
                          <span className="text-[10px] tracking-[0.1em] uppercase text-taupe whitespace-nowrap">
                            {formatTime(activity.timestamp)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Inventory Alerts */}
              <div className="bg-white rounded-2xl border border-sand/50 shadow-card-lift overflow-hidden">
                <div className="px-7 py-5 border-b border-sand/40 flex items-end justify-between bg-gradient-to-r from-parchment/40 to-transparent">
                  <div>
                    <span className="text-[10px] font-semibold tracking-[0.32em] uppercase text-gold-deep block mb-1">
                      Atelier
                    </span>
                    <h2
                      className="font-display font-light text-2xl text-charcoal-deep tracking-[-0.025em]"
                      style={{ fontVariationSettings: '"opsz" 144' }}
                    >
                      Inventory Alerts
                    </h2>
                  </div>
                  {(dashboard.inventory_alerts || []).length > 0 && (
                    <span className="px-3 py-1.5 text-[11px] font-semibold rounded-full bg-error/10 text-error">
                      {dashboard.inventory_alerts.length} Active
                    </span>
                  )}
                </div>
                <div className="divide-y divide-sand/30">
                  {(dashboard.inventory_alerts || []).length === 0 ? (
                    <div className="px-6 py-16 text-center">
                      <div className="w-14 h-14 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package size={20} className="text-success" strokeWidth={1.5} />
                      </div>
                      <p className="font-display text-base text-charcoal-deep">All levels healthy</p>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-stone mt-2">
                        Nothing requires attention
                      </p>
                    </div>
                  ) : (
                    dashboard.inventory_alerts.slice(0, 4).map((alert, idx) => (
                      <div key={idx} className="px-6 py-4 flex items-start gap-4 hover:bg-parchment/20 transition-colors duration-500">
                        <div className="w-9 h-9 flex items-center justify-center bg-error/10 text-error flex-shrink-0">
                          <AlertTriangle size={14} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-charcoal-deep">{alert.product_name}</p>
                          <p className="text-xs text-error mt-1">
                            <span className="font-medium">{alert.current_stock}</span> units remaining
                          </p>
                          <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mt-1.5">{alert.location}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                LOW STOCK PRODUCTS — Premium table
            ═══════════════════════════════════════════════════════════════ */}
            {(dashboard.low_stock_products || []).length > 0 && (
              <section className="bg-white rounded-2xl border border-sand/50 shadow-card-lift overflow-hidden">
                <div className="px-7 md:px-8 py-5 border-b border-sand/40 flex items-end justify-between bg-gradient-to-r from-parchment/40 to-transparent">
                  <div className="flex items-end gap-3">
                    <div>
                      <span className="text-[10px] font-semibold tracking-[0.32em] uppercase text-gold-deep block mb-1">
                        Pieces in Focus
                      </span>
                      <h2
                        className="font-display font-light text-2xl text-charcoal-deep tracking-[-0.025em]"
                        style={{ fontVariationSettings: '"opsz" 144' }}
                      >
                        Low Stock
                      </h2>
                    </div>
                    <span className="mb-1 px-3 py-1.5 text-[11px] font-semibold rounded-full bg-warning/12 text-warning">
                      {dashboard.low_stock_products.length} pieces
                    </span>
                  </div>
                  <Link href="/brand/products?filter=low-stock" className="group inline-flex items-center gap-1 text-[11px] font-semibold tracking-tight text-charcoal-deep hover:text-gold-deep transition-colors">
                    View All <ArrowRight size={12} strokeWidth={2} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-sand/30 bg-parchment/30">
                        <th className="text-left px-6 md:px-8 py-4 text-[10px] tracking-[0.3em] uppercase text-taupe font-medium">Piece</th>
                        <th className="text-left px-6 py-4 text-[10px] tracking-[0.3em] uppercase text-taupe font-medium">SKU</th>
                        <th className="text-right px-6 py-4 text-[10px] tracking-[0.3em] uppercase text-taupe font-medium">Stock</th>
                        <th className="text-right px-6 md:px-8 py-4 text-[10px] tracking-[0.3em] uppercase text-taupe font-medium">Demand</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sand/30">
                      {dashboard.low_stock_products.slice(0, 5).map((product, idx) => (
                        <tr key={idx} className="hover:bg-parchment/20 transition-colors duration-500">
                          <td className="px-6 md:px-8 py-4">
                            <p className="font-display text-base text-charcoal-deep tracking-[-0.01em]">{product.product_name}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs tracking-[0.1em] uppercase text-stone">{product.sku}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-base text-warning font-medium">{product.stock_units}</span>
                            <span className="text-[10px] tracking-[0.2em] uppercase text-taupe ml-2">units</span>
                          </td>
                          <td className="px-6 md:px-8 py-4 text-right">
                            <span className="text-base text-charcoal-deep">{product.demand_count}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Closing editorial flourish */}
            <div className="flex items-center justify-center gap-4 pt-6">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold-soft/40" />
              <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-stone/60">
                ModaGlimmora — Atelier Intelligence
              </p>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold-soft/40" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

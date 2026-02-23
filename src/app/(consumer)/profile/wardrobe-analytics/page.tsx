'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Crown, TrendingUp, TrendingDown, DollarSign, PieChart, Calendar, Award, AlertCircle, Info, ChevronRight, BarChart3, Target, Eye } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface WardrobeItemAnalytics {
  id: string;
  product: any;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  appreciation: number;
  wearCount: number;
  costPerWear: number;
  lastWorn?: string;
  category: string;
}

export default function WardrobeAnalyticsPage() {
  const router = useRouter();
  const { isUHNI, isHydrated, wardrobe } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [sortBy, setSortBy] = useState<'appreciation' | 'value' | 'wears' | 'costPerWear'>('appreciation');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Redirect non-UHNI users
  useEffect(() => {
    if (isHydrated && !isUHNI) {
      router.push('/profile');
    }
  }, [isUHNI, isHydrated, router]);

  if (!isHydrated || !isUHNI || !wardrobe || wardrobe.length === 0) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // TODO: Pull real analytics from wardrobe tracking API when available
  // Currently generating sample data for demonstration purposes
  // Uses seeded values per item index instead of Math.random() to avoid hydration mismatches
  const wardrobeAnalytics: WardrobeItemAnalytics[] = wardrobe.map((item, index) => {
    const purchasePrice = item.product.price;
    const appreciationRate = item.product.category === 'bags' ? 0.08 : -0.15;
    const monthsOwned = ((index * 7 + 3) % 24) + 1; // Deterministic per-item
    const appreciation = appreciationRate * (monthsOwned / 12);
    const currentValue = purchasePrice * (1 + appreciation);
    const wearCount = item.wearCount || ((index * 13 + 5) % 50) + 1; // Use actual wearCount if available
    const costPerWear = purchasePrice / wearCount;

    return {
      id: item.id,
      product: item.product,
      purchaseDate: new Date(Date.now() - monthsOwned * 30 * 24 * 60 * 60 * 1000).toISOString(),
      purchasePrice,
      currentValue,
      appreciation: appreciation * 100,
      wearCount,
      costPerWear,
      lastWorn: item.lastWorn || new Date(Date.now() - ((index * 11 + 2) % 90) * 24 * 60 * 60 * 1000).toISOString(),
      category: item.product.category
    };
  });

  // Calculate overall metrics
  const totalPurchaseValue = wardrobeAnalytics.reduce((sum, item) => sum + item.purchasePrice, 0);
  const totalCurrentValue = wardrobeAnalytics.reduce((sum, item) => sum + item.currentValue, 0);
  const overallAppreciation = ((totalCurrentValue - totalPurchaseValue) / totalPurchaseValue) * 100;
  const averageCostPerWear = wardrobeAnalytics.reduce((sum, item) => sum + item.costPerWear, 0) / wardrobeAnalytics.length;

  // Top performers
  const topAppreciating = [...wardrobeAnalytics]
    .sort((a, b) => b.appreciation - a.appreciation)
    .slice(0, 5);

  const topValue = [...wardrobeAnalytics]
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 5);

  const mostWorn = [...wardrobeAnalytics]
    .sort((a, b) => b.wearCount - a.wearCount)
    .slice(0, 5);

  const bestCostPerWear = [...wardrobeAnalytics]
    .sort((a, b) => a.costPerWear - b.costPerWear)
    .slice(0, 5);

  // Category breakdown
  const categoryValues = wardrobeAnalytics.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { count: 0, value: 0, appreciation: 0 };
    }
    acc[item.category].count++;
    acc[item.category].value += item.currentValue;
    acc[item.category].appreciation += item.appreciation;
    return acc;
  }, {} as Record<string, { count: number; value: number; appreciation: number }>);

  // Memoized sorted items to avoid re-creating array every render
  const sortedItems = useMemo(() => {
    const sorted = [...wardrobeAnalytics];
    switch (sortBy) {
      case 'appreciation':
        return sorted.sort((a, b) => b.appreciation - a.appreciation);
      case 'value':
        return sorted.sort((a, b) => b.currentValue - a.currentValue);
      case 'wears':
        return sorted.sort((a, b) => b.wearCount - a.wearCount);
      case 'costPerWear':
        return sorted.sort((a, b) => a.costPerWear - b.costPerWear);
      default:
        return sorted;
    }
  }, [sortBy, wardrobeAnalytics]);

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>

          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gold-soft/20 flex items-center justify-center">
                <BarChart3 size={28} className="text-gold-soft" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 size={12} className="text-gold-soft" />
                  <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                    Portfolio Insights
                  </span>
                </div>
                <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
                  Wardrobe Analytics & ROI
                </h1>
                <p className="text-sand mt-2">Investment tracking & performance insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Sample Data Banner */}
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 flex items-start gap-3">
          <Info size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900 text-sm">Sample Data</p>
            <p className="text-xs text-amber-700 mt-1">
              Values shown are estimates based on category trends and general market data.
              Connect purchase history for accurate portfolio tracking.
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-charcoal-deep flex items-center justify-center">
                <DollarSign size={18} className="text-gold-soft" />
              </div>
            </div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Current Value</p>
            <p className="font-display text-2xl text-charcoal-deep">€{totalCurrentValue.toLocaleString()}</p>
            <div className={`flex items-center gap-1 text-xs mt-2 ${overallAppreciation >= 0 ? 'text-success' : 'text-error'}`}>
              {overallAppreciation >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{overallAppreciation >= 0 ? '+' : ''}{overallAppreciation.toFixed(1)}% vs purchase</span>
            </div>
          </div>

          <div className="bg-white p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gold-muted/10 flex items-center justify-center">
                <Target size={18} className="text-gold-muted" />
              </div>
            </div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Avg. Cost Per Wear</p>
            <p className="font-display text-2xl text-charcoal-deep">€{averageCostPerWear.toFixed(0)}</p>
            <p className="text-xs text-stone mt-2">Luxury benchmark: €350</p>
          </div>

          <div className="bg-white p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-success/10 flex items-center justify-center">
                <TrendingUp size={18} className="text-success" />
              </div>
            </div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Total Appreciation</p>
            <p className="font-display text-2xl text-charcoal-deep">€{(totalCurrentValue - totalPurchaseValue).toLocaleString()}</p>
            <p className="text-xs text-success mt-2">Portfolio gain</p>
          </div>

          <div className="bg-white p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gold-soft/10 flex items-center justify-center">
                <Award size={18} className="text-gold-soft" />
              </div>
            </div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Total Pieces</p>
            <p className="font-display text-2xl text-charcoal-deep">{wardrobe.length}</p>
            <p className="text-xs text-stone mt-2">In your collection</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Top Performers */}
          <div className="lg:col-span-2 space-y-8">
            {/* Category Performance */}
            <div className="bg-white p-8">
              <h2 className="font-display text-xl text-charcoal-deep mb-6">Category Performance</h2>
              <div className="space-y-4">
                {Object.entries(categoryValues).map(([category, data]) => {
                  const avgAppreciation = data.appreciation / data.count;
                  return (
                    <div key={category} className="p-4 border border-sand">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-charcoal-deep capitalize">{category}</p>
                          <p className="text-xs text-taupe">{data.count} pieces</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-lg text-charcoal-deep">€{data.value.toLocaleString()}</p>
                          <div className={`flex items-center justify-end gap-1 text-xs ${avgAppreciation >= 0 ? 'text-success' : 'text-error'}`}>
                            {avgAppreciation >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            <span>{avgAppreciation >= 0 ? '+' : ''}{avgAppreciation.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-2 bg-parchment overflow-hidden">
                        <div
                          className={`h-full ${avgAppreciation >= 0 ? 'bg-success' : 'bg-error'}`}
                          style={{ width: `${Math.abs(avgAppreciation) * 5}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Lists */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white p-6">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp size={18} className="text-success" />
                  <h3 className="font-display text-lg text-charcoal-deep">Top Appreciating</h3>
                </div>
                <div className="space-y-3">
                  {topAppreciating.slice(0, 3).map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-success/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-success font-medium">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-charcoal-deep truncate">{item.product.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-success">+{item.appreciation.toFixed(1)}%</p>
                          <p className="text-xs text-taupe">€{item.currentValue.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Target size={18} className="text-gold-muted" />
                  <h3 className="font-display text-lg text-charcoal-deep">Best Cost/Wear</h3>
                </div>
                <div className="space-y-3">
                  {bestCostPerWear.slice(0, 3).map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gold-muted/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-gold-muted font-medium">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-charcoal-deep truncate">{item.product.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gold-muted">€{item.costPerWear.toFixed(0)}/wear</p>
                          <p className="text-xs text-taupe">{item.wearCount} wears</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Full Wardrobe Table */}
            <div className="bg-white overflow-hidden">
              <div className="p-6 border-b border-sand flex items-center justify-between">
                <h2 className="font-display text-xl text-charcoal-deep">All Items</h2>
                <div className="flex gap-2">
                  {(['appreciation', 'value', 'wears', 'costPerWear'] as const).map((sort) => (
                    <button
                      key={sort}
                      onClick={() => setSortBy(sort)}
                      className={`px-3 py-1 text-xs tracking-[0.1em] uppercase transition-colors ${
                        sortBy === sort
                          ? 'bg-charcoal-deep text-ivory-cream'
                          : 'bg-parchment text-stone hover:bg-sand'
                      }`}
                    >
                      {sort === 'costPerWear' ? 'Cost/Wear' : sort}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-sand max-h-[600px] overflow-y-auto">
                {sortedItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/product/${item.product.slug}`}
                    className="flex items-center gap-4 p-4 hover:bg-parchment/50 transition-colors"
                  >
                    <div className="relative w-16 h-20 flex-shrink-0">
                      <Image
                        src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-taupe tracking-wider uppercase">{item.product.brandName}</p>
                      <p className="text-sm text-charcoal-deep truncate">{item.product.name}</p>
                      <p className="text-xs text-stone mt-1">Purchased {new Date(item.purchaseDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg text-charcoal-deep">€{item.currentValue.toLocaleString()}</p>
                      <div className={`flex items-center justify-end gap-1 text-xs ${item.appreciation >= 0 ? 'text-success' : 'text-error'}`}>
                        {item.appreciation >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        <span>{item.appreciation >= 0 ? '+' : ''}{item.appreciation.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-stone">
                      <p>{item.wearCount} wears</p>
                      <p>€{item.costPerWear.toFixed(0)}/wear</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Insights */}
          <div className="space-y-6">
            {/* Investment Strategy */}
            <div className="bg-charcoal-deep p-6">
              <div className="flex items-center gap-3 mb-6">
                <Award size={20} className="text-gold-soft" />
                <h3 className="font-display text-lg text-ivory-cream">Investment Strategy</h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-ivory-cream/5">
                  <p className="text-xs text-taupe mb-1">Portfolio Composition</p>
                  <p className="text-sm text-ivory-cream">
                    {Object.keys(categoryValues).length} categories across {wardrobe.length} pieces
                  </p>
                </div>

                <div className="p-4 bg-ivory-cream/5">
                  <p className="text-xs text-taupe mb-1">Best Performing Category</p>
                  <p className="text-sm text-ivory-cream capitalize">
                    {Object.entries(categoryValues).sort((a, b) =>
                      (b[1].appreciation / b[1].count) - (a[1].appreciation / a[1].count)
                    )[0][0]}
                  </p>
                </div>

                <div className="pt-4 border-t border-ivory-cream/10">
                  <p className="text-xs text-sand mb-3">Recommendations</p>
                  <ul className="space-y-2 text-sm text-taupe">
                    <li className="flex items-start gap-2">
                      <span className="text-gold-soft">•</span>
                      <span>Consider vintage Hermès bags for appreciation potential</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gold-soft">•</span>
                      <span>High wear count on tailored pieces indicates good value</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gold-soft">•</span>
                      <span>Limited edition items showing strong appreciation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Market Insights */}
            <div className="bg-white p-6">
              <h3 className="font-display text-lg text-charcoal-deep mb-4">Market Insights</h3>
              <div className="space-y-4">
                <div className="p-4 bg-parchment">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-success" />
                    <p className="text-xs tracking-[0.1em] uppercase text-taupe">Trending Up</p>
                  </div>
                  <p className="text-sm text-charcoal-deep">Classic Chanel flap bags (+22% YoY)</p>
                </div>

                <div className="p-4 bg-parchment">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye size={14} className="text-gold-muted" />
                    <p className="text-xs tracking-[0.1em] uppercase text-taupe">Watch</p>
                  </div>
                  <p className="text-sm text-charcoal-deep">Bottega Veneta bags showing increased demand</p>
                </div>

                <div className="p-4 bg-parchment">
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={14} className="text-stone" />
                    <p className="text-xs tracking-[0.1em] uppercase text-taupe">Note</p>
                  </div>
                  <p className="text-sm text-charcoal-deep">Seasonal collections typically depreciate faster</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6">
              <h3 className="font-display text-lg text-charcoal-deep mb-4">Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/wardrobe"
                  className="flex items-center justify-between p-3 border border-sand hover:border-charcoal-deep transition-colors group"
                >
                  <span className="text-sm text-charcoal-deep">View Full Wardrobe</span>
                  <ChevronRight size={14} className="text-stone group-hover:text-charcoal-deep group-hover:translate-x-1 transition-all" />
                </Link>
                <Link
                  href="/uhni/concierge"
                  className="flex items-center justify-between p-3 border border-sand hover:border-charcoal-deep transition-colors group"
                >
                  <span className="text-sm text-charcoal-deep">Consult Concierge</span>
                  <ChevronRight size={14} className="text-stone group-hover:text-charcoal-deep group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-parchment border border-sand flex items-start gap-4">
          <AlertCircle size={18} className="text-stone flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-charcoal-deep mb-2">Important Note</p>
            <p className="text-sm text-stone">
              Value estimates are based on market data and AI analysis. Actual resale values may vary based on
              condition, market demand, and authentication. Appreciation rates shown are historical and not
              guaranteed for future performance. Consult your concierge for personalized investment advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

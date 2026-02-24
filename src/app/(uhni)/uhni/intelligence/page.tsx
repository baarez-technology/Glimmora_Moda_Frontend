'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Crown, TrendingUp, Sparkles, DollarSign, ShoppingBag, Calendar, Target, PieChart, BarChart3, Eye, Award, Clock, Heart, ChevronRight, Info } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function IntelligenceDashboardPage() {
  const router = useRouter();
  const { wardrobe, fashionIdentity, considerations, orders, calendarEvents } = useApp();
  // TODO: Add wishlist to AppContext when feature is implemented
  const wishlist: any[] = [];
  const [isLoaded, setIsLoaded] = useState(false);
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Calculate wardrobe analytics
  const totalWardrobeValue = wardrobe.reduce((sum, item) => sum + item.product.price, 0);
  const averageItemValue = wardrobe.length > 0 ? totalWardrobeValue / wardrobe.length : 0;

  // Brand distribution
  const brandCounts = wardrobe.reduce((acc, item) => {
    acc[item.product.brandName] = (acc[item.product.brandName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topBrands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Category distribution
  const categoryCounts = wardrobe.reduce((acc, item) => {
    acc[item.product.category] = (acc[item.product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Helper: get date range based on timeframe
  const timeframeRange = useMemo(() => {
    const now = new Date();
    const start = new Date();
    if (timeframe === 'month') start.setMonth(now.getMonth() - 1);
    else if (timeframe === 'quarter') start.setMonth(now.getMonth() - 3);
    else start.setFullYear(now.getFullYear() - 1);
    return { start, end: now };
  }, [timeframe]);

  // Filter orders by timeframe
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= timeframeRange.start && d <= timeframeRange.end;
    });
  }, [orders, timeframeRange]);

  // Filter wardrobe additions by timeframe
  const filteredWardrobeAdditions = useMemo(() => {
    return wardrobe.filter(w => {
      const d = new Date(w.addedAt);
      return d >= timeframeRange.start && d <= timeframeRange.end;
    });
  }, [wardrobe, timeframeRange]);

  // Style evolution insights (Fix 1: derived from real data)
  const styleInsights = useMemo(() => {
    const isSample = wardrobe.length === 0;

    // Dominant aesthetic from fashionIdentity or wardrobe tags
    let dominantAesthetic = 'Not Yet Defined';
    if (fashionIdentity && fashionIdentity.aesthetics.length > 0) {
      dominantAesthetic = fashionIdentity.aesthetics[0];
    } else if (wardrobe.length > 0) {
      const tagCounts: Record<string, number> = {};
      wardrobe.forEach(item => {
        item.product.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      const sorted = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) dominantAesthetic = sorted[0][0];
    }

    // Evolving towards: second aesthetic or second most common tag
    let evolvingTowards = 'Exploring';
    if (fashionIdentity && fashionIdentity.aesthetics.length > 1) {
      evolvingTowards = fashionIdentity.aesthetics[1];
    }

    // Brand diversity
    const uniqueBrands = new Set(wardrobe.map(i => i.product.brandName)).size;

    // Category balance
    const catEntries = Object.entries(categoryCounts);
    const categoryBalance = catEntries.length > 0
      ? catEntries.length >= 4 ? 'Well Balanced' : catEntries.length >= 2 ? 'Moderate' : 'Focused'
      : 'N/A';

    // Confidence from fashionIdentity
    const confidenceMap: Record<string, number> = { decisive: 92, guided: 75, advisory: 60 };
    const confidence = fashionIdentity ? (confidenceMap[fashionIdentity.confidenceLevel] || 70) : 50;

    // Style evolution label
    const styleEvolution = fashionIdentity
      ? fashionIdentity.confidenceLevel === 'decisive' ? 'Refined' : 'Evolving'
      : 'Evolving';

    // Generate real recommendations
    const recommendations: string[] = [];
    if (wardrobe.length > 0) {
      recommendations.push(`Your wardrobe features ${uniqueBrands} distinct brand${uniqueBrands !== 1 ? 's' : ''} across ${catEntries.length} categor${catEntries.length !== 1 ? 'ies' : 'y'}`);
      if (catEntries.length > 0) {
        const topCat = catEntries.sort((a, b) => b[1] - a[1])[0];
        recommendations.push(`${topCat[0].charAt(0).toUpperCase() + topCat[0].slice(1)} leads your wardrobe at ${Math.round((topCat[1] / wardrobe.length) * 100)}% of total pieces`);
      }
      recommendations.push(`Category balance: ${categoryBalance} — Style evolution: ${styleEvolution}`);
    } else {
      recommendations.push('Add items to your wardrobe to unlock personalized style insights');
      recommendations.push('Your fashion identity will shape AI-powered recommendations');
      recommendations.push('The more you curate, the smarter your intelligence becomes');
    }

    return {
      dominantAesthetic,
      evolvingTowards,
      confidence,
      recommendations,
      isSample,
    };
  }, [wardrobe, fashionIdentity, categoryCounts]);

  // Shopping behavior analytics (Fix 2: derived from real orders/considerations)
  const shoppingBehavior = useMemo(() => {
    const isSample = filteredOrders.length === 0 && considerations.length === 0;

    // Average order value
    const avgOrderValue = filteredOrders.length > 0
      ? filteredOrders.reduce((sum, o) => sum + o.total, 0) / filteredOrders.length
      : 0;

    // Preferred categories from wardrobe
    const catSorted = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
    const preferredCategories = catSorted.slice(0, 3).map(([c]) => c.charAt(0).toUpperCase() + c.slice(1));

    // Purchase frequency
    let purchaseFrequency = 'No orders yet';
    if (filteredOrders.length > 0) {
      const label = timeframe === 'month' ? 'month' : timeframe === 'quarter' ? 'quarter' : 'year';
      purchaseFrequency = `${filteredOrders.length} order${filteredOrders.length !== 1 ? 's' : ''} this ${label}`;
    }

    // Consideration conversion
    const totalConsidered = considerations.length + filteredOrders.reduce((s, o) => s + o.items.length, 0);
    const conversionRate = totalConsidered > 0
      ? Math.round((filteredOrders.reduce((s, o) => s + o.items.length, 0) / totalConsidered) * 100)
      : 0;

    // Decision speed heuristic based on conversion rate
    const decisionSpeed = conversionRate >= 70 ? 'Decisive' : conversionRate >= 40 ? 'Considered' : 'Exploratory';

    return {
      decisionSpeed,
      averageOrderValue: avgOrderValue,
      conversionRate,
      preferredCategories: preferredCategories.length > 0 ? preferredCategories.join(', ') : 'N/A',
      purchaseFrequency,
      isSample,
    };
  }, [filteredOrders, considerations, categoryCounts, timeframe]);

  // Upcoming opportunities (Fix 4: derived from calendarEvents)
  const opportunities = useMemo(() => {
    const now = new Date();
    const upcomingEvents = calendarEvents
      .filter(e => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);

    if (upcomingEvents.length > 0) {
      return upcomingEvents.map((event, idx) => {
        const eventDate = new Date(event.date);
        const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const urgency = daysUntil <= 3 ? 'high' : daysUntil <= 7 ? 'medium' : 'low';
        const dressCodeLabel = event.dressCode
          ? event.dressCode.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
          : 'Smart';

        return {
          id: event.id || String(idx + 1),
          type: 'event_prep' as const,
          icon: Calendar,
          title: `Prepare for ${event.title}`,
          description: `${dressCodeLabel} attire needed — ${daysUntil} day${daysUntil !== 1 ? 's' : ''} away${event.location ? ` at ${event.location}` : ''}`,
          priority: urgency,
          actionLabel: 'Plan Outfit',
          actionRoute: '/uhni/planner',
        };
      });
    }

    // Fallback: generic opportunities when no events
    const fallback: {
      id: string;
      type: string;
      icon: typeof Calendar;
      title: string;
      description: string;
      priority: string;
      actionLabel: string;
      actionRoute: string;
    }[] = [
      {
        id: 'generic-1',
        type: 'wardrobe',
        icon: ShoppingBag,
        title: 'Complete Your Wardrobe',
        description: wardrobe.length > 0
          ? `${wardrobe.length} pieces catalogued — keep building your collection`
          : 'Start adding pieces to unlock AI-powered outfit suggestions',
        priority: 'medium',
        actionLabel: 'View Wardrobe',
        actionRoute: '/wardrobe',
      },
    ];
    if (considerations.length > 0) {
      fallback.push({
        id: 'generic-2',
        type: 'consideration',
        icon: Heart,
        title: 'Items Under Consideration',
        description: `${considerations.length} item${considerations.length !== 1 ? 's' : ''} awaiting your decision`,
        priority: 'low',
        actionLabel: 'Review Items',
        actionRoute: '/considerations',
      });
    }
    return fallback;
  }, [calendarEvents, wardrobe, considerations]);

  // Wardrobe efficiency metrics (Fix 3: derived from real data)
  const efficiencyMetrics = useMemo(() => {
    if (wardrobe.length === 0) {
      return {
        utilizationRate: 0,
        costPerWear: 0,
        mostWornCategory: 'N/A',
        underutilizedItems: 0,
        perfectRotation: 0,
      };
    }

    // Utilization: items with wearCount > 0
    const wornItems = wardrobe.filter(i => i.wearCount > 0);
    const utilizationRate = Math.round((wornItems.length / wardrobe.length) * 100);

    // Cost per wear: average price / average wearCount (avoid division by zero)
    const totalPrice = wardrobe.reduce((s, i) => s + i.product.price, 0);
    const totalWears = wardrobe.reduce((s, i) => s + i.wearCount, 0);
    const costPerWear = totalWears > 0 ? Math.round(totalPrice / totalWears) : totalPrice > 0 ? totalPrice : 0;

    // Most worn category
    const catWears: Record<string, number> = {};
    wardrobe.forEach(i => {
      catWears[i.product.category] = (catWears[i.product.category] || 0) + i.wearCount;
    });
    const sortedCatWears = Object.entries(catWears).sort((a, b) => b[1] - a[1]);
    const mostWornCategory = sortedCatWears.length > 0
      ? sortedCatWears[0][0].charAt(0).toUpperCase() + sortedCatWears[0][0].slice(1)
      : 'N/A';

    // Underutilized items: wearCount === 0
    const underutilizedItems = wardrobe.filter(i => i.wearCount === 0).length;

    // Versatility / rotation score based on category diversity and utilization
    const uniqueCats = new Set(wardrobe.map(i => i.product.category)).size;
    const diversityScore = Math.min(uniqueCats * 15, 50);
    const utilizationScore = Math.min(utilizationRate / 2, 50);
    const perfectRotation = Math.round(diversityScore + utilizationScore);

    return {
      utilizationRate,
      costPerWear,
      mostWornCategory,
      underutilizedItems,
      perfectRotation,
    };
  }, [wardrobe]);

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/uhni"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className={`flex items-start justify-between gap-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gold-soft/20 flex items-center justify-center">
                <Sparkles size={28} className="text-gold-soft" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={12} className="text-gold-soft" />
                  <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                    AI-Powered Insights
                  </span>
                </div>
                <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
                  Intelligence Dashboard
                </h1>
                <p className="text-sand mt-2">AI-powered insights into your style & wardrobe</p>
              </div>
            </div>

            {/* Timeframe Selector */}
            <div className="flex gap-1 bg-charcoal-warm p-1">
              {(['month', 'quarter', 'year'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-4 py-2 text-xs tracking-[0.1em] uppercase transition-colors ${
                    timeframe === t
                      ? 'bg-gold-soft text-charcoal-deep'
                      : 'text-sand hover:text-ivory-cream'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Key Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-charcoal-deep flex items-center justify-center">
                <ShoppingBag size={18} className="text-gold-soft" />
              </div>
              {filteredWardrobeAdditions.length > 0 && <TrendingUp size={16} className="text-success" />}
            </div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Wardrobe Value</p>
            <p className="font-display text-2xl text-charcoal-deep">€{totalWardrobeValue.toLocaleString()}</p>
            <p className="text-xs text-stone mt-1">{filteredWardrobeAdditions.length > 0 ? `${filteredWardrobeAdditions.length} piece${filteredWardrobeAdditions.length !== 1 ? 's' : ''} added this ${timeframe}` : `Current ${timeframe}`}</p>
          </div>

          <div className="bg-white p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gold-muted/10 flex items-center justify-center">
                <BarChart3 size={18} className="text-gold-muted" />
              </div>
            </div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Avg. Item Value</p>
            <p className="font-display text-2xl text-charcoal-deep">€{averageItemValue.toLocaleString()}</p>
            <p className="text-xs text-stone mt-1">{wardrobe.length} pieces total</p>
          </div>

          <div className="bg-white p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-success/10 flex items-center justify-center">
                <Target size={18} className="text-success" />
              </div>
            </div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Utilization Rate</p>
            <p className="font-display text-2xl text-charcoal-deep">{efficiencyMetrics.utilizationRate}%</p>
            <p className="text-xs text-stone mt-1">{efficiencyMetrics.utilizationRate >= 75 ? 'Excellent rotation' : efficiencyMetrics.utilizationRate >= 50 ? 'Good rotation' : efficiencyMetrics.utilizationRate > 0 ? 'Room to improve' : 'Start wearing to track'}</p>
          </div>

          <div className="bg-white p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gold-soft/10 flex items-center justify-center">
                <Award size={18} className="text-gold-soft" />
              </div>
            </div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Style Score</p>
            <p className="font-display text-2xl text-charcoal-deep">{styleInsights.confidence}/100</p>
            <p className="text-xs text-stone mt-1">AI confidence rating</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Analytics */}
          <div className="lg:col-span-2 space-y-8">
            {/* Style Evolution */}
            <div className="bg-white p-8">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles size={20} className="text-gold-soft" />
                <h2 className="font-display text-xl text-charcoal-deep">Style Evolution</h2>
                {styleInsights.isSample && (
                  <span className="text-[10px] tracking-[0.15em] uppercase px-2 py-1 bg-sand/30 text-taupe">Sample Insights</span>
                )}
              </div>

              <div className="space-y-6">
                <div className="p-5 bg-gradient-to-r from-gold-soft/5 to-transparent border-l-2 border-gold-soft">
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-sm text-taupe">Dominant Aesthetic</p>
                    <span className="text-xs px-2 py-1 bg-gold-soft/10 text-gold-muted">{styleInsights.confidence}% confident</span>
                  </div>
                  <p className="font-display text-2xl text-charcoal-deep mb-2">{styleInsights.dominantAesthetic}</p>
                  <p className="text-sm text-stone">Evolving towards: <span className="text-charcoal-deep font-medium">{styleInsights.evolvingTowards}</span></p>
                </div>

                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-4">Key Insights</p>
                  <div className="space-y-3">
                    {styleInsights.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-parchment">
                        <div className="w-6 h-6 bg-charcoal-deep flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-gold-soft">{index + 1}</span>
                        </div>
                        <p className="text-sm text-stone">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Brand & Category Distribution */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white p-6">
                <div className="flex items-center gap-3 mb-6">
                  <PieChart size={18} className="text-stone" />
                  <h3 className="font-display text-lg text-charcoal-deep">Top Brands</h3>
                </div>
                <div className="space-y-4">
                  {topBrands.map(([brand, count], index) => {
                    const percentage = (count / wardrobe.length) * 100;
                    return (
                      <div key={brand}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-charcoal-deep">{brand}</span>
                          <span className="text-xs text-taupe">{count} pieces</span>
                        </div>
                        <div className="h-2 bg-parchment overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-charcoal-deep to-gold-muted"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 size={18} className="text-stone" />
                  <h3 className="font-display text-lg text-charcoal-deep">Categories</h3>
                </div>
                <div className="space-y-4">
                  {Object.entries(categoryCounts).map(([category, count]) => {
                    const percentage = (count / wardrobe.length) * 100;
                    return (
                      <div key={category}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-charcoal-deep capitalize">{category}</span>
                          <span className="text-xs text-taupe">{Math.round(percentage)}%</span>
                        </div>
                        <div className="h-2 bg-parchment overflow-hidden">
                          <div
                            className="h-full bg-gold-muted"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Shopping Behavior */}
            <div className="bg-white p-8">
              <div className="flex items-center gap-3 mb-6">
                <Eye size={20} className="text-stone" />
                <h2 className="font-display text-xl text-charcoal-deep">Shopping Behavior</h2>
                {shoppingBehavior.isSample && (
                  <span className="text-[10px] tracking-[0.15em] uppercase px-2 py-1 bg-sand/30 text-taupe">Sample Analytics</span>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-4 bg-parchment">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Decision Style</p>
                  <p className="font-display text-lg text-charcoal-deep">{shoppingBehavior.decisionSpeed}</p>
                  <p className="text-xs text-stone mt-1">Based on consideration-to-purchase ratio</p>
                </div>

                <div className="p-4 bg-parchment">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Conversion Rate</p>
                  <p className="font-display text-lg text-charcoal-deep">{shoppingBehavior.conversionRate}%</p>
                  <p className="text-xs text-stone mt-1">Consideration to purchase</p>
                </div>

                <div className="p-4 bg-parchment">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Purchase Frequency</p>
                  <p className="font-display text-lg text-charcoal-deep">{shoppingBehavior.purchaseFrequency}</p>
                  <p className="text-xs text-stone mt-1">Avg. order: {shoppingBehavior.averageOrderValue > 0 ? `€${Math.round(shoppingBehavior.averageOrderValue).toLocaleString()}` : 'N/A'}</p>
                </div>

                <div className="p-4 bg-parchment">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Cost Per Wear</p>
                  <p className="font-display text-lg text-charcoal-deep">{efficiencyMetrics.costPerWear > 0 ? `€${efficiencyMetrics.costPerWear.toLocaleString()}` : 'N/A'}</p>
                  <p className="text-xs text-stone mt-1">{shoppingBehavior.preferredCategories !== 'N/A' ? `Top: ${shoppingBehavior.preferredCategories}` : 'Add items to track'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Opportunities & Actions */}
          <div className="space-y-6">
            {/* Opportunities */}
            <div className="bg-white p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg text-charcoal-deep">Opportunities</h3>
                <span className="text-xs px-2 py-1 bg-success/10 text-success">{opportunities.length} Active</span>
              </div>

              <div className="space-y-4">
                {opportunities.map((opp) => (
                  <div key={opp.id} className={`p-4 border ${
                    opp.priority === 'high' ? 'border-gold-muted bg-gold-soft/5' : 'border-sand'
                  }`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-8 h-8 flex items-center justify-center ${
                        opp.priority === 'high' ? 'bg-gold-muted/20' : 'bg-parchment'
                      }`}>
                        <opp.icon size={16} className={opp.priority === 'high' ? 'text-gold-muted' : 'text-stone'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-charcoal-deep text-sm mb-1">{opp.title}</p>
                        <p className="text-xs text-stone">{opp.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(opp.actionRoute || '/wardrobe')}
                      className="w-full py-2 text-xs tracking-[0.1em] uppercase text-charcoal-deep border border-sand hover:border-charcoal-deep transition-colors"
                    >
                      {opp.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Wardrobe Health */}
            <div className="bg-charcoal-deep p-6">
              <h3 className="font-display text-lg text-ivory-cream mb-6">Wardrobe Health</h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-sand">Rotation Score</span>
                    <span className="text-ivory-cream">{efficiencyMetrics.perfectRotation}/100</span>
                  </div>
                  <div className="h-2 bg-charcoal-warm overflow-hidden">
                    <div className="h-full bg-gold-soft" style={{ width: `${efficiencyMetrics.perfectRotation}%` }} />
                  </div>
                </div>

                <div className="pt-4 border-t border-ivory-cream/10">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-sand">Most Worn</span>
                    <span className="text-ivory-cream">{efficiencyMetrics.mostWornCategory}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-sand">Underutilized</span>
                    <span className="text-gold-soft">{efficiencyMetrics.underutilizedItems} items</span>
                  </div>
                </div>

                <Link
                  href="/wardrobe"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gold-soft/20 text-gold-soft hover:bg-gold-soft/30 transition-colors mt-4"
                >
                  <span className="text-xs tracking-[0.1em] uppercase">Optimize Wardrobe</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6">
              <h3 className="font-display text-lg text-charcoal-deep mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/wardrobe"
                  className="flex items-center justify-between p-3 border border-sand hover:border-charcoal-deep transition-colors group"
                >
                  <span className="text-sm text-charcoal-deep">View Full Wardrobe</span>
                  <ChevronRight size={14} className="text-stone group-hover:text-charcoal-deep group-hover:translate-x-1 transition-all" />
                </Link>
                <Link
                  href="/uhni/autonomous"
                  className="flex items-center justify-between p-3 border border-sand hover:border-charcoal-deep transition-colors group"
                >
                  <span className="text-sm text-charcoal-deep">Autonomous Settings</span>
                  <ChevronRight size={14} className="text-stone group-hover:text-charcoal-deep group-hover:translate-x-1 transition-all" />
                </Link>
                <Link
                  href="/uhni/concierge"
                  className="flex items-center justify-between p-3 border border-sand hover:border-charcoal-deep transition-colors group"
                >
                  <span className="text-sm text-charcoal-deep">Contact Concierge</span>
                  <ChevronRight size={14} className="text-stone group-hover:text-charcoal-deep group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-12 p-6 bg-parchment border border-sand flex items-start gap-4">
          <Info size={18} className="text-stone flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-charcoal-deep mb-2">About Intelligence Dashboard</p>
            <p className="text-sm text-stone">
              This dashboard uses advanced AI to analyze your wardrobe composition, shopping patterns, and style evolution.
              All insights are personalized and updated in real-time as your collection grows. Data remains private and is
              never shared with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

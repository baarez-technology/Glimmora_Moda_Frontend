'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Crown, TrendingUp, Sparkles, DollarSign, ShoppingBag, Calendar, Target, PieChart, BarChart3, Eye, Award, Clock, Heart, ChevronRight, Info } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function IntelligenceDashboardPage() {
  const router = useRouter();
  const { isUHNI, wardrobe, considerations, orders, calendarEvents } = useApp();
  // TODO: Add wishlist to AppContext when feature is implemented
  const wishlist: any[] = [];
  const [isLoaded, setIsLoaded] = useState(false);
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Redirect non-UHNI users
  useEffect(() => {
    if (!isUHNI) {
      router.push('/profile');
    }
  }, [isUHNI, router]);

  if (!isUHNI) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading...</p>
        </div>
      </div>
    );
  }

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

  // Style evolution insights
  const styleInsights = {
    dominantAesthetic: 'Minimalist Luxury',
    evolvingTowards: 'Experimental Tailoring',
    confidence: 89,
    recommendations: [
      'Your style has matured towards cleaner lines and monochromatic palettes',
      'Increased investment in timeless pieces (+45% YoY)',
      'Growing interest in emerging designers from Paris and Milan'
    ]
  };

  // Shopping behavior analytics
  const shoppingBehavior = {
    decisionSpeed: 'Considered', // Fast, Moderate, Considered
    averageConsiderationTime: '5.2 days',
    conversionRate: 68,
    preferredShoppingTime: 'Evening (8-10 PM)',
    peakActivity: 'Weekends'
  };

  // Upcoming opportunities
  const opportunities = [
    {
      id: '1',
      type: 'event',
      icon: Calendar,
      title: 'Gallery Opening Next Week',
      description: 'Wardrobe gap detected: Contemporary art event attire',
      priority: 'high',
      actionLabel: 'View Suggestions'
    },
    {
      id: '2',
      type: 'trend',
      icon: TrendingUp,
      title: 'Emerging Trend Match',
      description: 'Deconstructed tailoring aligns with your style evolution',
      priority: 'medium',
      actionLabel: 'Explore'
    },
    {
      id: '3',
      type: 'value',
      icon: DollarSign,
      title: 'Investment Opportunity',
      description: 'Hermès Kelly appreciation rate: +12% annually',
      priority: 'medium',
      actionLabel: 'Learn More'
    }
  ];

  // Wardrobe efficiency metrics
  const efficiencyMetrics = {
    utilizationRate: 78, // % of wardrobe worn in last 90 days
    costPerWear: 425,
    mostWornCategory: 'Bags',
    underutilizedItems: 12,
    perfectRotation: 85 // ideal rotation score
  };

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
              <TrendingUp size={16} className="text-success" />
            </div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Wardrobe Value</p>
            <p className="font-display text-2xl text-charcoal-deep">€{totalWardrobeValue.toLocaleString()}</p>
            <p className="text-xs text-success mt-1">+18% from last {timeframe}</p>
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
            <p className="text-xs text-stone mt-1">Excellent rotation</p>
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
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-4 bg-parchment">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Decision Style</p>
                  <p className="font-display text-lg text-charcoal-deep">{shoppingBehavior.decisionSpeed}</p>
                  <p className="text-xs text-stone mt-1">Avg. {shoppingBehavior.averageConsiderationTime} per item</p>
                </div>

                <div className="p-4 bg-parchment">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Conversion Rate</p>
                  <p className="font-display text-lg text-charcoal-deep">{shoppingBehavior.conversionRate}%</p>
                  <p className="text-xs text-stone mt-1">Wishlist to purchase</p>
                </div>

                <div className="p-4 bg-parchment">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Peak Activity</p>
                  <p className="font-display text-lg text-charcoal-deep">{shoppingBehavior.peakActivity}</p>
                  <p className="text-xs text-stone mt-1">{shoppingBehavior.preferredShoppingTime}</p>
                </div>

                <div className="p-4 bg-parchment">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Cost Per Wear</p>
                  <p className="font-display text-lg text-charcoal-deep">€{efficiencyMetrics.costPerWear}</p>
                  <p className="text-xs text-stone mt-1">Above luxury average</p>
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
                    <button className="w-full py-2 text-xs tracking-[0.1em] uppercase text-charcoal-deep border border-sand hover:border-charcoal-deep transition-colors">
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

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Globe,
  Users,
  MapPin
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function BrandAnalyticsPage() {
  const router = useRouter();
  const { isBrand, brandPartner, brandAnalytics } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isBrand) {
      router.push('/auth/login/brand');
    }
  }, [isBrand, router]);

  if (!isBrand || !brandPartner || !brandAnalytics) {
    return (
      <div className="min-h-screen bg-charcoal-deep flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ivory-cream border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getTrendIcon = (trend: 'rising' | 'stable' | 'declining') => {
    switch (trend) {
      case 'rising':
        return <TrendingUp size={14} className="text-green-400" />;
      case 'declining':
        return <TrendingDown size={14} className="text-red-400" />;
      default:
        return <Minus size={14} className="text-sand" />;
    }
  };

  const getTrendColor = (trend: 'rising' | 'stable' | 'declining') => {
    switch (trend) {
      case 'rising':
        return 'text-green-400';
      case 'declining':
        return 'text-red-400';
      default:
        return 'text-sand';
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-deep">
      {/* Header */}
      <header className="border-b border-sand/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/brand"
              className="w-10 h-10 bg-noir border border-sand/10 flex items-center justify-center hover:border-sand/30 transition-colors"
            >
              <ArrowLeft size={18} className="text-ivory-cream" />
            </Link>
            <div>
              <h1 className="font-display text-2xl text-ivory-cream">Intelligence Dashboard</h1>
              <p className="text-sm text-taupe">Demand signals & regional insights</p>
            </div>
          </div>
        </div>
      </header>

      <main className={`max-w-7xl mx-auto px-6 lg:px-12 py-12 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Demand Signals */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl text-ivory-cream mb-1">Demand Signals</h2>
              <p className="text-sm text-taupe">Real-time product demand intelligence</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brandAnalytics.demandSignals.map((signal) => (
              <div
                key={signal.productId}
                className="bg-noir border border-sand/10 p-6 hover:border-sand/30 transition-colors"
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={signal.productImage}
                    alt={signal.productName}
                    className="w-16 h-16 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-ivory-cream font-medium truncate">{signal.productName}</h3>
                    <p className="text-xs text-taupe capitalize">{signal.category}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-1">Demand Score</span>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-2xl text-ivory-cream">{signal.demandScore}</span>
                      <span className="text-xs text-taupe">/100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      {getTrendIcon(signal.trend)}
                      <span className={`text-sm capitalize ${getTrendColor(signal.trend)}`}>
                        {signal.trend}
                      </span>
                    </div>
                    <span className={`text-xs ${getTrendColor(signal.trend)}`}>
                      {signal.trendChange > 0 ? '+' : ''}{signal.trendChange}%
                    </span>
                  </div>
                </div>

                {/* Demand bar */}
                <div className="h-2 bg-charcoal-deep rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full transition-all duration-500 ${
                      signal.demandScore >= 90 ? 'bg-green-400' :
                      signal.demandScore >= 70 ? 'bg-gold-soft' :
                      signal.demandScore >= 50 ? 'bg-sand' : 'bg-red-400'
                    }`}
                    style={{ width: `${signal.demandScore}%` }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-taupe" />
                  <span className="text-xs text-taupe truncate">
                    {signal.topRegions.slice(0, 3).join(', ')}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-sand/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-taupe">Forecasted demand</span>
                    <span className="text-ivory-cream">{signal.forecastedDemand} units</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-taupe">Confidence</span>
                    <span className="text-ivory-cream">{signal.confidenceLevel}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Regional Insights */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl text-ivory-cream mb-1">Regional Insights</h2>
              <p className="text-sm text-taupe">Market potential by region</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {brandAnalytics.regionalInsights.map((insight) => (
              <div
                key={insight.region}
                className="bg-noir border border-sand/10 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-ivory-cream/5 border border-ivory-cream/10 flex items-center justify-center">
                      <Globe size={18} className="text-ivory-cream" />
                    </div>
                    <div>
                      <h3 className="text-ivory-cream font-medium">{insight.region}</h3>
                      <p className="text-xs text-taupe">{insight.countries.join(', ')}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-[10px] tracking-[0.1em] uppercase ${
                    insight.marketPotential === 'high' ? 'bg-green-400/10 text-green-400' :
                    insight.marketPotential === 'medium' ? 'bg-gold-soft/10 text-gold-soft' :
                    'bg-sand/10 text-sand'
                  }`}>
                    {insight.marketPotential} potential
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-1">Demand Index</span>
                    <span className="font-display text-xl text-ivory-cream">{insight.demandIndex}</span>
                  </div>
                  <div>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-1">Top Categories</span>
                    <div className="flex flex-wrap gap-1">
                      {insight.topCategories.slice(0, 2).map(cat => (
                        <span key={cat} className="text-xs text-sand capitalize">{cat}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-sand/10">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-taupe">Seasonal Trend</span>
                    <span className="text-ivory-cream">{insight.seasonalTrend}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-taupe">Recommended Launch</span>
                    <span className="text-gold-soft">{insight.recommendedLaunchTiming}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* VIP Demand Forecast */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl text-ivory-cream mb-1">VIP Demand Forecast</h2>
              <p className="text-sm text-taupe">High-value customer segment insights</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {brandAnalytics.vipDemandForecast.map((forecast) => (
              <div
                key={forecast.segment}
                className="bg-noir border border-gold-soft/20 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gold-soft/10 flex items-center justify-center">
                    <Users size={18} className="text-gold-soft" />
                  </div>
                  <div>
                    <h3 className="text-ivory-cream font-medium">{forecast.segment}</h3>
                    <p className="text-xs text-gold-soft">Premium Segment</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-1">Predicted Demand</span>
                    <span className="font-display text-xl text-ivory-cream">{forecast.predictedDemand}</span>
                  </div>
                  <div>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-1">Avg Spend</span>
                    <span className="font-display text-xl text-ivory-cream">€{(forecast.averageSpend / 1000).toFixed(1)}k</span>
                  </div>
                  <div>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-1">Growth</span>
                    <span className="font-display text-xl text-green-400">+{forecast.growthPotential}%</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-sand/10">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">Top Products</span>
                  <div className="flex flex-wrap gap-2">
                    {forecast.topProducts.map(product => (
                      <span key={product} className="px-2 py-1 bg-charcoal-deep text-xs text-sand">
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

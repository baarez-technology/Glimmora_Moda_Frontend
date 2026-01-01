'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Package
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function BrandBoutiquesPage() {
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

  const getTrendIcon = (trend: 'up' | 'stable' | 'down') => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-green-400" />;
      case 'down':
        return <TrendingDown size={16} className="text-red-400" />;
      default:
        return <Minus size={16} className="text-sand" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'stable' | 'down') => {
    switch (trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-sand';
    }
  };

  // Sort boutiques by performance score
  const sortedBoutiques = [...brandAnalytics.boutiquePerformance].sort(
    (a, b) => b.performanceScore - a.performanceScore
  );

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
              <h1 className="font-display text-2xl text-ivory-cream">Boutique Intelligence</h1>
              <p className="text-sm text-taupe">Performance heatmap</p>
            </div>
          </div>
        </div>
      </header>

      <main className={`max-w-7xl mx-auto px-6 lg:px-12 py-12 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="bg-noir border border-sand/10 p-5">
            <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">Total Boutiques</span>
            <span className="font-display text-2xl text-ivory-cream">{sortedBoutiques.length}</span>
          </div>
          <div className="bg-noir border border-sand/10 p-5">
            <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">Total Revenue</span>
            <span className="font-display text-2xl text-ivory-cream">
              €{(sortedBoutiques.reduce((sum, b) => sum + b.monthlyRevenue, 0) / 1000000).toFixed(1)}M
            </span>
          </div>
          <div className="bg-noir border border-sand/10 p-5">
            <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">Avg Performance</span>
            <span className="font-display text-2xl text-ivory-cream">
              {Math.round(sortedBoutiques.reduce((sum, b) => sum + b.performanceScore, 0) / sortedBoutiques.length)}
            </span>
          </div>
          <div className="bg-noir border border-sand/10 p-5">
            <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">Total Sales</span>
            <span className="font-display text-2xl text-ivory-cream">
              {sortedBoutiques.reduce((sum, b) => sum + b.salesVolume, 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Boutiques Grid */}
        <div className="space-y-4">
          {sortedBoutiques.map((boutique, index) => (
            <div
              key={boutique.boutiqueId}
              className="bg-noir border border-sand/10 p-6 hover:border-sand/30 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Rank & Location */}
                <div className="flex items-center gap-4 lg:w-1/4">
                  <div className={`w-12 h-12 flex items-center justify-center font-display text-xl ${
                    index === 0 ? 'bg-gold-soft/20 text-gold-soft' :
                    index === 1 ? 'bg-ivory-cream/10 text-ivory-cream' :
                    index === 2 ? 'bg-sand/10 text-sand' :
                    'bg-charcoal-deep text-taupe'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="text-ivory-cream font-medium">{boutique.boutiqueName}</h3>
                    <div className="flex items-center gap-1 text-sm text-taupe">
                      <MapPin size={12} />
                      <span>{boutique.city}, {boutique.country}</span>
                    </div>
                  </div>
                </div>

                {/* Performance Score */}
                <div className="lg:w-1/6">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">Performance</span>
                  <div className="flex items-center gap-3">
                    <span className={`font-display text-2xl ${
                      boutique.performanceScore >= 90 ? 'text-green-400' :
                      boutique.performanceScore >= 80 ? 'text-ivory-cream' :
                      boutique.performanceScore >= 70 ? 'text-gold-soft' :
                      'text-red-400'
                    }`}>
                      {boutique.performanceScore}
                    </span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(boutique.trend)}
                      <span className={`text-xs capitalize ${getTrendColor(boutique.trend)}`}>
                        {boutique.trend}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 lg:flex-1">
                  <div>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-1">Revenue</span>
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} className="text-sand" />
                      <span className="text-ivory-cream">€{(boutique.monthlyRevenue / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-1">Sales</span>
                    <div className="flex items-center gap-1">
                      <Package size={14} className="text-sand" />
                      <span className="text-ivory-cream">{boutique.salesVolume}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-1">Avg Order</span>
                    <span className="text-ivory-cream">€{boutique.averageOrderValue.toLocaleString()}</span>
                  </div>
                </div>

                {/* Top Products */}
                <div className="lg:w-1/4">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">Top Products</span>
                  <div className="flex flex-wrap gap-1">
                    {boutique.topProducts.slice(0, 3).map((product) => (
                      <span key={product} className="px-2 py-0.5 bg-charcoal-deep text-xs text-sand truncate max-w-[120px]">
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance Bar */}
              <div className="mt-4 pt-4 border-t border-sand/10">
                <div className="h-2 bg-charcoal-deep rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      boutique.performanceScore >= 90 ? 'bg-green-400' :
                      boutique.performanceScore >= 80 ? 'bg-ivory-cream' :
                      boutique.performanceScore >= 70 ? 'bg-gold-soft' :
                      'bg-red-400'
                    }`}
                    style={{ width: `${boutique.performanceScore}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

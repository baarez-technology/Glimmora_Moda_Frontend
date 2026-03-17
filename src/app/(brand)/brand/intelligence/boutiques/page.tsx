'use client';

import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { brandIntelligenceService } from '@/services';
import type { BoutiquePerformance } from '@/types/brand-intelligence';
import IntelligencePageWrapper from '@/components/brand/IntelligencePageWrapper';

export default function BoutiquesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [boutiques, setBoutiques] = useState<BoutiquePerformance[]>([]);

  useEffect(() => {
    brandIntelligenceService.getBoutiquePerformances().then(res => {
      if (res.data) setBoutiques(Array.isArray(res.data) ? res.data : []);
      setIsLoading(false);
    });
  }, []);

  const totalBoutiques = boutiques.length;
  const averageRank = totalBoutiques > 0
    ? (boutiques.reduce((sum, b) => sum + b.rank, 0) / totalBoutiques).toFixed(1)
    : '0';
  const topPerformer = boutiques.length > 0
    ? boutiques.reduce((top, b) => b.rank < top.rank ? b : top, boutiques[0])
    : null;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `\u20AC${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `\u20AC${(value / 1000).toFixed(0)}K`;
    return `\u20AC${value.toLocaleString()}`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  const scoreLabels: { key: keyof BoutiquePerformance['scores']; label: string }[] = [
    { key: 'experience', label: 'Experience' },
    { key: 'conversion', label: 'Conversion' },
    { key: 'service', label: 'Service' },
    { key: 'ambiance', label: 'Ambiance' },
  ];

  return (
    <IntelligencePageWrapper
      title="Boutique Performance Index"
      subtitle="Track and compare performance across all boutique locations"
      acronym="BPI™"
      phase={1}
      status="mock"
      backendNote="Requires POS integration and footfall counter APIs. Endpoint: GET /api/intelligence/boutiques"
      isLoading={isLoading}
    >
      {boutiques.length === 0 ? (
        <div className="p-8 text-center">
          <MapPin size={48} className="mx-auto text-taupe/40 mb-4" />
          <p className="text-stone">No boutique performance data found</p>
          <p className="text-xs text-taupe mt-1">Boutique data will appear here once available</p>
        </div>
      ) : (
        <div className="p-8 space-y-8">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Total Boutiques</p>
              <p className="font-display text-2xl text-charcoal-deep">{totalBoutiques}</p>
            </div>
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Average Rank</p>
              <p className="font-display text-2xl text-charcoal-deep">{averageRank}</p>
            </div>
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Top Performer</p>
              <p className="font-display text-2xl text-charcoal-deep">{topPerformer?.name ?? '-'}</p>
            </div>
          </div>

          {/* Boutique Cards */}
          <div className="space-y-4">
            {boutiques.map(boutique => (
              <div key={boutique.boutiqueId} className="bg-white border border-sand/50 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-lg text-charcoal-deep">{boutique.name}</h3>
                      <span className="px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase bg-parchment text-stone">
                        Rank #{boutique.rank}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-stone">
                      <MapPin size={14} />
                      {boutique.city}, {boutique.region}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-stone">Last Audit</p>
                    <p className="text-sm text-charcoal-deep">
                      {new Date(boutique.lastAudit).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Score Bars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {scoreLabels.map(({ key, label }) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-stone">{label}</span>
                        <span className="text-xs font-medium text-charcoal-deep">
                          {boutique.scores[key]}%
                        </span>
                      </div>
                      <div className="h-2 bg-parchment overflow-hidden">
                        <div
                          className="h-full bg-charcoal-deep transition-all"
                          style={{ width: `${boutique.scores[key]}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Revenue & Footfall */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-sand/30">
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Revenue</p>
                    <p className="text-sm font-medium text-charcoal-deep">{formatCurrency(boutique.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Footfall</p>
                    <p className="text-sm font-medium text-charcoal-deep">{formatNumber(boutique.footfall)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </IntelligencePageWrapper>
  );
}

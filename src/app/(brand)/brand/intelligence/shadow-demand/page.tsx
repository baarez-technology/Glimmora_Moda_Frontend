'use client';

import { useState } from 'react';
import { TrendingUp, Target, Sparkles } from 'lucide-react';
import IntelligencePageWrapper from '@/components/brand/IntelligencePageWrapper';
import { formatPrice } from '@/lib/currency';

interface ShadowDemandForecast {
  id: string;
  productName: string;
  demandScore: number;
  targetSegment: string;
  estimatedUnits: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  recommendedAction: string;
  forecastPeriod: string;
  predictedRevenue: number;
  currency: string;
}

const mockForecasts: ShadowDemandForecast[] = [
  {
    id: 'sd-001',
    productName: 'Midnight Couture Collection',
    demandScore: 92,
    targetSegment: 'The Connoisseur',
    estimatedUnits: 45,
    confidenceLevel: 'high',
    recommendedAction: 'Create exclusive private drop with personalized invitations',
    forecastPeriod: 'Q2 2026',
    predictedRevenue: 540000,
    currency: 'EUR',
  },
  {
    id: 'sd-002',
    productName: 'Artisan Heritage Timepiece',
    demandScore: 87,
    targetSegment: 'The Collector',
    estimatedUnits: 20,
    confidenceLevel: 'high',
    recommendedAction: 'Increase production and offer numbered editions',
    forecastPeriod: 'Q2 2026',
    predictedRevenue: 360000,
    currency: 'EUR',
  },
  {
    id: 'sd-003',
    productName: 'Bespoke Travel Ensemble',
    demandScore: 74,
    targetSegment: 'The Globetrotter',
    estimatedUnits: 32,
    confidenceLevel: 'medium',
    recommendedAction: 'Launch pre-order campaign with concierge outreach',
    forecastPeriod: 'Q3 2026',
    predictedRevenue: 288000,
    currency: 'EUR',
  },
  {
    id: 'sd-004',
    productName: 'Limited Silk Loungewear Set',
    demandScore: 68,
    targetSegment: 'The Aesthete',
    estimatedUnits: 60,
    confidenceLevel: 'medium',
    recommendedAction: 'Test with VIP preview before broader release',
    forecastPeriod: 'Q2 2026',
    predictedRevenue: 180000,
    currency: 'EUR',
  },
  {
    id: 'sd-005',
    productName: 'Avant-Garde Evening Cape',
    demandScore: 55,
    targetSegment: 'The Trendsetter',
    estimatedUnits: 15,
    confidenceLevel: 'low',
    recommendedAction: 'Monitor social signals before committing to production',
    forecastPeriod: 'Q3 2026',
    predictedRevenue: 112500,
    currency: 'EUR',
  },
  {
    id: 'sd-006',
    productName: 'Signature Gemstone Accessories',
    demandScore: 81,
    targetSegment: 'The Philanthropist',
    estimatedUnits: 25,
    confidenceLevel: 'high',
    recommendedAction: 'Create exclusive drop with charity tie-in',
    forecastPeriod: 'Q2 2026',
    predictedRevenue: 200000,
    currency: 'EUR',
  },
];

const getConfidenceBadge = (level: ShadowDemandForecast['confidenceLevel']) => {
  switch (level) {
    case 'high':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'low':
      return 'bg-orange-100 text-orange-700 border-orange-200';
  }
};

const getDemandColor = (score: number) => {
  if (score >= 80) return 'bg-success';
  if (score >= 60) return 'bg-charcoal-deep';
  return 'bg-stone';
};

export default function ShadowDemandPage() {
  const [forecasts] = useState<ShadowDemandForecast[]>(mockForecasts);

  const activeForecasts = forecasts.length;
  const avgDemandScore = Math.round(
    forecasts.reduce((sum, f) => sum + f.demandScore, 0) / forecasts.length
  );
  const uhniSegments = new Set(forecasts.map(f => f.targetSegment)).size;
  const totalPredictedRevenue = forecasts.reduce((sum, f) => sum + f.predictedRevenue, 0);

  return (
    <IntelligencePageWrapper
      title="VIP Shadow Demand Forecasting"
      subtitle="Predict future demand for couture, limited editions, and private drops from anonymized UHNI archetypes"
      acronym="VSDF™"
    >
      <div className="p-8 space-y-8">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Active Forecasts</p>
            <p className="font-display text-2xl text-charcoal-deep">{activeForecasts}</p>
          </div>
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Avg Demand Score</p>
            <p className="font-display text-2xl text-charcoal-deep">{avgDemandScore}/100</p>
          </div>
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">UHNI Segments Tracked</p>
            <p className="font-display text-2xl text-charcoal-deep">{uhniSegments}</p>
          </div>
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Predicted Revenue</p>
            <p className="font-display text-2xl text-charcoal-deep">{formatPrice(totalPredictedRevenue, undefined, true)}</p>
          </div>
        </div>

        {/* Forecast Cards */}
        {forecasts.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp size={48} className="mx-auto text-taupe/40 mb-4" />
            <p className="text-stone">No active demand forecasts</p>
            <p className="text-xs text-taupe mt-1">Forecasts will appear here when UHNI demand signals are detected</p>
          </div>
        ) : (
          <div className="space-y-4">
            {forecasts.map(forecast => (
              <div key={forecast.id} className="bg-white border border-sand/50 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles size={18} className="text-gold-soft" />
                      <h3 className="font-display text-lg text-charcoal-deep">{forecast.productName}</h3>
                      <span className={`px-3 py-0.5 text-[10px] tracking-[0.15em] uppercase border ${getConfidenceBadge(forecast.confidenceLevel)}`}>
                        {forecast.confidenceLevel} confidence
                      </span>
                    </div>
                    <p className="text-xs text-stone">
                      Forecast Period: {forecast.forecastPeriod}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl text-charcoal-deep">{forecast.demandScore}</p>
                    <p className="text-[10px] tracking-[0.1em] uppercase text-stone">Demand Score</p>
                  </div>
                </div>

                {/* Demand Score Progress Bar */}
                <div className="mb-4">
                  <div className="h-2 bg-parchment overflow-hidden">
                    <div
                      className={`h-full transition-all ${getDemandColor(forecast.demandScore)}`}
                      style={{ width: `${forecast.demandScore}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Target UHNI Segment</p>
                    <div className="flex items-center gap-1">
                      <Target size={14} className="text-stone" />
                      <p className="text-sm text-charcoal-deep">{forecast.targetSegment}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Estimated Units</p>
                    <p className="text-sm text-charcoal-deep">{forecast.estimatedUnits}</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Predicted Revenue</p>
                    <p className="text-sm text-charcoal-deep">{formatPrice(forecast.predictedRevenue, forecast.currency)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Confidence</p>
                    <p className="text-sm text-charcoal-deep capitalize">{forecast.confidenceLevel}</p>
                  </div>
                </div>

                {/* Recommended Action */}
                <div className="pt-4 border-t border-sand/30">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Recommended Action</p>
                  <p className="text-sm text-charcoal-deep">{forecast.recommendedAction}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </IntelligencePageWrapper>
  );
}

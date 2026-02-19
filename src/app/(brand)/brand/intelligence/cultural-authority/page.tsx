'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { brandIntelligenceService } from '@/services';
import type { CulturalAuthority } from '@/types/brand-intelligence';

export default function CulturalAuthorityPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dimensions, setDimensions] = useState<CulturalAuthority[]>([]);

  useEffect(() => {
    brandIntelligenceService.getCulturalAuthority().then(res => {
      if (res.data) setDimensions(res.data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-stone">Loading cultural authority data...</p>
      </div>
    );
  }

  if (dimensions.length === 0) {
    return (
      <div className="p-8 text-center">
        <TrendingUp size={48} className="mx-auto text-taupe/40 mb-4" />
        <p className="text-stone">No cultural authority data found</p>
        <p className="text-xs text-taupe mt-1">Cultural dimensions will appear here once assessed</p>
      </div>
    );
  }

  const averageScore = dimensions.length > 0
    ? (dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length).toFixed(1)
    : '0';
  const dimensionsAssessed = dimensions.length;
  const improvingCount = dimensions.filter(d => d.trend === 'improving').length;

  const getTrendBadge = (trend: CulturalAuthority['trend']) => {
    switch (trend) {
      case 'improving':
        return { className: 'bg-green-100 text-green-700', icon: TrendingUp, label: 'Improving' };
      case 'stable':
        return { className: 'bg-amber-100 text-amber-700', icon: Minus, label: 'Stable' };
      case 'declining':
        return { className: 'bg-red-100 text-red-700', icon: TrendingDown, label: 'Declining' };
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 p-8 pb-0">
        <div className="flex items-center gap-2 text-sm text-stone mb-4">
          <Link href="/brand" className="hover:text-charcoal-deep transition-colors">Dashboard</Link>
          <ChevronRight size={14} />
          <span className="text-stone">Intelligence</span>
          <ChevronRight size={14} />
          <span className="text-charcoal-deep">Cultural Authority</span>
        </div>
        <h1 className="font-display text-3xl text-charcoal-deep">Cultural Brand Capital Engine</h1>
        <p className="text-stone mt-2">Measure and track cultural authority across key brand dimensions</p>
      </div>

      <div className="p-8 pt-0 space-y-8">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Average Score</p>
            <p className="font-display text-2xl text-charcoal-deep">{averageScore}</p>
          </div>
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Dimensions Assessed</p>
            <p className="font-display text-2xl text-charcoal-deep">{dimensionsAssessed}</p>
          </div>
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Improving</p>
            <p className="font-display text-2xl text-charcoal-deep">{improvingCount}</p>
          </div>
        </div>

        {/* Dimension Cards */}
        <div className="space-y-4">
          {dimensions.map(dimension => {
            const trend = getTrendBadge(dimension.trend);
            const TrendIcon = trend.icon;
            const scorePercent = dimension.maxScore > 0
              ? (dimension.score / dimension.maxScore) * 100
              : 0;

            return (
              <div key={dimension.id} className="bg-white border border-sand/50 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display text-lg text-charcoal-deep">{dimension.dimension}</h3>
                    <p className="text-xs text-stone mt-1">
                      Last assessed: {new Date(dimension.lastAssessed).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${trend.className}`}>
                    <TrendIcon size={12} />
                    {trend.label}
                  </span>
                </div>

                {/* Score Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-stone">Score</span>
                    <span className="text-sm font-medium text-charcoal-deep">
                      {dimension.score} / {dimension.maxScore}
                    </span>
                  </div>
                  <div className="h-2 bg-parchment overflow-hidden">
                    <div
                      className="h-full bg-charcoal-deep transition-all"
                      style={{ width: `${scorePercent}%` }}
                    />
                  </div>
                </div>

                {/* Risks & Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dimension.risks.length > 0 && (
                    <div>
                      <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-2">Risks</p>
                      <div className="flex flex-wrap gap-2">
                        {dimension.risks.map((risk, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 text-xs bg-red-50 text-red-700 border border-red-200"
                          >
                            {risk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {dimension.recommendations.length > 0 && (
                    <div>
                      <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-2">Recommendations</p>
                      <div className="flex flex-wrap gap-2">
                        {dimension.recommendations.map((rec, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 text-xs bg-green-50 text-green-700 border border-green-200"
                          >
                            {rec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

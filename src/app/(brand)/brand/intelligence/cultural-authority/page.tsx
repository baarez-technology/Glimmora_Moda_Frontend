'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { brandIntelligenceService } from '@/services';
import type { CulturalAuthority } from '@/types/brand-intelligence';
import IntelligencePageWrapper from '@/components/brand/IntelligencePageWrapper';

export default function CulturalAuthorityPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dimensions, setDimensions] = useState<CulturalAuthority[]>([]);

  useEffect(() => {
    brandIntelligenceService.getCulturalAuthority().then(res => {
      if (res.data) setDimensions(Array.isArray(res.data) ? res.data : []);
      setIsLoading(false);
    });
  }, []);

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
    <IntelligencePageWrapper
      title="Cultural Brand Capital Engine"
      subtitle="Measure and track cultural authority across key brand dimensions"
      acronym="CBCE™"
      phase={3}
      status="live"
      backendNote="Requires NLP sentiment pipeline on social/press mentions. Endpoint: GET /api/intelligence/cultural-authority"
      isLoading={isLoading}
    >
      {dimensions.length === 0 ? (
        <div className="p-8 text-center">
          <TrendingUp size={48} className="mx-auto text-taupe/40 mb-4" />
          <p className="text-stone">No cultural authority data found</p>
          <p className="text-xs text-taupe mt-1">Cultural dimensions will appear here once assessed</p>
        </div>
      ) : (
        <div className="p-8 space-y-8">
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

          {/* Radar Chart Visualization */}
          <div className="bg-white border border-sand/50 p-6">
            <h2 className="font-medium text-charcoal-deep mb-6">Cultural Authority Overview</h2>
            <div className="flex items-center justify-center">
              <div className="relative w-64 h-64">
                {/* Background circles */}
                {[100, 75, 50, 25].map(r => (
                  <div
                    key={r}
                    className="absolute border border-sand/30 rounded-full"
                    style={{
                      width: `${r * 2.4}px`, height: `${r * 2.4}px`,
                      top: `${128 - r * 1.2}px`, left: `${128 - r * 1.2}px`,
                    }}
                  />
                ))}
                {/* Dimension points with labels */}
                {dimensions.map((d, i) => {
                  const angle = (i / dimensions.length) * Math.PI * 2 - Math.PI / 2;
                  const scorePercent = d.maxScore > 0 ? d.score / d.maxScore : 0;
                  const radius = scorePercent * 120;
                  const x = 128 + Math.cos(angle) * radius;
                  const y = 128 + Math.sin(angle) * radius;
                  const labelX = 128 + Math.cos(angle) * 140;
                  const labelY = 128 + Math.sin(angle) * 140;
                  return (
                    <div key={d.id}>
                      <div
                        className="absolute w-3 h-3 bg-charcoal-deep rounded-full -translate-x-1.5 -translate-y-1.5"
                        style={{ left: `${x}px`, top: `${y}px` }}
                      />
                      <div
                        className="absolute text-[9px] tracking-[0.05em] uppercase text-stone -translate-x-1/2 -translate-y-1/2 text-center w-20"
                        style={{ left: `${labelX}px`, top: `${labelY}px` }}
                      >
                        {d.dimension.split(' ').slice(0, 2).join(' ')}
                      </div>
                    </div>
                  );
                })}
                {/* SVG connecting lines */}
                <svg className="absolute inset-0" viewBox="0 0 256 256">
                  <polygon
                    points={dimensions.map((d, i) => {
                      const angle = (i / dimensions.length) * Math.PI * 2 - Math.PI / 2;
                      const scorePercent = d.maxScore > 0 ? d.score / d.maxScore : 0;
                      const radius = scorePercent * 120;
                      return `${128 + Math.cos(angle) * radius},${128 + Math.sin(angle) * radius}`;
                    }).join(' ')}
                    fill="rgba(26, 26, 26, 0.08)"
                    stroke="#1A1A1A"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
              {dimensions.map(d => (
                <div key={d.id} className="text-center">
                  <p className="font-display text-lg text-charcoal-deep">{d.score}</p>
                  <p className="text-[9px] tracking-[0.1em] uppercase text-taupe">{d.dimension}</p>
                </div>
              ))}
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
      )}
    </IntelligencePageWrapper>
  );
}

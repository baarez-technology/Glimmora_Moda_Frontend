'use client';

import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { brandIntelligenceService } from '@/services';
import type { MemoryImprint } from '@/types/brand-intelligence';
import IntelligencePageWrapper from '@/components/brand/IntelligencePageWrapper';

export default function MemoryImprintPage() {
  const [imprints, setImprints] = useState<MemoryImprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    brandIntelligenceService.getMemoryImprints().then(res => {
      if (res.data) setImprints(res.data);
      setIsLoading(false);
    });
  }, []);

  const avgRecall = imprints.length
    ? Math.round(imprints.reduce((sum, i) => sum + i.recallScore, 0) / imprints.length)
    : 0;
  const avgEmotional = imprints.length
    ? Math.round(imprints.reduce((sum, i) => sum + i.emotionalResonance, 0) / imprints.length)
    : 0;
  const avgReturn = imprints.length
    ? Math.round(imprints.reduce((sum, i) => sum + i.returnProbability, 0) / imprints.length)
    : 0;

  const touchpointLabel = (touchpoint: string) => {
    return touchpoint
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const touchpointColor = (touchpoint: string) => {
    switch (touchpoint) {
      case 'store_visit':
        return 'bg-purple-500/10 text-purple-600';
      case 'online_browse':
        return 'bg-blue-500/10 text-blue-600';
      case 'purchase':
        return 'bg-green-500/10 text-green-600';
      case 'event':
        return 'bg-amber-500/10 text-amber-600';
      case 'social_media':
        return 'bg-pink-500/10 text-pink-600';
      case 'customer_service':
        return 'bg-red-500/10 text-red-600';
      default:
        return 'bg-taupe/10 text-stone';
    }
  };

  return (
    <IntelligencePageWrapper
      title="Brand Memory Imprint"
      subtitle="Measure how deeply your brand touchpoints resonate in customer memory"
      acronym="BMI™"
      phase={3}
      status="mock"
      backendNote="Requires post-experience survey integration. Endpoint: GET /api/intelligence/memory-imprints"
      isLoading={isLoading}
    >
      {imprints.length === 0 ? (
        <div className="p-8 text-center">
          <Package size={48} className="mx-auto text-taupe/40 mb-4" />
          <p className="text-stone">No memory imprints found</p>
          <p className="text-xs text-taupe mt-1">Touchpoint memory data will appear here once collected</p>
        </div>
      ) : (
        <div className="p-8 space-y-8">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Avg Recall Score</p>
              <p className="font-display text-2xl text-charcoal-deep">{avgRecall}%</p>
            </div>
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Avg Emotional Resonance</p>
              <p className="font-display text-2xl text-charcoal-deep">{avgEmotional}%</p>
            </div>
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Avg Return Probability</p>
              <p className="font-display text-2xl text-charcoal-deep">{avgReturn}%</p>
            </div>
          </div>

          {/* Touchpoint Cards */}
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50">
              <h2 className="font-medium text-charcoal-deep">Touchpoint Memory Analysis</h2>
            </div>
            <div className="divide-y divide-sand/30">
              {imprints.map(imprint => (
                <div key={imprint.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-charcoal-deep">{imprint.label}</h3>
                        <span className={`px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${touchpointColor(imprint.touchpoint)}`}>
                          {touchpointLabel(imprint.touchpoint)}
                        </span>
                      </div>
                      <p className="text-xs text-taupe">Sample size: {imprint.sampleSize.toLocaleString()} &middot; Period: {imprint.period}</p>
                    </div>
                  </div>
                  {/* Score Bars */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] tracking-[0.1em] uppercase text-stone">Recall Score</span>
                        <span className="text-xs text-charcoal-deep">{imprint.recallScore}%</span>
                      </div>
                      <div className="h-2 bg-parchment overflow-hidden">
                        <div
                          className="h-full bg-charcoal-deep transition-all"
                          style={{ width: `${imprint.recallScore}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] tracking-[0.1em] uppercase text-stone">Emotional Resonance</span>
                        <span className="text-xs text-charcoal-deep">{imprint.emotionalResonance}%</span>
                      </div>
                      <div className="h-2 bg-parchment overflow-hidden">
                        <div
                          className="h-full bg-gold-muted transition-all"
                          style={{ width: `${imprint.emotionalResonance}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] tracking-[0.1em] uppercase text-stone">Return Probability</span>
                        <span className="text-xs text-charcoal-deep">{imprint.returnProbability}%</span>
                      </div>
                      <div className="h-2 bg-parchment overflow-hidden">
                        <div
                          className="h-full bg-success transition-all"
                          style={{ width: `${imprint.returnProbability}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </IntelligencePageWrapper>
  );
}

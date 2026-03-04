'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { brandIntelligenceService } from '@/services';
import type { BrandIntelligenceSignal, SignalType } from '@/types/brand-intelligence';
import IntelligencePageWrapper from '@/components/brand/IntelligencePageWrapper';

export default function IntelligenceAgentPage() {
  const [signals, setSignals] = useState<BrandIntelligenceSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    brandIntelligenceService.getIntelligenceSignals().then(res => {
      if (res.data) setSignals(res.data);
      setIsLoading(false);
    });
  }, []);

  const totalSignals = signals.length;
  const highConfidenceCount = signals.filter(s => s.confidence >= 80).length;
  const trendingUpCount = signals.filter(s => s.trend === 'up').length;

  const signalTypeColor = (type: SignalType) => {
    switch (type) {
      case 'demand':
        return 'bg-blue-500/10 text-blue-600';
      case 'validation':
        return 'bg-green-500/10 text-green-600';
      case 'timing':
        return 'bg-purple-500/10 text-purple-600';
      case 'competition':
        return 'bg-red-500/10 text-red-600';
      case 'sentiment':
        return 'bg-amber-500/10 text-amber-600';
      default:
        return 'bg-taupe/10 text-stone';
    }
  };

  const trendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={14} className="text-success" />;
      case 'down':
        return <TrendingDown size={14} className="text-error" />;
      default:
        return <Minus size={14} className="text-stone" />;
    }
  };

  return (
    <IntelligencePageWrapper
      title="Demand Intelligence Agent"
      subtitle="Real-time market signals and brand intelligence for data-driven decisions"
      phase={1}
      status="mock"
      backendNote="Requires user-behavior events API, browse/click/wishlist webhooks. Endpoint: GET /api/intelligence/signals"
      isLoading={isLoading}
    >
      {signals.length === 0 ? (
        <div className="p-8 text-center">
          <TrendingUp size={48} className="mx-auto text-taupe/40 mb-4" />
          <p className="text-stone">No intelligence signals found</p>
          <p className="text-xs text-taupe mt-1">Signals will appear here as they are detected</p>
        </div>
      ) : (
        <div className="p-8 space-y-8">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Total Signals</p>
              <p className="font-display text-2xl text-charcoal-deep">{totalSignals}</p>
            </div>
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">High Confidence</p>
              <p className="font-display text-2xl text-charcoal-deep">{highConfidenceCount}</p>
            </div>
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Trending Up</p>
              <p className="font-display text-2xl text-charcoal-deep">{trendingUpCount}</p>
            </div>
          </div>

          {/* Signal Feed */}
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50">
              <h2 className="font-medium text-charcoal-deep">Signal Feed</h2>
            </div>
            <div className="divide-y divide-sand/30">
              {signals.map(signal => (
                <div key={signal.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-charcoal-deep">{signal.title}</h3>
                        <span className={`px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${signalTypeColor(signal.type)}`}>
                          {signal.type}
                        </span>
                      </div>
                      <p className="text-sm text-stone">{signal.recommendation}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-taupe">{signal.region}</span>
                        <span className="text-xs text-taupe">{signal.metric}: {signal.value}</span>
                        <span className="text-xs text-taupe">{signal.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="flex items-center gap-1">
                        {trendIcon(signal.trend)}
                        <span className="text-xs text-stone capitalize">{signal.trend}</span>
                      </div>
                    </div>
                  </div>
                  {/* Confidence Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] tracking-[0.1em] uppercase text-stone">Confidence</span>
                      <span className="text-xs text-charcoal-deep">{signal.confidence}%</span>
                    </div>
                    <div className="h-2 bg-parchment overflow-hidden">
                      <div
                        className="h-full bg-charcoal-deep transition-all"
                        style={{ width: `${signal.confidence}%` }}
                      />
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

'use client';

import { useState, useEffect } from 'react';
import { brandIntelligenceService } from '@/services';
import type { BrandDigitalTwin } from '@/types/brand-intelligence';
import IntelligencePageWrapper from '@/components/brand/IntelligencePageWrapper';

export default function DigitalTwinPage() {
  const [twin, setTwin] = useState<BrandDigitalTwin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    brandIntelligenceService.getBrandDigitalTwin().then(res => {
      if (res.data) setTwin(res.data);
      setIsLoading(false);
    });
  }, []);

  const totalNodes = twin?.nodes.length ?? 0;

  const nodeTypeColor = (type: string) => {
    switch (type) {
      case 'collection':
        return 'bg-blue-500/10 text-blue-600';
      case 'heritage':
        return 'bg-amber-500/10 text-amber-600';
      case 'cultural':
        return 'bg-purple-500/10 text-purple-600';
      case 'product':
        return 'bg-green-500/10 text-green-600';
      default:
        return 'bg-taupe/10 text-stone';
    }
  };

  const metricEntries: { label: string; value: number }[] = twin ? [
    { label: 'Brand Equity', value: twin.metrics.brandEquity },
    { label: 'Cultural Relevance', value: twin.metrics.culturalRelevance },
    { label: 'Heritage Strength', value: twin.metrics.heritageStrength },
    { label: 'Innovation Index', value: twin.metrics.innovationIndex },
    { label: 'Customer Loyalty', value: twin.metrics.customerLoyalty },
  ] : [];

  return (
    <IntelligencePageWrapper
      title="Brand Digital Twin"
      subtitle="A living digital replica of your brand's identity, connections, and market position"
      phase={3}
      status="mock"
      backendNote="Requires graph database for node-relationship mapping. Endpoint: GET /api/intelligence/digital-twin"
      isLoading={isLoading}
    >
      {!twin ? (
        <div className="p-8 text-center">
          <p className="text-stone">No digital twin data found.</p>
        </div>
      ) : (
        <div className="p-8 space-y-8">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Total Nodes</p>
              <p className="font-display text-2xl text-charcoal-deep">{totalNodes}</p>
            </div>
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Brand Equity</p>
              <p className="font-display text-2xl text-charcoal-deep">{twin.metrics.brandEquity}%</p>
            </div>
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Innovation Index</p>
              <p className="font-display text-2xl text-charcoal-deep">{twin.metrics.innovationIndex}%</p>
            </div>
          </div>

          {/* Brand Metrics Dashboard */}
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50">
              <h2 className="font-medium text-charcoal-deep">Brand Metrics Dashboard</h2>
            </div>
            <div className="p-6 space-y-4">
              {metricEntries.map(entry => (
                <div key={entry.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-charcoal-deep">{entry.label}</span>
                    <span className="text-sm font-medium text-charcoal-deep">{entry.value}%</span>
                  </div>
                  <div className="h-2 bg-parchment overflow-hidden">
                    <div
                      className="h-full bg-charcoal-deep transition-all"
                      style={{ width: `${entry.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Node Visualization Grid */}
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
              <h2 className="font-medium text-charcoal-deep">Twin Node Network</h2>
              <span className="text-xs text-stone">Last updated: {twin.lastUpdated}</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {twin.nodes.map(node => (
                  <div key={node.id} className="border border-sand/50 p-4 hover:bg-parchment/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${nodeTypeColor(node.type)}`}>
                        {node.type}
                      </span>
                      <span className="text-xs text-taupe">{node.connections.length} connections</span>
                    </div>
                    <h3 className="font-medium text-charcoal-deep mb-2">{node.label}</h3>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] tracking-[0.1em] uppercase text-stone">Strength</span>
                        <span className="text-xs text-charcoal-deep">{node.strength}%</span>
                      </div>
                      <div className="h-2 bg-parchment overflow-hidden">
                        <div
                          className="h-full bg-charcoal-deep transition-all"
                          style={{ width: `${node.strength}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </IntelligencePageWrapper>
  );
}

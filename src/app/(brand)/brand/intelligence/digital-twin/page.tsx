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
    }).catch(() => {}).finally(() => setIsLoading(false));
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
      status="live"
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

          {/* Network Graph Visualization */}
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50">
              <h2 className="font-medium text-charcoal-deep">Network Graph</h2>
              <p className="text-xs text-taupe mt-1">Visual map of brand identity nodes and their connections</p>
            </div>
            <div className="p-6 flex justify-center">
              <svg viewBox="0 0 500 400" className="w-full max-w-[600px] h-auto">
                {/* Connection lines */}
                {twin.nodes.map((node, i) => {
                  const angle = (i / twin.nodes.length) * Math.PI * 2 - Math.PI / 2;
                  const cx = 250 + Math.cos(angle) * 140;
                  const cy = 200 + Math.sin(angle) * 120;
                  return node.connections.map(connId => {
                    const j = twin.nodes.findIndex(n => n.id === connId);
                    if (j <= i) return null;
                    const angle2 = (j / twin.nodes.length) * Math.PI * 2 - Math.PI / 2;
                    const cx2 = 250 + Math.cos(angle2) * 140;
                    const cy2 = 200 + Math.sin(angle2) * 120;
                    return (
                      <line key={`${node.id}-${connId}`} x1={cx} y1={cy} x2={cx2} y2={cy2} stroke="#D4C5B0" strokeWidth="1" opacity="0.5" />
                    );
                  });
                })}
                {/* Nodes */}
                {twin.nodes.map((node, i) => {
                  const angle = (i / twin.nodes.length) * Math.PI * 2 - Math.PI / 2;
                  const cx = 250 + Math.cos(angle) * 140;
                  const cy = 200 + Math.sin(angle) * 120;
                  const r = 10 + node.strength / 5;
                  const fill = node.type === 'collection' ? '#3B82F6' : node.type === 'heritage' ? '#D97706' : node.type === 'cultural' ? '#7C3AED' : '#22C55E';
                  return (
                    <g key={node.id}>
                      <circle cx={cx} cy={cy} r={r} fill={fill} opacity="0.2" />
                      <circle cx={cx} cy={cy} r={r * 0.7} fill={fill} opacity="0.8" />
                      <text x={cx} y={cy + r + 14} textAnchor="middle" fontSize="10" fill="#8B8680" className="font-sans">
                        {node.label.length > 12 ? node.label.slice(0, 12) + '…' : node.label}
                      </text>
                    </g>
                  );
                })}
                {/* Center brand label */}
                <text x="250" y="200" textAnchor="middle" fontSize="12" fill="#1A1A1A" fontWeight="600" className="font-display">
                  {twin.brandName}
                </text>
              </svg>
            </div>
            {/* Legend */}
            <div className="px-6 pb-6 flex items-center justify-center gap-6">
              {[
                { type: 'Collection', color: '#3B82F6' },
                { type: 'Heritage', color: '#D97706' },
                { type: 'Cultural', color: '#7C3AED' },
                { type: 'Product', color: '#22C55E' },
              ].map(item => (
                <div key={item.type} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] tracking-[0.1em] uppercase text-stone">{item.type}</span>
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

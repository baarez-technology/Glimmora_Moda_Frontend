'use client';

import { useState, useEffect } from 'react';
import { Users, Gem } from 'lucide-react';
import { brandIntelligenceService } from '@/services';
import type { ClientArchetype } from '@/types/brand-intelligence';
import IntelligencePageWrapper from '@/components/brand/IntelligencePageWrapper';

export default function ClientGenomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [archetypes, setArchetypes] = useState<ClientArchetype[]>([]);

  useEffect(() => {
    brandIntelligenceService.getClientArchetypes().then(res => {
      if (res.data) setArchetypes(Array.isArray(res.data) ? res.data : []);
      setIsLoading(false);
    });
  }, []);

  const totalArchetypes = archetypes.length;
  const totalClients = archetypes.reduce((sum, a) => sum + a.clientCount, 0);
  const highestLTV = archetypes.length > 0
    ? Math.max(...archetypes.map(a => a.averageLifetimeValue))
    : 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `\u20AC${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `\u20AC${(value / 1000).toFixed(0)}K`;
    return `\u20AC${value.toLocaleString()}`;
  };

  const getStrengthBar = (strength: number) => {
    const maxStrength = 100;
    const percent = Math.min((strength / maxStrength) * 100, 100);
    return percent;
  };

  return (
    <IntelligencePageWrapper
      title="Ultra-Premium Client Genome"
      subtitle="Deep behavioral analysis and segmentation of ultra-premium client archetypes"
      acronym="UPCG™"
      phase={1}
      status="mock"
      backendNote="Requires CRM integration with purchase history and loyalty data. Endpoint: GET /api/intelligence/client-archetypes"
      isLoading={isLoading}
    >
      {archetypes.length === 0 ? (
        <div className="p-8 text-center">
          <Gem size={48} className="mx-auto text-taupe/40 mb-4" />
          <p className="text-stone">No client archetypes found</p>
          <p className="text-xs text-taupe mt-1">Client genome data will appear here once analyzed</p>
        </div>
      ) : (
        <div className="p-8 space-y-8">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Total Archetypes</p>
              <p className="font-display text-2xl text-charcoal-deep">{totalArchetypes}</p>
            </div>
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Total Clients</p>
              <p className="font-display text-2xl text-charcoal-deep">{totalClients.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Highest LTV</p>
              <p className="font-display text-2xl text-charcoal-deep">{formatCurrency(highestLTV)}</p>
            </div>
          </div>

          {/* Archetype Cards */}
          <div className="space-y-6">
            {archetypes.map(archetype => (
              <div key={archetype.archetypeId} className="bg-white border border-sand/50 p-6">
                {/* Archetype Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Gem size={18} className="text-stone" />
                      <h3 className="font-display text-lg text-charcoal-deep">{archetype.label}</h3>
                    </div>
                    <p className="text-sm text-stone">{archetype.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-stone">
                    <Users size={14} />
                    {archetype.clientCount.toLocaleString()} clients
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-6 pt-4 border-t border-sand/30">
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Lifetime Value</p>
                    <p className="text-sm font-medium text-charcoal-deep">{formatCurrency(archetype.averageLifetimeValue)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Retention Rate</p>
                    <p className="text-sm font-medium text-charcoal-deep">{(archetype.retentionRate * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Client Count</p>
                    <p className="text-sm font-medium text-charcoal-deep">{archetype.clientCount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Spend Pattern */}
                {archetype.spendPattern.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-3">Spend Pattern</p>
                    <div className="space-y-3">
                      {archetype.spendPattern.map((pattern, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-charcoal-deep">{pattern.category}</span>
                            <span className="text-xs text-stone">{pattern.percentage}%</span>
                          </div>
                          <div className="h-2 bg-parchment overflow-hidden">
                            <div
                              className="h-full bg-charcoal-deep transition-all"
                              style={{ width: `${pattern.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Behavior Traits */}
                {archetype.behaviorTraits.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-3">Behavior Traits</p>
                    <div className="space-y-3">
                      {archetype.behaviorTraits.map((bt, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <span className="text-xs font-medium text-charcoal-deep">{bt.trait}</span>
                              <span className="text-xs text-stone ml-2">{bt.description}</span>
                            </div>
                            <span className="text-xs text-stone">{bt.strength}%</span>
                          </div>
                          <div className="h-1.5 bg-parchment overflow-hidden">
                            <div
                              className="h-full bg-stone/60 transition-all"
                              style={{ width: `${getStrengthBar(bt.strength)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preferences */}
                {archetype.preferences.length > 0 && (
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-2">Preferences</p>
                    <div className="flex flex-wrap gap-2">
                      {archetype.preferences.map((pref, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 text-xs bg-parchment text-charcoal-deep"
                        >
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </IntelligencePageWrapper>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { brandIntelligenceService } from '@/services';
import type { DemandSimulation } from '@/types/brand-intelligence';
import IntelligencePageWrapper from '@/components/brand/IntelligencePageWrapper';

export default function DesignDemandPage() {
  const [simulations, setSimulations] = useState<DemandSimulation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    brandIntelligenceService.getDemandSimulations().then(res => {
      if (res.data) setSimulations(res.data);
      setIsLoading(false);
    });
  }, []);

  const totalSimulations = simulations.length;
  const avgDemandScore = simulations.length
    ? Math.round(simulations.reduce((sum, s) => sum + s.demandScore, 0) / simulations.length)
    : 0;
  const highestConcept = simulations.length
    ? simulations.reduce((best, s) => (s.demandScore > best.demandScore ? s : best), simulations[0])
    : null;

  const trendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp size={14} className="text-success" />;
      case 'declining':
        return <TrendingDown size={14} className="text-error" />;
      default:
        return <Minus size={14} className="text-stone" />;
    }
  };

  return (
    <IntelligencePageWrapper
      title="Design-to-Demand Simulation"
      subtitle="Simulate market demand before production to optimize sell-before-make strategies"
      phase={2}
      status="mock"
      backendNote="Requires design asset pipeline and market-data feed. Endpoint: POST /api/intelligence/design-demand"
      isLoading={isLoading}
    >
      {simulations.length === 0 ? (
        <div className="p-8 text-center">
          <TrendingUp size={48} className="mx-auto text-taupe/40 mb-4" />
          <p className="text-stone">No demand simulations found</p>
          <p className="text-xs text-taupe mt-1">Simulations will appear here once created</p>
        </div>
      ) : (
        <div className="p-8 space-y-8">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Total Simulations</p>
              <p className="font-display text-2xl text-charcoal-deep">{totalSimulations}</p>
            </div>
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Avg Demand Score</p>
              <p className="font-display text-2xl text-charcoal-deep">{avgDemandScore}/100</p>
            </div>
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Highest Scoring Concept</p>
              <p className="font-display text-2xl text-charcoal-deep">{highestConcept?.concept ?? '\u2014'}</p>
            </div>
          </div>

          {/* Concept Cards */}
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50">
              <h2 className="font-medium text-charcoal-deep">Concept Simulations</h2>
            </div>
            <div className="divide-y divide-sand/30">
              {simulations.map(sim => (
                <div key={sim.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-charcoal-deep">{sim.concept}</h3>
                        <span className="px-2 py-1 text-[10px] tracking-[0.1em] uppercase bg-taupe/10 text-stone">
                          {sim.category}
                        </span>
                        {sim.sellBeforeMake && (
                          <span className="px-2 py-1 text-[10px] tracking-[0.1em] uppercase bg-success/10 text-success">
                            Sell-Before-Make
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-stone">{sim.description}</p>
                      <p className="text-xs text-taupe mt-1">Target: {sim.targetAudience} &middot; Est. Units: {sim.estimatedUnits.toLocaleString()} &middot; Price: &euro;{sim.pricePoint.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl text-charcoal-deep">{sim.demandScore}</p>
                      <p className="text-[10px] tracking-[0.1em] uppercase text-stone">Demand Score</p>
                    </div>
                  </div>
                  {/* Demand Score Progress Bar */}
                  <div className="mb-4">
                    <div className="h-2 bg-parchment overflow-hidden">
                      <div
                        className="h-full bg-charcoal-deep transition-all"
                        style={{ width: `${sim.demandScore}%` }}
                      />
                    </div>
                  </div>
                  {/* Regional Demand Breakdown */}
                  {sim.regionBreakdown.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-sand/30">
                            <th className="text-left px-3 py-2 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Region</th>
                            <th className="text-right px-3 py-2 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Score</th>
                            <th className="text-right px-3 py-2 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Population</th>
                            <th className="text-center px-3 py-2 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Trend</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sand/30">
                          {sim.regionBreakdown.map(region => (
                            <tr key={region.region} className="hover:bg-parchment/30 transition-colors">
                              <td className="px-3 py-2 text-sm text-charcoal-deep">{region.region}</td>
                              <td className="px-3 py-2 text-sm text-right text-charcoal-deep">{region.score}</td>
                              <td className="px-3 py-2 text-sm text-right text-stone">{region.population.toLocaleString()}</td>
                              <td className="px-3 py-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  {trendIcon(region.trend)}
                                  <span className="text-xs text-stone capitalize">{region.trend}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </IntelligencePageWrapper>
  );
}

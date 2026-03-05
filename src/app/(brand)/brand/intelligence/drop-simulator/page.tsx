'use client';

import { useState, useEffect } from 'react';
import { Rocket, Calendar } from 'lucide-react';
import { brandIntelligenceService } from '@/services';
import type { DropSimulation } from '@/types/brand-intelligence';
import IntelligencePageWrapper from '@/components/brand/IntelligencePageWrapper';

export default function DropSimulatorPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [simulations, setSimulations] = useState<DropSimulation[]>([]);

  useEffect(() => {
    brandIntelligenceService.getDropSimulations().then(res => {
      if (res.data) setSimulations(res.data);
      setIsLoading(false);
    });
  }, []);

  const totalSimulations = simulations.length;
  const avgDemandForecast = totalSimulations > 0
    ? (simulations.reduce((sum, s) => sum + s.overallDemandForecast, 0) / totalSimulations).toFixed(1)
    : '0';

  const getStatusBadge = (status: DropSimulation['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-stone/10 text-stone';
      case 'simulated':
        return 'bg-blue-100 text-blue-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'launched':
        return 'bg-purple-100 text-purple-700';
    }
  };

  const getCompetitorBadge = (activity: 'low' | 'medium' | 'high') => {
    switch (activity) {
      case 'low':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-amber-100 text-amber-700';
      case 'high':
        return 'bg-red-100 text-red-700';
    }
  };

  return (
    <IntelligencePageWrapper
      title="Global Drop Strategy Simulator"
      subtitle="Simulate and optimize product drop strategies across global markets"
      acronym="GDSS™"
      phase={2}
      status="mock"
      backendNote="Requires regional market-data feeds and competitor tracking. Endpoint: POST /api/intelligence/drop-simulate"
      isLoading={isLoading}
    >
      {simulations.length === 0 ? (
        <div className="p-8 text-center">
          <Rocket size={48} className="mx-auto text-taupe/40 mb-4" />
          <p className="text-stone">No drop simulations found</p>
          <p className="text-xs text-taupe mt-1">Simulations will appear here once created</p>
        </div>
      ) : (
        <div className="p-8 space-y-8">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Total Simulations</p>
              <p className="font-display text-2xl text-charcoal-deep">{totalSimulations}</p>
            </div>
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Avg Demand Forecast</p>
              <p className="font-display text-2xl text-charcoal-deep">{avgDemandForecast}</p>
            </div>
          </div>

          {/* Simulation Cards */}
          <div className="space-y-6">
            {simulations.map(sim => (
              <div key={sim.id} className="bg-white border border-sand/50 p-6">
                {/* Simulation Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Rocket size={18} className="text-stone" />
                      <h3 className="font-display text-lg text-charcoal-deep">{sim.dropName}</h3>
                      <span className={`px-3 py-0.5 text-[10px] tracking-[0.15em] uppercase ${getStatusBadge(sim.status)}`}>
                        {sim.status}
                      </span>
                    </div>
                    <p className="text-sm text-stone">
                      Collection: {sim.collection}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-stone">
                      <Calendar size={14} />
                      Launch: {new Date(sim.launchDate).toLocaleDateString()}
                    </div>
                    <p className="text-xs text-stone mt-1">
                      Demand Forecast: <span className="font-medium text-charcoal-deep">{sim.overallDemandForecast}</span>
                    </p>
                  </div>
                </div>

                {/* Regional Demand Forecast Table */}
                <div className="mb-4">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-2">Regional Demand Forecast</p>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-sand/30">
                          <th className="text-left px-4 py-2 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Region</th>
                          <th className="text-right px-4 py-2 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Demand Score</th>
                          <th className="text-left px-4 py-2 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Optimal Date</th>
                          <th className="text-right px-4 py-2 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Sell-Through</th>
                          <th className="text-center px-4 py-2 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Competitor Activity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sand/30">
                        {sim.regions.map(region => (
                          <tr key={region.region} className="hover:bg-parchment/30 transition-colors">
                            <td className="px-4 py-3 text-sm text-charcoal-deep">{region.region}</td>
                            <td className="px-4 py-3 text-sm text-charcoal-deep text-right">{region.demandScore}</td>
                            <td className="px-4 py-3 text-sm text-charcoal-deep">
                              {new Date(region.optimalDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-charcoal-deep text-right">
                              {(region.estimatedSellThrough * 100).toFixed(0)}%
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${getCompetitorBadge(region.competitorActivity)}`}>
                                {region.competitorActivity}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Risk Factors */}
                {sim.riskFactors.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-2">Risk Factors</p>
                    <div className="flex flex-wrap gap-2">
                      {sim.riskFactors.map((risk, idx) => (
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

                {/* Recommendation */}
                {sim.recommendation && (
                  <div className="pt-4 border-t border-sand/30">
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Recommendation</p>
                    <p className="text-sm text-charcoal-deep">{sim.recommendation}</p>
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

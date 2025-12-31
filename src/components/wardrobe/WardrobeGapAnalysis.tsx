'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ChevronRight, AlertCircle, TrendingUp, ShoppingBag } from 'lucide-react';
import type { WardrobeAnalysis, WardrobeGap } from '@/types';

interface WardrobeGapAnalysisProps {
  analysis: WardrobeAnalysis;
}

export default function WardrobeGapAnalysis({ analysis }: WardrobeGapAnalysisProps) {
  const [selectedGap, setSelectedGap] = useState<string | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'essential': return 'bg-error/10 text-error border-error/20';
      case 'recommended': return 'bg-gold-muted/20 text-gold-deep border-gold-muted/30';
      case 'nice-to-have': return 'bg-sapphire-deep/10 text-sapphire-subtle border-sapphire-subtle/20';
      default: return 'bg-sand text-stone border-sand';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'essential': return 'Essential';
      case 'recommended': return 'Recommended';
      case 'nice-to-have': return 'Nice to Have';
      default: return priority;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-sand">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-sapphire-deep/10 rounded-full flex items-center justify-center">
            <Sparkles size={20} className="text-sapphire-subtle" />
          </div>
          <div>
            <h2 className="font-display text-xl text-charcoal-deep">Wardrobe Analysis</h2>
            <p className="text-sm text-stone">AI-powered insights for your collection</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-parchment rounded-xl text-center">
            <p className="text-2xl font-display text-charcoal-deep">{analysis.totalPieces}</p>
            <p className="text-xs text-stone">Total Pieces</p>
          </div>
          <div className="p-4 bg-parchment rounded-xl text-center">
            <p className="text-2xl font-display text-charcoal-deep">{analysis.versatilityScore}%</p>
            <p className="text-xs text-stone">Versatility Score</p>
          </div>
          <div className="p-4 bg-parchment rounded-xl text-center">
            <p className="text-2xl font-display text-charcoal-deep">{Object.keys(analysis.categories).length}</p>
            <p className="text-xs text-stone">Categories</p>
          </div>
          <div className="p-4 bg-parchment rounded-xl text-center">
            <p className="text-2xl font-display text-charcoal-deep">{analysis.gaps.length}</p>
            <p className="text-xs text-stone">Gaps Identified</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="p-6 border-b border-sand">
        <h3 className="font-medium text-charcoal-deep mb-4">Category Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(analysis.categories).map(([category, count]) => (
            <div key={category} className="flex items-center gap-4">
              <span className="text-sm text-stone w-24 capitalize">{category}</span>
              <div className="flex-1 h-3 bg-sand rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-muted rounded-full transition-all"
                  style={{ width: `${(count / analysis.totalPieces) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-charcoal-deep w-8 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Occasion Coverage */}
      <div className="p-6 border-b border-sand">
        <h3 className="font-medium text-charcoal-deep mb-4">Occasion Coverage</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(analysis.occasionCoverage).map(([occasion, coverage]) => (
            <div key={occasion} className="p-3 bg-parchment rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-stone capitalize">{occasion.replace('_', ' ')}</span>
                <span className={`text-sm font-medium ${coverage >= 80 ? 'text-success' : coverage >= 50 ? 'text-gold-deep' : 'text-error-soft'}`}>
                  {coverage}%
                </span>
              </div>
              <div className="h-1.5 bg-sand rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${coverage >= 80 ? 'bg-success' : coverage >= 50 ? 'bg-gold-muted' : 'bg-error-soft'}`}
                  style={{ width: `${coverage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wardrobe Gaps */}
      <div className="p-6 border-b border-sand">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-charcoal-deep">Identified Gaps</h3>
          <span className="text-sm text-stone">{analysis.gaps.length} items suggested</span>
        </div>

        <div className="space-y-4">
          {analysis.gaps.map((gap) => (
            <div
              key={gap.id}
              className={`border rounded-xl overflow-hidden transition-all ${
                selectedGap === gap.id ? 'border-gold-muted' : 'border-sand'
              }`}
            >
              <button
                onClick={() => setSelectedGap(selectedGap === gap.id ? null : gap.id)}
                className="w-full p-4 text-left hover:bg-parchment/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle size={18} className="text-stone flex-shrink-0" />
                    <div>
                      <p className="font-medium text-charcoal-deep">{gap.category}</p>
                      <p className="text-sm text-stone">{gap.reason}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs border ${getPriorityColor(gap.priority)}`}>
                    {getPriorityLabel(gap.priority)}
                  </span>
                </div>
              </button>

              {selectedGap === gap.id && (
                <div className="px-4 pb-4 border-t border-sand pt-4">
                  {/* Occasions Unlocked */}
                  <div className="mb-4">
                    <p className="text-sm text-greige mb-2">Occasions Unlocked</p>
                    <div className="flex flex-wrap gap-2">
                      {gap.occasionsUnlocked.map((occ) => (
                        <span key={occ} className="px-3 py-1 bg-success/10 text-success text-xs rounded-full">
                          {occ}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Products */}
                  {gap.suggestedProducts.length > 0 && (
                    <div>
                      <p className="text-sm text-greige mb-2">Suggested Products</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {gap.suggestedProducts.slice(0, 3).map((product) => (
                          <Link
                            key={product.id}
                            href={`/product/${product.slug}`}
                            className="group"
                          >
                            <div className="relative aspect-square rounded-lg overflow-hidden bg-parchment mb-2">
                              <Image
                                src={product.images[0]?.url || ''}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <p className="text-xs text-greige">{product.brandName}</p>
                            <p className="text-sm text-charcoal-deep truncate">{product.name}</p>
                            <p className="text-sm text-stone">€{product.price.toLocaleString()}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AGI Insight */}
      <div className="p-6">
        <div className="flex items-start gap-3 p-4 bg-sapphire-deep/5 rounded-xl border border-sapphire-subtle/20">
          <Sparkles size={20} className="text-sapphire-subtle flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-charcoal-deep mb-1">Style Balance: {analysis.styleBalance}</p>
            <p className="text-sm text-stone">{analysis.agiInsight}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

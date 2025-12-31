'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ChevronRight, Heart, Check, ShoppingBag } from 'lucide-react';
import type { CompleteOutfit, Product } from '@/types';

interface OutfitSuggestionsProps {
  product: Product;
  outfits: CompleteOutfit[];
}

export default function OutfitSuggestions({ product, outfits }: OutfitSuggestionsProps) {
  const [selectedOutfit, setSelectedOutfit] = useState<string | null>(outfits[0]?.id || null);
  const activeOutfit = outfits.find(o => o.id === selectedOutfit);

  if (outfits.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-champagne/30">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} className="text-gold-muted" />
              <p className="text-xs tracking-[0.3em] uppercase text-gold-muted">Fashion Intelligence</p>
            </div>
            <h2 className="font-display text-3xl text-charcoal-deep">
              Complete the Look
            </h2>
            <p className="text-stone mt-2">
              Curated ensembles featuring the {product.name}
            </p>
          </div>
        </div>

        {/* Outfit Selector Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {outfits.map((outfit) => (
            <button
              key={outfit.id}
              onClick={() => setSelectedOutfit(outfit.id)}
              className={`px-5 py-3 rounded-full whitespace-nowrap transition-all ${
                selectedOutfit === outfit.id
                  ? 'bg-charcoal-deep text-ivory-cream'
                  : 'bg-white text-charcoal-deep hover:bg-parchment'
              }`}
            >
              {outfit.name}
            </button>
          ))}
        </div>

        {/* Active Outfit Display */}
        {activeOutfit && (
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Outfit Items */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display text-xl text-charcoal-deep">{activeOutfit.name}</h3>
                    <p className="text-sm text-stone">{activeOutfit.occasion}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-greige">Match Score</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      activeOutfit.compatibilityScore >= 90
                        ? 'bg-success/10 text-success'
                        : activeOutfit.compatibilityScore >= 70
                          ? 'bg-gold-muted/20 text-gold-deep'
                          : 'bg-sand text-stone'
                    }`}>
                      {activeOutfit.compatibilityScore}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {activeOutfit.items.map((item, index) => (
                    <div key={index} className="group">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-parchment mb-3">
                        <Image
                          src={item.product.images[0]?.url || ''}
                          alt={item.product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        {item.type === 'wardrobe' && (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-success/90 text-white text-xs rounded-full flex items-center gap-1">
                            <Check size={12} />
                            Owned
                          </div>
                        )}
                        {item.product.id === product.id && (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-gold-muted text-noir text-xs rounded-full">
                            Current
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-greige uppercase tracking-wider">{item.category}</p>
                      <p className="text-sm font-medium text-charcoal-deep truncate">{item.product.name}</p>
                      <p className="text-sm text-stone">
                        €{item.product.price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total Price */}
                <div className="mt-6 pt-6 border-t border-sand flex items-center justify-between">
                  <div>
                    <p className="text-sm text-greige">Complete Look Total</p>
                    <p className="font-display text-xl text-charcoal-deep">
                      €{activeOutfit.totalPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button className="btn-secondary">
                      <Heart size={16} />
                      Save Look
                    </button>
                    <button className="btn-primary">
                      <ShoppingBag size={16} />
                      Add All to Considerations
                    </button>
                  </div>
                </div>
              </div>

              {/* AGI Reasoning */}
              <div className="lg:col-span-1">
                <div className="bg-sapphire-deep/5 rounded-xl p-5 border border-sapphire-subtle/20 h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={18} className="text-sapphire-subtle" />
                    <h4 className="font-medium text-charcoal-deep">Why This Works</h4>
                  </div>
                  <p className="text-sm text-stone leading-relaxed mb-6">
                    {activeOutfit.agiReasoning}
                  </p>
                  <p className="text-sm text-stone leading-relaxed">
                    {activeOutfit.description}
                  </p>
                  <Link
                    href="/wardrobe"
                    className="inline-flex items-center gap-1 text-sm text-sapphire-subtle hover:text-sapphire-deep mt-4"
                  >
                    View your wardrobe
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

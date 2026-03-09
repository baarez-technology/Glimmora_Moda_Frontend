'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ChevronRight, Heart, Check, ShoppingBag, Loader2 } from 'lucide-react';
import type { CompleteOutfit, Product } from '@/types';
import { getCompleteTheLook } from '@/services/complete-the-look.service';
import type { CompleteTheLookResponse, CompleteTheLookProduct } from '@/services/complete-the-look.service';

interface OutfitSuggestionsProps {
  product: Product;
  outfits: CompleteOutfit[];
}

/** Predefined event options the user can pick from */
const EVENT_OPTIONS = [
  { title: 'Business Meeting', description: 'Professional attire for formal office meetings and conferences' },
  { title: 'Evening Dinner', description: 'Sophisticated ensemble for upscale dining and social gatherings' },
  { title: 'Weekend Brunch', description: 'Relaxed yet polished look for casual weekend outings' },
  { title: 'Art Gallery Opening', description: 'Creative and refined outfit for cultural events' },
  { title: 'Cocktail Party', description: 'Elegant and stylish for semi-formal celebrations' },
];

export default function OutfitSuggestions({ product, outfits }: OutfitSuggestionsProps) {
  // API-powered state
  const [apiResponse, setApiResponse] = useState<CompleteTheLookResponse | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string>(EVENT_OPTIONS[0].title);
  const [hasCalledApi, setHasCalledApi] = useState(false);

  // Legacy mock-based state
  const [selectedOutfit, setSelectedOutfit] = useState<string | null>(outfits[0]?.id || null);
  const activeOutfit = outfits.find(o => o.id === selectedOutfit);

  const fetchCompleteTheLook = useCallback(async (eventTitle: string) => {
    setIsLoadingApi(true);
    const event = EVENT_OPTIONS.find(e => e.title === eventTitle) || EVENT_OPTIONS[0];

    const result = await getCompleteTheLook({
      event_title: event.title,
      event_short_description: event.description,
      current_product_id: product.id,
    });

    setApiResponse(result);
    setIsLoadingApi(false);
    setHasCalledApi(true);
  }, [product.id]);

  // Fetch on mount
  useEffect(() => {
    fetchCompleteTheLook(selectedEvent);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleEventChange = (eventTitle: string) => {
    setSelectedEvent(eventTitle);
    fetchCompleteTheLook(eventTitle);
  };

  // ── Render API-powered view ──────────────────────────────────────────────
  if (hasCalledApi && apiResponse) {
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
                AI-curated ensembles featuring the {apiResponse.current_product_name || product.name}
              </p>
            </div>
          </div>

          {/* Event Selector Tabs */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {EVENT_OPTIONS.map((event) => (
              <button
                key={event.title}
                onClick={() => handleEventChange(event.title)}
                disabled={isLoadingApi}
                className={`px-5 py-3 rounded-full whitespace-nowrap transition-all ${
                  selectedEvent === event.title
                    ? 'bg-charcoal-deep text-ivory-cream'
                    : 'bg-white text-charcoal-deep hover:bg-parchment'
                } ${isLoadingApi ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {event.title}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {isLoadingApi && (
            <div className="bg-white rounded-2xl p-12 shadow-sm flex flex-col items-center justify-center">
              <Loader2 size={32} className="text-charcoal-deep animate-spin mb-4" />
              <p className="text-sm text-stone">Finding the perfect pieces for your {selectedEvent}...</p>
              <p className="text-[10px] text-taupe mt-1 tracking-wider uppercase">Powered by GPT-4o + Elasticsearch</p>
            </div>
          )}

          {/* Results */}
          {!isLoadingApi && (
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Outfit Items */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-display text-xl text-charcoal-deep">{apiResponse.event_title}</h3>
                      <p className="text-sm text-stone">{apiResponse.products.length} pieces to complete your look</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-greige">Match Score</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        apiResponse.match_score >= 90
                          ? 'bg-success/10 text-success'
                          : apiResponse.match_score >= 70
                            ? 'bg-gold-muted/20 text-gold-deep'
                            : 'bg-sand text-stone'
                      }`}>
                        {apiResponse.match_score}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {apiResponse.products.map((item) => (
                      <ApiProductCard key={item.product_id} item={item} />
                    ))}
                  </div>

                  {/* Total Price */}
                  <div className="mt-6 pt-6 border-t border-sand flex items-center justify-between">
                    <div>
                      <p className="text-sm text-greige">Suggested Pieces Total</p>
                      <p className="font-display text-xl text-charcoal-deep">
                        €{apiResponse.products
                          .filter(p => !p.in_wardrobe)
                          .reduce((sum, p) => sum + p.price, 0)
                          .toLocaleString()}
                      </p>
                      {apiResponse.products.some(p => p.in_wardrobe) && (
                        <p className="text-xs text-success mt-1">
                          {apiResponse.products.filter(p => p.in_wardrobe).length} piece{apiResponse.products.filter(p => p.in_wardrobe).length !== 1 ? 's' : ''} already in your wardrobe
                        </p>
                      )}
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
                    <p className="text-sm text-stone leading-relaxed">
                      {apiResponse.reason}
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

  // ── Render loading on first call ─────────────────────────────────────────
  if (isLoadingApi && !hasCalledApi) {
    return (
      <section className="py-16 lg:py-24 bg-champagne/30">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-gold-muted" />
            <p className="text-xs tracking-[0.3em] uppercase text-gold-muted">Fashion Intelligence</p>
          </div>
          <h2 className="font-display text-3xl text-charcoal-deep mb-8">Complete the Look</h2>
          <div className="bg-white rounded-2xl p-12 shadow-sm flex flex-col items-center justify-center">
            <Loader2 size={32} className="text-charcoal-deep animate-spin mb-4" />
            <p className="text-sm text-stone">Analysing your style and wardrobe...</p>
          </div>
        </div>
      </section>
    );
  }

  // ── Fallback: Legacy mock-based rendering ────────────────────────────────
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
                          sizes="(max-width: 768px) 50vw, 25vw"
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

/** Card for API-returned product */
function ApiProductCard({ item }: { item: CompleteTheLookProduct }) {
  return (
    <div className="group">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-parchment mb-3">
        {item.product_image ? (
          <Image
            src={item.product_image}
            alt={item.product_name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={24} className="text-stone/40" />
          </div>
        )}
        {item.in_wardrobe && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-success/90 text-white text-xs rounded-full flex items-center gap-1">
            <Check size={12} />
            Owned
          </div>
        )}
      </div>
      <p className="text-xs text-greige uppercase tracking-wider">{item.product_category}</p>
      <p className="text-sm font-medium text-charcoal-deep truncate">{item.product_name}</p>
      <p className="text-sm text-stone">
        €{item.price.toLocaleString()}
      </p>
    </div>
  );
}

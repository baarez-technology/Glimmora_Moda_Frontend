'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Info, Layers, ChevronRight, RefreshCw } from 'lucide-react';
import * as wardrobeService from '@/services/wardrobe.service';
import type { WardrobeGapAnalysisResponse } from '@/services/wardrobe.service';
import { useAuth } from '@/context/AuthContext';

const GAP_SESSION_KEY = 'moda-gap-analysis';

type PageState = 'EMPTY' | 'ANALYSING' | 'RESULTS' | 'ERROR';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SilentCartPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push('/auth/login/consumer?redirect=/profile/silent-cart');
  }, [isAuthenticated, isHydrated, router]);

  const [pageState, setPageState] = useState<PageState>(() => {
    if (typeof window === 'undefined') return 'EMPTY';
    try {
      const cached = sessionStorage.getItem(GAP_SESSION_KEY);
      return cached ? 'RESULTS' : 'EMPTY';
    } catch { return 'EMPTY'; }
  });
  const [gapAnalysis, setGapAnalysis] = useState<WardrobeGapAnalysisResponse | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = sessionStorage.getItem(GAP_SESSION_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(true);

  // Run analysis (first time or refresh) — caches in sessionStorage
  const runAnalysis = useCallback((regenerate: boolean) => {
    setPageState('ANALYSING');
    setError(null);
    wardrobeService.getWardrobeGapAnalysis(regenerate)
      .then((data) => {
        setGapAnalysis(data);
        setPageState('RESULTS');
        try { sessionStorage.setItem(GAP_SESSION_KEY, JSON.stringify(data)); } catch {}
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Analysis failed');
        setPageState('ERROR');
      });
  }, []);

  const gaps = gapAnalysis?.gap_analysis || [];

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>

          <div className={`flex items-center gap-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="w-14 h-14 bg-gold-soft/20 flex items-center justify-center">
              <Layers size={28} className="text-gold-soft" />
            </div>
            <div>
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70 block mb-2">
                Curated For You
              </span>
              <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
                Silent Cart
              </h1>
              <p className="text-sand mt-2">
                AI-powered wardrobe recommendations based on what you're missing
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* State: EMPTY (no analysis yet — click to trigger) */}
        {pageState === 'EMPTY' && (
          <div className="text-center py-16 bg-white border border-sand">
            <div className="w-16 h-16 mx-auto mb-6 bg-charcoal-deep/5 flex items-center justify-center">
              <Layers size={32} className="text-charcoal-deep" />
            </div>
            <h3 className="font-display text-xl text-charcoal-deep mb-3">
              No Analysis Yet
            </h3>
            <p className="text-stone mb-2 max-w-md mx-auto">
              Your wardrobe gap analysis hasn't run yet, or your wardrobe has changed since the last analysis.
            </p>
            <p className="text-stone mb-8 max-w-md mx-auto text-sm">
              Run an analysis to discover what's missing and get personalized product recommendations.
            </p>
            <button
              onClick={() => runAnalysis(false)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-all duration-300"
            >
              <span className="text-sm tracking-[0.15em] uppercase">Analyse My Wardrobe</span>
            </button>
          </div>
        )}

        {/* State: ANALYSING */}
        {pageState === 'ANALYSING' && (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-stone">Analysing your wardrobe...</p>
            <p className="text-xs text-taupe">This may take a moment as our AI reviews your collection</p>
          </div>
        )}

        {/* State: ERROR */}
        {pageState === 'ERROR' && (
          <div className="text-center py-16 bg-white border border-sand">
            <p className="text-stone mb-4">{error || 'Could not load recommendations.'}</p>
            <button
              onClick={() => runAnalysis(false)}
              className="text-sm tracking-[0.15em] uppercase text-charcoal-deep hover:text-noir transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* State: RESULTS */}
        {pageState === 'RESULTS' && gapAnalysis && (
          <>
            {/* Meta bar: timestamp + cached badge + refresh */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-sand/50">
              <div className="flex items-center gap-3">
                {gapAnalysis.analyzed_at && (
                  <span className="text-xs text-stone">
                    Last analysed {timeAgo(gapAnalysis.analyzed_at)}
                  </span>
                )}
                {gapAnalysis.cached && (
                  <span className="text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 bg-sand/50 text-taupe">
                    Cached
                  </span>
                )}
              </div>
              <button
                onClick={() => runAnalysis(true)}
                className="flex items-center gap-2 text-sm text-stone hover:text-charcoal-deep transition-colors"
                title="Refresh analysis"
              >
                <RefreshCw size={14} />
                <span className="text-xs tracking-[0.1em] uppercase">Refresh</span>
              </button>
            </div>

            {/* Style Note */}
            {gapAnalysis.style_notes && (
              <div className="p-6 bg-charcoal-deep mb-8">
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold-soft/50 mb-3">Style Note</p>
                <p className="text-taupe text-sm leading-relaxed">{gapAnalysis.style_notes}</p>
              </div>
            )}

            {/* Stats + Wardrobe link */}
            {gaps.length > 0 && (
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-2">
                    Wardrobe Gap Analysis
                  </span>
                  <p className="text-stone text-sm">
                    {gapAnalysis.gap_suggestions_count} gaps identified · {gapAnalysis.total_recommendations} products matched
                  </p>
                </div>
                <Link
                  href="/wardrobe"
                  className="flex items-center gap-2 text-sm text-stone hover:text-charcoal-deep transition-colors"
                >
                  View Wardrobe
                  <ChevronRight size={14} />
                </Link>
              </div>
            )}

            {/* Empty gaps (analysis ran but nothing found) */}
            {gaps.length === 0 && (
              <div className="text-center py-16 bg-white border border-sand">
                <div className="w-16 h-16 mx-auto mb-6 bg-charcoal-deep/5 flex items-center justify-center">
                  <Layers size={32} className="text-charcoal-deep" />
                </div>
                <h3 className="font-display text-xl text-charcoal-deep mb-3">
                  No Gaps Found
                </h3>
                <p className="text-stone mb-8 max-w-md mx-auto">
                  Your wardrobe looks well-rounded! Add more items or check back later for new recommendations.
                </p>
                <Link
                  href="/discover"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-all duration-300"
                >
                  <span className="text-sm tracking-[0.15em] uppercase">Browse Products</span>
                </Link>
              </div>
            )}

            {/* Recommendations Grid */}
            {gaps.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-6">
                {gaps.map((gap, idx) => {
                  const p = gap.matched_product;

                  // Handle null matched_product
                  if (!p) {
                    return (
                      <div key={idx} className="bg-white border border-sand overflow-hidden">
                        <div className="px-5 pt-5 pb-3 border-b border-sand/50">
                          <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">
                            {gap.suggestion.product_category}
                          </p>
                          <p className="text-sm font-medium text-charcoal-deep">
                            {gap.suggestion.title}
                          </p>
                        </div>
                        <div className="flex gap-4 p-5">
                          <div className="w-24 h-32 bg-parchment flex items-center justify-center flex-shrink-0">
                            <Layers size={24} className="text-taupe" />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <p className="text-sm text-stone mb-1">No matching product found</p>
                            <p className="text-xs text-taupe">
                              We couldn't find a product in our catalogue for this gap yet.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const imgSrc = p.image_urls?.[0] || p.product_image;
                  const slug = p.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                  const productUrl = `/product/${slug}?productId=${p.product_id}`;

                  return (
                    <div key={idx} className="bg-white border border-sand overflow-hidden">
                      {/* Gap Suggestion Header */}
                      <div className="px-5 pt-5 pb-3 border-b border-sand/50">
                        <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">
                          {gap.suggestion.product_category}
                        </p>
                        <p className="text-sm font-medium text-charcoal-deep">
                          {gap.suggestion.title}
                        </p>
                      </div>

                      {/* Matched Product */}
                      <Link href={productUrl} className="group flex gap-4 p-5">
                        <div className="relative w-24 h-32 overflow-hidden bg-parchment flex-shrink-0">
                          {imgSrc && (
                            <Image
                              src={imgSrc}
                              alt={p.product_name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-1">
                            {p.brand_name}
                          </p>
                          <p className="font-display text-lg text-charcoal-deep leading-tight mb-1 line-clamp-2 group-hover:text-gold-muted transition-colors">
                            {p.product_name}
                          </p>
                          <p className="text-xs text-stone uppercase mb-3">
                            {p.product_category}
                          </p>
                          <div className="flex items-center gap-2">
                            {p.discount_percentage > 0 && (
                              <span className="text-xs text-taupe line-through">€{p.price.toLocaleString()}</span>
                            )}
                            <span className="font-display text-base text-charcoal-deep">
                              €{(p.offer_price || p.price).toLocaleString()}
                            </span>
                            {p.discount_percentage > 0 && (
                              <span className="text-xs text-success">-{p.discount_percentage}%</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-[9px] text-stone">
                              {Math.round(gap.product_match_score * 100)}% match
                            </span>
                            <span className="flex items-center gap-1 text-[10px] tracking-[0.15em] uppercase text-stone group-hover:text-charcoal-deep transition-colors">
                              View
                              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Info Box — always visible */}
        {(
          <div className="mt-10 flex items-start gap-4 p-6 bg-parchment border border-sand text-sm">
            <Info size={18} className="text-stone flex-shrink-0 mt-0.5" />
            <div className="text-stone">
              <p className="font-medium text-charcoal-deep mb-2">About Silent Cart</p>
              <p>
                Silent Cart analyses your wardrobe to identify style gaps — missing categories,
                fabrics, or occasions — and matches each gap with the best product from our catalogue.
                Recommendations refresh automatically when your wardrobe changes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Info, Check, ArrowLeft } from 'lucide-react';
import * as wardrobeService from '@/services/wardrobe.service';
import type { GapAnalysisItem, WardrobeGapAnalysisResponse } from '@/services/wardrobe.service';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';

type PageState = 'EMPTY' | 'LOADING' | 'RESULTS' | 'ERROR';

function formatExpiryDate(dateStr?: string): string {
  if (!dateStr) {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function SilentCartPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const { addToConsiderations } = useApp();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push('/auth/login/consumer?redirect=/profile/silent-cart');
  }, [isAuthenticated, isHydrated, router]);

  const SESSION_KEY = 'moda-silent-cart';

  const [pageState, setPageState] = useState<PageState>(() => {
    if (typeof window !== 'undefined') {
      try { if (sessionStorage.getItem(SESSION_KEY)) return 'RESULTS'; } catch { /* ignore */ }
    }
    return 'LOADING';
  });
  const [gapAnalysis, setGapAnalysis] = useState<WardrobeGapAnalysisResponse | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(SESSION_KEY);
        return cached ? JSON.parse(cached) : null;
      } catch { return null; }
    }
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  // Load silent cart on mount — skipped if session cache exists
  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;
    if (gapAnalysis !== null) return; // already loaded from session cache

    // Try to load cached silent cart first, fallback to gap analysis
    wardrobeService.getSilentCart()
      .then((data) => {
        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch { /* full */ }
        setGapAnalysis(data);
        setPageState('RESULTS');
      })
      .catch(() => {
        wardrobeService.getWardrobeGapAnalysis(false)
          .then((data) => {
            try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch { /* full */ }
            setGapAnalysis(data);
            setPageState('RESULTS');
          })
          .catch((err) => {
            setError(err instanceof Error ? err.message : 'Failed to load silent cart');
            setPageState('ERROR');
          });
      });
  }, [isHydrated, isAuthenticated, gapAnalysis]);

  const gaps = gapAnalysis?.gap_analysis?.filter(g => g.matched_product) || [];

  const toggleItem = useCallback((idx: number) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedItems.size === gaps.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(gaps.map((_, i) => i)));
    }
  }, [selectedItems.size, gaps]);

  const selectedTotal = Array.from(selectedItems).reduce((sum, idx) => {
    const p = gaps[idx]?.matched_product;
    return sum + (p ? (p.price) : 0);
  }, 0);

  const fullCartValue = gaps.reduce((sum, g) => {
    const p = g.matched_product;
    return sum + (p ? (p.price) : 0);
  }, 0);

  const handleMoveToConsiderations = useCallback(() => {
    const items = Array.from(selectedItems).map(idx => gaps[idx]).filter(Boolean);
    items.forEach((gap) => {
      const p = gap.matched_product;
      if (!p) return;
      const slug = p.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      addToConsiderations({
        id: p.product_id,
        brandId: p.brand_id,
        brandName: p.brand_name,
        name: p.product_name,
        slug,
        tagline: p.tagline || '',
        description: p.product_description || '',
        narrative: '',
        price: p.price,
        currency: 'EUR',
        images: (p.image_urls?.length ? p.image_urls : p.product_image ? [p.product_image] : []).map((url, i) => ({
          id: String(i + 1),
          url,
          alt: p.product_name,
          type: i === 0 ? 'hero' as const : 'detail' as const,
        })),
        variants: [],
        materials: [],
        craftsmanship: [],
        ivEnabled: false,
        availability: { status: p.is_low_stock ? 'limited' as const : 'available' as const, regions: [] },
        collection: p.collection_name,
        category: (p.product_category as 'bags' | 'clothing' | 'shoes' | 'accessories' | 'jewelry') || 'clothing',
        tags: [...(p.occasions || []), ...(p.aesthetics || [])],
        visibility: 'public',
        experienceMode: 'standard',
        pricingVisibility: 'visible',
        commerceAction: 'add_to_considerations',
        commerceEligible: true,
        craftTags: [],
      });
    });
    setSelectedItems(new Set());
  }, [selectedItems, gaps, addToConsiderations]);

  // Reason text generator based on suggestion data
  const getReasonText = (gap: GapAnalysisItem): string => {
    const s = gap.suggestion;
    if (s.title) return s.title;
    return `Complements items in your wardrobe and fills a style gap`;
  };

  const getEventText = (gap: GapAnalysisItem): string | null => {
    const p = gap.matched_product;
    if (p?.occasions && p.occasions.length > 0) {
      return p.occasions[0];
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-ivory-cream flex flex-col">
      {/* Premium Luxury Header */}
      <div className="relative bg-gradient-to-b from-charcoal-deep to-noir overflow-hidden border-b border-sand/20">
        <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-bl from-gold-soft/5 via-transparent to-transparent opacity-80 pointer-events-none" />
        <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-80 h-80 bg-gold-soft/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-[1000px] mx-auto px-8 md:px-16 lg:px-24 py-16 lg:py-20 relative z-10">
          <Link
            href="/profile"
            className="group inline-flex items-center gap-3 text-xs tracking-[0.15em] uppercase text-sand hover:text-gold-soft transition-colors mb-12"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Return to Profile
          </Link>

          <div className="flex items-start md:items-center gap-6 md:gap-8 transition-all duration-1000 opacity-100 translate-y-0">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-[1px] bg-gold-soft/40" />
                <span className="text-[10px] tracking-[0.4em] uppercase text-gold-soft block">
                  AI Curated
                </span>
              </div>
              <h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] text-ivory-cream leading-[1.1] tracking-[-0.02em]">
                Silent Cart
              </h1>
              <p className="text-taupe mt-3 text-sm md:text-base font-light max-w-lg leading-relaxed">
                Quietly prepared items based on your browsing patterns, style preferences, and upcoming events.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[1000px] w-full mx-auto px-6 md:px-8 py-16 lg:py-24">

        {/* How Silent Cart Works */}
        <div className="mb-12 flex gap-5 bg-parchment/30 p-8 border border-sand/30">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-charcoal-deep flex items-center justify-center">
            <span className="text-xs font-semibold text-ivory-cream">1</span>
          </div>
          <div>
            <h2 className="text-sm tracking-[0.15em] uppercase text-charcoal-deep mb-2">How Silent Cart Works</h2>
            <p className="text-sm text-stone leading-relaxed font-light">
              Based on your browsing patterns, style preferences, and upcoming calendar events, I&apos;ve quietly prepared these
              items for your consideration. Each piece has been selected to complement your existing wardrobe and align with
              your aesthetic.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {pageState === 'LOADING' && (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-stone tracking-wide">Preparing your silent cart...</p>
          </div>
        )}

        {/* Error State */}
        {pageState === 'ERROR' && (
          <div className="text-center py-20 bg-white border border-sand">
            <p className="text-stone mb-6">{error || 'Could not load silent cart.'}</p>
            <button
              onClick={() => {
                try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
                setGapAnalysis(null);
                setPageState('LOADING');
              }}
              className="text-xs tracking-[0.15em] uppercase text-charcoal-deep hover:text-gold-muted transition-colors border-b border-charcoal-deep/30 pb-1"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {pageState === 'RESULTS' && gaps.length === 0 && (
          <div className="text-center py-24 bg-white border border-sand">
            <p className="text-xl font-display text-charcoal-deep mb-3">No items prepared yet</p>
            <p className="text-sm text-stone mb-10 max-w-md mx-auto leading-relaxed">
              Add items to your wardrobe and browse products so the Silent Cart can learn your preferences.
            </p>
            <Link
              href="/discover"
              className="inline-block px-10 py-4 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.2em] uppercase hover:bg-noir transition-all"
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* Results */}
        {pageState === 'RESULTS' && gaps.length > 0 && (
          <>
            {/* Items count + Select All */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-sand/50">
              <p className="text-sm text-charcoal-deep">
                <span className="font-semibold">{gaps.length} items</span> prepared
              </p>
              <button
                onClick={toggleSelectAll}
                className="text-xs font-medium tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep transition-colors"
              >
                {selectedItems.size === gaps.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Item Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {gaps.map((gap, idx) => {
                const p = gap.matched_product!;
                const imgSrc = p.image_urls?.[0] || p.product_image;
                const isSelected = selectedItems.has(idx);
                const matchScore = Math.round(gap.product_match_score * 100);
                const eventText = getEventText(gap);
                const slug = p.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                const productUrl = `/product/${slug}?productId=${p.product_id}`;

                return (
                  <div key={idx} className={`bg-white border transition-colors duration-300 overflow-hidden ${isSelected ? 'border-charcoal-deep shadow-md' : 'border-sand hover:border-sand/80'}`}>
                    {/* Product Row */}
                    <div className="flex gap-5 p-6">
                      {/* Checkbox */}
                      <button
                         onClick={() => toggleItem(idx)}
                         className={`flex-shrink-0 w-5 h-5 mt-1 border transition-all ${
                           isSelected
                             ? 'bg-charcoal-deep border-charcoal-deep'
                             : 'border-sand hover:border-charcoal-deep'
                         } flex items-center justify-center`}
                       >
                         {isSelected && <Check size={12} className="text-ivory-cream" />}
                       </button>

                      {/* Image */}
                      <Link href={productUrl} className="flex-shrink-0">
                        <div className="relative w-[100px] h-[130px] bg-parchment overflow-hidden">
                          {imgSrc && (
                            <Image
                              src={imgSrc}
                              alt={p.product_name}
                              fill
                              className="object-cover hover:scale-105 transition-transform duration-700"
                            />
                          )}
                        </div>
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">
                          {p.brand_name}
                        </p>
                        <Link href={productUrl} className="hover:text-gold-muted transition-colors">
                          <p className="text-base font-display text-charcoal-deep leading-tight mb-2 line-clamp-2">
                            {p.product_name}
                          </p>
                        </Link>
                        <p className="text-sm text-stone mt-auto">
                          &euro;{(p.price).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Reason Tag */}
                    <div className="px-6 pb-6">
                      <div className="bg-parchment/60 border border-sand/30 px-5 py-4 mb-4">
                        <p className="text-xs text-charcoal-deep font-light leading-relaxed">
                          {getReasonText(gap)}
                        </p>
                        {eventText && (
                          <p className="text-[10px] tracking-wide text-taupe mt-2">
                            Curated for: <span className="text-charcoal-deep">{eventText}</span>
                          </p>
                        )}
                      </div>

                      {/* Match + Expiry */}
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.1em] text-taupe">
                        <span>{matchScore}% match</span>
                        <span>Expires {formatExpiryDate()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary */}
            <div className="mt-12 border-t border-sand/50 pt-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Selected Items</p>
                  <p className="text-2xl font-display text-charcoal-deep">
                    &euro;{selectedTotal.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Full Cart Value</p>
                  <p className="text-2xl font-display text-stone">
                    &euro;{fullCartValue.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleMoveToConsiderations}
                  disabled={selectedItems.size === 0}
                  className={`flex-1 py-4 text-xs tracking-[0.15em] uppercase text-center transition-all ${
                    selectedItems.size > 0
                      ? 'bg-charcoal-deep text-ivory-cream hover:bg-noir'
                      : 'bg-sand text-stone cursor-not-allowed'
                  }`}
                >
                  Move to Considerations ({selectedItems.size})
                </button>
                <Link
                  href="/profile"
                  className="px-8 py-4 text-xs tracking-[0.15em] uppercase text-charcoal-deep border border-charcoal-deep hover:bg-charcoal-deep hover:text-ivory-cream transition-all text-center"
                >
                  View Considerations
                </Link>
              </div>

              <p className="text-xs text-stone font-light text-center mt-6">
                Items moved to Considerations can be reviewed before purchase.
              </p>
            </div>
          </>
        )}

        {/* About Silent Cart */}
        <div className="mt-16 border border-sand/50 bg-parchment/40 p-8">
          <div className="flex items-start gap-4">
            <Info size={18} className="text-taupe flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-charcoal-deep mb-2">About Silent Cart</p>
              <p className="text-sm text-stone font-light leading-relaxed">
                The Silent Cart feature observes your browsing patterns, wardrobe composition, and upcoming events to prepare
                items you might love. It&apos;s designed to help, not pressure. Items expire after 30 days and you&apos;re always in control.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

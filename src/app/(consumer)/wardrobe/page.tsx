'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, ArrowLeft, Grid, LayoutList, X, Calendar, SlidersHorizontal, Trash2, RefreshCw, ChevronRight } from 'lucide-react';
import { formatPrice, getCurrencySymbol } from '@/lib/currency';
import { useApp } from '@/context/AppContext';
import ConfirmModal from '@/components/shared/ConfirmModal';
import * as wardrobeService from '@/services/wardrobe.service';
import type { WardrobeGapAnalysisResponse, GapAnalysisItem } from '@/services/wardrobe.service';

export default function WardrobePage() {
  const { wardrobe, removeFromWardrobe, clearAllWardrobe, isUHNI } = useApp();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeHover, setActiveHover] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'brand' | 'worn'>('recent');
  const [showClearAll, setShowClearAll] = useState(false);
  const GAP_SESSION_KEY = 'moda-gap-analysis';

  const [gapAnalysis, setGapAnalysis] = useState<WardrobeGapAnalysisResponse | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = sessionStorage.getItem(GAP_SESSION_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [gapLoading, setGapLoading] = useState(false);
  const [gapError, setGapError] = useState<string | null>(null);
  const [selectedGap, setSelectedGap] = useState<GapAnalysisItem | null>(null);

  useEffect(() => {
    if (isUHNI) { router.replace('/uhni/wardrobe'); return; }
    setIsLoaded(true);
  }, [isUHNI, router]);

  // Close gap popup on ESC & lock body scroll
  useEffect(() => {
    if (!selectedGap) return;
    document.body.style.overflow = 'hidden';
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedGap(null);
    };
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEsc);
    };
  }, [selectedGap]);

  const fetchGapAnalysis = (regenerate = false) => {
    setGapLoading(true);
    setGapError(null);
    wardrobeService.getWardrobeGapAnalysis(regenerate)
      .then((data) => {
        setGapAnalysis(data);
        try { sessionStorage.setItem(GAP_SESSION_KEY, JSON.stringify(data)); } catch {}
      })
      .catch((err) => setGapError(err instanceof Error ? err.message : 'Failed to analyze wardrobe'))
      .finally(() => setGapLoading(false));
  };

  const stats = {
    totalPieces: wardrobe.length,
    totalWears: wardrobe.reduce((sum, item) => sum + item.wearCount, 0),
    brands: new Set(wardrobe.map(item => item.product.brandId)).size,
    totalValue: wardrobe.reduce((sum, item) => sum + item.product.price, 0),
  };

  const filteredWardrobe = wardrobe
    .filter(item => {
      if (categoryFilter === 'all') return true;
      const cat = item.product.category?.toLowerCase() || '';
      const tags = item.product.tags?.map(t => t.toLowerCase()) || [];
      return cat.includes(categoryFilter) || tags.some(t => t.includes(categoryFilter));
    })
    .sort((a, b) => {
      if (sortBy === 'brand') return (a.product.brandName || '').localeCompare(b.product.brandName || '');
      if (sortBy === 'worn') return b.wearCount - a.wearCount;
      return new Date(b.addedAt || 0).getTime() - new Date(a.addedAt || 0).getTime();
    });

  // Gap analysis data from API

  if (isUHNI) return null;

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* ============================================
          HERO - Page Header
          ============================================ */}
      <section className="relative bg-gradient-to-b from-charcoal-deep to-noir overflow-hidden border-b border-sand/20 py-16 lg:py-24">
        {/* Luxury Decorative Background */}
        <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-bl from-gold-soft/5 via-transparent to-transparent opacity-80 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-soft/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24 relative z-10">
          {/* Back Button */}
          <Link
            href="/profile"
            className="group inline-flex items-center gap-3 mb-10 text-xs tracking-[0.15em] uppercase text-sand hover:text-gold-soft transition-colors"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Return to Profile
          </Link>

          <div className={`flex flex-col lg:flex-row lg:items-end justify-between gap-10 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-[1px] bg-gold-soft/40" />
                <span className="text-[10px] tracking-[0.4em] uppercase text-gold-soft block">
                  Curated Archive
                </span>
              </div>
              <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em] mb-4">
                Digital Wardrobe
              </h1>
              <p className="text-taupe text-sm md:text-base font-light max-w-lg leading-relaxed">
                {wardrobe.length} exquisite piece{wardrobe.length !== 1 ? 's' : ''} meticulously cataloged in your personal collection.
              </p>
            </div>

            <div className="flex items-center gap-6">
              {/* Filter & Sort */}
              <div className="flex items-center gap-3">
                <SlidersHorizontal size={16} className="text-ivory-cream/40" />
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-transparent border border-ivory-cream/20 text-ivory-cream text-sm px-3 py-2 appearance-none cursor-pointer focus:outline-none focus:border-ivory-cream/40"
                  aria-label="Filter by category"
                >
                  <option value="all" className="text-charcoal-deep">All</option>
                  <option value="clothing" className="text-charcoal-deep">Clothing</option>
                  <option value="bags" className="text-charcoal-deep">Bags</option>
                  <option value="shoes" className="text-charcoal-deep">Shoes</option>
                  <option value="accessories" className="text-charcoal-deep">Accessories</option>
                </select>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as 'recent' | 'brand' | 'worn')}
                  className="bg-transparent border border-ivory-cream/20 text-ivory-cream text-sm px-3 py-2 appearance-none cursor-pointer focus:outline-none focus:border-ivory-cream/40"
                  aria-label="Sort by"
                >
                  <option value="recent" className="text-charcoal-deep">Recently Added</option>
                  <option value="brand" className="text-charcoal-deep">Brand A–Z</option>
                  <option value="worn" className="text-charcoal-deep">Most Worn</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex border border-ivory-cream/20">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-all ${viewMode === 'grid' ? 'bg-ivory-cream text-charcoal-deep' : 'text-ivory-cream/60 hover:text-ivory-cream'}`}
                  aria-label="Grid view"
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-all ${viewMode === 'list' ? 'bg-ivory-cream text-charcoal-deep' : 'text-ivory-cream/60 hover:text-ivory-cream'}`}
                  aria-label="List view"
                >
                  <LayoutList size={18} />
                </button>
              </div>

              {wardrobe.length > 0 && (
                <button
                  onClick={() => setShowClearAll(true)}
                  className="flex items-center gap-2 text-sm text-ivory-cream/40 hover:text-red-400 transition-colors"
                  title="Clear all items"
                >
                  <Trash2 size={14} />
                  <span className="text-xs tracking-[0.1em] uppercase">Clear All</span>
                </button>
              )}

              <Link
                href="/discover"
                className="group flex items-center gap-4"
              >
                <span className="text-sm tracking-[0.15em] uppercase text-ivory-cream/60 group-hover:text-ivory-cream transition-colors">
                  Add Piece
                </span>
                <span className="w-12 h-12 border border-ivory-cream/30 flex items-center justify-center group-hover:border-ivory-cream group-hover:bg-ivory-cream transition-all duration-300">
                  <ArrowRight size={16} className="text-ivory-cream group-hover:text-charcoal-deep transition-colors" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          STATS BAR
          ============================================ */}
      {wardrobe.length > 0 && (
        <section className="border-b border-sand/50">
          <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-sand/50">
              <div className="py-8 pr-8">
                <p className="font-display text-3xl text-charcoal-deep mb-1">{stats.totalPieces}</p>
                <p className="text-[10px] tracking-[0.3em] uppercase text-taupe">Pieces</p>
              </div>
              <div className="py-8 px-8">
                <p className="font-display text-3xl text-charcoal-deep mb-1">{stats.brands}</p>
                <p className="text-[10px] tracking-[0.3em] uppercase text-taupe">Maisons</p>
              </div>
              <div className="py-8 px-8">
                <p className="font-display text-3xl text-charcoal-deep mb-1">{stats.totalWears}</p>
                <p className="text-[10px] tracking-[0.3em] uppercase text-taupe">Total Wears</p>
              </div>
              <div className="py-8 pl-8">
                <p className="font-display text-3xl text-charcoal-deep mb-1">{formatPrice(stats.totalValue)}</p>
                <p className="text-[10px] tracking-[0.3em] uppercase text-taupe">Collection Value</p>
                <p className="text-[9px] text-taupe/60 italic mt-1">Based on original purchase prices</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          MAIN CONTENT
          ============================================ */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24">
          {wardrobe.length > 0 ? (
            <div className="grid lg:grid-cols-4 gap-12 lg:gap-16">
              {/* Wardrobe Items */}
              <div className="lg:col-span-3">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-10 md:gap-y-12">
                    {filteredWardrobe.map((item, index) => (
                      <div key={item.id} className="group">
                        <Link
                          href={`/product/${item.product.slug}?productId=${item.productId}`}
                          className="relative block aspect-[3/4] overflow-hidden mb-5"
                          onMouseEnter={() => setActiveHover(index)}
                          onMouseLeave={() => setActiveHover(null)}
                        >
                          <Image
                            src={item.product.images[0]?.url || 'https://placehold.co/800x1000/F5F0EB/8B8680?text=No+Image'}
                            alt={item.product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-noir/0 group-hover:bg-noir/20 transition-all duration-500 flex items-center justify-center">
                            <div className={`w-14 h-14 rounded-full bg-ivory-cream flex items-center justify-center transform transition-all duration-500 ${activeHover === index ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                              <ArrowRight size={18} className="text-charcoal-deep" />
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeFromWardrobe(item.id);
                            }}
                            className="absolute top-4 right-4 w-8 h-8 bg-ivory-cream/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error hover:text-white"
                            aria-label="Remove from wardrobe"
                          >
                            <X size={14} />
                          </button>

                          {/* Wear Count Badge */}
                          <div className="absolute bottom-4 left-4">
                            <span className="text-[9px] tracking-[0.2em] uppercase text-charcoal-deep bg-ivory-cream/90 px-3 py-1.5 flex items-center gap-1.5">
                              <Calendar size={10} />
                              {item.wearCount} wears
                            </span>
                          </div>
                        </Link>

                        <p className="text-[10px] tracking-[0.25em] uppercase text-taupe mb-1">
                          {item.product.brandName}
                        </p>
                        <Link href={`/product/${item.product.slug}?productId=${item.productId}`}>
                          <h3 className="font-display text-lg text-charcoal-deep leading-tight group-hover:text-charcoal-warm transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-stone mt-1">
                          {formatPrice(item.product.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredWardrobe.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex gap-6 md:gap-8 pb-6 border-b border-sand/50 last:border-0"
                      >
                        <Link
                          href={`/product/${item.product.slug}?productId=${item.productId}`}
                          className="group relative w-28 md:w-36 aspect-[3/4] overflow-hidden flex-shrink-0"
                          onMouseEnter={() => setActiveHover(index)}
                          onMouseLeave={() => setActiveHover(null)}
                        >
                          <Image
                            src={item.product.images[0]?.url || 'https://placehold.co/800x1000/F5F0EB/8B8680?text=No+Image'}
                            alt={item.product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-noir/0 group-hover:bg-noir/20 transition-all duration-500">
                            <div className={`w-10 h-10 rounded-full bg-ivory-cream flex items-center justify-center transform transition-all duration-500 ${activeHover === index ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                              <ArrowRight size={14} className="text-charcoal-deep" />
                            </div>
                          </div>
                        </Link>

                        <div className="flex-1 py-2">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-2">
                                {item.product.brandName}
                              </p>
                              <Link href={`/product/${item.product.slug}?productId=${item.productId}`}>
                                <h3 className="font-display text-xl md:text-2xl text-charcoal-deep hover:text-charcoal-warm transition-colors">
                                  {item.product.name}
                                </h3>
                              </Link>
                              <p className="text-base text-charcoal-deep font-medium mt-2">
                                {formatPrice(item.product.price)}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromWardrobe(item.id)}
                              className="w-10 h-10 flex items-center justify-center border border-sand text-taupe hover:border-charcoal-deep hover:text-charcoal-deep transition-all"
                              aria-label="Remove from wardrobe"
                            >
                              <X size={16} />
                            </button>
                          </div>

                          <div className="flex items-center gap-4 mt-4 text-sm text-stone">
                            <span className="flex items-center gap-2">
                              <Calendar size={14} />
                              Worn {item.wearCount} times
                            </span>
                            {item.lastWorn && (
                              <span className="text-taupe">Last: {item.lastWorn}</span>
                            )}
                          </div>

                          {item.product.tags.length > 0 && (
                            <div className="flex gap-2 mt-4">
                              {item.product.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="px-3 py-1 border border-sand text-xs text-stone">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-8">
                {/* Wardrobe Gaps — from API */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] tracking-[0.5em] uppercase text-taupe">
                      Wardrobe Gaps
                    </span>
                    {/* {!gapAnalysis && !gapLoading && (
                      <button
                        onClick={() => fetchGapAnalysis()}
                        className="text-[10px] tracking-[0.1em] uppercase text-stone hover:text-charcoal-deep transition-colors"
                      >
                        Analyze
                      </button>
                    )}
                    {gapAnalysis && (
                      <button
                        onClick={() => fetchGapAnalysis(true)}
                        disabled={gapLoading}
                        className="text-stone hover:text-charcoal-deep transition-colors disabled:opacity-50"
                        title="Refresh analysis"
                      >
                        <RefreshCw size={12} className={gapLoading ? 'animate-spin' : ''} />
                      </button>
                    )} */}
                  </div>

                  {gapLoading && !gapAnalysis && (
                    <div className="py-8 text-center">
                      <div className="w-6 h-6 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-xs text-stone">Analyzing your wardrobe...</p>
                    </div>
                  )}

                  {gapError && !gapAnalysis && (
                    <div className="p-4 bg-parchment text-center">
                      <p className="text-xs text-stone mb-2">Could not analyze wardrobe.</p>
                      <button
                        onClick={() => fetchGapAnalysis()}
                        className="text-[10px] tracking-[0.1em] uppercase text-charcoal-deep hover:text-noir transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {!gapAnalysis && !gapLoading && !gapError && (
                    <div className="p-5 bg-parchment text-center">
                      <p className="text-sm text-stone mb-4">
                        Get AI-powered analysis of what's missing from your wardrobe.
                      </p>
                      <button
                        onClick={() => fetchGapAnalysis()}
                        className="group inline-flex items-center gap-2 text-sm tracking-[0.1em] uppercase text-charcoal-deep"
                      >
                        <span>Analyze Wardrobe</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}

                  {gapAnalysis && (
                    <div className="space-y-3">
                      {gapAnalysis.gap_analysis.map((gap, idx) => {
                        const p = gap.matched_product;

                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedGap(gap)}
                            className="w-full text-left border border-sand/60 bg-parchment/50 p-4 hover:bg-parchment transition-colors"
                          >
                            <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">
                              {gap.suggestion.product_category}
                            </p>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium text-charcoal-deep">{gap.suggestion.title}</p>
                              <ChevronRight size={14} className="text-taupe flex-shrink-0" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {gapAnalysis && (
                <Link
                  href="/profile/silent-cart"
                  className="group flex items-center justify-between p-5 bg-parchment border border-sand hover:border-charcoal-deep transition-all"
                >
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">AI Curated</p>
                    <p className="text-sm font-medium text-charcoal-deep">Plan An Outfit</p>
                  </div>
                  <ArrowRight size={16} className="text-stone group-hover:text-charcoal-deep group-hover:translate-x-1 transition-all" />
                </Link>
                )}
                {/* Style Note — from API or fallback */}
                <div className="p-6 bg-charcoal-deep">
                  <p className="text-[10px] tracking-[0.4em] uppercase text-gold-soft/50 mb-4">Style Note</p>
                  <p className="text-taupe text-sm leading-relaxed">
                    {gapAnalysis?.style_notes ||
                      'Your collection shows a refined taste for structured silhouettes. Consider adding softer textures for versatility.'}
                  </p>
                </div>

                {/* Outfit Ideas */}
                {/* <div>
                  <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-6">
                    Suggested Outfits
                  </span>

                  {suggestedOutfits.length > 0 ? (
                    <div className="space-y-4">
                      {suggestedOutfits.map((outfit, index) => (
                        <div key={index} className="p-5 bg-parchment">
                          <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">{outfit.occasion}</p>
                          <h4 className="font-display text-lg text-charcoal-deep mb-3">{outfit.name}</h4>
                          <p className="text-sm text-stone">
                            {outfit.pieces.join(' + ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-stone leading-relaxed">
                      Add at least 2 pieces to your wardrobe to see personalized outfit suggestions.
                    </p>
                  )}
                </div> */}

                {/* Silent Cart */}
                <Link
                  href="/profile/silent-cart"
                  className="group block bg-charcoal-deep p-6 hover:bg-noir transition-colors"
                >
                  <span className="text-[10px] tracking-[0.4em] uppercase text-gold-soft/50 block mb-3">
                    AI Curated
                  </span>
                  <h4 className="font-display text-lg text-ivory-cream mb-2">Silent Cart</h4>
                  <p className="text-sm text-taupe leading-relaxed mb-4">
                    Items quietly prepared based on your style and preferences.
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm tracking-[0.1em] uppercase text-gold-soft group-hover:text-ivory-cream transition-colors">
                    <span>View Cart</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="max-w-xl mx-auto text-center py-20">
              <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-6">
                Your Wardrobe
              </span>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] text-charcoal-deep leading-[1.1] mb-6">
                Start Your Collection
              </h2>
              <p className="text-stone mb-12">
                Add pieces you already own to get personalized outfit suggestions
                and track your style journey.
              </p>
              <Link
                href="/discover"
                className="group inline-flex items-center gap-5"
              >
                <span className="text-sm tracking-[0.2em] uppercase text-charcoal-deep">
                  Add Your First Piece
                </span>
                <span className="w-14 h-14 rounded-full border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep transition-all duration-500">
                  <ArrowRight size={18} className="text-charcoal-deep group-hover:text-ivory-cream transition-colors duration-500" />
                </span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          CTA - Discover More
          ============================================ */}
      {wardrobe.length > 0 && (
        <section className="py-20 lg:py-28 bg-parchment">
          <div className="max-w-3xl mx-auto px-8 md:px-16 text-center">
            <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-6">
              Expand Your Collection
            </span>
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-charcoal-deep leading-[1.1] tracking-[-0.02em] mb-8">
              Discover New Pieces
            </h2>
            <p className="text-stone mb-12 max-w-lg mx-auto">
              Explore exceptional pieces that complement your existing wardrobe.
            </p>
            <Link
              href="/discover"
              className="group inline-flex items-center gap-5"
            >
              <span className="text-sm tracking-[0.2em] uppercase text-charcoal-deep">
                Explore Collection
              </span>
              <span className="w-14 h-14 rounded-full border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep transition-all duration-500">
                <ArrowRight size={18} className="text-charcoal-deep group-hover:text-ivory-cream transition-colors duration-500" />
              </span>
            </Link>
          </div>
        </section>
      )}

      <ConfirmModal
        isOpen={showClearAll}
        onClose={() => setShowClearAll(false)}
        onConfirm={clearAllWardrobe}
        title="Clear Wardrobe"
        message="Are you sure you want to remove all items from your wardrobe? This action cannot be undone."
        confirmLabel="Clear All"
        confirmVariant="danger"
      />

      {/* Gap Detail Popup — shows the suggestion's matched product */}
      {selectedGap && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-noir/50 backdrop-blur-sm"
            onClick={() => setSelectedGap(null)}
          />
          <div className="relative bg-ivory-cream w-full sm:max-w-lg max-h-[90vh] overflow-y-auto sm:mx-4">
            {/* Header */}
            <div className="sticky top-0 bg-charcoal-deep px-6 py-5 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-gold-soft/60 mb-1">
                    {selectedGap.suggestion.product_category}
                  </p>
                  <h3 className="font-display text-xl text-ivory-cream">
                    {selectedGap.suggestion.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedGap(null)}
                  className="w-10 h-10 flex items-center justify-center text-ivory-cream/60 hover:text-ivory-cream transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              {(selectedGap.suggestion.fabric || selectedGap.suggestion.pattern || selectedGap.suggestion.color) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedGap.suggestion.fabric && (
                    <span className="text-[9px] tracking-[0.15em] uppercase text-taupe px-2 py-0.5 border border-ivory-cream/20">
                      {selectedGap.suggestion.fabric}
                    </span>
                  )}
                  {selectedGap.suggestion.pattern && (
                    <span className="text-[9px] tracking-[0.15em] uppercase text-taupe px-2 py-0.5 border border-ivory-cream/20">
                      {selectedGap.suggestion.pattern}
                    </span>
                  )}
                  {selectedGap.suggestion.color && (
                    <span className="flex items-center gap-1.5 text-[9px] tracking-[0.15em] uppercase text-taupe px-2 py-0.5 border border-ivory-cream/20">
                      <span
                        className="w-3 h-3 rounded-full border border-ivory-cream/30"
                        style={{ backgroundColor: selectedGap.suggestion.color }}
                      />
                      Color
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* All matched products for this category */}
            {(() => {
              const category = selectedGap.suggestion.product_category.toLowerCase();
              const categoryGaps = gapAnalysis?.gap_analysis.filter(
                g => g.suggestion.product_category.toLowerCase() === category && g.matched_product
              ) || [];

              if (categoryGaps.length === 0) {
                return (
                  <div className="p-6 text-center py-16">
                    <p className="text-sm text-stone">No matching products found in our catalogue for this category yet.</p>
                    <Link
                      href="/discover"
                      onClick={() => setSelectedGap(null)}
                      className="inline-flex items-center gap-2 mt-4 text-sm tracking-[0.1em] uppercase text-charcoal-deep hover:text-noir transition-colors"
                    >
                      <span>Browse Products</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                );
              }

              return (
                <div className="p-6">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-4">
                    {categoryGaps.length} Suggested Product{categoryGaps.length > 1 ? 's' : ''}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {categoryGaps.map((gap, i) => {
                      const mp = gap.matched_product!;
                      const imgSrc = mp.image_urls?.[0] || mp.product_image;
                      const slug = mp.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      const productUrl = `/product/${slug}?productId=${mp.product_id}`;
                      return (
                        <Link
                          key={i}
                          href={productUrl}
                          className="group"
                          onClick={() => setSelectedGap(null)}
                        >
                          <div className="relative aspect-[3/4] w-full overflow-hidden bg-parchment mb-3">
                            {imgSrc && (
                              <Image
                                src={imgSrc}
                                alt={mp.product_name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            )}
                          </div>
                          <p className="text-[9px] tracking-[0.15em] uppercase text-taupe mb-0.5">{mp.brand_name}</p>
                          <p className="text-sm text-charcoal-deep line-clamp-1 group-hover:text-gold-muted transition-colors">
                            {mp.product_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-medium text-charcoal-deep">
                              {formatPrice(mp.price)}
                            </span>
                          </div>
                          <p className="text-[9px] text-stone mt-1">
                            {Math.round(gap.product_match_score * 100)}% match
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

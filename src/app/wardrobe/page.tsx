'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Grid, LayoutList, X, Calendar } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function WardrobePage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeHover, setActiveHover] = useState<number | null>(null);
  const { wardrobe, removeFromWardrobe } = useApp();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const stats = {
    totalPieces: wardrobe.length,
    totalWears: wardrobe.reduce((sum, item) => sum + item.wearCount, 0),
    brands: new Set(wardrobe.map(item => item.product.brandId)).size,
    totalValue: wardrobe.reduce((sum, item) => sum + item.product.price, 0),
  };

  const suggestedOutfits = [
    {
      name: 'Power Meeting',
      pieces: ['Bar Jacket', 'Navy Trousers', 'Silk Blouse'],
      occasion: 'Professional'
    },
    {
      name: 'Gallery Evening',
      pieces: ['Bar Jacket', 'Wide-leg Pants', 'Statement Earrings'],
      occasion: 'Art & Culture'
    }
  ];

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* ============================================
          HERO - Page Header
          ============================================ */}
      <section className="bg-charcoal-deep py-16 lg:py-24">
        <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24">
          <div className={`flex flex-col lg:flex-row lg:items-end justify-between gap-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div>
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50 block mb-4">
                Your Collection
              </span>
              <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-ivory-cream leading-[1] tracking-[-0.02em] mb-4">
                Digital Wardrobe
              </h1>
              <p className="text-taupe max-w-lg">
                {wardrobe.length} piece{wardrobe.length !== 1 ? 's' : ''} carefully curated in your personal collection.
              </p>
            </div>

            <div className="flex items-center gap-6">
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
                <p className="font-display text-3xl text-charcoal-deep mb-1">€{stats.totalValue.toLocaleString()}</p>
                <p className="text-[10px] tracking-[0.3em] uppercase text-taupe">Collection Value</p>
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
                    {wardrobe.map((item, index) => (
                      <div key={item.id} className="group">
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="relative block aspect-[3/4] overflow-hidden mb-5"
                          onMouseEnter={() => setActiveHover(index)}
                          onMouseLeave={() => setActiveHover(null)}
                        >
                          <Image
                            src={item.product.images[0]?.url || ''}
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
                        <Link href={`/product/${item.product.slug}`}>
                          <h3 className="font-display text-lg text-charcoal-deep leading-tight group-hover:text-charcoal-warm transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {wardrobe.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex gap-6 md:gap-8 pb-6 border-b border-sand/50 last:border-0"
                      >
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="group relative w-28 md:w-36 aspect-[3/4] overflow-hidden flex-shrink-0"
                          onMouseEnter={() => setActiveHover(index)}
                          onMouseLeave={() => setActiveHover(null)}
                        >
                          <Image
                            src={item.product.images[0]?.url || ''}
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
                              <Link href={`/product/${item.product.slug}`}>
                                <h3 className="font-display text-xl md:text-2xl text-charcoal-deep hover:text-charcoal-warm transition-colors">
                                  {item.product.name}
                                </h3>
                              </Link>
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
                {/* Outfit Ideas */}
                <div>
                  <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-6">
                    Styling Ideas
                  </span>

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

                  <Link
                    href="/calendar"
                    className="group inline-flex items-center gap-2 mt-6 text-sm tracking-[0.1em] uppercase text-stone hover:text-charcoal-deep transition-colors"
                  >
                    <span>Plan an Outfit</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Style Note */}
                <div className="p-6 bg-charcoal-deep">
                  <p className="text-[10px] tracking-[0.4em] uppercase text-gold-soft/50 mb-4">Style Note</p>
                  <p className="text-taupe text-sm leading-relaxed">
                    Your collection shows a refined taste for structured silhouettes. Consider adding softer textures for versatility.
                  </p>
                </div>
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
    </div>
  );
}

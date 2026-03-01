'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, X, Crown, Grid, LayoutList, Calendar, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import ConfirmModal from '@/components/shared/ConfirmModal';
import type { ProductCategory } from '@/types';

export default function UHNIWardrobePage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeHover, setActiveHover] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'brand' | 'worn'>('recent');
  const { wardrobe, removeFromWardrobe, clearAllWardrobe } = useApp();
  const [showClearAll, setShowClearAll] = useState(false);

  useEffect(() => { setIsLoaded(true); }, []);

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

  // Dynamic outfit suggestions
  const suggestedOutfits = (() => {
    if (wardrobe.length < 2) return [];
    const byCategory: Record<string, typeof wardrobe> = {};
    wardrobe.forEach(item => {
      const cat = item.product.category || 'other';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(item);
    });
    const categories = Object.keys(byCategory);
    const outfits: { name: string; pieces: string[]; occasion: string }[] = [];

    if (categories.length >= 2) {
      const pieces = categories.slice(0, 3).map(cat => byCategory[cat][0]).filter(Boolean);
      if (pieces.length >= 2) {
        const allTags = pieces.flatMap(p => p.product.tags.map(t => t.toLowerCase()));
        const occasion = allTags.includes('formal') || allTags.includes('evening') ? 'Evening'
          : allTags.includes('casual') || allTags.includes('everyday') ? 'Casual'
          : allTags.includes('work') || allTags.includes('professional') ? 'Professional'
          : 'Versatile';
        outfits.push({ name: 'Complete Look', pieces: pieces.map(p => p.product.name), occasion });
      }
    }

    const brandGroups: Record<string, typeof wardrobe> = {};
    wardrobe.forEach(item => {
      const brand = item.product.brandName || 'Unknown';
      if (!brandGroups[brand]) brandGroups[brand] = [];
      brandGroups[brand].push(item);
    });
    const multiBrand = Object.entries(brandGroups).find(([, items]) => items.length >= 2);
    if (multiBrand) {
      const [brandName, items] = multiBrand;
      outfits.push({ name: `${brandName} Ensemble`, pieces: items.slice(0, 3).map(i => i.product.name), occasion: 'Curated' });
    }

    const mostWorn = [...wardrobe].sort((a, b) => b.wearCount - a.wearCount).slice(0, 3);
    if (mostWorn.length >= 2 && outfits.length < 3) {
      outfits.push({ name: 'Wardrobe Favourites', pieces: mostWorn.map(i => i.product.name), occasion: 'Go-To' });
    }
    return outfits.slice(0, 3);
  })();

  // Wardrobe gaps
  const wardrobeGaps = (() => {
    const allCategories: { key: ProductCategory; label: string; suggestion: string }[] = [
      { key: 'clothing', label: 'Clothing', suggestion: 'Add clothing pieces to build versatile outfits' },
      { key: 'bags', label: 'Bags', suggestion: 'A bag ties every outfit together' },
      { key: 'shoes', label: 'Shoes', suggestion: 'Add shoes to complete your looks' },
      { key: 'accessories', label: 'Accessories', suggestion: 'Accessories elevate any ensemble' },
      { key: 'jewelry', label: 'Jewelry', suggestion: 'Consider adding jewelry for elegant finishing touches' },
      { key: 'watches', label: 'Watches', suggestion: 'A timepiece adds sophistication to your wardrobe' },
    ];
    const presentCategories = new Set(wardrobe.map(item => item.product.category));
    return allCategories.filter(cat => !presentCategories.has(cat.key));
  })();

  return (
    <div className="min-h-screen bg-noir">
      {/* Hero Header */}
      <section className="border-b border-gold-soft/10 py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
          <div className={`flex flex-col lg:flex-row lg:items-end justify-between gap-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Crown size={14} className="text-gold-soft" />
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50">Your Collection</span>
              </div>
              <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-ivory-cream leading-[1] tracking-[-0.02em] mb-4">
                Private Wardrobe
              </h1>
              <p className="text-sand max-w-lg">
                {wardrobe.length} piece{wardrobe.length !== 1 ? 's' : ''} carefully curated in your private collection.
              </p>
            </div>

            <div className="flex items-center gap-6">
              {/* Filter & Sort */}
              <div className="flex items-center gap-3">
                <SlidersHorizontal size={16} className="text-sand/40" />
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-transparent border border-gold-soft/20 text-sand text-sm px-3 py-2 appearance-none cursor-pointer focus:outline-none focus:border-gold-soft/40"
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
                  className="bg-transparent border border-gold-soft/20 text-sand text-sm px-3 py-2 appearance-none cursor-pointer focus:outline-none focus:border-gold-soft/40"
                  aria-label="Sort by"
                >
                  <option value="recent" className="text-charcoal-deep">Recently Added</option>
                  <option value="brand" className="text-charcoal-deep">Brand A–Z</option>
                  <option value="worn" className="text-charcoal-deep">Most Worn</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex border border-gold-soft/20">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-all ${viewMode === 'grid' ? 'bg-gold-soft/20 text-gold-soft' : 'text-sand hover:text-ivory-cream'}`}
                  aria-label="Grid view"
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-all ${viewMode === 'list' ? 'bg-gold-soft/20 text-gold-soft' : 'text-sand hover:text-ivory-cream'}`}
                  aria-label="List view"
                >
                  <LayoutList size={18} />
                </button>
              </div>

              {wardrobe.length > 0 && (
                <button
                  onClick={() => setShowClearAll(true)}
                  className="flex items-center gap-2 text-sm text-sand hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                  <span className="text-xs tracking-[0.1em] uppercase">Clear All</span>
                </button>
              )}

              <Link href="/uhni/discover" className="group flex items-center gap-4">
                <span className="text-sm tracking-[0.15em] uppercase text-sand group-hover:text-ivory-cream transition-colors">
                  Add Piece
                </span>
                <span className="w-12 h-12 border border-gold-soft/30 flex items-center justify-center group-hover:border-gold-soft group-hover:bg-gold-soft/10 transition-all duration-300">
                  <ArrowRight size={16} className="text-gold-soft" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      {wardrobe.length > 0 && (
        <section className="border-b border-gold-soft/10">
          <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gold-soft/10">
              <div className="py-8 pr-8">
                <p className="font-display text-3xl text-ivory-cream mb-1">{stats.totalPieces}</p>
                <p className="text-[10px] tracking-[0.3em] uppercase text-sand/50">Pieces</p>
              </div>
              <div className="py-8 px-8">
                <p className="font-display text-3xl text-ivory-cream mb-1">{stats.brands}</p>
                <p className="text-[10px] tracking-[0.3em] uppercase text-sand/50">Maisons</p>
              </div>
              <div className="py-8 px-8">
                <p className="font-display text-3xl text-ivory-cream mb-1">{stats.totalWears}</p>
                <p className="text-[10px] tracking-[0.3em] uppercase text-sand/50">Total Wears</p>
              </div>
              <div className="py-8 pl-8">
                <p className="font-display text-3xl text-ivory-cream mb-1">€{stats.totalValue.toLocaleString()}</p>
                <p className="text-[10px] tracking-[0.3em] uppercase text-sand/50">Collection Value</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
          {wardrobe.length > 0 ? (
            <div className="grid lg:grid-cols-4 gap-12 lg:gap-16">
              {/* Wardrobe Items */}
              <div className="lg:col-span-3">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-10 md:gap-y-12">
                    {filteredWardrobe.map((item, index) => (
                      <div key={item.id} className="group">
                        <Link
                          href={`/product/${item.product.slug}?productId=${item.productId}`}
                          className="relative block aspect-[3/4] overflow-hidden mb-4 bg-charcoal-deep"
                          onMouseEnter={() => setActiveHover(index)}
                          onMouseLeave={() => setActiveHover(null)}
                        >
                          <Image
                            src={item.product.images[0]?.url || ''}
                            alt={item.product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-noir/0 group-hover:bg-noir/30 transition-all duration-500 flex items-center justify-center">
                            <div className={`w-14 h-14 rounded-full bg-gold-soft/20 backdrop-blur-sm flex items-center justify-center transform transition-all duration-500 ${activeHover === index ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                              <ArrowRight size={18} className="text-ivory-cream" />
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromWardrobe(item.id); }}
                            className="absolute top-3 right-3 w-8 h-8 bg-noir/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900"
                            aria-label="Remove from wardrobe"
                          >
                            <X size={14} className="text-ivory-cream" />
                          </button>
                          <div className="absolute bottom-3 left-3">
                            <span className="text-[9px] tracking-[0.2em] uppercase text-ivory-cream bg-noir/80 px-3 py-1.5 flex items-center gap-1.5">
                              <Calendar size={10} />
                              {item.wearCount} wears
                            </span>
                          </div>
                        </Link>
                        <p className="text-[10px] tracking-[0.25em] uppercase text-sand/50 mb-1">
                          {item.product.brandName}
                        </p>
                        <Link href={`/product/${item.product.slug}?productId=${item.productId}`}>
                          <h3 className="font-display text-lg text-ivory-cream leading-tight group-hover:text-gold-soft transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-0">
                    {filteredWardrobe.map((item, index) => (
                      <div
                        key={item.id}
                        className={`flex gap-6 md:gap-8 py-8 ${index !== filteredWardrobe.length - 1 ? 'border-b border-gold-soft/10' : ''}`}
                      >
                        <Link
                          href={`/product/${item.product.slug}?productId=${item.productId}`}
                          className="group relative w-28 md:w-36 aspect-[3/4] overflow-hidden flex-shrink-0 bg-charcoal-deep"
                          onMouseEnter={() => setActiveHover(index)}
                          onMouseLeave={() => setActiveHover(null)}
                        >
                          <Image
                            src={item.product.images[0]?.url || ''}
                            alt={item.product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </Link>
                        <div className="flex-1 py-2">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <p className="text-[10px] tracking-[0.3em] uppercase text-sand/50 mb-2">
                                {item.product.brandName}
                              </p>
                              <Link href={`/product/${item.product.slug}?productId=${item.productId}`}>
                                <h3 className="font-display text-xl md:text-2xl text-ivory-cream hover:text-gold-soft transition-colors">
                                  {item.product.name}
                                </h3>
                              </Link>
                            </div>
                            <button
                              onClick={() => removeFromWardrobe(item.id)}
                              className="w-10 h-10 flex items-center justify-center border border-gold-soft/20 text-sand hover:border-gold-soft hover:text-ivory-cream transition-all"
                              aria-label="Remove"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <div className="flex items-center gap-4 mt-4 text-sm text-sand">
                            <span className="flex items-center gap-2">
                              <Calendar size={14} />
                              Worn {item.wearCount} times
                            </span>
                            {item.lastWorn && (
                              <span className="text-sand/50">Last: {item.lastWorn}</span>
                            )}
                          </div>
                          {item.product.tags.length > 0 && (
                            <div className="flex gap-2 mt-4">
                              {item.product.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="px-3 py-1 border border-gold-soft/20 text-xs text-sand">
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
                  <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50 block mb-6">
                    Suggested Outfits
                  </span>
                  {suggestedOutfits.length > 0 ? (
                    <div className="space-y-4">
                      {suggestedOutfits.map((outfit, index) => (
                        <div key={index} className="p-5 bg-charcoal-deep border border-gold-soft/10">
                          <p className="text-[10px] tracking-[0.2em] uppercase text-gold-soft/60 mb-2">{outfit.occasion}</p>
                          <h4 className="font-display text-lg text-ivory-cream mb-3">{outfit.name}</h4>
                          <p className="text-sm text-sand">{outfit.pieces.join(' + ')}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-sand leading-relaxed">
                      Add at least 2 pieces to your wardrobe to see personalized outfit suggestions.
                    </p>
                  )}
                </div>

                {/* Wardrobe Gaps */}
                {wardrobeGaps.length > 0 && (
                  <div>
                    <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50 block mb-6">
                      Wardrobe Gaps
                    </span>
                    <div className="space-y-3">
                      {wardrobeGaps.map((gap) => (
                        <div key={gap.key} className="p-4 border border-gold-soft/10 bg-charcoal-deep/50">
                          <p className="text-sm font-medium text-ivory-cream mb-1">{gap.label}</p>
                          <p className="text-xs text-sand leading-relaxed">{gap.suggestion}</p>
                          <Link
                            href={`/uhni/discover?category=${gap.key}`}
                            className="inline-flex items-center gap-1.5 mt-2 text-[10px] tracking-[0.1em] uppercase text-gold-soft hover:text-gold-deep transition-colors"
                          >
                            <span>Browse {gap.label}</span>
                            <ArrowRight size={10} />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Style Note */}
                <div className="p-6 bg-charcoal-deep border border-gold-soft/10">
                  <div className="flex items-center gap-2 mb-4">
                    <Crown size={12} className="text-gold-soft" />
                    <p className="text-[10px] tracking-[0.4em] uppercase text-gold-soft/50">Style Note</p>
                  </div>
                  <p className="text-sand text-sm leading-relaxed">
                    Your collection shows a refined taste for structured silhouettes. Consider adding softer textures for versatility.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="max-w-xl mx-auto text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gold-soft/10 rounded-full mb-6">
                <Crown size={32} className="text-gold-soft/60" />
              </div>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1.1] mb-6">
                Start Your Private Collection
              </h2>
              <p className="text-sand mb-12">
                Add pieces you own to get personalized outfit suggestions and track your style journey.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/uhni/discover"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gold-soft text-noir hover:bg-gold-deep transition-colors"
                >
                  <span className="text-sm tracking-[0.15em] uppercase font-medium">Discover Pieces</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/uhni/concierge"
                  className="inline-flex items-center gap-3 px-8 py-4 border border-gold-soft/30 text-gold-soft hover:border-gold-soft transition-colors"
                >
                  <Crown size={16} />
                  <span className="text-sm tracking-[0.15em] uppercase">Ask Concierge</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <ConfirmModal
        isOpen={showClearAll}
        onClose={() => setShowClearAll(false)}
        onConfirm={clearAllWardrobe}
        title="Clear Private Wardrobe"
        message="Are you sure you want to remove all items from your private wardrobe? This action cannot be undone."
        confirmLabel="Clear All"
        confirmVariant="danger"
      />
    </div>
  );
}

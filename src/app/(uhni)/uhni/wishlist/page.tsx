'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, X, Crown, ShoppingBag, Share2, Trash2, RefreshCw, Grid, LayoutList } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import ConfirmModal from '@/components/shared/ConfirmModal';
import * as wishlistService from '@/services/customer-collection.service';
import { productHref } from '@/services/customer-collection.service';
import type { WishlistItem } from '@/services/customer-collection.service';

export default function UHNIWishlistPage() {
  const { showToast, refreshWishlist, refreshCart } = useApp();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [showClearAll, setShowClearAll] = useState(false);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await wishlistService.getWishlist();
      setWishlistItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (wishlistId: string) => {
    setRemovingId(wishlistId);
    try {
      await wishlistService.removeFromWishlist(wishlistId);
      setWishlistItems((prev) => prev.filter((item) => item.wishlist_id !== wishlistId));
      showToast('Removed from curated selections', 'info');
      refreshWishlist();
    } catch {
      showToast('Failed to remove item', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  const handleMoveToCart = async (item: WishlistItem) => {
    setMovingId(item.wishlist_id);
    try {
      await wishlistService.moveWishlistToCart(item);
      setWishlistItems((prev) => prev.filter((w) => w.wishlist_id !== item.wishlist_id));
      showToast('Moved to private bag', 'success');
      refreshWishlist();
      refreshCart();
    } catch {
      showToast('Failed to move to bag', 'error');
    } finally {
      setMovingId(null);
    }
  };

  const handleShare = async (productName: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${productName} - ModaGlimmora`,
          text: `Check out ${productName} on ModaGlimmora`,
          url: window.location.href,
        });
      } catch {
        // Share cancelled
      }
    }
  };

  const handleClearAll = async () => {
    try {
      await wishlistService.clearAllWishlist();
      setWishlistItems([]);
      showToast('Curated selections cleared', 'info');
      refreshWishlist();
    } catch {
      showToast('Failed to clear selections', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-noir flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold-soft border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sand text-sm">Loading your curated selections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir">
      {/* Header */}
      <section className="border-b border-gold-soft/10">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 py-10">
          <div className="flex items-center gap-2 mb-3">
            <Crown size={14} className="text-gold-soft" />
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'piece' : 'pieces'} curated
            </span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-ivory-cream leading-[1]">
              Curated Selections
            </h1>
            <div className="flex items-center gap-4">
              {wishlistItems.length > 0 && (
                <button
                  onClick={() => setShowClearAll(true)}
                  className="flex items-center gap-2 text-sm text-sand hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                  <span className="text-xs tracking-[0.1em] uppercase">Clear All</span>
                </button>
              )}
              <button
                onClick={fetchWishlist}
                className="flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors"
              >
                <RefreshCw size={14} />
              </button>
              {/* View Toggle */}
              <div className="flex border border-gold-soft/20">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition-all ${viewMode === 'grid' ? 'bg-gold-soft/20 text-gold-soft' : 'text-sand hover:text-ivory-cream'}`}
                  aria-label="Grid view"
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition-all ${viewMode === 'list' ? 'bg-gold-soft/20 text-gold-soft' : 'text-sand hover:text-ivory-cream'}`}
                  aria-label="List view"
                >
                  <LayoutList size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 pt-6">
          <div className="p-4 bg-red-900/20 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchWishlist} className="text-red-200 underline text-xs uppercase tracking-wider">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <section className="py-12 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
          {wishlistItems.length > 0 ? (
            viewMode === 'grid' ? (
              /* Grid View */
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-10 md:gap-y-12">
                {wishlistItems.map((item) => (
                  <div
                    key={item.wishlist_id}
                    className={`group ${removingId === item.wishlist_id ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <Link
                      href={productHref(item.product_id, item.product_name)}
                      className="relative block aspect-[3/4] overflow-hidden mb-4 bg-charcoal-deep"
                    >
                      {item.image_urls[0] ? (
                        <Image
                          src={item.image_urls[0]}
                          alt={item.product_name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Heart size={24} className="text-gold-soft/40" />
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-noir/0 group-hover:bg-noir/30 transition-all duration-500" />

                      {/* Remove Button */}
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(item.wishlist_id); }}
                        className="absolute top-3 right-3 w-8 h-8 bg-noir/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900"
                        aria-label="Remove"
                      >
                        <X size={14} className="text-ivory-cream" />
                      </button>

                      {/* Move to Cart */}
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMoveToCart(item); }}
                        disabled={movingId === item.wishlist_id}
                        className="absolute top-3 left-3 w-8 h-8 bg-noir/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gold-soft hover:text-noir disabled:opacity-50"
                        aria-label="Move to bag"
                      >
                        <ShoppingBag size={14} className="text-ivory-cream" />
                      </button>

                      {/* Price Badge */}
                      <div className="absolute bottom-3 left-3">
                        <span className="text-[9px] tracking-[0.2em] uppercase text-ivory-cream bg-noir/80 px-3 py-1.5">
                          €{item.price.toLocaleString()}
                        </span>
                      </div>
                    </Link>

                    {(item.size || item.color) && (
                      <p className="text-[10px] tracking-[0.25em] uppercase text-sand/60 mb-1">
                        {[item.size, item.color].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <Link href={productHref(item.product_id, item.product_name)}>
                      <h3 className="font-display text-lg text-ivory-cream leading-tight group-hover:text-gold-soft transition-colors">
                        {item.product_name}
                      </h3>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-0">
                {wishlistItems.map((item, index) => (
                  <div
                    key={item.wishlist_id}
                    className={`flex gap-6 md:gap-8 py-8 ${
                      index !== wishlistItems.length - 1 ? 'border-b border-gold-soft/10' : ''
                    } ${removingId === item.wishlist_id ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <Link
                      href={productHref(item.product_id, item.product_name)}
                      className="group relative w-28 md:w-36 aspect-[3/4] overflow-hidden flex-shrink-0 bg-charcoal-deep"
                    >
                      {item.image_urls[0] ? (
                        <Image
                          src={item.image_urls[0]}
                          alt={item.product_name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Heart size={24} className="text-gold-soft/40" />
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 py-1">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <Link href={productHref(item.product_id, item.product_name)}>
                            <h3 className="font-display text-xl md:text-2xl text-ivory-cream hover:text-gold-soft transition-colors">
                              {item.product_name}
                            </h3>
                          </Link>
                          <p className="font-display text-lg text-ivory-cream/80 mt-2">
                            €{item.price.toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemove(item.wishlist_id)}
                          disabled={removingId === item.wishlist_id}
                          className="w-10 h-10 flex items-center justify-center border border-gold-soft/20 text-sand hover:border-gold-soft hover:text-ivory-cream transition-all flex-shrink-0"
                          aria-label="Remove"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {(item.size || item.color) && (
                        <div className="flex gap-3 mt-4">
                          {item.size && (
                            <span className="text-xs tracking-[0.1em] uppercase px-3 py-1.5 border border-gold-soft/20 text-sand">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="text-xs tracking-[0.1em] uppercase px-3 py-1.5 border border-gold-soft/20 text-sand">
                              Color: {item.color}
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-sand/50 mt-3">
                        Added {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>

                      <div className="flex items-center gap-3 mt-6">
                        <button
                          onClick={() => handleMoveToCart(item)}
                          disabled={movingId === item.wishlist_id}
                          className="px-5 py-3 bg-gold-soft text-noir text-xs tracking-[0.15em] uppercase hover:bg-gold-deep transition-colors disabled:opacity-50"
                        >
                          <ShoppingBag size={14} className="inline mr-2" />
                          Move to Bag
                        </button>
                        <button
                          onClick={() => handleShare(item.product_name)}
                          className="px-5 py-3 border border-gold-soft/30 text-gold-soft text-xs tracking-[0.15em] uppercase hover:border-gold-soft transition-colors"
                        >
                          <Share2 size={14} className="inline mr-2" />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Empty State */
            <div className="max-w-xl mx-auto text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gold-soft/10 rounded-full mb-6">
                <Heart size={32} className="text-gold-soft/60" />
              </div>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1.1] mb-4">
                No Curated Selections Yet
              </h2>
              <p className="text-sand mb-12 max-w-md mx-auto">
                Your concierge can curate pieces for you, or explore our exclusive collections to discover extraordinary items.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/uhni/concierge"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gold-soft text-noir hover:bg-gold-deep transition-colors"
                >
                  <Crown size={16} />
                  <span className="text-sm tracking-[0.15em] uppercase font-medium">Ask Concierge</span>
                </Link>
                <Link
                  href="/uhni/discover"
                  className="inline-flex items-center gap-3 px-8 py-4 border border-gold-soft/30 text-gold-soft hover:border-gold-soft transition-colors"
                >
                  <span className="text-sm tracking-[0.15em] uppercase">Discover Pieces</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <ConfirmModal
        isOpen={showClearAll}
        onClose={() => setShowClearAll(false)}
        onConfirm={handleClearAll}
        title="Clear Curated Selections"
        message="Are you sure you want to remove all items from your curated selections? This action cannot be undone."
        confirmLabel="Clear All"
        confirmVariant="danger"
      />
    </div>
  );
}

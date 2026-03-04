'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, X, Share2, ArrowLeft, ArrowRight, RefreshCw, ShoppingBag, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import ConfirmModal from '@/components/shared/ConfirmModal';
import * as wishlistService from '@/services/customer-collection.service';
import { productHref } from '@/services/customer-collection.service';
import type { WishlistItem } from '@/services/customer-collection.service';

export default function WishlistPage() {
  const { isAuthenticated, isHydrated } = useAuth();
  const { showToast, refreshWishlist, refreshCart, isUHNI } = useApp();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showClearAll, setShowClearAll] = useState(false);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [activeHover, setActiveHover] = useState<number | null>(null);

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
    if (isUHNI) { router.replace('/uhni/wishlist'); return; }
    if (isHydrated && isAuthenticated) {
      fetchWishlist();
    } else if (isHydrated) {
      setLoading(false);
    }
  }, [isUHNI, router, isHydrated, isAuthenticated, fetchWishlist]);

  const handleRemove = async (wishlistId: string) => {
    setRemovingId(wishlistId);
    try {
      await wishlistService.removeFromWishlist(wishlistId);
      setWishlistItems((prev) => prev.filter((item) => item.wishlist_id !== wishlistId));
      showToast('Removed from wishlist', 'info');
      refreshWishlist();
    } catch {
      showToast('Failed to remove item', 'error');
    } finally {
      setRemovingId(null);
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

  const handleMoveToCart = async (item: WishlistItem) => {
    setMovingId(item.wishlist_id);
    try {
      await wishlistService.moveWishlistToCart(item);
      setWishlistItems((prev) => prev.filter((w) => w.wishlist_id !== item.wishlist_id));
      showToast('Moved to cart', 'success');
      refreshWishlist();
      refreshCart();
    } catch {
      showToast('Failed to move to cart', 'error');
    } finally {
      setMovingId(null);
    }
  };

  const handleClearAll = async () => {
    try {
      await wishlistService.clearAllWishlist();
      setWishlistItems([]);
      showToast('Wishlist cleared', 'info');
      refreshWishlist();
    } catch {
      showToast('Failed to clear wishlist', 'error');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (isUHNI) return null;

  return (
    <div className="min-h-screen bg-parchment">
      {/* Header */}
      <div className="bg-ivory-cream border-b border-sand/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-stone hover:text-charcoal-deep mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-4xl md:text-5xl text-charcoal-deep mb-2">
                My Wishlist
              </h1>
              <p className="text-stone">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>

            <div className="flex items-center gap-4">
              {wishlistItems.length > 0 && (
                <button
                  onClick={() => setShowClearAll(true)}
                  className="flex items-center gap-2 text-sm text-stone hover:text-red-600 transition-colors"
                  title="Clear all items"
                >
                  <Trash2 size={14} />
                  <span className="text-xs tracking-[0.1em] uppercase">Clear All</span>
                </button>
              )}
              <button
                onClick={fetchWishlist}
                className="p-2 text-stone hover:text-charcoal-deep transition-colors"
                title="Refresh wishlist"
              >
                <RefreshCw size={16} />
              </button>

              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-white border border-sand/30 rounded p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 text-xs tracking-wider uppercase transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-charcoal-deep text-ivory-cream'
                      : 'text-stone hover:text-charcoal-deep'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 text-xs tracking-wider uppercase transition-colors ${
                    viewMode === 'list'
                      ? 'bg-charcoal-deep text-ivory-cream'
                      : 'text-stone hover:text-charcoal-deep'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-6">
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchWishlist} className="text-red-800 underline text-xs uppercase tracking-wider">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {wishlistItems.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-sand/20 rounded-full mb-6">
              <Heart size={32} className="text-stone" />
            </div>
            <h2 className="font-display text-2xl text-charcoal-deep mb-3">
              Your wishlist is empty
            </h2>
            <p className="text-stone mb-8 max-w-md mx-auto">
              Start adding items you love to keep track of them and purchase later
            </p>
            <Link
              href="/discover"
              className="inline-flex items-center gap-3 px-8 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors"
            >
              <span className="text-sm tracking-wider uppercase">Discover Products</span>
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View — styled to match wardrobe cards */
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-10 md:gap-y-12">
            {wishlistItems.map((item, index) => (
              <div
                key={item.wishlist_id}
                className={`group ${removingId === item.wishlist_id ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <Link
                  href={productHref(item.product_id, item.product_name)}
                  className="relative block aspect-[3/4] overflow-hidden mb-5"
                  onMouseEnter={() => setActiveHover(index)}
                  onMouseLeave={() => setActiveHover(null)}
                >
                  {item.image_urls[0] ? (
                    <Image
                      src={item.image_urls[0]}
                      alt={item.product_name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-sand/20 flex items-center justify-center">
                      <Heart size={24} className="text-taupe" />
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-noir/0 group-hover:bg-noir/20 transition-all duration-500 flex items-center justify-center">
                    <div className={`w-14 h-14 rounded-full bg-ivory-cream flex items-center justify-center transform transition-all duration-500 ${activeHover === index ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                      <ArrowRight size={18} className="text-charcoal-deep" />
                    </div>
                  </div>

                  {/* Remove Button — top right */}
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(item.wishlist_id); }}
                    className="absolute top-4 right-4 w-8 h-8 bg-ivory-cream/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error hover:text-white"
                    aria-label="Remove from wishlist"
                  >
                    <X size={14} />
                  </button>

                  {/* Move to Cart — top left */}
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMoveToCart(item); }}
                    disabled={movingId === item.wishlist_id}
                    className="absolute top-4 left-4 w-8 h-8 bg-ivory-cream/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-charcoal-deep hover:text-ivory-cream disabled:opacity-50"
                    aria-label="Move to cart"
                    title="Move to cart"
                  >
                    <ShoppingBag size={14} />
                  </button>

                  {/* Price Badge — bottom left */}
                  <div className="absolute bottom-4 left-4">
                    <span className="text-[9px] tracking-[0.2em] uppercase text-charcoal-deep bg-ivory-cream/90 px-3 py-1.5">
                      €{item.price.toLocaleString()}
                    </span>
                  </div>
                </Link>

                {/* Variants line */}
                {(item.size || item.color) && (
                  <p className="text-[10px] tracking-[0.25em] uppercase text-taupe mb-1">
                    {[item.size, item.color].filter(Boolean).join(' · ')}
                  </p>
                )}
                <Link href={productHref(item.product_id, item.product_name)}>
                  <h3 className="font-display text-lg text-charcoal-deep leading-tight group-hover:text-charcoal-warm transition-colors">
                    {item.product_name}
                  </h3>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {wishlistItems.map((item) => (
              <div
                key={item.wishlist_id}
                className={`flex gap-6 bg-white border border-sand/20 p-4 hover:border-sand/40 transition-colors ${
                  removingId === item.wishlist_id ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <Link href={productHref(item.product_id, item.product_name)} className="relative w-32 h-40 bg-sand/20 flex-shrink-0 overflow-hidden">
                  {item.image_urls[0] ? (
                    <Image
                      src={item.image_urls[0]}
                      alt={item.product_name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart size={20} className="text-taupe" />
                    </div>
                  )}
                </Link>

                <div className="flex-1 flex flex-col">
                  <div className="flex-1">
                    <Link href={productHref(item.product_id, item.product_name)}>
                      <h3 className="font-display text-xl text-charcoal-deep hover:text-gold-muted transition-colors mb-2">
                        {item.product_name}
                      </h3>
                    </Link>
                    <p className="text-lg text-charcoal-warm mb-2">
                      €{item.price.toLocaleString()}
                    </p>
                    {/* Variants */}
                    <div className="flex gap-3 mb-2">
                      {item.size && (
                        <span className="text-xs tracking-wider uppercase text-stone px-2 py-1 border border-sand">
                          Size: {item.size}
                        </span>
                      )}
                      {item.color && (
                        <span className="text-xs tracking-wider uppercase text-stone px-2 py-1 border border-sand">
                          Color: {item.color}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-greige mt-2">
                      Added {new Date(item.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => handleMoveToCart(item)}
                      disabled={movingId === item.wishlist_id}
                      className="px-4 py-2.5 border border-charcoal-deep text-xs tracking-wider uppercase text-charcoal-deep hover:bg-charcoal-deep hover:text-ivory-cream disabled:opacity-50 transition-colors"
                    >
                      <ShoppingBag size={14} className="inline mr-2" />
                      Move to Cart
                    </button>

                    <button
                      onClick={() => handleShare(item.product_name)}
                      className="px-4 py-2.5 border border-sand text-xs tracking-wider uppercase text-charcoal-deep hover:border-charcoal-deep transition-colors"
                    >
                      <Share2 size={14} className="inline mr-2" />
                      Share
                    </button>

                    <button
                      onClick={() => handleRemove(item.wishlist_id)}
                      className="ml-auto px-4 py-2.5 text-xs tracking-wider uppercase text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <X size={14} className="inline mr-2" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showClearAll}
        onClose={() => setShowClearAll(false)}
        onConfirm={handleClearAll}
        title="Clear Wishlist"
        message="Are you sure you want to remove all items from your wishlist? This action cannot be undone."
        confirmLabel="Clear All"
        confirmVariant="danger"
      />
    </div>
  );
}

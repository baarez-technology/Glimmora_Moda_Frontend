'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, X, Share2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import * as wishlistService from '@/services/customer-collection.service';
import type { WishlistItem } from '@/services/customer-collection.service';

export default function WishlistPage() {
  const { isAuthenticated, isHydrated } = useAuth();
  const { showToast } = useApp();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [removingId, setRemovingId] = useState<string | null>(null);

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
    if (isHydrated && isAuthenticated) {
      fetchWishlist();
    } else if (isHydrated) {
      setLoading(false);
    }
  }, [isHydrated, isAuthenticated, fetchWishlist]);

  const handleRemove = async (wishlistId: string) => {
    setRemovingId(wishlistId);
    try {
      await wishlistService.removeFromWishlist(wishlistId);
      setWishlistItems((prev) => prev.filter((item) => item.wishlist_id !== wishlistId));
      showToast('Removed from wishlist', 'info');
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
          /* Grid View */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.wishlist_id}
                className={`group ${removingId === item.wishlist_id ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <Link href={`/product/${item.product_id}`} className="relative aspect-[3/4] bg-sand/20 mb-4 overflow-hidden block">
                  {item.image_urls[0] ? (
                    <Image
                      src={item.image_urls[0]}
                      alt={item.product_name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart size={24} className="text-taupe" />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleRemove(item.wishlist_id)}
                      className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors"
                      title="Remove from wishlist"
                    >
                      <X size={18} className="text-charcoal-deep" />
                    </button>
                    <button
                      onClick={() => handleShare(item.product_name)}
                      className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-ivory-warm transition-colors"
                      title="Share"
                    >
                      <Share2 size={16} className="text-charcoal-deep" />
                    </button>
                  </div>
                </Link>

                <div className="space-y-2">
                  <Link href={`/product/${item.product_id}`}>
                    <h3 className="font-display text-base text-charcoal-deep group-hover:text-gold-muted transition-colors leading-tight line-clamp-2">
                      {item.product_name}
                    </h3>
                  </Link>
                  <p className="text-sm text-charcoal-warm">
                    €{item.price.toLocaleString()}
                  </p>

                  {/* Variants */}
                  <div className="flex gap-2">
                    {item.size && (
                      <span className="text-[10px] tracking-wider uppercase text-stone">{item.size}</span>
                    )}
                    {item.size && item.color && <span className="text-stone">·</span>}
                    {item.color && (
                      <span className="text-[10px] tracking-wider uppercase text-stone">{item.color}</span>
                    )}
                  </div>
                </div>
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
                <Link href={`/product/${item.product_id}`} className="relative w-32 h-40 bg-sand/20 flex-shrink-0 overflow-hidden">
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
                    <Link href={`/product/${item.product_id}`}>
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
    </div>
  );
}

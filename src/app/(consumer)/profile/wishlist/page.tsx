'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, X, ShoppingBag, Share2, ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToConsiderations, isInConsiderations } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleAddToBag = (item: typeof wishlist[0]) => {
    addToConsiderations(item.product);
  };

  const handleShare = async (productName: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${productName} - ModaGlimmora`,
          text: `Check out ${productName} on ModaGlimmora`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

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
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>

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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {wishlist.length === 0 ? (
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
            {wishlist.map((item) => (
              <div key={item.id} className="group">
                <Link href={`/product/${item.product.slug}`}>
                  <div className="relative aspect-[3/4] bg-sand-light mb-4 overflow-hidden">
                    <Image
                      src={item.product.images[0]?.url || ''}
                      alt={item.product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFromWishlist(item.id);
                        }}
                        className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors"
                        title="Remove from wishlist"
                      >
                        <X size={18} className="text-charcoal-deep" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleShare(item.product.name);
                        }}
                        className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-ivory-warm transition-colors"
                        title="Share"
                      >
                        <Share2 size={16} className="text-charcoal-deep" />
                      </button>
                    </div>

                    {/* Add to Bag Badge */}
                    {isInConsiderations(item.productId) && (
                      <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-green-600/90 backdrop-blur-sm rounded-sm">
                        <span className="text-xs font-semibold text-white">In Bag</span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="space-y-2">
                  <p className="text-xs text-stone tracking-wider uppercase">
                    {item.product.brandName}
                  </p>
                  <Link href={`/product/${item.product.slug}`}>
                    <h3 className="font-display text-base text-charcoal-deep group-hover:text-gold-muted transition-colors leading-tight line-clamp-2">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-charcoal-warm">
                    €{item.product.price.toLocaleString()}
                  </p>

                  {item.note && (
                    <p className="text-xs text-stone italic">"{item.note}"</p>
                  )}

                  <button
                    onClick={() => handleAddToBag(item)}
                    disabled={isInConsiderations(item.productId)}
                    className={`mt-3 w-full py-2.5 flex items-center justify-center gap-2 text-xs tracking-wider uppercase transition-all ${
                      isInConsiderations(item.productId)
                        ? 'bg-sand/50 text-stone cursor-not-allowed'
                        : 'bg-charcoal-deep text-ivory-cream hover:bg-noir'
                    }`}
                  >
                    <ShoppingBag size={14} />
                    {isInConsiderations(item.productId) ? 'In Bag' : 'Add to Bag'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="flex gap-6 bg-white border border-sand/20 p-4 hover:border-sand/40 transition-colors"
              >
                <Link
                  href={`/product/${item.product.slug}`}
                  className="relative w-32 h-40 bg-sand-light flex-shrink-0 overflow-hidden"
                >
                  <Image
                    src={item.product.images[0]?.url || ''}
                    alt={item.product.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                <div className="flex-1 flex flex-col">
                  <div className="flex-1">
                    <p className="text-xs text-stone tracking-wider uppercase mb-1">
                      {item.product.brandName}
                    </p>
                    <Link href={`/product/${item.product.slug}`}>
                      <h3 className="font-display text-xl text-charcoal-deep hover:text-gold-muted transition-colors mb-2">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-lg text-charcoal-warm mb-3">
                      €{item.product.price.toLocaleString()}
                    </p>
                    {item.note && (
                      <p className="text-sm text-stone italic">"{item.note}"</p>
                    )}
                    <p className="text-xs text-greige mt-2">
                      Added {new Date(item.addedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => handleAddToBag(item)}
                      disabled={isInConsiderations(item.productId)}
                      className={`px-6 py-2.5 flex items-center gap-2 text-xs tracking-wider uppercase transition-all ${
                        isInConsiderations(item.productId)
                          ? 'bg-sand/50 text-stone cursor-not-allowed'
                          : 'bg-charcoal-deep text-ivory-cream hover:bg-noir'
                      }`}
                    >
                      <ShoppingBag size={14} />
                      {isInConsiderations(item.productId) ? 'In Bag' : 'Add to Bag'}
                    </button>

                    <button
                      onClick={() => handleShare(item.product.name)}
                      className="px-4 py-2.5 border border-sand text-xs tracking-wider uppercase text-charcoal-deep hover:border-charcoal-deep transition-colors"
                    >
                      <Share2 size={14} className="inline mr-2" />
                      Share
                    </button>

                    <button
                      onClick={() => removeFromWishlist(item.id)}
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

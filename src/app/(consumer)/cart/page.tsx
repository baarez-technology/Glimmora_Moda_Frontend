'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, X, Minus, Plus, ShoppingBag, MapPin, Check, User, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

export default function CartPage() {
  const { considerations, removeFromConsiderations, updateQuantity, clearConsiderations } = useApp();
  const { isAuthenticated, isHydrated } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const total = considerations.reduce((sum, item) => sum + item.product.price * (item.quantity || 1), 0);
  const itemCount = considerations.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <section className="border-b border-sand/50 bg-parchment">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 py-10">
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-3">
              {itemCount} {itemCount === 1 ? 'piece' : 'pieces'} in your bag
            </span>
            <div className="flex items-center justify-between">
              <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-charcoal-deep leading-[1]">
                Shopping Bag
              </h1>
              {considerations.length > 0 && (
                <button
                  onClick={clearConsiderations}
                  className="flex items-center gap-2 text-sm text-stone hover:text-charcoal-deep transition-colors"
                >
                  <Trash2 size={14} />
                  <span className="tracking-[0.1em] uppercase">Clear All</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
          {considerations.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
              {/* Items List */}
              <div className="lg:col-span-2 space-y-0">
                {considerations.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex gap-6 md:gap-8 py-8 ${
                      index !== considerations.length - 1 ? 'border-b border-sand/50' : ''
                    }`}
                  >
                    {/* Product Image */}
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="group relative w-28 md:w-36 aspect-[3/4] overflow-hidden flex-shrink-0"
                    >
                      <Image
                        src={item.product.images[0]?.url || ''}
                        alt={item.product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 py-1">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-2">
                            {item.product.brandName}
                          </p>
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="font-display text-xl md:text-2xl text-charcoal-deep hover:text-charcoal-warm transition-colors"
                          >
                            {item.product.name}
                          </Link>
                        </div>
                        <button
                          onClick={() => removeFromConsiderations(item.id)}
                          className="w-10 h-10 flex items-center justify-center border border-sand text-taupe hover:border-charcoal-deep hover:text-charcoal-deep transition-all flex-shrink-0"
                          aria-label="Remove item"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Selected Variants */}
                      {(item.selectedVariants.size || item.selectedVariants.color) && (
                        <div className="flex gap-3 mt-4">
                          {item.selectedVariants.size && (
                            <span className="text-xs tracking-[0.1em] uppercase px-3 py-1.5 border border-sand text-stone">
                              Size: {item.selectedVariants.size}
                            </span>
                          )}
                          {item.selectedVariants.color && (
                            <span className="text-xs tracking-[0.1em] uppercase px-3 py-1.5 border border-sand text-stone">
                              Color: {item.selectedVariants.color}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Price & Quantity */}
                      <div className="flex items-center justify-between mt-6">
                        <p className="font-display text-xl text-charcoal-deep">
                          €{(item.product.price * (item.quantity || 1)).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                            disabled={(item.quantity || 1) <= 1}
                            className="w-8 h-8 flex items-center justify-center border border-sand text-stone hover:border-charcoal-deep hover:text-charcoal-deep disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-medium text-charcoal-deep w-6 text-center">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                            className="w-8 h-8 flex items-center justify-center border border-sand text-stone hover:border-charcoal-deep hover:text-charcoal-deep transition-all"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* View Details Link */}
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="group inline-flex items-center gap-2 mt-4 text-sm tracking-[0.1em] uppercase text-stone hover:text-charcoal-deep transition-colors"
                      >
                        <span>View Details</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-32 bg-charcoal-deep p-8">
                  <span className="text-[10px] tracking-[0.4em] uppercase text-gold-soft/50 block mb-6">
                    Order Summary
                  </span>

                  {/* Items Summary */}
                  <div className="space-y-3 border-b border-ivory-cream/10 pb-6 mb-6">
                    {considerations.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-taupe truncate pr-4">
                          {item.product.name}{(item.quantity || 1) > 1 ? ` ×${item.quantity}` : ''}
                        </span>
                        <span className="text-ivory-cream flex-shrink-0">
                          €{(item.product.price * (item.quantity || 1)).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Subtotals */}
                  <div className="space-y-3 border-b border-ivory-cream/10 pb-6 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-taupe">Subtotal</span>
                      <span className="text-ivory-cream">€{total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-taupe">Shipping</span>
                      <span className="text-gold-soft">Complimentary</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-end mb-10">
                    <span className="text-[10px] tracking-[0.3em] uppercase text-taupe">Total</span>
                    <span className="font-display text-3xl text-ivory-cream">
                      €{total.toLocaleString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-4">
                    {isHydrated && isAuthenticated ? (
                      <Link
                        href="/checkout"
                        className="group w-full py-4 px-6 bg-ivory-cream text-charcoal-deep flex items-center justify-center gap-3 transition-all duration-300 hover:bg-gold-soft"
                      >
                        <span className="text-sm tracking-[0.15em] uppercase">Proceed to Checkout</span>
                        <ArrowRight size={16} />
                      </Link>
                    ) : (
                      <Link
                        href="/auth/login/consumer?redirect=/checkout"
                        className="group w-full py-4 px-6 bg-ivory-cream text-charcoal-deep flex items-center justify-center gap-3 transition-all duration-300 hover:bg-gold-soft"
                      >
                        <User size={16} />
                        <span className="text-sm tracking-[0.15em] uppercase">Sign In to Purchase</span>
                      </Link>
                    )}

                    <Link
                      href="/discover"
                      className="group w-full py-4 px-6 border border-ivory-cream/30 text-ivory-cream flex items-center justify-center gap-3 transition-all duration-300 hover:border-ivory-cream hover:bg-ivory-cream hover:text-charcoal-deep"
                    >
                      <span className="text-sm tracking-[0.15em] uppercase">Continue Shopping</span>
                    </Link>
                  </div>

                  {/* Delivery Info */}
                  <div className="mt-8 pt-8 border-t border-ivory-cream/10">
                    <div className="flex items-center gap-3 text-xs text-taupe mb-3">
                      <MapPin size={14} className="text-gold-soft/60" />
                      <span>Available in your region</span>
                    </div>
                    <p className="text-xs text-taupe/60 mb-4">
                      Estimated delivery: 3-5 business days
                    </p>
                    <div className="space-y-2">
                      {['Authenticity guaranteed', 'Free returns within 30 days', 'Secure checkout'].map((text) => (
                        <div key={text} className="flex items-center gap-2 text-xs text-taupe/60">
                          <Check size={12} className="text-gold-soft/60" />
                          <span>{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="max-w-xl mx-auto text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-sand/20 rounded-full mb-6">
                <ShoppingBag size={32} className="text-stone" />
              </div>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] text-charcoal-deep leading-[1.1] mb-4">
                Your Bag is Empty
              </h2>
              <p className="text-stone mb-12 max-w-md mx-auto">
                Discover exceptional pieces from distinguished maisons and add them to your bag.
              </p>
              <Link
                href="/discover"
                className="group inline-flex items-center gap-5"
              >
                <span className="text-sm tracking-[0.2em] uppercase text-charcoal-deep">
                  Start Shopping
                </span>
                <span className="w-14 h-14 rounded-full border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep transition-all duration-500">
                  <ArrowRight size={18} className="text-charcoal-deep group-hover:text-ivory-cream transition-colors duration-500" />
                </span>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

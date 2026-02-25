'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, X, Minus, Plus, ShoppingBag, Crown, Shield, Check, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function UHNICartPage() {
  const { considerations, removeFromConsiderations, updateQuantity, clearConsiderations } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const total = considerations.reduce((sum, item) => sum + item.product.price * (item.quantity || 1), 0);
  const itemCount = considerations.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div className="min-h-screen bg-noir">
      {/* Header */}
      <section className="border-b border-gold-soft/10">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 py-10">
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Crown size={14} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft">
                {itemCount} {itemCount === 1 ? 'piece' : 'pieces'} curated
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-ivory-cream leading-[1]">
                Your Private Bag
              </h1>
              {considerations.length > 0 && (
                <button
                  onClick={clearConsiderations}
                  className="flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors"
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
                      index !== considerations.length - 1 ? 'border-b border-gold-soft/10' : ''
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
                          <p className="text-[10px] tracking-[0.3em] uppercase text-gold-soft/60 mb-2">
                            {item.product.brandName}
                          </p>
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="font-display text-xl md:text-2xl text-ivory-cream hover:text-gold-soft transition-colors"
                          >
                            {item.product.name}
                          </Link>
                        </div>
                        <button
                          onClick={() => removeFromConsiderations(item.id)}
                          className="w-10 h-10 flex items-center justify-center border border-gold-soft/20 text-sand hover:border-gold-soft hover:text-ivory-cream transition-all flex-shrink-0"
                          aria-label="Remove item"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Selected Variants */}
                      {(item.selectedVariants.size || item.selectedVariants.color) && (
                        <div className="flex gap-3 mt-4">
                          {item.selectedVariants.size && (
                            <span className="text-xs tracking-[0.1em] uppercase px-3 py-1.5 border border-gold-soft/20 text-sand">
                              Size: {item.selectedVariants.size}
                            </span>
                          )}
                          {item.selectedVariants.color && (
                            <span className="text-xs tracking-[0.1em] uppercase px-3 py-1.5 border border-gold-soft/20 text-sand">
                              Color: {item.selectedVariants.color}
                            </span>
                          )}
                        </div>
                      )}

                      {/* AGI Note */}
                      {item.agiNote && (
                        <div className="mt-4 p-3 bg-gold-soft/5 border-l-2 border-gold-soft/30">
                          <p className="text-[10px] tracking-[0.2em] uppercase text-gold-soft/60 mb-1">Concierge Note</p>
                          <p className="text-sm text-sand">{item.agiNote}</p>
                        </div>
                      )}

                      {/* Price & Quantity */}
                      <div className="flex items-center justify-between mt-6">
                        <p className="font-display text-xl text-ivory-cream">
                          €{(item.product.price * (item.quantity || 1)).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                            disabled={(item.quantity || 1) <= 1}
                            className="w-8 h-8 flex items-center justify-center border border-gold-soft/20 text-sand hover:border-gold-soft hover:text-ivory-cream disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-medium text-ivory-cream w-6 text-center">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gold-soft/20 text-sand hover:border-gold-soft hover:text-ivory-cream transition-all"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-32 bg-charcoal-deep border border-gold-soft/10 p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <Crown size={14} className="text-gold-soft" />
                    <span className="text-[10px] tracking-[0.4em] uppercase text-gold-soft/50">
                      Private Summary
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-3 border-b border-gold-soft/10 pb-6 mb-6">
                    {considerations.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-sand truncate pr-4">
                          {item.product.name}{(item.quantity || 1) > 1 ? ` ×${item.quantity}` : ''}
                        </span>
                        <span className="text-ivory-cream flex-shrink-0">
                          €{(item.product.price * (item.quantity || 1)).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Subtotals */}
                  <div className="space-y-3 border-b border-gold-soft/10 pb-6 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-sand">Subtotal</span>
                      <span className="text-ivory-cream">€{total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-sand">White-Glove Delivery</span>
                      <span className="text-gold-soft">Complimentary</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-end mb-10">
                    <span className="text-[10px] tracking-[0.3em] uppercase text-sand">Total</span>
                    <span className="font-display text-3xl text-ivory-cream">
                      €{total.toLocaleString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-4">
                    <Link
                      href="/checkout"
                      className="group w-full py-4 px-6 bg-gold-soft text-noir flex items-center justify-center gap-3 transition-all duration-300 hover:bg-gold-deep"
                    >
                      <span className="text-sm tracking-[0.15em] uppercase font-medium">Proceed to Checkout</span>
                      <ArrowRight size={16} />
                    </Link>

                    <Link
                      href="/uhni/private-shopping"
                      className="group w-full py-4 px-6 border border-gold-soft/30 text-gold-soft flex items-center justify-center gap-3 transition-all duration-300 hover:border-gold-soft hover:bg-gold-soft/10"
                    >
                      <span className="text-sm tracking-[0.15em] uppercase">Private Shopping</span>
                    </Link>
                  </div>

                  {/* Premium Trust Indicators */}
                  <div className="mt-8 pt-8 border-t border-gold-soft/10">
                    <div className="space-y-3">
                      {[
                        'White-glove delivery & presentation',
                        'Certificate of authenticity included',
                        'Personal concierge support',
                        'Discreet, secure transaction',
                      ].map((text) => (
                        <div key={text} className="flex items-center gap-2 text-xs text-sand/60">
                          <Shield size={12} className="text-gold-soft/40" />
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
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gold-soft/10 rounded-full mb-6">
                <ShoppingBag size={32} className="text-gold-soft/60" />
              </div>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1.1] mb-4">
                Your Private Bag is Empty
              </h2>
              <p className="text-sand mb-12 max-w-md mx-auto">
                Your concierge can curate selections for you, or explore private collections to find extraordinary pieces.
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
                  href="/uhni/private-collections"
                  className="inline-flex items-center gap-3 px-8 py-4 border border-gold-soft/30 text-gold-soft hover:border-gold-soft transition-colors"
                >
                  <span className="text-sm tracking-[0.15em] uppercase">Private Collections</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

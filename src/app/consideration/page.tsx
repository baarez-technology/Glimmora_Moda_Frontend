'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, X, MapPin, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function ConsiderationPage() {
  const { considerations, removeFromConsiderations } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeHover, setActiveHover] = useState<number | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const removeItem = (id: string) => {
    removeFromConsiderations(id);
  };

  const total = considerations.reduce((sum, item) => sum + item.product.price, 0);

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* ============================================
          HERO - Page Header
          ============================================ */}
      <section className="bg-charcoal-deep py-16 lg:py-24">
        <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24">
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50 block mb-4">
              {considerations.length} piece{considerations.length !== 1 ? 's' : ''} selected
            </span>
            <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-ivory-cream leading-[1] tracking-[-0.02em] mb-4">
              Considerations
            </h1>
            <p className="text-taupe max-w-lg">
              Take your time with these exceptional pieces. There's no rush — thoughtful decisions lead to lasting satisfaction.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================
          MAIN CONTENT
          ============================================ */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24">
          {considerations.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
              {/* Items List */}
              <div className="lg:col-span-2 space-y-8">
                {considerations.map((item, index) => (
                  <div
                    key={item.id}
                    className="border-b border-sand/50 pb-8 last:border-0"
                  >
                    <div className="flex gap-6 md:gap-8">
                      {/* Image */}
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
                        {/* Hover Action */}
                        <div className="absolute inset-0 flex items-center justify-center bg-noir/0 group-hover:bg-noir/20 transition-all duration-500">
                          <div className={`w-10 h-10 rounded-full bg-ivory-cream flex items-center justify-center transform transition-all duration-500 ${activeHover === index ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                            <ArrowRight size={14} className="text-charcoal-deep" />
                          </div>
                        </div>
                      </Link>

                      {/* Details */}
                      <div className="flex-1 py-2">
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
                            onClick={() => removeItem(item.id)}
                            className="w-10 h-10 flex items-center justify-center border border-sand text-taupe hover:border-charcoal-deep hover:text-charcoal-deep transition-all"
                            aria-label="Remove item"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        {/* Selected Options */}
                        {(item.selectedVariants.size || item.selectedVariants.color) && (
                          <div className="flex gap-4 mt-4 text-sm text-stone">
                            {item.selectedVariants.size && (
                              <span className="px-3 py-1 border border-sand">
                                Size: {item.selectedVariants.size}
                              </span>
                            )}
                            {item.selectedVariants.color && (
                              <span className="px-3 py-1 border border-sand">
                                Color: {item.selectedVariants.color}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Price */}
                        <p className="font-display text-xl text-charcoal-deep mt-6">
                          €{item.product.price.toLocaleString()}
                        </p>

                        {/* View Product Link */}
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="group inline-flex items-center gap-2 mt-4 text-sm tracking-[0.1em] uppercase text-stone hover:text-charcoal-deep transition-colors"
                        >
                          <span>View Details</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Style Suggestion */}
                {considerations.length > 1 && (
                  <div className="p-8 bg-parchment border-l-2 border-gold-muted">
                    <p className="text-[10px] tracking-[0.4em] uppercase text-taupe mb-4">Style Note</p>
                    <p className="text-stone leading-relaxed">
                      These pieces complement each other beautifully. The combination creates a sophisticated,
                      cohesive look that reflects timeless elegance.
                    </p>
                  </div>
                )}
              </div>

              {/* Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-32 bg-charcoal-deep p-8">
                  <span className="text-[10px] tracking-[0.4em] uppercase text-gold-soft/50 block mb-6">
                    Summary
                  </span>

                  {/* Items */}
                  <div className="space-y-4 border-b border-ivory-cream/10 pb-6 mb-6">
                    {considerations.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-taupe truncate pr-4">{item.product.name}</span>
                        <span className="text-ivory-cream flex-shrink-0">€{item.product.price.toLocaleString()}</span>
                      </div>
                    ))}
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
                    <Link
                      href="/checkout"
                      className="group w-full py-4 px-6 bg-ivory-cream text-charcoal-deep flex items-center justify-center gap-3 transition-all duration-300 hover:bg-gold-soft"
                    >
                      <span className="text-sm tracking-[0.15em] uppercase">Proceed to Purchase</span>
                      <ArrowRight size={16} />
                    </Link>

                    <Link
                      href="/discover"
                      className="group w-full py-4 px-6 border border-ivory-cream/30 text-ivory-cream flex items-center justify-center gap-3 transition-all duration-300 hover:border-ivory-cream hover:bg-ivory-cream hover:text-charcoal-deep"
                    >
                      <span className="text-sm tracking-[0.15em] uppercase">Continue Exploring</span>
                    </Link>
                  </div>

                  {/* Delivery Info */}
                  <div className="mt-8 pt-8 border-t border-ivory-cream/10">
                    <div className="flex items-center gap-3 text-sm text-taupe mb-3">
                      <MapPin size={14} className="text-gold-soft/60" />
                      <span>Available in your region</span>
                    </div>
                    <p className="text-xs text-taupe/60">
                      Estimated delivery: 3-5 business days
                    </p>
                  </div>

                  {/* Trust Indicators */}
                  <div className="mt-6 space-y-2">
                    {['Authenticity guaranteed', 'Free returns within 30 days', 'Secure checkout'].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-taupe/60">
                        <Check size={12} className="text-gold-soft/60" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="max-w-xl mx-auto text-center py-20">
              <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-6">
                Your Considerations
              </span>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] text-charcoal-deep leading-[1.1] mb-6">
                Nothing Here Yet
              </h2>
              <p className="text-stone mb-12">
                When you find pieces that interest you, add them here to consider at your leisure.
                Exceptional fashion deserves thoughtful decision-making.
              </p>
              <Link
                href="/discover"
                className="group inline-flex items-center gap-5"
              >
                <span className="text-sm tracking-[0.2em] uppercase text-charcoal-deep">
                  Start Exploring
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
      {considerations.length > 0 && (
        <section className="py-20 lg:py-28 bg-parchment">
          <div className="max-w-3xl mx-auto px-8 md:px-16 text-center">
            <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-6">
              Explore Further
            </span>
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-charcoal-deep leading-[1.1] tracking-[-0.02em] mb-8">
              Discover More Pieces
            </h2>
            <p className="text-stone mb-12 max-w-lg mx-auto">
              Continue exploring our curated selection of exceptional pieces from distinguished maisons.
            </p>
            <Link
              href="/discover"
              className="group inline-flex items-center gap-5"
            >
              <span className="text-sm tracking-[0.2em] uppercase text-charcoal-deep">
                View Collection
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

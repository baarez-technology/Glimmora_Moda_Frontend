'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Trash2, Eye, Sparkles, MapPin } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function ConsiderationPage() {
  const { considerations, removeFromConsiderations, showToast } = useApp();

  const removeItem = (id: string) => {
    removeFromConsiderations(id);
  };

  const total = considerations.reduce((sum, item) => sum + item.product.price, 0);

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-stone hover:text-charcoal-deep transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Continue Exploring
        </Link>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-charcoal-deep">
              Your Considerations
            </h1>
            <p className="text-stone mt-2">
              {considerations.length} piece{considerations.length !== 1 ? 's' : ''} you're considering
            </p>
          </div>
          {considerations.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-greige">
              <Sparkles size={16} className="text-gold-muted" />
              <span>Take your time — no rush, no pressure</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-20">
        {considerations.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-6">
              {considerations.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <div className="flex gap-6">
                    {/* Image */}
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="relative w-32 h-40 rounded-lg overflow-hidden flex-shrink-0"
                    >
                      <Image
                        src={item.product.images[0]?.url || ''}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs tracking-[0.15em] uppercase text-greige mb-1">
                            {item.product.brandName}
                          </p>
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="font-display text-xl text-charcoal-deep hover:text-gold-deep transition-colors"
                          >
                            {item.product.name}
                          </Link>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-greige hover:text-error transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Selected Options */}
                      <div className="flex gap-4 mt-3 text-sm text-stone">
                        {item.selectedVariants.size && (
                          <span>Size: {item.selectedVariants.size}</span>
                        )}
                        {item.selectedVariants.color && (
                          <span>Color: {item.selectedVariants.color}</span>
                        )}
                      </div>

                      {/* Price */}
                      <p className="font-display text-lg text-charcoal-deep mt-4">
                        €{item.product.price.toLocaleString()}
                      </p>

                      {/* AGI Note */}
                      {item.agiNote && (
                        <div className="mt-4 p-3 bg-sapphire-deep/5 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Sparkles size={14} className="text-sapphire-subtle mt-0.5" />
                            <p className="text-sm text-stone">{item.agiNote}</p>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 mt-4">
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="text-sm text-gold-muted hover:text-gold-deep flex items-center gap-1"
                        >
                          <Eye size={14} />
                          Re-visualize
                        </Link>
                        <span className="text-sand">|</span>
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="text-sm text-gold-muted hover:text-gold-deep"
                        >
                          View Story
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Outfit Suggestion */}
              <div className="bg-parchment rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <Sparkles className="w-6 h-6 text-gold-muted flex-shrink-0" />
                  <div>
                    <h3 className="font-display text-lg text-charcoal-deep mb-2">
                      AGI Outfit Suggestion
                    </h3>
                    <p className="text-stone">
                      These pieces create a sophisticated look together. The Lady Dior bag complements
                      the classic lines of the Horsebit Loafers beautifully.
                    </p>
                    <button
                      onClick={() => showToast('Outfit visualization feature coming soon', 'info')}
                      className="text-sm text-gold-muted hover:text-gold-deep mt-3 flex items-center gap-1"
                    >
                      Visualize Together
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm sticky top-32">
                <h2 className="font-display text-xl text-charcoal-deep mb-6">Summary</h2>

                {/* Items */}
                <div className="space-y-4 border-b border-sand pb-6">
                  {considerations.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-stone">{item.product.name}</span>
                      <span className="text-charcoal-deep">€{item.product.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between py-6 border-b border-sand">
                  <span className="font-medium text-charcoal-deep">Total</span>
                  <span className="font-display text-xl text-charcoal-deep">
                    €{total.toLocaleString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="space-y-3 mt-6">
                  <Link href="/checkout" className="btn-primary w-full justify-center">
                    Proceed to Purchase
                    <ArrowRight size={18} />
                  </Link>

                  <Link
                    href="/discover"
                    className="w-full text-center text-sm text-gold-muted hover:text-gold-deep py-3 block"
                  >
                    Continue Exploring
                  </Link>
                </div>

                {/* Availability */}
                <div className="mt-6 p-4 bg-parchment rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-stone">
                    <MapPin size={14} />
                    <span>Available in your region</span>
                  </div>
                  <p className="text-xs text-greige mt-2">
                    Estimated delivery: 3-5 business days
                  </p>
                </div>

                {/* Trust Note */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-greige">
                    Authenticity guaranteed • Free returns • Secure checkout
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-parchment rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles size={32} className="text-greige" />
            </div>
            <h2 className="font-display text-2xl text-charcoal-deep mb-4">
              No considerations yet
            </h2>
            <p className="text-stone max-w-md mx-auto mb-8">
              When you find pieces that interest you, add them here to consider at your leisure.
              Take your time — exceptional fashion deserves thoughtful decision-making.
            </p>
            <Link href="/discover" className="btn-primary inline-flex">
              Start Exploring
              <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

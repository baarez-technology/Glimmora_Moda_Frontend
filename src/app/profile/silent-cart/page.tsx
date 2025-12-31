'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Sparkles, ShoppingBag, Trash2, Check, Clock, Info, ChevronRight } from 'lucide-react';
import { mockSilentCart } from '@/data/mock-data';

export default function SilentCartPage() {
  const [cart, setCart] = useState(mockSilentCart);
  const [approvedItems, setApprovedItems] = useState<string[]>([]);

  const handleRemove = (productId: string) => {
    setCart({
      ...cart,
      items: cart.items.filter(item => item.productId !== productId),
      totalValue: cart.items
        .filter(item => item.productId !== productId)
        .reduce((sum, item) => sum + item.product.price, 0)
    });
  };

  const handleApprove = (productId: string) => {
    if (approvedItems.includes(productId)) {
      setApprovedItems(approvedItems.filter(id => id !== productId));
    } else {
      setApprovedItems([...approvedItems, productId]);
    }
  };

  const handleApproveAll = () => {
    if (approvedItems.length === cart.items.length) {
      setApprovedItems([]);
    } else {
      setApprovedItems(cart.items.map(item => item.productId));
    }
  };

  const approvedTotal = cart.items
    .filter(item => approvedItems.includes(item.productId))
    .reduce((sum, item) => sum + item.product.price, 0);

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-white border-b border-sand">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-12 py-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-stone hover:text-charcoal-deep transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gold-muted/20 rounded-full flex items-center justify-center">
              <Sparkles size={24} className="text-gold-deep" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl text-charcoal-deep">
                Silent Cart
              </h1>
              <p className="text-stone">Items curated by Fashion Intelligence based on your preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 lg:px-12 py-8">
        {/* AGI Explanation */}
        <div className="bg-sapphire-deep/5 rounded-xl p-5 border border-sapphire-subtle/20 mb-8">
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="text-sapphire-subtle flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-charcoal-deep mb-1">How Silent Cart Works</p>
              <p className="text-sm text-stone">{cart.agiExplanation}</p>
            </div>
          </div>
        </div>

        {cart.items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <ShoppingBag size={48} className="mx-auto text-greige mb-4" />
            <h3 className="font-display text-xl text-charcoal-deep mb-2">
              Your Silent Cart is Empty
            </h3>
            <p className="text-stone mb-6 max-w-md mx-auto">
              As you browse, I'll quietly prepare items that align with your style
              and upcoming occasions. You'll see suggestions here.
            </p>
            <Link href="/discover" className="btn-primary inline-flex">
              Start Exploring
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="p-4 border-b border-sand flex items-center justify-between">
                <p className="font-medium text-charcoal-deep">
                  {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} prepared
                </p>
                <button
                  onClick={handleApproveAll}
                  className="text-sm text-gold-muted hover:text-gold-deep"
                >
                  {approvedItems.length === cart.items.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="divide-y divide-sand">
                {cart.items.map((item) => (
                  <div key={item.productId} className="p-4 lg:p-6">
                    <div className="flex gap-4 lg:gap-6">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleApprove(item.productId)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-2 transition-colors ${
                          approvedItems.includes(item.productId)
                            ? 'border-success bg-success text-white'
                            : 'border-sand hover:border-gold-muted'
                        }`}
                      >
                        {approvedItems.includes(item.productId) && <Check size={14} />}
                      </button>

                      {/* Image */}
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="relative w-24 h-32 lg:w-32 lg:h-40 rounded-lg overflow-hidden flex-shrink-0"
                      >
                        <Image
                          src={item.product.images[0]?.url || ''}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs tracking-[0.15em] uppercase text-greige">
                          {item.product.brandName}
                        </p>
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="font-display text-lg text-charcoal-deep hover:text-gold-deep transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-stone mt-1">
                          €{item.product.price.toLocaleString()}
                        </p>

                        {/* AGI Reason */}
                        <div className="mt-3 p-3 bg-parchment rounded-lg">
                          <div className="flex items-start gap-2">
                            <Sparkles size={14} className="text-gold-muted mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-stone">{item.reason}</p>
                              {item.occasion && (
                                <p className="text-xs text-greige mt-1">For: {item.occasion}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Confidence & Expiry */}
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span className="text-stone">
                            {item.confidence}% match confidence
                          </span>
                          {item.expiresAt && (
                            <span className="flex items-center gap-1 text-greige">
                              <Clock size={14} />
                              Expires {new Date(item.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="p-2 text-stone hover:text-error transition-colors flex-shrink-0"
                        title="Remove"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-greige">Selected Items Total</p>
                  <p className="font-display text-2xl text-charcoal-deep">
                    €{approvedTotal.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-greige">Full Cart Value</p>
                  <p className="text-stone">€{cart.totalValue.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  disabled={approvedItems.length === 0}
                  className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={18} />
                  Move to Considerations ({approvedItems.length})
                </button>
                <Link
                  href="/consideration"
                  className="btn-secondary flex items-center gap-2"
                >
                  View Considerations
                  <ChevronRight size={16} />
                </Link>
              </div>

              <p className="text-xs text-greige text-center mt-4">
                Items moved to Considerations can be reviewed before purchase
              </p>
            </div>
          </>
        )}

        {/* Info Box */}
        <div className="mt-8 flex items-start gap-3 p-4 bg-parchment rounded-xl text-sm">
          <Info size={18} className="text-stone flex-shrink-0 mt-0.5" />
          <div className="text-stone">
            <p className="font-medium text-charcoal-deep mb-1">About Silent Cart</p>
            <p>
              The Silent Cart feature observes your browsing patterns, wardrobe composition,
              and upcoming events to prepare items you might love. It's designed to help,
              not pressure. Items expire after 30 days and you're always in control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

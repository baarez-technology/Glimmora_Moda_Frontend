'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Trash2, Check, Clock, Info, ChevronRight, Layers } from 'lucide-react';
import { mockSilentCart } from '@/data/mock-data';
import { useApp } from '@/context/AppContext';

export default function SilentCartPage() {
  const router = useRouter();
  const { addToConsiderations, showToast } = useApp();
  const [cart, setCart] = useState(mockSilentCart);
  const [approvedItems, setApprovedItems] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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

  const handleMoveToConsiderations = () => {
    const itemsToMove = cart.items.filter(item => approvedItems.includes(item.productId));

    if (itemsToMove.length === 0) {
      showToast('Please select items to move', 'info');
      return;
    }

    itemsToMove.forEach(item => {
      addToConsiderations(
        item.product,
        {},
        `Curated for you: ${item.reason}`
      );
    });

    setCart({
      ...cart,
      items: cart.items.filter(item => !approvedItems.includes(item.productId)),
      totalValue: cart.items
        .filter(item => !approvedItems.includes(item.productId))
        .reduce((sum, item) => sum + item.product.price, 0)
    });

    setApprovedItems([]);
    router.push('/consideration');
  };

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[1000px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>

          <div className={`flex items-center gap-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="w-14 h-14 bg-gold-soft/20 flex items-center justify-center">
              <Layers size={28} className="text-gold-soft" />
            </div>
            <div>
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70 block mb-2">
                Curated For You
              </span>
              <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
                Silent Cart
              </h1>
              <p className="text-sand mt-2">Items curated based on your preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`max-w-[1000px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* How It Works */}
        <div className="bg-parchment p-6 border border-sand mb-10">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-charcoal-deep flex items-center justify-center flex-shrink-0">
              <span className="text-ivory-cream text-sm font-medium">?</span>
            </div>
            <div>
              <p className="font-medium text-charcoal-deep mb-2">How Silent Cart Works</p>
              <p className="text-sm text-stone">{cart.agiExplanation}</p>
            </div>
          </div>
        </div>

        {cart.items.length === 0 ? (
          <div className="text-center py-20 bg-white">
            <div className="w-16 h-16 mx-auto mb-6 bg-charcoal-deep/5 flex items-center justify-center">
              <ShoppingBag size={32} className="text-charcoal-deep" />
            </div>
            <h3 className="font-display text-xl text-charcoal-deep mb-3">
              Your Silent Cart is Empty
            </h3>
            <p className="text-stone mb-8 max-w-md mx-auto">
              As you browse, we'll quietly prepare items that align with your style
              and upcoming occasions. You'll see suggestions here.
            </p>
            <Link
              href="/discover"
              className="inline-flex items-center gap-3 px-8 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-all duration-300"
            >
              <span className="text-sm tracking-[0.15em] uppercase">Start Exploring</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="bg-white overflow-hidden mb-6">
              <div className="p-6 border-b border-sand flex items-center justify-between">
                <p className="font-medium text-charcoal-deep">
                  {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} prepared
                </p>
                <button
                  onClick={handleApproveAll}
                  className="text-sm text-charcoal-deep hover:text-gold-muted transition-colors tracking-[0.1em] uppercase"
                >
                  {approvedItems.length === cart.items.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="divide-y divide-sand">
                {cart.items.map((item) => (
                  <div key={item.productId} className="p-6">
                    <div className="flex gap-6">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleApprove(item.productId)}
                        className={`w-6 h-6 border-2 flex items-center justify-center flex-shrink-0 mt-2 transition-colors ${
                          approvedItems.includes(item.productId)
                            ? 'border-charcoal-deep bg-charcoal-deep'
                            : 'border-sand hover:border-charcoal-deep'
                        }`}
                      >
                        {approvedItems.includes(item.productId) && (
                          <Check size={14} className="text-ivory-cream" />
                        )}
                      </button>

                      {/* Image */}
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="relative w-24 h-32 lg:w-32 lg:h-40 overflow-hidden flex-shrink-0"
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
                        <p className="text-[10px] tracking-[0.15em] uppercase text-taupe">
                          {item.product.brandName}
                        </p>
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="font-display text-lg text-charcoal-deep hover:text-gold-muted transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-stone mt-1">
                          €{item.product.price.toLocaleString()}
                        </p>

                        {/* Reason */}
                        <div className="mt-4 p-4 bg-parchment">
                          <p className="text-sm text-stone">{item.reason}</p>
                          {item.occasion && (
                            <p className="text-xs text-taupe mt-2">For: {item.occasion}</p>
                          )}
                        </div>

                        {/* Confidence & Expiry */}
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span className="text-stone">
                            {item.confidence}% match confidence
                          </span>
                          {item.expiresAt && (
                            <span className="flex items-center gap-1 text-taupe">
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
            <div className="bg-white p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe">Selected Items Total</p>
                  <p className="font-display text-2xl text-charcoal-deep mt-1">
                    €{approvedTotal.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe">Full Cart Value</p>
                  <p className="text-stone mt-1">€{cart.totalValue.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleMoveToConsiderations}
                  disabled={approvedItems.length === 0}
                  className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={18} />
                  <span className="text-sm tracking-[0.15em] uppercase">
                    Move to Considerations ({approvedItems.length})
                  </span>
                </button>
                <Link
                  href="/consideration"
                  className="flex items-center gap-2 px-6 py-4 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-sm tracking-[0.1em] uppercase"
                >
                  View Considerations
                  <ChevronRight size={16} />
                </Link>
              </div>

              <p className="text-xs text-taupe text-center mt-6">
                Items moved to Considerations can be reviewed before purchase
              </p>
            </div>
          </>
        )}

        {/* Info Box */}
        <div className="mt-10 flex items-start gap-4 p-6 bg-parchment border border-sand text-sm">
          <Info size={18} className="text-stone flex-shrink-0 mt-0.5" />
          <div className="text-stone">
            <p className="font-medium text-charcoal-deep mb-2">About Silent Cart</p>
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

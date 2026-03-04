'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, X, Minus, Plus, ShoppingBag, Crown, Shield, Trash2, RefreshCw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import ConfirmModal from '@/components/shared/ConfirmModal';
import * as cartService from '@/services/customer-collection.service';
import { productHref } from '@/services/customer-collection.service';
import type { CartItem } from '@/services/customer-collection.service';

export default function UHNICartPage() {
  const { showToast, refreshCart: syncHeaderCart } = useApp();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showClearAll, setShowClearAll] = useState(false);
  const [updatingQtyId, setUpdatingQtyId] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await cartService.getCart();
      setCartItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleRemove = async (cartId: string) => {
    setRemovingId(cartId);
    try {
      await cartService.removeFromCart(cartId);
      setCartItems((prev) => prev.filter((item) => item.cart_id !== cartId));
      showToast('Item removed from bag', 'info');
      syncHeaderCart();
    } catch {
      showToast('Failed to remove item', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  const handleQuantityChange = async (cartId: string, newQty: number) => {
    if (newQty < 1) return;
    const currentItem = cartItems.find((item) => item.cart_id === cartId);
    if (!currentItem) return;
    setUpdatingQtyId(cartId);
    try {
      const updated = await cartService.updateCartQuantity(cartId, newQty, currentItem);
      setCartItems((prev) => prev.map((item) => item.cart_id === cartId ? updated : item));
      syncHeaderCart();
    } catch {
      showToast('Failed to update quantity', 'error');
    } finally {
      setUpdatingQtyId(null);
    }
  };

  const handleClearAll = async () => {
    try {
      await cartService.clearAllCart();
      setCartItems([]);
      showToast('Bag cleared', 'info');
      syncHeaderCart();
    } catch {
      showToast('Failed to clear bag', 'error');
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-taupe text-sm">Loading your private bag...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Hero Header */}
      <section className="bg-charcoal-deep py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
          <Link href="/uhni" className="inline-flex items-center gap-2 text-xs tracking-wider text-sand/50 hover:text-sand transition-colors mb-8">
            ← Back to Dashboard
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Crown size={13} className="text-gold-soft" />
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/60">
                  {itemCount} {itemCount === 1 ? 'piece' : 'pieces'} ready to acquire
                </span>
              </div>
              <h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em] mb-2">
                Your Private Bag
              </h1>
              <p className="text-taupe text-sm">Review your selections before proceeding to checkout.</p>
            </div>
            <div className="flex items-center gap-4">
              {cartItems.length > 0 && (
                <button
                  onClick={() => setShowClearAll(true)}
                  className="flex items-center gap-2 text-sand/50 hover:text-red-400 transition-colors"
                  title="Clear all items"
                >
                  <Trash2 size={14} />
                  <span className="text-xs tracking-[0.1em] uppercase">Clear All</span>
                </button>
              )}
              <button
                onClick={fetchCart}
                className="flex items-center gap-2 text-sand/50 hover:text-sand transition-colors"
                title="Refresh"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 pt-6">
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchCart} className="text-red-600 underline text-xs uppercase tracking-wider">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <section className="py-12 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
          {cartItems.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
              {/* Items List */}
              <div className="lg:col-span-2 space-y-0">
                {cartItems.map((item, index) => (
                  <div
                    key={item.cart_id}
                    className={`flex gap-6 md:gap-8 py-8 ${
                      index !== cartItems.length - 1 ? 'border-b border-sand/50' : ''
                    } ${removingId === item.cart_id ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    {/* Product Image */}
                    <Link
                      href={productHref(item.product_id, item.product_name)}
                      className="group relative w-28 md:w-36 aspect-[3/4] overflow-hidden flex-shrink-0 bg-parchment"
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
                          <ShoppingBag size={24} className="text-stone" />
                        </div>
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex-1 py-1">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <Link href={productHref(item.product_id, item.product_name)}>
                            <h3 className="font-display text-xl md:text-2xl text-charcoal-deep hover:text-stone transition-colors">
                              {item.product_name}
                            </h3>
                          </Link>
                        </div>
                        <button
                          onClick={() => handleRemove(item.cart_id)}
                          disabled={removingId === item.cart_id}
                          className="w-10 h-10 flex items-center justify-center border border-sand/50 text-stone hover:border-charcoal-deep hover:text-charcoal-deep transition-all flex-shrink-0"
                          aria-label="Remove item"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Variants */}
                      <div className="flex gap-3 mt-4">
                        {item.size && (
                          <span className="text-xs tracking-[0.1em] uppercase px-3 py-1.5 border border-sand/50 text-stone">
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="text-xs tracking-[0.1em] uppercase px-3 py-1.5 border border-sand/50 text-stone">
                            Color: {item.color}
                          </span>
                        )}
                      </div>

                      {/* Price & Quantity */}
                      <div className="flex items-center justify-between mt-6">
                        <p className="font-display text-xl text-charcoal-deep">
                          €{(item.price * item.quantity).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleQuantityChange(item.cart_id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updatingQtyId === item.cart_id}
                            className="w-8 h-8 flex items-center justify-center border border-sand/50 text-stone hover:border-charcoal-deep hover:text-charcoal-deep disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-medium text-charcoal-deep w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.cart_id, item.quantity + 1)}
                            disabled={updatingQtyId === item.cart_id}
                            className="w-8 h-8 flex items-center justify-center border border-sand/50 text-stone hover:border-charcoal-deep hover:text-charcoal-deep disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
                <div className="sticky top-[108px] bg-white border border-sand/50 p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <Crown size={12} className="text-gold-soft" />
                    <span className="text-[10px] tracking-[0.4em] uppercase text-stone">
                      Private Summary
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-3 border-b border-sand/50 pb-6 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.cart_id} className="flex justify-between text-sm">
                        <span className="text-taupe truncate pr-4">
                          {item.product_name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}
                        </span>
                        <span className="text-charcoal-deep flex-shrink-0">
                          €{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Subtotals */}
                  <div className="space-y-3 border-b border-sand/50 pb-6 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-taupe">Subtotal</span>
                      <span className="text-charcoal-deep">€{total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-taupe">White-Glove Delivery</span>
                      <span className="text-gold-soft text-xs tracking-wide uppercase">Complimentary</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-end mb-8">
                    <span className="text-[10px] tracking-[0.3em] uppercase text-stone">Total</span>
                    <span className="font-display text-3xl text-charcoal-deep">
                      €{total.toLocaleString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Link
                      href="/checkout"
                      className="group w-full py-4 px-6 bg-charcoal-deep text-ivory-cream flex items-center justify-center gap-3 transition-all duration-300 hover:bg-charcoal-deep/80"
                    >
                      <span className="text-sm tracking-[0.15em] uppercase">Proceed to Checkout</span>
                      <ArrowRight size={16} />
                    </Link>

                    <Link
                      href="/uhni/private-shopping"
                      className="group w-full py-4 px-6 border border-sand/50 text-stone flex items-center justify-center gap-3 transition-all duration-300 hover:border-charcoal-deep hover:text-charcoal-deep"
                    >
                      <span className="text-sm tracking-[0.15em] uppercase">Private Shopping</span>
                    </Link>
                  </div>

                  {/* Trust Indicators */}
                  <div className="mt-8 pt-8 border-t border-sand/50">
                    <div className="space-y-3">
                      {[
                        'White-glove delivery & presentation',
                        'Certificate of authenticity included',
                        'Personal concierge support',
                        'Discreet, secure transaction',
                      ].map((text) => (
                        <div key={text} className="flex items-center gap-2 text-xs text-stone">
                          <Shield size={12} className="text-stone flex-shrink-0" />
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
              <div className="inline-flex items-center justify-center w-20 h-20 bg-parchment mb-6">
                <ShoppingBag size={32} className="text-stone" />
              </div>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] text-charcoal-deep leading-[1.1] mb-4">
                Your Private Bag is Empty
              </h2>
              <p className="text-taupe mb-10 max-w-md mx-auto">
                Your concierge can curate selections for you, or explore private collections to find extraordinary pieces.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/uhni/concierge"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-charcoal-deep text-ivory-cream hover:bg-charcoal-deep/80 transition-colors"
                >
                  <Crown size={14} className="text-gold-soft" />
                  <span className="text-sm tracking-[0.15em] uppercase">Ask Concierge</span>
                </Link>
                <Link
                  href="/uhni/private-collections"
                  className="inline-flex items-center gap-3 px-8 py-4 border border-sand/50 text-charcoal-deep hover:border-charcoal-deep transition-colors"
                >
                  <span className="text-sm tracking-[0.15em] uppercase">Private Collections</span>
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
        title="Clear Private Bag"
        message="Are you sure you want to remove all items from your private bag? This action cannot be undone."
        confirmLabel="Clear All"
        confirmVariant="danger"
      />
    </div>
  );
}

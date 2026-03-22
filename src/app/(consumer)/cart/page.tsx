'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, X, Minus, Plus, ShoppingBag, MapPin, Check, User, Trash2, RefreshCw } from 'lucide-react';
import { formatPrice, getCurrencySymbol } from '@/lib/currency';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import ConfirmModal from '@/components/shared/ConfirmModal';
import * as cartService from '@/services/customer-collection.service';
import { productHref } from '@/services/customer-collection.service';
import type { CartItem } from '@/services/customer-collection.service';

export default function CartPage() {
  const { isAuthenticated, isHydrated } = useAuth();
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
    if (isHydrated && isAuthenticated) {
      fetchCart();
    } else if (isHydrated) {
      setLoading(false);
    }
  }, [isHydrated, isAuthenticated, fetchCart]);

  const handleRemove = async (cartId: string) => {
    setRemovingId(cartId);
    try {
      await cartService.removeFromCart(cartId);
      setCartItems((prev) => prev.filter((item) => item.cart_id !== cartId));
      showToast('Item removed from cart', 'info');
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
      showToast('Cart cleared', 'info');
      syncHeaderCart();
    } catch {
      showToast('Failed to clear cart', 'error');
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading your bag...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <section className="border-b border-sand/50 bg-parchment">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 py-10">
          <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-3">
            {itemCount} {itemCount === 1 ? 'piece' : 'pieces'} in your bag
          </span>
          <div className="flex items-center justify-between">
            <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-charcoal-deep leading-[1]">
              Shopping Bag
            </h1>
            <div className="flex items-center gap-4">
              {cartItems.length > 0 && (
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
                onClick={fetchCart}
                className="flex items-center gap-2 text-sm text-stone hover:text-charcoal-deep transition-colors"
                title="Refresh cart"
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
            <button onClick={fetchCart} className="text-red-800 underline text-xs uppercase tracking-wider">
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
                      className="group relative w-28 md:w-36 aspect-[3/4] overflow-hidden flex-shrink-0 bg-sand/20"
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
                          <ShoppingBag size={24} className="text-taupe" />
                        </div>
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex-1 py-1">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <Link href={productHref(item.product_id, item.product_name)}>
                            <h3 className="font-display text-xl md:text-2xl text-charcoal-deep hover:text-charcoal-warm transition-colors">
                              {item.product_name}
                            </h3>
                          </Link>
                        </div>
                        <button
                          onClick={() => handleRemove(item.cart_id)}
                          disabled={removingId === item.cart_id}
                          className="w-10 h-10 flex items-center justify-center border border-sand text-taupe hover:border-charcoal-deep hover:text-charcoal-deep transition-all flex-shrink-0"
                          aria-label="Remove item"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Variants */}
                      <div className="flex gap-3 mt-4">
                        {item.size && (
                          <span className="text-xs tracking-[0.1em] uppercase px-3 py-1.5 border border-sand text-stone">
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="text-xs tracking-[0.1em] uppercase px-3 py-1.5 border border-sand text-stone">
                            Color: {item.color}
                          </span>
                        )}
                      </div>

                      {/* Price & Quantity */}
                      <div className="flex items-center justify-between mt-6">
                        <p className="font-display text-xl text-charcoal-deep">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleQuantityChange(item.cart_id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updatingQtyId === item.cart_id}
                            className="w-8 h-8 flex items-center justify-center border border-sand text-stone hover:border-charcoal-deep hover:text-charcoal-deep disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
                            className="w-8 h-8 flex items-center justify-center border border-sand text-stone hover:border-charcoal-deep hover:text-charcoal-deep disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
                <div className="sticky top-32 bg-charcoal-deep p-8">
                  <span className="text-[10px] tracking-[0.4em] uppercase text-gold-soft/50 block mb-6">
                    Order Summary
                  </span>

                  {/* Items Summary */}
                  <div className="space-y-3 border-b border-ivory-cream/10 pb-6 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.cart_id} className="flex justify-between text-sm">
                        <span className="text-taupe truncate pr-4">
                          {item.product_name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}
                        </span>
                        <span className="text-ivory-cream flex-shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Subtotals */}
                  <div className="space-y-3 border-b border-ivory-cream/10 pb-6 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-taupe">Subtotal</span>
                      <span className="text-ivory-cream">{formatPrice(total)}</span>
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
                      {formatPrice(total)}
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
                        href="/auth/login/consumer?redirect=/cart"
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

      <ConfirmModal
        isOpen={showClearAll}
        onClose={() => setShowClearAll(false)}
        onConfirm={handleClearAll}
        title="Clear Shopping Bag"
        message="Are you sure you want to remove all items from your shopping bag? This action cannot be undone."
        confirmLabel="Clear All"
        confirmVariant="danger"
      />
    </div>
  );
}

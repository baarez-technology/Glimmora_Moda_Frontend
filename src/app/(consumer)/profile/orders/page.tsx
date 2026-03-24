'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Truck, Check, ChevronRight, Clock, Star, RotateCcw, X } from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import * as orderManagementService from '@/services/order-management.service';
import { createReturnOrder, getMyReturnOrders, type ApiReturnOrder } from '@/services/return-order.service';
import { createReview, getMyReviews, type ApiReview } from '@/services/review.service';
import type { CustomerOrder } from '@/services/order-management.service';

const RETURN_REASONS = [
  { value: 'wrong_size', label: 'Wrong size' },
  { value: 'defective', label: 'Defective / damaged' },
  { value: 'not_as_described', label: 'Not as described' },
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'other', label: 'Other' },
];

export default function OrdersPage() {
  const { isAuthenticated, isHydrated } = useAuth();
  const { showToast } = useApp();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [returnModal, setReturnModal] = useState<{ order: CustomerOrder; product: CustomerOrder['products'][0] } | null>(null);
  const [returnReason, setReturnReason] = useState('wrong_size');
  const [returnDetails, setReturnDetails] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [myReturnOrders, setMyReturnOrders] = useState<ApiReturnOrder[]>([]);

  // Review state
  const [reviewModal, setReviewModal] = useState<{ order: CustomerOrder; product: CustomerOrder['products'][0] } | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [myReviews, setMyReviews] = useState<ApiReview[]>([]);

  useEffect(() => {
    getMyReviews().then(setMyReviews).catch(() => {});
    getMyReturnOrders().then(setMyReturnOrders).catch(() => {});
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await orderManagementService.getOrders();
      setOrders(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load orders', 'error');
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, [showToast]);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      fetchOrders();
    }
  }, [isHydrated, isAuthenticated, fetchOrders]);

  // Derive overall order status from per-product statuses
  const getOrderStatus = (order: CustomerOrder): string => {
    const statuses = order.products.map(p => p.delivery_status).filter(Boolean);
    if (!statuses.length) return 'pending';
    if (statuses.every(s => s === 'delivered')) return 'delivered';
    if (statuses.some(s => s === 'shipped')) return 'shipped';
    if (statuses.some(s => s === 'processing')) return 'processing';
    if (statuses.some(s => s === 'cancelled')) return 'cancelled';
    return statuses[0];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Check size={16} className="text-success" />;
      case 'shipped':
        return <Truck size={16} className="text-charcoal-deep" />;
      case 'processing':
        return <Clock size={16} className="text-gold-muted" />;
      case 'confirmed':
        return <Package size={16} className="text-success" />;
      default:
        return <Package size={16} className="text-stone" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'shipped': return 'Shipped';
      case 'processing': return 'Processing';
      case 'confirmed': return 'Confirmed';
      case 'cancelled': return 'Cancelled';
      default: return 'Pending';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => formatPrice(amount, currency);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>

          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70 block mb-4">
              Your Purchases
            </span>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              Order History
            </h1>
            {!isLoading && (
              <p className="text-sand mt-4">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Loading */}
        {isLoading && (
          <div className="space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="bg-white overflow-hidden animate-pulse">
                <div className="p-6 border-b border-sand">
                  <div className="h-4 bg-sand/30 rounded w-32 mb-2" />
                  <div className="h-3 bg-sand/20 rounded w-48" />
                </div>
                <div className="p-6 flex gap-4">
                  <div className="w-20 h-24 bg-sand/30 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-sand/20 rounded w-20" />
                    <div className="h-4 bg-sand/30 rounded w-40" />
                    <div className="h-3 bg-sand/20 rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.order_id} className="bg-white overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-sand">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe">Order #{order.order_id}</p>
                  <p className="text-sm text-stone mt-1">Placed on {formatDate(order.order_date)}</p>
                </div>

                {/* Order Items */}
                <div className="p-6 space-y-4">
                  {order.products.map((product, idx) => (
                    <div key={`${product.product_id}-${idx}`} className="flex gap-4">
                      <div className="relative w-20 h-24 overflow-hidden flex-shrink-0 bg-parchment">
                        {product.product_image ? (
                          <Image
                            src={product.product_image}
                            alt={product.product_name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={24} className="text-stone/40" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] tracking-[0.15em] uppercase text-taupe">
                          {product.sku}
                        </p>
                        <h3 className="font-display text-lg text-charcoal-deep">
                          {product.product_name}
                        </h3>
                        <p className="text-sm text-stone mt-1">
                          {product.size && `Size: ${product.size}`}
                          {product.size && product.color && ' | '}
                          {product.color && `Color: ${product.color}`}
                          {(product.size || product.color) && ' | '}
                          Qty: {product.quantity}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm text-charcoal-deep">
                            {formatCurrency(product.product_price, product.currency || order.payment_currency)}
                          </p>
                          <div className="flex items-center gap-3">
                            {product.delivery_status && (
                              <span className={`flex items-center gap-1 text-xs ${
                                product.delivery_status === 'delivered' ? 'text-success' :
                                product.delivery_status === 'shipped' ? 'text-charcoal-deep' :
                                product.delivery_status === 'cancelled' ? 'text-error' : 'text-stone'
                              }`}>
                                {getStatusIcon(product.delivery_status)}
                                {getStatusLabel(product.delivery_status)}
                              </span>
                            )}
                            {product.delivery_status === 'delivered' && (() => {
                              const reviewed = myReviews.find(r => r.order_id === order.order_id && r.product_id === product.product_id);
                              return reviewed ? (
                                <span className="flex items-center gap-1 text-xs text-gold-deep tracking-[0.1em] uppercase">
                                  {[1,2,3,4,5].map(s => (
                                    <Star key={s} size={10} className={s <= reviewed.rating ? 'fill-gold-muted text-gold-muted' : 'text-sand'} />
                                  ))}
                                  Reviewed
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setReviewModal({ order, product });
                                    setReviewRating(0);
                                    setReviewHover(0);
                                    setReviewTitle('');
                                    setReviewContent('');
                                  }}
                                  className="flex items-center gap-1 text-xs text-gold-deep hover:text-gold-muted transition-colors tracking-[0.1em] uppercase"
                                >
                                  <Star size={12} />
                                  Rate
                                </button>
                              );
                            })()}
                            {product.delivery_status === 'delivered' && (() => {
                              const ret = myReturnOrders.find(r => r.order_id === order.order_id && r.product_id === product.product_id);
                              return !ret ? (
                                <button
                                  onClick={() => setReturnModal({ order, product })}
                                  className="flex items-center gap-1 text-xs text-stone hover:text-charcoal-deep transition-colors tracking-[0.1em] uppercase"
                                >
                                  <RotateCcw size={12} />
                                  Return
                                </button>
                              ) : (
                                <span className={`flex items-center gap-1 text-xs tracking-[0.1em] uppercase ${
                                  ret.status === 'accepted' ? 'text-success' :
                                  ret.status === 'declined' ? 'text-error' :
                                  'text-gold-deep'
                                }`}>
                                  <RotateCcw size={12} />
                                  Return {ret.status}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-parchment">
                  <div>
                    {getOrderStatus(order) === 'delivered' ? (
                      <p className="text-sm text-stone">
                        Delivered{order.products.find(p => p.delivery_date)?.delivery_date
                          ? ` on ${formatDate(order.products.find(p => p.delivery_date)!.delivery_date)}`
                          : ''}
                      </p>
                    ) : (
                      <p className="text-sm text-stone">
                        {order.delivery_method && `${order.delivery_method} delivery`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-display text-lg text-charcoal-deep">
                      Total: {formatCurrency(order.payment_amount, order.payment_currency)}
                    </span>
                    <Link
                      href={`/profile/orders/${order.order_id}`}
                      className="flex items-center gap-1 text-sm text-charcoal-deep hover:text-gold-muted transition-colors tracking-[0.1em] uppercase"
                    >
                      View Details
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && orders.length === 0 && (
          <div className="text-center py-20 bg-white">
            <div className="w-16 h-16 mx-auto mb-6 bg-charcoal-deep/5 flex items-center justify-center">
              <Package size={32} className="text-charcoal-deep" />
            </div>
            <h3 className="font-display text-xl text-charcoal-deep mb-3">
              No orders yet
            </h3>
            <p className="text-stone mb-8 max-w-md mx-auto">
              When you make a purchase, your orders will appear here.
            </p>
            <Link
              href="/discover"
              className="inline-flex items-center gap-3 px-8 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-all duration-300"
            >
              <span className="text-sm tracking-[0.15em] uppercase">Start Exploring</span>
            </Link>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-charcoal-deep/60 flex items-center justify-center z-50 p-4" onClick={() => setReviewModal(null)}>
          <div className="bg-white max-w-md w-full p-8" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-charcoal-deep">Write a Review</h3>
              <button onClick={() => setReviewModal(null)} className="p-2 hover:bg-sand/20 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6 p-4 bg-parchment/50">
              {reviewModal.product.product_image && (
                <Image src={reviewModal.product.product_image} alt={reviewModal.product.product_name} width={48} height={64} className="object-cover" />
              )}
              <div>
                <p className="text-sm font-medium text-charcoal-deep">{reviewModal.product.product_name}</p>
                <p className="text-xs text-stone">Order #{reviewModal.order.order_id}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">Your Rating *</label>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setReviewHover(star)}
                      onMouseLeave={() => setReviewHover(0)}
                      onClick={() => setReviewRating(star)}
                      className="p-0.5"
                    >
                      <Star
                        size={28}
                        className={`transition-colors ${star <= (reviewHover || reviewRating) ? 'fill-gold-muted text-gold-muted' : 'text-sand fill-transparent'}`}
                      />
                    </button>
                  ))}
                  {reviewRating > 0 && (
                    <span className="ml-2 text-sm text-stone">
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewRating]}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">Review Title</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={e => setReviewTitle(e.target.value)}
                  placeholder="Summarise your experience..."
                  className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">Review</label>
                <textarea
                  value={reviewContent}
                  onChange={e => setReviewContent(e.target.value)}
                  rows={4}
                  placeholder="Share your thoughts on quality, fit, and style..."
                  className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setReviewModal(null)}
                className="flex-1 px-6 py-3 border border-sand text-stone text-sm tracking-[0.1em] uppercase hover:border-charcoal-deep transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (reviewRating === 0) { showToast('Please select a star rating', 'error'); return; }
                  setSubmittingReview(true);
                  try {
                    const review = await createReview({
                      order_id: reviewModal.order.order_id,
                      product_id: reviewModal.product.product_id,
                      rating: reviewRating,
                      review_title: reviewTitle,
                      review_description: reviewContent,
                    });
                    setMyReviews(prev => [...prev, review]);
                    showToast('Thank you for your review!', 'success');
                    setReviewModal(null);
                  } catch (err) {
                    showToast(err instanceof Error ? err.message : 'Failed to submit review', 'error');
                  } finally {
                    setSubmittingReview(false);
                  }
                }}
                disabled={submittingReview || reviewRating === 0}
                className="flex-1 px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] uppercase hover:bg-noir transition-colors disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Request Modal */}
      {returnModal && (
        <div className="fixed inset-0 bg-charcoal-deep/60 flex items-center justify-center z-50 p-4" onClick={() => setReturnModal(null)}>
          <div className="bg-white max-w-md w-full p-8" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-charcoal-deep">Request Return</h3>
              <button onClick={() => setReturnModal(null)} className="p-2 hover:bg-sand/20 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6 p-4 bg-parchment/50">
              {returnModal.product.product_image && (
                <Image src={returnModal.product.product_image} alt={returnModal.product.product_name} width={48} height={48} className="object-cover" />
              )}
              <div>
                <p className="text-sm font-medium text-charcoal-deep">{returnModal.product.product_name}</p>
                <p className="text-xs text-stone">Order #{returnModal.order.order_id}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">Reason for return *</label>
                <select
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep transition-colors"
                >
                  {RETURN_REASONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">Additional details</label>
                <textarea
                  value={returnDetails}
                  onChange={e => setReturnDetails(e.target.value)}
                  rows={3}
                  placeholder="Describe the issue..."
                  className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe resize-none"
                />
              </div>

              <p className="text-xs text-taupe">
                Your return request will be reviewed by the brand. You&apos;ll be notified once it&apos;s approved or if additional information is needed.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setReturnModal(null)}
                className="flex-1 px-6 py-3 border border-sand text-stone text-sm tracking-[0.1em] uppercase hover:border-charcoal-deep transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setSubmittingReturn(true);
                  try {
                    const ret = await createReturnOrder({
                      order_id: returnModal.order.order_id,
                      product_id: returnModal.product.product_id,
                      reason_for_return: returnReason,
                      details: returnDetails || undefined,
                    });
                    setMyReturnOrders(prev => [...prev, ret]);
                    showToast('Return request submitted. The brand will review it shortly.', 'success');
                    setReturnModal(null);
                    setReturnReason('wrong_size');
                    setReturnDetails('');
                  } catch (err) {
                    showToast(err instanceof Error ? err.message : 'Failed to submit return request', 'error');
                  } finally {
                    setSubmittingReturn(false);
                  }
                }}
                disabled={submittingReturn}
                className="flex-1 px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] uppercase hover:bg-noir transition-colors disabled:opacity-50"
              >
                {submittingReturn ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

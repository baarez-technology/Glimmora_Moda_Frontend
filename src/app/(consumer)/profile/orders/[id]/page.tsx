'use client';

import { use, useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Truck, Check, Clock, MapPin, CreditCard, HelpCircle, Printer, RotateCcw, X, FileText, Star } from 'lucide-react';
import InvoiceDocument, { generateInvoiceNumber, printInvoice, downloadInvoice } from '@/components/shared/InvoiceDocument';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import * as orderManagementService from '@/services/order-management.service';
import type { CustomerOrder } from '@/services/order-management.service';
import { formatPrice } from '@/lib/currency';
import { createReview, getMyReviews, type ApiReview } from '@/services/review.service';
import { createReturnOrder, getMyReturnOrders, type ApiReturnOrder } from '@/services/return-order.service';

const RETURN_REASONS = [
  { value: 'wrong_size', label: 'Wrong size' },
  { value: 'defective', label: 'Defective / damaged' },
  { value: 'not_as_described', label: 'Not as described' },
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'other', label: 'Other' },
];

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

// Generate timeline based on delivery status
function generateTimeline(order: CustomerOrder) {
  const orderDate = new Date(order.order_date);
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentIndex = statusOrder.indexOf(order.delivery_status);

  const timeline = [
    {
      status: 'Order Placed',
      date: formatDate(orderDate),
      time: formatTime(orderDate),
      completed: currentIndex >= 0
    },
    {
      status: 'Payment Confirmed',
      date: formatDate(orderDate),
      time: formatTime(new Date(orderDate.getTime() + 2 * 60000)),
      completed: order.payment_status === 'paid' || order.payment_status === 'completed' || currentIndex >= 1
    },
    {
      status: 'Processing',
      date: currentIndex >= 2 ? formatDate(new Date(orderDate.getTime() + 24 * 60 * 60000)) : '',
      time: currentIndex >= 2 ? '09:00' : '',
      completed: currentIndex >= 2
    },
    {
      status: 'Shipped',
      date: currentIndex >= 3 ? formatDate(new Date(orderDate.getTime() + 2 * 24 * 60 * 60000)) : '',
      time: currentIndex >= 3 ? '14:30' : '',
      completed: currentIndex >= 3
    },
    {
      status: 'Out for Delivery',
      date: currentIndex >= 4 && order.delivery_date ? formatDate(new Date(order.delivery_date)) : '',
      time: currentIndex >= 4 ? '08:00' : '',
      completed: currentIndex >= 4
    },
    {
      status: 'Delivered',
      date: currentIndex >= 4 && order.delivery_date ? formatDate(new Date(order.delivery_date)) : '',
      time: currentIndex >= 4 ? '14:15' : '',
      completed: currentIndex >= 4
    }
  ];

  return timeline;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useApp();
  const { isAuthenticated, isHydrated } = useAuth();
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [selectedReturnItems, setSelectedReturnItems] = useState<string[]>([]);

  // Per-product review state
  const [reviewModal, setReviewModal] = useState<CustomerOrder['products'][0] | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [myReviews, setMyReviews] = useState<ApiReview[]>([]);

  // Per-product return state
  const [productReturnModal, setProductReturnModal] = useState<CustomerOrder['products'][0] | null>(null);
  const [returnReason, setReturnReason] = useState('wrong_size');
  const [returnDetails, setReturnDetails] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [myReturnOrders, setMyReturnOrders] = useState<ApiReturnOrder[]>([]);

  useEffect(() => {
    getMyReviews().then(setMyReviews).catch(() => {});
    getMyReturnOrders().then(setMyReturnOrders).catch(() => {});
  }, []);

  const fetchOrder = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await orderManagementService.getOrderById(id);
      setOrder(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load order', 'error');
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, [id, showToast]);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      fetchOrder();
    }
  }, [isHydrated, isAuthenticated, fetchOrder]);

  // ESC key handler to close whichever modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showTracking) setShowTracking(false);
        else if (showInvoice) setShowInvoice(false);
        else if (showReturnModal) setShowReturnModal(false);
        else if (showSupportModal) setShowSupportModal(false);
      }
    };
    if (showTracking || showInvoice || showReturnModal || showSupportModal || reviewModal || productReturnModal) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showTracking, showInvoice, showReturnModal, showSupportModal]);

  const timeline = useMemo(() => {
    if (!order) return [];
    return generateTimeline(order);
  }, [order]);

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => formatPrice(amount, currency);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-success bg-success/10';
      case 'shipped': return 'text-charcoal-deep bg-charcoal-deep/10';
      case 'processing': return 'text-gold-muted bg-gold-muted/10';
      default: return 'text-stone bg-parchment';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <Check size={18} />;
      case 'shipped': return <Truck size={18} />;
      default: return <Package size={18} />;
    }
  };

  // Loading state
  if (!isHydrated || !isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="text-stone/40 mx-auto mb-4" />
          <h2 className="font-display text-xl text-charcoal-deep mb-2">Order not found</h2>
          <p className="text-sm text-stone mb-6">This order doesn't exist or doesn't belong to you.</p>
          <Link href="/profile/orders" className="text-sm tracking-[0.1em] uppercase text-charcoal-deep hover:text-gold-muted transition-colors">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const currency = order.payment_currency || 'INR';

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/profile/orders"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </Link>

          <div className={`flex flex-wrap items-start justify-between gap-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div>
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70 block mb-4">
                Order Details
              </span>
              <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
                #{order.order_id}
              </h1>
              <p className="text-sand mt-3">Placed on {formatDisplayDate(order.order_date)}</p>
            </div>
            <div className={`flex items-center gap-2 px-5 py-3 ${getStatusColor(order.delivery_status)}`}>
              {getStatusIcon(order.delivery_status)}
              <span className="font-medium capitalize text-sm tracking-[0.1em] uppercase">{order.delivery_status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <div className="bg-white p-8">
              <h2 className="font-display text-xl text-charcoal-deep mb-8">Items</h2>
              <div className="space-y-6">
                {order.products.map((product, idx) => (
                  <div key={`${product.product_id}-${idx}`} className="flex gap-4">
                    <div className="relative w-24 h-32 overflow-hidden flex-shrink-0 bg-parchment">
                      {product.product_image ? (
                        <Image
                          src={product.product_image}
                          alt={product.product_name}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
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
                      <p className="font-display text-lg text-charcoal-deep">
                        {product.product_name}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm text-stone">
                        {product.size && <span>Size: {product.size}</span>}
                        {product.color && <span>Color: {product.color}</span>}
                        <span>Qty: {product.quantity}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-charcoal-deep font-medium">
                          {formatCurrency(product.product_price, currency)}
                        </p>
                        {product.delivery_status && (
                          <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 ${
                            product.delivery_status === 'delivered' ? 'bg-success/10 text-success' :
                            product.delivery_status === 'shipped' ? 'bg-charcoal-deep/10 text-charcoal-deep' :
                            product.delivery_status === 'processing' ? 'bg-gold-muted/10 text-gold-muted' :
                            product.delivery_status === 'cancelled' ? 'bg-error/10 text-error' :
                            'bg-parchment text-stone'
                          }`}>
                            {product.delivery_status === 'delivered' && <Check size={12} />}
                            {product.delivery_status === 'shipped' && <Truck size={12} />}
                            {product.delivery_status === 'processing' && <Clock size={12} />}
                            {!['delivered','shipped','processing','cancelled'].includes(product.delivery_status) && <Package size={12} />}
                            {product.delivery_status.charAt(0).toUpperCase() + product.delivery_status.slice(1)}
                          </span>
                        )}
                      </div>
                      {product.delivery_tracking_number && (
                        <p className="text-xs text-stone mt-1">Tracking: {product.delivery_tracking_number}</p>
                      )}
                      {product.delivery_status === 'delivered' && (
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-sand">
                          {/* Review button / reviewed state */}
                          {(() => {
                            const reviewed = myReviews.find(r => order && r.order_id === order.order_id && r.product_id === product.product_id);
                            return reviewed ? (
                              <span className="flex items-center gap-1 text-xs text-gold-deep tracking-[0.1em] uppercase">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} size={10} className={s <= reviewed.rating ? 'fill-gold-muted text-gold-muted' : 'text-sand'} />
                                ))}
                                Reviewed
                              </span>
                            ) : (
                              <button
                                onClick={() => { setReviewModal(product); setReviewRating(0); setReviewHover(0); setReviewTitle(''); setReviewContent(''); }}
                                className="flex items-center gap-1.5 text-xs text-gold-deep hover:text-gold-muted transition-colors tracking-[0.1em] uppercase"
                              >
                                <Star size={13} />
                                Write Review
                              </button>
                            );
                          })()}
                          {/* Return button / return status */}
                          {order && (() => {
                            const ret = myReturnOrders.find(r => r.order_id === order.order_id && r.product_id === product.product_id);
                            return ret ? (
                              <span className={`flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase ${ret.status === 'accepted' ? 'text-success' : ret.status === 'declined' ? 'text-error' : 'text-stone'}`}>
                                <RotateCcw size={13} />
                                Return {ret.status}
                              </span>
                            ) : (
                              <button
                                onClick={() => { setProductReturnModal(product); setReturnReason('wrong_size'); setReturnDetails(''); }}
                                className="flex items-center gap-1.5 text-xs text-stone hover:text-charcoal-deep transition-colors tracking-[0.1em] uppercase"
                              >
                                <RotateCcw size={13} />
                                Return
                              </button>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white p-8">
              <h2 className="font-display text-xl text-charcoal-deep mb-8">Need Help?</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  onClick={() => setShowInvoice(true)}
                  className="flex items-center gap-3 p-5 border border-sand hover:border-charcoal-deep transition-colors"
                >
                  <FileText size={20} className="text-stone" />
                  <span className="text-sm text-charcoal-deep">View Invoice</span>
                </button>
                <button
                  onClick={() => setShowSupportModal(true)}
                  className="flex items-center gap-3 p-5 border border-sand hover:border-charcoal-deep transition-colors"
                >
                  <HelpCircle size={20} className="text-stone" />
                  <span className="text-sm text-charcoal-deep">Get Support</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white p-8">
              <h2 className="font-display text-xl text-charcoal-deep mb-8">Order Summary</h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone">Subtotal</span>
                  <span className="text-charcoal-deep">
                    {formatCurrency(order.payment_amount - order.payment_tax - order.payment_shipping, currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone">Shipping</span>
                  <span className="text-charcoal-deep">
                    {order.payment_shipping === 0 ? 'Complimentary' : formatCurrency(order.payment_shipping, currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone">Tax</span>
                  <span className="text-charcoal-deep">
                    {order.payment_tax === 0 ? 'Included' : formatCurrency(order.payment_tax, currency)}
                  </span>
                </div>
                <div className="flex justify-between pt-4 border-t border-sand">
                  <span className="font-medium text-charcoal-deep">Total</span>
                  <span className="font-display text-xl text-charcoal-deep">
                    {formatCurrency(order.payment_amount, currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-8">
              <div className="flex items-center gap-2 mb-6">
                <MapPin size={18} className="text-stone" />
                <h2 className="font-display text-lg text-charcoal-deep">Shipping Address</h2>
              </div>
              {order.delivery_tag && (
                <p className="text-xs tracking-[0.1em] uppercase text-taupe mb-2">{order.delivery_tag}</p>
              )}
              <p className="text-sm text-stone">{order.delivery_address}</p>
              <p className="text-sm text-stone">{order.delivery_city}{order.delivery_postal_code ? `, ${order.delivery_postal_code}` : ''}</p>
              <p className="text-sm text-stone">{order.delivery_country}</p>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-8">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard size={18} className="text-stone" />
                <h2 className="font-display text-lg text-charcoal-deep">Payment</h2>
              </div>
              <p className="text-sm text-stone capitalize">{order.payment_method || 'Card'}</p>
              <p className="text-sm text-stone mt-1">
                Status: <span className="capitalize">{order.payment_status}</span>
              </p>
              {order.payment_date && (
                <p className="text-sm text-stone mt-1">
                  Paid on {formatDisplayDate(order.payment_date)}
                </p>
              )}
            </div>

            {/* Delivery Info */}
            {order.delivery_status === 'delivered' && order.delivery_date ? (
              <div className="bg-success/5 p-8 border border-success/20">
                <p className="text-[10px] tracking-[0.2em] uppercase text-success mb-2">Delivered On</p>
                <p className="font-display text-lg text-charcoal-deep">{formatDisplayDate(order.delivery_date)}</p>
              </div>
            ) : order.delivery_method ? (
              <div className="bg-parchment p-8 border border-sand">
                <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Delivery Method</p>
                <p className="font-display text-lg text-charcoal-deep capitalize">{order.delivery_method}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Tracking Timeline Modal */}
      {showTracking && (
        <div className="fixed inset-0 bg-charcoal-deep/60 flex items-center justify-center z-50 p-4" onClick={() => setShowTracking(false)}>
          <div className="bg-white max-w-lg w-full p-8 max-h-[80vh] overflow-y-auto" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-charcoal-deep">Tracking Timeline</h3>
              <button onClick={() => setShowTracking(false)} className="p-2 hover:bg-sand/20 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="mb-4 p-4 bg-parchment">
              <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Tracking Number</p>
              <p className="font-mono text-charcoal-deep">{order.delivery_tracking_number}</p>
            </div>
            <div className="space-y-0">
              {timeline.map((step, index) => (
                <div key={index} className="flex gap-4 pb-5 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 flex items-center justify-center ${step.completed ? 'bg-charcoal-deep text-ivory-cream' : 'bg-sand text-taupe'}`}>
                      {step.completed ? <Check size={14} /> : <div className="w-2 h-2 bg-taupe" />}
                    </div>
                    {index < timeline.length - 1 && <div className={`w-0.5 flex-1 mt-1 ${step.completed ? 'bg-charcoal-deep' : 'bg-sand'}`} />}
                  </div>
                  <div>
                    <p className={`font-medium ${step.completed ? 'text-charcoal-deep' : 'text-taupe'}`}>{step.status}</p>
                    {step.date && <p className="text-sm text-stone">{step.date} at {step.time}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoice && order && (
        <div className="fixed inset-0 bg-charcoal-deep/60 flex items-center justify-center z-50 p-4" onClick={() => setShowInvoice(false)}>
          <div className="bg-white max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-charcoal-deep">Invoice</h3>
              <button onClick={() => setShowInvoice(false)} className="p-2 hover:bg-sand/20 transition-colors">
                <X size={18} />
              </button>
            </div>

            <InvoiceDocument
              invoiceNumber={generateInvoiceNumber(order.order_id, order.order_date)}
              invoiceDate={order.order_date}
              orderType="standard"
              brandName="ModaGlimmora"
              buyerName={order.customer_name}
              buyerEmail={order.customer_email}
              buyerAddress={`${order.delivery_address}, ${order.delivery_city}, ${order.delivery_country}`}
              items={order.products.map(product => ({
                description: product.product_name,
                detail: [
                  product.size ? `Size: ${product.size}` : '',
                  product.color ? `Color: ${product.color}` : '',
                ].filter(Boolean).join(' · '),
                quantity: product.quantity,
                unitPrice: product.product_price,
                currency: currency,
              }))}
              subtotal={order.payment_amount - order.payment_tax - order.payment_shipping}
              shippingAmount={order.payment_shipping}
              taxRate={order.payment_tax > 0 ? 0.20 : 0}
              taxAmount={order.payment_tax}
              total={order.payment_amount}
              currency={currency}
              paymentStatus={order.payment_status === 'paid' || order.payment_status === 'completed' ? 'paid' : 'pending'}
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={printInvoice}
                className="flex-1 px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-charcoal-deep/80 transition-colors text-sm tracking-[0.15em] uppercase flex items-center justify-center gap-2"
              >
                <Printer size={16} />
                Print Invoice
              </button>
              <button
                onClick={() => downloadInvoice(`order-${order.order_id}.pdf`)}
                className="flex-1 px-6 py-3 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-sm tracking-[0.15em] uppercase flex items-center justify-center gap-2"
              >
                <FileText size={16} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Items Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-charcoal-deep/60 flex items-center justify-center z-50 p-4" onClick={() => setShowReturnModal(false)}>
          <div className="bg-white max-w-md w-full p-8" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-charcoal-deep">Return Items</h3>
              <button onClick={() => setShowReturnModal(false)} className="p-2 hover:bg-sand/20 transition-colors">
                <X size={18} />
              </button>
            </div>
            <p className="text-stone text-sm mb-4">
              Select items you would like to return. Returns are accepted within 30 days of delivery.
            </p>
            <div className="space-y-3 mb-6">
              {order.products.map((product, idx) => {
                const itemKey = `${product.product_id}-${idx}`;
                return (
                  <label key={itemKey} className={`flex items-center gap-3 p-3 border cursor-pointer hover:border-charcoal-deep transition-colors ${selectedReturnItems.includes(itemKey) ? 'border-charcoal-deep bg-parchment' : 'border-sand'}`}>
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-charcoal-deep"
                      checked={selectedReturnItems.includes(itemKey)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedReturnItems(prev => [...prev, itemKey]);
                        } else {
                          setSelectedReturnItems(prev => prev.filter(k => k !== itemKey));
                        }
                      }}
                    />
                    <span className="text-sm text-charcoal-deep">{product.product_name}</span>
                    <span className="text-xs text-stone ml-auto">{formatCurrency(product.product_price, currency)}</span>
                  </label>
                );
              })}
            </div>
            <button
              onClick={() => {
                if (selectedReturnItems.length === 0) {
                  showToast('Please select at least one item to return', 'error');
                  return;
                }
                const count = selectedReturnItems.length;
                setShowReturnModal(false);
                setSelectedReturnItems([]);
                showToast(`Return request submitted for ${count} item${count > 1 ? 's' : ''}. We'll be in touch shortly.`, 'success');
              }}
              disabled={selectedReturnItems.length === 0}
              className="w-full px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.15em] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Return Request{selectedReturnItems.length > 0 ? ` (${selectedReturnItems.length})` : ''}
            </button>
          </div>
        </div>
      )}

      {/* Per-product Review Modal */}
      {reviewModal && order && (
        <div className="fixed inset-0 bg-charcoal-deep/60 flex items-center justify-center z-50 p-4" onClick={() => setReviewModal(null)}>
          <div className="bg-white max-w-md w-full p-8" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-charcoal-deep">Write a Review</h3>
              <button onClick={() => setReviewModal(null)} className="p-2 hover:bg-sand/20 transition-colors"><X size={18} /></button>
            </div>
            <div className="flex items-center gap-4 mb-6 p-4 bg-parchment/50">
              {reviewModal.product_image && (
                <Image src={reviewModal.product_image} alt={reviewModal.product_name} width={48} height={64} className="object-cover" />
              )}
              <div>
                <p className="text-sm font-medium text-charcoal-deep">{reviewModal.product_name}</p>
                <p className="text-xs text-stone">Order #{order.order_id}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">Your Rating *</label>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} type="button" onMouseEnter={() => setReviewHover(star)} onMouseLeave={() => setReviewHover(0)} onClick={() => setReviewRating(star)} className="p-0.5">
                      <Star size={28} className={`transition-colors ${star <= (reviewHover || reviewRating) ? 'fill-gold-muted text-gold-muted' : 'text-sand fill-transparent'}`} />
                    </button>
                  ))}
                  {reviewRating > 0 && <span className="ml-2 text-sm text-stone">{['','Poor','Fair','Good','Very Good','Excellent'][reviewRating]}</span>}
                </div>
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">Review Title</label>
                <input type="text" value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} placeholder="Summarise your experience..." className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe" />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">Review</label>
                <textarea value={reviewContent} onChange={e => setReviewContent(e.target.value)} rows={4} placeholder="Share your thoughts on quality, fit, and style..." className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setReviewModal(null)} className="flex-1 px-6 py-3 border border-sand text-stone text-sm tracking-[0.1em] uppercase hover:border-charcoal-deep transition-colors">Cancel</button>
              <button
                onClick={async () => {
                  if (reviewRating === 0) { showToast('Please select a star rating', 'error'); return; }
                  setSubmittingReview(true);
                  try {
                    const review = await createReview({ order_id: order.order_id, product_id: reviewModal.product_id, rating: reviewRating, review_title: reviewTitle, review_description: reviewContent });
                    setMyReviews(prev => [...prev, review]);
                    showToast('Thank you for your review!', 'success');
                    setReviewModal(null);
                  } catch (err) { showToast(err instanceof Error ? err.message : 'Failed to submit review', 'error'); }
                  finally { setSubmittingReview(false); }
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

      {/* Per-product Return Modal */}
      {productReturnModal && order && (
        <div className="fixed inset-0 bg-charcoal-deep/60 flex items-center justify-center z-50 p-4" onClick={() => setProductReturnModal(null)}>
          <div className="bg-white max-w-md w-full p-8" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-charcoal-deep">Request Return</h3>
              <button onClick={() => setProductReturnModal(null)} className="p-2 hover:bg-sand/20 transition-colors"><X size={18} /></button>
            </div>
            <div className="flex items-center gap-4 mb-6 p-4 bg-parchment/50">
              {productReturnModal.product_image && (
                <Image src={productReturnModal.product_image} alt={productReturnModal.product_name} width={48} height={64} className="object-cover" />
              )}
              <div>
                <p className="text-sm font-medium text-charcoal-deep">{productReturnModal.product_name}</p>
                <p className="text-xs text-stone">Order #{order.order_id}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">Reason for return *</label>
                <select value={returnReason} onChange={e => setReturnReason(e.target.value)} className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep">
                  {RETURN_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">Additional details</label>
                <textarea value={returnDetails} onChange={e => setReturnDetails(e.target.value)} rows={3} placeholder="Describe the issue..." className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe resize-none" />
              </div>
              <p className="text-xs text-taupe">Your return request will be reviewed by the brand. You&apos;ll be notified once it&apos;s approved.</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setProductReturnModal(null)} className="flex-1 px-6 py-3 border border-sand text-stone text-sm tracking-[0.1em] uppercase hover:border-charcoal-deep transition-colors">Cancel</button>
              <button
                onClick={async () => {
                  setSubmittingReturn(true);
                  try {
                    const ret = await createReturnOrder({ order_id: order.order_id, product_id: productReturnModal.product_id, reason_for_return: returnReason, details: returnDetails || undefined });
                    setMyReturnOrders(prev => [...prev, ret]);
                    showToast('Return request submitted. The brand will review it shortly.', 'success');
                    setProductReturnModal(null);
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

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-charcoal-deep/60 flex items-center justify-center z-50 p-4" onClick={() => setShowSupportModal(false)}>
          <div className="bg-white max-w-md w-full p-8" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-charcoal-deep">Get Support</h3>
              <button onClick={() => setShowSupportModal(false)} className="p-2 hover:bg-sand/20 transition-colors">
                <X size={18} />
              </button>
            </div>
            <p className="text-stone text-sm mb-6">
              How can we help you with order #{order.order_id}?
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowSupportModal(false);
                  const ticketId = `TK-${Date.now().toString(36).toUpperCase()}`;
                  showToast(`Support ticket ${ticketId} created for order #${order.order_id}. We'll respond within 24 hours.`, 'success');
                }}
                className="w-full flex items-center gap-3 p-4 border border-sand hover:border-charcoal-deep transition-colors text-left"
              >
                <HelpCircle size={20} className="text-stone" />
                <div>
                  <p className="text-sm font-medium text-charcoal-deep">Submit Support Ticket</p>
                  <p className="text-xs text-stone">We'll respond within 24 hours</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

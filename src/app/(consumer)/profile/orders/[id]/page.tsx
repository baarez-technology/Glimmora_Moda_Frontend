'use client';

import { use, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Truck, Check, MapPin, CreditCard, HelpCircle, Printer, RotateCcw, X, MessageCircle, FileText } from 'lucide-react';
import InvoiceDocument, { generateInvoiceNumber, printInvoice } from '@/components/shared/InvoiceDocument';
import { useApp } from '@/context/AppContext';
import { notFound, useRouter } from 'next/navigation';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}


// Generate timeline based on order status
function generateTimeline(order: { status: string; createdAt: string; estimatedDelivery: string }) {
  const orderDate = new Date(order.createdAt);
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const statusOrder = ['confirmed', 'processing', 'shipped', 'delivered'];
  const currentIndex = statusOrder.indexOf(order.status);

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
      completed: currentIndex >= 0
    },
    {
      status: 'Processing',
      date: currentIndex >= 1 ? formatDate(new Date(orderDate.getTime() + 24 * 60 * 60000)) : '',
      time: currentIndex >= 1 ? '09:00' : '',
      completed: currentIndex >= 1
    },
    {
      status: 'Shipped',
      date: currentIndex >= 2 ? formatDate(new Date(orderDate.getTime() + 2 * 24 * 60 * 60000)) : '',
      time: currentIndex >= 2 ? '14:30' : '',
      completed: currentIndex >= 2
    },
    {
      status: 'Out for Delivery',
      date: currentIndex >= 3 ? formatDate(new Date(order.estimatedDelivery)) : '',
      time: currentIndex >= 3 ? '08:00' : '',
      completed: currentIndex >= 3
    },
    {
      status: 'Delivered',
      date: currentIndex >= 3 ? formatDate(new Date(order.estimatedDelivery)) : '',
      time: currentIndex >= 3 ? '14:15' : '',
      completed: currentIndex >= 3
    }
  ];

  return timeline;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { orders, showToast } = useApp();
  const order = orders.find(o => o.id === id);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [selectedReturnItems, setSelectedReturnItems] = useState<string[]>([]);
  const [trackingNumber, setTrackingNumber] = useState<string>('');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Persist tracking number in localStorage
  useEffect(() => {
    if (!id) return;
    const storageKey = `moda-tracking-${id}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setTrackingNumber(stored);
    } else {
      const generated = `DHL${id.replace('MG-', '').replace('-', '')}FR`;
      localStorage.setItem(storageKey, generated);
      setTrackingNumber(generated);
    }
  }, [id]);

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
    if (showTracking || showInvoice || showReturnModal || showSupportModal) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showTracking, showInvoice, showReturnModal, showSupportModal]);

  // Generate timeline based on order status
  const timeline = useMemo(() => {
    if (!order) return [];
    return generateTimeline(order);
  }, [order]);

  // Calculate order totals
  const subtotal = order?.total || 0;
  const shipping = 0; // Complimentary
  const tax = 0; // Included

  if (!order) {
    notFound();
  }

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-success bg-success/10';
      case 'shipped':
        return 'text-charcoal-deep bg-charcoal-deep/10';
      case 'processing':
        return 'text-gold-muted bg-gold-muted/10';
      default:
        return 'text-stone bg-parchment';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Check size={18} />;
      case 'shipped':
        return <Truck size={18} />;
      default:
        return <Package size={18} />;
    }
  };

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
                #{order.id}
              </h1>
              <p className="text-sand mt-3">Placed on {formatDisplayDate(order.createdAt)}</p>
            </div>
            <div className={`flex items-center gap-2 px-5 py-3 ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="font-medium capitalize text-sm tracking-[0.1em] uppercase">{order.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Timeline */}
            <div className="bg-white p-8">
              <h2 className="font-display text-xl text-charcoal-deep mb-8">Order Timeline</h2>
              <div className="relative">
                {timeline.map((step, index) => (
                  <div key={index} className="flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 flex items-center justify-center ${
                        step.completed ? 'bg-charcoal-deep text-ivory-cream' : 'bg-sand text-taupe'
                      }`}>
                        {step.completed ? <Check size={14} /> : <div className="w-2 h-2 bg-taupe" />}
                      </div>
                      {index < timeline.length - 1 && (
                        <div className={`w-0.5 flex-1 mt-2 ${
                          step.completed ? 'bg-charcoal-deep' : 'bg-sand'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className={`font-medium ${step.completed ? 'text-charcoal-deep' : 'text-taupe'}`}>
                        {step.status}
                      </p>
                      {step.date && (
                        <p className="text-sm text-stone">
                          {step.date} at {step.time}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {(order.status === 'shipped' || order.status === 'delivered') && (
                <div className="mt-8 pt-8 border-t border-sand">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-taupe">Tracking Number</p>
                      <p className="font-mono text-charcoal-deep mt-1">
                        {order.trackingNumber || trackingNumber}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowTracking(!showTracking)}
                      className="text-sm text-charcoal-deep hover:text-gold-muted transition-colors tracking-[0.1em] uppercase"
                    >
                      {showTracking ? 'Hide Tracking' : 'Track Package'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white p-8">
              <h2 className="font-display text-xl text-charcoal-deep mb-8">Items</h2>
              <div className="space-y-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="relative w-24 h-32 overflow-hidden flex-shrink-0"
                    >
                      <Image
                        src={item.product.images[0]?.url || ''}
                        alt={item.product.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    <div className="flex-1">
                      <p className="text-[10px] tracking-[0.15em] uppercase text-taupe">
                        {item.product.brandName}
                      </p>
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="font-display text-lg text-charcoal-deep hover:text-gold-muted transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <div className="flex gap-4 mt-2 text-sm text-stone">
                        {item.selectedVariants?.size && <span>Size: {item.selectedVariants.size}</span>}
                        {item.selectedVariants?.color && <span>Color: {item.selectedVariants.color}</span>}
                        <span>Qty: 1</span>
                      </div>
                      <p className="mt-2 text-charcoal-deep font-medium">
                        €{item.product.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white p-8">
              <h2 className="font-display text-xl text-charcoal-deep mb-8">Need Help?</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowInvoice(true)}
                  className="flex items-center gap-3 p-5 border border-sand hover:border-charcoal-deep transition-colors"
                >
                  <FileText size={20} className="text-stone" />
                  <span className="text-sm text-charcoal-deep">View Invoice</span>
                </button>
                <button
                  onClick={() => {
                    if (order.status === 'delivered') {
                      setShowReturnModal(true);
                    } else {
                      showToast('Returns available after delivery', 'info');
                    }
                  }}
                  className="flex items-center gap-3 p-5 border border-sand hover:border-charcoal-deep transition-colors"
                >
                  <RotateCcw size={20} className="text-stone" />
                  <span className="text-sm text-charcoal-deep">Return Items</span>
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
                  <span className="text-charcoal-deep">€{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone">Shipping</span>
                  <span className="text-charcoal-deep">{shipping === 0 ? 'Complimentary' : `€${shipping}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone">Tax</span>
                  <span className="text-charcoal-deep">{tax === 0 ? 'Included' : `€${tax}`}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-sand">
                  <span className="font-medium text-charcoal-deep">Total</span>
                  <span className="font-display text-xl text-charcoal-deep">€{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-8">
              <div className="flex items-center gap-2 mb-6">
                <MapPin size={18} className="text-stone" />
                <h2 className="font-display text-lg text-charcoal-deep">Shipping Address</h2>
              </div>
              <p className="text-sm text-stone">Address on file</p>
              <Link href="/profile/addresses" className="text-xs text-charcoal-deep hover:text-gold-muted transition-colors mt-2 inline-block tracking-[0.1em] uppercase">
                Manage Addresses
              </Link>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-8">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard size={18} className="text-stone" />
                <h2 className="font-display text-lg text-charcoal-deep">Payment Method</h2>
              </div>
              <p className="text-sm text-stone">Payment method on file</p>
            </div>

            {/* Delivery Info */}
            {order.status !== 'delivered' && order.estimatedDelivery && (
              <div className="bg-parchment p-8 border border-sand">
                <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Estimated Delivery</p>
                <p className="font-display text-lg text-charcoal-deep">{formatDisplayDate(order.estimatedDelivery)}</p>
              </div>
            )}

            {order.status === 'delivered' && (
              <div className="bg-success/5 p-8 border border-success/20">
                <p className="text-[10px] tracking-[0.2em] uppercase text-success mb-2">Delivered On</p>
                <p className="font-display text-lg text-charcoal-deep">{formatDisplayDate(order.estimatedDelivery)}</p>
              </div>
            )}
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
              <p className="font-mono text-charcoal-deep">{order.trackingNumber || trackingNumber}</p>
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
              invoiceNumber={generateInvoiceNumber(order.id, order.createdAt)}
              invoiceDate={order.createdAt}
              orderType="standard"
              brandName={order.items[0]?.product.brandName || 'ModaGlimmora'}
              buyerName={order.customerName || 'Valued Client'}
              buyerEmail={order.customerEmail || ''}
              buyerAddress={order.shippingAddress || ''}
              items={order.items.map(item => ({
                description: item.product.name,
                detail: [
                  item.selectedVariants?.size ? `Size: ${item.selectedVariants.size}` : '',
                  item.selectedVariants?.color ? `Color: ${item.selectedVariants.color}` : '',
                ].filter(Boolean).join(' · '),
                quantity: item.quantity || 1,
                unitPrice: item.product.price,
                currency: 'EUR',
              }))}
              subtotal={order.total}
              shippingAmount={0}
              taxRate={0.20}
              taxAmount={Math.round(order.total * 0.20 / 1.20)}
              total={order.total}
              currency="EUR"
              paymentStatus="paid"
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
                onClick={() => {
                  printInvoice();
                  showToast("Use 'Save as PDF' in the print dialog to download", 'info');
                }}
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
              {order.items.map(item => (
                <label key={item.id} className={`flex items-center gap-3 p-3 border cursor-pointer hover:border-charcoal-deep transition-colors ${selectedReturnItems.includes(item.id) ? 'border-charcoal-deep bg-parchment' : 'border-sand'}`}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-charcoal-deep"
                    checked={selectedReturnItems.includes(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedReturnItems(prev => [...prev, item.id]);
                      } else {
                        setSelectedReturnItems(prev => prev.filter(id => id !== item.id));
                      }
                    }}
                  />
                  <span className="text-sm text-charcoal-deep">{item.product.name}</span>
                  <span className="text-xs text-stone ml-auto">EUR {item.product.price.toLocaleString()}</span>
                </label>
              ))}
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
              How can we help you with order #{order.id}?
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowSupportModal(false);
                  router.push('/concierge');
                }}
                className="w-full flex items-center gap-3 p-4 border border-sand hover:border-charcoal-deep transition-colors text-left"
              >
                <MessageCircle size={20} className="text-stone" />
                <div>
                  <p className="text-sm font-medium text-charcoal-deep">Chat with AGI Concierge</p>
                  <p className="text-xs text-stone">Get instant help from our AI assistant</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowSupportModal(false);
                  const ticketId = `TK-${Date.now().toString(36).toUpperCase()}`;
                  showToast(`Support ticket ${ticketId} created for order #${order.id}. We'll respond within 24 hours.`, 'success');
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

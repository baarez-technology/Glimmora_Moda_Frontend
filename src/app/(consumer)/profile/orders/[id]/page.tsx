'use client';

import { use, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Truck, Check, MapPin, CreditCard, HelpCircle, Download, RotateCcw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { notFound } from 'next/navigation';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

// Default shipping address (in a real app, this would come from user profile or order data)
const defaultShippingAddress = {
  fullName: 'Sophia Chen',
  line1: '15 Rue de la Paix',
  line2: 'Apartment 4B',
  city: 'Paris',
  state: 'Île-de-France',
  postalCode: '75002',
  country: 'France',
  phone: '+33 1 42 86 82 82'
};

// Default payment method
const defaultPaymentMethod = {
  type: 'card',
  last4: '4242',
  brand: 'Visa'
};

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
  const { orders } = useApp();
  const order = orders.find(o => o.id === id);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
                        {order.trackingNumber || `DHL${order.id.replace('MG-', '').replace('-', '')}FR`}
                      </p>
                    </div>
                    <button className="text-sm text-charcoal-deep hover:text-gold-muted transition-colors tracking-[0.1em] uppercase">
                      Track Package
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
                <button className="flex items-center gap-3 p-5 border border-sand hover:border-charcoal-deep transition-colors">
                  <Download size={20} className="text-stone" />
                  <span className="text-sm text-charcoal-deep">Download Invoice</span>
                </button>
                <button className="flex items-center gap-3 p-5 border border-sand hover:border-charcoal-deep transition-colors">
                  <RotateCcw size={20} className="text-stone" />
                  <span className="text-sm text-charcoal-deep">Return Items</span>
                </button>
                <button className="flex items-center gap-3 p-5 border border-sand hover:border-charcoal-deep transition-colors">
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
              <div className="text-sm text-stone space-y-1">
                <p className="font-medium text-charcoal-deep">{defaultShippingAddress.fullName}</p>
                <p>{defaultShippingAddress.line1}</p>
                {defaultShippingAddress.line2 && <p>{defaultShippingAddress.line2}</p>}
                <p>{defaultShippingAddress.city}, {defaultShippingAddress.postalCode}</p>
                <p>{defaultShippingAddress.country}</p>
                <p className="pt-2">{defaultShippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-8">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard size={18} className="text-stone" />
                <h2 className="font-display text-lg text-charcoal-deep">Payment Method</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-parchment flex items-center justify-center">
                  <span className="text-xs font-bold text-charcoal-deep">{defaultPaymentMethod.brand}</span>
                </div>
                <span className="text-sm text-stone">•••• {defaultPaymentMethod.last4}</span>
              </div>
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
    </div>
  );
}

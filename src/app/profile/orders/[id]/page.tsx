'use client';

import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Truck, Check, MapPin, CreditCard, HelpCircle, Download, RotateCcw } from 'lucide-react';
import { products } from '@/data/mock-data';
import { notFound } from 'next/navigation';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

// Mock order data - in real app this would come from API
const mockOrders = [
  {
    id: 'MG-2024-78432',
    date: '2024-12-20',
    status: 'delivered',
    total: 4900,
    subtotal: 4900,
    shipping: 0,
    tax: 0,
    items: [
      { product: products[0], quantity: 1, size: 'Small', color: 'Black', price: 4900 }
    ],
    estimatedDelivery: '2024-12-25',
    deliveredDate: '2024-12-24',
    shippingAddress: {
      fullName: 'Alexandra Chen',
      line1: '15 Rue de la Paix',
      line2: 'Apartment 4B',
      city: 'Paris',
      state: 'Île-de-France',
      postalCode: '75002',
      country: 'France',
      phone: '+33 1 42 86 82 82'
    },
    paymentMethod: {
      type: 'card',
      last4: '4242',
      brand: 'Visa'
    },
    timeline: [
      { status: 'Order Placed', date: '2024-12-20', time: '14:30', completed: true },
      { status: 'Payment Confirmed', date: '2024-12-20', time: '14:32', completed: true },
      { status: 'Processing', date: '2024-12-21', time: '09:00', completed: true },
      { status: 'Shipped', date: '2024-12-22', time: '11:45', completed: true },
      { status: 'Out for Delivery', date: '2024-12-24', time: '08:30', completed: true },
      { status: 'Delivered', date: '2024-12-24', time: '14:15', completed: true }
    ],
    trackingNumber: 'DHL789456123FR'
  },
  {
    id: 'MG-2024-76521',
    date: '2024-12-15',
    status: 'shipped',
    total: 3200,
    subtotal: 3200,
    shipping: 0,
    tax: 0,
    items: [
      { product: products[1], quantity: 1, size: 'FR 38', color: 'Ivory', price: 3200 }
    ],
    estimatedDelivery: '2024-12-30',
    shippingAddress: {
      fullName: 'Alexandra Chen',
      line1: '15 Rue de la Paix',
      line2: 'Apartment 4B',
      city: 'Paris',
      state: 'Île-de-France',
      postalCode: '75002',
      country: 'France',
      phone: '+33 1 42 86 82 82'
    },
    paymentMethod: {
      type: 'card',
      last4: '8888',
      brand: 'Mastercard'
    },
    timeline: [
      { status: 'Order Placed', date: '2024-12-15', time: '10:20', completed: true },
      { status: 'Payment Confirmed', date: '2024-12-15', time: '10:22', completed: true },
      { status: 'Processing', date: '2024-12-16', time: '09:00', completed: true },
      { status: 'Shipped', date: '2024-12-18', time: '15:30', completed: true },
      { status: 'In Transit', date: '2024-12-20', time: '12:00', completed: true },
      { status: 'Out for Delivery', date: '', time: '', completed: false },
      { status: 'Delivered', date: '', time: '', completed: false }
    ],
    trackingNumber: 'DHL123456789FR'
  }
];

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);
  const order = mockOrders.find(o => o.id === id);

  if (!order) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-success bg-success/10';
      case 'shipped':
        return 'text-info bg-info/10';
      case 'processing':
        return 'text-warning bg-warning/10';
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
      <div className="bg-white border-b border-sand">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-8">
          <Link
            href="/profile/orders"
            className="inline-flex items-center gap-2 text-sm text-stone hover:text-charcoal-deep transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl text-charcoal-deep">
                Order #{order.id}
              </h1>
              <p className="text-stone mt-1">Placed on {order.date}</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="font-medium capitalize">{order.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-display text-xl text-charcoal-deep mb-6">Order Timeline</h2>
              <div className="relative">
                {order.timeline.map((step, index) => (
                  <div key={index} className="flex gap-4 pb-6 last:pb-0">
                    {/* Timeline Line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-success text-white' : 'bg-sand text-greige'
                      }`}>
                        {step.completed ? <Check size={16} /> : <div className="w-2 h-2 bg-greige rounded-full" />}
                      </div>
                      {index < order.timeline.length - 1 && (
                        <div className={`w-0.5 flex-1 mt-2 ${
                          step.completed ? 'bg-success' : 'bg-sand'
                        }`} />
                      )}
                    </div>
                    {/* Timeline Content */}
                    <div className="flex-1 pb-2">
                      <p className={`font-medium ${step.completed ? 'text-charcoal-deep' : 'text-greige'}`}>
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

              {/* Tracking Number */}
              {order.trackingNumber && (
                <div className="mt-6 pt-6 border-t border-sand">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-greige">Tracking Number</p>
                      <p className="font-mono text-charcoal-deep">{order.trackingNumber}</p>
                    </div>
                    <button className="text-sm text-gold-muted hover:text-gold-deep">
                      Track Package
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-display text-xl text-charcoal-deep mb-6">Items</h2>
              <div className="space-y-6">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="relative w-24 h-32 rounded-lg overflow-hidden flex-shrink-0"
                    >
                      <Image
                        src={item.product.images[0]?.url || ''}
                        alt={item.product.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    <div className="flex-1">
                      <p className="text-xs tracking-[0.15em] uppercase text-greige">
                        {item.product.brandName}
                      </p>
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="font-display text-lg text-charcoal-deep hover:text-gold-deep transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <div className="flex gap-4 mt-2 text-sm text-stone">
                        <span>Size: {item.size}</span>
                        <span>Color: {item.color}</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                      <p className="mt-2 text-charcoal-deep font-medium">
                        €{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-display text-xl text-charcoal-deep mb-6">Need Help?</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <button className="flex items-center gap-3 p-4 border border-sand rounded-lg hover:border-gold-muted transition-colors">
                  <Download size={20} className="text-stone" />
                  <span className="text-sm text-charcoal-deep">Download Invoice</span>
                </button>
                <button className="flex items-center gap-3 p-4 border border-sand rounded-lg hover:border-gold-muted transition-colors">
                  <RotateCcw size={20} className="text-stone" />
                  <span className="text-sm text-charcoal-deep">Return Items</span>
                </button>
                <button className="flex items-center gap-3 p-4 border border-sand rounded-lg hover:border-gold-muted transition-colors">
                  <HelpCircle size={20} className="text-stone" />
                  <span className="text-sm text-charcoal-deep">Get Support</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-display text-xl text-charcoal-deep mb-6">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone">Subtotal</span>
                  <span className="text-charcoal-deep">€{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone">Shipping</span>
                  <span className="text-charcoal-deep">{order.shipping === 0 ? 'Complimentary' : `€${order.shipping}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone">Tax</span>
                  <span className="text-charcoal-deep">{order.tax === 0 ? 'Included' : `€${order.tax}`}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-sand">
                  <span className="font-medium text-charcoal-deep">Total</span>
                  <span className="font-display text-xl text-charcoal-deep">€{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={18} className="text-stone" />
                <h2 className="font-display text-lg text-charcoal-deep">Shipping Address</h2>
              </div>
              <div className="text-sm text-stone space-y-1">
                <p className="font-medium text-charcoal-deep">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
                <p className="pt-2">{order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={18} className="text-stone" />
                <h2 className="font-display text-lg text-charcoal-deep">Payment Method</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-parchment rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-charcoal-deep">{order.paymentMethod.brand}</span>
                </div>
                <span className="text-sm text-stone">•••• {order.paymentMethod.last4}</span>
              </div>
            </div>

            {/* Delivery Info */}
            {order.status !== 'delivered' && order.estimatedDelivery && (
              <div className="bg-sapphire-deep/5 rounded-xl p-6 border border-sapphire-subtle/20">
                <p className="text-sm text-sapphire-mist mb-1">Estimated Delivery</p>
                <p className="font-display text-lg text-charcoal-deep">{order.estimatedDelivery}</p>
              </div>
            )}

            {order.status === 'delivered' && order.deliveredDate && (
              <div className="bg-success/5 rounded-xl p-6 border border-success/20">
                <p className="text-sm text-success mb-1">Delivered On</p>
                <p className="font-display text-lg text-charcoal-deep">{order.deliveredDate}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

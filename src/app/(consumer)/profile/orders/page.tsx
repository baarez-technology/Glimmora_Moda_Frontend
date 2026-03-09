'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Truck, Check, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import * as orderManagementService from '@/services/order-management.service';
import type { CustomerOrder } from '@/services/order-management.service';

export default function OrdersPage() {
  const { isAuthenticated, isHydrated } = useAuth();
  const { showToast } = useApp();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

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

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
    return `${symbol}${amount.toLocaleString()}`;
  };

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
                <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-sand">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe">Order #{order.order_id}</p>
                    <p className="text-sm text-stone mt-1">Placed on {formatDate(order.order_date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.delivery_status)}
                    <span className={`text-sm font-medium ${
                      order.delivery_status === 'delivered' ? 'text-success' :
                      order.delivery_status === 'shipped' ? 'text-charcoal-deep' :
                      order.delivery_status === 'confirmed' ? 'text-success' : 'text-stone'
                    }`}>
                      {getStatusLabel(order.delivery_status)}
                    </span>
                  </div>
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
                        <p className="text-sm text-charcoal-deep mt-2">
                          {formatCurrency(product.product_price, order.payment_currency)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-parchment">
                  <div>
                    {order.delivery_status === 'delivered' ? (
                      <p className="text-sm text-stone">
                        Delivered{order.delivery_date ? ` on ${formatDate(order.delivery_date)}` : ''}
                      </p>
                    ) : (
                      <p className="text-sm text-stone">
                        {order.delivery_method && `${order.delivery_method} delivery`}
                        {order.delivery_tracking_number && ` · Tracking: ${order.delivery_tracking_number}`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-6">
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
    </div>
  );
}

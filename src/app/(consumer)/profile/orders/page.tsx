'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Truck, Check, ChevronRight, Clock } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function OrdersPage() {
  const { orders } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
      case 'delivered':
        return 'Delivered';
      case 'shipped':
        return 'Shipped';
      case 'processing':
        return 'Processing';
      case 'confirmed':
        return 'Confirmed';
      default:
        return 'Pending';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
            <p className="text-sand mt-4">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white overflow-hidden">
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-sand">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe">Order #{order.id}</p>
                    <p className="text-sm text-stone mt-1">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className={`text-sm font-medium ${
                      order.status === 'delivered' ? 'text-success' :
                      order.status === 'shipped' ? 'text-charcoal-deep' :
                      order.status === 'confirmed' ? 'text-success' : 'text-stone'
                    }`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6 space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="relative w-20 h-24 overflow-hidden flex-shrink-0"
                      >
                        <Image
                          src={item.product.images[0]?.url || ''}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </Link>
                      <div className="flex-1">
                        <p className="text-[10px] tracking-[0.15em] uppercase text-taupe">
                          {item.product.brandName}
                        </p>
                        <Link href={`/product/${item.product.slug}`}>
                          <h3 className="font-display text-lg text-charcoal-deep hover:text-gold-muted transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>
                        {item.selectedVariants && (
                          <p className="text-sm text-stone mt-1">
                            {item.selectedVariants.size && `Size: ${item.selectedVariants.size}`}
                            {item.selectedVariants.size && item.selectedVariants.color && ' | '}
                            {item.selectedVariants.color && `Color: ${item.selectedVariants.color}`}
                          </p>
                        )}
                        <p className="text-sm text-charcoal-deep mt-2">
                          €{item.product.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-parchment">
                  <div>
                    {order.status === 'delivered' ? (
                      <p className="text-sm text-stone">
                        Order delivered
                      </p>
                    ) : (
                      <p className="text-sm text-stone">
                        Estimated delivery: {formatDate(order.estimatedDelivery)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-display text-lg text-charcoal-deep">
                      Total: €{order.total.toLocaleString()}
                    </span>
                    <Link
                      href={`/profile/orders/${order.id}`}
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
        ) : (
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

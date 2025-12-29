'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Truck, Check, ChevronRight } from 'lucide-react';
import { products } from '@/data/mock-data';

export default function OrdersPage() {
  // Mock orders data
  const orders = [
    {
      id: 'MG-2024-78432',
      date: '2024-12-20',
      status: 'delivered',
      total: 4900,
      items: [
        { product: products[0], quantity: 1, size: 'Small', color: 'Black' }
      ],
      estimatedDelivery: '2024-12-25',
      deliveredDate: '2024-12-24'
    },
    {
      id: 'MG-2024-76521',
      date: '2024-12-15',
      status: 'shipped',
      total: 3200,
      items: [
        { product: products[1], quantity: 1, size: 'FR 38', color: 'Ivory' }
      ],
      estimatedDelivery: '2024-12-30',
      trackingNumber: 'DHL123456789'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Check size={16} className="text-success" />;
      case 'shipped':
        return <Truck size={16} className="text-info" />;
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
      default:
        return 'Pending';
    }
  };

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-8">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm text-stone hover:text-charcoal-deep transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Profile
        </Link>

        <h1 className="font-display text-3xl md:text-4xl text-charcoal-deep">
          Order History
        </h1>
        <p className="text-stone mt-2">{orders.length} orders</p>
      </div>

      {/* Orders List */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 pb-20">
        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-sand">
                  <div>
                    <p className="text-sm text-greige">Order #{order.id}</p>
                    <p className="text-sm text-stone">Placed on {order.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className={`text-sm font-medium ${
                      order.status === 'delivered' ? 'text-success' :
                      order.status === 'shipped' ? 'text-info' : 'text-stone'
                    }`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="relative w-20 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.images[0]?.url || ''}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs tracking-[0.15em] uppercase text-greige">
                          {item.product.brandName}
                        </p>
                        <h3 className="font-display text-lg text-charcoal-deep">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-stone">
                          Size: {item.size} | Color: {item.color}
                        </p>
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
                        Delivered on {order.deliveredDate}
                      </p>
                    ) : order.status === 'shipped' ? (
                      <p className="text-sm text-stone">
                        Estimated delivery: {order.estimatedDelivery}
                      </p>
                    ) : (
                      <p className="text-sm text-stone">Processing your order</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-display text-lg text-charcoal-deep">
                      Total: €{order.total.toLocaleString()}
                    </span>
                    <Link
                      href={`/profile/orders/${order.id}`}
                      className="flex items-center gap-1 text-sm text-gold-muted hover:text-gold-deep"
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
          <div className="text-center py-20 bg-white rounded-xl">
            <Package size={48} className="mx-auto text-greige mb-4" />
            <h3 className="font-display text-xl text-charcoal-deep mb-2">
              No orders yet
            </h3>
            <p className="text-stone mb-6">
              When you make a purchase, your orders will appear here.
            </p>
            <Link href="/discover" className="btn-primary inline-flex">
              Start Exploring
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

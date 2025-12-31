'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Bell, BellOff, Trash2, Check, Clock, ExternalLink } from 'lucide-react';
import { mockRestockNotifications } from '@/data/mock-data';

export default function RestockAlertsPage() {
  const [notifications, setNotifications] = useState(mockRestockNotifications);

  const handleRemove = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success/10 text-success';
      case 'notified': return 'bg-gold-muted/20 text-gold-deep';
      case 'watching': return 'bg-sapphire-deep/10 text-sapphire-subtle';
      default: return 'bg-sand text-stone';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Back in Stock!';
      case 'notified': return 'Notified';
      case 'watching': return 'Watching';
      default: return status;
    }
  };

  const watchingCount = notifications.filter(n => n.status === 'watching').length;
  const availableCount = notifications.filter(n => n.status === 'available').length;

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-white border-b border-sand">
        <div className="max-w-[900px] mx-auto px-6 lg:px-12 py-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-stone hover:text-charcoal-deep transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gold-muted/20 rounded-full flex items-center justify-center">
              <Bell size={24} className="text-gold-deep" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl text-charcoal-deep">
                Restock Alerts
              </h1>
              <p className="text-stone">Get notified when items you want are back in stock</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 lg:px-12 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sapphire-deep/10 rounded-full flex items-center justify-center">
                <Bell size={18} className="text-sapphire-subtle" />
              </div>
              <div>
                <p className="text-2xl font-display text-charcoal-deep">{watchingCount}</p>
                <p className="text-sm text-stone">Items Watching</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <Check size={18} className="text-success" />
              </div>
              <div>
                <p className="text-2xl font-display text-charcoal-deep">{availableCount}</p>
                <p className="text-sm text-stone">Now Available</p>
              </div>
            </div>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <BellOff size={48} className="mx-auto text-greige mb-4" />
            <h3 className="font-display text-xl text-charcoal-deep mb-2">
              No Restock Alerts
            </h3>
            <p className="text-stone mb-6 max-w-md mx-auto">
              When an item you want is out of stock, you can set up an alert
              to be notified when it becomes available again.
            </p>
            <Link href="/discover" className="btn-primary inline-flex">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Available Items - Show First */}
            {notifications.filter(n => n.status === 'available').length > 0 && (
              <div className="mb-6">
                <h2 className="font-medium text-charcoal-deep mb-4">Back in Stock</h2>
                <div className="space-y-4">
                  {notifications
                    .filter(n => n.status === 'available')
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border-2 border-success/30"
                      >
                        <div className="flex gap-4 lg:gap-6">
                          <Link
                            href={`/product/${notification.product.slug}`}
                            className="relative w-20 h-24 lg:w-24 lg:h-32 rounded-lg overflow-hidden flex-shrink-0"
                          >
                            <Image
                              src={notification.product.images[0]?.url || ''}
                              alt={notification.product.name}
                              fill
                              className="object-cover"
                            />
                          </Link>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xs tracking-[0.15em] uppercase text-greige">
                                  {notification.product.brandName}
                                </p>
                                <Link
                                  href={`/product/${notification.product.slug}`}
                                  className="font-display text-lg text-charcoal-deep hover:text-gold-deep transition-colors"
                                >
                                  {notification.product.name}
                                </Link>
                                <p className="text-stone mt-1">
                                  €{notification.product.price.toLocaleString()}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(notification.status)}`}>
                                {getStatusLabel(notification.status)}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 mt-3 text-sm text-stone">
                              {notification.preferredSize && (
                                <span>Size: {notification.preferredSize}</span>
                              )}
                              {notification.preferredColor && (
                                <span>Color: {notification.preferredColor}</span>
                              )}
                            </div>

                            <div className="flex gap-3 mt-4">
                              <Link
                                href={`/product/${notification.product.slug}`}
                                className="btn-primary text-sm py-2"
                              >
                                <ExternalLink size={14} />
                                View Product
                              </Link>
                              <button
                                onClick={() => handleRemove(notification.id)}
                                className="px-4 py-2 border border-sand rounded-lg text-sm text-stone hover:border-charcoal-deep transition-colors"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Watching Items */}
            {notifications.filter(n => n.status === 'watching').length > 0 && (
              <div>
                <h2 className="font-medium text-charcoal-deep mb-4">Currently Watching</h2>
                <div className="space-y-4">
                  {notifications
                    .filter(n => n.status === 'watching')
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className="bg-white rounded-xl p-4 lg:p-6 shadow-sm"
                      >
                        <div className="flex gap-4 lg:gap-6">
                          <Link
                            href={`/product/${notification.product.slug}`}
                            className="relative w-20 h-24 lg:w-24 lg:h-32 rounded-lg overflow-hidden flex-shrink-0"
                          >
                            <Image
                              src={notification.product.images[0]?.url || ''}
                              alt={notification.product.name}
                              fill
                              className="object-cover"
                            />
                          </Link>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xs tracking-[0.15em] uppercase text-greige">
                                  {notification.product.brandName}
                                </p>
                                <Link
                                  href={`/product/${notification.product.slug}`}
                                  className="font-display text-lg text-charcoal-deep hover:text-gold-deep transition-colors"
                                >
                                  {notification.product.name}
                                </Link>
                                <p className="text-stone mt-1">
                                  €{notification.product.price.toLocaleString()}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(notification.status)}`}>
                                {getStatusLabel(notification.status)}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 mt-3 text-sm text-stone">
                              {notification.preferredSize && (
                                <span>Size: {notification.preferredSize}</span>
                              )}
                              {notification.preferredColor && (
                                <span>Color: {notification.preferredColor}</span>
                              )}
                              <span className="flex items-center gap-1 text-greige">
                                <Clock size={14} />
                                Watching since {new Date(notification.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemove(notification.id)}
                            className="p-2 text-stone hover:text-error transition-colors flex-shrink-0"
                            title="Remove Alert"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Notified Items */}
            {notifications.filter(n => n.status === 'notified').length > 0 && (
              <div>
                <h2 className="font-medium text-charcoal-deep mb-4">Previously Notified</h2>
                <div className="space-y-4">
                  {notifications
                    .filter(n => n.status === 'notified')
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className="bg-white rounded-xl p-4 lg:p-6 shadow-sm opacity-70"
                      >
                        <div className="flex gap-4 lg:gap-6">
                          <Link
                            href={`/product/${notification.product.slug}`}
                            className="relative w-20 h-24 lg:w-24 lg:h-32 rounded-lg overflow-hidden flex-shrink-0"
                          >
                            <Image
                              src={notification.product.images[0]?.url || ''}
                              alt={notification.product.name}
                              fill
                              className="object-cover"
                            />
                          </Link>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xs tracking-[0.15em] uppercase text-greige">
                                  {notification.product.brandName}
                                </p>
                                <p className="font-display text-lg text-charcoal-deep">
                                  {notification.product.name}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(notification.status)}`}>
                                {getStatusLabel(notification.status)}
                              </span>
                            </div>

                            {notification.notifiedAt && (
                              <p className="text-sm text-greige mt-2">
                                Notified on {new Date(notification.notifiedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => handleRemove(notification.id)}
                            className="p-2 text-stone hover:text-error transition-colors flex-shrink-0"
                            title="Remove"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

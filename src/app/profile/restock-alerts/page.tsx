'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Bell, BellOff, Trash2, Check, Clock, ExternalLink, ArrowRight } from 'lucide-react';
import { mockRestockNotifications } from '@/data/mock-data';

export default function RestockAlertsPage() {
  const [notifications, setNotifications] = useState(mockRestockNotifications);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleRemove = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success/10 text-success';
      case 'notified': return 'bg-gold-muted/20 text-gold-deep';
      case 'watching': return 'bg-charcoal-deep/10 text-charcoal-deep';
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
      <div className="bg-charcoal-deep">
        <div className="max-w-[900px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>

          <div className={`flex items-center gap-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="w-14 h-14 bg-gold-soft/20 flex items-center justify-center">
              <Bell size={28} className="text-gold-soft" />
            </div>
            <div>
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70 block mb-2">
                Notifications
              </span>
              <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
                Restock Alerts
              </h1>
              <p className="text-sand mt-2">Get notified when items you want are back in stock</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`max-w-[900px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-charcoal-deep/5 flex items-center justify-center">
                <Bell size={20} className="text-charcoal-deep" />
              </div>
              <div>
                <p className="text-3xl font-display text-charcoal-deep">{watchingCount}</p>
                <p className="text-sm text-stone">Items Watching</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 flex items-center justify-center">
                <Check size={20} className="text-success" />
              </div>
              <div>
                <p className="text-3xl font-display text-charcoal-deep">{availableCount}</p>
                <p className="text-sm text-stone">Now Available</p>
              </div>
            </div>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-white">
            <div className="w-16 h-16 mx-auto mb-6 bg-charcoal-deep/5 flex items-center justify-center">
              <BellOff size={32} className="text-charcoal-deep" />
            </div>
            <h3 className="font-display text-xl text-charcoal-deep mb-3">
              No Restock Alerts
            </h3>
            <p className="text-stone mb-8 max-w-md mx-auto">
              When an item you want is out of stock, you can set up an alert
              to be notified when it becomes available again.
            </p>
            <Link
              href="/discover"
              className="inline-flex items-center gap-3 px-8 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-all duration-300"
            >
              <span className="text-sm tracking-[0.15em] uppercase">Browse Products</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Available Items - Show First */}
            {notifications.filter(n => n.status === 'available').length > 0 && (
              <div>
                <h2 className="text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-4">Back in Stock</h2>
                <div className="space-y-4">
                  {notifications
                    .filter(n => n.status === 'available')
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className="bg-white p-6 border-2 border-success/30"
                      >
                        <div className="flex gap-6">
                          <Link
                            href={`/product/${notification.product.slug}`}
                            className="relative w-24 h-32 overflow-hidden flex-shrink-0"
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
                                <p className="text-[10px] tracking-[0.15em] uppercase text-taupe">
                                  {notification.product.brandName}
                                </p>
                                <Link
                                  href={`/product/${notification.product.slug}`}
                                  className="font-display text-lg text-charcoal-deep hover:text-gold-muted transition-colors"
                                >
                                  {notification.product.name}
                                </Link>
                                <p className="text-stone mt-1">
                                  €{notification.product.price.toLocaleString()}
                                </p>
                              </div>
                              <span className={`px-3 py-1 text-xs font-medium flex-shrink-0 ${getStatusColor(notification.status)}`}>
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
                                className="flex items-center gap-2 px-5 py-2 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] uppercase hover:bg-noir transition-colors"
                              >
                                <ExternalLink size={14} />
                                View Product
                              </Link>
                              <button
                                onClick={() => handleRemove(notification.id)}
                                className="px-5 py-2 border border-sand text-sm text-stone hover:border-charcoal-deep transition-colors"
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
                <h2 className="text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-4">Currently Watching</h2>
                <div className="space-y-4">
                  {notifications
                    .filter(n => n.status === 'watching')
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className="bg-white p-6"
                      >
                        <div className="flex gap-6">
                          <Link
                            href={`/product/${notification.product.slug}`}
                            className="relative w-24 h-32 overflow-hidden flex-shrink-0"
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
                                <p className="text-[10px] tracking-[0.15em] uppercase text-taupe">
                                  {notification.product.brandName}
                                </p>
                                <Link
                                  href={`/product/${notification.product.slug}`}
                                  className="font-display text-lg text-charcoal-deep hover:text-gold-muted transition-colors"
                                >
                                  {notification.product.name}
                                </Link>
                                <p className="text-stone mt-1">
                                  €{notification.product.price.toLocaleString()}
                                </p>
                              </div>
                              <span className={`px-3 py-1 text-xs font-medium flex-shrink-0 ${getStatusColor(notification.status)}`}>
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
                              <span className="flex items-center gap-1 text-taupe">
                                <Clock size={14} />
                                Since {new Date(notification.createdAt).toLocaleDateString()}
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
                <h2 className="text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-4">Previously Notified</h2>
                <div className="space-y-4">
                  {notifications
                    .filter(n => n.status === 'notified')
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className="bg-white p-6 opacity-70"
                      >
                        <div className="flex gap-6">
                          <Link
                            href={`/product/${notification.product.slug}`}
                            className="relative w-24 h-32 overflow-hidden flex-shrink-0"
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
                                <p className="text-[10px] tracking-[0.15em] uppercase text-taupe">
                                  {notification.product.brandName}
                                </p>
                                <p className="font-display text-lg text-charcoal-deep">
                                  {notification.product.name}
                                </p>
                              </div>
                              <span className={`px-3 py-1 text-xs font-medium flex-shrink-0 ${getStatusColor(notification.status)}`}>
                                {getStatusLabel(notification.status)}
                              </span>
                            </div>

                            {notification.notifiedAt && (
                              <p className="text-sm text-taupe mt-2">
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

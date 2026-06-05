'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Crown, Bell, Star, Clock, Calendar, MapPin, Users, ChevronRight, Settings, Check, X, Sparkles, Award, Lock, Unlock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import * as vipService from '@/services/vip-alerts.service';

interface VIPAlert {
  id: string;
  type: 'product_launch' | 'private_sale' | 'event' | 'collection_preview' | 'priority_access';
  title: string;
  description: string;
  brand: string;
  priority: 'urgent' | 'high' | 'normal';
  image?: string;
  expiresAt: string;
  actionLabel: string;
  actionUrl: string;
  metadata?: {
    location?: string;
    date?: string;
    availableSpots?: number;
    discount?: string;
  };
  read: boolean;
  createdAt: string;
}

const VIP_STORAGE_KEY = 'moda-vip-alerts-state';

function loadVIPState(): { readIds: string[]; dismissedIds: string[] } {
  if (typeof window === 'undefined') return { readIds: [], dismissedIds: [] };
  try {
    const stored = localStorage.getItem(VIP_STORAGE_KEY);
    return stored ? JSON.parse(stored) : { readIds: [], dismissedIds: [] };
  } catch {
    return { readIds: [], dismissedIds: [] };
  }
}

function saveVIPState(readIds: string[], dismissedIds: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VIP_STORAGE_KEY, JSON.stringify({ readIds, dismissedIds }));
  } catch { /* ignore */ }
}

export default function VIPAccessPage() {
  const router = useRouter();
  const { isUHNI, isHydrated, showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [filter, setFilter] = useState<'all' | 'product_launch' | 'private_sale' | 'event'>('all');
  const [alerts, setAlerts] = useState<VIPAlert[]>([]);

  // Load alerts from backend. No mock fallback — showing hardcoded "Hermès
  // Spring Collection"–style fake data when the API is empty or down erodes
  // trust on a VIP surface. A clean empty state is the correct UX.
  useEffect(() => {
    let cancelled = false;
    vipService.listVipAlerts()
      .then(serverAlerts => {
        if (cancelled) return;
        const { readIds, dismissedIds } = loadVIPState();
        const items = (serverAlerts as VIPAlert[] | null | undefined) ?? [];
        setAlerts(
          items
            .filter(a => !dismissedIds.includes(a.id))
            .map(a => ({ ...a, read: a.read || readIds.includes(a.id) })),
        );
        setIsLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setAlerts([]);
        setIsLoaded(true);
      });
    return () => { cancelled = true; };
  }, []);

  // Redirect non-UHNI users
  useEffect(() => {
    if (isHydrated && !isUHNI) {
      router.push('/profile');
    }
  }, [isUHNI, isHydrated, router]);

  if (isHydrated && !isUHNI) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const handleMarkAsRead = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
    const state = loadVIPState();
    if (!state.readIds.includes(id)) state.readIds.push(id);
    saveVIPState(state.readIds, state.dismissedIds);
    vipService.markRead(id).catch(() => { /* non-blocking */ });
  };

  const handleMarkAllAsRead = () => {
    setAlerts(alerts.map(a => ({ ...a, read: true })));
    const state = loadVIPState();
    const allIds = [...new Set([...state.readIds, ...alerts.map(a => a.id)])];
    saveVIPState(allIds, state.dismissedIds);
    vipService.markAllRead().catch(() => { /* non-blocking */ });
    showToast('All alerts marked as read', 'success');
  };

  const handleDismiss = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    const state = loadVIPState();
    if (!state.dismissedIds.includes(id)) state.dismissedIds.push(id);
    saveVIPState(state.readIds, state.dismissedIds);
    vipService.dismissAlert(id).catch(() => { /* non-blocking */ });
    showToast('Alert dismissed', 'success');
  };

  const filteredAlerts = alerts.filter(alert =>
    filter === 'all' || alert.type === filter
  );

  const unreadCount = alerts.filter(a => !a.read).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-error/10 text-error border-error/20';
      case 'high':
        return 'bg-gold-soft/10 text-gold-muted border-gold-soft/20';
      default:
        return 'bg-parchment text-stone border-sand';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Star size={12} className="fill-current" />;
      case 'high':
        return <Award size={12} />;
      default:
        return <Bell size={12} />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

          <div className={`flex items-start justify-between gap-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gold-soft/20 flex items-center justify-center relative">
                <Bell size={28} className="text-gold-soft" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-error text-white text-xs flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Bell size={12} className="text-gold-soft" />
                  <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                    Priority Access
                  </span>
                </div>
                <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
                  VIP Access & Alerts
                </h1>
                <p className="text-sand mt-2">
                  {unreadCount > 0 ? `${unreadCount} new alert${unreadCount !== 1 ? 's' : ''}` : 'All caught up'}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-5 py-3 bg-gold-soft/20 text-gold-soft hover:bg-gold-soft/30 transition-colors"
              >
                <Check size={18} />
                <span className="text-sm tracking-[0.1em] uppercase">Mark All Read</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="space-y-6">
            <div className="bg-white p-6">
              <h3 className="font-display text-lg text-charcoal-deep mb-4">Filter Alerts</h3>
              <div className="space-y-2">
                {([
                  { value: 'all', label: 'All Alerts', count: alerts.length },
                  { value: 'product_launch', label: 'Product Launches', count: alerts.filter(a => a.type === 'product_launch').length },
                  { value: 'private_sale', label: 'Private Sales', count: alerts.filter(a => a.type === 'private_sale').length },
                  { value: 'event', label: 'Events', count: alerts.filter(a => a.type === 'event').length }
                ] as const).map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`w-full flex items-center justify-between p-3 border text-left transition-all ${
                      filter === f.value
                        ? 'border-charcoal-deep bg-parchment'
                        : 'border-sand hover:border-charcoal-deep'
                    }`}
                  >
                    <span className="text-sm text-charcoal-deep">{f.label}</span>
                    <span className="text-xs text-taupe">{f.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* VIP Benefits */}
            <div className="bg-charcoal-deep p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-gold-soft" />
                <h3 className="font-display text-lg text-ivory-cream">VIP Benefits</h3>
              </div>
              <ul className="space-y-3 text-sm text-sand">
                <li className="flex items-start gap-2">
                  <Unlock size={14} className="flex-shrink-0 mt-0.5 text-gold-soft" />
                  <span>48-hour early access to new collections</span>
                </li>
                <li className="flex items-start gap-2">
                  <Lock size={14} className="flex-shrink-0 mt-0.5 text-gold-soft" />
                  <span>Exclusive private sales & previews</span>
                </li>
                <li className="flex items-start gap-2">
                  <Calendar size={14} className="flex-shrink-0 mt-0.5 text-gold-soft" />
                  <span>Invitation-only events & showcases</span>
                </li>
                <li className="flex items-start gap-2">
                  <Award size={14} className="flex-shrink-0 mt-0.5 text-gold-soft" />
                  <span>Priority allocation for limited pieces</span>
                </li>
              </ul>
            </div>

            {/* Settings */}
            <Link
              href="/profile/settings"
              className="flex items-center justify-between p-4 bg-white border border-sand hover:border-charcoal-deep transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Settings size={18} className="text-stone" />
                <span className="text-sm text-charcoal-deep">Notification Preferences</span>
              </div>
              <ChevronRight size={14} className="text-stone group-hover:text-charcoal-deep group-hover:translate-x-1 transition-all" />
            </Link>
          </div>

          {/* Main Content - Alerts */}
          <div className="lg:col-span-3">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-20 bg-white">
                <Bell size={48} className="mx-auto text-stone mb-4" />
                <h3 className="font-display text-xl text-charcoal-deep mb-3">No Alerts</h3>
                <p className="text-stone max-w-md mx-auto">
                  You're all caught up! New VIP alerts will appear here when available.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`bg-white overflow-hidden transition-all ${
                      !alert.read ? 'border-l-4 border-l-gold-soft' : ''
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex gap-6">
                        {/* Image */}
                        {alert.image && (
                          <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden">
                            <Image
                              src={alert.image}
                              alt={alert.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`flex items-center gap-1.5 px-3 py-1 text-[10px] tracking-[0.15em] uppercase border ${getPriorityColor(alert.priority)}`}>
                                  {getPriorityIcon(alert.priority)}
                                  {alert.priority}
                                </span>
                                <span className="text-[10px] tracking-[0.15em] uppercase text-taupe">
                                  {getTypeLabel(alert.type)}
                                </span>
                                {!alert.read && (
                                  <span className="w-2 h-2 bg-gold-soft rounded-full"></span>
                                )}
                              </div>
                              <h3 className="font-display text-xl text-charcoal-deep mb-1">{alert.title}</h3>
                              <p className="text-sm text-taupe mb-2">{alert.brand}</p>
                            </div>
                            <button
                              onClick={() => handleDismiss(alert.id)}
                              className="p-2 text-stone hover:text-charcoal-deep transition-colors"
                            >
                              <X size={18} />
                            </button>
                          </div>

                          <p className="text-stone mb-4">{alert.description}</p>

                          {/* Metadata */}
                          {alert.metadata && (
                            <div className="flex flex-wrap gap-4 text-sm text-stone mb-4">
                              {alert.metadata.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin size={14} />
                                  <span>{alert.metadata.location}</span>
                                </div>
                              )}
                              {alert.metadata.date && (
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} />
                                  <span>{new Date(alert.metadata.date).toLocaleDateString()}</span>
                                </div>
                              )}
                              {alert.metadata.availableSpots !== undefined && (
                                <div className="flex items-center gap-2">
                                  <Users size={14} />
                                  <span>{alert.metadata.availableSpots} spots remaining</span>
                                </div>
                              )}
                              {alert.metadata.discount && (
                                <div className="flex items-center gap-2">
                                  <Star size={14} className="text-gold-muted" />
                                  <span className="text-gold-muted">{alert.metadata.discount}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-3">
                            <Link
                              href={alert.actionUrl}
                              onClick={() => handleMarkAsRead(alert.id)}
                              className="flex items-center gap-2 px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors"
                            >
                              <span className="text-sm tracking-[0.15em] uppercase">{alert.actionLabel}</span>
                              <ArrowRight size={16} />
                            </Link>
                            {!alert.read && (
                              <button
                                onClick={() => handleMarkAsRead(alert.id)}
                                className="px-6 py-3 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-sm tracking-[0.15em] uppercase"
                              >
                                Mark as Read
                              </button>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="mt-4 pt-4 border-t border-sand flex items-center justify-between text-xs text-taupe">
                            <div className="flex items-center gap-2">
                              <Clock size={12} />
                              <span>{new Date(alert.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>Expires: {new Date(alert.expiresAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

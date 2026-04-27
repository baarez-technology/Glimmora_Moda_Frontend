'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, ShoppingBag, TrendingUp, Sparkles, Calendar, Tag, BellRing } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { registerPushSubscription } from '@/services/push-notification.service';

interface NotificationPrefs {
  orders: boolean;
  restock: boolean;
  styleTips: boolean;
  events: boolean;
  promotions: boolean;
  newArrivals: boolean;
}

const STORAGE_KEY = 'moda-notification-prefs';

const defaultPrefs: NotificationPrefs = {
  orders: true,
  restock: true,
  styleTips: true,
  events: false,
  promotions: false,
  newArrivals: true
};

function loadPrefs(): NotificationPrefs {
  if (typeof window === 'undefined') return defaultPrefs;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultPrefs, ...JSON.parse(stored) } : defaultPrefs;
  } catch {
    return defaultPrefs;
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const { showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs);
  const [isHydratedLocal, setIsHydratedLocal] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [pushRequesting, setPushRequesting] = useState(false);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/auth/login/consumer?redirect=/profile/notifications');
    }
  }, [isAuthenticated, isHydrated, router]);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      setIsLoaded(true);
    }
  }, [isHydrated, isAuthenticated]);

  useEffect(() => {
    setPrefs(loadPrefs());
    setIsHydratedLocal(true);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    } else {
      setPushPermission('unsupported');
    }
  }, []);

  const requestPushPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    setPushRequesting(true);
    try {
      const result = await Notification.requestPermission();
      setPushPermission(result);
      if (result === 'granted') {
        const ok = await registerPushSubscription();
        showToast(
          ok ? 'Push notifications enabled' : 'Permission granted, but subscription failed',
          ok ? 'success' : 'error',
        );
      } else {
        showToast('Push notifications blocked — enable in browser settings', 'error');
      }
    } finally {
      setPushRequesting(false);
    }
  };

  useEffect(() => {
    if (isHydratedLocal) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    }
  }, [prefs, isHydratedLocal]);

  const labelMap: Record<keyof NotificationPrefs, string> = {
    orders: 'Order Updates',
    restock: 'Restock Alerts',
    styleTips: 'Style Recommendations',
    events: 'Events & Invitations',
    promotions: 'Promotions',
    newArrivals: 'New Arrivals',
  };

  const toggle = (key: keyof NotificationPrefs) => {
    setPrefs(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      showToast(`${labelMap[key]} ${updated[key] ? 'enabled' : 'disabled'}`, 'success');
      return updated;
    });
  };

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading preferences...</p>
        </div>
      </div>
    );
  }

  const categories: { key: keyof NotificationPrefs; icon: typeof Bell; label: string; description: string }[] = [
    { key: 'orders', icon: ShoppingBag, label: 'Order Updates', description: 'Shipping confirmations, delivery status, and returns' },
    { key: 'restock', icon: TrendingUp, label: 'Restock Alerts', description: 'Get notified when wishlist items are back in stock' },
    { key: 'styleTips', icon: Sparkles, label: 'Style Recommendations', description: 'Personalized outfit suggestions and style tips' },
    { key: 'events', icon: Calendar, label: 'Events & Invitations', description: 'Private shopping events and brand experiences' },
    { key: 'promotions', icon: Tag, label: 'Promotions', description: 'Special offers and seasonal sales' },
    { key: 'newArrivals', icon: Bell, label: 'New Arrivals', description: 'Be the first to see new collections and products' }
  ];

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>
          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70 block mb-4">
              Preferences
            </span>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              Notifications
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12 space-y-8 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* Push notification permission */}
        {pushPermission !== 'unsupported' && pushPermission !== 'granted' && (
          <div className="bg-white p-6 border border-sand flex items-start gap-4">
            <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center flex-shrink-0">
              <BellRing size={18} className="text-charcoal-deep" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-charcoal-deep mb-1">Enable Browser Notifications</p>
              <p className="text-sm text-stone mb-4">
                Get real-time alerts for orders, restock, and exclusive events directly in your browser — even when you&apos;re not on the site.
              </p>
              {pushPermission === 'denied' ? (
                <p className="text-xs text-error">
                  Notifications are blocked in your browser settings. To enable, click the lock icon in your browser&apos;s address bar and allow notifications for this site.
                </p>
              ) : (
                <button
                  onClick={requestPushPermission}
                  disabled={pushRequesting}
                  className="px-5 py-2.5 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] uppercase hover:bg-noir transition-colors disabled:opacity-50"
                >
                  {pushRequesting ? 'Requesting…' : 'Enable Push Notifications'}
                </button>
              )}
            </div>
          </div>
        )}

        {pushPermission === 'granted' && (
          <div className="bg-white p-4 border border-sand flex items-center gap-3">
            <span className="text-success">✓</span>
            <p className="text-sm text-charcoal-deep">Push notifications are enabled for this browser.</p>
          </div>
        )}

        <div className="bg-white p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
              <Bell size={18} className="text-charcoal-deep" />
            </div>
            <div>
              <h2 className="font-display text-xl text-charcoal-deep">Notification Preferences</h2>
              <p className="text-sm text-stone">Choose what you want to be notified about</p>
            </div>
          </div>

          <div className="space-y-1">
            {categories.map(({ key, icon: Icon, label, description }) => (
              <div key={key} className="flex items-center justify-between py-5 border-b border-sand last:border-0">
                <div className="flex items-center gap-4">
                  <Icon size={18} className="text-stone flex-shrink-0" />
                  <div>
                    <p className="font-medium text-charcoal-deep">{label}</p>
                    <p className="text-sm text-stone">{description}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(key)}
                  role="switch"
                  aria-checked={prefs[key]}
                  aria-label={`Toggle ${label}`}
                  style={{
                    position: 'relative',
                    width: 48,
                    height: 28,
                    backgroundColor: prefs[key] ? '#2C2C2C' : '#C8B89A',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 3,
                      left: prefs[key] ? 23 : 3,
                      width: 22,
                      height: 22,
                      backgroundColor: '#fff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                      transition: 'left 0.3s ease',
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

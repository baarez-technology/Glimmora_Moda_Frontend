'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, ShoppingBag, TrendingUp, Sparkles, Calendar, Tag } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

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
  }, []);

  useEffect(() => {
    if (isHydratedLocal) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    }
  }, [prefs, isHydratedLocal]);

  const toggle = (key: keyof NotificationPrefs) => {
    setPrefs(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      showToast(`${key} notifications ${updated[key] ? 'enabled' : 'disabled'}`, 'success');
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
                  className={`w-12 h-7 transition-colors relative flex-shrink-0 ${
                    prefs[key] ? 'bg-charcoal-deep' : 'bg-sand'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 bg-white transition-transform ${
                      prefs[key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
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

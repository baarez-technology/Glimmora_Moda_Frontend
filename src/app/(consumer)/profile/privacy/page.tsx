'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Eye, EyeOff, Download, Cookie } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

interface PrivacySettings {
  dataSharing: boolean;
  profileVisibility: boolean;
  analyticsTracking: boolean;
  personalizedAds: boolean;
  essentialCookies: boolean;
  performanceCookies: boolean;
  marketingCookies: boolean;
}

const STORAGE_KEY = 'moda-privacy-settings';

const defaultSettings: PrivacySettings = {
  dataSharing: false,
  profileVisibility: true,
  analyticsTracking: true,
  personalizedAds: false,
  essentialCookies: true,
  performanceCookies: true,
  marketingCookies: false
};

function loadSettings(): PrivacySettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export default function PrivacyPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const { showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings);
  const [isHydratedLocal, setIsHydratedLocal] = useState(false);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/auth/login/consumer?redirect=/profile/privacy');
    }
  }, [isAuthenticated, isHydrated, router]);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      setIsLoaded(true);
    }
  }, [isHydrated, isAuthenticated]);

  useEffect(() => {
    setSettings(loadSettings());
    setIsHydratedLocal(true);
  }, []);

  useEffect(() => {
    if (isHydratedLocal) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, isHydratedLocal]);

  const toggle = (key: keyof PrivacySettings) => {
    if (key === 'essentialCookies') return; // Essential cookies cannot be toggled
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    showToast('Privacy settings updated', 'success');
  };

  const handleDownloadData = () => {
    const userData = {
      fashionIdentity: localStorage.getItem('moda-fashion-identity'),
      considerations: localStorage.getItem('moda-considerations'),
      wardrobe: localStorage.getItem('moda-wardrobe'),
      outfits: localStorage.getItem('moda-outfits'),
      orders: localStorage.getItem('moda-orders'),
      addresses: localStorage.getItem('moda-addresses'),
      paymentMethods: localStorage.getItem('moda-payment-methods'),
      privacySettings: localStorage.getItem(STORAGE_KEY),
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'moda-glimmora-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Your data has been downloaded', 'success');
  };

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading privacy settings...</p>
        </div>
      </div>
    );
  }

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
              Data Control
            </span>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              Privacy
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12 space-y-8 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Data Sharing */}
        <div className="bg-white p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
              <Shield size={18} className="text-charcoal-deep" />
            </div>
            <div>
              <h2 className="font-display text-xl text-charcoal-deep">Data Sharing</h2>
              <p className="text-sm text-stone">Control how your data is used</p>
            </div>
          </div>
          <div className="space-y-1">
            {[
              { key: 'dataSharing' as const, label: 'Third-Party Data Sharing', desc: 'Allow sharing anonymized data with brand partners' },
              { key: 'profileVisibility' as const, label: 'Profile Visibility', desc: 'Allow stylists and personal shoppers to view your profile' },
              { key: 'analyticsTracking' as const, label: 'Usage Analytics', desc: 'Help improve our service through anonymous usage data' },
              { key: 'personalizedAds' as const, label: 'Personalized Ads', desc: 'Receive targeted recommendations based on browsing' }
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-5 border-b border-sand last:border-0">
                <div className="flex items-center gap-4">
                  {settings[item.key] ? (
                    <Eye size={18} className="text-stone flex-shrink-0" />
                  ) : (
                    <EyeOff size={18} className="text-stone flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium text-charcoal-deep">{item.label}</p>
                    <p className="text-sm text-stone">{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(item.key)}
                  style={{
                    position: 'relative',
                    width: 48,
                    height: 28,
                    backgroundColor: settings[item.key] ? '#2C2C2C' : '#C8B89A',
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
                      left: settings[item.key] ? 23 : 3,
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

        {/* Cookie Preferences */}
        <div className="bg-white p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
              <Cookie size={18} className="text-charcoal-deep" />
            </div>
            <div>
              <h2 className="font-display text-xl text-charcoal-deep">Cookie Preferences</h2>
              <p className="text-sm text-stone">Manage cookie settings</p>
            </div>
          </div>
          <div className="space-y-1">
            {[
              { key: 'essentialCookies' as const, label: 'Essential Cookies', desc: 'Required for the site to function (cannot be disabled)', locked: true },
              { key: 'performanceCookies' as const, label: 'Performance Cookies', desc: 'Help us understand how visitors use the site', locked: false },
              { key: 'marketingCookies' as const, label: 'Marketing Cookies', desc: 'Used to deliver relevant advertisements', locked: false }
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-5 border-b border-sand last:border-0">
                <div>
                  <p className={`font-medium ${item.locked ? 'text-stone' : 'text-charcoal-deep'}`}>{item.label}</p>
                  <p className="text-sm text-stone">{item.desc}</p>
                </div>
                {item.locked ? (
                  <div
                    style={{
                      position: 'relative',
                      width: 48,
                      height: 28,
                      backgroundColor: 'rgba(44,44,44,0.4)',
                      opacity: 0.5,
                      cursor: 'not-allowed',
                      flexShrink: 0,
                    }}
                    aria-disabled="true"
                    aria-label={`${item.label} - always enabled`}
                    title="Essential cookies are always enabled"
                  >
                    <span style={{ position: 'absolute', top: 3, left: 23, width: 22, height: 22, backgroundColor: 'rgba(255,255,255,0.7)' }} />
                  </div>
                ) : (
                  <button
                    onClick={() => toggle(item.key)}
                    style={{
                      position: 'relative',
                      width: 48,
                      height: 28,
                      backgroundColor: settings[item.key] ? '#2C2C2C' : '#C8B89A',
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
                        left: settings[item.key] ? 23 : 3,
                        width: 22,
                        height: 22,
                        backgroundColor: '#fff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                        transition: 'left 0.3s ease',
                      }}
                    />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Download Data */}
        <div className="bg-white p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
              <Download size={18} className="text-charcoal-deep" />
            </div>
            <div>
              <h2 className="font-display text-xl text-charcoal-deep">Your Data</h2>
              <p className="text-sm text-stone">Download or manage your personal data</p>
            </div>
          </div>
          <button
            onClick={handleDownloadData}
            className="px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.15em] uppercase"
          >
            Download My Data
          </button>
        </div>
      </div>
    </div>
  );
}

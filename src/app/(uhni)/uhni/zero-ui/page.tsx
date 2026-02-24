'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Crown,
  Zap,
  RefreshCw,
  Eye,
  Shirt,
  DollarSign,
  Heart,
  XCircle,
  Bell,
  BellOff
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { uhniService } from '@/services';
import type { ZeroUIConfig, ZeroUITrigger } from '@/types/uhni';

export default function ZeroUIPage() {
  const { showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [config, setConfig] = useState<ZeroUIConfig | null>(null);

  useEffect(() => {
    uhniService.getZeroUIConfig().then(res => {
      if (res.data) setConfig(res.data);
    }).catch(() => {
      showToast('Failed to load configuration', 'error');
    }).finally(() => {
      setIsLoaded(true);
    });
  }, []);

  const toggleFeatures: {
    key: keyof Pick<ZeroUIConfig, 'autoReplenish' | 'invisibleCheckout' | 'wardrobePreparation'>;
    name: string;
    description: string;
    icon: typeof RefreshCw;
  }[] = [
    {
      key: 'autoReplenish',
      name: 'Auto Replenish',
      description: 'Automatically reorder essentials when running low based on usage patterns',
      icon: RefreshCw,
    },
    {
      key: 'invisibleCheckout',
      name: 'Invisible Checkout',
      description: 'Complete purchases seamlessly without manual checkout steps',
      icon: Eye,
    },
    {
      key: 'wardrobePreparation',
      name: 'Wardrobe Preparation',
      description: 'Pre-select and prepare outfits based on your calendar and preferences',
      icon: Shirt,
    },
  ];

  const getTriggerTypeBadge = (type: ZeroUITrigger['type']) => {
    switch (type) {
      case 'restock': return 'bg-green-100 text-green-700';
      case 'seasonal': return 'bg-purple-100 text-purple-700';
      case 'event': return 'bg-gold-soft/20 text-gold-deep';
      case 'travel': return 'bg-info/10 text-info';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/uhni"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-3 mb-4">
              <Crown size={16} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                UHNI Exclusive
              </span>
            </div>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              Zero-UI Commerce
            </h1>
            <p className="text-sand mt-3">Seamless, invisible commerce experiences</p>
          </div>
        </div>
      </div>

      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {config && (
          <>
            {/* Toggle Cards */}
            <div className="mb-12">
              <h2 className="text-[10px] tracking-[0.3em] uppercase text-stone mb-6">Commerce Modes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {toggleFeatures.map(feature => {
                  const FeatureIcon = feature.icon;
                  const isActive = config[feature.key];
                  return (
                    <div key={feature.key} className="bg-white border border-sand/30 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 flex items-center justify-center ${isActive ? 'bg-gold-soft/10' : 'bg-stone/10'}`}>
                            <FeatureIcon size={20} className={isActive ? 'text-gold-deep' : 'text-stone'} />
                          </div>
                        </div>
                        <button
                          role="switch"
                          aria-checked={isActive}
                          aria-label={`Toggle ${feature.name}`}
                          onClick={async () => {
                            try {
                              const updated = { ...config, [feature.key]: !isActive };
                              setConfig(updated);
                              await uhniService.updateZeroUIConfig({ [feature.key]: !isActive });
                              showToast(`${feature.name} ${!isActive ? 'enabled' : 'disabled'}`, 'success');
                            } catch {
                              setConfig(config);
                              showToast('Failed to update setting', 'error');
                            }
                          }}
                          className={`w-14 h-8 rounded-full transition-colors relative ${
                            isActive ? 'bg-gold-deep' : 'bg-sand'
                          }`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
                            isActive ? 'translate-x-7' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      <h3 className="font-display text-lg text-charcoal-deep mb-2">{feature.name}</h3>
                      <p className="text-sm text-stone leading-relaxed">{feature.description}</p>
                      <div className="mt-4">
                        <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${isActive ? 'bg-success/10 text-success' : 'bg-stone/10 text-stone'}`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Triggers */}
            <div className="mb-12">
              <h2 className="text-[10px] tracking-[0.3em] uppercase text-stone mb-6">Active Triggers</h2>
              <div className="space-y-3">
                {config.triggers.map(trigger => (
                  <div key={trigger.id} className="bg-white border border-sand/30 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Zap size={16} className={trigger.enabled ? 'text-gold-deep' : 'text-stone/40'} />
                      <div>
                        <p className="text-sm text-charcoal-deep font-medium">{trigger.description}</p>
                        {trigger.lastTriggered && (
                          <p className="text-xs text-stone mt-1">
                            Last triggered: {new Date(trigger.lastTriggered).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${getTriggerTypeBadge(trigger.type)}`}>
                        {trigger.type}
                      </span>
                      <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${trigger.enabled ? 'bg-success/10 text-success' : 'bg-stone/10 text-stone'}`}>
                        {trigger.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div>
              <h2 className="text-[10px] tracking-[0.3em] uppercase text-stone mb-6">Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Max Auto Spend */}
                <div className="bg-white border border-sand/30 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign size={16} className="text-gold-deep" />
                    <h3 className="text-[10px] tracking-[0.2em] uppercase text-stone">Max Auto Spend</h3>
                  </div>
                  <p className="font-display text-2xl text-charcoal-deep">
                    {formatCurrency(config.preferences.maxAutoSpend)}
                  </p>
                  <p className="text-xs text-stone mt-2">Per transaction limit</p>
                </div>

                {/* Preferred Brands */}
                <div className="bg-white border border-sand/30 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Heart size={16} className="text-gold-deep" />
                    <h3 className="text-[10px] tracking-[0.2em] uppercase text-stone">Preferred Brands</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {config.preferences.preferredBrands.map(brand => (
                      <span key={brand} className="px-3 py-1.5 bg-parchment text-xs text-charcoal-deep">
                        {brand}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Excluded Categories */}
                <div className="bg-white border border-sand/30 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <XCircle size={16} className="text-stone" />
                    <h3 className="text-[10px] tracking-[0.2em] uppercase text-stone">Excluded Categories</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {config.preferences.excludedCategories.map(category => (
                      <span key={category} className="px-3 py-1.5 bg-stone/5 text-xs text-stone">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notification Before */}
                <div className="bg-white border border-sand/30 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    {config.preferences.notifyBefore ? (
                      <Bell size={16} className="text-gold-deep" />
                    ) : (
                      <BellOff size={16} className="text-stone" />
                    )}
                    <h3 className="text-[10px] tracking-[0.2em] uppercase text-stone">Notify Before Purchase</h3>
                  </div>
                  <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${config.preferences.notifyBefore ? 'bg-success/10 text-success' : 'bg-stone/10 text-stone'}`}>
                    {config.preferences.notifyBefore ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                {/* Notification After */}
                <div className="bg-white border border-sand/30 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    {config.preferences.notifyAfter ? (
                      <Bell size={16} className="text-gold-deep" />
                    ) : (
                      <BellOff size={16} className="text-stone" />
                    )}
                    <h3 className="text-[10px] tracking-[0.2em] uppercase text-stone">Notify After Purchase</h3>
                  </div>
                  <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${config.preferences.notifyAfter ? 'bg-success/10 text-success' : 'bg-stone/10 text-stone'}`}>
                    {config.preferences.notifyAfter ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {!config && isLoaded && (
          <div className="text-center py-16">
            <Zap size={40} className="text-stone/40 mx-auto mb-4" />
            <p className="text-stone">No configuration available</p>
          </div>
        )}
      </div>
    </div>
  );
}

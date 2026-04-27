'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Crown,
  Zap,
  DollarSign,
  ShoppingBag,
  Eye,
  EyeOff,
  Package,
  Bell,
  BellOff,
  ChevronRight,
  Info,
  RefreshCw,
  Shirt,
  Heart,
  XCircle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatPrice, getCurrencySymbol } from '@/lib/currency';
import { uhniService, brandService } from '@/services';
import type { ProductCategory, Brand } from '@/types';
import type { ZeroUIConfig, ZeroUITrigger } from '@/types/uhni';

export default function AutonomousCommercePage() {
  const { autonomousSettings, updateAutonomousSettings, autonomousActivity, showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [zeroConfig, setZeroConfig] = useState<ZeroUIConfig | null>(null);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);

  useEffect(() => {
    setIsLoaded(true);
    uhniService.getZeroUIConfig().then(res => {
      if (res.data) setZeroConfig(res.data);
    }).catch(() => { console.error('[autonomous] Failed to load Zero UI config'); });
    brandService.getAllBrands().then(res => {
      if (res.success && res.data) setAllBrands(res.data);
    }).catch(() => { console.error('[autonomous] Failed to load brands'); });
  }, []);

  const categories: { value: ProductCategory; label: string }[] = [
    { value: 'bags', label: 'Bags' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'shoes', label: 'Shoes' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'watches', label: 'Watches' },
  ];

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

  const handleToggle = (key: string) => {
    if (!autonomousSettings) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settings = autonomousSettings as any;
    if (typeof settings[key] === 'boolean') {
      updateAutonomousSettings({ [key]: !settings[key] });
    }
  };

  const handleCategoryToggle = (category: ProductCategory) => {
    if (!autonomousSettings) return;
    const current = autonomousSettings.categories;
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    updateAutonomousSettings({ categories: updated });
  };

  const handlePreferredBrandToggle = (brandId: string) => {
    if (!autonomousSettings) return;
    const current = autonomousSettings.preferredBrands;
    const updated = current.includes(brandId)
      ? current.filter(b => b !== brandId)
      : [...current, brandId];
    // If adding to preferred, remove from excluded
    const updatedExcluded = autonomousSettings.excludedBrands.filter(b => b !== brandId);
    updateAutonomousSettings({ preferredBrands: updated, excludedBrands: updatedExcluded });
  };

  const handleExcludedBrandToggle = (brandId: string) => {
    if (!autonomousSettings) return;
    const current = autonomousSettings.excludedBrands;
    const updated = current.includes(brandId)
      ? current.filter(b => b !== brandId)
      : [...current, brandId];
    // If adding to excluded, remove from preferred
    const updatedPreferred = autonomousSettings.preferredBrands.filter(b => b !== brandId);
    updateAutonomousSettings({ excludedBrands: updated, preferredBrands: updatedPreferred });
  };

  const getTriggerTypeBadge = (type: ZeroUITrigger['type']) => {
    switch (type) {
      case 'restock': return 'bg-green-100 text-green-700';
      case 'seasonal': return 'bg-purple-100 text-purple-700';
      case 'event': return 'bg-gold-soft/20 text-gold-deep';
      case 'travel': return 'bg-info/10 text-info';
    }
  };

  const formatCurrency = (amount: number) => {
    return formatPrice(amount);
  };

  const budgetUsedPercent = autonomousSettings
    ? (autonomousSettings.currentMonthSpend / autonomousSettings.monthlyBudget) * 100
    : 0;

  const isLoading = !autonomousSettings;

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Autonomous backend not yet live — settings save locally but orders do not execute */}
      <div className="bg-amber-50 border-b border-amber-200 px-8 py-3">
        <div className="max-w-[1200px] mx-auto flex items-start gap-3">
          <span className="text-amber-600 text-sm mt-0.5">⚠</span>
          <p className="text-amber-800 text-sm">
            <strong>Autonomous purchasing is not yet live.</strong> You can configure your settings, but the AI agent backend required to execute automatic purchases is under development. No orders will be placed automatically until this feature launches.
          </p>
        </div>
      </div>
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
              Autonomous Commerce
            </h1>
            <p className="text-sand mt-3">AI-powered shopping, automation, and zero-UI experiences</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading settings...</p>
        </div>
      ) : (
        <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="space-y-8">

            {/* ── Section 1: Master Toggle & Budget ── */}
            <div className="bg-parchment p-6 border border-sand">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-charcoal-deep flex items-center justify-center flex-shrink-0">
                  <Info size={14} className="text-ivory-cream" />
                </div>
                <div>
                  <p className="font-medium text-charcoal-deep mb-2">How Autonomous Shopping Works</p>
                  <p className="text-sm text-stone">
                    When enabled, our AI will automatically prepare and purchase items that match your style profile.
                    Items within your auto-approve threshold are purchased automatically. Items above the threshold are
                    held for your review. You maintain full control and can adjust all settings at any time.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 flex items-center justify-center ${
                    autonomousSettings.enabled ? 'bg-success/10' : 'bg-parchment'
                  }`}>
                    <Zap size={24} className={autonomousSettings.enabled ? 'text-success' : 'text-stone'} />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-charcoal-deep">Autonomous Shopping</h2>
                    <p className="text-sm text-stone">Enable AI-powered automatic purchasing</p>
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={autonomousSettings.enabled}
                  aria-label="Toggle autonomous shopping"
                  onClick={() => handleToggle('enabled')}
                  className={`w-14 h-8 rounded-full transition-colors relative ${
                    autonomousSettings.enabled ? 'bg-success' : 'bg-sand'
                  }`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
                    autonomousSettings.enabled ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            <div className="bg-white p-8">
              <h3 className="font-display text-lg text-charcoal-deep mb-6 flex items-center gap-3">
                <DollarSign size={20} className="text-stone" />
                Budget & Spending Limits
              </h3>
              <div className="space-y-6">
                {/* Monthly budget bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-stone">Spent this month</span>
                    <span className="text-charcoal-deep font-medium">
                      {formatPrice(autonomousSettings.currentMonthSpend)} / {formatPrice(autonomousSettings.monthlyBudget)}
                    </span>
                  </div>
                  <div className="h-3 bg-parchment overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        budgetUsedPercent > 80 ? 'bg-error' : budgetUsedPercent > 50 ? 'bg-gold-muted' : 'bg-success'
                      }`}
                      style={{ width: `${Math.min(budgetUsedPercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-taupe mt-2">
                    {formatPrice(autonomousSettings.monthlyBudget - autonomousSettings.currentMonthSpend)} remaining
                  </p>
                </div>

                {/* Auto-approve threshold */}
                <div className="pt-6 border-t border-sand">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-charcoal-deep">Auto-Approve Threshold</p>
                      <p className="text-sm text-stone">Items below this amount are purchased automatically</p>
                    </div>
                    <p className="font-display text-2xl text-charcoal-deep">
                      {formatPrice(autonomousSettings.autoApproveThreshold)}
                    </p>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="20000"
                    step="500"
                    value={autonomousSettings.autoApproveThreshold}
                    onChange={(e) => updateAutonomousSettings({ autoApproveThreshold: parseInt(e.target.value) })}
                    className="w-full accent-charcoal-deep"
                  />
                  <div className="flex justify-between text-xs text-taupe mt-2">
                    <span>{formatPrice(1000)}</span>
                    <span>{formatPrice(20000)}</span>
                  </div>
                </div>

                {/* Per-transaction limit from Zero UI config */}
                {zeroConfig && (
                  <div className="pt-6 border-t border-sand flex items-center justify-between">
                    <div>
                      <p className="font-medium text-charcoal-deep">Per-Transaction Limit</p>
                      <p className="text-sm text-stone">Maximum spend per single automated transaction</p>
                    </div>
                    <p className="font-display text-2xl text-charcoal-deep">
                      {formatCurrency(zeroConfig.preferences.maxAutoSpend)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Section 2: Categories & Brands ── */}
            <div className="bg-white p-8">
              <h3 className="font-display text-lg text-charcoal-deep mb-6 flex items-center gap-3">
                <ShoppingBag size={20} className="text-stone" />
                Categories & Brands
              </h3>
              <p className="text-sm text-stone mb-4">Select which product categories can be purchased autonomously</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => {
                  const isSelected = autonomousSettings.categories.includes(category.value);
                  return (
                    <button
                      key={category.value}
                      onClick={() => handleCategoryToggle(category.value)}
                      className={`p-4 border transition-all ${
                        isSelected
                          ? 'border-charcoal-deep bg-charcoal-deep text-ivory-cream'
                          : 'border-sand hover:border-charcoal-deep text-charcoal-deep'
                      }`}
                    >
                      <span className="text-sm tracking-[0.1em] uppercase">{category.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Preferred Brands */}
              <div className="pt-8 border-t border-sand mt-8">
                <div className="flex items-center gap-3 mb-2">
                  <Heart size={16} className="text-gold-deep" />
                  <h4 className="text-[10px] tracking-[0.2em] uppercase text-stone">Preferred Brands</h4>
                </div>
                <p className="text-sm text-stone mb-4">Select brands for autonomous purchases — only selected brands will be included</p>
                <div className="flex flex-wrap gap-2">
                  {allBrands.map(brand => {
                    const brandKey = brand.id || brand.name.toLowerCase().replace(/\s+/g, '-');
                    const isPreferred = autonomousSettings.preferredBrands.includes(brandKey)
                      || autonomousSettings.preferredBrands.includes(brand.name.toLowerCase())
                      || autonomousSettings.preferredBrands.includes(brand.name);
                    return (
                      <button
                        key={brand.id}
                        onClick={() => handlePreferredBrandToggle(brandKey)}
                        className={`px-4 py-2 border text-xs tracking-[0.05em] transition-all ${
                          isPreferred
                            ? 'border-gold-deep bg-gold-soft/10 text-gold-deep'
                            : 'border-sand hover:border-gold-deep/40 text-stone'
                        }`}
                      >
                        {isPreferred && <Heart size={10} className="inline mr-1.5 fill-current" />}
                        {brand.name}
                      </button>
                    );
                  })}
                  {allBrands.length === 0 && (
                    <p className="text-xs text-taupe italic">Loading brands...</p>
                  )}
                </div>
              </div>

            </div>

            {/* ── Section 3: Commerce Modes & Triggers ── */}
            {zeroConfig && (
              <div className="bg-white p-8">
                <h3 className="font-display text-lg text-charcoal-deep mb-2 flex items-center gap-3">
                  <Zap size={20} className="text-stone" />
                  Commerce Modes & Triggers
                </h3>
                <p className="text-sm text-stone mb-8">How and when the AI acts on your behalf</p>

                {/* Commerce modes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  {toggleFeatures.map(feature => {
                    const FeatureIcon = feature.icon;
                    const isActive = zeroConfig[feature.key];
                    return (
                      <div key={feature.key} className="border border-sand/50 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-10 h-10 flex items-center justify-center ${isActive ? 'bg-gold-soft/10' : 'bg-stone/10'}`}>
                            <FeatureIcon size={20} className={isActive ? 'text-gold-deep' : 'text-stone'} />
                          </div>
                          <button
                            role="switch"
                            aria-checked={isActive}
                            aria-label={`Toggle ${feature.name}`}
                            onClick={async () => {
                              try {
                                const updated = { ...zeroConfig, [feature.key]: !isActive };
                                setZeroConfig(updated);
                                await uhniService.updateZeroUIConfig({ [feature.key]: !isActive });
                                showToast(`${feature.name} ${!isActive ? 'enabled' : 'disabled'}`, 'success');
                              } catch {
                                setZeroConfig(zeroConfig);
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
                        <h4 className="font-display text-lg text-charcoal-deep mb-2">{feature.name}</h4>
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

                {/* Triggers */}
                <div className="pt-8 border-t border-sand">
                  <h4 className="text-[10px] tracking-[0.3em] uppercase text-stone mb-6">Active Triggers</h4>
                  <div className="space-y-3">
                    {zeroConfig.triggers.map(trigger => (
                      <div key={trigger.id} className="border border-sand/50 p-5 flex items-center justify-between">
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
              </div>
            )}

            {/* ── Section 4: Privacy & Notifications ── */}
            <div className="bg-white p-8">
              <h3 className="font-display text-lg text-charcoal-deep mb-6 flex items-center gap-3">
                {autonomousSettings.invisibleCommerceMode ? <EyeOff size={20} className="text-stone" /> : <Eye size={20} className="text-stone" />}
                Privacy & Notifications
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-sand">
                  <div>
                    <p className="font-medium text-charcoal-deep">Invisible Commerce Mode</p>
                    <p className="text-sm text-stone">No email confirmations, minimal digital trail</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={autonomousSettings.invisibleCommerceMode}
                    aria-label="Toggle invisible commerce mode"
                    onClick={() => handleToggle('invisibleCommerceMode')}
                    className={`w-14 h-8 rounded-full transition-colors relative ${
                      autonomousSettings.invisibleCommerceMode ? 'bg-charcoal-deep' : 'bg-sand'
                    }`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
                      autonomousSettings.invisibleCommerceMode ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-sand">
                  <div>
                    <p className="font-medium text-charcoal-deep">Discreet Packaging</p>
                    <p className="text-sm text-stone">Unbranded exterior, no product descriptions visible</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={autonomousSettings.discreetPackaging}
                    aria-label="Toggle discreet packaging"
                    onClick={() => handleToggle('discreetPackaging')}
                    className={`w-14 h-8 rounded-full transition-colors relative ${
                      autonomousSettings.discreetPackaging ? 'bg-charcoal-deep' : 'bg-sand'
                    }`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
                      autonomousSettings.discreetPackaging ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Notify before/after from Zero UI */}
                {zeroConfig && (
                  <>
                    <div className="flex items-center justify-between py-4 border-b border-sand">
                      <div>
                        <p className="font-medium text-charcoal-deep">Notify Before Purchase</p>
                        <p className="text-sm text-stone">Get a heads-up before AI completes a transaction</p>
                      </div>
                      <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${zeroConfig.preferences.notifyBefore ? 'bg-success/10 text-success' : 'bg-stone/10 text-stone'}`}>
                        {zeroConfig.preferences.notifyBefore ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-sand">
                      <div>
                        <p className="font-medium text-charcoal-deep">Notify After Purchase</p>
                        <p className="text-sm text-stone">Receive confirmation after each automated purchase</p>
                      </div>
                      <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${zeroConfig.preferences.notifyAfter ? 'bg-success/10 text-success' : 'bg-stone/10 text-stone'}`}>
                        {zeroConfig.preferences.notifyAfter ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </>
                )}

                {/* Notification frequency */}
                <div className="pt-4">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-4">Notification Frequency</p>
                  <div className="space-y-3">
                    {['immediate', 'daily_digest', 'weekly'].map((option) => (
                      <button
                        key={option}
                        onClick={() => updateAutonomousSettings({ notificationPreference: option as 'immediate' | 'daily_digest' | 'weekly' })}
                        className={`w-full p-4 border text-left transition-all ${
                          autonomousSettings.notificationPreference === option
                            ? 'border-charcoal-deep bg-parchment'
                            : 'border-sand hover:border-charcoal-deep'
                        }`}
                      >
                        <p className="font-medium text-charcoal-deep capitalize">
                          {option.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-stone">
                          {option === 'immediate' && 'Get notified for each purchase immediately'}
                          {option === 'daily_digest' && 'Receive a daily summary of autonomous activity'}
                          {option === 'weekly' && 'Weekly summary of all autonomous purchases'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 5: Recent Activity ── */}
            {autonomousActivity.length > 0 && (
              <div className="bg-white p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-lg text-charcoal-deep flex items-center gap-3">
                    <Package size={20} className="text-stone" />
                    Recent Activity
                  </h3>
                  <Link
                    href="/profile/silent-cart"
                    className="text-sm text-charcoal-deep hover:text-gold-muted transition-colors tracking-[0.1em] uppercase flex items-center gap-1"
                  >
                    View All
                    <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="space-y-4">
                  {autonomousActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 py-3 border-b border-sand last:border-0">
                      <div className={`w-10 h-10 flex items-center justify-center ${
                        activity.type === 'auto_purchased' ? 'bg-success/10' :
                        activity.type === 'awaiting_approval' ? 'bg-gold-muted/10' :
                        activity.type === 'prepared' ? 'bg-parchment' : 'bg-stone/10'
                      }`}>
                        <Package size={18} className={
                          activity.type === 'auto_purchased' ? 'text-success' :
                          activity.type === 'awaiting_approval' ? 'text-gold-muted' :
                          activity.type === 'prepared' ? 'text-charcoal-deep' : 'text-stone'
                        } />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-charcoal-deep truncate">{activity.product.name}</p>
                        <p className="text-sm text-stone">{activity.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-charcoal-deep">{formatPrice(activity.price)}</p>
                        <p className={`text-xs capitalize ${
                          activity.type === 'auto_purchased' ? 'text-success' :
                          activity.type === 'awaiting_approval' ? 'text-gold-muted' : 'text-taupe'
                        }`}>
                          {activity.type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

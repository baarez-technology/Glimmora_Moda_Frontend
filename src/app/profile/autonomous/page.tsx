'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Crown, Zap, DollarSign, ShoppingBag, Eye, EyeOff, Package, Bell, ChevronRight, Info } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { ProductCategory } from '@/types';

export default function AutonomousShoppingPage() {
  const router = useRouter();
  const { isUHNI, autonomousSettings, updateAutonomousSettings, autonomousActivity, showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Redirect non-UHNI users
  useEffect(() => {
    if (!isUHNI) {
      router.push('/profile');
    }
  }, [isUHNI, router]);

  if (!isUHNI || !autonomousSettings) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const categories: { value: ProductCategory; label: string }[] = [
    { value: 'bags', label: 'Bags' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'shoes', label: 'Shoes' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'watches', label: 'Watches' },
  ];

  const handleToggle = (key: keyof typeof autonomousSettings) => {
    if (typeof autonomousSettings[key] === 'boolean') {
      updateAutonomousSettings({ [key]: !autonomousSettings[key] });
    }
  };

  const handleCategoryToggle = (category: ProductCategory) => {
    const current = autonomousSettings.categories;
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    updateAutonomousSettings({ categories: updated });
  };

  const budgetUsedPercent = (autonomousSettings.currentMonthSpend / autonomousSettings.monthlyBudget) * 100;

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[1000px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>

          <div className={`flex items-center gap-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="w-14 h-14 bg-gold-soft/20 flex items-center justify-center">
              <Zap size={28} className="text-gold-soft" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown size={12} className="text-gold-soft" />
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                  UHNI Exclusive
                </span>
              </div>
              <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
                Autonomous Shopping
              </h1>
              <p className="text-sand mt-2">Zero-UI Commerce Settings</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`max-w-[1000px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* How It Works */}
        <div className="bg-parchment p-6 border border-sand mb-10">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-charcoal-deep flex items-center justify-center flex-shrink-0">
              <Info size={14} className="text-ivory-cream" />
            </div>
            <div>
              <p className="font-medium text-charcoal-deep mb-2">How Autonomous Shopping Works</p>
              <p className="text-sm text-stone">
                When enabled, our AI will automatically prepare and optionally purchase items that match your style profile.
                Items within your auto-approve threshold will be purchased automatically. Items above the threshold will be
                held for your review. You maintain full control and can adjust settings at any time.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Master Toggle */}
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

          {/* Budget Section */}
          <div className="bg-white p-8">
            <h3 className="font-display text-lg text-charcoal-deep mb-6 flex items-center gap-3">
              <DollarSign size={20} className="text-stone" />
              Monthly Budget
            </h3>

            <div className="space-y-6">
              {/* Budget Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-stone">Spent this month</span>
                  <span className="text-charcoal-deep font-medium">
                    €{autonomousSettings.currentMonthSpend.toLocaleString()} / €{autonomousSettings.monthlyBudget.toLocaleString()}
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
                  €{(autonomousSettings.monthlyBudget - autonomousSettings.currentMonthSpend).toLocaleString()} remaining
                </p>
              </div>

              {/* Auto-Approve Threshold */}
              <div className="pt-6 border-t border-sand">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-charcoal-deep">Auto-Approve Threshold</p>
                    <p className="text-sm text-stone">Items below this amount will be purchased automatically</p>
                  </div>
                  <p className="font-display text-2xl text-charcoal-deep">
                    €{autonomousSettings.autoApproveThreshold.toLocaleString()}
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
                  <span>€1,000</span>
                  <span>€20,000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white p-8">
            <h3 className="font-display text-lg text-charcoal-deep mb-6 flex items-center gap-3">
              <ShoppingBag size={20} className="text-stone" />
              Enabled Categories
            </h3>
            <p className="text-sm text-stone mb-6">Select which product categories can be purchased autonomously</p>

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
          </div>

          {/* Privacy & Discretion */}
          <div className="bg-white p-8">
            <h3 className="font-display text-lg text-charcoal-deep mb-6 flex items-center gap-3">
              {autonomousSettings.invisibleCommerceMode ? <EyeOff size={20} className="text-stone" /> : <Eye size={20} className="text-stone" />}
              Privacy & Discretion
            </h3>

            <div className="space-y-6">
              {/* Invisible Commerce Mode */}
              <div className="flex items-center justify-between py-4 border-b border-sand">
                <div>
                  <p className="font-medium text-charcoal-deep">Invisible Commerce Mode</p>
                  <p className="text-sm text-stone">No email confirmations, minimal digital trail</p>
                </div>
                <button
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

              {/* Discreet Packaging */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium text-charcoal-deep">Discreet Packaging</p>
                  <p className="text-sm text-stone">Unbranded exterior, no product descriptions visible</p>
                </div>
                <button
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
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white p-8">
            <h3 className="font-display text-lg text-charcoal-deep mb-6 flex items-center gap-3">
              <Bell size={20} className="text-stone" />
              Notifications
            </h3>

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

          {/* Recent Activity */}
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
                {autonomousActivity.slice(0, 3).map((activity) => (
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
                      <p className="font-medium text-charcoal-deep">€{activity.price.toLocaleString()}</p>
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
    </div>
  );
}

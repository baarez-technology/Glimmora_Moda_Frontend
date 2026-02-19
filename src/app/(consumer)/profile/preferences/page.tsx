'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Settings, Bell, Lock, ShoppingBag, Monitor, Save, Check, RotateCcw, Shield } from 'lucide-react';
import * as userService from '@/services/user.service';
import { useAuth } from '@/context/AuthContext';
import type { UserPreferences } from '@/types';

export default function PreferencesPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push('/auth/login/consumer?redirect=/profile/preferences');
  }, [isAuthenticated, isHydrated, router]);

  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [initialPreferences, setInitialPreferences] = useState<UserPreferences | null>(null);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [budgetError, setBudgetError] = useState('');

  useEffect(() => {
    const loadPreferences = async () => {
      const response = await userService.getUserPreferences();
      setPreferences(response.data);
      setInitialPreferences(response.data);
      setIsLoaded(true);
    };
    loadPreferences();
  }, []);

  const updatePreference = <T extends keyof UserPreferences>(
    category: T,
    key: keyof UserPreferences[T],
    value: UserPreferences[T][keyof UserPreferences[T]]
  ) => {
    setPreferences((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [category]: {
          ...(prev[category] as object),
          [key]: value
        }
      };
    });
    setHasChanges(true);
  };

  const handleAddBrand = () => {
    const trimmed = newBrandName.trim();
    if (!trimmed || !preferences) return;
    if (preferences.shopping.preferredBrands.includes(trimmed)) {
      setNewBrandName('');
      setShowAddBrand(false);
      return;
    }
    updatePreference('shopping', 'preferredBrands', [...preferences.shopping.preferredBrands, trimmed]);
    setNewBrandName('');
    setShowAddBrand(false);
  };

  const handleRemoveBrand = (brand: string) => {
    if (!preferences) return;
    updatePreference('shopping', 'preferredBrands', preferences.shopping.preferredBrands.filter(b => b !== brand));
  };

  const handleSave = () => {
    if (preferences) {
      localStorage.setItem('moda-user-preferences', JSON.stringify(preferences));
      setInitialPreferences(preferences);
    }
    setSaved(true);
    setHasChanges(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (initialPreferences) {
      setPreferences(initialPreferences);
    }
    setHasChanges(false);
  };

  if (!preferences) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep sticky top-0 z-10">
        <div className="max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>

          <div className={`flex items-center justify-between transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-ivory-cream/10 flex items-center justify-center">
                <Settings size={24} className="text-ivory-cream" />
              </div>
              <div>
                <h1 className="font-display text-2xl text-ivory-cream">
                  Preferences
                </h1>
                <p className="text-sm text-sand">Customize your experience</p>
              </div>
            </div>

            <div className="flex gap-3">
              {hasChanges && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-5 py-3 text-sm text-sand hover:text-ivory-cream transition-colors"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex items-center gap-2 px-6 py-3 bg-ivory-cream text-charcoal-deep text-sm tracking-[0.15em] uppercase disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
              >
                {saved ? (
                  <>
                    <Check size={16} />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12 space-y-8 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Notifications Section */}
        <section className="bg-white overflow-hidden">
          <div className="p-6 border-b border-sand flex items-center gap-3">
            <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
              <Bell size={18} className="text-charcoal-deep" />
            </div>
            <div>
              <h2 className="font-medium text-charcoal-deep">Notifications</h2>
              <p className="text-sm text-stone">Control what alerts you receive</p>
            </div>
          </div>

          <div className="divide-y divide-sand">
            {[
              { key: 'restockAlerts', label: 'Restock Alerts', desc: 'Get notified when watched items are back in stock' },
              { key: 'newArrivals', label: 'New Arrivals', desc: 'Discover new pieces from brands you follow' },
              { key: 'priceChanges', label: 'Price Changes', desc: 'Alert when items in your considerations change price' },
              { key: 'outfitSuggestions', label: 'Outfit Suggestions', desc: 'Receive curated outfit ideas based on your wardrobe' },
              { key: 'eventReminders', label: 'Event Reminders', desc: 'Get outfit suggestions before calendar events' }
            ].map((item) => {
              const checked = !!preferences.notifications[item.key as keyof typeof preferences.notifications];
              return (
                <label key={item.key} className="flex items-center justify-between p-6 cursor-pointer hover:bg-parchment/50 transition-colors">
                  <div>
                    <p className="text-charcoal-deep">{item.label}</p>
                    <p className="text-sm text-stone">{item.desc}</p>
                  </div>
                  <span className="relative">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => updatePreference('notifications', item.key as keyof UserPreferences['notifications'], !checked)}
                      className="sr-only peer"
                    />
                    <span
                      className={`w-6 h-6 border-2 flex items-center justify-center cursor-pointer transition-all ${
                        checked
                          ? 'border-charcoal-deep bg-charcoal-deep'
                          : 'border-sand peer-focus-visible:border-charcoal-deep hover:border-charcoal-deep'
                      }`}
                    >
                      {checked && (
                        <svg className="w-3 h-3 text-ivory-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        {/* Privacy Section */}
        <section className="bg-white overflow-hidden">
          <div className="p-6 border-b border-sand flex items-center gap-3">
            <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
              <Lock size={18} className="text-charcoal-deep" />
            </div>
            <div>
              <h2 className="font-medium text-charcoal-deep">Privacy</h2>
              <p className="text-sm text-stone">Control how your data is used</p>
            </div>
          </div>

          <div className="divide-y divide-sand">
            {[
              { key: 'shareWardrobeInsights', label: 'Share Wardrobe Insights', desc: 'Allow aggregate wardrobe data to improve recommendations' },
              { key: 'allowAGILearning', label: 'Personalized Learning', desc: 'Let our system learn from your preferences' },
              { key: 'shareStylePreferences', label: 'Share Style Preferences', desc: 'Allow anonymized style data to improve the platform' }
            ].map((item) => {
              const checked = !!preferences.privacy[item.key as keyof typeof preferences.privacy];
              return (
                <label key={item.key} className="flex items-center justify-between p-6 cursor-pointer hover:bg-parchment/50 transition-colors">
                  <div>
                    <p className="text-charcoal-deep">{item.label}</p>
                    <p className="text-sm text-stone">{item.desc}</p>
                  </div>
                  <span className="relative">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => updatePreference('privacy', item.key as keyof UserPreferences['privacy'], !checked)}
                      className="sr-only peer"
                    />
                    <span
                      className={`w-6 h-6 border-2 flex items-center justify-center cursor-pointer transition-all ${
                        checked
                          ? 'border-charcoal-deep bg-charcoal-deep'
                          : 'border-sand peer-focus-visible:border-charcoal-deep hover:border-charcoal-deep'
                      }`}
                    >
                      {checked && (
                        <svg className="w-3 h-3 text-ivory-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          <div className="p-6 bg-parchment/50">
            <div className="flex items-start gap-3">
              <Shield size={18} className="text-stone mt-0.5 flex-shrink-0" />
              <p className="text-sm text-stone">
                Your data is always encrypted and never sold. These settings control how
                we personalize your experience. You can change them anytime.
              </p>
            </div>
          </div>
        </section>

        {/* Shopping Section */}
        <section className="bg-white overflow-hidden">
          <div className="p-6 border-b border-sand flex items-center gap-3">
            <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
              <ShoppingBag size={18} className="text-charcoal-deep" />
            </div>
            <div>
              <h2 className="font-medium text-charcoal-deep">Shopping</h2>
              <p className="text-sm text-stone">Customize your shopping experience</p>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <div>
              <label className="text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-4 block">Budget Range</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-taupe block mb-2">Minimum</span>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone">€</span>
                    <input
                      type="number"
                      value={preferences.shopping.budgetMin}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        if (val > preferences.shopping.budgetMax) {
                          setBudgetError('Minimum cannot exceed maximum');
                          setTimeout(() => setBudgetError(''), 3000);
                          updatePreference('shopping', 'budgetMin', preferences.shopping.budgetMax);
                        } else {
                          setBudgetError('');
                          updatePreference('shopping', 'budgetMin', val);
                        }
                      }}
                      className="w-full pl-10 pr-4 py-4 border border-sand focus:outline-none focus:border-charcoal-deep transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <span className="text-xs text-taupe block mb-2">Maximum</span>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone">€</span>
                    <input
                      type="number"
                      value={preferences.shopping.budgetMax}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        if (val < preferences.shopping.budgetMin) {
                          setBudgetError('Maximum cannot be less than minimum');
                          setTimeout(() => setBudgetError(''), 3000);
                          updatePreference('shopping', 'budgetMax', preferences.shopping.budgetMin);
                        } else {
                          setBudgetError('');
                          updatePreference('shopping', 'budgetMax', val);
                        }
                      }}
                      className="w-full pl-10 pr-4 py-4 border border-sand focus:outline-none focus:border-charcoal-deep transition-colors"
                    />
                  </div>
                </div>
              </div>
              {budgetError && (
                <p className="mt-2 text-xs text-error" role="alert">{budgetError}</p>
              )}
            </div>

            <div>
              <label className="text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-4 block">Preferred Brands</label>
              <div className="flex flex-wrap gap-2">
                {preferences.shopping.preferredBrands.map((brand) => (
                  <span key={brand} className="group px-4 py-2 bg-parchment text-sm text-charcoal-deep flex items-center gap-2">
                    {brand}
                    <button
                      onClick={() => handleRemoveBrand(brand)}
                      className="text-stone/40 hover:text-error transition-colors"
                      aria-label={`Remove ${brand}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
                {showAddBrand ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddBrand(); if (e.key === 'Escape') { setShowAddBrand(false); setNewBrandName(''); } }}
                      placeholder="Brand name"
                      autoFocus
                      className="px-3 py-2 border border-sand text-sm focus:outline-none focus:border-charcoal-deep transition-colors w-40"
                    />
                    <button
                      onClick={handleAddBrand}
                      disabled={!newBrandName.trim()}
                      className="px-3 py-2 bg-charcoal-deep text-ivory-cream text-sm hover:bg-noir transition-colors disabled:opacity-50"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setShowAddBrand(false); setNewBrandName(''); }}
                      className="px-2 py-2 text-sm text-stone hover:text-charcoal-deep transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddBrand(true)}
                    className="px-4 py-2 border border-dashed border-sand text-sm text-taupe hover:border-charcoal-deep hover:text-charcoal-deep transition-colors"
                  >
                    + Add Brand
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2 block">Excluded Categories</label>
              <p className="text-xs text-taupe mb-4">Items in these categories won't be suggested</p>
              <div className="flex flex-wrap gap-2">
                {['bags', 'shoes', 'jewelry', 'watches', 'accessories', 'clothing'].map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      const excluded = preferences.shopping.excludedCategories;
                      if (excluded.includes(category)) {
                        updatePreference('shopping', 'excludedCategories', excluded.filter(c => c !== category));
                      } else {
                        updatePreference('shopping', 'excludedCategories', [...excluded, category]);
                      }
                    }}
                    className={`px-4 py-2 text-sm transition-colors capitalize ${
                      preferences.shopping.excludedCategories.includes(category)
                        ? 'bg-error/10 text-error border border-error/30'
                        : 'bg-parchment text-stone hover:bg-sand'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Display Section */}
        <section className="bg-white overflow-hidden">
          <div className="p-6 border-b border-sand flex items-center gap-3">
            <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
              <Monitor size={18} className="text-charcoal-deep" />
            </div>
            <div>
              <h2 className="font-medium text-charcoal-deep">Display</h2>
              <p className="text-sm text-stone">Regional and language settings</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3 block">Currency</label>
              <select
                value={preferences.display.currency}
                onChange={(e) => updatePreference('display', 'currency', e.target.value as 'EUR' | 'USD' | 'GBP')}
                className="w-full px-5 py-4 border border-sand focus:outline-none focus:border-charcoal-deep transition-colors"
              >
                <option value="EUR">Euro (€)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3 block">Measurement Unit</label>
              <div className="flex gap-3">
                <button
                  onClick={() => updatePreference('display', 'measurementUnit', 'metric')}
                  className={`flex-1 py-4 border-2 transition-colors ${
                    preferences.display.measurementUnit === 'metric'
                      ? 'border-charcoal-deep bg-parchment'
                      : 'border-sand hover:border-charcoal-deep'
                  }`}
                >
                  Metric (cm, kg)
                </button>
                <button
                  onClick={() => updatePreference('display', 'measurementUnit', 'imperial')}
                  className={`flex-1 py-4 border-2 transition-colors ${
                    preferences.display.measurementUnit === 'imperial'
                      ? 'border-charcoal-deep bg-parchment'
                      : 'border-sand hover:border-charcoal-deep'
                  }`}
                >
                  Imperial (in, lb)
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

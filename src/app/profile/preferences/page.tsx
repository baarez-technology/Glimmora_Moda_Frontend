'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, Bell, Lock, ShoppingBag, Monitor, Save, Check, RotateCcw, Sparkles } from 'lucide-react';
import { mockUserPreferences } from '@/data/mock-data';
import type { UserPreferences } from '@/types';

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<UserPreferences>(mockUserPreferences);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updatePreference = <T extends keyof UserPreferences>(
    category: T,
    key: keyof UserPreferences[T],
    value: UserPreferences[T][keyof UserPreferences[T]]
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] as object),
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setSaved(true);
    setHasChanges(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setPreferences(mockUserPreferences);
    setHasChanges(false);
  };

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-white border-b border-sand sticky top-0 z-10">
        <div className="max-w-[800px] mx-auto px-6 lg:px-12 py-6">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-stone hover:text-charcoal-deep transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-charcoal-deep/10 rounded-full flex items-center justify-center">
                <Settings size={20} className="text-charcoal-deep" />
              </div>
              <div>
                <h1 className="font-display text-2xl text-charcoal-deep">
                  Preferences
                </h1>
                <p className="text-sm text-stone">Customize your experience</p>
              </div>
            </div>

            <div className="flex gap-3">
              {hasChanges && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-stone hover:text-charcoal-deep transition-colors"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saved ? (
                  <>
                    <Check size={16} />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 lg:px-12 py-8 space-y-8">
        {/* Notifications Section */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-sand flex items-center gap-3">
            <Bell size={20} className="text-stone" />
            <div>
              <h2 className="font-medium text-charcoal-deep">Notifications</h2>
              <p className="text-sm text-stone">Control what alerts you receive</p>
            </div>
          </div>

          <div className="divide-y divide-sand">
            <label className="flex items-center justify-between p-5 cursor-pointer hover:bg-parchment/50 transition-colors">
              <div>
                <p className="text-charcoal-deep">Restock Alerts</p>
                <p className="text-sm text-stone">Get notified when watched items are back in stock</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifications.restockAlerts}
                onChange={(e) => updatePreference('notifications', 'restockAlerts', e.target.checked)}
                className="w-5 h-5 rounded border-sand text-gold-muted focus:ring-gold-muted"
              />
            </label>

            <label className="flex items-center justify-between p-5 cursor-pointer hover:bg-parchment/50 transition-colors">
              <div>
                <p className="text-charcoal-deep">New Arrivals</p>
                <p className="text-sm text-stone">Discover new pieces from brands you follow</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifications.newArrivals}
                onChange={(e) => updatePreference('notifications', 'newArrivals', e.target.checked)}
                className="w-5 h-5 rounded border-sand text-gold-muted focus:ring-gold-muted"
              />
            </label>

            <label className="flex items-center justify-between p-5 cursor-pointer hover:bg-parchment/50 transition-colors">
              <div>
                <p className="text-charcoal-deep">Price Changes</p>
                <p className="text-sm text-stone">Alert when items in your considerations change price</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifications.priceChanges}
                onChange={(e) => updatePreference('notifications', 'priceChanges', e.target.checked)}
                className="w-5 h-5 rounded border-sand text-gold-muted focus:ring-gold-muted"
              />
            </label>

            <label className="flex items-center justify-between p-5 cursor-pointer hover:bg-parchment/50 transition-colors">
              <div>
                <p className="text-charcoal-deep">Outfit Suggestions</p>
                <p className="text-sm text-stone">Receive curated outfit ideas from Fashion Intelligence</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifications.outfitSuggestions}
                onChange={(e) => updatePreference('notifications', 'outfitSuggestions', e.target.checked)}
                className="w-5 h-5 rounded border-sand text-gold-muted focus:ring-gold-muted"
              />
            </label>

            <label className="flex items-center justify-between p-5 cursor-pointer hover:bg-parchment/50 transition-colors">
              <div>
                <p className="text-charcoal-deep">Event Reminders</p>
                <p className="text-sm text-stone">Get outfit suggestions before calendar events</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifications.eventReminders}
                onChange={(e) => updatePreference('notifications', 'eventReminders', e.target.checked)}
                className="w-5 h-5 rounded border-sand text-gold-muted focus:ring-gold-muted"
              />
            </label>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-sand flex items-center gap-3">
            <Lock size={20} className="text-stone" />
            <div>
              <h2 className="font-medium text-charcoal-deep">Privacy</h2>
              <p className="text-sm text-stone">Control how your data is used</p>
            </div>
          </div>

          <div className="divide-y divide-sand">
            <label className="flex items-center justify-between p-5 cursor-pointer hover:bg-parchment/50 transition-colors">
              <div>
                <p className="text-charcoal-deep">Share Wardrobe Insights</p>
                <p className="text-sm text-stone">Allow aggregate wardrobe data to improve recommendations</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.privacy.shareWardrobeInsights}
                onChange={(e) => updatePreference('privacy', 'shareWardrobeInsights', e.target.checked)}
                className="w-5 h-5 rounded border-sand text-gold-muted focus:ring-gold-muted"
              />
            </label>

            <label className="flex items-center justify-between p-5 cursor-pointer hover:bg-parchment/50 transition-colors">
              <div>
                <p className="text-charcoal-deep">Allow AGI Learning</p>
                <p className="text-sm text-stone">Let Fashion Intelligence learn from your preferences</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.privacy.allowAGILearning}
                onChange={(e) => updatePreference('privacy', 'allowAGILearning', e.target.checked)}
                className="w-5 h-5 rounded border-sand text-gold-muted focus:ring-gold-muted"
              />
            </label>

            <label className="flex items-center justify-between p-5 cursor-pointer hover:bg-parchment/50 transition-colors">
              <div>
                <p className="text-charcoal-deep">Share Style Preferences</p>
                <p className="text-sm text-stone">Allow anonymized style data to improve the platform</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.privacy.shareStylePreferences}
                onChange={(e) => updatePreference('privacy', 'shareStylePreferences', e.target.checked)}
                className="w-5 h-5 rounded border-sand text-gold-muted focus:ring-gold-muted"
              />
            </label>
          </div>

          <div className="p-5 bg-parchment/50">
            <div className="flex items-start gap-3">
              <Sparkles size={18} className="text-sapphire-subtle mt-0.5 flex-shrink-0" />
              <p className="text-sm text-stone">
                Your data is always encrypted and never sold. These settings control how
                Fashion Intelligence personalizes your experience. You can change them anytime.
              </p>
            </div>
          </div>
        </section>

        {/* Shopping Section */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-sand flex items-center gap-3">
            <ShoppingBag size={20} className="text-stone" />
            <div>
              <h2 className="font-medium text-charcoal-deep">Shopping</h2>
              <p className="text-sm text-stone">Customize your shopping experience</p>
            </div>
          </div>

          <div className="p-5 space-y-6">
            <div>
              <label className="text-sm text-stone mb-2 block">Budget Range</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-greige">Minimum</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone">€</span>
                    <input
                      type="number"
                      value={preferences.shopping.budgetMin}
                      onChange={(e) => updatePreference('shopping', 'budgetMin', parseInt(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-muted"
                    />
                  </div>
                </div>
                <div>
                  <span className="text-xs text-greige">Maximum</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone">€</span>
                    <input
                      type="number"
                      value={preferences.shopping.budgetMax}
                      onChange={(e) => updatePreference('shopping', 'budgetMax', parseInt(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-muted"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm text-stone mb-2 block">Preferred Brands</label>
              <div className="flex flex-wrap gap-2">
                {preferences.shopping.preferredBrands.map((brand) => (
                  <span key={brand} className="px-3 py-1 bg-parchment text-sm text-charcoal-deep rounded-full">
                    {brand}
                  </span>
                ))}
                <button className="px-3 py-1 border border-dashed border-sand text-sm text-greige rounded-full hover:border-gold-muted hover:text-gold-muted transition-colors">
                  + Add Brand
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-stone mb-2 block">Excluded Categories</label>
              <p className="text-xs text-greige mb-2">Items in these categories won't be suggested</p>
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
                    className={`px-3 py-1 text-sm rounded-full transition-colors capitalize ${
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
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-sand flex items-center gap-3">
            <Monitor size={20} className="text-stone" />
            <div>
              <h2 className="font-medium text-charcoal-deep">Display</h2>
              <p className="text-sm text-stone">Regional and language settings</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="text-sm text-stone mb-2 block">Currency</label>
              <select
                value={preferences.display.currency}
                onChange={(e) => updatePreference('display', 'currency', e.target.value as 'EUR' | 'USD' | 'GBP')}
                className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-muted"
              >
                <option value="EUR">Euro (€)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-stone mb-2 block">Measurement Unit</label>
              <div className="flex gap-3">
                <button
                  onClick={() => updatePreference('display', 'measurementUnit', 'metric')}
                  className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                    preferences.display.measurementUnit === 'metric'
                      ? 'border-charcoal-deep bg-parchment'
                      : 'border-sand hover:border-gold-muted'
                  }`}
                >
                  Metric (cm, kg)
                </button>
                <button
                  onClick={() => updatePreference('display', 'measurementUnit', 'imperial')}
                  className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                    preferences.display.measurementUnit === 'imperial'
                      ? 'border-charcoal-deep bg-parchment'
                      : 'border-sand hover:border-gold-muted'
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

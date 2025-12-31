'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Lock, Globe, Trash2, Shield } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function SettingsPage() {
  const router = useRouter();
  const { showToast } = useApp();
  const [notifications, setNotifications] = useState({
    newArrivals: true,
    priceChanges: false,
    restockAlerts: true,
    fashionInsights: true
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleManageFashionIdentity = () => {
    router.push('/onboarding');
  };

  const handleClearBrowsingHistory = () => {
    localStorage.removeItem('moda-browsing-history');
    showToast('Browsing history cleared', 'success');
  };

  const handleDownloadData = () => {
    // Collect all user data from localStorage
    const userData = {
      fashionIdentity: localStorage.getItem('moda-fashion-identity'),
      considerations: localStorage.getItem('moda-considerations'),
      wardrobe: localStorage.getItem('moda-wardrobe'),
      outfits: localStorage.getItem('moda-outfits'),
      orders: localStorage.getItem('moda-orders'),
      exportedAt: new Date().toISOString()
    };

    // Create and download JSON file
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

  const handleEnable2FA = () => {
    showToast('Two-factor authentication setup coming soon', 'info');
  };

  const handleDeleteAccount = () => {
    // Clear all localStorage data
    localStorage.removeItem('moda-fashion-identity');
    localStorage.removeItem('moda-considerations');
    localStorage.removeItem('moda-wardrobe');
    localStorage.removeItem('moda-outfits');
    localStorage.removeItem('moda-orders');
    localStorage.removeItem('moda-restock-alerts');
    localStorage.removeItem('moda-browsing-history');
    showToast('Account data deleted', 'success');
    setShowDeleteConfirm(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="max-w-[800px] mx-auto px-6 lg:px-12 py-8">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm text-stone hover:text-charcoal-deep transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Profile
        </Link>

        <h1 className="font-display text-3xl md:text-4xl text-charcoal-deep">
          Settings
        </h1>
      </div>

      {/* Settings Sections */}
      <div className="max-w-[800px] mx-auto px-6 lg:px-12 pb-20 space-y-8">
        {/* Notifications */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Bell size={20} className="text-stone" />
            <h2 className="font-display text-xl text-charcoal-deep">Notifications</h2>
          </div>

          <div className="space-y-4">
            {[
              { id: 'newArrivals', label: 'New Arrivals', desc: 'Be the first to know about new pieces' },
              { id: 'priceChanges', label: 'Price Changes', desc: 'Get notified about price updates' },
              { id: 'restockAlerts', label: 'Restock Alerts', desc: 'Know when items are back in stock' },
              { id: 'fashionInsights', label: 'Fashion Intelligence Insights', desc: 'Personalized style recommendations' }
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-sand last:border-0">
                <div>
                  <p className="font-medium text-charcoal-deep">{item.label}</p>
                  <p className="text-sm text-stone">{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications({
                    ...notifications,
                    [item.id]: !notifications[item.id as keyof typeof notifications]
                  })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    notifications[item.id as keyof typeof notifications]
                      ? 'bg-gold-muted'
                      : 'bg-sand'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      notifications[item.id as keyof typeof notifications]
                        ? 'translate-x-7'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={20} className="text-stone" />
            <h2 className="font-display text-xl text-charcoal-deep">Privacy</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-sand">
              <div>
                <p className="font-medium text-charcoal-deep">Fashion Identity Data</p>
                <p className="text-sm text-stone">Your preferences and style profile</p>
              </div>
              <button
                onClick={handleManageFashionIdentity}
                className="text-sm text-gold-muted hover:text-gold-deep"
              >
                Manage
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-sand">
              <div>
                <p className="font-medium text-charcoal-deep">Browsing History</p>
                <p className="text-sm text-stone">Products and stories you've viewed</p>
              </div>
              <button
                onClick={handleClearBrowsingHistory}
                className="text-sm text-gold-muted hover:text-gold-deep"
              >
                Clear
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-charcoal-deep">Download My Data</p>
                <p className="text-sm text-stone">Get a copy of all your data</p>
              </div>
              <button
                onClick={handleDownloadData}
                className="text-sm text-gold-muted hover:text-gold-deep"
              >
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Lock size={20} className="text-stone" />
            <h2 className="font-display text-xl text-charcoal-deep">Security</h2>
          </div>

          <div className="space-y-4">
            <Link
              href="/profile/settings/password"
              className="flex items-center justify-between py-3 border-b border-sand"
            >
              <div>
                <p className="font-medium text-charcoal-deep">Change Password</p>
                <p className="text-sm text-stone">Update your password</p>
              </div>
              <span className="text-sm text-gold-muted">Update</span>
            </Link>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-charcoal-deep">Two-Factor Authentication</p>
                <p className="text-sm text-stone">Add an extra layer of security</p>
              </div>
              <button
                onClick={handleEnable2FA}
                className="text-sm text-gold-muted hover:text-gold-deep"
              >
                Enable
              </button>
            </div>
          </div>
        </div>

        {/* Language & Region */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Globe size={20} className="text-stone" />
            <h2 className="font-display text-xl text-charcoal-deep">Language & Region</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-deep mb-2">Language</label>
              <select className="input-luxury">
                <option>English</option>
                <option>Français</option>
                <option>Italiano</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-deep mb-2">Currency</label>
              <select className="input-luxury">
                <option>EUR (€)</option>
                <option>USD ($)</option>
                <option>GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-error-soft/30">
          <div className="flex items-center gap-3 mb-6">
            <Trash2 size={20} className="text-error" />
            <h2 className="font-display text-xl text-charcoal-deep">Delete Account</h2>
          </div>

          <p className="text-stone mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 border border-error text-error rounded hover:bg-error hover:text-ivory-cream transition-colors"
            >
              Delete Account
            </button>
          ) : (
            <div className="p-4 bg-error-soft/10 rounded-lg border border-error-soft/30">
              <p className="text-charcoal-deep font-medium mb-4">
                Are you sure? This will permanently delete all your data.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-error text-ivory-cream rounded hover:bg-error/90 transition-colors"
                >
                  Yes, Delete Everything
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-sand text-charcoal-warm rounded hover:border-charcoal-deep transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

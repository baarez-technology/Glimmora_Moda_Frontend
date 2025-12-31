'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Lock, Globe, Trash2, Shield } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function SettingsPage() {
  const router = useRouter();
  const { showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [notifications, setNotifications] = useState({
    newArrivals: true,
    priceChanges: false,
    restockAlerts: true,
    styleInsights: true
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleManageFashionIdentity = () => {
    router.push('/onboarding');
  };

  const handleClearBrowsingHistory = () => {
    localStorage.removeItem('moda-browsing-history');
    showToast('Browsing history cleared', 'success');
  };

  const handleDownloadData = () => {
    const userData = {
      fashionIdentity: localStorage.getItem('moda-fashion-identity'),
      considerations: localStorage.getItem('moda-considerations'),
      wardrobe: localStorage.getItem('moda-wardrobe'),
      outfits: localStorage.getItem('moda-outfits'),
      orders: localStorage.getItem('moda-orders'),
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

  const handleEnable2FA = () => {
    showToast('Two-factor authentication setup coming soon', 'info');
  };

  const handleDeleteAccount = () => {
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
              Account
            </span>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              Settings
            </h1>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className={`max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12 space-y-8 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Notifications */}
        <div className="bg-white p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
              <Bell size={18} className="text-charcoal-deep" />
            </div>
            <div>
              <h2 className="font-display text-xl text-charcoal-deep">Notifications</h2>
              <p className="text-sm text-stone">Control what alerts you receive</p>
            </div>
          </div>

          <div className="space-y-1">
            {[
              { id: 'newArrivals', label: 'New Arrivals', desc: 'Be the first to know about new pieces' },
              { id: 'priceChanges', label: 'Price Changes', desc: 'Get notified about price updates' },
              { id: 'restockAlerts', label: 'Restock Alerts', desc: 'Know when items are back in stock' },
              { id: 'styleInsights', label: 'Style Insights', desc: 'Personalized style recommendations' }
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between py-5 border-b border-sand last:border-0">
                <div>
                  <p className="font-medium text-charcoal-deep">{item.label}</p>
                  <p className="text-sm text-stone">{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications({
                    ...notifications,
                    [item.id]: !notifications[item.id as keyof typeof notifications]
                  })}
                  className={`w-12 h-7 transition-colors relative ${
                    notifications[item.id as keyof typeof notifications]
                      ? 'bg-charcoal-deep'
                      : 'bg-sand'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 bg-white transition-transform ${
                      notifications[item.id as keyof typeof notifications]
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
              <Shield size={18} className="text-charcoal-deep" />
            </div>
            <div>
              <h2 className="font-display text-xl text-charcoal-deep">Privacy</h2>
              <p className="text-sm text-stone">Manage your data and preferences</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between py-5 border-b border-sand">
              <div>
                <p className="font-medium text-charcoal-deep">Style Profile Data</p>
                <p className="text-sm text-stone">Your preferences and style profile</p>
              </div>
              <button
                onClick={handleManageFashionIdentity}
                className="text-sm text-charcoal-deep hover:text-gold-muted transition-colors tracking-[0.1em] uppercase"
              >
                Manage
              </button>
            </div>
            <div className="flex items-center justify-between py-5 border-b border-sand">
              <div>
                <p className="font-medium text-charcoal-deep">Browsing History</p>
                <p className="text-sm text-stone">Products and stories you've viewed</p>
              </div>
              <button
                onClick={handleClearBrowsingHistory}
                className="text-sm text-charcoal-deep hover:text-gold-muted transition-colors tracking-[0.1em] uppercase"
              >
                Clear
              </button>
            </div>
            <div className="flex items-center justify-between py-5">
              <div>
                <p className="font-medium text-charcoal-deep">Download My Data</p>
                <p className="text-sm text-stone">Get a copy of all your data</p>
              </div>
              <button
                onClick={handleDownloadData}
                className="text-sm text-charcoal-deep hover:text-gold-muted transition-colors tracking-[0.1em] uppercase"
              >
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
              <Lock size={18} className="text-charcoal-deep" />
            </div>
            <div>
              <h2 className="font-display text-xl text-charcoal-deep">Security</h2>
              <p className="text-sm text-stone">Protect your account</p>
            </div>
          </div>

          <div className="space-y-1">
            <Link
              href="/profile/settings/password"
              className="flex items-center justify-between py-5 border-b border-sand group"
            >
              <div>
                <p className="font-medium text-charcoal-deep">Change Password</p>
                <p className="text-sm text-stone">Update your password</p>
              </div>
              <span className="text-sm text-charcoal-deep group-hover:text-gold-muted transition-colors tracking-[0.1em] uppercase">Update</span>
            </Link>
            <div className="flex items-center justify-between py-5">
              <div>
                <p className="font-medium text-charcoal-deep">Two-Factor Authentication</p>
                <p className="text-sm text-stone">Add an extra layer of security</p>
              </div>
              <button
                onClick={handleEnable2FA}
                className="text-sm text-charcoal-deep hover:text-gold-muted transition-colors tracking-[0.1em] uppercase"
              >
                Enable
              </button>
            </div>
          </div>
        </div>

        {/* Language & Region */}
        <div className="bg-white p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
              <Globe size={18} className="text-charcoal-deep" />
            </div>
            <div>
              <h2 className="font-display text-xl text-charcoal-deep">Language & Region</h2>
              <p className="text-sm text-stone">Regional preferences</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">Language</label>
              <select className="w-full px-5 py-4 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors">
                <option>English</option>
                <option>Français</option>
                <option>Italiano</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">Currency</label>
              <select className="w-full px-5 py-4 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors">
                <option>EUR (€)</option>
                <option>USD ($)</option>
                <option>GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white p-8 border border-error/20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-error/10 flex items-center justify-center">
              <Trash2 size={18} className="text-error" />
            </div>
            <div>
              <h2 className="font-display text-xl text-charcoal-deep">Delete Account</h2>
              <p className="text-sm text-stone">Permanently remove your account</p>
            </div>
          </div>

          <p className="text-stone mb-6">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-3 border border-error text-error hover:bg-error hover:text-ivory-cream transition-colors text-sm tracking-[0.15em] uppercase"
            >
              Delete Account
            </button>
          ) : (
            <div className="p-6 bg-error/5 border border-error/20">
              <p className="text-charcoal-deep font-medium mb-6">
                Are you sure? This will permanently delete all your data.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleDeleteAccount}
                  className="px-6 py-3 bg-error text-ivory-cream hover:bg-error/90 transition-colors text-sm tracking-[0.15em] uppercase"
                >
                  Yes, Delete Everything
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-3 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-sm tracking-[0.15em] uppercase"
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

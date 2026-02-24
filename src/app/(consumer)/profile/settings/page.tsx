'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Lock, Globe, Trash2, Shield, LogOut, User, Crown, AlertTriangle, Sun, Moon, Monitor } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { userLogout } from '@/services/auth.service';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, userData: authUserData, logout: authLogout } = useAuth();
  const { showToast, setUserRole, userTier } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('moda-settings-notifications');
        if (saved) return JSON.parse(saved);
      } catch { /* ignore */ }
    }
    return {
      newArrivals: true,
      priceChanges: false,
      restockAlerts: true,
      styleInsights: true
    };
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteFinal, setShowDeleteFinal] = useState(false);
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('EUR');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/auth/login/consumer?redirect=/profile/settings');
    }
  }, [isAuthenticated, isHydrated, router]);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      setIsLoaded(true);
      // Load saved locale and theme preferences
      try {
        const savedLang = localStorage.getItem('moda-language');
        const savedCurrency = localStorage.getItem('moda-currency');
        const savedTheme = localStorage.getItem('moda-theme') as 'light' | 'dark' | 'system' | null;
        if (savedLang) setLanguage(savedLang);
        if (savedCurrency) setCurrency(savedCurrency);
        if (savedTheme) setTheme(savedTheme);
      } catch { /* ignore */ }
    }
  }, [isHydrated, isAuthenticated]);

  // Show loading while checking auth
  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading settings...</p>
        </div>
      </div>
    );
  }

  const handleManageFashionIdentity = () => {
    router.push('/onboarding');
  };

  const handleClearBrowsingHistory = () => {
    const browsingKeys = ['moda-recent-searches', 'moda-browsing-history', 'moda-recently-viewed'];
    browsingKeys.forEach(key => localStorage.removeItem(key));
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

  const handleSignOut = () => {
    userLogout();
    localStorage.removeItem('moda-user-tier');
    authLogout();
    setUserRole('standard');
    showToast('You have been signed out', 'success');
    router.push('/');
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setLanguage(val);
    localStorage.setItem('moda-language', val);
    showToast('Language updated', 'success');
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCurrency(val);
    localStorage.setItem('moda-currency', val);
    showToast('Currency updated', 'success');
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('moda-theme', newTheme);
    if (newTheme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
    showToast(`Theme set to ${newTheme}`, 'success');
  };

  const clearAllUserData = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('moda-'));
    keys.forEach(k => localStorage.removeItem(k));
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== 'DELETE') return;
    clearAllUserData();
    userLogout();
    authLogout();
    setUserRole('standard');
    showToast('Account data deleted', 'success');
    setShowDeleteConfirm(false);
    setShowDeleteFinal(false);
    setDeleteConfirmText('');
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
        {/* Personal Information */}
        <div className="bg-white p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
              <User size={18} className="text-charcoal-deep" />
            </div>
            <div>
              <h2 className="font-display text-xl text-charcoal-deep">Personal Information</h2>
              <p className="text-sm text-stone">Your account details</p>
            </div>
          </div>

          {authUserData ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between py-5 border-b border-sand">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Full Name</p>
                  <p className="font-medium text-charcoal-deep">{authUserData.first_name} {authUserData.last_name}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-5 border-b border-sand">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Email</p>
                  <p className="font-medium text-charcoal-deep">{authUserData.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-5 border-b border-sand">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Account Type</p>
                  <div className="flex items-center gap-2">
                    {authUserData.role === 'uhni' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-soft/10 border border-gold-soft/30">
                        <Crown size={10} className="text-gold-deep" />
                        <span className="text-xs tracking-[0.15em] uppercase text-gold-deep font-medium">UHNI</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-charcoal-deep/5 border border-sand">
                        <span className="text-xs tracking-[0.15em] uppercase text-charcoal-deep font-medium">Consumer</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between py-5 border-b border-sand">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Member Since</p>
                  <p className="font-medium text-charcoal-deep">
                    {new Date(authUserData.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              {authUserData.context_set && (
                <div className="flex items-center justify-between py-5">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Style Preferences</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {authUserData.occasions.map((occ) => (
                        <span key={occ} className="px-3 py-1 border border-sand text-xs text-charcoal-deep capitalize">
                          {occ.replace('-', ' ')}
                        </span>
                      ))}
                      {authUserData.aesthetics.map((aes) => (
                        <span key={aes} className="px-3 py-1 border border-gold-muted/30 text-xs text-gold-deep capitalize">
                          {aes.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleManageFashionIdentity}
                    className="text-sm text-charcoal-deep hover:text-gold-muted transition-colors tracking-[0.1em] uppercase flex-shrink-0"
                  >
                    Update
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between py-5 border-b border-sand">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Account</p>
                  <p className="font-medium text-charcoal-deep capitalize">{userTier} Account</p>
                </div>
              </div>
            </div>
          )}
        </div>

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
                  onClick={() => {
                    const updated = { ...notifications, [item.id]: !notifications[item.id as keyof typeof notifications] };
                    setNotifications(updated);
                    localStorage.setItem('moda-settings-notifications', JSON.stringify(updated));
                  }}
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
              <span
                className="text-sm text-taupe tracking-[0.1em] uppercase cursor-default"
                title="Two-factor authentication is coming soon"
              >
                Coming Soon
              </span>
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
              <select
                value={language}
                onChange={handleLanguageChange}
                className="w-full px-5 py-4 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="it">Italiano</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">Currency</label>
              <select
                value={currency}
                onChange={handleCurrencyChange}
                className="w-full px-5 py-4 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
              <Sun size={18} className="text-charcoal-deep" />
            </div>
            <div>
              <h2 className="font-display text-xl text-charcoal-deep">Appearance</h2>
              <p className="text-sm text-stone">Choose your preferred theme</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {([
              { value: 'light' as const, label: 'Light', icon: Sun },
              { value: 'dark' as const, label: 'Dark', icon: Moon },
              { value: 'system' as const, label: 'System', icon: Monitor },
            ]).map((option) => (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={`flex flex-col items-center gap-3 p-6 border-2 transition-all ${
                  theme === option.value
                    ? 'border-charcoal-deep bg-parchment'
                    : 'border-sand hover:border-charcoal-deep'
                }`}
              >
                <option.icon size={24} className={theme === option.value ? 'text-charcoal-deep' : 'text-stone'} />
                <span className={`text-sm ${theme === option.value ? 'text-charcoal-deep font-medium' : 'text-stone'}`}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Sign Out */}
        <div className="bg-white p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
              <LogOut size={18} className="text-charcoal-deep" />
            </div>
            <div>
              <h2 className="font-display text-xl text-charcoal-deep">Sign Out</h2>
              <p className="text-sm text-stone">
                {authUserData
                  ? `${authUserData.email} — ${authUserData.role === 'uhni' ? 'UHNI' : 'Consumer'} Account`
                  : userTier === 'uhni' ? 'UHNI Account' : 'Consumer Account'}
              </p>
            </div>
          </div>

          <p className="text-stone mb-6">
            Sign out of your account. You can sign back in anytime.
          </p>

          <button
            onClick={handleSignOut}
            className="px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.15em] uppercase"
          >
            Sign Out
          </button>
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
          ) : !showDeleteFinal ? (
            <div className="p-6 bg-error/5 border border-error/20">
              <div className="flex items-start gap-3 mb-6">
                <AlertTriangle size={20} className="text-error flex-shrink-0 mt-0.5" />
                <p className="text-charcoal-deep font-medium">
                  Are you sure? This will permanently delete all your data, including your wardrobe, orders, style profile, and preferences.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteFinal(true)}
                  className="px-6 py-3 bg-error text-ivory-cream hover:bg-error/90 transition-colors text-sm tracking-[0.15em] uppercase"
                >
                  Yes, I Understand
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-3 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-sm tracking-[0.15em] uppercase"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-error/5 border border-error/20">
              <p className="text-charcoal-deep font-medium mb-2">
                Final confirmation required
              </p>
              <p className="text-stone text-sm mb-4">
                Type <span className="font-mono font-bold text-error">DELETE</span> to permanently delete your account.
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder='Type "DELETE" to confirm'
                className="w-full px-4 py-3 border border-error/30 bg-white text-charcoal-deep focus:outline-none focus:border-error mb-4"
              />
              <div className="flex gap-4">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE'}
                  className="px-6 py-3 bg-error text-ivory-cream hover:bg-error/90 transition-colors text-sm tracking-[0.15em] uppercase disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Delete Everything
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setShowDeleteFinal(false); setDeleteConfirmText(''); }}
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

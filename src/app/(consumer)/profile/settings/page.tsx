'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Lock, Globe, Trash2, Shield, LogOut, User, Crown, AlertTriangle, Sun, Moon, Monitor, Search, ChevronDown, Smartphone } from 'lucide-react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { userLogout, updateUserProfile, deleteUserAccount, setup2FA, verify2FASetup, disable2FA } from '@/services/auth.service';
import type { TwoFASetupResponse } from '@/services/auth.service';

// Comprehensive language list
const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'sv', name: 'Swedish', native: 'Svenska' },
  { code: 'da', name: 'Danish', native: 'Dansk' },
  { code: 'no', name: 'Norwegian', native: 'Norsk' },
  { code: 'fi', name: 'Finnish', native: 'Suomi' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', native: 'Bahasa Melayu' },
  { code: 'cs', name: 'Czech', native: 'Čeština' },
  { code: 'el', name: 'Greek', native: 'Ελληνικά' },
  { code: 'he', name: 'Hebrew', native: 'עברית' },
  { code: 'ro', name: 'Romanian', native: 'Română' },
  { code: 'hu', name: 'Hungarian', native: 'Magyar' },
  { code: 'uk', name: 'Ukrainian', native: 'Українська' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
];

// Comprehensive currency list
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
  { code: 'BHD', symbol: 'BD', name: 'Bahraini Dinar' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, userData: authUserData, logout: authLogout } = useAuth();
  const { showToast, setUserRole, userTier } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState<string | null>(null);
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
  const [langSearch, setLangSearch] = useState('');
  const [currencySearch, setCurrencySearch] = useState('');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // 2FA State
  const [twoFASetupData, setTwoFASetupData] = useState<TwoFASetupResponse | null>(null);
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFADisableCode, setTwoFADisableCode] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(authUserData?.is_2fa_enabled ?? false);
  const [twoFAStep, setTwoFAStep] = useState<'idle' | 'setup' | 'verify' | 'disable'>('idle');
  const [twoFALoading, setTwoFALoading] = useState(false);

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

  const handleSignOut = () => {
    userLogout();
    localStorage.removeItem('moda-user-tier');
    authLogout();
    setUserRole('standard');
    showToast('You have been signed out', 'success');
    router.push('/');
  };

  const handleLanguageSelect = async (code: string) => {
    const prev = language;
    setLanguage(code);
    setShowLangDropdown(false);
    setLangSearch('');
    localStorage.setItem('moda-language', code);
    try {
      await updateUserProfile({ language: code });
      showToast('Language updated', 'success');
    } catch {
      setLanguage(prev);
      localStorage.setItem('moda-language', prev);
      showToast('Failed to update language', 'error');
    }
  };

  const handleCurrencySelect = async (code: string) => {
    const prev = currency;
    setCurrency(code);
    setShowCurrencyDropdown(false);
    setCurrencySearch('');
    localStorage.setItem('moda-currency', code);
    try {
      await updateUserProfile({ currency: code });
      showToast('Currency updated', 'success');
    } catch {
      setCurrency(prev);
      localStorage.setItem('moda-currency', prev);
      showToast('Failed to update currency', 'error');
    }
  };

  const filteredLanguages = LANGUAGES.filter(l =>
    l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.native.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.code.toLowerCase().includes(langSearch.toLowerCase())
  );

  const filteredCurrencies = CURRENCIES.filter(c =>
    c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.symbol.includes(currencySearch)
  );

  // 2FA handlers
  const handleSetup2FA = async () => {
    setTwoFALoading(true);
    try {
      const data = await setup2FA();
      setTwoFASetupData(data);
      setTwoFAStep('setup');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to setup 2FA', 'error');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleVerify2FASetup = async () => {
    if (twoFACode.length < 6) return;
    setTwoFALoading(true);
    try {
      const result = await verify2FASetup(twoFACode);
      setIs2FAEnabled(result.is_2fa_enabled);
      setTwoFAStep('idle');
      setTwoFACode('');
      setTwoFASetupData(null);
      showToast('Two-factor authentication enabled', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Invalid code', 'error');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (twoFADisableCode.length < 6) return;
    setTwoFALoading(true);
    try {
      const result = await disable2FA(twoFADisableCode);
      setIs2FAEnabled(result.is_2fa_enabled);
      setTwoFAStep('idle');
      setTwoFADisableCode('');
      showToast('Two-factor authentication disabled', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Invalid code', 'error');
    } finally {
      setTwoFALoading(false);
    }
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

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await deleteUserAccount();
      clearAllUserData();
      userLogout();
      authLogout();
      setUserRole('standard');
      showToast('Account and all associated data deleted', 'success');
      setShowDeleteConfirm(false);
      setShowDeleteFinal(false);
      setDeleteConfirmText('');
      router.push('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete account';
      showToast(message, 'error');
    } finally {
      setIsDeleting(false);
    }
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
              { id: 'newArrivals', apiKey: 'new_arrivals', label: 'New Arrivals', desc: 'Be the first to know about new pieces' },
              { id: 'priceChanges', apiKey: 'price_changes', label: 'Price Changes', desc: 'Get notified about price updates' },
              { id: 'restockAlerts', apiKey: 'restock_alerts', label: 'Restock Alerts', desc: 'Know when items are back in stock' },
              { id: 'styleInsights', apiKey: 'style_insights', label: 'Style Insights', desc: 'Personalized style recommendations' }
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between py-5 border-b border-sand last:border-0">
                <div>
                  <p className="font-medium text-charcoal-deep">{item.label}</p>
                  <p className="text-sm text-stone">{item.desc}</p>
                </div>
                <button
                  disabled={notificationLoading === item.id}
                  onClick={async () => {
                    const newValue = !notifications[item.id as keyof typeof notifications];
                    const updated = { ...notifications, [item.id]: newValue };
                    setNotifications(updated);
                    localStorage.setItem('moda-settings-notifications', JSON.stringify(updated));
                    setNotificationLoading(item.id);
                    try {
                      await updateUserProfile({
                        notifications: { [item.apiKey]: newValue }
                      });
                    } catch {
                      // Revert on failure
                      const reverted = { ...notifications };
                      setNotifications(reverted);
                      localStorage.setItem('moda-settings-notifications', JSON.stringify(reverted));
                      showToast('Failed to update notification', 'error');
                    } finally {
                      setNotificationLoading(null);
                    }
                  }}
                  className={`w-12 h-7 transition-colors relative ${
                    notifications[item.id as keyof typeof notifications]
                      ? 'bg-charcoal-deep'
                      : 'bg-sand'
                  } ${notificationLoading === item.id ? 'opacity-50' : ''}`}
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
            {/* Download My Data - commented out
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
            */}
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
            <div className="py-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium text-charcoal-deep">Two-Factor Authentication</p>
                  <p className="text-sm text-stone">
                    {is2FAEnabled ? 'Your account is protected with 2FA' : 'Add an extra layer of security'}
                  </p>
                </div>
                {twoFAStep === 'idle' && (
                  is2FAEnabled ? (
                    <button
                      onClick={() => setTwoFAStep('disable')}
                      className="text-sm text-error hover:text-error/80 transition-colors tracking-[0.1em] uppercase"
                    >
                      Disable
                    </button>
                  ) : (
                    <button
                      onClick={handleSetup2FA}
                      disabled={twoFALoading}
                      className="text-sm text-charcoal-deep hover:text-gold-muted transition-colors tracking-[0.1em] uppercase flex items-center gap-2"
                    >
                      {twoFALoading && <div className="w-3 h-3 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin" />}
                      Enable
                    </button>
                  )
                )}
              </div>

              {/* 2FA Setup - QR Code */}
              {twoFAStep === 'setup' && twoFASetupData && (
                <div className="p-6 bg-parchment border border-sand">
                  <div className="flex items-center gap-2 mb-4">
                    <Smartphone size={16} className="text-charcoal-deep" />
                    <p className="font-medium text-charcoal-deep text-sm">Scan QR Code</p>
                  </div>
                  <p className="text-sm text-stone mb-6">
                    Open your authenticator app (Google Authenticator, Authy, etc.) and scan this QR code.
                  </p>
                  <div className="flex justify-center mb-6">
                    <div className="bg-white p-4 border border-sand">
                      <Image
                        src={twoFASetupData.qr_code_url}
                        alt="2FA QR Code"
                        width={200}
                        height={200}
                        unoptimized
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Manual Entry Key</p>
                    <div className="bg-white px-4 py-3 border border-sand font-mono text-sm text-charcoal-deep break-all select-all">
                      {twoFASetupData.secret}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                      Enter 6-digit code from your app
                    </label>
                    <input
                      type="text"
                      value={twoFACode}
                      onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-3 border border-sand text-charcoal-deep text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:border-charcoal-deep"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleVerify2FASetup}
                      disabled={twoFACode.length < 6 || twoFALoading}
                      className="flex-1 px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.15em] uppercase disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {twoFALoading && <div className="w-3 h-3 border-2 border-ivory-cream border-t-transparent rounded-full animate-spin" />}
                      Verify & Enable
                    </button>
                    <button
                      onClick={() => { setTwoFAStep('idle'); setTwoFASetupData(null); setTwoFACode(''); }}
                      className="px-6 py-3 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-sm tracking-[0.15em] uppercase"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* 2FA Disable */}
              {twoFAStep === 'disable' && (
                <div className="p-6 bg-error/5 border border-error/20">
                  <p className="font-medium text-charcoal-deep text-sm mb-2">Disable Two-Factor Authentication</p>
                  <p className="text-sm text-stone mb-4">
                    Enter a code from your authenticator app to disable 2FA.
                  </p>
                  <div className="mb-4">
                    <input
                      type="text"
                      value={twoFADisableCode}
                      onChange={(e) => setTwoFADisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-3 border border-error/30 text-charcoal-deep text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:border-error"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDisable2FA}
                      disabled={twoFADisableCode.length < 6 || twoFALoading}
                      className="flex-1 px-6 py-3 bg-error text-ivory-cream hover:bg-error/90 transition-colors text-sm tracking-[0.15em] uppercase disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {twoFALoading && <div className="w-3 h-3 border-2 border-ivory-cream border-t-transparent rounded-full animate-spin" />}
                      Disable 2FA
                    </button>
                    <button
                      onClick={() => { setTwoFAStep('idle'); setTwoFADisableCode(''); }}
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
            {/* Language Selector */}
            <div className="relative">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">Language</label>
              <button
                type="button"
                onClick={() => { setShowLangDropdown(!showLangDropdown); setShowCurrencyDropdown(false); }}
                className="w-full px-5 py-4 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors flex items-center justify-between text-left"
              >
                <span>{LANGUAGES.find(l => l.code === language)?.name || language} ({LANGUAGES.find(l => l.code === language)?.native})</span>
                <ChevronDown size={16} className={`text-taupe transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showLangDropdown && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-sand shadow-lg max-h-72 overflow-hidden flex flex-col">
                  <div className="p-3 border-b border-sand">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe" />
                      <input
                        type="text"
                        value={langSearch}
                        onChange={(e) => setLangSearch(e.target.value)}
                        placeholder="Search languages..."
                        className="w-full pl-9 pr-3 py-2 border border-sand text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {filteredLanguages.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => handleLanguageSelect(l.code)}
                        className={`w-full px-5 py-3 text-left text-sm hover:bg-parchment transition-colors flex items-center justify-between ${
                          language === l.code ? 'bg-parchment font-medium' : ''
                        }`}
                      >
                        <span className="text-charcoal-deep">{l.name}</span>
                        <span className="text-taupe text-xs">{l.native}</span>
                      </button>
                    ))}
                    {filteredLanguages.length === 0 && (
                      <p className="px-5 py-4 text-sm text-taupe text-center">No languages found</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Currency Selector */}
            <div className="relative">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">Currency</label>
              <button
                type="button"
                onClick={() => { setShowCurrencyDropdown(!showCurrencyDropdown); setShowLangDropdown(false); }}
                className="w-full px-5 py-4 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors flex items-center justify-between text-left"
              >
                <span>{(() => { const c = CURRENCIES.find(c => c.code === currency); return c ? `${c.code} (${c.symbol})` : currency; })()}</span>
                <ChevronDown size={16} className={`text-taupe transition-transform ${showCurrencyDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showCurrencyDropdown && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-sand shadow-lg max-h-72 overflow-hidden flex flex-col">
                  <div className="p-3 border-b border-sand">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe" />
                      <input
                        type="text"
                        value={currencySearch}
                        onChange={(e) => setCurrencySearch(e.target.value)}
                        placeholder="Search currencies..."
                        className="w-full pl-9 pr-3 py-2 border border-sand text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {filteredCurrencies.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handleCurrencySelect(c.code)}
                        className={`w-full px-5 py-3 text-left text-sm hover:bg-parchment transition-colors flex items-center justify-between ${
                          currency === c.code ? 'bg-parchment font-medium' : ''
                        }`}
                      >
                        <span className="text-charcoal-deep">{c.name}</span>
                        <span className="text-taupe text-xs">{c.code} ({c.symbol})</span>
                      </button>
                    ))}
                    {filteredCurrencies.length === 0 && (
                      <p className="px-5 py-4 text-sm text-taupe text-center">No currencies found</p>
                    )}
                  </div>
                </div>
              )}
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
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                  className="px-6 py-3 bg-error text-ivory-cream hover:bg-error/90 transition-colors text-sm tracking-[0.15em] uppercase disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDeleting && (
                    <div className="w-4 h-4 border-2 border-ivory-cream border-t-transparent rounded-full animate-spin" />
                  )}
                  {isDeleting ? 'Deleting...' : 'Delete Everything'}
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

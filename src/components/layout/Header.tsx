'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Heart, ShoppingBag, Menu, X, LogOut, Settings, Sparkles, Bell, CheckCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { getAllBrands } from '@/services/recommendation.service';
import { TierBadge } from '@/components/shared/TierBadge';
import type { Brand } from '@/types';

export default function Header() {
  const router = useRouter();
  const { considerations, userTier, isUHNI, showToast, cartCount, wishlistCount, pricingTier } = useApp();
  const { isAuthenticated, isHydrated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; is_read: boolean; created_at: string }[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const accountRef = useRef<HTMLDivElement>(null);
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  // Load brands from recommendation API on mount
  useEffect(() => {
    getAllBrands()
      .then(setBrands)
      .catch(() => { /* silently fail — dropdown will be empty */ });
  }, []);

  // Notification functions
  const fetchNotifCount = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('moda-user-token') : null;
    if (!token) return;
    window.fetch('/api/v1/customer/notifications/count', {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(r => r.ok ? r.json() : null).then(data => {
      if (data) setUnreadCount(data.unread || 0);
    }).catch(() => {});
  };

  const fetchNotifications = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('moda-user-token') : null;
    if (!token) return;
    setNotifsLoading(true);
    window.fetch('/api/v1/customer/notifications?limit=10', {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(r => r.ok ? r.json() : null).then(data => {
      if (data?.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unread ?? 0);
      }
    }).catch(() => {}).finally(() => setNotifsLoading(false));
  };

  const markNotifRead = (id: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('moda-user-token') : null;
    if (!token) return;
    window.fetch(`/api/v1/customer/notifications/${id}/read`, {
      method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` },
    }).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('moda-user-token') : null;
    if (!token) return;
    window.fetch('/api/v1/customer/notifications/read-all', {
      method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` },
    }).catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  // Poll notification count every 60s — backend endpoint confirmed: GET /api/v1/customer/notifications/count
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifCount();
      const interval = setInterval(fetchNotifCount, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = () => {
    setIsAccountOpen(false);
    logout();
    // Clear all session caches
    try { sessionStorage.clear(); } catch { /* ignore */ }
    showToast('You have been signed out', 'success');
    router.replace('/auth/login');
  };

  // ESC key handler and click outside handler
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMenuOpen) setIsMenuOpen(false);
        if (isAccountOpen) setIsAccountOpen(false);
        if (isBrandDropdownOpen) setIsBrandDropdownOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setIsAccountOpen(false);
      }
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(e.target as Node)) {
        setIsBrandDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isAccountOpen, isBrandDropdownOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ivory-cream/95 backdrop-blur-sm border-b border-sand/30">
      <div className="max-w-[1800px] mx-auto">
        {/* Top Bar */}
        <div className="hidden lg:flex justify-center items-center px-12 py-2 border-b border-sand/20 relative">
          <p className="text-xs tracking-[0.2em] text-stone uppercase">
            Experience-First Luxury Commerce
          </p>
        </div>

        {/* Main Header */}
        <div className="flex items-center justify-between px-6 lg:px-12 py-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 -ml-2"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Navigation Left */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
            <div
              ref={brandDropdownRef}
              className="relative"
              onMouseEnter={() => setIsBrandDropdownOpen(true)}
              onMouseLeave={() => setIsBrandDropdownOpen(false)}
            >
              <button
                className="text-sm tracking-[0.1em] uppercase text-charcoal-warm hover:text-noir transition-colors py-2"
                aria-haspopup="true"
                aria-expanded={isBrandDropdownOpen}
                onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
              >
                Brand Universes
              </button>
              {isBrandDropdownOpen && (
                <div className="absolute top-full left-0 pt-4">
                  <div className="bg-white shadow-lg rounded-lg p-6 min-w-[280px]" role="menu">
                    <p className="text-xs tracking-[0.15em] uppercase text-greige mb-4">Explore Our Maisons</p>
                    <div className="space-y-3">
                      {brands.map((brand) => (
                        <Link
                          key={brand.id}
                          href={`/brand/${brand.slug}?brandId=${brand.id}`}
                          role="menuitem"
                          className="block text-charcoal-deep hover:text-gold-muted transition-colors"
                          onClick={() => setIsBrandDropdownOpen(false)}
                        >
                          <span className="font-display text-lg">{brand.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Link
              href="/discover"
              className="text-sm tracking-[0.1em] uppercase text-charcoal-warm hover:text-noir transition-colors"
            >
              Discover
            </Link>
            <Link
              href="/collection"
              className="text-sm tracking-[0.1em] uppercase text-charcoal-warm hover:text-noir transition-colors"
            >
              Collections
            </Link>
          </nav>

          {/* Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <h1 className="font-display text-2xl lg:text-3xl tracking-[0.15em] uppercase text-noir">
              ModaGlimmora
            </h1>
          </Link>

          {/* Navigation Right */}
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Wishlist */}
            <Link
              href="/profile/wishlist"
              className="p-2 text-charcoal-warm hover:text-noir transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {isHydrated && wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-gold-muted text-noir text-[10px] rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            {isAuthenticated && (
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) fetchNotifications(); }}
                  className="p-2 text-charcoal-warm hover:text-noir transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifs && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white shadow-xl border border-sand/50 z-50">
                    <div className="px-4 py-3 border-b border-sand/50 flex items-center justify-between">
                      <span className="text-xs font-medium tracking-[0.1em] uppercase text-charcoal-deep">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[10px] text-stone hover:text-charcoal-deep flex items-center gap-1">
                          <CheckCheck size={12} /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifsLoading ? (
                        <div className="px-4 py-8 text-center">
                          <div className="w-5 h-5 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto" />
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <Bell size={20} className="mx-auto text-taupe/40 mb-2" />
                          <p className="text-xs text-stone">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => !n.is_read && markNotifRead(n.id)}
                            className={`px-4 py-3 border-b border-sand/20 last:border-0 hover:bg-parchment/50 cursor-pointer ${n.is_read ? '' : 'bg-parchment/30'}`}
                          >
                            <div className="flex items-start gap-2">
                              {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-gold-soft mt-1.5 flex-shrink-0" />}
                              <div className={n.is_read ? 'ml-3.5' : ''}>
                                <p className="text-xs font-medium text-charcoal-deep">{n.title}</p>
                                <p className="text-xs text-stone mt-0.5">{n.message}</p>
                                <p className="text-[10px] text-taupe mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart */}
            <Link
              href="/cart"
              className="p-2 text-charcoal-warm hover:text-noir transition-colors relative"
              aria-label="Shopping Bag"
            >
              <ShoppingBag size={20} />
              {isHydrated && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-gold-muted text-noir text-[10px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account Dropdown */}
            <div ref={accountRef} className="relative hidden lg:block">
              <button
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="p-2 text-charcoal-warm hover:text-noir transition-colors relative"
                aria-label="Account"
                aria-haspopup="true"
                aria-expanded={isAccountOpen}
              >
                <User size={20} />
                {/* UHNI indicator dot */}
                {isHydrated && isAuthenticated && isUHNI && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-gold-deep rounded-full border border-ivory-cream" title="UHNI Member" />
                )}
              </button>

              {/* Account Dropdown Menu */}
              {isAccountOpen && (
                <div className="absolute top-full right-0 pt-2">
                  <div className="bg-white shadow-lg min-w-[220px] border border-sand/30">
                    {isHydrated && isAuthenticated ? (
                      <>
                        <Link
                          href="/profile"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center gap-3 px-5 py-4 text-sm text-charcoal-deep hover:bg-parchment transition-colors border-b border-sand/30"
                        >
                          <User size={16} />
                          <span>My Profile</span>
                        </Link>
                        {/* Membership - hidden for consumers
                        <Link
                          href="/pricing-tiers"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center justify-between px-5 py-4 text-sm text-charcoal-deep hover:bg-parchment transition-colors border-b border-sand/30"
                        >
                          <div className="flex items-center gap-3">
                            <Sparkles size={16} />
                            <span>Membership</span>
                          </div>
                          <TierBadge tier={pricingTier} size="sm" />
                        </Link>
                        */}
                        <Link
                          href="/profile/settings"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center gap-3 px-5 py-4 text-sm text-charcoal-deep hover:bg-parchment transition-colors border-b border-sand/30"
                        >
                          <Settings size={16} />
                          <span>Settings</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-5 py-4 text-sm text-charcoal-deep hover:bg-parchment transition-colors"
                        >
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/auth/login"
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center gap-3 px-5 py-4 text-sm text-charcoal-deep hover:bg-parchment transition-colors"
                      >
                        <User size={16} />
                        <span>Sign In</span>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div id="mobile-menu" className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg animate-slide-up max-h-[80vh] overflow-y-auto">
            <nav className="p-6 space-y-6" aria-label="Main navigation">
              {/* Quick Stats */}
              {considerations.length > 0 && (
                <div className="pb-4 border-b border-sand/30">
                  <Link
                    href="/consideration"
                    className="flex items-center gap-2 text-sm text-charcoal-deep"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart size={16} />
                    <span>{considerations.length} item{considerations.length !== 1 ? 's' : ''}</span>
                  </Link>
                </div>
              )}

              <div>
                <p className="text-xs tracking-[0.15em] uppercase text-greige mb-4">Brand Universes</p>
                <div className="space-y-3 pl-4">
                  {brands.map((brand) => (
                    <Link
                      key={brand.id}
                      href={`/brand/${brand.slug}?brandId=${brand.id}`}
                      className="block font-display text-xl text-charcoal-deep"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {brand.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="border-t border-sand/30 pt-6 space-y-4">
                <Link
                  href="/discover"
                  className="block text-sm tracking-[0.1em] uppercase text-charcoal-warm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Discover
                </Link>
                <Link
                  href="/collection"
                  className="block text-sm tracking-[0.1em] uppercase text-charcoal-warm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Collections
                </Link>
                <Link
                  href="/consideration"
                  className="flex items-center justify-between text-sm tracking-[0.1em] uppercase text-charcoal-warm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Considerations</span>
                  {considerations.length > 0 && (
                    <span className="text-xs bg-gold-muted/20 text-gold-deep px-2 py-1">
                      {considerations.length}
                    </span>
                  )}
                </Link>

                {/* Account Section - Different for logged in vs guest */}
                {isHydrated && isAuthenticated ? (
                  <>
                    <Link
                      href="/profile"
                      className="block text-sm tracking-[0.1em] uppercase text-charcoal-warm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/wardrobe"
                      className="block text-sm tracking-[0.1em] uppercase text-charcoal-warm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Wardrobe
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block text-sm tracking-[0.1em] uppercase text-charcoal-warm text-left"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="block text-sm tracking-[0.1em] uppercase text-charcoal-warm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Heart, Menu, X, LogOut, Settings, Building2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { brandLogout } from '@/services/auth.service';
import { getRecommendedBrands } from '@/services/recommendation.service';
import type { Brand } from '@/types';

export default function Header() {
  const router = useRouter();
  const { considerations, userTier, isUHNI, showToast } = useApp();
  const { isAuthenticated, isHydrated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const accountRef = useRef<HTMLDivElement>(null);
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  // Check if brand user is logged in (separate from consumer auth)
  const [isBrandLoggedIn, setIsBrandLoggedIn] = useState(false);
  const [brandUserName, setBrandUserName] = useState<string | null>(null);
  const [brandName, setBrandName] = useState<string | null>(null);
  const [brandProfilePicture, setBrandProfilePicture] = useState<string | null>(null);
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [brandRole, setBrandRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('moda-brand-token');
      const data = localStorage.getItem('moda-brand-data');
      if (token && data) {
        const parsed = JSON.parse(data);
        setIsBrandLoggedIn(true);
        setBrandUserName(`${parsed.first_name} ${parsed.last_name}`);
        setBrandName(parsed.brand_name || null);
        setBrandProfilePicture(parsed.profile_picture || null);
        setBrandLogo(parsed.brand_logo || null);
        setBrandRole(parsed.role || null);
      }
    } catch { /* ignore */ }
  }, []);

  // Load brands from recommendation API on mount
  useEffect(() => {
    getRecommendedBrands()
      .then(setBrands)
      .catch(() => { /* silently fail — dropdown will be empty */ });
  }, []);

  const handleLogout = () => {
    setIsAccountOpen(false);
    router.replace('/');
    setTimeout(() => {
      logout();
      showToast('You have been signed out', 'success');
    }, 100);
  };

  const handleBrandLogout = () => {
    setIsAccountOpen(false);
    brandLogout();
    setIsBrandLoggedIn(false);
    setBrandUserName(null);
    setBrandName(null);
    setBrandProfilePicture(null);
    setBrandLogo(null);
    setBrandRole(null);
    showToast('Signed out of Brand Portal', 'success');
    router.replace('/');
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
            {/* Consideration Space */}
            <Link
              href="/consideration"
              className="p-2 text-charcoal-warm hover:text-noir transition-colors relative"
              aria-label="Considerations"
            >
              <Heart size={20} />
              {considerations.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-gold-muted text-noir text-[10px] rounded-full flex items-center justify-center">
                  {considerations.length}
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
                {isBrandLoggedIn && (brandProfilePicture || brandLogo) ? (
                  <img
                    src={brandProfilePicture || brandLogo || ''}
                    alt={brandUserName || 'Brand'}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <User size={20} />
                )}
                {/* UHNI indicator dot */}
                {isHydrated && isAuthenticated && isUHNI && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-gold-deep rounded-full border border-ivory-cream" title="UHNI Member" />
                )}
                {/* Brand logged-in indicator dot */}
                {isBrandLoggedIn && !(brandProfilePicture || brandLogo) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-charcoal-deep rounded-full border border-ivory-cream" title="Brand Portal" />
                )}
              </button>

              {/* Account Dropdown Menu */}
              {isAccountOpen && (
                <div className="absolute top-full right-0 pt-2">
                  <div className="bg-white shadow-lg min-w-[220px] border border-sand/30">
                    {/* Brand Portal Link (if brand user is logged in) */}
                    {isBrandLoggedIn && (
                      <>
                        <div className="px-5 py-3 border-b border-sand/30 bg-parchment/30">
                          <div className="flex items-center gap-3">
                            {brandProfilePicture || brandLogo ? (
                              <img
                                src={brandProfilePicture || brandLogo || ''}
                                alt={brandUserName || 'Brand'}
                                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 bg-charcoal-deep text-ivory-cream rounded-full flex items-center justify-center text-sm font-display flex-shrink-0">
                                {brandName?.charAt(0) || 'B'}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm text-charcoal-deep font-medium truncate">{brandUserName}</p>
                              <p className="text-[10px] tracking-[0.1em] text-taupe truncate">
                                {brandRole && <span className="uppercase">{brandRole}</span>}
                                {brandRole && brandName && <span> · </span>}
                                {brandName}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Link
                          href="/brand"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center gap-3 px-5 py-4 text-sm text-charcoal-deep hover:bg-parchment transition-colors border-b border-sand/30"
                        >
                          <Building2 size={16} />
                          <span>Go to Brand Portal</span>
                        </Link>
                        <button
                          onClick={handleBrandLogout}
                          className="w-full flex items-center gap-3 px-5 py-4 text-sm text-charcoal-deep hover:bg-parchment transition-colors"
                        >
                          <LogOut size={16} />
                          <span>Sign Out (Brand)</span>
                        </button>
                      </>
                    )}
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
                    ) : !isBrandLoggedIn ? (
                      <Link
                        href="/auth/login"
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center gap-3 px-5 py-4 text-sm text-charcoal-deep hover:bg-parchment transition-colors"
                      >
                        <User size={16} />
                        <span>Sign In</span>
                      </Link>
                    ) : null}
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

                {/* Brand Portal (if brand user logged in) */}
                {isBrandLoggedIn && (
                  <>
                    <div className="flex items-center gap-3 pb-2">
                      {brandProfilePicture || brandLogo ? (
                        <img
                          src={brandProfilePicture || brandLogo || ''}
                          alt={brandUserName || 'Brand'}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-charcoal-deep text-ivory-cream rounded-full flex items-center justify-center text-xs font-display flex-shrink-0">
                          {brandName?.charAt(0) || 'B'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm text-charcoal-deep font-medium truncate">{brandUserName}</p>
                        {brandName && (
                          <p className="text-[10px] text-taupe truncate">{brandName}</p>
                        )}
                      </div>
                    </div>
                    <Link
                      href="/brand"
                      className="block text-sm tracking-[0.1em] uppercase text-charcoal-warm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Brand Portal
                    </Link>
                    <button
                      onClick={() => {
                        handleBrandLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block text-sm tracking-[0.1em] uppercase text-charcoal-warm text-left"
                    >
                      Sign Out (Brand)
                    </button>
                  </>
                )}

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
                ) : !isBrandLoggedIn ? (
                  <Link
                    href="/auth/login"
                    className="block text-sm tracking-[0.1em] uppercase text-charcoal-warm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                ) : null}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

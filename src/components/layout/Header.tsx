'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Heart, Menu, X, LogOut, Settings } from 'lucide-react';
import { brands } from '@/data/mock-data';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const router = useRouter();
  const { considerations, userTier, isUHNI, showToast } = useApp();
  const { isAuthenticated, isHydrated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    setIsAccountOpen(false);
    // Navigate to homepage first, then logout after a brief delay
    // This prevents race condition with protected page auth guards
    router.replace('/');
    setTimeout(() => {
      logout();
      showToast('You have been signed out', 'success');
    }, 100);
  };

  // ESC key handler and click outside handler
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMenuOpen) {
          setIsMenuOpen(false);
        }
        if (isAccountOpen) {
          setIsAccountOpen(false);
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setIsAccountOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isAccountOpen]);

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
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Navigation Left */}
          <nav className="hidden lg:flex items-center gap-8">
            <div className="relative group">
              <button className="text-sm tracking-[0.1em] uppercase text-charcoal-warm hover:text-noir transition-colors py-2">
                Brand Universes
              </button>
              <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="bg-white shadow-lg rounded-lg p-6 min-w-[280px]">
                  <p className="text-xs tracking-[0.15em] uppercase text-greige mb-4">Explore Our Maisons</p>
                  <div className="space-y-3">
                    {brands.map((brand) => (
                      <Link
                        key={brand.id}
                        href={`/brand/${brand.slug}`}
                        className="block text-charcoal-deep hover:text-gold-muted transition-colors"
                      >
                        <span className="font-display text-lg">{brand.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <Link
              href="/discover"
              className="text-sm tracking-[0.1em] uppercase text-charcoal-warm hover:text-noir transition-colors"
            >
              Discover
            </Link>
            <Link
              href="/collection/autumn-winter-2024"
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
                  <div className="bg-white shadow-lg min-w-[200px] border border-sand/30">
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
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg animate-slide-up max-h-[80vh] overflow-y-auto">
            <nav className="p-6 space-y-6">
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
                      href={`/brand/${brand.slug}`}
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
                  href="/collection/autumn-winter-2024"
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

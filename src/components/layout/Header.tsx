'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, User, Heart, Menu, X } from 'lucide-react';
import { brands } from '@/data/mock-data';

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ivory-cream/95 backdrop-blur-sm border-b border-sand/30">
      <div className="max-w-[1800px] mx-auto">
        {/* Top Bar */}
        <div className="hidden lg:flex justify-center py-2 border-b border-sand/20">
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
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-charcoal-warm hover:text-noir transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Consideration Space */}
            <Link
              href="/consideration"
              className="p-2 text-charcoal-warm hover:text-noir transition-colors relative"
              aria-label="Considerations"
            >
              <Heart size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold-muted text-noir text-[10px] rounded-full flex items-center justify-center">
                2
              </span>
            </Link>

            {/* Account */}
            <Link
              href="/profile"
              className="hidden lg:flex p-2 text-charcoal-warm hover:text-noir transition-colors"
              aria-label="Account"
            >
              <User size={20} />
            </Link>
          </div>
        </div>

        {/* Search Overlay */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg p-6 animate-fade-in">
            <div className="max-w-2xl mx-auto relative">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What are you looking for today?"
                  className="input-luxury text-center text-lg"
                  autoFocus
                />
                <p className="text-center text-sm text-stone mt-4">
                  Try: "Evening bag" or "Gucci" or "Silk"
                </p>
              </form>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute -top-2 right-0 text-stone hover:text-noir"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg animate-slide-up">
            <nav className="p-6 space-y-6">
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
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

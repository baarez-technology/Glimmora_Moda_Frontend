'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Crown } from 'lucide-react';
import { useApp } from '@/context/AppContext';

// UHNI Portal Layout
// This layout guards all UHNI-exclusive routes under /uhni/*
// Only users with userTier === 'uhni' can access these routes

export default function UHNILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isUHNI, isHydrated } = useApp();

  useEffect(() => {
    // Wait for auth state to hydrate from localStorage
    if (isHydrated && !isUHNI) {
      // Redirect non-UHNI users to UHNI login page
      router.push('/auth/login/uhni');
    }
  }, [isUHNI, isHydrated, router]);

  // Show loading spinner while auth state is hydrating
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-noir">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gold-soft border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-sand tracking-wider">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Don't render content for non-UHNI users (will redirect in useEffect)
  if (!isUHNI) {
    return null;
  }

  const navLinks = [
    { href: '/uhni/concierge', label: 'Concierge' },
    { href: '/uhni/sourcing', label: 'Sourcing' },
    { href: '/uhni/bespoke', label: 'Bespoke' },
    { href: '/uhni/autonomous', label: 'Autonomous' },
    { href: '/cart', label: 'Cart' },
    { href: '/profile/wishlist', label: 'Wishlist' },
    { href: '/', label: 'Main Site' },
  ];

  // Render UHNI content for authenticated UHNI users
  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* UHNI Top Bar */}
      <header className="sticky top-0 z-50 bg-charcoal-deep border-b border-gold-soft/10">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
          <Link href="/uhni" className="flex items-center gap-2">
            <Crown size={16} className="text-gold-soft" />
            <span className="text-sm tracking-[0.2em] uppercase text-ivory-cream">UHNI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs tracking-wider uppercase transition-colors ${
                  pathname.startsWith(link.href) && link.href !== '/'
                    ? 'text-gold-soft'
                    : 'text-sand hover:text-ivory-cream'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

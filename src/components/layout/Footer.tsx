'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-charcoal-deep text-ivory-cream">
      {/* Main Footer */}
      <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <h2 className="font-display text-2xl tracking-[0.15em] uppercase mb-4 hover:text-gold-soft transition-colors">
                ModaGlimmora
              </h2>
            </Link>
            <p className="text-taupe text-sm leading-relaxed mb-6 max-w-xs">
              The world's first AGI-native fashion universe. Where intelligence meets elegance.
            </p>
          </div>

          {/* Explore Column */}
          <div>
            <h3 className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-6">
              Explore
            </h3>
            <nav className="space-y-3">
              <Link
                href="/discover"
                className="block text-sm text-stone hover:text-ivory-cream transition-colors"
              >
                Discover
              </Link>
              <Link
                href="/stories"
                className="block text-sm text-stone hover:text-ivory-cream transition-colors"
              >
                Stories
              </Link>
              <Link
                href="/collection/autumn-winter-2024"
                className="block text-sm text-stone hover:text-ivory-cream transition-colors"
              >
                Collections
              </Link>
            </nav>
          </div>

          {/* Your Space Column */}
          <div>
            <h3 className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-6">
              Your Space
            </h3>
            <nav className="space-y-3">
              <Link
                href="/wardrobe"
                className="block text-sm text-stone hover:text-ivory-cream transition-colors"
              >
                Digital Wardrobe
              </Link>
              <Link
                href="/calendar"
                className="block text-sm text-stone hover:text-ivory-cream transition-colors"
              >
                Style Calendar
              </Link>
              <Link
                href="/consideration"
                className="block text-sm text-stone hover:text-ivory-cream transition-colors"
              >
                Considerations
              </Link>
              <Link
                href="/profile"
                className="block text-sm text-stone hover:text-ivory-cream transition-colors"
              >
                Profile
              </Link>
            </nav>
          </div>

          {/* Legal & Trust Column */}
          <div>
            <h3 className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-6">
              Trust & Safety
            </h3>
            <nav className="space-y-3">
              <Link
                href="/discover"
                className="block text-sm text-stone hover:text-ivory-cream transition-colors"
              >
                Authenticity Guarantee
              </Link>
              <Link
                href="/profile/privacy"
                className="block text-sm text-stone hover:text-ivory-cream transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="block text-sm text-stone hover:text-ivory-cream transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/profile/sustainability"
                className="block text-sm text-stone hover:text-ivory-cream transition-colors"
              >
                Sustainability
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-charcoal-warm/20">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-stone">
              © {new Date().getFullYear()} ModaGlimmora. All rights reserved.
            </p>
            <p className="text-xs tracking-[0.1em] text-stone">
              Powered by AGI Intelligence • No Dark Patterns • Privacy First
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

'use client';

import Link from 'next/link';
import { brands } from '@/data/mock-data';

export default function Footer() {
  return (
    <footer className="bg-charcoal-deep text-ivory-cream">
      {/* Main Footer */}
      <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h2 className="font-display text-2xl tracking-[0.15em] uppercase mb-6">
              ModaGlimmora
            </h2>
            <p className="text-taupe text-sm leading-relaxed mb-6">
              The world's first AGI-native fashion universe. Experience-first luxury commerce that understands you.
            </p>
            <p className="text-xs tracking-[0.2em] uppercase text-stone">
              "Fashion doesn't guess here — intelligence guides."
            </p>
          </div>

          {/* Brand Universes */}
          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-taupe mb-6">
              Brand Universes
            </h3>
            <ul className="space-y-3">
              {brands.map((brand) => (
                <li key={brand.id}>
                  <Link
                    href={`/brand/${brand.slug}`}
                    className="text-sand hover:text-ivory-cream transition-colors"
                  >
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Experience */}
          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-taupe mb-6">
              Experience
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/discover" className="text-sand hover:text-ivory-cream transition-colors">
                  Discover
                </Link>
              </li>
              <li>
                <Link href="/collection/autumn-winter-2024" className="text-sand hover:text-ivory-cream transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/story/lady-dior-legacy" className="text-sand hover:text-ivory-cream transition-colors">
                  Stories & Heritage
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="text-sand hover:text-ivory-cream transition-colors">
                  Create Fashion Identity
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-taupe mb-6">
              Your Space
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/profile" className="text-sand hover:text-ivory-cream transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <Link href="/wardrobe" className="text-sand hover:text-ivory-cream transition-colors">
                  Digital Wardrobe
                </Link>
              </li>
              <li>
                <Link href="/consideration" className="text-sand hover:text-ivory-cream transition-colors">
                  Considerations
                </Link>
              </li>
              <li>
                <Link href="/profile/orders" className="text-sand hover:text-ivory-cream transition-colors">
                  Orders
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-charcoal-warm/30 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-xs text-stone">
              <Link href="/privacy" className="hover:text-ivory-cream transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-ivory-cream transition-colors">
                Terms of Service
              </Link>
              <Link href="/authenticity" className="hover:text-ivory-cream transition-colors">
                Authenticity Guarantee
              </Link>
              <Link href="/sustainability" className="hover:text-ivory-cream transition-colors">
                Sustainability
              </Link>
            </div>
            <p className="text-xs text-stone">
              © 2024 ModaGlimmora. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-noir py-4">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
          <p className="text-center text-xs tracking-[0.15em] text-stone">
            Powered by AGI Intelligence • No Dark Patterns • Privacy First
          </p>
        </div>
      </div>
    </footer>
  );
}

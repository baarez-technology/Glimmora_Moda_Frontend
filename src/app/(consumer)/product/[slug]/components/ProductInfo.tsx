'use client';

import Link from 'next/link';
import { Sparkles, User, ArrowRight, ChevronRight } from 'lucide-react';
import type { Product, Brand, FashionIdentity } from '@/types';

interface PersonalizationMatch {
  score: number;
  reasons: string[];
  wardrobeItems: number;
}

interface ProductInfoProps {
  product: Product;
  brand?: Brand | null;
  fashionIdentity: FashionIdentity | null;
  personalizationMatch: PersonalizationMatch | null;
}

export default function ProductInfo({
  product,
  brand,
  fashionIdentity,
  personalizationMatch
}: ProductInfoProps) {
  return (
    <>
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 mb-8 text-xs">
        <Link
          href="/"
          className="text-taupe hover:text-charcoal-deep transition-colors"
        >
          Home
        </Link>
        <ChevronRight size={12} className="text-sand" />
        <Link
          href={`/brand/${brand?.slug || ''}`}
          className="text-taupe hover:text-charcoal-deep transition-colors"
        >
          {brand?.name}
        </Link>
        <ChevronRight size={12} className="text-sand" />
        <span className="text-charcoal-deep font-medium truncate max-w-[150px]">
          {product.name}
        </span>
      </nav>

      {/* Brand & Category */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/brand/${brand?.slug || ''}`}
          className="text-[10px] tracking-[0.4em] uppercase text-taupe hover:text-charcoal-deep transition-colors"
        >
          {brand?.name}
        </Link>
        <span className="w-6 h-px bg-sand" />
        <span className="text-[10px] tracking-[0.3em] uppercase text-taupe">
          {product.collection || product.category}
        </span>
      </div>

      {/* Product Name */}
      <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-charcoal-deep leading-[1] tracking-[-0.02em] mb-3">
        {product.name}
      </h1>
      <p className="text-lg text-stone mb-8">{product.tagline}</p>

      {/* Price */}
      <div className="font-display text-2xl text-charcoal-deep mb-4">
        €{product.price.toLocaleString()}
      </div>

      {/* Personalization Badge */}
      {personalizationMatch && personalizationMatch.score >= 50 && (
        <div
          className="mb-6 p-4 bg-gradient-to-r from-gold-muted/10 to-transparent border-l-2 border-gold-muted"
          title="Personalization score based on your style profile, occasions, aesthetics, and budget preferences"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-gold-muted" />
              <span className="text-sm font-medium text-charcoal-deep">
                {personalizationMatch.score}% Match for You
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {personalizationMatch.reasons.map((reason, i) => (
              <span key={i} className="text-[10px] tracking-[0.1em] text-stone bg-ivory-cream px-2 py-1">
                {reason}
              </span>
            ))}
            {personalizationMatch.wardrobeItems > 0 && (
              <span className="text-[10px] tracking-[0.1em] text-gold-deep bg-gold-muted/10 px-2 py-1">
                Complements {personalizationMatch.wardrobeItems} wardrobe item{personalizationMatch.wardrobeItems > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}

      {/* No Profile CTA */}
      {!fashionIdentity && (
        <Link
          href="/profile/style"
          className="mb-6 p-4 bg-parchment flex items-center justify-between group hover:bg-champagne/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <User size={16} className="text-taupe" />
            <span className="text-sm text-stone">Set up your Style Profile for personalized matches</span>
          </div>
          <ArrowRight size={14} className="text-taupe group-hover:translate-x-1 transition-transform" />
        </Link>
      )}

      {/* Narrative */}
      <div className="mb-10 pb-10 border-b border-sand/50">
        <p className="text-stone leading-relaxed">{product.narrative}</p>
      </div>
    </>
  );
}

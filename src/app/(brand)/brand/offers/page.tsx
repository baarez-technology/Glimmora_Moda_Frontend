'use client';

import { BrandPageHeader } from '@/components/brand/BrandPageHeader';

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-ivory-cream">
      <BrandPageHeader title="Offers" subtitle="Promotions & Discounts" />
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="text-stone text-sm tracking-[0.1em] uppercase mb-4">Feature Unavailable</p>
        <h2 className="font-display text-3xl text-charcoal-deep mb-4">Promotions & discounts are not supported</h2>
        <p className="text-taupe leading-relaxed">
          ModaGlimmora does not support discount or promotional pricing. This feature has been removed in line with platform guidelines.
        </p>
      </div>
    </div>
  );
}

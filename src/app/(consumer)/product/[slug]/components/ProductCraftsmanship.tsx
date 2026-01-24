'use client';

import Image from 'next/image';
import { Clock } from 'lucide-react';
import type { Product } from '@/types';

interface ProductCraftsmanshipProps {
  product: Product;
}

export default function ProductCraftsmanship({ product }: ProductCraftsmanshipProps) {
  return (
    <section className="bg-charcoal-deep">
      <div className="max-w-[1800px] mx-auto">
        <div className="grid lg:grid-cols-2">
          {/* Image Side */}
          <div className="relative aspect-square lg:aspect-auto">
            <Image
              src={product.images[Math.min(1, product.images.length - 1)]?.url || product.images[0]?.url || ''}
              alt={`${product.name} craftsmanship detail`}
              fill
              className="object-cover"
            />
          </div>

          {/* Content Side */}
          <div className="px-8 md:px-16 lg:px-20 py-16 lg:py-24 flex flex-col justify-center">
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/60 block mb-4">
              The Making
            </span>
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1.1] tracking-[-0.02em] mb-6">
              Craftsmanship
            </h2>
            <p className="text-taupe mb-12 max-w-md">
              Each piece reflects generations of expertise and an unwavering commitment to excellence.
            </p>

            {/* Craftsmanship Items */}
            <div className="space-y-8">
              {product.craftsmanship.map((craft, index) => (
                <div key={index} className="border-l-2 border-gold-soft/30 pl-6">
                  <h3 className="font-display text-xl text-ivory-cream mb-2">{craft.title}</h3>
                  <p className="text-taupe text-sm leading-relaxed mb-4">{craft.description}</p>
                  {craft.duration && (
                    <div className="flex items-center gap-4 text-xs text-stone">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gold-soft/60" />
                        <span>{craft.duration}</span>
                      </div>
                      {craft.artisans && (
                        <span>{craft.artisans} artisan{craft.artisans > 1 ? 's' : ''}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

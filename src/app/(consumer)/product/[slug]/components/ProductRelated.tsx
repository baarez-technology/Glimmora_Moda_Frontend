'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import type { Product, Brand } from '@/types';
import { formatPrice } from '@/lib/currency';

interface ProductRelatedProps {
  products: Product[];
  brand?: Brand | null;
}

export default function ProductRelated({ products, brand }: ProductRelatedProps) {
  const [activeHover, setActiveHover] = useState<number | null>(null);

  if (products.length === 0) return null;

  return (
    <section className="py-24 lg:py-32 bg-charcoal-deep">
      <div className="max-w-[1800px] mx-auto px-8 md:px-16 lg:px-24">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16">
          <div>
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50 block mb-3">
              More from the Maison
            </span>
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-ivory-cream leading-[1.1] tracking-[-0.02em]">
              {brand?.name}
            </h2>
          </div>
          <Link
            href={`/brand/${brand?.slug}`}
            className="group inline-flex items-center gap-3 text-sm tracking-[0.15em] uppercase text-ivory-cream/60 hover:text-ivory-cream transition-colors"
          >
            <span>View All</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-10 md:gap-y-16">
          {products.map((item, index) => (
            <Link
              key={item.id}
              href={`/product/${item.slug}?productId=${item.id}`}
              className="group"
              onMouseEnter={() => setActiveHover(index)}
              onMouseLeave={() => setActiveHover(null)}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-ivory-cream/10 mb-5">
                <Image
                  src={item.images[0]?.url || 'https://placehold.co/800x1000/F5F0EB/8B8680?text=No+Image'}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-all duration-700 group-hover:scale-105"
                />

                {/* Hover Action */}
                <div className="absolute inset-0 flex items-center justify-center bg-noir/0 group-hover:bg-noir/20 transition-all duration-500">
                  <div className={`w-14 h-14 rounded-full bg-ivory-cream flex items-center justify-center transform transition-all duration-500 ${activeHover === index ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                    <ArrowRight size={18} className="text-charcoal-deep" />
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-1.5">
                <h3 className="font-display text-lg md:text-xl text-ivory-cream leading-tight group-hover:text-gold-soft transition-colors">
                  {item.name}
                </h3>
                <p className="text-sm text-taupe">
                  {formatPrice(item.price, item.currency)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

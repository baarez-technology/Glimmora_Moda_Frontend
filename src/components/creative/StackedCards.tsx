'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/currency';

interface Product {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  price: number;
  images: { url: string }[];
}

interface StackedCardsProps {
  products: Product[];
}

export default function StackedCards({ products }: StackedCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-6 lg:gap-8">
        {products.slice(0, 4).map((product, index) => {
          const rotation = useTransform(
            scrollYProgress,
            [0, 0.5, 1],
            [15 - index * 8, 0, -15 + index * 8]
          );
          const y = useTransform(
            scrollYProgress,
            [0, 0.5, 1],
            [100 + index * 30, 0, -50 - index * 20]
          );
          const scale = useTransform(
            scrollYProgress,
            [0, 0.5, 1],
            [0.9, 1, 0.95]
          );

          return (
            <motion.div
              key={product.id}
              className="flex-1"
              style={{
                rotate: rotation,
                y,
                scale,
                zIndex: products.length - index,
              }}
            >
              <Link href={`/product/${product.slug}?productId=${product.id}`} className="block group">
                <div className="relative aspect-[3/4] overflow-hidden bg-ivory-warm mb-6">
                  <Image
                    src={product.images[0]?.url || ''}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <motion.div
                    className="absolute inset-0 bg-noir/0 group-hover:bg-noir/10 transition-colors duration-500"
                  />
                </div>
                <div className="space-y-2">
                  <p className="font-body text-[10px] tracking-[0.3em] uppercase text-charcoal-warm">
                    {product.brandName}
                  </p>
                  <h3 className="font-display text-lg lg:text-xl text-noir">
                    {product.name}
                  </h3>
                  <p className="font-body text-sm text-stone">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

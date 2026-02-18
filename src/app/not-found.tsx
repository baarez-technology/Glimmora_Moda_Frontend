'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Home, Search } from 'lucide-react';
import * as productService from '@/services/product.service';
import type { Product } from '@/types';

export default function NotFound() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const response = await productService.getAllProducts();
      const shuffled = response.data
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
      setRecommendedProducts(shuffled);
      setIsLoaded(true);
    };
    loadProducts();
  }, []);

  return (
    <div className="min-h-screen bg-ivory-cream flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 py-24">
        <div className="max-w-4xl w-full text-center">
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* 404 Number */}
            <span className="block font-display text-[clamp(4rem,12vw,8rem)] text-charcoal-deep/10 leading-none tracking-[-0.04em] mb-6">
              404
            </span>

            {/* Heading */}
            <h1 className="font-display text-[clamp(2rem,5vw,3rem)] text-charcoal-deep leading-[1.1] tracking-[-0.02em] mb-6">
              This Page Has<br />Moved On
            </h1>

            {/* Description */}
            <p className="text-lg text-stone max-w-md mx-auto mb-12 leading-relaxed">
              The piece you&apos;re looking for may have been discontinued, or the link may be outdated.
              Let us help you find something exceptional.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-charcoal-deep text-ivory-cream hover:bg-charcoal-warm transition-all duration-300"
              >
                <Home size={18} />
                <span className="text-sm tracking-[0.15em] uppercase">Return Home</span>
              </Link>
              <Link
                href="/search"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 border border-charcoal-deep text-charcoal-deep hover:bg-charcoal-deep hover:text-ivory-cream transition-all duration-300"
              >
                <Search size={18} />
                <span className="text-sm tracking-[0.15em] uppercase">Search Collection</span>
              </Link>
            </div>
          </div>

          {/* Similar Products Section */}
          <div className={`transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="border-t border-sand/50 pt-16">
              <p className="text-[10px] tracking-[0.5em] uppercase text-taupe mb-8">
                Similar to What You Were Looking For
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {recommendedProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="group"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-sand-light mb-3">
                      <Image
                        src={product.images[0]?.url || ''}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </div>
                    <p className="font-body text-[9px] tracking-[0.2em] uppercase text-charcoal-warm mb-1">
                      {product.brandName}
                    </p>
                    <h3 className="font-display text-sm text-charcoal-deep group-hover:text-stone transition-colors leading-tight line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="font-body text-xs text-charcoal-warm mt-1">
                      {product.currency === 'EUR' ? '€' : '$'}{product.price.toLocaleString()}
                    </p>
                  </Link>
                ))}
              </div>

              <div className="mt-12">
                <Link
                  href="/discover"
                  className="group inline-flex items-center gap-4"
                >
                  <span className="text-sm tracking-[0.2em] uppercase text-charcoal-deep">
                    View Full Collection
                  </span>
                  <span className="w-12 h-12 rounded-full border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep transition-all duration-500">
                    <ArrowRight size={16} className="text-charcoal-deep group-hover:text-ivory-cream transition-colors duration-500" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

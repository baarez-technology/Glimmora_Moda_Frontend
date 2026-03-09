'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, TrendingUp, Heart, Star } from 'lucide-react';
import * as productService from '@/services/product.service';
import { useApp } from '@/context/AppContext';
import type { Product } from '@/types';

interface SmartRecommendationsProps {
  currentProduct?: Product;
  maxItems?: number;
  title?: string;
  subtitle?: string;
  variant?: 'grid' | 'carousel';
}

export default function SmartRecommendations({
  currentProduct,
  maxItems = 4,
  title = 'Recommended for You',
  subtitle = 'Based on your taste and style',
  variant = 'grid'
}: SmartRecommendationsProps) {
  const { wardrobe, wishlist, considerations } = useApp();
  const [products, setProducts] = useState<Product[]>([]);

  // Load products from service on mount
  useEffect(() => {
    productService.getAllProducts().then((res) => {
      if (res.success && res.data) {
        setProducts(res.data);
      }
    });
  }, []);

  // Generate smart recommendations
  const recommendations = useMemo(() => {
    const userBrands = new Set([
      ...wardrobe.map(w => w.product.brandId),
      ...wishlist.map(w => w.product.brandId),
      ...considerations.map(c => c.product.brandId)
    ]);

    const userCategories = new Set([
      ...wardrobe.map(w => w.product.category),
      ...wishlist.map(w => w.product.category)
    ]);

    const userTags = new Set([
      ...wardrobe.flatMap(w => w.product.tags),
      ...wishlist.flatMap(w => w.product.tags)
    ]);

    // Score products based on user preferences
    const scoredProducts = products
      .filter(p => !currentProduct || p.id !== currentProduct.id)
      .filter(p => !wardrobe.some(w => w.productId === p.id))
      .map(product => {
        let score = 0;
        let reasons: string[] = [];

        // Brand affinity (40 points)
        if (userBrands.has(product.brandId)) {
          score += 40;
          reasons.push('From a brand you love');
        }

        // Category match (30 points)
        if (userCategories.has(product.category)) {
          score += 30;
          reasons.push('Matches your wardrobe style');
        }

        // Tag overlap (30 points)
        const tagMatches = product.tags.filter(tag => userTags.has(tag)).length;
        if (tagMatches > 0) {
          score += Math.min(30, tagMatches * 10);
          reasons.push('Aligns with your preferences');
        }

        // Currently considering similar items (20 points)
        if (currentProduct) {
          if (product.brandId === currentProduct.brandId) {
            score += 20;
            reasons.push('From the same maison');
          }
          if (product.category !== currentProduct.category) {
            score += 15;
            reasons.push('Complements this piece');
          }
        }

        // In wishlist bonus (trending for you)
        const inWishlistCategory = wishlist.some(w => w.product.category === product.category);
        if (inWishlistCategory) {
          score += 15;
          reasons.push('Popular in your wishlist');
        }

        // Randomness for diversity (0-10 points)
        score += Math.random() * 10;

        return {
          product,
          score,
          reasons: reasons.slice(0, 2) // Top 2 reasons
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, maxItems);

    return scoredProducts;
  }, [products, wardrobe, wishlist, considerations, currentProduct, maxItems]);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-24 bg-ivory-cream">
      <div className="max-w-[1800px] mx-auto px-8 md:px-16 lg:px-24">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Sparkles size={20} className="text-gold-muted" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-taupe">
                {subtitle}
              </span>
            </div>
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-charcoal-deep leading-[1.1] tracking-[-0.02em]">
              {title}
            </h2>
          </div>
        </div>

        {/* Products Grid */}
        <div className={`grid ${variant === 'grid' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'} gap-x-6 gap-y-12`}>
          {recommendations.map(({ product, reasons }) => (
            <div key={product.id} className="group">
              <Link href={`/product/${product.slug}?productId=${product.id}`} className="block">
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-parchment mb-4">
                  <Image
                    src={product.images[0]?.url || ''}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* AI Badge */}
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                      <TrendingUp size={12} className="text-gold-muted" />
                      <span className="text-[9px] tracking-wider uppercase text-charcoal-deep font-medium">
                        AI Pick
                      </span>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-noir/0 group-hover:bg-noir/20 transition-all duration-500 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-ivory-cream flex items-center justify-center transform transition-all duration-500 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100">
                      <ArrowRight size={18} className="text-charcoal-deep" />
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-taupe mb-1.5">
                    {product.brandName}
                  </p>
                  <h3 className="font-display text-lg text-charcoal-deep leading-tight mb-2 group-hover:text-charcoal-warm transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-stone mb-3">
                    €{product.price.toLocaleString()}
                  </p>

                  {/* Recommendation Reasons */}
                  {reasons.length > 0 && (
                    <div className="space-y-1">
                      {reasons.map((reason, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Star size={10} className="text-gold-muted fill-gold-muted" />
                          <span className="text-[10px] text-stone">{reason}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* View More */}
        <div className="mt-12 text-center">
          <Link
            href="/discover"
            className="group inline-flex items-center gap-3 text-sm tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep transition-colors"
          >
            <span>Explore More</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowDown, Plus } from 'lucide-react';
import { brands, getFeaturedProducts, getFeaturedStories } from '@/data/mock-data';

export default function HomePage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeProduct, setActiveProduct] = useState<number | null>(null);
  const featuredProducts = getFeaturedProducts();
  const featuredStories = getFeaturedStories();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="bg-ivory-cream">
      {/* ============================================
          HERO - Full Screen Cinematic
          ============================================ */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Hero Image - Full Bleed */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&q=90"
            alt="Luxury Fashion"
            fill
            className={`object-cover transition-all duration-[2s] ease-out ${isLoaded ? 'scale-100' : 'scale-110'}`}
            priority
          />
          {/* Cinematic Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-noir/30 via-transparent to-noir/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-noir/40 via-transparent to-transparent" />
        </div>

        {/* Hero Content - Minimal & Dramatic */}
        <div className="relative h-full flex flex-col justify-between px-8 md:px-16 lg:px-24 py-32">
          {/* Top - Season Tag */}
          <div className={`transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <span className="text-[11px] tracking-[0.5em] uppercase text-ivory-cream/70">
              Winter 2025 Collection
            </span>
          </div>

          {/* Center - Main Headline */}
          <div className="flex-1 flex items-center">
            <div className={`transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h1 className="font-display text-[clamp(3rem,12vw,10rem)] text-ivory-cream leading-[0.9] tracking-[-0.03em]">
                <span className="block">The Art</span>
                <span className="block text-ivory-cream/60">of Elegance</span>
              </h1>
            </div>
          </div>

          {/* Bottom - CTA & Scroll */}
          <div className={`flex items-end justify-between transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Link
              href="/collection/all"
              className="group flex items-center gap-4"
            >
              <span className="text-sm tracking-[0.2em] uppercase text-ivory-cream">
                Discover Collection
              </span>
              <span className="w-12 h-12 rounded-full border border-ivory-cream/30 flex items-center justify-center group-hover:bg-ivory-cream group-hover:border-ivory-cream transition-all duration-500">
                <ArrowRight size={18} className="text-ivory-cream group-hover:text-noir transition-colors duration-500" />
              </span>
            </Link>

            {/* Scroll Indicator */}
            <div className="hidden md:flex flex-col items-center gap-3">
              <span className="text-[10px] tracking-[0.3em] uppercase text-ivory-cream/50 rotate-90 origin-center translate-x-3">
                Scroll
              </span>
              <div className="w-px h-16 bg-gradient-to-b from-ivory-cream/50 to-transparent animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          BRAND CAMPAIGN - Editorial Grid
          ============================================ */}
      <section className="bg-ivory-cream">
        {/* Section Intro */}
        <div className="px-8 md:px-16 lg:px-24 pt-32 pb-16">
          <div className="max-w-[1600px] mx-auto">
            <div className={`grid lg:grid-cols-2 gap-8 lg:gap-32 items-end`}>
              <div>
                <span className="text-[11px] tracking-[0.4em] uppercase text-taupe block mb-6">
                  The Houses
                </span>
                <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] text-charcoal-deep leading-[0.95] tracking-[-0.02em]">
                  Maisons of<br />Distinction
                </h2>
              </div>
              <div className="lg:text-right">
                <p className="text-stone text-lg leading-relaxed max-w-md lg:ml-auto">
                  Enter the world of legendary craftsmanship. Each house tells a story of heritage, innovation, and timeless style.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Editorial Brand Grid - Magazine Style */}
        <div className="px-4 md:px-8 pb-8">
          <div className="grid grid-cols-12 gap-3 md:gap-4">
            {/* Large Featured Brand */}
            {brands[0] && (
              <Link
                href={`/brand/${brands[0].slug}`}
                className="col-span-12 lg:col-span-8 group relative aspect-[16/9] lg:aspect-[16/10] overflow-hidden"
              >
                <Image
                  src={brands[0].heroImage}
                  alt={brands[0].name}
                  fill
                  className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-noir/20 group-hover:bg-noir/10 transition-colors duration-700" />

                {/* Brand Name - Dramatic Typography */}
                <div className="absolute inset-0 flex items-end p-8 md:p-12">
                  <div>
                    <span className="text-[10px] tracking-[0.4em] uppercase text-ivory-cream/70 block mb-2">
                      Featured Maison
                    </span>
                    <h3 className="font-display text-4xl md:text-6xl lg:text-7xl text-ivory-cream tracking-[-0.02em]">
                      {brands[0].name}
                    </h3>
                    <div className="mt-6 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <span className="text-xs tracking-[0.2em] uppercase text-ivory-cream">Enter World</span>
                      <ArrowRight size={14} className="text-ivory-cream" />
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Vertical Stack */}
            <div className="col-span-12 lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
              {brands.slice(1, 3).map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brand/${brand.slug}`}
                  className="group relative aspect-[4/3] lg:aspect-[16/9] overflow-hidden"
                >
                  <Image
                    src={brand.heroImage}
                    alt={brand.name}
                    fill
                    className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-noir/30 group-hover:bg-noir/10 transition-colors duration-500" />
                  <div className="absolute inset-0 flex items-end p-6">
                    <h3 className="font-display text-2xl md:text-3xl text-ivory-cream tracking-[-0.01em]">
                      {brand.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>

            {/* Bottom Row - Three Brands */}
            {brands.slice(3, 6).map((brand, index) => (
              <Link
                key={brand.id}
                href={`/brand/${brand.slug}`}
                className="col-span-4 group relative aspect-square overflow-hidden"
              >
                <Image
                  src={brand.heroImage}
                  alt={brand.name}
                  fill
                  className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-noir/30 group-hover:bg-noir/10 transition-colors duration-500" />
                <div className="absolute inset-0 flex items-end p-4 md:p-6">
                  <h3 className="font-display text-lg md:text-2xl text-ivory-cream">{brand.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* View All Link */}
        <div className="px-8 md:px-16 lg:px-24 py-12 border-t border-sand/30">
          <div className="max-w-[1600px] mx-auto flex justify-end">
            <Link
              href="/discover"
              className="group flex items-center gap-4 text-charcoal-deep hover:text-charcoal-warm transition-colors"
            >
              <span className="text-sm tracking-[0.15em] uppercase">All Maisons</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          PRODUCTS - Luxury Grid
          ============================================ */}
      <section className="bg-parchment py-32 lg:py-48">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16 lg:px-24">
          {/* Section Header - Centered & Dramatic */}
          <div className="text-center mb-20 lg:mb-32">
            <span className="text-[11px] tracking-[0.5em] uppercase text-taupe block mb-6">
              The Selection
            </span>
            <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] text-charcoal-deep leading-[1] tracking-[-0.02em]">
              Curated Pieces
            </h2>
          </div>

          {/* Product Grid - Clean, Editorial */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-12 md:gap-y-20">
            {featuredProducts.slice(0, 8).map((product, index) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group"
                onMouseEnter={() => setActiveProduct(index)}
                onMouseLeave={() => setActiveProduct(null)}
              >
                {/* Product Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-ivory-cream mb-6">
                  <Image
                    src={product.images[0]?.url || ''}
                    alt={product.name}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-105"
                  />

                  {/* Hover Actions */}
                  <div className={`absolute inset-0 flex items-center justify-center bg-noir/0 group-hover:bg-noir/20 transition-all duration-500`}>
                    <div className={`w-14 h-14 rounded-full bg-ivory-cream flex items-center justify-center transform transition-all duration-500 ${activeProduct === index ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                      <Plus size={20} className="text-charcoal-deep" />
                    </div>
                  </div>

                  {/* Limited Badge */}
                  {product.availability.status === 'limited' && (
                    <div className="absolute top-4 left-4">
                      <span className="text-[9px] tracking-[0.2em] uppercase text-charcoal-deep bg-ivory-cream px-3 py-1.5">
                        Limited Edition
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info - Minimal */}
                <div className="space-y-2">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-taupe">
                    {product.brandName}
                  </p>
                  <h3 className="font-display text-lg md:text-xl text-charcoal-deep leading-tight group-hover:text-charcoal-warm transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-stone">
                    {product.currency === 'EUR' ? '€' : '$'}{product.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* View All - Centered */}
          <div className="mt-20 lg:mt-32 text-center">
            <Link
              href="/collection/all"
              className="group inline-flex items-center gap-6"
            >
              <span className="text-sm tracking-[0.2em] uppercase text-charcoal-deep group-hover:text-charcoal-warm transition-colors">
                View All Pieces
              </span>
              <span className="w-14 h-14 rounded-full border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep transition-all duration-500">
                <ArrowRight size={18} className="text-charcoal-deep group-hover:text-ivory-cream transition-colors duration-500" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          EDITORIAL STORY - Full Bleed
          ============================================ */}
      {featuredStories[0] && (
        <section className="relative h-screen">
          <Image
            src={featuredStories[0].heroImage}
            alt={featuredStories[0].title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-noir/70 via-noir/30 to-transparent" />

          <div className="relative h-full flex items-center px-8 md:px-16 lg:px-24">
            <div className="max-w-2xl">
              <span className="text-[10px] tracking-[0.4em] uppercase text-gold-soft block mb-6">
                {featuredStories[0].type}
              </span>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-ivory-cream leading-[1.05] tracking-[-0.02em] mb-6">
                {featuredStories[0].title}
              </h2>
              <p className="text-lg text-ivory-cream/70 leading-relaxed mb-10 max-w-lg">
                {featuredStories[0].excerpt}
              </p>
              <Link
                href={`/story/${featuredStories[0].slug}`}
                className="group inline-flex items-center gap-4"
              >
                <span className="text-sm tracking-[0.2em] uppercase text-ivory-cream">
                  Read Story
                </span>
                <span className="w-12 h-12 rounded-full border border-ivory-cream/30 flex items-center justify-center group-hover:bg-ivory-cream group-hover:border-ivory-cream transition-all duration-500">
                  <ArrowRight size={16} className="text-ivory-cream group-hover:text-noir transition-colors duration-500" />
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          MORE STORIES - Magazine Layout
          ============================================ */}
      <section className="bg-ivory-cream py-32">
        <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24">
          {/* Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {featuredStories.slice(1, 4).map((story, index) => (
              <Link
                key={story.id}
                href={`/story/${story.slug}`}
                className="group"
              >
                <div className="relative aspect-[4/5] overflow-hidden mb-6">
                  <Image
                    src={story.heroImage}
                    alt={story.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-noir/10 group-hover:bg-noir/0 transition-colors duration-500" />
                </div>
                <span className="text-[10px] tracking-[0.3em] uppercase text-taupe block mb-3">
                  {story.type}
                </span>
                <h3 className="font-display text-xl md:text-2xl text-charcoal-deep leading-tight group-hover:text-charcoal-warm transition-colors">
                  {story.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FASHION IDENTITY - Cinematic CTA
          ============================================ */}
      <section className="relative py-48 lg:py-64 overflow-hidden bg-charcoal-deep">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(201,169,98,0.15),transparent)]" />
        </div>

        {/* Content */}
        <div className="relative max-w-4xl mx-auto px-8 md:px-16 text-center">
          <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70 block mb-8">
            Your Journey Begins
          </span>
          <h2 className="font-display text-[clamp(2.5rem,7vw,5.5rem)] text-ivory-cream leading-[0.95] tracking-[-0.02em] mb-8">
            Define Your<br />Fashion Identity
          </h2>
          <p className="text-lg text-taupe max-w-xl mx-auto mb-14 leading-relaxed">
            Allow our intelligence to understand your aesthetic. Receive a curated experience tailored to your unique sense of style.
          </p>

          <Link
            href="/onboarding"
            className="group inline-flex items-center gap-6"
          >
            <span className="text-sm tracking-[0.25em] uppercase text-ivory-cream">
              Begin
            </span>
            <span className="w-16 h-16 rounded-full border border-gold-soft/30 flex items-center justify-center group-hover:bg-gold-soft group-hover:border-gold-soft transition-all duration-700">
              <ArrowRight size={20} className="text-gold-soft group-hover:text-noir transition-colors duration-500" />
            </span>
          </Link>
        </div>
      </section>

      {/* ============================================
          FOOTER BRAND STRIP
          ============================================ */}
      <section className="bg-noir py-20 overflow-hidden">
        <div className="flex items-center justify-center gap-16 md:gap-24 opacity-40">
          {brands.slice(0, 5).map((brand) => (
            <span key={brand.id} className="font-display text-2xl md:text-3xl text-ivory-cream whitespace-nowrap">
              {brand.name}
            </span>
          ))}
        </div>
      </section>

      {/* ============================================
          TRUST - Minimal & Elegant
          ============================================ */}
      <section className="bg-ivory-cream py-24 border-t border-sand/30">
        <div className="max-w-[1200px] mx-auto px-8 md:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 text-center">
            {[
              { label: 'Authenticity', desc: 'Verified pieces' },
              { label: 'Privacy', desc: 'Your data protected' },
              { label: 'Ethical', desc: 'No dark patterns' },
              { label: 'Experience', desc: 'Not transaction' }
            ].map((item, index) => (
              <div key={index}>
                <h4 className="font-display text-lg text-charcoal-deep mb-2">{item.label}</h4>
                <p className="text-xs tracking-[0.15em] uppercase text-taupe">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

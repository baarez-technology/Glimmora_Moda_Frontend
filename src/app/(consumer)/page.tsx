'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getRecommendedBrands, getRecommendedProducts, searchStories } from '@/services/recommendation.service';
import type { Product, Brand, BrandStory } from '@/types';

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredStories, setFeaturedStories] = useState<BrandStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [recommendedBrands, recommendedProducts, stories] = await Promise.all([
          getRecommendedBrands(),
          getRecommendedProducts(),
          searchStories({ limit: 4 }),
        ]);
        setBrands(recommendedBrands);
        setFeaturedProducts(recommendedProducts);
        setFeaturedStories(stories);
      } catch (err) {
        console.error('Failed to load home page data:', err);
        setError(err instanceof Error ? err.message : 'Unable to load recommendations. Please try again later.');
      } finally {
        setLoading(false);
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-noir flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ivory-cream border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-ivory-cream/50 tracking-wider">Loading</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-noir flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <p className="font-display text-2xl text-ivory-cream mb-4">Something went wrong</p>
          <p className="text-sm text-ivory-cream/50 leading-relaxed mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-3 px-8 py-4 border border-ivory-cream/20 text-ivory-cream hover:bg-ivory-cream hover:text-charcoal-deep transition-all duration-300 text-sm tracking-[0.15em] uppercase"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-noir overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════════
          HERO - Full Screen Cinematic
          Inspired by: Celine, The Row, Bottega Veneta
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative h-[100svh] w-full overflow-hidden">
        {/* Background Image - Full Bleed */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=90"
            alt="Luxury Fashion"
            fill
            sizes="100vw"
            className={`object-cover transition-all duration-[2.5s] ease-out ${
              isLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
            }`}
            priority
          />
          {/* Sophisticated Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />
        </div>

        {/* Hero Content - Bottom Aligned, Massive Typography */}
        <div className="relative h-full flex flex-col justify-end pb-16 md:pb-24 lg:pb-32">
          {/* Season Badge - Top Left */}
          <div
            className={`absolute top-32 left-8 md:left-16 lg:left-24 transition-all duration-1000 delay-500 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <span className="inline-block px-4 py-2 border border-white/20 text-[10px] tracking-[0.4em] uppercase text-white/70 backdrop-blur-sm">
              SS 2025
            </span>
          </div>

          {/* Main Typography Block */}
          <div className="px-8 md:px-16 lg:px-24">
            {/* Massive Headline */}
            <h1
              className={`transition-all duration-1000 delay-300 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
            >
              <span className="block font-display text-[15vw] md:text-[12vw] lg:text-[10vw] leading-[0.85] tracking-[-0.04em] text-white">
                The
              </span>
              <span className="block font-display text-[15vw] md:text-[12vw] lg:text-[10vw] leading-[0.85] tracking-[-0.04em] text-white/40 -mt-2 md:-mt-4">
                Essence
              </span>
            </h1>

            {/* Subtext + CTA Row */}
            <div
              className={`flex flex-col md:flex-row md:items-end md:justify-between mt-12 md:mt-16 gap-8 transition-all duration-1000 delay-700 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <p className="font-body text-sm md:text-base text-white/50 max-w-md leading-relaxed tracking-wide">
                Where timeless elegance meets contemporary vision.
                Experience luxury redefined.
              </p>

              <Link
                href="/discover"
                className="group flex items-center gap-6 self-start md:self-auto"
              >
                <span className="font-body text-xs tracking-[0.3em] uppercase text-white/70 group-hover:text-white transition-colors duration-500">
                  Explore Collection
                </span>
                <span className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-ivory-cream group-hover:scale-110 transition-all duration-500">
                  <ArrowRight size={20} className="text-white group-hover:text-charcoal-deep transition-colors duration-500" strokeWidth={1} />
                </span>
              </Link>
            </div>
          </div>

          {/* Scroll Line */}
          <div
            className={`absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-4 transition-all duration-1000 delay-1000 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="text-[9px] tracking-[0.3em] uppercase text-white/30">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MAISONS - Bento Grid Layout
          Inspired by: Burberry, Loewe, Bottega Veneta
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-parchment py-24 lg:py-32">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-12 lg:mb-16">
            <div>
              <span className="font-body text-[11px] tracking-[0.3em] uppercase text-charcoal-warm block mb-3">
                The Houses
              </span>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal-deep tracking-[-0.02em]">
                Maisons
              </h2>
            </div>
            <Link href="/discover" className="group hidden md:flex items-center gap-2 text-stone hover:text-charcoal-deep transition-colors">
              <span className="font-body text-sm">View All</span>
              <ArrowRight size={16} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {/* Large Feature - Spans 2x2 */}
            {brands[0] && (
              <Link
                href={`/brand/${brands[0].slug}?brandId=${brands[0].id}`}
                className="col-span-2 row-span-2 group relative aspect-square overflow-hidden bg-sand-light"
              >
                <Image
                  src={brands[0].heroImage}
                  alt={brands[0].name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-noir/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <p className="font-body text-[10px] tracking-[0.3em] uppercase text-white/60 mb-2">Featured</p>
                  <h3 className="font-display text-2xl md:text-4xl text-white mb-3">{brands[0].name}</h3>
                  <div className="flex items-center gap-2 text-white/70 group-hover:text-white transition-colors">
                    <span className="font-body text-xs tracking-wide">Explore</span>
                    <ArrowUpRight size={14} strokeWidth={1.5} />
                  </div>
                </div>
              </Link>
            )}

            {/* Remaining Brands - 1x1 each */}
            {brands.slice(1, 5).map((brand) => (
              <Link
                key={brand.id}
                href={`/brand/${brand.slug}?brandId=${brand.id}`}
                className="group relative aspect-square overflow-hidden bg-sand-light"
              >
                <Image
                  src={brand.heroImage}
                  alt={brand.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <h3 className="font-display text-lg md:text-xl text-white">{brand.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURED PRODUCTS - Editorial Two-Column
          Inspired by: The Row, Lemaire, Totême
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-ivory-cream py-24 lg:py-32">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16">
          {/* Section Header */}
          <div className="text-center mb-16 lg:mb-20">
            <span className="font-body text-[11px] tracking-[0.3em] uppercase text-charcoal-warm block mb-3">
              Curated Selection
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal-deep tracking-[-0.02em]">
              The Edit
            </h2>
          </div>

          {/* Two-Column Featured + Grid */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left - Large Featured Product */}
            {featuredProducts[0] && (
              <Link
                href={`/product/${featuredProducts[0].slug}?productId=${featuredProducts[0].id}`}
                className="group"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-sand-light mb-5">
                  <Image
                    src={featuredProducts[0].images[0]?.url || ''}
                    alt={featuredProducts[0].name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-body text-[10px] tracking-[0.25em] uppercase text-charcoal-warm mb-1">
                      {featuredProducts[0].brandName}
                    </p>
                    <h3 className="font-display text-lg md:text-xl text-charcoal-deep group-hover:text-stone transition-colors">
                      {featuredProducts[0].name}
                    </h3>
                  </div>
                  <p className="font-body text-sm text-stone">
                    {featuredProducts[0].currency === 'INR' ? '₹' : '€'}{featuredProducts[0].price.toLocaleString()}
                  </p>
                </div>
              </Link>
            )}

            {/* Right - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {featuredProducts.slice(1, 5).map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}?productId=${product.id}`}
                  className="group"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-sand-light mb-3">
                    <Image
                      src={product.images[0]?.url || ''}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    />
                  </div>
                  <p className="font-body text-[9px] tracking-[0.2em] uppercase text-charcoal-warm mb-1">
                    {product.brandName}
                  </p>
                  <h3 className="font-display text-sm text-charcoal-deep group-hover:text-stone transition-colors leading-tight">
                    {product.name}
                  </h3>
                  <p className="font-body text-xs text-charcoal-warm mt-1">
                    {product.currency === 'INR' ? '₹' : '€'}{product.price.toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* View All Link */}
          <div className="text-center mt-12 lg:mt-16">
            <Link
              href="/discover"
              className="inline-flex items-center gap-3 px-8 py-4 border border-charcoal-deep text-charcoal-deep hover:bg-charcoal-deep hover:text-ivory-cream transition-all duration-300"
            >
              <span className="font-body text-sm tracking-[0.15em] uppercase">View All Products</span>
              <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          EDITORIAL STORY - Split Screen
          Inspired by: Celine, Phoebe Philo, Hermès
      ═══════════════════════════════════════════════════════════════ */}
      {featuredStories[0] && (
        <section className="bg-parchment">
          <div className="grid lg:grid-cols-2 min-h-[80vh]">
            {/* Left - Image */}
            <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden">
              <Image
                src={featuredStories[0].heroImage}
                alt={featuredStories[0].title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Right - Content */}
            <div className="flex items-center px-8 md:px-12 lg:px-16 py-16 lg:py-24">
              <div className="max-w-lg">
                <span className="font-body text-[10px] tracking-[0.3em] uppercase text-charcoal-warm block mb-6">
                  {featuredStories[0].type}
                </span>
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal-deep leading-[1.1] tracking-[-0.02em] mb-6">
                  {featuredStories[0].title}
                </h2>
                <p className="font-body text-stone leading-relaxed mb-8">
                  {featuredStories[0].excerpt}
                </p>
                <Link
                  href={`/story/${featuredStories[0].slug}?storyId=${featuredStories[0].id}`}
                  className="inline-flex items-center gap-3 text-charcoal-deep group"
                >
                  <span className="font-body text-sm tracking-[0.1em] uppercase border-b border-charcoal-deep pb-1 group-hover:border-stone transition-colors">
                    Read Heritage
                  </span>
                  <ArrowRight size={16} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MORE STORIES - Three Column Grid
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-ivory-cream py-24 lg:py-32">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="flex items-end justify-between mb-12">
            <h2 className="font-display text-2xl md:text-3xl text-charcoal-deep">Stories</h2>
            <Link href="/stories" className="font-body text-sm text-stone hover:text-charcoal-deep transition-colors flex items-center gap-2">
              All Stories <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {featuredStories.slice(0, 3).map((story) => (
              <Link
                key={story.id}
                href={`/story/${story.slug}?storyId=${story.id}`}
                className="group"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-sand-light mb-4">
                  <Image
                    src={story.heroImage}
                    alt={story.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-charcoal-warm mb-2">
                  {story.type}
                </p>
                <h3 className="font-display text-lg text-charcoal-deep group-hover:text-stone transition-colors leading-snug">
                  {story.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STYLE IDENTITY CTA - Centered Block
          Inspired by: Acne Studios, COS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-charcoal-deep py-24 lg:py-32">
        <div className="max-w-[800px] mx-auto px-6 md:px-12 text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-ivory-cream leading-[1.15] tracking-[-0.02em] mb-6">
            Discover your personal style identity
          </h2>
          <p className="font-body text-greige leading-relaxed mb-10 max-w-md mx-auto">
            Take our style assessment and receive personalized recommendations curated just for you.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-3 px-8 py-4 bg-ivory-cream text-charcoal-deep hover:bg-parchment transition-colors duration-300"
          >
            <span className="font-body text-sm tracking-[0.15em] uppercase">Begin Assessment</span>
            <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TRUST BAR - Minimal
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-parchment py-12 border-t border-sand">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {[
              { label: 'Authenticity Guaranteed', icon: '✓' },
              { label: 'Free Returns', icon: '↩' },
              { label: 'Secure Checkout', icon: '🔒' },
              { label: 'Personal Styling', icon: '★' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-stone">
                <span className="text-sm">{item.icon}</span>
                <span className="font-body text-xs tracking-wide">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Play, Search, ArrowUpRight } from 'lucide-react';
import { brands, getFeaturedProducts, getFeaturedStories } from '@/data/mock-data';

export default function HomePage() {
  const router = useRouter();
  const [conversationInput, setConversationInput] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const featuredProducts = getFeaturedProducts();
  const featuredStories = getFeaturedStories();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (conversationInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(conversationInput.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  return (
    <div className="min-h-screen bg-ivory-cream overflow-x-hidden">
      {/* ============================================
          HERO SECTION - Editorial Split Layout
          ============================================ */}
      <section className="relative min-h-screen bg-ivory-cream">
        <div className="min-h-screen grid lg:grid-cols-2">
          {/* Left Column - Typography & Content */}
          <div className="relative flex flex-col h-screen lg:h-auto">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col justify-center px-8 md:px-12 lg:px-16 xl:px-24 py-24 pb-32">
              {/* Main Headline with Inline Images */}
              <div className={`transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h1 className="font-display text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-[4.5rem] text-charcoal-deep leading-[1.05] tracking-[-0.02em]">
                  {/* Line 1 */}
                  <span className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <span>CURATED</span>
                    <span className="relative w-10 h-10 md:w-14 md:h-14 lg:w-12 lg:h-12 xl:w-16 xl:h-16 rounded-full overflow-hidden inline-block flex-shrink-0">
                      <Image
                        src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&q=80"
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </span>
                    <span>STYLE</span>
                  </span>

                  {/* Line 2 */}
                  <span className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <span>FOR</span>
                    <span className="relative w-10 h-10 md:w-14 md:h-14 lg:w-12 lg:h-12 xl:w-16 xl:h-16 rounded-full overflow-hidden inline-block flex-shrink-0">
                      <Image
                        src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=200&q=80"
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </span>
                    <span>MODERN</span>
                  </span>

                  {/* Line 3 */}
                  <span className="block">ELEGANCE</span>
                </h1>
              </div>

              {/* Description */}
              <p className={`text-base md:text-lg text-stone max-w-md leading-relaxed mt-8 lg:mt-10 transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                Discover exceptional pieces from the world&apos;s finest maisons. Fashion intelligence that understands your unique aesthetic.
              </p>

              {/* Search Form */}
              <div className={`mt-8 lg:mt-10 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <form onSubmit={handleSearchSubmit} className="max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      value={conversationInput}
                      onChange={(e) => setConversationInput(e.target.value)}
                      placeholder="What are you looking for?"
                      className="w-full px-5 py-4 pr-14 bg-parchment border border-sand rounded-none text-charcoal-deep text-base placeholder:text-greige focus:outline-none focus:border-charcoal-warm transition-colors font-body"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-charcoal-deep hover:text-gold-deep transition-colors"
                    >
                      <Search size={20} />
                    </button>
                  </div>

                  {/* Suggestions */}
                  <div className="flex flex-wrap gap-3 mt-3">
                    <span className="text-xs text-greige">Try:</span>
                    {['Evening bag', 'Wool coat', 'Gallery opening'].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs text-stone hover:text-charcoal-deep transition-colors underline underline-offset-2"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </form>
              </div>
            </div>

            {/* Bottom CTA Bar - Fixed at bottom */}
            <div className={`border-t border-sand bg-ivory-cream transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center justify-between px-8 md:px-12 lg:px-16 xl:px-24">
                <Link
                  href="/discover"
                  className="py-5 text-sm tracking-wide text-charcoal-deep hover:text-gold-deep transition-colors"
                >
                  Explore More
                </Link>
                <div className="h-px flex-1 bg-sand mx-8" />
                <Link
                  href="/discover"
                  className="py-5 group"
                >
                  <ArrowRight size={20} className="text-charcoal-deep group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative hidden lg:block">
            <Image
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85"
              alt="Luxury Fashion Editorial"
              fill
              className={`object-cover transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
              priority
            />
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-charcoal-deep/5" />
          </div>
        </div>

        {/* Mobile Hero Image - Shows below content on small screens */}
        <div className="relative h-[50vh] lg:hidden -mt-20">
          <Image
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85"
            alt="Luxury Fashion Editorial"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-charcoal-deep/5" />
        </div>
      </section>

      {/* ============================================
          QUICK ACCESS - Editorial Grid
          ============================================ */}
      <section className="py-24 lg:py-40 relative">
        {/* Subtle Background Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-champagne/20 via-transparent to-transparent" />

        <div className="max-w-[1600px] mx-auto px-6 lg:px-16 relative">
          {/* Section Header - Asymmetric */}
          <div className="grid lg:grid-cols-12 gap-8 mb-20">
            <div className="lg:col-span-4">
              <span className="text-[11px] tracking-[0.4em] uppercase text-gold-muted block mb-4">
                Quick Access
              </span>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-charcoal-deep leading-[1.1]">
                Begin Your<br />Discovery
              </h2>
            </div>
            <div className="lg:col-span-4 lg:col-start-9 flex items-end">
              <p className="text-stone text-base leading-relaxed">
                Choose your starting point. Every path leads to exceptional fashion.
              </p>
            </div>
          </div>

          {/* Navigation Cards - Asymmetric Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-sand/30">
            {[
              {
                title: 'By Occasion',
                desc: 'Evening, Work, Travel',
                href: '/discover',
                number: '01'
              },
              {
                title: 'By Aesthetic',
                desc: 'Bold, Classic, Minimal',
                href: '/discover',
                number: '02'
              },
              {
                title: 'Brand Universes',
                desc: 'Enter a Maison\'s world',
                href: '/discover',
                number: '03'
              },
              {
                title: 'New Arrivals',
                desc: 'Latest collections',
                href: '/collection/all',
                number: '04'
              }
            ].map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="group bg-ivory-cream p-8 lg:p-10 flex flex-col justify-between min-h-[280px] hover:bg-parchment transition-colors duration-500"
              >
                <div>
                  <span className="text-[11px] tracking-[0.3em] text-gold-muted font-body">
                    {item.number}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-2xl lg:text-3xl text-charcoal-deep mb-3 group-hover:text-noir transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-stone mb-6">{item.desc}</p>
                  <div className="flex items-center gap-2 text-charcoal-warm group-hover:text-noir transition-colors">
                    <span className="text-xs tracking-[0.15em] uppercase">Explore</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          BRAND UNIVERSES - Cinematic Showcase
          ============================================ */}
      <section className="py-24 lg:py-40 bg-charcoal-deep relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-noir/50 to-transparent" />

        <div className="max-w-[1600px] mx-auto px-6 lg:px-16 relative">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
            <div>
              <span className="text-[11px] tracking-[0.4em] uppercase text-gold-soft block mb-4">
                Brand Universes
              </span>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-ivory-cream leading-[1.1]">
                Enter Their<br />World
              </h2>
            </div>
            <Link
              href="/discover"
              className="group flex items-center gap-3 text-taupe hover:text-ivory-cream transition-colors"
            >
              <span className="text-xs tracking-[0.2em] uppercase">View All Brands</span>
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* Brand Grid - Editorial Layout */}
          <div className="grid grid-cols-12 gap-4">
            {/* Featured Brand - Large */}
            {brands[0] && (
              <Link
                href={`/brand/${brands[0].slug}`}
                className="col-span-12 lg:col-span-7 group relative aspect-[4/3] lg:aspect-[16/10] overflow-hidden"
              >
                <Image
                  src={brands[0].heroImage}
                  alt={brands[0].name}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-noir/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
                  <span className="text-[11px] tracking-[0.3em] uppercase text-gold-soft mb-3 block">Featured Maison</span>
                  <h3 className="font-display text-3xl lg:text-5xl text-ivory-cream mb-2">{brands[0].name}</h3>
                  <p className="text-sm text-taupe max-w-md">{brands[0].tagline}</p>
                  <div className="flex items-center gap-2 mt-6 text-gold-soft opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="text-xs tracking-[0.15em] uppercase">Enter Universe</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            )}

            {/* Secondary Brands - Stacked */}
            <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-4">
              {brands.slice(1, 5).map((brand, index) => (
                <Link
                  key={brand.id}
                  href={`/brand/${brand.slug}`}
                  className={`group relative overflow-hidden ${index < 2 ? 'aspect-square' : 'aspect-[4/3]'}`}
                >
                  <Image
                    src={brand.heroImage}
                    alt={brand.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-noir/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
                    <h3 className="font-display text-xl lg:text-2xl text-ivory-cream">{brand.name}</h3>
                    <div className="flex items-center gap-1 mt-2 text-gold-soft opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] tracking-wider uppercase">Explore</span>
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURED PRODUCTS - Clean Grid
          ============================================ */}
      <section className="py-24 lg:py-40 bg-ivory-cream">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-16">
          {/* Section Header - Left Aligned */}
          <div className="max-w-2xl mb-16 lg:mb-24">
            <span className="text-[11px] tracking-[0.4em] uppercase text-gold-muted block mb-4">
              AGI Curated
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-charcoal-deep leading-[1.1] mb-6">
              Exceptional Pieces
            </h2>
            <p className="text-stone text-base leading-relaxed">
              Selected by intelligence, appreciated by connoisseurs. Each piece represents the pinnacle of craftsmanship.
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
            {featuredProducts.slice(0, 6).map((product, index) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-parchment mb-5">
                  <Image
                    src={product.images[0]?.url || ''}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {product.availability.status === 'limited' && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 bg-charcoal-deep text-ivory-cream text-[10px] tracking-[0.15em] uppercase">
                        Limited
                      </span>
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-charcoal-deep/0 group-hover:bg-charcoal-deep/10 transition-colors duration-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] tracking-[0.2em] uppercase text-greige">
                    {product.brandName}
                  </p>
                  <h3 className="font-display text-xl text-charcoal-deep group-hover:text-gold-deep transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-stone pt-1">
                    {product.currency === 'EUR' ? '€' : '$'}{product.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* View All Link */}
          <div className="mt-16 text-center">
            <Link
              href="/collection/all"
              className="inline-flex items-center gap-3 text-charcoal-deep hover:text-gold-deep transition-colors group"
            >
              <span className="text-sm tracking-[0.15em] uppercase">View All Products</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          CURATED STORIES - Editorial Layout
          ============================================ */}
      <section className="py-24 lg:py-40 bg-parchment">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-16">
          {/* Section Header */}
          <div className="grid lg:grid-cols-12 gap-8 mb-16 lg:mb-24">
            <div className="lg:col-span-6">
              <span className="text-[11px] tracking-[0.4em] uppercase text-gold-muted block mb-4">
                Beyond Products
              </span>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-charcoal-deep leading-[1.1]">
                Curated Stories
              </h2>
            </div>
            <div className="lg:col-span-4 lg:col-start-9 flex items-end justify-end">
              <Link
                href="/discover"
                className="group flex items-center gap-3 text-charcoal-warm hover:text-charcoal-deep transition-colors"
              >
                <span className="text-xs tracking-[0.2em] uppercase">All Stories</span>
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Stories Grid - Magazine Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Featured Story */}
            {featuredStories[0] && (
              <Link
                href={`/story/${featuredStories[0].slug}`}
                className="lg:col-span-7 group"
              >
                <div className="relative aspect-[16/10] overflow-hidden mb-6">
                  <Image
                    src={featuredStories[0].heroImage}
                    alt={featuredStories[0].title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-6 left-6">
                    <span className="tag-intelligence">{featuredStories[0].type}</span>
                  </div>
                  <div className="absolute bottom-6 right-6 w-14 h-14 bg-ivory-cream rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={22} className="text-charcoal-deep ml-1" />
                  </div>
                </div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-greige mb-2">
                  {brands.find(b => b.id === featuredStories[0].brandId)?.name}
                </p>
                <h3 className="font-display text-2xl lg:text-3xl text-charcoal-deep group-hover:text-gold-deep transition-colors mb-3">
                  {featuredStories[0].title}
                </h3>
                <p className="text-stone text-base leading-relaxed line-clamp-2">{featuredStories[0].excerpt}</p>
                <p className="text-xs text-greige mt-4">{featuredStories[0].readTime} min read</p>
              </Link>
            )}

            {/* Secondary Stories */}
            <div className="lg:col-span-5 space-y-8">
              {featuredStories.slice(1, 3).map((story) => (
                <Link
                  key={story.id}
                  href={`/story/${story.slug}`}
                  className="group flex gap-6"
                >
                  <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden">
                    <Image
                      src={story.heroImage}
                      alt={story.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex-1 py-1">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-greige mb-2">
                      {brands.find(b => b.id === story.brandId)?.name}
                    </p>
                    <h3 className="font-display text-lg text-charcoal-deep group-hover:text-gold-deep transition-colors mb-2 line-clamp-2">
                      {story.title}
                    </h3>
                    <p className="text-xs text-greige">{story.readTime} min read</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FASHION IDENTITY CTA - Dramatic Section
          ============================================ */}
      <section className="relative py-32 lg:py-48 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-noir-editorial" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-charcoal-warm/30 via-transparent to-transparent" />

        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-gold-soft/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-gold-soft/10 rounded-full" />

        <div className="max-w-[1000px] mx-auto px-6 lg:px-16 relative text-center">
          <Sparkles className="w-10 h-10 mx-auto mb-8 text-gold-soft" />
          <h2 className="font-display text-4xl md:text-5xl lg:text-7xl text-ivory-cream leading-[1.1] mb-8">
            Create Your<br />Fashion Identity
          </h2>
          <p className="text-lg text-taupe max-w-xl mx-auto mb-12 leading-relaxed">
            Let our Fashion Intelligence understand your style. Receive recommendations that truly resonate with who you are.
          </p>
          <Link href="/onboarding" className="btn-gold inline-flex">
            Begin Your Journey
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ============================================
          TRUST INDICATORS - Minimal Footer Section
          ============================================ */}
      <section className="py-20 lg:py-28 bg-ivory-cream border-t border-sand/50">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-16">
          {/* Section Label */}
          <div className="text-center mb-16">
            <span className="text-[11px] tracking-[0.4em] uppercase text-gold-muted">
              Our Promise
            </span>
          </div>

          {/* Trust Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
            {[
              { title: 'Authenticity Guaranteed', desc: 'Every piece verified with Digital Fashion Passport' },
              { title: 'No Dark Patterns', desc: 'No artificial urgency or manipulation — ever' },
              { title: 'Privacy First', desc: 'Your data belongs to you, always' },
              { title: 'Luxury Experience', desc: 'Commerce through experience, not transaction' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-px h-8 bg-gold-muted/40 mx-auto mb-6" />
                <h4 className="font-display text-lg text-charcoal-deep mb-3">{item.title}</h4>
                <p className="text-sm text-stone leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

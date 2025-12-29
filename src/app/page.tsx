'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Play } from 'lucide-react';
import { brands, getFeaturedProducts, getFeaturedStories } from '@/data/mock-data';

export default function HomePage() {
  const [conversationInput, setConversationInput] = useState('');
  const featuredProducts = getFeaturedProducts();
  const featuredStories = getFeaturedStories();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80"
            alt="Luxury Fashion"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-noir/40 via-noir/20 to-noir/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto animate-fade-in-up">
          <p className="text-xs tracking-[0.3em] uppercase text-champagne mb-6">
            The World's First AGI-Native Fashion Universe
          </p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-ivory-cream mb-6 leading-tight">
            Fashion Doesn't Guess Here
          </h1>
          <p className="text-lg md:text-xl text-sand max-w-2xl mx-auto mb-10">
            Experience luxury through intelligence, not transaction. Discover pieces that understand you.
          </p>

          {/* Conversational Entry */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={conversationInput}
                onChange={(e) => setConversationInput(e.target.value)}
                placeholder="What are you looking for today?"
                className="w-full px-6 py-4 bg-ivory-cream/95 backdrop-blur-sm rounded-full text-charcoal-deep text-center text-lg placeholder:text-greige focus:outline-none focus:ring-2 focus:ring-gold-muted"
              />
              <Sparkles className="absolute right-5 top-1/2 -translate-y-1/2 text-gold-muted" size={20} />
            </div>
            <p className="text-sm text-taupe mt-4">
              Try: "Evening bag for a gallery opening" or "Classic structured jacket"
            </p>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-ivory-cream/50 rounded-full flex items-start justify-center p-1">
              <div className="w-1.5 h-3 bg-ivory-cream/80 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Explore By Section */}
      <section className="py-20 lg:py-32 px-6 lg:px-12">
        <div className="max-w-[1800px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-gold-muted mb-4">Your Journey Begins</p>
            <h2 className="font-display text-3xl md:text-4xl text-charcoal-deep mb-4">
              How Would You Like to Explore?
            </h2>
            <p className="text-stone max-w-xl mx-auto">
              No filters, no endless scrolling. Tell us what you're looking for, and we'll guide you.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              { title: 'By Occasion', desc: 'Evening, Work, Travel, Celebration', href: '/discover?type=occasion', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80' },
              { title: 'By Mood', desc: 'Bold, Classic, Minimal, Expressive', href: '/discover?type=mood', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
              { title: 'By Brand Universe', desc: 'Enter a Maison\'s world', href: '/discover?type=brand', image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80' },
              { title: 'New Arrivals', desc: 'Latest from our collections', href: '/discover?type=new', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80' }
            ].map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="group relative aspect-[3/4] rounded-lg overflow-hidden"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-noir/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
                  <h3 className="font-display text-lg lg:text-xl text-ivory-cream mb-1">{item.title}</h3>
                  <p className="text-xs text-taupe">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Universes Section */}
      <section className="py-20 lg:py-32 bg-parchment">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-gold-muted mb-4">Enter Their World</p>
            <h2 className="font-display text-3xl md:text-4xl text-charcoal-deep mb-4">
              Brand Universes
            </h2>
            <p className="text-stone max-w-xl mx-auto">
              More than products — experience the heritage, craftsmanship, and artistry of each Maison.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {brands.map((brand, index) => (
              <Link
                key={brand.id}
                href={`/brand/${brand.slug}`}
                className={`group relative overflow-hidden rounded-lg ${
                  index === 0 ? 'md:col-span-2 md:row-span-2 aspect-square' : 'aspect-[4/3]'
                }`}
              >
                <Image
                  src={brand.heroImage}
                  alt={brand.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-noir/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-display text-2xl lg:text-3xl text-ivory-cream mb-1">{brand.name}</h3>
                  <p className="text-sm text-taupe">{brand.tagline}</p>
                  <div className="flex items-center gap-2 mt-4 text-gold-soft opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm">Enter Universe</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Curated Stories Section */}
      <section className="py-20 lg:py-32 px-6 lg:px-12">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-6">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-gold-muted mb-4">Beyond Products</p>
              <h2 className="font-display text-3xl md:text-4xl text-charcoal-deep">
                Curated Stories
              </h2>
            </div>
            <Link
              href="/discover?type=stories"
              className="text-sm tracking-[0.1em] uppercase text-charcoal-warm hover:text-noir flex items-center gap-2 transition-colors"
            >
              View All Stories
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {featuredStories.map((story) => (
              <Link
                key={story.id}
                href={`/story/${story.slug}`}
                className="group"
              >
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4">
                  <Image
                    src={story.heroImage}
                    alt={story.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="tag-intelligence">{story.type}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-noir/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-4 right-4 w-12 h-12 bg-ivory-cream/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={20} className="text-charcoal-deep ml-1" />
                  </div>
                </div>
                <p className="text-xs tracking-[0.15em] uppercase text-greige mb-2">
                  {brands.find(b => b.id === story.brandId)?.name}
                </p>
                <h3 className="font-display text-xl text-charcoal-deep group-hover:text-gold-deep transition-colors mb-2">
                  {story.title}
                </h3>
                <p className="text-sm text-stone line-clamp-2">{story.excerpt}</p>
                <p className="text-xs text-greige mt-3">{story.readTime} min read</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-parchment to-ivory-cream px-6 lg:px-12">
        <div className="max-w-[1800px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-gold-muted mb-4">AGI Curated</p>
            <h2 className="font-display text-3xl md:text-4xl text-charcoal-deep mb-4">
              Exceptional Pieces
            </h2>
            <p className="text-stone max-w-xl mx-auto">
              Selected by intelligence, appreciated by connoisseurs.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
            {featuredProducts.slice(0, 6).map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group"
              >
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-4 bg-parchment">
                  <Image
                    src={product.images[0]?.url || ''}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {product.availability.status === 'limited' && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-gold-muted text-noir text-xs tracking-wider uppercase rounded-full">
                        Limited
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs tracking-[0.15em] uppercase text-greige mb-1">
                  {product.brandName}
                </p>
                <h3 className="font-display text-lg text-charcoal-deep group-hover:text-gold-deep transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-stone mt-1">
                  {product.currency === 'EUR' ? '€' : '$'}{product.price.toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Fashion Identity CTA */}
      <section className="py-20 lg:py-32 bg-charcoal-deep text-ivory-cream">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-6 text-gold-soft" />
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6">
            Create Your Fashion Identity
          </h2>
          <p className="text-lg text-taupe max-w-2xl mx-auto mb-10">
            Let our Fashion Intelligence understand your style, preferences, and aspirations.
            Receive personalized recommendations that truly resonate with who you are.
          </p>
          <Link href="/onboarding" className="btn-gold inline-flex">
            Begin Your Journey
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 px-6 lg:px-12 bg-ivory-cream">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { title: 'Authenticity Guaranteed', desc: 'Every piece verified with Digital Fashion Passport' },
              { title: 'No Dark Patterns', desc: 'No artificial urgency or manipulation — ever' },
              { title: 'Privacy First', desc: 'Your data belongs to you, always' },
              { title: 'Luxury Experience', desc: 'Commerce through experience, not transaction' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <h4 className="font-display text-lg text-charcoal-deep mb-2">{item.title}</h4>
                <p className="text-sm text-stone">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
